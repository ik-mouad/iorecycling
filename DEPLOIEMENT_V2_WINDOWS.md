# 🚀 Déploiement V2 - Guide Windows

## ⚡ Commandes Rapides

### 1. Vérification Pré-Déploiement
```powershell
.\scripts\verification_pre_deploiement.ps1
```

### 2. Sauvegarde Base de Données
```powershell
.\scripts\backup_database.ps1
```

### 3. Build Complet
```powershell
# Build tout (backend + frontend)
.\scripts\build-all.ps1

# Ou séparément :
.\scripts\build-backend.ps1
.\scripts\build-frontend.ps1
```

### 4. Déploiement Complet
```powershell
.\scripts\deploy-v2.ps1
```

---

## 📋 Étapes Détaillées

### Étape 1 : Vérification
```powershell
.\scripts\verification_pre_deploiement.ps1
```
Vérifie que tous les fichiers nécessaires sont présents.

### Étape 2 : Sauvegarde
```powershell
.\scripts\backup_database.ps1
```
Sauvegarde la base de données avant migration.

### Étape 3 : Build Backend
```powershell
.\scripts\build-backend.ps1
```
Compile le backend et crée le JAR dans `backend\target\`.

### Étape 4 : Build Frontend
```powershell
.\scripts\build-frontend.ps1
```
Compile le frontend et crée les fichiers dans `frontend\dist\`.

### Étape 5 : Déploiement
```powershell
.\scripts\deploy-v2.ps1
```
Guide interactif pour le déploiement.

---

## 🎯 Alternative : Make (si disponible)

Si vous avez `make` installé sur Windows :

```bash
# Build backend
make build-backend

# Build frontend
make build-frontend

# Build complet
make build-v2

# Vérification
make verify-v2
```

---

## 📦 Artifacts Créés

Après le build, vous aurez :

- **Backend JAR** : `backend\target\iorecycling-backend-*.jar`
- **Frontend** : `frontend\dist\*`

---

## ⚠️ Points Importants

1. **Sauvegarde obligatoire** avant déploiement
2. **Tester sur staging** si possible
3. **Vérifier les logs** après déploiement (migration V18)
4. **Plan de rollback** disponible dans `GUIDE_DEPLOIEMENT_V2.md`

---

## 🔄 En Cas de Problème

### Build échoue
- Vérifier que Maven/Node.js sont installés
- Vérifier les logs d'erreur
- Nettoyer et réessayer : `cd backend && .\mvnw.cmd clean`

### Migration échoue
- Restaurer depuis backup
- Vérifier les logs détaillés
- Consulter `GUIDE_DEPLOIEMENT_V2.md` section "Résolution de Problèmes"

---

**💡 Pour plus de détails, voir `GUIDE_DEPLOIEMENT_V2.md`**

