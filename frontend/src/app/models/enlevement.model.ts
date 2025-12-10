/**
 * Modèles TypeScript pour les Enlèvements
 */

export interface Enlevement {
  id: number;
  numeroEnlevement: string;
  dateEnlevement: string; // Format ISO: "2024-11-28"
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
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateEnlevementRequest {
  dateEnlevement: string;
  siteId: number;
  societeId: number;
  observation?: string;
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
}

export interface CreatePickupItemRequest {
  typeDechet: string; // 'RECYCLABLE', 'BANAL', 'A_DETRUIRE'
  sousType?: string;
  quantiteKg: number;
  uniteMesure?: string; // kg, L, m³, unité, etc. (optionnel, par défaut "kg")
  etat?: string; // vrac, compacté, broyé, Palettisé, autre (optionnel)
  prixUnitaireMad: number;
}

export enum TypeDechet {
  RECYCLABLE = 'RECYCLABLE',
  BANAL = 'BANAL',
  A_DETRUIRE = 'A_DETRUIRE'
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
