# E2E Test Infra: Brevet AB & DJP Tax Learning Platform

## Test Philosophy
- **Opaque-box, requirement-driven**: Test the system strictly via public entry points (HTTP API routes, middleware routing, and UI page rendering contracts) as an end user or auditor would.
- **Methodology**: 4-Tier Test Suite Architecture (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial Testing, Real-World Workload Testing).

## Feature Inventory & Test Mapping
| # | Feature | Requirement | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|---|---------|-------------|:----------------:|:-----------------:|:-----------------:|:-----------------:|
| 1 | User Registration & Role Assignment | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | Login & Session Cookie Handling | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 3 | Edge Middleware Route Protection | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 4 | Admin Layout Defense-in-Depth | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 5 | Admin API Keys & Module Protection | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 6 | Student Profile & Account Management | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 7 | Module Section Progress Persistence | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 8 | Mini-Quiz & 100-Q Exam Persistence | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 9 | DJP Exam Simulation (4 Modes) Persistence | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 10 | Offline Caching & Draft Recovery | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 11 | Zod Input Validation & Schema Errors | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 12 | API Security, Sanitization & Dev Guard | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 13 | Competency Radar Chart Rendering | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 14 | Study Streak & Activity Heatmap | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 15 | Scorecards & Certificate Generation | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Test Runner Location**: `scripts/run-e2e-tests.mjs` (Node.js test suite runner executing automated tests against all API endpoints and route security contracts).
- **Test Case Organization**: `tests/e2e/`
  - `tier1-feature-coverage.test.mjs`: Tests each individual feature in isolation (>= 75 tests).
  - `tier2-boundary-corner.test.mjs`: Boundary tests, empty inputs, invalid types, extreme scores, unauthorized tokens (>= 75 tests).
  - `tier3-pairwise-combinations.test.mjs`: Multi-step user flows (Register -> Login -> Complete Section -> Attempt Quiz -> Take DJP Exam -> Check Dashboard Stats) (>= 15 combinations).
  - `tier4-real-world-scenarios.test.mjs`: End-to-end user journeys (Full Brevet AB curriculum study flow, DJP exam candidate simulation, Admin module publishing flow, Offline-to-Online sync flow) (>= 8 realistic scenarios).
- **Pass/Fail Semantics**: Process exits with code 0 if 100% tests pass; non-zero if any test fails.

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥ 75 test cases (5 per feature × 15 features).
- **Tier 2 (Boundary & Corner)**: ≥ 75 test cases (5 per feature × 15 features).
- **Tier 3 (Cross-Feature Combinations)**: ≥ 15 pairwise integration test cases.
- **Tier 4 (Real-World Application Scenarios)**: ≥ 8 complete user workflows.
- **Total Minimum Target**: ≥ 173 E2E test cases.
