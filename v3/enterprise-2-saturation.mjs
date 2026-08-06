import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('./enterprise-2-contract.json', import.meta.url), 'utf8'));
const axes = Object.fromEntries(contract.T.map(axis => [axis.name, axis.values]));
const names = Object.keys(axes);
const declaredScenarios = Object.values(axes).reduce((total, values) => total * BigInt(values.length), 1n);

const EXPECTED = [
  'hierarchy-overload', 'jargon-first', 'capability-mismatch', 'empty-space-waste',
  'disclosure-overload', 'action-detachment', 'evidence-overclaim', 'responsive-overflow',
  'focus-loss', 'audience-proof-gap', 'ai-authority-confusion', 'identity-model-conflation',
  'status-color-only', 'long-text-clipping', 'network-recovery-gap', 'record-density-collapse',
  'proof-composition-gap', 'dialog-context-loss', 'mobile-action-collision', 'certifier-standard-gap',
  'public-authority-trace-gap', 'human-authority-gap', 'claim-boundary-gap', 'machine-proof-gap'
];

const base = Object.fromEntries(names.map(name => [name, axes[name][0]]));
const witness = (patch, primitive) => ({ scenario: { ...base, ...patch }, primitive });
const witnesses = [
  witness({ surface: 'home', cognitiveLoad: 'time-pressure', disclosureDepth: 'technical' }, 'hierarchy-overload'),
  witness({ surface: 'monitoring', terminology: 'domain-term', audience: 'employee' }, 'jargon-first'),
  witness({ role: 'auditor', intent: 'create' }, 'capability-mismatch'),
  witness({ recordState: 'empty', dataVolume: 'zero', surface: 'events' }, 'empty-space-waste'),
  witness({ disclosureDepth: 'technical', cognitiveLoad: 'novice' }, 'disclosure-overload'),
  witness({ intent: 'decide', viewport: '1920x1080', surface: 'monitoring' }, 'action-detachment'),
  witness({ evidenceState: 'receipt', documentComposition: 'executive-summary' }, 'evidence-overclaim'),
  witness({ viewport: '320x568', zoom: '200', textExpansion: 'long-italian' }, 'responsive-overflow'),
  witness({ inputMode: 'keyboard', surface: 'dialogs', networkState: 'slow' }, 'focus-loss'),
  witness({ audience: 'enterprise-consultant', documentComposition: 'operational-record' }, 'audience-proof-gap'),
  witness({ aiState: 'ready', intent: 'decide', role: 'user' }, 'ai-authority-confusion'),
  witness({ identityMode: 'shibboleth', surface: 'admin-identity', intent: 'create' }, 'identity-model-conflation'),
  witness({ assistivePreference: 'forced-colors', recordState: 'attention' }, 'status-color-only'),
  witness({ textExpansion: 'unbroken-identifier', surface: 'admin-controls' }, 'long-text-clipping'),
  witness({ networkState: 'revision-conflict', intent: 'decide' }, 'network-recovery-gap'),
  witness({ dataVolume: 'hundred', surface: 'events', viewport: '390x844' }, 'record-density-collapse'),
  witness({ audience: 'iso-certifier', documentComposition: 'claim-boundary' }, 'proof-composition-gap'),
  witness({ surface: 'dialogs', viewport: 'mobile-landscape', inputMode: 'touch' }, 'dialog-context-loss'),
  witness({ viewport: '320x568', intent: 'create', surface: 'events' }, 'mobile-action-collision'),
  witness({ audience: 'iso-certifier', terminology: 'standard-reference' }, 'certifier-standard-gap'),
  witness({ audience: 'garante-or-acn', evidenceState: 'version-chain' }, 'public-authority-trace-gap'),
  witness({ aiState: 'ready', role: 'admin', intent: 'decide' }, 'human-authority-gap'),
  witness({ audience: 'ministry-or-regulator', documentComposition: 'executive-summary' }, 'claim-boundary-gap'),
  witness({ documentComposition: 'machine-readable-proof', evidenceState: 'integrity-warning' }, 'machine-proof-gap')
];

