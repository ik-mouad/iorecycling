import { test, expect } from '@playwright/test';

test.describe('IORecycling Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('frontend displays correct title and content', async ({ page }) => {
    // Test 1: Frontend s'ouvre et affiche "IORecycling – Release 0 OK"
    await expect(page).toHaveTitle(/IORecycling/);
    
    // Vérifier que le titre principal est présent
    await expect(page.locator('h1')).toContainText('IORecycling – Release 0 OK');
    
    // Vérifier que la page contient les éléments attendus
    await expect(page.locator('text=🚀 Application déployée avec succès')).toBeVisible();
    await expect(page.locator('text=Frontend accessible via Caddy sur le port 88')).toBeVisible();
    
    // Vérifier que le bouton "Tester API" est présent
    await expect(page.locator('button:has-text("Tester API")')).toBeVisible();
    
    // Vérifier que la liste des services est présente
    await expect(page.locator('text=📋 Services disponibles')).toBeVisible();
    await expect(page.locator('text=Frontend :')).toBeVisible();
    await expect(page.locator('text=API Health :')).toBeVisible();
    await expect(page.locator('text=Keycloak :')).toBeVisible();
  });

  test('API health endpoint returns correct status', async ({ page }) => {
    // Test 2: fetch /api/health retourne status "UP"
    
    // Attendre que le test automatique de l'API se termine
    await page.waitForTimeout(2000);
    
    // Vérifier que la réponse de l'API est affichée
    const apiResponse = page.locator('#apiResponse');
    await expect(apiResponse).toBeVisible();
    
    // Vérifier que la réponse contient le statut "UP"
    const apiContent = page.locator('#apiContent');
    await expect(apiContent).toContainText('"status": "UP"');
    await expect(apiContent).toContainText('"service": "io-recycling"');
    
    // Vérifier que le bouton "Tester API" fonctionne
    const testButton = page.locator('button:has-text("Tester API")');
    await expect(testButton).toBeEnabled();
    
    // Cliquer sur le bouton pour tester manuellement
    await testButton.click();
    
    // Attendre que le test se termine
    await page.waitForTimeout(1000);
    
    // Vérifier que la réponse est toujours correcte
    await expect(apiContent).toContainText('"status": "UP"');
  });

  test('API health endpoint direct call', async ({ request }) => {
    // Test direct de l'endpoint API
    const response = await request.get('/api/health');
    
    // Vérifier que la réponse est OK
    expect(response.status()).toBe(200);
    
    // Vérifier le contenu de la réponse
    const responseBody = await response.json();
    expect(responseBody).toEqual({
      status: 'UP',
      service: 'io-recycling'
    });
  });

  test('page is responsive and accessible', async ({ page }) => {
    // Test d'accessibilité et de responsivité
    
    // Vérifier que la page a un charset UTF-8
    const charset = await page.locator('meta[charset]').getAttribute('charset');
    expect(charset).toBe('UTF-8');
    
    // Vérifier que la page a un viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    
    // Vérifier que tous les éléments sont visibles
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button')).toBeVisible();
    await expect(page.locator('.status')).toBeVisible();
    
    // Test de responsivité - vérifier que le contenu s'adapte
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button')).toBeVisible();
  });

  test('error handling for API failures', async ({ page }) => {
    // Test de gestion d'erreur (simulation d'une API en panne)
    
    // Intercepter les requêtes vers /api/health et retourner une erreur
    await page.route('/api/health', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Recharger la page pour déclencher le test automatique
    await page.reload();
    
    // Attendre que le test automatique se termine
    await page.waitForTimeout(2000);
    
    // Vérifier que l'erreur est affichée
    const apiResponse = page.locator('#apiResponse');
    await expect(apiResponse).toBeVisible();
    
    const apiContent = page.locator('#apiContent');
    await expect(apiContent).toContainText('Erreur:');
  });
});
