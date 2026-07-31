import { strict as assert } from 'node:assert';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveActionFrames, validateActionFrame } from './public/js/action-frame-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const contract = JSON.parse(await readFile(path.join(root, 'v3/public/epistemic-contract.json'), 'utf8'));
const interactions = await readFile(path.join(root, 'v3/public/js/interactions.js'), 'utf8');
const api = await readFile(path.join(root, 'v3/lib/api.mjs'), 'utf8');
const wiring = JSON.parse(await readFile(path.join(root, 'v3/action-wiring.json'), 'utf8'));
const sourceCache = new Map();
const sample = {
  meta: { version: '3.0.0-beta.1', integrity: { ok: true, eventCount: 4, head: 'abcdef1234567890' } },
  sources: [{ id: 'src-1' }], findings: [{ id: 'finding-1' }], changes: [], matters: [{ id: 'matter-1' }], jobs: [{ id: 'job-1' }],
  objectIndex: { 'source-src-1': {}, 'finding-finding-1': {}, 'matter-matter-1': {} },
  views: {
    balloons: [{ envelopeId: 'finding-finding-1', label: 'Differenza da valutare', status: 'awaiting-human-review' }],
    sources: [{ id: 'source-src-1', label: 'Fonte candidata', epistemicStatus: 'candidate', data: { id: 'src-1', lifecycle: 'candidate' } }],
    findings: [{ id: 'finding-finding-1', label: 'Differenza', epistemicStatus: 'awaiting-human-review', data: { id: 'finding-1' } }],
    changes: [
      { id: 'change-1', label: 'Valutare impatto', data: { id: 'change-1', state: 'impact-to-assess' } },
      { id: 'change-2', label: 'Mappare controllo', data: { id: 'change-2', state: 'controls-to-map' } }
    ],
    matters: [{ id: 'matter-matter-1', label: 'Evento', data: { id: 'matter-1', state: 'facts-to-confirm' } }],
    jobs: [{ id: 'job-job-1', label: 'Scouting', data: { id: 'job-1' } }],
    semanticGraph: { edges: [{ from: 'a', to: 'b' }] },
    supply: [{ id: 'supply-1', label: 'Storage', epistemicStatus: 'bounded', limitations: ['Locale'] }]
  }
};

const views = ['home','sources','changes','matters','atlas','journeys','evidence','system'];
const all = views.flatMap(view => deriveActionFrames(sample, view));
for (const view of views) {
  const frames = deriveActionFrames(sample, view);
  assert.ok(frames.length >= 1 && frames.length <= 3, `${view}: densità non valida`);
  assert.ok(frames.every(validateActionFrame), `${view}: ActionFrame non valido`);
  assert.ok(frames.every(frame => frame.action && frame.action.label), `${view}: azione primaria assente`);
  assert.ok(frames.every(frame => frame.processRef), `${view}: processo non disponibile nel drill-down`);
}
assert.ok(all.some(frame => frame.objectRef), 'Nessun ActionFrame object-focused');
assert.ok(all.some(frame => frame.action.kind === 'selector'), 'Nessun bridge verso un controllo wired');
assert.ok(contract.intermediateObjects.some(item => item.claimClass === 'action-frame'));
assert.ok(contract.intermediateObjects.some(item => item.claimClass === 'decision-checkpoint'));
const writeIds = new Set(contract.writeActions.map(item => item.id));
for (const frame of all.filter(item => item.writeActionId)) assert.ok(writeIds.has(frame.writeActionId), `Write action non contrattualizzata: ${frame.writeActionId}`);
for (const action of contract.writeActions) assert.match(interactions, new RegExp(`withActionCheckpoint\\('${action.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`), `${action.id}: checkpoint non wired`);
assert.deepEqual(wiring.actions.map(item => item.id).sort(), [...writeIds].sort(), 'Manifest wiring non sincronizzato con writeActions');
for (const item of wiring.actions) {
  const source = sourceCache.has(item.controlSource) ? sourceCache.get(item.controlSource) : await readFile(path.join(root, item.controlSource), 'utf8');
  sourceCache.set(item.controlSource, source);
  const selectorToken = item.selector.replace(/^#/, '').replace(/^\[|\]$/g, '').split('=')[0];
  assert.ok(source.includes(selectorToken), `${item.id}: controllo non rappresentato in ${item.controlSource}`);
  assert.ok(interactions.includes(item.handler), `${item.id}: handler non rappresentato`);
  assert.ok(interactions.includes(`withActionCheckpoint('${item.checkpoint}'`), `${item.id}: checkpoint non rappresentato`);
  const routeToken = item.route.split('/').filter(part => part && !part.startsWith(':')).at(-1);
  assert.ok(api.includes(routeToken), `${item.id}: route non rappresentata`);
  assert.equal(item.receiptExpected, true);
}
assert.match(contract.primaryQuestion, /Che cosa deve fare qui/);
assert.match(contract.secondaryQuestion, /processo/);

const artifactDir = path.join(root, 'artifacts');
await mkdir(artifactDir, { recursive: true });
const report = { schemaVersion: '1.0.0', generatedAt: new Date().toISOString(), result: 'passed', views: views.length, actionFrames: all.length, writeActions: writeIds.size, wiringActions: wiring.actions.length, principles: ['object-focused','single-primary-action','process-in-drilldown','human-confirmation-before-write'] };
await writeFile(path.join(artifactDir, 'action-frame-audit.json'), JSON.stringify(report, null, 2));
console.log(`action-frame-audit: ok (${views.length} views, ${all.length} frames, ${writeIds.size} write gates)`);
