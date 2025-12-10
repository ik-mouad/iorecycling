/**
 * Modèles TypeScript pour le Planning et les Récurrences
 */

export interface PlanningEnlevement {
  id: number;
  datePrevue: string; // Format ISO: "2024-11-28"
  heurePrevue?: string;
  siteId: number;
  siteNom: string;
  societeId: number;
  societeNom: string;
  statut: StatutPlanning;
  commentaire?: string;
  recurrenceId?: number;
  enlevementId?: number;
  enlevementNumero?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum StatutPlanning {
  PLANIFIE = 'PLANIFIE',
  CONFIRME = 'CONFIRME',
  REALISE = 'REALISE',
  ANNULE = 'ANNULE'
}

export interface Recurrence {
  id: number;
  societeId: number;
  societeNom: string;
  siteId: number;
  siteNom: string;
  typeRecurrence: TypeRecurrence;
  jourSemaine?: string;
  joursSemaneBimensuel?: string;
  jourMois?: number;
  heurePrevue?: string;
  dateDebut: string;
  dateFin?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum TypeRecurrence {
  HEBDOMADAIRE = 'HEBDOMADAIRE',
  BIMENSUELLE = 'BIMENSUELLE',
  MENSUELLE = 'MENSUELLE',
  PERSONNALISEE = 'PERSONNALISEE'
}

export interface CreateRecurrenceRequest {
  societeId: number;
  siteId: number;
  typeRecurrence: string;
  jourSemaine?: string;
  joursSemaneBimensuel?: string;
  jourMois?: number;
  heurePrevue?: string;
  dateDebut: string;
  dateFin?: string;
}

export interface CreatePlanningManuelRequest {
  datePrevue: string;
  heurePrevue?: string;
  siteId: number;
  societeId: number;
  commentaire?: string;
}

