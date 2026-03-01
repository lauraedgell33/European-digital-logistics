import { enqueueRequest, type QueuedRequest } from '@/lib/offlineDb';

interface FetchOptions extends RequestInit {
  /** If true, enqueue the request when offline instead of throwing */
  offlineQueue?: boolean;
  /** Tag for background sync grouping (e.g. 'sync-freight-offers') */
  syncTag?: string;
}

/**
 * Offline-aware wrapper around native `fetch`.
 *
 * For GET requests: uses standard fetch (service worker handles caching).
 * For mutation requests (POST/PUT/PATCH/DELETE) with `offlineQueue: true`:
 *   - If online → sends normally.
 *   - If offline → queues in IndexedDB and registers Background Sync.
 *   - Returns a synthetic "queued" response so callers can show optimistic UI.
 */
export async function offlineFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { offlineQueue = false, syncTag, ...fetchOptions } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();

  // GET requests are handled by the service worker cache layer
  if (method === 'GET' || !offlineQueue) {
    return fetch(url, fetchOptions);
  }

  // Mutation requests — try network first
  if (navigator.onLine) {
    try {
      return await fetch(url, fetchOptions);
    } catch {
      // Network error even though navigator.onLine was true
      // Fall through to queue
    }
  }

  // --- Offline path: queue the request ---
  const body =
    typeof fetchOptions.body === 'string'
      ? fetchOptions.body
      : fetchOptions.body instanceof FormData
        ? undefined // FormData not serialisable to IndexedDB easily
        : JSON.stringify(fetchOptions.body);

  const headersObj: Record<string, string> = {};
  if (fetchOptions.headers) {
    const h =
      fetchOptions.headers instanceof Headers
        ? Object.fromEntries((fetchOptions.headers as Headers).entries())
        : Array.isArray(fetchOptions.headers)
          ? Object.fromEntries(fetchOptions.headers)
          : (fetchOptions.headers as Record<string, string>);
    Object.assign(headersObj, h);
  }

  await enqueueRequest({
    url,
    method,
    headers: headersObj,
    body: body ?? undefined,
  });

  // Register background sync if available
  if (syncTag && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync?.register(syncTag);
    } catch {
      // Background sync not supported
    }
  }

  // Return a synthetic "accepted" response
  return new Response(
    JSON.stringify({
      queued: true,
      message: 'Request saved offline. It will be sent when you reconnect.',
    }),
    {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Convenience helpers for common API calls.
 */
export const offlineApi = {
  get(url: string, init?: RequestInit) {
    return offlineFetch(url, { ...init, method: 'GET' });
  },

  post(
    url: string,
    data?: unknown,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ) {
    return offlineFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      offlineQueue: true,
      ...options,
    });
  },

  put(
    url: string,
    data?: unknown,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ) {
    return offlineFetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      offlineQueue: true,
      ...options,
    });
  },

  patch(
    url: string,
    data?: unknown,
    options?: Omit<FetchOptions, 'method' | 'body'>
  ) {
    return offlineFetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      offlineQueue: true,
      ...options,
    });
  },

  delete(url: string, options?: Omit<FetchOptions, 'method'>) {
    return offlineFetch(url, {
      method: 'DELETE',
      offlineQueue: true,
      ...options,
    });
  },
};
