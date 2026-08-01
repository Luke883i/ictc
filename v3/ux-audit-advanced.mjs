import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveProjectionStack, chooseInitialLayer } from './public/js/projection-layer-model.js';
import { uxFixture } from './ux-fixture.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const artifacts = path.join(root, 'artifacts');
await mkdir(artifacts, { recursive: true });
const ui = await readFile(path.join(root, 'v3/public/js/advanced-ux.js'), 'utf8');
const css = await readFile(path.join(root, 'v3/public/advanced-ux.css'), 'utf8');
const app = await readFile(path.join(root, 'v3/public/app.js'), 'utf8');
const manifest = JSON.parse(await readFile(path.join(root, 'v3/advanced-ux.json'), 'utf8'));
const schema = JSON.parse(await readFile(path.join(root, 'schemas/advanced-ux.schema.json'), 'utf8'));
const auditDoc = await readFile(path.join(root, 'docs/ADVANCED_UX_AUDIT.md'), 'utf8');
const dodDoc = await readFile(path.join(root, 'docs/ADVANCED_UX_DOD.md'), 'utf8');
const workflow = await readFile(path.join(root, '.github/workflows/ux-advanced.yml'), 'utf8');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const checks = [];
const pass = (name, detail) => checks.push({ name, status: 'passed', detail });

const stack = deriveProjectionStack(uxFixture, 'home', 'everyday');
assert.equal(stack.stages.length, 4);
assert.deepEqual(stack.stages.map(item => item.label), ['Osserva', 'Decidi', 'Agisci', 'Verifica']);
assert.equal(chooseInitialLayer(stack), 'ux-projection-observe');
for (const stage of stack.stages) {
  assert.equal(stage.claimClass, 'ux-sot-projection');
  assert.equal(stage.producer.id, 'advanced-ux-projector');
  assert.ok(stage.inputs.length > 0);
  assert.ok(stage.limitations.some(item => /non (?:è|sono)|non prova|non aggiunge|non misura|non implica|non conclud/i.test(item)));
  assert.ok(stage.nextAction);
  assert.equal(stage.target.kind, 'view');
}
pass('projection-contract', '4 livelli con produttore, input, limiti e destinazione');

const observe = stack.stages.find(item => item.label === 'Osserva');
const decide = stack.stages.find(item => item.label === 'Decidi');
const act = stack.stages.find(item => item.label === 'Agisci');
const verify = stack.stages.find(item => item.label === 'Verifica');
assert.equal(observe.metric.value, 1);
assert.equal(decide.metric.value, 3);
assert.equal(act.metric.value, 3);
assert.equal(verify.metric.value, 17);
assert.equal(verify.epistemicStatus, 'verified');
pass('sot-derived-metrics', 'conteggi equivalenti alla fixture SOT');

const broken = structuredClone(uxFixture);
broken.meta.integrity.ok = false;
assert.equal(deriveProjectionStack(broken).stages.at(-1).epistemicStatus, 'failed');
const unknown = structuredClone(uxFixture);
delete unknown.meta.integrity;
const unknownVerify = deriveProjectionStack(unknown).stages.at(-1);
assert.equal(unknownVerify.epistemicStatus, 'unavailable');
assert.equal(unknownVerify.metric.value, null);
pass('no-false-green', 'failure e assenza dati non vengono rappresentati come stato positivo');

const missingCollections = { meta: { integrity: { ok: true, eventCount: 0 } }, views: { traces: [] } };
const missingStack = deriveProjectionStack(missingCollections);
for (const stage of missingStack.stages.slice(0, 3)) {
  assert.equal(stage.epistemicStatus, 'unavailable');
  assert.equal(stage.metric.value, null);
}
pass('missing-versus-empty', 'collezione assente distinta da collezione vuota verificata');

for (const token of ['aria-live', 'role="tab"', 'aria-selected', 'aria-controls', 'aria-keyshortcuts', 'localStorage', 'prefers-reduced-motion', 'tabIndex = selected ? 0 : -1', 'ux-projection-panels']) assert.ok(ui.includes(token), `UI priva di ${token}`);
for (const token of ['min-height:44px', 'forced-colors:active', 'prefers-reduced-motion:reduce', 'data-ux-contrast=high', 'max-width:400px']) assert.ok(css.includes(token), `CSS privo di ${token}`);
assert.match(app, /mountActionFrames\(\);\s+mountAdvancedUx\(\);/);
pass('accessibility-ergonomics', 'tastiera, live region, 44px, contrasto, movimento, zoom e wiring app');

assert.equal(manifest.claimClass, 'bounded-ux-engineering-attestation');
assert.equal(manifest.layers.length, 4);
assert.equal(manifest.accessibility.targetSizeCssPixels, 44);
assert.ok(manifest.definitionOfDone.length >= 12);
assert.ok(manifest.metrics.length >= 10);
assert.equal(manifest.saturation.M, 48);
assert.equal(manifest.saturation.MPlus100, 148);
assert.equal(manifest.saturation.noveltyAfterM, 0);
assert.ok(schema.required.includes('limitations'));
assert.match(auditDoc, /non costituisce certificazione WCAG/i);
assert.match(dodDoc, /NVDA \+ Firefox\/Chrome/);
assert.match(workflow, /ICTC_VISUAL_URL/);
assert.equal(pkg.scripts['audit:ux:advanced'].includes('ux-saturation-advanced.mjs'), true);
assert.equal(pkg.scripts['release:check'].includes('audit:ux:advanced'), true);
pass('manifest-dod-wiring', 'manifest, schema, DoD, workflow visuale e release gate coerenti');

const visibleLabels = [...ui.matchAll(/>([^<>]{3,80})</g)].map(match => match[1]).join(' ');
assert.doesNotMatch(visibleLabels, /conforme|compliance score|rischio basso|tutto ok/i);
pass('anti-overclaim-language', 'nessun verdetto sintetico introdotto dal layer');

const payload = { schemaVersion: '1.0.0', generatedAt: new Date().toISOString(), result: 'passed', checks, stages: stack.stages };
await writeFile(path.join(artifacts, 'advanced-ux-audit.json'), JSON.stringify(payload, null, 2));
console.log(`advanced-ux-audit: ok (${checks.length} checks, ${stack.stages.length} projections)`);
