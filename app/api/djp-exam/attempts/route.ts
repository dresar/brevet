import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware-auth';

export const runtime = 'nodejs';

// In-memory or client-synced attempts handler
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({
    ok: true,
    message: 'DJP Attempt tracker active',
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    return NextResponse.json({
      ok: true,
      data: body,
      recordedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Gagal menyimpan attempt: ' + String(err) },
      { status: 500 }
    );
  }
}
