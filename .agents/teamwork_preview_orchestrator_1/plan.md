# Master Project Plan: Brevet AB & DJP Tax Learning Platform - User Management, Progress Tracking & Role Separation

## Strategic Objectives
1. Multi-role Auth System (Role: 'user' vs 'admin') with middleware protection on `/admin/*` and dedicated user portals (`/dashboard`, `/profil`).
2. Persistent User Learning Progress & Exam History in PostgreSQL/Neon DB (module completions, mini-quiz answers, 100-question final exam attempts, DJP TKB/Esai/Wawancara simulations) with real-time sync & offline fallback.
3. Backend Validation & API Security: Full Zod schema validation across all endpoints (`/api/user/*`, `/api/progress/*`, `/api/attempts/*`, `/api/auth/*`), sanitization, rate limiting, and structured error responses.
4. User Dashboard & Performance Analytics UI: Spider/radar competency charts, pass rates, study streaks, certificates/scorecards.
5. Production Readiness: Clean TypeScript build (`npm run build`), comprehensive test suites.

## Execution Phases
- **Phase 0: Comprehensive Codebase Survey**:
  - Dispatch 3 Explorers / Spec Miners to investigate project architecture, package.json, prisma/schema.prisma, existing auth/routes/pages, UI components, database configuration, and DJP simulation engines.
- **Phase 1: Project Blueprinting (PROJECT.md & TEST_INFRA.md)**:
  - Consolidate Feature Inventory, define modular milestones (M1 Auth & Role Guards, M2 Database Schema & Progress/Attempts Persistence, M3 API Routes & Zod Validation, M4 User Analytics & Dashboard UI, M5 DJP Simulation Integration & Real-time/Offline Sync).
  - Define Interface Contracts and Code Layout.
- **Phase 2: Dual Track Execution**:
  - Track A: E2E Testing Orchestrator (Tiers 1-4 opaque-box test suites).
  - Track B: Sub-orchestrators for milestones M1 -> M4 -> M5.
- **Phase 3: Integration & Final E2E Milestone**:
  - Phase 3.1: 100% E2E test suite passing.
  - Phase 3.2: Adversarial Coverage Hardening (Tier 5).
- **Phase 4: Final Forensic Audit & Verification**:
  - Full clean build check (`npm run build`), clean audit verdict, and final handoff.
