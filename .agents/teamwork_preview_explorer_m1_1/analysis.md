# Technical Analysis Report — Milestone 1 Route Guardrails & Role Separation

**Project**: Brevet AB & DJP Tax Learning Platform  
**Agent**: teamwork_preview_explorer (Milestone 1 Explorer 1)  
**Date**: 2026-08-24  
**Working Directory**: `C:\Users\NCN0C\.gemini\antigravity\scratch\brevet_mobile_revamp\.agents\teamwork_preview_explorer_m1_1`

---

## Executive Summary

This investigation analyzes the technical architecture and security boundaries for **Milestone 1: Authentication Hardening & Role Separation Guardrails**. Specifically, it inspects:
1. The conversion of `proxy.ts` into a fully operational Next.js 16 App Router `middleware.ts`.
2. The defense-in-depth Server Component role enforcement within `app/admin/layout.tsx`.
3. The role and session validation contracts in `lib/middleware-auth.ts`, `lib/auth.ts`, and their enforcement across administrative and student API endpoints.

---

## 1. Next.js 16 Edge Middleware Architecture (`proxy.ts` vs `middleware.ts`)

### 1.1 Root Cause of Middleware Non-Execution
In Next.js 16 (and Next.js App Router conventions), the Next.js runtime automatically looks for a file named `middleware.ts` (or `middleware.js`) at the project root or inside `src/`.
- **Current Observation**:
  - The project root contains `proxy.ts` (size: 2,471 bytes).
  - The function signature is `export async function proxy(req: NextRequest)`.
  - Next.js **completely ignores** `proxy.ts`. No edge route interception is currently occurring.
- **Resolution**:
  - Refactor `proxy.ts` to `middleware.ts` in the project root.
  - Export the entry function as `export async function middleware(req: NextRequest)`.
  - Delete or deprecate `proxy.ts`.

### 1.2 Route Interception Logic Breakdown
The routing rules implemented in the edge middleware must enforce the following matrix:

| Request Route | User Session State | User Role | Action / Destination | Status Code |
|---|---|---|---|---|
| `/login`, `/register` | Authenticated | `admin` | Redirect to `/admin` | 307/302 |
| `/login`, `/register` | Authenticated | `user` (student) | Redirect to `/dashboard` | 307/302 |
| `/login`, `/register` | Unauthenticated | N/A | Allow access (`NextResponse.next()`) | 200 |
| `/admin/*` | Unauthenticated | N/A | Redirect to `/login?redirect=/admin/*` | 307/302 |
| `/admin/*` | Authenticated | `user` (student) | Redirect to `/dashboard` | 307/302 |
| `/admin/*` | Authenticated | `admin` | Allow access (`NextResponse.next()`) | 200 |
| `/dashboard/*`, `/profil/*` | Unauthenticated | N/A | Redirect to `/login?redirect=${pathname}` | 307/302 |
| `/dashboard/*`, `/profil/*` | Authenticated | `user` or `admin` | Allow access (`NextResponse.next()`) | 200 |
| Public Paths (`/`, `/belajar/*`, `/ujian-djp/*`, `/tools/*`, `/api/auth/*`) | Any | Any | Allow access (`NextResponse.next()`) | 200 |
| `/api/admin/*`, `/api/keys/*` | Unauthenticated | N/A | JSON `{ error: 'Belum login. Silakan login terlebih dahulu.' }` | 401 |
| `/api/admin/*`, `/api/keys/*` | Authenticated | `user` (student) | JSON `{ error: 'Akses khusus administrator.' }` | 403 |

### 1.3 Edge Runtime & Performance Validation
- `verifyTokenFromCookieString(cookieHeader)` in `lib/auth.ts`:
  - Parses `brevet_session` cookie directly from the raw `cookie` header.
  - Executes `jose.jwtVerify(token, getJwtSecret())` utilizing Web Cryptography API (`crypto.subtle`).
  - **Zero Database Queries**: No database roundtrip occurs at the Edge Middleware layer. The verification is 100% Edge-safe, sub-millisecond, and lightweight.
- **Matcher Configuration**:
  ```typescript
  export const config = {
    matcher: [
      '/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.webmanifest|sw.js).*)',
    ],
  };
  ```
  This matcher ensures Next.js build artifacts, static image assets, favicon, PWA manifest, and service worker (`sw.js`) bypass middleware overhead.

---

## 2. Server Component Role Check in `app/admin/layout.tsx` (Defense-in-Depth)

### 2.1 Current Implementation Vulnerability
In `app/admin/layout.tsx` (lines 22-26):
```typescript
const user = await getCurrentUser(fakeReq);

if (!user) {
  redirect('/login');
}
```
- **Vulnerability**: While `!user` redirects unauthenticated visitors to `/login`, a logged-in user with `role === 'user'` (student) passes this check because `user` is non-null!
- If Edge Middleware is disabled, bypassed, or encountered in certain client-side RSC transitions, a student could render the administrative layout shell (`AdminSidebar`, `AdminTopbar`).

