import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './db';
import { apiKeys } from './schema';
import { eq, sql, ne, asc } from 'drizzle-orm';
import type { GeminiResult } from './module-types';

// ============================================================
// PRIMARY ENGINE CONFIG (bandelbanget.xyz OpenAI Compatible)
// ============================================================
const PRIMARY_API_ENDPOINT = 'https://bandelbanget.xyz/v1/chat/completions';
const PRIMARY_API_KEY = 'sk-proj-SANITIZED_KEY_PROTECTED';
const PRIMARY_MODEL = 'auto';

// ============================================================
// CONSTANTS & IP SPOOFING HELPERS
// ============================================================

function getRandomIP(): string {
  const octet1 = Math.floor(Math.random() * 150) + 11;
  const octet2 = Math.floor(Math.random() * 255);
  const octet3 = Math.floor(Math.random() * 255);
  const octet4 = Math.floor(Math.random() * 254) + 1;
  return `${octet1}.${octet2}.${octet3}.${octet4}`;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function getSanitizedModelName(): string {
  const raw = (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();
  const formatted = raw.toLowerCase().replace(/\s+/g, '-');
  return formatted || 'gemini-3.6-flash';
}

export function formatGeminiErrorMessage(rawError: string): string {
  if (!rawError) return 'Error tidak diketahui';
  const str = rawError.toString();
  const lower = str.toLowerCase();

  if (
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('429') ||
    lower.includes('resource_exhausted')
  ) {
    return 'Kuota/Rate limit terlampaui (429)';
  }
  if (
    lower.includes('api_key_invalid') ||
    lower.includes('key not valid') ||
    lower.includes('invalid api key')
  ) {
    return 'Kunci API tidak valid (400)';
  }
  if (lower.includes('permission_denied') || lower.includes('403') || lower.includes('service account')) {
    return 'Akses ditolak / Kunci nonaktif (403)';
  }
  if (lower.includes('not_found') || lower.includes('404') || lower.includes('is not found')) {
    return 'Model AI 404 (Ganti nama model)';
  }
  if (lower.includes('timeout') || lower.includes('abort')) {
    return 'Koneksi timeout (server sibuk)';
  }

  const clean = str
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\* Quota exceeded[^\n]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return clean.length > 70 ? `${clean.slice(0, 70)}...` : clean;
}

const TIMEOUT_MS = 10000;
const TEST_TIMEOUT_MS = 4000;
const MAX_FAILOVER_ATTEMPTS = 5;

// ============================================================
// SINGLE KEY TESTING FUNCTION (WITH IP & HEADER SPOOFING)
// ============================================================

export async function testSingleKey(
  id: string,
  keyValue: string,
  name: string
): Promise<{ id: string; name: string; ok: boolean; detail: string }> {
  const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash'];
  const ip = getRandomIP();

  const genAI = new GoogleGenerativeAI(keyValue);

  for (const targetModel of candidateModels) {
    try {
      const model = genAI.getGenerativeModel(
        { model: targetModel },
        {
          customHeaders: {
            'X-Forwarded-For': ip,
            'X-Real-IP': ip,
            'CF-Connecting-IP': ip,
            'Client-IP': ip,
            'User-Agent': getRandomUserAgent(),
          },
        }
      );

      const callPromise = model.generateContent('Ping');
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Koneksi lambat (>4s)')), TEST_TIMEOUT_MS)
      );

      const res = await Promise.race([callPromise, timeoutPromise]);
      const text = res.response.text();
      if (text) {
        return { id, name, ok: true, detail: `Kunci API valid (${targetModel})` };
      }
    } catch (err: any) {
      continue;
    }
  }

  return { id, name, ok: false, detail: 'Kunci tidak merespons (404/Timeout)' };
}

// ============================================================
// KEY MANAGEMENT UTILS
// ============================================================

async function getActiveKeys(limit = 15) {
  return await db
    .select()
    .from(apiKeys)
    .where(ne(apiKeys.status, 'disabled'))
    .orderBy(
      sql`CASE WHEN status = 'active' THEN 0 ELSE 1 END`,
      asc(apiKeys.errorCount),
      asc(apiKeys.orderIndex)
    )
    .limit(limit);
}

async function markErrorAndRotate(id: string, errMsg: string, currentErrorCount = 0): Promise<void> {
  const [maxResult] = await db
    .select({ maxOrder: sql<number>`MAX(${apiKeys.orderIndex})` })
    .from(apiKeys);

  const newOrder = (maxResult?.maxOrder ?? 0) + 1;
  const cleanErrorMsg = formatGeminiErrorMessage(errMsg);
  const isInvalid =
    errMsg.includes('API_KEY_INVALID') ||
    errMsg.includes('API key not valid');
  const newCount = currentErrorCount + 1;
  const newStatus = isInvalid || newCount >= 6 ? 'disabled' : 'error';

  await db
    .update(apiKeys)
    .set({
      status: newStatus,
      errorCount: sql`${apiKeys.errorCount} + 1`,
      lastError: cleanErrorMsg,
      lastUsedAt: new Date(),
      orderIndex: newOrder,
      updatedAt: new Date(),
    })
    .where(eq(apiKeys.id, id));
}

async function markSuccess(id: string): Promise<void> {
  await db
    .update(apiKeys)
    .set({
      status: 'active',
      errorCount: 0,
      lastError: null,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(apiKeys.id, id));
}

// ============================================================
// MAIN AI CALL (bandelbanget.xyz -> Fallback to Gemini Rotation)
// ============================================================

type GeminiCallParams = {
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  maxOutputTokens?: number;
  temperature?: number;
};

export async function callGemini(params: GeminiCallParams): Promise<GeminiResult> {
  const { systemPrompt, messages, maxOutputTokens = 3000, temperature = 0.3 } = params;

  // 1. Try Primary Engine (bandelbanget.xyz)
  try {
    const openAiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts.map((p) => p.text).join(' '),
      })),
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(PRIMARY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRIMARY_API_KEY}`,
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: openAiMessages,
        max_tokens: maxOutputTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const choice = data.choices?.[0]?.message;
      const text = choice?.content || choice?.reasoning_content;
      if (text && text.trim().length > 0) {
        return { ok: true, teks: text.trim() };
      }
    }
  } catch (primaryErr: any) {
    console.warn('[Server AI] Primary engine failed or timed out:', primaryErr.message);
  }

  // 2. Fallback to Gemini 3.6 Flash Rotation Pool
  const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash'];
  const keyPool = await getActiveKeys(MAX_FAILOVER_ATTEMPTS);
  if (!keyPool || keyPool.length === 0) {
    return {
      ok: false,
      pesan: 'Kunci cadangan Gemini tidak tersedia.',
    };
  }

  let lastErrorMessage = '';

  for (let attempt = 0; attempt < keyPool.length; attempt++) {
    const key = keyPool[attempt];
    const ip = getRandomIP();
    const genAI = new GoogleGenerativeAI(key.keyValue);

    for (const targetModel of candidateModels) {
      try {
        const model = genAI.getGenerativeModel(
          {
            model: targetModel,
            systemInstruction: systemPrompt,
            generationConfig: {
              temperature,
              maxOutputTokens,
            },
          },
          {
            customHeaders: {
              'X-Forwarded-For': ip,
              'X-Real-IP': ip,
              'CF-Connecting-IP': ip,
              'Client-IP': ip,
              'User-Agent': getRandomUserAgent(),
            },
          }
        );

        const history = messages.slice(0, -1).map((m) => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: m.parts.map((p) => ({ text: p.text })),
        }));
        const lastMessage = messages[messages.length - 1];
        const promptText = lastMessage?.parts?.[0]?.text ?? '';

        const chat = model.startChat({ history });
        const callPromise = chat.sendMessage(promptText);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Koneksi timeout (>10s)')), TIMEOUT_MS)
        );

        const response = await Promise.race([callPromise, timeoutPromise]);
        const text = response.response.text();

        if (text) {
          markSuccess(key.id).catch(() => {});
          return { ok: true, teks: text };
        }
      } catch (err: unknown) {
        const rawErrMessage = err instanceof Error ? err.message : 'Error koneksi';
        lastErrorMessage = formatGeminiErrorMessage(rawErrMessage);
        if (rawErrMessage.includes('404') || rawErrMessage.includes('not found')) {
          continue;
        }
        break;
      }
    }

    await markErrorAndRotate(key.id, lastErrorMessage, key.errorCount ?? 0);
  }

  return {
    ok: false,
    pesan: `Seluruh AI gagal. Error terakhir: ${lastErrorMessage}`,
  };
}
