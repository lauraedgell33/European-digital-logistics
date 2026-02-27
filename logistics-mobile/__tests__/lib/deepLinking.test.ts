import { generateDeepLink, getRouteFromPath, DeepLinkRoute } from '@/lib/deepLinking';

describe('deepLinking', () => {
  // ── generateDeepLink ─────────────────────────────────
  describe('generateDeepLink', () => {
    it('generates order deep link', () => {
      expect(generateDeepLink({ type: 'order', id: 42 })).toBe('logimarket:///orders/42');
    });

    it('generates tender deep link', () => {
      expect(generateDeepLink({ type: 'tender', id: 7 })).toBe('logimarket:///tenders/7');
    });

    it('generates conversation deep link', () => {
      expect(generateDeepLink({ type: 'conversation', id: 99 })).toBe('logimarket:///messages/99');
    });

    it('generates tracking deep link', () => {
      expect(generateDeepLink({ type: 'tracking', shipmentId: 5 })).toBe('logimarket:///tracking/5');
    });

    it('generates marketplace deep link', () => {
      expect(generateDeepLink({ type: 'marketplace' })).toBe('logimarket:///marketplace');
    });

    it('generates dashboard deep link', () => {
      expect(generateDeepLink({ type: 'dashboard' })).toBe('logimarket:///');
    });

    it('generates profile deep link', () => {
      expect(generateDeepLink({ type: 'profile' })).toBe('logimarket:///profile');
    });

    // Universal links
    it('generates universal order link', () => {
      expect(generateDeepLink({ type: 'order', id: 42 }, true)).toBe(
        'https://app.logimarket.eu/orders/42'
      );
    });

    it('generates universal tender link', () => {
      expect(generateDeepLink({ type: 'tender', id: 7 }, true)).toBe(
        'https://app.logimarket.eu/tenders/7'
      );
    });

    it('generates universal conversation link', () => {
      expect(generateDeepLink({ type: 'conversation', id: 99 }, true)).toBe(
        'https://app.logimarket.eu/messages/99'
      );
    });

    it('generates universal tracking link', () => {
      expect(generateDeepLink({ type: 'tracking', shipmentId: 5 }, true)).toBe(
        'https://app.logimarket.eu/tracking/5'
      );
    });

    it('generates universal marketplace link', () => {
      expect(generateDeepLink({ type: 'marketplace' }, true)).toBe(
        'https://app.logimarket.eu/marketplace'
      );
    });

    it('generates universal dashboard link', () => {
      expect(generateDeepLink({ type: 'dashboard' }, true)).toBe('https://app.logimarket.eu/');
    });

    it('generates universal profile link', () => {
      expect(generateDeepLink({ type: 'profile' }, true)).toBe(
        'https://app.logimarket.eu/profile'
      );
    });
  });

  // ── getRouteFromPath ─────────────────────────────────
  describe('getRouteFromPath', () => {
    it('parses order path', () => {
      expect(getRouteFromPath('/orders/42')).toEqual({ type: 'order', id: 42 });
    });

    it('parses order path without leading slash', () => {
      expect(getRouteFromPath('orders/100')).toEqual({ type: 'order', id: 100 });
    });

    it('parses tender path', () => {
      expect(getRouteFromPath('/tenders/7')).toEqual({ type: 'tender', id: 7 });
    });

    it('parses messages path as conversation', () => {
      expect(getRouteFromPath('/messages/99')).toEqual({ type: 'conversation', id: 99 });
    });

    it('parses tracking path', () => {
      expect(getRouteFromPath('/tracking/5')).toEqual({ type: 'tracking', shipmentId: 5 });
    });

    it('parses marketplace path', () => {
      expect(getRouteFromPath('/marketplace')).toEqual({ type: 'marketplace' });
    });

    it('parses profile path', () => {
      expect(getRouteFromPath('/profile')).toEqual({ type: 'profile' });
    });

    it('parses root path as dashboard', () => {
      expect(getRouteFromPath('/')).toEqual({ type: 'dashboard' });
    });

    it('parses empty string as dashboard', () => {
      expect(getRouteFromPath('')).toEqual({ type: 'dashboard' });
    });

    it('returns null for unknown path', () => {
      expect(getRouteFromPath('/unknown/route')).toBeNull();
    });

    it('returns null for completely unrelated path', () => {
      expect(getRouteFromPath('/settings/notifications')).toBeNull();
    });
  });
});
