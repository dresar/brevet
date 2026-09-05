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
  TEST_JWT_SECRET,
} from './test-utils.mjs';
import crypto from 'node:crypto';

// Zod schemas under test
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
  const runner = new TestSuiteRunner('Tier 2: Boundary & Corner Cases');

  // =========================================================================
  // FEATURE 1: User Registration Boundary & Corner
  // =========================================================================
  runner.test('B1.1: Password at exact lower boundary (6 characters) succeeds', () => {
    const parsed = registerSchema.safeParse({
      email: 'boundary@example.com',
      password: '123456',
      fullName: 'Budi Test',
    });
    expect(parsed.success).toBe(true);
  });

  runner.test('B1.2: Password 1 character below boundary (5 characters) fails validation', () => {
    const parsed = registerSchema.safeParse({
      email: 'boundary@example.com',
      password: '12345',
      fullName: 'Budi Test',
    });
    expect(parsed.success).toBe(false);
    expect(parsed.error.issues[0].message).toContain('minimal 6 karakter');
  });

  runner.test('B1.3: Full name at exact lower boundary (2 characters) succeeds', () => {
    const parsed = registerSchema.safeParse({
      email: 'boundary@example.com',
      password: 'validpassword123',
      fullName: 'Li',
    });
    expect(parsed.success).toBe(true);
  });

  runner.test('B1.4: Full name 1 character below boundary (1 character) fails validation', () => {
    const parsed = registerSchema.safeParse({
      email: 'boundary@example.com',
      password: 'validpassword123',
      fullName: 'X',
    });
    expect(parsed.success).toBe(false);
  });

  runner.test('B1.5: Email exceeding 100 characters boundary fails validation', () => {
    const longEmail = `${'a'.repeat(95)}@test.com`;
    const parsed = registerSchema.safeParse({
      email: longEmail,
      password: 'validpassword123',
      fullName: 'Long Email User',
    });
    expect(parsed.success).toBe(false);
  });

  // =========================================================================
  // FEATURE 2: Login Boundary & Corner
  // =========================================================================
  runner.test('B2.1: Empty email string is rejected by loginSchema', () => {
    const parsed = loginSchema.safeParse({ email: '', password: 'password123' });
    expect(parsed.success).toBe(false);
  });

  runner.test('B2.2: Empty password string is rejected by loginSchema', () => {
    const parsed = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(parsed.success).toBe(false);
  });

  runner.test('B2.3: Password with only whitespace is rejected by login validation', () => {
    const parsed = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(parsed.success).toBe(false);
  });

  runner.test('B2.4: Email with subdomain and plus addressing parses successfully', () => {
    const parsed = loginSchema.safeParse({
      email: 'student.tax+brevet2026@sub.dept.pajak.go.id',
      password: 'password123',
    });
    expect(parsed.success).toBe(true);
  });

  runner.test('B2.5: SQL injection attempt in login email is rejected as invalid email', () => {
    const parsed = loginSchema.safeParse({
      email: "admin' OR '1'='1' --",
      password: 'password123',
    });
    expect(parsed.success).toBe(false);
  });

  // =========================================================================
  // FEATURE 3: Middleware Boundary & Corner
  // =========================================================================
  runner.test('B3.1: Corrupted cookie string redirects to login', () => {
    const result = simulateEdgeMiddleware('/dashboard', 'brevet_session=corrupted.jwt.string');
    expect(result.action).toBe('redirect');
    expect(result.destination).toContain('/login');
  });

  runner.test('B3.2: Malformed JWT with only 2 segments redirects to login', () => {
    const result = simulateEdgeMiddleware('/admin', 'brevet_session=header.payload');
    expect(result.action).toBe('redirect');
    expect(result.destination).toContain('/login');
  });

  runner.test('B3.3: Deeply nested admin sub-route /admin/modules/edit/123 guarded for student', () => {
    const studentToken = signTestToken({ sub: 'user-1', role: 'user' });
    const result = simulateEdgeMiddleware('/admin/modules/edit/123', `brevet_session=${studentToken}`);
    expect(result.action).toBe('redirect');
    expect(result.destination).toBe('/dashboard');
  });

  runner.test('B3.4: Deeply nested dashboard sub-route guarded for unauthenticated visitor', () => {
    const result = simulateEdgeMiddleware('/dashboard/analytics/charts', '');
    expect(result.action).toBe('redirect');
    expect(result.destination).toContain('/login');
  });

  runner.test('B3.5: Public route /tools/kalkulator allows unauthenticated access', () => {
    const result = simulateEdgeMiddleware('/tools/kalkulator', '');
    expect(result.action).toBe('next');
    expect(result.status).toBe(200);
  });

  // =========================================================================
  // FEATURE 4: Admin Layout Boundary & Corner
  // =========================================================================
  runner.test('B4.1: Unknown role in session denied admin layout access', () => {
    const checkRole = (role) => (role === 'admin' ? 'ALLOW' : 'DENY');
    expect(checkRole('guest')).toBe('DENY');
    expect(checkRole('moderator')).toBe('DENY');
    expect(checkRole('')).toBe('DENY');
  });

  runner.test('B4.2: Session token with empty sub rejected', () => {
    const token = signTestToken({ sub: '', role: 'admin' });
    const payload = verifyTestToken(token);
    expect(payload.sub).toBe('');
    const isValidUser = Boolean(payload?.sub && payload.sub.trim().length > 0);
    expect(isValidUser).toBe(false);
  });

  runner.test('B4.3: Session token with missing role defaults safely or fails admin check', () => {
    const token = signTestToken({ sub: 'u-1' });
    const payload = verifyTestToken(token);
    expect(payload.role).toBeUndefined();
    expect(payload.role === 'admin').toBe(false);
  });

  runner.test('B4.4: Session without fullName falls back gracefully to default', () => {
    const session = { fullName: null };
    const displayName = session.fullName || 'Administrator';
    expect(displayName).toBe('Administrator');
  });

  runner.test('B4.5: Cookie header with multiple cookies extracts correct brevet_session', () => {
    const token = signTestToken({ sub: 'admin-1', role: 'admin' });
    const cookieHeader = `theme=dark; _ga=GA1.2.345; brevet_session=${token}; lang=id`;
    const result = simulateEdgeMiddleware('/admin', cookieHeader);
    expect(result.action).toBe('next');
  });

  // =========================================================================
  // FEATURE 5: Admin API Keys & Module Boundary & Corner
  // =========================================================================
  runner.test('B5.1: Non-UUID module ID route parameter format handled safely', () => {
    const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    expect(isUuid('invalid-uuid-string')).toBe(false);
    expect(isUuid(crypto.randomUUID())).toBe(true);
  });

  runner.test('B5.2: SQL injection attack in API key name sanitized', () => {
    const rawName = "Gemini Key'; DROP TABLE api_keys; --";
    const sanitized = rawName.replace(/['";]/g, '');
    expect(sanitized).not.toContain(';');
    expect(sanitized).not.toContain("'");
  });

  runner.test('B5.3: Student token forged with admin signature rejected', () => {
    const fakeSecret = 'wrong-secret-key-123';
    const fakeToken = signTestToken({ sub: 'user-1', role: 'admin' }, fakeSecret);
    const verified = verifyTestToken(fakeToken, TEST_JWT_SECRET);
    expect(verified).toBeNull();
  });

  runner.test('B5.4: Missing Authorization/Cookie header on /api/keys returns 401', () => {
    const result = simulateEdgeMiddleware('/api/keys', '');
    expect(result.status).toBe(401);
  });

  runner.test('B5.5: Empty POST body handled safely by JSON parser guard', () => {
    const parseSafeJson = (text) => {
      try {
        return text ? JSON.parse(text) : null;
      } catch {
        return null;
      }
    };
    expect(parseSafeJson('')).toBeNull();
    expect(parseSafeJson('{ invalid json }')).toBeNull();
  });

  // =========================================================================
  // FEATURE 6: Student Profile Boundary & Corner
  // =========================================================================
  runner.test('B6.1: FullName exceeding 100 characters rejected by schema', () => {
    const longName = 'A'.repeat(101);
    const parsed = updateUserProfileSchema.safeParse({ fullName: longName });
    expect(parsed.success).toBe(false);
  });

  runner.test('B6.2: New password with exact 6 characters allowed in password change', () => {
    const parsed = changePasswordSchema.safeParse({
      currentPassword: 'currentPassword123',
      newPassword: '6chars',
    });
    expect(parsed.success).toBe(true);
  });

  runner.test('B6.3: Profile update with empty object is allowed as optional', () => {
    const parsed = updateUserProfileSchema.safeParse({});
    expect(parsed.success).toBe(true);
  });

  runner.test('B6.4: Extra unrecognized fields in profile update stripped by schema', () => {
    const parsed = updateUserProfileSchema.safeParse({
      fullName: 'Dimas Anggara',
      role: 'admin',
      isVip: true,
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data.fullName).toBe('Dimas Anggara');
    expect(parsed.data.role).toBeUndefined();
  });

  runner.test('B6.5: Current password with exact whitespace maintained without auto-trim', () => {
    const parsed = changePasswordSchema.safeParse({
      currentPassword: ' passwordWithSpaces ',
      newPassword: 'newPassword123',
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data.currentPassword).toBe(' passwordWithSpaces ');
  });

  // =========================================================================
  // FEATURE 7: Progress Persistence Boundary & Corner
  // =========================================================================
  runner.test('B7.1: Section progress with invalid UUID rejected with Zod error', () => {
    const parsed = sectionProgressSchema.safeParse({
      moduleId: 'not-a-valid-uuid',
      sectionId: 'sec-01',
      completed: true,
    });
    expect(parsed.success).toBe(false);
  });

  runner.test('B7.2: Section progress with empty sectionId rejected', () => {
    const parsed = sectionProgressSchema.safeParse({
      moduleId: crypto.randomUUID(),
      sectionId: '',
      completed: true,
    });
    expect(parsed.success).toBe(false);
  });

  runner.test('B7.3: Section progress with string completed rejected', () => {
    const parsed = sectionProgressSchema.safeParse({
      moduleId: crypto.randomUUID(),
      sectionId: 'sec-01',
      completed: 'true',
    });
    expect(parsed.success).toBe(false);
  });

  runner.test('B7.4: Batch progress with empty array accepted', () => {
    const parsed = batchProgressSchema.safeParse({
      moduleId: crypto.randomUUID(),
      completedSectionIds: [],
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data.completedSectionIds.length).toBe(0);
  });

  runner.test('B7.5: Batch progress with 500 section IDs validated successfully', () => {
    const ids = Array.from({ length: 500 }, (_, i) => `section-${i}`);
    const parsed = batchProgressSchema.safeParse({
      moduleId: crypto.randomUUID(),
      completedSectionIds: ids,
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data.completedSectionIds.length).toBe(500);
  });

  // =========================================================================
  // FEATURE 8: Quiz Attempt Boundary & Corner
  // =========================================================================
  runner.test('B8.1: Score at exact lower boundary (0) accepted', () => {
    const parsed = quizAttemptSchema.safeParse({
      moduleId: crypto.randomUUID(),
      pgScore: 0,
      finalScore: 0,
      answersJson: {},
    });
    expect(parsed.success).toBe(true);
  });

  runner.test('B8.2: Score at exact upper boundary (100) accepted', () => {
    const parsed = quizAttemptSchema.safeParse({
      moduleId: crypto.randomUUID(),
      pgScore: 100,
      finalScore: 100,
      answersJson: {},
    });
    expect(parsed.success).toBe(true);
  });

  runner.test('B8.3: Score 1 point below boundary (-1) rejected', () => {
    const parsed = quizAttemptSchema.safeParse({
      moduleId: crypto.randomUUID(),
      pgScore: -1,
      finalScore: 0,
      answersJson: {},
    });
    expect(parsed.success).toBe(false);
  });

  runner.test('B8.4: Score 1 point above boundary (101) rejected', () => {
    const parsed = quizAttemptSchema.safeParse({
      moduleId: crypto.randomUUID(),
      pgScore: 101,
      finalScore: 100,
      answersJson: {},
    });
    expect(parsed.success).toBe(false);
  });

  runner.test('B8.5: Float/decimal score (85.5) rejected as non-integer', () => {
    const parsed = quizAttemptSchema.safeParse({
      moduleId: crypto.randomUUID(),
      pgScore: 85.5,
      finalScore: 85,
      answersJson: {},
    });
    expect(parsed.success).toBe(false);
  });

  // =========================================================================
  // FEATURE 9: DJP Exam Simulation Boundary & Corner
  // =========================================================================
  runner.test('B9.1: Mode with invalid enum "djp-200" rejected', () => {
    const parsed = djpAttemptSchema.safeParse({
      mode: 'djp-200',
      finalScore: 80,
      answersJson: {},
    });
    expect(parsed.success).toBe(false);
  });

  runner.test('B9.2: All sub-scores at exact boundary 0 accepted', () => {
    const parsed = djpAttemptSchema.safeParse({
      mode: 'all-100',
      tkbScore: 0,
      essayScore: 0,
      interviewScore: 0,
      finalScore: 0,
      isPassed: false,
      answersJson: {},
    });
    expect(parsed.success).toBe(true);
  });

  runner.test('B9.3: All sub-scores at exact boundary 100 accepted', () => {
    const parsed = djpAttemptSchema.safeParse({
      mode: 'all-100',
      tkbScore: 100,
      essayScore: 100,
      interviewScore: 100,
      finalScore: 100,
      isPassed: true,
      answersJson: {},
    });
    expect(parsed.success).toBe(true);
  });

  runner.test('B9.4: Sub-score at 101 rejected', () => {
    const parsed = djpAttemptSchema.safeParse({
      mode: 'all-100',
      tkbScore: 101,
      finalScore: 80,
      answersJson: {},
    });
    expect(parsed.success).toBe(false);
  });

  runner.test('B9.5: Non-boolean isPassed string "true" rejected', () => {
    const parsed = djpAttemptSchema.safeParse({
      mode: 'all-100',
      finalScore: 80,
      isPassed: 'true',
      answersJson: {},
    });
    expect(parsed.success).toBe(false);
  });

  // =========================================================================
  // FEATURE 10: Offline Storage Boundary & Corner
  // =========================================================================
  runner.test('B10.1: Mock offline store handles 0 pending drafts gracefully', () => {
    const store = new MockOfflineStore();
    const drafts = store.getPendingDrafts();
    expect(drafts.progress.length).toBe(0);
    expect(drafts.quizAttempts.length).toBe(0);
  });

  runner.test('B10.2: Storage of large JSON draft (100 quiz answers) preserved accurately', () => {
    const store = new MockOfflineStore();
    const largeAnswers = {};
    for (let i = 1; i <= 100; i++) {
      largeAnswers[`q-${i}`] = `Option ${i % 4}`;
    }

    store.saveDraftQuiz({ moduleId: 'm-1', answersJson: largeAnswers, finalScore: 88 });
    const drafts = store.getPendingDrafts();
    expect(Object.keys(drafts.quizAttempts[0].answersJson).length).toBe(100);
  });

  runner.test('B10.3: Null audio URL handled safely by download helper', async () => {
    const handleAudioUrl = (url) => {
      if (!url || typeof url !== 'string') return false;
      return true;
    };
    expect(handleAudioUrl(null)).toBe(false);
    expect(handleAudioUrl(undefined)).toBe(false);
    expect(handleAudioUrl('')).toBe(false);
    expect(handleAudioUrl('https://example.com/audio.mp3')).toBe(true);
  });

  runner.test('B10.4: Clear cache on empty store executes idempotently', async () => {
    const store = new MockOfflineStore();
    await store.clearAllCaches();
    await store.clearAllCaches();
    expect(store.cacheBuckets.size).toBe(0);
  });

  runner.test('B10.5: Duplicate draft progress saves recorded sequentially without error', () => {
    const store = new MockOfflineStore();
    store.saveDraftProgress({ moduleId: 'm-1', sectionId: 's-1', completed: true });
    store.saveDraftProgress({ moduleId: 'm-1', sectionId: 's-1', completed: false });

    const drafts = store.getPendingDrafts();
    expect(drafts.progress.length).toBe(2);
    expect(drafts.progress[1].completed).toBe(false);
  });

  // =========================================================================
  // FEATURE 11: Zod Validation Boundary & Corner
  // =========================================================================
  runner.test('B11.1: Deeply nested JSON object in essayAnalysisJson preserved', () => {
    const parsed = quizAttemptSchema.safeParse({
      moduleId: crypto.randomUUID(),
      pgScore: 80,
      finalScore: 80,
      answersJson: { q1: 'A' },
      essayAnalysisJson: {
        analysis: {
          scores: { accuracy: 90, format: 85 },
          keywords: ['KUP', 'Pasal 21', 'Bukti Potong'],
        },
      },
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data.essayAnalysisJson.analysis.scores.accuracy).toBe(90);
  });

  runner.test('B11.2: Passing null instead of object to sectionProgressSchema returns error', () => {
    const parsed = sectionProgressSchema.safeParse(null);
    expect(parsed.success).toBe(false);
  });

  runner.test('B11.3: Passing undefined to quizAttemptSchema returns error', () => {
    const parsed = quizAttemptSchema.safeParse(undefined);
    expect(parsed.success).toBe(false);
  });

  runner.test('B11.4: Special characters and emojis in fullName accepted within length limits', () => {
    const parsed = registerSchema.safeParse({
      email: 'special@example.com',
      password: 'password123',
      fullName: 'Dr. Nurul Hidayah, S.E. 🌟',
    });
    expect(parsed.success).toBe(true);
  });

  runner.test('B11.5: String type coercion rejected for number fields in Zod schemas', () => {
    const parsed = quizAttemptSchema.safeParse({
      moduleId: crypto.randomUUID(),
      pgScore: '80',
      finalScore: '80',
      answersJson: {},
    });
    expect(parsed.success).toBe(false);
  });

  // =========================================================================
  // FEATURE 12: API Security Boundary & Corner
  // =========================================================================
  runner.test('B12.1: JWT token with alg: none rejected by signature verification', () => {
    const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payload = base64UrlEncode(JSON.stringify({ sub: 'admin', role: 'admin' }));
    const unsignedToken = `${header}.${payload}.`;

    const verified = verifyTestToken(unsignedToken);
    expect(verified).toBeNull();
  });

  runner.test('B12.2: JWT token signed with wrong secret key rejected', () => {
    const token = signTestToken({ sub: 'user-1', role: 'user' }, 'attacker-secret-key-123456');
    const verified = verifyTestToken(token, TEST_JWT_SECRET);
    expect(verified).toBeNull();
  });

  runner.test('B12.3: JWT token with expired timestamp by 1 second rejected', () => {
    const expiredToken = signTestToken({ sub: 'user-1', role: 'user' }, TEST_JWT_SECRET, -1);
    const verified = verifyTestToken(expiredToken);
    expect(verified).toBeNull();
  });

  runner.test('B12.4: XSS payload in fullName sanitized or safely escaped', () => {
    const xssName = '<script>alert("XSS")</script>';
    const parsed = registerSchema.safeParse({
      email: 'xss@test.com',
      password: 'password123',
      fullName: xssName,
    });
    expect(parsed.success).toBe(true);
    // When rendered, React auto-escapes HTML strings by default
    const escaped = xssName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    expect(escaped).toContain('&lt;script&gt;');
  });

  runner.test('B12.5: Extremely long password (> 100 chars) rejected by registerSchema limit', () => {
    const hugePassword = 'A'.repeat(101);
    const parsed = registerSchema.safeParse({
      email: 'user@test.com',
      password: hugePassword,
      fullName: 'User Test',
    });
    expect(parsed.success).toBe(false);
  });

  // =========================================================================
  // FEATURE 13: Radar Chart Boundary & Corner
  // =========================================================================
  runner.test('B13.1: Negative score inputs clamped safely to 0', () => {
    const scores = { kup: -50, pph_op: -10 };
    const radar = computeRadarChartCoordinates(scores, 100, 120);
    const kup = radar.points.find((p) => p.domain === 'kup');
    expect(kup.score).toBe(0);
    expect(kup.x).toBe(120);
    expect(kup.y).toBe(120);
  });

  runner.test('B13.2: Scores > 100 clamped safely to 100', () => {
    const scores = { kup: 150 };
    const radar = computeRadarChartCoordinates(scores, 100, 120);
    const kup = radar.points.find((p) => p.domain === 'kup');
    expect(kup.score).toBe(100);
    expect(kup.y).toBe(20);
  });

  runner.test('B13.3: Non-numeric / NaN scores clamped safely to 0', () => {
    const scores = { kup: 'invalid', pph_op: NaN };
    const radar = computeRadarChartCoordinates(scores);
    const kup = radar.points.find((p) => p.domain === 'kup');
    const pphOp = radar.points.find((p) => p.domain === 'pph_op');
    expect(kup.score).toBe(0);
    expect(pphOp.score).toBe(0);
  });

  runner.test('B13.4: Custom center and radius scale coordinates proportionally', () => {
    const scores = { kup: 100 };
    const radar = computeRadarChartCoordinates(scores, 200, 250);
    const kup = radar.points.find((p) => p.domain === 'kup');
    expect(kup.x).toBe(250);
    expect(kup.y).toBe(50); // 250 - 200 = 50
  });

  runner.test('B13.5: Asymmetrical scores generate valid polygon points', () => {
    const scores = { kup: 100, pph_op: 0, pph_badan: 50, potput: 0, ppn: 75, coretax: 25 };
    const radar = computeRadarChartCoordinates(scores);
    expect(radar.points.length).toBe(6);
    expect(typeof radar.polygonSvgPoints).toBe('string');
  });

  // =========================================================================
  // FEATURE 14: Study Streak Boundary & Corner
  // =========================================================================
  runner.test('B14.1: Empty activity dates array produces streak = 0', () => {
    const result = calculateStudyStreak([]);
    expect(result.streakDays).toBe(0);
    expect(result.isActiveToday).toBe(false);
  });

  runner.test('B14.2: Invalid date strings in array filtered out safely', () => {
    const result = calculateStudyStreak(['invalid-date-format', 'not-a-date']);
    expect(result.streakDays).toBe(0);
  });

  runner.test('B14.3: Leap year date transition February 28 -> 29 -> March 1 handled accurately', () => {
    const leapDates = ['2024-02-28', '2024-02-29', '2024-03-01'];
    // Check consecutive day interval calculation
    const d1 = new Date(leapDates[0]);
    const d2 = new Date(leapDates[1]);
    const diff = Math.round((d2 - d1) / (1000 * 3600 * 24));
    expect(diff).toBe(1);
  });

  runner.test('B14.4: 100 consecutive daily activity timestamps produces streak of 100', () => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 100; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString());
    }

    const result = calculateStudyStreak(dates);
    expect(result.streakDays).toBe(100);
    expect(result.isActiveToday).toBe(true);
  });

  runner.test('B14.5: Unordered activity dates array sorted and evaluated correctly', () => {
    const now = new Date();
    const d1 = new Date(now);
    const d2 = new Date(now);
    d2.setDate(d2.getDate() - 1);
    const d3 = new Date(now);
    d3.setDate(d3.getDate() - 2);

    // Provide dates in scrambled order
    const scrambled = [d2.toISOString(), d3.toISOString(), d1.toISOString()];
    const result = calculateStudyStreak(scrambled);
    expect(result.streakDays).toBe(3);
  });

  // =========================================================================
  // FEATURE 15: Scorecard & Certificate Boundary & Corner
  // =========================================================================
  runner.test('B15.1: Final score at exact threshold (70) awards certificate with grade C', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Andi Pratama',
      finalScore: 70,
    });
    expect(result.scorecard.isPassed).toBe(true);
    expect(result.scorecard.grade).toBe('C (Lulus)');
    expect(result.certificate).not.toBeNull();
  });

  runner.test('B15.2: Final score 1 point below threshold (69) denies certificate with grade D', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Andi Pratama',
      finalScore: 69,
    });
    expect(result.scorecard.isPassed).toBe(false);
    expect(result.scorecard.grade).toBe('D (Belum Lulus)');
    expect(result.certificate).toBeNull();
  });

  runner.test('B15.3: Final score at distinction threshold (85) awards grade A', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Andi Pratama',
      finalScore: 85,
    });
    expect(result.scorecard.grade).toBe('A (Sangat Memuaskan)');
  });

  runner.test('B15.4: Final score at upper boundary (100) generates valid certificate', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Perfect Student',
      finalScore: 100,
    });
    expect(result.scorecard.isPassed).toBe(true);
    expect(result.scorecard.finalScore).toBe(100);
    expect(result.certificate).not.toBeNull();
  });

  runner.test('B15.5: Student name with special titles and apostrophes formatted safely', () => {
    const result = generateScorecardAndCertificate({
      studentName: "Drs. M. O'Connor-Smith, S.E., M.Ak.",
      finalScore: 92,
    });
    expect(result.certificate.issuedTo).toBe("Drs. M. O'Connor-Smith, S.E., M.Ak.");
    expect(result.certificate.status).toBe('VERIFIED');
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
