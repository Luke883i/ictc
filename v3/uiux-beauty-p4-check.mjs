import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRODUCT_PROPOSITION, PROCEDURE_WORKSPACE } from './public/ui/native-semantic-lattice-3-2.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const json = path => JSON.parse(read(path));
const contract = json('./uiux-beauty-p4-contract.json');
const owners = json('./semantic-owner-contract.json');
const css = read('./public/screenshot-semantic-closure-p3a.css');
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

for (const required of contract.copyContract.requiredProductTerms) {
  assert.ok(PRODUCT_PROPOSITION.includes(required), `product proposition lost ${required}`);
}
assert.ok(PRODUCT_PROPOSITION.length <= 280, 'product proposition became too long for the home first plane');
assert.ok(!/\bowner\b/i.test(Object.values(PROCEDURE_WORKSPACE).flatMap(x => [x.catalogueSummary, x.workspacePurpose]).join(' ')), 'avoidable English owner jargon remains in canonical procedure copy');
for (const [id, copy] of Object.entries(PROCEDURE_WORKSPACE)) {
  assert.ok(copy.catalogueSummary.length >= 35 && copy.catalogueSummary.length <= 125, `${id} catalogue copy outside concise enterprise range`);
  assert.ok(copy.workspacePurpose.length >= 45 && copy.workspacePurpose.length <= 155, `${id} workspace copy outside concise enterprise range`);
  assert.ok(copy.boundary.length >= 25, `${id} boundary became decorative or empty`);
}

assert.ok(css.includes('P4 beauty convergence'), 'P4 must extend the existing screenshot closure, not create a new presentation layer');
assert.ok(!workspace.includes('beauty-p4.css'), 'P4 must not mount a new CSS layer');
const requiredCss = [
  '#homeView #homeSummary{max-width:var(--p4-reading-wide)!important;font-size:.95rem!important;line-height:1.5!important}',
  '#processesView .processes-head p{max-width:var(--p4-reading-wide)!important;font-size:.9rem!important;line-height:1.5!important}',
  '#procedureHub .procedure-card[data-uiux-layout="row"]>.procedure-purpose{font-size:.9rem!important;line-height:1.42!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important',
  '.procedure-frame[data-procedure-header-contract="3.2.1"] .procedure-purpose{max-width:var(--p4-reading-wide)!important;font-size:.9rem!important;line-height:1.45!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important}',
  '#grcWorkspace .grc-list>article>header{display:grid!important;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"status title" ". meta";align-items:center',
  '.status-pill{grid-area:status;justify-self:start;align-self:center;min-height:26px;padding:.22rem .5rem;border:1px solid var(--color-border);border-radius:999px;background:var(--color-surface-subtle);font-size:.78rem!important;font-weight:var(--weight-label);letter-spacing:.01em;text-transform:none;opacity:1}',
  '#proofContent>details.proof-section>summary small{font-size:.8rem!important;line-height:1.38!important}',
  '#adminCenter .procedure-policy-row small{font-size:.78rem!important;line-height:1.4!important;color:var(--color-muted)}',
  '#settingsDialog .settings-section-18>summary small{font-size:.8rem;line-height:1.38;color:var(--color-muted)}'
];
for (const fragment of requiredCss) assert.ok(css.includes(fragment), `missing beauty contract CSS: ${fragment.slice(0, 80)}`);

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
  mutationTrialsDeclared: contract.mutationCampaigns.reduce((sum, item) => sum + item.trials, 0),
  claimBoundary: contract.claimBoundary
}));
