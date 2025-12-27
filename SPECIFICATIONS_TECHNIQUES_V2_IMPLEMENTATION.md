# 🔧 SPÉCIFICATIONS TECHNIQUES V2 - IMPLÉMENTATION
## IORecycling - Recettes (Prestation + Vente) et Module Vente

**Date** : 2024  
**Version** : 2.0

---

## 📐 MIGRATION BASE DE DONNÉES

### Migration SQL : `V18__refonte_v2_recettes_et_ventes.sql`

```sql
-- ============================================
-- V18: Refonte V2 - Recettes (Prestation + Vente) et Module Vente
-- ============================================

-- 1. MODIFICATIONS TABLE pickup_item
-- ============================================

-- Prix et montant prestation (pour tous types de déchets)
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS prix_prestation_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS montant_prestation_mad DECIMAL(12, 2);

-- Prix et montant achat (pour déchets valorisables)
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS prix_achat_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS montant_achat_mad DECIMAL(12, 2);

-- Prix et montant traitement (pour déchets banals)
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS prix_traitement_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS montant_traitement_mad DECIMAL(12, 2);

-- Suivi des quantités pour la vente
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS quantite_vendue_kg DECIMAL(10, 3) DEFAULT 0;
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS reste_a_vendre_kg DECIMAL(10, 3);

-- Calcul initial du reste à vendre pour les données existantes
UPDATE pickup_item 
SET reste_a_vendre_kg = quantite_kg - COALESCE(quantite_vendue_kg, 0)
WHERE reste_a_vendre_kg IS NULL;

-- 2. NOUVELLE TABLE vente
-- ============================================

CREATE TABLE IF NOT EXISTS vente (
    id BIGSERIAL PRIMARY KEY,
    numero_vente VARCHAR(50) UNIQUE,
    date_vente DATE NOT NULL,
    acheteur_id BIGINT,
    acheteur_nom VARCHAR(200),
    observation TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON' 
        CHECK (statut IN ('BROUILLON', 'VALIDEE', 'ANNULEE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE INDEX idx_vente_date ON vente(date_vente);
CREATE INDEX idx_vente_statut ON vente(statut);
CREATE INDEX idx_vente_acheteur ON vente(acheteur_id);

-- 3. NOUVELLE TABLE vente_item
-- ============================================

CREATE TABLE IF NOT EXISTS vente_item (
    id BIGSERIAL PRIMARY KEY,
    vente_id BIGINT NOT NULL,
    pickup_item_id BIGINT,
    type_dechet VARCHAR(20) NOT NULL,
    sous_type VARCHAR(50),
    quantite_vendue_kg DECIMAL(10, 3) NOT NULL CHECK (quantite_vendue_kg > 0),
    prix_vente_unitaire_mad DECIMAL(10, 3) NOT NULL CHECK (prix_vente_unitaire_mad > 0),
    montant_vente_mad DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vente_id) REFERENCES vente(id) ON DELETE CASCADE,
    FOREIGN KEY (pickup_item_id) REFERENCES pickup_item(id) ON DELETE SET NULL
);

CREATE INDEX idx_vente_item_vente ON vente_item(vente_id);
CREATE INDEX idx_vente_item_pickup ON vente_item(pickup_item_id);
CREATE INDEX idx_vente_item_type ON vente_item(type_dechet, sous_type);

-- 4. MODIFICATIONS TABLE transaction
-- ============================================

-- Distinction type recette
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS type_recette VARCHAR(20);
-- Valeurs possibles : 'PRESTATION', 'VENTE_MATIERE', NULL (pour dépenses)

-- Lien vers vente_item pour les recettes vente matière
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS vente_item_id BIGINT;
ALTER TABLE transaction ADD CONSTRAINT fk_transaction_vente_item 
    FOREIGN KEY (vente_item_id) REFERENCES vente_item(id) ON DELETE SET NULL;

CREATE INDEX idx_transaction_type_recette ON transaction(type_recette);
CREATE INDEX idx_transaction_vente_item ON transaction(vente_item_id);

-- 5. TRIGGERS POUR CALCULS AUTOMATIQUES
-- ============================================

-- Fonction pour calculer les montants et reste à vendre
CREATE OR REPLACE FUNCTION calculate_pickup_item_amounts()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcul montant prestation
    IF NEW.prix_prestation_mad IS NOT NULL AND NEW.quantite_kg IS NOT NULL THEN
        NEW.montant_prestation_mad := NEW.quantite_kg * NEW.prix_prestation_mad;
    END IF;
    
    -- Calcul montant achat (si valorisable)
    IF NEW.type_dechet = 'RECYCLABLE' AND NEW.prix_achat_mad IS NOT NULL AND NEW.quantite_kg IS NOT NULL THEN
        NEW.montant_achat_mad := NEW.quantite_kg * NEW.prix_achat_mad;
    END IF;
    
    -- Calcul montant traitement (si banal)
    IF NEW.type_dechet IN ('BANAL', 'A_DETRUIRE') AND NEW.prix_traitement_mad IS NOT NULL AND NEW.quantite_kg IS NOT NULL THEN
        NEW.montant_traitement_mad := NEW.quantite_kg * NEW.prix_traitement_mad;
    END IF;
    
    -- Calcul reste à vendre
    IF NEW.quantite_kg IS NOT NULL THEN
        NEW.reste_a_vendre_kg := NEW.quantite_kg - COALESCE(NEW.quantite_vendue_kg, 0);
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

-- Fonction pour calculer montant vente_item
CREATE OR REPLACE FUNCTION calculate_vente_item_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantite_vendue_kg IS NOT NULL AND NEW.prix_vente_unitaire_mad IS NOT NULL THEN
        NEW.montant_vente_mad := NEW.quantite_vendue_kg * NEW.prix_vente_unitaire_mad;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vente_item
DROP TRIGGER IF EXISTS trg_calculate_vente_item_amount ON vente_item;
CREATE TRIGGER trg_calculate_vente_item_amount
    BEFORE INSERT OR UPDATE ON vente_item
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vente_item_amount();

-- 6. VUES UTILITAIRES
-- ============================================

-- Vue pour stocks disponibles à la vente
CREATE OR REPLACE VIEW v_stocks_disponibles AS
SELECT 
    pi.id AS pickup_item_id,
    pi.enlevement_id,
    e.numero_enlevement,
    e.date_enlevement,
    e.societe_id,
    s.raison_sociale AS societe_nom,
    pi.type_dechet,
    pi.sous_type,
    pi.quantite_kg AS quantite_recuperee_kg,
    COALESCE(pi.quantite_vendue_kg, 0) AS quantite_vendue_kg,
    COALESCE(pi.reste_a_vendre_kg, pi.quantite_kg) AS reste_a_vendre_kg,
    CASE 
        WHEN COALESCE(pi.reste_a_vendre_kg, pi.quantite_kg) = 0 THEN 'VENDU'
        WHEN COALESCE(pi.quantite_vendue_kg, 0) = 0 THEN 'NON_VENDU'
        ELSE 'PARTIELLEMENT_VENDU'
    END AS statut_stock
FROM pickup_item pi
JOIN enlevement e ON e.id = pi.enlevement_id
JOIN societe s ON s.id = e.societe_id
WHERE COALESCE(pi.reste_a_vendre_kg, pi.quantite_kg) > 0;

-- Vue pour synthèse financière par enlèvement
CREATE OR REPLACE VIEW v_enlevement_financier AS
SELECT 
    e.id AS enlevement_id,
    e.numero_enlevement,
    e.date_enlevement,
    e.societe_id,
    -- Totaux prestation
    COALESCE(SUM(pi.montant_prestation_mad), 0) AS total_prestation,
    -- Totaux achat (valorisable)
    COALESCE(SUM(CASE WHEN pi.type_dechet = 'RECYCLABLE' THEN pi.montant_achat_mad ELSE 0 END), 0) AS total_achat,
    -- Totaux traitement (banal)
    COALESCE(SUM(CASE WHEN pi.type_dechet IN ('BANAL', 'A_DETRUIRE') THEN pi.montant_traitement_mad ELSE 0 END), 0) AS total_traitement,
    -- Bilan net
    COALESCE(SUM(pi.montant_prestation_mad), 0) 
    - COALESCE(SUM(CASE WHEN pi.type_dechet = 'RECYCLABLE' THEN pi.montant_achat_mad ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN pi.type_dechet IN ('BANAL', 'A_DETRUIRE') THEN pi.montant_traitement_mad ELSE 0 END), 0) AS bilan_net
FROM enlevement e
LEFT JOIN pickup_item pi ON pi.enlevement_id = e.id
GROUP BY e.id, e.numero_enlevement, e.date_enlevement, e.societe_id;

-- 7. COMMENTAIRES
-- ============================================

COMMENT ON COLUMN pickup_item.prix_prestation_mad IS 'Prix de prestation d''enlèvement (MAD/kg) - Tous types de déchets';
COMMENT ON COLUMN pickup_item.montant_prestation_mad IS 'Montant prestation = quantite_kg × prix_prestation_mad';
COMMENT ON COLUMN pickup_item.prix_achat_mad IS 'Prix d''achat au client (MAD/kg) - Uniquement pour RECYCLABLE';
COMMENT ON COLUMN pickup_item.prix_traitement_mad IS 'Prix de traitement (MAD/kg) - Uniquement pour BANAL/A_DETRUIRE';
COMMENT ON COLUMN pickup_item.quantite_vendue_kg IS 'Quantité totale vendue depuis cet item';
COMMENT ON COLUMN pickup_item.reste_a_vendre_kg IS 'Quantité restante à vendre = quantite_kg - quantite_vendue_kg';
COMMENT ON COLUMN transaction.type_recette IS 'Type de recette : PRESTATION ou VENTE_MATIERE (NULL pour dépenses)';
COMMENT ON COLUMN transaction.vente_item_id IS 'Lien vers le vente_item source (si recette vente matière)';
COMMENT ON TABLE vente IS 'Ventes de déchets à des acheteurs';
COMMENT ON TABLE vente_item IS 'Lignes de détail d''une vente';
```

