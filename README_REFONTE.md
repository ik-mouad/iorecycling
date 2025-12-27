# 📚 GUIDE DE LECTURE - REFONTE FONCTIONNELLE IORecycling

Ce dossier contient la documentation complète de la refonte fonctionnelle visant à faire de l'**enlèvement la source unique de vérité financière**.

---

## 📋 DOCUMENTS DISPONIBLES

### 1. 📊 **RESUME_EXECUTIF_REFONTE.md** ⭐ COMMENCER ICI
**Pour qui** : Décideurs, Product Owners, Chefs de projet  
**Temps de lecture** : 10 minutes  
**Contenu** :
- Objectif en une phrase
- Avant/Après
- Principes clés
- Impact métier
- Plan de mise en œuvre

👉 **Lisez ce document en premier pour avoir une vue d'ensemble**

---

### 2. 📋 **PROPOSITION_REFONTE_FONCTIONNELLE.md**
**Pour qui** : Product Owners, Analystes fonctionnels, Développeurs  
**Temps de lecture** : 30-45 minutes  
**Contenu** :
- Principes métier détaillés
- Modifications structure de données
- Flux fonctionnels complets
- Redesign des écrans
- Cas d'usage détaillés
- Règles de gestion

👉 **Document de référence pour comprendre la logique métier complète**

---

### 3. 🔧 **SPECIFICATIONS_TECHNIQUES_REFONTE.md**
**Pour qui** : Développeurs Backend/Frontend, Architectes  
**Temps de lecture** : 45-60 minutes  
**Contenu** :
- Migration SQL complète
- Modifications entités Java
- Code TypeScript/Angular
- Service de génération automatique
- Tests à prévoir

👉 **Document technique pour l'implémentation**

---

### 4. 📊 **DIAGRAMMES_FLUX_REFONTE.md**
**Pour qui** : Tous (visualisation)  
**Temps de lecture** : 15-20 minutes  
**Contenu** :
- Diagrammes ASCII des flux
- Visualisation des processus
- Relations entre entités
- Logique de décision

👉 **Document visuel pour comprendre les flux rapidement**

---

## 🎯 PARCOURS DE LECTURE RECOMMANDÉ

### Pour un Décideur / Chef de Projet
```
1. RESUME_EXECUTIF_REFONTE.md (10 min)
   └─> Compréhension rapide de l'objectif et de l'impact
   
2. DIAGRAMMES_FLUX_REFONTE.md (15 min)
   └─> Visualisation des processus
```

### Pour un Product Owner / Analyste Fonctionnel
```
1. RESUME_EXECUTIF_REFONTE.md (10 min)
   └─> Vue d'ensemble
   
2. PROPOSITION_REFONTE_FONCTIONNELLE.md (45 min)
   └─> Détails fonctionnels complets
   
3. DIAGRAMMES_FLUX_REFONTE.md (20 min)
   └─> Visualisation des flux
```

### Pour un Développeur
```
1. RESUME_EXECUTIF_REFONTE.md (10 min)
   └─> Compréhension du contexte
   
2. PROPOSITION_REFONTE_FONCTIONNELLE.md - Sections techniques (20 min)
   └─> Structure de données, règles métier
   
3. SPECIFICATIONS_TECHNIQUES_REFONTE.md (60 min)
   └─> Code et implémentation
   
4. DIAGRAMMES_FLUX_REFONTE.md (20 min)
   └─> Compréhension des flux
```

---

## 🔑 CONCEPTS CLÉS À RETENIR

### 1. Source Unique de Vérité
**L'enlèvement** est la source unique. Toutes les transactions comptables sont générées automatiquement depuis les enlèvements.

### 2. Distinction Financière
- **VALORISABLE** : Génère achat + vente = marge
- **BANAL/A_DETRUIRE** : Génère uniquement un coût de traitement

### 3. Génération Automatique
À la validation d'un enlèvement, les transactions sont créées automatiquement sans ressaisie.

