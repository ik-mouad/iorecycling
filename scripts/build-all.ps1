# Script de build complet (Backend + Frontend)
# Usage: .\scripts\build-all.ps1

Write-Host "🚀 Build Complet V2" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

# Vérification pré-déploiement
Write-Host "1. Vérification pré-déploiement..." -ForegroundColor Yellow
& .\scripts\verification_pre_deploiement.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Vérification échouée. Corriger les erreurs avant de continuer." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Build Backend..." -ForegroundColor Yellow
& .\scripts\build-backend.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build backend échoué" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Build Frontend..." -ForegroundColor Yellow
& .\scripts\build-frontend.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build frontend échoué" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✅ Build complet réussi !" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Artifacts créés :" -ForegroundColor Cyan
Write-Host "   - Backend JAR: backend\target\*.jar" -ForegroundColor White
Write-Host "   - Frontend: frontend\dist\" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Prêt pour le déploiement !" -ForegroundColor Green

