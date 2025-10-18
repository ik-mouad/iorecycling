Write-Host "🔄 Nettoyage complet de la base de données..." -ForegroundColor Yellow

# Arrêter tous les conteneurs et supprimer les volumes
Write-Host "Arrêt des services..." -ForegroundColor Blue
docker compose down -v

# Supprimer les images pour forcer un rebuild
Write-Host "Reconstruction des images..." -ForegroundColor Blue
docker compose build --no-cache

# Redémarrer les services
Write-Host "Redémarrage des services..." -ForegroundColor Blue
docker compose up -d

Write-Host "✅ Base de données réinitialisée. Attendez quelques secondes pour que les services démarrent..." -ForegroundColor Green
Write-Host "📊 Vérifiez les logs avec: docker compose logs -f backend" -ForegroundColor Cyan
