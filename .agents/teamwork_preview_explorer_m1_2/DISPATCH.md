## 2026-08-24T13:48:45Z
Investigate and design the exact technical implementation plan for Milestone 1 Admin API Security and Key Protection:
1. Inspect all routes under `app/api/keys/*` (`route.ts`, `[id]/route.ts`, `cleanup/route.ts`, `reset/route.ts`, `test/route.ts`). Identify where `requireAdmin` must replace `requireAuth`, and ensure plain API keys are never leaked to regular users.
2. Inspect `app/api/keys/active-pool/route.ts` to ensure it is either protected with `requireAdmin` or sanitized to only return provider statuses/counts without exposing raw keys.
3. Inspect `app/api/modules/[id]/route.ts` (PUT, DELETE), `app/api/modules/[id]/toggle/route.ts`, `duplicate/route.ts`, `import/route.ts`, `update-image/route.ts`, `app/api/admin/generate-quiz/route.ts`, `app/api/admin/glossary/route.ts`, `app/api/ai/tiktok-prompts/db/route.ts` (POST/DELETE) to ensure `requireAdmin` is enforced.
4. Inspect `app/api/auth/login/route.ts` line 39 to ensure dev bypass credentials are gated behind `process.env.NODE_ENV === 'development'`.
