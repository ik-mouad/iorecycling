# Script de build frontend
# Usage: .\scripts\build-frontend.ps1

Write-Host "🔨 Build Frontend V2" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

Set-Location frontend

Write-Host "Installation des dépendances..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "Build production..." -ForegroundColor Yellow
ng build --configuration production

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "✅ Build réussi !" -ForegroundColor Green
Write-Host "Fichiers créés dans: frontend\dist\" -ForegroundColor Green

Set-Location ..

