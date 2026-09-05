import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { sql } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/admin/health — test database connection & system status
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const startTime = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    const latency = Date.now() - startTime;

    return NextResponse.json({
      ok: true,
      database: 'connected',
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        database: 'error',
        error: err.message || 'Gagal terhubung ke database Neon.',
      },
      { status: 500 }
    );
  }
}
