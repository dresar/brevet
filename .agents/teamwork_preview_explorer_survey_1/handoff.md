# Handoff Report — Backend & Database Architecture Survey

**Explorer**: Survey Explorer 1 (`teamwork_preview_explorer_survey_1`)  
**Mission**: Authoritative survey of the backend, database schema, API routing, authentication, and validation layers of the Brevet AB & DJP Tax Learning Platform.  
**Target File**: `C:\Users\NCN0C\.gemini\antigravity\scratch\brevet_mobile_revamp\.agents\teamwork_preview_explorer_survey_1\handoff.md`  
**Reference Analysis**: `C:\Users\NCN0C\.gemini\antigravity\scratch\brevet_mobile_revamp\.agents\teamwork_preview_explorer_survey_1\analysis.md`

---

## 1. Observation

### 1.1 Package & Runtime Configuration
- `package.json` specifies:
  - Framework: Next.js `16.2.12`, React `19.2.4`, React DOM `19.2.4`.
  - Database: `drizzle-orm` (`^0.45.2`), `drizzle-kit` (`^0.31.4`), `@neondatabase/serverless` (`^1.1.0`).
  - Auth: `jose` (`^6.2.4`), `bcryptjs` (`^3.0.3`).
  - Validation: `zod` (`^4.4.3`).
  - State & UI: `@tanstack/react-query` (`^5.101.4`), `zustand` (`^5.0.14`), `idb-keyval` (`^6.3.0`), `motion` (`^12.42.2`), `tailwindcss` (`^4`).
- Build verification: `npm run build` completed with exit code 0 (`56/56` static & dynamic routes compiled cleanly).

### 1.2 Database Schema (`lib/schema.ts`)
- 13 PostgreSQL tables configured via Drizzle ORM:
  1. `users` (id, email, passwordHash, fullName, role, createdAt, updatedAt)
  2. `api_keys` (id, name, keyValue, provider, status, orderIndex, errorCount, lastError, lastUsedAt, createdAt, updatedAt)
  3. `tts_cache` (id, textHash, audioUrl, createdAt)
  4. `modules` (id, code, slug, title, category, difficulty, estimatedMinutes, status, contentJson, orderIndex, createdAt, updatedAt)
  5. `module_sections_progress` (id, userId, moduleId, sectionId, completed, updatedAt)
  6. `user_notes` (id, userId, moduleId, sectionId, content, createdAt, updatedAt)
  7. `user_bookmarks` (id, userId, moduleId, sectionId, createdAt)
  8. `ai_chat_history` (id, userId, moduleSlug, role, content, createdAt)
  9. `user_settings` (userId, fontSize, updatedAt)
  10. `tiktok_prompts` (id, moduleSlug, moduleTitle, promptsJson, createdAt, updatedAt)
  11. `user_quiz_attempts` (id, userId, moduleId, pgScore, essayScore, finalScore, answersJson, essayAnalysisJson, createdAt, updatedAt)
  12. `glossary` (id, moduleId, moduleSlug, kata, definisi, penjelasanSederhana, contoh, createdAt, updatedAt)
  13. `djp_exam_attempts` (id, userId, mode, tkbScore, essayScore, interviewScore, finalScore, isPassed, answersJson, essayAnalysisJson, interviewAnalysisJson, createdAt)

