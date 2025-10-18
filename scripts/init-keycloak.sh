#!/bin/bash

# Script d'initialisation Keycloak pour IORecycling
# Usage: ./scripts/init-keycloak.sh

set -e

echo "🔐 Initialisation de Keycloak pour IORecycling"
echo "=============================================="

# Attendre que Keycloak soit prêt
echo "⏳ Attente que Keycloak soit prêt..."
until curl -f http://localhost:8080/health/ready 2>/dev/null; do
    echo "   Keycloak n'est pas encore prêt, attente..."
    sleep 5
done

echo "✅ Keycloak est prêt"

# Variables
KEYCLOAK_URL="http://localhost:8080"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin"
REALM_NAME="iorecycling"
CLIENT_ID="frontend"

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

# Vérifier si le realm existe déjà
REALM_EXISTS=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$KEYCLOAK_URL/admin/realms/$REALM_NAME" | jq -r '.realm // empty')

if [ -n "$REALM_EXISTS" ]; then
    echo "ℹ️  Le realm '$REALM_NAME' existe déjà"
else
    # Créer le realm
    echo "🏗️  Création du realm '$REALM_NAME'..."
    curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "realm": "'$REALM_NAME'",
            "enabled": true,
            "displayName": "IORecycling",
            "displayNameHtml": "<div class=\"kc-logo-text\"><span>IORecycling</span></div>",
            "loginTheme": "keycloak",
            "accountTheme": "keycloak",
            "adminTheme": "keycloak",
            "emailTheme": "keycloak"
        }'
    echo "✅ Realm '$REALM_NAME' créé"
fi

# Obtenir le token pour le realm iorecycling
REALM_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$ADMIN_USER" \
    -d "password=$ADMIN_PASSWORD" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | jq -r '.access_token')

# Vérifier si le client existe
CLIENT_EXISTS=$(curl -s -H "Authorization: Bearer $REALM_TOKEN" \
    "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients?clientId=$CLIENT_ID" | jq -r '.[0].id // empty')

if [ -n "$CLIENT_EXISTS" ]; then
    echo "ℹ️  Le client '$CLIENT_ID' existe déjà"
else
    # Créer le client frontend
    echo "🏗️  Création du client '$CLIENT_ID'..."
    curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
        -H "Authorization: Bearer $REALM_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "clientId": "'$CLIENT_ID'",
            "enabled": true,
            "publicClient": true,
            "standardFlowEnabled": true,
            "implicitFlowEnabled": false,
            "directAccessGrantsEnabled": false,
            "serviceAccountsEnabled": false,
            "redirectUris": ["http://localhost:88/*", "http://146.59.234.174:88/*"],
            "webOrigins": ["http://localhost:88", "http://146.59.234.174:88"],
            "protocol": "openid-connect",
            "attributes": {
                "saml.assertion.signature": "false",
                "saml.force.post.binding": "false",
                "saml.multivalued.roles": "false",
                "saml.encrypt": "false",
                "saml.server.signature": "false",
                "saml.server.signature.keyinfo.ext": "false",
                "exclude.session.state.from.auth.response": "false",
                "saml_force_name_id_format": "false",
                "saml.client.signature": "false",
                "tls.client.certificate.bound.access.tokens": "false",
                "saml.authnstatement": "false",
                "display.on.consent.screen": "false",
                "saml.onetimeuse.condition": "false"
            }
        }'
    echo "✅ Client '$CLIENT_ID' créé"
fi

# Créer les utilisateurs de test
echo "👥 Création des utilisateurs de test..."

# Utilisateur client1
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
    -H "Authorization: Bearer $REALM_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "client1",
        "enabled": true,
        "emailVerified": true,
        "firstName": "Client",
        "lastName": "Test",
        "email": "client1@iorecycling.ma",
        "credentials": [{
            "type": "password",
            "value": "client1",
            "temporary": false
        }],
        "attributes": {
            "clientId": ["1"]
        }
    }' || echo "Utilisateur client1 peut déjà exister"

# Utilisateur admin
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
    -H "Authorization: Bearer $REALM_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "admin",
        "enabled": true,
        "emailVerified": true,
        "firstName": "Admin",
        "lastName": "System",
        "email": "admin@iorecycling.ma",
        "credentials": [{
            "type": "password",
            "value": "admin",
            "temporary": false
        }]
    }' || echo "Utilisateur admin peut déjà exister"

echo "✅ Utilisateurs de test créés"

echo ""
echo "🎉 Initialisation Keycloak terminée !"
echo ""
echo "📋 Informations de connexion :"
echo "   - Realm: $REALM_NAME"
echo "   - Client: $CLIENT_ID"
echo "   - Utilisateurs:"
echo "     * client1 / client1 (clientId=1)"
echo "     * admin / admin"
echo ""
echo "🌐 URLs d'accès :"
echo "   - Keycloak Admin: http://146.59.234.174:88/auth/admin/"
echo "   - Application: http://146.59.234.174:88/"
