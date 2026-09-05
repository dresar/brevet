# Milestone 2 Technical Analysis: Persistent User Learning Progress & Exam History in PostgreSQL/Neon DB with Offline Fallback

**Author**: Milestone 2 Explorer (`teamwork_preview_explorer_m2_1`)  
**Date**: 2026-08-24  
**Project**: Brevet AB & DJP Tax Learning Platform (`brevet_mobile_revamp`)  
**Status**: COMPLETE  

---

## 1. Executive Summary

This investigation analyzed the backend persistence layers, API routes, database schemas, frontend event triggers, scoring algorithms, and offline synchronization mechanisms required for **Milestone 2 (Persistent User Learning Progress & Exam History in PostgreSQL/Neon DB with Offline Fallback)**.

### Primary Discoveries:
1. **Module Sections Progress (`module_sections_progress`)**:
   - The PostgreSQL table is properly indexed via `unique_user_module_section` on `(user_id, module_id, section_id)`.
   - `app/api/belajar/progress/route.ts` already employs PostgreSQL atomic upsert (`.onConflictDoUpdate`), while `app/api/user/progress/route.ts` performs a 2-step SELECT-then-UPDATE/INSERT.
   - Frontend `app/belajar/[slug]/page.tsx` loads completion state via `/api/belajar/[slug]` and mutates via `/api/belajar/progress` with optimistic cache update during offline mode.
2. **Mini-Quiz & 100-Question Final Exam Persistence (`user_quiz_attempts`)**:
   - `user_quiz_attempts` table stores `pgScore`, `essayScore`, `finalScore`, `answersJson`, and `essayAnalysisJson`.
   - `components/belajar/kuis-akhir.tsx` computes weighted final score `Math.round((pgScore * 0.8) + (essayScore * 0.2))` and persists to `user_quiz_attempts` via `POST /api/belajar/quiz-attempts`.
   - Draft progress is continuously stored in `localStorage` under `brevet_quiz_progress_${moduleId}`.
3. **DJP Exam Simulation Persistence (`djp_exam_attempts` across 4 Modes)**:
   - **Critical Gap Identified**: `components/djp/djp-cbt-exam.tsx` (line 192) submits finished exams to `/api/djp-exam/attempts` (which is an unpersisted stub route returning mock data) rather than `/api/user/djp-attempts` (the active PostgreSQL persistence route).
   - Furthermore, `djp-cbt-exam.tsx` does not compute weighted scores before posting, whereas `/api/user/djp-attempts` requires `{ mode, tkbScore, essayScore, interviewScore, finalScore, isPassed, answersJson, essayAnalysisJson, interviewAnalysisJson }`.
4. **Offline Fallback & Draft Synchronization**:
   - Offline assets and audio are managed via Cache API (`lib/offline-manager.ts`).
   - In-progress drafts for CBT exams and module quizzes auto-save to `localStorage`.
   - An offline synchronization queue engine (`lib/offline-sync-queue.ts` or integrated in `lib/offline-manager.ts`) is designed to capture offline completions and automatically flush pending sync payloads when network connectivity returns.

---

## 2. Detailed Technical Breakdown by Sub-System

### Part 1: Module Sections Progress Persistence

#### Database Schema (`lib/schema.ts` lines 95-116)
```typescript
export const moduleSectionsProgress = pgTable(
  'module_sections_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    sectionId: text('section_id').notNull(),
    completed: boolean('completed').default(false),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniqueProgress: uniqueIndex('unique_user_module_section').on(
      table.userId,
      table.moduleId,
      table.sectionId
    ),
  })
);
```

#### API Comparison:
1. `app/api/belajar/progress/route.ts`:
   - Validates using `toggleProgressSchema` (`lib/validators.ts`).
   - Verifies target module exists in `modules` table.
   - Executes atomic upsert:
     ```typescript
     await db
       .insert(moduleSectionsProgress)
       .values({ userId: auth.id, moduleId, sectionId, completed })
       .onConflictDoUpdate({
         target: [moduleSectionsProgress.userId, moduleSectionsProgress.moduleId, moduleSectionsProgress.sectionId],
         set: { completed, updatedAt: new Date() },
       });
     ```
2. `app/api/user/progress/route.ts`:
   - Handles `GET /api/user/progress?moduleId=...` returning `{ ok: true, completedSections: completedMap }` or all user progress.
   - Uses non-atomic `select` -> `if (existing) update else insert`.
   - **Recommendation**: Upgrade `app/api/user/progress/route.ts` to use `.onConflictDoUpdate` identical to `app/api/belajar/progress/route.ts` and ensure both routes support batch sync for offline flush.

