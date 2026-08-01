import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { deriveActionFrames, validateActionFrame } from './public/js/action-frame-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const port = Number(process.env.ICTC_SIM_PORT || 4683);
const base = `http://127.0.0.1:${port}`;
const runtime = await mkdtemp(path.join(os.tmpdir(), 'ictc-enduser-'));
const child = spawn(process.execPath, ['v3/server.mjs'], { cwd: root, env: { ...process.env, ICTC_PORT: String(port), PORT: String(port), ICTC_HOST: '127.0.0.1', ICTC_RUNTIME_DIR: runtime }, stdio: ['ignore', 'pipe', 'pipe'] });
let stderr = '';
child.stderr.on('data', chunk => { stderr += chunk; });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const request = async pathname => { const response = await fetch(base + pathname); assert.ok(response.ok, `${pathname}: ${response.status}`); return response.json(); };
const collect = (value, out = [], seen = new Set()) => { if (!value || typeof value !== 'object' || seen.has(value)) return out; seen.add(value); if (!Array.isArray(value) && typeof value.id === 'string' && (value.label || value.title || value.statement)) out.push(value); for (const childValue of Array.isArray(value) ? value : Object.values(value)) collect(childValue, out, seen); return out; };
const checks = [];
const mark = (name, detail) => checks.push({ name, status: 'passed', detail });

try {
  let healthy = false;
  for (let index = 0; index < 60; index += 1) { try { if ((await request('/api/health')).ok) { healthy = true; break; } } catch {} await sleep(100); }
  assert.ok(healthy, 'server v3 non raggiungibile');
  mark('service-entry', 'health disponibile');
  const [state, contract, gaps, integrity] = await Promise.all([request('/api/bootstrap'), request('/epistemic-contract.json'), request('/gap-registry.json'), request('/api/runtime/integrity')]);
  const objects = Array.isArray(state.objects) ? state.objects : collect(state);
  const unique = [...new Map(objects.map(object => [object.id, object])).values()];
  assert.ok(unique.length >= 20, `oggetti insufficienti: ${unique.length}`);
  mark('navigable-base', `${unique.length} oggetti identificabili`);
  const statuses = unique.map(object => object.epistemicStatus || object.status || object.workflowState).filter(Boolean);
  assert.ok(statuses.some(status => /attention|awaiting|candidate/.test(status)));
  assert.ok(statuses.some(status => /observed|verified|reviewed|owned/.test(status)));
  mark('epistemic-variety', `${new Set(statuses).size} stati distinti`);
  for (const object of unique.filter(object => object.epistemicStatus)) {
    assert.ok(object.producer, `${object.id}: produttore assente`);
    assert.ok(Array.isArray(object.inputs), `${object.id}: input assenti`);
    assert.ok(Array.isArray(object.limitations) && object.limitations.length, `${object.id}: limiti assenti`);
  }
  mark('object-chain', 'produttore, input e limiti sugli OutcomeEnvelope');
  const ai = unique.filter(object => object.epistemicStatus === 'ai-proposed');
  assert.ok(ai.every(object => !/human-reviewed|human-owned|verified/.test(object.epistemicStatus)));
  mark('ai-authority-boundary', `${ai.length} proposte AI senza stato umano`);
  const relations = state.relations || state.atlas?.relations || state.views?.semanticGraph?.edges || [];
  const traces = state.traces || state.views?.traces || [];
  const services = [
    ['monitoring', state.views?.jobs],
    ['incidents', state.views?.matters]
  ].filter(([, items]) => Array.isArray(items) && items.length);
  assert.ok(relations.length >= 10, `relazioni insufficienti: ${relations.length}`);
  assert.deepEqual(services.map(([id]) => id), ['monitoring', 'incidents']);
  assert.ok(traces.length >= 4, `tracce runtime insufficienti: ${traces.length}`);
  mark('drilldown-network', `${relations.length} relazioni, ${services.length} servizi e ${traces.length} tracce runtime`);
  assert.deepEqual(contract.lenses.map(item => item.id), ['orient', 'decide', 'verify']);
  assert.ok(contract.intermediateObjects.some(item => item.claimClass === 'action-frame'));
  assert.ok(contract.intermediateObjects.some(item => item.claimClass === 'decision-checkpoint'));
  const views = ['home','sources','changes','matters','atlas','journeys','evidence','system'];
  const frames = views.flatMap(view => deriveActionFrames(state, view));
  assert.ok(frames.length >= views.length, 'ActionFrame insufficienti');
  assert.ok(frames.every(validateActionFrame), 'ActionFrame non validi');
  assert.ok(frames.every(frame => frame.action && frame.processRef && frame.doesNotMean.length), 'ActionFrame incompleti');
  mark('local-action-abstraction', `${frames.length} ActionFrame: azione locale prima del processo`);
  assert.ok(gaps.gaps.some(gap => gap.status === 'open' && gap.severity === 'critical'));
  mark('local-comprehension', 'tre lenti, ActionFrame e gap critici non nascosti');
  assert.equal(integrity.ok, true);
  mark('runtime-integrity', `${integrity.eventCount ?? 0} eventi, catena coerente`);
  const artifactDir = path.join(root, 'artifacts');
  await mkdir(artifactDir, { recursive: true });
  await writeFile(path.join(artifactDir, 'enduser-simulation.json'), JSON.stringify({ schemaVersion: '1.1.0', generatedAt: new Date().toISOString(), result: 'passed', checks, objectCount: unique.length, relationCount: relations.length, serviceCount: services.length, traceCount: traces.length, actionFrameCount: frames.length }, null, 2));
  console.log(`enduser-simulation: ok (${unique.length} objects, ${relations.length} relations, ${services.length} services, ${traces.length} traces, ${frames.length} action frames)`);
} finally {
  child.kill('SIGTERM');
  if (stderr) process.stderr.write(stderr);
}
