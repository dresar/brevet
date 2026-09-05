import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { testSingleKey } from '@/lib/gemini';
import { testElevenLabsKey } from '@/lib/elevenlabs';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST /api/keys/test — lightning fast health check for single key or all keys
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  let targetKeyId: string | null = req.nextUrl.searchParams.get('id');
  if (!targetKeyId) {
    try {
      const body = await req.json();
      if (body?.id) targetKeyId = body.id;
    } catch {
      // Body empty or not JSON -> test all keys
    }
  }

  const allKeys = await db.select().from(apiKeys);
  if (allKeys.length === 0) {
    return NextResponse.json({ ok: true, results: [] });
  }

  const keysToTest = targetKeyId
    ? allKeys.filter((k) => k.id === targetKeyId)
    : allKeys;

  if (keysToTest.length === 0) {
    return NextResponse.json({ error: 'Kunci API tidak ditemukan.' }, { status: 404 });
  }

  // Fast chunked testing (18 parallel requests per batch) -> completes 54 keys in ~1.5 - 2 seconds!
  const BATCH_SIZE = 18;
  const results: Array<{ id: string; name: string; ok: boolean; detail: string }> = [];

  for (let i = 0; i < keysToTest.length; i += BATCH_SIZE) {
    const chunk = keysToTest.slice(i, i + BATCH_SIZE);
    const chunkResults = await Promise.all(
      chunk.map(async (k) => {
        if (k.provider === 'elevenlabs') {
          return testElevenLabsKey(k.id, k.keyValue, k.name);
        } else if (k.provider === 'cloudinary') {
          try {
            const config = JSON.parse(k.keyValue);
            if (!config.cloud_name || !config.api_key || !config.api_secret) {
              return { id: k.id, name: k.name, ok: false, detail: 'Format kredensial tidak valid' };
            }
            // Simple ping to verify cloudinary
            const authHeader = 'Basic ' + Buffer.from(`${config.api_key}:${config.api_secret}`).toString('base64');
            const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloud_name}/ping`, {
              headers: { Authorization: authHeader }
            });
            if (res.ok) {
              return { id: k.id, name: k.name, ok: true, detail: 'Kredensial Cloudinary valid' };
            } else {
              return { id: k.id, name: k.name, ok: false, detail: 'Kredensial ditolak (Unauthorized)' };
            }
          } catch (e) {
            return { id: k.id, name: k.name, ok: false, detail: 'Gagal membaca kredensial (Corrupted)' };
          }
        }
        return testSingleKey(k.id, k.keyValue, k.name);
      })
    );
    results.push(...chunkResults);
  }

  // Update status in database for tested keys
  await Promise.all(
    results.map((result) =>
      db
        .update(apiKeys)
        .set(
          result.ok
            ? {
                status: 'active',
                errorCount: 0,
                lastError: null,
                updatedAt: new Date(),
              }
            : {
                // If it's just a slow response (>3.5s), keep active status
                status: result.detail.includes('lambat') || result.detail.includes('Timeout') ? 'active' : 'error',
                errorCount: (allKeys.find((k) => k.id === result.id)?.errorCount ?? 0) + 1,
                lastError: result.detail,
                updatedAt: new Date(),
              }
        )
        .where(eq(apiKeys.id, result.id))
    )
  );

  return NextResponse.json({
    ok: true,
    results: results.map((r) => ({
      id: r.id,
      name: r.name,
      ok: r.ok,
      detail: r.detail,
    })),
    summary: {
      total: results.length,
      berhasil: results.filter((r) => r.ok).length,
      gagal: results.filter((r) => !r.ok).length,
    },
  });
}
