# 🚀 BACKEND IORECYCLING - PHASE 1 COMPLÉTÉE

## ✅ CE QUI A ÉTÉ CRÉÉ

### 📦 1. Entités JPA (6 entités)

**✓ Societe.java**
- Raison sociale, ICE unique (15 chiffres), email, téléphone, commentaire
- Relations : OneToMany vers Site, ClientUser, Enlevement, Document
- Méthodes utilitaires : addSite(), removeUser()

**✓ ClientUser.java**
- Nom, prénom, poste occupé, email unique, téléphone
- ManyToOne vers Societe
- Champ keycloakUserId pour SSO
- Champ active pour désactivation

**✓ Site.java**
- Name, adresse
- ManyToOne vers Societe
- OneToMany vers Enlevement

**✓ Enlevement.java**
- Numéro unique (ENL-YYYY-NNNNNN généré automatiquement)
- Date enlèvement, site, société, observation
- Relations vers PickupItem et Document

**✓ PickupItem.java**
- **Enum TypeDechet** : VALORISABLE, BANAL, A_ELIMINER
- Sous-type (obligatoire pour VALORISABLE)
- Quantité (kg), prix unitaire, montant (calculé auto avec @PrePersist)
- Validation automatique du sous-type

**✓ Document.java**
- **Enum TypeDocument** : BSDI, PV_DESTRUCTION, ATTESTATION_VALORISATION, ATTESTATION_ELIMINATION, FACTURE
- Mode enlèvement (enlevementId NOT NULL) ou mensuel (periodeMois NOT NULL)
- Validation XOR avec @PrePersist/@PreUpdate

---

### 🗄️ 2. Repositories (6 repositories)

**✓ SocieteRepository**
- existsByIce(), findByIce(), countActiveSocietes()

**✓ ClientUserRepository**
- findByEmail(), findByKeycloakUserId(), findBySocieteId()

**✓ SiteRepository**
- findBySocieteId(), countBySocieteId()

**✓ EnlevementRepository**
- findByNumeroEnlevement(), findBySocieteId()
- findBySocieteIdAndDateBetween()
- countBySocieteIdAndDateBetween()
- findEnlevementsWithMissingDocuments()

**✓ PickupItemRepository**
- **Queries pour KPIs** :
  - sumQuantiteByTypeForSocieteAndPeriod()
  - calculateBudgetValorisation() (VALORISABLE uniquement)
  - calculateBudgetTraitement() (BANAL + A_ELIMINER)
  - getDetailValorisableBySousType()

**✓ DocumentRepository**
- findByEnlevementId(), findDocumentsMensuelsBySociete()
- existsBsdiForEnlevement(), existsPvForEnlevement()

---

### 🔄 3. DTOs (13 DTOs)

**Pour les Sociétés :**
- SocieteDTO, CreateSocieteRequest, UpdateSocieteRequest

**Pour les Utilisateurs :**
- ClientUserDTO, CreateClientUserRequest

**Pour les Sites :**
- SiteDTO, CreateSiteRequest

**Pour les Enlèvements :**
- EnlevementDTO, CreateEnlevementRequest
- PickupItemDTO, CreatePickupItemRequest

**Pour les Documents :**
- DocumentDTO

**Pour le Dashboard :**
- DashboardKpisDTO (avec les 5 KPIs)

---

### 🔧 4. Services (3 services)

**✓ SocieteService**
- createSociete(), getAllSocietes(), getSocieteById()
- updateSociete(), deleteSociete()

**✓ EnlevementService**
- createEnlevement(), getEnlevementById()
- getEnlevementsBySociete(), getEnlevementsBySocieteAndDateRange()
- deleteEnlevement()

**✓ DashboardService**
- calculateKpis() : Calcule les 5 KPIs du portail client
  - Quantités par type (VALORISABLE, BANAL, A_ELIMINER)
  - Nombre d'enlèvements
  - Budget valorisation
  - Budget traitement (A ELIMINER)
  - Bilan net et taux de valorisation

---

### 🎯 5. Mappers (2 mappers)

**✓ SocieteMapper**
- toDTO(), toEntity(), updateEntity()

**✓ EnlevementMapper**
- toDTO() avec calculs automatiques (budgets, taux)

---

### 🌐 6. Controllers REST (3 controllers)

**✓ AdminSocieteController** `/api/admin/societes`
```
POST   /api/admin/societes          → Créer société
GET    /api/admin/societes          → Lister sociétés (paginé)
GET    /api/admin/societes/{id}     → Détail société
PUT    /api/admin/societes/{id}     → Modifier société
DELETE /api/admin/societes/{id}     → Supprimer société
```

