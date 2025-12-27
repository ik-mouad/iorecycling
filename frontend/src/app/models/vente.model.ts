/**
 * Modèles TypeScript pour le module Vente
 */

export interface Vente {
  id: number;
  numeroVente: string;
  dateVente: string; // Format ISO: "2024-11-28"
  acheteurId?: number;
  acheteurNom?: string;
  observation?: string;
  statut: StatutVente;
  items: VenteItem[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VenteItem {
  id: number;
  venteId: number;
  pickupItemId?: number;
  typeDechet: string;
  sousType?: string;
  quantiteVendueKg: number;
  prixVenteUnitaireMad: number;
  montantVenteMad: number;
  createdAt?: string;
}

export interface CreateVenteRequest {
  dateVente: string;
  acheteurId?: number;
  acheteurNom?: string;
  observation?: string;
  items: CreateVenteItemRequest[];
}

export interface CreateVenteItemRequest {
  pickupItemId?: number;
  typeDechet: string;
  sousType?: string;
  quantiteVendueKg: number;
  prixVenteUnitaireMad: number;
}

export enum StatutVente {
  BROUILLON = 'BROUILLON',
  VALIDEE = 'VALIDEE',
  ANNULEE = 'ANNULEE'
}

export interface StockDisponible {
  pickupItemId: number;
  enlevementId: number;
  numeroEnlevement: string;
  dateEnlevement: string;
  societeId: number;
  societeNom: string;
  typeDechet: string;
  sousType?: string;
  quantiteRecupereeKg: number;
  quantiteVendueKg: number;
  resteAVendreKg: number;
  statutStock: StatutStock;
}

export enum StatutStock {
  NON_VENDU = 'NON_VENDU',
  PARTIELLEMENT_VENDU = 'PARTIELLEMENT_VENDU',
  VENDU = 'VENDU'
}