---

## 🔨 MODIFICATIONS BACKEND JAVA

### 1. Entité `PickupItem.java` - Modifications

```java
package ma.iorecycling.entity;

// ... imports existants ...

@Entity
@Table(name = "pickup_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PickupItem {
    
    // ... champs existants ...
    
    // NOUVEAUX CHAMPS - Prestation (tous types)
    @Column(name = "prix_prestation_mad", precision = 10, scale = 3)
    private BigDecimal prixPrestationMad;
    
    @Column(name = "montant_prestation_mad", precision = 12, scale = 2)
    private BigDecimal montantPrestationMad;
    
    // NOUVEAUX CHAMPS - Achat (valorisable)
    @Column(name = "prix_achat_mad", precision = 10, scale = 3)
    private BigDecimal prixAchatMad;
    
    @Column(name = "montant_achat_mad", precision = 12, scale = 2)
    private BigDecimal montantAchatMad;
    
    // NOUVEAUX CHAMPS - Traitement (banal)
    @Column(name = "prix_traitement_mad", precision = 10, scale = 3)
    private BigDecimal prixTraitementMad;
    
    @Column(name = "montant_traitement_mad", precision = 12, scale = 2)
    private BigDecimal montantTraitementMad;
    
    // NOUVEAUX CHAMPS - Suivi vente
    @Column(name = "quantite_vendue_kg", precision = 10, scale = 3)
    @Builder.Default
    private BigDecimal quantiteVendueKg = BigDecimal.ZERO;
    
    @Column(name = "reste_a_vendre_kg", precision = 10, scale = 3)
    private BigDecimal resteAVendreKg;
    
    // Relation vers vente_item
    @OneToMany(mappedBy = "pickupItem", fetch = FetchType.LAZY)
    @Builder.Default
    private List<VenteItem> venteItems = new ArrayList<>();
    
    // Modification de @PrePersist
    @PrePersist
    @PreUpdate
    public void validateAndCalculate() {
        // Validation sous-type pour RECYCLABLE
        if (TypeDechet.RECYCLABLE.equals(typeDechet) && (sousType == null || sousType.trim().isEmpty())) {
            throw new IllegalStateException("Le sous-type est obligatoire pour les déchets RECYCLABLE");
        }
        
        // Calcul montant prestation
        if (prixPrestationMad != null && quantiteKg != null) {
            montantPrestationMad = quantiteKg.multiply(prixPrestationMad)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        
        // Calcul montant achat (si valorisable)
        if (TypeDechet.RECYCLABLE.equals(typeDechet) && prixAchatMad != null && quantiteKg != null) {
            montantAchatMad = quantiteKg.multiply(prixAchatMad)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        
        // Calcul montant traitement (si banal)
        if ((TypeDechet.BANAL.equals(typeDechet) || TypeDechet.A_DETRUIRE.equals(typeDechet)) 
                && prixTraitementMad != null && quantiteKg != null) {
            montantTraitementMad = quantiteKg.multiply(prixTraitementMad)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        
        // Calcul reste à vendre
        if (quantiteKg != null) {
            resteAVendreKg = quantiteKg.subtract(quantiteVendueKg != null ? quantiteVendueKg : BigDecimal.ZERO)
                    .setScale(3, RoundingMode.HALF_UP);
        }
    }
    
    /**
     * Calcule le statut du stock
     */
    public StatutStock getStatutStock() {
        if (resteAVendreKg == null || resteAVendreKg.compareTo(BigDecimal.ZERO) == 0) {
            return StatutStock.VENDU;
        }
        if (quantiteVendueKg == null || quantiteVendueKg.compareTo(BigDecimal.ZERO) == 0) {
            return StatutStock.NON_VENDU;
        }
        return StatutStock.PARTIELLEMENT_VENDU;
    }
    
    /**
     * Enum pour le statut du stock
     */
    public enum StatutStock {
        NON_VENDU,
        PARTIELLEMENT_VENDU,
        VENDU
    }
}
```

