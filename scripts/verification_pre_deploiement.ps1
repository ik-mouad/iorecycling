# Script de vérification pré-déploiement V2 (PowerShell)
# Usage: .\scripts\verification_pre_deploiement.ps1

Write-Host "🔍 Vérification Pré-Déploiement V2" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$ERRORS = 0

# 1. Vérifier migration SQL
Write-Host "1. Vérification Migration SQL..." -ForegroundColor Yellow
if (Test-Path "backend\src\main\resources\db\migration\V18__refonte_v2_recettes_et_ventes.sql") {
    Write-Host "   ✅ Migration V18 trouvée" -ForegroundColor Green
} else {
    Write-Host "   ❌ Migration V18 manquante" -ForegroundColor Red
    $ERRORS++
}

# 2. Vérifier entités Java
Write-Host "2. Vérification Entités Java..." -ForegroundColor Yellow
if (Test-Path "backend\src\main\java\ma\iorecycling\entity\Vente.java") {
    Write-Host "   ✅ Vente.java trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Vente.java manquant" -ForegroundColor Red
    $ERRORS++
}

if (Test-Path "backend\src\main\java\ma\iorecycling\entity\VenteItem.java") {
    Write-Host "   ✅ VenteItem.java trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ VenteItem.java manquant" -ForegroundColor Red
    $ERRORS++
}

# 3. Vérifier services
Write-Host "3. Vérification Services..." -ForegroundColor Yellow
if (Test-Path "backend\src\main\java\ma\iorecycling\service\VenteService.java") {
    Write-Host "   ✅ VenteService.java trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ VenteService.java manquant" -ForegroundColor Red
    $ERRORS++
}

if (Test-Path "backend\src\main\java\ma\iorecycling\service\TransactionGenerationService.java") {
    Write-Host "   ✅ TransactionGenerationService.java trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ TransactionGenerationService.java manquant" -ForegroundColor Red
    $ERRORS++
}

# 4. Vérifier controllers
Write-Host "4. Vérification Controllers..." -ForegroundColor Yellow
if (Test-Path "backend\src\main\java\ma\iorecycling\controller\AdminVenteController.java") {
    Write-Host "   ✅ AdminVenteController.java trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ AdminVenteController.java manquant" -ForegroundColor Red
    $ERRORS++
}

# 5. Vérifier modèles frontend
Write-Host "5. Vérification Modèles Frontend..." -ForegroundColor Yellow
if (Test-Path "frontend\src\app\models\vente.model.ts") {
    Write-Host "   ✅ vente.model.ts trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ vente.model.ts manquant" -ForegroundColor Red
    $ERRORS++
}

# 6. Vérifier services frontend
Write-Host "6. Vérification Services Frontend..." -ForegroundColor Yellow
if (Test-Path "frontend\src\app\services\vente.service.ts") {
    Write-Host "   ✅ vente.service.ts trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ vente.service.ts manquant" -ForegroundColor Red
    $ERRORS++
}

# 7. Vérifier composants frontend
Write-Host "7. Vérification Composants Frontend..." -ForegroundColor Yellow
if (Test-Path "frontend\src\app\modules\admin\components\stocks-disponibles") {
    Write-Host "   ✅ stocks-disponibles trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ stocks-disponibles manquant" -ForegroundColor Red
    $ERRORS++
}

if (Test-Path "frontend\src\app\modules\admin\components\vente-form") {
    Write-Host "   ✅ vente-form trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ vente-form manquant" -ForegroundColor Red
    $ERRORS++
}

if (Test-Path "frontend\src\app\modules\admin\components\ventes-list") {
    Write-Host "   ✅ ventes-list trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ ventes-list manquant" -ForegroundColor Red
    $ERRORS++
}

# 8. Vérifier routes
Write-Host "8. Vérification Routes..." -ForegroundColor Yellow
$routesContent = Get-Content "frontend\src\app\modules\admin\admin.routes.ts" -Raw
if ($routesContent -match "ventes") {
    Write-Host "   ✅ Routes ventes trouvées" -ForegroundColor Green
} else {
    Write-Host "   ❌ Routes ventes manquantes" -ForegroundColor Red
    $ERRORS++
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
if ($ERRORS -eq 0) {
    Write-Host "✅ Toutes les vérifications sont OK !" -ForegroundColor Green
    Write-Host "🚀 Prêt pour le déploiement" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ $ERRORS erreur(s) trouvée(s)" -ForegroundColor Red
    Write-Host "⚠️  Corriger les erreurs avant le déploiement" -ForegroundColor Yellow
    exit 1
}

