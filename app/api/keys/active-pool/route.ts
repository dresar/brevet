import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { ne } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/keys/active-pool — Sanitized pool health metrics (Zero raw key leakage)
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const keys = await db
      .select({
        id: apiKeys.id,
        provider: apiKeys.provider,
        status: apiKeys.status,
      })
      .from(apiKeys)
      .where(ne(apiKeys.status, 'disabled'));

    const totalActive = keys.filter((k) => k.status === 'active').length;
    const totalError = keys.filter((k) => k.status === 'error').length;

    return NextResponse.json({
      ok: true,
      total: keys.length,
      active: totalActive,
      error: totalError,
      hasAvailableKeys: totalActive > 0,
    });
  } catch (err: any) {
    console.error('[Active Pool API] Error:', err);
    return NextResponse.json(
      { ok: false, total: 0, active: 0, error: err.message },
      { status: 500 }
    );
  }
}
