# Handoff Report — Frontend & UI Architecture Investigation

**Date:** 2026-08-24  
**Agent:** Survey Explorer 2 (teamwork_preview_explorer)  
**Task:** Investigate Frontend and UI Architecture of Brevet AB & DJP Tax Learning Platform  
**Status:** Complete (Hard Handoff)  

---

## 1. Observation

Direct observations from codebase inspection:

1. **Framework & Layout Structure (`package.json`, `app/layout.tsx`, `app/providers.tsx`)**:
   - `package.json:46-48`: Next.js `16.2.12`, React `19.2.4`, Tailwind CSS `v4` (`@tailwindcss/postcss: ^4`, `tailwindcss: ^4`).
   - `app/layout.tsx:41-72`: RootLayout configures dark mode (`<html lang="id" className="dark">`), `QueryProvider`, `PwaRegister`, `OfflineBadge`, `PwaInstallPrompt`, and `Toaster`.
   - `app/providers.tsx:1-45`: Uses `@tanstack/react-query` v5 with `createAsyncStoragePersister` wrapping `idb-keyval` (IndexedDB) with `staleTime: 5 mins` and `gcTime: 7 days` (24 * 7 hours).

2. **Route Protection & Middleware (`proxy.ts:1-86`, `lib/middleware-auth.ts:1-40`, `app/admin/layout.tsx:1-38`)**:
   - `proxy.ts:39-51`: Intercepts `/admin/*` routes; redirects unauthenticated users to `/login` and redirects users with `role !== 'admin'` to `/dashboard`.
   - `proxy.ts:54-61`: Intercepts `/dashboard/*` and `/profil/*`; redirects unauthenticated users to `/login`.
   - `lib/middleware-auth.ts:8-39`: Exposes `requireAuth(req)` and `requireAdmin(req)` returning `401` and `403` JSON responses for API routes.
   - `app/admin/layout.tsx:24-26`: Currently checks `if (!user) { redirect('/login'); }` but does not explicitly check `user.role !== 'admin'`.

3. **Student / User Pages**:
   - `app/page.tsx:1-18`: Checks `brevet_session` cookie; redirects logged-in users to `/belajar` and guests to `/login`.
   - `app/login/page.tsx:1-551`: Handles setup vs login. Includes quick dev account autofill reading from `/api/auth/dev-login`.
   - `app/register/page.tsx:1-147`: Handles registration form calling `POST /api/auth/register` (`role: 'user'`) and redirects to `/dashboard`.
   - `app/dashboard/page.tsx:1-200`: Displays 4 metric cards (`totalCompletedSections`, `totalQuizTaken`, `avgQuizScore`, `highestDjpScore`) and quick links. Currently lacks radar chart, study streak heatmap, pass rates, and certificates.
   - `app/profil/page.tsx`: Does not exist in the root app directory; only `app/admin/profil/page.tsx` exists.
   - `app/belajar/page.tsx:1-341`: Catalog of modules grouped by PPh, PPN, PBB, BPHTB, Administrasi with progress bars and batch offline download.
   - `app/belajar/[slug]/page.tsx:1-800`: Module reader with TOC, `SectionRenderer`, `RichContentRenderer`, Mermaid diagrams, LaTeX math, `FloatingToolsHub`, `InlineParagraphAiTutor`, ElevenLabs/Web Speech audio, and mini-quizzes.
   - `app/belajar/[slug]/ujian/page.tsx:1-70` & `components/belajar/kuis-akhir.tsx:1-782`: 100-question module quiz engine with timer and DB saving (`/api/belajar/quiz-attempts` and `/api/user/quiz-attempts`).
   - `app/ujian-djp/page.tsx:1-293` & `components/djp/djp-cbt-exam.tsx`: 4-mode DJP entrance exam simulator (`all-100`, `tkb-50`, `esai-25`, `wawancara-25`) with `DJPScorecard` (`components/djp/djp-scorecard.tsx`).
   - `app/tools/kalkulator/page.tsx:1-262`: 6 interactive calculators (PPN, PPh 21 TER, PPh OP, PPh Badan, PBB, BPHTB) and Claude AI prompt templates.

4. **Admin Management Pages**:
   - `app/admin/import/page.tsx`: 3-Zone module importer (Prompts library, CodeMirror JSON editor, and module shelf).
   - `app/admin/keys/page.tsx:1-683`: API key rotation pool for Gemini, ElevenLabs, and Cloudinary with live testing and cleanup.
   - `app/admin/media/page.tsx`: Cloudinary asset manager.
   - `app/admin/modules/[id]/edit/page.tsx`: Module JSON editor.
   - `app/admin/quiz-manager/page.tsx`: Quiz bank and AI generator.
   - `app/admin/quiz-perhitungan/page.tsx`: Tax calculation question bank with LaTeX preview.
   - `app/admin/glossary-manager/page.tsx`: Tax terminology bank.
   - `app/admin/tiktok-prompts/page.tsx`: 100-slide carousel prompt generator studio.

