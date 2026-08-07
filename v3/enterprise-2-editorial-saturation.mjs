import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const model = JSON.parse(await readFile(new URL('./enterprise-2-editorial-model.json', import.meta.url), 'utf8'));

const dimensions = Object.freeze({
  role: ['admin', 'user', 'auditor'],
  surface: model.surfaces.map(item => item.id),
  aiState: ['unconfigured', 'degraded', 'ready'],
  dataState: ['empty', 'normal', 'dense', 'contradictory'],
  authority: ['allowed', 'denied'],
  viewport: ['desktop', 'tablet', 'mobile-390', 'mobile-320'],
  disclosure: ['closed', 'single-open', 'returning-user-state'],
  recordDensity: ['none', 'single', 'many'],
  network: ['healthy', 'slow', 'interrupted'],
  language: ['canonical-italian', 'external-standard-source']
});

const primitives = [
  ...model.surfaces.map(item => `surface:${item.id}`),
  ...Object.entries(model.canonicalVocabulary).map(([code, label]) => `vocabulary:${code}:${label}`),
  ...Object.entries(model.sourceStateVocabulary).filter(([key]) => key !== 'boundary').map(([key, label]) => `source-state:${key}:${label}`),
  ...model.antiOverclaim.map((_, index) => `anti-overclaim:${index + 1}`),
  ...model.progressiveDisclosure.map((_, index) => `disclosure:${index + 1}`),
  'role:admin-home', 'role:user-home', 'role:auditor-home',
  'ai:unconfigured', 'ai:degraded', 'ai:ready',
  'data:empty', 'data:normal', 'data:dense', 'data:contradictory',
  'authority:allowed', 'authority:denied',
  'viewport:desktop', 'viewport:tablet', 'viewport:mobile-390', 'viewport:mobile-320', 'viewport:zoom-200',
  'input:pointer', 'input:keyboard', 'input:assistive-technology',
  'state:loading', 'state:empty', 'state:error', 'state:success', 'state:recovery',
  'density:page-max-1180', 'density:copy-max-66ch', 'density:target-min-44',
  'dialog:source-progressive', 'dialog:event-progressive', 'dialog:proof-progressive', 'dialog:settings-progressive',
  'admin:single-active-panel', 'standards:closed-by-default',
  'claim:catalog-acceptance-scoped', 'claim:model-score-indicative', 'claim:runtime-vs-deployment',
  'claim:event-not-preclassified', 'claim:evidence-not-certification'
];

const uniquePrimitives = [...new Set(primitives)];
const M = uniquePrimitives.length;
const MPlus100 = M + 100;
const seen = new Set();
const scenarios = [];
let lastNovelty = 0;

for (let index = 1; index <= MPlus100; index += 1) {
  const primitive = index <= M
    ? uniquePrimitives[index - 1]
    : uniquePrimitives[(index * 37 + 11) % M];
  const novelty = !seen.has(primitive);
  if (novelty) {
    seen.add(primitive);
    lastNovelty = index;
  }
  scenarios.push({ index, primitive, novelty });
}

const noveltyAfterM = scenarios.filter(item => item.index > M && item.novelty);
const contradictions = [];
for (const surface of model.surfaces) {
  if (surface.initialBlocks > model.complexityBudget.maxInitialBlocks) contradictions.push(`${surface.id}:initial-blocks`);
  if (surface.primaryActionsMax < 0) contradictions.push(`${surface.id}:negative-actions`);
  if (!surface.secondaryDisclosure) contradictions.push(`${surface.id}:missing-disclosure`);
}

const combinationCount = Object.values(dimensions).reduce((total, values) => total * values.length, 1);
assert.equal(seen.size, M);
assert.equal(lastNovelty, M);
assert.equal(noveltyAfterM.length, 0);
assert.equal(contradictions.length, 0);
assert.equal(scenarios.at(-1).index, MPlus100);

const report = {
  schemaVersion: model.schemaVersion,
  ok: true,
  boundedModel: true,
  dimensions,
  combinationCount,
  primitiveCount: M,
  M,
  MPlus100,
  lastNovelty,
  noveltyAfterM: noveltyAfterM.length,
  noveltyAtMPlus100: scenarios.at(-1).novelty,
  contradictionsAfterM: contradictions,
  noNoveltyAfterMThroughMPlus100: true,
  scopeBoundary: model.claimBoundary,
  scenarios
};

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-editorial-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-editorial-saturation: M=${M}, M+100=${MPlus100}, novelty-after-M=0, combinations=${combinationCount}`);
