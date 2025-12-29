# 🐳 Docker Compose - Configuration

Ce fichier `docker-compose.yml` est configuré pour récupérer automatiquement le backend et le frontend depuis la branche `main` du repository GitHub.

## 📋 Prérequis

- Docker Engine 20.10+
- Docker Compose v2.4+ (pour le support des contextes Git)
- Git (pour le clonage initial si nécessaire)

## 🚀 Démarrage rapide

1. **Créer le fichier `.env`** (déjà créé avec les valeurs par défaut)

2. **Démarrer tous les services** :
   ```bash
   docker-compose up -d
   ```

3. **Vérifier les logs** :
   ```bash
   docker-compose logs -f
   ```

## 📝 Configuration

### Variables d'environnement

Le fichier `.env` contient toutes les variables nécessaires. Vous pouvez les modifier selon vos besoins :

- **Base de données** : `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **Keycloak** : `KEYCLOAK_ADMIN_USERNAME`, `KEYCLOAK_ADMIN_PASSWORD`
- **MinIO** : `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`
- **Ports** : `CADDY_PORT` (défaut: 88)

### Services disponibles

Une fois démarrés, les services sont accessibles via :

- **Frontend** : http://localhost:88/
- **API Backend** : http://localhost:88/api
- **Keycloak** : http://localhost:88/auth/
- **MinIO Console** : http://localhost:9001/
- **Grafana** : http://localhost:3001/
- **Prometheus** : http://localhost:9090/

## 🔧 Récupération depuis GitHub

Le `docker-compose.yml` utilise des **contextes Git** pour récupérer automatiquement le code depuis GitHub :

```yaml
backend:
  build:
    context: https://github.com/ik-mouad/iorecycling.git#main
    dockerfile: backend/Dockerfile

frontend:
  build:
    context: https://github.com/ik-mouad/iorecycling.git#main
    dockerfile: frontend/Dockerfile
```

### Note importante

Si Docker Compose ne supporte pas les contextes Git (version < 2.4), vous pouvez :

1. **Cloner le repository localement** :
   ```bash
   git clone https://github.com/ik-mouad/iorecycling.git
   cd iorecycling
   ```

2. **Modifier le docker-compose.yml** pour utiliser un contexte local :
   ```yaml
   backend:
     build:
       context: ./backend
       dockerfile: Dockerfile
   ```

## 📁 Fichiers nécessaires

Pour que le docker-compose fonctionne, vous devez avoir :

- ✅ `docker-compose.yml` (déjà créé)
- ✅ `Caddyfile` (déjà créé)
- ✅ `.env` (déjà créé)
- ✅ `monitoring/` (dossiers de configuration pour Prometheus, Loki, Tempo, Grafana)

## 🛠️ Commandes utiles

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f [service_name]

# Reconstruire les images
docker-compose build --no-cache

# Redémarrer un service spécifique
docker-compose restart [service_name]

# Vérifier l'état des services
docker-compose ps
```

## ⚠️ Dépannage

### Problème avec les contextes Git

Si vous rencontrez des erreurs lors du build avec les contextes Git :

1. Vérifiez votre version de Docker Compose :
   ```bash
   docker-compose version
   ```
   (Doit être >= 2.4.0)

2. Si la version est inférieure, clonez le repo localement et modifiez le docker-compose.yml comme indiqué ci-dessus.

### Problème de permissions

Si vous avez des problèmes de permissions avec les volumes :

```bash
# Sur Linux/Mac
sudo chown -R $USER:$USER ./logs

# Sur Windows, vérifiez les permissions du dossier
```

## 📚 Documentation supplémentaire

Pour plus d'informations, consultez :
- [README.md](README.md) - Documentation principale
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement

