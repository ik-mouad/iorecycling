# Script de build backend
# Usage: .\scripts\build-backend.ps1

Write-Host "🔨 Build Backend V2" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

Write-Host "Nettoyage et compilation..." -ForegroundColor Yellow
& .\mvnw.cmd clean compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la compilation" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "Packaging..." -ForegroundColor Yellow
& .\mvnw.cmd package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du packaging" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "✅ Build réussi !" -ForegroundColor Green
Write-Host "JAR créé dans: backend\target\" -ForegroundColor Green

Set-Location ..

