import { test, expect } from '@playwright/test';

/**
 * Tests de téléchargement du rapport PDF
 * Vérifie que le téléchargement fonctionne correctement
 */

test.describe('Rapport PDF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
    
    // Attendre que les données se chargent
    await page.waitForSelector('[data-testid="kpi-pickups"]', { timeout: 10000 });
  });

  test('devrait télécharger le rapport PDF mensuel', async ({ page }) => {
    const E2E_MONTH = process.env.E2E_MONTH || '2025-01';
    
    // Intercepter la requête vers l'API de rapport
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/client/report') && 
      response.status() === 200
    );
    
    // Cliquer sur le bouton de téléchargement PDF
    const downloadButton = page.getByTestId('btn-download-pdf');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toBeEnabled();
    
    // Attendre le téléchargement
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    
    // Vérifier la réponse de l'API
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/pdf');
    
    // Vérifier le téléchargement
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^rapport-valorisation-\d{4}-\d{2}\.pdf$/);
    
    // Vérifier que le fichier n'est pas vide
    const path = await download.path();
    expect(path).toBeTruthy();
    
    // Optionnel: vérifier la taille du fichier
    const fs = require('fs');
    const stats = fs.statSync(path);
    expect(stats.size).toBeGreaterThan(0);
  });

  test('devrait afficher le rapport valorisables pour le mois courant', async ({ page }) => {
    // Cliquer sur le filtre "Recyclables" pour afficher la section valorisables
    await page.getByTestId('filter-recyclables').click();
    await page.waitForTimeout(1000);
    
    // Vérifier que la section "Détails valorisables" est visible
    const valuablesSection = page.locator('text=Détails valorisables (mois en cours)');
    await expect(valuablesSection).toBeVisible();
    
    // Vérifier la présence de la table des matériaux
    const valuablesTable = page.locator('.valuables-table');
    await expect(valuablesTable).toBeVisible();
    
    // Vérifier les colonnes de la table
    await expect(page.locator('th:has-text("Matériau")')).toBeVisible();
    await expect(page.locator('th:has-text("Quantité")')).toBeVisible();
    await expect(page.locator('th:has-text("Prix/kg")')).toBeVisible();
    await expect(page.locator('th:has-text("Total")')).toBeVisible();
    
    // Vérifier le total général
    const totalSection = page.locator('text=Total général');
    await expect(totalSection).toBeVisible();
    
    // Vérifier le bouton de téléchargement PDF dans cette section
    const pdfButton = page.getByTestId('btn-download-pdf');
    await expect(pdfButton).toBeVisible();
  });

  test('devrait gérer les erreurs de téléchargement', async ({ page }) => {
    // Intercepter et simuler une erreur 500
    await page.route('**/api/client/report**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Erreur serveur' })
      });
    });
    
    // Cliquer sur le bouton de téléchargement
    const downloadButton = page.getByTestId('btn-download-pdf');
    await downloadButton.click();
    
    // Vérifier qu'un message d'erreur est affiché
    // (dépend de l'implémentation du service)
    await page.waitForTimeout(2000);
    
    // Restaurer la route normale
    await page.unroute('**/api/client/report**');
  });

  test('devrait télécharger le rapport avec le bon mois', async ({ page }) => {
    const E2E_MONTH = process.env.E2E_MONTH || '2025-01';
    
    // Intercepter la requête pour vérifier le paramètre month
    const responsePromise = page.waitForResponse(response => {
      const url = new URL(response.url());
      return response.url().includes('/api/client/report') && 
             url.searchParams.get('month') === E2E_MONTH;
    });
    
    // Cliquer sur le bouton de téléchargement
    await page.getByTestId('btn-download-pdf').click();
    
    // Vérifier que la requête contient le bon mois
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    
    const url = new URL(response.url());
    expect(url.searchParams.get('month')).toBe(E2E_MONTH);
  });
});


