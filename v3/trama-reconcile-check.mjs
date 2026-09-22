import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deriveExpectedReconciliation,interactionMode,isGenericContinuationIntent,legacyCensus,loadReconcileContract,nextGovernedAction,reconcileAuthority,validateReconcileContract} from './trama-reconcile.mjs';

const contract=loadReconcileContract();
assert.deepEqual(validateReconcileContract(contract),[]);
const expected=deriveExpectedReconciliation();
assert.equal(expected.conditionals['C5-SEMANTIC-OWNER-COMPRESSION'],'done');
assert.equal(expected.serial['UIUX-CONVERGE-0'],'done');
assert.equal(expected.conditionals['C1-COMPAT-CONTRACTION'],'todo');
assert.equal(expected.conditionals['C2-DELIVERY-PROVENANCE'],'in-progress');
assert.equal(expected.conditionals['C3-CAPACITY-CONTRACT'],'in-progress');
assert.equal(expected.conditionals['C4-AI-EVAL-DRIFT'],'in-progress');
assert.equal(expected.planning.completedThrough,'UIUX-CONVERGE-0');
assert.equal(expected.planning.nextSerialSlice,'S4-A6-CLOSE');
assert.equal(expected.planning.nextSerialState,'blocked');
assert.equal(expected.planning.nextConditionalSlice,'C2-DELIVERY-PROVENANCE');
assert.deepEqual(expected.planning.criticalPath,['C2-DELIVERY-PROVENANCE','C1-COMPAT-CONTRACTION','C3-CAPACITY-CONTRACT','C4-AI-EVAL-DRIFT']);
assert.deepEqual(expected.externalRails,['E3-HUMAN','E3-GOV','E4-DEPLOY']);
assert.equal(expected.evidence.c5Ready,true);
assert.equal(expected.evidence.uiuxReady,true);
assert.equal(expected.evidence.c3Evidence,true);

const legacy=legacyCensus();
assert.equal(legacy.censusSource,'git-ls-files');
assert.equal(legacy.unknown.length,0,'all detected legacy/versioned candidates must be classified');
assert.equal(legacy.contentMissing.length,0,'explicit content-level legacy sites drifted');
assert.ok(legacy.blocking.length>0,'C1 must remain evidence-backed open while blocking legacy residue exists');
for(const cls of ['compatibility-required','migration-only','lineage-only','deprecated-test','retirement-candidate','blocking-unclassified'])assert.ok(Object.hasOwn(legacy.counts,cls),cls);

for(const phrase of ['ora','ora?','ora che si fa','e adesso','prosegui','continua','what next','now what','continue']){
 assert.equal(isGenericContinuationIntent(phrase,contract),true,phrase);
 assert.equal(interactionMode(phrase,contract),'GLOBAL_ACT',phrase);
}
assert.equal(isGenericContinuationIntent('fix provider OpenAI',contract),false);
assert.equal(interactionMode('fix provider OpenAI',contract),'INTENT_SCOPED');

const audit=reconcileAuthority();
assert.equal(audit.coherent,true,JSON.stringify(audit.debt));
assert.deepEqual(audit.debt,[]);
const action=nextGovernedAction();
assert.equal(action.state,'READY_TO_PLAN');
assert.equal(action.slice,'C2-DELIVERY-PROVENANCE');

const [authorityRaw,registry,compass,development,testing,agents]=await Promise.all([
 readFile(new URL('../docs/convergence/convergence-authority.json',import.meta.url),'utf8'),
 readFile(new URL('./current-gate-registry.mjs',import.meta.url),'utf8'),
 readFile(new URL('../docs/ENGINEERING_COMPASS.md',import.meta.url),'utf8'),
 readFile(new URL('../docs/DEVELOPMENT.md',import.meta.url),'utf8'),
 readFile(new URL('../docs/TESTING.md',import.meta.url),'utf8'),
 readFile(new URL('../AGENTS.md',import.meta.url),'utf8')
]);
const authority=JSON.parse(authorityRaw);
assert.equal(authority.governanceRevision,'GOV-WB6');
assert.equal(authority.reconciliationObservation?.mergedPr,183);
assert.equal(authority.reconciliationObservation?.mainSha,contract.observedPreimage.mainSha);
for(const gate of ['v3/trama-reconcile-check.mjs','v3/trama-reconcile-saturation.mjs'])assert.equal(registry.split("'"+gate+"'").length-1,1,gate);
assert.ok(registry.indexOf("'v3/trama-engineering-saturation.mjs'")<registry.indexOf("'v3/trama-reconcile-check.mjs'"));
assert.ok(registry.indexOf("'v3/trama-reconcile-check.mjs'")<registry.indexOf("'v3/c3-capacity-contract-check.mjs'"));
for(const token of ['GOV-WB6','C2-DELIVERY-PROVENANCE','Locale','Intermedio','Globale','E3-HUMAN','E3-GOV','E4-DEPLOY'])assert.ok(compass.includes(token),'Compass '+token);
for(const token of ['GOV-TRAMA-RECONCILE-1','GLOBAL_ACT','ora che si fa','C2-DELIVERY-PROVENANCE'])assert.ok(agents.includes(token)||development.includes(token)||testing.includes(token),'docs '+token);

console.log(JSON.stringify({
 ok:true,
 suite:'GOV-TRAMA-RECONCILE-1',
 methodFamilies:contract.method.canonicalFamilies,
 campaigns:contract.campaigns.length,
 legacyCandidates:legacy.pathRows.length,
 blockingLegacy:legacy.blocking.length,
 unknownLegacy:legacy.unknown.length,
 reconciled:{serial:expected.serial,conditionals:expected.conditionals},
 next:action.slice,
 claimBoundary:contract.claimBoundary
}));
