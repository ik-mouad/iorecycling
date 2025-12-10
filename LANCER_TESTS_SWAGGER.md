# 🚀 LANCER LES TESTS SWAGGER - GUIDE RAPIDE

## 📋 PRÉREQUIS

✅ Java 17 installé  
✅ Maven installé  
✅ PostgreSQL en cours d'exécution (via Docker)  
✅ Port 8080 disponible  

---

## 🎯 ÉTAPES RAPIDES

### 1. Vérifier que tout est prêt

```bash
cd backend
chmod +x pre-test-check.sh
./pre-test-check.sh
```

Si tout est ✅ vert, continuez. Sinon, corrigez les erreurs affichées.

---

### 2. Désactiver temporairement la sécurité (pour tests)

**Option simple** : Commenter les @PreAuthorize dans les 3 controllers

**Fichiers à modifier** :
- `AdminSocieteController.java` ligne 39
- `AdminEnlevementController.java` ligne 40
- `ClientDashboardKpisController.java` ligne 30

```java
// @PreAuthorize("hasRole('ADMIN')")  // ✅ Commenté pour tests
```

**OU** suivre les instructions dans `backend/TEST_MODE_README.md`

---

### 3. Lancer l'application

```bash
# Depuis le dossier backend/
mvn clean install
mvn spring-boot:run
```

**Attendre** : `Started App in X seconds`  
**Vérifier** : Aucune erreur Flyway ou Spring  

---

### 4. Ouvrir Swagger UI

Dans votre navigateur :
```
http://localhost:8080/swagger-ui.html
```

**OU si l'URL ne fonctionne pas** :
```
http://localhost:8080/swagger-ui/index.html
```

**Vous devriez voir** : 3 groupes d'API
- Admin Sociétés
- Admin Enlèvements
- Client Dashboard

---

### 5. Exécuter les tests

Suivre le guide détaillé :
```
📄 GUIDE_TESTS_SWAGGER.md
```

**Ordre recommandé** :
1. ✅ TEST 1 : Lister les sociétés (vérifier données démo)
2. ✅ TEST 2 : Créer une société
3. ✅ TEST 5 : Créer un enlèvement
4. ✅ TEST 6 : Vérifier les calculs automatiques
5. ✅ TEST 7 : Tester les KPIs
6. ✅ TEST 9 : Tester les validations (erreurs)
7. ✅ TEST 10 : Nettoyer (supprimer)

---

## 🎯 TEST RAPIDE (5 minutes)

Si vous voulez juste vérifier que ça fonctionne :

### Test 1 : Lister les sociétés

1. Ouvrir Swagger UI
2. Cliquer sur **"Admin Sociétés"**
3. Cliquer sur **"GET /api/admin/societes"**
4. Cliquer sur **"Try it out"**
5. Cliquer sur **"Execute"**

**✅ Résultat attendu** : HTTP 200 avec 3 sociétés (YAZAKI, MARJANE, CHU)

---

### Test 2 : Créer un enlèvement

1. Cliquer sur **"Admin Enlèvements"**
2. Cliquer sur **"POST /api/admin/enlevements"**
3. Cliquer sur **"Try it out"**
4. Copier-coller ce JSON :

```json
{
  "dateEnlevement": "2024-11-28",
  "siteId": 1,
  "societeId": 1,
  "observation": "Test Swagger",
  "items": [
    {
      "typeDechet": "VALORISABLE",
      "sousType": "CARTON",
      "quantiteKg": 100.000,
      "prixUnitaireMad": 1.20
    },
    {
      "typeDechet": "BANAL",
      "sousType": null,
      "quantiteKg": 50.000,
      "prixUnitaireMad": 0.30
    }
  ]
}
```

5. Cliquer sur **"Execute"**

**✅ Résultat attendu** : HTTP 201 avec :
- `numeroEnlevement`: "ENL-2024-XXXXXX"
- `montantMad` calculés automatiquement :
  - Item 1 : 120.00 MAD (100 × 1.20)
  - Item 2 : 15.00 MAD (50 × 0.30)
- `budgetValorisation`: 120.00 MAD
- `budgetTraitement`: 15.00 MAD
- `bilanNet`: 105.00 MAD
- `tauxValorisation`: 66.7% (100 / 150 × 100)

---

### Test 3 : Vérifier les KPIs

