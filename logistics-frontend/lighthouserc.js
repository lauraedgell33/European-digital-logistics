module.exports = {
  ci: {
    collect: {
      url: [
        'https://european-digital-logistics-oujbb00j.on-forge.com/login',
        'https://european-digital-logistics-oujbb00j.on-forge.com/',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        // Performance
        'categories:performance': ['warn', { minScore: 0.6 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.25 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
        'speed-index': ['warn', { maxNumericValue: 5000 }],

        // Accessibility
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'color-contrast': 'warn',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',
        'image-alt': 'warn',
        'label': 'warn',
        'button-name': 'warn',
        'link-name': 'warn',

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'is-on-https': 'error',
        'no-vulnerable-libraries': 'warn',

        // SEO
        'categories:seo': ['warn', { minScore: 0.8 }],
        'meta-description': 'error',
        'viewport': 'error',
        'crawlable-anchors': 'warn',
        'robots-txt': 'warn',
        'hreflang': 'warn',
        'canonical': 'warn',
        'font-size': 'warn',
        'tap-targets': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
