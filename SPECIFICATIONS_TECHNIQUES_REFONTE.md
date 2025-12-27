# 🔧 SPÉCIFICATIONS TECHNIQUES - REFONTE FONCTIONNELLE
## IORecycling - Implémentation Technique

**Date** : 2024  
**Version** : 1.0

---

## 📐 MODIFICATIONS BASE DE DONNÉES

### Migration SQL : `V17__refonte_financiere_enlevements.sql`

```sql
-- ============================================
-- V17: Refonte Financière - Enlèvements comme Source Unique
-- ============================================

-- 1. MODIFICATIONS TABLE pickup_item
-- ============================================

-- Renommer prix_unitaire_mad en prix_traitement_mad pour plus de clarté
-- (on garde prix_unitaire_mad pour rétrocompatibilité, on ajoute prix_traitement_mad)
ALTER TABLE pickup_item ADD COLUMN prix_traitement_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN montant_traitement_mad DECIMAL(12, 2);

-- Pour les déchets VALORISABLES : ajout prix achat/vente
ALTER TABLE pickup_item ADD COLUMN prix_achat_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN prix_vente_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN montant_achat_mad DECIMAL(12, 2);
ALTER TABLE pickup_item ADD COLUMN montant_vente_mad DECIMAL(12, 2);
ALTER TABLE pickup_item ADD COLUMN marge_mad DECIMAL(12, 2);

-- Migration des données existantes
-- Pour les items RECYCLABLE : prix_unitaire_mad devient prix_vente_mad
-- On définit prix_achat_mad = prix_vente_mad * 0.6 (à ajuster selon métier)
UPDATE pickup_item 
SET prix_vente_mad = prix_unitaire_mad,
    prix_achat_mad = prix_unitaire_mad * 0.6,
    prix_traitement_mad = NULL
WHERE type_dechet = 'RECYCLABLE';

-- Pour les items BANAL/A_DETRUIRE : prix_unitaire_mad devient prix_traitement_mad
UPDATE pickup_item 
SET prix_traitement_mad = prix_unitaire_mad,
    prix_achat_mad = NULL,
    prix_vente_mad = NULL
WHERE type_dechet IN ('BANAL', 'A_DETRUIRE');

-- Calcul des montants
UPDATE pickup_item
SET montant_achat_mad = quantite_kg * prix_achat_mad,
    montant_vente_mad = quantite_kg * prix_vente_mad,
    marge_mad = (quantite_kg * prix_vente_mad) - (quantite_kg * prix_achat_mad)
WHERE type_dechet = 'RECYCLABLE' 
  AND prix_achat_mad IS NOT NULL 
  AND prix_vente_mad IS NOT NULL;

UPDATE pickup_item
SET montant_traitement_mad = quantite_kg * prix_traitement_mad
WHERE type_dechet IN ('BANAL', 'A_DETRUIRE')
  AND prix_traitement_mad IS NOT NULL;

-- 2. MODIFICATIONS TABLE transaction
-- ============================================

-- Ajout du champ source
ALTER TABLE transaction ADD COLUMN source VARCHAR(20) DEFAULT 'MANUEL';
ALTER TABLE transaction ADD CONSTRAINT chk_transaction_source 
    CHECK (source IN ('AUTO_ENLEVEMENT', 'MANUEL'));

-- Lien vers pickup_item source
ALTER TABLE transaction ADD COLUMN pickup_item_id BIGINT;
ALTER TABLE transaction ADD CONSTRAINT fk_transaction_pickup_item 
    FOREIGN KEY (pickup_item_id) REFERENCES pickup_item(id) ON DELETE SET NULL;

-- Index pour performance
CREATE INDEX idx_transaction_source ON transaction(source);
CREATE INDEX idx_transaction_pickup_item ON transaction(pickup_item_id);

-- 3. MODIFICATIONS TABLE enlevement
-- ============================================

-- Statut comptable
ALTER TABLE enlevement ADD COLUMN statut_comptable VARCHAR(20) DEFAULT 'NON_GENERE';
ALTER TABLE enlevement ADD CONSTRAINT chk_enlevement_statut_comptable 
    CHECK (statut_comptable IN ('NON_GENERE', 'GENERE', 'MODIFIE'));

CREATE INDEX idx_enlevement_statut_comptable ON enlevement(statut_comptable);

-- 4. TRIGGERS POUR CALCULS AUTOMATIQUES
-- ============================================

-- Fonction pour calculer les montants et marges
CREATE OR REPLACE FUNCTION calculate_pickup_item_amounts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type_dechet = 'RECYCLABLE' THEN
        -- Calculs pour déchets valorisables
        IF NEW.prix_achat_mad IS NOT NULL AND NEW.prix_vente_mad IS NOT NULL THEN
            NEW.montant_achat_mad := NEW.quantite_kg * NEW.prix_achat_mad;
            NEW.montant_vente_mad := NEW.quantite_kg * NEW.prix_vente_mad;
            NEW.marge_mad := NEW.montant_vente_mad - NEW.montant_achat_mad;
        END IF;
        NEW.prix_traitement_mad := NULL;
        NEW.montant_traitement_mad := NULL;
    ELSIF NEW.type_dechet IN ('BANAL', 'A_DETRUIRE') THEN
        -- Calculs pour déchets banals
        IF NEW.prix_traitement_mad IS NOT NULL THEN
            NEW.montant_traitement_mad := NEW.quantite_kg * NEW.prix_traitement_mad;
        END IF;
        NEW.prix_achat_mad := NULL;
        NEW.prix_vente_mad := NULL;
        NEW.montant_achat_mad := NULL;
        NEW.montant_vente_mad := NULL;
        NEW.marge_mad := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger avant insert/update
DROP TRIGGER IF EXISTS trg_calculate_pickup_item_amounts ON pickup_item;
CREATE TRIGGER trg_calculate_pickup_item_amounts
    BEFORE INSERT OR UPDATE ON pickup_item
    FOR EACH ROW
    EXECUTE FUNCTION calculate_pickup_item_amounts();

-- 5. VUES UTILITAIRES
-- ============================================

-- Vue pour synthèse financière par enlèvement
CREATE OR REPLACE VIEW v_enlevement_financier AS
SELECT 
    e.id AS enlevement_id,
    e.numero_enlevement,
    e.date_enlevement,
    e.societe_id,
    -- Totaux valorisables
    COALESCE(SUM(CASE WHEN pi.type_dechet = 'RECYCLABLE' THEN pi.montant_achat_mad ELSE 0 END), 0) AS total_achat,
    COALESCE(SUM(CASE WHEN pi.type_dechet = 'RECYCLABLE' THEN pi.montant_vente_mad ELSE 0 END), 0) AS total_vente,
    COALESCE(SUM(CASE WHEN pi.type_dechet = 'RECYCLABLE' THEN pi.marge_mad ELSE 0 END), 0) AS marge_brute,
    -- Totaux banals
    COALESCE(SUM(CASE WHEN pi.type_dechet IN ('BANAL', 'A_DETRUIRE') THEN pi.montant_traitement_mad ELSE 0 END), 0) AS total_traitement,
    -- Bilan net
    COALESCE(SUM(CASE WHEN pi.type_dechet = 'RECYCLABLE' THEN pi.marge_mad ELSE 0 END), 0) 
    - COALESCE(SUM(CASE WHEN pi.type_dechet IN ('BANAL', 'A_DETRUIRE') THEN pi.montant_traitement_mad ELSE 0 END), 0) AS bilan_net
FROM enlevement e
LEFT JOIN pickup_item pi ON pi.enlevement_id = e.id
GROUP BY e.id, e.numero_enlevement, e.date_enlevement, e.societe_id;

-- 6. COMMENTAIRES
-- ============================================

COMMENT ON COLUMN pickup_item.prix_achat_mad IS 'Prix d''achat au client (MAD/kg) - Uniquement pour RECYCLABLE';
COMMENT ON COLUMN pickup_item.prix_vente_mad IS 'Prix de vente au recycleur (MAD/kg) - Uniquement pour RECYCLABLE';
COMMENT ON COLUMN pickup_item.marge_mad IS 'Marge = montant_vente - montant_achat - Uniquement pour RECYCLABLE';
COMMENT ON COLUMN pickup_item.prix_traitement_mad IS 'Prix de traitement (MAD/kg) - Uniquement pour BANAL/A_DETRUIRE';
COMMENT ON COLUMN transaction.source IS 'Source de la transaction : AUTO_ENLEVEMENT ou MANUEL';
COMMENT ON COLUMN transaction.pickup_item_id IS 'Lien vers le pickup_item source (si transaction auto)';
COMMENT ON COLUMN enlevement.statut_comptable IS 'Statut de génération des transactions comptables';
```

