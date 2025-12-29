# 🚀 Déploiement Production - IORecycling

## 📋 Fichiers inclus

- `docker-compose.yml` - Configuration Docker Compose pour production
- `.env` - Variables d'environnement (généré automatiquement)
- `Caddyfile` - Configuration du reverse proxy
- `init.sh` - Script d'initialisation automatique
- `start.sh` - Script de démarrage automatique

## 🚀 Démarrage automatique (recommandé)

Le moyen le plus simple de démarrer l'application sur **n'importe quel serveur** :

### 1. Copier le dossier `prod` sur le serveur

```bash
# Depuis votre machine locale
scp -r prod user@votre-serveur:/opt/iorecycling/
```

### 2. Se connecter au serveur

```bash
ssh user@votre-serveur
cd /opt/iorecycling/prod
```

### 3. Rendre les scripts exécutables

```bash
chmod +x init.sh start.sh
```

### 4. Démarrer (tout est automatique !)

```bash
./start.sh
```

Le script `start.sh` va :
1. ✅ Détecter automatiquement l'IP du serveur
2. ✅ Créer/configurer le fichier `.env` avec l'IP détectée
3. ✅ Créer le dossier `logs`
4. ✅ Démarrer tous les services avec `docker compose up -d --build`

## 🔧 Démarrage manuel

Si vous préférez démarrer manuellement :

### 1. Initialiser (détecte l'IP et crée le .env)

```bash
./init.sh
```

### 2. Modifier les mots de passe dans .env (optionnel mais recommandé)

```bash
nano .env
```

Changez au minimum :
- `POSTGRES_PASSWORD` - Mot de passe PostgreSQL
- `KEYCLOAK_ADMIN_PASSWORD` - Mot de passe admin Keycloak
- `MINIO_ROOT_PASSWORD` - Mot de passe MinIO

### 3. Démarrer les services

```bash
docker compose up -d --build
```

### 6. Vérifier les logs

```bash
# Logs de tous les services
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend
```

### 7. Vérifier l'état des services

```bash
docker compose ps
```

## 🌐 URLs de l'application

Une fois démarré, l'application sera accessible sur :

- **Frontend** : http://VOTRE_IP:88/
- **API Backend** : http://VOTRE_IP:88/api
- **Keycloak** : http://VOTRE_IP:88/auth/
- **MinIO Console** : http://VOTRE_IP:9001/

L'IP sera détectée automatiquement et affichée lors de l'initialisation.

## 🔒 Configuration du firewall

```bash
# Sur le serveur DigitalOcean
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 88/tcp
ufw allow 9001/tcp
ufw enable
```

## 📝 Commandes utiles

```bash
# Arrêter les services
docker compose down

# Redémarrer les services
docker compose restart

# Reconstruire et redémarrer
docker compose up -d --build

# Voir les logs en temps réel
docker compose logs -f

# Vérifier l'état
docker compose ps
```

## ⚠️ Notes importantes

1. **Mots de passe** : Changez TOUS les mots de passe dans le `.env` avant le déploiement
2. **Volumes** : Les données PostgreSQL et MinIO sont persistées dans des volumes Docker
3. **Logs** : Les logs du backend sont dans `./logs` sur le serveur
4. **Build** : Le premier démarrage peut prendre plusieurs minutes car il construit les images depuis GitHub

## 🆘 Dépannage

### Les services ne démarrent pas

```bash
# Vérifier les logs
docker compose logs

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

### Erreur de connexion à la base de données

Vérifiez que PostgreSQL est démarré :
```bash
docker compose ps postgres
docker compose logs postgres
```

### Erreur de build depuis GitHub

Si le build depuis GitHub échoue, vérifiez :
- La connexion internet du serveur
- Que la branche `main` existe sur GitHub
- Les logs de build : `docker compose logs backend`

