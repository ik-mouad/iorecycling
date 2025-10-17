import { test as setup, expect } from '@playwright/test';

/**
 * Setup d'authentification pour les tests E2E
 * Ce test s'exécute en premier et sauvegarde l'état d'authentification
 */

// Vérification des variables d'environnement
const E2E_USER = process.env.E2E_USER;
const E2E_PASS = process.env.E2E_PASS;
const E2E_MONTH = process.env.E2E_MONTH || '2025-01';

if (!E2E_USER || !E2E_PASS) {
  throw new Error('Variables d\'environnement manquantes: E2E_USER et E2E_PASS doivent être définies');
}

console.log(`🔐 Authentification avec l'utilisateur: ${E2E_USER}`);
console.log(`📅 Mois de test: ${E2E_MONTH}`);

setup('authenticate', async ({ page }) => {
  // Aller à la page de login
  await page.goto('/');
  
  // Attendre que la page se charge
  await page.waitForLoadState('networkidle');
  
  // Cliquer sur le bouton "Se connecter"
  await page.getByRole('button', { name: /se connecter/i }).click();
  
  // Attendre la redirection vers Keycloak
  await page.waitForURL('**/auth/**');
  
  // Remplir le formulaire de login Keycloak
  await page.fill('input[name="username"]', E2E_USER);
  await page.fill('input[name="password"]', E2E_PASS);
  await page.click('button[type="submit"]');
  
  // Gérer la page "Update password" si elle apparaît
  try {
    await page.waitForSelector('text=Update password', { timeout: 5000 });
    console.log('🔄 Page "Update password" détectée, mise à jour du mot de passe...');
    
    const newPassword = E2E_PASS + '1!';
    await page.fill('input[name="password-new"]', newPassword);
    await page.fill('input[name="password-confirm"]', newPassword);
    await page.click('button[type="submit"]');
    
    // Relancer le login avec le nouveau mot de passe
    await page.fill('input[name="username"]', E2E_USER);
    await page.fill('input[name="password"]', newPassword);
    await page.click('button[type="submit"]');
  } catch (error) {
    // Pas de page "Update password", continuer
    console.log('✅ Pas de page "Update password" détectée');
  }
  
  // Attendre la redirection vers /client
  await page.waitForURL('**/client**', { timeout: 30000 });
  
  // Vérifier qu'on est bien sur la page dashboard
  await expect(page).toHaveURL(/.*\/client.*/);
  
  // Vérifier que les KPI sont présents (indication que l'authentification a réussi)
  await expect(page.getByTestId('kpi-pickups')).toBeVisible();
  
  console.log('✅ Authentification réussie, sauvegarde de l\'état...');
  
  // Sauvegarder l'état d'authentification
  await page.context().storageState({ path: 'storage/auth.json' });
});


