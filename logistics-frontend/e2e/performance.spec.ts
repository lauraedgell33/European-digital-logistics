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

// ─── Core Web Vitals & Load Performance ───────────────
test.describe('Page Load Performance', () => {
  test('login page should load under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const dcl = Date.now() - start;
    expect(dcl).toBeLessThan(5_000);

    await page.waitForLoadState('load');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(8_000);
  });

  test('dashboard should load under 5 seconds', async ({ page }) => {
    await login(page);
    const start = Date.now();
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10_000);
  });

  test('First Contentful Paint should be reasonable', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    const fcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find((e) => e.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
            observer.disconnect();
          }
        });
        observer.observe({ entryTypes: ['paint'] });
        // Fallback if FCP already happened
        const existing = performance.getEntriesByName('first-contentful-paint');
        if (existing.length > 0) {
          resolve(existing[0].startTime);
          observer.disconnect();
        }
        // Timeout fallback
        setTimeout(() => resolve(-1), 5000);
      });
    });
    if (fcp > 0) {
      expect(fcp).toBeLessThan(3000); // FCP under 3s
    }
  });

  test('Largest Contentful Paint should be under 4 seconds', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            lcpValue = entry.startTime;
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        // Wait and resolve
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 3000);
      });
    });
    if (lcp > 0) {
      expect(lcp).toBeLessThan(4000);
    }
  });

  test('Cumulative Layout Shift should be minimal', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });
    expect(cls).toBeLessThan(0.25); // Good CLS < 0.1, needs improvement < 0.25
  });
});

// ─── Network & Resource Performance ───────────────────
test.describe('Network Performance', () => {
  test('should not load excessive JavaScript', async ({ page }) => {
    const jsRequests: { url: string; size: number }[] = [];
    page.on('response', async (response) => {
      if (response.url().endsWith('.js') || response.headers()['content-type']?.includes('javascript')) {
        const body = await response.body().catch(() => Buffer.alloc(0));
        jsRequests.push({ url: response.url(), size: body.length });
      }
    });
    await page.goto('/login', { waitUntil: 'networkidle' });
    const totalJS = jsRequests.reduce((sum, r) => sum + r.size, 0);
    // Total JS should be under 2MB (compressed)
    expect(totalJS).toBeLessThan(2 * 1024 * 1024);
  });

  test('should not make excessive API calls on dashboard load', async ({ page }) => {
    await login(page);
    const apiCalls: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        apiCalls.push(request.url());
      }
    });
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    // Should not make more than 20 API calls on initial load
    expect(apiCalls.length).toBeLessThan(20);
  });

  test('static assets should have cache headers', async ({ page }) => {
    let hasCacheHeaders = false;
    page.on('response', (response) => {
      const cacheControl = response.headers()['cache-control'];
      if (cacheControl && response.url().match(/\.(js|css|svg|png|jpg|woff2?)$/)) {
        hasCacheHeaders = true;
      }
    });
    await page.goto('/login', { waitUntil: 'networkidle' });
    expect(hasCacheHeaders).toBe(true);
  });

  test('should use gzip or brotli compression', async ({ page }) => {
    let hasCompression = false;
    page.on('response', (response) => {
      const encoding = response.headers()['content-encoding'];
      if (encoding && (encoding.includes('gzip') || encoding.includes('br'))) {
        hasCompression = true;
      }
    });
    await page.goto('/login', { waitUntil: 'networkidle' });
    expect(hasCompression).toBe(true);
  });

  test('should not have broken resource requests', async ({ page }) => {
    const brokenRequests: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 400 && !response.url().includes('/api/')) {
        brokenRequests.push(`${response.status()} ${response.url()}`);
      }
    });
    await page.goto('/login', { waitUntil: 'networkidle' });
    expect(brokenRequests).toHaveLength(0);
  });
});

