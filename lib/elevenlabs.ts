import { db } from './db';
import { apiKeys } from './schema';
import { eq, sql, and, asc } from 'drizzle-orm';
import { maskApiKey } from './utils';

// ============================================================
// CONSTANTS
// ============================================================
const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech/';
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - Mature, Reassuring (Free/Premade)
const TIMEOUT_MS = 15000; // 15s timeout
const TEST_TIMEOUT_MS = 5000;
const MAX_FAILOVER_ATTEMPTS = 5;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function formatElevenLabsErrorMessage(rawError: string): string {
  if (!rawError) return 'Error tidak diketahui';
  const lower = rawError.toLowerCase();

  if (lower.includes('quota') || lower.includes('insufficient_credits') || lower.includes('429')) {
    return 'Kuota ElevenLabs habis / Limit tercapai (429)';
  }
  if (lower.includes('unauthorized') || lower.includes('401') || lower.includes('invalid api key')) {
    return 'Kunci API tidak valid (401)';
  }
  if (lower.includes('timeout') || lower.includes('abort')) {
    return 'Koneksi timeout (server sibuk)';
  }

  const clean = rawError
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return clean.length > 70 ? `${clean.slice(0, 70)}...` : clean;
}

// ============================================================
// SINGLE KEY TESTING FUNCTION (HEALTH CHECK)
// ============================================================

export async function testElevenLabsKey(
  id: string,
  keyValue: string,
  name: string
): Promise<{ id: string; name: string; ok: boolean; detail: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT_MS);

  try {
    // Test using the voices endpoint which is usually allowed for all keys
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': keyValue,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { id, name, ok: true, detail: 'Valid & aktif' };
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.detail?.status || errorData.detail?.message || `HTTP ${response.status}`;
      return { id, name, ok: false, detail: formatElevenLabsErrorMessage(errorMsg) };
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    let errorMsg = error?.message || 'Error jaringan';
    if (error.name === 'AbortError') errorMsg = 'Timeout (server lambat)';
    return { id, name, ok: false, detail: formatElevenLabsErrorMessage(errorMsg) };
  }
}

// ============================================================
// TTS GENERATION WITH SMART ROTATION
// ============================================================

export async function fetchTtsWithRotation(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<{ audioBuffer: ArrayBuffer; usedKeyId: string }> {
  // Fetch active ElevenLabs keys
  const activeKeys = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.status, 'active'), eq(apiKeys.provider, 'elevenlabs')))
    .orderBy(asc(apiKeys.orderIndex));

  if (activeKeys.length === 0) {
    throw new Error('Tidak ada kunci ElevenLabs yang aktif. Harap tambahkan kunci di menu Pengaturan > Kunci API.');
  }

  let attempt = 0;
  let lastErrorMsg = '';
  const testedKeys = new Set<string>();

  // Failover loop
  while (attempt < MAX_FAILOVER_ATTEMPTS) {
    // Re-fetch active keys in case of concurrency updates
    const currentActiveKeys = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.status, 'active'), eq(apiKeys.provider, 'elevenlabs')))
      .orderBy(asc(apiKeys.orderIndex));

    // Find the best candidate that hasn't been tested in this loop
    const candidate = currentActiveKeys.find((k) => !testedKeys.has(k.id));

    if (!candidate) {
      if (testedKeys.size === 0) {
        throw new Error('Tidak ada kunci ElevenLabs aktif yang tersedia.');
      }
      break;
    }

    testedKeys.add(candidate.id);
    attempt++;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${ELEVENLABS_TTS_URL}${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': candidate.keyValue,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        let parsedErr = errText;
        try {
          const jsonErr = JSON.parse(errText);
          parsedErr = jsonErr.detail?.message || jsonErr.detail?.status || errText;
        } catch { }
        throw new Error(parsedErr);
      }

      const arrayBuffer = await response.arrayBuffer();

      // Update success metadata
      await db
        .update(apiKeys)
        .set({
          lastUsedAt: new Date(),
          errorCount: 0,
        })
        .where(eq(apiKeys.id, candidate.id));

      return {
        audioBuffer: arrayBuffer,
        usedKeyId: candidate.id,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      const rawMsg = err.name === 'AbortError' ? 'Koneksi timeout (API terlalu lama merespons)' : err.message || 'Error jaringan';
      lastErrorMsg = formatElevenLabsErrorMessage(rawMsg);
      console.warn(`[ElevenLabs Failover] Kunci ${maskApiKey(candidate.keyValue)} gagal (${lastErrorMsg}). Mencoba kunci lain...`);

      // Demote or disable key
      const [maxResult] = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${apiKeys.orderIndex}), 0)` })
        .from(apiKeys);
      const newOrder = (maxResult?.maxOrder ?? 0) + 1;
      const currentErrors = candidate.errorCount ?? 0;

      await db
        .update(apiKeys)
        .set({
          orderIndex: newOrder,
          errorCount: currentErrors + 1,
          lastError: lastErrorMsg,
          // Disable after 3 errors
          status: currentErrors >= 2 ? 'error' : 'active',
          updatedAt: new Date(),
        })
        .where(eq(apiKeys.id, candidate.id));
    }
  }

  throw new Error(`Semua kunci ElevenLabs (${testedKeys.size}) gagal dicoba. Error terakhir: ${lastErrorMsg}`);
}
