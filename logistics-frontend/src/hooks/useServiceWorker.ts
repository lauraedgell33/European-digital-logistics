'use client';

import { useEffect, useState, useCallback } from 'react';

interface SWState {
  isSupported: boolean;
  isRegistered: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

/**
 * Hook to register and manage the service worker lifecycle.
 * Handles registration, update detection, and forced updates.
 */
export function useServiceWorker() {
  const [state, setState] = useState<SWState>({
    isSupported: false,
    isRegistered: false,
    hasUpdate: false,
    registration: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    setState((prev) => ({ ...prev, isSupported: true }));

    async function registerSW() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setState((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Check for updates periodically (every 60 minutes)
        const updateInterval = setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        // Listen for new service worker waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New version available
              setState((prev) => ({ ...prev, hasUpdate: true }));
            }
          });
        });

        return () => clearInterval(updateInterval);
      } catch (err) {
        console.error('[SW] Registration failed:', err);
      }
    }

    registerSW();

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload to apply new version
      window.location.reload();
    });
  }, []);

  /**
   * Force the waiting service worker to activate, then reload.
   */
  const applyUpdate = useCallback(() => {
    const { registration } = state;
    if (!registration?.waiting) return;

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [state]);

  return {
    ...state,
    applyUpdate,
  };
}
