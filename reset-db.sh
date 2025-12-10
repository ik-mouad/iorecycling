#!/bin/bash

echo "🔄 Nettoyage complet de la base de données..."

# Arrêter tous les conteneurs et supprimer les volumes
docker compose down -v

# Supprimer les images pour forcer un rebuild
docker compose build --no-cache

# Redémarrer les services
docker compose up -d

echo "✅ Base de données réinitialisée. Attendez quelques secondes pour que les services démarrent..."
echo "📊 Vérifiez les logs avec: docker compose logs -f backend"
