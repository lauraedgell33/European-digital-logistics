/**
 * IndexedDB Offline Queue — stores pending API operations when offline
 * and replays them when the connection is restored.
 */

const DB_NAME = 'logimarket_offline';
const DB_VERSION = 1;
const QUEUE_STORE = 'request_queue';
const DATA_STORE = 'offline_data';

export interface QueuedRequest {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
  type: 'freight' | 'order' | 'tracking' | 'general';
  retries: number;
}

export interface OfflineDataItem {
  key: string;
  data: unknown;
  timestamp: number;
  expiresAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(DATA_STORE)) {
        const store = db.createObjectStore(DATA_STORE, { keyPath: 'key' });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── Request Queue ────────────────────────────────────

/** Enqueue a failed request for later replay */
export async function enqueueRequest(req: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const item: Omit<QueuedRequest, 'id'> = {
      ...req,
      timestamp: Date.now(),
      retries: 0,
    };
    const request = store.add(item);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

/** Get all pending queued requests */
export async function getQueuedRequests(): Promise<QueuedRequest[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Remove a processed request from the queue */
export async function removeQueuedRequest(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/** Update retry count for a failed request */
export async function updateRetryCount(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.retries = (item.retries || 0) + 1;
        store.put(item);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/** Get queue count for display */
export async function getQueueCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Clear all queued requests */
export async function clearQueue(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ─── Offline Data Cache ───────────────────────────────

/** Cache data for offline access with expiration */
export async function cacheData(key: string, data: unknown, ttlMs: number = 3600_000): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DATA_STORE, 'readwrite');
    const store = tx.objectStore(DATA_STORE);
    const item: OfflineDataItem = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/** Get cached data if not expired */
export async function getCachedData<T = unknown>(key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DATA_STORE, 'readonly');
    const store = tx.objectStore(DATA_STORE);
    const request = store.get(key);
    request.onsuccess = () => {
      const item = request.result as OfflineDataItem | undefined;
      if (item && item.expiresAt > Date.now()) {
        resolve(item.data as T);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/** Clear expired cache entries */
export async function cleanExpiredCache(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DATA_STORE, 'readwrite');
    const store = tx.objectStore(DATA_STORE);
    const index = store.index('expiresAt');
    const range = IDBKeyRange.upperBound(Date.now());
    const request = index.openCursor(range);
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// ─── Sync Manager ─────────────────────────────────────

const MAX_RETRIES = 5;

/** Replay all queued requests — called when back online */
export async function replayQueue(): Promise<{ success: number; failed: number }> {
  const items = await getQueuedRequests();
  let success = 0;
  let failed = 0;

  for (const item of items) {
    if (item.retries >= MAX_RETRIES) {
      // Too many retries — discard
      await removeQueuedRequest(item.id!);
      failed++;
      continue;
    }

    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });

      if (response.ok || response.status < 500) {
        // Success or client error (no point retrying)
        await removeQueuedRequest(item.id!);
        success++;
      } else {
        // Server error — increment retry
        await updateRetryCount(item.id!);
        failed++;
      }
    } catch {
      // Network still down — increment retry
      await updateRetryCount(item.id!);
      failed++;
    }
  }

  return { success, failed };
}
