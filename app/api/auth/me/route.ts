import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { count } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Try to get current user from cookie session
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ ok: true, firstRun: false, user: null, authenticated: false });
    }

    return NextResponse.json({
      ok: true,
      firstRun: false,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[me]', err);
    return NextResponse.json(
      { ok: true, firstRun: false, user: null, authenticated: false }
    );
  }
}