---

## 🔨 MODIFICATIONS BACKEND JAVA

### 1. Entité `PickupItem.java` - Modifications

```java
// Ajout des nouveaux champs
@Column(name = "prix_achat_mad", precision = 10, scale = 3)
private BigDecimal prixAchatMad;

@Column(name = "prix_vente_mad", precision = 10, scale = 3)
private BigDecimal prixVenteMad;

@Column(name = "montant_achat_mad", precision = 12, scale = 2)
private BigDecimal montantAchatMad;

@Column(name = "montant_vente_mad", precision = 12, scale = 2)
private BigDecimal montantVenteMad;

@Column(name = "marge_mad", precision = 12, scale = 2)
private BigDecimal margeMad;

@Column(name = "prix_traitement_mad", precision = 10, scale = 3)
private BigDecimal prixTraitementMad;

@Column(name = "montant_traitement_mad", precision = 12, scale = 2)
private BigDecimal montantTraitementMad;

// Modification de @PrePersist pour calculs automatiques
@PrePersist
@PreUpdate
public void validateAndCalculate() {
    if (TypeDechet.RECYCLABLE.equals(typeDechet)) {
        // Validation pour valorisables
        if (sousType == null || sousType.trim().isEmpty()) {
            throw new IllegalStateException("Le sous-type est obligatoire pour les déchets RECYCLABLE");
        }
        if (prixAchatMad == null || prixVenteMad == null) {
            throw new IllegalStateException("Prix achat et prix vente obligatoires pour RECYCLABLE");
        }
        if (prixVenteMad.compareTo(prixAchatMad) < 0) {
            log.warn("Marge négative pour item {} : prix vente {} < prix achat {}", 
                sousType, prixVenteMad, prixAchatMad);
        }
        
        // Calculs
        if (quantiteKg != null && prixAchatMad != null && prixVenteMad != null) {
            montantAchatMad = quantiteKg.multiply(prixAchatMad)
                    .setScale(2, RoundingMode.HALF_UP);
            montantVenteMad = quantiteKg.multiply(prixVenteMad)
                    .setScale(2, RoundingMode.HALF_UP);
            margeMad = montantVenteMad.subtract(montantAchatMad)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        
        // Nettoyer les champs banals
        prixTraitementMad = null;
        montantTraitementMad = null;
    } else if (TypeDechet.BANAL.equals(typeDechet) || TypeDechet.A_DETRUIRE.equals(typeDechet)) {
        // Validation pour banals
        if (prixTraitementMad == null) {
            throw new IllegalStateException("Prix traitement obligatoire pour BANAL/A_DETRUIRE");
        }
        
        // Calculs
        if (quantiteKg != null && prixTraitementMad != null) {
            montantTraitementMad = quantiteKg.multiply(prixTraitementMad)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        
        // Nettoyer les champs valorisables
        prixAchatMad = null;
        prixVenteMad = null;
        montantAchatMad = null;
        montantVenteMad = null;
        margeMad = null;
    }
}
```

