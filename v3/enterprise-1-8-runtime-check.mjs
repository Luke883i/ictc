import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { runtimeHarness } from './runtime-test-harness.mjs';

const runtime = await runtimeHarness('ictc-enterprise-18');
const checks = [];
const verify = (name, assertion) => { assertion(); checks.push(name); };

try {
  await runtime.ok('PUT', '/api/admin/settings', {
    organization: { name: 'Enterprise Test', scope: 'Cybersecurity UE', jurisdictions: ['Italia', 'Unione europea'] },
    llm: { endpoint: `http://127.0.0.1:${runtime.aiPort}/v1/chat/completions`, model: 'mock-enterprise-18', apiKeyEnv: 'ICTC_LLM_API_KEY', temperature: 0.1 }
  });

  const created = await runtime.ok('POST', '/api/monitoring-jobs/draft', {
    jobName: 'Novelty NIS2 e DORA',
    objective: 'Individuare nuove fonti e modifiche ufficiali relative a NIS2 e DORA',
    cadenceHours: 24,
    miningMode: 'novelty',
    noveltyBaseline: 'last-run',
    jurisdictions: ['Unione europea', 'Italia'],
    authorities: ['EUR-Lex', 'ACN'],
    changeTypes: ['new-law', 'amendment', 'repeal', 'guidance', 'effective-date'],
    resultLimit: 75,
    sourceHints: ['https://eur-lex.europa.eu']
  });
  const mission = created.body.mission;
  verify('create-status', () => assert.equal(created.status, 201));
  verify('job-profile-persisted', () => {
    assert.equal(mission.jobName, 'Novelty NIS2 e DORA');
    assert.equal(mission.miningMode, 'novelty');
    assert.equal(mission.noveltyBaseline, 'last-run');
    assert.deepEqual(mission.jurisdictions, ['Unione europea', 'Italia']);
    assert.deepEqual(mission.authorities, ['EUR-Lex', 'ACN']);
    assert.equal(mission.resultLimit, 75);
  });
  verify('plan-generated', () => {
    assert.equal(mission.state, 'draft');
    assert.equal(mission.planVersion, 1);
    assert.equal(mission.planTrace?.purpose, 'monitoring-plan');
    assert.ok(Array.isArray(mission.plan?.queries));
  });

  const bootstrap = await runtime.bootstrap('admin', 'test-admin');
  const projected = bootstrap.body.missions.find(item => item.id === mission.id);
  verify('bootstrap-projects-profile', () => {
    assert.equal(projected.jobName, mission.jobName);
    assert.equal(projected.changeTypes.length, 5);
    assert.equal(projected.evidenceUrl, `/api/evidence/mission/${mission.id}`);
  });

  const revised = await runtime.ok('PUT', `/api/monitoring-jobs/${mission.id}/profile`, {
    noveltyBaseline: 'fixed-date',
    baselineAt: '2025-01-01T00:00:00.000Z',
    miningMode: 'watchlist',
    authorities: ['EUR-Lex'],
    changeTypes: ['amendment', 'repeal']
  });
  verify('profile-revision', () => {
    assert.equal(revised.body.mission.noveltyBaseline, 'fixed-date');
    assert.equal(revised.body.mission.baselineAt, '2025-01-01T00:00:00.000Z');
    assert.equal(revised.body.mission.miningMode, 'watchlist');
    assert.deepEqual(revised.body.mission.authorities, ['EUR-Lex']);
    assert.equal(revised.body.mission.planVersion, 2);
    assert.equal(revised.body.mission.planHistory.length, 1);
  });

  const denied = await runtime.request('POST', '/api/monitoring-jobs/draft', {
    jobName: 'Non autorizzato', objective: 'Tentativo utente'
  }, 'user', 'test-user');
  verify('least-privilege', () => assert.equal(denied.status, 403));

  const invalid = await runtime.request('POST', '/api/monitoring-jobs/draft', {
    jobName: 'Baseline incompleta', objective: 'Test', noveltyBaseline: 'fixed-date'
  });
  verify('fixed-baseline-validation', () => assert.equal(invalid.status, 400));

  const report = {
    schemaVersion: '1.8.0',
    model: 'ictc-enterprise-workbench-1-8-runtime',
    ok: true,
    checks,
    limitation: 'Selected local runtime assurance; discovery completeness and deployment controls remain external.'
  };
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(new URL('../artifacts/enterprise-1-8-runtime.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(`enterprise-1-8-runtime-check: ok (${checks.length} checks)`);
} finally {
  await runtime.close();
}
