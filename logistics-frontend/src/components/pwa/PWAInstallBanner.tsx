'use client';

import { usePWA } from '@/hooks/usePWA';

export function PWAInstallBanner() {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-blue-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-4 animate-slide-up">
      <div className="flex-shrink-0">
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="19" width="18" height="2" rx="1" fill="currentColor" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Install LogiMarket</p>
        <p className="text-xs text-blue-100">Get faster access & offline support</p>
      </div>
      <button
        onClick={installApp}
        className="flex-shrink-0 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
      >
        Install
      </button>
    </div>
  );
}

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-900 text-center py-1 px-4 text-sm font-medium">
      You are currently offline. Some features may be limited.
    </div>
  );
}
