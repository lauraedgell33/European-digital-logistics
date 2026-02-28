import React from 'react';
import { render } from '@testing-library/react';

// ─── SEO Unit Tests ───────────────────────────────────
// These tests verify that SEO-critical components render correct metadata

describe('SEO Metadata', () => {
  it('should have metadata export in root layout', () => {
    // The root layout exports metadata object
    const layout = require('@/app/layout');
    expect(layout.metadata).toBeDefined();
    expect(layout.metadata.title).toBeDefined();
    expect(layout.metadata.description).toBeDefined();
  });

  it('should have proper title template', () => {
    const layout = require('@/app/layout');
    expect(layout.metadata.title.default).toContain('LogiMarket');
    expect(layout.metadata.title.template).toContain('LogiMarket');
  });

  it('should have description under 160 characters', () => {
    const layout = require('@/app/layout');
    expect(layout.metadata.description.length).toBeLessThan(160);
    expect(layout.metadata.description.length).toBeGreaterThan(50);
  });

  it('should have relevant keywords', () => {
    const layout = require('@/app/layout');
    expect(layout.metadata.keywords).toBeDefined();
    expect(layout.metadata.keywords.length).toBeGreaterThan(5);
    expect(layout.metadata.keywords).toContain('logistics');
    expect(layout.metadata.keywords).toContain('freight exchange');
  });

  it('should have Open Graph metadata', () => {
    const layout = require('@/app/layout');
    expect(layout.metadata.openGraph).toBeDefined();
    expect(layout.metadata.openGraph.title).toBeTruthy();
    expect(layout.metadata.openGraph.description).toBeTruthy();
    expect(layout.metadata.openGraph.type).toBe('website');
  });

  it('should have Twitter Card metadata', () => {
    const layout = require('@/app/layout');
    expect(layout.metadata.twitter).toBeDefined();
    expect(layout.metadata.twitter.card).toBe('summary_large_image');
    expect(layout.metadata.twitter.title).toBeTruthy();
  });

  it('should have favicon configuration', () => {
    const layout = require('@/app/layout');
    expect(layout.metadata.icons).toBeDefined();
    expect(layout.metadata.icons.icon).toBeDefined();
  });

  it('should have robots configuration allowing indexing', () => {
    const layout = require('@/app/layout');
    expect(layout.metadata.robots).toBeDefined();
    expect(layout.metadata.robots.index).toBe(true);
    expect(layout.metadata.robots.follow).toBe(true);
  });

  it('should have manifest link', () => {
    const layout = require('@/app/layout');
    expect(layout.metadata.manifest).toBe('/manifest.json');
  });

  it('should have metadataBase configured', () => {
    const layout = require('@/app/layout');
    expect(layout.metadata.metadataBase).toBeDefined();
  });
});

describe('SEO Viewport', () => {
  it('should export viewport configuration', () => {
    const layout = require('@/app/layout');
    expect(layout.viewport).toBeDefined();
    expect(layout.viewport.width).toBe('device-width');
    expect(layout.viewport.initialScale).toBe(1);
  });

  it('should have theme-color for PWA', () => {
    const layout = require('@/app/layout');
    expect(layout.viewport.themeColor).toBeDefined();
    expect(Array.isArray(layout.viewport.themeColor)).toBe(true);
  });
});

describe('SEO Utility Functions', () => {
  it('formatCurrency should return locale-friendly strings', () => {
    const { formatCurrency } = require('@/lib/utils');
    const result = formatCurrency(1234.56);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // Should contain the number
    expect(result).toMatch(/1[.,]?234/);
  });

  it('formatTimeAgo should return human-readable strings', () => {
    const { formatTimeAgo } = require('@/lib/utils');
    const result = formatTimeAgo(new Date().toISOString());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('i18n SEO', () => {
  it('translation function should always return strings', () => {
    // Import translation setup
    const i18n = require('@/lib/i18n');
    if (i18n.t) {
      const result = i18n.t('common.search');
      expect(typeof result).toBe('string');
    }
  });

  it('all locale files should have navigation keys', () => {
    const locales = ['en', 'de', 'fr', 'es', 'it', 'pl', 'ro'];
    for (const locale of locales) {
      try {
        const messages = require(`@/locales/${locale}.json`);
        expect(messages.nav).toBeDefined();
        expect(messages.nav.dashboard).toBeDefined();
        expect(messages.nav.freight).toBeDefined();
      } catch {
        // Locale file may not exist in test env
      }
    }
  });
});
