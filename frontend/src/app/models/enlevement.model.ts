/**
 * Modèles TypeScript pour les Enlèvements
 */

export interface Enlevement {
  id: number;
  numeroEnlevement: string;
  dateEnlevement: string; // Format ISO: "2024-11-28"
  heureEnlevement?: string; // Format ISO: "HH:mm:ss"
  dateDestination?: string; // Format ISO: "2024-11-28"
  heureDestination?: string; // Format ISO: "HH:mm:ss"
  societeId: number;
  societeNom: string;
  siteId: number;
  siteNom: string;
  observation?: string;
  items: PickupItem[];
  poidsTotal: number;
  budgetRecyclage: number;
  budgetTraitement: number;
  bilanNet: number;
  tauxRecyclage: number;
  documents?: DocumentInfo[];
  bsdiPresent?: boolean;
  pvPresent?: boolean;
  camionId?: number;
  camionMatricule?: string;
  chauffeurNom?: string;
  destinationId?: number;
  destinationRaisonSociale?: string;
  destinationSite?: string;
  destinationTypesTraitement?: string[];
  destinationNomInterlocuteur?: string;
  destinationTelInterlocuteur?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateEnlevementRequest {
  dateEnlevement: string;
  heureEnlevement?: string; // Format ISO: "HH:mm:ss"
  dateDestination?: string; // Format ISO: "2024-11-28"
  heureDestination?: string; // Format ISO: "HH:mm:ss"
  siteId: number;
  societeId: number;
  observation?: string;
  camionId?: number;
  chauffeurNom?: string;
  destinationId?: number;
  items: CreatePickupItemRequest[];
}

export interface PickupItem {
  id: number;
  enlevementId: number;
  typeDechet: TypeDechet;
  sousType?: string;
  quantiteKg: number;
  uniteMesure?: string; // kg, L, m³, unité, etc.
  etat?: string; // vrac, compacté, broyé, Palettisé, autre
  prixUnitaireMad: number;
  montantMad: number;
  
  // NOUVEAUX CHAMPS - Prestation (tous types)
  prixPrestationMad?: number;
  montantPrestationMad?: number;
  
  // NOUVEAUX CHAMPS - Achat (valorisable)
  prixAchatMad?: number;
  montantAchatMad?: number;
  
  // NOUVEAUX CHAMPS - Traitement (banal)
  prixTraitementMad?: number;
  montantTraitementMad?: number;
  
  // NOUVEAUX CHAMPS - Suivi vente
  quantiteVendueKg?: number;
  resteAVendreKg?: number;
  statutStock?: StatutStock;
}

export enum StatutStock {
  NON_VENDU = 'NON_VENDU',
  PARTIELLEMENT_VENDU = 'PARTIELLEMENT_VENDU',
  VENDU = 'VENDU'
}

export interface CreatePickupItemRequest {
  typeDechet: string; // 'RECYCLABLE', 'BANAL', 'A_DETRUIRE'
  sousType?: string;
  quantiteKg: number;
  uniteMesure?: string; // kg, L, m³, unité, etc. (optionnel, par défaut "kg")
  etat?: string; // vrac, compacté, broyé, Palettisé, autre (optionnel)
  prixUnitaireMad: number;
  
  // NOUVEAUX CHAMPS - Prestation (tous types)
  prixPrestationMad?: number;
  
  // NOUVEAUX CHAMPS - Achat (valorisable)
  prixAchatMad?: number;
  
  // NOUVEAUX CHAMPS - Traitement (banal)
  prixTraitementMad?: number;
}

export enum TypeDechet {
  RECYCLABLE = 'RECYCLABLE',   // Déchets recyclables (génère un revenu)
  BANAL = 'BANAL',             // Déchets ordinaires (génère un coût)
  A_DETRUIRE = 'A_DETRUIRE'    // Déchets dangereux (génère un coût élevé + documents obligatoires)
}

export enum SousTypeRecyclable {
  CARTON = 'CARTON',
  PLASTIQUE_PET = 'PLASTIQUE_PET',
  PLASTIQUE_PEHD = 'PLASTIQUE_PEHD',
  ALUMINIUM = 'ALUMINIUM',
  FER = 'FER',
  CUIVRE = 'CUIVRE',
  PAPIER = 'PAPIER',
  VERRE = 'VERRE'
}

export interface DocumentInfo {
  id: number;
  typeDocument: string;
  enlevementId?: number;
  enlevementNumero?: string;
  periodeMois?: string;
  societeId: number;
  societeNom?: string;
  fileName: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: Date;
  uploadedBy?: string;
  downloadUrl?: string;
}
