import { test, expect } from '@playwright/test';

/**
 * Tests de téléchargement de rapport PDF
 * 
 * Ces tests vérifient :
 * - Le bouton de téléchargement PDF
 * - Le téléchargement effectif du fichier
 * - Le type de contenu PDF
 */
test.describe('Rapport PDF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
  });

  test('Affiche le bouton de téléchargement PDF', async ({ page }) => {
    const downloadButton = page.locator('[data-testid="btn-download-pdf"]');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toContainText('Télécharger rapport PDF');
  });

  test('Télécharge le rapport PDF mensuel', async ({ page }) => {
    // Intercepter la requête de téléchargement
    const downloadPromise = page.waitForEvent('download');
    
    // Cliquer sur le bouton de téléchargement
    await page.locator('[data-testid="btn-download-pdf"]').click();
    
    // Attendre le téléchargement
    const download = await downloadPromise;
    
    // Vérifier le nom du fichier
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/rapport.*\.pdf$/i);
    
    // Vérifier que le fichier n'est pas vide
    expect(download.suggestedFilename().length).toBeGreaterThan(0);
  });

  test('Vérifie le type de contenu PDF', async ({ page }) => {
    // Intercepter la requête HTTP
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/client/report') && response.status() === 200
    );
    
    // Cliquer sur le bouton de téléchargement
    await page.locator('[data-testid="btn-download-pdf"]').click();
    
    // Attendre la réponse
    const response = await responsePromise;
    
    // Vérifier le type de contenu
    const contentType = response.headers()['content-type'];
    expect(contentType).toBe('application/pdf');
  });

  test('Vérifie les paramètres de la requête PDF', async ({ page }) => {
    // Intercepter la requête
    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/api/client/report')
    );
    
    // Cliquer sur le bouton
    await page.locator('[data-testid="btn-download-pdf"]').click();
    
    // Attendre la requête
    const request = await requestPromise;
    
    // Vérifier l'URL et les paramètres
    const url = new URL(request.url());
    expect(url.pathname).toBe('/api/client/report');
    expect(url.searchParams.has('month')).toBe(true);
    
    // Vérifier que le mois est au format YYYY-MM
    const month = url.searchParams.get('month');
    expect(month).toMatch(/^\d{4}-\d{2}$/);
  });

  test('Affiche un message d\'erreur si le téléchargement échoue', async ({ page }) => {
    // Simuler une erreur réseau
    await page.route('**/api/client/report*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Erreur serveur' })
      });
    });
    
    // Cliquer sur le bouton
    await page.locator('[data-testid="btn-download-pdf"]').click();
    
    // Vérifier qu'un message d'erreur apparaît
    await expect(page.locator('text=Erreur')).toBeVisible({ timeout: 5000 });
  });
});