# 🔐 Configuration Keycloak - Production

## 📋 Configuration actuelle

Keycloak est configuré pour fonctionner sur le serveur **167.172.117.113** avec les paramètres suivants :

### URLs d'accès

- **Console Admin Keycloak** : http://167.172.117.113:88/auth/
- **API Keycloak** : http://167.172.117.113:88/auth/
- **Port direct** : http://167.172.117.113:8081/ (si besoin)

### Identifiants par défaut

Les identifiants sont définis dans le fichier `.env` :

```bash
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=VotreMotDePasseKeycloak123!
```

**⚠️ IMPORTANT** : Changez le mot de passe dans le fichier `.env` avant le premier déploiement !

## 🚀 Première configuration

### 1. Accéder à la console Keycloak

Une fois les services démarrés :

```bash
# Ouvrir dans le navigateur
http://167.172.117.113:88/auth/
```

### 2. Se connecter

- **Username** : `admin` (ou la valeur de `KEYCLOAK_ADMIN_USERNAME`)
- **Password** : Le mot de passe défini dans `KEYCLOAK_ADMIN_PASSWORD`

### 3. Créer le Realm `iorecycling`

1. Cliquer sur le dropdown en haut à gauche (actuellement "Master")
2. Cliquer sur "Create Realm"
3. Nom du realm : `iorecycling`
4. Cliquer sur "Create"

### 4. Créer le Client Backend

1. Dans le realm `iorecycling`, aller dans **Clients**
2. Cliquer sur **Create client**
3. **Client ID** : `iorecycling-backend`
4. **Client protocol** : `openid-connect`
5. Cliquer sur **Next**
6. **Access Type** : `confidential`
7. **Standard Flow Enabled** : `ON`
8. **Direct Access Grants Enabled** : `ON`
9. Cliquer sur **Save**
10. Dans l'onglet **Credentials**, copier le **Secret** (vous en aurez besoin pour le backend)

### 5. Créer le Client Frontend

1. Toujours dans **Clients**, cliquer sur **Create client**
2. **Client ID** : `iorecycling-frontend`
3. **Client protocol** : `openid-connect`
4. Cliquer sur **Next**
5. **Access Type** : `public`
6. **Standard Flow Enabled** : `ON`
7. **Direct Access Grants Enabled** : `ON`
8. **Valid Redirect URIs** : 
   - `http://167.172.117.113:88/*`
   - `http://localhost:88/*` (pour développement local)
9. **Web Origins** : `*`
10. Cliquer sur **Save**

### 6. Créer des utilisateurs de test

1. Aller dans **Users**
2. Cliquer sur **Add user**
3. Remplir :
   - **Username** : `client1`
   - **Email** : `client1@example.com`
   - **Email Verified** : `ON`
   - **Enabled** : `ON`
4. Cliquer sur **Save**
5. Aller dans l'onglet **Credentials**
6. Définir un mot de passe temporaire
7. **Temporary** : `OFF` (pour que le mot de passe soit permanent)
8. Cliquer sur **Save**

## 🔧 Configuration dans le backend

Le backend Spring Boot doit être configuré avec :

```yaml
keycloak:
  auth-server-url: http://keycloak:8080/auth
  realm: iorecycling
  resource: iorecycling-backend
  credentials:
    secret: <SECRET_COPIE_DANS_KEYCLOAK>
```

Ces valeurs sont déjà configurées dans le `docker-compose.yml` via les variables d'environnement.

## 🔧 Configuration dans le frontend

Le frontend Angular doit être configuré avec :

```typescript
keycloak: {
  url: 'http://167.172.117.113:88/auth',
  realm: 'iorecycling',
  clientId: 'iorecycling-frontend'
}
```

Ces valeurs sont déjà configurées dans le `.env` et utilisées lors du build.

## 📊 Vérification

### Vérifier que Keycloak fonctionne

```bash
# Depuis le serveur
curl http://localhost:8080/health/ready

# Depuis l'extérieur
curl http://167.172.117.113:88/auth/health/ready
```

### Vérifier les logs

```bash
docker compose logs keycloak
docker compose logs -f keycloak
```

## 🔒 Sécurité

### Recommandations

1. **Changez le mot de passe admin** immédiatement après la première connexion
2. **Utilisez HTTPS** en production (configurer un certificat SSL)
3. **Limitez l'accès** au port 8081 (Keycloak direct) via firewall
4. **Activez 2FA** pour les comptes administrateurs
5. **Configurez des politiques de mot de passe** dans Keycloak

### Configuration du firewall

```bash
# Autoriser uniquement le port 88 (via Caddy)
ufw allow 88/tcp

# Bloquer l'accès direct à Keycloak (port 8081) depuis l'extérieur
# (Keycloak reste accessible via Caddy sur le port 88)
```

## 🆘 Dépannage

### Keycloak ne démarre pas

```bash
# Vérifier les logs
docker compose logs keycloak

# Vérifier la connexion à PostgreSQL
docker compose exec keycloak env | grep KC_DB
```

### Erreur de connexion à la base de données

Vérifiez que PostgreSQL est démarré et accessible :

```bash
docker compose ps postgres
docker compose logs postgres
```

### Erreur "Invalid redirect URI"

Vérifiez que les **Valid Redirect URIs** dans le client frontend incluent :
- `http://167.172.117.113:88/*`

### Réinitialiser Keycloak

⚠️ **Attention** : Cela supprimera toutes les données Keycloak !

```bash
# Arrêter les services
docker compose down

# Supprimer le volume Keycloak
docker volume rm prod_keycloak_data

# Redémarrer
docker compose up -d
```

## 📚 Documentation

- [Documentation Keycloak](https://www.keycloak.org/documentation)
- [Guide d'administration Keycloak](https://www.keycloak.org/docs/latest/server_admin/)