#### Frontend Trigger Flow (`app/belajar/[slug]/page.tsx` & `section-renderer.tsx`):
- `SectionRenderer` renders completion toggle button next to each section header:
  ```tsx
  <button
    id={`complete-${bagian.id}`}
    onClick={() => onToggleComplete?.(bagian.id, !isCompleted)}
  >
    {isCompleted ? <CheckCircle className="text-green-400" /> : <Circle />}
  </button>
  ```
- `page.tsx` handles `handleToggleComplete`:
  - Triggers TanStack mutation `progressMutation.mutate({ moduleId: data.modul.id, sectionId, completed })`.
  - If `isOffline === true`, updates local query data in React Query cache immediately and informs user with toast icon `📴 Disimpan lokal (Mode Offline)`.

---

### Part 2: Mini-Quiz & 100-Question Final Exam Persistence

#### Database Schema (`lib/schema.ts` lines 217-242)
```typescript
export const userQuizAttempts = pgTable(
  'user_quiz_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    pgScore: integer('pg_score').notNull().default(0),
    essayScore: integer('essay_score').notNull().default(0),
    finalScore: integer('final_score').notNull().default(0),
    answersJson: jsonb('answers_json').notNull(),
    essayAnalysisJson: jsonb('essay_analysis_json'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userModuleIdx: index('user_quiz_attempts_user_module_idx').on(
      table.userId,
      table.moduleId
    ),
  })
);
```

#### Scoring Architecture:
- Pilihan Ganda (MCQ): `pgScore = Math.round((pgCorrectCount / pgTotal) * 100)`.
- Essay AI Evaluation: `averageEssayScore = Math.round(sum(essayScores) / essayTotal)`.
- Final Composite Score: `finalScore = Math.round((pgScore * 0.8) + (averageEssayScore * 0.2))`.
- Passing threshold: `isPassed = finalScore >= 70`.

#### Frontend Component Execution (`components/belajar/kuis-akhir.tsx`):
- `useEffect` mounts and reads `localStorage.getItem('brevet_quiz_progress_' + moduleId)`.
- Auto-saves intermediate choices, text answers, AI evaluation responses, and countdown timer.
- On `handleFinishQuiz`:
  ```typescript
  fetch('/api/belajar/quiz-attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      moduleId,
      pgScore: calculatedPgScore,
      essayScore: calculatedAvgEssay,
      finalScore: calculatedFinal,
      answersJson: answers,
      essayAnalysisJson: essayAnalysis,
    }),
  });
  ```
- Also synchronizes `/api/user/quiz-attempts` for user portfolio statistics.

---

### Part 3: DJP Exam Simulation Persistence (4 Modes)

#### Database Schema (`lib/schema.ts` lines 274-298)
```typescript
export const djpExamAttempts = pgTable(
  'djp_exam_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mode: text('mode').notNull().default('all-100'),
    tkbScore: integer('tkb_score').notNull().default(0),
    essayScore: integer('essay_score').notNull().default(0),
    interviewScore: integer('interview_score').notNull().default(0),
    finalScore: integer('final_score').notNull().default(0),
    isPassed: boolean('is_passed').notNull().default(false),
    answersJson: jsonb('answers_json').notNull(),
    essayAnalysisJson: jsonb('essay_analysis_json'),
    interviewAnalysisJson: jsonb('interview_analysis_json'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userModeIdx: index('djp_exam_attempts_user_mode_idx').on(
      table.userId,
      table.mode
    ),
  })
);
```

#### 4 Simulation Modes:
1. `all-100`: Comprehensive 100 questions (50 TKB MCQ + 25 Essay Cases + 25 Interview Scenarios).
   - Weighted score: `Math.round(tkbScore * 0.4 + essayScore * 0.3 + interviewScore * 0.3)`.
2. `tkb-50`: 50 Questions CAT Pilihan Ganda.
   - Weighted score: `tkbScore`.
3. `esai-25`: 25 Studi Kasus Pajak with AI Evaluation.
   - Weighted score: `essayScore`.
4. `wawancara-25`: 25 Skenario Wawancara Integritas & STAR method.
   - Weighted score: `interviewScore`.
- Passing grade across all modes: `finalScore >= 75`.

