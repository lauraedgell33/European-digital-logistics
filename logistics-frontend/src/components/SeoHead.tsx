'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard | LogiMarket',
  '/freight': 'Freight Exchange | LogiMarket',
  '/vehicles': 'Vehicle Exchange | LogiMarket',
  '/orders': 'Transport Orders | LogiMarket',
  '/tenders': 'Tenders | LogiMarket',
  '/tracking': 'Live Tracking | LogiMarket',
  '/messages': 'Messages | LogiMarket',
  '/analytics': 'Analytics | LogiMarket',
  '/matching': 'Smart Matching | LogiMarket',
  '/networks': 'Partner Networks | LogiMarket',
  '/companies': 'Companies | LogiMarket',
  '/settings': 'Settings | LogiMarket',
};

/**
 * Client-side SEO component that updates document title and meta description
 * based on the current route. Works with client-rendered dashboard pages.
 */
export function SeoHead() {
  const pathname = usePathname();

  useEffect(() => {
    // Find the matching page title
    const matchedKey = Object.keys(pageTitles).find((key) =>
      pathname.startsWith(key)
    );

    if (matchedKey) {
      document.title = pageTitles[matchedKey];
    }

    // Update canonical link
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + pathname;
  }, [pathname]);

  return null;
}
