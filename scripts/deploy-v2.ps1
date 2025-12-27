# Script de déploiement V2 (PowerShell)
# Usage: .\scripts\deploy-v2.ps1

param(
    [string]$Environment = "production",
    [switch]$SkipBuild = $false,
    [switch]$SkipBackup = $false
)

Write-Host "🚀 Déploiement V2 - IORecycling" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérification pré-déploiement
if (-not $SkipBuild) {
    Write-Host "1. Vérification pré-déploiement..." -ForegroundColor Yellow
    & .\scripts\verification_pre_deploiement.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Vérification échouée. Corriger les erreurs avant de continuer." -ForegroundColor Red
        exit 1
    }
}

# 2. Backup base de données
if (-not $SkipBackup) {
    Write-Host ""
    Write-Host "2. Sauvegarde base de données..." -ForegroundColor Yellow
    Write-Host "   ⚠️  IMPORTANT: Sauvegarder la base de données avant le déploiement !" -ForegroundColor Yellow
    Write-Host "   💡 Utiliser: .\scripts\backup_database.ps1" -ForegroundColor Yellow
    $confirm = Read-Host "   Continuer sans backup ? (oui/non)"
    if ($confirm -ne "oui") {
        Write-Host "   Déploiement annulé" -ForegroundColor Red
        exit 1
    }
}

# 3. Build Backend
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "3. Build Backend..." -ForegroundColor Yellow
    & .\scripts\build-backend.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Build backend échoué" -ForegroundColor Red
        exit 1
    }
}

# 4. Build Frontend
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "4. Build Frontend..." -ForegroundColor Yellow
    & .\scripts\build-frontend.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Build frontend échoué" -ForegroundColor Red
        exit 1
    }
}

# 5. Déploiement
Write-Host ""
Write-Host "5. Déploiement..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📦 Artifacts créés :" -ForegroundColor Cyan
Write-Host "   - Backend JAR: backend\target\*.jar" -ForegroundColor White
Write-Host "   - Frontend: frontend\dist\" -ForegroundColor White
Write-Host ""
Write-Host "💡 Prochaines étapes manuelles :" -ForegroundColor Yellow
Write-Host "   1. Arrêter l'application actuelle" -ForegroundColor White
Write-Host "   2. Backup de l'ancienne version" -ForegroundColor White
Write-Host "   3. Copier le nouveau JAR backend" -ForegroundColor White
Write-Host "   4. Copier les fichiers frontend" -ForegroundColor White
Write-Host "   5. Démarrer l'application" -ForegroundColor White
Write-Host "   6. Vérifier les logs (migration V18)" -ForegroundColor White
Write-Host ""
Write-Host "📚 Voir GUIDE_DEPLOIEMENT_V2.md pour les détails" -ForegroundColor Cyan

