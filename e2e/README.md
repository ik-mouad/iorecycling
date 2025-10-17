# Tests E2E IORecycling avec Playwright

Ce répertoire contient les tests end-to-end (E2E) pour l'application IORecycling utilisant Playwright.

## 🚀 Configuration

### Prérequis

- Node.js >= 18.0.0
- npm ou yarn
- Accès au serveur de test : http://146.59.234.174:88

### Installation

```bash
# Installer les dépendances
npm install

# Installer les navigateurs Playwright
npx playwright install --with-deps
```

## 🔧 Variables d'environnement

Définissez les variables d'environnement suivantes avant d'exécuter les tests :

```bash
export E2E_USER=client1
export E2E_PASS='ton_mot_de_passe'
export E2E_MONTH='2025-01'
```

### Variables requises

- `E2E_USER` : Nom d'utilisateur pour l'authentification Keycloak
- `E2E_PASS` : Mot de passe pour l'authentification Keycloak
- `E2E_MONTH` : Mois de test pour les rapports (format YYYY-MM, optionnel, défaut: mois courant)

## 🧪 Exécution des tests

### Commandes disponibles

```bash
# Exécuter tous les tests
npm run e2e

# Exécuter les tests en mode visible (headed)
npm run e2e:headed

# Exécuter les tests avec l'interface utilisateur
npm run e2e:ui

# Exécuter les tests en mode debug
npm run e2e:debug

# Afficher le rapport HTML
npm run e2e:report
```

### Exécution par navigateur

```bash
# Tests sur Chrome uniquement
npx playwright test --project=chromium

# Tests sur Firefox uniquement
npx playwright test --project=firefox

# Tests sur Safari uniquement
npx playwright test --project=webkit

# Tests sur mobile Chrome
npx playwright test --project=mobile-chrome
```

## 📋 Tests disponibles

### 1. Authentification (`login.spec.ts`)
- ✅ Connexion via Keycloak avec identifiants valides
- ✅ Gestion de la page "Update password" si elle apparaît
- ✅ Redirection vers le dashboard après connexion
- ✅ Gestion des identifiants invalides

### 2. Tableau de bord (`dashboard.spec.ts`)
- ✅ Affichage des KPI (enlèvements, tonnages, revenus)
- ✅ Validation des valeurs numériques
- ✅ Présence de la table des enlèvements
- ✅ Affichage des filtres et du champ de recherche
- ✅ Indicateur de dernière mise à jour

### 3. Filtres (`filters.spec.ts`)
- ✅ Filtrage par type "Recyclables"
- ✅ Filtrage par type "Banals"
- ✅ Filtrage par type "Dangereux"
- ✅ Affichage de tous les types avec "Tous"
- ✅ Recherche textuelle

### 4. Rapport PDF (`report.spec.ts`)
- ✅ Téléchargement du rapport PDF mensuel
- ✅ Vérification du Content-Type application/pdf
- ✅ Validation du nom de fichier
- ✅ Affichage de la section valorisables
- ✅ Gestion des erreurs de téléchargement

## 🔐 Authentification

Les tests utilisent un système d'authentification réutilisable :

1. **Setup d'authentification** (`auth.setup.ts`) : S'exécute en premier et sauvegarde l'état d'authentification
2. **Storage State** : L'état est sauvegardé dans `storage/auth.json`
3. **Réutilisation** : Tous les autres tests utilisent automatiquement cet état

### Gestion de la page "Update password"

Si Keycloak affiche une page de mise à jour du mot de passe :
- Le test détecte automatiquement cette page
- Met à jour le mot de passe (ajoute "1!" au mot de passe existant)
- Relance le processus de connexion

## 📊 Rapports

### Rapport HTML
```bash
npm run e2e:report
```
Ouvre le rapport HTML interactif dans le navigateur.

### Rapport JSON
Les résultats sont sauvegardés dans `test-results/results.json`.

### Rapport JUnit
Les résultats sont sauvegardés dans `test-results/results.xml` pour l'intégration CI/CD.

## 🐛 Débogage

### Mode debug
```bash
npm run e2e:debug
```
Ouvre le navigateur en mode debug avec les outils de développement.

### Screenshots et vidéos
- Screenshots : Sauvegardés automatiquement en cas d'échec
- Vidéos : Enregistrées pour les tests qui échouent
- Traces : Disponibles pour le débogage

### Logs
```bash
# Exécuter avec logs détaillés
DEBUG=pw:api npx playwright test
```

## 🔄 Intégration CI/CD

### GitHub Actions (exemple)

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  env:
    E2E_USER: ${{ secrets.E2E_USER }}
    E2E_PASS: ${{ secrets.E2E_PASS }}
    E2E_MONTH: 2025-01
  run: npm run e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### Secrets GitHub requis
- `E2E_USER` : Nom d'utilisateur de test
- `E2E_PASS` : Mot de passe de test

## 🏗️ Architecture des tests

```
e2e/
├── tests/
│   ├── auth.setup.ts          # Setup d'authentification
│   ├── login.spec.ts          # Tests de connexion
│   ├── dashboard.spec.ts      # Tests du tableau de bord
│   ├── filters.spec.ts        # Tests des filtres
│   └── report.spec.ts         # Tests du rapport PDF
├── helpers/
│   └── selectors.ts           # Sélecteurs et helpers
├── storage/
│   └── auth.json              # État d'authentification (généré)
├── playwright.config.ts       # Configuration Playwright
├── package.json               # Dépendances et scripts
└── README.md                  # Cette documentation
```

## 🚨 Dépannage

### Problèmes courants

1. **Timeout d'authentification**
   - Vérifiez que le serveur est accessible
   - Vérifiez les identifiants E2E_USER/E2E_PASS

2. **Échec des tests de filtres**
   - Vérifiez que des données de test existent en base
   - Vérifiez que les data-testid sont présents dans les templates

3. **Échec du téléchargement PDF**
   - Vérifiez que l'endpoint `/api/client/report` fonctionne
   - Vérifiez que le backend est démarré

4. **Tests instables**
   - Augmentez les timeouts dans `playwright.config.ts`
   - Ajoutez des `waitForTimeout()` si nécessaire

### Support

Pour toute question ou problème :
1. Vérifiez les logs de la console
2. Consultez le rapport HTML généré
3. Vérifiez que l'application est déployée et accessible


