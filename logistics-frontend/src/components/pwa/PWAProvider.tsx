'use client';

import { OfflineIndicator } from './OfflineIndicator';
import { InstallPromptBanner } from './InstallPrompt';
import { UpdatePrompt } from './UpdatePrompt';
import { useServiceWorker } from '@/hooks/useServiceWorker';

/**
 * Client-side PWA provider that registers the service worker
 * and renders offline/install/update UI overlays.
 * Drop this into any layout to enable full PWA support.
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  // Registers the service worker and detects updates
  useServiceWorker();

  return (
    <>
      <OfflineIndicator />
      {children}
      <InstallPromptBanner />
      <UpdatePrompt />
    </>
  );
}
