# Technical Analysis Report: Milestone 1 Admin API Security & Key Protection

**Author**: Milestone 1 Explorer 2 (`teamwork_preview_explorer_m1_2`)  
**Target Milestone**: Milestone 1 (Admin API Security, Role Authorization & Secret Protection)  
**Date**: 2026-08-24  
**Status**: Ready for Implementation  

---

## 1. Executive Summary

This investigation analyzed all administrative and API key endpoints within the Brevet AB & DJP Tax Learning Platform backend. Several critical security vulnerabilities were discovered:
1. **Critical Secret Leak via `GET /api/keys/active-pool`**: The endpoint is completely unauthenticated and returns arrays containing up to 40 raw, plaintext API keys (`keyValue`).
2. **Key Management Authorization Gap**: All routes under `app/api/keys/*` (`route.ts`, `[id]/route.ts`, `cleanup/route.ts`, `reset/route.ts`, `test/route.ts`) use `requireAuth` instead of `requireAdmin`, allowing regular student accounts (`role: 'user'`) to read raw secrets, add new keys, delete keys, trigger expensive API tests, and reset key pools.
3. **Module & Content Mutation Authorization Gap**: Module mutation routes (`app/api/modules/[id]/route.ts` [PUT, DELETE], `toggle/route.ts`, `duplicate/route.ts`, `import/route.ts`, `update-image/route.ts`) use `requireAuth`, allowing students to overwrite course contents, publish/unpublish draft modules, and write arbitrary files to server disk.
4. **AI Generation & Prompt Studio Authorization Gap**: `app/api/ai/tiktok-prompts/route.ts` has zero authentication, while `app/api/ai/tiktok-prompts/db/route.ts` allows any authenticated user to create or delete prompt suites (including wiping the entire table via `slug=all`).
5. **Critical Dev Password Bypass in Production**: `app/api/auth/login/route.ts` (lines 39-40) accepts hardcoded test credentials (`'admin123'`, `'admin123456'`, `'__DEV_AUTOFILL__'`) regardless of environment because `isDevPass` is not gated behind `process.env.NODE_ENV === 'development'`.

---

## 2. Exhaustive Route-by-Route Findings & Proposed Remediation

### 2.1 API Key Protection (`app/api/keys/*`)

| Route | Method | Current Auth | Target Auth | Identified Vulnerability & Proposed Fix |
|---|---|---|---|---|
| `app/api/keys/route.ts` | GET | `requireAuth` | `requireAdmin` | **Data Leak**: Returns unmasked plaintext `keyValue` to any logged-in user. Fix: Enforce `requireAdmin`. |
| `app/api/keys/route.ts` | POST | `requireAuth` | `requireAdmin` | **Unauthorized Write**: Regular users can register arbitrary API keys. Fix: Enforce `requireAdmin`. |
| `app/api/keys/[id]/route.ts` | PUT | `requireAuth` | `requireAdmin` | **Unauthorized Mutation**: Regular users can edit API key metadata, values, and statuses. Fix: Enforce `requireAdmin`. |
| `app/api/keys/[id]/route.ts` | DELETE | `requireAuth` | `requireAdmin` | **Unauthorized Deletion**: Regular users can delete API keys. Fix: Enforce `requireAdmin`. |
| `app/api/keys/cleanup/route.ts` | POST | `requireAuth` | `requireAdmin` | **Unauthorized Deletion**: Regular users can trigger bulk cleanup of error/disabled keys. Fix: Enforce `requireAdmin`. |
| `app/api/keys/reset/route.ts` | POST | `requireAuth` | `requireAdmin` | **Unauthorized Pool Mutation**: Regular users can reset key states and rotation ordering. Fix: Enforce `requireAdmin`. |
| `app/api/keys/test/route.ts` | POST | `requireAuth` | `requireAdmin` | **Resource Exhaustion & State Poisoning**: Regular users can trigger parallel health checks across all keys. Fix: Enforce `requireAdmin`. |
| `app/api/keys/active-pool/route.ts` | GET | **None (Public)** | `requireAdmin` / Sanitized | **Critical Zero-Auth Leak**: Returns raw `keyValue` strings to unauthenticated clients. Fix: Sanitize to return only counts/health metrics (never raw keys) and require authentication. |

