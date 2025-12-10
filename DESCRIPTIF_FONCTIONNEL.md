# DESCRIPTIF FONCTIONNEL DÉTAILLÉ - IORECYCLING

## 📌 PRÉSENTATION GÉNÉRALE

**IORecycling** est une plateforme web complète de gestion et de traçabilité des déchets permettant aux entreprises de recyclage de gérer leurs opérations de collecte, de suivre les volumes traités et de fournir des rapports détaillés à leurs clients.

### Contexte métier

L'application s'adresse à une entreprise de recyclage qui :
- Collecte différents types de déchets chez plusieurs sociétés clientes
- Doit tracer précisément les quantités collectées par type de déchet
- Doit valoriser les matériaux recyclables (génère un revenu)
- Doit gérer les déchets non valorisables qui génèrent un coût de traitement
- Doit fournir des attestations de valorisation et d'élimination à ses clients
- Doit conserver les documents justificatifs (BSDI, PV de destruction, factures)
- Doit permettre aux clients de demander des enlèvements et de consulter leurs données

### Objectifs de la plateforme

✅ **Digitaliser** la gestion des enlèvements et remplacer les fichiers Excel  
✅ **Automatiser** les calculs financiers (valorisation et coûts de traitement)  
✅ **Tracer** l'ensemble des déchets collectés et traités  
✅ **Faciliter** la conformité réglementaire (BSDI obligatoires, conservation documents)  
✅ **Offrir** un portail client avec visibilité en temps réel  
✅ **Optimiser** la planification des tournées de collecte  

---

## 🗄️ MODÈLE DE DONNÉES

### Vue d'ensemble

L'application IORecycling est structurée autour de **6 entités principales** :

```
SOCIETE (entreprise cliente)
  └── ClientUser (utilisateurs)
  └── Site (lieux de collecte)
  └── Enlevement (collectes effectuées)
       └── PickupItem (lignes de détail)
       └── Document (BSDI, PV)
  └── Document (attestations mensuelles, factures)
```

---

### 1. Societe (Entreprise cliente)

**Définition** : Représente une entreprise cliente qui produit des déchets à recycler

**Attributs** :
- `id` : Identifiant unique
- `raisonSociale` : Nom officiel de l'entreprise (ex: "YAZAKI MOROCCO KENITRA")
- `ice` : Identifiant Commun de l'Entreprise (15 chiffres - numéro fiscal marocain) - **UNIQUE**
- `email` : Email de contact principal
- `telephone` : Téléphone général
- `commentaire` : Notes libres (type de contrat, particularités)
- `dateCreation` : Date de création du compte

**Relations** :
- Une société possède **plusieurs sites** (1→N)
- Une société possède **plusieurs utilisateurs** (1→N)
- Une société possède **plusieurs enlèvements** (1→N)

**Exemple** :
```json
{
  "raisonSociale": "YAZAKI MOROCCO KENITRA",
  "ice": "002345678901234",
  "email": "contact@yazaki.ma",
  "telephone": "0537123456",
  "commentaire": "Contrat annuel - 2 collectes/semaine - Industrie automobile"
}
```

**Règle métier** :
- L'ICE est unique dans le système
- Une société doit avoir au moins un site pour recevoir des enlèvements
- La suppression d'une société entraîne la suppression en cascade de toutes ses données

---

### 2. ClientUser (Utilisateur)

**Définition** : Représente un utilisateur (personne physique) rattaché à une société

**Attributs** :
- `id` : Identifiant unique
- `nom` : Nom de famille
- `prenom` : Prénom
- `posteOccupe` : Fonction dans l'entreprise
- `email` : Adresse email (login unique)
- `telephone` : Numéro de téléphone
- `societeId` : Référence vers la société

**Relations** :
- Un utilisateur appartient à **une seule société** (N→1)

**Exemple** :
```json
{
  "nom": "BENNANI",
  "prenom": "Sarah",
  "posteOccupe": "Responsable Environnement et RSE",
  "email": "s.bennani@yazaki.ma",
  "telephone": "0661234567",
  "societeId": 5
}
```

**Règle de sécurité** :
```
Un ClientUser ne peut accéder qu'aux données de sa propre société
Filtre automatique : WHERE societe = user.societe
```

---

### 3. Site (Lieu de collecte)

**Définition** : Représente un lieu physique où s'effectuent les collectes

**Attributs** :
- `id` : Identifiant unique
- `societeId` : Référence vers la société propriétaire
- `name` : Nom du site (ex: "Usine de Tanger")
- `adresse` : Adresse complète

**Relations** :
- Un site appartient à **une seule société** (N→1)
- Un site peut avoir **plusieurs enlèvements** (1→N)

**Exemple** :
```json
{
  "societeId": 5,
  "name": "Usine principale Kenitra",
  "adresse": "Zone industrielle, Route de Rabat, Kenitra 14000"
}
```

**Cas d'usage** :
- Une entreprise multi-sites (chaîne de supermarchés) a un site par magasin
- Les statistiques peuvent être calculées par site
- Les tournées sont organisées par site

---

### 4. Enlevement (Collecte)

**Définition** : Représente une opération de collecte de déchets effectuée à une date donnée

**Attributs** :
- `id` : Identifiant unique
- `dateEnlevement` : Date effective de la collecte
- `siteId` : Site où s'est déroulée la collecte
- `societeId` : Société concernée (dénormalisé pour performance)
- `observation` : Commentaire libre (ex: "Qualité du tri excellente")
- `numeroEnlevement` : Numéro unique (ex: "ENL-2024-0152")

**Relations** :
- Un enlèvement appartient à **un site** (N→1)
- Un enlèvement appartient à **une société** (N→1)
- Un enlèvement contient **plusieurs items** (1→N)
- Un enlèvement peut avoir **plusieurs documents** (1→N) - BSDI et PV uniquement

**Exemple** :
```json
{
  "numeroEnlevement": "ENL-2024-0152",
  "dateEnlevement": "2024-11-28",
  "siteId": 12,
  "societeId": 5,
  "observation": "Collecte effectuée sans incident, bon tri"
}
```

---

### 5. PickupItem (Ligne de détail)

**Définition** : Représente une ligne de détail dans un enlèvement (un type de déchet spécifique)

**Attributs** :
- `id` : Identifiant unique
- `enlevementId` : Référence vers l'enlèvement
- `typeDechet` : Type principal (**VALORISABLE**, **BANAL**, **A_ELIMINER**)
- `sousType` : Sous-catégorie (obligatoire pour VALORISABLE)
- `quantiteKg` : Poids en kilogrammes (décimales autorisées)
- `prixUnitaireMad` : Prix au kilogramme en MAD
- `montantMad` : Montant total = quantiteKg × prixUnitaireMad (calculé automatiquement)

**Relations** :
- Un item appartient à **un enlèvement** (N→1)

#### Types de déchets

##### A. VALORISABLE (Déchets recyclables)

**Caractéristique** : Génère un **revenu** (budget positif)

**Sous-types obligatoires** :
- `CARTON` : Carton ondulé, carton plat
- `PLASTIQUE_PET` : Bouteilles plastique PET
- `PLASTIQUE_PEHD` : Plastique haute densité
- `ALUMINIUM` : Canettes, profilés
- `FER` : Ferraille, acier
- `CUIVRE` : Câbles, tubes
- `PAPIER` : Papier de bureau, journaux
- `VERRE` : Verre transparent, coloré

**Exemple** :
```json
{
  "typeDechet": "VALORISABLE",
  "sousType": "CARTON",
  "quantiteKg": 150.000,
  "prixUnitaireMad": 1.20,
  "montantMad": 180.00
}
```

##### B. BANAL (Déchets ordinaires)

**Caractéristique** : Génère un **coût** (budget négatif)

**Sous-type** : Optionnel

**Exemples** : Déchets de cantine, emballages souillés, déchets d'entretien

**Exemple** :
```json
{
  "typeDechet": "BANAL",
  "sousType": null,
  "quantiteKg": 450.000,
  "prixUnitaireMad": 0.30,
  "montantMad": 135.00
}
```

##### C. A_ELIMINER (Déchets dangereux)

**Caractéristique** : Génère un **coût élevé** (traitement spécialisé)

**Sous-type** : Optionnel (ex: HUILES_USAGEES, BATTERIES, PRODUITS_CHIMIQUES)

**Exemples** : Huiles usagées, batteries, déchets médicaux, amiante

**Particularité** : Nécessite obligatoirement un BSDI et un PV de destruction

**Exemple** :
```json
{
  "typeDechet": "A_ELIMINER",
  "sousType": "HUILES_USAGEES",
  "quantiteKg": 35.000,
  "prixUnitaireMad": 8.00,
  "montantMad": 280.00
}
```

**Règle de calcul** :
```javascript
montantMad = quantiteKg × prixUnitaireMad
montantMad = Math.round(montantMad * 100) / 100  // Arrondi à 2 décimales
```

---

### 6. Document (Fichier justificatif)

**Définition** : Représente un fichier (PDF, image) lié soit à un enlèvement, soit à une période mensuelle

