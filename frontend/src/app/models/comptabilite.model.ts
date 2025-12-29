/**
 * Modèles TypeScript pour le module de comptabilité
 */

export enum TypeTransaction {
  RECETTE = 'RECETTE',
  DEPENSE = 'DEPENSE'
}

export enum StatutTransaction {
  EN_ATTENTE = 'EN_ATTENTE',
  PARTIELLEMENT_PAYEE = 'PARTIELLEMENT_PAYEE',
  PAYEE = 'PAYEE',
  ANNULEE = 'ANNULEE'
}

export enum ModePaiement {
  ESPECES = 'ESPECES',
  CHEQUE = 'CHEQUE',
  VIREMENT = 'VIREMENT',
  CARTE_BANCAIRE = 'CARTE_BANCAIRE',
  AUTRE = 'AUTRE'
}

export enum StatutPaiement {
  VALIDE = 'VALIDE',
  ANNULE = 'ANNULE',
  REMBOURSE = 'REMBOURSE'
}

export enum StatutEcheance {
  EN_ATTENTE = 'EN_ATTENTE',
  PAYEE = 'PAYEE',
  IMPAYEE = 'IMPAYEE',
  ANNULEE = 'ANNULEE'
}

export interface Transaction {
  id: number;
  type: TypeTransaction;
  montant: number;
  dateTransaction: string; // ISO date string
  description: string;
  categorie?: string;
  numeroReference?: string;
  societeId: number;
  societeNom?: string;
  enlevementId?: number;
  enlevementNumero?: string;
  notes?: string;
  statut: StatutTransaction;
  montantPaye?: number;
  montantRestant?: number;
  completementPayee?: boolean;
  paiements?: Paiement[];
  echeances?: Echeance[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // NOUVEAUX CHAMPS - Type de recette
  typeRecette?: TypeRecette;
  
  // NOUVEAUX CHAMPS - Information vente (optionnel)
  venteItemId?: number;
  venteId?: number;
  venteNumero?: string;
}

export enum TypeRecette {
  PRESTATION = 'PRESTATION',
  VENTE_MATIERE = 'VENTE_MATIERE'
}

export interface CreateTransactionRequest {
  type: TypeTransaction;
  montant: number;
  dateTransaction: string;
  description: string;
  categorie?: string;
  numeroReference?: string;
  societeId: number;
  enlevementId?: number;
  notes?: string;
  echeances?: CreateEcheanceRequest[];
}

export interface UpdateTransactionRequest {
  montant?: number;
  dateTransaction?: string;
  description?: string;
  categorie?: string;
  numeroReference?: string;
  notes?: string;
  statut?: StatutTransaction;
}

export interface Paiement {
  id: number;
  transactionId: number;
  echeanceId?: number; // Lien vers l'échéance (optionnel)
  montant: number;
  datePaiement: string; // ISO date string
  modePaiement: ModePaiement;
  reference?: string;
  notes?: string;
  statut: StatutPaiement;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaiementRequest {
  transactionId: number;
  montant: number;
  datePaiement: string;
  modePaiement: ModePaiement;
  reference?: string;
  notes?: string;
}

export interface Echeance {
  id: number;
  transactionId: number;
  montant: number;
  dateEcheance: string; // ISO date string
  statut: StatutEcheance;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEcheanceRequest {
  montant: number;
  dateEcheance: string;
}

export interface ComptabiliteDashboard {
  totalRecettes: number;
  totalDepenses: number;
  resultatNet: number;
  tresorerie: number;
  evolutionRecettesPct?: number;
  evolutionDepensesPct?: number;
  evolutionResultatPct?: number;
  totalPaiementsRecus: number;
  totalImpayes: number;
  nombreTransactionsImpayees: number;
  nombreEcheancesEnRetard: number;
  montantEcheancesEnRetard: number;
  nombreEcheancesAVenir: number;
  montantEcheancesAVenir: number;
  depensesParCategorie?: { [key: string]: number };
  evolutionMensuelle?: EvolutionMensuelle[];
  dateDebut: string;
  dateFin: string;
  periode: 'mensuel' | 'trimestriel' | 'annuel';
  
  // NOUVEAUX CHAMPS - Distinction CA
  caPrestation?: number;
  caVenteMatiere?: number;
  caTotal?: number;
}

export interface EvolutionMensuelle {
  mois: string; // Format "YYYY-MM"
  moisLibelle: string; // Format "Janvier 2024"
  recettes: number;
  depenses: number;
  resultat: number;
}

