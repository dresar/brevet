# Comprehensive Backend & Database Architecture Analysis

**Project**: Brevet AB & DJP Tax Learning Platform (`brevet-ab-hub`)  
**Workspace**: `C:\Users\NCN0C\.gemini\antigravity\scratch\brevet_mobile_revamp`  
**Date**: 2026-08-24  
**Investigator**: Survey Explorer 1 (`teamwork_preview_explorer_survey_1`)

---

## Executive Summary

This investigation delivers an exhaustive architectural survey of the backend, database schema, API routing, authentication mechanics, validation layers, and security posture of the Brevet AB & DJP Tax Learning Platform.

The platform is constructed on **Next.js 16.2.12 (App Router + Turbopack)** with **React 19.2.4**, using **Drizzle ORM (0.45.2)** backed by **Neon Serverless PostgreSQL** via `@neondatabase/serverless` (HTTP connection pool). Authentication is built on signed JSON Web Tokens (JWT) using **`jose` (6.2.4)** and password hashing with **`bcryptjs` (3.0.3)** stored in httpOnly session cookies (`brevet_session`). Request validation is implemented using **`zod` (4.4.3)** across all data schemas.

While core user registration, login, progress tracking, quiz logging, and DJP exam persistence endpoints are implemented, critical role-enforcement and route-guard vulnerabilities exist that must be remediated to guarantee production-grade security.

---

## 1. Tech Stack, Build Configuration & Dependencies

