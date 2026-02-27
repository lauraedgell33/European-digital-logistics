'use client';

import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SCRIPT_ID = 'recaptcha-v3-script';

/**
 * Hook for Google reCAPTCHA v3 integration.
 * Loads the script lazily and provides an `execute` function
 * that returns the reCAPTCHA token for a given action.
 *
 * Usage:
 *   const { execute } = useRecaptcha();
 *   const token = await execute('login');
 */
export function useRecaptcha() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
  const isEnabled = !!siteKey;
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!isEnabled || scriptLoaded.current) return;

    // Check if script already exists
    if (document.getElementById(RECAPTCHA_SCRIPT_ID)) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    scriptLoaded.current = true;
  }, [isEnabled, siteKey]);

  const execute = useCallback(
    async (action: string): Promise<string | null> => {
      if (!isEnabled) return null;

      return new Promise((resolve) => {
        if (!window.grecaptcha) {
          resolve(null);
          return;
        }

        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(siteKey, { action });
            resolve(token);
          } catch {
            resolve(null);
          }
        });
      });
    },
    [isEnabled, siteKey]
  );

  return { execute, isEnabled };
}
