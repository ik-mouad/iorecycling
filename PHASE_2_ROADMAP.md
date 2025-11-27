# 🚀 PHASE 2 - FONCTIONNALITÉS AVANCÉES

## 📊 ÉTAT DU PROJET

### ✅ PHASE 1 TERMINÉE (CE QUI EXISTE)

**Backend** :
- ✅ Entités JPA complètes (Societe, Site, Enlevement, PickupItem, Document)
- ✅ CRUD Sociétés (création, modification, suppression)
- ✅ CRUD Enlèvements (création, consultation, suppression)
- ✅ Calculs automatiques (budgets, bilan, taux)
- ✅ 5 KPIs Dashboard (APIs prêtes)

**Frontend** :
- ✅ Liste et formulaire sociétés
- ✅ Formulaire création enlèvement (3 étapes)
- ✅ Liste des enlèvements
- ✅ Dashboard client avec 5 KPIs
- ✅ Graphique Chart.js
- ✅ Filtres de période

**Documentation** :
- ✅ Descriptif fonctionnel complet (2100 lignes)
- ✅ Guides de tests Swagger
- ✅ Guides de développement

---

## 🎯 PHASE 2 - À DÉVELOPPER

La Phase 2 comprend **5 modules majeurs** non encore implémentés.

---

## MODULE 1 : GESTION DOCUMENTAIRE 📄

### Objectif
Permettre l'upload et le téléchargement de documents (BSDI, PV, attestations, factures)

### Fonctionnalités à développer

#### Backend

**1. DocumentController** (à créer)
```java
POST   /api/admin/enlevements/{id}/documents    → Upload BSDI ou PV
POST   /api/admin/documents/mensuels            → Upload attestation/facture
GET    /api/admin/documents                     → Lister tous documents
GET    /api/documents/{id}/download             → Télécharger document
DELETE /api/documents/{id}                      → Supprimer document

GET    /api/client/documents/enlevement         → BSDI et PV (client)
GET    /api/client/documents/mensuels           → Attestations et factures (client)
```

**2. DocumentService** (à créer)
- Upload vers MinIO/S3
- Génération URL présignée (15 min expiration)
- Validation documents obligatoires (BSDI + PV pour A_ELIMINER)
- Gestion stockage par société

**3. Validation automatique**
```java
// Lors de la création d'un enlèvement avec A_ELIMINER
if (enlevement contient A_ELIMINER) {
    vérifier que BSDI est présent
    vérifier que PV_DESTRUCTION est présent
    sinon → bloquer ou avertir
}
```

#### Frontend

**1. DocumentUploadComponent** (à créer)
- Upload fichier (drag & drop)
- Sélection type (BSDI, PV, Attestation, Facture)
- Progress bar
- Prévisualisation PDF/Image

**2. DocumentsListComponent** (à créer)
- Onglet 1 : Documents d'enlèvement (BSDI, PV)
- Onglet 2 : Documents mensuels (Attestations, Factures)
- Filtres (type, période, enlèvement)
- Bouton téléchargement

**Temps estimé** : 1-2 jours

---

## MODULE 2 : DEMANDES D'ENLÈVEMENTS 📝

### Objectif
Permettre aux clients de demander des enlèvements ponctuels en ligne

### Fonctionnalités à développer

#### Backend

**1. Entity DemandeEnlevement** (à créer)
```java
@Entity
class DemandeEnlevement {
    Long id;
    String numeroDemande;  // DEM-YYYY-NNNNNN
    LocalDate dateSouhaitee;
    String heureSouhaitee;
    Site site;
    Societe societe;
    String typeDechetEstime;
    Double quantiteEstimee;
    String commentaire;
    StatutDemande statut;  // EN_ATTENTE, VALIDEE, PLANIFIEE, REALISEE, REFUSEE, ANNULEE
    String motifRefus;
    LocalDateTime dateCreation;
    LocalDateTime dateTraitement;
}

enum StatutDemande {
    EN_ATTENTE, VALIDEE, PLANIFIEE, REALISEE, REFUSEE, ANNULEE
}
```