**✓ AdminEnlevementController** `/api/admin/enlevements`
```
POST   /api/admin/enlevements       → Créer enlèvement
GET    /api/admin/enlevements/{id}  → Détail enlèvement
GET    /api/admin/enlevements       → Lister enlèvements (paginé)
GET    /api/admin/enlevements/search → Rechercher par période
DELETE /api/admin/enlevements/{id}  → Supprimer enlèvement
```

**✓ ClientDashboardKpisController** `/api/client/dashboard`
```
GET    /api/client/dashboard/kpis   → Tous les KPIs (5 KPIs)
GET    /api/client/dashboard/count  → Nombre d'enlèvements
```

---

### 📊 7. Migration Flyway

**✓ V4__new_model.sql**
- Création des 6 tables avec toutes les contraintes
- 14 index pour performance
- Contraintes CHECK sur TypeDechet et TypeDocument
- Contrainte XOR sur Document (enlèvement OU mensuel)
- Données de démonstration (3 sociétés, 3 utilisateurs, 4 sites, 4 enlèvements)

---

## 🧪 TESTER L'API

### Prérequis

1. **Lancer l'application** :
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

2. **Accéder à Swagger UI** :
```
http://localhost:8080/swagger-ui.html
```

---

### 📝 Tests avec cURL

#### 1. Créer une société

```bash
curl -X POST http://localhost:8080/api/admin/societes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "raisonSociale": "TEST COMPANY SARL",
    "ice": "001234567890123",
    "email": "contact@testcompany.ma",
    "telephone": "0537111111",
    "commentaire": "Société de test"
  }'
```

**Réponse attendue** : HTTP 201 avec la société créée (ID auto-généré)

---

#### 2. Lister toutes les sociétés

```bash
curl -X GET "http://localhost:8080/api/admin/societes?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse attendue** : HTTP 200 avec page de sociétés

---

#### 3. Créer un enlèvement

```bash
curl -X POST http://localhost:8080/api/admin/enlevements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "dateEnlevement": "2024-11-28",
    "siteId": 1,
    "societeId": 1,
    "observation": "Test enlèvement",
    "items": [
      {
        "typeDechet": "VALORISABLE",
        "sousType": "CARTON",
        "quantiteKg": 150.000,
        "prixUnitaireMad": 1.20
      },
      {
        "typeDechet": "BANAL",
        "sousType": null,
        "quantiteKg": 45.000,
        "prixUnitaireMad": 0.30
      }
    ]
  }'
```

**Réponse attendue** : HTTP 201 avec l'enlèvement créé
- numeroEnlevement généré automatiquement (ex: ENL-2024-000005)
- montantMad calculé automatiquement pour chaque item
- budgetValorisation, budgetTraitement, bilanNet calculés

---

#### 4. Récupérer les KPIs du dashboard client

```bash
curl -X GET "http://localhost:8080/api/client/dashboard/kpis?dateDebut=2024-11-01&dateFin=2024-11-30" \
  -H "Authorization: Bearer CLIENT_TOKEN"