### 2. Nouvelle Entité `Vente.java`

```java
package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant une vente de déchets à un acheteur
 */
@Entity
@Table(name = "vente")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "numero_vente", unique = true, length = 50)
    private String numeroVente;
    
    @NotNull(message = "La date de vente est obligatoire")
    @Column(name = "date_vente", nullable = false)
    private LocalDate dateVente;
    
    @Column(name = "acheteur_id")
    private Long acheteurId;
    
    @Size(max = 200, message = "Le nom de l'acheteur ne peut pas dépasser 200 caractères")
    @Column(name = "acheteur_nom", length = 200)
    private String acheteurNom;
    
    @Size(max = 1000, message = "L'observation ne peut pas dépasser 1000 caractères")
    @Column(name = "observation", columnDefinition = "TEXT")
    private String observation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    @Builder.Default
    private StatutVente statut = StatutVente.BROUILLON;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    // Relations
    @OneToMany(mappedBy = "vente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VenteItem> items = new ArrayList<>();
    
    // Méthodes utilitaires
    public void addItem(VenteItem item) {
        items.add(item);
        item.setVente(this);
    }
    
    public void removeItem(VenteItem item) {
        items.remove(item);
        item.setVente(null);
    }
    
    /**
     * Enum pour le statut de la vente
     */
    public enum StatutVente {
        BROUILLON,      // En cours de saisie
        VALIDEE,       // Validée (génère transactions)
        ANNULEE        // Annulée
    }
}
```

