import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRODUCT_PROPOSITION, PROCEDURE_WORKSPACE } from './public/ui/native-semantic-lattice-3-2.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const json = path => JSON.parse(read(path));
const contract = json('./uiux-beauty-p4-contract.json');
const owners = json('./semantic-owner-contract.json');
const tokens = read('./public/design-tokens.css');
const enterprise = read('./public/enterprise-workspace-3-2.css');
const procedure = read('./public/semantic-workspace-closure-3-2-1.css');
const shared = read('./public/enduser-composition-p2.css');
const retired = read('./public/screenshot-semantic-closure-p3a.css');
const workspace = read('./public/ui/native-workspace-3-2.js');

assert.equal(contract.modelId, 'UIUX-BEAUTY-P4');
assert.equal(contract.surfaceCensus.length, 13, 'P4 must census exactly 13 canonical surfaces');
assert.equal(new Set(contract.surfaceCensus.map(item => item.id)).size, 13, 'P4 surface ids must be unique');
assert.equal(Object.keys(PROCEDURE_WORKSPACE).length, 7, 'seven procedure copy contracts must remain');

const canonicalOwners = new Map(owners.surfaceOwners.map(item => [item.id, item.owner]));
for (const surface of contract.surfaceCensus) {
  assert.equal(canonicalOwners.get(surface.id), surface.owner, `surface owner drift: ${surface.id}`);
  assert.ok(surface.kind && surface.cluster && surface.firstPlane && surface.beautyFocus?.length, `incomplete census: ${surface.id}`);
}
assert.equal(canonicalOwners.size, 13, 'C5 canonical owner denominator drifted');
assert.ok(contract.secondarySurfaces.length >= 6, 'secondary overlay census incomplete');

for (const required of contract.copyContract.requiredProductTerms) assert.ok(PRODUCT_PROPOSITION.includes(required), `product proposition lost ${required}`);
assert.ok(PRODUCT_PROPOSITION.length <= 280, 'product proposition became too long for the home first plane');
assert.ok(!/\bowner\b/i.test(Object.values(PROCEDURE_WORKSPACE).flatMap(x => [x.catalogueSummary, x.workspacePurpose]).join(' ')), 'avoidable English owner jargon remains in canonical procedure copy');
for (const [id, copy] of Object.entries(PROCEDURE_WORKSPACE)) {
  assert.ok(copy.catalogueSummary.length >= 35 && copy.catalogueSummary.length <= 125, `${id} catalogue copy outside concise enterprise range`);
  assert.ok(copy.workspacePurpose.length >= 45 && copy.workspacePurpose.length <= 155, `${id} workspace copy outside concise enterprise range`);
  assert.ok(copy.boundary.length >= 25, `${id} boundary became decorative or empty`);
}

assert.ok(!workspace.includes('beauty-p4.css'), 'P4 must not mount a new CSS layer');
assert.ok(!workspace.includes('/screenshot-semantic-closure-p3a.css'), 'P4 presentation must be absorbed before P5, not retained as screenshot ownership');
assert.ok(retired.includes('owns no runtime presentation'), 'P3A source marker must state retirement');
const requiredByOwner = [
  [tokens, '--ui-reading-wide:76ch', 'reading measure token'],
  [tokens, '--ui-state-h:26px', 'state height token'],
  [enterprise, '#homeView #homeSummary{max-width:var(--ui-reading-wide)', 'home readability'],
  [procedure, '#processesView .processes-head p{max-width:var(--ui-reading-wide)', 'process catalogue lead'],
  [procedure, '.procedure-card[data-uiux-layout="row"]>.procedure-purpose{grid-area:purpose', 'process purpose wrapping'],
  [procedure, '.procedure-frame[data-procedure-header-contract="3.2.1"] .procedure-purpose{min-width:0;max-width:var(--ui-reading-wide)', 'procedure lead'],
  [shared, '[data-surface-archetype="registry"] .grc-list>article>header{', 'GRC record hierarchy'],
  [shared, '[data-enduser-primitive="StateChip"]{', 'canonical state grammar'],
  [procedure, '#proofContent>details.proof-section>summary small{font-size:var(--type-control)', 'proof secondary copy'],
  [enterprise, '#adminCenter .procedure-policy-row small{font-size:var(--type-label)', 'admin row copy'],
  [enterprise, '#settingsDialog .settings-section-18>summary small{font-size:var(--type-control)', 'settings hierarchy']
];
for (const [source, fragment, name] of requiredByOwner) assert.ok(source.includes(fragment), `missing absorbed P4 contract: ${name}`);

assert.equal(contract.visualContract.canonicalPurposeEllipsisAllowed, false);
assert.equal(contract.visualContract.statusUppercaseForced, false);
assert.equal(contract.visualContract.mobileHorizontalOverflowAllowed, false);
assert.deepEqual(contract.mutationCampaigns.map(x => x.trials), [1_000_000, 1_000_000, 1_000_000]);
assert.equal(contract.maxYieldMinCost.rejectedLowYieldLever, 'global decorative restyling');

console.log(JSON.stringify({
  ok: true,
  modelId: contract.modelId,
  canonicalSurfaces: contract.surfaceCensus.length,
  secondarySurfaces: contract.secondarySurfaces.length,
  procedures: Object.keys(PROCEDURE_WORKSPACE).length,
  presentationOwnerAdded: false,
  screenshotPresentationOwnerRetired: true,
  mutationTrialsDeclared: contract.mutationCampaigns.reduce((sum, item) => sum + item.trials, 0),
  claimBoundary: contract.claimBoundary
}));
