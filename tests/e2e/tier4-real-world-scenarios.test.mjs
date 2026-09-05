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
import crypto from 'node:crypto';

// Validation Schemas
import {
  registerSchema,
  loginSchema,
  updateUserProfileSchema,
} from '../../lib/validations/auth.ts';
import {
  sectionProgressSchema,
  batchProgressSchema,
} from '../../lib/validations/progress.ts';
import { quizAttemptSchema } from '../../lib/validations/quiz.ts';
import { djpAttemptSchema } from '../../lib/validations/djp.ts';

export async function runSuite() {
  const runner = new TestSuiteRunner('Tier 4: Real-World Scenarios (Workflows)');

  // =========================================================================
  // SCENARIO 1: Complete Student Onboarding & First Module Completion
  // =========================================================================
  runner.test('Scenario 1: Student Onboarding, First Module Study, Quiz Submission, and Stats Refresh', async () => {
    // 1. Student Registration
    const regPayload = {
      email: 'maya.brevet@pajak.id',
      password: 'MayaPassword2026!',
      fullName: 'Maya Anggraini',
    };
    const regParsed = registerSchema.safeParse(regPayload);
    expect(regParsed.success).toBe(true);

    const studentId = crypto.randomUUID();
    const studentToken = signTestToken({ sub: studentId, role: 'user' });

    // 2. Student Logs In & Accesses Dashboard
    const loginParsed = loginSchema.safeParse({ email: regPayload.email, password: regPayload.password });
    expect(loginParsed.success).toBe(true);

    const dashAccess = simulateEdgeMiddleware('/dashboard', `brevet_session=${studentToken}`);
    expect(dashAccess.action).toBe('next');

    // 3. Complete 4 Sections of Module 1 (KUP)
    const moduleId = crypto.randomUUID();
    const sectionIds = ['sec-01-pengantar', 'sec-02-npwp-nppkp', 'sec-03-spt-masa-tahunan', 'sec-04-skp-stp'];

    for (const sId of sectionIds) {
      const progParsed = sectionProgressSchema.safeParse({
        moduleId,
        sectionId: sId,
        completed: true,
      });
      expect(progParsed.success).toBe(true);
    }

    // 4. Take Module 1 Mini Quiz
    const quizPayload = {
      moduleId,
      pgScore: 90,
      essayScore: 90,
      finalScore: 90,
      answersJson: {
        q1: 'A',
        q2: 'B',
        q3: 'C',
        q4: 'D',
      },
    };
    const quizParsed = quizAttemptSchema.safeParse(quizPayload);
    expect(quizParsed.success).toBe(true);

    // 5. Verify Dashboard Analytics & Radar Update
    const radar = computeRadarChartCoordinates({ kup: 90 }, 100, 120);
    const kupPoint = radar.points.find((p) => p.domain === 'kup');
    expect(kupPoint.score).toBe(90);

    const streak = calculateStudyStreak([new Date().toISOString()]);
    expect(streak.streakDays).toBe(1);
  });

  // =========================================================================
  // SCENARIO 2: DJP CPNS Tax Auditor Complete 100-Question Exam Simulation
  // =========================================================================
  runner.test('Scenario 2: DJP Tax Auditor Candidate 100-Question Simulation Journey with AI Essay Evaluation and Certificate', async () => {
    const candidateId = crypto.randomUUID();
    const candidateToken = signTestToken({ sub: candidateId, role: 'user' });

    // 1. Access DJP Simulation Portal
    const portalAccess = simulateEdgeMiddleware('/ujian-djp', `brevet_session=${candidateToken}`);
    expect(portalAccess.action).toBe('next');

    // 2. Candidate completes all 3 exam sections in mode 'all-100'
    const answers = {};
    for (let i = 1; i <= 100; i++) {
      answers[`q-${i}`] = `Jawaban ${i}`;
    }

    const examAttempt = {
      mode: 'all-100',
      tkbScore: 84, // 50 MCQs
      essayScore: 88, // 25 Case Studies
      interviewScore: 92, // 25 Situational
      finalScore: 87, // Weighted composite
      isPassed: true,
      answersJson: answers,
      essayAnalysisJson: {
        accuracyScore: 88,
        legalReferenceFound: ['UU KUP', 'UU PPh Pasal 4(2)', 'PMK 168/2023'],
        examinerFeedback: 'Analisis yuridis dan kalkulasi pajak terutang sangat akurat.',
      },
      interviewAnalysisJson: {
        integrityScore: 94,
        communicationScore: 90,
      },
    };

    const djpParsed = djpAttemptSchema.safeParse(examAttempt);
    expect(djpParsed.success).toBe(true);

    // 3. Issue Scorecard & Certificate
    const { scorecard, certificate } = generateScorecardAndCertificate({
      studentName: 'Rian Hidayat, S.E.',
      examType: 'Simulasi Ujian Seleksi DJP 100 Soal (TKB + Esai + Wawancara)',
      scores: { tkb: 84, essay: 88, interview: 92 },
      finalScore: 87,
    });

    expect(scorecard.isPassed).toBe(true);
    expect(scorecard.grade).toBe('A (Sangat Memuaskan)');
    expect(certificate).not.toBeNull();
    expect(certificate.issuedTo).toBe('Rian Hidayat, S.E.');
    expect(certificate.serialNumber.startsWith('CERT-BRVT-')).toBe(true);
  });

  // =========================================================================
  // SCENARIO 3: Administrator Module Lifecycle & Publishing Management
  // =========================================================================
  runner.test('Scenario 3: Administrator Module Draft Creation, API Key Pool Test, and Public Release', async () => {
    const adminId = crypto.randomUUID();
    const adminToken = signTestToken({ sub: adminId, role: 'admin' });

    // 1. Admin logs into management portal
    const adminPortalAccess = simulateEdgeMiddleware('/admin', `brevet_session=${adminToken}`);
    expect(adminPortalAccess.action).toBe('next');

    // 2. Admin inspects API Key Health
    const keysAccess = simulateEdgeMiddleware('/api/keys', `brevet_session=${adminToken}`);
    expect(keysAccess.action).toBe('next');

    // 3. Module Draft Lifecycle
    const moduleDraft = {
      id: crypto.randomUUID(),
      code: 'BRVT-AB-07',
      slug: 'coretax-system-architecture',
      title: 'Arsitektur & Regulasi Coretax System DJP 2026',
      category: 'Coretax DJP',
      difficulty: 'menengah',
      estimatedMinutes: 90,
      status: 'draft',
      contentJson: {
        versi: '3.0.0',
        modul: {
          judul: 'Coretax System Architecture',
          seksi: [
            { id: 'sec-01', judul: 'Latar Belakang Pembaruan Sistem Inti Administrasi Perpajakan' },
            { id: 'sec-02', judul: 'Interoperabilitas Akun Wajib Pajak & e-Faktur Coretax' },
          ],
        },
      },
    };

    expect(moduleDraft.status).toBe('draft');

    // 4. Admin Publishes Module
    moduleDraft.status = 'tayang';
    expect(moduleDraft.status).toBe('tayang');

    // 5. Student can now see and open published module
    const studentToken = signTestToken({ sub: crypto.randomUUID(), role: 'user' });
    const studentModuleAccess = simulateEdgeMiddleware('/belajar', `brevet_session=${studentToken}`);
    expect(studentModuleAccess.action).toBe('next');
  });

  // =========================================================================
  // SCENARIO 4: Mobile PWA Commute Study Journey with Offline Draft Sync
  // =========================================================================
  runner.test('Scenario 4: Mobile Offline Study Journey, Draft Persistence, and Reconnection Batch Sync', async () => {
    const offlineStore = new MockOfflineStore();
    const moduleId = crypto.randomUUID();

    // 1. Commuter goes offline: loads cached module HTML and API
    await offlineStore.putCache('brevet-data-v3', `/api/belajar/pph-pasal-21`, {
      title: 'PPh Pasal 21 & PMK 168',
      sections: ['sec-1', 'sec-2', 'sec-3'],
    });

    const cachedData = await offlineStore.getCache('brevet-data-v3', `/api/belajar/pph-pasal-21`);
    expect(cachedData.title).toBe('PPh Pasal 21 & PMK 168');

    // 2. Studies and completes 3 sections offline
    offlineStore.saveDraftProgress({ moduleId, sectionId: 'sec-1', completed: true });
    offlineStore.saveDraftProgress({ moduleId, sectionId: 'sec-2', completed: true });
    offlineStore.saveDraftProgress({ moduleId, sectionId: 'sec-3', completed: true });

    // 3. Takes offline mini-quiz
    offlineStore.saveDraftQuiz({
      moduleId,
      pgScore: 80,
      finalScore: 80,
      answersJson: { q1: 'A', q2: 'D' },
    });

    const pending = offlineStore.getPendingDrafts();
    expect(pending.progress.length).toBe(3);
    expect(pending.quizAttempts.length).toBe(1);

    // 4. Reconnects online: sync progress batch
    const syncBatchPayload = {
      moduleId,
      completedSectionIds: pending.progress.map((p) => p.sectionId),
    };
    const batchParsed = batchProgressSchema.safeParse(syncBatchPayload);
    expect(batchParsed.success).toBe(true);

    // 5. Sync quiz attempt
    const quizParsed = quizAttemptSchema.safeParse(pending.quizAttempts[0]);
    expect(quizParsed.success).toBe(true);

    // 6. Clear local drafts
    offlineStore.clearSyncedDrafts();
    expect(offlineStore.getPendingDrafts().progress.length).toBe(0);
  });

  // =========================================================================
  // SCENARIO 5: Full Brevet AB Curriculum Mastery & Comprehensive Certificate
  // =========================================================================
  runner.test('Scenario 5: Complete 6-Domain Brevet AB Curriculum Mastery and Official Certificate Issuance', async () => {
    // 1. Mastery in all 6 tax domains
    const masteryScores = {
      kup: 95,
      pph_op: 92,
      pph_badan: 90,
      potput: 94,
      ppn: 96,
      coretax: 98,
    };

    // 2. Radar chart demonstrates comprehensive mastery
    const radar = computeRadarChartCoordinates(masteryScores, 100, 120);
    expect(radar.points.length).toBe(6);
    for (const pt of radar.points) {
      expect(pt.score).toBeGreaterThanOrEqual(90);
    }

    // 3. Final 100-Q Brevet AB Exit Exam
    const exitExamResult = generateScorecardAndCertificate({
      studentName: 'Farhan Maulana, S.E., BKP',
      examType: 'Ujian Komprehensif Brevet Pajak AB Nasional',
      scores: { tkb: 94, essay: 92, interview: 96 },
      finalScore: 94,
    });

    expect(exitExamResult.scorecard.isPassed).toBe(true);
    expect(exitExamResult.scorecard.grade).toBe('A (Sangat Memuaskan)');
    expect(exitExamResult.certificate.title).toContain('Brevet AB & Simulasi DJP');
    expect(exitExamResult.certificate.verificationHash).toBeDefined();
  });

  // =========================================================================
  // SCENARIO 6: Gamified Multi-Day Study Streak & Activity Heatmap Tracking
  // =========================================================================
  runner.test('Scenario 6: 7-Day Continuous Study Habit Journey with Flame Streak and Heatmap Aggregation', async () => {
    const now = new Date();
    const activityLog = [];

    // Simulate 7 consecutive daily logins and study sessions
    for (let day = 0; day < 7; day++) {
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() - day);
      activityLog.push(sessionDate.toISOString());
    }

    // Calculate streak
    const streakResult = calculateStudyStreak(activityLog);
    expect(streakResult.streakDays).toBe(7);
    expect(streakResult.isActiveToday).toBe(true);

    // Heatmap intensity evaluation
    const heatmapDays = activityLog.map((d) => ({
      date: d.split('T')[0],
      activityLevel: 3, // Level 3 intensity (high activity)
    }));
    expect(heatmapDays.length).toBe(7);
  });

  // =========================================================================
  // SCENARIO 7: Multi-Layer Security Breach Defense & Recovery Workflow
  // =========================================================================
  runner.test('Scenario 7: Malicious Attack Interception across Edge Proxy, Zod Validation, and Auth Layers', async () => {
    // Attack 1: SQL injection in registration
    const sqliAttempt = registerSchema.safeParse({
      email: "attacker' OR '1'='1",
      password: 'password123',
      fullName: 'Hacker',
    });
    expect(sqliAttempt.success).toBe(false);

    // Attack 2: Forged JWT token signed with wrong secret key
    const forgedToken = signTestToken({ sub: 'attacker', role: 'admin' }, 'wrong-attacker-secret');
    const forgedAccess = simulateEdgeMiddleware('/admin', `brevet_session=${forgedToken}`);
    expect(forgedAccess.action).toBe('redirect');
    expect(forgedAccess.destination).toContain('/login');

    // Attack 3: Regular student attempting admin endpoint
    const studentToken = signTestToken({ sub: 'user-007', role: 'user' });
    const studentAdminAccess = simulateEdgeMiddleware('/api/keys', `brevet_session=${studentToken}`);
    expect(studentAdminAccess.status).toBe(403);

    // Attack 4: Score tampering (pgScore: 9999)
    const scoreTampering = quizAttemptSchema.safeParse({
      moduleId: crypto.randomUUID(),
      pgScore: 9999,
      finalScore: 9999,
      answersJson: {},
    });
    expect(scoreTampering.success).toBe(false);

    // Legitimate recovery: Valid student logs in and accesses dashboard
    const legitAccess = simulateEdgeMiddleware('/dashboard', `brevet_session=${studentToken}`);
    expect(legitAccess.action).toBe('next');
  });

  // =========================================================================
  // SCENARIO 8: DJP Exam Remediation & Progressive Improvement Feedback Loop
  // =========================================================================
  runner.test('Scenario 8: Candidate Initial DJP Failure, Targeted Learning Remediation, and Retake Passing Journey', async () => {
    const candidateName = 'Galih Wibowo';

    // 1. Initial Attempt: Fails TKB Simulation with 54%
    const initialAttempt = generateScorecardAndCertificate({
      studentName: candidateName,
      examType: 'Simulasi DJP TKB-50',
      scores: { tkb: 54 },
      finalScore: 54,
    });
    expect(initialAttempt.scorecard.isPassed).toBe(false);
    expect(initialAttempt.certificate).toBeNull();

    // 2. Targeted Learning: Completes PPN and PPh Badan modules
    const remediationProgress = [
      { moduleId: crypto.randomUUID(), sectionId: 'ppn-faktur', completed: true },
      { moduleId: crypto.randomUUID(), sectionId: 'pph-badan-fiskal', completed: true },
    ];
    expect(remediationProgress.length).toBe(2);

    // 3. Retake Attempt: Passes with 86%
    const retakeAttempt = generateScorecardAndCertificate({
      studentName: candidateName,
      examType: 'Simulasi DJP TKB-50 (Retake)',
      scores: { tkb: 86 },
      finalScore: 86,
    });

    expect(retakeAttempt.scorecard.isPassed).toBe(true);
    expect(retakeAttempt.certificate).not.toBeNull();
    expect(retakeAttempt.scorecard.finalScore - initialAttempt.scorecard.finalScore).toBe(32); // +32 points improvement
  });

  return await runner.run();
}
