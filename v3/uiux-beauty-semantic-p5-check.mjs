import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import {
  ENDUSER_PRIMITIVES,
  ENDUSER_SURFACE_GRAMMAR,
  LOCAL_COMPOSITION_OWNERS,
  NATIVE_LATTICE_INVARIANTS,
  NATIVE_LATTICE_METRICS,
  PROCEDURE_WORKSPACE,
  SURFACE_ARCHETYPE_FAMILY
} from './public/ui/native-semantic-lattice-3-2.js';
import { INFORMATION_ROLES, SURFACE_BLUEPRINTS } from './public/ui/semantic-composition-model.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const json = path => JSON.parse(read(path));
const contract = json('./uiux-beauty-semantic-p5-contract.json');
const workspace = read('./public/ui/native-workspace-3-2.js');
const runtime = read('./public/ui/semantic-composition-runtime.js');
const stateProjection = read('./public/ui/semantic-state-projection-p3.js');
const tokens = read('./public/design-tokens.css');
const shared = read('./public/enduser-composition-p2.css');
const enterprise = read('./public/enterprise-workspace-3-2.css');
const procedure = read('./public/semantic-workspace-closure-3-2-1.css');
const operational = read('./public/a6-ux3-operational-surface.css');
const retired = read('./public/screenshot-semantic-closure-p3a.css');

const canonical = contract.canonicalSurfaces;
const exactSet = (actual, expected, label) => assert.deepEqual([...actual].sort(), [...expected].sort(), label);

assert.equal(contract.modelId, 'UIUX-BEAUTY-SEMANTIC-P5');
assert.equal(contract.invariants.surfaceCount, 13);
assert.equal(contract.invariants.archetypeFamilyCount, 5);
assert.equal(contract.invariants.businessProcedureCount, 7);
assert.equal(Object.keys(PROCEDURE_WORKSPACE).length, 7);
assert.equal(contract.minimumLattice.length, 4);
assert.deepEqual(contract.minimumLattice.map(x => x.id), [
  'M1_VISUAL_AUTHORITY',
  'M2_SEMANTIC_HIERARCHY',
  'M3_OBJECT_INTERACTION_GRAMMAR',
  'M4_CONTEXTUAL_ADAPTATION'
]);

exactSet(Object.keys(SURFACE_BLUEPRINTS), canonical, 'surface blueprint aliases/drift');
exactSet(Object.keys(ENDUSER_SURFACE_GRAMMAR), canonical, 'surface grammar aliases/drift');
exactSet(Object.keys(SURFACE_ARCHETYPE_FAMILY), canonical, 'archetype aliases/drift');
exactSet(Object.keys(LOCAL_COMPOSITION_OWNERS).filter(id => id !== 'navigation'), canonical, 'local owner aliases/drift');
assert.equal(SURFACE_BLUEPRINTS.aiSettings, undefined, 'camelCase AI settings alias survived');
assert.equal(LOCAL_COMPOSITION_OWNERS.aiSettings, undefined, 'camelCase local owner alias survived');
assert.equal(ENDUSER_SURFACE_GRAMMAR.aiSettings, undefined, 'camelCase grammar alias survived');
assert.equal(SURFACE_ARCHETYPE_FAMILY.aiSettings, undefined, 'camelCase archetype alias survived');
assert.equal(LOCAL_COMPOSITION_OWNERS['ai-settings'], 'settings-1-8-fix.js');

for (const [family, ids] of Object.entries(contract.archetypeFamilies)) {
  for (const id of ids) assert.equal(SURFACE_ARCHETYPE_FAMILY[id], family, `archetype drift ${id}`);
}
assert.equal(new Set(Object.values(SURFACE_ARCHETYPE_FAMILY)).size, 5);
assert.equal(NATIVE_LATTICE_METRICS.beautyArchetypeFamilies, 5);
assert.equal(NATIVE_LATTICE_METRICS.canonicalSurfaceAliasesAllowed, 0);
for (const invariant of ['canonical-surface-id-no-alias','beauty-archetype-family-five','visual-authority-one-per-semantic-role','epistemic-emphasis-not-verdict']) {
  assert.ok(NATIVE_LATTICE_INVARIANTS.includes(invariant), `missing P5 invariant ${invariant}`);
}
assert.ok(INFORMATION_ROLES.includes('state'), 'state is not a first-class information role');
assert.ok(ENDUSER_PRIMITIVES.includes('StateChip'), 'StateChip primitive missing');

assert.ok(runtime.includes('dataset.surfaceArchetype'), 'runtime archetype annotation missing');
assert.ok(runtime.includes('dataset.surfaceGrammar'), 'runtime grammar annotation missing');
assert.ok(runtime.includes("LOCAL_COMPOSITION_OWNERS[id]"), 'runtime local-owner annotation missing');
for (const forbidden of ['textContent=','innerHTML=','replaceChildren(','append(','prepend(','insertBefore(','remove()']) {
  assert.ok(!runtime.includes(forbidden), `global annotation runtime regained local DOM mutation: ${forbidden}`);
}

