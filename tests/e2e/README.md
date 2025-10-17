# Tests E2E IORecycling

## Description

Tests end-to-end avec Playwright TypeScript pour valider le fonctionnement de l'application IORecycling.

## Tests inclus

### 1. Test du Frontend
- ✅ Vérification que la page s'ouvre sur `http://localhost:88/`
- ✅ Vérification que le titre "IORecycling – Release 0 OK" est affiché
- ✅ Vérification des éléments de l'interface utilisateur
- ✅ Test de responsivité et d'accessibilité

### 2. Test de l'API
- ✅ Vérification que l'endpoint `/api/health` retourne `status: "UP"`
- ✅ Test direct de l'API via `request.get()`
- ✅ Vérification de la réponse JSON complète
- ✅ Test de gestion d'erreur

## Installation

```bash
# Installer les dépendances
npm install

# Installer les navigateurs Playwright
npx playwright install --with-deps
```

## Exécution

```bash
# Lancer tous les tests
npm run e2e

# Lancer avec interface graphique
npm run e2e:ui

# Lancer en mode visible (non headless)
npm run e2e:headed

# Lancer en mode debug
npm run e2e:debug
```

## Prérequis

- Node.js 18+
- Application IORecycling démarrée sur `http://localhost:88`
- Docker Compose avec tous les services en cours d'exécution

## Configuration

Les tests sont configurés dans `playwright.config.ts` :
- Base URL : `http://localhost:88`
- Navigateurs : Chrome, Firefox, Safari, Mobile
- Timeout : 120 secondes
- Retry : 2 fois en CI, 0 en local

## Structure

```
tests/e2e/
├── app.spec.ts          # Tests principaux de l'application
└── README.md           # Documentation des tests
```
