/**
 * Modèles TypeScript pour les Sociétés
 */

export interface Societe {
  id: number;
  raisonSociale: string;
  ice: string;
  email: string;
  telephone?: string;
  commentaire?: string;
  createdAt?: Date;
  updatedAt?: Date;
  nbSites?: number;
  nbUtilisateurs?: number;
  nbEnlevements?: number;
  sites?: Site[];
  utilisateurs?: ClientUser[];
}

export interface CreateSocieteRequest {
  raisonSociale: string;
  ice: string;
  email: string;
  telephone?: string;
  commentaire?: string;
}

export interface UpdateSocieteRequest {
  raisonSociale: string;
  email: string;
  telephone?: string;
  commentaire?: string;
}

export interface Site {
  id: number;
  societeId: number;
  societeNom?: string;
  name: string;
  adresse?: string;
  createdAt?: Date;
  nbEnlevements?: number;
}

export interface ClientUser {
  id: number;
  nom: string;
  prenom: string;
  posteOccupe?: string;
  email: string;
  telephone?: string;
  societeId: number;
  societeNom?: string;
  active: boolean;
  createdAt?: Date;
}

export interface CreateClientUserRequest {
  nom: string;
  prenom: string;
  posteOccupe?: string;
  email: string;
  telephone?: string;
  societeId: number;
  password?: string;
  temporaryPassword?: boolean;
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