**Attributs** :
- `id` : Identifiant unique
- `typeDocument` : Type de document (voir ci-dessous)
- `enlevementId` : Référence vers l'enlèvement (obligatoire pour BSDI et PV, null pour les autres)
- `societeId` : Référence vers la société
- `periodeMois` : Mois concerné au format YYYY-MM (obligatoire pour documents mensuels, null sinon)
- `fileName` : Nom du fichier original
- `mimeType` : Type MIME (application/pdf, image/jpeg, etc.)
- `size` : Taille en octets
- `storageKey` : Clé dans le stockage MinIO
- `uploadedAt` : Date d'upload
- `uploadedBy` : Utilisateur ayant uploadé

#### Types de documents

##### Documents liés à un enlèvement (enlevementId ≠ null)

**1. BSDI** : Bordereau de Suivi des Déchets Industriels
- Obligatoire pour les déchets de type `A_ELIMINER`
- Rattaché à un enlèvement spécifique
- Document réglementaire de traçabilité

**2. PV_DESTRUCTION** : Procès-verbal de destruction
- Obligatoire pour les déchets de type `A_ELIMINER`
- Rattaché à un enlèvement spécifique
- Preuve du traitement conforme

**Règle** :
```
IF typeDocument IN ('BSDI', 'PV_DESTRUCTION')
  THEN enlevementId IS NOT NULL
  AND periodeMois IS NULL
```

##### Documents mensuels (periodeMois ≠ null)

**3. ATTESTATION_VALORISATION** : Attestation mensuelle de valorisation
- Récapitulatif des déchets recyclables du mois
- NON rattaché à un enlèvement spécifique
- Fourni mensuellement au client

**4. ATTESTATION_ELIMINATION** : Attestation mensuelle d'élimination
- Récapitulatif des déchets éliminés (BANAL + A_ELIMINER) du mois
- NON rattaché à un enlèvement spécifique
- Fourni mensuellement au client

**5. FACTURE** : Facture mensuelle
- Document comptable récapitulatif du mois
- NON rattaché à un enlèvement spécifique
- Fourni mensuellement au client

**Règle** :
```
IF typeDocument IN ('ATTESTATION_VALORISATION', 'ATTESTATION_ELIMINATION', 'FACTURE')
  THEN enlevementId IS NULL
  AND periodeMois IS NOT NULL (format 'YYYY-MM')
```

**Exemples** :

```json
// Document d'enlèvement
{
  "typeDocument": "BSDI",
  "enlevementId": 152,
  "societeId": 5,
  "periodeMois": null,
  "fileName": "bsdi-2024-5412.pdf",
  "mimeType": "application/pdf",
  "size": 245678,
  "storageKey": "documents/2024/11/bsdi-2024-5412.pdf"
}

// Document mensuel
{
  "typeDocument": "ATTESTATION_VALORISATION",
  "enlevementId": null,
  "societeId": 5,
  "periodeMois": "2024-11",
  "fileName": "attestation-valor-nov-2024.pdf",
  "mimeType": "application/pdf",
  "size": 182345,
  "storageKey": "documents/2024/11/attestation-valor-nov-2024.pdf"
}
```

---

### Règles métier transversales

#### Règle 1 : Isolation des données par société
```sql
-- Un ClientUser ne voit que les données de sa société
SELECT * FROM Enlevement WHERE societeId = user.societeId
SELECT * FROM Document WHERE societeId = user.societeId
SELECT * FROM Site WHERE societeId = user.societeId
```

#### Règle 2 : Documents obligatoires pour A_ELIMINER
```
IF EXISTS (SELECT 1 FROM PickupItem 
           WHERE enlevementId = X 
           AND typeDechet = 'A_ELIMINER')
THEN
  - Un document BSDI est obligatoire pour cet enlèvement
  - Un document PV_DESTRUCTION est obligatoire pour cet enlèvement
```

#### Règle 3 : Sous-type obligatoire pour VALORISABLE
```
IF typeDechet = 'VALORISABLE'
THEN sousType IS NOT NULL
```

#### Règle 4 : Calcul automatique du montant
```
montantMad = quantiteKg × prixUnitaireMad
```

#### Règle 5 : Unicité de l'ICE
```
Societe.ice doit être unique (contrainte réglementaire marocaine)
```

---

## 👥 PROFILS UTILISATEURS

### 1. **Administrateur / Backoffice**

**Rôle** : Personnel de l'entreprise de recyclage

**Besoins** :
- Gérer le portefeuille de sociétés clientes
- Créer et gérer les utilisateurs clients
- Enregistrer tous les enlèvements effectués
- Planifier les enlèvements futurs (tournées)
- Gérer les récurrences (collectes hebdomadaires, bimensuelles)
- Traiter les demandes d'enlèvements clients
- Uploader les documents (BSDI, PV, attestations, factures)
- Avoir une vue globale de l'activité

**Droits** :
- ✅ Accès complet à toutes les données (toutes sociétés)
- ✅ Création, modification, suppression
- ✅ Upload de documents
- ✅ Planification et gestion des tournées

---

### 2. **Client / Utilisateur entreprise**

**Rôle** : Employé d'une société cliente

**Besoins** :
- Demander un enlèvement ponctuel
- Consulter l'historique des enlèvements de sa société
- Voir les statistiques et KPIs de sa société
- Télécharger les documents (BSDI, PV, attestations, factures)
- Voir la date du prochain enlèvement planifié
- Suivre les budgets de valorisation et de traitement

**Droits** :
- ✅ Consultation des données de sa société uniquement
- ✅ Demande d'enlèvements
- ✅ Téléchargement des documents de sa société
- ❌ Pas de modification des enlèvements
- ❌ Pas d'accès aux données d'autres sociétés

---

## 🎯 FONCTIONNALITÉS DÉTAILLÉES

## MODULE 1 : GESTION DES SOCIÉTÉS ET UTILISATEURS

### 1.1 Créer une société cliente

**Acteur** : Administrateur

**Déclencheur** : Signature d'un nouveau contrat avec une entreprise

**Processus** :
1. L'administrateur accède au module "Gestion des sociétés"
2. Il clique sur "Nouvelle société"
3. Il saisit les informations :
   - **Raison sociale** : Nom officiel complet
   - **ICE** : Numéro à 15 chiffres (vérifié par le système)
   - **Email** : Email principal
   - **Téléphone** : Téléphone général
   - **Commentaire** : Type de contrat, particularités
4. Le système vérifie l'unicité de l'ICE
5. La société est créée

**Exemple de saisie** :
```
Raison sociale : YAZAKI MOROCCO KENITRA
ICE : 002345678901234
Email : contact@yazaki.ma
Téléphone : 0537123456
Commentaire : Contrat annuel - 2 collectes/semaine - Industries automobile
```

**Règles métier** :
- L'ICE doit être unique
- Tous les champs sauf "Commentaire" sont obligatoires
- Une société doit avoir au moins un site avant de pouvoir avoir des enlèvements

**Résultat** : La société est enregistrée et peut maintenant avoir des sites, des utilisateurs et des enlèvements

---

### 1.2 Créer des utilisateurs pour une société

**Acteur** : Administrateur

**Contexte** : La société a besoin que ses employés accèdent au portail client

**Processus** :
1. L'administrateur accède à la fiche de la société
2. Il clique sur "Ajouter un utilisateur"
3. Il saisit :
   - **Nom** et **Prénom**
   - **Poste occupé** : Fonction dans l'entreprise
   - **Email** : Login unique
   - **Téléphone** : Numéro direct
4. Un compte Keycloak est créé automatiquement
5. L'utilisateur reçoit un email d'activation

**Exemple** :
```
Nom : BENNANI
Prénom : Sarah
Poste occupé : Responsable Environnement et RSE
Email : s.bennani@yazaki.ma
Téléphone : 0661234567
Société : YAZAKI MOROCCO KENITRA (rattachement automatique)
```

**Règles métier** :
- Un utilisateur est rattaché à une seule société
- L'email doit être unique dans le système
- Un utilisateur ne voit que les données de sa société

**Résultat** : L'utilisateur peut se connecter au portail client et accéder aux données de sa société

---

### 1.3 Gérer les sites d'une société

**Acteur** : Administrateur

**Contexte** : Une société possède plusieurs lieux de collecte

**Processus** :
1. L'administrateur accède à la fiche de la société
2. Il clique sur "Ajouter un site"
3. Il saisit :
   - **Nom du site** : Libellé clair
   - **Adresse** : Adresse complète
4. Le site est rattaché à la société

**Exemple** :
```
Société : YAZAKI MOROCCO KENITRA

Site 1 :
  Nom : Usine principale Kenitra
  Adresse : Zone industrielle, Route de Rabat, Kenitra 14000

Site 2 :
  Nom : Entrepôt logistique
  Adresse : Zone franche, Tanger Med, Tanger 90000
```

**Utilité** :
- Traçabilité : chaque enlèvement est lié à un site précis
- Planification : les tournées sont organisées par site
- Statistiques : KPIs par site (ex: "Quel site trie le mieux ?")

**Règles métier** :
- Un site appartient à une seule société
- Un enlèvement est toujours rattaché à un site (obligatoire)

---

## MODULE 2 : GESTION DES ENLÈVEMENTS

### 2.1 Créer un enlèvement (Backoffice)

**Acteur** : Administrateur

**Déclencheur** : Une collecte a été effectuée sur le terrain

**Processus** :

