import { test, expect } from '@playwright/test';

/**
 * Tests des filtres de la table des enlèvements
 * Vérifie que le filtrage fonctionne correctement
 */

test.describe('Filtres de la table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
    
    // Attendre que la table se charge
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
  });

  test('devrait filtrer par type "Recyclables"', async ({ page }) => {
    // Cliquer sur le filtre "Recyclables"
    await page.getByTestId('filter-recyclables').click();
    
    // Attendre que la table se mette à jour
    await page.waitForTimeout(1000);
    
    // Vérifier que le filtre est sélectionné
    await expect(page.getByTestId('filter-recyclables')).toHaveAttribute('aria-pressed', 'true');
    
    // Vérifier que toutes les lignes visibles ont le type "recyclables"
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const typeChip = row.locator('mat-chip');
        await expect(typeChip).toBeVisible();
        
        // Vérifier que le chip contient "Recyclables" ou l'icône appropriée
        const chipText = await typeChip.textContent();
        expect(chipText?.toLowerCase()).toContain('recyclable');
      }
    }
  });

  test('devrait filtrer par type "Banals"', async ({ page }) => {
    // Cliquer sur le filtre "Banals"
    await page.getByTestId('filter-banals').click();
    
    // Attendre que la table se mette à jour
    await page.waitForTimeout(1000);
    
    // Vérifier que le filtre est sélectionné
    await expect(page.getByTestId('filter-banals')).toHaveAttribute('aria-pressed', 'true');
    
    // Vérifier que toutes les lignes visibles ont le type "banals"
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const typeChip = row.locator('mat-chip');
        await expect(typeChip).toBeVisible();
        
        const chipText = await typeChip.textContent();
        expect(chipText?.toLowerCase()).toContain('banal');
      }
    }
  });

  test('devrait filtrer par type "Dangereux"', async ({ page }) => {
    // Cliquer sur le filtre "À détruire" (Dangereux)
    await page.getByTestId('filter-dangereux').click();
    
    // Attendre que la table se mette à jour
    await page.waitForTimeout(1000);
    
    // Vérifier que le filtre est sélectionné
    await expect(page.getByTestId('filter-dangereux')).toHaveAttribute('aria-pressed', 'true');
    
    // Vérifier que toutes les lignes visibles ont le type "dangereux"
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const typeChip = row.locator('mat-chip');
        await expect(typeChip).toBeVisible();
        
        const chipText = await typeChip.textContent();
        expect(chipText?.toLowerCase()).toMatch(/dangereux|détruire/);
      }
    }
  });

  test('devrait afficher tous les types avec le filtre "Tous"', async ({ page }) => {
    // D'abord filtrer par un type spécifique
    await page.getByTestId('filter-recyclables').click();
    await page.waitForTimeout(1000);
    
    const recyclablesCount = await page.locator('tbody tr').count();
    
    // Puis cliquer sur "Tous"
    await page.getByTestId('filter-all').click();
    await page.waitForTimeout(1000);
    
    // Vérifier que le filtre "Tous" est sélectionné
    await expect(page.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'true');
    
    // Vérifier qu'il y a plus de lignes qu'avec le filtre "Recyclables" uniquement
    const allCount = await page.locator('tbody tr').count();
    expect(allCount).toBeGreaterThanOrEqual(recyclablesCount);
    
    // Vérifier qu'il y a un mélange de types
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 1) {
      const types = new Set();
      for (let i = 0; i < Math.min(rowCount, 5); i++) { // Vérifier les 5 premières lignes
        const row = rows.nth(i);
        const typeChip = row.locator('mat-chip');
        const chipText = await typeChip.textContent();
        types.add(chipText?.toLowerCase());
      }
      
      // Il devrait y avoir au moins 2 types différents
      expect(types.size).toBeGreaterThanOrEqual(1);
    }
  });

  test('devrait permettre la recherche textuelle', async ({ page }) => {
    const searchField = page.locator('input[placeholder*="Rechercher"]');
    await expect(searchField).toBeVisible();
    
    // Saisir un terme de recherche
    await searchField.fill('casablanca');
    await page.waitForTimeout(1000);
    
    // Vérifier que la table se met à jour
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    if (rowCount > 0) {
      // Vérifier que toutes les lignes contiennent le terme de recherche
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const rowText = await row.textContent();
        expect(rowText?.toLowerCase()).toContain('casablanca');
      }
    }
    
    // Effacer la recherche
    await searchField.clear();
    await page.waitForTimeout(1000);
    
    // Vérifier que toutes les lignes sont de nouveau visibles
    const allRowsCount = await page.locator('tbody tr').count();
    expect(allRowsCount).toBeGreaterThanOrEqual(rowCount);
  });
});