### 3. Nouvelle Entité `VenteItem.java`

```java
package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entité représentant une ligne de détail d'une vente
 */
@Entity
@Table(name = "vente_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "La vente est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vente_id", nullable = false)
    private Vente vente;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_item_id")
    private PickupItem pickupItem;
    
    @NotNull(message = "Le type de déchet est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_dechet", nullable = false, length = 20)
    private PickupItem.TypeDechet typeDechet;
    
    @Size(max = 50, message = "Le sous-type ne peut pas dépasser 50 caractères")
    @Column(name = "sous_type", length = 50)
    private String sousType;
    
    @NotNull(message = "La quantité vendue est obligatoire")
    @Positive(message = "La quantité vendue doit être positive")
    @Column(name = "quantite_vendue_kg", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantiteVendueKg;
    
    @NotNull(message = "Le prix de vente unitaire est obligatoire")
    @DecimalMin(value = "0.01", message = "Le prix de vente doit être supérieur à 0")
    @Column(name = "prix_vente_unitaire_mad", nullable = false, precision = 10, scale = 3)
    private BigDecimal prixVenteUnitaireMad;
    
    @Column(name = "montant_vente_mad", precision = 12, scale = 2)
    private BigDecimal montantVenteMad;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @PrePersist
    @PreUpdate
    public void calculateMontant() {
        if (quantiteVendueKg != null && prixVenteUnitaireMad != null) {
            montantVenteMad = quantiteVendueKg.multiply(prixVenteUnitaireMad)
                    .setScale(2, RoundingMode.HALF_UP);
        }
    }
}
```

### 4. Entité `Transaction.java` - Modifications

```java
// Ajout des nouveaux champs dans Transaction.java

// Après le champ enlevement
@Enumerated(EnumType.STRING)
@Column(name = "type_recette", length = 20)
private TypeRecette typeRecette;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "vente_item_id")
private VenteItem venteItem;

// Ajout de l'enum
public enum TypeRecette {
    PRESTATION,      // Recette prestation d'enlèvement
    VENTE_MATIERE    // Recette vente de matière
}
```

