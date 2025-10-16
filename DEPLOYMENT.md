# 🚀 Guide de Déploiement IORecycling

## 📋 Prérequis

- Docker & Docker Compose
- Git
- Accès SSH au serveur VPS
- Clé SSH configurée

## 🔧 Configuration

### 1. Variables d'environnement

Copiez `env.example` vers `.env` et configurez :

```bash
cp env.example .env
```

Variables importantes :
- `POSTGRES_PASSWORD` : Mot de passe sécurisé pour PostgreSQL
- `KC_ADMIN_PASSWORD` : Mot de passe admin Keycloak
- `MINIO_ROOT_PASSWORD` : Mot de passe MinIO

### 2. Secrets GitHub Actions

Configurez dans GitHub > Settings > Secrets :

- `VPS_HOST` : Adresse IP/domaine du serveur
- `VPS_USERNAME` : Utilisateur SSH
- `VPS_SSH_KEY` : Clé privée SSH
- `VPS_PORT` : Port SSH (optionnel, défaut: 22)
- `VPS_DEPLOY_PATH` : Chemin de déploiement (optionnel, défaut: /opt/iorecycling)

## 🚀 Déploiement

### Automatique (CI/CD)

Le déploiement se fait automatiquement via GitHub Actions :

- **Branche `develop`** → Environnement QUAL
- **Branche `main`** → Environnement PROD

### Manuel

#### Option 1 : Script de déploiement

```bash
# Déploiement développement
./scripts/deploy.sh --host YOUR_VPS_IP --user YOUR_USERNAME

# Déploiement production
./scripts/deploy.sh --branch main --host YOUR_VPS_IP --user YOUR_USERNAME
```

#### Option 2 : Docker Compose direct

```bash
# Sur le serveur VPS
git clone https://github.com/YOUR_USERNAME/iorecycling.git
cd iorecycling
cp env.example .env
# Éditer .env avec vos valeurs
docker compose -f docker-compose.prod.yml up -d --build
```

## 🔍 Vérification

### Services

```bash
# Vérifier l'état des services
docker compose ps

# Logs des services
docker compose logs -f [service_name]
```

### Endpoints

- **Application** : http://YOUR_VPS_IP:88
- **API Health** : http://YOUR_VPS_IP:88/api/health
- **Keycloak Admin** : http://YOUR_VPS_IP:88/auth/admin
- **MinIO Console** : http://YOUR_VPS_IP:9001

## 🛠️ Maintenance

### Mise à jour

```bash
# Via script
./scripts/deploy.sh --host YOUR_VPS_IP --user YOUR_USERNAME

# Via Git + Docker
git pull origin develop
docker compose down
docker compose up -d --build
```

### Nettoyage

```bash
# Nettoyer les images inutilisées
docker image prune -f

# Nettoyer les volumes inutilisés
docker volume prune -f
```

### Sauvegarde

```bash
# Sauvegarder la base de données
docker exec postgres pg_dump -U app app > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarder les volumes
docker run --rm -v iorecycling_pg:/data -v $(pwd):/backup alpine tar czf /backup/pg_backup.tar.gz -C /data .
```

## 🚨 Dépannage

### Services non démarrés

```bash
# Vérifier les logs
docker compose logs [service_name]

# Redémarrer un service
docker compose restart [service_name]
```

### Problèmes de connexion

```bash
# Vérifier la connectivité réseau
docker compose exec backend ping postgres
docker compose exec backend ping keycloak
```

### Problèmes de permissions

```bash
# Vérifier les permissions des volumes
docker compose exec postgres ls -la /var/lib/postgresql/data
```

## 📊 Monitoring

### Health Checks

Tous les services incluent des health checks :

```bash
# Vérifier la santé
docker compose ps
```

### Logs

```bash
# Logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend
```

## 🔒 Sécurité

### Recommandations

1. **Changez tous les mots de passe par défaut**
2. **Utilisez HTTPS en production** (configurer un reverse proxy)
3. **Limitez l'accès SSH** (IP whitelist)
4. **Sauvegardez régulièrement** les données
5. **Surveillez les logs** pour détecter les anomalies

### Firewall

```bash
# Ouvrir uniquement les ports nécessaires
ufw allow 22    # SSH
ufw allow 88    # Application
ufw allow 9001  # MinIO Console (optionnel)
ufw enable
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs : `docker compose logs`
2. Consultez ce guide de dépannage
3. Vérifiez la configuration des variables d'environnement
4. Contactez l'équipe de développement
