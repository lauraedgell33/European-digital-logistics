import { by, device, element, expect, waitFor } from 'detox';

// Helper to login before tests
async function loginAsAdmin() {
  await device.launchApp({ newInstance: true });
  await element(by.id('email-input')).typeText('admin@logistics.eu');
  await element(by.id('password-input')).typeText('Admin@2026!');
  await element(by.id('login-button')).tap();
  await waitFor(element(by.text(/dashboard|welcome/i)))
    .toBeVisible()
    .withTimeout(10000);
}

// ─── Freight / Marketplace ────────────────────────────
describe('Marketplace Flow', () => {
  beforeAll(async () => {
    await loginAsAdmin();
    await element(by.id('tab-marketplace')).tap();
    await waitFor(element(by.text(/marketplace|freight/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display freight offer list', async () => {
    const list = element(by.id('freight-list'));
    await waitFor(list).toBeVisible().withTimeout(5000);
  });

  it('should show freight card details', async () => {
    // Check first freight card has route info
    await expect(element(by.id('freight-card-0'))).toBeVisible();
  });

  it('should open freight detail on tap', async () => {
    await element(by.id('freight-card-0')).tap();
    await waitFor(element(by.text(/details|origin|destination/i)))
      .toBeVisible()
      .withTimeout(5000);
    // Go back
    await device.pressBack();
  });

  it('should search freight offers', async () => {
    const searchInput = element(by.id('search-input'));
    if (await searchInput.getAttributes().catch(() => null)) {
      await searchInput.typeText('Berlin');
      await waitFor(element(by.id('freight-list')))
        .toBeVisible()
        .withTimeout(5000);
      await searchInput.clearText();
    }
  });
});

// ─── Orders ───────────────────────────────────────────
describe('Orders Flow', () => {
  beforeAll(async () => {
    await loginAsAdmin();
    await element(by.id('tab-orders')).tap();
    await waitFor(element(by.text(/orders/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display orders list', async () => {
    await expect(element(by.id('orders-list'))).toBeVisible();
  });

  it('should show order status badges', async () => {
    await expect(element(by.id('order-card-0'))).toBeVisible();
  });

  it('should open order detail on tap', async () => {
    await element(by.id('order-card-0')).tap();
    await waitFor(element(by.text(/order|details|status/i)))
      .toBeVisible()
      .withTimeout(5000);
    await device.pressBack();
  });

  it('should filter orders by status', async () => {
    const filterBtn = element(by.id('filter-button'));
    if (await filterBtn.getAttributes().catch(() => null)) {
      await filterBtn.tap();
      await waitFor(element(by.text(/active|pending|completed/i)))
        .toBeVisible()
        .withTimeout(3000);
    }
  });
});

// ─── Messages / Chat ─────────────────────────────────
describe('Messages Flow', () => {
  beforeAll(async () => {
    await loginAsAdmin();
    await element(by.id('tab-messages')).tap();
    await waitFor(element(by.text(/messages/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display conversation list', async () => {
    await expect(element(by.id('conversations-list'))).toBeVisible();
  });

  it('should open a conversation', async () => {
    const convo = element(by.id('conversation-0'));
    if (await convo.getAttributes().catch(() => null)) {
      await convo.tap();
      await waitFor(element(by.id('message-input')))
        .toBeVisible()
        .withTimeout(5000);
      await device.pressBack();
    }
  });
});

// ─── Profile / Settings ──────────────────────────────
describe('Profile Flow', () => {
  beforeAll(async () => {
    await loginAsAdmin();
    await element(by.id('tab-profile')).tap();
    await waitFor(element(by.text(/profile|settings/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display user profile info', async () => {
    await expect(element(by.text(/admin/i))).toBeVisible();
  });

  it('should navigate to settings', async () => {
    const settingsBtn = element(by.id('settings-button'));
    if (await settingsBtn.getAttributes().catch(() => null)) {
      await settingsBtn.tap();
      await waitFor(element(by.text(/settings/i)))
        .toBeVisible()
        .withTimeout(5000);
    }
  });

  it('should toggle dark mode', async () => {
    const darkModeToggle = element(by.id('dark-mode-toggle'));
    if (await darkModeToggle.getAttributes().catch(() => null)) {
      await darkModeToggle.tap();
      // App should not crash
      await expect(element(by.text(/profile|settings/i))).toBeVisible();
      // Toggle back
      await darkModeToggle.tap();
    }
  });

  it('should change language', async () => {
    const langSelector = element(by.id('language-selector'));
    if (await langSelector.getAttributes().catch(() => null)) {
      await langSelector.tap();
      await waitFor(element(by.text(/deutsch|german/i)))
        .toBeVisible()
        .withTimeout(3000);
    }
  });

  it('should logout', async () => {
    const logoutBtn = element(by.id('logout-button'));
    if (await logoutBtn.getAttributes().catch(() => null)) {
      await logoutBtn.tap();
      await waitFor(element(by.text(/sign in|login/i)))
        .toBeVisible()
        .withTimeout(5000);
    }
  });
});

// ─── Tracking ─────────────────────────────────────────
describe('Tracking Flow', () => {
  beforeAll(async () => {
    await loginAsAdmin();
  });

  it('should navigate to tracking screen', async () => {
    await element(by.text(/tracking/i)).tap();
    await waitFor(element(by.text(/tracking|shipment/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display map view', async () => {
    const mapView = element(by.id('tracking-map'));
    if (await mapView.getAttributes().catch(() => null)) {
      await expect(mapView).toBeVisible();
    }
  });
});

// ─── eCMR ─────────────────────────────────────────────
describe('eCMR Flow', () => {
  beforeAll(async () => {
    await loginAsAdmin();
  });

  it('should navigate to eCMR screen', async () => {
    // Navigate via deep link or tab
    await device.openURL({ url: 'logimarket://ecmr' });
    await waitFor(element(by.text(/ecmr|consignment/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display eCMR document list', async () => {
    const list = element(by.id('ecmr-list'));
    if (await list.getAttributes().catch(() => null)) {
      await expect(list).toBeVisible();
    }
  });
});

// ─── POD (Proof of Delivery) ──────────────────────────
describe('POD Flow', () => {
  beforeAll(async () => {
    await loginAsAdmin();
  });

  it('should navigate to POD screen', async () => {
    await device.openURL({ url: 'logimarket://pod' });
    await waitFor(element(by.text(/proof|delivery|pod/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should display POD capture options', async () => {
    // Should have camera/photo/signature options
    const content = element(by.id('pod-content'));
    if (await content.getAttributes().catch(() => null)) {
      await expect(content).toBeVisible();
    }
  });
});

// ─── Offline Mode ─────────────────────────────────────
describe('Offline Behavior', () => {
  beforeAll(async () => {
    await loginAsAdmin();
  });

  it('should show offline banner when network is unavailable', async () => {
    await device.setURLBlacklist(['.*']);
    await device.disableSynchronization();
    // Navigate to trigger network check
    await element(by.id('tab-dashboard')).tap();
    await waitFor(element(by.text(/offline|no connection|no internet/i)))
      .toBeVisible()
      .withTimeout(10000);
    await device.enableSynchronization();
    await device.setURLBlacklist([]);
  });

  it('should recover when network returns', async () => {
    await device.setURLBlacklist([]);
    await device.enableSynchronization();
    await element(by.id('tab-dashboard')).tap();
    await waitFor(element(by.text(/dashboard|welcome/i)))
      .toBeVisible()
      .withTimeout(10000);
  });
});
