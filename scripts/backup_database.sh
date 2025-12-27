#!/bin/bash

# Script de sauvegarde base de données avant déploiement V2
# Usage: ./scripts/backup_database.sh

DB_NAME="${DB_NAME:-iorecycling_db}"
DB_USER="${DB_USER:-iorecycling}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_pre_v18_$TIMESTAMP.sql"

echo "📦 Sauvegarde Base de Données"
echo "=============================="
echo ""

# Créer le répertoire de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

echo "Base de données: $DB_NAME"
echo "Utilisateur: $DB_USER"
echo "Fichier de backup: $BACKUP_FILE"
echo ""

# Vérifier si pg_dump est disponible
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump n'est pas installé"
    exit 1
fi

# Effectuer la sauvegarde
echo "⏳ Sauvegarde en cours..."
pg_dump -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Sauvegarde réussie: $BACKUP_FILE"
    echo ""
    echo "Taille du fichier:"
    ls -lh "$BACKUP_FILE"
    echo ""
    echo "💡 Pour restaurer:"
    echo "   pg_restore -U $DB_USER -d $DB_NAME -c $BACKUP_FILE"
else
    echo "❌ Erreur lors de la sauvegarde"
    exit 1
fi

