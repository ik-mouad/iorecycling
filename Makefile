# ===========================================
# IORecycling - Makefile
# ===========================================
# 
# Commandes utiles pour gérer l'application
# 
# Usage:
#   make up      - Démarrer tous les services
#   make build   - Construire toutes les images
#   make logs    - Afficher les logs en temps réel
#   make down    - Arrêter tous les services
#   make restart - Redémarrer avec rebuild
#
# ===========================================

.PHONY: help up build logs down restart clean test e2e

# Aide par défaut
help: ## Afficher cette aide
	@echo "IORecycling - Commandes disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Services Docker
up: ## Démarrer tous les services en arrière-plan
	@echo "🚀 Démarrage des services IORecycling..."
	docker compose up -d
	@echo "✅ Services démarrés. Accès: http://localhost:88"

build: ## Construire toutes les images Docker
	@echo "🔨 Construction des images Docker..."
	docker compose build
	@echo "✅ Images construites avec succès"

logs: ## Afficher les logs de tous les services
	@echo "📋 Affichage des logs en temps réel..."
	docker compose logs -f

down: ## Arrêter tous les services
	@echo "🛑 Arrêt des services..."
	docker compose down
	@echo "✅ Services arrêtés"

restart: ## Redémarrer avec reconstruction
	@echo "🔄 Redémarrage avec reconstruction..."
	docker compose down
	docker compose up -d --build
	@echo "✅ Services redémarrés avec succès"

# Nettoyage
clean: ## Nettoyer les images et volumes inutilisés
	@echo "🧹 Nettoyage des ressources Docker..."
	docker compose down
	docker image prune -f
	docker volume prune -f
	@echo "✅ Nettoyage terminé"

# Tests
test: ## Lancer les tests E2E (nécessite Node.js et npm install)
	@echo "🧪 Lancement des tests E2E..."
	@if [ ! -d "node_modules" ]; then \
		echo "📦 Installation des dépendances..."; \
		npm install; \
	fi
	@if [ ! -d "node_modules/@playwright" ]; then \
		echo "🎭 Installation de Playwright..."; \
		npx playwright install --with-deps; \
	fi
	npx playwright test
	@echo "✅ Tests terminés"

e2e: test ## Alias pour les tests E2E

# Développement
dev: ## Démarrer en mode développement avec logs
	@echo "🔧 Mode développement - Services + logs..."
	docker compose up --build

# Production
prod: ## Démarrer avec docker-compose.prod.yml
	@echo "🏭 Mode production..."
	docker compose -f docker-compose.prod.yml up -d --build
	@echo "✅ Services de production démarrés"

# Status
status: ## Afficher le statut des services
	@echo "📊 Statut des services:"
	docker compose ps

# Health check
health: ## Vérifier la santé des services
	@echo "🏥 Vérification de la santé des services..."
	@echo "Frontend: http://localhost:88/"
	@echo "API Health: http://localhost:88/api/health"
	@echo "Keycloak: http://localhost:88/auth/"
	@echo "MinIO Console: http://localhost:9001/"
	@echo ""
	@echo "Test de l'API:"
	@curl -s http://localhost:88/api/health | jq . || echo "API non accessible"

# Installation complète
install: ## Installation complète (Docker + Node.js + Tests)
	@echo "📦 Installation complète d'IORecycling..."
	@echo "1. Vérification de Docker..."
	@docker --version || (echo "❌ Docker non installé" && exit 1)
	@echo "2. Installation des dépendances Node.js..."
	@npm install
	@echo "3. Installation de Playwright..."
	@npx playwright install --with-deps
	@echo "4. Copie du fichier d'environnement..."
	@if [ ! -f ".env" ] && [ -f "env.example" ]; then \
		cp env.example .env; \
		echo "✅ Fichier .env créé depuis env.example"; \
	fi
	@echo "✅ Installation terminée!"
	@echo ""
	@echo "Prochaines étapes:"
	@echo "  make up     - Démarrer l'application"
	@echo "  make health - Vérifier la santé des services"
