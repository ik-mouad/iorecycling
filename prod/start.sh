#!/bin/bash
# Script de démarrage automatique pour IORecycling

set -e

echo "🚀 Démarrage IORecycling..."

# Exécuter l'initialisation si nécessaire
if [ ! -f .env ]; then
    echo "📝 Fichier .env non trouvé, exécution de l'initialisation..."
    ./init.sh
fi

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé!"
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé!"
    exit 1
fi

# Créer le dossier logs avec les bonnes permissions
mkdir -p logs
chmod 777 logs  # Permissions pour que appuser (uid 1001) puisse écrire

# Démarrer les services
echo "🐳 Démarrage des services Docker..."
docker compose up -d --build

echo ""
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo ""
echo "📊 État des services:"
docker compose ps

echo ""
echo "✅ Services démarrés!"
echo ""
echo "📋 Commandes utiles:"
echo "   - Voir les logs: docker compose logs -f"
echo "   - Arrêter: docker compose down"
echo "   - Redémarrer: docker compose restart"

