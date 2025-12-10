# Configuration Keycloak pour le développement local

Ce guide explique comment configurer Keycloak pour utiliser uniquement les URLs locales et éviter les appels vers des IPs externes.

## 🎯 Objectif

Forcer Keycloak à utiliser :
- **Frontend URL/Issuer** : `http://localhost:88/auth` (via Caddy) ou `http://keycloak:8080/auth` (réseau Docker interne)
- **JWKS URI** : `http://keycloak:8080/auth/realms/iorecycling/protocol/openid-connect/certs` (réseau Docker interne)

## 📋 Prérequis

- Docker et Docker Compose installés
- Keycloak démarré via `docker-compose up -d`
- `jq` installé (pour parser JSON dans les scripts)

## 🚀 Méthode rapide (recommandée)

Exécutez le script principal qui fait tout automatiquement :

```bash
# Via Caddy (recommandé pour le dev local)
./scripts/setup-keycloak-local.sh http://localhost:88/auth

# Ou via réseau Docker interne
./scripts/setup-keycloak-local.sh http://keycloak:8080/auth
```

## 🔧 Méthode manuelle

### Étape 1: Configurer le Frontend URL/Issuer

#### Option A: Via script (recommandé)

```bash
./scripts/configure-keycloak-realm-url-kcadm.sh http://localhost:88/auth
```

#### Option B: Via l'interface Keycloak Admin

1. Accédez à http://localhost:8081/auth/admin
2. Connectez-vous avec `admin` / `admin`
3. Sélectionnez le realm `iorecycling`
4. Allez dans **Realm Settings** > **General**
5. Définissez **Frontend URL** sur `http://localhost:88/auth`
6. Cliquez sur **Save**

### Étape 2: Vérifier la configuration

Vérifiez que l'issuer est correct :

```bash
curl -s http://localhost:8081/auth/realms/iorecycling/.well-known/openid-configuration | jq -r '.issuer'
```

Devrait afficher : `http://localhost:88/auth/realms/iorecycling`

### Étape 3: Redémarrer les services

```bash
docker-compose down
docker-compose up -d
```

### Étape 4: Régénérer un token

Les tokens existants continueront d'utiliser l'ancien issuer. Vous devez :

1. Vous reconnecter sur l'application frontend
2. Ou obtenir un nouveau token via l'API Keycloak

## 📝 Scripts disponibles

### `setup-keycloak-local.sh`
Script principal qui initialise et configure tout automatiquement.

### `configure-keycloak-realm-url-kcadm.sh`
Configure uniquement le Frontend URL/Issuer du realm via `kcadm.sh`.

### `configure-keycloak-realm-url.sh`
Alternative utilisant l'API REST de Keycloak (moins fiable que kcadm).

## 🔍 Vérification

### Vérifier l'issuer

```bash
curl -s http://localhost:8081/auth/realms/iorecycling/.well-known/openid-configuration | jq -r '.issuer'
```

### Vérifier le JWKS URI

```bash
curl -s http://localhost:8081/auth/realms/iorecycling/.well-known/openid-configuration | jq -r '.jwks_uri'
```

Devrait afficher : `http://keycloak:8080/auth/realms/iorecycling/protocol/openid-connect/certs`

### Vérifier la configuration Spring Boot

Le fichier `application.yml` doit contenir :

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: ${SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI:http://keycloak:8080/auth/realms/iorecycling/protocol/openid-connect/certs}
```

Et `docker-compose.yml` doit avoir :

```yaml
backend:
  environment:
    SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI: http://keycloak:8080/auth/realms/iorecycling/protocol/openid-connect/certs
```

## ⚠️ Notes importantes

1. **Tokens existants** : Les tokens générés avant la configuration continueront d'utiliser l'ancien issuer jusqu'à expiration. Régénérez un nouveau token après la configuration.

2. **Frontend URL vs Issuer** : Keycloak utilise le Frontend URL pour construire l'issuer dans les tokens. Si vous changez le Frontend URL, l'issuer changera automatiquement.

3. **Réseau Docker** : Le backend Spring Boot doit utiliser `http://keycloak:8080/auth` (nom du service Docker) pour accéder à Keycloak, pas `http://localhost:8080`.

4. **Caddy** : Si vous utilisez Caddy comme reverse proxy, le Frontend URL devrait être `http://localhost:88/auth` pour que les redirections fonctionnent correctement.

## 🐛 Dépannage

### Le script ne fonctionne pas

Assurez-vous que :
- Keycloak est démarré : `docker-compose ps keycloak`
- Keycloak est prêt : `curl http://localhost:8081/auth/realms/master`
- `jq` est installé : `jq --version`

### L'issuer ne change pas

1. Vérifiez que le Frontend URL est bien configuré dans Keycloak Admin
2. Régénérez un nouveau token (les anciens tokens gardent l'ancien issuer)
3. Redémarrez Keycloak si nécessaire : `docker-compose restart keycloak`

### Erreur 401 sur l'API

1. Vérifiez que le token contient le bon issuer
2. Vérifiez que le JWKS URI est accessible depuis le backend
3. Vérifiez les logs du backend pour voir quelle URL est utilisée