5. **Caching & Offline Storage**:
   - `public/sw.js:1-165`: Pre-caches `/`, `/belajar`, `/tools/kalkulator`, `/ujian-djp`, icons, manifest. Implements Cache-First for static bundles, Stale-While-Revalidate for learning APIs, Network-First for HTML navigation, and network bypass for admin/auth/AI routes.
   - `lib/offline-manager.ts:1-196`: Audio caching in `brevet-audio-cache-v1`, module content in `brevet-data-v3`, and HTML in `brevet-ab-v3`.

---

## 2. Logic Chain

1. **Routing & Role Separation Logic**:
   - From `proxy.ts`, `lib/middleware-auth.ts`, and `lib/auth.ts`, the application distinguishes two roles: `'admin'` and `'user'`.
   - `proxy.ts` specifies that `/admin/*` is restricted strictly to `role === 'admin'`, while `/dashboard` and `/profil` are for authenticated users.
   - However, Next.js App Router requires `middleware.ts` in the project root to execute edge request filtering. `proxy.ts` contains the logic but must be named `middleware.ts`.
   - In addition, `app/admin/layout.tsx` should enforce `if (user.role !== 'admin') redirect('/dashboard')` as a defense-in-depth Server Component check.

2. **User Dashboard & Analytics Logic (Requirement R4)**:
   - `app/dashboard/page.tsx` currently only renders basic numbers from `/api/user/stats`.
   - User requirement R4 explicitly demands: (1) Learning milestones, (2) Competency spider/radar charts, (3) Quiz pass rates, (4) Study streaks, (5) Certificates / scorecards.
   - `components/djp/djp-scorecard.tsx` provides a strong foundation for category breakdown calculation (KUP, PPh 21, PPh Badan, PPN, Coretax, etc.), which can be extracted and adapted into an SVG Spider/Radar Chart for the main dashboard.
   - A dedicated student profile page (`app/profil/page.tsx`) is needed so students have a dedicated profile and password management interface separate from `/admin/profil`.

3. **Offline Resilience & Data Persistence Logic (Requirement R2)**:
   - Module progress, quiz attempts, and DJP attempts are stored in PostgreSQL/Neon DB via Drizzle ORM (`moduleSectionsProgress`, `userQuizAttempts`, `djpExamAttempts`).
   - The React Query persister (`app/providers.tsx`) and `public/sw.js` guarantee that previously fetched learning modules and tools remain fully readable and interactive without internet connectivity.

---

## 3. Caveats

1. **Live Network Testing**: Real-time database roundtrips against Neon DB were not executed during this read-only survey.
2. **Next.js 16 Middleware Filename**: Next.js App Router standard filename is `middleware.ts`. `proxy.ts` was inspected in root; it must be confirmed active as `middleware.ts`.
3. **No External Chart Library Dependency**: `package.json` does not include heavy chart libraries like Chart.js or Recharts. Pure SVG or Tailwind CSS charts are recommended to maintain bundle lightness and high performance.

---

## 4. Conclusion

The frontend architecture of Brevet AB Hub is modern, modular, and well-structured. The learning view (`/belajar/[slug]`), exam simulators (`/ujian-djp`), calculators (`/tools/kalkulator`), and admin tools (`/admin/*`) are feature-rich.

To complete the requirements in ORIGINAL_REQUEST.md:
1. **User Dashboard Revamp (R4)**: Enhance `app/dashboard/page.tsx` with:
   - An SVG Competency Spider/Radar chart.
   - A Study Streak tracker (daily streak count & 30-day activity dots).
   - Module pass rate gauges and progress milestones.
   - A printable Brevet AB Competency Certificate / Scorecard modal.
2. **Student Profile Route (R1)**: Implement `app/profil/page.tsx` for regular users.
3. **Middleware Guard Verification (R1)**: Ensure `middleware.ts` is active in root and `app/admin/layout.tsx` includes role validation (`user.role === 'admin'`).

---

## 5. Verification Method

To independently verify all findings:
1. Inspect router structure:
   - App router files: `app/layout.tsx`, `app/dashboard/page.tsx`, `app/belajar/page.tsx`, `app/ujian-djp/page.tsx`, `app/admin/layout.tsx`.
2. Inspect auth & role checks:
   - `proxy.ts` (lines 39-51 for admin guarding).
   - `lib/middleware-auth.ts` (lines 8-39 for `requireAuth` and `requireAdmin`).
3. Inspect state & caching:
   - `app/providers.tsx` (lines 9-37 for React Query & IndexedDB persister).
   - `public/sw.js` (lines 7-18 for precache assets and lines 55-164 for cache strategies).
   - `lib/offline-manager.ts` (lines 72-140 for module and tools caching).
4. Run project build verification:
   - `npm run build` or `npx next build` to verify clean compilation with zero TypeScript errors.