#### Étape 1 : Informations générales
```
Date de l'enlèvement : 28/11/2024
Société : YAZAKI MOROCCO KENITRA
Site : Usine principale Kenitra
Numéro : ENL-2024-0152 (généré automatiquement)
```

#### Étape 2 : Saisie des items (lignes de détail)

L'administrateur ajoute chaque type de déchet collecté :

**Item 1 - VALORISABLE** :
```
Type : VALORISABLE
Sous-type : CARTON
Quantité : 150,000 kg
Prix unitaire : 1,20 MAD/kg
Montant : 180,00 MAD (calculé automatiquement)
```

**Item 2 - VALORISABLE** :
```
Type : VALORISABLE
Sous-type : PLASTIQUE_PET
Quantité : 80,000 kg
Prix unitaire : 2,50 MAD/kg
Montant : 200,00 MAD
```

**Item 3 - VALORISABLE** :
```
Type : VALORISABLE
Sous-type : ALUMINIUM
Quantité : 25,000 kg
Prix unitaire : 8,00 MAD/kg
Montant : 200,00 MAD
```

**Item 4 - BANAL** :
```
Type : BANAL
Sous-type : (vide)
Quantité : 450,000 kg
Prix unitaire : 0,30 MAD/kg
Montant : 135,00 MAD
```

**Item 5 - A_ELIMINER** :
```
Type : A_ELIMINER
Sous-type : HUILES_USAGEES
Quantité : 35,000 kg
Prix unitaire : 8,00 MAD/kg
Montant : 280,00 MAD
```

#### Étape 3 : Observation (optionnel)
```
Observation : "Collecte effectuée sans incident, qualité du tri excellente"
```

#### Étape 4 : Calculs automatiques

Le système calcule automatiquement :

```
BUDGET VALORISATION (revenus)
  Carton : 180,00 MAD
  Plastique PET : 200,00 MAD
  Aluminium : 200,00 MAD
  ─────────────────────────
  Total : 580,00 MAD ✅

BUDGET A ELIMINER (coûts)
  Banal : 135,00 MAD
  A_ELIMINER : 280,00 MAD
  ─────────────────────────
  Total : 415,00 MAD ❌

BILAN NET : +165,00 MAD

POIDS TOTAL : 740,00 kg
TAUX DE VALORISATION : 34,5% (255 kg / 740 kg × 100)
```

#### Étape 5 : Upload des documents

**Obligatoire si A_ELIMINER présent** :
- Upload du BSDI (Bordereau de Suivi)
- Upload du PV de destruction

**Optionnel** :
- Photos de preuve

**Validation** :
```
Si PickupItem contient A_ELIMINER
  ET (BSDI manquant OU PV_DESTRUCTION manquant)
  ALORS
    Afficher erreur : "Documents obligatoires manquants"
    Bloquer la validation
```

#### Étape 6 : Sauvegarde

L'enlèvement est enregistré avec :
- Toutes les lignes items
- Les documents uploadés
- Les calculs automatiques
- L'horodatage

**Résultat** : L'enlèvement est visible par la société cliente dans son portail

---

### 2.2 Modifier un enlèvement

**Acteur** : Administrateur

**Cas d'usage** :
- Correction d'une erreur de saisie
- Mise à jour après recomptage
- Modification des prix

**Processus** :
1. Rechercher l'enlèvement par numéro, date ou société
2. Modifier les items (quantités, prix)
3. Ajouter/supprimer des items
4. Ajouter/remplacer des documents
5. Sauvegarder

**Règles** :
- Les calculs sont recalculés automatiquement
- L'historique de modification est tracé
- Seuls les administrateurs peuvent modifier

---

### 2.3 Consulter et filtrer les enlèvements

**Acteurs** : Administrateur ET Client

#### Vue Administrateur (toutes sociétés)

Filtres disponibles :
- **Par société** : Voir les enlèvements d'une société spécifique
- **Par site** : Voir les enlèvements d'un site particulier
- **Par date** : Période personnalisée
- **Par type de déchet dominant** : VALORISABLE, BANAL, A_ELIMINER

Affichage :
```
┌─────────┬────────────┬──────────────────────┬─────────────┬────────────┐
│ Numéro  │ Date       │ Société              │ Site        │ Bilan      │
├─────────┼────────────┼──────────────────────┼─────────────┼────────────┤
│ ENL-152 │ 28/11/2024 │ YAZAKI KENITRA       │ Usine       │ +165 MAD ✅│
│ ENL-151 │ 25/11/2024 │ MARJANE TANGER       │ Supermarché │ +420 MAD ✅│
│ ENL-150 │ 21/11/2024 │ CHU HASSAN II        │ Hôpital     │ -850 MAD ❌│
└─────────┴────────────┴──────────────────────┴─────────────┴────────────┘
```

#### Vue Client (société uniquement)

Le client voit uniquement ses propres enlèvements avec les mêmes filtres

---

## MODULE 3 : DEMANDE D'ENLÈVEMENT (CÔTÉ CLIENT)

### 3.1 Demander un enlèvement ponctuel

**Acteur** : Client (Utilisateur de la société)

**Contexte** : La société a besoin d'un enlèvement supplémentaire (hors planning habituel)

**Processus** :

#### Étape 1 : Accès au formulaire
1. Le client se connecte au portail
2. Il clique sur "Demander un enlèvement"

#### Étape 2 : Saisie de la demande
```
Site concerné : [Sélection parmi les sites de la société] ▼
  → Usine principale Kenitra

Date souhaitée : [Date picker]
  → 05/12/2024

Heure souhaitée (optionnel) : 
  → 09h00 - 11h00

Type de déchets estimé : [Cases à cocher]
  ☑ Déchets valorisables (carton, plastique, métaux)
  ☑ Déchets banals
  ☐ Déchets dangereux (A ELIMINER)

Quantité estimée : 
  → Environ 500 kg

Commentaire :
  → "Production exceptionnelle cette semaine, besoin d'un passage supplémentaire"
```

#### Étape 3 : Validation et envoi

Le client valide la demande. Le système :
1. Enregistre la demande avec statut `EN_ATTENTE`
2. Envoie une notification au backoffice
3. Affiche un message de confirmation au client

**Confirmation** :
```
✅ Votre demande d'enlèvement a été enregistrée

Numéro de demande : DEM-2024-0089
Date souhaitée : 05/12/2024
Site : Usine principale Kenitra

Statut : En attente de traitement

Vous serez notifié dès que la demande sera validée et planifiée.
```

#### Étape 4 : Suivi de la demande

Le client peut suivre l'état de sa demande :

```
┌───────────────┬──────────────┬─────────────┬────────────────┐
│ N° demande    │ Date         │ Site        │ Statut         │
├───────────────┼──────────────┼─────────────┼────────────────┤
│ DEM-2024-0089 │ 05/12/2024   │ Usine       │ 🟡 EN_ATTENTE  │
│ DEM-2024-0078 │ 20/11/2024   │ Usine       │ ✅ PLANIFIEE   │
│ DEM-2024-0056 │ 10/11/2024   │ Entrepôt    │ ✅ REALISEE    │
└───────────────┴──────────────┴─────────────┴────────────────┘
```

**États possibles** :
- `EN_ATTENTE` : Demande reçue, en cours de traitement
- `VALIDEE` : Demande acceptée
- `PLANIFIEE` : Enlèvement programmé dans le planning
- `REALISEE` : Enlèvement effectué
- `REFUSEE` : Demande refusée (avec motif)
- `ANNULEE` : Annulée par le client

---

### 3.2 Annuler une demande

**Acteur** : Client

**Condition** : La demande doit être en statut `EN_ATTENTE` ou `VALIDEE` (pas encore planifiée définitivement)

**Processus** :
1. Le client accède à la liste de ses demandes
2. Il clique sur "Annuler" pour la demande souhaitée
3. Il confirme l'annulation
4. Le statut passe à `ANNULEE`

---

## MODULE 4 : PLANIFICATION ET RÉCURRENCES (CÔTÉ BACKOFFICE)

### 4.1 Créer une récurrence d'enlèvement

**Acteur** : Administrateur

**Contexte** : Une société a un contrat avec des collectes régulières (hebdomadaires, bimensuelles, etc.)

**Processus** :

#### Étape 1 : Création de la récurrence
```
Société : YAZAKI MOROCCO KENITRA
Site : Usine principale Kenitra

Type de récurrence : [Sélection] ▼
  → HEBDOMADAIRE

Jour de la semaine : [Sélection] ▼
  → MERCREDI

Heure prévue : 
  → 09h00 - 11h00

Date de début : 
  → 01/12/2024

Date de fin (optionnel) :
  → (vide = sans fin)

Statut : ACTIF
```

**Types de récurrence disponibles** :
- `HEBDOMADAIRE` : Tous les X jours (ex: tous les mercredis)
- `BIMENSUELLE` : Deux fois par semaine (ex: lundi et jeudi)
- `MENSUELLE` : Une fois par mois (ex: le 1er de chaque mois)
- `PERSONNALISEE` : Jours spécifiques définis manuellement

#### Étape 2 : Génération automatique

Le système génère automatiquement les enlèvements planifiés :