### 5. Nouveau Service : `VenteService.java`

```java
package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.*;
import ma.iorecycling.entity.*;
import ma.iorecycling.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VenteService {
    
    private final VenteRepository venteRepository;
    private final VenteItemRepository venteItemRepository;
    private final PickupItemRepository pickupItemRepository;
    private final TransactionRepository transactionRepository;
    private final VenteMapper venteMapper;
    
    /**
     * Crée une nouvelle vente avec ses items
     */
    public VenteDTO createVente(CreateVenteRequest request, String createdBy) {
        log.info("Création d'une nouvelle vente");
        
        // Créer la vente
        Vente vente = Vente.builder()
                .dateVente(request.getDateVente())
                .acheteurId(request.getAcheteurId())
                .acheteurNom(request.getAcheteurNom())
                .observation(request.getObservation())
                .statut(Vente.StatutVente.BROUILLON)
                .createdBy(createdBy)
                .build();
        
        Vente savedVente = venteRepository.save(vente);
        
        // Générer le numéro de vente
        if (savedVente.getNumeroVente() == null) {
            savedVente.setNumeroVente(generateNumeroVente(savedVente));
            savedVente = venteRepository.save(savedVente);
        }
        
        // Créer les items
        for (CreateVenteItemRequest itemRequest : request.getItems()) {
            createVenteItem(savedVente, itemRequest);
        }
        
        log.info("Vente créée avec succès : {}", savedVente.getNumeroVente());
        return venteMapper.toDTO(savedVente);
    }
    
    /**
     * Valide une vente et génère les transactions comptables
     */
    public VenteDTO validerVente(Long venteId, String createdBy) {
        log.info("Validation de la vente ID {}", venteId);
        
        Vente vente = venteRepository.findById(venteId)
                .orElseThrow(() -> new IllegalArgumentException("Vente non trouvée"));
        
        if (vente.getStatut() != Vente.StatutVente.BROUILLON) {
            throw new IllegalStateException("Seules les ventes en brouillon peuvent être validées");
        }
        
        // Vérifier les stocks disponibles
        for (VenteItem item : vente.getItems()) {
            if (item.getPickupItem() != null) {
                BigDecimal resteDisponible = item.getPickupItem().getResteAVendreKg();
                if (resteDisponible == null || resteDisponible.compareTo(item.getQuantiteVendueKg()) < 0) {
                    throw new IllegalStateException(
                        String.format("Stock insuffisant pour %s %s. Disponible: %s, Demandé: %s",
                            item.getTypeDechet(), item.getSousType(),
                            resteDisponible, item.getQuantiteVendueKg()));
                }
            }
        }
        
        // Mettre à jour les stocks
        for (VenteItem item : vente.getItems()) {
            if (item.getPickupItem() != null) {
                PickupItem pickupItem = item.getPickupItem();
                BigDecimal nouvelleQuantiteVendue = pickupItem.getQuantiteVendueKg()
                        .add(item.getQuantiteVendueKg());
                pickupItem.setQuantiteVendueKg(nouvelleQuantiteVendue);
                pickupItem.setResteAVendreKg(
                    pickupItem.getQuantiteKg().subtract(nouvelleQuantiteVendue));
                pickupItemRepository.save(pickupItem);
            }
        }
        
        // Générer les transactions comptables
        generateTransactionsFromVente(vente);
        
        // Mettre à jour le statut
        vente.setStatut(Vente.StatutVente.VALIDEE);
        Vente savedVente = venteRepository.save(vente);
        
        log.info("Vente validée : {}", savedVente.getNumeroVente());
        return venteMapper.toDTO(savedVente);
    }
    
    /**
     * Génère les transactions comptables depuis une vente
     */
    private void generateTransactionsFromVente(Vente vente) {
        // Calculer le montant total de la vente
        BigDecimal montantTotal = vente.getItems().stream()
                .map(VenteItem::getMontantVenteMad)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Créer une transaction RECETTE VENTE MATIERE par item ou globale
        // Ici on crée une transaction globale, mais on peut aussi créer une par item
        Transaction transaction = Transaction.builder()
                .type(Transaction.TypeTransaction.RECETTE)
                .typeRecette(Transaction.TypeRecette.VENTE_MATIERE)
                .montant(montantTotal)
                .dateTransaction(vente.getDateVente())
                .description(String.format("Vente de déchets - Vente %s", vente.getNumeroVente()))
                .categorie("Vente déchets")
                .societe(getSocieteFromVente(vente)) // À implémenter selon logique métier
                .statut(Transaction.StatutTransaction.EN_ATTENTE)
                .createdBy(vente.getCreatedBy())
                .build();
        
        transactionRepository.save(transaction);
        
        // Lier les vente_items à la transaction (si besoin de détail par item)
        // Pour simplifier, on peut créer une transaction par item
        for (VenteItem item : vente.getItems()) {
            Transaction itemTransaction = Transaction.builder()
                    .type(Transaction.TypeTransaction.RECETTE)
                    .typeRecette(Transaction.TypeRecette.VENTE_MATIERE)
                    .montant(item.getMontantVenteMad())
                    .dateTransaction(vente.getDateVente())
                    .description(String.format("Vente %s - %s %s",
                        vente.getNumeroVente(), item.getTypeDechet(), item.getSousType()))
                    .categorie("Vente déchets")
                    .societe(getSocieteFromVente(vente))
                    .venteItem(item)
                    .statut(Transaction.StatutTransaction.EN_ATTENTE)
                    .createdBy(vente.getCreatedBy())
                    .build();
            
            transactionRepository.save(itemTransaction);
        }
    }
    
    /**
     * Récupère les stocks disponibles à la vente
     */
    @Transactional(readOnly = true)
    public List<StockDisponibleDTO> getStocksDisponibles(Long societeId, String typeDechet, String sousType) {
        // Implémentation selon logique métier
        // Utiliser la vue v_stocks_disponibles ou requête directe
        return pickupItemRepository.findStocksDisponibles(societeId, typeDechet, sousType)
                .stream()
                .map(this::toStockDisponibleDTO)
                .collect(Collectors.toList());
    }
    
    private String generateNumeroVente(Vente vente) {
        int year = vente.getDateVente() != null
                ? vente.getDateVente().getYear()
                : LocalDate.now().getYear();
        return "VENT-" + year + "-" + String.format("%06d", vente.getId());
    }
    
    private void createVenteItem(Vente vente, CreateVenteItemRequest request) {
        PickupItem pickupItem = null;
        if (request.getPickupItemId() != null) {
            pickupItem = pickupItemRepository.findById(request.getPickupItemId())
                    .orElseThrow(() -> new IllegalArgumentException("PickupItem non trouvé"));
        }
        
        VenteItem item = VenteItem.builder()
                .vente(vente)
                .pickupItem(pickupItem)
                .typeDechet(PickupItem.TypeDechet.valueOf(request.getTypeDechet()))
                .sousType(request.getSousType())
                .quantiteVendueKg(request.getQuantiteVendueKg())
                .prixVenteUnitaireMad(request.getPrixVenteUnitaireMad())
                .build();
        
        venteItemRepository.save(item);
    }
    
    // Méthodes utilitaires à compléter
    private Societe getSocieteFromVente(Vente vente) {
        // Logique à implémenter selon structure
        // Peut-être via le premier pickup_item
        return null; // À compléter
    }
    
    private StockDisponibleDTO toStockDisponibleDTO(PickupItem item) {
        // Conversion vers DTO
        return null; // À compléter
    }
}
```

