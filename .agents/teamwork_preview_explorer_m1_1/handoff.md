# Milestone 1 Route Guardrails — Handoff Report

## 1. Observation

1. **File System & Middleware Discovery**:
   - `proxy.ts` exists at `C:\Users\NCN0C\.gemini\antigravity\scratch\brevet_mobile_revamp\proxy.ts` (lines 1-86).
   - In `proxy.ts`, line 21 defines: `export async function proxy(req: NextRequest)`.
   - There is NO `middleware.ts` in the project root or in `src/`.
   - Next.js 16.2.12 convention requires the file to be `middleware.ts` exporting `middleware(req: NextRequest)`.
   - `proxy.ts` contains full edge route guard logic for `/login`, `/register`, `/admin/*`, `/dashboard/*`, `/profil/*`, and `/api/admin/*` using `verifyTokenFromCookieString` from `lib/auth.ts`.

2. **Admin Server Component Layout**:
   - In `app/admin/layout.tsx` (lines 22-26):
     ```typescript
     const user = await getCurrentUser(fakeReq);

     if (!user) {
       redirect('/login');
     }
     ```
   - No check is made on `user.role === 'admin'`. A logged-in user with `role: 'user'` (student) passes this check and renders the admin layout shell.

3. **API Auth Guards in Route Handlers**:
   - `lib/middleware-auth.ts` (lines 8-39) defines:
     - `requireAuth(req)`: returns 401 JSON `{ error: 'Belum login. Silakan login terlebih dahulu.' }` when unauthenticated.
     - `requireAdmin(req)`: returns 403 JSON `{ error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' }` when `user.role !== 'admin'`.
   - A codebase-wide scan using PowerShell `Select-String` revealed that 18 administrative route files in `app/api/admin/*`, `app/api/keys/*`, `app/api/modules/*`, `app/api/prompts/*`, and `app/api/ai/tiktok-prompts/db` are importing and calling `requireAuth` instead of `requireAdmin`.

4. **TypeScript Build Verification**:
   - Running `npx tsc --noEmit` on the project root completed with exit code 0 and 0 errors.

---

## 2. Logic Chain

1. **Edge Middleware Routing**:
   - *Observation 1* shows `proxy.ts` is not named `middleware.ts` and exports `proxy` instead of `middleware`.
   - *Logic*: Because Next.js App Router only hooks into `middleware.ts`, renaming/copying `proxy.ts` to `middleware.ts` and exporting `async function middleware(req: NextRequest)` will immediately activate Next.js edge route interception for `/admin/*`, `/dashboard/*`, `/profil/*`, and `/login` / `/register`.
   - Because `verifyTokenFromCookieString` relies exclusively on `jose.jwtVerify` (Web Crypto API), it runs at the Edge without DB latency or Node.js runtime incompatibilities.

2. **Defense-in-Depth for Administrative Pages**:
   - *Observation 2* shows `app/admin/layout.tsx` only validates presence of `user`, not `user.role`.
   - *Logic*: Adding `if (user.role !== 'admin') redirect('/dashboard');` creates a secondary security layer directly inside the Server Component. If an edge middleware bypass or misconfiguration occurs, the Server Component will still prevent unauthorized students from accessing or viewing admin layouts.

3. **API Level Authorization**:
   - *Observation 3* reveals administrative endpoints (`/api/keys/*`, `/api/modules/*`, `/api/admin/*`) use `requireAuth` rather than `requireAdmin`.
   - *Logic*: `requireAuth` only checks if a token is valid, allowing students with `role: 'user'` to mutate modules and Gemini API keys. Updating these route handlers to `requireAdmin` ensures a strict HTTP 403 Forbidden with `{ error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' }` is returned to non-admin accounts.

---

## 3. Caveats

1. **First-Run Admin Setup**: `app/api/auth/setup/route.ts` and `app/api/auth/me/route.ts` support a first-run flow when no users exist in the database. `middleware.ts` includes `/api/auth/setup` in `PUBLIC_PATHS` to ensure initial bootstrap remains accessible.
2. **Client AI Key Pool**: `app/api/keys/active-pool/route.ts` is called by `lib/client-gemini.ts`. If students use client-side Gemini AI features (e.g. essay analysis / chat), `active-pool` can require `requireAuth` rather than `requireAdmin`, or server-side proxying should be preferred.
3. **Mock Request in Server Component**: `app/admin/layout.tsx` constructs a mock `NextRequest` to call `getCurrentUser`. While functional, creating a direct `getServerUser()` helper in `lib/auth.ts` is cleaner and avoids instantiating `NextRequest` in Server Components.

---

## 4. Conclusion

The implementation plan for Milestone 1 is clear, sound, and fully specified:
1. **Copy/refactor `proxy.ts` to `middleware.ts`** in the project root, changing the exported function to `export async function middleware(req: NextRequest)`.
2. **Add the role check to `app/admin/layout.tsx`**:
   ```typescript
   if (!user) {
     redirect('/login');
   }
   if (user.role !== 'admin') {
     redirect('/dashboard');
   }
   ```
3. **Update administrative API endpoints** (`/api/keys/*`, `/api/modules/*` mutations, `/api/admin/*`, `/api/prompts/*`) to enforce `requireAdmin(req)`.
4. **Create `/app/profil/page.tsx`** for student profile management and ensure `/profil/*` is guarded by `middleware.ts`.

---

## 5. Verification Method

To independently verify the implementation:
1. **Edge Middleware & Page Guarding**:
   - Visit `http://localhost:3000/admin` without a session cookie -> verify redirect to `/login?redirect=%2Fadmin`.
   - Log in as a student (`role: 'user'`) -> visit `http://localhost:3000/admin` -> verify redirect to `/dashboard`.
   - Log in as admin (`role: 'admin'`) -> visit `http://localhost:3000/admin` -> verify access to admin panel.
   - Visit `http://localhost:3000/dashboard` and `http://localhost:3000/profil` without session -> verify redirect to `/login`.
2. **API Route Authorization**:
   - Send `POST /api/keys` or `POST /api/modules` with a student session cookie -> verify HTTP 403 `{ error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' }`.
   - Send `POST /api/keys` or `POST /api/modules` without cookie -> verify HTTP 401 `{ error: 'Belum login. Silakan login terlebih dahulu.' }`.
   - Send `POST /api/keys` with admin session cookie -> verify HTTP 200/201.
3. **Build Integrity**:
   - Run `npx tsc --noEmit` and `npm run build` to confirm 0 TypeScript and build errors.
