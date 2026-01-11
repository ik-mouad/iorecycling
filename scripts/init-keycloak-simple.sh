#!/bin/bash
set -e

echo "🔐 Initialisation Keycloak pour IORecycling"
echo "============================================"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erreur: docker-compose.yml non trouvé"
    echo "Exécutez ce script depuis /opt/iorecycling"
    exit 1
fi

# Vérifier que Keycloak est démarré
if ! docker compose ps keycloak | grep -q "Up"; then
    echo "❌ Keycloak n'est pas démarré. Démarrage..."
    docker compose up -d keycloak
    echo "⏳ Attente du démarrage de Keycloak..."
    sleep 30
fi

echo "✅ Keycloak est démarré"

# Attendre que Keycloak soit prêt
echo "⏳ Attente que Keycloak soit prêt..."
until curl -sf http://localhost:8081/auth/realms/master >/dev/null 2>&1; do
    echo "   Keycloak n'est pas encore prêt, attente..."
    sleep 5
done

echo "✅ Keycloak est prêt"

# Variables
KEYCLOAK_URL="http://localhost:8081/auth"
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
            "displayNameHtml": "<div class=\"kc-logo-text\"><span>IORecycling</span></div>"
        }'
    echo "✅ Realm '$REALM_NAME' créé"
fi

# Vérifier si le client existe
CLIENT_EXISTS=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients?clientId=$CLIENT_ID" | jq -r 'if type=="array" and length>0 and (.[0]|has("id")) then .[0].id else empty end')

if [ -n "$CLIENT_EXISTS" ]; then
    echo "ℹ️  Le client '$CLIENT_ID' existe déjà"
else
    # Créer le client frontend
    echo "🏗️  Création du client '$CLIENT_ID'..."
    curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "clientId": "'$CLIENT_ID'",
            "enabled": true,
            "publicClient": true,
            "standardFlowEnabled": true,
            "implicitFlowEnabled": false,
            "directAccessGrantsEnabled": false,
            "serviceAccountsEnabled": false,
            "redirectUris": ["http://146.59.234.174:88/*", "http://localhost:88/*"],
            "webOrigins": ["http://146.59.234.174:88", "http://localhost:88"],
            "protocol": "openid-connect"
        }'
    echo "✅ Client '$CLIENT_ID' créé"
fi

# Créer les utilisateurs de test
echo "👥 Création des utilisateurs de test..."

# Utilisateur client1
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
    -H "Authorization: Bearer $TOKEN" \
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
    -H "Authorization: Bearer $TOKEN" \
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
echo "   - Application: http://146.59.234.174:88/"
echo "   - Keycloak Admin: http://146.59.234.174:88/auth/admin/"
echo ""
echo "✅ Testez maintenant la connexion sur l'application !"
