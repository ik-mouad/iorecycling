#!/bin/bash

# Script pour créer un utilisateur admin dans Keycloak
# Usage: ./scripts/setup-admin-user.sh

set -e

echo "🔧 Configuration de l'utilisateur admin dans Keycloak..."

# Attendre que Keycloak soit prêt
echo "⏳ Attente que Keycloak soit prêt..."
until curl -f http://localhost:8080/auth/realms/master >/dev/null 2>&1; do
    echo "   Keycloak n'est pas encore prêt, attente..."
    sleep 5
done

echo "✅ Keycloak est prêt !"

# Variables
KEYCLOAK_URL="http://localhost:8080"
REALM="iorecycling"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_EMAIL="admin@iorecycling.ma"

# Fonction pour exécuter des commandes kcadm (docker compose v2)
run_kcadm() {
    docker compose exec -T keycloak /opt/keycloak/bin/kcadm.sh "$@"
}

echo "🔑 Connexion à Keycloak..."
run_kcadm config credentials --server $KEYCLOAK_URL --realm master --user admin --password admin

echo "🏗️  Création du realm '$REALM'..."
# Vérifier si le realm existe déjà
if run_kcadm get realms/$REALM >/dev/null 2>&1; then
    echo "   Le realm '$REALM' existe déjà"
else
    echo "   Création du realm '$REALM'..."
    run_kcadm create realms -s realm=$REALM -s enabled=true -s displayName="IORecycling"
fi

echo "👤 Création de l'utilisateur admin..."
# Vérifier si l'utilisateur existe déjà
if run_kcadm get users -r $REALM --query username=$ADMIN_USERNAME >/dev/null 2>&1; then
    echo "   L'utilisateur '$ADMIN_USERNAME' existe déjà"
else
    echo "   Création de l'utilisateur '$ADMIN_USERNAME'..."
    USER_ID=$(run_kcadm create users -r $REALM -s username=$ADMIN_USERNAME -s email=$ADMIN_EMAIL -s firstName="Admin" -s lastName="IORecycling" -s enabled=true -i)
    
    echo "   Définition du mot de passe..."
    run_kcadm update users/$USER_ID/reset-password -r $REALM -s type=password -s value=$ADMIN_PASSWORD -s temporary=false
fi

echo "🔐 Attribution du rôle ADMIN..."
# Récupérer l'ID du rôle ADMIN
ADMIN_ROLE_ID=$(run_kcadm get roles/ADMIN -r $REALM --format csv --noquotes | cut -d',' -f1 | tail -n +2)

if [ -z "$ADMIN_ROLE_ID" ]; then
    echo "   Création du rôle ADMIN..."
    run_kcadm create roles -r $REALM -s name=ADMIN -s description="Administrateur système"
    ADMIN_ROLE_ID=$(run_kcadm get roles/ADMIN -r $REALM --format csv --noquotes | cut -d',' -f1 | tail -n +2)
fi

# Récupérer l'ID de l'utilisateur
USER_ID=$(run_kcadm get users -r $REALM --query username=$ADMIN_USERNAME --format csv --noquotes | cut -d',' -f1 | tail -n +2)

# Assigner le rôle à l'utilisateur
echo "   Attribution du rôle ADMIN à l'utilisateur..."
run_kcadm create users/$USER_ID/role-mappings/realm -r $REALM -s '[{"id":"'$ADMIN_ROLE_ID'","name":"ADMIN"}]'

echo "🏢 Création du client backend..."
# Vérifier si le client existe déjà
if run_kcadm get clients -r $REALM --query clientId=iorecycling-backend >/dev/null 2>&1; then
    echo "   Le client 'iorecycling-backend' existe déjà"
else
    echo "   Création du client 'iorecycling-backend'..."
    run_kcadm create clients -r $REALM -s clientId=iorecycling-backend -s enabled=true -s publicClient=false -s serviceAccountsEnabled=true -s directAccessGrantsEnabled=true
fi

echo "🌐 Création du client frontend..."
# Vérifier si le client existe déjà (clientId=frontend attendu par le frontend Angular)
if run_kcadm get clients -r $REALM --query clientId=frontend >/dev/null 2>&1; then
    echo "   Le client 'frontend' existe déjà"
else
    echo "   Création du client 'frontend'..."
    run_kcadm create clients -r $REALM \
      -s clientId=frontend \
      -s enabled=true \
      -s publicClient=true \
      -s standardFlowEnabled=true \
      -s implicitFlowEnabled=false \
      -s directAccessGrantsEnabled=false \
      -s 'redirectUris=["http://localhost:4200/*","http://146.59.234.174:88/*"]' \
      -s 'webOrigins=["http://localhost:4200","http://146.59.234.174:88"]'
fi

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 Informations de connexion admin :"
echo "   URL: http://localhost:8080/auth/admin"
echo "   Realm: $REALM"
echo "   Utilisateur: $ADMIN_USERNAME"
echo "   Mot de passe: $ADMIN_PASSWORD"
echo ""
echo "🌐 Informations de connexion application :"
echo "   URL: http://localhost:4200 (dev) ou http://146.59.234.174:88 (prod)"
echo "   Utilisateur admin: $ADMIN_USERNAME"
echo "   Mot de passe: $ADMIN_PASSWORD"
echo ""
echo "🔧 Pour accéder au backoffice :"
echo "   1. Connectez-vous avec les identifiants admin"
echo "   2. Naviguez vers /admin"
echo "   3. Vous devriez avoir accès à toutes les fonctionnalités admin"