```
Récurrence créée : HEBDOMADAIRE - MERCREDI

Enlèvements générés (3 mois à l'avance) :
✅ 04/12/2024 - PLANIFIE
✅ 11/12/2024 - PLANIFIE
✅ 18/12/2024 - PLANIFIE
✅ 25/12/2024 - PLANIFIE (⚠️ Jour férié - à confirmer)
✅ 01/01/2025 - PLANIFIE
...
```

**Règles** :
- Les enlèvements sont générés 3 mois à l'avance
- Ils sont automatiquement ajoutés au planning
- Les jours fériés sont signalés mais pas automatiquement exclus

---

### 4.2 Gérer le planning des enlèvements

**Acteur** : Administrateur

**Vue** : Calendrier mensuel avec tous les enlèvements planifiés

**Affichage** :
```
┌────────────────── DÉCEMBRE 2024 ──────────────────┐
│ Lun   Mar   Mer   Jeu   Ven   Sam   Dim          │
├───────────────────────────────────────────────────┤
│                    04                             │
│                    📦 YAZAKI                      │
│                                                   │
│  09    10    11    12    13    14    15          │
│              📦 YAZAKI                            │
│              📦 MARJANE                           │
│                                                   │
│  16    17    18    19    20    21    22          │
│              📦 YAZAKI                            │
│                    📦 CHU                         │
│                                                   │
│  23    24    25    26    27    28    29          │
│              📦 YAZAKI                            │
│              ⚠️ NOEL                              │
└───────────────────────────────────────────────────┘
```

