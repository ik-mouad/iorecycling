#!/bin/bash

# ===========================================
# IORecycling - Script de déploiement SSH
# ===========================================

set -e

# Configuration
VPS_HOST="${VPS_HOST:-}"
VPS_USERNAME="${VPS_USERNAME:-}"
VPS_PORT="${VPS_PORT:-22}"
VPS_DEPLOY_PATH="${VPS_DEPLOY_PATH:-/opt/iorecycling}"
BRANCH="${BRANCH:-develop}"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des paramètres
check_requirements() {
    log_info "Vérification des prérequis..."
    
    if [ -z "$VPS_HOST" ]; then
        log_error "VPS_HOST n'est pas défini"
        exit 1
    fi
    
    if [ -z "$VPS_USERNAME" ]; then
        log_error "VPS_USERNAME n'est pas défini"
        exit 1
    fi
    
    if [ ! -f "$HOME/.ssh/id_rsa" ] && [ ! -f "$HOME/.ssh/id_ed25519" ]; then
        log_warning "Aucune clé SSH trouvée dans ~/.ssh/"
        log_info "Assurez-vous d'avoir configuré votre clé SSH"
    fi
    
    log_success "Prérequis validés"
}

# Déploiement via SSH
deploy() {
    log_info "Démarrage du déploiement sur $VPS_HOST..."
    
    # Déterminer la branche cible
    if [ "$BRANCH" = "main" ]; then
        TARGET_BRANCH="main"
        ENV_TYPE="PROD"
    else
        TARGET_BRANCH="develop"
        ENV_TYPE="QUAL"
    fi
    
    log_info "Déploiement sur environnement: $ENV_TYPE (branche: $TARGET_BRANCH)"
    
    # Commande SSH de déploiement
    ssh -p "$VPS_PORT" "$VPS_USERNAME@$VPS_HOST" << EOF
        set -e
        
        # Logs avec timestamp
        echo "\$(date '+%Y-%m-%d %H:%M:%S') - Début du déploiement IORecycling"
        
        # Aller dans le répertoire de déploiement
        cd $VPS_DEPLOY_PATH
        
        # Vérifier si le repo existe
        if [ ! -d ".git" ]; then
            echo "Clonage du repository..."
            git clone https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/') .
        fi
        
        # fetch + reset sur la branche cible
        echo "Mise à jour du code source..."
        git fetch origin
        git checkout $TARGET_BRANCH || git checkout -b $TARGET_BRANCH
        git reset --hard origin/$TARGET_BRANCH
        
        # Vérifier la présence du fichier .env
        if [ ! -f ".env" ]; then
            echo "ATTENTION: Fichier .env manquant!"
            echo "Copiez env.example vers .env et configurez les variables"
            exit 1
        fi
        
        # Arrêter les services existants
        echo "Arrêt des services existants..."
        docker compose down || true
        
        # Nettoyage des images inutilisées
        echo "Nettoyage des images Docker..."
        docker image prune -f || true
        
        # Rebuild & restart
        echo "Construction et démarrage des services..."
        docker compose up -d --build
        
        # Attendre que les services soient prêts
        echo "Attente du démarrage des services..."
        sleep 30
        
        # Vérification de la santé des services
        echo "Vérification de la santé des services..."
        if docker compose ps | grep -q "unhealthy"; then
            echo "ERREUR: Certains services ne sont pas en bonne santé"
            docker compose ps
            exit 1
        fi
        
        echo "\$(date '+%Y-%m-%d %H:%M:%S') - Déploiement terminé avec succès"
        echo "Services déployés:"
        docker compose ps
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Déploiement terminé avec succès!"
        log_info "Application accessible sur: http://$VPS_HOST:88"
    else
        log_error "Échec du déploiement"
        exit 1
    fi
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Afficher cette aide"
    echo "  -b, --branch BRANCH     Branche à déployer (default: develop)"
    echo "  -H, --host HOST         Adresse du serveur VPS"
    echo "  -u, --user USER         Nom d'utilisateur SSH"
    echo "  -p, --port PORT         Port SSH (default: 22)"
    echo "  -d, --path PATH         Chemin de déploiement (default: /opt/iorecycling)"
    echo ""
    echo "Variables d'environnement:"
    echo "  VPS_HOST                Adresse du serveur VPS"
    echo "  VPS_USERNAME            Nom d'utilisateur SSH"
    echo "  VPS_PORT                Port SSH"
    echo "  VPS_DEPLOY_PATH         Chemin de déploiement"
    echo "  BRANCH                  Branche à déployer"
    echo ""
    echo "Exemples:"
    echo "  $0 --host 192.168.1.100 --user deploy"
    echo "  $0 --branch main --host prod.example.com --user admin"
    echo "  VPS_HOST=192.168.1.100 VPS_USERNAME=deploy $0"
}

# Parsing des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -H|--host)
            VPS_HOST="$2"
            shift 2
            ;;
        -u|--user)
            VPS_USERNAME="$2"
            shift 2
            ;;
        -p|--port)
            VPS_PORT="$2"
            shift 2
            ;;
        -d|--path)
            VPS_DEPLOY_PATH="$2"
            shift 2
            ;;
        *)
            log_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Exécution principale
main() {
    log_info "=== Script de déploiement IORecycling ==="
    check_requirements
    deploy
    log_success "=== Déploiement terminé ==="
}

# Exécution si le script est appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