### 6. Modifications `EnlevementService.java`

```java
// Ajout dans EnlevementService

private final TransactionGenerationService transactionGenerationService;

// Modification de createEnlevement
public EnlevementDTO createEnlevement(CreateEnlevementRequest request, String createdBy) {
    // ... code existant de création de l'enlèvement ...
    
    // Générer automatiquement les transactions comptables
    transactionGenerationService.generateTransactionsFromEnlevement(savedEnlevement);
    
    return enlevementMapper.toDTO(savedEnlevement);
}
```

### 7. Modifications `TransactionGenerationService.java`

```java
// Modification pour générer recette PRESTATION au lieu de vente

public void generateTransactionsFromEnlevement(Enlevement enlevement) {
    log.info("Génération des transactions pour l'enlèvement {}", enlevement.getNumeroEnlevement());
    
    // Supprimer les transactions existantes liées à cet enlèvement
    transactionRepository.deleteByEnlevementIdAndSource(
        enlevement.getId(), 
        Transaction.SourceTransaction.AUTO_ENLEVEMENT
    );
    
    // Parcourir tous les items de l'enlèvement
    for (PickupItem item : enlevement.getItems()) {
        // Générer transaction DEPENSE (achat) si valorisable
        if (PickupItem.TypeDechet.RECYCLABLE.equals(item.getTypeDechet()) 
                && item.getMontantAchatMad() != null 
                && item.getMontantAchatMad().compareTo(BigDecimal.ZERO) > 0) {
            createTransaction(
                Transaction.TypeTransaction.DEPENSE,
                item.getMontantAchatMad(),
                enlevement.getDateEnlevement(),
                String.format("Achat déchets %s - Enlèvement %s", 
                    item.getSousType(), enlevement.getNumeroEnlevement()),
                "Achat déchets valorisables",
                enlevement.getSociete(),
                enlevement,
                item,
                null // pas de type recette pour dépense
            );
        }
        
        // Générer transaction DEPENSE (traitement) si banal
        if ((PickupItem.TypeDechet.BANAL.equals(item.getTypeDechet()) 
                || PickupItem.TypeDechet.A_DETRUIRE.equals(item.getTypeDechet()))
                && item.getMontantTraitementMad() != null 
                && item.getMontantTraitementMad().compareTo(BigDecimal.ZERO) > 0) {
            createTransaction(
                Transaction.TypeTransaction.DEPENSE,
                item.getMontantTraitementMad(),
                enlevement.getDateEnlevement(),
                String.format("Traitement déchets %s - Enlèvement %s", 
                    item.getTypeDechet(), enlevement.getNumeroEnlevement()),
                "Coût traitement déchets",
                enlevement.getSociete(),
                enlevement,
                item,
                null
            );
        }
        
        // Générer transaction RECETTE PRESTATION si applicable
        if (item.getMontantPrestationMad() != null 
                && item.getMontantPrestationMad().compareTo(BigDecimal.ZERO) > 0) {
            createTransaction(
                Transaction.TypeTransaction.RECETTE,
                item.getMontantPrestationMad(),
                enlevement.getDateEnlevement(),
                String.format("Prestation d'enlèvement %s - Enlèvement %s", 
                    item.getSousType() != null ? item.getSousType() : item.getTypeDechet(), 
                    enlevement.getNumeroEnlevement()),
                "Prestation d'enlèvement",
                enlevement.getSociete(),
                enlevement,
                item,
                Transaction.TypeRecette.PRESTATION
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
        PickupItem pickupItem,
        Transaction.TypeRecette typeRecette) {
    
    Transaction transaction = Transaction.builder()
        .type(type)
        .montant(montant)
        .dateTransaction(dateTransaction)
        .description(description)
        .categorie(categorie)
        .societe(societe)
        .enlevement(enlevement)
        .pickupItem(pickupItem)
        .typeRecette(typeRecette)
        .source(Transaction.SourceTransaction.AUTO_ENLEVEMENT)
        .statut(Transaction.StatutTransaction.EN_ATTENTE)
        .build();
    
    return transactionRepository.save(transaction);
}
```

