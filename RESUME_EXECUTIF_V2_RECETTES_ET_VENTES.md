# 📊 RÉSUMÉ EXÉCUTIF V2 - RECETTES ET VENTES
## IORecycling - Gestion des Deux Types de Recettes et Module Vente

**Date** : 2024  
**Version** : 2.0

---

## 🎯 OBJECTIF EN UNE PHRASE

Gérer **deux types de recettes distincts** (Prestation + Vente Matière) et ajouter un **module Vente** pour suivre les stocks de déchets et leurs ventes effectives.

---

## 🔑 CONCEPTS CLÉS

### 1. Les Deux Types de Recettes

| Type | Déclencheur | Applicabilité | Impact CA |
|------|------------|---------------|-----------|
| **RECETTE PRESTATION** | Validation enlèvement | Tous types de déchets | ✅ Oui |
| **RECETTE VENTE MATIÈRE** | Validation vente | Tous types de déchets | ✅ Oui |

**Exemple** :
- **Prestation** : "Enlèvement de 500 kg : 1 200 MAD" → Généré à l'enlèvement
- **Vente Matière** : "Vente de 100 kg de carton : 250 MAD" → Généré lors de la vente

### 2. Module Vente - Suivi des Stocks

**Concept** : Chaque item d'enlèvement crée un stock de déchets disponibles à la vente.

**Quantités suivies** :
- **Récupérée** : Quantité totale récupérée lors des enlèvements
- **Vendue** : Quantité totale vendue
- **Reste à vendre** : Récupérée - Vendue

**Statuts** :
- **NON_VENDU** : Aucune vente
- **PARTIELLEMENT_VENDU** : Vente partielle
- **VENDU** : Tout vendu

---

## 🔄 AVANT / APRÈS

### ❌ AVANT (Situation Actuelle)

```
ENLÈVEMENT SAISI
    ↓
Pas de distinction prestation/vente
    ↓
Pas de suivi des stocks
    ↓
Pas de module vente
```

**Problèmes** :
- Confusion entre prestation et vente matière
- Pas de suivi des quantités vendues
- Impossible de savoir ce qui reste à vendre

### ✅ APRÈS (Refonte V2)

```
ENLÈVEMENT SAISI
    ↓
VALIDATION
    ↓
GÉNÉRATION AUTOMATIQUE
    ├─ Dépense (achat/traitement)
    └─ Recette PRESTATION
    ↓
STOCKS CRÉÉS
    ↓
MODULE VENTE
    ↓
VENTE EFFECTUÉE
    ↓
GÉNÉRATION
    └─ Recette VENTE MATIÈRE
```

**Avantages** :
- ✅ Distinction claire prestation vs vente matière
- ✅ Suivi complet des stocks
- ✅ Module vente dédié
- ✅ CA séparé (Prestation vs Vente)
- ✅ Traçabilité complète

---

## 📐 PRINCIPES FONDAMENTAUX

### 1. Génération depuis l'Enlèvement

**À la validation d'un enlèvement** :
- Transaction DEPENSE (achat au client si valorisable)
- Transaction DEPENSE (traitement si banal)
- Transaction RECETTE PRESTATION (si applicable, tous types)
- Création des stocks (quantité récupérée)

**Note** : La recette vente matière n'est PAS générée à l'enlèvement.

### 2. Génération depuis le Module Vente

**À la validation d'une vente** :
- Vérification stock disponible
- Mise à jour stocks (quantité vendue, reste à vendre)
- Calcul statut (NON_VENDU / PARTIELLEMENT_VENDU / VENDU)
- Transaction RECETTE VENTE MATIÈRE

### 3. Distinction CA

**Chiffre d'Affaires Total = CA Prestation + CA Vente Matière**

- **CA Prestation** : Somme des recettes prestation (source = enlèvement)
- **CA Vente Matière** : Somme des recettes vente matière (source = vente)
- **Pas de double comptage** : Chaque quantité vendue génère une seule recette vente matière

---

## 🎨 ÉCRANS PRINCIPAUX

### 1. Formulaire Enlèvement (Refondu)

**Changement** : Ajout prix prestation

```
┌─────────────────────────────────────────┐
│ Type : [RECYCLABLE ▼]                 │
│                                         │
│ 💰 PRESTATION                           │
│ Prix prestation : [2.00] MAD/kg       │
│ → Montant : 300 MAD                    │
│                                         │
│ 💰 ACHAT                                │
│ Prix achat : [1.20] MAD/kg            │
│ → Montant : 180 MAD                    │
│                                         │
│ 📦 STOCK                                │
│ Récupéré : 150 kg                      │
│ Reste à vendre : 150 kg                │
└─────────────────────────────────────────┘
```

### 2. Module Vente - Liste Stocks (Nouveau)

```
┌─────────────────────────────────────────┐
│ STOCKS DISPONIBLES                      │
│                                         │
│ Type      │ Sous-type │ Reste │ Statut │
│ RECYCLABLE│ CARTON    │ 150   │NON_VENDU│
│ RECYCLABLE│ PLASTIQUE │ 50    │PART_VENDU│
│ BANAL     │ -         │ 0     │VENDU    │
│                                         │
│ [➕ Nouvelle vente]                    │
└─────────────────────────────────────────┘
```

### 3. Formulaire Vente (Nouveau)

