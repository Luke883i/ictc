import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { runtimeHarness } from './runtime-test-harness.mjs';
import { canonicalProcedureHub } from './runtime/workbench-projection.mjs';

const checks = [];
const verify = (name, assertion) => { assertion(); checks.push(name); };

const pureState = {
  missions: [
    { id: 'm-active', state: 'active' },
    { id: 'm-needs-plan', state: 'needs-plan' }
  ],
  catalog: [{ id: 's1', state: 'candidate' }],
  contributions: [
    { id: 'c-own', createdBy: 'alice', state: 'needs-enrichment' },
    { id: 'c-foreign', createdBy: 'bob', state: 'needs-enrichment' }
  ],
  incidents: [
    { id: 'i-own', createdBy: 'alice', state: 'clarifying' },
    { id: 'i-foreign', createdBy: 'bob', state: 'review' }
  ],
  users: [
    { id: 'a', status: 'active' }, { id: 'u', status: 'active' }, { id: 'x', status: 'disabled' }
  ]
};
const pureReadiness = {
  verified: 1,
  total: 3,
  controls: [
    { id: 'human-authority', status: 'verified', scope: 'runtime' },
    { id: 'ai-provider', status: 'blocker', scope: 'runtime' },
    { id: 'tls', status: 'blocker', scope: 'deployment' }
  ]
};
const pureAdmin = canonicalProcedureHub(pureState, { id: 'admin', role: 'admin', permissions: ['read','manage-enterprise'] }, { readiness: pureReadiness });
const pureUser = canonicalProcedureHub(pureState, { id: 'alice', role: 'user', permissions: ['read','report-incident','contribute-source'] }, { readiness: pureReadiness });
const pureAuditor = canonicalProcedureHub(pureState, { id: 'audit', role: 'auditor', permissions: ['read'] }, { readiness: pureReadiness });
verify('procedure-hub-pure-roles', () => {
  assert.deepEqual(pureAdmin.map(item => item.id), ['monitoring','incidents','evidence','administration']);
  assert.deepEqual(pureUser.map(item => item.id), ['monitoring','incidents','evidence']);
  assert.deepEqual(pureAuditor.map(item => item.id), ['monitoring','incidents','evidence']);
  assert.equal(pureAdmin.find(item => item.id === 'monitoring').attentionCount, 2);
  assert.equal(pureUser.find(item => item.id === 'monitoring').attentionCount, 1);
  assert.equal(pureUser.find(item => item.id === 'incidents').metrics[1].value, 1);
  assert.equal(pureAuditor.find(item => item.id === 'incidents').metrics[1].value, 2);
  assert.equal(pureAuditor.find(item => item.id === 'monitoring').readOnly, true);
  assert.equal(pureAuditor.find(item => item.id === 'evidence').readOnly, true);
  assert.equal(pureAdmin.find(item => item.id === 'administration').attentionCount, 1);
});
verify('procedure-hub-no-read-no-surface', () => {
  assert.deepEqual(canonicalProcedureHub(pureState, { id: 'none', role: 'user', permissions: [] }, { readiness: pureReadiness }), []);
});
const processUi = await readFile(new URL('./public/ui/enterprise-2-processes.js', import.meta.url), 'utf8');
verify('procedure-hub-ui-wiring', () => {
  assert.match(processUi, /state\.data\?\.procedures/);
  assert.match(processUi, /data-procedure-id/);
  assert.match(processUi, /data-procedure-hub|procedureHub/);
  assert.match(processUi, /data-procedure-admin/);
  assert.match(processUi, /server-derived/);
});

const runtime = await runtimeHarness('ictc-enterprise-18');

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
  verify('bootstrap-projects-admin-procedure-hub', () => {
    assert.deepEqual(bootstrap.body.procedures.map(item => item.id), ['monitoring','incidents','evidence','administration']);
    const monitoring = bootstrap.body.procedures.find(item => item.id === 'monitoring');
    const evidence = bootstrap.body.procedures.find(item => item.id === 'evidence');
    const administration = bootstrap.body.procedures.find(item => item.id === 'administration');
    assert.equal(monitoring.code, 'RN-01');
    assert.equal(monitoring.service, 'monitoring');
    assert.equal(evidence.code, 'EV-01');
    assert.equal(evidence.service, 'proof');
    assert.equal(evidence.readOnly, true);
    assert.equal(administration.kind, 'control-plane');
    assert.equal(administration.action, 'open-administration');
  });
  const userBootstrap = await runtime.bootstrap('user', 'local-user');
  const auditorBootstrap = await runtime.bootstrap('auditor', 'local-auditor');
  verify('procedure-hub-least-privilege-projection', () => {
    assert.deepEqual(userBootstrap.body.procedures.map(item => item.id), ['monitoring','incidents','evidence']);
    assert.deepEqual(auditorBootstrap.body.procedures.map(item => item.id), ['monitoring','incidents','evidence']);
    assert.equal(userBootstrap.body.procedures.some(item => item.id === 'administration'), false);
    assert.equal(auditorBootstrap.body.procedures.some(item => item.id === 'administration'), false);
    assert.equal(userBootstrap.body.procedures.find(item => item.id === 'monitoring').readOnly, false);
    assert.equal(auditorBootstrap.body.procedures.find(item => item.id === 'monitoring').readOnly, true);
    assert.equal(auditorBootstrap.body.procedures.find(item => item.id === 'incidents').readOnly, true);
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
    procedureHub: { model: 'server-derived-v1', admin: 4, user: 3, auditor: 3 },
    limitation: 'Selected local runtime assurance; discovery completeness and deployment controls remain external.'
  };
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(new URL('../artifacts/enterprise-1-8-runtime.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(`enterprise-1-8-runtime-check: ok (${checks.length} checks)`);
} finally {
  await runtime.close();
}