---

## 📝 DTOs À CRÉER

### `CreateVenteRequest.java`

```java
package ma.iorecycling.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateVenteRequest {
    @NotNull(message = "La date de vente est obligatoire")
    private LocalDate dateVente;
    
    private Long acheteurId;
    private String acheteurNom;
    private String observation;
    
    @NotEmpty(message = "Au moins un item est requis")
    @Valid
    private List<CreateVenteItemRequest> items;
}
```

### `CreateVenteItemRequest.java`

```java
package ma.iorecycling.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateVenteItemRequest {
    private Long pickupItemId; // Optionnel si regroupement
    
    @NotNull(message = "Le type de déchet est obligatoire")
    private String typeDechet;
    
    private String sousType;
    
    @NotNull(message = "La quantité vendue est obligatoire")
    @Positive(message = "La quantité doit être positive")
    private BigDecimal quantiteVendueKg;
    
    @NotNull(message = "Le prix de vente unitaire est obligatoire")
    @DecimalMin(value = "0.01", message = "Le prix doit être supérieur à 0")
    private BigDecimal prixVenteUnitaireMad;
}
```

### `StockDisponibleDTO.java`

```java
package ma.iorecycling.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class StockDisponibleDTO {
    private Long pickupItemId;
    private Long enlevementId;
    private String numeroEnlevement;
    private String typeDechet;
    private String sousType;
    private BigDecimal quantiteRecupereeKg;
    private BigDecimal quantiteVendueKg;
    private BigDecimal resteAVendreKg;
    private String statutStock; // NON_VENDU, PARTIELLEMENT_VENDU, VENDU
}
```