### 1.1 Core Runtime & Framework
- **Next.js**: `16.2.12` (App Router, Turbopack enabled)
- **React**: `19.2.4` / **React DOM**: `19.2.4`
- **Node Runtime**: Supported Node.js `>=20.x` with `export const runtime = 'nodejs'` on all API route handlers
- **TypeScript**: `5.x` (`strict: true` in `tsconfig.json`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss: ^4`, `tailwindcss: ^4`)

### 1.2 Database & Data Persistence
- **ORM**: `drizzle-orm: ^0.45.2` with `drizzle-kit: ^0.31.4`
- **Database Engine**: Neon Serverless PostgreSQL (`@neondatabase/serverless: ^1.1.0`) via Neon HTTP connection (`drizzle-orm/neon-http`)
- **Local / Disk File Fallback**: `lib/module-file-manager.ts` manages sync and fallback to local JSON files in `data/modules/*.json`

### 1.3 Authentication & Cryptography
- **JWT Engine**: `jose: ^6.2.4` (Edge-compatible, algorithm `HS256`, 30-day token lifetime)
- **Password Hashing**: `bcryptjs: ^3.0.3` (10 salt rounds)
- **Session Cookie**: `brevet_session` (httpOnly, sameSite `lax`, path `/`, maxAge 30 days, secure in production)

### 1.4 AI, Storage & Integrations
- **AI Models**: Google Gemini 2.5/3.6 via `@google/genai: ^2.13.0` & `@google/generative-ai: ^0.24.1` with multi-key round-robin rotation and auto-failover in `lib/gemini.ts`
- **Voice / Audio**: ElevenLabs API with key rotation (`lib/elevenlabs.ts`), Web Speech API client fallback (`lib/chrome-speech.ts`)
- **Cloud Media**: Cloudinary SDK `^2.10.0` with dynamic multi-account rotation (`lib/cloudinary-rotation.ts`)
- **State & Caching**: TanStack Query `^5.101.4` with sync/async storage persisters, `idb-keyval: ^6.3.0`, `zustand: ^5.0.14`

### 1.5 Build Verification
A clean build test (`npm run build`) completed successfully with exit code `0` in ~18 seconds across 56 static and dynamic routes.

---

## 2. Database Schema & Models (`lib/schema.ts`)

The database consists of **13 relational tables** with foreign key cascades and relational indexes:

| Table Name | Primary Key | Key Columns | Relationships / Constraints |
|---|---|---|---|
| `users` | `id` (UUID defaultRandom) | `email` (unique text), `password_hash`, `full_name`, `role` (default 'admin'), `created_at`, `updated_at` | 1-to-many with progress, notes, bookmarks, quiz attempts, djp attempts, chat history; 1-to-1 with userSettings |
| `api_keys` | `id` (UUID defaultRandom) | `name`, `key_value`, `provider` ('gemini'\|'elevenlabs'\|'cloudinary'), `status` ('active'\|'error'\|'disabled'), `order_index`, `error_count`, `last_error`, `last_used_at` | Composite index on `(status, order_index)` |
| `tts_cache` | `id` (UUID defaultRandom) | `text_hash` (unique SHA-256), `audio_url`, `created_at` | Index on `text_hash` |
| `modules` | `id` (UUID defaultRandom) | `code` (unique text e.g. "BRVT-AB-01"), `slug` (unique text), `title`, `category`, `difficulty`, `estimated_minutes`, `status` ('draft'\|'tayang'), `content_json` (JSONB), `order_index` | 1-to-many with sections progress, notes, bookmarks, quiz attempts, glossary items |
| `module_sections_progress` | `id` (UUID defaultRandom) | `user_id` (FK users CASCADE), `module_id` (FK modules CASCADE), `section_id` (text), `completed` (boolean default false), `updated_at` | Unique Index on `(user_id, module_id, section_id)` |
| `user_notes` | `id` (UUID defaultRandom) | `user_id` (FK users CASCADE), `module_id` (FK modules CASCADE), `section_id`, `content`, `created_at`, `updated_at` | Linked to user and module |
| `user_bookmarks` | `id` (UUID defaultRandom) | `user_id` (FK users CASCADE), `module_id` (FK modules CASCADE), `section_id`, `created_at` | Unique Index on `(user_id, module_id, section_id)` |
| `ai_chat_history` | `id` (UUID defaultRandom) | `user_id` (FK users CASCADE), `module_slug`, `role` ('user'\|'assistant'), `content`, `created_at` | Index on `(user_id, created_at)` |
| `user_settings` | `user_id` (PK, FK users CASCADE) | `font_size` ('normal'\|'besar'), `updated_at` | 1-to-1 with user |
| `tiktok_prompts` | `id` (UUID defaultRandom) | `module_slug` (unique text), `module_title`, `prompts_json` (JSONB), `created_at`, `updated_at` | Index on `module_slug` |
| `user_quiz_attempts` | `id` (UUID defaultRandom) | `user_id` (FK users CASCADE), `module_id` (FK modules CASCADE), `pg_score` (int), `essay_score` (int), `final_score` (int), `answers_json` (JSONB), `essay_analysis_json` (JSONB), `created_at`, `updated_at` | Index on `(user_id, module_id)` |
| `glossary` | `id` (UUID defaultRandom) | `module_id` (FK modules CASCADE nullable), `module_slug`, `kata`, `definisi`, `penjelasan_sederhana`, `contoh`, `created_at`, `updated_at` | Index on `(module_slug, kata)` |
| `djp_exam_attempts` | `id` (UUID defaultRandom) | `user_id` (FK users CASCADE), `mode` ('all-100'\|'tkb-50'\|'esai-25'\|'wawancara-25'), `tkb_score` (int), `essay_score` (int), `interview_score` (int), `final_score` (int), `is_passed` (boolean), `answers_json` (JSONB), `essay_analysis_json` (JSONB), `interview_analysis_json` (JSONB), `created_at` | Index on `(user_id, mode)` |

---

## 3. Complete API Inventory & Route Analysis

Total API Route Handlers: **45 endpoints** across 10 functional modules.

### 3.1 Authentication Subsystem (`/api/auth/*`)
- **`POST /api/auth/register`**: Validates payload with `registerSchema` (`lib/validations/auth.ts`). Rejects duplicate emails (HTTP 409). Hashes password via `bcrypt.hash(password, 10)`. Enforces student `role: 'user'` on insert. Issues JWT and sets `brevet_session` cookie.
- **`POST /api/auth/login`**: Validates payload with `loginSchema`. Finds user by email. Checks bcrypt hash (with development auto-fill bypass). Signs JWT token carrying `sub: user.id` and `role`. Sets httpOnly cookie.
- **`POST /api/auth/logout`**: Clears `brevet_session` cookie (maxAge: 0).
- **`GET /api/auth/me`**: Detects if database is empty (`firstRun: true`). Extracts JWT from cookie and retrieves user session. Returns sanitized object `{ id, email, fullName, role }`.
- **`POST /api/auth/setup`**: Allows initial admin creation only when zero users exist in the database.

### 3.2 User Progress & Exam Subsystem (`/api/user/*` & `/api/belajar/*`)
- **`GET /api/user/progress`**: Retrieves section completion status for the authenticated user by `moduleId` or globally across all modules.
- **`POST /api/user/progress`**: Validates with `sectionProgressSchema` (`moduleId`, `sectionId`, `completed`). Upserts record in `module_sections_progress`.
- **`GET /api/user/quiz-attempts`**: Returns historical quiz attempts and highest score for a module or all modules with joined module metadata.
- **`POST /api/user/quiz-attempts`**: Validates with `quizAttemptSchema`. Saves scores, student answers, and AI essay evaluation into `user_quiz_attempts`.
- **`GET /api/user/djp-attempts`**: Fetches all DJP exam simulation attempts for the authenticated user, ordered by `createdAt DESC`.
- **`POST /api/user/djp-attempts`**: Validates with `djpAttemptSchema`. Inserts comprehensive result (TKB score, Essay score, Interview score, Final score, passing grade boolean, STAR ratings, and AI JSON feedback) into `djp_exam_attempts`.
- **`GET /api/user/stats`**: Aggregates comprehensive dashboard metrics for the student: total published modules, completed sections count, total quizzes taken, average quiz score, total DJP exam simulations taken, highest DJP score, and top 5 recent activities.
- **`PUT /api/users/[id]`**: Updates user full name and email with email duplication check. Validates `auth.id === id || auth.role === 'admin'`.
- **`PUT /api/users/[id]/password`**: Updates user password after validating `currentPassword` with bcrypt.

### 3.3 Module Content & Public Learning Endpoints
- **`GET /api/belajar/[slug]`**: Returns full module structure (from Neon DB or disk fallback `data/modules/[slug].json`), calculates user section progress percentage, and returns completion map.
- **`POST /api/belajar/progress`**: Alternate section completion toggle endpoint.
- **`GET / POST / DELETE /api/belajar/quiz-attempts`**: Module quiz attempt persistence and reset operations.

### 3.4 DJP Exam Simulation Endpoints (`/api/djp-exam/*`)
- **`GET /api/djp-exam?mode=...`**: Reads 100 questions from `data/ujian-djp/simulasi-seleksi-djp-100.json` and filters based on mode (`all-100`, `tkb-50`, `esai-25`, `wawancara-25`).
- **`POST /api/djp-exam/evaluate-essay`**: Gemini AI endpoint evaluating fiscal case studies against reference rubrics and legal foundations (UU KUP, UU PPh, UU PPN, UU HPP).
- **`POST /api/djp-exam/evaluate-interview`**: Gemini AI endpoint evaluating audio/text answers using the STAR methodology (Situation, Task, Action, Result) and 5 Kemenkeu core values.
- **`GET / POST /api/djp-exam/attempts`**: Stub attempt handler (should defer to `/api/user/djp-attempts`).

### 3.5 Administration, CMS & Tool Endpoints
- **`POST /api/admin/generate-quiz`**: AI question generator (20 MCQs or 20 Essays per batch) based on module content. Restricted to `auth.role === 'admin'`.
- **`GET / POST / PUT / DELETE /api/admin/glossary`**: Glossary management with search and batch JSON import. Restricted to admin.
- **`POST /api/admin/glossary/sync`**: Auto-extracts glossary terms from `contentJson` across all modules into the `glossary` table. Restricted to admin.
- **`GET /api/admin/health`**: Real-time Neon PostgreSQL connection and latency benchmark.
- **`GET / PUT / DELETE /api/modules/[id]`**: Module CRUD with disk file synchronization.
- **`POST /api/modules/[id]/duplicate`**: Deep-clones module into a draft copy.
- **`GET / PUT /api/modules/[id]/quiz`**: Manages 100 final evaluation questions for a module.
- **`GET / PUT /api/modules/[id]/quiz-perhitungan`**: Manages tax calculation exercises for a module.
- **`POST /api/modules/[id]/toggle`**: Flips status between `draft` and `tayang`.
- **`POST /api/modules/import`**: Validates raw JSON with Zod and saves to disk and database.
- **`POST /api/modules/update-image`**: Saves section visual illustration URLs to module JSON.
- **`GET / POST / PUT / DELETE /api/keys/*`**: Multi-provider API key rotation and management.
- **`POST /api/ai/chat`**: AI Tutor chat endpoint with contextual module injection.
- **`POST /api/ai/verify-calculator`**: AI verification of calculation logic (PPh 21, PPN, PBB, BPHTB).
- **`POST /api/tts`**: ElevenLabs speech synthesis with SHA-256 database caching and Cloudinary hosting.

---

## 4. Authentication Architecture & Role Separation

### 4.1 Implementation Mechanics
1. **Token Structure**:
   ```typescript
   export interface TokenPayload extends JWTPayload {
     sub: string;  // User ID (UUID)
     role: string; // 'admin' | 'user'
   }
   ```
2. **Edge-Safe Token Extraction (`lib/auth.ts`)**:
   `verifyTokenFromCookieString(cookieHeader)` decodes and validates JWT signatures using `jose.jwtVerify()` without making database round-trips.
3. **Route Guard Middleware (`proxy.ts`)**:
   - In Next.js 16 (Turbopack), `proxy.ts` operates as the request proxy/middleware.
   - Redirects logged-in users away from `/login` and `/register` to `/admin` (if admin) or `/dashboard` (if user).
   - Protects `/admin/*` routes: rejects unauthenticated users to `/login` and redirects users with `role !== 'admin'` to `/dashboard`.
   - Protects `/dashboard/*` and `/profil/*`: redirects unauthenticated users to `/login`.
   - Protects `/api/admin/*`: returns HTTP 403 JSON if `session.role !== 'admin'`.

### 4.2 Helper Utilities (`lib/middleware-auth.ts`)
- **`requireAuth(req)`**: Validates user session from database via `getCurrentUser(req)`. Returns `UserSession` or `NextResponse.json({ error: ... }, { status: 401 })`.
- **`requireAdmin(req)`**: Extends `requireAuth`. Validates `user.role === 'admin'`, returning HTTP 403 if user is a student (`role: 'user'`).

---

## 5. Security Vulnerabilities & Deficiencies Identified

During code inspection, several high-impact security and authorization defects were discovered:

### ⚠️ Vulnerability 1: API Keys Exposed to Non-Admins & Public Internet
1. **`app/api/keys/route.ts` (GET & POST)**: Uses `requireAuth(req)` instead of `requireAdmin(req)`. Any registered student can send a GET request to `/api/keys` and retrieve all Gemini, ElevenLabs, and Cloudinary API credentials in plain text.
2. **`app/api/keys/active-pool/route.ts` (GET)**: Contains **zero authentication**. Anyone on the public internet can scrape active Gemini API keys.
3. **`app/api/keys/[id]/route.ts`, `cleanup/route.ts`, `reset/route.ts`**: Use `requireAuth` without verifying admin role, allowing non-admin users to mutate or delete production API keys.

### ⚠️ Vulnerability 2: Module Management & CMS Routes Lack Admin Role Check
Multiple administrative endpoints verify authentication via `requireAuth(req)` but fail to enforce `requireAdmin`:
- `app/api/modules/[id]/route.ts` (`PUT` and `DELETE`)
- `app/api/modules/[id]/toggle/route.ts` (`POST`)
- `app/api/modules/[id]/duplicate/route.ts` (`POST`)
- `app/api/modules/import/route.ts` (`POST`)
- `app/api/modules/update-image/route.ts` (`POST`)

*Consequence*: Any student with an authenticated session could modify, publish/unpublish, or delete learning modules.

### ⚠️ Vulnerability 3: Server Component Guard in `app/admin/layout.tsx`
`app/admin/layout.tsx` checks `if (!user) redirect('/login')` but fails to check `if (user.role !== 'admin') redirect('/dashboard')`. While `proxy.ts` provides perimeter protection, server-rendered layouts should enforce defense-in-depth.

### ⚠️ Vulnerability 4: Hardcoded Dev Passwords in `auth/login/route.ts`
In `app/api/auth/login/route.ts` (line 39):
```typescript
const isDevPass = password === '__DEV_AUTOFILL__' || password === 'admin123' || password === 'admin123456';
const isValid = isDevPass || (await verifyPassword(password, user.passwordHash));
```
This allows bypassing password verification for any user account if using `admin123` or `admin123456`. This must be strictly guarded by `process.env.NODE_ENV === 'development'`.

### ⚠️ Vulnerability 5: Overlapping & Inconsistent Endpoint Endpoints
There are two sets of endpoints for progress and quiz attempts:
- `/api/user/progress` vs `/api/belajar/progress`
- `/api/user/quiz-attempts` vs `/api/belajar/quiz-attempts`
- `/api/djp-exam/attempts` (stub) vs `/api/user/djp-attempts` (persistent DB)
The platform should standardize all user-data mutations under `/api/user/*`.

---

## 6. Validation Layer & Error Handling Assessment

### 6.1 Validation Coverage
- **Auth**: `registerSchema`, `loginSchema`, `changePasswordSchema`, `updateUserProfileSchema` (`lib/validations/auth.ts`)
- **Progress**: `sectionProgressSchema`, `batchProgressSchema` (`lib/validations/progress.ts`)
- **Quizzes**: `quizAttemptSchema` (`lib/validations/quiz.ts`)
- **DJP Simulation**: `djpAttemptSchema` (`lib/validations/djp.ts`)
- **Module JSON CMS**: `modulSchema`, `bagianSchema`, `kuisSoalSchema`, `gambarSchema` (`lib/validators.ts`)

### 6.2 Rate Limiting
No server-side rate limiting (e.g., token bucket or sliding window IP limiter) is currently active on `/api/auth/login`, `/api/auth/register`, `/api/ai/*`, or `/api/tts`.

---

## 7. Recommended Action Plan for Implementation

1. **Enforce `requireAdmin` Across All Admin & CMS API Routes**:
   - Update `app/api/keys/route.ts`, `app/api/keys/[id]/route.ts`, `app/api/keys/cleanup/route.ts`, `app/api/keys/reset/route.ts`, `app/api/keys/test/route.ts` to use `requireAdmin(req)`.
   - Protect or remove `app/api/keys/active-pool/route.ts` (require admin or internal server call only).
   - Update `app/api/modules/[id]/route.ts`, `toggle/route.ts`, `duplicate/route.ts`, `import/route.ts`, `update-image/route.ts`, and `tiktok-prompts/db/route.ts` to enforce `requireAdmin(req)`.
2. **Harden `app/admin/layout.tsx`**:
   - Add role verification: `if (user.role !== 'admin') redirect('/dashboard');`.
3. **Restrict Dev Bypass in `auth/login/route.ts`**:
   - Wrap `isDevPass` inside `process.env.NODE_ENV === 'development'`.
4. **Standardize User Endpoints & Link DJP Attempt Loggers**:
   - Ensure `/api/djp-exam/attempts` redirects or delegates cleanly to `/api/user/djp-attempts`.
   - Standardize frontend client queries to use `/api/user/progress` and `/api/user/quiz-attempts`.
5. **Implement Dedicated Student Profile `/profil`**:
   - Provide dedicated `/profil` route for students (or unify with `/dashboard`).
