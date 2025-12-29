# 📋 PROPOSITION DE REFONTE FONCTIONNELLE
## IORecycling - Enlèvements comme Source Unique de Vérité Financière

**Date** : 2024  
**Auteur** : Product Owner Senior  
**Version** : 1.0

---

## 🎯 OBJECTIF GLOBAL

Refondre l'application pour que **l'ENLÈVEMENT soit la source unique de vérité financière**, avec génération automatique des écritures comptables et distinction claire entre déchets valorisables et banals.

---

## 📊 PRINCIPES MÉTIER FONDAMENTAUX

### 1. Distinction Déchets Valorisables vs Banals

#### **Déchets VALORISABLES (RECYCLABLE)**
- **Génèrent un achat ET une vente**
- **Prix d'achat** : Ce que l'entreprise paie au client pour récupérer les déchets
- **Prix de vente** : Ce que l'entreprise revend les déchets à un recycleur
- **Marge** : Prix de vente - Prix d'achat (par ligne et globale)
- **Impact CA** : ✅ Oui (la vente génère du chiffre d'affaires)

#### **Déchets BANALS (BANAL / A_DETRUIRE)**
- **Génèrent uniquement un coût de traitement**
- **Prix de traitement** : Ce que l'entreprise paie pour éliminer les déchets
- **Pas de revenu** : Ces déchets ne génèrent pas de chiffre d'affaires
- **Impact CA** : ❌ Non

### 2. Flux Automatique de Génération Comptable

```
ENLÈVEMENT SAISI
    ↓
VALIDATION ENLÈVEMENT
    ↓
GÉNÉRATION AUTOMATIQUE DES TRANSACTIONS
    ├─ Pour chaque item VALORISABLE :
    │   ├─ Transaction DEPENSE (achat au client)
    │   └─ Transaction RECETTE (vente au recycleur)
    │
    └─ Pour chaque item BANAL/A_DETRUIRE :
        └─ Transaction DEPENSE (coût de traitement)
    ↓
COMPTABILITÉ ALIMENTÉE AUTOMATIQUEMENT
```

### 3. Règles de Calcul

#### Pour un item VALORISABLE :
```
Montant Achat = Quantité (kg) × Prix Achat (MAD/kg)
Montant Vente = Quantité (kg) × Prix Vente (MAD/kg)
Marge Ligne = Montant Vente - Montant Achat
```

#### Pour un item BANAL/A_DETRUIRE :
```
Montant Traitement = Quantité (kg) × Prix Traitement (MAD/kg)
```

#### Pour un enlèvement complet :
```
Total Achat = Σ(Montant Achat) pour tous les items VALORISABLES
Total Vente = Σ(Montant Vente) pour tous les items VALORISABLES
Total Traitement = Σ(Montant Traitement) pour tous les items BANALS/A_DETRUIRE
Marge Globale = Total Vente - Total Achat
Bilan Net = Marge Globale - Total Traitement
```

---

## 🗄️ MODIFICATIONS STRUCTURE DE DONNÉES

### 1. Table `pickup_item` - Ajout des champs financiers

**Champs actuels** (à conserver) :
- `id`, `enlevement_id`, `type_dechet`, `sous_type`
- `quantite_kg`, `unite_mesure`, `etat`
- `prix_unitaire_mad` (à renommer ou adapter)

**Nouveaux champs à ajouter** :

```sql
-- Pour les déchets VALORISABLES uniquement
ALTER TABLE pickup_item ADD COLUMN prix_achat_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN prix_vente_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN montant_achat_mad DECIMAL(12, 2);
ALTER TABLE pickup_item ADD COLUMN montant_vente_mad DECIMAL(12, 2);
ALTER TABLE pickup_item ADD COLUMN marge_mad DECIMAL(12, 2);

-- Pour les déchets BANALS/A_DETRUIRE (renommer prix_unitaire_mad)
-- Le champ prix_unitaire_mad devient prix_traitement_mad pour plus de clarté
ALTER TABLE pickup_item ADD COLUMN prix_traitement_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN montant_traitement_mad DECIMAL(12, 2);
```

**Règles de validation** :
- Si `type_dechet = 'RECYCLABLE'` : `prix_achat_mad` et `prix_vente_mad` obligatoires
- Si `type_dechet IN ('BANAL', 'A_DETRUIRE')` : `prix_traitement_mad` obligatoire
- Calculs automatiques via triggers ou `@PrePersist` :
  - `montant_achat_mad = quantite_kg × prix_achat_mad` (si RECYCLABLE)
  - `montant_vente_mad = quantite_kg × prix_vente_mad` (si RECYCLABLE)
  - `marge_mad = montant_vente_mad - montant_achat_mad` (si RECYCLABLE)
  - `montant_traitement_mad = quantite_kg × prix_traitement_mad` (si BANAL/A_DETRUIRE)

### 2. Table `transaction` - Ajout du champ `source`

```sql
ALTER TABLE transaction ADD COLUMN source VARCHAR(20) DEFAULT 'MANUEL';
-- Valeurs possibles : 'AUTO_ENLEVEMENT', 'MANUEL'
-- 'AUTO_ENLEVEMENT' : Générée automatiquement depuis un enlèvement
-- 'MANUEL' : Saisie manuelle pour cas exceptionnels

ALTER TABLE transaction ADD COLUMN pickup_item_id BIGINT;
-- Lien vers le pickup_item source (pour les transactions auto)
ALTER TABLE transaction ADD CONSTRAINT fk_transaction_pickup_item 
    FOREIGN KEY (pickup_item_id) REFERENCES pickup_item(id) ON DELETE SET NULL;
```

### 3. Nouveau statut pour `enlevement` : `statut_comptable`

```sql
ALTER TABLE enlevement ADD COLUMN statut_comptable VARCHAR(20) DEFAULT 'NON_GENERE';
-- Valeurs possibles :
-- 'NON_GENERE' : Enlèvement saisi mais transactions non générées
-- 'GENERE' : Transactions comptables générées automatiquement
-- 'MODIFIE' : Enlèvement modifié après génération (nécessite régénération)
```

---

## 🔄 FLUX FONCTIONNEL DÉTAILLÉ

### FLUX 1 : Saisie d'un Enlèvement

#### Étape 1 : Saisie des informations générales
- Date, heure, site, société, camion, destination, etc.
- **Pas de changement** par rapport à l'existant

#### Étape 2 : Saisie des items avec distinction financière

**Pour un item VALORISABLE** :
```
┌─────────────────────────────────────────────────┐
│ Type de déchet : [RECYCLABLE ▼]                │
│ Sous-type : [CARTON ▼]                         │
│ Quantité : [150] kg                            │
│                                                 │
│ 💰 FINANCIER                                    │
│ Prix d'achat (MAD/kg) : [1.20]  ← Ce qu'on paie au client
│ Prix de vente (MAD/kg) : [2.50] ← Ce qu'on revend
│                                                 │
│ Calcul automatique :                           │
│ • Montant achat : 180,00 MAD                   │
│ • Montant vente : 375,00 MAD                   │
│ • Marge : 195,00 MAD ✅                        │
└─────────────────────────────────────────────────┘
```

**Pour un item BANAL** :
```
┌─────────────────────────────────────────────────┐
│ Type de déchet : [BANAL ▼]                     │
│ Quantité : [450] kg                            │
│                                                 │
│ 💰 FINANCIER                                    │
│ Prix de traitement (MAD/kg) : [0.30]           │
│                                                 │
│ Calcul automatique :                           │
│ • Montant traitement : 135,00 MAD              │
│ • Impact CA : Aucun (déchet banal)             │
└─────────────────────────────────────────────────┘
```

#### Étape 3 : Récapitulatif avant validation
```
┌─────────────────────────────────────────────────┐
│ RÉCAPITULATIF FINANCIER                        │
├─────────────────────────────────────────────────┤
│ DÉCHETS VALORISABLES                           │
│ • Total achat : 580,00 MAD                     │
│ • Total vente : 1 250,00 MAD                   │
│ • Marge brute : 670,00 MAD                     │
│                                                 │
│ DÉCHETS BANALS                                 │
│ • Total traitement : 135,00 MAD                │
│                                                 │
│ BILAN NET : 535,00 MAD ✅                      │
│                                                 │
│ [ ] Générer automatiquement les transactions   │
│     comptables à la validation                 │
└─────────────────────────────────────────────────┘
```

#### Étape 4 : Validation et génération automatique

**Action utilisateur** : Clic sur "Valider l'enlèvement"

**Actions système automatiques** :
1. Sauvegarde de l'enlèvement avec `statut_comptable = 'GENERE'`
2. Pour chaque item VALORISABLE :
   - Création Transaction DEPENSE (type = 'DEPENSE', montant = montant_achat_mad)
     - Description : "Achat déchets [sous_type] - Enlèvement [numero]"
     - Catégorie : "Achat déchets valorisables"
     - `source = 'AUTO_ENLEVEMENT'`
     - `pickup_item_id = [id item]`
     - `enlevement_id = [id enlèvement]`
   - Création Transaction RECETTE (type = 'RECETTE', montant = montant_vente_mad)
     - Description : "Vente déchets [sous_type] - Enlèvement [numero]"
     - Catégorie : "Vente déchets valorisables"
     - `source = 'AUTO_ENLEVEMENT'`
     - `pickup_item_id = [id item]`
     - `enlevement_id = [id enlèvement]`
3. Pour chaque item BANAL/A_DETRUIRE :
   - Création Transaction DEPENSE (type = 'DEPENSE', montant = montant_traitement_mad)
     - Description : "Traitement déchets [type_dechet] - Enlèvement [numero]"
     - Catégorie : "Coût traitement déchets"
     - `source = 'AUTO_ENLEVEMENT'`
     - `pickup_item_id = [id item]`
     - `enlevement_id = [id enlèvement]`
4. Affichage message de confirmation :
   ```
   ✅ Enlèvement validé
   ✅ 4 transactions comptables générées automatiquement
   ```

### FLUX 2 : Modification d'un Enlèvement Validé

**Scénario** : Un enlèvement a déjà été validé et ses transactions générées.

**Règles** :
1. Si modification d'un item existant :
   - Supprimer les transactions liées à cet item
   - Régénérer les transactions avec les nouveaux montants
2. Si ajout d'un nouvel item :
   - Générer les transactions pour ce nouvel item
3. Si suppression d'un item :
   - Supprimer les transactions liées à cet item
4. Mettre à jour `statut_comptable = 'MODIFIE'` puis `'GENERE'`

**Interface** :
```
⚠️ ATTENTION : Cet enlèvement a déjà généré des transactions comptables.
Les modifications seront répercutées automatiquement en comptabilité.
[Continuer] [Annuler]
```

### FLUX 3 : Consultation Comptabilité

#### Vue Dashboard Comptabilité

**Section 1 : Transactions Automatiques (depuis enlèvements)**
```
┌─────────────────────────────────────────────────┐
│ TRANSACTIONS AUTOMATIQUES                      │
│ (Générées depuis les enlèvements)              │
├─────────────────────────────────────────────────┤
│ Filtres : [Société ▼] [Période ▼] [Type ▼]    │
│                                                 │
│ Tableau :                                       │
│ Date | Type | Description | Montant | Enlèvement│
│ 15/12| DEP  | Achat Carton ENL-2024-001 | 180  │
│ 15/12| REC  | Vente Carton ENL-2024-001 | 375  │
│ 15/12| DEP  | Traitement Banal ENL-2024-001|135│
│                                                 │
│ [ ] Transactions en lecture seule (auto)        │
│ [✏️] Modifier (désactivé pour auto)            │
│ [🔗] Voir l'enlèvement source                  │
└─────────────────────────────────────────────────┘
```

**Section 2 : Transactions Manuelles (cas exceptionnels)**
```
┌─────────────────────────────────────────────────┐
│ TRANSACTIONS MANUELLES                         │
│ (Saisies manuellement pour cas exceptionnels)   │
├─────────────────────────────────────────────────┤
│ [➕ Nouvelle transaction manuelle]              │
│                                                 │
│ Tableau :                                       │
│ Date | Type | Description | Montant | Actions  │
│ 10/12| DEP  | Transport exceptionnel | 500    │ [✏️][🗑️]
│ 12/12| REC  | Ajustement facture | 200         │ [✏️][🗑️]
│                                                 │
│ [✏️] Modifier (autorisé)                        │
│ [🗑️] Supprimer (autorisé)                       │
└─────────────────────────────────────────────────┘
```

**Indicateurs** :
- Total Recettes (auto + manuel)
- Total Dépenses (auto + manuel)
- Bilan Net
- Nombre de transactions auto vs manuel

#### Vue Détail Transaction Automatique

```
┌─────────────────────────────────────────────────┐
│ TRANSACTION AUTOMATIQUE                        │
├─────────────────────────────────────────────────┤
│ Type : RECETTE                                  │
│ Montant : 375,00 MAD                            │
│ Date : 15/12/2024                               │
│ Description : Vente déchets CARTON              │
│ Catégorie : Vente déchets valorisables          │
│                                                 │
│ 🔗 Source : Enlèvement ENL-2024-001             │
│    [Voir l'enlèvement]                          │
│                                                 │
│ 📦 Item source :                                │
│    • Type : RECYCLABLE (CARTON)                 │
│    • Quantité : 150 kg                          │
│    • Prix vente : 2,50 MAD/kg                   │
│                                                 │
│ ⚠️ Cette transaction a été générée automatiquement│
│    depuis un enlèvement.                        │
│    [Modifier l'enlèvement source]               │
└─────────────────────────────────────────────────┘
```

### FLUX 4 : Vue Client - Suivi Financier

#### Nouvel écran : "Suivi Financier Client"

```
┌─────────────────────────────────────────────────┐
│ SUIVI FINANCIER - [Nom Client]                  │
├─────────────────────────────────────────────────┤
│ Période : [01/01/2024] - [31/12/2024] [🔍]     │
│                                                 │
│ 📊 SYNTHÈSE                                     │
│ • Total acheté (déchets valorisables) : 5 800   │
│ • Total vendu (déchets valorisables) : 12 500   │
│ • Marge brute : 6 700 MAD                       │
│ • Total traitement (déchets banals) : 1 350     │
│ • Bilan net : 5 350 MAD                         │
│                                                 │
│ 📋 DÉTAIL PAR ENLÈVEMENT                       │
│                                                 │
│ Tableau (style Excel) :                         │
│ ┌──────┬──────────┬──────┬──────┬──────┬──────┐│
│ │ Date │ Enlèv.   │ Achat│ Vente│ Marge│ Trait││
│ ├──────┼──────────┼──────┼──────┼──────┼──────┤│
│ │15/12 │ENL-001   │ 580  │ 1250 │ 670  │ 135  ││
│ │20/12 │ENL-002   │ 320  │ 680  │ 360  │  80  ││
│ │25/12 │ENL-003   │ 450  │ 950  │ 500  │ 120  ││
│ ├──────┼──────────┼──────┼──────┼──────┼──────┤│
│ │      │ TOTAL    │ 1350 │ 2880 │ 1530 │ 335  ││
│ └──────┴──────────┴──────┴──────┴──────┴──────┘│
│                                                 │
│ [📥 Exporter en Excel]                          │
│                                                 │
│ 📈 ÉVOLUTION                                    │
│ [Graphique : Marge brute par mois]             │
└─────────────────────────────────────────────────┘
```

#### Détail d'un Enlèvement (vue client)

```
┌─────────────────────────────────────────────────┐
│ ENLÈVEMENT ENL-2024-001                         │
│ Date : 15/12/2024                               │
├─────────────────────────────────────────────────┤
│ 📦 DÉTAIL DES ITEMS                             │
│                                                 │
│ VALORISABLES :                                  │
│ • CARTON : 150 kg                               │
│   Achat : 1,20 MAD/kg → 180,00 MAD            │
│   Vente : 2,50 MAD/kg → 375,00 MAD             │
│   Marge : 195,00 MAD ✅                         │
│                                                 │
│ • PLASTIQUE : 80 kg                             │
│   Achat : 2,00 MAD/kg → 160,00 MAD            │
│   Vente : 4,50 MAD/kg → 360,00 MAD            │
│   Marge : 200,00 MAD ✅                         │
│                                                 │
│ BANALS :                                        │
│ • BANAL : 450 kg                                │
│   Traitement : 0,30 MAD/kg → 135,00 MAD       │
│                                                 │
│ 💰 RÉCAPITULATIF                                │
│ Total achat : 340,00 MAD                        │
│ Total vente : 735,00 MAD                        │
│ Marge brute : 395,00 MAD                        │
│ Total traitement : 135,00 MAD                   │
│ Bilan net : 260,00 MAD                          │
└─────────────────────────────────────────────────┘
```

---

## 🎨 REDESIGN DES ÉCRANS

### ÉCRAN 1 : Formulaire d'Enlèvement (Refondu)

#### Étape 1 : Informations générales (inchangé)

#### Étape 2 : Items avec distinction financière

**Avant (actuel)** :
```
Type déchet : [RECYCLABLE ▼]
Sous-type : [CARTON ▼]
Quantité : [150] kg
Prix unitaire : [1.20] MAD/kg
```

**Après (refondu)** :
```
┌─────────────────────────────────────────────────┐
│ TYPE DE DÉCHET                                  │
│ ○ VALORISABLE (génère achat + vente)            │
│ ● BANAL (génère uniquement un coût)            │
│ ○ À DÉTRUIRE (génère uniquement un coût)       │
│                                                 │
│ Si VALORISABLE :                                │
│ Sous-type : [CARTON ▼]                         │
│ Quantité : [150] kg                            │
│                                                 │
│ 💰 FINANCIER                                    │
│ Prix d'achat (MAD/kg) : [1.20]  ← Ce qu'on paie│
│ Prix de vente (MAD/kg) : [2.50] ← Ce qu'on vend│
│                                                 │
│ Calcul automatique :                           │
│ • Montant achat : 180,00 MAD                   │
│ • Montant vente : 375,00 MAD                   │
│ • Marge : 195,00 MAD ✅                        │
│                                                 │
│ Si BANAL/A_DETRUIRE :                          │
│ Quantité : [450] kg                            │
│ Prix de traitement (MAD/kg) : [0.30]          │
│                                                 │
│ Calcul automatique :                           │
│ • Montant traitement : 135,00 MAD               │
│ • Impact CA : Aucun                            │
└─────────────────────────────────────────────────┘
```

#### Étape 3 : Récapitulatif avec totaux financiers

```
┌─────────────────────────────────────────────────┐
│ RÉCAPITULATIF DE L'ENLÈVEMENT                   │
├─────────────────────────────────────────────────┤
│ 📦 ITEMS SAISIS                                 │
│                                                 │
│ VALORISABLES :                                  │
│ • CARTON : 150 kg (Achat: 1,20 | Vente: 2,50) │
│ • PLASTIQUE : 80 kg (Achat: 2,00 | Vente: 4,50)│
│                                                 │
│ BANALS :                                        │
│ • BANAL : 450 kg (Traitement: 0,30)            │
│                                                 │
│ 💰 TOTAUX FINANCIERS                           │
│ • Total achat : 340,00 MAD                     │
│ • Total vente : 735,00 MAD                     │
│ • Marge brute : 395,00 MAD                      │
│ • Total traitement : 135,00 MAD                  │
│ • Bilan net : 260,00 MAD                       │
│                                                 │
│ ⚙️ OPTIONS                                      │
│ [✓] Générer automatiquement les transactions   │
│     comptables à la validation                 │
│                                                 │
│ [Valider l'enlèvement]                         │
└─────────────────────────────────────────────────┘
```

### ÉCRAN 2 : Dashboard Comptabilité (Refondu)

```
┌─────────────────────────────────────────────────┐
│ COMPTABILITÉ                                    │
├─────────────────────────────────────────────────┤
│ Filtres : [Société ▼] [Période ▼] [Source ▼]   │
│                                                 │
│ 📊 INDICATEURS                                  │
│ ┌─────────────┬─────────────┬──────────────┐   │
│ │ Recettes    │ Dépenses    │ Bilan Net    │   │
│ │ 15 250 MAD  │ 8 500 MAD   │ 6 750 MAD    │   │
│ │ (12 auto)   │ (10 auto)   │              │   │
│ └─────────────┴─────────────┴──────────────┘   │
│                                                 │
│ 📋 TRANSACTIONS                                 │
│                                                 │
│ Onglet 1 : [Toutes] [Auto] [Manuelles]        │
│                                                 │
│ Tableau :                                       │
│ ┌──────┬──────┬──────────────┬────────┬──────┐ │
│ │ Date │ Type│ Description   │ Montant│Source│ │
│ ├──────┼──────┼──────────────┼────────┼──────┤ │
│ │15/12 │ REC │ Vente Carton  │  375   │ 🔗  │ │
│ │      │     │ ENL-2024-001  │        │      │ │
│ │15/12 │ DEP │ Achat Carton  │  180   │ 🔗  │ │
│ │      │     │ ENL-2024-001  │        │      │ │
│ │15/12 │ DEP │ Traitement    │  135   │ 🔗  │ │
│ │      │     │ ENL-2024-001  │        │      │ │
│ │10/12 │ DEP │ Transport     │  500   │ ✏️  │ │
│ │      │     │ exceptionnel  │        │      │ │
│ └──────┴──────┴──────────────┴────────┴──────┘ │
│                                                 │
│ Légende :                                       │
│ 🔗 = Transaction auto (lien vers enlèvement)   │
│ ✏️ = Transaction manuelle (modifiable)         │
│                                                 │
│ [➕ Nouvelle transaction manuelle]              │
└─────────────────────────────────────────────────┘
```

### ÉCRAN 3 : Suivi Financier Client (Nouveau)

```
┌─────────────────────────────────────────────────┐
│ SUIVI FINANCIER - SOCIÉTÉ XYZ                  │
├─────────────────────────────────────────────────┤
│ Période : [01/01/2024] - [31/12/2024] [🔍]     │
│                                                 │
│ 📊 SYNTHÈSE GLOBALE                             │
│ ┌─────────────────┬──────────┬──────────────┐ │
│ │ Total Achat     │ 5 800 MAD│ (déchets val.)│ │
│ │ Total Vente     │ 12 500 MAD│ (déchets val.)│ │
│ │ Marge Brute     │ 6 700 MAD│              │ │
│ │ Total Traitement│ 1 350 MAD│ (déchets ban.)│ │
│ │ Bilan Net       │ 5 350 MAD│              │ │
│ └─────────────────┴──────────┴──────────────┘ │
│                                                 │
│ 📋 DÉTAIL PAR ENLÈVEMENT                        │
│                                                 │
│ Tableau Excel-like :                           │
│ ┌──────┬──────────┬──────┬──────┬──────┬──────┐│
│ │ Date │ Enlèv.   │ Achat│ Vente│ Marge│ Trait││
│ ├──────┼──────────┼──────┼──────┼──────┼──────┤│
│ │15/12 │ENL-001   │ 580  │ 1250 │ 670  │ 135  ││
│ │      │          │      │      │      │      ││
│ │      │ Détail : │      │      │      │      ││
│ │      │ • Carton │ 180  │ 375  │ 195  │      ││
│ │      │ • Plast. │ 400  │ 875  │ 475  │      ││
│ │      │ • Banal  │      │      │      │ 135  ││
│ ├──────┼──────────┼──────┼──────┼──────┼──────┤│
│ │20/12 │ENL-002   │ 320  │ 680  │ 360  │  80  ││
│ ├──────┼──────────┼──────┼──────┼──────┼──────┤│
│ │      │ TOTAL    │ 900  │ 1930 │ 1030 │ 215  ││
│ └──────┴──────────┴──────┴──────┴──────┴──────┘│
│                                                 │
│ [📥 Exporter en Excel]                          │
│ [📈 Voir graphiques]                           │
└─────────────────────────────────────────────────┘
```

---

## 🔐 RÈGLES DE GESTION ET VALIDATIONS

### Règle 1 : Validation des Prix

**Pour un item VALORISABLE** :
- `prix_achat_mad` > 0 (obligatoire)
- `prix_vente_mad` > 0 (obligatoire)
- `prix_vente_mad` >= `prix_achat_mad` (sinon marge négative, alerte utilisateur)

**Pour un item BANAL/A_DETRUIRE** :
- `prix_traitement_mad` > 0 (obligatoire)

### Règle 2 : Génération Automatique

- Les transactions sont générées **uniquement** lors de la validation de l'enlèvement
- Si un enlèvement est modifié après validation, les transactions sont régénérées
- Les transactions auto ne peuvent **pas** être modifiées directement en comptabilité
- Pour modifier une transaction auto, il faut modifier l'enlèvement source

### Règle 3 : Transactions Manuelles

- Les transactions manuelles sont autorisées pour :
  - Transport exceptionnel
  - Ajustements comptables
  - Avances clients
  - Autres opérations non liées aux enlèvements
- Les transactions manuelles peuvent être modifiées/supprimées librement
- Les transactions manuelles n'ont **pas** de lien avec un enlèvement

### Règle 4 : Distinction Source

- Toutes les transactions affichent clairement leur source :
  - `🔗 AUTO_ENLEVEMENT` : Lien cliquable vers l'enlèvement
  - `✏️ MANUEL` : Transaction saisie manuellement

### Règle 5 : Impact Chiffre d'Affaires

- **Seules les ventes de déchets valorisables** impactent le CA
- Les déchets banals n'impactent **pas** le CA (ce sont des coûts)
- Le CA = Σ(Montant Vente) pour tous les items VALORISABLES

---

## 📝 CAS D'USAGE DÉTAILLÉS

### Cas d'usage 1 : Saisie d'un enlèvement mixte

**Scénario** :
- Client : Société ABC
- Enlèvement du 15/12/2024
- Items :
  - 150 kg de CARTON (valorisable) : Achat 1,20 | Vente 2,50
  - 80 kg de PLASTIQUE (valorisable) : Achat 2,00 | Vente 4,50
  - 450 kg de BANAL : Traitement 0,30

**Résultat attendu** :
1. Enlèvement sauvegardé avec statut `GENERE`
2. 4 transactions générées automatiquement :
   - DEPENSE : Achat Carton (180 MAD)
   - RECETTE : Vente Carton (375 MAD)
   - DEPENSE : Achat Plastique (160 MAD)
   - RECETTE : Vente Plastique (360 MAD)
   - DEPENSE : Traitement Banal (135 MAD)
3. Marge brute : 395 MAD
4. Bilan net : 260 MAD

### Cas d'usage 2 : Modification d'un enlèvement validé

**Scénario** :
- Enlèvement ENL-2024-001 déjà validé
- Modification : Ajout de 50 kg de FER (valorisable) : Achat 3,00 | Vente 6,00

**Résultat attendu** :
1. Alerte : "Cet enlèvement a déjà généré des transactions. Les modifications seront répercutées."
2. Ajout de l'item FER
3. Génération de 2 nouvelles transactions :
   - DEPENSE : Achat Fer (150 MAD)
   - RECETTE : Vente Fer (300 MAD)
4. Mise à jour des totaux de l'enlèvement

### Cas d'usage 3 : Consultation suivi financier client

**Scénario** :
- Client : Société XYZ
- Période : Janvier 2024
- 3 enlèvements validés

**Résultat attendu** :
- Vue tableau Excel avec :
  - Ligne par enlèvement
  - Colonnes : Date, Enlèvement, Achat, Vente, Marge, Traitement
  - Ligne total
  - Possibilité d'exporter en Excel

### Cas d'usage 4 : Saisie transaction manuelle

**Scénario** :
- Besoin de saisir un transport exceptionnel non lié à un enlèvement
- Montant : 500 MAD

**Résultat attendu** :
1. Formulaire transaction manuelle
2. Type : DEPENSE
3. Description : "Transport exceptionnel"
4. Montant : 500 MAD
5. Source : MANUEL (pas de lien enlèvement)
6. Transaction modifiable/supprimable

---

## 🚀 PLAN DE MISE EN ŒUVRE

### Phase 1 : Modifications Backend (Base de données + Services)

1. **Migration base de données** :
   - Ajout des champs financiers dans `pickup_item`
   - Ajout du champ `source` dans `transaction`
   - Ajout du champ `statut_comptable` dans `enlevement`
   - Création des contraintes et index

2. **Modifications entités Java** :
   - `PickupItem` : Ajout des champs `prixAchatMad`, `prixVenteMad`, `margeMad`, etc.
   - `Transaction` : Ajout du champ `source` et `pickupItem`
   - `Enlevement` : Ajout du champ `statutComptable`

3. **Service de génération automatique** :
   - Création `TransactionGenerationService`
   - Méthode `generateTransactionsFromEnlevement(Enlevement enlevement)`
   - Méthode `regenerateTransactionsForEnlevement(Enlevement enlevement)`

4. **Modifications `EnlevementService`** :
   - Appel automatique de la génération à la validation
   - Gestion de la régénération en cas de modification

### Phase 2 : Modifications Frontend (Composants)

1. **Formulaire d'enlèvement** :
   - Refonte de l'étape 2 (saisie items) avec distinction financière
   - Ajout des champs prix achat/vente pour valorisables
   - Calcul automatique des marges
   - Récapitulatif financier amélioré

2. **Dashboard comptabilité** :
   - Filtre par source (auto/manuel)
   - Distinction visuelle des transactions auto vs manuel
   - Lien vers enlèvement source pour transactions auto
   - Désactivation modification pour transactions auto

3. **Nouveau composant : Suivi Financier Client** :
   - Vue tableau Excel-like
   - Export Excel
   - Graphiques d'évolution

4. **Détail enlèvement** :
   - Affichage des marges par ligne
   - Distinction valorisables/banals
   - Lien vers transactions générées

### Phase 3 : Tests et Validation

1. Tests unitaires backend
2. Tests d'intégration
3. Tests end-to-end
4. Validation métier avec utilisateurs

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Les enlèvements sont la source unique de vérité financière
- [ ] Les transactions sont générées automatiquement à la validation
- [ ] Distinction claire entre déchets valorisables et banals
- [ ] Les marges sont calculées et affichées (ligne par ligne et globale)
- [ ] Les transactions auto ne sont pas modifiables directement
- [ ] Les transactions manuelles restent possibles pour cas exceptionnels
- [ ] Le suivi financier client est disponible avec vue Excel-like
- [ ] L'impact CA est correct (uniquement ventes valorisables)
- [ ] Les modifications d'enlèvements validés régénèrent les transactions
- [ ] L'interface est intuitive et reflète la réalité métier

---

## 📌 NOTES IMPORTANTES

1. **Rétrocompatibilité** : Les enlèvements existants devront être migrés (définir prix achat = prix unitaire actuel, prix vente = prix unitaire actuel × 1.5 par exemple, ou laisser vide pour régularisation manuelle)

2. **Performance** : La génération automatique de transactions doit être rapide (utiliser des transactions batch si nécessaire)

3. **Audit** : Tracer toutes les modifications (qui, quand, quoi) pour les transactions auto

4. **Formation utilisateurs** : Prévoir une formation sur la nouvelle logique financière

---

**Fin du document**

