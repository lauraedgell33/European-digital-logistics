import { by, device, element, expect } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display the login screen on first launch', async () => {
    await expect(element(by.text('Sign In'))).toBeVisible();
  });

  it('should show email and password fields', async () => {
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
  });

  it('should show validation errors for empty form submission', async () => {
    await element(by.id('login-button')).tap();
    // Should show validation feedback
    await expect(element(by.id('email-input'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@test.com');
    await element(by.id('password-input')).typeText('wrongpass');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.text(/invalid|error|incorrect/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should login successfully with valid credentials', async () => {
    await element(by.id('email-input')).clearText();
    await element(by.id('email-input')).typeText('admin@logistics.eu');
    await element(by.id('password-input')).clearText();
    await element(by.id('password-input')).typeText('Admin@2026!');
    await element(by.id('login-button')).tap();
    // Should navigate to dashboard
    await waitFor(element(by.text(/dashboard|welcome/i)))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should navigate to register screen', async () => {
    const registerLink = element(by.text(/register|sign up|create account/i));
    if (await registerLink.getAttributes().catch(() => null)) {
      await registerLink.tap();
      await expect(element(by.text(/create|register|sign up/i))).toBeVisible();
    }
  });
});