### 4. Transactions Auto vs Manuel
- **Auto** : Générées depuis enlèvement (non modifiables directement)
- **Manuel** : Saisies pour cas exceptionnels (modifiables)

---

## 📊 STRUCTURE DES DONNÉES

### PickupItem (Ligne d'enlèvement)

**Pour VALORISABLE** :
```
prixAchatMad → montantAchatMad
prixVenteMad → montantVenteMad
margeMad = montantVenteMad - montantAchatMad
```

**Pour BANAL/A_DETRUIRE** :
```
prixTraitementMad → montantTraitementMad
```

### Transaction (Écriture comptable)

```
source: 'AUTO_ENLEVEMENT' | 'MANUEL'
pickupItemId: lien vers item source (si auto)
enlevementId: lien vers enlèvement source (si auto)
```

---

## 🔄 FLUX PRINCIPAL

```
SAISIE ENLÈVEMENT
    ↓
VALIDATION
    ↓
GÉNÉRATION AUTOMATIQUE
    ├─ Transaction DEPENSE (achat) si valorisable
    ├─ Transaction RECETTE (vente) si valorisable
    └─ Transaction DEPENSE (traitement) si banal
    ↓
COMPTABILITÉ ALIMENTÉE
```

---

## ✅ CHECKLIST DE VALIDATION

Avant de commencer l'implémentation, vérifiez que vous avez compris :

- [ ] Le principe de source unique de vérité
- [ ] La distinction valorisables/banals
- [ ] Le calcul des marges (ligne + globale)
- [ ] Le flux de génération automatique
- [ ] La différence transactions auto/manuel
- [ ] Les modifications de structure de données
- [ ] Les écrans à refondre

---

## 🚀 PROCHAINES ÉTAPES

1. **Validation métier** : Présenter la proposition aux utilisateurs finaux
2. **Estimation** : Évaluer le temps de développement
3. **Planification** : Organiser les sprints
4. **Implémentation** : Suivre les spécifications techniques
5. **Tests** : Valider avec les utilisateurs
6. **Formation** : Former les utilisateurs à la nouvelle logique

---

## 📞 QUESTIONS FRÉQUENTES

**Q : Où trouver les détails sur les écrans ?**  
R : Section "REDESIGN DES ÉCRANS" dans `PROPOSITION_REFONTE_FONCTIONNELLE.md`

**Q : Où trouver le code SQL de migration ?**  
R : Section "MODIFICATIONS BASE DE DONNÉES" dans `SPECIFICATIONS_TECHNIQUES_REFONTE.md`

**Q : Comment visualiser les flux rapidement ?**  
R : Consultez `DIAGRAMMES_FLUX_REFONTE.md`

**Q : Quelle est la différence entre prix achat et prix vente ?**  
R : 
- Prix achat : Ce que l'entreprise paie au client
- Prix vente : Ce que l'entreprise revend au recycleur
- Marge = Prix vente - Prix achat

---

## 📝 NOTES IMPORTANTES

1. **Rétrocompatibilité** : Les données existantes devront être migrées (voir migration SQL)

2. **Performance** : La génération automatique doit être rapide (utiliser batch si nécessaire)

3. **Formation** : Prévoir une formation utilisateurs sur la nouvelle logique financière

4. **Tests** : Tester particulièrement les cas limites (marge négative, modification après validation, etc.)

---

## 🔗 LIENS RAPIDES

- [Résumé Exécutif](./RESUME_EXECUTIF_REFONTE.md)
- [Proposition Fonctionnelle](./PROPOSITION_REFONTE_FONCTIONNELLE.md)
- [Spécifications Techniques](./SPECIFICATIONS_TECHNIQUES_REFONTE.md)
- [Diagrammes de Flux](./DIAGRAMMES_FLUX_REFONTE.md)

---

**Bonne lecture ! 📚**