### 2. Entité `Transaction.java` - Modifications

```java
// Ajout du champ source
@Enumerated(EnumType.STRING)
@Column(name = "source", nullable = false, length = 20)
@Builder.Default
private SourceTransaction source = SourceTransaction.MANUEL;

// Lien vers pickup_item
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "pickup_item_id")
private PickupItem pickupItem;

// Enum pour la source
public enum SourceTransaction {
    AUTO_ENLEVEMENT,  // Générée automatiquement depuis un enlèvement
    MANUEL            // Saisie manuelle
}
```

### 3. Entité `Enlevement.java` - Modifications

```java
// Ajout du statut comptable
@Enumerated(EnumType.STRING)
@Column(name = "statut_comptable", nullable = false, length = 20)
@Builder.Default
private StatutComptable statutComptable = StatutComptable.NON_GENERE;

// Enum pour le statut comptable
public enum StatutComptable {
    NON_GENERE,  // Transactions non générées
    GENERE,      // Transactions générées
    MODIFIE      // Modifié après génération (nécessite régénération)
}
```

### 4. Nouveau Service : `TransactionGenerationService.java`

```java
package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.entity.*;
import ma.iorecycling.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransactionGenerationService {
    
    private final TransactionRepository transactionRepository;
    
    /**
     * Génère automatiquement les transactions comptables depuis un enlèvement
     */
    public void generateTransactionsFromEnlevement(Enlevement enlevement) {
        log.info("Génération des transactions pour l'enlèvement {}", enlevement.getNumeroEnlevement());
        
        // Supprimer les transactions existantes liées à cet enlèvement (si régénération)
        transactionRepository.deleteByEnlevementIdAndSource(
            enlevement.getId(), 
            Transaction.SourceTransaction.AUTO_ENLEVEMENT
        );
        
        // Parcourir tous les items de l'enlèvement
        for (PickupItem item : enlevement.getItems()) {
            if (PickupItem.TypeDechet.RECYCLABLE.equals(item.getTypeDechet())) {
                // Générer transaction DEPENSE (achat)
                createTransaction(
                    Transaction.TypeTransaction.DEPENSE,
                    item.getMontantAchatMad(),
                    enlevement.getDateEnlevement(),
                    String.format("Achat déchets %s - Enlèvement %s", 
                        item.getSousType(), enlevement.getNumeroEnlevement()),
                    "Achat déchets valorisables",
                    enlevement.getSociete(),
                    enlevement,
                    item
                );
                
                // Générer transaction RECETTE (vente)
                createTransaction(
                    Transaction.TypeTransaction.RECETTE,
                    item.getMontantVenteMad(),
                    enlevement.getDateEnlevement(),
                    String.format("Vente déchets %s - Enlèvement %s", 
                        item.getSousType(), enlevement.getNumeroEnlevement()),
                    "Vente déchets valorisables",
                    enlevement.getSociete(),
                    enlevement,
                    item
                );
            } else if (PickupItem.TypeDechet.BANAL.equals(item.getTypeDechet()) 
                    || PickupItem.TypeDechet.A_DETRUIRE.equals(item.getTypeDechet())) {
                // Générer transaction DEPENSE (traitement)
                createTransaction(
                    Transaction.TypeTransaction.DEPENSE,
                    item.getMontantTraitementMad(),
                    enlevement.getDateEnlevement(),
                    String.format("Traitement déchets %s - Enlèvement %s", 
                        item.getTypeDechet(), enlevement.getNumeroEnlevement()),
                    "Coût traitement déchets",
                    enlevement.getSociete(),
                    enlevement,
                    item
                );
            }
        }
        
        // Mettre à jour le statut de l'enlèvement
        enlevement.setStatutComptable(Enlevement.StatutComptable.GENERE);
        
        log.info("Transactions générées avec succès pour l'enlèvement {}", 
            enlevement.getNumeroEnlevement());
    }
    
    private Transaction createTransaction(
            Transaction.TypeTransaction type,
            BigDecimal montant,
            LocalDate dateTransaction,
            String description,
            String categorie,
            Societe societe,
            Enlevement enlevement,
            PickupItem pickupItem) {
        
        Transaction transaction = Transaction.builder()
            .type(type)
            .montant(montant)
            .dateTransaction(dateTransaction)
            .description(description)
            .categorie(categorie)
            .societe(societe)
            .enlevement(enlevement)
            .pickupItem(pickupItem)
            .source(Transaction.SourceTransaction.AUTO_ENLEVEMENT)
            .statut(Transaction.StatutTransaction.EN_ATTENTE)
            .build();
        
        return transactionRepository.save(transaction);
    }
}
```

