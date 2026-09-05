import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { inArray } from 'drizzle-orm';

export const runtime = 'nodejs';

// POST /api/keys/cleanup — delete all invalid/error/disabled keys from database
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const deletedKeys = await db
      .delete(apiKeys)
      .where(inArray(apiKeys.status, ['error', 'disabled']))
      .returning({ id: apiKeys.id, name: apiKeys.name });

    return NextResponse.json({
      ok: true,
      deletedCount: deletedKeys.length,
      message: `${deletedKeys.length} kunci API yang rusak/invalid telah berhasil dihapus.`,
      deletedKeys,
    });
  } catch (err) {
    console.error('[Keys Cleanup API] Error:', err);
    return NextResponse.json(
      { error: 'Gagal membersihkan kunci API yang rusak.' },
      { status: 500 }
    );
  }
}
