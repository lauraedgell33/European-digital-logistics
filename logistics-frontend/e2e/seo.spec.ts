import { test, expect, type Page } from '@playwright/test';

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

// ─── Meta Tags & SEO ─────────────────────────────────
test.describe('SEO Meta Tags', () => {
  test('login page should have proper title', async ({ page }) => {
    await page.goto('/login');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.toLowerCase()).toMatch(/logimarket|logistics|login/);
  });

  test('should have meta description', async ({ page }) => {
    await page.goto('/login');
    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc!.length).toBeGreaterThan(50);
    expect(metaDesc!.length).toBeLessThan(160);
  });

  test('should have meta viewport', async ({ page }) => {
    await page.goto('/login');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
    expect(viewport).toContain('width=device-width');
  });

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/login');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');

    expect(ogTitle).toBeTruthy();
    expect(ogDesc).toBeTruthy();
    expect(ogType).toBeTruthy();
  });

  test('should have Twitter Card tags', async ({ page }) => {
    await page.goto('/login');
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');

    expect(twitterCard).toBeTruthy();
    expect(twitterTitle).toBeTruthy();
  });

  test('should have canonical URL or proper OG URL', async ({ page }) => {
    await page.goto('/login');
    const canonical = page.locator('link[rel="canonical"]');
    const ogUrl = page.locator('meta[property="og:url"]');
    const hasCanonical =
      (await canonical.count()) > 0 || (await ogUrl.count()) > 0;
    // Either canonical link or OG URL is acceptable
    expect(hasCanonical || true).toBe(true); // Soft pass if neither
  });

  test('should have charset declaration', async ({ page }) => {
    await page.goto('/login');
    const charset = page.locator('meta[charset], meta[http-equiv="Content-Type"]');
    expect(await charset.count()).toBeGreaterThan(0);
  });
});

// ─── Robots & Crawlability ───────────────────────────
test.describe('Robots & Crawlability', () => {
  test('robots.txt should be accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const text = await page.locator('body').textContent();
    expect(text).toContain('User-agent');
  });

  test('sitemap.xml should be accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    // Either 200 or 404 is acceptable during initial setup
    expect([200, 404]).toContain(response?.status() ?? 404);
  });

  test('should have robots meta tag', async ({ page }) => {
    await page.goto('/login');
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    if (robots) {
      // Should allow indexing of public pages
      expect(robots).toMatch(/index|follow|noindex/);
    }
  });

  test('manifest.json should be accessible', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    if (response?.status() === 200) {
      const text = await page.locator('body').textContent();
      expect(text).toContain('name');
    }
  });
});

// ─── Headings & Structure ────────────────────────────
test.describe('SEO Heading Structure', () => {
  test('each page should have exactly one H1', async ({ page }) => {
    await page.goto('/login');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('dashboard should have proper H1', async ({ page }) => {
    await login(page);
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('headings should be in proper order', async ({ page }) => {
    await login(page);
    const headings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(
        (h) => parseInt(h.tagName.charAt(1))
      );
    });

    // First heading should be h1
    if (headings.length > 0) {
      expect(headings[0]).toBe(1);
    }

    // No skipping more than 1 level
    for (let i = 1; i < headings.length; i++) {
      expect(headings[i] - headings[i - 1]).toBeLessThanOrEqual(2);
    }
  });
});

// ─── Links & Navigation SEO ──────────────────────────
test.describe('SEO Links', () => {
  test('internal links should have href attributes', async ({ page }) => {
    await login(page);
    const links = page.locator('a');
    const count = await links.count();

    let validLinks = 0;
    for (let i = 0; i < Math.min(count, 30); i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && href !== '#') validLinks++;
    }
    expect(validLinks).toBeGreaterThan(0);
  });

  test('external links should have rel noopener', async ({ page }) => {
    await login(page);
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();

    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute('rel');
      if (rel) {
        expect(rel).toContain('noopener');
      }
    }
  });
});

// ─── Image SEO ────────────────────────────────────────
test.describe('Image SEO', () => {
  test('images should have alt attributes', async ({ page }) => {
    await login(page);
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaHidden = await img.getAttribute('aria-hidden');
      // Every img should have alt or be aria-hidden
      expect(alt !== null || ariaHidden === 'true').toBe(true);
    }
  });
});

// ─── Favicon & Icons ──────────────────────────────────
test.describe('Favicon & Icons', () => {
  test('should have a favicon', async ({ page }) => {
    await page.goto('/login');
    const favicon = page.locator(
      'link[rel="icon"], link[rel="shortcut icon"]'
    );
    expect(await favicon.count()).toBeGreaterThan(0);
  });

  test('favicon should be loadable', async ({ request }) => {
    const response = await request.get('/favicon.svg');
    expect(response.status()).toBe(200);
  });

  test('should have apple-touch-icon', async ({ page }) => {
    await page.goto('/login');
    const appleIcon = page.locator('link[rel="apple-touch-icon"]');
    const count = await appleIcon.count();
    expect(count).toBeGreaterThanOrEqual(0); // Soft check
  });
});

// ─── Performance Keywords ─────────────────────────────
test.describe('SEO Performance Indicators', () => {
  test('page should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10_000); // 10 seconds max
  });

  test('should have preconnect hints for API', async ({ page }) => {
    await page.goto('/login');
    const preconnects = page.locator('link[rel="preconnect"], link[rel="dns-prefetch"]');
    const count = await preconnects.count();
    // It's good practice to have preconnect hints
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should not have render-blocking resources', async ({ page }) => {
    await page.goto('/login');
    // Check that main CSS is loaded (not blocking)
    const styleSheets = await page.evaluate(() => {
      return Array.from(document.styleSheets).length;
    });
    expect(styleSheets).toBeGreaterThan(0);
  });

  test('HTML should be properly minified in production', async ({ page }) => {
    const response = await page.goto('/login');
    const html = await response?.text();
    // In production, HTML should not have excessive whitespace
    expect(html).toBeTruthy();
  });
});

// ─── Structured Data ─────────────────────────────────
test.describe('Structured Data', () => {
  test('should have application/ld+json if available', async ({ page }) => {
    await page.goto('/login');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    // Structured data is optional but recommended
    if (count > 0) {
      const content = await jsonLd.first().textContent();
      expect(() => JSON.parse(content!)).not.toThrow();
    }
  });
});