### 5. Modifications `EnlevementService.java`

```java
// Injection du service de génération
private final TransactionGenerationService transactionGenerationService;

// Modification de la méthode createEnlevement
public EnlevementDTO createEnlevement(CreateEnlevementRequest request, String createdBy) {
    // ... code existant de création de l'enlèvement ...
    
    // Générer automatiquement les transactions comptables
    transactionGenerationService.generateTransactionsFromEnlevement(savedEnlevement);
    
    return enlevementMapper.toDTO(savedEnlevement);
}

// Nouvelle méthode pour régénérer les transactions
public void regenerateTransactions(Long enlevementId) {
    Enlevement enlevement = enlevementRepository.findById(enlevementId)
        .orElseThrow(() -> new IllegalArgumentException("Enlèvement non trouvé"));
    
    transactionGenerationService.generateTransactionsFromEnlevement(enlevement);
}
```

### 6. DTO Modifications

#### `CreatePickupItemRequest.java`
```java
// Ajout des nouveaux champs
private BigDecimal prixAchatMad;      // Pour RECYCLABLE
private BigDecimal prixVenteMad;      // Pour RECYCLABLE
private BigDecimal prixTraitementMad; // Pour BANAL/A_DETRUIRE
```

#### `PickupItemDTO.java`
```java
// Ajout des nouveaux champs
private BigDecimal prixAchatMad;
private BigDecimal prixVenteMad;
private BigDecimal montantAchatMad;
private BigDecimal montantVenteMad;
private BigDecimal margeMad;
private BigDecimal prixTraitementMad;
private BigDecimal montantTraitementMad;
```

