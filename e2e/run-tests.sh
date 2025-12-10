#!/bin/bash

# Script de démarrage rapide pour les tests E2E IORecycling
# Usage: ./run-tests.sh [options]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des variables d'environnement
check_env_vars() {
    log_info "Vérification des variables d'environnement..."
    
    if [ -z "$E2E_USER" ]; then
        log_error "E2E_USER n'est pas défini"
        echo "Définissez-le avec: export E2E_USER=client1"
        exit 1
    fi
    
    if [ -z "$E2E_PASS" ]; then
        log_error "E2E_PASS n'est pas défini"
        echo "Définissez-le avec: export E2E_PASS='votre_mot_de_passe'"
        exit 1
    fi
    
    if [ -z "$E2E_MONTH" ]; then
        log_warning "E2E_MONTH n'est pas défini, utilisation du mois courant"
        export E2E_MONTH=$(date +%Y-%m)
    fi
    
    log_success "Variables d'environnement OK"
    log_info "Utilisateur: $E2E_USER"
    log_info "Mois: $E2E_MONTH"
}

# Vérification de la connectivité
check_connectivity() {
    log_info "Vérification de la connectivité vers l'application..."
    
    if curl -f -s http://146.59.234.174:88/api/public/health > /dev/null; then
        log_success "Application accessible"
    else
        log_error "Application non accessible sur http://146.59.234.174:88"
        log_info "Vérifiez que l'application est déployée et démarrée"
        exit 1
    fi
}

# Installation des dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        log_success "Dépendances installées"
    else
        log_info "Dépendances déjà installées"
    fi
    
    log_info "Installation des navigateurs Playwright..."
    npx playwright install --with-deps
    log_success "Navigateurs installés"
}

# Nettoyage des anciens résultats
cleanup() {
    log_info "Nettoyage des anciens résultats..."
    rm -rf test-results/
    rm -rf playwright-report/
    rm -rf storage/auth.json
    log_success "Nettoyage terminé"
}

# Exécution des tests
run_tests() {
    local mode=${1:-"headless"}
    
    log_info "Démarrage des tests E2E en mode $mode..."
    
    case $mode in
        "headed")
            npm run e2e:headed
            ;;
        "ui")
            npm run e2e:ui
            ;;
        "debug")
            npm run e2e:debug
            ;;
        *)
            npm run e2e
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        log_success "Tous les tests sont passés !"
    else
        log_error "Certains tests ont échoué"
        exit 1
    fi
}

# Affichage du rapport
show_report() {
    log_info "Ouverture du rapport HTML..."
    npm run e2e:report
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -c, --clean    Nettoyer avant d'exécuter"
    echo "  -m, --mode     Mode d'exécution (headless|headed|ui|debug)"
    echo "  -r, --report   Afficher le rapport après les tests"
    echo "  --skip-check   Ignorer les vérifications préliminaires"
    echo ""
    echo "Exemples:"
    echo "  $0                    # Exécuter en mode headless"
    echo "  $0 -m headed          # Exécuter en mode visible"
    echo "  $0 -m ui              # Exécuter avec l'interface UI"
    echo "  $0 -c -r              # Nettoyer, exécuter et afficher le rapport"
    echo ""
    echo "Variables d'environnement requises:"
    echo "  E2E_USER              # Nom d'utilisateur pour l'authentification"
    echo "  E2E_PASS              # Mot de passe pour l'authentification"
    echo "  E2E_MONTH             # Mois de test (optionnel, format YYYY-MM)"
}

# Variables par défaut
CLEAN=false
MODE="headless"
SHOW_REPORT=false
SKIP_CHECK=false

# Parsing des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -r|--report)
            SHOW_REPORT=true
            shift
            ;;
        --skip-check)
            SKIP_CHECK=true
            shift
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
    echo "🎭 Tests E2E IORecycling avec Playwright"
    echo "========================================"
    
    if [ "$SKIP_CHECK" = false ]; then
        check_env_vars
        check_connectivity
    fi
    
    install_dependencies
    
    if [ "$CLEAN" = true ]; then
        cleanup
    fi
    
    run_tests "$MODE"
    
    if [ "$SHOW_REPORT" = true ]; then
        show_report
    fi
    
    log_success "Script terminé avec succès !"
}

# Exécution
main


