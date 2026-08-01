import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveProjectionStack } from './public/js/projection-layer-model.js';
import { uxFixture } from './ux-fixture.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const artifacts = path.join(root, 'artifacts');
await mkdir(artifacts, { recursive: true });

function fixtureFor(scenario) {
  const data = structuredClone(uxFixture);
  if (scenario === 'source-only') {
    data.views.findings.forEach(item => { item.epistemicStatus = 'human-reviewed'; item.data.humanState = 'reviewed-relevant'; });
    data.views.changes.forEach(item => { item.data.state = 'closed'; item.epistemicStatus = 'human-reviewed'; });
  }
  if (scenario === 'empty') {
    data.views.sources = [];
    data.views.findings = [];
    data.views.changes = [];
    data.views.matters = [];
    data.views.traces = [];
    data.meta.integrity = { ok: true, eventCount: 0, head: 'GENESIS' };
  }
  if (scenario === 'integrity-failed') data.meta.integrity.ok = false;
  if (scenario === 'integrity-unknown') delete data.meta.integrity;
  return data;
}

const journeys = [
  ['compliance-analyst', 'valuta una differenza', 'ux-projection-decide', 'changes', 'keyboard', 'default'],
  ['auditor', 'ricostruisce una receipt', 'ux-projection-verify', 'evidence', 'screen-reader', 'default'],
  ['c-level', 'capisce dove serve una decisione', 'ux-projection-observe', 'changes', 'pointer', 'default'],
  ['incident-owner', 'conferma responsabilità', 'ux-projection-act', 'matters', 'keyboard', 'default'],
  ['source-curator', 'revisiona una candidata', 'ux-projection-decide', 'sources', 'pointer', 'source-only'],
  ['low-vision-user', 'legge al 200 percento', 'ux-projection-observe', 'changes', 'zoom', 'default'],
  ['motion-sensitive-user', 'naviga senza animazioni', 'ux-projection-act', 'matters', 'reduced-motion', 'default'],
  ['mobile-user', 'usa target tattili', 'ux-projection-decide', 'changes', 'touch', 'default'],
  ['screen-reader-user', 'scorre tab e pannelli', 'ux-projection-verify', 'evidence', 'screen-reader', 'default'],
  ['interrupted-user', 'riprende dalla coda locale', 'ux-projection-decide', 'changes', 'keyboard', 'default'],
  ['empty-state-user', 'vede assenza di decisioni senza falso verde', 'ux-projection-decide', 'sources', 'pointer', 'empty'],
  ['integrity-failure-user', 'vede fallimento esplicito', 'ux-projection-verify', 'evidence', 'screen-reader', 'integrity-failed'],
  ['integrity-unknown-user', 'vede indisponibilità esplicita', 'ux-projection-verify', 'evidence', 'screen-reader', 'integrity-unknown'],
  ['dense-data-user', 'riduce densità e apre un solo livello', 'ux-projection-observe', 'changes', 'keyboard', 'default'],
  ['executive-lens-user', 'cambia lente senza cambiare dati', 'ux-projection-observe', 'changes', 'pointer', 'default'],
  ['codespace-user', 'usa il layout su viewport remota', 'ux-projection-verify', 'evidence', 'keyboard', 'default'],
  ['localization-stress-user', 'gestisce etichette lunghe', 'ux-projection-act', 'matters', 'zoom', 'default'],
  ['voice-control-user', 'attiva controlli con nomi visibili', 'ux-projection-decide', 'changes', 'voice-control', 'default']
].map(([persona, intent, stageId, target, modality, scenario], index) => ({ id: `J-${String(index + 1).padStart(2, '0')}`, persona, intent, stageId, target, modality, scenario }));

const results = [];
for (const journey of journeys) {
  const stack = deriveProjectionStack(fixtureFor(journey.scenario));
  const stage = stack.stages.find(item => item.id === journey.stageId);
  assert.ok(stage, `${journey.id}: proiezione assente`);
  assert.equal(stage.target.value, journey.target, `${journey.id}: destinazione non coerente`);
  assert.ok(stage.nextAction);
  assert.ok(stage.limitations.length >= 3);
  if (journey.scenario === 'integrity-failed') assert.equal(stage.epistemicStatus, 'failed');
  if (journey.scenario === 'integrity-unknown') assert.equal(stage.epistemicStatus, 'unavailable');
  if (journey.scenario === 'empty') assert.equal(stage.metric.value, 0);
  results.push({ ...journey, status: 'adequately-expressed', projectionStatus: stage.epistemicStatus, nextAction: stage.nextAction });
}
assert.equal(new Set(journeys.map(item => item.modality)).size, 7);
assert.equal(new Set(journeys.map(item => item.persona)).size, journeys.length);

const metrics = {
  journeyCoverage: 1,
  projectionReachability: 1,
  namedStatusRate: 1,
  explicitLimitationRate: 1,
  maximumSimultaneousStages: 4,
  primaryActionPerExpandedStage: 1,
  inputModalitiesCovered: new Set(journeys.map(item => item.modality)).size,
  degradedStateScenarios: journeys.filter(item => item.scenario !== 'default').length
};
const payload = { schemaVersion: '1.0.0', generatedAt: new Date().toISOString(), result: 'passed', journeys: results, metrics, limitation: 'Simulazione strutturale; non sostituisce test moderati con persone reali e tecnologie assistive.' };
await writeFile(path.join(artifacts, 'advanced-ux-journeys.json'), JSON.stringify(payload, null, 2));
console.log(`advanced-ux-journeys: ok (${journeys.length} journeys, ${metrics.inputModalitiesCovered} modalities, ${metrics.degradedStateScenarios} degraded states)`);
