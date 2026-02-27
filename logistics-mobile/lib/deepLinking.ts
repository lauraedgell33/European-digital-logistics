/**
 * Deep linking configuration for LogiMarket mobile app.
 * 
 * Supported URL patterns:
 * - logimarket://orders/:id → Opens order detail
 * - logimarket://marketplace → Opens marketplace tab
 * - logimarket://tenders/:id → Opens tender detail
 * - logimarket://messages/:id → Opens conversation
 * - logimarket://tracking/:shipmentId → Opens tracking modal
 * 
 * Universal links (for production):
 * - https://app.logimarket.eu/orders/:id
 * - https://app.logimarket.eu/tenders/:id
 * - etc.
 * 
 * Expo Router handles deep linking automatically via the file-based routing.
 * The scheme "logimarket" is configured in app.json.
 * 
 * This file provides utilities for generating and parsing deep links.
 */

const SCHEME = 'logimarket';
const UNIVERSAL_PREFIX = 'https://app.logimarket.eu';

export type DeepLinkRoute =
  | { type: 'order'; id: number }
  | { type: 'tender'; id: number }
  | { type: 'conversation'; id: number }
  | { type: 'tracking'; shipmentId: number }
  | { type: 'marketplace' }
  | { type: 'dashboard' }
  | { type: 'profile' };

export function generateDeepLink(route: DeepLinkRoute, universal = false): string {
  const prefix = universal ? UNIVERSAL_PREFIX : `${SCHEME}://`;

  switch (route.type) {
    case 'order':
      return `${prefix}/orders/${route.id}`;
    case 'tender':
      return `${prefix}/tenders/${route.id}`;
    case 'conversation':
      return `${prefix}/messages/${route.id}`;
    case 'tracking':
      return `${prefix}/tracking/${route.shipmentId}`;
    case 'marketplace':
      return `${prefix}/marketplace`;
    case 'dashboard':
      return `${prefix}/`;
    case 'profile':
      return `${prefix}/profile`;
  }
}

export function getRouteFromPath(path: string): DeepLinkRoute | null {
  const cleaned = path.replace(/^\//, '');

  const orderMatch = cleaned.match(/^orders\/(\d+)/);
  if (orderMatch) return { type: 'order', id: parseInt(orderMatch[1], 10) };

  const tenderMatch = cleaned.match(/^tenders\/(\d+)/);
  if (tenderMatch) return { type: 'tender', id: parseInt(tenderMatch[1], 10) };

  const messageMatch = cleaned.match(/^messages\/(\d+)/);
  if (messageMatch) return { type: 'conversation', id: parseInt(messageMatch[1], 10) };

  const trackingMatch = cleaned.match(/^tracking\/(\d+)/);
  if (trackingMatch) return { type: 'tracking', shipmentId: parseInt(trackingMatch[1], 10) };

  if (cleaned.startsWith('marketplace')) return { type: 'marketplace' };
  if (cleaned.startsWith('profile')) return { type: 'profile' };
  if (cleaned === '' || cleaned === '/') return { type: 'dashboard' };

  return null;
}