**2. DemandeController** (à créer)
```java
// Côté client
POST   /api/client/demandes                    → Créer demande
GET    /api/client/demandes                    → Mes demandes
PUT    /api/client/demandes/{id}/annuler       → Annuler demande

// Côté admin
GET    /api/admin/demandes                     → Toutes les demandes
GET    /api/admin/demandes/en-attente          → Demandes à traiter
PUT    /api/admin/demandes/{id}/valider        → Valider demande
PUT    /api/admin/demandes/{id}/refuser        → Refuser demande
PUT    /api/admin/demandes/{id}/planifier      → Planifier (créer PlanningEnlevement)
```

**3. DemandeService** (à créer)
- Création demande avec numéro auto (DEM-YYYY-NNNNNN)
- Workflow statuts
- Notifications email (optionnel)

#### Frontend

**1. DemandeFormComponent** (côté client)
- Formulaire simple : date, site, type déchets, quantité estimée
- Envoi de la demande
- Confirmation avec numéro

**2. MesDemandesComponent** (côté client)
- Liste des demandes avec statuts
- Filtres (statut, date)
- Bouton annuler (si EN_ATTENTE)

**3. TraiterDemandesComponent** (côté admin)
- Liste demandes EN_ATTENTE
- Actions : Valider, Refuser, Planifier
- Intégration avec le calendrier

**Temps estimé** : 2-3 jours

---

## MODULE 3 : PLANIFICATION ET RÉCURRENCES 📅

### Objectif
Gérer les enlèvements planifiés et les récurrences (collectes régulières)

### Fonctionnalités à développer

#### Backend

**1. Entity PlanningEnlevement** (à créer)
```java
@Entity
class PlanningEnlevement {
    Long id;
    LocalDate datePrevue;
    String heurePrevue;  // "09h00 - 11h00"
    Site site;
    Societe societe;
    StatutPlanning statut;  // PLANIFIE, CONFIRME, REALISE, ANNULE
    String commentaire;
    Recurrence recurrence;  // Si généré par récurrence
}
```

**2. Entity Recurrence** (à créer)
```java
@Entity
class Recurrence {
    Long id;
    Societe societe;
    Site site;
    TypeRecurrence type;  // HEBDOMADAIRE, BIMENSUELLE, MENSUELLE
    String jourSemaine;  // LUNDI, MARDI, etc. (si hebdo)
    String joursSemaneBimensuel;  // "LUNDI,JEUDI" (si bimensuel)
    Integer jourMois;  // 1-31 (si mensuel)
    String heurePrevue;
    LocalDate dateDebut;
    LocalDate dateFin;  // Nullable = sans fin
    Boolean active;
}

enum TypeRecurrence {
    HEBDOMADAIRE, BIMENSUELLE, MENSUELLE, PERSONNALISEE
}
```

**3. PlanningController** (à créer)
```java
POST   /api/admin/recurrences                  → Créer récurrence
GET    /api/admin/recurrences                  → Lister récurrences
PUT    /api/admin/recurrences/{id}             → Modifier récurrence
DELETE /api/admin/recurrences/{id}             → Supprimer récurrence

GET    /api/admin/planning                     → Calendrier du mois
GET    /api/admin/planning/{date}              → Enlèvements d'un jour
POST   /api/admin/planning                     → Ajouter enlèvement planifié manuel
PUT    /api/admin/planning/{id}                → Modifier date/heure
DELETE /api/admin/planning/{id}                → Annuler enlèvement planifié
PUT    /api/admin/planning/{id}/realiser       → Marquer comme réalisé → Créer Enlevement

GET    /api/client/planning/prochain           → Prochain enlèvement (pour KPI 1)
```