1. Cliquer sur **"Client Dashboard"**
2. Cliquer sur **"GET /api/client/dashboard/kpis"**
3. Cliquer sur **"Try it out"**
4. Saisir :
   - dateDebut: `2024-11-01`
   - dateFin: `2024-11-30`
5. Cliquer sur **"Execute"**

**✅ Résultat attendu** : HTTP 200 avec les 5 KPIs

---

## ✅ CHECKLIST RAPIDE

Cochez pendant vos tests :

- [ ] ✅ Swagger UI accessible
- [ ] ✅ GET sociétés fonctionne (3 sociétés de démo)
- [ ] ✅ POST société fonctionne (création OK)
- [ ] ✅ POST enlèvement fonctionne
- [ ] ✅ Calculs automatiques corrects :
  - [ ] montantMad = quantité × prix
  - [ ] budgetValorisation = somme VALORISABLE
  - [ ] budgetTraitement = somme BANAL + A_ELIMINER
  - [ ] bilanNet = valorisation - traitement
  - [ ] tauxValorisation = (valorisable / total) × 100
- [ ] ✅ GET KPIs fonctionne
- [ ] ✅ Validations fonctionnent (ICE unique, sous-type VALORISABLE)

---

## 🐛 PROBLÈMES FRÉQUENTS

### Port 8080 déjà utilisé

```bash
# Trouver et tuer le processus
lsof -ti:8080 | xargs kill -9

# Ou sur Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

---

### Swagger UI 404

**Vérifier** :
1. L'application est bien démarrée (voir les logs)
2. Essayer l'autre URL : `/swagger-ui/index.html`
3. Vérifier que SpringDoc est dans pom.xml

---

### Erreur 403 Forbidden

**Cause** : La sécurité n'est pas désactivée

**Solution** : Suivre l'étape 2 (commenter @PreAuthorize)

---

### Erreur 500 sur POST enlèvement

**Causes possibles** :
1. siteId ou societeId n'existe pas → Utiliser 1 (données démo)
2. Sous-type manquant pour VALORISABLE → Ajouter "CARTON", "PLASTIQUE_PET", etc.
3. Problème de calcul → Vérifier les logs

---

### Calculs incorrects

**Exemple** : montantMad = 0.00 au lieu de 120.00

**Cause** : @PrePersist pas appelé

**Solution** : Vérifier PickupItem.java lignes 90-98 (méthode calculateMontant)

---

## 📊 VALEURS DE RÉFÉRENCE

### Enlèvement de test (pour validation manuelle)

Si vous créez un enlèvement avec :
- Item 1 : VALORISABLE/CARTON, 100 kg × 1.20 MAD/kg
- Item 2 : BANAL, 50 kg × 0.30 MAD/kg

**Vous devez obtenir exactement** :
```
Item 1 montantMad    : 120.00 MAD ✅
Item 2 montantMad    : 15.00 MAD ✅
poidsTotal           : 150.00 kg ✅
budgetValorisation   : 120.00 MAD ✅
budgetTraitement     : 15.00 MAD ✅
bilanNet             : 105.00 MAD ✅
tauxValorisation     : 66.7% ✅
```

**Si différent** : Il y a un bug dans les calculs.

---

## 🎉 SUCCÈS !

Si tous les tests passent, vous avez validé :

✅ Le backend est 100% fonctionnel  
✅ Toutes les règles métier sont implémentées  
✅ Tous les calculs automatiques fonctionnent  
✅ Les validations sont opérationnelles  

**➡️ Vous pouvez passer au développement frontend !**

---

## 📚 DOCUMENTATION

- **Tests détaillés** : `GUIDE_TESTS_SWAGGER.md` (20+ tests)
- **Mode test** : `backend/TEST_MODE_README.md`
- **Résumé backend** : `BACKEND_DEV_SUMMARY.md`
- **Descriptif fonctionnel** : `DESCRIPTIF_FONCTIONNEL.md` (2100 lignes)

---

## 🚀 APRÈS LES TESTS

### Restaurer la sécurité

1. Décommenter les @PreAuthorize
2. Faire `git diff` pour vérifier
3. Commiter les changements

### Passer au frontend

Le backend expose maintenant :
- ✅ 10+ endpoints REST prêts
- ✅ Calculs automatiques fonctionnels
- ✅ Validations en place
- ✅ Documentation Swagger

**Prêt pour Angular !** 🎯

---

Bon courage pour les tests ! 🚀

