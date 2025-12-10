import { test, expect } from '@playwright/test';

/**
 * Tests du dashboard client
 * 
 * Ces tests vérifient :
 * - La présence des KPIs
 * - Les valeurs affichées
 * - La carte de revenus
 */
test.describe('Dashboard Client', () => {
  test.beforeEach(async ({ page }) => {
    // Navigation directe vers le dashboard (session déjà authentifiée)
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
  });

  test('Affiche les KPIs principaux', async ({ page }) => {
    // Vérifier la présence du compteur d'enlèvements
    await expect(page.locator('[data-testid="kpi-pickups"]')).toBeVisible();
    
    // Vérifier les KPIs de tonnage
    await expect(page.locator('[data-testid="kpi-valorisables"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-banals"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-dangereux"]')).toBeVisible();
    
    // Vérifier la carte de revenus
    await expect(page.locator('[data-testid="kpi-revenue"]')).toBeVisible();
  });

  test('Affiche des valeurs cohérentes pour les KPIs', async ({ page }) => {
    // Vérifier que les valeurs sont des nombres positifs
    const pickupsElement = page.locator('[data-testid="kpi-pickups"]');
    await expect(pickupsElement).toBeVisible();
    
    const pickupsText = await pickupsElement.textContent();
    expect(pickupsText).toMatch(/\d+/); // Contient au moins un chiffre
    
    // Vérifier les tonnages
    const valorisablesElement = page.locator('[data-testid="kpi-valorisables"]');
    await expect(valorisablesElement).toBeVisible();
    
    const valorisablesText = await valorisablesElement.textContent();
    expect(valorisablesText).toMatch(/\d+[,.]?\d*\s*t/); // Format: "15,5 t" ou "15.5 t"
  });

  test('Affiche la carte de revenus avec le bon format', async ({ page }) => {
    const revenueElement = page.locator('[data-testid="kpi-revenue"]');
    await expect(revenueElement).toBeVisible();
    
    const revenueText = await revenueElement.textContent();
    expect(revenueText).toMatch(/MAD/); // Contient "MAD"
    expect(revenueText).toMatch(/\d+/); // Contient des chiffres
  });

  test('Affiche le nom d\'utilisateur correct', async ({ page }) => {
    await expect(page.locator('text=Mouad Idrissi Khamlichi')).toBeVisible();
  });

  test('Affiche le titre du dashboard', async ({ page }) => {
    await expect(page.locator('text=Historique des enlèvements')).toBeVisible();
  });
});