# 🚀 Guide de Déploiement V2 - Recettes et Ventes

## 📋 Checklist Pré-Déploiement

### ✅ Backend

- [x] Migration SQL V18 créée
- [x] Entités Java créées/modifiées
- [x] Repositories créés/modifiés
- [x] Services créés/modifiés
- [x] Controllers créés
- [x] DTOs et Mappers créés
- [x] Compilation sans erreur

### ✅ Frontend

- [x] Modèles TypeScript créés/modifiés
- [x] Services Angular créés
- [x] Composants créés/modifiés
- [x] Routes configurées
- [x] Navigation mise à jour
- [x] Styles cohérents avec design system
- [x] Compilation sans erreur

---

## 🔧 Étapes de Déploiement

### 1. Sauvegarde Base de Données

**Windows (PowerShell) :**
```powershell
.\scripts\backup_database.ps1
```

**Linux/Mac :**
```bash
# Sauvegarder la base de données avant migration
pg_dump -U iorecycling -d iorecycling_db > backup_pre_v18_$(date +%Y%m%d_%H%M%S).sql
```

**Ou utiliser le script :**
```bash
./scripts/backup_database.sh
```

### 2. Vérification Migration SQL

```bash
# Vérifier que la migration V18 est bien présente
ls -la backend/src/main/resources/db/migration/V18__refonte_v2_recettes_et_ventes.sql
```

**Points critiques à vérifier :**
- ✅ Toutes les colonnes ajoutées avec `IF NOT EXISTS`
- ✅ Contraintes de clés étrangères
- ✅ Index créés
- ✅ Triggers pour calculs automatiques
- ✅ Données existantes préservées (UPDATE pour reste_a_vendre_kg)

### 3. Déploiement Backend

#### 3.1 Compilation

**Windows (PowerShell) :**
```powershell
.\scripts\build-backend.ps1
```

**Linux/Mac :**
```bash
cd backend
./mvnw clean package -DskipTests
```

**Ou utiliser Make :**
```bash
make build-backend
```

#### 3.2 Vérification JAR

```bash
# Vérifier que le JAR est créé
ls -lh target/*.jar
```

#### 3.3 Déploiement

```bash
# Arrêter l'application actuelle
sudo systemctl stop iorecycling-backend

# Backup de l'ancienne version
cp iorecycling-backend.jar iorecycling-backend.jar.backup

# Copier la nouvelle version
cp target/iorecycling-backend-*.jar /opt/iorecycling/iorecycling-backend.jar

# Démarrer l'application
sudo systemctl start iorecycling-backend

# Vérifier les logs
sudo journalctl -u iorecycling-backend -f
```

#### 3.4 Vérification Migration

Vérifier dans les logs que la migration V18 s'est bien exécutée :
```
Flyway: Successfully applied migration V18__refonte_v2_recettes_et_ventes.sql
```

**Si erreur de migration :**
1. Arrêter l'application
2. Restaurer la base de données depuis le backup
3. Corriger la migration
4. Relancer le déploiement

### 4. Déploiement Frontend

#### 4.1 Build Production

**Windows (PowerShell) :**
```powershell
.\scripts\build-frontend.ps1
```

**Linux/Mac :**
```bash
cd frontend
npm install
ng build --configuration production
```

**Ou utiliser Make :**
```bash
make build-frontend
```

**Build complet (Backend + Frontend) :**
```bash
make build-v2
# Ou PowerShell:
.\scripts\build-all.ps1
```

#### 4.2 Vérification Build

```bash
# Vérifier que le build est créé
ls -lh dist/
```

#### 4.3 Déploiement

```bash
# Backup de l'ancienne version
sudo cp -r /var/www/iorecycling /var/www/iorecycling.backup

# Copier la nouvelle version
sudo cp -r dist/* /var/www/iorecycling/

# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/iorecycling
sudo chmod -R 755 /var/www/iorecycling

# Redémarrer Nginx
sudo systemctl reload nginx
```

### 5. Vérifications Post-Déploiement

#### 5.1 Backend

**Vérifier les endpoints :**
```bash
# Test endpoint stocks
curl -X GET "http://localhost:8080/api/admin/ventes/stocks" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test endpoint ventes
curl -X GET "http://localhost:8080/api/admin/ventes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Vérifier la base de données :**
```sql
-- Vérifier que les nouvelles tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('vente', 'vente_item');

-- Vérifier les colonnes ajoutées
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'pickup_item' 
AND column_name IN ('prix_prestation_mad', 'prix_achat_mad', 'prix_traitement_mad', 
                     'quantite_vendue_kg', 'reste_a_vendre_kg', 'statut_stock');