```
┌─────────────────────────────────────────┐
│ NOUVELLE VENTE                           │
│                                         │
│ Date : [15/12/2024]                    │
│ Acheteur : [Recycleur ABC ▼]           │
│                                         │
│ Ligne 1 :                               │
│ Type : [RECYCLABLE ▼]                  │
│ Sous-type : [CARTON ▼]                 │
│ Stock : 150 kg                         │
│ Quantité : [100] kg                    │
│ Prix : [2.50] MAD/kg                   │
│ → Montant : 250 MAD                    │
│                                         │
│ [Valider la vente]                      │
└─────────────────────────────────────────┘
```

### 4. Dashboard Comptabilité (Refondu)

```
┌─────────────────────────────────────────┐
│ COMPTABILITÉ                            │
│                                         │
│ 📊 INDICATEURS                           │
│ CA Prestation : 5 000 MAD               │
│ CA Vente : 3 500 MAD                    │
│ CA Total : 8 500 MAD                    │
│                                         │
│ [Toutes] [Prestation] [Vente] [Dépenses]│
│                                         │
│ Date │ Type │ Description │ Montant │Type│
│ 15/12│ REC  │ Prestation  │ 1 135  │PREST│
│ 16/12│ REC  │ Vente Carton│  250   │VENTE│
└─────────────────────────────────────────┘
```

---

## 🔄 FLUX UTILISATEUR SIMPLIFIÉ

### Scénario 1 : Enlèvement avec Prestation

```
1. Admin saisit enlèvement
   ├─ Items avec prix prestation
   └─ Items avec prix achat (si valorisable)
   
2. Clic "Valider"
   ├─ Transactions générées (dépense + recette prestation)
   └─ Stocks créés
   
3. Confirmation
   ✅ "Enlèvement validé - Stocks créés"
```

### Scénario 2 : Vente de Déchets

```
1. Admin ouvre Module Vente
   ├─ Consultation stocks disponibles
   └─ Clic "Nouvelle vente"
   
2. Saisie vente
   ├─ Sélection type/sous-type
   ├─ Quantité à vendre
   └─ Prix unitaire
   
3. Clic "Valider"
   ├─ Stock mis à jour
   └─ Transaction recette vente générée
   
4. Confirmation
   ✅ "Vente validée - Stock mis à jour"
```

### Scénario 3 : Consultation Dashboard

```
1. Admin ouvre Dashboard Comptabilité
   ├─ Affichage CA Prestation
   ├─ Affichage CA Vente Matière
   └─ CA Total
   
2. Filtrage par type
   ├─ Onglet "Prestation"
   └─ Onglet "Vente Matière"
```

---

## 📊 IMPACT MÉTIER

### Avant Refonte V2

| Aspect | État |
|--------|------|
| **Types de recettes** | Confusion / Non distingués |
| **Suivi stocks** | Absent |
| **Module vente** | Absent |
| **CA** | Non séparé |

### Après Refonte V2

| Aspect | État |
|--------|------|
| **Types de recettes** | Distinction claire (Prestation vs Vente) |
| **Suivi stocks** | Complet (récupéré, vendu, reste) |
| **Module vente** | Dédié avec suivi |
| **CA** | Séparé et traçable |

---

## 🚀 PLAN DE MISE EN ŒUVRE

### Phase 1 : Modifications Enlèvement (2 semaines)
- Ajout prix prestation
- Génération recette prestation
- Création stocks

### Phase 2 : Module Vente (3 semaines)
- Tables vente / vente_item
- Écran liste stocks
- Formulaire vente
- Mise à jour stocks

### Phase 3 : Dashboards (1 semaine)
- Distinction CA Prestation vs CA Vente
- Filtres par type recette

### Phase 4 : Tests et Validation (1 semaine)
- Tests fonctionnels
- Validation métier

**Total estimé** : 7 semaines

---

## ✅ CRITÈRES DE SUCCÈS

- [ ] Les enlèvements génèrent recette prestation (tous types)
- [ ] Le module Vente permet de vendre des déchets
- [ ] Les stocks sont suivis (récupéré, vendu, reste)
- [ ] Les statuts sont calculés automatiquement
- [ ] L'écran "À vendre / Non vendu" fonctionne
- [ ] Les dashboards distinguent CA Prestation vs CA Vente
- [ ] Pas de double comptage
- [ ] Traçabilité complète (vente → enlèvements)

---

## ⚠️ POINTS D'ATTENTION

1. **Séparation claire** : Prestation (service) vs Vente Matière (produit)
2. **Stocks** : Gestion au niveau item ou regroupement selon choix métier
3. **Prix** : Les prix de vente peuvent varier selon acheteur et date
4. **Flexibilité** : Vente partielle ou totale possible
5. **Audit** : Traçabilité complète nécessaire

---

## 📞 QUESTIONS FRÉQUENTES

**Q : Quand est générée la recette prestation ?**  
R : À la validation de l'enlèvement, si prix prestation > 0

**Q : Quand est générée la recette vente matière ?**  
R : À la validation d'une vente dans le module Vente

**Q : Peut-on vendre des déchets banals ?**  
R : Oui, tous types de déchets peuvent être vendus

**Q : Comment savoir ce qui reste à vendre ?**  
R : Via l'écran "À vendre / Non vendu" du module Vente

**Q : Y a-t-il un double comptage ?**  
R : Non, chaque quantité vendue génère une seule recette vente matière

**Q : Comment distinguer CA Prestation vs CA Vente ?**  
R : Dans les dashboards, avec filtres et indicateurs séparés

---

## 📚 DOCUMENTS ASSOCIÉS

1. **PROPOSITION_REFONTE_V2_RECETTES_ET_VENTES.md** : Détails fonctionnels complets
2. **DIAGRAMMES_FLUX_V2_RECETTES_ET_VENTES.md** : Visualisation des processus

---

**Fin du résumé exécutif V2**