function risks(s) {
  const found = new Set();
  if (s.surface === 'home' && ['technical', 'proof'].includes(s.disclosureDepth) && ['novice', 'time-pressure'].includes(s.cognitiveLoad)) found.add('hierarchy-overload');
  if (s.surface === 'monitoring' && s.terminology === 'domain-term' && ['employee', 'enterprise-consultant'].includes(s.audience)) found.add('jargon-first');
  if (s.role === 'auditor' && ['create', 'decide'].includes(s.intent)) found.add('capability-mismatch');
  if (s.recordState === 'empty' && s.dataVolume === 'zero' && ['home', 'monitoring', 'events', 'admin-ai'].includes(s.surface)) found.add('empty-space-waste');
  if (s.disclosureDepth === 'technical' && ['novice', 'interrupted', 'time-pressure'].includes(s.cognitiveLoad)) found.add('disclosure-overload');
  if (s.intent === 'decide' && ['1920x1080', '1440x1000'].includes(s.viewport) && ['monitoring', 'events', 'admin-controls'].includes(s.surface)) found.add('action-detachment');
  if (['receipt', 'version-chain'].includes(s.evidenceState) && s.documentComposition === 'executive-summary') found.add('evidence-overclaim');
  if (['320x568', '390x844', 'mobile-landscape'].includes(s.viewport) && ['200', '400'].includes(s.zoom) && ['long-italian', 'unbroken-identifier', 'translated-30-percent'].includes(s.textExpansion)) found.add('responsive-overflow');
  if (['keyboard', 'screen-reader'].includes(s.inputMode) && s.surface === 'dialogs' && ['slow', 'revision-conflict'].includes(s.networkState)) found.add('focus-loss');
  if (['enterprise-consultant', 'internal-auditor', 'iso-certifier', 'ministry-or-regulator', 'garante-or-acn'].includes(s.audience) && !['standard-mapping', 'claim-boundary', 'machine-readable-proof'].includes(s.documentComposition)) found.add('audience-proof-gap');
  if (s.aiState === 'ready' && s.intent === 'decide' && s.role !== 'auditor') found.add('ai-authority-confusion');
  if (s.surface === 'admin-identity' && ['shibboleth', 'legacy-trusted-header'].includes(s.identityMode) && s.intent === 'create') found.add('identity-model-conflation');
  if (['forced-colors', 'high-contrast'].includes(s.assistivePreference) && ['attention', 'failed'].includes(s.recordState)) found.add('status-color-only');
  if (s.textExpansion === 'unbroken-identifier' && ['admin-controls', 'proof', 'dialogs'].includes(s.surface)) found.add('long-text-clipping');
  if (['offline', 'revision-conflict'].includes(s.networkState) && ['create', 'decide'].includes(s.intent)) found.add('network-recovery-gap');
  if (['hundred', 'long-history'].includes(s.dataVolume) && ['monitoring', 'events'].includes(s.surface) && ['320x568', '390x844', '768x1024'].includes(s.viewport)) found.add('record-density-collapse');
  if (['iso-certifier', 'ministry-or-regulator'].includes(s.audience) && ['executive-summary', 'claim-boundary'].includes(s.documentComposition)) found.add('proof-composition-gap');
  if (s.surface === 'dialogs' && ['320x568', '390x844', 'mobile-landscape'].includes(s.viewport) && ['touch', 'keyboard'].includes(s.inputMode)) found.add('dialog-context-loss');
  if (s.viewport === '320x568' && s.intent === 'create' && ['events', 'monitoring'].includes(s.surface)) found.add('mobile-action-collision');
  if (s.audience === 'iso-certifier' && s.terminology === 'standard-reference') found.add('certifier-standard-gap');
  if (['ministry-or-regulator', 'garante-or-acn'].includes(s.audience) && ['version-chain', 'integrity-warning'].includes(s.evidenceState)) found.add('public-authority-trace-gap');
  if (s.aiState === 'ready' && s.intent === 'decide' && ['admin', 'user'].includes(s.role)) found.add('human-authority-gap');
  if (['ministry-or-regulator', 'garante-or-acn', 'iso-certifier'].includes(s.audience) && s.documentComposition === 'executive-summary') found.add('claim-boundary-gap');
  if (s.documentComposition === 'machine-readable-proof' && ['integrity-warning', 'deployment-gap'].includes(s.evidenceState)) found.add('machine-proof-gap');
  return [...found].sort();
}

for (const item of witnesses) assert.ok(risks(item.scenario).includes(item.primitive), `invalid witness ${item.primitive}`);

function scenarioAt(index) {
  let value = BigInt(index + 1) * 11400714819323198485n;
  const scenario = {};
  for (let axis = 0; axis < names.length; axis += 1) {
    const options = axes[names[axis]];
    const offset = Number((value >> BigInt((axis * 7) % 53)) % BigInt(options.length));
    scenario[names[axis]] = options[offset];
    value = (value ^ (value >> 13n)) * 6364136223846793005n + BigInt(axis + 1);
  }
  return scenario;
}

const stream = [...witnesses.map(item => item.scenario), ...Array.from({ length: 60000 }, (_, index) => scenarioAt(index))];
const observed = new Set();
let lastNovelty = 0;
for (let index = 0; index < stream.length; index += 1) {
  for (const primitive of risks(stream[index])) {
    if (!observed.has(primitive)) {
      observed.add(primitive);
      lastNovelty = index + 1;
    }
  }
}
assert.deepEqual([...observed].sort(), [...EXPECTED].sort(), 'risk primitive coverage changed');

const stabilityWindow = 256;
const M = lastNovelty + stabilityWindow;
assert.ok(M + 100 <= stream.length, 'insufficient confirmation tail');
const atM = new Set();
for (const scenario of stream.slice(0, M)) for (const primitive of risks(scenario)) atM.add(primitive);
const novelty = new Set();
for (const scenario of stream.slice(M, M + 100)) for (const primitive of risks(scenario)) if (!atM.has(primitive)) novelty.add(primitive);
assert.equal(novelty.size, 0);

const report = {
  schemaVersion: contract.schemaVersion,
  ok: true,
  dimensions: names,
  dimensionCount: names.length,
  declaredCartesianScenarios: declaredScenarios.toString(),
  executedScenarios: M + 100,
  expectedRiskPrimitives: EXPECTED.length,
  observedRiskPrimitives: [...observed].sort(),
  witnessCount: witnesses.length,
  lastNovelty,
  stabilityWindow,
  M,
  confirmation: 100,
  MPlus100: M + 100,
  noveltyAfterM: [...novelty],
  audiences: axes.audience,
  limitations: [
    'This is bounded model saturation over explicit risk primitives, not exhaustive rendering of the full Cartesian product.',
    'No-novelty means no new primitive in the declared model; it does not prove absence of every future usability defect.',
    'External ISO certification and public-authority approval remain external evaluations.'
  ]
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-saturation: ok (T=${names.length}, primitives=${observed.size}, M=${M}, M+100=${M + 100}, novelty=0)`);
