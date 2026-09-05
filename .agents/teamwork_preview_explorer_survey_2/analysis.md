# Comprehensive Frontend & UI Architecture Survey
**Project:** Brevet AB & DJP Tax Learning Platform (`brevet_mobile_revamp`)  
**Date:** 2026-08-24  
**Investigator:** Survey Explorer 2 (teamwork_preview_explorer)  
**Status:** Completed Analysis  

---

## 1. Executive Summary

The Brevet AB & DJP Tax Learning Platform is built on **Next.js 16.2.12 (App Router)**, **React 19.2.4**, and **Tailwind CSS v4**. It implements a dual-portal architecture separating public/student learning routes (`/`, `/belajar/*`, `/ujian-djp`, `/tools/kalkulator`, `/dashboard`) from administrative content management tools (`/admin/*`).

Offline persistence and state management are achieved through a multi-tier caching stack consisting of `@tanstack/react-query` v5, `idb-keyval` (IndexedDB persister with 7-day `gcTime`), a custom PWA Service Worker (`public/sw.js` v4), and an offline storage manager (`lib/offline-manager.ts`).

---

## 2. Frontend Application Structure

### 2.1 Router & Directory Hierarchy
The application exclusively uses the **Next.js App Router** under `app/`. No legacy `pages/` directory exists.

```
app/
├── layout.tsx                     # Root HTML shell, QueryProvider, Toaster, PWA & Offline badges
├── providers.tsx                  # React Query Provider + idb-keyval IndexedDB persister
├── globals.css                    # Tailwind CSS v4 & custom design tokens
├── page.tsx                       # Root gatekeeper redirect (auth cookie check -> /belajar or /login)
├── login/page.tsx                 # Dual mode: First-run admin setup or user login + dev auto-login
├── register/page.tsx              # Student registration (role: 'user') -> redirects to /dashboard
├── dashboard/page.tsx             # Student dashboard (milestones, stats, quick links)
├── belajar/
│   ├── layout.tsx                 # Public/open layout for learning modules
│   ├── page.tsx                   # Course catalog grouped by categories (PPh, PPN, PBB, etc.)
│   ├── [slug]/
│   │   ├── page.tsx               # Module reader (TOC, rich content, AI tutor, TTS audio, mini-quiz)
│   │   ├── ujian/page.tsx         # 100-question module CBT quiz & exam
│   │   ├── perhitungan/page.tsx   # Step-by-step tax calculation practice
│   │   └── glosarium/page.tsx     # Module tax terms glossary
│   └── simulasi-djp/page.tsx      # Shortcut redirect to /ujian-djp
├── ujian-djp/page.tsx             # Master DJP Entrance Exam Simulator (4 CBT Modes)
├── tools/kalkulator/page.tsx      # 6 Interactive Tax Calculators & Claude prompt generator
└── admin/
    ├── layout.tsx                 # Admin layout with sidebar & topbar (requires role: admin)
    ├── page.tsx                   # Redirects to /admin/import
    ├── import/page.tsx            # 3-Zone Module Importer & Shelf
    ├── keys/page.tsx              # Multi-Provider API Key Rotation Pool (Gemini, ElevenLabs, Cloudinary)
    ├── media/page.tsx             # Cloudinary Media Asset Library
    ├── modules/[id]/edit/page.tsx # CodeMirror JSON Module Editor & Validator
    ├── quiz-manager/page.tsx      # 100-Question Quiz Bank & AI Generator
    ├── quiz-perhitungan/page.tsx  # Tax Calculation Question Bank
    ├── glossary-manager/page.tsx  # Tax Terminology Master Bank
    ├── tiktok-prompts/            # TikTok AI 100-Slide Carousel Prompt Studio
    ├── profil/page.tsx            # Admin profile and password manager
    └── pengaturan/page.tsx        # Admin settings
```

### 2.2 Reusable Component Architecture
Reusable components are organized across distinct functional domains in `components/`:

| Directory | Key Components | Purpose |
|---|---|---|
| `components/ui/` | `button.tsx`, `badge.tsx`, `input.tsx`, `modal.tsx`, `skeleton.tsx`, `tabs.tsx`, `spotlight-card.tsx`, `tilted-card.tsx` | Base UI design system tokens, modals, inputs, and animated cards |
| `components/belajar/` | `section-renderer.tsx`, `rich-content-renderer.tsx`, `floating-tools-hub.tsx`, `ai-chat-widget.tsx`, `tts-button.tsx`, `mini-quiz.tsx`, `kuis-akhir.tsx`, `mermaid-block.tsx`, `inline-paragraph-ai-tutor.tsx` | Learning view renderer, LaTeX math, Mermaid diagrams, audio TTS, AI tutors |
| `components/belajar/kalkulator/` | `ppn.tsx`, `pph21-ter.tsx`, `pph-op.tsx`, `pph-badan.tsx`, `pbb.tsx`, `bphtb.tsx`, `ai-calculator-checker.tsx` | 6 interactive fiscal calculators with instant AI calculation verification |
| `components/djp/` | `djp-cbt-exam.tsx`, `djp-essay-workspace.tsx`, `djp-interview-simulator.tsx`, `djp-scorecard.tsx`, `djp-ai-question-tutor.tsx` | Master 100-soal DJP CAT engine, AI essay grading, speech-enabled interview simulator |
| `components/admin/` | `sidebar.tsx`, `topbar.tsx`, `tiktok-prompt-studio.tsx`, `import/*`, `quiz/*`, `glossary/*` | Admin shell navigation, prompt generation studios, and CRUD interfaces |
| Root components | `offline-badge.tsx`, `pwa-install-prompt.tsx`, `pwa-register.tsx` | PWA installation banners and real-time offline status indicator |

---

## 3. Student & User Journey Pages

### 3.1 Authentication & Registration (`/login`, `/register`)
- **Login (`app/login/page.tsx`)**:
  - Automatically detects first-run scenarios via `/api/auth/me` and switches to the Initial Admin Setup form.
  - Includes a developer quick-account picker dropdown reading active accounts from `/api/auth/dev-login` for instant testing.
  - Authenticated session is stored in an HTTP-only cookie (`brevet_session`, 30-day expiry).
- **Register (`app/register/page.tsx`)**:
  - Creates regular student accounts (`role: 'user'`) via `POST /api/auth/register`.
  - Automatically signs a JWT token, sets the session cookie, and redirects the student to `/dashboard`.

### 3.2 Student Learning Hub (`/belajar`)
- Displays all published modules (`status === 'tayang'`) grouped into tax categories:
  - **PPh**: PPh 21 TER, PPh Badan, PPh Potput, PPh Final.
  - **PPN**: PPN 11%-12% UU HPP, Faktur Pajak e-Faktur 4.0.
  - **PBB & BPHTB**: PBB-P2, BPHTB Jual Beli/Waris.
  - **Administrasi**: KUP, Coretax System, Sanksi Pajak.
- Shows individual progress bars and percentages per module.
- Includes a 1-click **"Unduh Offline"** action that caches all modules, 100-question quizzes, glossaries, and audio files into local IndexedDB and Cache API.

### 3.3 Interactive Reading & Learning Engine (`/belajar/[slug]`)
- Features a collapsible Table of Contents (TOC) with live scroll-spy tracking.
- Interactive section blocks (`SectionRenderer`):
  - Rich text formatting with LaTeX equations ($$...$$) and Mermaid visual flowcharts.
  - Interactive mini-quizzes embedded per sub-section.
  - Paragraph-level AI Tutor trigger (`InlineParagraphAiTutor`).
  - Web Speech API and ElevenLabs audio playback per section or full module playlist.
  - Completion checkbox saving progress to `/api/user/progress` (with offline fallback).
- Floating Tools Hub (`FloatingToolsHub`):
  - Quick access to AI Tax Assistant, Quick Search, Quick Calculator Modal, Glossary Terms, and Full Calculator Suite.

### 3.4 Examination & Assessment Engines
1. **Module Final Quiz (`/belajar/[slug]/ujian`)**:
   - 100 questions per module (Pilihan Ganda & AI-evaluated Esai).
   - 120-minute countdown timer with automatic state preservation in `localStorage`.
   - Instant feedback mode and post-exam review breakdown.
   - Automatically posts attempt scores to `/api/user/quiz-attempts`.
2. **Tax Calculation Practice (`/belajar/[slug]/perhitungan`)**:
   - Step-by-step fiscal calculation questions with LaTeX formulas and real-time verification.
