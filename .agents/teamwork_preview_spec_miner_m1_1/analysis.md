# Specification Report: Student Profile Portal (pp/profil/page.tsx) & Milestone 1 Acceptance Criteria

**Author**: Milestone 1 Spec Miner (	eamwork_preview_spec_miner)  
**Target Milestone**: M1 (Authentication Hardening, Role Separation & Student Profile Portal)  
**Date**: 2026-08-24  

---

## 1. Executive Summary

This specification defines the architectural design, user interface layout, API contracts, and rigorous acceptance criteria for the **Student Profile Portal** (pp/profil/page.tsx) as required by Milestone 1 in PROJECT.md and ORIGINAL_REQUEST.md.

The portal provides student users (ole: 'user') with a dedicated personal space to:
1. View account details (Full Name, Email, Role badge, and Registration/Joined Date).
2. Edit their profile details (Full Name, Email address).
3. Change account password securely with client-side verification and backend validation.
4. View a real-time summary of their learning progress and exam milestones (completed module sub-sections, quizzes taken, average quiz score, and top DJP entry exam score).
5. Seamlessly navigate between the learning portal (/belajar), the analytics dashboard (/dashboard), the tax calculator (/tools/kalkulator), the DJP exam simulation (/ujian-djp), and perform secure session logout (/api/auth/logout).

---

## 2. Detailed Student Profile Feature Specification

### 2.1 User Information Display
- **Identity Header / Banner**:
  - Displays user avatar with initials (e.g. (user.fullName[0] || user.email[0]).toUpperCase()) rendered on a linear gradient background (rom-blue-600 to-indigo-600) with subtle outer ring/glow (ing-2 ring-blue-500/30).
  - Full Name prominently displayed (	ext-xl font-bold text-white).
  - Email address displayed with mail icon (	ext-sm text-slate-400 flex items-center gap-1.5).
  - Role badge indicating student status (g-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider).
  - Joined Date badge (Calendar icon, e.g. Bergabung sejak 24 Agustus 2026 or localized Indonesian date format).

### 2.2 Profile Information Update Form
- **Form Controls**:
  - ullName: Text input, labeled  Nama Lengkap, prefilled with current user.fullName, required.
  - email: Email input, labeled Email, prefilled with current user.email, required.
- **Action**:
  - Submits HTTP PUT request to /api/users/[id] with payload { fullName, email }.
  - Displays loading state on button with Loader2 spinner.
  - Handles response:
    - 200 OK: Displays success toast (	oast.success('Profil berhasil diperbarui!')), updates local user state, refreshes server cache.
    - 400 Bad Request: Displays error toast (e.g. Email sudah digunakan oleh akun lain. or Zod validation message).
    - 401 / 403: Redirects to /login or shows permission error.
    - 500 Server Error: Displays error toast (	oast.error('Terjadi kesalahan server.')).

### 2.3 Password Change Form
- **Form Controls**:
  - currentPassword: Password input, labeled Password Saat Ini, required.
  - 
ewPassword: Password input, labeled Password Baru, required, minimum 8 characters.
  - confirmPassword: Password input, labeled Konfirmasi Password Baru, required.
- **Client-Side Guardrails**:
  - Validates 
ewPassword === confirmPassword; if mismatched, immediately fires 	oast.error('Konfirmasi password tidak cocok.') without dispatching network request.
  - Validates 
ewPassword.length >= 8; if shorter, fires 	oast.error('Password minimal 8 karakter.').
- **Backend API Integration**:
  - Submits HTTP PUT request to /api/users/[id]/password with { currentPassword, newPassword }.
  - Response Handling:
    - 200 OK: Displays 	oast.success('Password berhasil diubah!'), clears input fields (currentPassword = '', 
ewPassword = '', confirmPassword = '').
    - 400 Bad Request: Displays 	oast.error(d.error || 'Password saat ini salah.').
    - 403 Forbidden: Displays 	oast.error('Tidak memiliki izin.').

### 2.4 Quick Learning Statistics Overview
- **Data Source**: GET /api/user/stats (integrated via @tanstack/react-query or useEffect fetch).
- **Metric Cards (4-Column / 2-Column Responsive Grid)**:
  1. **Sub-Bab Selesai**: Count of completed sections (stats.totalCompletedSections / total target) with CheckCircle2 icon (green).
  2. **Kuis Modul**: Count of module quiz attempts (stats.totalQuizTaken) with BookOpen icon (blue).
  3. **Rata-Rata Nilai**: Average percentage score across all module quizzes (stats.avgQuizScore/100) with Trophy icon (amber/yellow).
  4. **Top Skor Ujian DJP**: Highest score achieved across DJP exam simulations (stats.highestDjpScore/100) with Award icon (purple).
