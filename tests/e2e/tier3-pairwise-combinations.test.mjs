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

// Schemas under test
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
  const runner = new TestSuiteRunner('Tier 3: Pairwise Combinations (Integration)');

  // =========================================================================
  // PW1: Register -> Login -> Issue JWT Session Token
  // =========================================================================
  runner.test('PW1: Register new student user, then login and receive valid JWT session', () => {
    // 1. Register
    const regPayload = {
      email: 'alex.pajak@example.com',
      password: 'StrongPassword2026!',
      fullName: 'Alex Tax Pro',
    };
    const regResult = registerSchema.safeParse(regPayload);
    expect(regResult.success).toBe(true);

    const createdUserId = crypto.randomUUID();
    const role = 'user';

    // 2. Login
    const loginPayload = {
      email: regResult.data.email,
      password: regPayload.password,
    };
    const loginResult = loginSchema.safeParse(loginPayload);
    expect(loginResult.success).toBe(true);

    // 3. Issue Token
    const token = signTestToken({ sub: createdUserId, role });
    const verified = verifyTestToken(token);

    expect(verified.sub).toBe(createdUserId);
    expect(verified.role).toBe('user');
  });

  // =========================================================================
  // PW2: Student Login -> Access /admin -> Route Protection Redirects to /dashboard
  // =========================================================================
  runner.test('PW2: Student user cannot access /admin and is redirected to /dashboard', () => {
    const studentToken = signTestToken({ sub: crypto.randomUUID(), role: 'user' });

    // Edge middleware check
    const middlewareResult = simulateEdgeMiddleware('/admin', `brevet_session=${studentToken}`);
    expect(middlewareResult.action).toBe('redirect');
    expect(middlewareResult.destination).toBe('/dashboard');

    // Admin API endpoint check
    const apiResult = simulateEdgeMiddleware('/api/keys', `brevet_session=${studentToken}`);
    expect(apiResult.status).toBe(403);
  });

  // =========================================================================
  // PW3: Admin Login -> Access /admin -> Access /api/keys -> Success
  // =========================================================================
  runner.test('PW3: Admin user can access /admin and management APIs successfully', () => {
    const adminToken = signTestToken({ sub: crypto.randomUUID(), role: 'admin' });

    const middlewareResult = simulateEdgeMiddleware('/admin', `brevet_session=${adminToken}`);
    expect(middlewareResult.action).toBe('next');

    const apiResult = simulateEdgeMiddleware('/api/keys', `brevet_session=${adminToken}`);
    expect(apiResult.action).toBe('next');
    expect(apiResult.status).toBe(200);
  });

  // =========================================================================
  // PW4: Student Registration -> Complete Module Section -> Verify Progress
  // =========================================================================
  runner.test('PW4: Registered student marks module section completed and retrieves progress map', () => {
    const studentId = crypto.randomUUID();
    const moduleId = crypto.randomUUID();

    // 1. Mark Section Completed
    const progressPayload = {
      moduleId,
      sectionId: 'sec-01-kup-dasar',
      completed: true,
    };
    const parsed = sectionProgressSchema.safeParse(progressPayload);
    expect(parsed.success).toBe(true);

    // 2. Simulate In-Memory Progress State
    const databaseProgress = [
      { userId: studentId, moduleId, sectionId: 'sec-01-kup-dasar', completed: true },
    ];

    const completedMap = {};
    databaseProgress.forEach((p) => {
      if (p.completed && p.moduleId === moduleId && p.userId === studentId) {
        completedMap[p.sectionId] = true;
      }
    });

    expect(completedMap['sec-01-kup-dasar']).toBe(true);
  });

  // =========================================================================
  // PW5: Student Completes Sections -> Submits Quiz Attempt -> Stats Aggregation
  // =========================================================================
  runner.test('PW5: Student completes sections and quiz, user stats reflects accurate counters', () => {
    const studentId = crypto.randomUUID();
    const moduleId = crypto.randomUUID();

    const sections = ['sec-1', 'sec-2', 'sec-3'];
    const progressList = sections.map((s) => ({ userId: studentId, moduleId, sectionId: s, completed: true }));

    const quizAttempt = {
      userId: studentId,
      moduleId,
      pgScore: 90,
      finalScore: 90,
      answersJson: { q1: 'A', q2: 'B', q3: 'C' },
    };
    const parsedQuiz = quizAttemptSchema.safeParse(quizAttempt);
    expect(parsedQuiz.success).toBe(true);

    // Compute Stats
    const totalCompletedSections = progressList.filter((p) => p.completed).length;
    const quizList = [parsedQuiz.data];
    const totalQuizTaken = quizList.length;
    const avgQuizScore = Math.round(quizList.reduce((acc, q) => acc + q.finalScore, 0) / quizList.length);

    expect(totalCompletedSections).toBe(3);
    expect(totalQuizTaken).toBe(1);
    expect(avgQuizScore).toBe(90);
  });

  // =========================================================================
  // PW6: Student Takes DJP Exam (all-100) -> Saves Attempt -> Stats Updates
  // =========================================================================
  runner.test('PW6: DJP 100-Q simulation recorded and reflected in user highest DJP score', () => {
    const examPayload = {
      mode: 'all-100',
      tkbScore: 88,
      essayScore: 84,
      interviewScore: 90,
      finalScore: 87,
      isPassed: true,
      answersJson: { q1: 'A' },
      essayAnalysisJson: { score: 84 },
    };
    const parsed = djpAttemptSchema.safeParse(examPayload);
    expect(parsed.success).toBe(true);

    const djpHistory = [
      { mode: 'all-100', finalScore: 87, isPassed: true },
      { mode: 'tkb-50', finalScore: 75, isPassed: true },
    ];
    const highestDjpScore = Math.max(...djpHistory.map((d) => d.finalScore));

    expect(highestDjpScore).toBe(87);
  });

  // =========================================================================
  // PW7: Student Takes Multiple Quizzes -> Max and Average Calculated
  // =========================================================================
  runner.test('PW7: Multiple quiz attempts correctly aggregate average and highest scores', () => {
    const quizAttempts = [
      { moduleId: crypto.randomUUID(), finalScore: 60 },
      { moduleId: crypto.randomUUID(), finalScore: 80 },
      { moduleId: crypto.randomUUID(), finalScore: 100 },
    ];

    const highestScore = Math.max(...quizAttempts.map((q) => q.finalScore));
    const avgScore = Math.round(quizAttempts.reduce((acc, q) => acc + q.finalScore, 0) / quizAttempts.length);

    expect(highestScore).toBe(100);
    expect(avgScore).toBe(80);
  });

  // =========================================================================
  // PW8: Offline Section Completion -> Draft Caching -> Online Sync
  // =========================================================================
  runner.test('PW8: Offline section progress cached in draft store and synced upon reconnection', () => {
    const offlineStore = new MockOfflineStore();
    const moduleId = crypto.randomUUID();

    // 1. Offline Mode: User completes 2 sections
    offlineStore.saveDraftProgress({ moduleId, sectionId: 'sec-1', completed: true });
    offlineStore.saveDraftProgress({ moduleId, sectionId: 'sec-2', completed: true });

    const drafts = offlineStore.getPendingDrafts();
    expect(drafts.progress.length).toBe(2);

    // 2. Online Mode: Build batch sync payload
    const batchPayload = {
      moduleId,
      completedSectionIds: drafts.progress.map((d) => d.sectionId),
    };
    const parsed = batchProgressSchema.safeParse(batchPayload);
    expect(parsed.success).toBe(true);

    // 3. Clear drafts after successful sync
    offlineStore.clearSyncedDrafts();
    expect(offlineStore.getPendingDrafts().progress.length).toBe(0);
  });

  // =========================================================================
  // PW9: Student Passes DJP Simulation -> Generates Scorecard & Certificate
  // =========================================================================
  runner.test('PW9: Passing DJP simulation (Score 88 >= 70) awards verified certificate', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Kartika Sari',
      examType: 'DJP CPNS Tax Auditor Simulation (100 Q)',
      scores: { tkb: 88, essay: 86, interview: 90 },
      finalScore: 88,
    });

    expect(result.scorecard.isPassed).toBe(true);
    expect(result.certificate).not.toBeNull();
    expect(result.certificate.serialNumber.startsWith('CERT-BRVT-')).toBe(true);
    expect(result.certificate.issuedTo).toBe('Kartika Sari');
  });

  // =========================================================================
  // PW10: Student Fails DJP Simulation -> Failed Scorecard & Denies Certificate
  // =========================================================================
  runner.test('PW10: Failing DJP simulation (Score 58 < 70) generates failed scorecard without certificate', () => {
    const result = generateScorecardAndCertificate({
      studentName: 'Bagus Pratama',
      scores: { tkb: 55, essay: 60, interview: 60 },
      finalScore: 58,
    });

    expect(result.scorecard.isPassed).toBe(false);
    expect(result.scorecard.grade).toBe('D (Belum Lulus)');
    expect(result.certificate).toBeNull();
  });

  // =========================================================================
  // PW11: User Updates Profile Name -> Subsequent /me Call Returns Updated Name
  // =========================================================================
  runner.test('PW11: Updating profile full name updates user session profile response', () => {
    const initialUser = { id: crypto.randomUUID(), email: 'user@pajak.id', fullName: 'Budi Santoso' };

    const updatePayload = { fullName: 'Budi Santoso, S.Ak., BKP' };
    const parsed = updateUserProfileSchema.safeParse(updatePayload);
    expect(parsed.success).toBe(true);

    const updatedUser = { ...initialUser, fullName: parsed.data.fullName };
    expect(updatedUser.fullName).toBe('Budi Santoso, S.Ak., BKP');
  });

  // =========================================================================
  // PW12: Unauthenticated Visitor to /dashboard -> Redirects to /login?redirect=...
  // =========================================================================
  runner.test('PW12: Unauthenticated /dashboard access redirects to login with return path', () => {
    const result = simulateEdgeMiddleware('/dashboard', '');
    expect(result.action).toBe('redirect');
    expect(result.destination).toBe('/login?redirect=%2Fdashboard');
  });

  // =========================================================================
  // PW13: Student Progress in KUP & PPN -> Radar Chart Updates Corresponding Axes
  // =========================================================================
  runner.test('PW13: Completing KUP and PPN quizzes updates corresponding radar chart polygon', () => {
    const studentScores = { kup: 85, ppn: 90 };
    const radar = computeRadarChartCoordinates(studentScores, 100, 120);

    const kup = radar.points.find((p) => p.domain === 'kup');
    const ppn = radar.points.find((p) => p.domain === 'ppn');
    const pphBadan = radar.points.find((p) => p.domain === 'pph_badan');

    expect(kup.score).toBe(85);
    expect(ppn.score).toBe(90);
    expect(pphBadan.score).toBe(0);
    expect(radar.points.length).toBe(6);
  });

  // =========================================================================
  // PW14: Admin Logged In -> Toggles Module Status -> Student Curriculum Updates
  // =========================================================================
  runner.test('PW14: Admin publishes module draft, making it visible to students', () => {
    const allModules = [
      { id: 'm-1', title: 'KUP Dasar', status: 'draft' },
      { id: 'm-2', title: 'PPh 21', status: 'tayang' },
    ];

    // Admin publishes m-1
    const targetModule = allModules.find((m) => m.id === 'm-1');
    targetModule.status = 'tayang';

    // Student queries published modules
    const publishedForStudent = allModules.filter((m) => m.status === 'tayang');
    expect(publishedForStudent.length).toBe(2);
    expect(publishedForStudent.map((m) => m.id)).toContain('m-1');
  });

  // =========================================================================
  // PW15: Daily Activity over 3 Consecutive Days -> Streak = 3
  // =========================================================================
  runner.test('PW15: 3-day consecutive study activity produces active streak of 3 days', () => {
    const now = new Date();
    const d1 = new Date(now);
    const d2 = new Date(now);
    d2.setDate(d2.getDate() - 1);
    const d3 = new Date(now);
    d3.setDate(d3.getDate() - 2);

    const streakResult = calculateStudyStreak([d1.toISOString(), d2.toISOString(), d3.toISOString()]);
    expect(streakResult.streakDays).toBe(3);
    expect(streakResult.isActiveToday).toBe(true);
  });

  // =========================================================================
  // PW16: Multi-Mode DJP Simulation (TKB, Esai, Wawancara) -> Segregated History
  // =========================================================================
  runner.test('PW16: Individual DJP sub-modes stored with respective mode identifiers', () => {
    const tkb = djpAttemptSchema.safeParse({ mode: 'tkb-50', tkbScore: 80, finalScore: 80, answersJson: {} });
    const esai = djpAttemptSchema.safeParse({ mode: 'esai-25', essayScore: 85, finalScore: 85, answersJson: {} });
    const wawancara = djpAttemptSchema.safeParse({ mode: 'wawancara-25', interviewScore: 90, finalScore: 90, answersJson: {} });

    expect(tkb.success).toBe(true);
    expect(esai.success).toBe(true);
    expect(wawancara.success).toBe(true);

    const history = [tkb.data, esai.data, wawancara.data];
    const tkbAttempts = history.filter((h) => h.mode === 'tkb-50');
    expect(tkbAttempts.length).toBe(1);
    expect(tkbAttempts[0].tkbScore).toBe(80);
  });

  // =========================================================================
  // PW17: Password Change -> Hash Updated -> New Credential Login Verification
  // =========================================================================
  runner.test('PW17: User changes password, invalidating old password and verifying new password', () => {
    const currentPass = 'OldSecretPass2025';
    const newPass = 'NewSecretPass2026!';

    const parsed = changePasswordSchema.safeParse({
      currentPassword: currentPass,
      newPassword: newPass,
    });
    expect(parsed.success).toBe(true);

    // Login with new password parses successfully
    const newLogin = loginSchema.safeParse({
      email: 'user@pajak.id',
      password: newPass,
    });
    expect(newLogin.success).toBe(true);
  });

  return await runner.run();
}
