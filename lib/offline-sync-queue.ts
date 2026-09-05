/**
 * Brevet AB & DJP Tax Platform — Offline-First Sync Queue
 * Enqueues progress mutations and exam attempts in localStorage when offline,
 * and automatically synchronizes with server endpoints when connectivity resumes.
 */

export interface SyncItem {
  id: string;
  type: 'section_progress' | 'quiz_attempt' | 'djp_attempt';
  payload: any;
  queuedAt: string;
  retryCount: number;
}

const STORAGE_KEY = 'brevet_offline_sync_queue';

/**
 * Retrieve the current offline queue from localStorage
 */
export function getSyncQueue(): SyncItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[OfflineSync] Failed to read sync queue:', err);
    return [];
  }
}

/**
 * Save sync queue items to localStorage
 */
function saveSyncQueue(queue: SyncItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[OfflineSync] Failed to save sync queue:', err);
  }
}

/**
 * Enqueue a new mutation to be synced when online
 */
export function enqueueSyncItem(
  type: SyncItem['type'],
  payload: any
): SyncItem {
  const item: SyncItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    payload,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  };

  const queue = getSyncQueue();
  queue.push(item);
  saveSyncQueue(queue);

  // Attempt sync immediately if online
  if (typeof window !== 'undefined' && window.navigator.onLine) {
    flushSyncQueue().catch((err) =>
      console.warn('[OfflineSync] Immediate sync attempt failed, will retry on online event:', err)
    );
  }

  return item;
}

/**
 * Remove a specific item from the queue
 */
export function removeSyncItem(id: string): void {
  const queue = getSyncQueue().filter((item) => item.id !== id);
  saveSyncQueue(queue);
}

/**
 * Clear the entire sync queue
 */
export function clearSyncQueue(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[OfflineSync] Failed to clear sync queue:', err);
  }
}

/**
 * Synchronize a single item with the respective backend endpoint
 */
async function syncItemToServer(item: SyncItem): Promise<boolean> {
  let endpoint = '';
  if (item.type === 'section_progress') {
    endpoint = '/api/user/progress';
  } else if (item.type === 'quiz_attempt') {
    endpoint = '/api/user/quiz-attempts';
  } else if (item.type === 'djp_attempt') {
    endpoint = '/api/user/djp-attempts';
  } else {
    return false;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.payload),
    });

    if (!res.ok && item.type === 'section_progress') {
      // Fallback for section progress if /api/user/progress returns 404 or alternate format
      const fallbackRes = await fetch('/api/belajar/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });
      return fallbackRes.ok;
    }

    return res.ok;
  } catch (err) {
    console.error(`[OfflineSync] Sync failed for ${item.type}:`, err);
    return false;
  }
}

/**
 * Flush and synchronize all pending items in the queue
 */
export async function flushSyncQueue(): Promise<{
  total: number;
  synced: number;
  failed: number;
}> {
  const queue = getSyncQueue();
  if (queue.length === 0) {
    return { total: 0, synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;
  const remaining: SyncItem[] = [];

  for (const item of queue) {
    try {
      const success = await syncItemToServer(item);
      if (success) {
        synced++;
      } else {
        item.retryCount += 1;
        if (item.retryCount < 5) {
          remaining.push(item);
        }
        failed++;
      }
    } catch {
      item.retryCount += 1;
      if (item.retryCount < 5) {
        remaining.push(item);
      }
      failed++;
    }
  }

  saveSyncQueue(remaining);

  if (synced > 0) {
    // Notify window components that sync occurred
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('brevet:offline-synced', {
          detail: { synced, remaining: remaining.length },
        })
      );
    }
  }

  return { total: queue.length, synced, failed };
}

/**
 * Initialize automatic background sync listener for the online event
 */
export function initOfflineSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    console.info('[OfflineSync] Device back online. Flushing queue...');
    flushSyncQueue().catch((e) => console.error('[OfflineSync] Flush error on online event:', e));
  };

  window.addEventListener('online', handleOnline);

  // Initial check if online
  if (window.navigator.onLine) {
    flushSyncQueue().catch(() => {});
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
