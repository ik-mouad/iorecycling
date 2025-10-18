#!/bin/bash

# Script de déploiement pour l'environnement de qualification
# Usage: ./scripts/deploy-qualif.sh

set -e

echo "🚀 Déploiement sur l'environnement de qualification"
echo "=================================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.qualif.yml" ]; then
    echo "❌ Erreur: docker-compose.qualif.yml non trouvé"
    echo "Exécutez ce script depuis la racine du projet"
    exit 1
fi

# Vérifier la présence du fichier .env.qualif
if [ ! -f ".env.qualif" ]; then
    echo "⚠️  Fichier .env.qualif manquant"
    if [ -f "env.qualification" ]; then
        echo "📋 Copie de env.qualification vers .env.qualif..."
        cp env.qualification .env.qualif
        echo "✅ Fichier .env.qualif créé. Vérifiez et modifiez les valeurs si nécessaire."
    else
        echo "❌ Erreur: env.qualification non trouvé"
        exit 1
    fi
fi

# Charger les variables d'environnement
export $(cat .env.qualif | grep -v '^#' | xargs)

echo "🔧 Configuration détectée:"
echo "   - Frontend: $FRONTEND_URL"
echo "   - Backend: $BACKEND_URL"
echo "   - Keycloak: $KEYCLOAK_URL"
echo "   - Caddy: http://localhost:$CADDY_PORT"

# Arrêter les services existants
echo "🛑 Arrêt des services existants..."
docker compose -f docker-compose.qualif.yml down || true

# Nettoyage
echo "🧹 Nettoyage des images inutilisées..."
docker image prune -f || true

# Construction et démarrage
echo "🔨 Construction et démarrage des services..."
docker compose -f docker-compose.qualif.yml up -d --build

# Attendre le démarrage
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérification de la santé
echo "📊 Vérification de la santé des services..."
if docker compose -f docker-compose.qualif.yml ps | grep -q "unhealthy"; then
    echo "⚠️  Certains services ne sont pas en bonne santé"
    docker compose -f docker-compose.qualif.yml ps
    echo ""
    echo "🔧 Commandes utiles:"
    echo "   - Voir les logs: docker compose -f docker-compose.qualif.yml logs -f"
    echo "   - Reset DB: ./scripts/reset-db.sh qualif"
    echo "   - Redémarrer: docker compose -f docker-compose.qualif.yml restart"
else
    echo "✅ Tous les services sont en bonne santé"
fi

echo ""
echo "🌐 URLs d'accès:"
echo "   - Frontend: http://localhost:$FRONTEND_PORT"
echo "   - Backend API: http://localhost:$BACKEND_PORT"
echo "   - Keycloak: http://localhost:$KEYCLOAK_PORT"
echo "   - Caddy (proxy): http://localhost:$CADDY_PORT"
echo ""
echo "📋 Commandes utiles:"
echo "   - Logs: docker compose -f docker-compose.qualif.yml logs -f"
echo "   - Reset DB: ./scripts/reset-db.sh qualif"
echo "   - Arrêt: docker compose -f docker-compose.qualif.yml down"
