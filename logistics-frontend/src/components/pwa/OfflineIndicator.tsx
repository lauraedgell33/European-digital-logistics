'use client';

import { useState, useEffect } from 'react';
import { getQueueCount } from '@/lib/offlineDb';
import {
  SignalSlashIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      refreshPendingCount();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll pending count every 10 seconds
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 10_000);

    // Listen for sync completed event from SW
    const handleSyncDone = () => {
      setIsSyncing(false);
      refreshPendingCount();
    };
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_COMPLETE') handleSyncDone();
      if (event.data?.type === 'SYNC_START') setIsSyncing(true);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  async function refreshPendingCount() {
    try {
      const count = await getQueueCount();
      setPendingCount(count);
    } catch {
      // IndexedDB might not be available
    }
  }

  async function triggerManualSync() {
    if (!navigator.serviceWorker?.controller) return;
    setIsSyncing(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync?.register('sync-manual');
    } catch {
      // Background Sync API not available, tell SW directly
      navigator.serviceWorker.controller.postMessage({ type: 'MANUAL_SYNC' });
    }
    // Auto-clear syncing state after 15 seconds max
    setTimeout(() => setIsSyncing(false), 15_000);
  }

  // Nothing to show when online and no pending requests
  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]" role="status" aria-live="polite">
      {/* Offline banner */}
      {!isOnline && (
        <div
          className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium"
          style={{
            background: 'var(--ds-orange-700)',
            color: '#fff',
          }}
        >
          <SignalSlashIcon className="h-4 w-4" />
          <span>You are offline. Changes will sync when connection is restored.</span>
        </div>
      )}

      {/* Pending queue banner — shown when online with pending items */}
      {isOnline && pendingCount > 0 && (
        <div
          className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium"
          style={{
            background: 'var(--ds-blue-200)',
            color: 'var(--ds-blue-900)',
          }}
        >
          {isSyncing ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              <span>Syncing {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}…</span>
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="h-4 w-4" />
              <span>
                {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} to sync.
              </span>
              <button
                onClick={triggerManualSync}
                className="ml-2 underline font-semibold hover:opacity-80 transition-opacity"
              >
                Sync now
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