#### Discrepancy & Gap Analysis in DJP Exam Flow:
1. `components/djp/djp-cbt-exam.tsx` (lines 191-210) currently invokes:
   ```typescript
   fetch('/api/djp-exam/attempts', {
     method: 'POST',
     body: JSON.stringify({
       mode,
       answers,
       essayAnalysis,
       interviewAnalysis,
       timeSpentSeconds,
     })
   });
   ```
2. `app/api/djp-exam/attempts/route.ts` is an unpersisted stub handler.
3. The true persistence endpoint is `app/api/user/djp-attempts/route.ts` which inserts into PostgreSQL table `djpExamAttempts`.
4. **Resolution Required in M2**:
   - In `components/djp/djp-cbt-exam.tsx`, compute `tkbScore`, `essayScore`, `interviewScore`, `finalScore`, and `isPassed` upon finishing the exam (mirroring the computation logic in `components/djp/djp-scorecard.tsx`).
   - Send the validated payload to `/api/user/djp-attempts` (and/or forward `/api/djp-exam/attempts` to persist in DB).
   - If offline, enqueue into the offline sync queue.

---

### Part 4: Offline Fallback & Draft Synchronization

#### Current Architecture:
1. `lib/offline-manager.ts` pre-caches module JSON (`/api/belajar/[slug]`), glossary APIs, HTML routes, and Cloudinary/TTS audio blobs into the browser's Cache API (`brevet-ab-v3`, `brevet-data-v3`, `brevet-audio-cache-v1`).
2. `lib/use-offline.ts` provides real-time online/offline network detection via `window.navigator.onLine`.
3. CBT exam progress (`djp_exam_cbt_progress_${mode}`) and module quiz progress (`brevet_quiz_progress_${moduleId}`) are saved in `localStorage` on every keystroke and option click.

#### Offline Synchronization Engine Design:
To guarantee zero data loss during network disruptions:
1. **Sync Queue Storage Key**: `brevet_offline_sync_queue`.
2. **Queue Item Types**:
   - `{ type: 'section_progress', payload: { moduleId, sectionId, completed }, timestamp }`
   - `{ type: 'quiz_attempt', payload: { moduleId, pgScore, essayScore, finalScore, answersJson, essayAnalysisJson }, timestamp }`
   - `{ type: 'djp_attempt', payload: { mode, tkbScore, essayScore, interviewScore, finalScore, isPassed, answersJson, essayAnalysisJson, interviewAnalysisJson }, timestamp }`
3. **Synchronization Lifecycle**:
   - When any mutation fails due to `!navigator.onLine` or network error `fetch failed`:
     - Payload is appended to `brevet_offline_sync_queue`.
   - On `window.addEventListener('online')` or application initialization:
     - Read `brevet_offline_sync_queue`.
     - Sequentially post items to `/api/user/progress`, `/api/user/quiz-attempts`, `/api/user/djp-attempts`.
     - Remove successfully synced items from queue.
     - Emit toast notification: `✅ Semua progres belajar offline berhasil disinkronkan ke server!`

---

## 3. Concrete Proposed Implementation Snippets

### Snippet 1: Updating `components/djp/djp-cbt-exam.tsx` (Finish Exam Handler)
```typescript
// Calculate score summary before sending
let pgTotal = 0;
let pgCorrect = 0;
let essayTotal = 0;
let essayScoreSum = 0;
let interviewTotal = 0;
let interviewScoreSum = 0;

soalList.forEach((s) => {
  if (s.tipe === 'pilihan_ganda') {
    pgTotal += 1;
    const userAns = answers[s.id];
    if (userAns && userAns.trim().toUpperCase() === s.jawabanKunci.trim().toUpperCase()) {
      pgCorrect += 1;
    }
  } else if (s.tipe === 'esai_kasus') {
    essayTotal += 1;
    const analysis = essayAnalysis[s.id];
    const score = analysis ? analysis.skor : (answers[s.id] && answers[s.id].length > 20 ? 70 : 0);
    essayScoreSum += score;
  } else if (s.tipe === 'wawancara') {
    interviewTotal += 1;
    const analysis = interviewAnalysis[s.id];
    const score = analysis ? analysis.skor : (answers[s.id] && answers[s.id].length > 20 ? 75 : 0);
    interviewScoreSum += score;
  }
});

const tkbScore = pgTotal > 0 ? Math.round((pgCorrect / pgTotal) * 100) : 0;
const essayScore = essayTotal > 0 ? Math.round(essayScoreSum / essayTotal) : 0;
const interviewScore = interviewTotal > 0 ? Math.round(interviewScoreSum / interviewTotal) : 0;

let finalScore = 0;
if (mode === 'all-100') {
  finalScore = Math.round(tkbScore * 0.4 + essayScore * 0.3 + interviewScore * 0.3);
} else if (mode === 'tkb-50') {
  finalScore = tkbScore;
} else if (mode === 'esai-25') {
  finalScore = essayScore;
} else if (mode === 'wawancara-25') {
  finalScore = interviewScore;
}

const isPassed = finalScore >= 75;

const attemptPayload = {
  mode,
  tkbScore,
  essayScore,
  interviewScore,
  finalScore,
  isPassed,
  answersJson: answers,
  essayAnalysisJson: essayAnalysis,
  interviewAnalysisJson: interviewAnalysis,
};

// Send to PostgreSQL via /api/user/djp-attempts
fetch('/api/user/djp-attempts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(attemptPayload),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.ok) {
      toast.success('Hasil ujian berhasil disimpan ke riwayat akun!');
    }
  })
  .catch((e) => {
    console.warn('Network issue saving DJP attempt, saving to offline queue:', e);
    enqueueOfflineSync('djp_attempt', attemptPayload);
  });
```

