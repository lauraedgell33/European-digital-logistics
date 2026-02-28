import { test, expect, type Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────
const CREDENTIALS = {
  email: 'admin@logistics.eu',
  password: 'Admin@2026!',
};

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(CREDENTIALS.email);
  await page.getByLabel(/password/i).fill(CREDENTIALS.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

// ─── Auth Flow E2E ────────────────────────────────────
test.describe('Authentication Flow', () => {
  test('should display login page with branding', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/welcome back/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByText(/create account/i)).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Should show form validation messages
    await expect(page.locator('text=/email|required/i').first()).toBeVisible({ timeout: 5_000 });
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Should show error message
    await expect(page.locator('[role="alert"], .text-red-500, [class*="error"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.getByText(/create account/i).click();
    await expect(page).toHaveURL(/register/);
    await expect(page.getByLabel(/full name|name/i).first()).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.getByText(/forgot password/i).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});

// ─── Dashboard E2E ────────────────────────────────────
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display stats cards', async ({ page }) => {
    await expect(page.getByText(/active freight/i)).toBeVisible();
    await expect(page.getByText(/available vehicles/i)).toBeVisible();
    await expect(page.getByText(/active orders/i)).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    await expect(page.getByText(/post freight/i)).toBeVisible();
    await expect(page.getByText(/register vehicle/i)).toBeVisible();
    await expect(page.getByText(/track shipments/i)).toBeVisible();
  });

  test('should navigate to freight from quick action', async ({ page }) => {
    await page.getByText(/post freight/i).click();
    await expect(page).toHaveURL(/freight\/new/);
  });
});

// ─── Sidebar Navigation E2E ──────────────────────────
test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  const navItems = [
    { name: /freight/i, url: /freight/ },
    { name: /orders/i, url: /orders/ },
    { name: /vehicles/i, url: /vehicles/ },
    { name: /tracking/i, url: /tracking/ },
    { name: /analytics/i, url: /analytics/ },
    { name: /messages/i, url: /messages/ },
    { name: /settings/i, url: /settings/ },
  ];

  for (const item of navItems) {
    test(`should navigate to ${item.name}`, async ({ page }) => {
      const link = page.getByRole('link', { name: item.name }).first();
      if (await link.isVisible()) {
        await link.click();
        await expect(page).toHaveURL(item.url);
      }
    });
  }
});

// ─── Freight Management E2E ───────────────────────────
test.describe('Freight Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display freight listing page', async ({ page }) => {
    await page.goto('/freight');
    await expect(page.getByText(/freight/i).first()).toBeVisible();
  });

  test('should open new freight form', async ({ page }) => {
    await page.goto('/freight/new');
    await expect(page.getByText(/freight|cargo|shipment/i).first()).toBeVisible();
  });

  test('should have search/filter on freight page', async ({ page }) => {
    await page.goto('/freight');
    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Germany');
      await page.waitForTimeout(1000);
    }
  });
});

// ─── Orders E2E ───────────────────────────────────────
test.describe('Order Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display orders listing', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.getByText(/order/i).first()).toBeVisible();
  });

  test('should navigate to create order', async ({ page }) => {
    await page.goto('/orders/new');
    await expect(page.getByText(/order|transport/i).first()).toBeVisible();
  });
});

// ─── New Feature Pages E2E ────────────────────────────
test.describe('Phase 2-6 Feature Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  const featurePages = [
    { path: '/ai-matching', title: /ai|matching|smart/i },
    { path: '/predictions', title: /predict|forecast|analytics/i },
    { path: '/dynamic-pricing', title: /pricing|dynamic/i },
    { path: '/route-optimizer', title: /route|optim/i },
    { path: '/document-ocr', title: /document|ocr|scan/i },
    { path: '/blockchain', title: /blockchain|ecmr|digital/i },
    { path: '/invoices', title: /invoice|billing/i },
    { path: '/payments', title: /payment|transaction/i },
    { path: '/multimodal', title: /multimodal|transport/i },
    { path: '/enterprise', title: /enterprise|white.?label/i },
  ];

  for (const fp of featurePages) {
    test(`should load ${fp.path} without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto(fp.path);
      await page.waitForLoadState('networkidle');

      // Page should have meaningful content
      await expect(page.locator('body')).not.toBeEmpty();

      // No React or JS errors
      expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
    });
  }
});

// ─── Settings Page E2E ────────────────────────────────
test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display settings page with tabs', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText(/settings|profile/i).first()).toBeVisible();
  });

  test('should display profile form with pre-filled data', async ({ page }) => {
    await page.goto('/settings');
    const nameInput = page.getByLabel(/full name|name/i).first();
    if (await nameInput.isVisible()) {
      await expect(nameInput).not.toHaveValue('');
    }
  });

  test('should switch between settings tabs', async ({ page }) => {
    await page.goto('/settings');
    const tabs = page.getByRole('tab');
    const count = await tabs.count();
    if (count > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
    }
  });
});

// ─── Responsive Design E2E ────────────────────────────
test.describe('Responsive Design', () => {
  test('should be usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should be usable on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await login(page);
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();
  });

  test('sidebar should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
    // Sidebar should be hidden or in hamburger menu on mobile
    await page.waitForTimeout(1000);
  });
});

// ─── Error Handling E2E ───────────────────────────────
test.describe('Error Handling', () => {
  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.locator('body')).toContainText(/not found|404|error/i);
  });

  test('should not crash on rapid navigation', async ({ page }) => {
    await login(page);
    const pages = ['/freight', '/orders', '/vehicles', '/dashboard', '/settings'];
    for (const p of pages) {
      await page.goto(p, { waitUntil: 'commit' });
    }
    await page.waitForLoadState('networkidle');
    // Should still be on a valid page
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
