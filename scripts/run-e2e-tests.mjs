#!/usr/bin/env node

/**
 * Brevet AB & DJP Tax Learning Platform — E2E Test Suite Runner Harness
 * Executes 4 tiers of opaque-box, requirement-driven tests.
 */

import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

const TIERS = [
  {
    tier: 1,
    name: 'Tier 1: Feature Coverage (Isolation)',
    file: 'tests/e2e/tier1-feature-coverage.test.mjs',
    minExpected: 75,
  },
  {
    tier: 2,
    name: 'Tier 2: Boundary & Corner Cases',
    file: 'tests/e2e/tier2-boundary-corner.test.mjs',
    minExpected: 75,
  },
  {
    tier: 3,
    name: 'Tier 3: Pairwise Combinations (Integration)',
    file: 'tests/e2e/tier3-pairwise-combinations.test.mjs',
    minExpected: 15,
  },
  {
    tier: 4,
    name: 'Tier 4: Real-World Scenarios (Workflows)',
    file: 'tests/e2e/tier4-real-world-scenarios.test.mjs',
    minExpected: 8,
  },
  {
    tier: 5,
    name: 'Tier 5: Adversarial Security & Role Escalation Hardening',
    file: 'tests/e2e/m1-adversarial-security.test.mjs',
    minExpected: 30,
  },
];

async function main() {
  const args = process.argv.slice(2);
  const tierArg = args.find((a) => a.startsWith('--tier=') || a.startsWith('-t='));
  const filterTier = tierArg ? parseInt(tierArg.split('=')[1], 10) : null;
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log(`\n${ANSI.bold}${ANSI.cyan}=================================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}  BREVET AB & DJP TAX LEARNING PLATFORM — E2E TEST SUITE RUNNER  ${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}=================================================================${ANSI.reset}\n`);

  let totalExecuted = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const tierReports = [];
  const startTime = Date.now();

  const selectedTiers = filterTier
    ? TIERS.filter((t) => t.tier === filterTier)
    : TIERS;

  for (const tierConfig of selectedTiers) {
    const fullPath = path.resolve(process.cwd(), tierConfig.file);
    if (!fs.existsSync(fullPath)) {
      console.log(`${ANSI.red}✖ Missing test file: ${tierConfig.file}${ANSI.reset}`);
      totalFailed++;
      continue;
    }

    console.log(`${ANSI.bold}${ANSI.blue}▶ Running ${tierConfig.name}${ANSI.reset}`);
    console.log(`${ANSI.dim}  Source: ${tierConfig.file}${ANSI.reset}`);

    const tierStart = Date.now();
    try {
      const moduleUrl = pathToFileURL(fullPath).href;
      const testModule = await import(moduleUrl);
      
      if (typeof testModule.runSuite !== 'function') {
        throw new Error(`Module ${tierConfig.file} does not export a runSuite() function.`);
      }

      const suiteResult = await testModule.runSuite();
      const tierDuration = Date.now() - tierStart;

      totalExecuted += suiteResult.total;
      totalPassed += suiteResult.passed;
      totalFailed += suiteResult.failed;

      tierReports.push({
        ...tierConfig,
        ...suiteResult,
        durationMs: tierDuration,
      });

      // Print itemized test results
      for (const item of suiteResult.details) {
        if (item.status === 'PASSED') {
          if (verbose) {
            console.log(`    ${ANSI.green}✓${ANSI.reset} ${item.name} ${ANSI.dim}(${item.durationMs}ms)${ANSI.reset}`);
          }
        } else {
          console.log(`    ${ANSI.red}✖${ANSI.reset} ${item.name}`);
          console.log(`      ${ANSI.red}Error: ${item.error}${ANSI.reset}`);
        }
      }

      const passRate = suiteResult.total > 0 ? Math.round((suiteResult.passed / suiteResult.total) * 100) : 0;
      const statusColor = suiteResult.failed === 0 ? ANSI.green : ANSI.red;
      console.log(
        `  ${statusColor}Result: ${suiteResult.passed}/${suiteResult.total} passed (${passRate}%) in ${tierDuration}ms${ANSI.reset}`
      );
      if (suiteResult.total < tierConfig.minExpected) {
        console.log(
          `  ${ANSI.yellow}⚠ Warning: Expected at least ${tierConfig.minExpected} tests, found ${suiteResult.total}${ANSI.reset}`
        );
      }
      console.log('');
    } catch (err) {
      console.error(`  ${ANSI.red}✖ Suite execution failed: ${err.message}${ANSI.reset}\n`, err);
      totalFailed++;
    }
  }

  const totalDuration = Date.now() - startTime;

  console.log(`${ANSI.bold}=================================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}                      TEST EXECUTION SUMMARY                     ${ANSI.reset}`);
  console.log(`${ANSI.bold}=================================================================${ANSI.reset}`);

  for (const report of tierReports) {
    const icon = report.failed === 0 ? `${ANSI.green}✓${ANSI.reset}` : `${ANSI.red}✖${ANSI.reset}`;
    console.log(
      `  ${icon} Tier ${report.tier}: ${report.passed}/${report.total} passed (${report.durationMs}ms)`
    );
  }

  console.log('-----------------------------------------------------------------');
  console.log(
    `  Total Tests:    ${ANSI.bold}${totalExecuted}${ANSI.reset}`
  );
  console.log(
    `  Passed Tests:   ${ANSI.bold}${ANSI.green}${totalPassed}${ANSI.reset}`
  );
  console.log(
    `  Failed Tests:   ${totalFailed > 0 ? ANSI.bold + ANSI.red : ANSI.bold + ANSI.green}${totalFailed}${ANSI.reset}`
  );
  console.log(
    `  Total Duration: ${ANSI.dim}${totalDuration}ms${ANSI.reset}`
  );
  console.log(`${ANSI.bold}=================================================================${ANSI.reset}\n`);

  if (totalFailed > 0) {
    console.log(`${ANSI.bgRed}${ANSI.bold}  TEST SUITE FAILED — Fix failures before deployment.  ${ANSI.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${ANSI.bgGreen}${ANSI.bold}  ALL E2E TESTS PASSED SUCCESSFULLY (100%)  ${ANSI.reset}\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
