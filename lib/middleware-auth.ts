import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, type UserSession } from './auth';

/**
 * requireAuth — Verifies any logged in user (student or admin).
 * Returns UserSession if authenticated, or 401 response if unauthenticated.
 */
export async function requireAuth(
  req: NextRequest
): Promise<UserSession | NextResponse> {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Belum login. Silakan login terlebih dahulu.' },
      { status: 401 }
    );
  }
  return user;
}

/**
 * requireAdmin — Enforces admin role for management endpoints.
 * Returns UserSession if user.role === 'admin', or 403 response if student.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<UserSession | NextResponse> {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  if (authResult.role !== 'admin') {
    return NextResponse.json(
      { error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' },
      { status: 403 }
    );
  }

  return authResult;
}
