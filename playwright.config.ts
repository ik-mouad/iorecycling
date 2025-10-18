import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour IORecycling
 * 
 * Cette configuration utilise un système d'authentification réutilisable :
 * 1. Le projet "setup" fait l'authentification UI et sauvegarde la session
 * 2. Les autres projets réutilisent cette session via storageState
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:88',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'], 
        storageState: 'storage/auth.json'
      },
      dependencies: ['setup']
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'], 
        storageState: 'storage/auth.json'
      },
      dependencies: ['setup']
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'], 
        storageState: 'storage/auth.json'
      },
      dependencies: ['setup']
    }
  ],

  webServer: undefined, // Pas de serveur local, on utilise l'URL externe
});