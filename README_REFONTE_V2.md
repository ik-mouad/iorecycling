# 📚 GUIDE DE LECTURE - REFONTE V2 (RECETTES ET VENTES)

Ce dossier contient la documentation de la **refonte fonctionnelle V2** qui intègre la gestion de **deux types de recettes** (Prestation + Vente Matière) et un **module Vente** pour le suivi des stocks.

---

## 📋 DOCUMENTS DISPONIBLES

### 1. 📊 **RESUME_EXECUTIF_V2_RECETTES_ET_VENTES.md** ⭐ COMMENCER ICI
**Pour qui** : Décideurs, Product Owners, Chefs de projet  
**Temps de lecture** : 10 minutes  
**Contenu** :
- Objectif en une phrase
- Concepts clés (2 types de recettes)
- Avant/Après
- Principes fondamentaux
- Écrans principaux
- Impact métier

👉 **Lisez ce document en premier pour avoir une vue d'ensemble**

---

### 2. 📋 **PROPOSITION_REFONTE_V2_RECETTES_ET_VENTES.md**
**Pour qui** : Product Owners, Analystes fonctionnels, Développeurs  
**Temps de lecture** : 45-60 minutes  
**Contenu** :
- Principes métier détaillés
- Structure de données
- Flux fonctionnels complets
- Redesign des écrans
- Cas d'usage détaillés
- Règles de gestion

👉 **Document de référence pour comprendre la logique métier complète**

---

### 3. 📊 **DIAGRAMMES_FLUX_V2_RECETTES_ET_VENTES.md**
**Pour qui** : Tous (visualisation)  
**Temps de lecture** : 20 minutes  
**Contenu** :
- Diagrammes ASCII des flux
- Visualisation des processus
- Relations entre entités
- Logique de génération

👉 **Document visuel pour comprendre les flux rapidement**

---

## 🎯 PARCOURS DE LECTURE RECOMMANDÉ

### Pour un Décideur / Chef de Projet
```
1. RESUME_EXECUTIF_V2_RECETTES_ET_VENTES.md (10 min)
   └─> Compréhension rapide de l'objectif et des concepts
   
2. DIAGRAMMES_FLUX_V2_RECETTES_ET_VENTES.md (20 min)
   └─> Visualisation des processus
```

### Pour un Product Owner / Analyste Fonctionnel
```
1. RESUME_EXECUTIF_V2_RECETTES_ET_VENTES.md (10 min)
   └─> Vue d'ensemble
   
2. PROPOSITION_REFONTE_V2_RECETTES_ET_VENTES.md (60 min)
   └─> Détails fonctionnels complets
   
3. DIAGRAMMES_FLUX_V2_RECETTES_ET_VENTES.md (20 min)
   └─> Visualisation des flux
```

### Pour un Développeur
```
1. RESUME_EXECUTIF_V2_RECETTES_ET_VENTES.md (10 min)
   └─> Compréhension du contexte
   
2. PROPOSITION_REFONTE_V2_RECETTES_ET_VENTES.md - Sections techniques (30 min)
   └─> Structure de données, règles métier
   
3. DIAGRAMMES_FLUX_V2_RECETTES_ET_VENTES.md (20 min)
   └─> Compréhension des flux
```

---

## 🔑 CONCEPTS CLÉS À RETENIR

### 1. Les Deux Types de Recettes

**RECETTE PRESTATION** :
- Générée à la validation de l'enlèvement
- Applicable à tous types de déchets
- Facturation du service d'enlèvement

**RECETTE VENTE MATIÈRE** :
- Générée à la validation d'une vente
- Applicable à tous types de déchets
- Facturation de la vente effective de déchets

### 2. Module Vente - Suivi des Stocks

**Concept** : Chaque item d'enlèvement crée un stock disponible à la vente.

**Quantités** :
- Récupérée : Quantité totale récupérée
- Vendue : Quantité totale vendue
- Reste à vendre : Récupérée - Vendue

**Statuts** :
- NON_VENDU : Aucune vente
- PARTIELLEMENT_VENDU : Vente partielle
- VENDU : Tout vendu

### 3. Distinction CA

**CA Total = CA Prestation + CA Vente Matière**

- Pas de double comptage
- Chaque type de CA est traçable
- Affichage séparé dans les dashboards

---

## 🔄 FLUX PRINCIPAL

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

