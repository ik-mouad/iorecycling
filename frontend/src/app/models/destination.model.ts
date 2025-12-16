/**
 * Modèles TypeScript pour les Destinations
 */

export enum TypeTraitement {
  RECYCLAGE = 'RECYCLAGE',
  REUTILISATION = 'REUTILISATION',
  ENFOUISSEMENT = 'ENFOUISSEMENT',
  INCINERATION = 'INCINERATION',
  VALORISATION_ENERGETIQUE = 'VALORISATION_ENERGETIQUE',
  DENATURATION_DESTRUCTION = 'DENATURATION_DESTRUCTION',
  TRAITEMENT = 'TRAITEMENT'
}

export interface Destination {
  id: number;
  raisonSociale: string;
  site: string;
  typesTraitement: TypeTraitement[];
  nomInterlocuteur?: string;
  telInterlocuteur?: string;
  posteInterlocuteur?: string;
  emailInterlocuteur?: string;
  adresse?: string;
  observation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateDestinationRequest {
  raisonSociale: string;
  site: string;
  typesTraitement: TypeTraitement[];
  nomInterlocuteur?: string;
  telInterlocuteur?: string;
  posteInterlocuteur?: string;
  emailInterlocuteur?: string;
  adresse?: string;
  observation?: string;
}

export interface UpdateDestinationRequest {
  raisonSociale: string;
  site: string;
  typesTraitement: TypeTraitement[];
  nomInterlocuteur?: string;
  telInterlocuteur?: string;
  posteInterlocuteur?: string;
  emailInterlocuteur?: string;
  adresse?: string;
  observation?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

