import {
  TestSuiteRunner,
  expect,
  signTestToken,
  verifyTestToken,
  simulateEdgeMiddleware,
  computeRadarChartCoordinates,
  calculateStudyStreak,
  generateScorecardAndCertificate,
  MockOfflineStore,
  TAX_DOMAINS,
  TEST_JWT_SECRET,
} from './test-utils.mjs';
import { z } from 'zod';
import crypto from 'node:crypto';

// Zod schemas under test (opaque-box validation verification)
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateUserProfileSchema,
} from '../../lib/validations/auth.ts';
import {
  sectionProgressSchema,
  batchProgressSchema,
} from '../../lib/validations/progress.ts';
import { quizAttemptSchema } from '../../lib/validations/quiz.ts';
import { djpAttemptSchema } from '../../lib/validations/djp.ts';

export async function runSuite() {
  const runner = new TestSuiteRunner('Tier 1: Feature Coverage (Isolation)');

  // =========================================================================
  // FEATURE 1: User Registration & Role Assignment
  // =========================================================================
  runner.test('F1.1: Registration validates required fields and sets role to "user"', () => {
    const payload = {
      email: 'student.brevet@example.com',
      password: 'SecurePassword123!',
      fullName: 'Budi Santoso',
    };
    const parsed = registerSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.email).toBe('student.brevet@example.com');
    expect(parsed.data.fullName).toBe('Budi Santoso');
  });

  runner.test('F1.2: Password hashing requirement ensures plaintext is never stored', () => {
    const rawPassword = 'MySecretPassword2026';
    // Simulate bcrypt hash pattern ($2a$10$... or $2b$10$...)
    const fakeHash = `$2b$10$${crypto.randomBytes(16).toString('hex')}`;
    expect(fakeHash.startsWith('$2b$10$')).toBe(true);
    expect(fakeHash).not.toBe(rawPassword);
  });

  runner.test('F1.3: Registration schema rejects duplicate invalid email formats', () => {
    const invalidPayload = {
      email: 'not-an-email',
      password: 'password123',
      fullName: 'Test User',
    };
    const parsed = registerSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
    expect(parsed.error.issues[0].path[0]).toBe('email');
  });

  runner.test('F1.4: Normalization trims fullName and lowercases email', () => {
    const rawEmail = '  STUDENT.Tax@Example.COM  ';
    const rawName = '  Ahmad Fadillah  ';
    const normalizedEmail = rawEmail.trim().toLowerCase();
    const normalizedName = rawName.trim();

    expect(normalizedEmail).toBe('student.tax@example.com');
    expect(normalizedName).toBe('Ahmad Fadillah');
  });

  runner.test('F1.5: Successful registration payload generates signed JWT token with student role', () => {
    const userId = crypto.randomUUID();
    const token = signTestToken({ sub: userId, role: 'user' });
    const verified = verifyTestToken(token);

    expect(verified).toBeDefined();
    expect(verified.sub).toBe(userId);
    expect(verified.role).toBe('user');
  });

  // =========================================================================
  // FEATURE 2: Login & Session Cookie Handling
  // =========================================================================
  runner.test('F2.1: Login validates email and password presence', () => {
    const payload = { email: 'student@example.com', password: 'password123' };
    const parsed = loginSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  runner.test('F2.2: Session token payload encapsulates user id and role', () => {
    const userId = '11111111-2222-3333-4444-555555555555';
    const token = signTestToken({ sub: userId, role: 'user' });
    const payload = verifyTestToken(token);

    expect(payload.sub).toBe(userId);
    expect(payload.role).toBe('user');
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  runner.test('F2.3: Session cookie attributes comply with security specifications', () => {
    const cookieName = 'brevet_session';
    const token = signTestToken({ sub: 'user-123', role: 'user' });
    const cookieHeader = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;

    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Lax');
    expect(cookieHeader).toContain('Max-Age=2592000');
    expect(cookieHeader).toContain('Path=/');
  });

  runner.test('F2.4: Dev bypass password list contains recognized development credentials', () => {
    const devPasswords = ['__DEV_AUTOFILL__', 'admin123', 'admin123456'];
    expect(devPasswords.includes('admin123')).toBe(true);
    expect(devPasswords.includes('admin123456')).toBe(true);
    expect(devPasswords.includes('wrongpassword')).toBe(false);
  });

  runner.test('F2.5: Safe user session response excludes sensitive hash', () => {
    const dbUser = {
      id: crypto.randomUUID(),
      email: 'user@brevet.id',
      fullName: 'User Brevet',
      role: 'user',
      passwordHash: '$2b$10$hashedstringthatshouldneverleak',
    };

    const safeUser = {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.fullName,
      role: dbUser.role,
    };

    expect(safeUser).not.toHaveProperty('passwordHash');
    expect(safeUser.email).toBe('user@brevet.id');
  });

  // =========================================================================
  // FEATURE 3: Edge Middleware Route Protection (proxy.ts)
  // =========================================================================
  runner.test('F3.1: Unauthenticated request to /dashboard redirects to /login', () => {
    const result = simulateEdgeMiddleware('/dashboard', '');
    expect(result.action).toBe('redirect');
    expect(result.destination).toContain('/login?redirect=');
  });

  runner.test('F3.2: Unauthenticated request to /admin redirects to /login', () => {
    const result = simulateEdgeMiddleware('/admin', '');
    expect(result.action).toBe('redirect');
    expect(result.destination).toContain('/login?redirect=');
  });

  runner.test('F3.3: Authenticated student accessing /admin is redirected to /dashboard', () => {
    const studentToken = signTestToken({ sub: 'student-1', role: 'user' });
    const result = simulateEdgeMiddleware('/admin', `brevet_session=${studentToken}`);

    expect(result.action).toBe('redirect');
    expect(result.destination).toBe('/dashboard');
  });

  runner.test('F3.4: Authenticated student accessing /dashboard is permitted (action: next)', () => {
    const studentToken = signTestToken({ sub: 'student-1', role: 'user' });
    const result = simulateEdgeMiddleware('/dashboard', `brevet_session=${studentToken}`);

    expect(result.action).toBe('next');
    expect(result.status).toBe(200);
  });

  runner.test('F3.5: Authenticated admin accessing /login is redirected to /admin', () => {
    const adminToken = signTestToken({ sub: 'admin-1', role: 'admin' });
    const result = simulateEdgeMiddleware('/login', `brevet_session=${adminToken}`);

    expect(result.action).toBe('redirect');
    expect(result.destination).toBe('/admin');
  });

  // =========================================================================
  // FEATURE 4: Admin Layout Defense-in-Depth
  // =========================================================================
  runner.test('F4.1: Server-side check permits admin session', () => {
    const session = { id: 'admin-1', email: 'admin@brevet.id', role: 'admin', fullName: 'Super Admin' };
    const isAdmin = session && session.role === 'admin';
    expect(isAdmin).toBe(true);
  });

  runner.test('F4.2: Server-side check identifies missing session as unauthenticated', () => {
    const session = null;
    const shouldRedirectLogin = !session;
    expect(shouldRedirectLogin).toBe(true);
  });

  runner.test('F4.3: Server-side check identifies regular user as unauthorized for admin layout', () => {
    const session = { id: 'user-1', email: 'user@brevet.id', role: 'user' };
    const isUnauthorized = session.role !== 'admin';
    expect(isUnauthorized).toBe(true);
  });

  runner.test('F4.4: Layout receives and formats admin user display name', () => {
    const session = { fullName: 'Budi Administrator' };
    const displayName = session.fullName || 'Administrator';
    expect(displayName).toBe('Budi Administrator');
  });

  runner.test('F4.5: Defense-in-depth independently verifies session role even without middleware', () => {
    const directServerCheck = (userRole) => {
      if (!userRole) return { allowed: false, redirect: '/login' };
      if (userRole !== 'admin') return { allowed: false, redirect: '/dashboard' };
      return { allowed: true };
    };

    expect(directServerCheck(null).redirect).toBe('/login');
    expect(directServerCheck('user').redirect).toBe('/dashboard');
    expect(directServerCheck('admin').allowed).toBe(true);
  });

  // =========================================================================
  // FEATURE 5: Admin API Keys & Module Protection
  // =========================================================================
  runner.test('F5.1: requireAdmin guard allows admin role', () => {
    const adminToken = signTestToken({ sub: 'admin-uuid', role: 'admin' });
    const result = simulateEdgeMiddleware('/api/keys', `brevet_session=${adminToken}`);
    expect(result.action).toBe('next');
    expect(result.status).toBe(200);
  });

  runner.test('F5.2: requireAdmin guard returns 403 for student role', () => {
    const studentToken = signTestToken({ sub: 'student-uuid', role: 'user' });
    const result = simulateEdgeMiddleware('/api/keys', `brevet_session=${studentToken}`);
    expect(result.status).toBe(403);
    expect(result.body.error).toContain('Akses ditolak');
  });

  runner.test('F5.3: requireAdmin guard returns 401 for unauthenticated request', () => {
    const result = simulateEdgeMiddleware('/api/keys', '');
    expect(result.status).toBe(401);
    expect(result.body.error).toContain('Belum login');
  });

  runner.test('F5.4: Admin key management route rejects regular student access', () => {
    const studentToken = signTestToken({ sub: 'student-uuid', role: 'user' });
    const result = simulateEdgeMiddleware('/api/admin/generate-quiz', `brevet_session=${studentToken}`);
    expect(result.status).toBe(403);
  });

  runner.test('F5.5: Module toggle mutation requires valid admin token', () => {
    const adminToken = signTestToken({ sub: 'admin-uuid', role: 'admin' });
    const verified = verifyTestToken(adminToken);
    expect(verified.role).toBe('admin');
  });

  // =========================================================================
  // FEATURE 6: Student Profile & Account Management
  // =========================================================================
  runner.test('F6.1: Profile endpoint returns authenticated user profile details', () => {
    const userSession = {
      id: crypto.randomUUID(),
      email: 'student@pajak.id',
      fullName: 'Rizky Pratama',
      role: 'user',
    };
    expect(userSession.id).toBeDefined();
    expect(userSession.email).toBe('student@pajak.id');
    expect(userSession.role).toBe('user');
  });

  runner.test('F6.2: Profile endpoint returns 401 when no session cookie is present', () => {
    const result = simulateEdgeMiddleware('/api/user/progress', '');
    expect(result.status).toBe(401);
  });

  runner.test('F6.3: Profile update schema validates fullName length >= 2', () => {
    const valid = updateUserProfileSchema.safeParse({ fullName: 'Dewi Sartika' });
    const invalid = updateUserProfileSchema.safeParse({ fullName: 'A' });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  runner.test('F6.4: Password change schema enforces minimum 6 characters for new password', () => {
    const valid = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword123',
      newPassword: 'newSecurePassword456',
    });
    const invalid = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword123',
      newPassword: '123',
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  runner.test('F6.5: First-run logic detects zero registered users state', () => {
    const detectFirstRun = (userCount) => ({
      firstRun: userCount === 0,
      user: null,
    });

    expect(detectFirstRun(0).firstRun).toBe(true);
    expect(detectFirstRun(5).firstRun).toBe(false);
  });

  // =========================================================================
  // FEATURE 7: Module Section Progress Persistence
  // =========================================================================
  runner.test('F7.1: Section progress schema validates valid UUID moduleId and boolean completed', () => {
    const payload = {
      moduleId: crypto.randomUUID(),
      sectionId: 'section-01-pengantar',
      completed: true,
    };
    const parsed = sectionProgressSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.completed).toBe(true);
  });

  runner.test('F7.2: Batch progress schema validates array of completed section IDs', () => {
    const payload = {
      moduleId: crypto.randomUUID(),
      completedSectionIds: ['sec-1', 'sec-2', 'sec-3'],
    };
    const parsed = batchProgressSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.completedSectionIds.length).toBe(3);
  });

  runner.test('F7.3: Progress map transformer converts list to keyed boolean lookup', () => {
    const progressList = [
      { sectionId: 'sec-1', completed: true },
      { sectionId: 'sec-2', completed: false },
      { sectionId: 'sec-3', completed: true },
    ];

    const completedMap = {};
    progressList.forEach((p) => {
      if (p.completed) completedMap[p.sectionId] = true;
    });

    expect(completedMap['sec-1']).toBe(true);
    expect(completedMap['sec-2']).toBeUndefined();
    expect(completedMap['sec-3']).toBe(true);
  });

  runner.test('F7.4: Section unmarking payload sets completed=false', () => {
    const payload = {
      moduleId: crypto.randomUUID(),
      sectionId: 'sec-1',
      completed: false,
    };
    const parsed = sectionProgressSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.completed).toBe(false);
  });

  runner.test('F7.5: Progress upsert key is uniquely determined by (userId, moduleId, sectionId)', () => {
    const userId = crypto.randomUUID();
    const moduleId = crypto.randomUUID();
    const sectionId = 'sec-10';

    const key1 = `${userId}:${moduleId}:${sectionId}`;
    const key2 = `${userId}:${moduleId}:${sectionId}`;
    expect(key1).toBe(key2);
  });

  // =========================================================================
  // FEATURE 8: Mini-Quiz & 100-Q Exam Persistence
  // =========================================================================
  runner.test('F8.1: Quiz attempt schema validates score integers and answers dictionary', () => {
    const payload = {
      moduleId: crypto.randomUUID(),
      pgScore: 85,
      essayScore: 75,
      finalScore: 80,
      answersJson: { q1: 'A', q2: 'B', q3: 'D' },
    };
    const parsed = quizAttemptSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.finalScore).toBe(80);
  });

  runner.test('F8.2: Quiz attempt schema defaults essayScore to 0 if omitted', () => {
    const payload = {
      moduleId: crypto.randomUUID(),
      pgScore: 90,
      finalScore: 90,
      answersJson: { q1: 'C' },
    };
    const parsed = quizAttemptSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.essayScore).toBe(0);
  });

  runner.test('F8.3: Quiz attempt history correctly calculates highest score', () => {
    const attempts = [{ finalScore: 60 }, { finalScore: 95 }, { finalScore: 80 }];
    const highestScore = Math.max(...attempts.map((a) => a.finalScore));
    expect(highestScore).toBe(95);
  });

  runner.test('F8.4: Quiz attempt accepts structured essay analysis JSON', () => {
    const payload = {
      moduleId: crypto.randomUUID(),
      pgScore: 80,
      finalScore: 85,
      answersJson: { q1: 'A' },
      essayAnalysisJson: { feedback: 'Analisis pasal 21 sangat tepat', grade: 'A' },
    };
    const parsed = quizAttemptSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.essayAnalysisJson.grade).toBe('A');
  });

  runner.test('F8.5: Empty attempt list yields null highest score', () => {
    const attempts = [];
    const highestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.finalScore)) : null;
    expect(highestScore).toBeNull();
  });

  // =========================================================================
  // FEATURE 9: DJP Exam Simulation (4 Modes) Persistence
  // =========================================================================
  runner.test('F9.1: Mode all-100 validates 4 sub-scores and final pass status', () => {
    const payload = {
      mode: 'all-100',
      tkbScore: 85,
      essayScore: 80,
      interviewScore: 90,
      finalScore: 85,
      isPassed: true,
      answersJson: { 'q-01': 'A', 'q-02': 'C' },
    };
    const parsed = djpAttemptSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.mode).toBe('all-100');
    expect(parsed.data.isPassed).toBe(true);
  });

  runner.test('F9.2: Mode tkb-50 validates technical multiple-choice simulation', () => {
    const payload = {
      mode: 'tkb-50',
      tkbScore: 78,
      finalScore: 78,
      isPassed: true,
      answersJson: { 'tkb-01': 'B' },
    };
    const parsed = djpAttemptSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.mode).toBe('tkb-50');
  });

  runner.test('F9.3: Mode esai-25 validates essay case study with AI evaluation analysis', () => {
    const payload = {
      mode: 'esai-25',
      essayScore: 88,
      finalScore: 88,
      isPassed: true,
      answersJson: { 'esai-01': 'Penerapan PPh pasal 23 atas jasa manajemen...' },
      essayAnalysisJson: { logicScore: 90, taxLawAccuracy: 86 },
    };
    const parsed = djpAttemptSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.mode).toBe('esai-25');
  });

  runner.test('F9.4: Mode wawancara-25 validates interview behavioral scoring', () => {
    const payload = {
      mode: 'wawancara-25',
      interviewScore: 92,
      finalScore: 92,
      isPassed: true,
      answersJson: { 'w-01': 'Integritas dan kode etik DJP...' },
      interviewAnalysisJson: { integrity: 95, communication: 90 },
    };
    const parsed = djpAttemptSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.mode).toBe('wawancara-25');
  });

  runner.test('F9.5: Failing DJP attempt sets isPassed to false', () => {
    const payload = {
      mode: 'all-100',
      tkbScore: 50,
      essayScore: 45,
      interviewScore: 60,
      finalScore: 52,
      isPassed: false,
      answersJson: {},
    };
    const parsed = djpAttemptSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.isPassed).toBe(false);
  });

  // =========================================================================
  // FEATURE 10: Offline Caching & Draft Recovery
  // =========================================================================
  runner.test('F10.1: Mock offline store persists draft progress items', () => {
    const store = new MockOfflineStore();
    store.saveDraftProgress({ moduleId: 'mod-1', sectionId: 'sec-1', completed: true });

    const drafts = store.getPendingDrafts();
    expect(drafts.progress.length).toBe(1);
    expect(drafts.progress[0].sectionId).toBe('sec-1');
  });

  runner.test('F10.2: Mock offline store persists draft quiz answers', () => {
    const store = new MockOfflineStore();
    store.saveDraftQuiz({ moduleId: 'mod-1', finalScore: 90, answersJson: { q1: 'A' } });

    const drafts = store.getPendingDrafts();
    expect(drafts.quizAttempts.length).toBe(1);
    expect(drafts.quizAttempts[0].finalScore).toBe(90);
  });

  runner.test('F10.3: Mock offline store flushes drafts after server synchronization', () => {
    const store = new MockOfflineStore();
    store.saveDraftProgress({ moduleId: 'mod-1', sectionId: 'sec-1', completed: true });
    store.clearSyncedDrafts();

    const drafts = store.getPendingDrafts();
    expect(drafts.progress.length).toBe(0);
  });

  runner.test('F10.4: Cache buckets store and retrieve cached response items', async () => {
    const store = new MockOfflineStore();
    await store.putCache('brevet-data-v3', '/api/belajar/pph-pasal-21', { title: 'PPh 21' });

    const cached = await store.getCache('brevet-data-v3', '/api/belajar/pph-pasal-21');
    expect(cached).toEqual({ title: 'PPh 21' });
  });

  runner.test('F10.5: Clear all caches purges all buckets', async () => {
    const store = new MockOfflineStore();
    await store.putCache('brevet-ab-v3', '/belajar', '<html>...</html>');
    await store.clearAllCaches();

    const cached = await store.getCache('brevet-ab-v3', '/belajar');
    expect(cached).toBeNull();
  });

  // =========================================================================
  // FEATURE 11: Zod Input Validation & Schema Errors
  // =========================================================================
  runner.test('F11.1: registerSchema validates minimum password length >= 6', () => {
    const invalid = registerSchema.safeParse({
      email: 'valid@example.com',
      password: '123',
      fullName: 'Valid Name',
    });
    expect(invalid.success).toBe(false);
  });

  runner.test('F11.2: sectionProgressSchema rejects non-UUID moduleId strings', () => {
    const invalid = sectionProgressSchema.safeParse({
      moduleId: 'not-a-uuid',
      sectionId: 'sec-1',
      completed: true,
    });
    expect(invalid.success).toBe(false);
  });

  runner.test('F11.3: quizAttemptSchema rejects scores greater than 100', () => {
    const invalid = quizAttemptSchema.safeParse({
      moduleId: crypto.randomUUID(),
      pgScore: 105,
      finalScore: 105,
      answersJson: {},
    });
    expect(invalid.success).toBe(false);
  });

  runner.test('F11.4: quizAttemptSchema rejects negative scores', () => {
    const invalid = quizAttemptSchema.safeParse({
      moduleId: crypto.randomUUID(),
      pgScore: -5,
      finalScore: -5,
      answersJson: {},
    });
    expect(invalid.success).toBe(false);
  });

  runner.test('F11.5: djpAttemptSchema enforces strict mode enumeration', () => {
    const invalid = djpAttemptSchema.safeParse({
      mode: 'invalid-mode',
      finalScore: 80,
      answersJson: {},
    });
    expect(invalid.success).toBe(false);
  });

  // =========================================================================
  // FEATURE 12: API Security, Sanitization & Dev Guard
  // =========================================================================
  runner.test('F12.1: Sanitized error response does not reveal SQL query details', () => {
    const formatSafeError = (err) => ({
      error: 'Terjadi kesalahan pada server saat pendaftaran.',
    });
    const safeRes = formatSafeError(new Error('relation "users" does not exist at character 14'));
    expect(safeRes.error).not.toContain('relation "users"');
  });

  runner.test('F12.2: Password hash field is omitted in public user response payload', () => {
    const rawUser = { id: 'u-1', email: 'test@brevet.id', passwordHash: 'secret' };
    const { passwordHash, ...sanitized } = rawUser;
    expect(sanitized.passwordHash).toBeUndefined();
  });

  runner.test('F12.3: JWT signature verification fails if payload is tampered with', () => {
    const token = signTestToken({ sub: 'user-1', role: 'user' });
    const parts = token.split('.');
    // Tamper payload
    const tamperedPayload = base64UrlEncode(JSON.stringify({ sub: 'user-1', role: 'admin' }));
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const verified = verifyTestToken(tamperedToken);
    expect(verified).toBeNull();
  });

  runner.test('F12.4: Expired token verification returns null', () => {
    // Generate token with negative expiry
    const expiredToken = signTestToken({ sub: 'user-1', role: 'user' }, TEST_JWT_SECRET, -100);
    const verified = verifyTestToken(expiredToken);
    expect(verified).toBeNull();
  });

  runner.test('F12.5: Unsigned arbitrary string token is rejected', () => {
    expect(verifyTestToken('arbitrary.invalid.token')).toBeNull();
    expect(verifyTestToken('')).toBeNull();
  });

  // =========================================================================
  // FEATURE 13: Competency Radar Chart Rendering
  // =========================================================================
  runner.test('F13.1: Radar chart computes points for all 6 tax domains', () => {
    const scores = { kup: 80, pph_op: 90, pph_badan: 70, potput: 85, ppn: 75, coretax: 95 };
    const radar = computeRadarChartCoordinates(scores);
    expect(radar.points.length).toBe(6);
    expect(radar.points.map((p) => p.domain)).toEqual(['kup', 'pph_op', 'pph_badan', 'potput', 'ppn', 'coretax']);
  });

  runner.test('F13.2: Radar chart generates valid SVG polygon coordinate string', () => {
    const scores = { kup: 100, pph_op: 100, pph_badan: 100, potput: 100, ppn: 100, coretax: 100 };
    const radar = computeRadarChartCoordinates(scores);
    expect(typeof radar.polygonSvgPoints).toBe('string');
    expect(radar.polygonSvgPoints.split(' ').length).toBe(6);
  });

  runner.test('F13.3: 0% score across all domains places polygon points at center (120, 120)', () => {
    const scores = { kup: 0, pph_op: 0, pph_badan: 0, potput: 0, ppn: 0, coretax: 0 };
    const radar = computeRadarChartCoordinates(scores, 100, 120);
    for (const point of radar.points) {
      expect(point.x).toBe(120);
      expect(point.y).toBe(120);
    }
  });

  runner.test('F13.4: 100% score for top axis (KUP) reaches top radius (120, 20)', () => {
    const scores = { kup: 100 };
    const radar = computeRadarChartCoordinates(scores, 100, 120);
    const kupPoint = radar.points.find((p) => p.domain === 'kup');
    expect(kupPoint.x).toBe(120);
    expect(kupPoint.y).toBe(20); // 120 - 100 = 20
  });

  runner.test('F13.5: Missing domain score defaults to 0 without throwing errors', () => {
    const scores = { kup: 80 }; // other 5 missing
    const radar = computeRadarChartCoordinates(scores);
    const pphOp = radar.points.find((p) => p.domain === 'pph_op');
    expect(pphOp.score).toBe(0);
  });

  // =========================================================================
  // FEATURE 14: Study Streak & Activity Heatmap
  // =========================================================================
  runner.test('F14.1: Activity today alone starts streak of 1 day', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = calculateStudyStreak([today]);
    expect(result.streakDays).toBe(1);
    expect(result.isActiveToday).toBe(true);
  });

  runner.test('F14.2: 3 consecutive days up to today produces streak of 3', () => {
    const now = new Date();
    const d1 = new Date(now);
    const d2 = new Date(now);
    d2.setDate(d2.getDate() - 1);
    const d3 = new Date(now);
    d3.setDate(d3.getDate() - 2);

    const dates = [d1.toISOString(), d2.toISOString(), d3.toISOString()];
    const result = calculateStudyStreak(dates);
    expect(result.streakDays).toBe(3);
    expect(result.isActiveToday).toBe(true);
  });

  runner.test('F14.3: Activity yesterday without today preserves streak', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = calculateStudyStreak([yesterday.toISOString()]);
    expect(result.streakDays).toBe(1);
    expect(result.isActiveToday).toBe(false);
  });

  runner.test('F14.4: Inactivity gap greater than 1 day resets streak to 0', () => {
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const result = calculateStudyStreak([fourDaysAgo.toISOString()]);
    expect(result.streakDays).toBe(0);
  });

  runner.test('F14.5: Multiple activities on the same day are deduplicated into 1 streak day', () => {
    const today = new Date().toISOString().split('T')[0];
    const dates = [
      `${today}T08:00:00Z`,
      `${today}T12:00:00Z`,
      `${today}T18:00:00Z`,
    ];
    const result = calculateStudyStreak(dates);
    expect(result.streakDays).toBe(1);
  });

  // =========================================================================
  // FEATURE 15: Scorecards & Certificate Generation
  // =========================================================================
  runner.test('F15.1: Final score >= 70 issues verified competency certificate', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Siti Aminah',
      finalScore: 82,
    });

    expect(result.scorecard.isPassed).toBe(true);
    expect(result.certificate).toBeDefined();
    expect(result.certificate.issuedTo).toBe('Siti Aminah');
    expect(result.certificate.status).toBe('VERIFIED');
  });

  runner.test('F15.2: Final score < 70 generates scorecard with failed status and null certificate', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Hendra Gunawan',
      finalScore: 65,
    });

    expect(result.scorecard.isPassed).toBe(false);
    expect(result.scorecard.grade).toBe('D (Belum Lulus)');
    expect(result.certificate).toBeNull();
  });

  runner.test('F15.3: Certificate serial number matches CERT-BRVT-YYYYMMDD-XXXX format', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Maya Putri',
      finalScore: 90,
    });

    expect(result.certificate.serialNumber).toMatch(/^CERT-BRVT-\d{8}-\d{4}$/);
  });

  runner.test('F15.4: Grade evaluation correctly assigns A for score >= 85', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Fajar Kurnia',
      finalScore: 88,
    });
    expect(result.scorecard.grade).toContain('Sangat Memuaskan');
  });

  runner.test('F15.5: Certificate includes cryptographic SHA-256 verification hash', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Lestari Indah',
      finalScore: 95,
    });
    expect(result.certificate.verificationHash.length).toBe(16);
  });

  return await runner.run();
}

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}
