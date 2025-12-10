/**
 * Modèles TypeScript pour le Dashboard Client (5 KPIs)
 */

export interface DashboardKpis {
  prochainEnlevement?: ProchainEnlevement;
  quantites: QuantitesParType;
  nombreEnlevements: number;
  moyenneParSemaine: number;
  budgetRecyclage: number;
  budgetTraitement: number;
  evolutionRecyclagePct?: number;
  evolutionTraitementPct?: number;
  bilanNet: number;
  tauxRecyclage: number;
  dateDebut: string;
  dateFin: string;
}

export interface ProchainEnlevement {
  datePrevue: string;
  heurePrevue?: string;
  siteId: number;
  siteNom: string;
}

export interface QuantitesParType {
  recyclable: number;
  banal: number;
  aDetruire: number;
  total: number;
  pourcentageRecyclable: number;
  pourcentageBanal: number;
  pourcentageADetruire: number;
  detailRecyclable?: { [sousType: string]: number };
}

export interface PeriodeFilter {
  dateDebut: string | null;
  dateFin: string | null;
  label?: string;
}

export const PERIODES_PREDEFINIES: PeriodeFilter[] = [
  {
    dateDebut: null,
    dateFin: null,
    label: 'Mois en cours'
  },
  {
    dateDebut: null,
    dateFin: null,
    label: 'Mois précédent'
  },
  {
    dateDebut: null,
    dateFin: null,
    label: '3 derniers mois'
  },
  {
    dateDebut: null,
    dateFin: null,
    label: '6 derniers mois'
  },
  {
    dateDebut: null,
    dateFin: null,
    label: 'Année en cours'
  },
  {
    dateDebut: null,
    dateFin: null,
    label: 'Depuis le début'
  }
];
