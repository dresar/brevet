import crypto from 'node:crypto';

// ============================================================
// 1. TEST FRAMEWORK & RUNNER CORE
// ============================================================

export class TestSuiteRunner {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.tests = [];
    this.beforeAllFns = [];
    this.afterAllFns = [];
    this.beforeEachFns = [];
    this.afterEachFns = [];
  }

  beforeAll(fn) {
    this.beforeAllFns.push(fn);
  }

  afterAll(fn) {
    this.afterAllFns.push(fn);
  }

  beforeEach(fn) {
    this.beforeEachFns.push(fn);
  }

  afterEach(fn) {
    this.afterEachFns.push(fn);
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    const results = {
      suiteName: this.suiteName,
      total: this.tests.length,
      passed: 0,
      failed: 0,
      details: [],
    };

    try {
      for (const fn of this.beforeAllFns) {
        await fn();
      }
    } catch (err) {
      console.error(`[${this.suiteName}] beforeAll failed:`, err);
      results.failed = this.tests.length;
      results.details.push({
        name: 'beforeAll hook',
        status: 'FAILED',
        error: err.message || String(err),
      });
      return results;
    }

    for (const { name, fn } of this.tests) {
      const testResult = { name, status: 'PASSED', error: null, durationMs: 0 };
      const start = Date.now();

      try {
        for (const bFn of this.beforeEachFns) {
          await bFn();
        }

        await fn();

        for (const aFn of this.afterEachFns) {
          await aFn();
        }

        testResult.durationMs = Date.now() - start;
        results.passed++;
      } catch (err) {
        testResult.status = 'FAILED';
        testResult.error = err.message || String(err);
        testResult.durationMs = Date.now() - start;
        results.failed++;
      }

      results.details.push(testResult);
    }

    try {
      for (const fn of this.afterAllFns) {
        await fn();
      }
    } catch (err) {
      console.error(`[${this.suiteName}] afterAll failed:`, err);
    }

    return results;
  }
}

// ============================================================
// 2. EXPECT & ASSERTION LIBRARY WITH .not SUPPORT
// ============================================================

