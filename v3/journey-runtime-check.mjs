import { strict as assert } from 'node:assert';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveCoreWorkspace, deriveSemanticRows } from './public/js/journey-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const base = process.env.ICTC_BASE_URL || 'http://127.0.0.1:4807';
const mock = process.env.ICTC_MOCK_URL || 'http://127.0.0.1:4899';
const contract = JSON.parse(await readFile(path.join(root, 'v3/public/core-workspaces.json'), 'utf8'));
const receipts = [];
const checks = [];

async function request(pathname, options = {}, expected = null, origin = base) {
  const response = await fetch(origin + pathname, { headers: { 'content-type': 'application/json' }, ...options });
  const body = (response.headers.get('content-type') || '').includes('json') ? await response.json() : await response.text();
  if (expected !== null) assert.equal(response.status, expected, `${pathname}: ${JSON.stringify(body)}`);
  else assert.ok(response.ok, `${pathname}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}
const post = (pathname, payload, origin = base) => request(pathname, { method: 'POST', body: JSON.stringify(payload) }, null, origin);
const keep = result => { assert.equal(result.receipt?.readbackVerified, true); receipts.push(result.receipt); return result; };

const health = await request('/api/health');
assert.equal(health.ok, true);
assert.equal(health.monitoring.scheduler, 'active');
assert.equal(health.monitoring.aiStudy, 'configured');
process.env.ICTC_RUNTIME_DIR = health.runtime;
const { append } = await import('./lib/store.mjs');
const { schedulerTick } = await import('./lib/monitoring-runtime.mjs');
checks.push('health-and-monitoring-capabilities');

let state = await request('/api/bootstrap');
assert.equal(deriveCoreWorkspace(state, 'monitoring', null, contract).mode, 'monitoring');
assert.equal(deriveCoreWorkspace(state, 'incidents', null, contract).mode, 'incidents');
checks.push('two-workspaces');

const createdMonitor = keep(await post('/api/jobs', {
  operatingContext: 'regulated-enterprise',
  label: 'Monitoraggio provider di test',
  sourceTitle: 'Fonte provider di test',
  url: `${mock}/source`,
  intervalMinutes: 60,
  studyQuestion: 'Individua la variazione sintetica e formula una domanda di review.'
}));
keep(await post(`/api/sources/${createdMonitor.source.id}/review`, { outcome: 'accepted' }));
keep(await post(`/api/jobs/${createdMonitor.job.id}/schedule`, { enabled: true, intervalMinutes: 60 }));
state = await request('/api/bootstrap');
const scheduledJob = state.jobs.find(item => item.id === createdMonitor.job.id);
const dueAt = new Date(Date.now() - 1000).toISOString();
const dueSchedule = await append('job.scheduled', {
  id: scheduledJob.id,
  job: { ...scheduledJob, enabled: true, nextRunAt: dueAt }
}, 'test-clock', 'scheduler-contract-test');
assert.equal(dueSchedule.receipt.readbackVerified, true);
receipts.push(dueSchedule.receipt);
const tick = await schedulerTick(process.env);
assert.equal(tick.due, 1);
state = await request('/api/bootstrap');
const baselineJob = state.jobs.find(item => item.id === createdMonitor.job.id);
assert.equal(baselineJob.lastComparison, 'baseline-created');
assert.equal(baselineJob.lastStudy.trigger, 'scheduled');
assert.equal(baselineJob.lastStudy.ai.status, 'completed');
assert.ok(baselineJob.lastStudy.blobRef && baselineJob.lastStudy.inputDigest);
await post('/toggle', {}, mock);
const changed = keep(await post(`/api/jobs/${createdMonitor.job.id}/run`, {}));
assert.equal(changed.comparison, 'changed');
assert.equal(changed.ai.status, 'completed');
assert.ok(changed.finding?.id);
state = await request('/api/bootstrap');
const runtimeJob = state.jobs.find(item => item.id === createdMonitor.job.id);
assert.equal(runtimeJob.lastStudy.ai.status, 'completed');
assert.ok(runtimeJob.lastStudy.blobRef && runtimeJob.lastStudy.inputDigest);
const blobPath = path.join(health.runtime, runtimeJob.lastStudy.blobRef.replace(/^runtime\//, ''));
const blob = await readFile(blobPath, 'utf8');
assert.ok(blob.includes('Versione 2'));
assert.equal((await stat(blobPath)).size, runtimeJob.lastStudy.byteLength);
assert.ok(state.views.semanticGraph.edges.some(edge => edge.type === 'monitors' && edge.from === `job-${createdMonitor.job.id}`));
assert.ok(state.views.semanticGraph.edges.some(edge => edge.type === 'observed-by' && edge.from === `job-${createdMonitor.job.id}`));
checks.push('scheduled-tick-ai-fetch-storage-and-evidence');

const manual = keep(await post('/api/sources', {
  operatingContext: 'public-administration',
  title: 'Contenuto manuale runtime',
  contentText: 'Aggiornamento normativo inserito manualmente. Clausola sintetica 42.'
}));
assert.ok(manual.finding);
assert.equal(manual.source.operatingContext, 'public-administration');
keep(await post(`/api/sources/${manual.source.id}/review`, { outcome: 'accepted' }));
keep(await post(`/api/findings/${manual.finding.id}/review`, { outcome: 'relevant' }));
state = await request('/api/bootstrap');
const change = state.changes.find(item => item.findingId === manual.finding.id);
assert.ok(change);
keep(await post(`/api/changes/${change.id}/decide`, { outcome: 'action-required', rationale: 'Il contenuto richiede una verifica del presidio locale.' }));
keep(await post(`/api/changes/${change.id}/map-control`, { controlId: 'control-monitor', rationale: 'Collegamento documentale al presidio di monitoraggio.' }));
state = await request('/api/bootstrap');
const semanticRow = deriveSemanticRows(state).find(item => item.source.data.id === manual.source.id);
assert.ok(semanticRow);
assert.equal(semanticRow.origin, 'manual');
assert.ok(semanticRow.findings.length >= 1 && semanticRow.changes.length >= 1 && semanticRow.controls.some(item => item.data.id === 'control-monitor'));
const manualBlobPath = path.join(health.runtime, manual.source.locator.replace(/^runtime\//, ''));
assert.ok((await readFile(manualBlobPath, 'utf8')).includes('Clausola sintetica 42'));
checks.push('manual-content-to-semantic-lattice');

const matter = keep(await post('/api/matters', {
  title: 'Caso runtime completo',
  kind: 'near-miss',
  summary: 'Accesso anomalo bloccato prima della diffusione; coinvolto un portale fornitore.'
}));
keep(await post(`/api/matters/${matter.matter.id}/confirm-owner`, { owner: matter.matter.owner, raci: matter.matter.raci }));
const phasePayloads = [
  ['assessing', { classification: 'near-miss', severity: 'medium', scope: 'Portale fornitore e account interessato.', impact: 'Nessuna diffusione confermata; impatto potenziale sui dati.', confidence: 'medium' }],
  ['responding', { containment: 'Account sospeso e sessioni revocate.', eradication: 'Credenziali ruotate e configurazione verificata.', communications: 'DPO e Procurement consultati; notifica ancora da valutare.' }],
  ['closure-review', { serviceStatus: 'restored', recoveryValidation: 'Accessi verificati e test di login completati.', residualMonitoring: 'Monitoraggio rafforzato per sette giorni.' }],
  ['closed', { lessonsLearned: 'Migliorare la revoca automatica delle sessioni.', followUpActions: 'Aprire intervento IAM e aggiornare playbook fornitore.', approvedBy: 'Incident Response Lead' }]
];
for (const [to, evidence] of phasePayloads) keep(await post(`/api/matters/${matter.matter.id}/transition`, { to, evidence }));
state = await request('/api/bootstrap');
const closedMatter = state.matters.find(item => item.id === matter.matter.id);
assert.equal(closedMatter.state, 'closed');
assert.deepEqual(Object.keys(closedMatter.phaseEvidence).sort(), ['lessons', 'recovery', 'response', 'triage']);
assert.equal(closedMatter.timeline.length, 5);
const incidentWorkspace = deriveCoreWorkspace(state, 'incidents', null, contract);
const caseRow = incidentWorkspace.incidentRows.find(item => item.object.data.id === matter.matter.id);
assert.equal(caseRow.state, 'closed');
assert.ok(caseRow.evidenceCount >= 14);
checks.push('incident-report-triage-response-recovery-lessons');

const ledger = await request('/api/runtime/ledger');
assert.equal(ledger.integrity.ok, true);
assert.ok(ledger.events.length >= receipts.length);
assert.ok(ledger.events.every(item => item.payload === undefined));
checks.push('ledger-receipts-and-sanitized-read');

const providerStatus = await request('/status', {}, null, mock);
assert.ok(providerStatus.requests.source >= 2);
assert.ok(providerStatus.requests.ai >= 2);
checks.push('external-provider-called');

await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts/journey-runtime-check.json'), JSON.stringify({
  schemaVersion: '3.0.0',
  generatedAt: new Date().toISOString(),
  result: 'passed',
  checks,
  receipts: receipts.length,
  events: ledger.events.length,
  semanticRows: deriveSemanticRows(state).length,
  incidentPhases: Object.keys(closedMatter.phaseEvidence),
  operatingContexts: ['regulated-enterprise', 'public-administration', 'enterprise'],
  blobEvidence: [runtimeJob.lastStudy.blobRef, manual.source.locator],
  limitations: [
    'Il provider e la fonte remota usati dal test sono locali e sintetici.',
    'Il test prova wiring, chiamata provider, storage, ledger e proiezione; non prova qualità dell’analisi AI o applicabilità normativa.'
  ]
}, null, 2));
console.log(`core-ui-runtime: ok (${checks.length} checks, ${receipts.length} receipts, ${ledger.events.length} events)`);
