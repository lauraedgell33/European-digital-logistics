import * as SentryRN from '@sentry/react-native';

/**
 * Initialize Sentry for React Native with full APM.
 * Performance tracing, profiling, and error monitoring.
 */
export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

  if (!dsn || __DEV__) {
    return;
  }

  SentryRN.init({
    dsn,
    enabled: !__DEV__,
    environment: __DEV__ ? 'development' : 'production',

    // Performance Monitoring
    tracesSampleRate: 0.2,
    profilesSampleRate: 0.1,

    // Enable automatic instrumentation
    enableAutoPerformanceTracing: true,
    enableAutoSessionTracking: true,

    // App start & slow/frozen frames tracking
    enableAppStartTracking: true,
    enableNativeFramesTracking: true,
    enableStallTracking: true,

    // Breadcrumbs
    enableCaptureFailedRequests: true,
    maxBreadcrumbs: 100,

    // Release tracking
    release: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    dist: process.env.EXPO_PUBLIC_BUILD_NUMBER || '1',

    // Filter out noisy errors
    beforeSend(event) {
      // Skip network errors in development
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }
      return event;
    },
  });
}

/**
 * Wrap the root component with Sentry's error boundary.
 */
export const SentryWrap = SentryRN.wrap;

/**
 * Create a navigation integration for React Navigation performance tracing.
 */
export const routingInstrumentation = new SentryRN.ReactNavigationInstrumentation();

export const Sentry = SentryRN;
