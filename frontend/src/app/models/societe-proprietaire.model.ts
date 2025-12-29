/**
 * Modèles TypeScript pour les Sociétés Propriétaires de Camions
 */

export interface SocieteProprietaire {
  id: number;
  raisonSociale: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  observation?: string;
  actif: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSocieteProprietaireRequest {
  raisonSociale: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  observation?: string;
  actif?: boolean;
}

export interface UpdateSocieteProprietaireRequest {
  raisonSociale: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  observation?: string;
  actif: boolean;
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

