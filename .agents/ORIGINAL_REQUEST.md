# Original User Request

## 2026-08-24T13:39:04Z

# Production User Portal, Progress & Scoring System, and Admin Separation

Working directory: C:\\Users\\NCN0C\\.gemini\\antigravity\scratch\\brevet_mobile_revampIntegrity mode: development

Build a full production-grade User Management, Progress Tracking, and Role Separation System for the Brevet AB & DJP Tax Learning Platform. Separate user-facing learning portals from the administrative panel, with robust backend validation and persistent database records.

## Requirements

### R1. User Authentication & Role Separation (User vs Admin)
Implement clean role-based authentication separating regular student users (role: 'user') from administrators (role: 'admin'). Ensure protected route middleware prevents regular users from accessing /admin/* management tools, while giving users a dedicated dashboard (/dashboard / /profil).

### R2. Persistent User Learning Progress & Exam History
Store and track student learning progress per module, completed sub-sections, mini quiz scores, final exam attempts (100 questions), and DJP exam simulations (TKB, Esai, Wawancara) linked to user accounts in PostgreSQL/Neon DB. Provide real-time sync with offline fallback.

### R3. Comprehensive Backend Validation & API Security
Create robust backend validation layers with Zod schemas for all API endpoints (/api/user/*, /api/progress/*, /api/attempts/+, /api/auth/*). Implement proper sanitization, rate limiting, and structured error responses.

### R4. Production User Dashboard & Performance Analytics UI
Build a user dashboard displaying learning milestones, competency spider/radar charts, quiz pass rates, study streaks, and certificates/scorecards.

	## Acceptance Criteria

- [ ] Users can register, log in, view their personal profile, and track learning progress.
- [ ] Regular users attempting to access /admin/* are rejected or redirected.
- [ ] Admins retain full access to module management, API keys, and prompt studio.
- [ ] Module section completions, mini-quiz answers, and final quiz scores persist in database.
- [ ] DJP exam attempt logs (MCQ scores, Essay AI evaluations, and Interview ratings) are recorded and retrievable in user history.
- [ ] All new backend routes pass Zod schema validation.
- [ ] Project builds cleanly (npm run build) with zero TypeScript and runtime errors.
