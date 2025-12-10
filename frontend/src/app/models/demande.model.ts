/**
 * Modèles TypeScript pour les Demandes d'Enlèvements
 */

export interface DemandeEnlevement {
  id: number;
  numeroDemande: string;
  dateSouhaitee: string;
  heureSouhaitee?: string;
  siteId: number;
  siteNom: string;
  societeId: number;
  societeNom: string;
  typeDechetEstime?: string;
  quantiteEstimee?: number;
  commentaire?: string;
  statut: StatutDemande;
  motifRefus?: string;
  dateCreation: Date;
  dateTraitement?: Date;
  createdBy?: string;
  treatedBy?: string;
}

export interface CreateDemandeRequest {
  dateSouhaitee: string;
  heureSouhaitee?: string;
  siteId: number;
  societeId: number;
  typeDechetEstime?: string;
  quantiteEstimee?: number;
  commentaire?: string;
}

export enum StatutDemande {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDEE = 'VALIDEE',
  PLANIFIEE = 'PLANIFIEE',
  REALISEE = 'REALISEE',
  REFUSEE = 'REFUSEE',
  ANNULEE = 'ANNULEE'
}

export const STATUT_LABELS: { [key: string]: string } = {
  'EN_ATTENTE': '🟡 En attente',
  'VALIDEE': '✅ Validée',
  'PLANIFIEE': '📅 Planifiée',
  'REALISEE': '✅ Réalisée',
  'REFUSEE': '❌ Refusée',
  'ANNULEE': '⚪ Annulée'
};

