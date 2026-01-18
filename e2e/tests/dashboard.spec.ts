import { test, expect } from '@playwright/test';

/**
 * Tests du tableau de bord client
 * Vérifie l'affichage des KPI et des données
 */

test.describe('Tableau de bord', () => {
  test.beforeEach(async ({ page }) => {
    // Aller directement à la page dashboard (authentification via storageState)
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
  });

  test('devrait afficher tous les KPI avec des valeurs valides', async ({ page }) => {
    // Vérifier la présence du compteur d'enlèvements
    const pickupsCounter = page.getByTestId('kpi-pickups');
    await expect(pickupsCounter).toBeVisible();
    
    // Vérifier que la valeur est un nombre >= 0
    const pickupsText = await pickupsCounter.textContent();
    const pickupsValue = parseInt(pickupsText?.replace(/\D/g, '') || '0');
    expect(pickupsValue).toBeGreaterThanOrEqual(0);
    
    // Vérifier les KPI de tonnage
    const valorisablesKpi = page.getByTestId('kpi-valorisables');
    const banalsKpi = page.getByTestId('kpi-banals');
    const dangereuxKpi = page.getByTestId('kpi-dangereux');
    
    await expect(valorisablesKpi).toBeVisible();
    await expect(banalsKpi).toBeVisible();
    await expect(dangereuxKpi).toBeVisible();
    
    // Vérifier que les valeurs contiennent des nombres
    const valorisablesText = await valorisablesKpi.textContent();
    const banalsText = await banalsKpi.textContent();
    const dangereuxText = await dangereuxKpi.textContent();
    
    expect(valorisablesText).toMatch(/\d+[,.]?\d*\s*t/);
    expect(banalsText).toMatch(/\d+[,.]?\d*\s*t/);
    expect(dangereuxText).toMatch(/\d+[,.]?\d*\s*t/);
    
    // Vérifier le KPI de revenu
    const revenueKpi = page.getByTestId('kpi-revenue');
    await expect(revenueKpi).toBeVisible();
    
    const revenueText = await revenueKpi.textContent();
    expect(revenueText).toMatch(/\d+[,.]?\d*\s*MAD/);
  });

  test('devrait afficher la table des enlèvements', async ({ page }) => {
    // Attendre que la table se charge
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Vérifier la présence des colonnes
    await expect(page.locator('th:has-text("Date & Heure")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("")')).toBeVisible();
    await expect(page.locator('th:has-text("Site")')).toBeVisible();
    await expect(page.locator('th:has-text("Documents")')).toBeVisible();
    
    // Vérifier qu'il y a au moins une ligne de données
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount({ min: 1 });
  });

  test('devrait afficher les filtres de type', async ({ page }) => {
    // Vérifier la présence des boutons de filtre
    await expect(page.getByTestId('filter-all')).toBeVisible();
    await expect(page.getByTestId('filter-recyclables')).toBeVisible();
    await expect(page.getByTestId('filter-banals')).toBeVisible();
    await expect(page.getByTestId('filter-dangereux')).toBeVisible();
    
    // Vérifier que le filtre "Tous" est sélectionné par défaut
    await expect(page.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'true');
  });

  test('devrait afficher le champ de recherche', async ({ page }) => {
    const searchField = page.locator('input[placeholder*="Rechercher"]');
    await expect(searchField).toBeVisible();
    await expect(searchField).toBeEnabled();
  });

  test('devrait afficher le bouton d\'export CSV', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Exporter CSV")');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
  });

  test('devrait afficher l\'indicateur de dernière mise à jour', async ({ page }) => {
    // Attendre que les données se chargent
    await page.waitForSelector('[data-testid="kpi-pickups"]', { timeout: 10000 });
    
    // Vérifier la présence de l'indicateur de mise à jour
    const lastUpdated = page.locator('text=Dernière mise à jour');
    await expect(lastUpdated).toBeVisible();
    
    // Vérifier que le format est correct (ex: "Il y a 2 min")
    const updateText = await lastUpdated.textContent();
    expect(updateText).toMatch(/Dernière mise à jour: (À l'instant|Il y a \d+ (min|h)|[\d\/\s:]+)/);
  });
});


