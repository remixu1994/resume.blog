#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const getArg = (name, fallback = '') => {
  const prefix = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const root = process.cwd();
const releaseId = getArg('release-id', process.env.RELEASE_ID || new Date().toISOString().replace(/[:.]/g, '-'));
const testCommand = getArg('test-command', process.env.RELEASEOPS_TEST_COMMAND || 'npm test');
const healthUrl = getArg('health-url', process.env.RELEASEOPS_HEALTHCHECK_URL || '');
const healthSamples = Number(getArg('health-samples', process.env.RELEASEOPS_HEALTHCHECK_SAMPLES || '3'));
const healthTimeoutMs = Number(getArg('health-timeout-ms', process.env.RELEASEOPS_HEALTHCHECK_TIMEOUT_MS || '5000'));
const rollbackDir = join(root, 'docs', 'releaseops', 'rollback-notes');
const rollbackPath = join(rollbackDir, `${releaseId}.md`);

const runCommand = (command) => {
  const result = spawnSync(command, {
    shell: true,
    cwd: root,
    stdio: 'inherit'
  });

  return result.status === 0;
};

const checkMigrations = () => {
  const value = String(process.env.RELEASEOPS_MIGRATIONS_CHECKED || '').toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
};

const healthcheckOnce = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'cache-control': 'no-cache'
      }
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

const runHealthchecks = async (url, samples, timeoutMs) => {
  if (!url) {
    return { stable: false, detail: 'RELEASEOPS_HEALTHCHECK_URL is not set' };
  }

  let passed = 0;

  for (let index = 0; index < samples; index += 1) {
    const ok = await healthcheckOnce(url, timeoutMs);
    if (!ok) {
      return { stable: false, detail: `healthcheck failed at sample ${index + 1}/${samples}` };
    }

    passed += 1;
  }

  return { stable: passed === samples, detail: `${passed}/${samples} checks passed` };
};

const writeRollbackNotes = (state) => {
  mkdirSync(rollbackDir, { recursive: true });

  const lines = [
    '# Rollback Notes',
    '',
    `- Release ID: ${releaseId}`,
    `- Generated At (UTC): ${new Date().toISOString()}`,
    `- Gate Result: ${state.overallPass ? 'PASS' : 'FAIL'}`,
    '',
    '## Gate Summary',
    '',
    `- Tests: ${state.testsPass ? 'PASS' : 'FAIL'}`,
    `- Migrations Checked: ${state.migrationsChecked ? 'PASS' : 'FAIL'}`,
    `- Healthcheck Stability: ${state.healthStable ? 'PASS' : 'FAIL'}`,
    `- Healthcheck Detail: ${state.healthDetail}`,
    '',
    '## Rollback Plan',
    '',
    '1. Halt traffic shift and stop the rollout immediately.',
    '2. Re-deploy the last known good build artifact.',
    '3. Re-run smoke tests and health checks before re-opening traffic.',
    '4. Validate data integrity and incident metrics after rollback.',
    '5. Capture incident timeline and remediation tasks before next release.',
    '',
    '## Owner Checklist',
    '',
    '- [ ] Artifact/tag for last known good version is verified.',
    '- [ ] DB restore/rollback strategy reviewed for this release.',
    '- [ ] Stakeholders and on-call channel notified if rollback happens.'
  ];

  writeFileSync(rollbackPath, `${lines.join('\n')}\n`, 'utf8');
};

const main = async () => {
  console.log('ReleaseOps: starting deployment gate checks...');

  const testsPass = runCommand(testCommand);
  const migrationsChecked = checkMigrations();
  const healthResult = await runHealthchecks(healthUrl, healthSamples, healthTimeoutMs);

  const state = {
    testsPass,
    migrationsChecked,
    healthStable: healthResult.stable,
    healthDetail: healthResult.detail,
    overallPass: testsPass && migrationsChecked && healthResult.stable
  };

  writeRollbackNotes(state);

  console.log(`ReleaseOps: rollback notes written -> ${rollbackPath}`);

  if (!state.overallPass) {
    console.error('ReleaseOps: deploy blocked. At least one gate failed.');

    if (!testsPass) {
      console.error('- tests failed');
    }

    if (!migrationsChecked) {
      console.error('- migrations unchecked (set RELEASEOPS_MIGRATIONS_CHECKED=true when verified)');
    }

    if (!state.healthStable) {
      console.error(`- healthcheck unstable (${state.healthDetail})`);
    }

    process.exit(1);
  }

  console.log('ReleaseOps: all gates passed. Deploy is allowed.');
};

main().catch((error) => {
  console.error('ReleaseOps: unexpected error', error);
  process.exit(1);
});