### 2.2 Module Management Endpoints (`app/api/modules/*`)

| Route | Method | Current Auth | Target Auth | Identified Vulnerability & Proposed Fix |
|---|---|---|---|---|
| `app/api/modules/[id]/route.ts` | GET | `requireAuth` | `requireAuth` | Read module details (safe for students & admins). Keep `requireAuth`. |
| `app/api/modules/[id]/route.ts` | PUT | `requireAuth` | `requireAdmin` | **Arbitrary Content Overwrite & FS Write**: Regular users can alter module curriculum and write to disk files. Fix: Enforce `requireAdmin`. |
| `app/api/modules/[id]/route.ts` | DELETE | `requireAuth` | `requireAdmin` | **Unauthorized Content Deletion**: Regular users can purge modules from DB and delete files on disk. Fix: Enforce `requireAdmin`. |
| `app/api/modules/[id]/toggle/route.ts` | POST | `requireAuth` | `requireAdmin` | **Unauthorized State Change**: Regular users can toggle module status (`draft` <-> `tayang`). Fix: Enforce `requireAdmin`. |
| `app/api/modules/[id]/duplicate/route.ts` | POST | `requireAuth` | `requireAdmin` | **Unauthorized Resource Creation**: Regular users can duplicate existing modules. Fix: Enforce `requireAdmin`. |
| `app/api/modules/import/route.ts` | POST | `requireAuth` | `requireAdmin` | **File Injection & DB Overwrite**: Regular users can import raw JSON and overwrite course modules. Fix: Enforce `requireAdmin`. |
| `app/api/modules/update-image/route.ts` | POST | `requireAuth` | `requireAdmin` | **Unauthorized Content Mutation**: Regular users can update/remove module illustration URLs. Fix: Enforce `requireAdmin`. |

### 2.3 Administrative Utilities & Prompt Studio

| Route | Method | Current Auth | Target Auth | Identified Vulnerability & Proposed Fix |
|---|---|---|---|---|
| `app/api/admin/generate-quiz/route.ts` | POST | `requireAuth` + manual role check | `requireAdmin` | Standardize authorization using `requireAdmin(req)`. |
| `app/api/admin/glossary/route.ts` | POST, PUT, DELETE | `requireAuth` + manual role check | `requireAdmin` | Standardize authorization using `requireAdmin(req)`. |
| `app/api/admin/glossary/sync/route.ts` | POST | `requireAuth` + manual role check | `requireAdmin` | Standardize authorization using `requireAdmin(req)`. |
| `app/api/ai/tiktok-prompts/db/route.ts` | POST, DELETE | `requireAuth` | `requireAdmin` | **Data Tampering & Bulk Wipe**: Regular users can save or wipe (`slug=all`) TikTok prompt suites. Fix: Enforce `requireAdmin`. |
| `app/api/ai/tiktok-prompts/route.ts` | POST | **None (Public)** | `requireAdmin` | **Resource Abuse**: Unauthenticated callers can generate high-token AI packages. Fix: Enforce `requireAdmin`. |
| `app/api/cloudinary/upload/route.ts` | POST | `requireAuth` | `requireAdmin` | Admin-only media asset upload. Fix: Enforce `requireAdmin`. |
| `app/api/cloudinary/route.ts` | DELETE | `requireAuth` | `requireAdmin` | Admin-only media asset deletion. Fix: Enforce `requireAdmin`. |

### 2.4 Authentication & Dev Bypass Hardening

