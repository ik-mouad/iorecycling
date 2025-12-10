import { test as setup, expect } from '@playwright/test';

/**
 * Test d'authentification pour Playwright
 * 
 * Ce test :
 * 1. Lit les variables d'environnement E2E_USER, E2E_PASS, E2E_BASE_URL
 * 2. Navigue vers l'application et clique sur "Se connecter"
 * 3. Effectue l'authentification Keycloak
 * 4. Gère la page "Update password" si elle apparaît
 * 5. Sauvegarde la session dans storage/auth.json
 */
setup('authenticate', async ({ page, context }) => {
  // Vérification des variables d'environnement obligatoires
  const username = process.env.E2E_USER;
  const password = process.env.E2E_PASS;
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:88';

  if (!username || !password) {
    throw new Error('Variables d\'environnement manquantes : E2E_USER et E2E_PASS sont obligatoires');
  }

  console.log(`🔐 Authentification avec l'utilisateur: ${username}`);
  console.log(`🌐 URL de base: ${baseUrl}`);

  // Navigation vers l'application
  await page.goto('/');
  
  // Attendre que la page soit chargée
  await page.waitForLoadState('networkidle');
  
  // Cliquer sur le bouton "Se connecter"
  const loginButton = page.locator('button:has-text("Se connecter")');
  await expect(loginButton).toBeVisible();
  await loginButton.click();

  // Attendre la redirection vers Keycloak
  await page.waitForURL(/\/auth\/realms\/iorecycling/);
  
  // Remplir le formulaire de connexion Keycloak
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  
  // Soumettre le formulaire
  await page.click('input[type="submit"]');

  // Gérer la page "Update password" si elle apparaît
  const updatePasswordField = page.locator('input[name="password-new"]');
  if (await updatePasswordField.isVisible()) {
    console.log('🔄 Page "Update password" détectée, mise à jour du mot de passe...');
    
    const newPassword = password + '!1';
    await page.fill('input[name="password-new"]', newPassword);
    await page.fill('input[name="password-confirm"]', newPassword);
    
    // Soumettre le nouveau mot de passe
    await page.click('input[type="submit"]');
    
    // Attendre et refaire le login avec le nouveau mot de passe
    await page.waitForLoadState('networkidle');
    
    // Retourner à la page de login
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Cliquer à nouveau sur "Se connecter"
    await page.click('button:has-text("Se connecter")');
    await page.waitForURL(/\/auth\/realms\/iorecycling/);
    
    // Login avec le nouveau mot de passe
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', newPassword);
    await page.click('input[type="submit"]');
  }

  // Attendre d'être redirigé vers /client
  await page.waitForURL(/\/client/);
  
  // Vérifier que l'authentification a réussi
  await expect(page.locator('text=Mouad Idrissi Khamlichi')).toBeVisible();
  
  console.log('✅ Authentification réussie !');
  
  // Sauvegarder la session
  await context.storageState({ path: 'storage/auth.json' });
  console.log('💾 Session sauvegardée dans storage/auth.json');
});