**4. RecurrenceService** (à créer)
- Génération automatique des PlanningEnlevement (3 mois à l'avance)
- Job schedulé (tous les jours à minuit)
- Gestion jours fériés
- Calcul dates selon type de récurrence

**5. PlanningService** (à créer)
- CRUD PlanningEnlevement
- Conversion PlanningEnlevement → Enlevement (quand réalisé)
- Requêtes optimisées pour calendrier

#### Frontend

**1. RecurrenceFormComponent** (admin)
- Formulaire création récurrence
- Type : Hebdomadaire, Bimensuelle, Mensuelle
- Sélection jours, heure
- Date début/fin

**2. RecurrenceListComponent** (admin)
- Liste des récurrences actives
- Actions : Modifier, Désactiver, Supprimer

**3. CalendrierPlanningComponent** (admin)
- Vue calendrier mensuel (Material Calendar ou FullCalendar)
- Drag & drop pour déplacer enlèvements
- Clic pour ajouter enlèvement manuel
- Couleurs par société
- Détails au survol

**4. TourneeJourComponent** (admin)
- Liste des enlèvements d'un jour
- Optimisation de l'ordre
- Export PDF pour chauffeur
- Bouton "Marquer comme réalisé" → Formulaire création Enlevement

**Temps estimé** : 4-5 jours

---

## MODULE 4 : SITES ET UTILISATEURS 👥

### Objectif
Gérer les sites et utilisateurs des sociétés

### Fonctionnalités à développer

#### Backend

**1. SiteController** (à créer)
```java
POST   /api/admin/societes/{societeId}/sites   → Ajouter site
GET    /api/admin/sites                        → Lister tous sites
GET    /api/admin/sites/{id}                   → Détail site
PUT    /api/admin/sites/{id}                   → Modifier site
DELETE /api/admin/sites/{id}                   → Supprimer site

GET    /api/societes/{societeId}/sites         → Sites d'une société
```

**2. ClientUserController** (à créer)
```java
POST   /api/admin/societes/{societeId}/users   → Ajouter utilisateur
GET    /api/admin/users                        → Lister tous utilisateurs
GET    /api/admin/users/{id}                   → Détail utilisateur
PUT    /api/admin/users/{id}                   → Modifier utilisateur
PUT    /api/admin/users/{id}/toggle-active     → Activer/Désactiver
DELETE /api/admin/users/{id}                   → Supprimer utilisateur

GET    /api/societes/{societeId}/users         → Utilisateurs d'une société
```

**3. KeycloakService** (à créer)
- Création automatique compte Keycloak lors de création ClientUser
- Synchronisation email, nom, prénom
- Assignation rôle CLIENT
- Envoi email d'activation

#### Frontend

**1. SocieteDetailComponent** (admin)
- Onglets : Infos, Sites, Utilisateurs, Enlèvements
- Boutons : Ajouter site, Ajouter utilisateur

**2. SiteFormComponent** (admin)
- Formulaire simple : Nom, Adresse
- Modal ou page séparée

**3. UserFormComponent** (admin)
- Formulaire : Nom, Prénom, Poste, Email, Téléphone
- Génération mot de passe temporaire
- Email d'activation

**4. SitesListComponent** (admin)
- Liste des sites (tous ou par société)
- Actions : Modifier, Supprimer

**5. UsersListComponent** (admin)
- Liste des utilisateurs (tous ou par société)
- Statut actif/inactif
- Actions : Modifier, Activer/Désactiver, Supprimer

**Temps estimé** : 3-4 jours

---

## MODULE 5 : SÉCURITÉ ET AUTHENTIFICATION 🔐

### Objectif
Intégrer Keycloak et sécuriser l'application

### Fonctionnalités à développer

#### Backend

**1. Configuration Keycloak complète**
- Vérifier que les @PreAuthorize fonctionnent
- Extraction du societeId depuis le JWT
- Mapping role Keycloak → Spring Security

**2. ClientContextService** (déjà existe, à améliorer)
```java
// Extraire le societeId depuis le JWT
public Long getSocieteId(Jwt jwt) {
    // Récupérer depuis claim "societe_id"
    // Ou via email → lookup ClientUser → societeId
}
```

**3. Filtrage automatique par société**
```java
// Dans tous les endpoints CLIENT
@GetMapping("/api/client/enlevements")
public Page<Enlevement> getEnlevements(@AuthenticationPrincipal Jwt jwt) {
    Long societeId = clientContextService.getSocieteId(jwt);
    // Filtrer automatiquement par societeId
}
```

#### Frontend

**1. Interceptor JWT** (à créer)
```typescript
// Ajouter le token JWT à toutes les requêtes
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler) {
        const token = this.authService.getToken();
        if (token) {
            request = request.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });
        }
        return next.handle(request);
    }
}
```

**2. AuthGuard** (à créer)
```typescript
// Protéger les routes selon le rôle
@Injectable()
export class RoleGuard implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot) {
        const requiredRole = route.data['role'];
        return this.authService.hasRole(requiredRole);
    }
}
```

**3. Configuration Keycloak**
```typescript
// Configuration OAuth2 avec angular-oauth2-oidc
export const authConfig: AuthConfig = {
    issuer: 'http://localhost:88/auth/realms/iorecycling',
    clientId: 'iorecycling-frontend',
    redirectUri: window.location.origin,
    scope: 'openid profile email'
};
```

**4. LoginComponent** (à créer)
- Bouton "Se connecter"
- Redirection vers Keycloak
- Gestion callback
- Stockage token

**5. Guards sur routes** (à ajouter)
```typescript
// Dans admin.routes.ts
{
    path: 'admin',
    canActivate: [RoleGuard],
    data: { role: 'ADMIN' },
    children: adminRoutes
}

// Dans client.routes.ts
{
    path: 'client',
    canActivate: [RoleGuard],
    data: { role: 'CLIENT' },
    children: clientRoutes
}
```

**Temps estimé** : 2-3 jours

---

## MODULE 6 : VUE DÉTAIL ET CONSULTATION 👁️

### Objectif
Pages de détail pour sociétés et enlèvements

### Fonctionnalités à développer

#### Frontend

**1. SocieteDetailComponent** (admin)
- Informations complètes
- Onglet Sites (liste + bouton ajouter)
- Onglet Utilisateurs (liste + bouton ajouter)
- Onglet Enlèvements (historique)
- Onglet Documents (tous les documents)
- Statistiques de la société (KPIs spécifiques)

**2. EnlevementDetailComponent** (admin ET client)
- Informations générales (date, site, société)
- Tableau des items avec détail
- Calculs (budgets, bilan, taux)
- Documents attachés (BSDI, PV)
- Observation
- Actions : Modifier (admin), Télécharger documents

**3. EnlevementListClientComponent** (client)
- Liste des enlèvements de la société (lecture seule)
- Filtres (date, site, type)
- Pagination
- Clic sur ligne → Voir détail

**Temps estimé** : 2 jours

---

## MODULE 7 : EXPORTS ET RAPPORTS 📊

### Objectif
Générer des rapports PDF et exports CSV

### Fonctionnalités à développer

#### Backend

**1. ReportController** (à créer)
```java
GET    /api/client/reports/mensuel/{mois}      → Rapport PDF valorisation
GET    /api/client/reports/annuel/{annee}      → Rapport PDF annuel
GET    /api/admin/exports/enlevements/csv      → Export CSV enlèvements
GET    /api/admin/exports/societes/csv         → Export CSV sociétés
```

**2. ReportService** (existe, à enrichir)
- Génération PDF avec OpenPDF
- Template rapport mensuel (valorisation + élimination)
- Template rapport annuel
- Graphiques dans le PDF (optionnel)

**3. ExportService** (à créer)
- Export CSV avec OpenCSV
- Colonnes configurables
- Export avec filtres

#### Frontend

**1. ReportsComponent** (client)
- Sélection du mois
- Bouton "Télécharger rapport PDF"
- Historique des rapports téléchargés

**2. Boutons export** (admin)
- Dans liste sociétés : "Export CSV"
- Dans liste enlèvements : "Export CSV"
- Avec les filtres appliqués

**Temps estimé** : 2-3 jours

---

## MODULE 8 : STATISTIQUES AVANCÉES 📈

### Objectif
Ajouter des graphiques et analyses approfondies

### Fonctionnalités à développer

#### Backend

**1. StatistiquesController** (à créer)
```java
GET    /api/admin/stats/global                 → Stats globales
GET    /api/admin/stats/par-societe            → Comparaison sociétés
GET    /api/admin/stats/par-materiau           → Volumes par matériau
GET    /api/admin/stats/evolution-mensuelle    → Évolution 12 mois
GET    /api/client/stats/evolution             → Évolution de la société
```

**2. StatistiquesService** (à créer)
- Agrégations complexes
- Calculs de tendances
- Comparaisons périodes

#### Frontend

**1. StatistiquesAdminComponent** (admin)
- Graphiques multiples (Chart.js)
- Top 5 sociétés par volume
- Évolution mensuelle globale
- Répartition par type de déchet
- Prix moyens par matériau

**2. GraphiquesEvolutionComponent** (client)
- Courbe d'évolution sur 12 mois
- Histogramme par mois
- Comparaison année N vs N-1

**Temps estimé** : 3-4 jours

---

## MODULE 9 : NOTIFICATIONS ET ALERTES 🔔

### Objectif
Envoyer des notifications aux utilisateurs

### Fonctionnalités à développer

#### Backend

**1. NotificationService** (à créer)
- Email enlèvement planifié (J-1)
- Email demande validée
- Email documents mensuels disponibles
- Email documents manquants (BSDI/PV)
- Email rappel si pas de collecte depuis X jours

**2. Configuration SMTP**
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: noreply@iorecycling.ma
    password: ${SMTP_PASSWORD}
```

**3. Job schedulé**
- Vérifier chaque jour les enlèvements du lendemain → Envoyer email
- Générer les planning 3 mois à l'avance
- Vérifier documents manquants

#### Frontend

**1. NotificationsCenterComponent** (à créer)
- Cloche avec badge (nombre non lues)
- Dropdown avec liste notifications
- Marquer comme lu
- Lien vers la ressource concernée

**Temps estimé** : 2 jours

---

## MODULE 10 : TESTS 🧪

### Objectif
Ajouter une couverture de tests complète

### À développer

#### Backend Tests

**1. Tests unitaires (JUnit 5)**
- SocieteServiceTest
- EnlevementServiceTest
- DashboardServiceTest
- Tests des calculs (budgets, taux)
- Tests des validations (ICE, sous-type)

**2. Tests d'intégration**
- Tests des controllers avec MockMvc
- Tests des repositories
- Tests des migrations Flyway

**Commande** :
```bash
mvn test
```

#### Frontend Tests

**1. Tests unitaires (Jasmine/Karma)**
- Tests des services (mocks HTTP)
- Tests des composants
- Tests des calculs côté client

**2. Tests E2E (Playwright)**
- Scénario : Créer société → Créer enlèvement → Voir dashboard
- Tests de régression
- Tests de navigation

**Commande** :
```bash
npm test          # Tests unitaires
npm run e2e       # Tests E2E
```

**Temps estimé** : 5-7 jours

---

## 📊 ESTIMATION GLOBALE PHASE 2

| Module | Complexité | Temps |
|--------|------------|-------|
| 1. Gestion documentaire | Moyenne | 1-2 jours |
| 2. Demandes enlèvements | Moyenne | 2-3 jours |
| 3. Planification | Élevée | 4-5 jours |
| 4. Sites et utilisateurs | Faible | 2 jours |
| 5. Sécurité Keycloak | Moyenne | 2-3 jours |
| 6. Vues détail | Faible | 2 jours |
| 7. Exports et rapports | Moyenne | 2-3 jours |
| 8. Statistiques avancées | Moyenne | 3-4 jours |
| 9. Notifications | Faible | 2 jours |
| 10. Tests | Élevée | 5-7 jours |

**TOTAL PHASE 2** : 25-35 jours (1-1.5 mois)

---

## 🎯 PAR QUOI COMMENCER LA PHASE 2 ?

### Recommandation : Ordre optimal

**Semaine 1** :
1. Module Sites et Utilisateurs (rapide, utile)
2. Module Sécurité (fondamental)

**Semaine 2** :
3. Module Gestion Documentaire (important)
4. Module Vues Détail (améliore UX)

**Semaine 3** :
5. Module Demandes d'enlèvements (valeur ajoutée client)
6. Module Planification (complexe mais crucial)

**Semaine 4-5** :
7. Module Exports et Rapports (utile)
8. Module Statistiques avancées (bonus)
9. Module Notifications (bonus)
10. Tests (qualité)

---

## ✅ VALIDATION PHASE 1

Avant de commencer la Phase 2, vérifier que la Phase 1 fonctionne :

- [ ] ✅ Backend démarre sans erreur
- [ ] ✅ Frontend démarre sans erreur
- [ ] ✅ Liste sociétés affiche 3 sociétés
- [ ] ✅ Créer société fonctionne
- [ ] ✅ Créer enlèvement fonctionne
- [ ] ✅ Calculs automatiques corrects
- [ ] ✅ Dashboard client affiche les 5 KPIs
- [ ] ✅ Graphique camembert s'affiche

**Si tout est ✅** : Prêt pour Phase 2 !

---

## 🎯 PRIORITÉS BUSINESS

Si vous devez choisir (ressources limitées) :

### Must Have (Priorité 1)
- ✅ Gestion documentaire (BSDI obligatoires)
- ✅ Sécurité Keycloak (isolation sociétés)
- ✅ Sites et utilisateurs (multi-users)

### Should Have (Priorité 2)
- ✅ Demandes d'enlèvements (valeur client)
- ✅ Planification basique (calendrier)
- ✅ Exports CSV (exploitation données)

### Nice to Have (Priorité 3)
- Récurrences automatiques (gain de temps)
- Statistiques avancées (analyses)
- Notifications email (confort)
- Tests complets (qualité)

---

## 📝 RÉSUMÉ

**Phase 1 (TERMINÉE)** :
- ✅ Modèle de données
- ✅ CRUD Sociétés et Enlèvements
- ✅ Calculs automatiques
- ✅ Dashboard 5 KPIs
- ✅ Interface moderne

**Phase 2 (À FAIRE)** :
- 📄 Gestion documentaire (upload/download)
- 📝 Demandes d'enlèvements (client → admin)
- 📅 Planification et récurrences (automatisation)
- 👥 Sites et utilisateurs (multi-users)
- 🔐 Sécurité Keycloak (isolation)
- 📊 Vues détail (UX)
- 📈 Exports et rapports (PDF/CSV)
- 📉 Statistiques avancées (analyses)
- 🔔 Notifications (email)
- 🧪 Tests (qualité)

**Estimation Phase 2** : 1 à 1.5 mois de développement

---

## 🚀 VOUS AVEZ DÉJÀ UNE APPLICATION FONCTIONNELLE !

La Phase 1 est **complète et utilisable** :
- Créer des sociétés ✅
- Créer des enlèvements avec calculs ✅
- Voir les KPIs en temps réel ✅

La Phase 2 ajoute :
- Plus de confort (demandes en ligne, planning)
- Plus de sécurité (Keycloak, isolation)
- Plus de fonctionnalités (documents, stats, exports)

**Vous pouvez déjà faire une démo avec la Phase 1 !** 🎉

---

## 👉 PROCHAINE ÉTAPE

### Valider la Phase 1

```bash
cat DEMARRAGE_RAPIDE.md
```

### Puis décider

- ⏸️ **Mettre en pause** et utiliser la Phase 1 telle quelle
- 🚀 **Continuer** avec la Phase 2 (voir ci-dessus)
- 🎯 **Prioriser** certains modules de la Phase 2 uniquement

**À vous de choisir !** 🎯

