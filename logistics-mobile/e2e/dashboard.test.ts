import { by, device, element, expect, waitFor } from 'detox';

describe('Dashboard', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // Login first
    await element(by.id('email-input')).typeText('admin@logistics.eu');
    await element(by.id('password-input')).typeText('Admin@2026!');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.text(/dashboard|welcome/i)))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should display dashboard stats cards', async () => {
    await expect(element(by.id('stats-grid'))).toBeVisible();
  });

  it('should display welcome message with user name', async () => {
    await expect(element(by.text(/welcome/i))).toBeVisible();
  });

  it('should pull to refresh', async () => {
    await element(by.id('dashboard-scroll')).swipe('down', 'fast');
    // Should refresh data without crash
    await waitFor(element(by.id('stats-grid')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display revenue card', async () => {
    await expect(element(by.text(/revenue/i))).toBeVisible();
  });

  it('should display recent orders section', async () => {
    await element(by.id('dashboard-scroll')).scrollTo('bottom');
    await waitFor(element(by.text(/recent|orders/i)))
      .toBeVisible()
      .withTimeout(5000);
  });
});

describe('Tab Navigation', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('should navigate to Orders tab', async () => {
    await element(by.id('tab-orders')).tap();
    await waitFor(element(by.text(/orders/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to Marketplace tab', async () => {
    await element(by.id('tab-marketplace')).tap();
    await waitFor(element(by.text(/marketplace|freight/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to Messages tab', async () => {
    await element(by.id('tab-messages')).tap();
    await waitFor(element(by.text(/messages/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to Profile tab', async () => {
    await element(by.id('tab-profile')).tap();
    await waitFor(element(by.text(/profile|settings/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should return to Dashboard tab', async () => {
    await element(by.id('tab-dashboard')).tap();
    await waitFor(element(by.text(/dashboard|welcome/i)))
      .toBeVisible()
      .withTimeout(5000);
  });
});