### Snippet 2: Offline Synchronization Queue Helper (`lib/offline-sync-queue.ts`)
```typescript
export interface OfflineQueueItem {
  id: string;
  type: 'section_progress' | 'quiz_attempt' | 'djp_attempt';
  payload: Record<string, any>;
  createdAt: number;
}

const SYNC_QUEUE_KEY = 'brevet_offline_sync_queue';

export function enqueueOfflineSync(type: OfflineQueueItem['type'], payload: Record<string, any>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    const queue: OfflineQueueItem[] = raw ? JSON.parse(raw) : [];
    queue.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      type,
      payload,
      createdAt: Date.now(),
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to enqueue offline item:', err);
  }
}

export async function flushOfflineSyncQueue(): Promise<{ syncedCount: number; errors: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) return { syncedCount: 0, errors: 0 };
  
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return { syncedCount: 0, errors: 0 };
    const queue: OfflineQueueItem[] = JSON.parse(raw);
    if (!queue.length) return { syncedCount: 0, errors: 0 };

    const remaining: OfflineQueueItem[] = [];
    let syncedCount = 0;
    let errors = 0;

    for (const item of queue) {
      try {
        let endpoint = '';
        if (item.type === 'section_progress') endpoint = '/api/user/progress';
        else if (item.type === 'quiz_attempt') endpoint = '/api/user/quiz-attempts';
        else if (item.type === 'djp_attempt') endpoint = '/api/user/djp-attempts';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });

        if (res.ok) {
          syncedCount++;
        } else {
          remaining.push(item);
          errors++;
        }
      } catch (e) {
        remaining.push(item);
        errors++;
      }
    }

    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
    return { syncedCount, errors };
  } catch (err) {
    console.error('Failed flushing sync queue:', err);
    return { syncedCount: 0, errors: 1 };
  }
}
```

---

## 4. Verification & Validation Strategy

1. **Section Progress Upsert Verification**:
   - Toggle multiple sections across different modules with user session.
   - Query `/api/user/progress?moduleId=<uuid>` and verify `completedSections` matches UI state.
   - Toggle same section twice to verify idempotent upsert (no duplicate rows created).
2. **Quiz Attempt Persistence Verification**:
   - Complete 100-question exam or module quiz in `/belajar/[slug]/ujian`.
   - Verify entry in `user_quiz_attempts` with `pgScore`, `essayScore`, `finalScore`, `answersJson`.
   - Verify `/api/user/stats` reflects incremented `totalQuizTaken` and updated `avgQuizScore`.
3. **DJP Exam Persistence Across 4 Modes**:
   - Submit CBT attempts under `all-100`, `tkb-50`, `esai-25`, and `wawancara-25`.
   - Verify `djp_exam_attempts` receives rows with appropriate `mode`, computed weighted score, and `isPassed` boolean.
   - Verify `/dashboard` and `/profil` display updated `highestDjpScore` and attempt counts.
4. **Offline Resilience Verification**:
   - Disconnect network (or simulate offline via DevTools).
   - Answer quiz questions and toggle sections. Verify drafts stay stored in `localStorage`.
   - Reconnect network. Verify `flushOfflineSyncQueue()` executes and updates database without data loss.
5. **Full Build Check**:
   - Run `npm run build` to ensure clean TypeScript compilation across all routes.
