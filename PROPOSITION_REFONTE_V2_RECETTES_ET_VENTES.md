# 📋 PROPOSITION DE REFONTE FONCTIONNELLE V2
## IORecycling - Gestion des Recettes (Prestation + Vente) et Module Vente

**Date** : 2024  
**Auteur** : Product Owner Senior  
**Version** : 2.0

---

## 🎯 OBJECTIF GLOBAL

Refondre l'application pour gérer **deux types de recettes distincts** :
1. **Recette Prestation** : Liée à l'enlèvement (peut être générée dès l'enlèvement, y compris pour déchets banals)
2. **Recette Vente Matière** : Générée lors de la vente effective de déchets (tout type de déchet peut être vendu)

Et ajouter un **module Vente** pour suivre les quantités de déchets achetées/récupérées, vendues et restantes.

---

## 📊 PRINCIPES MÉTIER FONDAMENTAUX

### 1. Les Deux Types de Recettes

#### **RECETTE PRESTATION** 💼
- **Nature** : Facturation de la prestation d'enlèvement au client
- **Déclencheur** : Validation de l'enlèvement
- **Applicabilité** : Tous les types de déchets (valorisable, banal, à détruire)
- **Calcul** : Peut être forfaitaire, au poids, ou selon formule métier
- **Impact CA** : ✅ Oui (chiffre d'affaires prestation)
- **Exemple** : "Prestation d'enlèvement de 500 kg de déchets : 1 200 MAD"

#### **RECETTE VENTE MATIÈRE** 📦
- **Nature** : Vente effective de déchets à un recycleur/acheteur
- **Déclencheur** : Saisie d'une vente dans le module Vente
- **Applicabilité** : Tous les types de déchets peuvent être vendus
- **Calcul** : Quantité vendue × Prix de vente unitaire
- **Impact CA** : ✅ Oui (chiffre d'affaires vente matière)
- **Exemple** : "Vente de 150 kg de carton à 2,50 MAD/kg : 375 MAD"

### 2. Distinction CA Prestation vs CA Vente

**Chiffre d'Affaires Total = CA Prestation + CA Vente Matière**

- **CA Prestation** : Somme des recettes prestation générées depuis les enlèvements
- **CA Vente Matière** : Somme des recettes vente matière générées depuis les ventes
- **Pas de double comptage** : Une même quantité ne peut générer qu'une seule recette vente matière

### 3. Flux de Génération Comptable depuis l'Enlèvement

```
ENLÈVEMENT SAISI
    ↓
VALIDATION ENLÈVEMENT
    ↓
GÉNÉRATION AUTOMATIQUE DES TRANSACTIONS
    ├─ Transaction DEPENSE (paiement au client si applicable)
    │   └─ Pour items valorisables : achat des déchets
    │
    └─ Transaction RECETTE PRESTATION (si applicable)
        └─ Facturation de la prestation d'enlèvement
            (peut être pour tous types de déchets)
    ↓
COMPTABILITÉ ALIMENTÉE (Prestation)
```

**Note** : La recette vente matière n'est PAS générée à l'enlèvement. Elle sera générée plus tard lors de la vente effective dans le module Vente.

### 4. Module Vente - Suivi des Stocks

**Concept** : Chaque item d'enlèvement (ou regroupement par type/sous-type) crée un "stock" de déchets disponibles à la vente.

**Quantités suivies** :
- **Quantité récupérée** : Quantité totale récupérée lors des enlèvements
- **Quantité vendue** : Quantité totale vendue à des acheteurs
- **Reste à vendre** : Quantité récupérée - Quantité vendue

**Statuts** :
- **NON_VENDU** : Aucune quantité vendue (reste à vendre = quantité récupérée)
- **PARTIELLEMENT_VENDU** : Une partie a été vendue (0 < reste à vendre < quantité récupérée)
- **VENDU** : Tout a été vendu (reste à vendre = 0)

---

## 🗄️ STRUCTURE DE DONNÉES

### 1. Table `pickup_item` - Modifications

**Champs à ajouter/modifier** :

```sql
-- Pour tous les types de déchets : recette prestation
ALTER TABLE pickup_item ADD COLUMN prix_prestation_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN montant_prestation_mad DECIMAL(12, 2);

-- Pour les déchets VALORISABLES : achat au client
ALTER TABLE pickup_item ADD COLUMN prix_achat_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN montant_achat_mad DECIMAL(12, 2);

-- Pour les déchets BANALS/A_DETRUIRE : coût de traitement
ALTER TABLE pickup_item ADD COLUMN prix_traitement_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN montant_traitement_mad DECIMAL(12, 2);

-- Suivi des quantités pour la vente
ALTER TABLE pickup_item ADD COLUMN quantite_vendue_kg DECIMAL(10, 3) DEFAULT 0;
ALTER TABLE pickup_item ADD COLUMN reste_a_vendre_kg DECIMAL(10, 3);
-- reste_a_vendre_kg = quantite_kg - quantite_vendue_kg (calculé automatiquement)
```

### 2. Nouvelle Table `vente` - Module Vente

```sql
CREATE TABLE vente (
    id BIGSERIAL PRIMARY KEY,
    numero_vente VARCHAR(50) UNIQUE,
    date_vente DATE NOT NULL,
    acheteur_id BIGINT, -- Référence vers une table acheteur (ou société)
    acheteur_nom VARCHAR(200),
    observation TEXT,
    statut VARCHAR(20) DEFAULT 'BROUILLON' CHECK (statut IN ('BROUILLON', 'VALIDEE', 'ANNULEE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE INDEX idx_vente_date ON vente(date_vente);
CREATE INDEX idx_vente_statut ON vente(statut);
```

### 3. Nouvelle Table `vente_item` - Lignes de vente

```sql
CREATE TABLE vente_item (
    id BIGSERIAL PRIMARY KEY,
    vente_id BIGINT NOT NULL REFERENCES vente(id) ON DELETE CASCADE,
    pickup_item_id BIGINT REFERENCES pickup_item(id) ON DELETE SET NULL,
    -- Ou référence directe vers type/sous-type si regroupement
    type_dechet VARCHAR(20) NOT NULL,
    sous_type VARCHAR(50),
    quantite_vendue_kg DECIMAL(10, 3) NOT NULL CHECK (quantite_vendue_kg > 0),
    prix_vente_unitaire_mad DECIMAL(10, 3) NOT NULL CHECK (prix_vente_unitaire_mad > 0),
    montant_vente_mad DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vente_id) REFERENCES vente(id) ON DELETE CASCADE
);

CREATE INDEX idx_vente_item_vente ON vente_item(vente_id);
CREATE INDEX idx_vente_item_pickup ON vente_item(pickup_item_id);
```

### 4. Table `transaction` - Distinction type recette

```sql
-- Ajout d'un champ pour distinguer le type de recette
ALTER TABLE transaction ADD COLUMN type_recette VARCHAR(20);
-- Valeurs possibles : 'PRESTATION', 'VENTE_MATIERE', NULL (pour dépenses)

-- Lien vers vente_item pour les recettes vente matière
ALTER TABLE transaction ADD COLUMN vente_item_id BIGINT;
ALTER TABLE transaction ADD CONSTRAINT fk_transaction_vente_item 
    FOREIGN KEY (vente_item_id) REFERENCES vente_item(id) ON DELETE SET NULL;
```

---

## 🔄 FLUX FONCTIONNEL DÉTAILLÉ

### FLUX 1 : Saisie et Validation d'un Enlèvement

#### Étape 1 : Informations générales
- Date, heure, site, société, camion, destination, etc.
- **Pas de changement** par rapport à l'existant

#### Étape 2 : Saisie des items avec informations financières

**Pour un item VALORISABLE** :
```
┌─────────────────────────────────────────────────┐
│ Type de déchet : [RECYCLABLE ▼]                │
│ Sous-type : [CARTON ▼]                         │
│ Quantité : [150] kg                            │
│                                                 │
│ 💰 FINANCIER                                    │
│                                                 │
│ PRESTATION :                                    │
│ Prix prestation (MAD/kg) : [2.00]             │
│ → Montant prestation : 300,00 MAD              │
│                                                 │
│ ACHAT AU CLIENT :                               │
│ Prix achat (MAD/kg) : [1.20]                  │
│ → Montant achat : 180,00 MAD                    │
│                                                 │
│ STOCK :                                         │
│ Quantité récupérée : 150 kg                    │
│ Reste à vendre : 150 kg (NON_VENDU)            │
└─────────────────────────────────────────────────┘
```

**Pour un item BANAL** :
```
┌─────────────────────────────────────────────────┐
│ Type de déchet : [BANAL ▼]                     │
│ Quantité : [450] kg                            │
│                                                 │
│ 💰 FINANCIER                                    │
│                                                 │
│ PRESTATION :                                    │
│ Prix prestation (MAD/kg) : [1.50]             │
│ → Montant prestation : 675,00 MAD              │
│                                                 │
│ TRAITEMENT :                                    │
│ Prix traitement (MAD/kg) : [0.30]             │
│ → Montant traitement : 135,00 MAD              │
│                                                 │
│ STOCK :                                         │
│ Quantité récupérée : 450 kg                    │
│ Reste à vendre : 450 kg (NON_VENDU)            │
│ Note : Les déchets banals peuvent aussi être    │
│        vendus (ex: valorisation énergétique)   │
└─────────────────────────────────────────────────┘
```

#### Étape 3 : Récapitulatif avant validation

```
┌─────────────────────────────────────────────────┐
│ RÉCAPITULATIF DE L'ENLÈVEMENT                   │
├─────────────────────────────────────────────────┤
│ 📦 ITEMS SAISIS                                 │
│                                                 │
│ VALORISABLES :                                  │
│ • CARTON : 150 kg                               │
│   Prestation : 300 MAD | Achat : 180 MAD       │
│                                                 │
│ • PLASTIQUE : 80 kg                             │
│   Prestation : 160 MAD | Achat : 120 MAD       │
│                                                 │
│ BANALS :                                        │
│ • BANAL : 450 kg                                 │
│   Prestation : 675 MAD | Traitement : 135 MAD  │
│                                                 │
│ 💰 TOTAUX FINANCIERS                           │
│ • Total prestation : 1 135,00 MAD              │
│ • Total achat : 300,00 MAD                      │
│ • Total traitement : 135,00 MAD                │
│ • Bilan net : 700,00 MAD                        │
│                                                 │
│ 📦 STOCKS CRÉÉS                                 │
│ • CARTON : 150 kg (à vendre)                   │
│ • PLASTIQUE : 80 kg (à vendre)                 │
│ • BANAL : 450 kg (à vendre)                    │
│                                                 │
│ [✓] Générer automatiquement les transactions   │
│     comptables (dépense + recette prestation)   │
│                                                 │
│ [Valider l'enlèvement]                         │
└─────────────────────────────────────────────────┘
```

#### Étape 4 : Validation et génération automatique

**Actions système automatiques** :
1. Sauvegarde de l'enlèvement
2. Pour chaque item :
   - Si prix achat > 0 (valorisable) : Création Transaction DEPENSE (achat)
   - Si prix traitement > 0 (banal) : Création Transaction DEPENSE (traitement)
   - Si prix prestation > 0 : Création Transaction RECETTE PRESTATION
3. Création des stocks (quantité récupérée = quantité item, reste à vendre = quantité item)
4. Affichage confirmation :
   ```
   ✅ Enlèvement validé
   ✅ 3 transactions générées :
      - 1 DEPENSE (achat)
      - 1 DEPENSE (traitement)
      - 1 RECETTE PRESTATION
   ✅ Stocks créés pour vente
   ```

### FLUX 2 : Module Vente - Saisie d'une Vente

#### Étape 1 : Consultation des stocks disponibles

**Écran "À vendre / Non vendu"** :
```
┌─────────────────────────────────────────────────┐
│ STOCKS DISPONIBLES À LA VENTE                  │
│ (Reste à vendre > 0)                            │
├─────────────────────────────────────────────────┤
│ Filtres : [Type déchet ▼] [Sous-type ▼]        │
│                                                 │
│ Tableau :                                       │
│ ┌──────────┬──────────┬──────┬──────┬────────┐│
│ │Type      │Sous-type │Récup │Vendu │Reste   ││
│ ├──────────┼──────────┼──────┼──────┼────────┤│
│ │RECYCLABLE│CARTON    │ 150  │  0   │ 150    ││
│ │          │          │      │      │NON_VENDU│
│ ├──────────┼──────────┼──────┼──────┼────────┤│
│ │RECYCLABLE│PLASTIQUE │ 80   │  0   │ 80     ││
│ │          │          │      │      │NON_VENDU│
│ ├──────────┼──────────┼──────┼──────┼────────┤│
│ │BANAL     │-         │ 450  │  0   │ 450    ││
│ │          │          │      │      │NON_VENDU│
│ └──────────┴──────────┴──────┴──────┴────────┘│
│                                                 │
│ [➕ Nouvelle vente]                            │
└─────────────────────────────────────────────────┘
```

#### Étape 2 : Création d'une vente

**Formulaire de vente** :
```
┌─────────────────────────────────────────────────┐
│ NOUVELLE VENTE                                  │
├─────────────────────────────────────────────────┤
│ Date de vente : [15/12/2024]                   │
│ Acheteur : [Recycleur ABC ▼]                   │
│ Observation : [________________]                │
│                                                 │
│ 📦 LIGNES DE VENTE                              │
│                                                 │
│ Ligne 1 :                                       │
│ Type : [RECYCLABLE ▼]                         │
│ Sous-type : [CARTON ▼]                        │
│ Quantité disponible : 150 kg                    │
│ Quantité à vendre : [100] kg                   │
│ Prix de vente (MAD/kg) : [2.50]                │
│ → Montant : 250,00 MAD                         │
│                                                 │
│ [➕ Ajouter une ligne]                          │
│                                                 │
│ 💰 TOTAL VENTE : 250,00 MAD                    │
│                                                 │
│ [Enregistrer en brouillon] [Valider la vente]  │
└─────────────────────────────────────────────────┘
```

#### Étape 3 : Validation de la vente

**Actions système automatiques** :
1. Vérification des stocks disponibles (quantité à vendre ≤ reste à vendre)
2. Mise à jour des stocks :
   - `quantite_vendue_kg` += quantité vendue
   - `reste_a_vendre_kg` -= quantité vendue
   - Mise à jour du statut (NON_VENDU → PARTIELLEMENT_VENDU ou VENDU)
3. Génération Transaction RECETTE VENTE MATIÈRE :
   - Type : RECETTE
   - Type recette : VENTE_MATIERE
   - Montant : Montant total de la vente
   - Lien vers `vente_item`
4. Affichage confirmation :
   ```
   ✅ Vente validée
   ✅ 1 transaction RECETTE VENTE MATIÈRE générée
   ✅ Stocks mis à jour :
      - CARTON : 100 kg vendus, 50 kg restants
   ```

### FLUX 3 : Consultation Comptabilité avec Distinction

#### Dashboard Comptabilité

```
┌─────────────────────────────────────────────────┐
│ COMPTABILITÉ                                    │
├─────────────────────────────────────────────────┤
│ Filtres : [Société ▼] [Période ▼] [Type ▼]     │
│                                                 │
│ 📊 INDICATEURS                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ CA PRESTATION : 5 000 MAD                  │ │
│ │ CA VENTE MATIÈRE : 3 500 MAD              │ │
│ │ CA TOTAL : 8 500 MAD                       │ │
│ │ Dépenses : 2 000 MAD                       │ │
│ │ Bilan Net : 6 500 MAD                      │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 📋 TRANSACTIONS                                 │
│                                                 │
│ Onglets : [Toutes] [Prestation] [Vente] [Dépenses]│
│                                                 │
│ Tableau (onglet "Toutes") :                     │
│ ┌──────┬──────┬──────────────┬────────┬──────┐ │
│ │ Date │ Type│ Description   │ Montant│Type  │ │
│ ├──────┼──────┼──────────────┼────────┼──────┤ │
│ │15/12 │ REC  │ Prestation   │ 1 135  │PREST │ │
│ │      │      │ ENL-2024-001 │        │      │ │
│ │16/12 │ REC  │ Vente Carton │  250   │VENTE │ │
│ │      │      │ VENT-2024-001│        │      │ │
│ │15/12 │ DEP  │ Achat Carton │  180   │-     │ │
│ │      │      │ ENL-2024-001 │        │      │ │
│ └──────┴──────┴──────────────┴────────┴──────┘ │
│                                                 │
│ Légende :                                       │
│ PREST = Recette Prestation                      │
│ VENTE = Recette Vente Matière                  │
└─────────────────────────────────────────────────┘
```

### FLUX 4 : Suivi Financier Client avec Distinction

#### Dashboard Client

```
┌─────────────────────────────────────────────────┐
│ SUIVI FINANCIER - SOCIÉTÉ XYZ                  │
├─────────────────────────────────────────────────┤
│ Période : [01/01/2024] - [31/12/2024] [🔍]     │
│                                                 │
│ 📊 SYNTHÈSE GLOBALE                             │
│ ┌─────────────────────────────────────────────┐ │
│ │ CA PRESTATION : 12 500 MAD                │ │
│ │ CA VENTE MATIÈRE : 8 000 MAD             │ │
│ │ CA TOTAL : 20 500 MAD                     │ │
│ │ Dépenses : 5 000 MAD                       │ │
│ │ Marge : 15 500 MAD                         │ │
│ │ Bilan Net : 15 500 MAD                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 📋 DÉTAIL PAR ENLÈVEMENT                        │
│                                                 │
│ Tableau :                                       │
│ ┌──────┬──────────┬──────────┬──────────┬──────┐│
│ │ Date │ Enlèv.   │ Prestation│ Achat │ Trait││
│ ├──────┼──────────┼──────────┼──────────┼──────┤│
│ │15/12 │ENL-001   │ 1 135    │ 300     │ 135  ││
│ │20/12 │ENL-002   │ 850      │ 200     │ 80   ││
│ ├──────┼──────────┼──────────┼──────────┼──────┤│
│ │      │ TOTAL    │ 1 985    │ 500     │ 215  ││
│ └──────┴──────────┴──────────┴──────────┴──────┘│
│                                                 │
│ 📦 VENTES DE MATIÈRES                           │
│                                                 │
│ Tableau :                                       │
│ ┌──────┬──────────┬──────────┬──────────┬──────┐│
│ │ Date │ Vente    │ Type     │ Quantité │Montant││
│ ├──────┼──────────┼──────────┼──────────┼──────┤│
│ │16/12 │VENT-001  │ CARTON   │ 100 kg   │ 250  ││
│ │18/12 │VENT-002  │ PLASTIQUE│ 50 kg   │ 200  ││
│ ├──────┼──────────┼──────────┼──────────┼──────┤│
│ │      │ TOTAL    │          │ 150 kg   │ 450  ││
│ └──────┴──────────┴──────────┴──────────┴──────┘│
│                                                 │
│ [📥 Exporter en Excel]                          │
└─────────────────────────────────────────────────┘
```

---

## 🎨 REDESIGN DES ÉCRANS

### ÉCRAN 1 : Formulaire d'Enlèvement (Refondu)

#### Section Items avec Prestation

```
┌─────────────────────────────────────────────────┐
│ ITEM 1                                          │
├─────────────────────────────────────────────────┤
│ Type de déchet : [RECYCLABLE ▼]               │
│ Sous-type : [CARTON ▼]                        │
│ Quantité : [150] kg                            │
│                                                 │
│ 💰 PRESTATION D'ENLÈVEMENT                      │
│ Prix prestation (MAD/kg) : [2.00]             │
│ → Montant prestation : 300,00 MAD              │
│                                                 │
│ 💰 ACHAT AU CLIENT (si valorisable)            │
│ Prix achat (MAD/kg) : [1.20]                  │
│ → Montant achat : 180,00 MAD                    │
│                                                 │
│ 📦 STOCK POUR VENTE                             │
│ Quantité récupérée : 150 kg                    │
│ Statut : NON_VENDU                             │
└─────────────────────────────────────────────────┘
```

### ÉCRAN 2 : Module Vente - Liste des Stocks

```
┌─────────────────────────────────────────────────┐
│ STOCKS DISPONIBLES À LA VENTE                  │
├─────────────────────────────────────────────────┤
│ Filtres :                                       │
│ [Type ▼] [Sous-type ▼] [Statut ▼] [Recherche] │
│                                                 │
│ Tableau :                                       │
│ ┌──────────┬──────────┬──────┬──────┬──────────┐│
│ │Type      │Sous-type │Récup │Vendu │Reste     ││
│ │          │          │      │      │Statut    ││
│ ├──────────┼──────────┼──────┼──────┼──────────┤│
│ │RECYCLABLE│CARTON    │ 150  │  0   │ 150      ││
│ │          │          │      │      │NON_VENDU ││
│ │          │          │      │      │[Vendre]  ││
│ ├──────────┼──────────┼──────┼──────┼──────────┤│
│ │RECYCLABLE│PLASTIQUE │ 80   │ 30   │ 50       ││
│ │          │          │      │      │PART_VENDU││
│ │          │          │      │      │[Vendre]  ││
│ ├──────────┼──────────┼──────┼──────┼──────────┤│
│ │BANAL     │-         │ 450  │ 450  │ 0        ││
│ │          │          │      │      │VENDU     ││
│ └──────────┴──────────┴──────┴──────┴──────────┘│
│                                                 │
│ [➕ Nouvelle vente]                            │
│ [📊 Statistiques]                              │
└─────────────────────────────────────────────────┘
```

### ÉCRAN 3 : Formulaire de Vente

```
┌─────────────────────────────────────────────────┐
│ NOUVELLE VENTE                                  │
├─────────────────────────────────────────────────┤
│ Informations générales :                        │
│ Date : [15/12/2024]                            │
│ Acheteur : [Recycleur ABC ▼]                  │
│ Observation : [________________]               │
│                                                 │
│ 📦 LIGNES DE VENTE                              │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Ligne 1                                     │ │
│ │ Type : [RECYCLABLE ▼]                      │ │
│ │ Sous-type : [CARTON ▼]                    │ │
│ │ Stock disponible : 150 kg                  │ │
│ │ Quantité à vendre : [100] kg               │ │
│ │ Prix unitaire (MAD/kg) : [2.50]           │ │
│ │ → Montant : 250,00 MAD                    │ │
│ │ [🗑️ Supprimer]                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [➕ Ajouter une ligne]                         │
│                                                 │
│ 💰 TOTAL VENTE : 250,00 MAD                    │
│                                                 │
│ [Enregistrer brouillon] [Valider la vente]     │
└─────────────────────────────────────────────────┘
```

### ÉCRAN 4 : Dashboard Comptabilité (Refondu)

```
┌─────────────────────────────────────────────────┐
│ COMPTABILITÉ                                    │
├─────────────────────────────────────────────────┤
│ 📊 INDICATEURS                                  │
│ ┌──────────────┬──────────────┬──────────────┐│
│ │ CA Prestation│ CA Vente     │ CA Total     ││
│ │ 5 000 MAD    │ 3 500 MAD    │ 8 500 MAD    ││
│ └──────────────┴──────────────┴──────────────┘│
│                                                 │
│ 📋 TRANSACTIONS                                 │
│ [Toutes] [Prestation] [Vente Matière] [Dépenses]│
│                                                 │
│ Tableau :                                       │
│ ┌──────┬──────┬──────────────┬────────┬──────┐ │
│ │ Date │ Type│ Description   │ Montant│Type  │ │
│ ├──────┼──────┼──────────────┼────────┼──────┤ │
│ │15/12 │ REC  │ Prestation   │ 1 135  │PREST │ │
│ │16/12 │ REC  │ Vente Carton │  250   │VENTE │ │
│ │15/12 │ DEP  │ Achat        │  180   │-     │ │
│ └──────┴──────┴──────────────┴────────┴──────┘ │
└─────────────────────────────────────────────────┘
```

---

## 🔐 RÈGLES DE GESTION

### Règle 1 : Génération Recette Prestation

- **Déclencheur** : Validation de l'enlèvement
- **Condition** : `prix_prestation_mad > 0` pour au moins un item
- **Calcul** : Par item ou forfaitaire selon configuration
- **Applicabilité** : Tous types de déchets

### Règle 2 : Génération Recette Vente Matière

- **Déclencheur** : Validation d'une vente dans le module Vente
- **Condition** : Quantité à vendre ≤ reste à vendre disponible
- **Calcul** : Quantité vendue × Prix de vente unitaire
- **Mise à jour stock** : Automatique lors de la validation

### Règle 3 : Gestion des Stocks

- **Création** : Automatique à la validation d'un enlèvement
- **Mise à jour** : Automatique à chaque vente
- **Statut** : Calculé automatiquement selon reste à vendre
- **Contrainte** : Impossible de vendre plus que le stock disponible

### Règle 4 : Distinction CA

- **CA Prestation** : Somme des recettes prestation (source = enlèvement)
- **CA Vente Matière** : Somme des recettes vente matière (source = vente)
- **Pas de double comptage** : Chaque quantité vendue génère une seule recette vente matière

### Règle 5 : Traçabilité

- Chaque recette prestation est liée à un enlèvement
- Chaque recette vente matière est liée à une vente et aux items d'enlèvement source
- Possibilité de remonter de la vente aux enlèvements d'origine

---

## 📝 CAS D'USAGE DÉTAILLÉS

### Cas d'usage 1 : Enlèvement avec Prestation

**Scénario** :
- Enlèvement de 500 kg de déchets banals
- Prix prestation : 1,50 MAD/kg
- Prix traitement : 0,30 MAD/kg

**Résultat** :
- Transaction DEPENSE : Traitement (150 MAD)
- Transaction RECETTE PRESTATION : 750 MAD
- Stock créé : 500 kg (NON_VENDU)
- Bilan net : 600 MAD

### Cas d'usage 2 : Vente Partielle

**Scénario** :
- Stock disponible : 150 kg de CARTON (NON_VENDU)
- Vente de 100 kg à 2,50 MAD/kg

**Résultat** :
- Transaction RECETTE VENTE MATIÈRE : 250 MAD
- Stock mis à jour : 50 kg restants (PARTIELLEMENT_VENDU)
- Statut : NON_VENDU → PARTIELLEMENT_VENDU

### Cas d'usage 3 : Vente Complète

**Scénario** :
- Stock disponible : 80 kg de PLASTIQUE (PARTIELLEMENT_VENDU, 30 kg déjà vendus)
- Vente des 50 kg restants à 4,00 MAD/kg

**Résultat** :
- Transaction RECETTE VENTE MATIÈRE : 200 MAD
- Stock mis à jour : 0 kg restants (VENDU)
- Statut : PARTIELLEMENT_VENDU → VENDU

### Cas d'usage 4 : Dashboard avec Distinction CA

**Scénario** :
- Période : Janvier 2024
- 10 enlèvements → CA Prestation : 12 500 MAD
- 5 ventes → CA Vente Matière : 8 000 MAD

**Résultat** :
- CA Total : 20 500 MAD
- Affichage distinct des deux types de CA
- Pas de double comptage

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Les enlèvements génèrent automatiquement dépense + recette prestation
- [ ] La recette prestation peut être générée pour tous types de déchets
- [ ] Le module Vente permet de vendre des déchets
- [ ] Les stocks sont suivis (récupéré, vendu, reste à vendre)
- [ ] Les statuts sont calculés automatiquement (NON_VENDU, PARTIELLEMENT_VENDU, VENDU)
- [ ] L'écran "À vendre / Non vendu" affiche les stocks disponibles
- [ ] Les dashboards distinguent CA Prestation vs CA Vente Matière
- [ ] Pas de double comptage entre prestation et vente
- [ ] Traçabilité complète (vente → enlèvements source)

---

## 📌 NOTES IMPORTANTES

1. **Séparation claire** : Prestation (service) vs Vente Matière (produit)
2. **Stocks** : Gérés au niveau item ou regroupés par type/sous-type selon choix métier
3. **Prix** : Les prix de vente matière peuvent varier selon l'acheteur et la date
4. **Flexibilité** : Possibilité de vendre partiellement ou totalement un stock
5. **Audit** : Traçabilité complète nécessaire pour la comptabilité

---

**Fin du document**

