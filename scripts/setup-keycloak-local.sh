#!/bin/bash

# Script principal pour configurer Keycloak en mode local (dev)
# Configure le Frontend URL/Issuer sur l'URL locale et force le JWKS local
# Usage: ./scripts/setup-keycloak-local.sh [frontend-url]
# Exemple: ./scripts/setup-keycloak-local.sh http://localhost:88/auth

set -e

echo "🚀 Configuration complète de Keycloak pour le développement local"
echo "=================================================================="
echo ""

# Frontend URL par défaut (via Caddy) ou argument passé
FRONTEND_URL="${1:-http://localhost:88/auth}"

echo "📍 Configuration avec Frontend URL: $FRONTEND_URL"
echo ""

# Vérifier que docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erreur: docker-compose.yml non trouvé"
    echo "Exécutez ce script depuis la racine du projet"
    exit 1
fi

# Étape 1: Vérifier/Initialiser Keycloak
echo "📦 Étape 1/3: Initialisation de Keycloak..."
if [ -f "scripts/init-keycloak-simple.sh" ]; then
    chmod +x scripts/init-keycloak-simple.sh
    ./scripts/init-keycloak-simple.sh
else
    echo "⚠️  Script init-keycloak-simple.sh non trouvé, passage à l'étape suivante..."
fi

echo ""

# Étape 2: Configurer le Frontend URL/Issuer
echo "🔧 Étape 2/3: Configuration du Frontend URL/Issuer..."
if [ -f "scripts/configure-keycloak-realm-url-kcadm.sh" ]; then
    chmod +x scripts/configure-keycloak-realm-url-kcadm.sh
    ./scripts/configure-keycloak-realm-url-kcadm.sh "$FRONTEND_URL"
else
    echo "⚠️  Script configure-keycloak-realm-url-kcadm.sh non trouvé"
    echo "   Vous pouvez configurer manuellement dans Keycloak Admin:"
    echo "   Realm Settings > General > Frontend URL: $FRONTEND_URL"
fi

echo ""

# Étape 3: Vérifier la configuration
echo "✅ Étape 3/3: Vérification de la configuration..."
KEYCLOAK_URL="http://localhost:8081/auth"
REALM_NAME="iorecycling"

# Vérifier que Keycloak répond
if curl -sf http://localhost:8081/auth/realms/master >/dev/null 2>&1; then
    echo "   ✅ Keycloak est accessible"
    
    # Vérifier l'issuer
    ISSUER=$(curl -s "$KEYCLOAK_URL/auth/realms/$REALM_NAME/.well-known/openid-configuration" 2>/dev/null | jq -r '.issuer // "non disponible"' || echo "non disponible")
    echo "   📍 Issuer détecté: $ISSUER"
    
    # Vérifier le JWKS
    JWKS_URI=$(curl -s "$KEYCLOAK_URL/auth/realms/$REALM_NAME/.well-known/openid-configuration" 2>/dev/null | jq -r '.jwks_uri // "non disponible"' || echo "non disponible")
    echo "   🔑 JWKS URI: $JWKS_URI"
else
    echo "   ⚠️  Keycloak n'est pas accessible sur http://localhost:8081"
fi

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 Résumé de la configuration :"
echo "   - Frontend URL/Issuer: $FRONTEND_URL"
echo "   - JWKS URI: http://keycloak:8080/auth/realms/$REALM_NAME/protocol/openid-connect/certs"
echo ""
echo "⚠️  Actions requises :"
echo "   1. Redémarrez docker-compose si nécessaire:"
echo "      docker-compose down && docker-compose up -d"
echo ""
echo "   2. Régénérez un nouveau token depuis Keycloak"
echo "      Les tokens existants continueront d'utiliser l'ancien issuer jusqu'à expiration"
echo ""
echo "   3. Testez l'API avec le nouveau token"
echo ""
echo "💡 Pour utiliser l'URL Docker interne à la place:"
echo "   ./scripts/setup-keycloak-local.sh http://keycloak:8080/auth"
echo ""