---

## 🎨 MODIFICATIONS FRONTEND ANGULAR

### 1. Modèle TypeScript : `enlevement.model.ts`

```typescript
export interface PickupItem {
  id: number;
  enlevementId: number;
  typeDechet: TypeDechet;
  sousType?: string;
  quantiteKg: number;
  uniteMesure?: string;
  etat?: string;
  
  // Pour RECYCLABLE
  prixAchatMad?: number;
  prixVenteMad?: number;
  montantAchatMad?: number;
  montantVenteMad?: number;
  margeMad?: number;
  
  // Pour BANAL/A_DETRUIRE
  prixTraitementMad?: number;
  montantTraitementMad?: number;
  
  // Rétrocompatibilité (à supprimer progressivement)
  prixUnitaireMad?: number;
  montantMad?: number;
}

export interface CreatePickupItemRequest {
  typeDechet: string;
  sousType?: string;
  quantiteKg: number;
  uniteMesure?: string;
  etat?: string;
  
  // Pour RECYCLABLE
  prixAchatMad?: number;
  prixVenteMad?: number;
  
  // Pour BANAL/A_DETRUIRE
  prixTraitementMad?: number;
}
```

### 2. Modèle TypeScript : `comptabilite.model.ts`

```typescript
export interface Transaction {
  // ... champs existants ...
  source?: 'AUTO_ENLEVEMENT' | 'MANUEL';
  pickupItemId?: number;
  pickupItem?: PickupItem; // Détail de l'item source
}

export enum SourceTransaction {
  AUTO_ENLEVEMENT = 'AUTO_ENLEVEMENT',
  MANUEL = 'MANUEL'
}
```

### 3. Composant : `enlevement-form.component.ts` - Modifications

```typescript
// Dans la méthode createItemFormGroup()
createItemFormGroup(): FormGroup {
  const form = this.fb.group({
    typeDechet: ['', Validators.required],
    sousType: [''],
    quantiteKg: [0, [Validators.required, Validators.min(0)]],
    uniteMesure: ['kg'],
    etat: [''],
    
    // Champs conditionnels selon typeDechet
    prixAchatMad: [0, [Validators.min(0)]],
    prixVenteMad: [0, [Validators.min(0)]],
    prixTraitementMad: [0, [Validators.min(0)]]
  });
  
  // Validation conditionnelle
  form.get('typeDechet')?.valueChanges.subscribe(type => {
    if (type === 'RECYCLABLE') {
      form.get('prixAchatMad')?.setValidators([Validators.required, Validators.min(0)]);
      form.get('prixVenteMad')?.setValidators([Validators.required, Validators.min(0)]);
      form.get('prixTraitementMad')?.clearValidators();
      form.get('sousType')?.setValidators([Validators.required]);
    } else {
      form.get('prixTraitementMad')?.setValidators([Validators.required, Validators.min(0)]);
      form.get('prixAchatMad')?.clearValidators();
      form.get('prixVenteMad')?.clearValidators();
      form.get('sousType')?.clearValidators();
    }
    form.get('prixAchatMad')?.updateValueAndValidity();
    form.get('prixVenteMad')?.updateValueAndValidity();
    form.get('prixTraitementMad')?.updateValueAndValidity();
    form.get('sousType')?.updateValueAndValidity();
  });
  
  return form;
}

// Calcul des montants
calculateMontant(item: any): { achat?: number; vente?: number; traitement?: number; marge?: number } {
  const quantite = item.quantiteKg || 0;
  
  if (item.typeDechet === 'RECYCLABLE') {
    const achat = quantite * (item.prixAchatMad || 0);
    const vente = quantite * (item.prixVenteMad || 0);
    const marge = vente - achat;
    return { achat, vente, marge };
  } else {
    const traitement = quantite * (item.prixTraitementMad || 0);
    return { traitement };
  }
}

// Calcul des totaux
calculateTotaux(): any {
  const items = this.itemsFormArray.value;
  
  let totalAchat = 0;
  let totalVente = 0;
  let totalTraitement = 0;
  let poidsTotal = 0;
  let poidsRecyclable = 0;
  
  items.forEach((item: any) => {
    const montants = this.calculateMontant(item);
    poidsTotal += item.quantiteKg || 0;
    
    if (item.typeDechet === 'RECYCLABLE') {
      totalAchat += montants.achat || 0;
      totalVente += montants.vente || 0;
      poidsRecyclable += item.quantiteKg || 0;
    } else {
      totalTraitement += montants.traitement || 0;
    }
  });
  
  const margeBrute = totalVente - totalAchat;
  const bilanNet = margeBrute - totalTraitement;
  const tauxRecyclage = poidsTotal > 0 ? (poidsRecyclable / poidsTotal) * 100 : 0;
  
  return {
    poidsTotal,
    totalAchat,
    totalVente,
    margeBrute,
    totalTraitement,
    bilanNet,
    tauxRecyclage
  };
}
```

