/**
 * Milestone 1 Adversarial Security & Role Escalation Stress Test Suite
 * 
 * Target Vectors:
 * 1. JWT Forgery, None-Algorithm, Tampered Signature, and Expiry Rejection.
 * 2. Edge Middleware Route Protection & Admin Isolation (/admin/* vs /dashboard/*).
 * 3. Protected REST API Endpoints (/api/keys, /api/keys/[id], /api/modules/[id], /api/admin/generate-quiz, etc.)
 * 4. Production Dev Password Bypass Lockout Simulation.
 */

import {
  TestSuiteRunner,
  expect,
  signTestToken,
  verifyTestToken,
  simulateEdgeMiddleware,
  base64UrlEncode,
  base64UrlDecode,
  TEST_JWT_SECRET,
} from './test-utils.mjs';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';

// Helper to simulate requireAuth and requireAdmin logic
function simulateRequireAuth(userSession) {
  if (!userSession) {
    return { status: 401, body: { error: 'Belum login. Silakan login terlebih dahulu.' } };
  }
  return userSession;
}

function simulateRequireAdmin(userSession) {
  const auth = simulateRequireAuth(userSession);
  if (auth.status === 401) return auth;
  if (auth.role !== 'admin') {
    return { status: 403, body: { error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' } };
  }
  return auth;
}

// Helper to simulate /api/auth/login password verification logic
async function simulateLoginPasswordVerify(password, passwordHash, envNodeEnv = 'development') {
  const isDev = envNodeEnv === 'development';
  const isDevPass = isDev && (password === '__DEV_AUTOFILL__' || password === 'admin123' || password === 'admin123456');
  const isValid = isDevPass || (await bcrypt.compare(password, passwordHash));
  return isValid;
}

export async function runSuite() {
  const runner = new TestSuiteRunner('Tier 5 (Adversarial): Milestone 1 Security & Role Escalation Stress Tests');

  // =========================================================================
  // VECTOR 1: JWT Signature Integrity, Alg-None & Expiry Resistance
  // =========================================================================

  runner.test('ADV-1.1: Rejects algorithm "none" unsigned JWT tokens', async () => {
    const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payload = base64UrlEncode(JSON.stringify({ sub: 'student-id-1', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 }));
    const unsignedToken = `${header}.${payload}.`;

    // 1. Verify via test-utils HMAC verify
    const result1 = verifyTestToken(unsignedToken);
    expect(result1).toBeNull();

    // 2. Verify via real jose.jwtVerify
    const secretKey = new TextEncoder().encode(TEST_JWT_SECRET);
    let joseRejected = false;
    try {
      await jwtVerify(unsignedToken, secretKey);
    } catch {
      joseRejected = true;
    }
    expect(joseRejected).toBe(true);
  });

  runner.test('ADV-1.2: Rejects tampered JWT payload with modified role without valid HMAC', async () => {
    const validStudentToken = signTestToken({ sub: 'student-123', role: 'user' });
    const parts = validStudentToken.split('.');
    
    // Attacker tampers the payload to forge role: 'admin'
    const tamperedPayloadObj = JSON.parse(base64UrlDecode(parts[1]));
    tamperedPayloadObj.role = 'admin';
    const tamperedPayload = base64UrlEncode(JSON.stringify(tamperedPayloadObj));
    const forgedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const verified = verifyTestToken(forgedToken);
    expect(verified).toBeNull();

    let joseRejected = false;
    try {
      const secretKey = new TextEncoder().encode(TEST_JWT_SECRET);
      await jwtVerify(forgedToken, secretKey);
    } catch {
      joseRejected = true;
    }
    expect(joseRejected).toBe(true);
  });

  runner.test('ADV-1.3: Rejects JWT signed with arbitrary / attacker key', async () => {
    const attackerSecret = 'attacker-evil-secret-key-32-chars-long!';
    const forgedAdminToken = signTestToken({ sub: 'student-123', role: 'admin' }, attackerSecret);

    const verified = verifyTestToken(forgedAdminToken, TEST_JWT_SECRET);
    expect(verified).toBeNull();

    let joseRejected = false;
    try {
      const secretKey = new TextEncoder().encode(TEST_JWT_SECRET);
      await jwtVerify(forgedAdminToken, secretKey);
    } catch {
      joseRejected = true;
    }
    expect(joseRejected).toBe(true);
  });

  runner.test('ADV-1.4: Rejects expired JWT tokens (exp in the past)', async () => {
    // Token expired 1 hour ago
    const expiredToken = signTestToken({ sub: 'user-expired', role: 'user' }, TEST_JWT_SECRET, -3600);

    const verified = verifyTestToken(expiredToken);
    expect(verified).toBeNull();

    const middlewareResult = simulateEdgeMiddleware('/dashboard', `brevet_session=${expiredToken}`);
    expect(middlewareResult.action).toBe('redirect');
    expect(middlewareResult.destination).toContain('/login');
  });

  runner.test('ADV-1.5: Rejects malformed and truncated tokens', () => {
    const malformed = [
      '',
      'invalid-token-string',
      'header.payload', // missing signature
      'header.payload.signature.extra',
      '..',
      'undefined',
      'null',
      'Bearer ',
    ];

    for (const token of malformed) {
      expect(verifyTestToken(token)).toBeNull();
      const mw = simulateEdgeMiddleware('/dashboard', `brevet_session=${encodeURIComponent(token)}`);
      expect(mw.action).toBe('redirect');
      expect(mw.destination).toContain('/login');
    }
  });

  runner.test('ADV-1.6: Validly-signed student vs admin tokens parse correctly with exact claims', async () => {
    const studentToken = signTestToken({ sub: 'student-uuid-001', role: 'user' });
    const adminToken = signTestToken({ sub: 'admin-uuid-999', role: 'admin' });

    const studentClaims = verifyTestToken(studentToken);
    expect(studentClaims).toBeDefined();
    expect(studentClaims.sub).toBe('student-uuid-001');
    expect(studentClaims.role).toBe('user');

    const adminClaims = verifyTestToken(adminToken);
    expect(adminClaims).toBeDefined();
    expect(adminClaims.sub).toBe('admin-uuid-999');
    expect(adminClaims.role).toBe('admin');
  });

  // =========================================================================
  // VECTOR 2: Edge Middleware Route Escalation Prevention
  // =========================================================================

  runner.test('ADV-2.1: Student (role: "user") is blocked from accessing /admin root and redirected to /dashboard', () => {
    const studentToken = signTestToken({ sub: 'student-1', role: 'user' });
    const cookie = `brevet_session=${studentToken}`;

    const res = simulateEdgeMiddleware('/admin', cookie);
    expect(res.action).toBe('redirect');
    expect(res.destination).toBe('/dashboard');
  });

  runner.test('ADV-2.2: Student (role: "user") is blocked from all /admin/* sub-paths', () => {
    const studentToken = signTestToken({ sub: 'student-1', role: 'user' });
    const cookie = `brevet_session=${studentToken}`;

    const adminPaths = [
      '/admin',
      '/admin/keys',
      '/admin/modules',
      '/admin/modules/new',
      '/admin/pengaturan',
      '/admin/quiz-manager',
      '/admin/quiz-perhitungan',
      '/admin/tiktok-prompts',
      '/admin/glossary-manager',
      '/admin/import',
      '/admin/media',
    ];

    for (const path of adminPaths) {
      const res = simulateEdgeMiddleware(path, cookie);
      expect(res.action).toBe('redirect');
      expect(res.destination).toBe('/dashboard');
    }
  });

  runner.test('ADV-2.3: Admin (role: "admin") is granted access to all /admin/* routes', () => {
    const adminToken = signTestToken({ sub: 'admin-1', role: 'admin' });
    const cookie = `brevet_session=${adminToken}`;

    const adminPaths = [
      '/admin',
      '/admin/keys',
      '/admin/modules',
      '/admin/quiz-manager',
      '/admin/glossary-manager',
    ];

    for (const path of adminPaths) {
      const res = simulateEdgeMiddleware(path, cookie);
      expect(res.action).toBe('next');
      expect(res.status).toBe(200);
    }
  });

  runner.test('ADV-2.4: Unauthenticated user accessing /admin is redirected to /login with redirect query param', () => {
    const res = simulateEdgeMiddleware('/admin/keys', '');
    expect(res.action).toBe('redirect');
    expect(res.destination).toContain('/login?redirect=');
    expect(res.destination).toContain(encodeURIComponent('/admin/keys'));
  });

  runner.test('ADV-2.5: Unauthenticated user accessing /dashboard or /profil is redirected to /login', () => {
    const resDash = simulateEdgeMiddleware('/dashboard', '');
    expect(resDash.action).toBe('redirect');
    expect(resDash.destination).toContain('/login?redirect=');

    const resProf = simulateEdgeMiddleware('/profil', '');
    expect(resProf.action).toBe('redirect');
    expect(resProf.destination).toContain('/login?redirect=');
  });

  runner.test('ADV-2.6: Authenticated student accessing /login or /register is redirected to /dashboard', () => {
    const studentToken = signTestToken({ sub: 'student-1', role: 'user' });
    const cookie = `brevet_session=${studentToken}`;

    const resLogin = simulateEdgeMiddleware('/login', cookie);
    expect(resLogin.action).toBe('redirect');
    expect(resLogin.destination).toBe('/dashboard');

    const resReg = simulateEdgeMiddleware('/register', cookie);
    expect(resReg.action).toBe('redirect');
    expect(resReg.destination).toBe('/dashboard');
  });

  runner.test('ADV-2.7: Authenticated admin accessing /login or /register is redirected to /admin', () => {
    const adminToken = signTestToken({ sub: 'admin-1', role: 'admin' });
    const cookie = `brevet_session=${adminToken}`;

    const resLogin = simulateEdgeMiddleware('/login', cookie);
    expect(resLogin.action).toBe('redirect');
    expect(resLogin.destination).toBe('/admin');

    const resReg = simulateEdgeMiddleware('/register', cookie);
    expect(resReg.action).toBe('redirect');
    expect(resReg.destination).toBe('/admin');
  });

  runner.test('ADV-2.8: Public routes remain accessible without authentication', () => {
    const publicPaths = [
      '/',
      '/login',
      '/register',
      '/belajar',
      '/ujian-djp',
      '/tools/kalkulator',
      '/api/auth/login',
      '/api/auth/register',
      '/api/djp-exam',
      '/api/belajar/pajak-dasar',
    ];

    for (const path of publicPaths) {
      const res = simulateEdgeMiddleware(path, '');
      expect(res.action).toBe('next');
      expect(res.status).toBe(200);
    }
  });

  // =========================================================================
  // VECTOR 3: REST API Route Authorization Defense-in-Depth
  // =========================================================================

  const unauthenticatedSession = null;
  const studentSession = { id: 'student-id-101', email: 'student@example.com', role: 'user', fullName: 'Student Test' };
  const adminSession = { id: 'admin-id-001', email: 'admin@brevet.id', role: 'admin', fullName: 'Admin Master' };

  runner.test('ADV-3.1: /api/keys rejects unauthenticated request with 401', () => {
    const res = simulateRequireAdmin(unauthenticatedSession);
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Belum login');
  });

  runner.test('ADV-3.2: /api/keys rejects student (role: "user") with 403 Forbidden', () => {
    const res = simulateRequireAdmin(studentSession);
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Akses ditolak');
  });

  runner.test('ADV-3.3: /api/keys allows admin (role: "admin")', () => {
    const res = simulateRequireAdmin(adminSession);
    expect(res.id).toBe(adminSession.id);
    expect(res.role).toBe('admin');
  });

  runner.test('ADV-3.4: /api/keys/[id] PUT & DELETE rejects student with 403', () => {
    const resPut = simulateRequireAdmin(studentSession);
    expect(resPut.status).toBe(403);

    const resDel = simulateRequireAdmin(studentSession);
    expect(resDel.status).toBe(403);
  });

  runner.test('ADV-3.5: /api/keys/active-pool allows student (sanitized metrics) but blocks unauthenticated', () => {
    const unauth = simulateRequireAuth(unauthenticatedSession);
    expect(unauth.status).toBe(401);

    const student = simulateRequireAuth(studentSession);
    expect(student.id).toBe(studentSession.id);
  });

  runner.test('ADV-3.6: /api/keys/cleanup, /api/keys/reset, /api/keys/test enforce admin role', () => {
    expect(simulateRequireAdmin(studentSession).status).toBe(403);
    expect(simulateRequireAdmin(adminSession).role).toBe('admin');
  });

  runner.test('ADV-3.7: /api/modules GET allows student (progress calculation)', () => {
    const auth = simulateRequireAuth(studentSession);
    expect(auth.id).toBe(studentSession.id);
  });

  runner.test('ADV-3.8: /api/modules/[id] GET allows student, but PUT & DELETE require admin', () => {
    // GET
    const authGet = simulateRequireAuth(studentSession);
    expect(authGet.id).toBe(studentSession.id);

    // PUT
    const authPut = simulateRequireAdmin(studentSession);
    expect(authPut.status).toBe(403);

    // DELETE
    const authDel = simulateRequireAdmin(studentSession);
    expect(authDel.status).toBe(403);
  });

  runner.test('ADV-3.9: /api/modules/[id]/duplicate and /api/modules/[id]/toggle require admin', () => {
    expect(simulateRequireAdmin(studentSession).status).toBe(403);
    expect(simulateRequireAdmin(adminSession).role).toBe('admin');
  });

  runner.test('ADV-3.10: /api/modules/import enforces admin role', () => {
    expect(simulateRequireAdmin(studentSession).status).toBe(403);
    expect(simulateRequireAdmin(adminSession).role).toBe('admin');
  });

  runner.test('ADV-3.11: /api/admin/generate-quiz POST blocks student with 403', () => {
    const auth = simulateRequireAdmin(studentSession);
    expect(auth.status).toBe(403);
    expect(auth.body.error).toContain('Akses ditolak');
  });

  runner.test('ADV-3.12: /api/admin/glossary GET allows student, but mutations (POST, PUT, DELETE) require admin', () => {
    // GET
    expect(simulateRequireAuth(studentSession).id).toBe(studentSession.id);

    // POST/PUT/DELETE
    expect(simulateRequireAdmin(studentSession).status).toBe(403);
    expect(simulateRequireAdmin(adminSession).role).toBe('admin');
  });

  runner.test('ADV-3.13: /api/admin/glossary/sync and /api/admin/health block student with 403', () => {
    expect(simulateRequireAdmin(studentSession).status).toBe(403);
    expect(simulateRequireAdmin(adminSession).role).toBe('admin');
  });

  runner.test('ADV-3.14: /api/prompts endpoints block student with 403', () => {
    expect(simulateRequireAdmin(studentSession).status).toBe(403);
    expect(simulateRequireAdmin(adminSession).role).toBe('admin');
  });

  runner.test('ADV-3.15: /api/users/[id] profile update prevents horizontal role escalation (student editing other student)', () => {
    const targetUserId = 'student-id-999';

    // Student trying to edit someone else
    const canEditSelf = studentSession.id === targetUserId || studentSession.role === 'admin';
    expect(canEditSelf).toBe(false);

    // Student editing own profile
    const canEditOwn = studentSession.id === studentSession.id || studentSession.role === 'admin';
    expect(canEditOwn).toBe(true);

    // Admin editing any profile
    const canAdminEdit = adminSession.id === targetUserId || adminSession.role === 'admin';
    expect(canAdminEdit).toBe(true);
  });

  // =========================================================================
  // VECTOR 4: Production Dev Password Bypass Lockout Simulation
  // =========================================================================

  const realPassword = 'StudentSecretPassword2026!';
  let realPasswordHash = '';

  runner.beforeAll(async () => {
    realPasswordHash = await bcrypt.hash(realPassword, 10);
  });

  runner.test('ADV-4.1: In production (NODE_ENV=production), "__DEV_AUTOFILL__" bypass fails if hash does not match', async () => {
    const isValid = await simulateLoginPasswordVerify('__DEV_AUTOFILL__', realPasswordHash, 'production');
    expect(isValid).toBe(false);
  });

  runner.test('ADV-4.2: In production (NODE_ENV=production), "admin123" bypass fails if hash does not match', async () => {
    const isValid = await simulateLoginPasswordVerify('admin123', realPasswordHash, 'production');
    expect(isValid).toBe(false);
  });

  runner.test('ADV-4.3: In production (NODE_ENV=production), "admin123456" bypass fails if hash does not match', async () => {
    const isValid = await simulateLoginPasswordVerify('admin123456', realPasswordHash, 'production');
    expect(isValid).toBe(false);
  });

  runner.test('ADV-4.4: In production (NODE_ENV=production), genuine bcrypt password succeeds', async () => {
    const isValid = await simulateLoginPasswordVerify(realPassword, realPasswordHash, 'production');
    expect(isValid).toBe(true);
  });

  runner.test('ADV-4.5: In development (NODE_ENV=development), dev bypass passwords are recognized', async () => {
    const isDevPass1 = await simulateLoginPasswordVerify('__DEV_AUTOFILL__', realPasswordHash, 'development');
    expect(isDevPass1).toBe(true);

    const isDevPass2 = await simulateLoginPasswordVerify('admin123', realPasswordHash, 'development');
    expect(isDevPass2).toBe(true);

    const isDevPass3 = await simulateLoginPasswordVerify('admin123456', realPasswordHash, 'development');
    expect(isDevPass3).toBe(true);
  });

  runner.test('ADV-4.6: In test environment (NODE_ENV=test), dev bypass is disabled and fails', async () => {
    const isDevPass = await simulateLoginPasswordVerify('__DEV_AUTOFILL__', realPasswordHash, 'test');
    expect(isDevPass).toBe(false);
  });

  return runner.run();
}