**Target File**: `app/api/auth/login/route.ts`
- **Location**: Lines 38-41
- **Current Code**:
  ```typescript
  // Verify password (with dev bypass support for auto-filled dev accounts)
  const isDevPass = password === '__DEV_AUTOFILL__' || password === 'admin123' || password === 'admin123456';
  const isValid = isDevPass || (await verifyPassword(password, user.passwordHash));
  ```
- **Vulnerability**: In production, an attacker supplying `'admin123'` or `'__DEV_AUTOFILL__'` can authenticate as ANY user (including administrator) without verifying the bcrypt password hash.
- **Remediation**:
  ```typescript
  // Verify password (strictly gate dev bypass behind NODE_ENV === 'development')
  const isDev = process.env.NODE_ENV === 'development';
  const isDevPass = isDev && (password === '__DEV_AUTOFILL__' || password === 'admin123' || password === 'admin123456');
  const isValid = isDevPass || (await verifyPassword(password, user.passwordHash));
  ```

---

## 3. Exact Code Replacement Specs for Implementer

### 3.1 `app/api/keys/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function GET(req: NextRequest) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }

 export async function POST(req: NextRequest) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.2 `app/api/keys/[id]/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function PUT(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }

 export async function DELETE(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.3 `app/api/keys/cleanup/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function POST(req: NextRequest) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.4 `app/api/keys/reset/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function POST(req: NextRequest) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.5 `app/api/keys/test/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function POST(req: NextRequest) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.6 `app/api/keys/active-pool/route.ts`