3. **Master DJP Entrance Exam Simulator (`/ujian-djp`)**:
   - 4 Specialized CBT Modes:
     - `all-100`: 100 Master Questions (50 TKB CAT, 25 Case Essays, 25 STAR Interviews) - 120 mins.
     - `tkb-50`: 50 Pilihan Ganda CAT questions - 60 mins.
     - `esai-25`: 25 Real-world Case Studies with AI rubric evaluation - 45 mins.
     - `wawancara-25`: 25 Interactive Voice/STAR interview scenarios with AI panelist feedback - 45 mins.
   - Comprehensive Scorecard (`DJPScorecard`):
     - Weighted calculation (40% CAT, 30% Esai, 30% Interview).
     - Passing grade evaluation (Passing Grade: 75).
     - Competency readiness category bars (KUP, PPh 21, PPh Badan, PPN, Coretax, Kode Etik).
     - Full 100-question matrix navigation and PDF print functionality.
     - Records results to `/api/user/djp-attempts`.

---

## 4. Admin Management Architecture & Access Control

### 4.1 Route Protection & Role Separation
The platform enforces role-based access control through multiple layers:

1. **API Middleware Guards (`lib/middleware-auth.ts`)**:
   - `requireAuth(req)`: Reusable helper verifying JWT cookie presence. Returns `UserSession` or `401 Unauthorized`.
   - `requireAdmin(req)`: Verifies authentication AND confirms `user.role === 'admin'`. Returns `403 Forbidden` for students.
2. **Edge Route Middleware (`proxy.ts` / `middleware.ts`)**:
   - Intercepts requests before page render.
   - Checks `/admin/*` routes: If unauthenticated -> redirects to `/login?redirect=...`. If `role !== 'admin'` -> redirects student to `/dashboard`.
   - Checks `/dashboard/*` and `/profil/*` routes: If unauthenticated -> redirects to `/login`.
3. **Admin Layout (`app/admin/layout.tsx`)**:
   - Server Component verifying current session before rendering the admin sidebar and shell.

### 4.2 Administrative Modules
- **Impor Modul (`/admin/import`)**:
  - Zone 1: Ready-to-copy Claude AI prompts for generating Brevet AB curriculum modules.
  - Zone 2: JSON Importer with syntax highlighting (CodeMirror) and automated schema validation.
  - Zone 3: Module Shelf managing publish status (`draft` / `tayang`), duplication, reordering, and deletion.
- **Manajemen Kunci API (`/admin/keys`)**:
  - Manages API keys across 3 providers: Google Gemini, ElevenLabs TTS, and Cloudinary.
  - Features live single/bulk latency testing, auto-failover order indexing, and 1-click cleanup of invalid keys.
- **Media Library (`/admin/media`)**:
  - Direct Cloudinary integration for uploading tax diagrams, infographics, and module illustrations.
- **Quiz & Calculation Banks (`/admin/quiz-manager`, `/admin/quiz-perhitungan`)**:
  - Manages 100-question banks per module, AI question generator, and LaTeX math calculation templates.
- **Glosarium Manager (`/admin/glossary-manager`)**:
  - Centralized glossary term repository with full text search and module synchronization.
- **TikTok Prompt Studio (`/admin/tiktok-prompts`)**:
  - Automated generation of 100-slide carousel prompts (DALL-E 3 / Flux / Midjourney) for tax education social content.

---

## 5. User Dashboard & Performance Analytics UI (Current State vs R4 Requirements)

### 5.1 Current Dashboard (`app/dashboard/page.tsx`)
- Fetches aggregated statistics from `GET /api/user/stats`.
- Displays 4 basic metric cards:
  1. Sub-Bab Selesai (`totalCompletedSections`)
  2. Kuis Diambil (`totalQuizTaken`)
  3. Rata-Rata Nilai (`avgQuizScore` / 100)
  4. Top Skor Ujian DJP (`highestDjpScore` / 100)
- Provides quick links to `/belajar`, `/ujian-djp`, and `/tools/kalkulator`.

### 5.2 Identified Analytics UI Opportunities (Requirement R4)
To fully satisfy Requirement R4 ("Production User Dashboard & Performance Analytics UI"), the frontend requires:
1. **Competency Spider / Radar Chart**:
   - An SVG/Canvas multi-axis radar chart displaying student mastery across core Brevet competencies:
     - Ketentuan Umum & Tata Cara Perpajakan (KUP)
     - PPh Orang Pribadi & PPh 21 TER
     - PPh Badan & Rekonsiliasi Fiskal
     - PPN & PPnBM (11%-12%)
     - PBB, BPHTB, & Bea Meterai
     - Coretax & Akuntansi Pajak
