import { test, expect } from '@playwright/test';

/**
 * Tests des filtres du dashboard
 * 
 * Ces tests vérifient :
 * - Le fonctionnement des filtres (Tous, Recyclables, Banals, À détruire)
 * - La mise à jour du tableau selon le filtre sélectionné
 */
test.describe('Filtres Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
  });

  test('Affiche tous les filtres disponibles', async ({ page }) => {
    await expect(page.locator('[data-testid="filter-all"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-recyclables"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-banals"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-dangereux"]')).toBeVisible();
  });

  test('Filtre "Tous" est sélectionné par défaut', async ({ page }) => {
    const allFilter = page.locator('[data-testid="filter-all"]');
    await expect(allFilter).toHaveClass(/mat-button-toggle-checked/);
  });

  test('Filtre "Recyclables" fonctionne', async ({ page }) => {
    const recyclablesFilter = page.locator('[data-testid="filter-recyclables"]');
    await recyclablesFilter.click();
    
    // Vérifier que le filtre est sélectionné
    await expect(recyclablesFilter).toHaveClass(/mat-button-toggle-checked/);
    
    // Attendre que le tableau se mette à jour
    await page.waitForTimeout(1000);
    
    // Vérifier que seules les lignes "recyclables" sont visibles
    const tableRows = page.locator('mat-table mat-row');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        const typeCell = row.locator('mat-cell').nth(2); // Colonne "Type"
        const typeText = await typeCell.textContent();
        expect(typeText?.toLowerCase()).toContain('recyclable');
      }
    }
  });

  test('Filtre "Banals" fonctionne', async ({ page }) => {
    const banalsFilter = page.locator('[data-testid="filter-banals"]');
    await banalsFilter.click();
    
    await expect(banalsFilter).toHaveClass(/mat-button-toggle-checked/);
    await page.waitForTimeout(1000);
    
    const tableRows = page.locator('mat-table mat-row');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        const typeCell = row.locator('mat-cell').nth(2);
        const typeText = await typeCell.textContent();
        expect(typeText?.toLowerCase()).toContain('banal');
      }
    }
  });

  test('Filtre "À détruire" fonctionne', async ({ page }) => {
    const dangereuxFilter = page.locator('[data-testid="filter-dangereux"]');
    await dangereuxFilter.click();
    
    await expect(dangereuxFilter).toHaveClass(/mat-button-toggle-checked/);
    await page.waitForTimeout(1000);
    
    const tableRows = page.locator('mat-table mat-row');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        const typeCell = row.locator('mat-cell').nth(2);
        const typeText = await typeCell.textContent();
        expect(typeText?.toLowerCase()).toContain('dangereux');
      }
    }
  });

  test('Retour au filtre "Tous" affiche toutes les données', async ({ page }) => {
    // D'abord filtrer sur "Recyclables"
    await page.locator('[data-testid="filter-recyclables"]').click();
    await page.waitForTimeout(1000);
    
    const recyclablesCount = await page.locator('mat-table mat-row').count();
    
    // Puis revenir à "Tous"
    await page.locator('[data-testid="filter-all"]').click();
    await page.waitForTimeout(1000);
    
    const allCount = await page.locator('mat-table mat-row').count();
    
    // Le nombre total devrait être >= au nombre de recyclables
    expect(allCount).toBeGreaterThanOrEqual(recyclablesCount);
  });
});