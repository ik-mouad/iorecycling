#!/bin/bash

# Script de réparation rapide Keycloak
# Usage: ./scripts/fix-keycloak.sh

set -e

echo "🔧 Réparation rapide Keycloak"
echo "============================="

# Vérifier que Keycloak est démarré
if ! docker compose ps keycloak | grep -q "Up"; then
    echo "❌ Keycloak n'est pas démarré. Démarrage..."
    docker compose up -d keycloak
    echo "⏳ Attente du démarrage de Keycloak..."
    sleep 20
fi

# Initialiser Keycloak
echo "🔐 Initialisation de Keycloak..."
chmod +x scripts/init-keycloak.sh
./scripts/init-keycloak.sh

echo "✅ Réparation Keycloak terminée !"
echo "🌐 Testez maintenant: http://146.59.234.174:88/"
