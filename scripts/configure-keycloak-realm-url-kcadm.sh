#!/bin/bash

# Script pour configurer le Frontend URL/Issuer du realm Keycloak sur l'URL locale
# Utilise kcadm.sh (plus fiable que l'API REST)
# Usage: ./scripts/configure-keycloak-realm-url-kcadm.sh [frontend-url]
# Exemple: ./scripts/configure-keycloak-realm-url-kcadm.sh http://localhost:88/auth

set -e

export MSYS2_ARG_CONV_EXCL="*"

echo "🔧 Configuration du Frontend URL/Issuer du realm Keycloak (via kcadm)"
echo "===================================================================="

# Variables
KEYCLOAK_URL="http://localhost:8080/auth"
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

# Fonction pour exécuter des commandes kcadm
run_kcadm() {
    docker compose exec -T keycloak /opt/keycloak/bin/kcadm.sh "$@"
}

# Connexion à Keycloak
echo "🔑 Connexion à Keycloak..."
run_kcadm config credentials --server $KEYCLOAK_URL --realm master --user $ADMIN_USER --password $ADMIN_PASSWORD

# Vérifier si le realm existe
if ! run_kcadm get realms/$REALM_NAME >/dev/null 2>&1; then
    echo "❌ Erreur: Le realm '$REALM_NAME' n'existe pas"
    echo "Exécutez d'abord: ./scripts/init-keycloak-simple.sh"
    exit 1
fi

echo "ℹ️  Le realm '$REALM_NAME' existe"

# Récupérer la configuration actuelle
echo "📥 Récupération de la configuration actuelle..."
REALM_CONFIG=$(run_kcadm get realms/$REALM_NAME)
CURRENT_FRONTEND_URL=$(echo "$REALM_CONFIG" | jq -r '.attributes.frontendUrl // empty' || echo "non-defini")

echo "   Frontend URL actuel: ${CURRENT_FRONTEND_URL:-non-defini}"

# Mettre à jour le Frontend URL
echo "🔄 Mise à jour du Frontend URL/Issuer..."
# Utiliser update avec l'attribut frontendUrl
# Note: Keycloak utilise frontendUrl pour construire l'issuer dans les tokens
run_kcadm update realms/$REALM_NAME -s "attributes.frontendUrl=$FRONTEND_URL"

echo "✅ Frontend URL mis à jour avec succès"

# Vérifier la configuration mise à jour
echo "🔍 Vérification de la configuration..."
UPDATED_REALM_CONFIG=$(run_kcadm get realms/$REALM_NAME)
UPDATED_FRONTEND_URL=$(echo "$UPDATED_REALM_CONFIG" | jq -r '.attributes.frontendUrl // empty' || echo "non-defini")

echo "   Frontend URL vérifié: ${UPDATED_FRONTEND_URL:-non-defini}"

# Afficher l'issuer actuel (via l'endpoint .well-known)
echo "🔍 Vérification de l'issuer via .well-known..."
ISSUER=$(curl -s "$KEYCLOAK_URL/auth/realms/$REALM_NAME/.well-known/openid-configuration" | jq -r '.issuer // "non disponible"')
echo "   Issuer actuel: $ISSUER"

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 Résumé :"
echo "   - Realm: $REALM_NAME"
echo "   - Frontend URL: $FRONTEND_URL"
echo "   - Issuer détecté: $ISSUER"
echo ""
echo "⚠️  Important: Régénérez un nouveau token depuis Keycloak pour que les changements prennent effet"
echo "   Les tokens existants continueront d'utiliser l'ancien issuer jusqu'à expiration"
echo ""
echo "💡 Pour utiliser l'URL Docker interne à la place:"
echo "   ./scripts/configure-keycloak-realm-url-kcadm.sh http://keycloak:8080/auth"
echo ""

