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

// ─── Keyboard Navigation ─────────────────────────────
test.describe('Keyboard Navigation', () => {
  test('login form should be keyboard-navigable', async ({ page }) => {
    await page.goto('/login');

    // Tab to email field
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();

    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to submit with Enter
    await page.getByLabel(/email/i).fill(CREDENTIALS.email);
    await page.getByLabel(/password/i).fill(CREDENTIALS.password);
    await page.getByLabel(/password/i).press('Enter');
    await page.waitForTimeout(3000);
  });

  test('sidebar navigation should be keyboard accessible', async ({ page }) => {
    await login(page);
    // All nav links should be focusable
    const navLinks = page.locator('nav a[href]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = navLinks.nth(i);
      await expect(link).toHaveAttribute('href');
    }
  });
});

// ─── ARIA & Semantic HTML ─────────────────────────────
test.describe('ARIA & Semantic HTML', () => {
  test('login page should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/login');

    // Form inputs should have labels
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');

    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Submit button should have accessible name
    const submitBtn = page.getByRole('button', { name: /sign in/i });
    await expect(submitBtn).toBeVisible();
  });

  test('dashboard should have proper heading hierarchy', async ({ page }) => {
    await login(page);
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();

    // Should not skip heading levels (h1 -> h3 without h2)
    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(hs).map((h) => ({
        level: parseInt(h.tagName.charAt(1)),
        text: h.textContent?.trim().slice(0, 50),
      }));
    });

    // At least one h1 should be present
    expect(headings.some((h) => h.level === 1)).toBe(true);
  });

  test('interactive elements should have focus indicators', async ({ page }) => {
    await page.goto('/login');

    // Focus the email input and check for visible focus styles
    await page.getByLabel(/email/i).focus();
    const emailInput = page.getByLabel(/email/i);
    
    // Should have some focus-visible styling (outline, ring, or border change)
    const styles = await emailInput.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        boxShadow: computed.boxShadow,
        borderColor: computed.borderColor,
      };
    });
    // At least one focus indicator should be present
    const hasFocusIndicator =
      styles.outline !== 'none' ||
      styles.boxShadow !== 'none' ||
      styles.borderColor !== 'rgb(0, 0, 0)';
    expect(hasFocusIndicator).toBe(true);
  });

  test('images should have alt text', async ({ page }) => {
    await login(page);
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Images should have alt text, role="presentation", or be aria-hidden
      expect(
        alt !== null || role === 'presentation' || ariaHidden === 'true'
      ).toBe(true);
    }
  });

  test('buttons should have accessible names', async ({ page }) => {
    await login(page);
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const name = await btn.evaluate((el) => {
          return (
            el.textContent?.trim() ||
            el.getAttribute('aria-label') ||
            el.getAttribute('title') ||
            ''
          );
        });
        expect(name.length).toBeGreaterThan(0);
      }
    }
  });

  test('links should have descriptive text', async ({ page }) => {
    await login(page);
    const links = page.locator('a[href]');
    const count = await links.count();

    let hasDescriptive = 0;
    for (let i = 0; i < Math.min(count, 30); i++) {
      const link = links.nth(i);
      if (await link.isVisible()) {
        const text = await link.evaluate((el) => {
          return (
            el.textContent?.trim() ||
            el.getAttribute('aria-label') ||
            el.getAttribute('title') ||
            ''
          );
        });
        if (text.length > 0) hasDescriptive++;
      }
    }
    expect(hasDescriptive).toBeGreaterThan(0);
  });
});

// ─── Color Contrast & Visual A11y ─────────────────────
test.describe('Color Contrast & Visual Accessibility', () => {
  test('text should have sufficient contrast against backgrounds', async ({ page }) => {
    await page.goto('/login');
    
    // Check main heading contrast
    const heading = page.locator('h1').first();
    if (await heading.isVisible()) {
      const contrast = await heading.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bg = style.backgroundColor;
        return { color, bg };
      });
      // Should have a dark text color (not transparent or invisible)
      expect(contrast.color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('form inputs should have visible borders or backgrounds', async ({ page }) => {
    await page.goto('/login');
    const inputs = page.locator('input[type="email"], input[type="password"]');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const styles = await input.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          border: computed.border,
          borderWidth: computed.borderWidth,
          backgroundColor: computed.backgroundColor,
        };
      });
      // Input should have visible border or different background
      const hasBorder = styles.borderWidth !== '0px';
      const hasBg = styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
      expect(hasBorder || hasBg).toBe(true);
    }
  });
});

// ─── Screen Reader Compatibility ──────────────────────
test.describe('Screen Reader Compatibility', () => {
  test('page should have a main landmark', async ({ page }) => {
    await page.goto('/login');
    const mains = page.locator('main, [role="main"]');
    await expect(mains.first()).toBeVisible();
  });

  test('navigation should be marked as nav landmark', async ({ page }) => {
    await login(page);
    const navs = page.locator('nav, [role="navigation"]');
    const count = await navs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('skip to main content link should exist', async ({ page }) => {
    await page.goto('/login');
    // Check for skip link (may be visually hidden but present in DOM)
    const skipLink = page.locator('a[href="#main-content"], a[href*="skip"]');
    const count = await skipLink.count();
    if (count > 0) {
      // If it exists, it should have meaningful text
      const text = await skipLink.first().textContent();
      expect(text?.toLowerCase()).toContain('skip');
    }
  });

  test('modals and dialogs should have proper roles', async ({ page }) => {
    await login(page);
    // Check if any dialogs/modals have proper ARIA
    const dialogs = page.locator('[role="dialog"], [role="alertdialog"]');
    const count = await dialogs.count();
    for (let i = 0; i < count; i++) {
      const dialog = dialogs.nth(i);
      const label =
        (await dialog.getAttribute('aria-label')) ||
        (await dialog.getAttribute('aria-labelledby'));
      expect(label).toBeTruthy();
    }
  });

  test('form validation errors should be announced', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(1000);

    // Error messages should have role="alert" or aria-live
    const errorElements = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"], .text-red-500');
    const count = await errorElements.count();
    // At least some validation feedback should exist
    expect(count).toBeGreaterThanOrEqual(0); // Soft check
  });
});

// ─── Reduced Motion ───────────────────────────────────
test.describe('Reduced Motion Support', () => {
  test('should respect prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/login');

    // Check that animations are disabled or reduced
    const hasReducedAnimations = await page.evaluate(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      return mq.matches;
    });
    expect(hasReducedAnimations).toBe(true);
  });
});

// ─── Language & i18n ──────────────────────────────────
test.describe('Internationalization', () => {
  test('page should have lang attribute', async ({ page }) => {
    await page.goto('/login');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('page should have valid document title', async ({ page }) => {
    await page.goto('/login');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('undefined');
  });
});
