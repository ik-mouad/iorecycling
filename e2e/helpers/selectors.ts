/**
 * Sélecteurs et helpers pour les tests E2E
 */

export const SELECTORS = {
  // Authentification
  LOGIN_BUTTON: 'button:has-text("Se connecter")',
  USERNAME_INPUT: 'input[name="username"]',
  PASSWORD_INPUT: 'input[name="password"]',
  SUBMIT_BUTTON: 'button[type="submit"]',
  
  // KPI Dashboard
  KPI_PICKUPS: '[data-testid="kpi-pickups"]',
  KPI_VALORISABLES: '[data-testid="kpi-valorisables"]',
  KPI_BANALS: '[data-testid="kpi-banals"]',
  KPI_DANGEREUX: '[data-testid="kpi-dangereux"]',
  KPI_REVENUE: '[data-testid="kpi-revenue"]',
  
  // Filtres
  FILTER_ALL: '[data-testid="filter-all"]',
  FILTER_RECYCLABLES: '[data-testid="filter-recyclables"]',
  FILTER_BANALS: '[data-testid="filter-banals"]',
  FILTER_DANGEREUX: '[data-testid="filter-dangereux"]',
  
  // Actions
  DOWNLOAD_PDF_BUTTON: '[data-testid="btn-download-pdf"]',
  EXPORT_CSV_BUTTON: 'button:has-text("Exporter CSV")',
  SEARCH_FIELD: 'input[placeholder*="Rechercher"]',
  
  // Table
  TABLE_ROWS: 'tbody tr',
  TYPE_CHIP: 'mat-chip',
  
  // Valorisation
  VALUABLES_SECTION: 'text=Détails valorisables (mois en cours)',
  VALUABLES_TABLE: '.valuables-table',
  TOTAL_SECTION: 'text=Total général',
  
  // Messages
  LAST_UPDATED: 'text=Dernière mise à jour',
  ERROR_MESSAGE: '.error-message',
  SUCCESS_MESSAGE: '.success-message'
};

export const URLS = {
  HOME: '/',
  CLIENT_DASHBOARD: '/client',
  KEYCLOAK_AUTH: '/auth'
};

export const API_ENDPOINTS = {
  PICKUPS: '/api/client/pickups',
  VALOR_SUMMARY: '/api/client/valorisables/summary',
  REPORT: '/api/client/report'
};

/**
 * Helper pour attendre qu'un élément soit visible avec un timeout personnalisé
 */
export async function waitForElement(page: any, selector: string, timeout: number = 10000) {
  await page.waitForSelector(selector, { timeout });
  return page.locator(selector);
}

/**
 * Helper pour vérifier qu'un nombre est dans un format valide (ex: "1 234,56 t")
 */
export function isValidWeightFormat(text: string | null): boolean {
  if (!text) return false;
  return /\d+[,.]?\d*\s*t/i.test(text);
}

/**
 * Helper pour vérifier qu'un montant est dans un format valide (ex: "1 234,56 MAD")
 */
export function isValidCurrencyFormat(text: string | null): boolean {
  if (!text) return false;
  return /\d+[,.]?\d*\s*MAD/i.test(text);
}

/**
 * Helper pour extraire un nombre d'un texte formaté
 */
export function extractNumber(text: string | null): number {
  if (!text) return 0;
  const match = text.match(/(\d+[,.]?\d*)/);
  return match ? parseFloat(match[1].replace(',', '.')) : 0;
}


