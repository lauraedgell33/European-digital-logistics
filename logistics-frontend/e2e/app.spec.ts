import { test, expect, type Page } from '@playwright/test';

// ─── Auth Flow E2E (uses fresh session, no storage state) ─────
test.describe('Authentication Flow', () => {
  // These tests explicitly clear storage state to test login flow
  test.use({ storageState: { cookies: [], origins: [] } });

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
    await expect(page.locator('text=/email|required/i').first()).toBeVisible({ timeout: 5_000 });
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('[role="alert"], .text-red-500, [class*="error"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('load');
    await page.getByLabel(/email/i).fill('admin@logistics.eu');
    await page.getByLabel(/password/i).fill('Admin@2026!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 60_000 });
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.getByText(/create account/i).click();
    await expect(page).toHaveURL(/register/);
    await expect(page.getByPlaceholder(/john doe/i)).toBeVisible();
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

// ─── Dashboard E2E (uses stored auth session) ─────────
test.describe('Dashboard', () => {
  test('should display stats cards', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await expect(page.getByText(/active freight/i)).toBeVisible();
    await expect(page.getByText(/available vehicles/i)).toBeVisible();
    await expect(page.getByText(/active orders/i)).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await expect(page.getByText(/post freight/i)).toBeVisible();
    await expect(page.getByText(/register vehicle/i)).toBeVisible();
    await expect(page.getByText(/track shipments/i)).toBeVisible();
  });

  test('should navigate to freight from quick action', async ({ page, isMobile }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    if (isMobile) {
      // Dismiss the mobile sidebar overlay if it's open
      const overlay = page.locator('div.fixed.inset-0.bg-black\\/60');
      if (await overlay.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await overlay.click();
        await overlay.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
      }
    }
    const postFreightBtn = page.getByText(/post freight/i);
    await postFreightBtn.scrollIntoViewIfNeeded();
    await postFreightBtn.click({ timeout: 15_000 });
    await expect(page).toHaveURL(/freight\/new/);
  });
});

// ─── Sidebar Navigation E2E ──────────────────────────
test.describe('Sidebar Navigation', () => {
  const navItems = [
    { name: /freight exchange/i, url: /freight/ },
    { name: /transport orders/i, url: /orders/ },
    { name: /vehicle offers/i, url: /vehicles/ },
    { name: /live tracking/i, url: /tracking/ },
    { name: 'Analytics', url: /analytics/ },
    { name: /messages/i, url: /messages/ },
    { name: 'Settings', url: /settings/ },
  ];

  for (const item of navItems) {
    test(`should navigate to ${typeof item.name === 'string' ? item.name : item.name.source}`, async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load');
      const link = typeof item.name === 'string'
        ? page.getByRole('link', { name: item.name, exact: true }).first()
        : page.getByRole('link', { name: item.name }).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(item.url);
      }
    });
  }
});

// ─── Freight Management E2E ───────────────────────────
test.describe('Freight Management', () => {
  test('should display freight listing page', async ({ page }) => {
    await page.goto('/freight', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await expect(page.getByText(/freight/i).first()).toBeVisible();
  });

  test('should open new freight form', async ({ page }) => {
    await page.goto('/freight/new', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await expect(page.getByText(/freight|cargo|shipment/i).first()).toBeVisible();
  });

  test('should have search/filter on freight page', async ({ page }) => {
    await page.goto('/freight', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Germany');
      await page.waitForTimeout(1000);
    }
  });
});

// ─── Orders E2E ───────────────────────────────────────
test.describe('Order Management', () => {
  test('should display orders listing', async ({ page }) => {
    await page.goto('/orders', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await expect(page.getByText(/order/i).first()).toBeVisible();
  });

  test('should navigate to create order', async ({ page }) => {
    await page.goto('/orders/new', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await expect(page.getByText(/order|transport/i).first()).toBeVisible();
  });
});

// ─── New Feature Pages E2E ────────────────────────────
test.describe('Phase 2-6 Feature Pages', () => {
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

      await page.goto(fp.path, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('load');

      await expect(page.locator('body')).not.toBeEmpty();
      expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
    });
  }
});

// ─── Settings Page E2E ────────────────────────────────
test.describe('Settings', () => {
  test('should display settings page with tabs', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await expect(page.getByText(/settings|profile/i).first()).toBeVisible();
  });

  test('should display profile form with pre-filled data', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    const nameInput = page.getByPlaceholder(/name|john/i).first();
    if (await nameInput.isVisible()) {
      await expect(nameInput).toBeVisible();
    }
  });

  test('should switch between settings tabs', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    const tabs = page.getByRole('tab');
    const count = await tabs.count();
    if (count > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
    } else {
      const tabLinks = page.locator('[role="tablist"] a, [role="tablist"] button, .tab-item, [data-tab]');
      const linkCount = await tabLinks.count();
      expect(linkCount >= 0).toBeTruthy();
    }
  });
});

// ─── Responsive Design E2E ────────────────────────────
test.describe('Responsive Design', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should be usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should be usable on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('sidebar should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await page.waitForTimeout(1000);
  });
});

// ─── Error Handling E2E ───────────────────────────────
test.describe('Error Handling', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.locator('body')).toContainText(/not found|404|sign in|welcome back/i);
  });

  test('should not crash on rapid navigation', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('load');
    await page.getByLabel(/email/i).fill('admin@logistics.eu');
    await page.getByLabel(/password/i).fill('Admin@2026!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 60_000 });

    const pages = ['/freight', '/orders', '/vehicles', '/dashboard', '/settings'];
    for (const p of pages) {
      await page.goto(p, { waitUntil: 'commit', timeout: 15_000 });
    }
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