```

**Réponse attendue** : HTTP 200 avec les 5 KPIs
```json
{
  "quantites": {
    "valorisable": 255.000,
    "banal": 45.000,
    "aEliminer": 0.000,
    "total": 300.000,
    "pourcentageValorisable": 85.0,
    "pourcentageBanal": 15.0,
    "pourcentageAEliminer": 0.0,
    "detailValorisable": {
      "CARTON": 150.000,
      "PLASTIQUE_PET": 80.000,
      "ALUMINIUM": 25.000
    }
  },
  "nombreEnlevements": 1,
  "moyenneParSemaine": 0.2,
  "budgetValorisation": 580.00,
  "budgetTraitement": 13.50,
  "bilanNet": 566.50,
  "tauxValorisation": 85.0,
  "dateDebut": "2024-11-01",
  "dateFin": "2024-11-30"
}
```

---

## ✅ VALIDATION

### Règles métier implémentées

✓ **ICE unique** : Impossible de créer 2 sociétés avec le même ICE
✓ **Email unique** : Un email ne peut être utilisé que pour un utilisateur
✓ **Sous-type obligatoire pour VALORISABLE** : Validation automatique avec exception
✓ **Calcul automatique du montant** : montantMad = quantiteKg × prixUnitaireMad
✓ **Document XOR** : Un document est soit lié à un enlèvement, soit mensuel (jamais les deux)
✓ **Budget A ELIMINER** : Somme des BANAL + A_ELIMINER (pas seulement A_ELIMINER)

### Calculs automatiques

✓ **Montant par item** : Calculé automatiquement à chaque sauvegarde
✓ **Budget valorisation** : SUM(montantMad WHERE typeDechet = VALORISABLE)
✓ **Budget traitement** : SUM(montantMad WHERE typeDechet IN ('BANAL', 'A_ELIMINER'))
✓ **Bilan net** : Budget valorisation - Budget traitement
✓ **Taux de valorisation** : (Poids valorisable / Poids total) × 100

---

## 🎯 PROCHAINES ÉTAPES

### À implémenter

1. **SiteService et Controller**
   - POST /api/admin/societes/{id}/sites
   - GET /api/admin/sites

2. **ClientUserService et Controller**
   - POST /api/admin/societes/{id}/users
   - Intégration Keycloak pour création compte

3. **DocumentService et Controller**
   - POST /api/admin/enlevements/{id}/documents (upload BSDI/PV)
   - POST /api/admin/documents/mensuels (upload attestations)
   - GET /api/client/documents (liste et téléchargement)
   - Intégration MinIO/S3

4. **Module Planification**
   - Entity PlanningEnlevement
   - Entity Recurrence
   - Service de génération automatique des enlèvements planifiés

5. **Module Demandes d'enlèvements**
   - Entity DemandeEnlevement
   - POST /api/client/demandes (créer demande)
   - GET /api/admin/demandes (traiter demandes)

6. **Validation documents A_ELIMINER**
   - Vérifier qu'un enlèvement avec A_ELIMINER a bien BSDI + PV
   - Bloquer la validation si documents manquants

7. **Tests unitaires**
   - Tests des services
   - Tests des repositories
   - Tests des controllers

8. **Sécurité**
   - Configuration Keycloak complète
   - Extraction du societeId depuis le JWT
   - Filtrage automatique par société pour les clients

---

## 📚 STRUCTURE DU CODE

```
backend/src/main/java/ma/iorecycling/
├── entity/
│   ├── Societe.java ✅
│   ├── ClientUser.java ✅
│   ├── Site.java ✅
│   ├── Enlevement.java ✅
│   ├── PickupItem.java ✅
│   └── Document.java ✅
├── repository/
│   ├── SocieteRepository.java ✅
│   ├── ClientUserRepository.java ✅
│   ├── SiteRepository.java ✅
│   ├── EnlevementRepository.java ✅
│   ├── PickupItemRepository.java ✅
│   └── DocumentRepository.java ✅
├── dto/
│   ├── SocieteDTO.java ✅
│   ├── CreateSocieteRequest.java ✅
│   ├── UpdateSocieteRequest.java ✅
│   ├── ClientUserDTO.java ✅
│   ├── CreateClientUserRequest.java ✅
│   ├── SiteDTO.java ✅
│   ├── CreateSiteRequest.java ✅
│   ├── EnlevementDTO.java ✅
│   ├── CreateEnlevementRequest.java ✅
│   ├── PickupItemDTO.java ✅
│   ├── CreatePickupItemRequest.java ✅
│   ├── DocumentDTO.java ✅
│   └── DashboardKpisDTO.java ✅
├── mapper/
│   ├── SocieteMapper.java ✅
│   └── EnlevementMapper.java ✅
├── service/
│   ├── SocieteService.java ✅
│   ├── EnlevementService.java ✅
│   └── DashboardService.java ✅
├── controller/
│   ├── AdminSocieteController.java ✅
│   ├── AdminEnlevementController.java ✅
│   └── ClientDashboardKpisController.java ✅
└── config/
    └── (existants)

backend/src/main/resources/db/migration/
└── V4__new_model.sql ✅
```

---

## 🎉 RÉSUMÉ

✅ **6 entités** JPA complètes avec relations et validations
✅ **6 repositories** avec queries custom pour les KPIs
✅ **13 DTOs** pour les échanges API
✅ **2 mappers** pour Entity ↔ DTO
✅ **3 services** métier avec logique business
✅ **3 controllers** REST avec Swagger
✅ **Migration Flyway** avec schéma complet et données de test
✅ **0 erreur** de compilation

**Total : 35+ fichiers créés ou modifiés**

Le backend est maintenant prêt pour :
- Créer et gérer des sociétés ✅
- Créer et gérer des enlèvements avec items ✅
- Calculer automatiquement tous les budgets ✅
- Fournir les 5 KPIs du dashboard client ✅
- Être testé via Swagger UI ✅

---

## 🚀 COMMANDES UTILES

```bash
# Compiler et lancer
mvn clean install
mvn spring-boot:run

# Accéder à Swagger
open http://localhost:8080/swagger-ui.html

# Accéder à la base de données (via docker)
docker exec -it iorecycling_postgres psql -U app -d app

# Voir les logs
tail -f backend/logs/app.log

# Tester une API
curl -X GET http://localhost:8080/api/admin/societes

# Regénérer la base (reset)
docker-compose down -v
docker-compose up -d postgres
mvn flyway:clean flyway:migrate
```

---

Prêt pour la phase 2 ! 🎯

