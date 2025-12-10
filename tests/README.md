# Tests E2E avec Playwright

Ce répertoire contient les tests end-to-end (E2E) pour l'application IORecycling utilisant Playwright.

## 🚀 Configuration rapide

### 1. Installation des dépendances

```bash
# Installer Playwright et ses navigateurs
npm run e2e:install
```

### 2. Configuration des variables d'environnement

```bash
# Variables obligatoires
export E2E_USER="client1"
export E2E_PASS="votre_mot_de_passe"
export E2E_BASE_URL="http://146.59.234.174:88"
```

### 3. Exécution des tests

```bash
# Lancer tous les tests (authentification + tests)
npm run e2e

# Lancer seulement l'authentification
npm run e2e:setup

# Lancer les tests en mode visible
npm run e2e:headed

# Voir le rapport HTML
npm run e2e:report
```

## 📁 Structure des tests

```
tests/
├── auth.setup.spec.ts    # Authentification Keycloak (projet "setup")
├── dashboard.spec.ts     # Tests du dashboard client
├── filters.spec.ts       # Tests des filtres
├── report.spec.ts        # Tests de téléchargement PDF
└── README.md            # Ce fichier
```

## 🔐 Système d'authentification

### Principe
1. **Projet "setup"** : Effectue l'authentification UI via Keycloak
2. **Sauvegarde de session** : Stocke les cookies/tokens dans `storage/auth.json`
3. **Réutilisation** : Tous les autres tests utilisent cette session

### Variables d'environnement

| Variable | Description | Exemple | Obligatoire |
|----------|-------------|---------|-------------|
| `E2E_USER` | Nom d'utilisateur Keycloak | `client1` | ✅ |
| `E2E_PASS` | Mot de passe Keycloak | `votre_mdp` | ✅ |
| `E2E_BASE_URL` | URL de base de l'application | `http://146.59.234.174:88` | ❌ |

## 🧪 Tests disponibles

### Dashboard (`dashboard.spec.ts`)
- ✅ Affichage des KPIs (enlèvements, tonnages)
- ✅ Valeurs cohérentes des métriques
- ✅ Carte de revenus avec format MAD
- ✅ Nom d'utilisateur correct

### Filtres (`filters.spec.ts`)
- ✅ Présence de tous les filtres
- ✅ Filtre "Tous" sélectionné par défaut
- ✅ Filtrage par type (Recyclables, Banals, Dangereux)
- ✅ Mise à jour du tableau selon le filtre

### Rapport PDF (`report.spec.ts`)
- ✅ Bouton de téléchargement visible
- ✅ Téléchargement effectif du fichier
- ✅ Type de contenu `application/pdf`
- ✅ Paramètres de requête corrects
- ✅ Gestion des erreurs

## 🎯 Sélecteurs utilisés

Les tests utilisent des `data-testid` pour une meilleure stabilité :

```html
<!-- KPIs -->
<div data-testid="kpi-pickups">42 enlèvements</div>
<div data-testid="kpi-valorisables">15,5 t</div>
<div data-testid="kpi-banals">8,2 t</div>
<div data-testid="kpi-dangereux">2,1 t</div>
<div data-testid="kpi-revenue">12 500,00 MAD</div>

<!-- Filtres -->
<button data-testid="filter-all">Tous</button>
<button data-testid="filter-recyclables">Recyclables</button>
<button data-testid="filter-banals">Banals</button>
<button data-testid="filter-dangereux">À détruire</button>

<!-- Actions -->
<button data-testid="btn-download-pdf">Télécharger rapport PDF</button>
```

## 🔧 Commandes utiles

```bash
# Tests en mode debug (pas à pas)
npm run e2e:debug

# Tests avec interface graphique
npm run e2e:ui

# Nettoyer les rapports
rm -rf playwright-report test-results

# Nettoyer la session
rm -f storage/auth.json
```

## 🐛 Dépannage

### Erreur d'authentification
```bash
# Vérifier les variables d'environnement
echo $E2E_USER
echo $E2E_PASS
echo $E2E_BASE_URL

# Relancer seulement l'authentification
npm run e2e:setup
```

### Tests qui échouent
```bash
# Voir le rapport détaillé
npm run e2e:report

# Lancer en mode visible pour debug
npm run e2e:headed
```

### Problème de session
```bash
# Supprimer la session et relancer
rm -f storage/auth.json
npm run e2e
```

## 📊 Rapports

Les rapports HTML sont générés dans `playwright-report/` et incluent :
- 📸 Captures d'écran des échecs
- 🎥 Vidéos des tests
- 📋 Traces détaillées
- 📈 Métriques de performance

## 🔄 Intégration CI/CD

Les tests E2E sont automatiquement exécutés dans GitHub Actions avec :
- ✅ Installation automatique de Playwright
- ✅ Utilisation des secrets GitHub pour les credentials
- ✅ Génération et upload des rapports
- ✅ Blocage du déploiement si les tests échouent