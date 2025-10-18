#!/bin/bash

# Script de réinitialisation de la base de données pour IORecycling
# Usage: ./scripts/reset-db.sh [environment]
# Environment: dev, qualif, prod (défaut: dev)

set -e

ENVIRONMENT=${1:-dev}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "qualif" ]; then
    COMPOSE_FILE="docker-compose.qualif.yml"
elif [ "$ENVIRONMENT" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "🔄 Réinitialisation de la base de données pour l'environnement: $ENVIRONMENT"
echo "📁 Fichier Compose: $COMPOSE_FILE"

# Vérifier que le fichier compose existe
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Erreur: Le fichier $COMPOSE_FILE n'existe pas"
    exit 1
fi

# Arrêter tous les conteneurs et supprimer les volumes
echo "🛑 Arrêt des services..."
docker compose -f $COMPOSE_FILE down -v

# Nettoyer les images orphelines
echo "🧹 Nettoyage des images orphelines..."
docker image prune -f

# Reconstruire les images sans cache
echo "🔨 Reconstruction des images..."
docker compose -f $COMPOSE_FILE build --no-cache

# Redémarrer les services
echo "🚀 Redémarrage des services..."
docker compose -f $COMPOSE_FILE up -d

# Attendre que les services démarrent
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo "📊 État des services:"
docker compose -f $COMPOSE_FILE ps

echo ""
echo "✅ Base de données réinitialisée avec succès!"
echo "📋 Commandes utiles:"
echo "   - Voir les logs: docker compose -f $COMPOSE_FILE logs -f backend"
echo "   - Vérifier la base: docker compose -f $COMPOSE_FILE exec postgres psql -U app -d app -c '\\dt'"
echo "   - Redémarrer un service: docker compose -f $COMPOSE_FILE restart backend"