---

## 📊 STRUCTURE DES DONNÉES

### PickupItem (Ligne d'enlèvement)

**Nouveaux champs** :
```
prix_prestation_mad → montant_prestation_mad
quantite_vendue_kg
reste_a_vendre_kg
statut (NON_VENDU / PARTIELLEMENT_VENDU / VENDU)
```

### Nouvelle Table : Vente

```
vente
  ├─ numero_vente
  ├─ date_vente
  ├─ acheteur
  └─ statut
```

### Nouvelle Table : VenteItem

```
vente_item
  ├─ vente_id
  ├─ pickup_item_id (lien vers stock)
  ├─ quantite_vendue_kg
  ├─ prix_vente_unitaire_mad
  └─ montant_vente_mad
```

### Transaction (Modifiée)

```
transaction
  ├─ type_recette ('PRESTATION' / 'VENTE_MATIERE')
  └─ vente_item_id (lien vers vente si vente matière)
```

---

## ✅ CHECKLIST DE VALIDATION

Avant de commencer l'implémentation, vérifiez que vous avez compris :

- [ ] La distinction entre recette prestation et recette vente matière
- [ ] Quand chaque type de recette est généré
- [ ] Le concept de stocks (récupéré, vendu, reste)
- [ ] Les statuts de stock (NON_VENDU, PARTIELLEMENT_VENDU, VENDU)
- [ ] Le module Vente et son fonctionnement
- [ ] L'écran "À vendre / Non vendu"
- [ ] La distinction CA Prestation vs CA Vente
- [ ] L'absence de double comptage

---

## 🚀 PROCHAINES ÉTAPES

1. **Validation métier** : Présenter la proposition aux utilisateurs finaux
2. **Estimation** : Évaluer le temps de développement
3. **Planification** : Organiser les sprints
4. **Implémentation** : Suivre les spécifications
5. **Tests** : Valider avec les utilisateurs
6. **Formation** : Former les utilisateurs à la nouvelle logique

---

## 📞 QUESTIONS FRÉQUENTES

**Q : Quelle est la différence entre prestation et vente matière ?**  
R : 
- Prestation : Facturation du service d'enlèvement (généré à l'enlèvement)
- Vente Matière : Facturation de la vente effective de déchets (généré lors de la vente)

**Q : Peut-on avoir une prestation pour des déchets banals ?**  
R : Oui, la prestation peut être générée pour tous types de déchets

**Q : Comment savoir ce qui reste à vendre ?**  
R : Via l'écran "À vendre / Non vendu" du module Vente

**Q : Y a-t-il un double comptage ?**  
R : Non, chaque quantité vendue génère une seule recette vente matière

**Q : Où trouver les détails sur les écrans ?**  
R : Section "REDESIGN DES ÉCRANS" dans `PROPOSITION_REFONTE_V2_RECETTES_ET_VENTES.md`

---

## 📝 NOTES IMPORTANTES

1. **Séparation claire** : Prestation (service) vs Vente Matière (produit)
2. **Stocks** : Gérés au niveau item ou regroupés selon choix métier
3. **Prix** : Les prix de vente matière peuvent varier selon l'acheteur
4. **Flexibilité** : Vente partielle ou totale possible
5. **Audit** : Traçabilité complète nécessaire

---

## 🔗 LIENS RAPIDES

- [Résumé Exécutif V2](./RESUME_EXECUTIF_V2_RECETTES_ET_VENTES.md)
- [Proposition Fonctionnelle V2](./PROPOSITION_REFONTE_V2_RECETTES_ET_VENTES.md)
- [Diagrammes de Flux V2](./DIAGRAMMES_FLUX_V2_RECETTES_ET_VENTES.md)

---

## 📚 RELATION AVEC LA VERSION 1

Cette version V2 **complète et modifie** la proposition V1 :

**Conservé de V1** :
- Génération automatique depuis enlèvement
- Distinction valorisables/banals
- Calcul des marges

**Ajouté dans V2** :
- Distinction recette prestation vs recette vente matière
- Module Vente avec suivi stocks
- Écran "À vendre / Non vendu"
- Distinction CA Prestation vs CA Vente

**Modifié dans V2** :
- La recette vente matière n'est plus générée à l'enlèvement
- Elle est générée lors de la vente effective dans le module Vente

---

**Bonne lecture ! 📚**