### 4. Template : `enlevement-form.component.html` - Section Items

```html
<!-- Section saisie item avec distinction financière -->
<div *ngFor="let itemGroup of itemsFormArray.controls; let i = index" [formGroup]="itemGroup">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Item {{ i + 1 }}</mat-card-title>
    </mat-card-header>
    
    <mat-card-content>
      <!-- Type de déchet -->
      <mat-form-field>
        <mat-label>Type de déchet</mat-label>
        <mat-select formControlName="typeDechet">
          <mat-option value="RECYCLABLE">
            VALORISABLE (génère achat + vente)
          </mat-option>
          <mat-option value="BANAL">BANAL (génère uniquement un coût)</mat-option>
          <mat-option value="A_DETRUIRE">À DÉTRUIRE (génère uniquement un coût)</mat-option>
        </mat-select>
      </mat-form-field>
      
      <!-- Si VALORISABLE -->
      <ng-container *ngIf="itemGroup.get('typeDechet')?.value === 'RECYCLABLE'">
        <mat-form-field>
          <mat-label>Sous-type *</mat-label>
          <mat-select formControlName="sousType">
            <mat-option value="CARTON">CARTON</mat-option>
            <mat-option value="PLASTIQUE_PET">PLASTIQUE PET</mat-option>
            <!-- ... autres options ... -->
          </mat-select>
        </mat-form-field>
        
        <div class="financial-section">
          <h4>💰 Financier</h4>
          
          <mat-form-field>
            <mat-label>Prix d'achat (MAD/kg) *</mat-label>
            <input matInput type="number" step="0.01" formControlName="prixAchatMad">
            <mat-hint>Ce que l'entreprise paie au client</mat-hint>
          </mat-form-field>
          
          <mat-form-field>
            <mat-label>Prix de vente (MAD/kg) *</mat-label>
            <input matInput type="number" step="0.01" formControlName="prixVenteMad">
            <mat-hint>Ce que l'entreprise revend</mat-hint>
          </mat-form-field>
          
          <!-- Calculs automatiques -->
          <div class="calculations">
            <p><strong>Montant achat :</strong> 
              {{ calculateMontant(itemGroup.value).achat | number:'1.2-2' }} MAD</p>
            <p><strong>Montant vente :</strong> 
              {{ calculateMontant(itemGroup.value).vente | number:'1.2-2' }} MAD</p>
            <p><strong>Marge :</strong> 
              <span [class.negative]="(calculateMontant(itemGroup.value).marge || 0) < 0">
                {{ calculateMontant(itemGroup.value).marge | number:'1.2-2' }} MAD
              </span>
            </p>
          </div>
        </div>
      </ng-container>
      
      <!-- Si BANAL/A_DETRUIRE -->
      <ng-container *ngIf="['BANAL', 'A_DETRUIRE'].includes(itemGroup.get('typeDechet')?.value)">
        <mat-form-field>
          <mat-label>Prix de traitement (MAD/kg) *</mat-label>
          <input matInput type="number" step="0.01" formControlName="prixTraitementMad">
        </mat-form-field>
        
        <div class="calculations">
          <p><strong>Montant traitement :</strong> 
            {{ calculateMontant(itemGroup.value).traitement | number:'1.2-2' }} MAD</p>
          <p class="info">Impact CA : Aucun (déchet banal)</p>
        </div>
      </ng-container>
    </mat-card-content>
  </mat-card>
</div>
```