---

## 🎨 MODIFICATIONS FRONTEND ANGULAR

### 1. Modèle TypeScript : `vente.model.ts` (Nouveau)

```typescript
export interface Vente {
  id: number;
  numeroVente: string;
  dateVente: string;
  acheteurId?: number;
  acheteurNom?: string;
  observation?: string;
  statut: 'BROUILLON' | 'VALIDEE' | 'ANNULEE';
  items: VenteItem[];
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VenteItem {
  id: number;
  venteId: number;
  pickupItemId?: number;
  typeDechet: string;
  sousType?: string;
  quantiteVendueKg: number;
  prixVenteUnitaireMad: number;
  montantVenteMad: number;
}

export interface CreateVenteRequest {
  dateVente: string;
  acheteurId?: number;
  acheteurNom?: string;
  observation?: string;
  items: CreateVenteItemRequest[];
}

export interface CreateVenteItemRequest {
  pickupItemId?: number;
  typeDechet: string;
  sousType?: string;
  quantiteVendueKg: number;
  prixVenteUnitaireMad: number;
}

export interface StockDisponible {
  pickupItemId: number;
  enlevementId: number;
  numeroEnlevement: string;
  typeDechet: string;
  sousType?: string;
  quantiteRecupereeKg: number;
  quantiteVendueKg: number;
  resteAVendreKg: number;
  statutStock: 'NON_VENDU' | 'PARTIELLEMENT_VENDU' | 'VENDU';
}
```

### 2. Modèle TypeScript : `enlevement.model.ts` - Modifications

```typescript
export interface PickupItem {
  // ... champs existants ...
  
  // Nouveaux champs
  prixPrestationMad?: number;
  montantPrestationMad?: number;
  prixAchatMad?: number;
  montantAchatMad?: number;
  prixTraitementMad?: number;
  montantTraitementMad?: number;
  quantiteVendueKg?: number;
  resteAVendreKg?: number;
  statutStock?: 'NON_VENDU' | 'PARTIELLEMENT_VENDU' | 'VENDU';
}
```

### 3. Modèle TypeScript : `comptabilite.model.ts` - Modifications

```typescript
export interface Transaction {
  // ... champs existants ...
  typeRecette?: 'PRESTATION' | 'VENTE_MATIERE';
  venteItemId?: number;
}
```

### 4. Service : `vente.service.ts` (Nouveau)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vente, CreateVenteRequest, StockDisponible } from '../models/vente.model';

@Injectable({
  providedIn: 'root'
})
export class VenteService {
  private apiUrl = '/api/admin/ventes';

  constructor(private http: HttpClient) {}

  createVente(request: CreateVenteRequest): Observable<Vente> {
    return this.http.post<Vente>(this.apiUrl, request);
  }

  validerVente(venteId: number): Observable<Vente> {
    return this.http.post<Vente>(`${this.apiUrl}/${venteId}/valider`, {});
  }

  getStocksDisponibles(societeId?: number, typeDechet?: string, sousType?: string): Observable<StockDisponible[]> {
    let params = new HttpParams();
    if (societeId) params = params.set('societeId', societeId.toString());
    if (typeDechet) params = params.set('typeDechet', typeDechet);
    if (sousType) params = params.set('sousType', sousType);
    
    return this.http.get<StockDisponible[]>(`${this.apiUrl}/stocks`, { params });
  }

  getAllVentes(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }
}
```

---

## 📋 CHECKLIST IMPLÉMENTATION

### Backend
- [ ] Migration SQL V18 créée et testée
- [ ] Entités Java créées (Vente, VenteItem)
- [ ] Entités Java modifiées (PickupItem, Transaction)
- [ ] Service VenteService créé
- [ ] Service TransactionGenerationService modifié
- [ ] DTOs créés
- [ ] Controllers créés/modifiés
- [ ] Repositories créés
- [ ] Tests unitaires écrits
- [ ] Tests d'intégration écrits

### Frontend
- [ ] Modèles TypeScript créés/modifiés
- [ ] Service vente.service.ts créé
- [ ] Composant stocks-disponibles créé
- [ ] Composant vente-form créé
- [ ] Composant ventes-list créé
- [ ] Formulaire enlèvement modifié (prix prestation)
- [ ] Dashboard comptabilité modifié (distinction CA)
- [ ] Tests composants écrits

---

**Fin des spécifications techniques V2**

