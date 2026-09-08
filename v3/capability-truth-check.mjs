import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const defaultRoot=path.resolve(here,'..');
const POST_S3_MAIN='9f56b4444b212b36e5957f00df6cac0be381a9b1';
const POST_A5_MAIN='0b3bb752efb6251aea83857fe3d64b93b9527b50';
const EXPECTED_SCOPE='ICTC current capability truth after merged PR #121; S0-S3 repository-internal closures reconciled; release stage candidate; repository capabilities separated from deployment/independent evidence.';
const EXPECTED_BLOCKERS=['S4-ASSURANCE-CONTRACTION','S5-CANDIDATE-SEAL'];
const EXPECTED_EXTERNAL=['E4-SCANNER-EFFECTIVENESS','E4-IDENTITY-EFFECTIVENESS','E4-HUMAN-VALIDATION','E4-OBSERVABILITY-ALERTING','E4-BRANCH-PROTECTION'];
const CLOSURES={
  S1:{capability:'procedure-worklist-and-risk-reference-closure',gapIds:['GAP-015','GAP-016'],evidencePaths:['v3/runtime/procedure-worklist.mjs','v3/procedure-worklist-s1-check.mjs','v3/procedure-worklist-s1-saturation.mjs']},
  S2:{capability:'ar-temporal-review-and-explicit-epistemic-effects',gapIds:['GAP-017','GAP-018'],evidencePaths:['v3/runtime/grc-assurance.mjs','v3/runtime/dependency-review.mjs','v3/runtime/epistemic-write-store.mjs','v3/runtime/epistemic-step.mjs','v3/s2-temporal-epistemic-check.mjs','v3/s2-temporal-epistemic-saturation.mjs']},
  S3:{capability:'runtime-reliability-contract-s3',gapIds:['GAP-010','GAP-019'],evidencePaths:['v3/runtime/persistence-capability.mjs','v3/runtime/hardened-persistence.mjs','v3/runtime/scheduler-lease.mjs','v3/runtime/api-reliability.mjs','v3/runtime/reliability-slo.mjs','v3/s3-runtime-reliability-check.mjs','v3/s3-runtime-reliability-saturation.mjs']},
  A0:{capability:'s4-a0-exact-head-observability',evidencePaths:['v3/s4-a0-observability-check.mjs','v3/browser-s4-a0-observability.py']},
  A1:{capability:'s4-a1-local-worklist-presentation',evidencePaths:['v3/s4-a1-worklist-presentation-check.mjs','v3/browser-s4-a1-worklist-authority.py']},
  A2:{capability:'s4-a2-local-editorial-composition',evidencePaths:['v3/s4-a2-editorial-composition-check.mjs','v3/browser-s4-a2-editorial-composition.py']},
  A3:{capability:'s4-a3-specialized-local-grammar',evidencePaths:['v3/s4-a3-specialized-local-closure-check.mjs','v3/browser-s4-a3-specialized-local-closure.py']},
  A4:{capability:'s4-a4-admin-fail-partial-truth',evidencePaths:['v3/s4-a4-admin-truth-closure-check.mjs','v3/browser-s4-a4-admin-truth-closure.py']},
  A5:{capability:'s4-a5-final-dom-browser-a11y-oracles',evidencePaths:['v3/s4-a5-browser-a11y-check.mjs','v3/s4-a5-browser-a11y-saturation.mjs','v3/s4-a5-holdout-10k.mjs','v3/browser-s4-a5-final-dom-a11y.py']}
};
const GAP_PROOF={
  'GAP-015':{slice:'S1',change:'v3/runtime/procedure-worklist.mjs',test:'v3/procedure-worklist-s1-check.mjs',saturation:'v3/procedure-worklist-s1-saturation.mjs'},
  'GAP-016':{slice:'S1',change:'v3/runtime/procedure-worklist.mjs',test:'v3/procedure-worklist-s1-check.mjs',saturation:'v3/procedure-worklist-s1-saturation.mjs'},
  'GAP-017':{slice:'S2',change:'v3/runtime/grc-assurance.mjs',test:'v3/s2-temporal-epistemic-check.mjs',saturation:'v3/s2-temporal-epistemic-saturation.mjs'},
  'GAP-018':{slice:'S2',change:'v3/runtime/epistemic-write-store.mjs',test:'v3/s2-temporal-epistemic-check.mjs',saturation:'v3/s2-temporal-epistemic-saturation.mjs'},
  'GAP-010':{slice:'S3',change:'v3/runtime/scheduler-lease.mjs',test:'v3/s3-runtime-reliability-check.mjs',saturation:'v3/s3-runtime-reliability-saturation.mjs'},
  'GAP-019':{slice:'S3',change:'v3/runtime/persistence-capability.mjs',test:'v3/s3-runtime-reliability-check.mjs',saturation:'v3/s3-runtime-reliability-saturation.mjs'}
};
const S4_COMPLETED=['S4-A0','S4-A1','S4-A2','S4-A3','S4-A4','S4-A5'];
const load=(root,rel)=>JSON.parse(readFileSync(path.join(root,rel),'utf8'));
export function loadCapabilityTruthFixture(root=defaultRoot){return{truth:load(root,'v3/capability-truth.json'),releaseIdentity:load(root,'v3/release-identity.json'),documentationManifest:load(root,'docs/documentation-manifest.json'),gaps:load(root,'v3/gaps.json'),publicRegistry:load(root,'v3/public/gap-registry.json'),root};}
export function validateCapabilityTruth({truth,releaseIdentity,documentationManifest,gaps,publicRegistry,root=defaultRoot,pathExists=rel=>existsSync(path.join(root,rel))}){
  const failures=[];const check=(ok,msg)=>{if(!ok)failures.push(msg);};
  check(truth?.schemaVersion==='1.1.0','capability truth schema drift');
  check(truth?.authority==='capability-truth','capability truth authority drift');
  check(truth?.auditedAnchor?.mainSha===POST_S3_MAIN,'foundation audited anchor must remain exact post-#121 main');
  check(truth?.auditedAnchor?.mergedPr===121,'foundation audited anchor PR must remain #121');
  check(truth?.auditedAnchor?.meaning==='post-s3-runtime-reliability-contract','foundation audited anchor meaning drift');
  check(truth?.latestReconciliation?.mainSha===POST_A5_MAIN,'latest reconciliation must be exact post-#128 main');
  check(truth?.latestReconciliation?.mergedPr===128,'latest reconciliation PR must be #128');
  check(truth?.latestReconciliation?.meaning==='post-s4-a5-main-reconciliation','latest reconciliation meaning drift');
  check(releaseIdentity?.releaseStage==='candidate','release must remain candidate before S5');
  check(truth?.releaseClaim?.stage===releaseIdentity?.releaseStage,'release claim/identity drift');
  check(truth?.releaseClaim?.classification==='truth-current','capability truth must remain truth-current');
  check(truth?.releaseClaim?.enterpriseCandidate===false,'A5-MAIN cannot claim enterprise-candidate');
  check(truth?.releaseClaim?.enterpriseReady===false,'repository truth cannot claim enterprise-ready');
  check(String(truth?.releaseClaim?.claimBoundary||'').includes('S4-A6'),'remaining S4 internal slice must be A6');
  check(String(truth?.releaseClaim?.claimBoundary||'').includes('S5'),'remaining internal chain must include S5');
  check(String(truth?.releaseClaim?.claimBoundary||'').includes('deployment/independent E4'),'E4 claim boundary must remain explicit');
  const progress=truth?.s4Progress;
  check(progress?.parentGap==='GAP-020','S4 progress must remain under GAP-020');
  check(JSON.stringify(progress?.completed||[])===JSON.stringify(S4_COMPLETED),'S4 completed sub-slices drift');
  check(progress?.completedThrough==='S4-A5','A5 must be the latest completed S4 sub-slice');
  check(progress?.mainClosure?.mainSha===POST_A5_MAIN,'A5-MAIN closure SHA drift');
  check(progress?.mainClosure?.mergedPr===128,'A5-MAIN closure PR drift');
  check(progress?.mainClosure?.meaning==='A5 exact-main all-green/quiescent observed before reconciliation PR','A5-MAIN closure meaning drift');
  check(progress?.nextSlice==='S4-A6','A6 must be the next S4 slice');
  check(String(progress?.claimBoundary||'').includes('GAP-020 remains open'),'A5-MAIN must not close the S4 parent gap');
  check(String(progress?.claimBoundary||'').includes('E4'),'A5-MAIN must preserve E4 boundary');
  const presentation=documentationManifest?.versionAxes?.uiPresentation;
  check(presentation?.value==='local-owners','presentation authority regression');
  check(presentation?.classification==='canonical-distributed-presentation','presentation classification regression');

  const capabilities=truth?.repositoryCapabilities||[];
  check(capabilities.length>=17,'post-A5 capability census unexpectedly small');
  check(new Set(capabilities.map(x=>x.id)).size===capabilities.length,'duplicate capability id');
  for(const item of capabilities){
    check(item.status==='repository-proven',`${item.id}: capability status drift`);
    check(Array.isArray(item.evidencePaths)&&item.evidencePaths.length>=2,`${item.id}: insufficient proof paths`);
    check(Boolean(String(item.residualBoundary||'').trim()),`${item.id}: residual boundary missing`);
    for(const rel of item.evidencePaths||[])check(pathExists(rel),`${item.id}: evidence path missing: ${rel}`);
  }
  for(const [slice,spec] of Object.entries(CLOSURES)){
    const capability=capabilities.find(x=>x.id===spec.capability);
    check(Boolean(capability),`${slice}: repository capability missing`);
    if(spec.gapIds)check(JSON.stringify(capability?.closesGapIds||[])===JSON.stringify(spec.gapIds),`${slice}: closure map drift`);
    for(const rel of spec.evidencePaths)check(capability?.evidencePaths?.includes(rel),`${slice}: proof missing: ${rel}`);
  }

  check(gaps?.schemaVersion==='1.2.0','gap schema drift');
  check(gaps?.scope===EXPECTED_SCOPE,'gap scope must be reconciled post-#128');
  check(JSON.stringify(gaps?.closureClasses)===JSON.stringify(['repository-internal','external-evidence','independent-evidence']),'closure class registry drift');
  const canonical=gaps?.gaps||[],ids=canonical.map(x=>x.id),open=canonical.filter(x=>x.status==='open');
  check(new Set(ids).size===ids.length,'duplicate canonical gap id');
  check(publicRegistry?.schemaVersion===gaps?.schemaVersion,'public/canonical schema drift');
  check(publicRegistry?.scope===gaps?.scope,'public/canonical scope drift');
  check(JSON.stringify(publicRegistry?.gaps||[])===JSON.stringify(open),'public gap registry must equal canonical open gaps exactly');
  for(const [id,spec] of Object.entries(GAP_PROOF)){
    const gap=canonical.find(x=>x.id===id);
    check(Boolean(gap),`${id}: missing`);
    check(gap?.status==='closed',`${id}: closure regressed`);
    check(gap?.closureClass==='repository-internal',`${id}: closure class drift`);
    check(gap?.targetSlice===spec.slice,`${id}: target slice drift`);
    check(gap?.changePaths?.includes(spec.change),`${id}: change proof missing: ${spec.change}`);
    check(gap?.testPaths?.includes(spec.test),`${id}: test proof missing: ${spec.test}`);
    check(gap?.testPaths?.includes(spec.saturation),`${id}: saturation proof missing: ${spec.saturation}`);
    check((gap?.evidence||[]).length>0,`${id}: closure evidence missing`);
    check((gap?.limitations||[]).length>0,`${id}: residual limitation missing`);
    check(!(publicRegistry?.gaps||[]).some(x=>x.id===id),`${id}: closed gap leaked into public open registry`);
  }

  const blockerGroups=truth?.currentInternalBlockers||[],blockerIds=blockerGroups.map(x=>x.id),internalIds=blockerGroups.flatMap(x=>x.gapIds||[]);
  check(JSON.stringify(blockerIds)===JSON.stringify(EXPECTED_BLOCKERS),'internal blocker lattice must remain S4 -> S5 until GAP-020 closes');
  check(new Set(internalIds).size===internalIds.length,'internal gap assigned more than once');
  for(const group of blockerGroups)for(const id of group.gapIds||[]){const gap=canonical.find(x=>x.id===id);check(gap?.status==='open',`${id}: blocker not open`);check(gap?.closureClass==='repository-internal',`${id}: blocker class drift`);check(gap?.targetSlice===group.targetSlice,`${id}: blocker target drift`);}
  const openInternal=open.filter(x=>x.closureClass==='repository-internal').map(x=>x.id).sort();
  check(JSON.stringify([...internalIds].sort())===JSON.stringify(openInternal),'every open internal gap must be assigned exactly once to S4/S5');

  const external=truth?.externalEvidenceBoundaries||[],externalGapIds=external.flatMap(x=>x.gapIds||[]);
  check(JSON.stringify(external.map(x=>x.id))===JSON.stringify(EXPECTED_EXTERNAL),'E4 boundary census drift');
  check(new Set(externalGapIds).size===externalGapIds.length,'external gap assigned more than once');
  const openExternal=open.filter(x=>['external-evidence','independent-evidence'].includes(x.closureClass)).map(x=>x.id).sort();
  check(JSON.stringify([...externalGapIds].sort())===JSON.stringify(openExternal),'every open external/independent gap must map exactly once to E4');
  for(const boundary of external){
    check(boundary.status==='external-evidence-required',`${boundary.id}: repository cannot self-close E4`);
    check(['deployment','independent','repository-settings'].includes(boundary.authority),`${boundary.id}: external authority drift`);
    for(const id of boundary.gapIds||[]){const gap=canonical.find(x=>x.id===id);check(gap?.status==='open',`${id}: E4 gap must remain open`);check(['external-evidence','independent-evidence'].includes(gap?.closureClass),`${id}: E4 class drift`);}
  }
  for(const item of capabilities)for(const id of item.retiresAbsenceClaimFrom||[]){const gap=canonical.find(x=>x.id===id);check(gap?.status==='open'&&gap?.closureClass==='external-evidence',`${id}: retired absence claim must remain an external evidence boundary`);}
  const openText=JSON.stringify(open).toLowerCase();
  for(const fragment of truth?.staleOpenClaimFragments||[])check(!openText.includes(String(fragment).toLowerCase()),`stale open claim returned: ${fragment}`);
  return{ok:failures.length===0,failures,counts:{capabilities:capabilities.length,closedInternal:Object.keys(GAP_PROOF).length,completedS4:S4_COMPLETED.length,openInternal:openInternal.length,externalBoundaries:external.length}};
}
function expectMutationFailure(name,fixture,mutate){const copy=structuredClone(fixture);mutate(copy);const result=validateCapabilityTruth({...copy,pathExists:()=>true});assert.equal(result.ok,false,`${name}: mutation survived truth firewall`);return name;}
export function selfTestCapabilityTruth(fixture){return[
  expectMutationFailure('stale-foundation-anchor',fixture,x=>{x.truth.auditedAnchor.mainSha='stale';}),
  expectMutationFailure('stale-latest-reconciliation',fixture,x=>{x.truth.latestReconciliation.mainSha='stale';}),
  expectMutationFailure('premature-enterprise-candidate',fixture,x=>{x.truth.releaseClaim.enterpriseCandidate=true;}),
  expectMutationFailure('s4-progress-regression',fixture,x=>{x.truth.s4Progress.completedThrough='S4-A4';}),
  expectMutationFailure('a5-capability-missing',fixture,x=>{x.truth.repositoryCapabilities=x.truth.repositoryCapabilities.filter(c=>c.id!==CLOSURES.A5.capability);}),
  expectMutationFailure('a6-next-slice-lost',fixture,x=>{x.truth.s4Progress.nextSlice='S5';}),
  expectMutationFailure('gap020-premature-subtarget',fixture,x=>{x.gaps.gaps.find(g=>g.id==='GAP-020').targetSlice='S4-A6';x.publicRegistry.gaps.find(g=>g.id==='GAP-020').targetSlice='S4-A6';}),
  expectMutationFailure('public-gap020-drift',fixture,x=>{x.publicRegistry.gaps.find(g=>g.id==='GAP-020').targetSlice='S4-A6';}),
  expectMutationFailure('stale-s2-blocker',fixture,x=>{x.truth.currentInternalBlockers.unshift({id:'S2-CAUSALITY',gapIds:['GAP-017','GAP-018'],targetSlice:'S2'});}),
  expectMutationFailure('stale-s3-blocker',fixture,x=>{x.truth.currentInternalBlockers.unshift({id:'S3-RELIABILITY',gapIds:['GAP-010','GAP-019'],targetSlice:'S3'});}),
  expectMutationFailure('s2-capability-missing',fixture,x=>{x.truth.repositoryCapabilities=x.truth.repositoryCapabilities.filter(c=>c.id!==CLOSURES.S2.capability);}),
  expectMutationFailure('s3-capability-missing',fixture,x=>{x.truth.repositoryCapabilities=x.truth.repositoryCapabilities.filter(c=>c.id!==CLOSURES.S3.capability);}),
  expectMutationFailure('s2-gap-reopened',fixture,x=>{x.gaps.gaps.find(g=>g.id==='GAP-017').status='open';}),
  expectMutationFailure('s3-gap-reopened',fixture,x=>{x.gaps.gaps.find(g=>g.id==='GAP-010').status='open';}),
  expectMutationFailure('public-closed-gap-leak',fixture,x=>{x.publicRegistry.gaps.push(structuredClone(x.gaps.gaps.find(g=>g.id==='GAP-019')));}),
  expectMutationFailure('orphan-open-internal',fixture,x=>{x.gaps.gaps.push({id:'GAP-X',status:'open',closureClass:'repository-internal',targetSlice:'S4-A6'});}),
  expectMutationFailure('external-self-closure',fixture,x=>{x.truth.externalEvidenceBoundaries[0].status='repository-proven';}),
  expectMutationFailure('branch-protection-self-closure',fixture,x=>{x.gaps.gaps.find(g=>g.id==='GAP-022').status='closed';}),
  expectMutationFailure('evidence-path-loss',fixture,x=>{x.truth.repositoryCapabilities.find(c=>c.id===CLOSURES.A5.capability).evidencePaths=x.truth.repositoryCapabilities.find(c=>c.id===CLOSURES.A5.capability).evidencePaths.filter(p=>p!=='v3/browser-s4-a5-final-dom-a11y.py');}),
  expectMutationFailure('scope-regression',fixture,x=>{x.gaps.scope='old';})
];}
function main(){const fixture=loadCapabilityTruthFixture();const result=validateCapabilityTruth(fixture);assert.deepEqual(result.failures,[],result.failures.join('\n'));const selfTests=selfTestCapabilityTruth(fixture);console.log(JSON.stringify({ok:true,suite:'capability-truth-post-a5-main-reconciliation',foundationAnchor:fixture.truth.auditedAnchor,latestReconciliation:fixture.truth.latestReconciliation,closedSlices:['S1','S2','S3',...S4_COMPLETED],remainingInternal:['S4-A6','S5'],counts:result.counts,selfTests:selfTests.length,claimBoundary:fixture.truth.releaseClaim.claimBoundary}));}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main();