```

#### 5.2 Frontend

**Vérifier les routes :**
- ✅ `/admin/ventes` → Liste des ventes
- ✅ `/admin/ventes/nouvelle` → Formulaire vente
- ✅ `/admin/ventes/stocks` → Stocks disponibles
- ✅ `/admin/enlevements/new` → Formulaire avec nouveaux champs
- ✅ `/admin/comptabilite` → Dashboard avec distinction CA

**Vérifier les fonctionnalités :**
1. Créer un enlèvement avec prix prestation/achat/traitement
2. Vérifier que les transactions sont générées automatiquement
3. Consulter les stocks disponibles
4. Créer une vente depuis un stock
5. Valider une vente
6. Vérifier que la transaction vente matière est générée
7. Consulter le dashboard comptabilité avec CA Prestation/Vente

---

## 🐛 Résolution de Problèmes

### Problème : Migration échoue

**Symptômes :**
```
Flyway: Migration V18 failed
```

**Solutions :**
1. Vérifier les logs détaillés
2. Vérifier que toutes les dépendances sont satisfaites
3. Vérifier les contraintes de clés étrangères
4. Si nécessaire, restaurer depuis backup et corriger

### Problème : Endpoints 404

**Symptômes :**
```
GET /api/admin/ventes → 404 Not Found
```

**Solutions :**
1. Vérifier que le controller est bien compilé
2. Vérifier les logs Spring Boot pour les routes
3. Vérifier la configuration CORS si nécessaire

### Problème : Frontend ne compile pas

**Symptômes :**
```
Error: Cannot find module 'vente.model'
```

**Solutions :**
1. Vérifier que tous les fichiers sont présents
2. Vérifier les imports dans les composants
3. Nettoyer et rebuilder : `rm -rf node_modules dist && npm install && ng build`

### Problème : Transactions non générées

**Symptômes :**
- Enlèvement créé mais pas de transactions

**Solutions :**
1. Vérifier les logs du service `TransactionGenerationService`
2. Vérifier que les montants sont bien renseignés
3. Vérifier que le service est bien injecté dans `EnlevementService`

---

## 📊 Tests de Validation

### Test 1 : Création Enlèvement → Génération Transactions

1. Créer un enlèvement avec :
   - Item RECYCLABLE avec prixAchatMad = 10, prixPrestationMad = 5
   - Item BANAL avec prixTraitementMad = 8, prixPrestationMad = 3

2. Vérifier que 4 transactions sont générées :
   - 1 Dépense (Achat) = 10 * quantité
   - 1 Recette Prestation = 5 * quantité
   - 1 Dépense (Traitement) = 8 * quantité
   - 1 Recette Prestation = 3 * quantité

### Test 2 : Création Vente → Validation → Génération Transaction

1. Créer une vente en brouillon
2. Ajouter un item avec pickupItemId
3. Valider la vente
4. Vérifier :
   - Stock mis à jour (quantiteVendueKg, resteAVendreKg)
   - Transaction générée (Recette Vente Matière)

### Test 3 : Dashboard Comptabilité

1. Accéder au dashboard comptabilité
2. Vérifier que les KPIs affichent :
   - CA Prestation
   - CA Vente Matière
   - Total Recettes (somme des deux)

---

## 🔄 Rollback Plan

En cas de problème majeur :

### Rollback Backend

```bash
# Arrêter l'application
sudo systemctl stop iorecycling-backend

# Restaurer l'ancienne version
cp iorecycling-backend.jar.backup iorecycling-backend.jar

# Restaurer la base de données
psql -U iorecycling -d iorecycling_db < backup_pre_v18_YYYYMMDD_HHMMSS.sql

# Démarrer l'application
sudo systemctl start iorecycling-backend
```

### Rollback Frontend

```bash
# Restaurer l'ancienne version
sudo rm -rf /var/www/iorecycling
sudo cp -r /var/www/iorecycling.backup /var/www/iorecycling

# Redémarrer Nginx
sudo systemctl reload nginx
```

---

## 📝 Notes Importantes

1. **Migration SQL** : La migration V18 est idempotente (utilise `IF NOT EXISTS`), mais il est recommandé de la tester sur un environnement de staging d'abord.

2. **Données existantes** : Les données existantes sont préservées. Le champ `reste_a_vendre_kg` est calculé automatiquement pour les données existantes.

3. **Performance** : Les nouvelles requêtes (stocks disponibles) peuvent être lentes sur de grandes bases. Surveiller les performances et ajouter des index si nécessaire.

4. **Sécurité** : Vérifier que les nouveaux endpoints sont bien protégés par les guards appropriés (comptableGuard).

---

## ✅ Validation Finale

Une fois le déploiement terminé, valider :

- [ ] Migration SQL exécutée sans erreur
- [ ] Backend démarre correctement
- [ ] Frontend accessible et fonctionnel
- [ ] Tous les endpoints répondent
- [ ] Création enlèvement → transactions générées
- [ ] Création vente → validation → transaction générée
- [ ] Dashboard affiche CA Prestation et CA Vente
- [ ] Aucune erreur dans les logs

---

**Bon déploiement ! 🚀**

