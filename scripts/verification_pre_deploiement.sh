#!/bin/bash

# Script de vérification pré-déploiement V2
# Usage: ./scripts/verification_pre_deploiement.sh

echo "🔍 Vérification Pré-Déploiement V2"
echo "===================================="
echo ""

ERRORS=0

# 1. Vérifier migration SQL
echo "1. Vérification Migration SQL..."
if [ -f "backend/src/main/resources/db/migration/V18__refonte_v2_recettes_et_ventes.sql" ]; then
    echo "   ✅ Migration V18 trouvée"
else
    echo "   ❌ Migration V18 manquante"
    ERRORS=$((ERRORS + 1))
fi

# 2. Vérifier entités Java
echo "2. Vérification Entités Java..."
if [ -f "backend/src/main/java/ma/iorecycling/entity/Vente.java" ]; then
    echo "   ✅ Vente.java trouvé"
else
    echo "   ❌ Vente.java manquant"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "backend/src/main/java/ma/iorecycling/entity/VenteItem.java" ]; then
    echo "   ✅ VenteItem.java trouvé"
else
    echo "   ❌ VenteItem.java manquant"
    ERRORS=$((ERRORS + 1))
fi

# 3. Vérifier services
echo "3. Vérification Services..."
if [ -f "backend/src/main/java/ma/iorecycling/service/VenteService.java" ]; then
    echo "   ✅ VenteService.java trouvé"
else
    echo "   ❌ VenteService.java manquant"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "backend/src/main/java/ma/iorecycling/service/TransactionGenerationService.java" ]; then
    echo "   ✅ TransactionGenerationService.java trouvé"
else
    echo "   ❌ TransactionGenerationService.java manquant"
    ERRORS=$((ERRORS + 1))
fi

# 4. Vérifier controllers
echo "4. Vérification Controllers..."
if [ -f "backend/src/main/java/ma/iorecycling/controller/AdminVenteController.java" ]; then
    echo "   ✅ AdminVenteController.java trouvé"
else
    echo "   ❌ AdminVenteController.java manquant"
    ERRORS=$((ERRORS + 1))
fi

# 5. Vérifier modèles frontend
echo "5. Vérification Modèles Frontend..."
if [ -f "frontend/src/app/models/vente.model.ts" ]; then
    echo "   ✅ vente.model.ts trouvé"
else
    echo "   ❌ vente.model.ts manquant"
    ERRORS=$((ERRORS + 1))
fi

# 6. Vérifier services frontend
echo "6. Vérification Services Frontend..."
if [ -f "frontend/src/app/services/vente.service.ts" ]; then
    echo "   ✅ vente.service.ts trouvé"
else
    echo "   ❌ vente.service.ts manquant"
    ERRORS=$((ERRORS + 1))
fi

# 7. Vérifier composants frontend
echo "7. Vérification Composants Frontend..."
if [ -d "frontend/src/app/modules/admin/components/stocks-disponibles" ]; then
    echo "   ✅ stocks-disponibles trouvé"
else
    echo "   ❌ stocks-disponibles manquant"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "frontend/src/app/modules/admin/components/vente-form" ]; then
    echo "   ✅ vente-form trouvé"
else
    echo "   ❌ vente-form manquant"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "frontend/src/app/modules/admin/components/ventes-list" ]; then
    echo "   ✅ ventes-list trouvé"
else
    echo "   ❌ ventes-list manquant"
    ERRORS=$((ERRORS + 1))
fi

# 8. Vérifier routes
echo "8. Vérification Routes..."
if grep -q "ventes" "frontend/src/app/modules/admin/admin.routes.ts"; then
    echo "   ✅ Routes ventes trouvées"
else
    echo "   ❌ Routes ventes manquantes"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "===================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ Toutes les vérifications sont OK !"
    echo "🚀 Prêt pour le déploiement"
    exit 0
else
    echo "❌ $ERRORS erreur(s) trouvée(s)"
    echo "⚠️  Corriger les erreurs avant le déploiement"
    exit 1
fi

