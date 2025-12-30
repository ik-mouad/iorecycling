#!/bin/bash
# Script d'initialisation automatique pour IORecycling
# Détecte l'IP du serveur et configure le .env

set -e

echo "🚀 Initialisation IORecycling..."

# Détecter l'IP publique du serveur
echo "📡 Détection de l'IP du serveur..."
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || curl -s ipinfo.io/ip || hostname -I | awk '{print $1}')

if [ -z "$SERVER_IP" ]; then
    echo "⚠️  Impossible de détecter l'IP automatiquement"
    read -p "Entrez l'IP du serveur: " SERVER_IP
fi

echo "✅ IP détectée: $SERVER_IP"

# Créer le dossier logs s'il n'existe pas avec les bonnes permissions
mkdir -p logs
chmod 777 logs  # Permissions pour que appuser (uid 1001) puisse écrire

# Créer ou mettre à jour le .env
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cat > .env << EOF
# ===========================================
# IORecycling - Variables d'environnement PRODUCTION
# IP détectée automatiquement: $SERVER_IP
# ===========================================

# Environnement
SPRING_PROFILES_ACTIVE=prod

# Base de données PostgreSQL
POSTGRES_USER=app
POSTGRES_PASSWORD=\${POSTGRES_PASSWORD:-ChangeMe123!}
POSTGRES_DB=app

# Keycloak
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=\${KEYCLOAK_ADMIN_PASSWORD:-ChangeMe123!}
KEYCLOAK_REALM=iorecycling
KEYCLOAK_CLIENT_ID=iorecycling-backend
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KC_HOSTNAME=$SERVER_IP
KC_HOSTNAME_URL=http://$SERVER_IP:88/auth

# MinIO
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=\${MINIO_ROOT_PASSWORD:-ChangeMe123!}
MINIO_BUCKET=docs

# Caddy
CADDY_PORT=88

# Frontend
REACT_APP_API_URL=http://$SERVER_IP:88/api
REACT_APP_KEYCLOAK_URL=http://$SERVER_IP:88/auth
REACT_APP_KEYCLOAK_REALM=iorecycling
REACT_APP_KEYCLOAK_CLIENT_ID=iorecycling-frontend
EOF
    echo "✅ Fichier .env créé avec l'IP: $SERVER_IP"
    echo "⚠️  IMPORTANT: Modifiez les mots de passe dans .env avant de démarrer!"
else
    echo "📝 Mise à jour de l'IP dans .env..."
    sed -i "s|KC_HOSTNAME=.*|KC_HOSTNAME=$SERVER_IP|g" .env
    sed -i "s|KC_HOSTNAME_URL=.*|KC_HOSTNAME_URL=http://$SERVER_IP:88/auth|g" .env
    sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=http://$SERVER_IP:88/api|g" .env
    sed -i "s|REACT_APP_KEYCLOAK_URL=.*|REACT_APP_KEYCLOAK_URL=http://$SERVER_IP:88/auth|g" .env
    echo "✅ IP mise à jour dans .env: $SERVER_IP"
fi

echo ""
echo "✅ Initialisation terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifiez/modifiez les mots de passe dans .env"
echo "   2. Lancez: docker compose up -d"
echo ""
echo "🌐 L'application sera accessible sur: http://$SERVER_IP:88/"

