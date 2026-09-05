/**
 * Brevet AB Hub — Comprehensive Offline Cache & Storage Manager (v3)
 */

const MAIN_CACHE_NAME = 'brevet-ab-v3';
const DATA_CACHE_NAME = 'brevet-data-v3';
const RUNTIME_CACHE_NAME = 'brevet-runtime-v3';
const AUDIO_CACHE_NAME = 'brevet-audio-cache-v1';

export interface CacheStats {
  supported: boolean;
  totalCachedItems: number;
  estimatedSizeMB: number;
}

/**
 * Downloads an audio file and stores it in the Cache API.
 */
export async function downloadModuleAudio(url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const existing = await cache.match(url);
    if (existing) return true;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    await cache.put(url, response);
    return true;
  } catch (error) {
    console.error('Failed to cache audio:', error);
    return false;
  }
}

/**
 * Checks if a specific audio URL is available in the Cache API.
 */
export async function checkIsAudioDownloaded(url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(url);
    return !!response;
  } catch (error) {
    return false;
  }
}

/**
 * Gets a blob URL for the cached audio so it can be played directly
 */
export async function getCachedAudioUrl(url: string): Promise<string | null> {
  if (typeof window === 'undefined' || !('caches' in window)) return null;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(url);
    if (!response) return null;

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    return null;
  }
}

/**
 * Caches a complete module for 100% offline usage on Mobile/Desktop PWA:
 * - Module Content JSON API (/api/belajar/[slug])
 * - Module Glossary API (/api/admin/glossary?moduleSlug=[slug])
 * - HTML Page Route (/belajar/[slug])
 */
export async function cacheModuleOffline(slug: string, urlAudio?: string | null): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  try {
    const dataCache = await caches.open(DATA_CACHE_NAME);
    const mainCache = await caches.open(MAIN_CACHE_NAME);

    // 1. Cache module detail API
    const modRes = await fetch(`/api/belajar/${slug}`);
    if (modRes.ok) {
      await dataCache.put(`/api/belajar/${slug}`, modRes.clone());
    }

    // 2. Cache module glossary API
    const gloRes = await fetch(`/api/admin/glossary?moduleSlug=${slug}`);
    if (gloRes.ok) {
      await dataCache.put(`/api/admin/glossary?moduleSlug=${slug}`, gloRes.clone());
    }

    // 3. Cache HTML page
    const pageRes = await fetch(`/belajar/${slug}`);
    if (pageRes.ok) {
      await mainCache.put(`/belajar/${slug}`, pageRes.clone());
    }

    // 4. Cache audio if provided
    if (urlAudio) {
      await downloadModuleAudio(urlAudio);
    }

    return true;
  } catch (err) {
    console.error(`[Offline Manager] Failed to cache module ${slug}:`, err);
    return false;
  }
}

/**
 * Pre-caches all essential learning tools & exams for offline usage:
 * - /tools/kalkulator
 * - /ujian-djp
 * - /belajar
 */
export async function cacheAllToolsOffline(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  try {
    const mainCache = await caches.open(MAIN_CACHE_NAME);
    const routes = ['/', '/belajar', '/tools/kalkulator', '/ujian-djp', '/belajar/simulasi-djp'];

    await Promise.all(
      routes.map(async (r) => {
        try {
          const res = await fetch(r);
          if (res.ok) await mainCache.put(r, res);
        } catch (e) {}
      })
    );

    return true;
  } catch (err) {
    console.error('[Offline Manager] Failed to cache tools offline:', err);
    return false;
  }
}

/**
 * Gets offline storage and cache statistics
 */
export async function getOfflineCacheStats(): Promise<CacheStats> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { supported: false, totalCachedItems: 0, estimatedSizeMB: 0 };
  }

  try {
    let totalItems = 0;
    const cacheNames = [MAIN_CACHE_NAME, DATA_CACHE_NAME, RUNTIME_CACHE_NAME, AUDIO_CACHE_NAME];

    for (const name of cacheNames) {
      if (await caches.has(name)) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        totalItems += keys.length;
      }
    }

    let estimatedSizeMB = 0;
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage) {
        estimatedSizeMB = Math.round((estimate.usage / (1024 * 1024)) * 100) / 100;
      }
    }

    return {
      supported: true,
      totalCachedItems: totalItems,
      estimatedSizeMB,
    };
  } catch (e) {
    return { supported: true, totalCachedItems: 0, estimatedSizeMB: 0 };
  }
}

/**
 * Clears all cached offline data
 */
export async function clearAllOfflineCache(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    return true;
  } catch (err) {
    console.error('[Offline Manager] Clear cache error:', err);
    return false;
  }
}
