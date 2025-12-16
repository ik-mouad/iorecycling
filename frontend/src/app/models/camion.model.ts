/**
 * Modèles TypeScript pour les Camions
 */

export enum TypeCamion {
  PLATEAU = 'PLATEAU',
  CAISSON = 'CAISSON',
  AMPLIROLL = 'AMPLIROLL',
  GRUE = 'GRUE',
  HYDROCUREUR = 'HYDROCUREUR'
}

export interface Camion {
  id: number;
  matricule: string;
  tonnageMaxKg: number;
  typeCamion: TypeCamion;
  observation?: string;
  societeProprietaireId: number;
  societeProprietaireNom?: string;
  actif: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCamionRequest {
  matricule: string;
  tonnageMaxKg: number;
  typeCamion: TypeCamion;
  observation?: string;
  societeProprietaireId: number;
  actif?: boolean;
}

export interface UpdateCamionRequest {
  tonnageMaxKg: number;
  typeCamion: TypeCamion;
  observation?: string;
  societeProprietaireId: number;
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

