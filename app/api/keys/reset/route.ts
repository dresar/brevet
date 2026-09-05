import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { asc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const runtime = 'nodejs';

// POST /api/keys/reset — reset all keys to active, reorder by createdAt
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  // Get all keys ordered by creation (stable order)
  const allKeys = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .orderBy(asc(apiKeys.createdAt));

  if (allKeys.length === 0) {
    return NextResponse.json({ ok: true, message: 'Tidak ada kunci untuk direset.' });
  }

  // Update each key: reset status + rewrite order_index 0..n
  await Promise.all(
    allKeys.map((k, i) =>
      db
        .update(apiKeys)
        .set({
          status: 'active',
          errorCount: 0,
          lastError: null,
          orderIndex: i,
          updatedAt: new Date(),
        })
        .where(sql`${apiKeys.id} = ${k.id}`)
    )
  );

  return NextResponse.json({
    ok: true,
    message: `Rotasi direset. ${allKeys.length} kunci diaktifkan kembali dan diurutkan ulang.`,
  });
}
