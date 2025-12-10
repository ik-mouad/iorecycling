# 📋 INSTRUCTIONS POUR CONTINUER LE REDESIGN

## 🎨 PATTERN À SUIVRE

Tous les composants doivent suivre le même pattern premium que `societes-list` et `enlevements-list`.

### Structure HTML Standard

```html
<div class="component-container">
  <!-- Header Premium -->
  <div class="page-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="page-title">Titre</h1>
        <p class="page-description">Description</p>
      </div>
      <div class="header-actions">
        <button mat-raised-button class="primary-button">Action</button>
      </div>
    </div>
  </div>

  <!-- Search & Filters Card (si nécessaire) -->
  <div class="search-filters-card">
    <!-- Contenu -->
  </div>

  <!-- Table Card (pour les listes) -->
  <div class="table-card">
    <!-- Table -->
    <!-- Pagination -->
  </div>
</div>
```

### Structure SCSS Standard

```scss
// Utiliser les mêmes tokens de couleur
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
// ... etc

// Container
.component-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px;
  background: $gray-50;
  animation: fadeIn 0.3s ease-out;
}

// Header (copier depuis societes-list)
.page-header { /* ... */ }

// Table (copier depuis societes-list)
.table-card { /* ... */ }

// Pagination (copier depuis societes-list)
.pagination-wrapper { /* ... */ }
```

### Badges Standards

```scss
// ICE / Numéro
.badge-ice {
  background: $blue-50;
  color: $blue-800;
  font-family: monospace;
}

// Sites / Count
.badge-sites {
  background: $gray-100;
  color: $gray-700;
}

// Enlèvements
.badge-enlevements {
  background: $amber-100;
  color: $amber-700;
}

// Success
.badge-success {
  background: $green-50;
  color: $green-600;
}

// Danger
.badge-danger {
  background: $red-50;
  color: $red-600;
}
```

### Actions Menu

```html
<button mat-icon-button [matMenuTriggerFor]="actionsMenu" class="actions-button">
  <mat-icon>more_vert</mat-icon>
</button>
<mat-menu #actionsMenu="matMenu">
  <button mat-menu-item>
    <mat-icon>visibility</mat-icon>
    <span>Voir détails</span>
  </button>
</mat-menu>
```

---

## ✅ CHECKLIST POUR CHAQUE COMPOSANT

- [ ] Header premium (32px titre, description)
- [ ] Bouton action 44px height
- [ ] Search/filters card si nécessaire
- [ ] Table card avec padding 20px
- [ ] Badges redesignés
- [ ] Actions menu dropdown
- [ ] Pagination moderne
- [ ] Responsive (1024px, 768px)
- [ ] Loading overlay
- [ ] Animations fadeIn
- [ ] Aucune erreur de linting
- [ ] Build réussi

---

## 🚀 COMMANDES UTILES

```bash
# Build
cd frontend && npm run build

# Linting
# Automatique dans l'IDE

# Déployer
docker compose build frontend
docker compose up -d frontend
```

---

## 📚 RÉFÉRENCES

- **societes-list** : Modèle de référence pour les listes
- **enlevements-list** : Modèle avec filtres et badges complexes
- **premium-design-system.scss** : Tokens et mixins partagés

---

**Bon courage !** 🎨

