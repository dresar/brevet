#!/usr/bin/env node

/**
 * Milestone 1 Adversarial Security Test Suite Runner
 */

import { pathToFileURL } from 'node:url';
import path from 'node:path';

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

async function main() {
  console.log(`\n${ANSI.bold}${ANSI.cyan}=================================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}   MILESTONE 1 ADVERSARIAL SECURITY & ESCALATION TEST RUNNER   ${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}=================================================================${ANSI.reset}\n`);

  const testFilePath = path.resolve(process.cwd(), 'tests/e2e/m1-adversarial-security.test.mjs');
  const moduleUrl = pathToFileURL(testFilePath).href;
  const testModule = await import(moduleUrl);

  const start = Date.now();
  const results = await testModule.runSuite();
  const duration = Date.now() - start;

  console.log(`${ANSI.bold}${ANSI.blue}▶ Suite: ${results.suiteName}${ANSI.reset}\n`);

  for (const item of results.details) {
    if (item.status === 'PASSED') {
      console.log(`  ${ANSI.green}✓${ANSI.reset} ${item.name} ${ANSI.dim}(${item.durationMs}ms)${ANSI.reset}`);
    } else {
      console.log(`  ${ANSI.red}✖${ANSI.reset} ${item.name}`);
      console.log(`    ${ANSI.red}Error: ${item.error}${ANSI.reset}`);
    }
  }

  console.log(`\n${ANSI.bold}=================================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}                  ADVERSARIAL EXECUTION SUMMARY                  ${ANSI.reset}`);
  console.log(`${ANSI.bold}=================================================================${ANSI.reset}`);
  console.log(`  Total Tests:    ${ANSI.bold}${results.total}${ANSI.reset}`);
  console.log(`  Passed Tests:   ${ANSI.bold}${ANSI.green}${results.passed}${ANSI.reset}`);
  console.log(`  Failed Tests:   ${results.failed > 0 ? ANSI.bold + ANSI.red : ANSI.bold + ANSI.green}${results.failed}${ANSI.reset}`);
  console.log(`  Total Duration: ${ANSI.dim}${duration}ms${ANSI.reset}`);
  console.log(`${ANSI.bold}=================================================================${ANSI.reset}\n`);

  if (results.failed > 0) {
    console.log(`${ANSI.bgRed}${ANSI.bold}  ADVERSARIAL SECURITY TESTS FAILED  ${ANSI.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${ANSI.bgGreen}${ANSI.bold}  ALL ADVERSARIAL SECURITY TESTS PASSED (100%)  ${ANSI.reset}\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal Runner Error:', err);
  process.exit(1);
});
