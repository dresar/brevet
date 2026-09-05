import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { createKeySchema } from '@/lib/validators';
import { maskApiKey } from '@/lib/utils';
import { asc, sql, eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/keys — list all keys (masked)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const keys = await db
    .select()
    .from(apiKeys)
    .orderBy(asc(apiKeys.orderIndex));

  // Return raw keys (unmasked) as requested by user
  const masked = keys.map((k) => ({
    ...k,
    // keyValue is sent raw so it can be edited
  }));

  // Also return count of active keys for AI chat indicator
  const ringkas = req.nextUrl.searchParams.get('ringkas');
  if (ringkas === '1') {
    return NextResponse.json({
      total: keys.length,
      active: keys.filter((k) => k.status === 'active').length,
    });
  }

  return NextResponse.json({ keys: masked });
}

// POST /api/keys — create new key
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = createKeySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data tidak valid', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Check for duplicates
  const existingKey = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyValue, parsed.data.keyValue.trim()),
  });
  if (existingKey) {
    return NextResponse.json({ error: 'Kunci API ini sudah terdaftar sebelumnya.' }, { status: 400 });
  }

  // Get current max order_index
  const [maxResult] = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${apiKeys.orderIndex}), -1)` })
    .from(apiKeys);

  const newOrder = (maxResult?.maxOrder ?? -1) + 1;

  const [newKey] = await db
    .insert(apiKeys)
    .values({
      name: parsed.data.name.trim(),
      keyValue: parsed.data.keyValue.trim(),
      provider: parsed.data.provider,
      status: 'active',
      orderIndex: newOrder,
    })
    .returning();

  return NextResponse.json({
    ok: true,
    key: newKey,
  });
}