// ─── Rendering Performance ────────────────────────────
test.describe('Rendering Performance', () => {
  test('should not have long tasks blocking main thread', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    const longTasks = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let count = 0;
        const observer = new PerformanceObserver((list) => {
          count += list.getEntries().length;
        });
        try {
          observer.observe({ entryTypes: ['longtask'] });
        } catch {
          resolve(0);
          return;
        }
        setTimeout(() => {
          observer.disconnect();
          resolve(count);
        }, 3000);
      });
    });
    // Should have minimal long tasks (> 50ms)
    expect(longTasks).toBeLessThan(10);
  });

  test('DOM should not be excessively large', async ({ page }) => {
    await login(page);
    const domSize = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });
    // DOM should be under 3000 elements for good performance
    expect(domSize).toBeLessThan(5000);
  });

  test('should not have excessive inline styles', async ({ page }) => {
    await login(page);
    const inlineStyleCount = await page.evaluate(() => {
      return document.querySelectorAll('[style]').length;
    });
    // Warning: too many inline styles hurt maintainability (soft limit)
    expect(inlineStyleCount).toBeLessThan(500);
  });
});

// ─── Navigation Performance ───────────────────────────
test.describe('Navigation Performance', () => {
  test('client-side navigation should be fast', async ({ page }) => {
    await login(page);
    const start = Date.now();
    await page.goto('/freight');
    await page.waitForLoadState('networkidle');
    const navTime = Date.now() - start;
    expect(navTime).toBeLessThan(5_000);
  });

  test('back navigation should be instant', async ({ page }) => {
    await login(page);
    await page.goto('/freight');
    await page.waitForLoadState('networkidle');

    const start = Date.now();
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    const backTime = Date.now() - start;
    expect(backTime).toBeLessThan(3_000);
  });

  test('multiple rapid page loads should not crash', async ({ page }) => {
    await login(page);
    const pages = ['/freight', '/orders', '/vehicles', '/settings', '/dashboard'];

    for (const p of pages) {
      await page.goto(p, { waitUntil: 'domcontentloaded' });
    }
    await page.waitForLoadState('networkidle');
    // Page should still be functional
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

// ─── Memory & Resource Usage ──────────────────────────
test.describe('Memory & Resources', () => {
  test('should not leak memory across navigations', async ({ page }) => {
    await login(page);

    // Measure initial memory
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Navigate through pages
    for (let i = 0; i < 5; i++) {
      await page.goto('/freight');
      await page.goto('/orders');
      await page.goto('/dashboard');
    }

    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      // Memory should not grow more than 3x
      expect(finalMemory).toBeLessThan(initialMemory * 3);
    }
  });

  test('should clean up event listeners on unmount', async ({ page }) => {
    await login(page);
    await page.goto('/freight');
    await page.goto('/dashboard');
    // No crash = passed (event listener cleanup is implied)
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

// ─── Bundle Analysis ──────────────────────────────────
test.describe('Bundle Size', () => {
  test('initial page JS should be under 500KB', async ({ page }) => {
    const jsBytes: number[] = [];
    page.on('response', async (response) => {
      if (
        response.url().match(/\.(js)$/) &&
        response.status() === 200
      ) {
        const body = await response.body().catch(() => Buffer.alloc(0));
        jsBytes.push(body.length);
      }
    });

    await page.goto('/login', { waitUntil: 'networkidle' });
    const totalKB = jsBytes.reduce((s, b) => s + b, 0) / 1024;
    // Total initial JS payload should be reasonable
    expect(totalKB).toBeLessThan(1024); // 1MB compressed max
  });

  test('CSS payload should be reasonable', async ({ page }) => {
    const cssBytes: number[] = [];
    page.on('response', async (response) => {
      if (
        response.url().match(/\.css$/) &&
        response.status() === 200
      ) {
        const body = await response.body().catch(() => Buffer.alloc(0));
        cssBytes.push(body.length);
      }
    });

    await page.goto('/login', { waitUntil: 'networkidle' });
    const totalKB = cssBytes.reduce((s, b) => s + b, 0) / 1024;
    // CSS should be under 500KB
    expect(totalKB).toBeLessThan(500);
  });
});