assert.ok(!workspace.includes('/screenshot-semantic-closure-p3a.css'), 'retired screenshot stylesheet still mounted');
assert.ok(!workspace.includes('beauty-p5.css') && !workspace.includes('beauty-semantic-p5.css'), 'new beauty presentation layer mounted');
assert.ok(retired.includes('retired from runtime by P5 pre-PR') && retired.includes('owns no runtime presentation'), 'retirement marker missing');
assert.ok(!retired.includes('{'), 'retired screenshot stylesheet still contains executable CSS');
const publicCss = readdirSync(new URL('./public/', import.meta.url), {withFileTypes:true})
  .filter(x => x.isFile() && x.name.endsWith('.css')).map(x => x.name);
assert.equal(publicCss.filter(x => /beauty.*p5|p5.*beauty/i.test(x)).length, 0, 'P5 introduced a beauty-only stylesheet');

for (const token of ['--ui-reading-wide:76ch','--ui-state-h:26px','--type-lead:.95rem','--type-control:.8rem']) {
  assert.ok(tokens.includes(token), `bounded token vocabulary missing ${token}`);
}
assert.ok(shared.includes('[data-enduser-primitive="StateChip"]{'), 'canonical state visual grammar missing');
assert.ok(shared.includes('[data-surface-archetype="registry"] .grc-list>article>header{'), 'registry archetype grammar missing');
assert.ok(shared.includes('[data-surface-archetype="operational"] .section-head h2'), 'operational archetype grammar missing');
assert.ok(stateProjection.includes("stateEncoding='text+style'"), 'state encoding is not text+style');
assert.ok(stateProjection.includes("enduserPrimitive='StateChip'"), 'state projection does not assign StateChip');
assert.ok(stateProjection.includes('.grc-list .status-pill'), 'GRC status pills are outside state projection');

const absorbed = [
  [enterprise, '#homeView #homeSummary{max-width:var(--ui-reading-wide)', 'home lead'],
  [enterprise, '#adminCenter .procedure-policy-row small{font-size:var(--type-label)', 'admin row'],
  [enterprise, '#settingsDialog .settings-section-18>summary small{font-size:var(--type-control)', 'settings hierarchy'],
  [procedure, '#processesView .processes-head p{max-width:var(--ui-reading-wide)', 'process catalogue lead'],
  [procedure, '.procedure-card[data-uiux-layout="row"]>.procedure-purpose{grid-area:purpose', 'catalogue natural wrap'],
  [procedure, '.procedure-frame[data-procedure-header-contract="3.2.1"] .procedure-purpose{min-width:0;max-width:var(--ui-reading-wide)', 'procedure lead'],
  [procedure, '#proofContent>details.proof-section>summary small{font-size:var(--type-control)', 'proof secondary copy'],
  [operational, '.a6-operational-registry>summary{display:grid', 'operational registry summary']
];
for (const [source, fragment, label] of absorbed) assert.ok(source.includes(fragment), `P4/P3A responsibility not absorbed: ${label}`);

for (const [id, row] of Object.entries(PROCEDURE_WORKSPACE)) {
  assert.ok(row.boundary && row.boundary.length >= 25, `${id} material boundary missing`);
}
assert.match(PROCEDURE_WORKSPACE.monitoring.boundary, /≠|non equivale/i);
assert.match(PROCEDURE_WORKSPACE.coverage.boundary, /non equivale/i);
assert.match(PROCEDURE_WORKSPACE.actions.boundary, /non equivale/i);
assert.match(PROCEDURE_WORKSPACE.risks.boundary, /non equivale/i);
assert.match(PROCEDURE_WORKSPACE.assurance.boundary, /non equivale/i);

assert.equal(contract.invariants.newBeautyStylesheetAllowed, false);
assert.equal(contract.invariants.screenshotStylesheetMounted, false);
assert.equal(contract.invariants.stateRequiresTextAndStyle, true);
assert.equal(contract.invariants.semanticReorderOnResponsiveAllowed, false);
assert.equal(contract.invariants.humanDecisionBoundaryRequired, true);
assert.equal(contract.mutationCampaign.trials, 1_000_000);
assert.equal(contract.mutationCampaign.expectedSurvivors, 0);
assert.equal(contract.mutationCampaign.multiDefectExpected, 563_215);
assert.equal(contract.baseObservation.mainSha, '08d4f6db531a2c48a8d22be6659742066d43bdb9');
assert.equal(contract.baseObservation.mergedThroughPr, 156);
assert.equal(contract.newMainAdversarialCampaign.seed, '0x5EED9156');
assert.equal(contract.newMainAdversarialCampaign.trials, 1_000_000);
assert.equal(contract.newMainAdversarialCampaign.expectedSurvivors, 0);

console.log(JSON.stringify({
  ok:true,
  suite:'uiux-beauty-semantic-p5-check',
  surfaces:canonical.length,
  archetypes:new Set(Object.values(SURFACE_ARCHETYPE_FAMILY)).size,
  procedures:Object.keys(PROCEDURE_WORKSPACE).length,
  minimumLattice:contract.minimumLattice.map(x=>x.id),
  screenshotPresentationOwnerMounted:false,
  newBeautyStylesheet:false,
  stateEncoding:'text+style',
  claimBoundary:contract.claimBoundary
}));
