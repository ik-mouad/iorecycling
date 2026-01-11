# Internationalisation (i18n)

Ce dossier contient les fichiers de traduction pour l'application IORecycling.

## Fichiers de traduction

- `fr.json` : Traductions en français (langue par défaut)
- `en.json` : Traductions en anglais

## Structure des traductions

Les traductions sont organisées par sections :
- `common` : Textes communs (boutons, actions, etc.)
- `auth` : Textes liés à l'authentification
- `app` : Textes généraux de l'application
- `admin` : Textes de l'interface d'administration
- `transaction` : Textes liés aux transactions
- `enlevement` : Textes liés aux enlèvements
- `errors` : Messages d'erreur
- `success` : Messages de succès

## Utilisation dans les composants

### Dans les templates HTML

Utilisez le pipe `translate` :

```html
{{ 'common.save' | translate }}
{{ 'auth.login' | translate }}
{{ 'admin.title' | translate }}
```

### Dans les composants TypeScript

Injectez le service `I18nService` :

```typescript
import { I18nService } from '../../services/i18n.service';

constructor(private i18n: I18nService) {}

// Utilisation
const text = this.i18n.translate('common.save');
// ou avec le raccourci
const text = this.i18n.t('common.save');
```

### Avec paramètres

Pour les traductions avec paramètres, utilisez la syntaxe `{{param}}` dans le JSON :

```json
{
  "welcome": "Bienvenue {{name}}"
}
```

```typescript
this.i18n.t('welcome', { name: 'John' });
```

## Ajouter une nouvelle langue

1. Créez un nouveau fichier `{code_langue}.json` dans ce dossier
2. Copiez la structure de `fr.json` et traduisez les valeurs
3. Ajoutez le code de langue dans le type `SupportedLanguage` du service `I18nService`
4. Ajoutez l'option dans le composant `LanguageSelectorComponent`

## Sélecteur de langue

Le sélecteur de langue est disponible dans :
- La page de connexion (en haut à droite)
- Le layout admin (dans le header)

La langue sélectionnée est sauvegardée dans le localStorage et sera automatiquement restaurée lors de la prochaine visite.

