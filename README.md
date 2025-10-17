# IORecycling

Plateforme de recyclage développée avec Spring Boot, React et Docker.

## 🚀 Démarrage rapide

### Prérequis
- Docker & Docker Compose
- Node.js 18+ (pour les tests E2E)
- Git

### Installation
```bash
# Cloner le repository
git clone https://github.com/ik-mouad/iorecycling.git
cd iorecycling

# Installation complète
make install

# Démarrer l'application
make up
```

### Commandes utiles
```bash
make up      # Démarrer tous les services
make build   # Construire toutes les images
make logs    # Afficher les logs en temps réel
make down    # Arrêter tous les services
make restart # Redémarrer avec rebuild
make health  # Vérifier la santé des services
```

## 🌐 Accès aux services

Une fois l'application démarrée :

- **Frontend** : http://localhost:88/
- **API Health** : http://localhost:88/api/health
- **Keycloak** : http://localhost:88/auth/
- **MinIO Console** : http://localhost:9001/

## 🧪 Tests

### Tests E2E avec Playwright
```bash
# Installation des dépendances
npm install
npx playwright install --with-deps

# Exécution des tests
make test
# ou
npm run e2e
```

## 🚀 Déploiement automatique GitHub

Le déploiement est automatisé via GitHub Actions :

- **Branche `develop`** → Déploiement sur environnement de qualification
- **Branche `main`** → Déploiement sur environnement de production

### Suivi des déploiements
Consultez l'état des déploiements sur : [Actions GitHub](https://github.com/ik-mouad/iorecycling/actions)

### Configuration requise
Les secrets suivants doivent être configurés dans GitHub :
- `SSH_HOST` : Adresse du serveur VPS
- `SSH_USER` : Utilisateur SSH
- `SSH_KEY` : Clé privée SSH
- `SSH_PORT` : Port SSH (optionnel)
- `APP_DIR` : Répertoire de déploiement

## 🏗️ Architecture

```
├── backend/          # Spring Boot API
├── frontend/         # Nginx + HTML/JS
├── tests/e2e/        # Tests Playwright
├── scripts/          # Scripts de déploiement
├── .github/workflows/ # CI/CD GitHub Actions
└── docker-compose.yml # Orchestration des services
```

## 📋 Services

- **Backend** : Spring Boot 3.3.4 + Java 21
- **Frontend** : Nginx + HTML/CSS/JS
- **Base de données** : PostgreSQL 16
- **Authentification** : Keycloak 26.0
- **Stockage** : MinIO
- **Reverse Proxy** : Caddy

## 🔧 Développement

### Mode développement
```bash
make dev  # Démarrer avec logs en temps réel
```

### Mode production
```bash
make prod  # Utiliser docker-compose.prod.yml
```

### Nettoyage
```bash
make clean  # Nettoyer les images et volumes
```

## 📚 Documentation

- [Guide de déploiement](DEPLOYMENT.md)
- [Tests E2E](tests/e2e/README.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 