### 2.2 Refactored Defense-in-Depth Specification
`app/admin/layout.tsx` must be updated to:
```typescript
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';
import type { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();

  // Build request object to reuse getCurrentUser
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const { NextRequest } = await import('next/server');
  const fakeReq = new NextRequest('http://localhost', {
    headers: { cookie: cookieHeader },
  });

  const user = await getCurrentUser(fakeReq);

  // 1. Unauthenticated -> redirect to login
  if (!user) {
    redirect('/login');
  }

  // 2. Authenticated but not an administrator -> redirect to student dashboard
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar userName={user.fullName} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

---

## 3. Backend Route Protection & API Auth Helpers (`lib/middleware-auth.ts` & `lib/auth.ts`)

### 3.1 Verification of Guard Function Contracts
In `lib/middleware-auth.ts`:
- **`requireAuth(req: NextRequest)`**:
  - Invokes `getCurrentUser(req)`.
  - If null -> returns `NextResponse.json({ error: 'Belum login. Silakan login terlebih dahulu.' }, { status: 401 })`.
  - If valid -> returns `UserSession` (`{ id, email, fullName, role }`).
- **`requireAdmin(req: NextRequest)`**:
  - Invokes `requireAuth(req)`.
  - If unauthenticated (`instanceof NextResponse`) -> returns the 401 response.
  - If `authResult.role !== 'admin'` -> returns `NextResponse.json({ error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' }, { status: 403 })`.
  - If `authResult.role === 'admin'` -> returns `UserSession`.

### 3.2 Audit of API Endpoints
A comprehensive grep of the API routes revealed that several administrative endpoints were incorrectly using `requireAuth` instead of `requireAdmin`. These must be adjusted during implementation:

| Endpoint Path | Method | Current Guard | Required Guard | Target Status on Unauthorized Student |
|---|---|---|---|---|
| `/api/admin/generate-quiz` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/admin/glossary` | GET/POST/PUT/DELETE | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/admin/glossary/sync` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/admin/health` | GET | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/ai/tiktok-prompts/db` | GET/POST/PUT/DELETE | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/keys` | GET/POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/keys/[id]` | GET/PUT/DELETE | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/keys/test` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/keys/reset` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/keys/cleanup` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/modules` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/modules/[id]` | PUT/DELETE | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/modules/[id]/duplicate` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/modules/[id]/toggle` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/modules/[id]/quiz` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/modules/[id]/quiz-perhitungan` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/modules/import` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/modules/update-image` | POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/prompts` | GET/POST | `requireAuth` ⚠️ | `requireAdmin` | 403 Forbidden |
| `/api/user/progress` | GET/POST | `requireAuth` ✅ | `requireAuth` | 401 Unauthenticated |
| `/api/user/quiz-attempts` | GET/POST | `requireAuth` ✅ | `requireAuth` | 401 Unauthenticated |
| `/api/user/djp-attempts` | GET/POST | `requireAuth` ✅ | `requireAuth` | 401 Unauthenticated |
| `/api/user/stats` | GET | `requireAuth` ✅ | `requireAuth` | 401 Unauthenticated |
| `/api/users/[id]` | PUT | `requireAuth` (+ self-check) ✅ | `requireAuth` (+ self-check) | 403 if id mismatch |
| `/api/users/[id]/password` | PUT | `requireAuth` (+ self-check) ✅ | `requireAuth` (+ self-check) | 403 if id mismatch |

---

## 4. Student Profile Route (`/profil`) Architecture
- Currently, `/app/admin/profil/page.tsx` exists for admin users.
- For students, `/app/profil/page.tsx` will provide a dedicated student profile portal allowing students to view their account info (email, full name, role), update password via `/api/users/[id]/password`, update profile info via `/api/users/[id]`, and link back to their `/dashboard`.
- In `middleware.ts`, `/profil/*` is guarded requiring active session (`!session` -> redirect to `/login?redirect=/profil`).

---

## 5. Step-by-Step Implementation Roadmap for Milestone 1

1. **Step 1: Edge Middleware Deployment**
   - Copy and refactor `proxy.ts` -> `middleware.ts`.
   - Ensure function name is `middleware(req: NextRequest)`.
   - Verify JWT edge verification logic and matcher rules.

2. **Step 2: Admin Server Component Layout Role Check**
   - In `app/admin/layout.tsx`, add `if (user.role !== 'admin') redirect('/dashboard');`.

3. **Step 3: Admin API Authorization Enforcement**
   - Replace `requireAuth` with `requireAdmin` across all administrative route handlers (`/api/admin/*`, `/api/keys/*`, `/api/modules/*` mutations, `/api/prompts/*`, `/api/ai/tiktok-prompts/db`).

4. **Step 4: Student Profile Page (`app/profil/page.tsx`)**
   - Create client component matching the Dark Linear UI theme with profile editing and password change capabilities.

5. **Step 5: Verification & Regression Testing**
   - Run unit and integration tests checking unauthenticated, student, and admin access paths against all route guardrails.
