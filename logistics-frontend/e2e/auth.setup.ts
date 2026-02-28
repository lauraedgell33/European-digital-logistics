import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '..', '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('load');

  // Fill in credentials
  await page.getByLabel(/email/i).fill('admin@logistics.eu');
  await page.getByLabel(/password/i).fill('Admin@2026!');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for successful login and redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 60_000 });
  await page.waitForLoadState('domcontentloaded');

  // Verify we're on dashboard
  await expect(page.getByText(/dashboard/i).first()).toBeVisible({ timeout: 15_000 });

  // Save the authenticated session state
  await page.context().storageState({ path: authFile });
});
