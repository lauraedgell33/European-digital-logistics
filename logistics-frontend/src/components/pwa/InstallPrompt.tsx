'use client';

import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import {
  DevicePhoneMobileIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export function InstallPromptBanner() {
  const { isInstallable, install, dismiss } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-slide-up"
      role="alert"
    >
      <div
        className="flex items-center gap-3 p-4 rounded-xl shadow-lg border"
        style={{
          background: 'var(--ds-gray-100)',
          borderColor: 'var(--ds-gray-400)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <div
          className="p-2 rounded-lg flex-shrink-0"
          style={{ background: 'var(--ds-blue-200)' }}
        >
          <DevicePhoneMobileIcon className="h-6 w-6" style={{ color: 'var(--ds-blue-900)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
            Install LogiMarket
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ds-gray-700)' }}>
            Add to your home screen for quick access & offline support
          </p>
        </div>

        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          style={{
            background: 'var(--ds-blue-700)',
            color: '#fff',
          }}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Install
        </button>

        <button
          onClick={dismiss}
          className="p-1 rounded-md transition-colors flex-shrink-0"
          style={{ color: 'var(--ds-gray-700)' }}
          aria-label="Dismiss install prompt"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