### 1.3 API Routes Inventory
- 45 API routes located under `app/api/`:
  - Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/setup`
  - User & Progress: `/api/user/progress`, `/api/user/quiz-attempts`, `/api/user/djp-attempts`, `/api/user/stats`, `/api/users/[id]`, `/api/users/[id]/password`
  - Learning / Belajar: `/api/belajar/[slug]`, `/api/belajar/progress`, `/api/belajar/quiz-attempts`
  - DJP Exam: `/api/djp-exam`, `/api/djp-exam/attempts`, `/api/djp-exam/evaluate-essay`, `/api/djp-exam/evaluate-interview`
  - Admin & CMS: `/api/admin/generate-quiz`, `/api/admin/glossary`, `/api/admin/glossary/sync`, `/api/admin/health`, `/api/modules`, `/api/modules/[id]`, `/api/modules/[id]/quiz`, `/api/modules/[id]/quiz-perhitungan`, `/api/modules/[id]/toggle`, `/api/modules/[id]/duplicate`, `/api/modules/import`, `/api/modules/update-image`
  - Keys Management: `/api/keys`, `/api/keys/[id]`, `/api/keys/active-pool`, `/api/keys/cleanup`, `/api/keys/reset`, `/api/keys/test`
  - AI & Media: `/api/ai/chat`, `/api/ai/evaluate-essay`, `/api/ai/verify-calculator`, `/api/ai/tiktok-prompts`, `/api/ai/tiktok-prompts/db`, `/api/cloudinary`, `/api/cloudinary/upload`, `/api/tts`, `/api/prompts`

### 1.4 Critical Security & Authorization Findings
- **API Keys Leaks**:
  - `app/api/keys/route.ts` (lines 13, 41): Uses `requireAuth` without `auth.role === 'admin'` check and returns plain `keyValue` to any logged-in student.
  - `app/api/keys/active-pool/route.ts`: Has no authentication check at all, publicly exposing active keys.
  - `app/api/keys/[id]/route.ts`, `cleanup/route.ts`, `reset/route.ts`: Allow non-admin authenticated users to edit or delete API keys.
- **Module CMS Mutation Leaks**:
  - `app/api/modules/[id]/route.ts` (`PUT`, `DELETE`), `toggle/route.ts`, `duplicate/route.ts`, `import/route.ts`, `update-image/route.ts` only check `requireAuth` and omit admin verification.
- **Admin Layout Role Verification**:
  - `app/admin/layout.tsx` (lines 24-26) checks `if (!user) redirect('/login')` but does not check `if (user.role !== 'admin') redirect('/dashboard')`.
- **Dev Password Bypass**:
  - `app/api/auth/login/route.ts` (line 39) contains unconditional bypass for `'__DEV_AUTOFILL__'`, `'admin123'`, and `'admin123456'`.

---

## 2. Logic Chain

1. **Premise**: Requirement R1 dictates clean role separation between students (`role: 'user'`) and administrators (`role: 'admin'`), prohibiting student access to admin tools and management APIs.
2. **Observation**: While `proxy.ts` guards `/admin/*` frontend routes and `/api/admin/*` API routes, several core management endpoints are located under `/api/keys/*` and `/api/modules/*` rather than `/api/admin/*`.
3. **Inference**: Because these endpoints only check `requireAuth(req)` instead of `requireAdmin(req)`, any authenticated student can make direct REST calls (e.g. via Postman, curl, or client fetch) to read all production API keys (`GET /api/keys`) or alter course modules (`PUT /api/modules/[id]`).
4. **Premise**: Requirement R2 requires persistent user learning progress, quiz attempts, and DJP exam history in PostgreSQL.
5. **Observation**: The schema in `lib/schema.ts` and the endpoints `/api/user/progress`, `/api/user/quiz-attempts`, and `/api/user/djp-attempts` correctly implement these data structures with foreign keys to `users.id`.
6. **Inference**: The underlying database model is fully capable of meeting R2, but the frontend needs to consistently consume `/api/user/*` instead of legacy/in-memory stubs like `/api/djp-exam/attempts`.

---

## 3. Caveats

- The live Neon database connection was not modified or seeded during this read-only inspection.
- The project utilizes Drizzle ORM rather than Prisma ORM (the user request mentioned Prisma/Neon DB as an option; Drizzle ORM is already fully integrated and active across the entire codebase).
- Rate limiting middleware (e.g. IP sliding window) is not currently implemented in the codebase.

---

## 4. Conclusion

The Brevet AB & DJP Tax Learning Platform has a solid architectural core with Next.js 16, Drizzle ORM, and Neon PostgreSQL. All required database tables for users, module sections progress, quiz attempts, and DJP simulation attempts are already designed and functional.

However, **immediate remediation is required** during implementation:
1. Enforce `requireAdmin(req)` across all routes in `/api/keys/*`, `/api/modules/*` (mutations), `/api/admin/*`, and `/api/ai/tiktok-prompts/db` (mutations).
2. Remove or lock down `app/api/keys/active-pool/route.ts`.
3. Add role check `if (user.role !== 'admin') redirect('/dashboard');` in `app/admin/layout.tsx`.
4. Wrap the login dev password bypass inside `if (process.env.NODE_ENV === 'development')`.
5. Point DJP exam attempt recording to `/api/user/djp-attempts`.

---

## 5. Verification Method

To independently verify the findings in this report:

1. **Verify Database Schema & Models**:
   ```bash
   # Inspect Drizzle schema definitions
   cat lib/schema.ts
   ```
2. **Verify API Key Route Permissions**:
   ```bash
   # Check requireAuth vs requireAdmin in keys route
   cat app/api/keys/route.ts
   ```
3. **Verify Build Health**:
   ```powershell
   npm run build
   ```
   *Expected Output*: Exit code 0, all 56 routes compile without TypeScript or syntax errors.
