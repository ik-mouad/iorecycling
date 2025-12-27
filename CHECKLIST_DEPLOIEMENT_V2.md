# ✅ Checklist Déploiement V2

## 📦 Pré-Déploiement

### Base de Données
- [ ] **Sauvegarder la base de données**
  ```bash
  ./scripts/backup_database.sh
  ```
- [ ] Vérifier l'espace disque disponible
- [ ] Vérifier que la migration V18 est présente

### Backend
- [ ] **Vérifier la compilation**
  ```bash
  cd backend
  ./mvnw clean compile
  ```
- [ ] Vérifier qu'aucune erreur de compilation
- [ ] Vérifier que tous les fichiers sont présents

### Frontend
- [ ] **Vérifier la compilation**
  ```bash
  cd frontend
  npm install
  ng build --configuration production
  ```
- [ ] Vérifier qu'aucune erreur de build
- [ ] Vérifier que tous les composants sont présents

### Scripts
- [ ] Rendre les scripts exécutables :
  ```bash
  chmod +x scripts/verification_pre_deploiement.sh
  chmod +x scripts/backup_database.sh
  ```
- [ ] Exécuter la vérification :
  ```bash
  ./scripts/verification_pre_deploiement.sh
  ```

---

## 🚀 Déploiement

### 1. Backend

- [ ] Arrêter l'application actuelle
- [ ] Compiler le JAR de production
- [ ] Backup de l'ancienne version
- [ ] Déployer la nouvelle version
- [ ] Démarrer l'application
- [ ] Vérifier les logs (migration V18 exécutée)

### 2. Frontend

- [ ] Build production
- [ ] Backup de l'ancienne version
- [ ] Déployer la nouvelle version
- [ ] Vérifier les permissions
- [ ] Redémarrer Nginx

---

## ✅ Post-Déploiement

### Tests Fonctionnels

- [ ] **Test 1 : Création Enlèvement**
  - Créer un enlèvement avec prix prestation/achat/traitement
  - Vérifier que les transactions sont générées automatiquement
  - Vérifier les montants dans la comptabilité

- [ ] **Test 2 : Stocks Disponibles**
  - Accéder à `/admin/ventes/stocks`
  - Vérifier que les stocks s'affichent
  - Tester les filtres

- [ ] **Test 3 : Création Vente**
  - Créer une vente depuis un stock
  - Ajouter des items
  - Valider la vente
  - Vérifier que la transaction vente matière est générée

- [ ] **Test 4 : Dashboard Comptabilité**
  - Accéder au dashboard
  - Vérifier que CA Prestation s'affiche
  - Vérifier que CA Vente Matière s'affiche
  - Vérifier que Total Recettes = CA Prestation + CA Vente Matière

### Vérifications Techniques

- [ ] Vérifier les logs backend (aucune erreur)
- [ ] Vérifier les logs frontend (console navigateur)
- [ ] Vérifier les performances (temps de réponse)
- [ ] Vérifier la base de données (tables créées, colonnes ajoutées)

---

## 🔄 Rollback (si nécessaire)

- [ ] Arrêter l'application
- [ ] Restaurer l'ancienne version backend
- [ ] Restaurer la base de données depuis backup
- [ ] Restaurer l'ancienne version frontend
- [ ] Redémarrer les services

---

## 📝 Notes

- ⚠️ **Important** : Tester d'abord sur un environnement de staging
- ⚠️ **Migration SQL** : La migration V18 est idempotente mais tester avant production
- ⚠️ **Données existantes** : Les données existantes sont préservées
- ⚠️ **Performance** : Surveiller les performances après déploiement

---

**Date de déploiement** : _______________
**Déployé par** : _______________
**Statut** : ☐ En attente | ☐ En cours | ☐ Terminé | ☐ Rollback