2. **Study Streak Tracker**:
   - Current active consecutive study streak (days), longest streak, and weekly/monthly activity heatmap dots.
3. **Module Mastery & Quiz Pass Rate Gauge**:
   - Pass/fail percentage breakdown across module quizzes with circular progress indicators.
4. **Official Scorecard & Certificate Generator**:
   - Printable Brevet AB Competency Certificate / DJP Readiness Scorecard with verifiable student ID and QR/validation seal.
5. **Dedicated Student Profile Route (`/profil`)**:
   - A student profile view for managing personal information, password, and viewing learning history.

---

## 6. State Management, Data Fetching & Caching / Offline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client View Layer                     │
│    (Next.js App Router Components + Zustand Local State)    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      @tanstack/react-query   │ │     Service Worker (v4)    │
│  (staleTime: 5m, gcTime: 7d) │ │  - Cache-First (Static)    │
└──────────────┬───────────────┘ │  - Stale-While-Revalidate  │
               │                 │  - Network-First (HTML)    │
               ▼                 └────────────┬───────────────┘
┌──────────────────────────────┐              │
│       idb-keyval             │              │
│   (IndexedDB Persister)      │              ▼
└──────────────────────────────┘ ┌────────────────────────────┐
                                 │     Cache Storage API      │
                                 │ (brevet-ab-v4, data, audio)│
                                 └────────────────────────────┘
```

### 6.1 Data Fetching & React Query Stack
- Configured in `app/providers.tsx`:
  - `staleTime: 5 minutes` (prevents unnecessary network requests during navigation).
  - `gcTime: 7 days` (retains cached data offline for up to a week).
  - Persister: `createAsyncStoragePersister` wrapping `idb-keyval` (`get`, `set`, `del`).

### 6.2 Service Worker Strategy (`public/sw.js` v4)
- **Pre-cached App Shell Assets**: `/`, `/belajar`, `/tools/kalkulator`, `/ujian-djp`, `/belajar/simulasi-djp`, `/manifest.webmanifest`, SVG icons.
- **Cache Strategies**:
  - **Static Bundles (`/_next/static/*`, `.svg`, `.png`, `.woff2`)**: Cache-First.
  - **Learning APIs (`/api/belajar/*`, `/api/djp-exam/*`, `/api/admin/glossary`)**: Stale-While-Revalidate.
  - **HTML Navigation**: Network-First with fallback to cached routes (`/belajar`, `/ujian-djp`, `/tools/kalkulator`).
  - **Bypass**: `/admin/*`, `/api/auth/*`, `/api/keys/*`, `/api/ai/*` pass directly to network without caching.

### 6.3 Offline Manager Utility (`lib/offline-manager.ts`)
- Manages discrete audio blob caching (`downloadModuleAudio`, `getCachedAudioUrl`).
- Provides 1-click batch caching for full modules (`cacheModuleOffline`) and learning tools (`cacheAllToolsOffline`).
- Computes local storage footprint (`getOfflineCacheStats`) and allows clearing cached data (`clearAllOfflineCache`).

---

## 7. Architectural Recommendations for Implementation

1. **Deploy Next.js Route Middleware (`middleware.ts`)**:
   - Rename or link `proxy.ts` to `middleware.ts` in the project root to activate Next.js App Router edge middleware for automated route guarding of `/admin/*` and `/dashboard/*`.
2. **Build Interactive Competency Radar/Spider Chart (`components/dashboard/competency-radar-chart.tsx`)**:
   - Create a lightweight, high-performance SVG radar chart calculating domain scores from `userQuizAttempts` and `djpExamAttempts`.
3. **Build Study Streak & Activity Heatmap (`components/dashboard/study-streak-tracker.tsx`)**:
   - Track daily study activity from `moduleSectionsProgress.updatedAt` and render streak count + 30-day activity dots.
4. **Build Brevet Certificate & Scorecard Generator (`components/dashboard/certificate-modal.tsx`)**:
   - Render a printable Brevet AB Competency Certificate when a student completes all modules or achieves >= 75 passing score on DJP Exam.
5. **Create Student Profile Page (`app/profil/page.tsx`)**:
   - Dedicated user profile view allowing students to update their name, view account statistics, and change passwords.
