#!/bin/bash
set -e

echo "🔧 Déploiement manuel des corrections frontend"
echo "=============================================="

cd /opt/iorecycling

echo "🔄 Mise à jour du code depuis GitHub..."
git pull origin develop

echo "🔨 Reconstruction du frontend..."
docker compose build frontend

echo "🚀 Redémarrage du frontend..."
docker compose up -d frontend

echo "⏳ Attente du redémarrage..."
sleep 15

echo "📊 État du frontend:"
docker compose ps frontend

echo "✅ Déploiement terminé !"
echo "🌐 Testez maintenant: http://146.59.234.174:88/client"
