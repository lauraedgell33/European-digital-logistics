'use client';

import { useServiceWorker } from '@/hooks/useServiceWorker';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * Renders a banner when a new version of the app is available.
 * Clicking "Update" triggers the waiting service worker to take over
 * and reloads the page.
 */
export function UpdatePrompt() {
  const { hasUpdate, applyUpdate } = useServiceWorker();

  if (!hasUpdate) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
      role="alert"
    >
      <div
        className="flex items-center gap-3 p-4 rounded-xl shadow-lg border"
        style={{
          background: 'var(--ds-green-100)',
          borderColor: 'var(--ds-green-400)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <ArrowPathIcon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--ds-green-800)' }} />
        <p className="text-sm flex-1" style={{ color: 'var(--ds-green-900)' }}>
          A new version of LogiMarket is available.
        </p>
        <button
          onClick={applyUpdate}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          style={{
            background: 'var(--ds-green-700)',
            color: '#fff',
          }}
        >
          Update
        </button>
      </div>
    </div>
  );
}
