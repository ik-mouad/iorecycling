# Script de sauvegarde base de données (PowerShell)
# Usage: .\scripts\backup_database.ps1

param(
    [string]$DbName = "iorecycling_db",
    [string]$DbUser = "iorecycling",
    [string]$BackupDir = ".\backups"
)

Write-Host "📦 Sauvegarde Base de Données" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Créer le répertoire de backup s'il n'existe pas
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Répertoire de backup créé: $BackupDir" -ForegroundColor Green
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "backup_pre_v18_$Timestamp.sql"

Write-Host "Base de données: $DbName" -ForegroundColor White
Write-Host "Utilisateur: $DbUser" -ForegroundColor White
Write-Host "Fichier de backup: $BackupFile" -ForegroundColor White
Write-Host ""

# Vérifier si pg_dump est disponible
$pgDumpPath = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDumpPath) {
    Write-Host "❌ pg_dump n'est pas installé ou non trouvé dans le PATH" -ForegroundColor Red
    Write-Host "💡 Installer PostgreSQL ou ajouter pg_dump au PATH" -ForegroundColor Yellow
    exit 1
}

# Effectuer la sauvegarde
Write-Host "⏳ Sauvegarde en cours..." -ForegroundColor Yellow

$env:PGPASSWORD = Read-Host "Mot de passe PostgreSQL" -AsSecureString | ConvertFrom-SecureString -AsPlainText
& pg_dump -U $DbUser -d $DbName -F c -f $BackupFile

if ($LASTEXITCODE -eq 0) {
    $fileInfo = Get-Item $BackupFile
    Write-Host ""
    Write-Host "✅ Sauvegarde réussie: $BackupFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "Taille du fichier: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Pour restaurer:" -ForegroundColor Yellow
    Write-Host "   pg_restore -U $DbUser -d $DbName -c $BackupFile" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de la sauvegarde" -ForegroundColor Red
    exit 1
}

