# Handoff Report: Milestone 1 Admin API Security and Key Protection

**Agent ID**: `teamwork_preview_explorer_m1_2`  
**Recipient**: `parent` (Orchestrator: `80e966cd-4f92-46d4-814a-befb7d338253`) & Milestone 1 Implementers  
**Type**: Hard Handoff (Investigation Complete)  
**Date**: 2026-08-24  

---

## 1. Observation

Direct code inspection of route handlers and authentication layers in `brevet_mobile_revamp` revealed the following exact lines and behaviors:

1. **`app/api/keys/active-pool/route.ts` (Lines 9-29)**:
   ```typescript
   export async function GET() {
     try {
       const keys = await db
         .select({
           id: apiKeys.id,
           keyValue: apiKeys.keyValue,
           name: apiKeys.name,
         })
         .from(apiKeys)
         .where(ne(apiKeys.status, 'disabled'))
         .orderBy(...)
         .limit(40);

       return NextResponse.json({
         ok: true,
         keys: keys.map((k) => k.keyValue),
       });
   ```
   - **Observation**: Zero authentication guard exists. Any unauthenticated caller receives up to 40 unmasked Gemini/ElevenLabs/Cloudinary credentials in plaintext JSON.

2. **`app/api/keys/route.ts` (Lines 4, 13, 41)**:
   ```typescript
   import { requireAuth } from '@/lib/middleware-auth';
   ...
   export async function GET(req: NextRequest) {
     const auth = await requireAuth(req);
     if (auth instanceof NextResponse) return auth;
     ...
     return NextResponse.json({ keys: masked }); // Contains full unmasked keyValue
   }
   export async function POST(req: NextRequest) {
     const auth = await requireAuth(req);
   ```
   - **Observation**: Uses `requireAuth` instead of `requireAdmin`. Authenticated regular students (`role: 'user'`) can view all stored API keys in plain text and insert new keys into the database.

3. **`app/api/keys/[id]/route.ts` (Lines 16, 70)**, **`cleanup/route.ts` (Line 11)**, **`reset/route.ts` (Line 12)**, **`test/route.ts` (Line 14)**:
   - **Observation**: All use `requireAuth(req)`. Students with `role: 'user'` can mutate, clean up, reset, or execute batch health tests on the platform's API keys.

4. **`app/api/modules/[id]/route.ts` (Lines 39, 72)**, **`toggle/route.ts` (Line 15)**, **`duplicate/route.ts` (Line 15)**, **`import/route.ts` (Line 14)**, **`update-image/route.ts` (Line 13)**:
   - **Observation**: All use `requireAuth(req)`. Any student user can overwrite or delete modules in the database, write JSON to `data/modules/*.json` on the server disk, toggle publishing status, duplicate modules, or replace module images.

5. **`app/api/admin/generate-quiz/route.ts` (Lines 13-17)**, **`app/api/admin/glossary/route.ts` (Lines 91-96, 186-191, 223-228)**, **`app/api/admin/glossary/sync/route.ts` (Lines 14-18)**:
   - **Observation**: Uses `requireAuth(req)` coupled with manual `if (auth.role !== 'admin') return 403` checks. This pattern should be standardized to `requireAdmin(req)`.

6. **`app/api/ai/tiktok-prompts/db/route.ts` (Lines 45, 82)** & **`app/api/ai/tiktok-prompts/route.ts` (Line 13)**:
   - **Observation**: `tiktok-prompts/route.ts` is unauthenticated. `tiktok-prompts/db/route.ts` POST and DELETE use `requireAuth`, allowing students to overwrite prompts or execute `slug === 'all'` table wipes.

7. **`app/api/auth/login/route.ts` (Lines 39-40)**:
   ```typescript
   // Verify password (with dev bypass support for auto-filled dev accounts)
   const isDevPass = password === '__DEV_AUTOFILL__' || password === 'admin123' || password === 'admin123456';
   const isValid = isDevPass || (await verifyPassword(password, user.passwordHash));
   ```
   - **Observation**: `isDevPass` is active in all environments including production, bypassing password hash verification.

---

## 2. Logic Chain