function createMatchers(actual, isNot = false) {
  return {
    toBe(expected) {
      const pass = actual === expected;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${JSON.stringify(actual)} NOT to be ${JSON.stringify(expected)}`
            : `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`
        );
      }
    },
    toEqual(expected) {
      const actualJson = JSON.stringify(actual);
      const expectedJson = JSON.stringify(expected);
      const pass = actualJson === expectedJson;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${actualJson} NOT to equal ${expectedJson}`
            : `Expected ${actualJson} to equal ${expectedJson}`
        );
      }
    },
    toBeGreaterThan(num) {
      const pass = actual > num;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${actual} NOT to be greater than ${num}`
            : `Expected ${actual} to be greater than ${num}`
        );
      }
    },
    toBeGreaterThanOrEqual(num) {
      const pass = actual >= num;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${actual} NOT to be >= ${num}`
            : `Expected ${actual} to be >= ${num}`
        );
      }
    },
    toBeLessThan(num) {
      const pass = actual < num;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${actual} NOT to be less than ${num}`
            : `Expected ${actual} to be less than ${num}`
        );
      }
    },
    toBeLessThanOrEqual(num) {
      const pass = actual <= num;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${actual} NOT to be <= ${num}`
            : `Expected ${actual} to be <= ${num}`
        );
      }
    },
    toBeNull() {
      const pass = actual === null;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${JSON.stringify(actual)} NOT to be null`
            : `Expected ${JSON.stringify(actual)} to be null`
        );
      }
    },
    toBeDefined() {
      const pass = actual !== undefined;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected value to be undefined, received ${JSON.stringify(actual)}`
            : `Expected value to be defined, received undefined`
        );
      }
    },
    toBeUndefined() {
      const pass = actual === undefined;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected value NOT to be undefined, received undefined`
            : `Expected ${JSON.stringify(actual)} to be undefined`
        );
      }
    },
    toBeTruthy() {
      const pass = !!actual;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${JSON.stringify(actual)} NOT to be truthy`
            : `Expected ${JSON.stringify(actual)} to be truthy`
        );
      }
    },
    toBeFalsy() {
      const pass = !actual;
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${JSON.stringify(actual)} NOT to be falsy`
            : `Expected ${JSON.stringify(actual)} to be falsy`
        );
      }
    },
    toContain(item) {
      let pass = false;
      if (typeof actual === 'string') {
        pass = actual.includes(item);
      } else if (Array.isArray(actual)) {
        pass = actual.includes(item) || actual.some((x) => JSON.stringify(x) === JSON.stringify(item));
      } else {
        throw new Error(`toContain requires string or array, got ${typeof actual}`);
      }

      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected ${JSON.stringify(actual)} NOT to contain ${JSON.stringify(item)}`
            : `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`
        );
      }
    },
    toMatch(regex) {
      const reg = typeof regex === 'string' ? new RegExp(regex) : regex;
      const pass = reg.test(String(actual));
      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected "${actual}" NOT to match pattern ${regex}`
            : `Expected "${actual}" to match pattern ${regex}`
        );
      }
    },
    toHaveProperty(prop, value) {
      const hasProp = typeof actual === 'object' && actual !== null && prop in actual;
      let pass = hasProp;
      if (hasProp && value !== undefined) {
        pass = actual[prop] === value;
      }

      if (isNot ? pass : !pass) {
        throw new Error(
          isNot
            ? `Expected object NOT to have property "${prop}"`
            : `Expected object to have property "${prop}"`
        );
      }
    },
  };
}

export function expect(actual) {
  const matchers = createMatchers(actual, false);
  matchers.not = createMatchers(actual, true);
  return matchers;
}

// ============================================================
// 3. JWT & CRYPTO SIMULATION UTILITIES
// ============================================================

export const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-brevet-ab-super-secret-jwt-key-2026-secure-32b';

export function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function signTestToken(payload, secret = TEST_JWT_SECRET, expiresInSec = 30 * 24 * 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSec,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyTestToken(token, secret = TEST_JWT_SECRET) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // expired
    }
    return payload;
  } catch {
    return null;
  }
}

// ============================================================
// 4. EDGE MIDDLEWARE & ROUTE PROTECTION SIMULATOR
// ============================================================

export const PUBLIC_PATHS = [
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

export function simulateEdgeMiddleware(urlPath, cookieHeader = '') {
  let session = null;
  if (cookieHeader) {
    const match = cookieHeader.match(/brevet_session=([^;]+)/);
    if (match) {
      session = verifyTestToken(decodeURIComponent(match[1]));
    }
  }

  // 1. Redirect logged-in users away from /login & /register
  if (urlPath === '/login' || urlPath === '/register') {
    if (session) {
      if (session.role === 'admin') {
        return { action: 'redirect', destination: '/admin', status: 307 };
      }
      return { action: 'redirect', destination: '/dashboard', status: 307 };
    }
    return { action: 'next', status: 200 };
  }

  // 2. Guard /admin/* routes — ONLY for role === 'admin'
  if (urlPath.startsWith('/admin')) {
    if (!session) {
      return { action: 'redirect', destination: `/login?redirect=${encodeURIComponent(urlPath)}`, status: 307 };
    }
    if (session.role !== 'admin') {
      return { action: 'redirect', destination: '/dashboard', status: 307 };
    }
    return { action: 'next', status: 200 };
  }

  // 3. Guard /dashboard/* and /profil/* routes — Any logged-in user
  if (urlPath.startsWith('/dashboard') || urlPath.startsWith('/profil')) {
    if (!session) {
      return { action: 'redirect', destination: `/login?redirect=${encodeURIComponent(urlPath)}`, status: 307 };
    }
    return { action: 'next', status: 200 };
  }

  // 4. Public paths
  if (
    PUBLIC_PATHS.some((p) => urlPath === p || urlPath.startsWith(p + '/')) ||
    urlPath.startsWith('/api/belajar')
  ) {
    return { action: 'next', status: 200 };
  }

  // 5. Protected Admin API routes
  if (urlPath.startsWith('/api/admin') || urlPath.startsWith('/api/keys')) {
    if (!session) {
      return { action: 'error', status: 401, body: { error: 'Belum login. Silakan login terlebih dahulu.' } };
    }
    if (session.role !== 'admin') {
      return { action: 'error', status: 403, body: { error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' } };
    }
    return { action: 'next', status: 200 };
  }

  // Protected User API routes
  if (urlPath.startsWith('/api/user/')) {
    if (!session) {
      return { action: 'error', status: 401, body: { error: 'Belum login. Silakan login terlebih dahulu.' } };
    }
    return { action: 'next', status: 200 };
  }

  return { action: 'next', status: 200 };
}

// ============================================================
// 5. RADAR CHART COMPUTATION SIMULATOR
// ============================================================

export const TAX_DOMAINS = [
  { key: 'kup', name: 'Ketentuan Umum Perpajakan (KUP)', weight: 15 },
  { key: 'pph_op', name: 'PPh Orang Pribadi', weight: 20 },
  { key: 'pph_badan', name: 'PPh Badan & Rekonsiliasi Fiskal', weight: 25 },
  { key: 'potput', name: 'PPh Pemotongan & Pemungutan (Potput)', weight: 15 },
  { key: 'ppn', name: 'PPN & PPnBM', weight: 15 },
  { key: 'coretax', name: 'Coretax DJP & Kepatuhan', weight: 10 },
];

export function computeRadarChartCoordinates(scores, radius = 100, center = 120) {
  const totalAxes = TAX_DOMAINS.length;
  const angleStep = (2 * Math.PI) / totalAxes;

  const points = TAX_DOMAINS.map((domain, index) => {
    let rawScore = scores[domain.key] ?? 0;
    const clampedScore = Math.max(0, Math.min(100, Number(rawScore) || 0));
    const r = (clampedScore / 100) * radius;
    const angle = index * angleStep - Math.PI / 2;
    const x = Math.round((center + r * Math.cos(angle)) * 100) / 100;
    const y = Math.round((center + r * Math.sin(angle)) * 100) / 100;
    return { domain: domain.key, score: clampedScore, x, y };
  });

  const polygonSvgPoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  return { points, polygonSvgPoints };
}

// ============================================================
// 6. STUDY STREAK & ACTIVITY HEATMAP SIMULATOR
// ============================================================

export function calculateStudyStreak(activityDates) {
  if (!activityDates || activityDates.length === 0) return { streakDays: 0, isActiveToday: false };

  const uniqueDates = Array.from(
    new Set(
      activityDates
        .map((d) => {
          const date = new Date(d);
          return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
        })
        .filter(Boolean)
    )
  ).sort().reverse();

  if (uniqueDates.length === 0) return { streakDays: 0, isActiveToday: false };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const latestDate = uniqueDates[0];
  const isActiveToday = latestDate === todayStr;

  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    return { streakDays: 0, isActiveToday: false };
  }

  let streak = 0;
  let expectedDate = new Date(latestDate);

  for (const dStr of uniqueDates) {
    const currDate = new Date(dStr);
    const diffDays = Math.round((expectedDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { streakDays: streak, isActiveToday };
}

// ============================================================
// 7. SCORECARD & CERTIFICATE GENERATOR SIMULATOR
// ============================================================

export function generateScorecardAndCertificate({
  studentName,
  examType = 'Brevet AB Final Simulation',
  scores = { tkb: 0, essay: 0, interview: 0 },
  finalScore = 0,
  passingThreshold = 70,
}) {
  const isPassed = finalScore >= passingThreshold;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  const scorecard = {
    studentName: studentName.trim(),
    examType,
    date: now.toISOString(),
    scores: {
      tkb: Math.max(0, Math.min(100, scores.tkb || 0)),
      essay: Math.max(0, Math.min(100, scores.essay || 0)),
      interview: Math.max(0, Math.min(100, scores.interview || 0)),
    },
    finalScore: Math.max(0, Math.min(100, finalScore)),
    isPassed,
    grade:
      finalScore >= 85
        ? 'A (Sangat Memuaskan)'
        : finalScore >= 75
        ? 'B (Memuaskan)'
        : finalScore >= 70
        ? 'C (Lulus)'
        : 'D (Belum Lulus)',
  };

  let certificate = null;
  if (isPassed) {
    certificate = {
      serialNumber: `CERT-BRVT-${dateStr}-${randomSuffix}`,
      issuedTo: studentName.trim(),
      title: 'Sertifikat Kompetensi Perpajakan Brevet AB & Simulasi DJP',
      issueDate: now.toISOString(),
      status: 'VERIFIED',
      verificationHash: crypto
        .createHash('sha256')
        .update(`${studentName}-${finalScore}-${dateStr}`)
        .digest('hex')
        .substring(0, 16),
    };
  }

  return { scorecard, certificate };
}

// ============================================================
// 8. OFFLINE STORAGE & DRAFT SYNC SIMULATOR
// ============================================================

export class MockOfflineStore {
  constructor() {
    this.draftProgress = [];
    this.draftQuizAttempts = [];
    this.cacheBuckets = new Map();
  }

  saveDraftProgress(item) {
    this.draftProgress.push({ ...item, savedAt: new Date().toISOString() });
  }

  saveDraftQuiz(item) {
    this.draftQuizAttempts.push({ ...item, savedAt: new Date().toISOString() });
  }

  getPendingDrafts() {
    return {
      progress: [...this.draftProgress],
      quizAttempts: [...this.draftQuizAttempts],
    };
  }

  clearSyncedDrafts() {
    this.draftProgress = [];
    this.draftQuizAttempts = [];
  }

  async putCache(bucketName, key, data) {
    if (!this.cacheBuckets.has(bucketName)) {
      this.cacheBuckets.set(bucketName, new Map());
    }
    this.cacheBuckets.get(bucketName).set(key, data);
  }

  async getCache(bucketName, key) {
    return this.cacheBuckets.get(bucketName)?.get(key) || null;
  }

  async clearAllCaches() {
    this.cacheBuckets.clear();
  }
}
