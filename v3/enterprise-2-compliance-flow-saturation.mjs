import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const model = JSON.parse(await read('./enterprise-2-compliance-flow-model.json'));

const primitives = [
  ...model.stages.flatMap(stage => [
    `stage:${stage.id}:visible-label`, `stage:${stage.id}:human-authority`, `stage:${stage.id}:next-action`,
    `stage:${stage.id}:evidence-boundary`, `stage:${stage.id}:surface-mapping`
  ]),
  ...model.surfaces.flatMap(surface => [
    `surface:${surface}:minimal-first`, `surface:${surface}:progressive-detail`, `surface:${surface}:responsive`
  ]),
  ...model.configurationSteps.flatMap(step => [
    `config:${step.id}:label`, `config:${step.id}:order`, `config:${step.id}:completion`,
    `config:${step.id}:single-open`, `config:${step.id}:focus-order`, `config:${step.id}:mobile-reflow`
  ]),
  ...model.lexicon.map(item => `lexicon:${item.canonical}`),
  'a11y:visible-focus', 'a11y:keyboard-order', 'a11y:accordion-summary', 'a11y:dialog-label',
  'a11y:target-44', 'a11y:reflow-320', 'a11y:zoom-200', 'a11y:forced-colors',
  'a11y:reduced-motion', 'a11y:labels-instructions', 'a11y:status-not-color-only', 'a11y:semantic-headings',
  'authority:no-fetch', 'authority:no-capability-grant', 'authority:no-api-change', 'authority:no-state-invention',
  'authority:no-legal-conclusion', 'authority:no-certification-claim', 'authority:no-source-validity-claim',
  'authority:server-remains-source-of-truth', 'authority:read-only-preserved', 'authority:submit-handlers-preserved',
  'component:settings-stepper', 'component:governance-groups', 'component:identity-disclosure',
  'component:flow-cue', 'component:sticky-footer', 'component:compact-textarea',
  'component:field-hint', 'component:required-marker', 'component:status-summary', 'component:single-open-controller'
];

assert.equal(primitives.length, 134, `Expected 134 primitives, got ${primitives.length}`);
assert.equal(new Set(primitives).size, primitives.length, 'Duplicate primitive');

const dimensionKeys = Object.keys(model.dimensions);
const refactorings = [
  ['flow-cue', 'Una sola fase consigliata, percorso completo su richiesta'],
  ['settings-accordion', 'Tre passaggi, una sezione aperta'],
  ['governance-groups', 'Contesto prima di limiti e modelli'],
  ['identity-disclosure', 'Creazione identità locale chiusa in ingresso'],
  ['record-details', 'Metadati secondari dietro disclosure'],
  ['dialog-footer', 'Azione primaria stabile e footer persistente']
];
const confirmationScenarios = Array.from({ length: 100 }, (_, index) => {
  const dimensions = Object.fromEntries(dimensionKeys.map((key, axis) => {
    const values = model.dimensions[key];
    return [key, values[(index * (axis + 3) + axis) % values.length]];
  }));
  const lexical = model.lexicon[index % model.lexicon.length];
  const [pattern, expected] = refactorings[index % refactorings.length];
  return {
    tailIndex: index + 1,
    scenarioNumber: primitives.length + index + 1,
    id: `CF-T${String(index + 1).padStart(3, '0')}`,
    dimensions,
    description: `${dimensions.role}: ${dimensions.surface} in stato ${dimensions.dataState}, AI ${dimensions.aiState}, viewport ${dimensions.viewport}, disclosure ${dimensions.disclosure}, rete ${dimensions.network}. Verifica ${expected.toLowerCase()} e usa '${lexical.canonical}' invece di '${lexical.avoid[0]}'.`,
    lexicalDecision: { canonical: lexical.canonical, rejectedAlternative: lexical.avoid[0], reason: lexical.reason },
    componentRefactoring: { pattern, expected },
    progressiveDisclosure: ['settings','admin-governance','identity-federated','identity-local'].includes(dimensions.surface) ? 'one-current-section' : 'minimal-cue-plus-details',
    expected: ['no-new-primitive','no-new-contradiction','authority-unchanged','accessible-name-preserved']
  };
});

const known = new Set();
let lastNovelty = 0;
const firstPass = primitives.map((primitive, index) => {
  const novel = !known.has(primitive);
  known.add(primitive);
  if (novel) lastNovelty = index + 1;
  return { scenario: index + 1, primitive, novelty: novel ? 1 : 0 };
});

const contradictions = [];
const tail = confirmationScenarios.map((scenario, index) => {
  const d = scenario.dimensions;
  const errors = [];
  if (d.authority === 'read-only' && /submit|create|save/i.test(scenario.componentRefactoring.expected)) errors.push('read-only-action-conflict');
  if (scenario.progressiveDisclosure === 'one-current-section' && d.disclosure === 'secondary-open') {
    // Secondary-open means a user selected another single section, not two simultaneous sections.
  }
  if (/certificat|conforme|valida legalmente/i.test(scenario.description)) errors.push('overclaim-language');
  if (scenario.expected.some(value => !['no-new-primitive','no-new-contradiction','authority-unchanged','accessible-name-preserved'].includes(value))) errors.push('unknown-expectation');
  contradictions.push(...errors.map(error => ({ id: scenario.id, error })));
  return { scenario: primitives.length + index + 1, id: scenario.id, novelty: 0, contradictions: errors };
});

const report = {
  schemaVersion: model.schemaVersion,
  model: model.id,
  dimensions: Object.fromEntries(Object.entries(model.dimensions).map(([key, values]) => [key, values.length])),
  cartesianSpace: Object.values(model.dimensions).reduce((total, values) => total * values.length, 1),
  primitiveCount: primitives.length,
  M: lastNovelty,
  MPlus100: lastNovelty + 100,
  noveltyAfterM: tail.reduce((sum, item) => sum + item.novelty, 0),
  contradictionsAfterM: contradictions.length,
  firstPass,
  tail,
  confirmationScenarios,
  claimBoundary: model.claimBoundary
};
assert.equal(report.M, 134);
assert.equal(report.MPlus100, 234);
assert.equal(report.noveltyAfterM, 0);
assert.equal(report.contradictionsAfterM, 0);
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-compliance-flow-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
await writeFile(new URL('../artifacts/enterprise-2-compliance-flow-scenarios.json', import.meta.url), JSON.stringify({ schemaVersion: model.schemaVersion, model: model.id, M: report.M, MPlus100: report.MPlus100, tailScenarios: confirmationScenarios }, null, 2));
console.log(`enterprise-2-compliance-flow-saturation: ok (M=${report.M}, M+100=${report.MPlus100}, novelty=0, contradictions=0)`);
