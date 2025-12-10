#!/bin/bash

# Script de configuration pour les tests E2E
# Ce script configure l'environnement et lance les tests

set -e

echo "🎭 Configuration des tests E2E IORecycling"
echo "=========================================="

# Vérification des variables d'environnement
if [ -z "$E2E_USER" ]; then
    echo "❌ E2E_USER n'est pas défini"
    echo "Définissez-le avec: export E2E_USER=client1"
    exit 1
fi

if [ -z "$E2E_PASS" ]; then
    echo "❌ E2E_PASS n'est pas défini"
    echo "Définissez-le avec: export E2E_PASS='votre_mot_de_passe'"
    exit 1
fi

if [ -z "$E2E_MONTH" ]; then
    echo "⚠️  E2E_MONTH n'est pas défini, utilisation du mois courant"
    export E2E_MONTH=$(date +%Y-%m)
fi

echo "✅ Variables d'environnement configurées:"
echo "   Utilisateur: $E2E_USER"
echo "   Mois: $E2E_MONTH"

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Installation des navigateurs Playwright
echo "🌐 Installation des navigateurs Playwright..."
npx playwright install --with-deps

# Vérification de la connectivité
echo "🔍 Vérification de la connectivité..."
if curl -f -s http://146.59.234.174:88/api/public/health > /dev/null; then
    echo "✅ Application accessible"
else
    echo "❌ Application non accessible sur http://146.59.234.174:88"
    echo "Vérifiez que l'application est déployée et démarrée"
    exit 1
fi

echo "🚀 Configuration terminée avec succès !"
echo ""
echo "Pour lancer les tests:"
echo "  npm run e2e          # Tests en mode headless"
echo "  npm run e2e:headed   # Tests en mode visible"
echo "  npm run e2e:ui       # Tests avec interface UI"
echo "  npm run e2e:debug    # Tests en mode debug"
