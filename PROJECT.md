# Project: Brevet AB & DJP Tax Learning Platform — Production User Portal, Progress Tracking & Role Separation

## Architecture
- **Framework**: Next.js 16.2.12 (App Router + Turbopack), React 19.2.4, TypeScript 5.
- **Database & ORM**: Neon Serverless PostgreSQL (@neondatabase/serverless 1.1.0) with Drizzle ORM (0.45.2).
- **Styling**: Tailwind CSS v4 with Dark Linear theme and Framer Motion animations.
- **Authentication**: JWT cookie-based session (`brevet_session` via `jose` and `bcryptjs`) with dual-role separation (`role: 'user'` vs `role: 'admin'`).
- **Validation**: Zod schema validation across all API routes (`lib/validations/`).
- **State & Offline**: TanStack React Query v5 + IndexedDB (`idb-keyval`) async storage persister (7-day gcTime) + Service Worker (`public/sw.js`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Role-Based Auth & Session Management | JWT session cookie `brevet_session` supporting distinct `user` and `admin` roles | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Edge Middleware Route Protection | Root `middleware.ts` intercepting `/admin/*` (admin only) and `/dashboard/*`, `/profil/*` (authenticated users) | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Server Component Admin Defense-in-Depth | `app/admin/layout.tsx` server-side check redirecting non-admin users to `/dashboard` | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Admin API Endpoint Authorization | Enforce `requireAdmin` across `/api/keys/*`, `/api/modules/*` mutations, `/api/admin/*` | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Student Profile Portal | Dedicated `/profil` route for user account info, password updates, and study history | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Module Section Progress Persistence | PostgreSQL persistence for module sections with idempotent upserts (`module_sections_progress`) | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Mini-Quiz & Final Exam Attempt Persistence | PostgreSQL storage for 100-question final exam and mini-quiz results (`user_quiz_attempts`) | M2 | ORIGINAL_REQUEST §R2 |
| 8 | DJP 100-Question Simulation Persistence | PostgreSQL storage for 4 exam modes (`all-100`, `tkb-50`, `esai-25`, `wawancara-25`) in `djp_exam_attempts` | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Offline Fallback & Sync Engine | LocalStorage & IndexedDB draft caching with automatic sync to server endpoints upon reconnection | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Comprehensive Zod API Validation | Zod schema validation contracts for `/api/auth/*`, `/api/user/*`, `/api/progress/*`, `/api/attempts/*`, `/api/djp-exam/*` | M3 | ORIGINAL_REQUEST §R3 |
| 11 | API Security & Error Sanitization | Sanitized error handling, input validation, and secure handling of API credentials | M3 | ORIGINAL_REQUEST §R3 |
| 12 | Competency Spider / Radar Chart UI | Dynamic SVG Radar chart in `/dashboard` displaying tax domain proficiencies (KUP, PPh, PPN, Coretax, etc.) | M4 | ORIGINAL_REQUEST §R4 |
| 13 | Study Streak & Activity Heatmap | Gamified daily study streak counter and 30-day activity map in user dashboard | M4 | ORIGINAL_REQUEST §R4 |
| 14 | Quiz & Exam Pass Rate Analytics | Visual pass rate gauges, average score badges, and milestone completion trackers | M4 | ORIGINAL_REQUEST §R4 |
| 15 | Competency Scorecards & Certificates | Downloadable/printable Brevet AB & DJP simulation scorecard and competency certificate modal | M4 | ORIGINAL_REQUEST §R4 |
| 16 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test suite verifying all user flows and security guardrails | M5 | ORIGINAL_REQUEST §AC |
| 17 | Adversarial Coverage Hardening (Tier 5) | White-box stress-testing, boundary probe validation, and final zero-regression check | M5 | ORIGINAL_REQUEST §AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Authentication Hardening & Role Separation Guardrails | Edge `middleware.ts`, `app/admin/layout.tsx` role check, admin API route security (`/api/keys/*`, `/api/modules/*`), student `/profil` page | none | DONE |
| M2 | Persistent User Progress & Exam Attempts Engine | PostgreSQL persistence for module sections, quizzes, and DJP exam attempts (`/api/user/*`), offline draft sync | M1 | DONE |
| M3 | Comprehensive Backend Validation & API Security | Zod validation across all user and exam endpoints, structured error handling | M1, M2 | DONE |
| M4 | User Dashboard & Performance Analytics UI | SVG Radar Chart, Study Streak counter, Pass Rate gauges, Certificate & Scorecard modal in `/dashboard` | M2, M3 | DONE |
| M5 | Final E2E Test Suite Pass & Adversarial Hardening | Pass 100% of E2E tests (Tiers 1-4) and Tier 5 adversarial verification | M1, M2, M3, M4 | DONE |

## Interface Contracts

### 1. Authentication & Session (`lib/auth.ts`, `lib/middleware-auth.ts`)
- `createSessionToken(user: { id: string, email: string, role: string, fullName?: string }): Promise<string>`
- `verifySessionToken(token: string): Promise<JWTPayload | null>`
- `requireAuth(req: NextRequest): Promise<{ userId: string, email: string, role: string } | NextResponse>`
- `requireAdmin(req: NextRequest): Promise<{ userId: string, email: string, role: string } | NextResponse>`

### 2. User Progress & Attempts API (`/api/user/*`)
- `GET /api/user/progress?moduleId=<id>` -> `{ sections: string[], completedCount: number }`
- `POST /api/user/progress` -> body: `{ moduleId: string, sectionId: string, completed: boolean }` -> `{ success: true, updated: boolean }`
- `GET /api/user/quiz-attempts?moduleId=<id>` -> `{ attempts: UserQuizAttempt[] }`
- `POST /api/user/quiz-attempts` -> body: `{ moduleId: string, pgScore: number, essayScore?: number, finalScore: number, answersJson: Record<string, string>, essayAnalysisJson?: any }` -> `{ id: string, success: true }`
- `GET /api/user/djp-attempts?mode=<mode>` -> `{ attempts: DjpExamAttempt[] }`
- `POST /api/user/djp-attempts` -> body: `{ mode: string, tkbScore: number, essayScore: number, interviewScore: number, finalScore: number, isPassed: boolean, answersJson: any, essayAnalysisJson?: any, interviewAnalysisJson?: any }` -> `{ id: string, success: true }`
- `GET /api/user/stats` -> `{ stats: { totalCompletedSections, totalQuizTaken, avgQuizScore, highestDjpScore, streakDays, categoryProficiency } }`

### 3. Zod Validation Contracts (`lib/validations/`)
- `registerSchema`: `{ email: z.string().email(), password: z.string().min(6), fullName: z.string().min(2) }`
- `loginSchema`: `{ email: z.string().email(), password: z.string().min(1) }`
- `progressSchema`: `{ moduleId: z.string().uuid(), sectionId: z.string().min(1), completed: z.boolean() }`
- `quizAttemptSchema`: `{ moduleId: z.string().uuid(), pgScore: z.number().min(0).max(100), finalScore: z.number().min(0).max(100), answersJson: z.record(z.any()) }`
- `djpAttemptSchema`: `{ mode: z.enum(['all-100', 'tkb-50', 'esai-25', 'wawancara-25']), tkbScore: z.number().min(0).max(100), essayScore: z.number().min(0).max(100), interviewScore: z.number().min(0).max(100), finalScore: z.number().min(0).max(100), isPassed: z.boolean() }`

## Code Layout
- `middleware.ts`: Root edge middleware for route protection.
- `lib/schema.ts`: Drizzle ORM schema definitions for PostgreSQL.
- `lib/auth.ts` & `lib/middleware-auth.ts`: Authentication token utils & route handler guards.
- `lib/validations/`: Zod validation schemas (`auth.ts`, `progress.ts`, `quiz.ts`, `djp.ts`).
- `app/api/auth/*`: Authentication endpoints (register, login, logout, me).
- `app/api/user/*`: User progress, stats, quiz attempts, DJP attempts endpoints.
- `app/api/admin/*` & `app/api/keys/*`: Protected administrator endpoints.
- `app/dashboard/*`: Production student dashboard with radar charts, streaks, and scorecards.
- `app/profil/*`: Dedicated student profile management portal.
- `app/admin/*`: Secure administrative portal and management studio.
- `components/dashboard/*`: Visual analytics, SVG Radar chart, streak trackers, certificates.
