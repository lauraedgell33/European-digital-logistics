let Sentry: any;

try {
  Sentry = require('@sentry/react-native');
} catch {
  // @sentry/react-native not installed yet — provide stubs
  Sentry = {
    init: () => {},
    captureException: (e: unknown) => console.error('[Sentry stub]', e),
    captureMessage: (m: string) => console.warn('[Sentry stub]', m),
  };
}

export function initSentry() {
  if (Sentry?.init) {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
      enabled: !__DEV__,
      tracesSampleRate: 0.2,
      environment: __DEV__ ? 'development' : 'production',
    });
  }
}

export { Sentry };
