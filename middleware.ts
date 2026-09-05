import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify, type JWTPayload } from 'jose';

const COOKIE_NAME = 'brevet_session';

// Public paths that never require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/belajar',
  '/ujian-djp',
  '/tools/kalkulator',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/setup',
  '/api/auth/me',
  '/api/djp-exam',
];

interface SessionPayload extends JWTPayload {
  sub: string;
  role: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return new TextEncoder().encode('fallback-secret-for-dev-development-only-minimum-32-characters');
  }
  return new TextEncoder().encode(secret);
}

async function verifyEdgeToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  // 1. Check cookie
  const cookieVal = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieVal) {
    const session = await verifyEdgeToken(cookieVal);
    if (session) return session;
  }

  // 2. Check Authorization header (Bearer token)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    const session = await verifyEdgeToken(bearerToken);
    if (session) return session;
  }

  // 3. Fallback: Parse raw Cookie header string
  const rawCookie = req.headers.get('cookie');
  if (rawCookie) {
    const match = rawCookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (match) {
      const session = await verifyEdgeToken(decodeURIComponent(match[1]));
      if (session) return session;
    }
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSession(req);

  // 1. Redirect logged-in users away from /login & /register
  if (pathname === '/login' || pathname === '/register') {
    if (session) {
      if (session.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 2. Guard /admin/* routes — ONLY for role === 'admin'
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'admin') {
      // Regular user trying to enter admin panel -> redirect to user dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 3. Guard /dashboard/* and /profil/* routes — Any authenticated user
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profil')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Public paths and static assets pass through
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/api/belajar')
  ) {
    return NextResponse.next();
  }

  // 5. Protected API routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!session) {
      return NextResponse.json(
        { error: 'Belum login. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }
    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.webmanifest|sw.js).*)',
  ],
};
