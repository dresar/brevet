import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

const COOKIE_NAME = 'brevet_session';
const JWT_EXPIRY = '30d';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET tidak dikonfigurasi');
  return new TextEncoder().encode(secret);
}

// ============================================================
// PASSWORD HASHING
// ============================================================
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================
// JWT TOKEN
// ============================================================
export interface TokenPayload extends JWTPayload {
  sub: string;
  role: string;
}

export async function signToken(payload: {
  sub: string;
  role: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

// ============================================================
// COOKIE MANAGEMENT
// ============================================================
export function setAuthCookie(res: NextResponse, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
  });
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// ============================================================
// CURRENT USER
// ============================================================
export type UserSession = {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
};

export async function getCurrentUser(
  req: NextRequest
): Promise<UserSession | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.sub) return null;

  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    return user ?? null;
  } catch {
    return null;
  }
}

// ============================================================
// TOKEN FROM STRING (for middleware — edge-safe, no DB call)
// ============================================================
export async function verifyTokenFromCookieString(
  cookieHeader: string | null
): Promise<TokenPayload | null> {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyToken(decodeURIComponent(match[1]));
}
