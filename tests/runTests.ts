/**
 * Test Runner Script for AgriSentinel AI
 */

import { runSecurityTestSuite } from './api/security/security.test';

console.log('==================================================');
console.log('AgriSentinel AI: Automated Security & QA Invariants');
console.log('==================================================\n');

const results = runSecurityTestSuite();
let allPassed = true;

results.forEach((r, idx) => {
  const icon = r.status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} [Test ${idx + 1}] ${r.test}`);
  console.log(`   Result: ${r.status} — ${r.details}\n`);
  if (r.status !== 'PASSED') allPassed = false;
});

if (allPassed) {
  console.log('All security and architectural invariant tests PASSED successfully.');
  process.exit(0);
} else {
  console.error('Some tests FAILED.');
  process.exit(1);
}
