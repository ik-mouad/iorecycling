# ⚡ DÉMARRAGE RAPIDE - IORECYCLING

## 🎯 EN 3 ÉTAPES

### 1️⃣ Backend (Terminal 1)

```bash
cd backend
mvn spring-boot:run
```

**✅ Prêt quand** : `Started App in X seconds`

---

### 2️⃣ Frontend (Terminal 2)

```bash
cd frontend
npm install     # Première fois uniquement
npm start
```

**✅ Prêt quand** : `Application bundle generation complete`

---

### 3️⃣ Tester (Navigateur)

```
http://localhost:4200
```

**Pages à tester** :
- ✅ http://localhost:4200/admin/societes
- ✅ http://localhost:4200/admin/enlevements/new
- ✅ http://localhost:4200/client/dashboard

---

## ⚠️ AVANT DE LANCER

### Configuration requise (1 minute)

**Backend** : Commenter les @PreAuthorize dans 3 controllers

1. `AdminSocieteController.java` ligne 39
2. `AdminEnlevementController.java` ligne 40
3. `ClientDashboardKpisController.java` ligne 30

```java
// @PreAuthorize("hasRole('ADMIN')")  // ✅ Commenter cette ligne
```

**Frontend** : Rien à configurer si standalone components

---

## ✅ VALIDATION RAPIDE

### Test 1 : Backend (30 secondes)

```
1. Ouvrir : http://localhost:8080/swagger-ui.html
2. Tester : GET /api/admin/societes
3. Résultat : 3 sociétés (YAZAKI, MARJANE, CHU)
```

**✅ Si OK** : Backend fonctionne

---

### Test 2 : Frontend (1 minute)

```
1. Ouvrir : http://localhost:4200/admin/societes
2. Vérifier : 3 sociétés affichées
3. Créer : Nouvelle société
4. Vérifier : Société apparaît dans la liste
```

**✅ Si OK** : Frontend fonctionne

---

### Test 3 : Intégration (2 minutes)

```
1. Aller sur : /admin/enlevements/new
2. Créer enlèvement avec 2 items
3. Vérifier calculs en temps réel
4. Créer et vérifier notification
5. Aller sur : /client/dashboard
6. Vérifier : 5 KPIs + graphique
```

**✅ Si OK** : Tout fonctionne !

---

## 🐛 PROBLÈMES ?

**Backend ne démarre pas** → Voir `LANCER_TESTS_SWAGGER.md` section "Problèmes fréquents"  
**Frontend ne démarre pas** → `npm install` puis `npm start`  
**Erreur CORS** → Voir `README_DEVELOPPEMENT.md` section "Configuration CORS"  
**Données ne s'affichent pas** → Vérifier console navigateur (F12)  

---

## 📚 DOCUMENTATION COMPLÈTE

Pour aller plus loin, consulter :

| Document | Utilité |
|----------|---------|
| **README_DEVELOPPEMENT.md** | 📖 Guide complet |
| **DESCRIPTIF_FONCTIONNEL.md** | 📋 Description métier complète |
| **GUIDE_TESTS_SWAGGER.md** | 🧪 Tests backend détaillés |
| **FRONTEND_DEV_SUMMARY.md** | 🎨 Résumé frontend |

---

## 🎉 C'EST PARTI !

```bash
# Terminal 1
cd backend && mvn spring-boot:run

# Terminal 2
cd frontend && npm start

# Navigateur
open http://localhost:4200
```

**Bon développement !** 🚀

