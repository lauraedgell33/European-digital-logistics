import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://european-digital-logistics-oujbb00j.on-forge.com';

/**
 * Playwright config for public-pages-only testing (no auth required).
 * Use: node node_modules/@playwright/test/cli.js test --config=playwright-noauth.config.ts
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'e2e/results/noauth-results.json' }],
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    // No storageState — tests run as unauthenticated visitor
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // No setup dependency
    },
  ],
});
