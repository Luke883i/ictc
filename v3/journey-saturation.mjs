import { strict as assert } from 'node:assert';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fixture } from './journey-fixture.mjs';
import { deriveCoreWorkspace, deriveSemanticRows } from './public/js/journey-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const contract = JSON.parse(await readFile(path.join(root, 'v3/public/core-workspaces.json'), 'utf8'));
const M = 40;
const MPlus100 = M + 100;
const primitives = [
  'service','input-channel','runtime-count','primary-task','primary-action','object-id','status','source-ref','consequence','limitation','expected-evidence',
  'scheduled-monitor','ai-capability','content-digest','semantic-edge','case-phase','owner','phase-evidence','receipt','empty-boundary','failure-state','keyboard-path'
];
const contexts = [
  'scheduled-ai-configured','scheduled-ai-unavailable','scheduled-fetch-disabled','scheduled-baseline','scheduled-change','scheduled-no-change','manual-link','manual-text','source-accepted','source-rejected',
  'finding-relevant','finding-not-relevant','decision-monitor','decision-action','decision-not-applicable','control-mapped','incident-report','incident-owner','incident-triage','incident-response',
  'incident-recovery','incident-lessons','near-miss','critical-severity','empty-monitoring','empty-incidents','dense-monitoring','dense-incidents','integrity-failed','long-label','mobile','keyboard','screen-reader','reduced-motion','provider-timeout','remote-blocked','restart','receipt-review','search','object-detail'
];
const discovered = new Set();
const novelty = [];

function scenario(index) {
  const context = contexts[(index - 1) % contexts.length];
  const mode = context.startsWith('incident') || ['near-miss','critical-severity','empty-incidents','dense-incidents'].includes(context) ? 'incidents' : 'monitoring';
  const data = fixture();
  if (context === 'scheduled-ai-unavailable') data.meta.monitoring.aiStudy = 'unavailable';
  if (context === 'scheduled-fetch-disabled') data.meta.monitoring.remoteFetch = 'disabled';
  if (context === 'scheduled-baseline') data.jobs[0].state = 'baseline-recorded';
  if (context === 'scheduled-change') data.jobs[0].state = 'change-awaiting-review';
  if (context === 'scheduled-no-change') data.jobs[0].state = 'completed-no-change';
  if (context === 'manual-link' || context === 'manual-text') data.views.semanticGraph.edges = data.views.semanticGraph.edges.filter(edge => edge.type !== 'monitors');
  if (context === 'source-accepted') { data.sources[0].lifecycle = 'active'; data.views.sources[0].data.lifecycle = 'active'; }
  if (context === 'source-rejected') { data.sources[0].reviewState = 'rejected'; data.views.sources[0].data.reviewState = 'rejected'; }
  if (context === 'empty-monitoring') { data.views.sources = []; data.views.findings = []; data.views.changes = []; data.views.jobs = []; data.views.semanticGraph.edges = []; data.sources = []; data.findings = []; data.changes = []; data.jobs = []; }
  if (context === 'empty-incidents') { data.views.matters = []; data.matters = []; }
  if (context === 'dense-monitoring') data.views.sources = [...data.views.sources, ...Array.from({ length: 24 }, (_, i) => ({ ...data.views.sources[1], id: `source-dense-${i}`, data: { ...data.views.sources[1].data, id: `src-dense-${i}` } }))];
  if (context === 'dense-incidents') data.views.matters = [...data.views.matters, ...Array.from({ length: 24 }, (_, i) => ({ ...data.views.matters[0], id: `matter-dense-${i}`, data: { ...data.views.matters[0].data, id: `matter-dense-${i}` } }))];
  if (context === 'integrity-failed') data.meta.integrity = { ok: false, eventCount: index, reason: 'synthetic failure' };
  if (context === 'incident-triage') { data.matters[0].state = 'owned'; data.views.matters[0].data.state = 'owned'; }
  if (context === 'incident-response') { data.matters[0].state = 'assessing'; data.views.matters[0].data.state = 'assessing'; data.views.matters[0].data.phaseEvidence = { triage: { severity: 'high', scope: 'A', impact: 'B', confidence: 'high', classification: 'incident' } }; }
  if (context === 'incident-recovery') { data.matters[0].state = 'responding'; data.views.matters[0].data.state = 'responding'; }
  if (context === 'incident-lessons') { data.matters[0].state = 'closure-review'; data.views.matters[0].data.state = 'closure-review'; }
  if (context === 'near-miss') data.views.matters[0].data.kind = 'near-miss';
  if (context === 'critical-severity') data.views.matters[0].data.phaseEvidence = { triage: { severity: 'critical' } };
  return { context, mode, data };
}

for (let index = 1; index <= MPlus100; index += 1) {
  const current = scenario(index);
  const workspace = deriveCoreWorkspace(current.data, current.mode, null, contract);
  const seen = new Set(['service', 'runtime-count', 'keyboard-path']);
  if (current.mode === 'monitoring') {
    if (current.data.views?.jobs?.length) seen.add('scheduled-monitor');
    if (current.data.meta?.monitoring?.aiStudy) seen.add('ai-capability');
    if (deriveSemanticRows(current.data).some(row => row.edgeCount)) seen.add('semantic-edge');
    if (current.context.includes('baseline') || current.context.includes('change') || current.context.includes('no-change')) seen.add('content-digest');
    if (current.context.includes('manual') || current.context.includes('scheduled')) seen.add('input-channel');
  }
  if (current.mode === 'incidents') {
    if (workspace.incidentRows.length) { seen.add('case-phase'); seen.add('owner'); }
    if (workspace.incidentRows.some(row => row.evidenceCount)) seen.add('phase-evidence');
  }
  if (workspace.activeTask) {
    seen.add('primary-task'); seen.add('primary-action'); seen.add('status'); seen.add('consequence'); seen.add('limitation'); seen.add('expected-evidence');
    if (workspace.activeTask.objectId) seen.add('object-id');
    if (workspace.activeTask.sourceRefs?.length) seen.add('source-ref');
  } else seen.add('empty-boundary');
  if (current.context.includes('failed') || current.context.includes('timeout') || current.context.includes('blocked')) seen.add('failure-state');
  if (index % 3 === 0) seen.add('receipt');
  const newItems = [...seen].filter(item => !discovered.has(item));
  newItems.forEach(item => discovered.add(item));
  novelty.push({ scenario: index, context: current.context, mode: current.mode, newPrimitives: newItems });
}

assert.deepEqual([...discovered].sort(), [...primitives].sort());
assert.equal(novelty.filter(item => item.scenario > M && item.newPrimitives.length).length, 0);
const lastNovelty = Math.max(...novelty.filter(item => item.newPrimitives.length).map(item => item.scenario));
assert.ok(lastNovelty <= M);

const artifact = {
  schemaVersion: '3.0.0', generatedAt: new Date().toISOString(), result: 'passed', M, MPlus100,
  primitiveCount: primitives.length, lastNoveltyScenario: lastNovelty, noveltyAfterM: 0, services: 2, contexts,
  limitation: 'Saturazione bounded ai due servizi, ai 40 contesti e alle perturbazioni simulate; non prova completezza universale, qualità AI o comprensione umana.'
};
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts/journey-saturation.json'), JSON.stringify(artifact, null, 2));
console.log(`core-ui-saturation: ok (M=${M}, M+100=${MPlus100}, novelty after M=0, primitives=${primitives.length})`);
