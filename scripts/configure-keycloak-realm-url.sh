#!/bin/bash

# Script pour configurer le Frontend URL/Issuer du realm Keycloak sur l'URL locale
# Usage: ./scripts/configure-keycloak-realm-url.sh [frontend-url]
# Exemple: ./scripts/configure-keycloak-realm-url.sh http://localhost:88/auth

set -e

echo "🔧 Configuration du Frontend URL/Issuer du realm Keycloak"
echo "========================================================="

# Variables
KEYCLOAK_URL="http://localhost:8081/auth"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin"
REALM_NAME="iorecycling"

# Frontend URL par défaut (via Caddy) ou argument passé
FRONTEND_URL="${1:-http://localhost:88/auth}"

echo "📍 Frontend URL/Issuer à configurer: $FRONTEND_URL"

# Vérifier que Keycloak est démarré
if ! docker compose ps keycloak | grep -q "Up"; then
    echo "❌ Keycloak n'est pas démarré. Démarrage..."
    docker compose up -d keycloak
    echo "⏳ Attente du démarrage de Keycloak..."
    sleep 30
fi

# Attendre que Keycloak soit prêt
echo "⏳ Attente que Keycloak soit prêt..."
until curl -sf http://localhost:8081/auth/realms/master >/dev/null 2>&1; do
    echo "   Keycloak n'est pas encore prêt, attente..."
    sleep 5
done

echo "✅ Keycloak est prêt"

# Obtenir le token d'administration
echo "🔑 Connexion à Keycloak..."
TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$ADMIN_USER" \
    -d "password=$ADMIN_PASSWORD" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Erreur: Impossible d'obtenir le token d'administration"
    echo "Vérifiez que Keycloak est démarré et que les identifiants sont corrects"
    exit 1
fi

echo "✅ Token d'administration obtenu"

# Vérifier si le realm existe
REALM_EXISTS=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$KEYCLOAK_URL/admin/realms/$REALM_NAME" | jq -r '.realm // empty')

if [ -z "$REALM_EXISTS" ]; then
    echo "❌ Erreur: Le realm '$REALM_NAME' n'existe pas"
    echo "Exécutez d'abord: ./scripts/init-keycloak-simple.sh"
    exit 1
fi

echo "ℹ️  Le realm '$REALM_NAME' existe"

# Récupérer la configuration actuelle du realm
echo "📥 Récupération de la configuration actuelle du realm..."
CURRENT_REALM=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$KEYCLOAK_URL/admin/realms/$REALM_NAME")

# Afficher la configuration actuelle
CURRENT_FRONTEND_URL=$(echo "$CURRENT_REALM" | jq -r '.attributes.frontendUrl // "non-defini"')
CURRENT_ISSUER=$(echo "$CURRENT_REALM" | jq -r '.attributes.issuer // "non-defini"')

echo "   Frontend URL actuel: $CURRENT_FRONTEND_URL"
echo "   Issuer actuel: $CURRENT_ISSUER"

# Mettre à jour le realm avec le nouveau Frontend URL
echo "🔄 Mise à jour du Frontend URL/Issuer..."
UPDATE_RESPONSE=$(curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$REALM_NAME" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$(echo "$CURRENT_REALM" | jq --arg frontendUrl "$FRONTEND_URL" '
        .attributes.frontendUrl = $frontendUrl |
        .attributes.issuer = $frontendUrl
    ')")

if [ $? -eq 0 ]; then
    echo "✅ Frontend URL/Issuer mis à jour avec succès"
    echo "   Nouveau Frontend URL: $FRONTEND_URL"
    echo "   Nouveau Issuer: $FRONTEND_URL"
else
    echo "❌ Erreur lors de la mise à jour"
    exit 1
fi

# Vérifier la configuration mise à jour
echo "🔍 Vérification de la configuration..."
UPDATED_REALM=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$KEYCLOAK_URL/admin/realms/$REALM_NAME")

VERIFIED_FRONTEND_URL=$(echo "$UPDATED_REALM" | jq -r '.attributes.frontendUrl // "non-defini"')
VERIFIED_ISSUER=$(echo "$UPDATED_REALM" | jq -r '.attributes.issuer // "non-defini"')

echo "   Frontend URL vérifié: $VERIFIED_FRONTEND_URL"
echo "   Issuer vérifié: $VERIFIED_ISSUER"

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 Résumé :"
echo "   - Realm: $REALM_NAME"
echo "   - Frontend URL: $FRONTEND_URL"
echo "   - Issuer: $FRONTEND_URL"
echo ""
echo "⚠️  Important: Régénérez un nouveau token depuis Keycloak pour que les changements prennent effet"
echo "   Les tokens existants continueront d'utiliser l'ancien issuer jusqu'à expiration"
echo ""

