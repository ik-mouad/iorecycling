import { test, expect } from '@playwright/test';

/**
 * Tests de connexion Keycloak
 * Ce test vérifie le processus complet de connexion
 */

test.describe('Authentification', () => {
  test('devrait permettre la connexion via Keycloak', async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');
    
    // Vérifier que la page de login est affichée
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
    
    // Cliquer sur le bouton de connexion
    await page.getByRole('button', { name: /se connecter/i }).click();
    
    // Attendre la redirection vers Keycloak
    await page.waitForURL('**/auth/**');
    
    // Vérifier que le formulaire de login Keycloak est présent
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Remplir et soumettre le formulaire
    await page.fill('input[name="username"]', process.env.E2E_USER!);
    await page.fill('input[name="password"]', process.env.E2E_PASS!);
    await page.click('button[type="submit"]');
    
    // Gérer la page "Update password" si elle apparaît
    try {
      await page.waitForSelector('text=Update password', { timeout: 5000 });
      console.log('🔄 Page "Update password" détectée');
      
      const newPassword = process.env.E2E_PASS + '1!';
      await page.fill('input[name="password-new"]', newPassword);
      await page.fill('input[name="password-confirm"]', newPassword);
      await page.click('button[type="submit"]');
      
      // Relancer le login avec le nouveau mot de passe
      await page.fill('input[name="username"]', process.env.E2E_USER!);
      await page.fill('input[name="password"]', newPassword);
      await page.click('button[type="submit"]');
    } catch (error) {
      // Pas de page "Update password", continuer
    }
    
    // Attendre la redirection vers /client
    await page.waitForURL('**/client**', { timeout: 30000 });
    
    // Vérifier qu'on est bien sur la page dashboard
    await expect(page).toHaveURL(/.*\/client.*/);
    
    // Vérifier que les éléments du dashboard sont présents
    await expect(page.getByTestId('kpi-pickups')).toBeVisible();
    await expect(page.getByTestId('kpi-valorisables')).toBeVisible();
    await expect(page.getByTestId('kpi-banals')).toBeVisible();
    await expect(page.getByTestId('kpi-dangereux')).toBeVisible();
    await expect(page.getByTestId('kpi-revenue')).toBeVisible();
  });
  
  test('devrait afficher une erreur avec des identifiants invalides', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /se connecter/i }).click();
    await page.waitForURL('**/auth/**');
    
    // Utiliser des identifiants invalides
    await page.fill('input[name="username"]', 'invalid_user');
    await page.fill('input[name="password"]', 'invalid_password');
    await page.click('button[type="submit"]');
    
    // Vérifier qu'une erreur est affichée
    await expect(page.locator('text=Invalid username or password')).toBeVisible({ timeout: 10000 });
  });
});


