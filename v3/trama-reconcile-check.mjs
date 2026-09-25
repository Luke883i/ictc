import assert from 'node:assert/strict';
import {appendFile,readFile} from 'node:fs/promises';
import {deriveExpectedReconciliation,interactionMode,isGenericContinuationIntent,legacyCensus,loadReconcileContract,nextGovernedAction,reconcileAuthority,repositoryPurposeCensus,validateReconcileContract} from './trama-reconcile.mjs';

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
assert.equal(legacy.censusSource,'git-ls-tree-head');
assert.equal(legacy.unknown.length,0,'all detected legacy/versioned candidates must be classified');
assert.equal(legacy.contentMissing.length,0,'explicit content-level legacy sites drifted');
assert.ok(legacy.blocking.length>0,'C1 must remain evidence-backed open while blocking legacy residue exists');
for(const cls of ['compatibility-required','migration-only','lineage-only','deprecated-test','retirement-candidate','blocking-unclassified'])assert.ok(Object.hasOwn(legacy.counts,cls),cls);
const purpose=repositoryPurposeCensus();
assert.equal(purpose.censusSource,'git-ls-tree-head');
assert.equal(purpose.authorityEffect,'NONE');assert.equal(purpose.projectionIsSot,false);assert.equal(purpose.writer,false);assert.equal(purpose.automaticDeletion,false);
assert.equal(purpose.totalFiles,purpose.rows.length);assert.equal(purpose.classifiedFiles+purpose.needsClassification.length,purpose.totalFiles);
for(const row of purpose.retirementCandidates){assert.ok(row.qualificationCoverage>=contract.repositoryPurposeGovernance.qualificationCoverageMinimum,row.path);assert.equal(row.liveInbound.length,0,row.path);assert.equal(row.dynamicRisk,false,row.path);}
if(process.env.GITHUB_STEP_SUMMARY){
 const candidateLines=purpose.retirementCandidates.slice(0,120).map(x=>'- '+x.path+' | '+x.kind+' | q='+x.qualificationCoverage.toFixed(2)).join('\n');
 const unknownLines=purpose.needsClassification.slice(0,120).map(x=>'- '+x.path+' | '+x.reason+' | q='+x.qualificationCoverage.toFixed(2)).join('\n');
 const summary='## Repository purpose census\n\nTracked: **'+purpose.totalFiles+'** | classified: **'+purpose.classifiedFiles+'** | needs-classification: **'+purpose.needsClassification.length+'** | retirement-candidate: **'+purpose.retirementCandidates.length+'**\n\n### By state\n\n'+JSON.stringify(purpose.byState,null,2)+'\n\n### Needs classification\n'+(unknownLines||'- none')+'\n\n### Retirement candidates (first 120)\n'+(candidateLines||'- none')+'\n';
 await appendFile(process.env.GITHUB_STEP_SUMMARY,summary);
}
assert.equal(purpose.needsClassification.length,0,'repository purpose census needs classification: '+JSON.stringify(purpose.needsClassification.slice(0,80).map(x=>({path:x.path,reason:x.reason,q:x.qualificationCoverage,dynamic:x.dynamicRisk,authorityLike:x.authorityLike}))));
assert.equal(purpose.coverage,1);

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
for(const token of ['GOV-TRAMA-RECONCILE-1','GLOBAL_ACT','ora che si fa'])assert.ok(agents.includes(token)||development.includes(token)||testing.includes(token),'docs '+token);
assert.equal([agents,development,testing].some(body=>body.includes('C2-DELIVERY-PROVENANCE')),false,'operating governance docs must not shadow the live next conditional slice');

console.log(JSON.stringify({
 ok:true,
 suite:'GOV-TRAMA-RECONCILE-1',
 methodFamilies:contract.method.canonicalFamilies,
 campaigns:contract.campaigns.length,
 legacyCandidates:legacy.pathRows.length,purpose:{total:purpose.totalFiles,byState:purpose.byState,retirementCandidates:purpose.retirementCandidates.length,needsClassification:purpose.needsClassification.length,coverage:purpose.coverage},
 blockingLegacy:legacy.blocking.length,
 unknownLegacy:legacy.unknown.length,
 reconciled:{serial:expected.serial,conditionals:expected.conditionals},
 next:action.slice,
 claimBoundary:contract.claimBoundary
}));