### 5. Nouveau Composant : `suivi-financier-client.component.ts`

```typescript
@Component({
  selector: 'app-suivi-financier-client',
  templateUrl: './suivi-financier-client.component.html',
  styleUrls: ['./suivi-financier-client.component.scss']
})
export class SuiviFinancierClientComponent implements OnInit {
  societeId: number | null = null;
  dateDebut: Date = new Date(new Date().getFullYear(), 0, 1);
  dateFin: Date = new Date();
  
  enlevements: Enlevement[] = [];
  synthese: {
    totalAchat: number;
    totalVente: number;
    margeBrute: number;
    totalTraitement: number;
    bilanNet: number;
  } | null = null;
  
  displayedColumns = ['date', 'enlevement', 'achat', 'vente', 'marge', 'traitement', 'bilan'];
  
  constructor(
    private enlevementService: EnlevementService,
    private societeService: SocieteService
  ) {}
  
  loadData(): void {
    if (!this.societeId) return;
    
    const dateDebutStr = this.dateDebut.toISOString().split('T')[0];
    const dateFinStr = this.dateFin.toISOString().split('T')[0];
    
    this.enlevementService.getEnlevementsBySociete(
      this.societeId, 
      dateDebutStr, 
      dateFinStr
    ).subscribe({
      next: (enlevements) => {
        this.enlevements = enlevements;
        this.calculateSynthese();
      }
    });
  }
  
  calculateSynthese(): void {
    let totalAchat = 0;
    let totalVente = 0;
    let totalTraitement = 0;
    
    this.enlevements.forEach(enlevement => {
      enlevement.items?.forEach(item => {
        if (item.typeDechet === 'RECYCLABLE') {
          totalAchat += item.montantAchatMad || 0;
          totalVente += item.montantVenteMad || 0;
        } else {
          totalTraitement += item.montantTraitementMad || 0;
        }
      });
    });
    
    const margeBrute = totalVente - totalAchat;
    const bilanNet = margeBrute - totalTraitement;
    
    this.synthese = {
      totalAchat,
      totalVente,
      margeBrute,
      totalTraitement,
      bilanNet
    };
  }
  
  exportToExcel(): void {
    // Implémentation export Excel
  }
}
```

---

## 🧪 TESTS À PRÉVOIR

### Tests Backend

1. **TransactionGenerationServiceTest**
   - Génération transactions pour enlèvement valorisable
   - Génération transactions pour enlèvement banal
   - Génération transactions pour enlèvement mixte
   - Régénération après modification

2. **PickupItemValidationTest**
   - Validation prix achat/vente pour RECYCLABLE
   - Validation prix traitement pour BANAL
   - Calcul automatique des marges

3. **EnlevementServiceTest**
   - Création enlèvement avec génération auto
   - Modification enlèvement validé

### Tests Frontend

1. **EnlevementFormComponentTest**
   - Affichage conditionnel champs selon type déchet
   - Calculs automatiques montants/marges
   - Validation formulaires

2. **ComptabiliteDashboardComponentTest**
   - Filtrage transactions auto vs manuel
   - Désactivation modification transactions auto

---

## 📋 CHECKLIST IMPLÉMENTATION

### Backend
- [ ] Migration SQL V17 créée et testée
- [ ] Entités Java modifiées (PickupItem, Transaction, Enlevement)
- [ ] Service TransactionGenerationService créé
- [ ] EnlevementService modifié pour génération auto
- [ ] DTOs mis à jour
- [ ] Tests unitaires écrits
- [ ] Tests d'intégration écrits

### Frontend
- [ ] Modèles TypeScript mis à jour
- [ ] Formulaire enlèvement refondu (distinction financière)
- [ ] Dashboard comptabilité refondu (filtre source)
- [ ] Composant suivi financier client créé
- [ ] Détail enlèvement amélioré (marges)
- [ ] Tests composants écrits

### Validation Métier
- [ ] Validation avec utilisateurs finaux
- [ ] Formation utilisateurs prévue
- [ ] Documentation utilisateur mise à jour

---

**Fin du document**