- **Quick Links Bar**:
  - Link button to Buka Dashboard Lengkap (/dashboard) with TrendingUp icon.
  - Link button to Lanjutkan Belajar Modul (/belajar) with BookOpen icon.
  - Link button to Simulasi Masuk DJP (/ujian-djp) with Sparkles icon.

### 2.5 Session Logout Action
- **Trigger**: Keluar dari Akun button located in the top navigation and profile danger/action zone.
- **Execution**:
  - Submits HTTP POST to /api/auth/logout.
  - Clears revet_session cookie on client/browser.
  - Triggers toast 	oast.success('Berhasil keluar akun.').
  - Redirects user via outer.push('/login') and outer.refresh().

---

## 3. UI / UX Design & Styling Specification

### 3.1 Design Language & Palette
- **Theme**: Dark Linear Theme matching pp/dashboard/page.tsx and pp/admin/profil/page.tsx.
- **Base Background**: g-slate-950 (#020617) with subtle background glows g-blue-500/10 / g-indigo-500/10.
- **Card Styling**: g-slate-900/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-sm.
- **Typography**:
  - Headings: ont-black tracking-tight text-white.
  - Subheadings & Labels: 	ext-sm font-semibold text-slate-300.
  - Body / Hints: 	ext-xs text-slate-400.
- **Component Inputs & Buttons**:
  - Inputs use @/components/ui/input (g-[#0d1424] border-[#1F2937] text-white focus:border-blue-500).
  - Primary button: g-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold py-2.5 px-4 shadow-lg shadow-blue-500/20.
  - Secondary/Ghost button: g-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl.
  - Danger button: g-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-300 rounded-xl.

### 3.2 Page Layout Wireframe (pp/profil/page.tsx)

`
+-----------------------------------------------------------------------------------+
|  [GraduationCap] BrevetAB Hub  |  [BookOpen] Belajar  [LayoutDashboard] Dashboard | [LogOut] Keluar |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [<- Kembali ke Dashboard]                                                         |
|                                                                                   |
|  +-- User Profile Header Card -------------------------------------------------+  |
|  |  [ AVATAR ]   Budi Setiawan  <SISWA>                                        |  |
|  |   (B.S.)      budi.setiawan@example.com                                     |  |
|  |               [Calendar] Bergabung sejak 24 Agustus 2026                    |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-- Quick Learning Statistics (4 Cards) --------------------------------------+  |
|  | [Check] 18 Sub-Bab  | [Book] 5 Kuis  | [Trophy] 86/100 Rata2 | [Award] 92/100 DJP |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-- Grid: 2 Columns on Desktop / 1 Column on Mobile --------------------------+  |
|  |                                     |                                       |  |
|  |  [Form 1: Informasi Profil]         |  [Form 2: Keamanan Akun / Password]   |  |
|  |  - Nama Lengkap                     |  - Password Saat Ini                  |  |
|  |  - Email                            |  - Password Baru (min 8 karakter)     |  |
|  |  - Role (Readonly: Siswa)           |  - Konfirmasi Password Baru           |  |
|  |  [ Simpan Profil ]                  |  [ Ubah Password ]                    |  |
|  |                                     |                                       |  |
|  +-------------------------------------+---------------------------------------+  |
|                                                                                   |
|  +-- Quick Navigation & Learning Links ----------------------------------------+  |
|  |  [Modul Pembelajaran]   [Simulasi Masuk DJP]   [Kalkulator Pajak Interaktif]   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-- Danger Zone Card ---------------------------------------------------------+  |
|  |  Keluar dari Akun: Akhiri sesi login Anda pada perangkat ini.               |  |
|  |  [ Tombol Keluar / Log Out ]                                                |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
`

---

## 4. API Endpoints & Contract Matrix

| Endpoint | Method | Auth Required | Request Payload | Success Response (200) | Error Responses |
|---|---|---|---|---|---|
| /api/auth/me | GET | Yes (or returns 401) | None | { firstRun: false, user: { id, email, fullName, role, createdAt? } } | 401 Unauthorized |
| /api/user/stats | GET | Yes (equireAuth) | None | { ok: true, user: {...}, stats: { totalModules, totalCompletedSections, totalQuizTaken, avgQuizScore, highestDjpScore }, recentQuiz: [], recentDjp: [] } | 401 Unauthorized, 500 Error |
| /api/users/[id] | PUT | Yes (equireAuth, self or admin) | { fullName?: string, email?: string } | { ok: true, user: { id, email, fullName, role } } | 400 Bad Request (Email taken / invalid), 403 Forbidden |
| /api/users/[id]/password | PUT | Yes (equireAuth, self or admin) | { currentPassword: string, newPassword: string } | { ok: true, message: 'Password berhasil diubah.' } | 400 Bad Request (Wrong password / <8 chars), 403 Forbidden |
| /api/auth/logout | POST | Optional | None | { ok: true, message: 'Logout berhasil' } (clears cookie) | 500 Server Error |

---

## 5. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Profile UI | Student Profile Portal (`/profil`) | Dedicated student profile view for account data, statistics overview, and security management | URL navigation `/profil`, user session cookie | Rendered React Component (`app/profil/page.tsx`) | Redirects to `/login` if unauthenticated | ORIGINAL_REQUEST §R1, PROJECT.md M1 |
| 2 | Profile UI | User Info Header | Displays avatar initial, full name, email address, role badge ('user'/'admin'), and joined timestamp | User session object from `/api/auth/me` or `/api/user/stats` | Rendered UI card | Displays placeholder dashes `—` if data missing | `app/admin/profil/page.tsx`, `app/dashboard/page.tsx` |
| 3 | Profile Mutation | Update Profile Info | Form allowing user to edit full name and email | `{ fullName: string, email: string }` via `PUT /api/users/[id]` | Updated user object, Sonner toast notification | Returns 400 if email exists or schema invalid | `app/api/users/[id]/route.ts`, `lib/validators.ts` |
| 4 | Password Mutation | Change Password | Secure password change form verifying current password and hashing new password | `{ currentPassword, newPassword }` via `PUT /api/users/[id]/password` | Success JSON message, cleared input fields | Returns 400 if current password wrong, length < 8 | `app/api/users/[id]/password/route.ts` |
| 5 | Analytics | Quick Learning Stats | Summary metrics showing completed sub-sections, quiz count, average score, top DJP score | Session cookie via `GET /api/user/stats` | JSON stats summary and rendered metric cards | Fallback to 0 values if no attempts recorded | `app/api/user/stats/route.ts` |
| 6 | Authentication | Session Logout | Terminate active user session by clearing `brevet_session` cookie | `POST /api/auth/logout` | Cleared HTTP-only cookie, redirect to `/login` | Returns 500 on server failure | `app/api/auth/logout/route.ts` |
| 7 | Navigation | Student Hub Navigation | Header links providing routing between `/profil`, `/dashboard`, `/belajar`, `/ujian-djp`, and `/tools/kalkulator` | User clicks | Client-side navigation via `next/link` | N/A | `app/dashboard/page.tsx`, `app/belajar/page.tsx` |
| 8 | Authorization | Role-Based Access Guard | Restrict access so regular students cannot reach `/admin/*` routes, redirecting them to `/dashboard`, and protect `/dashboard` and `/profil` | Request path `/admin/*`, `/dashboard/*`, `/profil/*`, user JWT token | Next.js response redirect to `/dashboard` or `/login` | 403 Forbidden / Redirect | `proxy.ts`, `middleware.ts`, `app/admin/layout.tsx` |

---

## 6. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Change Password | New password and confirm password do not match | Client-side validation stops request immediately, displays toast: Konfirmasi password tidak cocok. |
| 2 | Change Password | New password is shorter than 8 characters | Client-side validation stops request, displays toast: Password minimal 8 karakter. |
| 3 | Change Password | Current password is incorrect | Server returns 400 { error: Password saat ini salah. }, displays error toast. |
| 4 | Update Profile | Email input is already registered by another user | Server returns 400 { error: Email sudah digunakan oleh akun lain. }, displays error toast. |
| 5 | Update Profile | Full name or email is submitted with leading/trailing whitespace | Backend trims strings and normalizes email before updating database. |
| 6 | Unauthenticated Access | Direct access to /profil without revet_session cookie | Middleware/Server Component intercepts and redirects to /login. |
| 7 | Cross-User Mutation | User A attempts PUT /api/users/[user_b_id] with User A's session cookie | Backend equireAuth compares uth.id !== id && auth.role !== 'admin' and returns 403 { error: Tidak memiliki izin. }. |
| 8 | Zero Activity Stats | New user with zero completed sections, zero quizzes, zero DJP exams | /api/user/stats safely returns 0 for all counts/averages without divide-by-zero errors. |
| 9 | Fast Re-logout | User clicks Keluar multiple times rapidly | clearAuthCookie is idempotent; first response redirects to /login without errors. |

---

## 7. Milestone 1 Acceptance Criteria & Verification Test Cases

### 7.1 Milestone 1 Acceptance Criteria (Checklist)
- [ ] **AC-M1-01**: The route /profil exists and renders a responsive Dark Linear UI for authenticated students and admins.
- [ ] **AC-M1-02**: Profile header renders user avatar initials, Full Name, Email, Role badge (Siswa or Administrator), and member joined date.
- [ ] **AC-M1-03**: Updating full name via /profil updates database record in users table and reflects in UI upon submission.
- [ ] **AC-M1-04**: Changing password with correct current password and valid new password (>= 8 chars) succeeds and hashes new password with bcrypt.
- [ ] **AC-M1-05**: Changing password with incorrect current password is rejected with 400 status and clear error feedback.
- [ ] **AC-M1-06**: Changing password with mismatched confirm password or < 8 chars is rejected before network dispatch.
- [ ] **AC-M1-07**: Learning statistics cards correctly display data from /api/user/stats (completed sections, quiz count, average score, DJP top score).
- [ ] **AC-M1-08**: Clicking Keluar / Log Out clears session cookie and routes user to /login.
- [ ] **AC-M1-09**: Unauthenticated visits to /profil or /dashboard are redirected to /login.
- [ ] **AC-M1-10**: Regular students (ole: 'user') accessing /admin/* are blocked and redirected to /dashboard.
- [ ] **AC-M1-11**: Cross-user updates on /api/users/[id] and /api/users/[id]/password return 403 Forbidden for non-admin callers.
- [ ] **AC-M1-12**: 
pm run build completes with zero TypeScript or Turbopack compilation errors.

### 7.2 Concrete Test Suite Mapping for Milestone 1

1. **Test 1: GET /profil Unauthenticated Route Guard**
   - *Given*: User has no revet_session cookie.
   - *When*: User requests GET /profil.
   - *Then*: Request is redirected to /login (307/302).

2. **Test 2: GET /profil Authenticated Student Page Render**
   - *Given*: User is logged in as student (ole: 'user').
   - *When*: User navigates to /profil.
   - *Then*: Page renders status 200 with user name, email, role badge Siswa, and stats overview.

3. **Test 3: PUT /api/users/[id] Self Profile Update**
   - *Given*: Authenticated user with ID user-123.
   - *When*: Dispatches PUT /api/users/user-123 with { fullName: Budi Satria }.
   - *Then*: Returns status 200 { ok: true, user: { id: user-123, fullName: Budi Satria, ... } }.

4. **Test 4: PUT /api/users/[id] Cross-User Attack Blocked**
   - *Given*: Authenticated student user user-123.
   - *When*: Dispatches PUT /api/users/user-456 with { fullName: Hacked }.
   - *Then*: Returns status 403 { error: Tidak memiliki izin. }.

5. **Test 5: PUT /api/users/[id]/password Valid Password Change**
   - *Given*: Authenticated user with password oldpassword123.
   - *When*: Dispatches PUT /api/users/[id]/password with { currentPassword: oldpassword123, newPassword: newpassword456 }.
   - *Then*: Returns status 200 { ok: true, message: Password berhasil diubah. }. Subsequent login with 
ewpassword456 succeeds.

6. **Test 6: PUT /api/users/[id]/password Incorrect Current Password**
   - *Given*: Authenticated user with password oldpassword123.
   - *When*: Dispatches PUT /api/users/[id]/password with { currentPassword: wrongpassword, newPassword: newpassword456 }.
   - *Then*: Returns status 400 { error: Password saat ini salah. }.

7. **Test 7: POST /api/auth/logout Session Termination**
   - *Given*: Active session cookie.
   - *When*: Dispatches POST /api/auth/logout.
   - *Then*: Returns status 200 with Set-Cookie: brevet_session=; Max-Age=0.

---