1. **Premise 1**: Role separation requires that administrative operations (module CRUD, API key lifecycle, prompt engineering, system resets) are restricted to users with `role === 'admin'` (`PROJECT.md` §17, `ORIGINAL_REQUEST.md` §R1).
2. **Premise 2**: `lib/middleware-auth.ts` exports `requireAdmin(req)` which verifies JWT session, queries user role, and immediately returns a `403 Forbidden` JSON response (`{ error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' }`) if `user.role !== 'admin'`, or `401 Unauthorized` if unauthenticated.
3. **Inference 1**: Replacing `requireAuth` with `requireAdmin` across `app/api/keys/*` and module mutation routes strictly eliminates unauthorized student mutations.
4. **Premise 3**: Exposing third-party API keys (Gemini, ElevenLabs, Cloudinary) to client browsers causes credential theft and unauthorized API usage.
5. **Inference 2**: `app/api/keys/active-pool/route.ts` must never return raw key values. Returning only sanitized counts/health status prevents credential theft while satisfying UI indicators.
6. **Premise 4**: Authentication mechanisms must not allow hardcoded bypass passwords in production.
7. **Inference 3**: Gating `isDevPass` behind `process.env.NODE_ENV === 'development'` in `app/api/auth/login/route.ts` secures production logins while maintaining local test developer velocity.

---

## 3. Caveats

1. **Client-side AI Streaming**: `lib/client-gemini.ts` previously referenced `/api/keys/active-pool` for direct browser-to-Gemini requests. However, primary generation already flows through `bandelbanget.xyz` or server routes (`/api/ai/chat`, `/api/ai/evaluate-essay`). Sanitizing `active-pool` protects keys from extraction.
2. **Read-only Investigation**: In accordance with the Explorer archetype, no source files have been modified. Full code patch specifications are documented in `analysis.md`.
3. **Parallel Explorer Coordination**: Explorer 1 is covering page-level edge middleware (`middleware.ts`), layout defense (`app/admin/layout.tsx`), and the student profile portal (`/profil`). Our recommendations integrate seamlessly with Explorer 1's architecture.

---

## 4. Conclusion

All administrative endpoints and API key management routes have clear, low-risk, high-impact fixes:
- Enforce `requireAdmin` across 16 API route handlers.
- Sanitize `GET /api/keys/active-pool` to eliminate raw key leakage.
- Gate the dev login bypass behind `process.env.NODE_ENV === 'development'`.

Detailed diffs and drop-in replacements are provided in `C:\Users\NCN0C\.gemini\antigravity\scratch\brevet_mobile_revamp\.agents\teamwork_preview_explorer_m1_2\analysis.md`.

---

## 5. Verification Method

Once the implementer applies the changes, verify via the following tests:

1. **Automated Role Protection Test**:
   - Send requests with student JWT cookie (`role: 'user'`) to:
     - `GET /api/keys` -> Expected `403 Forbidden`
     - `POST /api/keys` -> Expected `403 Forbidden`
     - `PUT /api/keys/:id` -> Expected `403 Forbidden`
     - `DELETE /api/keys/:id` -> Expected `403 Forbidden`
     - `POST /api/keys/cleanup` -> Expected `403 Forbidden`
     - `POST /api/keys/reset` -> Expected `403 Forbidden`
     - `POST /api/keys/test` -> Expected `403 Forbidden`
     - `PUT /api/modules/:id` -> Expected `403 Forbidden`
     - `DELETE /api/modules/:id` -> Expected `403 Forbidden`
     - `POST /api/modules/:id/toggle` -> Expected `403 Forbidden`
     - `POST /api/modules/:id/duplicate` -> Expected `403 Forbidden`
     - `POST /api/modules/import` -> Expected `403 Forbidden`
     - `POST /api/modules/update-image` -> Expected `403 Forbidden`
     - `POST /api/ai/tiktok-prompts` -> Expected `403 Forbidden`
     - `POST /api/ai/tiktok-prompts/db` -> Expected `403 Forbidden`
     - `DELETE /api/ai/tiktok-prompts/db` -> Expected `403 Forbidden`
2. **Active Pool Sanitization Test**:
   - `GET /api/keys/active-pool` with valid auth -> Response body must NOT contain any `keyValue` property or key strings; must return `{ ok: true, total: number, active: number, error: number, hasAvailableKeys: boolean }`.
3. **Production Login Bypass Test**:
   - Set `NODE_ENV=production`, attempt `POST /api/auth/login` with `{ email: "admin@brevet.id", password: "admin123" }` against account with different hash -> Expected `401 Unauthorized`.
4. **TypeScript Build Verification**:
   - Execute `npm run build` or `npx tsc --noEmit` -> Must succeed with zero TypeScript errors.