**Full sanitized replacement:**
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { ne } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/keys/active-pool — Sanitized pool health status (Zero raw key leakage)
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const keys = await db
      .select({
        provider: apiKeys.provider,
        status: apiKeys.status,
      })
      .from(apiKeys)
      .where(ne(apiKeys.status, 'disabled'));

    const totalActive = keys.filter((k) => k.status === 'active').length;
    const totalError = keys.filter((k) => k.status === 'error').length;

    return NextResponse.json({
      ok: true,
      total: keys.length,
      active: totalActive,
      error: totalError,
      hasAvailableKeys: totalActive > 0,
    });
  } catch (err: any) {
    console.error('[Active Pool API] Error:', err);
    return NextResponse.json(
      { ok: false, total: 0, active: 0, error: err.message },
      { status: 500 }
    );
  }
}
```

### 3.7 `app/api/modules/[id]/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAuth, requireAdmin } from '@/lib/middleware-auth';

 export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
   const auth = await requireAuth(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }

 export async function PUT(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }

 export async function DELETE(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.8 `app/api/modules/[id]/toggle/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function POST(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
   const { id } = await params;
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.9 `app/api/modules/[id]/duplicate/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function POST(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.10 `app/api/modules/import/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function POST(req: NextRequest) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.11 `app/api/modules/update-image/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function POST(req: NextRequest) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.12 `app/api/admin/generate-quiz/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function POST(req: NextRequest) {
-  const auth = await requireAuth(req);
-  if (auth instanceof NextResponse) return auth;
-  if (auth.role !== 'admin') {
-    return NextResponse.json({ error: 'Unauthorized: Hanya admin yang bisa membuat soal.' }, { status: 403 });
-  }
+  const auth = await requireAdmin(req);
+  if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.13 `app/api/admin/glossary/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAuth, requireAdmin } from '@/lib/middleware-auth';

 export async function GET(req: NextRequest) {
   const auth = await requireAuth(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }

 export async function POST(req: NextRequest) {
-  const auth = await requireAuth(req);
-  if (auth instanceof NextResponse) return auth;
-  if (auth.role !== 'admin') {
-    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
-  }
+  const auth = await requireAdmin(req);
+  if (auth instanceof NextResponse) return auth;
   ...
 }

 export async function PUT(req: NextRequest) {
-  const auth = await requireAuth(req);
-  if (auth instanceof NextResponse) return auth;
-  if (auth.role !== 'admin') {
-    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
-  }
+  const auth = await requireAdmin(req);
+  if (auth instanceof NextResponse) return auth;
   ...
 }

 export async function DELETE(req: NextRequest) {
-  const auth = await requireAuth(req);
-  if (auth instanceof NextResponse) return auth;
-  if (auth.role !== 'admin') {
-    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
-  }
+  const auth = await requireAdmin(req);
+  if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.14 `app/api/admin/glossary/sync/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function POST(req: NextRequest) {
-  const auth = await requireAuth(req);
-  if (auth instanceof NextResponse) return auth;
-  if (auth.role !== 'admin') {
-    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
-  }
+  const auth = await requireAdmin(req);
+  if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.15 `app/api/ai/tiktok-prompts/db/route.ts`
```diff
-import { requireAuth } from '@/lib/middleware-auth';
+import { requireAuth, requireAdmin } from '@/lib/middleware-auth';

 export async function GET(req: NextRequest) {
   const auth = await requireAuth(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }

 export async function POST(req: NextRequest) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }

 export async function DELETE(req: NextRequest) {
-  const auth = await requireAuth(req);
+  const auth = await requireAdmin(req);
   if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.16 `app/api/ai/tiktok-prompts/route.ts`
```diff
+import { requireAdmin } from '@/lib/middleware-auth';

 export async function POST(req: NextRequest) {
+  const auth = await requireAdmin(req);
+  if (auth instanceof NextResponse) return auth;
   ...
 }
```

### 3.17 `app/api/auth/login/route.ts`
```diff
-    // Verify password (with dev bypass support for auto-filled dev accounts)
-    const isDevPass = password === '__DEV_AUTOFILL__' || password === 'admin123' || password === 'admin123456';
-    const isValid = isDevPass || (await verifyPassword(password, user.passwordHash));
+    // Verify password (strictly gate dev bypass behind NODE_ENV === 'development')
+    const isDev = process.env.NODE_ENV === 'development';
+    const isDevPass = isDev && (password === '__DEV_AUTOFILL__' || password === 'admin123' || password === 'admin123456');
+    const isValid = isDevPass || (await verifyPassword(password, user.passwordHash));
```

---

## 4. Architectural Verification Plan

1. **Unauthenticated Access Probe**:
   - Request `GET /api/keys`, `POST /api/keys`, `GET /api/keys/active-pool`, `PUT /api/modules/brvt-01`, `POST /api/ai/tiktok-prompts` without `Cookie: brevet_session=...`.
   - Expected status: `401 Unauthorized`.
2. **Student Access Probe (`role: 'user'`)**:
   - Issue valid student JWT cookie (`role: 'user'`).
   - Request `GET /api/keys`, `POST /api/keys`, `DELETE /api/keys/xyz`, `POST /api/keys/cleanup`, `POST /api/keys/reset`, `POST /api/keys/test`, `PUT /api/modules/xyz`, `DELETE /api/modules/xyz`, `POST /api/modules/xyz/toggle`, `POST /api/modules/import`, `POST /api/ai/tiktok-prompts`.
   - Expected status: `403 Forbidden` (`Akses ditolak. Fitur ini hanya untuk Administrator.`).
3. **Admin Access Probe (`role: 'admin'`)**:
   - Issue valid admin JWT cookie (`role: 'admin'`).
   - Request all above endpoints.
   - Expected status: `200 OK` / valid business logic response.
4. **Active Key Pool Sanitization Probe**:
   - Request `GET /api/keys/active-pool` with student or admin cookie.
   - Ensure payload contains `{ ok: true, total: number, active: number, error: number, hasAvailableKeys: boolean }` and ZERO instances of `keyValue`, `api_key`, `secret`, or raw credentials.
5. **Login Bypass Gating Probe**:
   - In `NODE_ENV=production`, attempt login using `'admin123'` against an account with non-matching hash -> must return `401 Unauthorized`.
   - In `NODE_ENV=development`, dev bypass works for test automation.
