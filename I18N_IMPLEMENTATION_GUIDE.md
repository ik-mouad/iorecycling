# Guide d'implémentation i18n - IORecycling

## État actuel

✅ **Complété :**
- Service i18n créé (`I18nService`)
- Pipe de traduction créé (`TranslatePipe`)
- Sélecteur de langue créé (`LanguageSelectorComponent`)
- Fichiers de traduction complets (fr.json et en.json)
- Layouts mis à jour :
  - LoginComponent
  - AdminLayoutComponent
  - ComptableLayoutComponent
  - ClientLayoutComponent
- Composants mis à jour :
  - SocietesListComponent ✅
  - EnlevementDetailComponent ✅
  - EnlevementsListComponent ✅
  - ClientDashboardComponent ✅
  - TransactionFormComponent ✅

## Composants restants à mettre à jour

### 1. Ajouter les imports nécessaires dans chaque composant TypeScript

```typescript
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services/i18n.service';

// Dans le décorateur @Component, ajouter TranslatePipe dans imports:
imports: [
  // ... autres imports
  TranslatePipe
],

// Dans le constructor, injecter I18nService:
constructor(
  // ... autres services
  private i18n: I18nService
) {}
```

### 2. Remplacer les textes dans les templates HTML

**Pattern de remplacement :**

| Texte français | Clé de traduction |
|----------------|-------------------|
| `Sociétés` | `{{ 'societe.title' | translate }}` |
| `Nouvelle société` | `{{ 'societe.new' | translate }}` |
| `Modifier` | `{{ 'common.edit' | translate }}` |
| `Voir détails` | `{{ 'common.viewDetails' | translate }}` |
| `Enregistrer` | `{{ 'common.save' | translate }}` |
| `Annuler` | `{{ 'common.cancel' | translate }}` |
| `Supprimer` | `{{ 'common.delete' | translate }}` |
| `Rechercher` | `{{ 'common.search' | translate }}` |
| `Actions` | `{{ 'common.actions' | translate }}` |
| `Par page` | `{{ 'common.perPage' | translate }}` |
| `de` | `{{ 'common.of' | translate }}` |

### 3. Liste des composants à mettre à jour

#### Composants Admin
- [x] `enlevements-list.component` (HTML + TS) ✅
- [ ] `enlevement-form.component` (HTML + TS)
- [x] `enlevement-detail.component` (HTML + TS) ✅
- [x] `transaction-form.component` (HTML + TS) ✅
- [ ] `transactions-list.component` (HTML + TS)
- [ ] `camions-list.component` (HTML + TS)
- [ ] `camion-form.component` (HTML + TS)
- [ ] `destinations-list.component` (HTML + TS)
- [ ] `destination-form.component` (HTML + TS)
- [ ] `societe-form.component` (HTML + TS)
- [ ] `societe-detail.component` (HTML + TS)
- [ ] `demande-form.component` (HTML + TS)
- [ ] `admin-demandes-list.component` (HTML + TS)
- [ ] `planning-calendar.component` (HTML + TS)
- [ ] `recurrences-list.component` (HTML + TS)
- [ ] `recurrence-form.component` (HTML + TS)
- [ ] `ventes-list.component` (HTML + TS)
- [ ] `vente-form.component` (HTML + TS)
- [ ] `stocks-disponibles.component` (HTML + TS)
- [ ] `comptabilite-dashboard.component` (HTML + TS)
- [ ] `admin-clients.component` (HTML + TS)
- [ ] `client-form.component` (HTML + TS)
- [ ] `client-user-form.component` (HTML + TS)
- [ ] `site-form.component` (HTML + TS)
- [ ] `document-upload.component` (HTML + TS)
- [ ] `admin-documents.component` (HTML + TS)
- [ ] `admin-pickups.component` (HTML + TS)
- [ ] `pickup-form.component` (HTML + TS)
- [ ] `societe-proprietaire-form.component` (HTML + TS)
- [ ] `societes-proprietaires-list.component` (HTML + TS)
- [ ] `add-paiement-dialog.component` (HTML + TS)
- [ ] `valider-demande-dialog.component` (HTML + TS)
- [ ] `delete-recurrence-dialog.component` (HTML + TS)
- [ ] `create-societe-proprietaire-dialog.component` (TS)

#### Composants Client
- [x] `client-dashboard.component` (HTML + TS) ✅
- [ ] `client-dashboard-kpis.component` (HTML + TS)
- [ ] `comptabilite-dashboard.component` (HTML + TS)
- [ ] `demande-form.component` (HTML + TS)
- [ ] `mes-demandes.component` (HTML + TS)
- [ ] `enlevements-list.component` (HTML + TS)
- [ ] `enlevement-detail.component` (HTML + TS)
- [ ] `documents-list.component` (HTML + TS)

#### Composants Comptable
- [ ] `transactions-list.component` (HTML + TS)

### 4. Exemples de remplacement

#### Exemple 1 : Titre de page
```html
<!-- Avant -->
<h1>Sociétés</h1>

<!-- Après -->
<h1>{{ 'societe.title' | translate }}</h1>
```

#### Exemple 2 : Bouton avec icône
```html
<!-- Avant -->
<button mat-raised-button>
  <mat-icon>add</mat-icon>
  <span>Nouvelle société</span>
</button>

<!-- Après -->
<button mat-raised-button>
  <mat-icon>add</mat-icon>
  <span>{{ 'societe.new' | translate }}</span>
</button>
```

#### Exemple 3 : Placeholder
```html
<!-- Avant -->
<input placeholder="Rechercher par nom...">

<!-- Après -->
<input [placeholder]="'societe.searchPlaceholder' | translate">
```

#### Exemple 4 : Messages d'erreur dans TypeScript
```typescript
// Avant
this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });

// Après
this.snackBar.open(
  this.i18n.t('errors.loadError'), 
  this.i18n.t('common.close'), 
  { duration: 3000 }
);
```

#### Exemple 5 : Labels de formulaire
```html
<!-- Avant -->
<mat-label>Raison Sociale *</mat-label>

<!-- Après -->
<mat-label>{{ 'societe.raisonSociale' | translate }} *</mat-label>
```

#### Exemple 6 : Options de sélection
```html
<!-- Avant -->
<mat-option value="">Tous les statuts</mat-option>
<mat-option value="active">Actives</mat-option>

<!-- Après -->
<mat-option value="">{{ 'societe.allStatuses' | translate }}</mat-option>
<mat-option value="active">{{ 'common.activeFem' | translate }}</mat-option>
```

### 5. Vérifications

Après chaque mise à jour, vérifier :
1. ✅ Le composant compile sans erreur
2. ✅ Le pipe `translate` est importé dans le composant
3. ✅ Le service `I18nService` est injecté si utilisé dans le TS
4. ✅ Les clés de traduction existent dans `fr.json` et `en.json`
5. ✅ Tester le changement de langue dans l'interface

### 6. Commandes utiles

```bash
# Vérifier les erreurs de lint
npm run lint

# Démarrer le serveur de développement
npm start

# Build de production
npm run build
```

## Notes importantes

- Les clés de traduction sont organisées par sections (common, admin, societe, etc.)
- Utiliser `common.*` pour les textes réutilisables (boutons, actions, etc.)
- Les clés avec `Fem` sont pour les formes féminines en français
- Pour les paramètres dynamiques, utiliser `{{ 'key' | translate:params }}`
- Toujours tester avec les deux langues (fr et en)