**Actions disponibles** :
- **Modifier** une date ou heure
- **Annuler** un enlèvement planifié
- **Confirmer** un enlèvement
- **Marquer comme réalisé** (passe en création d'enlèvement réel)
- **Voir les détails** (société, site, type de déchets estimé)

---

### 4.3 Traiter les demandes d'enlèvements clients

**Acteur** : Administrateur

**Vue** : Liste des demandes en attente

```
┌───────────┬────────────┬──────────────────┬─────────────┬────────────┐
│ N° demande│ Date       │ Société          │ Site        │ Action     │
├───────────┼────────────┼──────────────────┼─────────────┼────────────┤
│ DEM-0089  │ 05/12/2024 │ YAZAKI KENITRA   │ Usine       │ [Traiter]  │
│ DEM-0090  │ 06/12/2024 │ MARJANE TANGER   │ Supermarché │ [Traiter]  │
│ DEM-0091  │ 08/12/2024 │ CHU HASSAN II    │ Hôpital     │ [Traiter]  │
└───────────┴────────────┴──────────────────┴─────────────┴────────────┘
```

**Processus de traitement** :

#### Option 1 : Valider et planifier
1. L'administrateur clique sur "Traiter"
2. Il voit les détails de la demande
3. Il planifie l'enlèvement dans le calendrier
4. Le statut passe à `PLANIFIEE`
5. Le client reçoit une notification avec la date confirmée

#### Option 2 : Refuser
1. L'administrateur clique sur "Refuser"
2. Il saisit un motif (ex: "Jour non disponible, merci de proposer une autre date")
3. Le statut passe à `REFUSEE`
4. Le client reçoit une notification avec le motif

---

### 4.4 Optimiser les tournées

**Acteur** : Administrateur

**Fonctionnalité** : Vue géographique des enlèvements planifiés pour optimiser les tournées

**Affichage** :
```
Tournée du 05/12/2024
─────────────────────

09h00 - YAZAKI KENITRA (Usine)
  └─ Déchets valorisables + banals
  └─ Durée estimée : 45 min

11h00 - MARJANE TANGER (Supermarché)
  └─ Déchets valorisables (carton, plastique)
  └─ Durée estimée : 30 min

14h00 - CHU HASSAN II (Hôpital)
  └─ Déchets dangereux (A ELIMINER)
  └─ Durée estimée : 1h00
  └─ ⚠️ Nécessite véhicule spécialisé

Distance totale : 85 km
Temps total estimé : 4h15
```

**Fonctionnalités** :
- Drag & drop pour réorganiser l'ordre
- Calcul automatique du temps et de la distance
- Alerte si véhicule spécialisé nécessaire (A_ELIMINER)
- Export du planning journalier pour les chauffeurs

---

## MODULE 5 : PORTAIL CLIENT - DASHBOARD ET KPIS

### 5.1 Vue d'ensemble du portail

**Acteur** : Client (Utilisateur de la société)

**Accès** : Le client voit uniquement les données de sa propre société

**Page d'accueil** : Dashboard avec KPIs principaux

---

### 5.2 KPI 1 : Date du prochain enlèvement

**Objectif** : Informer le client de la prochaine collecte planifiée

**Calcul** :
```sql
SELECT MIN(datePrevue) 
FROM PlanningEnlevement 
WHERE societeId = user.societeId 
  AND datePrevue >= CURRENT_DATE
  AND statut IN ('PLANIFIE', 'CONFIRME')
```

**Affichage** :
```
┌──────────────────────────────────────────┐
│  📅 PROCHAIN ENLÈVEMENT                  │
│                                          │
│  Lundi 2 décembre 2024                   │
│  📍 Site : Usine principale Kenitra      │
│  ⏰ Heure prévue : 09h00 - 11h00         │
│                                          │
│  ℹ️ Merci de préparer vos conteneurs    │
└──────────────────────────────────────────┘
```

**Cas particulier** :
```
Aucun enlèvement programmé

Besoin d'un enlèvement ?
[Demander un enlèvement]
```

---

### 5.3 KPI 2 : Quantités par type de déchet

**Objectif** : Visualiser la répartition des déchets sur la période

**Filtrage** : Le client peut sélectionner la période
- Mois en cours
- 3 derniers mois
- 6 derniers mois
- Année en cours
- Depuis le début de la prestation
- Personnalisé (date début - date fin)

**Calcul** :
```sql
-- Par type de déchet
SELECT 
  typeDechet,
  SUM(quantiteKg) as totalKg,
  (SUM(quantiteKg) / SUM(SUM(quantiteKg)) OVER ()) * 100 as pourcentage
FROM PickupItem
JOIN Enlevement ON PickupItem.enlevementId = Enlevement.id
WHERE Enlevement.societeId = user.societeId
  AND Enlevement.dateEnlevement BETWEEN dateDebut AND dateFin
GROUP BY typeDechet
```

**Affichage** :
```
┌───────────────────────────────────────────────────────────┐
│  📊 RÉPARTITION DES DÉCHETS                               │
│  Période : Novembre 2024 (01/11 - 30/11)                 │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  🔄 VALORISABLE      2 315 kg   (82,7%)   ████████████   │
│  🗑️ BANAL              450 kg   (16,1%)   ██             │
│  ☣️  A ELIMINER          35 kg    (1,2%)   █             │
│                                                           │
│  📦 TOTAL            2 800 kg  (100,0%)                   │
└───────────────────────────────────────────────────────────┘
```

**Graphique associé** : Diagramme en camembert (pie chart)

**Détail par sous-type** (drill-down pour VALORISABLE) :
```
🔄 VALORISABLE - Détail par matériau

Carton ondulé       1 250 kg   (54,0%)   ███████████
Plastique PET         320 kg   (13,8%)   ███
Plastique PEHD        180 kg    (7,8%)   ██
Aluminium              45 kg    (1,9%)   █
Fer                   520 kg   (22,5%)   █████
                    ─────────
TOTAL               2 315 kg  (100,0%)
```

---

### 5.4 KPI 3 : Nombre total d'enlèvements

**Objectif** : Compter les collectes effectuées sur la période

**Calcul** :
```sql
SELECT COUNT(*) 
FROM Enlevement 
WHERE societeId = user.societeId
  AND dateEnlevement BETWEEN dateDebut AND dateFin
```

**Affichage** :
```
┌──────────────────────────────────────────┐
│  📈 ENLÈVEMENTS EFFECTUÉS                │
│                                          │
│         12 collectes                     │
│                                          │
│  Période : Novembre 2024                 │
│  Moyenne : 3 par semaine                 │
│  Évolution : +15% vs octobre 2024 ✅     │
└──────────────────────────────────────────┘
```

**Graphique associé** : Courbe d'évolution mensuelle sur 12 mois

---

### 5.5 KPI 4 : Budget total de valorisation

**Objectif** : Calculer le revenu généré par les déchets recyclables

**Formule** :
```sql
SELECT SUM(montantMad) 
FROM PickupItem
JOIN Enlevement ON PickupItem.enlevementId = Enlevement.id
WHERE Enlevement.societeId = user.societeId
  AND Enlevement.dateEnlevement BETWEEN dateDebut AND dateFin
  AND typeDechet = 'VALORISABLE'
```

**Affichage** :
```
┌──────────────────────────────────────────┐
│  💰 VALORISATION (REVENUS)               │
│                                          │
│      + 12 450,00 MAD                     │
│                                          │
│  Période : Novembre 2024                 │
│  Évolution : +18% vs octobre 2024 ✅     │
└──────────────────────────────────────────┘
```

**Détail par sous-type** (tableau drill-down) :
```
┌──────────────────┬──────────┬───────────┬─────────────┐
│ Matériau         │ Quantité │ Prix/kg   │ Total       │
├──────────────────┼──────────┼───────────┼─────────────┤
│ Carton ondulé    │ 1 250 kg │ 1,20 MAD  │  1 500 MAD  │
│ Plastique PET    │   320 kg │ 2,50 MAD  │    800 MAD  │
│ Plastique PEHD   │   180 kg │ 1,80 MAD  │    324 MAD  │
│ Aluminium        │    45 kg │ 8,00 MAD  │    360 MAD  │
│ Fer              │   520 kg │ 0,80 MAD  │    416 MAD  │
├──────────────────┴──────────┴───────────┼─────────────┤
│ TOTAL VALORISATION                      │ 3 400 MAD ✅ │
└─────────────────────────────────────────┴─────────────┘
```

---

### 5.6 KPI 5 : Budget total de traitement (A ELIMINER)

**Objectif** : Calculer le coût des déchets non valorisables

**Formule** :
```sql
SELECT SUM(montantMad) 
FROM PickupItem
JOIN Enlevement ON PickupItem.enlevementId = Enlevement.id
WHERE Enlevement.societeId = user.societeId
  AND Enlevement.dateEnlevement BETWEEN dateDebut AND dateFin
  AND typeDechet IN ('BANAL', 'A_ELIMINER')
```

**Note terminologique** : 
> Dans la formule budgétaire, "A ELIMINER" regroupe les déchets BANAL + A_ELIMINER car ils génèrent tous les deux un coût de traitement (par opposition aux VALORISABLES qui génèrent un revenu).

**Affichage** :
```
┌──────────────────────────────────────────┐
│  💸 TRAITEMENT (COÛTS)                   │
│                                          │
│      - 1 740,00 MAD                      │
│                                          │
│  Période : Novembre 2024                 │
│  Évolution : -5% vs octobre 2024 ✅      │
│  (↓ = moins de coûts = bien)             │
└──────────────────────────────────────────┘
```

**Détail par type** :
```
┌──────────────────┬──────────┬───────────┬─────────────┐
│ Type             │ Quantité │ Prix/kg   │ Total       │
├──────────────────┼──────────┼───────────┼─────────────┤
│ BANAL            │   450 kg │ 0,30 MAD  │    135 MAD  │
│ A_ELIMINER       │    35 kg │ 8,00 MAD  │    280 MAD  │
├──────────────────┴──────────┴───────────┼─────────────┤
│ TOTAL TRAITEMENT (A ELIMINER)           │    415 MAD ❌│
└─────────────────────────────────────────┴─────────────┘
```

---

### 5.7 Bilan financier global

**Calcul** :
```
Bilan net = Budget valorisation - Budget A ELIMINER
```

**Affichage** :
```
┌────────────────────────────────────────────────────┐
│  💵 BILAN FINANCIER                                │
│  Période : Novembre 2024                           │
├────────────────────────────────────────────────────┤
│  💰 Revenus (valorisation)   + 12 450,00 MAD       │
│  💸 Coûts (traitement)       -  1 740,00 MAD       │
├────────────────────────────────────────────────────┤
│  💵 BILAN NET                + 10 710,00 MAD   ✅  │
└────────────────────────────────────────────────────┘

🎯 Taux de valorisation : 87,9%
📈 Performance : Excellent
```

**Interprétation** :
- Bilan positif : Les revenus de valorisation dépassent les coûts de traitement ✅
- Bilan négatif : Les coûts de traitement dépassent les revenus ⚠️

---

### 5.8 Filtres de période

**Options disponibles** :

**1. Périodes prédéfinies** :
- Mois en cours
- Mois précédent
- 3 derniers mois
- 6 derniers mois
- Année en cours
- Année précédente

**2. Depuis le début de la prestation** :
```
Si dateDebut = null
  ALORS prendre tous les enlèvements depuis la création du compte
```

**3. Période personnalisée** :
```
Date de début : [01/10/2024] 📅
Date de fin   : [31/10/2024] 📅
[Appliquer]
```

**Affichage du filtre actif** :
```
📅 Période affichée : Novembre 2024 (01/11/2024 - 30/11/2024)
[Modifier la période ▼]
```

---

## MODULE 6 : GESTION DOCUMENTAIRE

### 6.1 Documents d'enlèvement (liés à un enlèvement)

**Types** : BSDI et PV_DESTRUCTION

**Acteur upload** : Administrateur

**Acteur consultation** : Administrateur ET Client

#### Uploader un document d'enlèvement

**Processus (Administrateur)** :
1. Accéder à la fiche de l'enlèvement
2. Cliquer sur "Ajouter un document"
3. Sélectionner le type : BSDI ou PV_DESTRUCTION
4. Choisir le fichier (PDF, image)
5. Uploader

**Validation** :
```
Si enlèvement contient des items de type A_ELIMINER
  ET BSDI manquant
  ALORS
    Afficher alerte : "⚠️ BSDI obligatoire pour cet enlèvement"

Si enlèvement contient des items de type A_ELIMINER
  ET PV_DESTRUCTION manquant
  ALORS
    Afficher alerte : "⚠️ PV de destruction obligatoire pour cet enlèvement"
```

#### Consulter les documents d'enlèvement (Client)

**Vue** : Liste des documents avec filtres

```
┌──────────────────────────────────────────────────────────────┐
│  📄 DOCUMENTS D'ENLÈVEMENT                                   │
│                                                              │
│  Filtres :                                                   │
│  [Type : Tous ▼] [Site : Tous ▼] [Période : Nov. 2024 ▼]   │
└──────────────────────────────────────────────────────────────┘

┌──────────┬──────────┬────────────────┬─────────────┬──────────┐
│ Date     │ Type     │ Enlèvement     │ Site        │ Action   │
├──────────┼──────────┼────────────────┼─────────────┼──────────┤
│ 28/11/24 │ BSDI     │ ENL-2024-0152  │ Tanger      │ [📥 PDF] │
│ 28/11/24 │ PV_DEST. │ ENL-2024-0152  │ Tanger      │ [📥 PDF] │
├──────────┼──────────┼────────────────┼─────────────┼──────────┤
│ 25/11/24 │ BSDI     │ ENL-2024-0148  │ Casablanca  │ [📥 PDF] │
│ 25/11/24 │ PV_DEST. │ ENL-2024-0148  │ Casablanca  │ [📥 PDF] │
└──────────┴──────────┴────────────────┴─────────────┴──────────┘
```

**Filtrage par enlèvement** : Le client peut aussi accéder aux documents depuis la fiche d'un enlèvement

---

### 6.2 Documents mensuels (NON liés à un enlèvement)

**Types** : ATTESTATION_VALORISATION, ATTESTATION_ELIMINATION, FACTURE

**Acteur upload** : Administrateur

**Acteur consultation** : Administrateur ET Client

#### Uploader un document mensuel

**Processus (Administrateur)** :
1. Accéder au module "Documents mensuels"
2. Cliquer sur "Ajouter un document mensuel"
3. Sélectionner la société
4. Sélectionner le type : ATTESTATION_VALORISATION, ATTESTATION_ELIMINATION ou FACTURE
5. Sélectionner le mois : 2024-11
6. Choisir le fichier PDF
7. Uploader

**Particularité** :
```
enlevementId = NULL
periodeMois = '2024-11' (format YYYY-MM)
```

#### Consulter les documents mensuels (Client)

**Vue** : Liste par mois

```
┌─────────────────────────────────────────────────────────────┐
│  📄 DOCUMENTS MENSUELS                                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬─────────────────────────┬──────────┬─────────┐
│ Période      │ Type                    │ Date     │ Action  │
├──────────────┼─────────────────────────┼──────────┼─────────┤
│ Nov. 2024    │ ATTESTATION_VALOR.      │ 05/12/24 │ [📥 PDF]│
│ Nov. 2024    │ ATTESTATION_ELIM.       │ 05/12/24 │ [📥 PDF]│
│ Nov. 2024    │ FACTURE                 │ 05/12/24 │ [📥 PDF]│
├──────────────┼─────────────────────────┼──────────┼─────────┤
│ Oct. 2024    │ ATTESTATION_VALOR.      │ 03/11/24 │ [📥 PDF]│
│ Oct. 2024    │ ATTESTATION_ELIM.       │ 03/11/24 │ [📥 PDF]│
│ Oct. 2024    │ FACTURE                 │ 03/11/24 │ [📥 PDF]│
└──────────────┴─────────────────────────┴──────────┴─────────┘
```

**Contenu type - ATTESTATION_VALORISATION** :
```
═══════════════════════════════════════════════════════════════
               ATTESTATION DE VALORISATION
                     Novembre 2024
───────────────────────────────────────────────────────────────
Société : YAZAKI MOROCCO KENITRA
ICE : 002345678901234
───────────────────────────────────────────────────────────────

Nous attestons avoir collecté et valorisé les déchets suivants :

Carton ondulé       1 250 kg × 1,20 MAD = 1 500,00 MAD
Plastique PET         320 kg × 2,50 MAD =   800,00 MAD
Plastique PEHD        180 kg × 1,80 MAD =   324,00 MAD
Aluminium              45 kg × 8,00 MAD =   360,00 MAD
Fer                   520 kg × 0,80 MAD =   416,00 MAD
                                          ─────────────
TOTAL VALORISATION                        3 400,00 MAD

Nombre d'enlèvements : 12
Taux de valorisation : 87,9%

Date d'émission : 05/12/2024
═══════════════════════════════════════════════════════════════
```

**Contenu type - ATTESTATION_ELIMINATION** :
```
═══════════════════════════════════════════════════════════════
              ATTESTATION D'ÉLIMINATION
                   Novembre 2024
───────────────────────────────────────────────────────────────
Société : CHU HASSAN II FES
ICE : 001234567890123
───────────────────────────────────────────────────────────────

Nous attestons avoir collecté et éliminé les déchets suivants
conformément à la réglementation en vigueur :

DÉCHETS BANALS
  Poids total : 120 kg
  Coût de traitement : 36,00 MAD

DÉCHETS DANGEREUX (A ELIMINER)
  Type : Déchets médicaux (DASRI)
  Poids total : 1 350 kg
  Coût de traitement : 10 800,00 MAD
  
  BSDI associés : BSD-2024-5401 à BSD-2024-5430
  PV de destruction : PV-2024-1810 à PV-2024-1839

Mode de traitement : Incinération
Centre de traitement : Centre agréé XYZ
                                          ─────────────
TOTAL ELIMINATION                        10 836,00 MAD

Nombre d'enlèvements : 30 (quotidiens)

Date d'émission : 05/12/2024
═══════════════════════════════════════════════════════════════
```

---

## 🔄 WORKFLOWS MÉTIER COMPLETS

### Workflow 1 : Collecte standard avec déchets valorisables

```
JOUR J-3 : PLANIFICATION
├─ Récurrence hebdomadaire : YAZAKI / Mercredi 9h
├─ Système génère automatiquement l'enlèvement planifié
└─ Notification envoyée au client : "Enlèvement prévu mercredi 28/11"

JOUR J-1 : PRÉPARATION
├─ Le client prépare ses conteneurs triés
├─ Le client consulte son portail : "Prochain enlèvement demain"
└─ Le backoffice prépare la tournée du lendemain

JOUR J : COLLECTE SUR TERRAIN
├─ 09h00 : Le chauffeur arrive chez YAZAKI
├─ Pesée des conteneurs (balance embarquée)
├─ Tri rapide et vérification de la qualité
├─ Signature du bordereau par le responsable site
└─ Chargement et départ vers le centre de tri

JOUR J (Après-midi) : TRAITEMENT AU CENTRE
├─ Déchargement au centre de tri
├─ Tri fin par type de matériau
│  ├─ Carton ondulé : 150 kg
│  ├─ Plastique PET : 80 kg
│  └─ Aluminium : 25 kg
├─ Pesée précise de chaque catégorie
└─ Conditionnement pour la revente

JOUR J+1 : SAISIE DANS L'APPLICATION
├─ L'administrateur crée l'enlèvement ENL-2024-0152
├─ Saisie des 3 items :
│  ├─ VALORISABLE / CARTON / 150 kg / 1,20 MAD = 180,00 MAD
│  ├─ VALORISABLE / PLASTIQUE_PET / 80 kg / 2,50 MAD = 200,00 MAD
│  └─ VALORISABLE / ALUMINIUM / 25 kg / 8,00 MAD = 200,00 MAD
├─ Calcul automatique : Budget valorisation = 580,00 MAD
└─ Scan et upload du bordereau signé

JOUR J+1 : VISIBILITÉ CLIENT
├─ Le client se connecte à son portail
├─ Il voit l'enlèvement du 28/11/2024
├─ KPIs mis à jour :
│  ├─ Quantité VALORISABLE : +255 kg
│  ├─ Nombre d'enlèvements : +1
│  └─ Budget valorisation : +580,00 MAD
└─ Il peut télécharger le bordereau

FIN DE MOIS : DOCUMENTS MENSUELS
├─ Le backoffice génère l'attestation de valorisation nov. 2024
├─ Le backoffice génère la facture mensuelle
├─ Upload des documents mensuels dans l'application
├─ Le client reçoit une notification
└─ Le client télécharge ses documents pour la comptabilité
```

---

### Workflow 2 : Collecte de déchets dangereux (A ELIMINER)

```
JOUR J-2 : DEMANDE CLIENT
├─ Le client se connecte au portail
├─ Il clique sur "Demander un enlèvement"
├─ Il remplit le formulaire :
│  ├─ Site : Hôpital CHU
│  ├─ Date souhaitée : 28/11/2024
│  ├─ Type : ☑ Déchets dangereux (A ELIMINER)
│  ├─ Quantité estimée : 45 kg
│  └─ Commentaire : "Déchets médicaux DASRI"
└─ Statut : EN_ATTENTE

JOUR J-2 : TRAITEMENT DEMANDE
├─ Le backoffice reçoit la notification
├─ Validation de la demande
├─ Planification avec véhicule spécialisé
├─ Émission du BSDI pré-rempli BSD-2024-5412
└─ Statut : PLANIFIEE → Notification envoyée au client

JOUR J : COLLECTE SÉCURISÉE
├─ 14h00 : Arrivée avec véhicule équipé
├─ Port des équipements de protection (EPI)
├─ Identification précise du type de déchets
├─ Conditionnement sécurisé (conteneurs étanches DASRI)
├─ Pesée : 45 kg (conforme à l'estimation)
├─ Étiquetage réglementaire
├─ Signature du BSDI (2 exemplaires) :
│  ├─ Exemplaire 1 : Client
│  └─ Exemplaire 2 : Transporteur
└─ Transport vers centre de traitement agréé

JOUR J : TRAITEMENT
├─ Remise au centre de traitement agréé
├─ Traitement par incinération spécialisée
├─ Le centre émet le certificat de traitement
├─ Le centre complète et signe le BSDI
├─ Émission du PV de destruction PV-2024-1823
└─ Renvoi des documents signés

JOUR J+1 : SAISIE COMPLÈTE
├─ Création de l'enlèvement ENL-2024-0152
├─ Saisie de l'item :
│  └─ A_ELIMINER / DASRI / 45 kg / 8,00 MAD = 360,00 MAD
├─ Calcul : Budget A ELIMINER = 360,00 MAD (coût)
├─ Upload OBLIGATOIRE :
│  ├─ BSDI-2024-5412.pdf (signé par toutes les parties)
│  └─ PV-2024-1823.pdf
└─ Validation impossible si documents manquants ❌

JOUR J+1 : VISIBILITÉ CLIENT
├─ Le client consulte son portail
├─ Il voit l'enlèvement du 28/11/2024
├─ KPIs mis à jour :
│  ├─ Quantité A_ELIMINER : +45 kg
│  ├─ Budget traitement : +360,00 MAD (coût)
│  └─ Nombre d'enlèvements : +1
├─ Il télécharge le BSDI signé (preuve réglementaire)
├─ Il télécharge le PV de destruction (preuve traitement)
└─ Documents archivés pour audits (conservation 10 ans minimum)

FIN DE MOIS : ATTESTATION ELIMINATION
├─ Génération de l'attestation d'élimination novembre 2024
├─ Récapitulatif de tous les déchets A_ELIMINER du mois
├─ Liste de tous les BSDI et PV associés
├─ Upload dans le portail client
└─ Le client l'utilise pour sa conformité réglementaire
```

---

### Workflow 3 : Consultation client avec KPIs

```
CONNEXION
├─ Le client (Sarah BENNANI) se connecte via Keycloak
├─ Authentification SSO
├─ Identification : societeId = 5 (YAZAKI KENITRA)
└─ Redirection vers le dashboard personnel

DASHBOARD - VUE D'ENSEMBLE
┌────────────────────────────────────────────────────────┐
│  📅 PROCHAIN ENLÈVEMENT                                │
│  Mercredi 4 décembre 2024 - 09h00                      │
│  Site : Usine principale Kenitra                       │
└────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│ 💰 VALORISATION  │ 💸 TRAITEMENT    │ 📈 ENLÈVEMENTS   │
│ +12 450 MAD      │ -1 740 MAD       │ 12 collectes     │
│ ↗ +18% vs oct.   │ ↘ -5% vs oct.    │ 3 par semaine    │
└──────────────────┴──────────────────┴──────────────────┘

NAVIGATION : FILTRAGE PAR PÉRIODE
├─ Le client clique sur le filtre période
├─ Il sélectionne "3 derniers mois"
├─ Tous les KPIs se recalculent automatiquement
└─ Les graphiques s'adaptent

NAVIGATION : QUANTITÉS PAR TYPE
├─ Le client clique sur le KPI "Quantités"
├─ Affichage du graphique en camembert
├─ Il clique sur "VALORISABLE" (82,7%)
├─ Drill-down : Détail par sous-type
│  ├─ Carton : 1 250 kg (54%)
│  ├─ Plastique PET : 320 kg (13,8%)
│  ├─ Fer : 520 kg (22,5%)
│  └─ Autres : 225 kg (9,7%)
└─ Export CSV possible

NAVIGATION : DOCUMENTS
├─ Le client clique sur "Documents"
├─ Onglet 1 : Documents d'enlèvement
│  ├─ Filtre par type : BSDI
│  ├─ Filtre par période : Novembre 2024
│  ├─ Résultat : 2 BSDI trouvés
│  └─ Téléchargement : [📥 BSDI-2024-5412.pdf]
│
└─ Onglet 2 : Documents mensuels
   ├─ Attestation valorisation Nov. 2024 [📥 PDF]
   ├─ Attestation élimination Nov. 2024 [📥 PDF]
   └─ Facture Nov. 2024 [📥 PDF]

NAVIGATION : DEMANDER UN ENLÈVEMENT
├─ Le client clique sur "Demander un enlèvement"
├─ Il remplit le formulaire :
│  ├─ Site : Entrepôt logistique
│  ├─ Date souhaitée : 10/12/2024
│  ├─ Type : Déchets valorisables
│  └─ Quantité : ~300 kg
├─ Validation et envoi
└─ Confirmation : DEM-2024-0095 créée

DÉCONNEXION
└─ Le client se déconnecte et reçoit un email récapitulatif
```

---

## 📊 RÈGLES MÉTIER ET CALCULS

### Calcul du budget de valorisation

**Formule** :
```sql
Budget valorisation = SUM(montantMad) 
WHERE typeDechet = 'VALORISABLE'
  AND enlevement.societeId = X
  AND enlevement.dateEnlevement BETWEEN dateDebut AND dateFin
```

**Détail par item** :
```
Pour chaque PickupItem où typeDechet = 'VALORISABLE' :
  montantMad = quantiteKg × prixUnitaireMad
  
Budget total valorisation = SOMME de tous les montantMad
```

**Exemple** :
```
Carton : 150 kg × 1,20 MAD/kg = 180,00 MAD
Plastique : 80 kg × 2,50 MAD/kg = 200,00 MAD
Aluminium : 25 kg × 8,00 MAD/kg = 200,00 MAD
───────────────────────────────────────────
TOTAL VALORISATION = 580,00 MAD ✅ (revenu)
```

---

### Calcul du budget de traitement (A ELIMINER)

**Terminologie** :
> Dans les formules budgétaires, **"A ELIMINER"** regroupe les déchets **BANAL** + **A_ELIMINER** car ils génèrent tous les deux un coût de traitement (par opposition aux VALORISABLES qui génèrent un revenu).

**Formule** :
```sql
Budget A ELIMINER = SUM(montantMad) 
WHERE typeDechet IN ('BANAL', 'A_ELIMINER')
  AND enlevement.societeId = X
  AND enlevement.dateEnlevement BETWEEN dateDebut AND dateFin
```

**Détail** :
```
Pour chaque PickupItem où typeDechet IN ('BANAL', 'A_ELIMINER') :
  montantMad = quantiteKg × prixUnitaireMad
  
Budget total A ELIMINER = SOMME de tous les montantMad
```

**Exemple** :
```
BANAL : 450 kg × 0,30 MAD/kg = 135,00 MAD
A_ELIMINER : 35 kg × 8,00 MAD/kg = 280,00 MAD
───────────────────────────────────────────
TOTAL A ELIMINER = 415,00 MAD ❌ (coût)
```

---

### Calcul du bilan financier net

**Formule** :
```
Bilan net = Budget valorisation - Budget A ELIMINER

Bilan net = SUM(montantMad WHERE typeDechet = 'VALORISABLE')
          - SUM(montantMad WHERE typeDechet IN ('BANAL', 'A_ELIMINER'))
```

**Exemple complet** :
```
REVENUS (VALORISABLE)
  Carton : 180,00 MAD
  Plastique : 200,00 MAD
  Aluminium : 200,00 MAD
  ─────────────────────
  Total : 580,00 MAD ✅

COÛTS (A ELIMINER)
  Banal : 135,00 MAD
  A_ELIMINER : 280,00 MAD
  ─────────────────────
  Total : 415,00 MAD ❌

BILAN NET = 580,00 - 415,00 = +165,00 MAD ✅
```

---

### Calcul du taux de valorisation

**Formule** :
```
Taux de valorisation (%) = (Poids VALORISABLE / Poids total) × 100

Poids VALORISABLE = SUM(quantiteKg WHERE typeDechet = 'VALORISABLE')
Poids total = SUM(quantiteKg) tous types confondus
```

**Exemple** :
```
Poids VALORISABLE : 255 kg (carton + plastique + aluminium)
Poids BANAL : 450 kg
Poids A_ELIMINER : 35 kg
────────────────────
Poids total : 740 kg

Taux = (255 / 740) × 100 = 34,5%
```

**Interprétation** :
- < 30% : Tri insuffisant ⚠️
- 30-50% : Tri correct ✓
- 50-70% : Bon tri ✓✓
- 70-85% : Très bon tri ✓✓✓
- > 85% : Excellent tri ✅✅✅

---

### Règles de cohérence des données

#### Règle 1 : Isolation par société
```sql
-- Un utilisateur ne voit que les données de sa société
WHERE enlevement.societeId = user.societeId
WHERE document.societeId = user.societeId
WHERE site.societeId = user.societeId
```

#### Règle 2 : Documents obligatoires
```sql
-- Si enlèvement contient A_ELIMINER
IF EXISTS (
  SELECT 1 FROM PickupItem 
  WHERE enlevementId = X 
  AND typeDechet = 'A_ELIMINER'
)
THEN
  -- BSDI obligatoire
  MUST EXISTS (
    SELECT 1 FROM Document 
    WHERE enlevementId = X 
    AND typeDocument = 'BSDI'
  )
  -- PV obligatoire
  MUST EXISTS (
    SELECT 1 FROM Document 
    WHERE enlevementId = X 
    AND typeDocument = 'PV_DESTRUCTION'
  )
```

#### Règle 3 : Documents mensuels vs enlèvement
```sql
-- Documents d'enlèvement
IF typeDocument IN ('BSDI', 'PV_DESTRUCTION')
  THEN enlevementId IS NOT NULL
  AND periodeMois IS NULL

-- Documents mensuels
IF typeDocument IN ('ATTESTATION_VALORISATION', 'ATTESTATION_ELIMINATION', 'FACTURE')
  THEN enlevementId IS NULL
  AND periodeMois IS NOT NULL
```

#### Règle 4 : Sous-type obligatoire pour VALORISABLE
```sql
IF typeDechet = 'VALORISABLE'
  THEN sousType IS NOT NULL
  AND sousType IN ('CARTON', 'PLASTIQUE_PET', 'PLASTIQUE_PEHD', 
                   'ALUMINIUM', 'FER', 'CUIVRE', 'PAPIER', 'VERRE')
```

#### Règle 5 : Calcul automatique du montant
```javascript
// Trigger lors de l'insertion ou modification d'un PickupItem
montantMad = quantiteKg × prixUnitaireMad
montantMad = Math.round(montantMad * 100) / 100  // Arrondi 2 décimales
```

#### Règle 6 : Unicité de l'ICE
```sql
-- Contrainte d'unicité sur Societe.ice
ALTER TABLE Societe ADD CONSTRAINT unique_ice UNIQUE (ice);
```

#### Règle 7 : Poids toujours positifs
```sql
quantiteKg >= 0
prixUnitaireMad >= 0
```

#### Règle 8 : Date d'enlèvement valide
```sql
dateEnlevement <= CURRENT_DATE
-- Un enlèvement ne peut pas être dans le futur
```

---

## 📈 INDICATEURS DE PERFORMANCE (KPI)

### KPI Opérationnels

**Pour le backoffice** :
- **Nombre total d'enlèvements / mois** : Suivi de l'activité globale
- **Nombre d'enlèvements par société** : Identification des clients actifs
- **Tonnage total collecté / mois** : Volume d'activité
- **Nombre de sociétés actives** : Clients ayant eu au moins 1 enlèvement dans le mois
- **Taux de remplissage des tournées** : Optimisation logistique
- **Nombre de demandes d'enlèvements en attente** : Suivi des demandes clients
- **Délai moyen de traitement des demandes** : Performance du service

**Pour le client** :
- **Date du prochain enlèvement** : Visibilité sur la planification
- **Nombre d'enlèvements dans la période** : Fréquence de collecte
- **Quantité par type de déchet** : VALORISABLE / BANAL / A_ELIMINER

---

### KPI Financiers

**Pour le backoffice** :
- **Chiffre d'affaires valorisation total / mois** : Revenus globaux
- **Budget A ELIMINER total / mois** : Coûts globaux de traitement
- **Marge nette globale** : Valorisation - A ELIMINER
- **Revenu moyen par enlèvement** : Rentabilité moyenne
- **Prix moyen par matériau** : Évolution des cours du marché

**Pour le client** :
- **Budget total de valorisation** : Revenus générés par le recyclage
- **Budget total de traitement (A ELIMINER)** : Coûts de traitement
- **Bilan net** : Valorisation - A ELIMINER
- **Ratio revenus/coûts** : Performance financière

---

### KPI Environnementaux

**Pour le backoffice** :
- **Taux de valorisation moyen** : (VALORISABLE / Total) × 100 toutes sociétés
- **Tonnage CO₂ évité** : Estimation via recyclage
- **Nombre de sociétés >70% de valorisation** : Sociétés performantes

**Pour le client** :
- **Taux de valorisation** : (VALORISABLE / Total) × 100
- **Évolution du taux de valorisation** : Comparaison vs mois précédent
- **Quantité de déchets dangereux traités** : Conformité réglementaire
- **Performance vs objectifs** : Si des objectifs sont définis (ex: 60%)

---

### KPI Qualité et Conformité

**Pour le backoffice** :
- **% d'enlèvements avec documents complets** : Qualité de saisie
- **% de BSDI uploadés dans les 48h** : Conformité réglementaire
- **Délai moyen entre enlèvement et saisie** : Réactivité
- **Nombre d'accès clients au portail / mois** : Adoption de la plateforme

**Pour le client** :
- **% de BSDI disponibles** : Traçabilité complète
- **% de PV de destruction disponibles** : Conformité
- **Disponibilité des attestations mensuelles** : Documents à jour

---

## 🎓 GLOSSAIRE MÉTIER

**A_ELIMINER** : Type de déchet dangereux nécessitant un traitement spécialisé (huiles usagées, batteries, déchets médicaux, produits chimiques). Dans les formules budgétaires, désigne aussi l'ensemble des coûts de traitement (BANAL + A_ELIMINER).

**BANAL** : Type de déchet ordinaire non dangereux, non valorisable, assimilable aux ordures ménagères (déchets de cantine, emballages souillés, déchets d'entretien).

**Bilan net** : Différence entre les revenus de valorisation et les coûts de traitement. Formule : Valorisation - A ELIMINER.

**BSDI (Bordereau de Suivi des Déchets Industriels)** : Document réglementaire obligatoire traçant le parcours des déchets dangereux. Doit être rattaché à un enlèvement spécifique.

**Budget A ELIMINER** : Somme des coûts de traitement des déchets non valorisables (BANAL + A_ELIMINER). Formule : SUM(montantMad WHERE typeDechet IN ('BANAL', 'A_ELIMINER')).

**Budget valorisation** : Somme des revenus générés par les déchets recyclables. Formule : SUM(montantMad WHERE typeDechet = 'VALORISABLE').

**ClientUser** : Utilisateur (personne physique) rattaché à une société cliente. Ne voit que les données de sa propre société.

**Documents d'enlèvement** : Documents liés à un enlèvement spécifique (BSDI, PV_DESTRUCTION). Obligatoires pour les déchets A_ELIMINER.

**Documents mensuels** : Documents récapitulatifs émis chaque mois (ATTESTATION_VALORISATION, ATTESTATION_ELIMINATION, FACTURE). Non liés à un enlèvement spécifique.

**Enlèvement / Collecte** : Opération de collecte de déchets effectuée à une date donnée, sur un site spécifique, contenant plusieurs items (lignes de détail).

**ICE (Identifiant Commun de l'Entreprise)** : Numéro fiscal marocain à 15 chiffres, unique par entreprise. Obligatoire pour identifier les sociétés.

**Item / PickupItem** : Ligne de détail d'un enlèvement représentant un type de déchet spécifique avec sa quantité, son prix unitaire et son montant total.

**Planification** : Enlèvements programmés à l'avance (PlanningEnlevement), avec gestion des récurrences (hebdomadaire, bimensuelle, mensuelle).

**PV_DESTRUCTION (Procès-verbal de destruction)** : Document attestant de la destruction ou du traitement conforme des déchets dangereux. Obligatoirement rattaché à un enlèvement.

**Récurrence** : Règle de répétition automatique des enlèvements (ex: tous les mercredis à 9h). Génère automatiquement les enlèvements planifiés.

**Site** : Lieu physique où s'effectue la collecte (usine, entrepôt, magasin). Une société peut avoir plusieurs sites.

**Société** : Entreprise cliente (personne morale) produisant des déchets à recycler. Possède un ICE, des sites, des utilisateurs et des enlèvements.

**Sous-type** : Catégorie détaillée d'un déchet (CARTON, PLASTIQUE_PET, ALUMINIUM, FER, CUIVRE, etc.). Obligatoire pour les déchets VALORISABLE.

**Taux de valorisation** : Pourcentage de déchets recyclés par rapport au poids total. Formule : (Poids VALORISABLE / Poids total) × 100.

**Type de déchet** : Catégorie principale d'un déchet : **VALORISABLE** (génère un revenu), **BANAL** (génère un coût), **A_ELIMINER** (génère un coût élevé + documents obligatoires).

**VALORISABLE** : Type de déchet recyclable ayant une valeur marchande (carton, plastiques, métaux, papier, verre). Génère un revenu (budget positif).

---

## ✅ SYNTHÈSE

**IORecycling** est une plateforme complète de gestion du recyclage qui digitalise l'ensemble de la chaîne de valeur, depuis la demande d'enlèvement jusqu'à la fourniture des attestations réglementaires.

### 🎯 Fonctionnalités clés

**Module 1 : Gestion des sociétés et utilisateurs**
- Création de sociétés avec ICE unique
- Gestion multi-sites par société
- Création d'utilisateurs rattachés aux sociétés
- Isolation totale des données par société

**Module 2 : Gestion des enlèvements**
- Enregistrement détaillé des collectes (date, site, items)
- 3 types de déchets : VALORISABLE, BANAL, A_ELIMINER
- Calcul automatique des budgets de valorisation et de traitement
- Upload obligatoire des BSDI et PV pour les déchets A_ELIMINER

**Module 3 : Demande d'enlèvement (côté client)**
- Les clients peuvent demander des enlèvements ponctuels
- Formulaire simple (site, date, type, quantité)
- Suivi du statut (EN_ATTENTE, VALIDEE, PLANIFIEE, REALISEE)
- Possibilité d'annulation

**Module 4 : Planification et récurrences (côté backoffice)**
- Création de récurrences (hebdomadaire, bimensuelle, mensuelle)
- Génération automatique des enlèvements planifiés (3 mois à l'avance)
- Calendrier de gestion des tournées
- Traitement des demandes clients et intégration au planning

**Module 5 : Portail client avec 5 KPIs**
- 📅 Date du prochain enlèvement
- 📊 Quantités par type de déchet (VALORISABLE / BANAL / A_ELIMINER)
- 📈 Nombre total d'enlèvements
- 💰 Budget total de valorisation (revenus)
- 💸 Budget total de traitement (coûts)
- Filtrage par période personnalisable
- Graphiques et tableaux de détail

**Module 6 : Gestion documentaire**
- **Documents d'enlèvement** : BSDI et PV_DESTRUCTION (liés à un enlèvement)
- **Documents mensuels** : ATTESTATION_VALORISATION, ATTESTATION_ELIMINATION, FACTURE (non liés)
- Filtrage et recherche avancés
- Téléchargement sécurisé (URLs présignées)
- Archivage et conservation réglementaire

### 📊 Modèle de données

```
SOCIETE (raisonSociale, ice, email, telephone, commentaire)
  ├── ClientUser (nom, prenom, posteOccupe, email, telephone)
  ├── Site (name, adresse)
  ├── Enlevement (dateEnlevement, site, observation)
  │    ├── PickupItem (typeDechet, sousType, quantiteKg, prixUnitaireMad, montantMad)
  │    └── Document (BSDI, PV_DESTRUCTION)
  └── Document (ATTESTATION_VALORISATION, ATTESTATION_ELIMINATION, FACTURE)
```

### 💰 Règles financières

**Budget valorisation** :
```sql
SUM(montantMad WHERE typeDechet = 'VALORISABLE')
→ Génère des revenus (montant positif)
```

**Budget A ELIMINER** :
```sql
SUM(montantMad WHERE typeDechet IN ('BANAL', 'A_ELIMINER'))
→ Génère des coûts (montant négatif)
```

**Bilan net** :
```
Bilan = Budget valorisation - Budget A ELIMINER
```

### 🔐 Règles de sécurité

- **Isolation par société** : Un utilisateur ne voit que les données de sa propre société
- **Documents obligatoires** : BSDI + PV pour tout enlèvement contenant A_ELIMINER
- **Sous-type obligatoire** : Pour tous les déchets VALORISABLE
- **Calcul automatique** : montantMad = quantiteKg × prixUnitaireMad
- **ICE unique** : Contrainte d'unicité sur l'ICE des sociétés

### 💼 Valeur ajoutée

**Pour l'entreprise de recyclage :**
- ✅ Digitalisation complète (fin des fichiers Excel)
- ✅ Planification optimisée (récurrences, calendrier, tournées)
- ✅ Traitement automatisé des demandes clients
- ✅ Calculs automatiques (valorisation, coûts, taux)
- ✅ Conformité réglementaire (BSDI, PV, attestations)
- ✅ Portail client moderne et self-service

**Pour les sociétés clientes :**
- ✅ Portail avec 5 KPIs en temps réel
- ✅ Demande d'enlèvements en ligne
- ✅ Visibilité sur le prochain enlèvement
- ✅ Tous les documents accessibles instantanément
- ✅ Statistiques environnementales (taux de valorisation)
- ✅ Bilan financier transparent (revenus vs coûts)
- ✅ Conformité simplifiée (BSDI, PV, attestations)

### 🚀 Technologies

- **Backend** : Spring Boot 3 + PostgreSQL + MinIO
- **Frontend** : Angular 17 + Material Design
- **Authentification** : Keycloak (SSO, multi-tenant)
- **Stockage** : MinIO (stockage objet S3-compatible)
- **Architecture** : Multi-tenant avec isolation par société

---

**IORecycling** répond aux enjeux actuels de **traçabilité**, de **responsabilité environnementale**, de **conformité réglementaire** et de **digitalisation** du secteur du recyclage.

