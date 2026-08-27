import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const defaultRoot=path.resolve(here,'..');
const load=(root,rel)=>JSON.parse(readFileSync(path.join(root,rel),'utf8'));
const clone=value=>structuredClone(value);

export function validateCapabilityTruth({truth,releaseIdentity,documentationManifest,gaps,publicRegistry,root=defaultRoot,pathExists=rel=>existsSync(path.join(root,rel))}){
  const failures=[];
  const check=(condition,message)=>{if(!condition)failures.push(message);};
  check(truth?.schemaVersion==='1.0.0','capability truth schema drift');
  check(truth?.authority==='capability-truth','capability truth authority drift');
  check(releaseIdentity?.releaseStage==='candidate','release identity must remain candidate in S0');
  check(truth?.releaseClaim?.stage===releaseIdentity?.releaseStage,'release claim must match release identity');
  check(truth?.releaseClaim?.classification==='truth-current','S0 classification must be truth-current');
  check(truth?.releaseClaim?.enterpriseCandidate===false,'S0 must not claim enterprise-candidate');
  check(truth?.releaseClaim?.enterpriseReady===false,'S0 must not claim enterprise-ready');
  const presentation=documentationManifest?.versionAxes?.uiPresentation;
  check(presentation?.value==='local-owners','presentation authority must remain local-owners');
  check(presentation?.classification==='canonical-distributed-presentation','presentation classification drift');

  const capabilities=truth?.repositoryCapabilities||[];
  check(capabilities.length>=8,'repository capability census unexpectedly small');
  const capabilityIds=capabilities.map(item=>item.id);
  check(new Set(capabilityIds).size===capabilityIds.length,'duplicate repository capability id');
  for(const item of capabilities){
    check(item.status==='repository-proven',`${item.id}: invalid repository capability status`);
    check(Array.isArray(item.evidencePaths)&&item.evidencePaths.length>=2,`${item.id}: insufficient repository evidence paths`);
    check(Boolean(String(item.residualBoundary||'').trim()),`${item.id}: residual boundary missing`);
    for(const rel of item.evidencePaths||[])check(pathExists(rel),`${item.id}: evidence path missing: ${rel}`);
  }

  const canonicalGaps=gaps?.gaps||[], open=canonicalGaps.filter(gap=>gap.status==='open');
  check(gaps?.schemaVersion==='1.2.0','gap schema must be 1.2.0 after S0 truth closure');
  check(Array.isArray(gaps?.closureClasses)&&gaps.closureClasses.includes('repository-internal')&&gaps.closureClasses.includes('external-evidence')&&gaps.closureClasses.includes('independent-evidence'),'gap closure classes incomplete');
  const ids=canonicalGaps.map(g=>g.id);check(new Set(ids).size===ids.length,'duplicate canonical gap id');
  const publicIds=(publicRegistry?.gaps||[]).map(g=>g.id),openIds=open.map(g=>g.id);
  check(JSON.stringify(publicIds)===JSON.stringify(openIds),'public gap registry must equal canonical open-gap order');
  check(publicRegistry?.schemaVersion===gaps?.schemaVersion,'public/canonical gap schema mismatch');
  for(const gap of open){
    check(['repository-internal','external-evidence','independent-evidence'].includes(gap.closureClass),`${gap.id}: open gap closureClass missing/invalid`);
    check(Boolean(gap.targetSlice),`${gap.id}: targetSlice missing`);
  }
  const openText=JSON.stringify(open).toLowerCase();
  for(const fragment of truth?.staleOpenClaimFragments||[])check(!openText.includes(String(fragment).toLowerCase()),`stale open claim returned: ${fragment}`);

  const blockerGroups=truth?.currentInternalBlockers||[];
  const blockerIds=blockerGroups.map(x=>x.id);
  check(JSON.stringify(blockerIds)===JSON.stringify(['S1-WORKLIST','S2-CAUSALITY','S3-RELIABILITY','S4-ASSURANCE-CONTRACTION','S5-CANDIDATE-SEAL']),'internal blocker lattice drift');
  const internalGapIds=blockerGroups.flatMap(x=>x.gapIds||[]);
  check(new Set(internalGapIds).size===internalGapIds.length,'internal gap assigned to multiple slices');
  for(const group of blockerGroups)for(const id of group.gapIds||[]){const gap=canonicalGaps.find(g=>g.id===id);check(Boolean(gap),`${group.id}: missing gap ${id}`);check(gap?.status==='open',`${id}: internal blocker must remain open`);check(gap?.closureClass==='repository-internal',`${id}: internal blocker closure class drift`);check(gap?.targetSlice===group.targetSlice,`${id}: target slice mismatch`);}

  const external=truth?.externalEvidenceBoundaries||[];
  const externalIds=external.map(x=>x.id);
  check(JSON.stringify(externalIds)===JSON.stringify(['E4-SCANNER-EFFECTIVENESS','E4-IDENTITY-EFFECTIVENESS','E4-HUMAN-VALIDATION','E4-OBSERVABILITY-ALERTING','E4-BRANCH-PROTECTION']),'external evidence boundary census drift');
  for(const boundary of external){
    check(boundary.status==='external-evidence-required',`${boundary.id}: external boundary cannot self-close in repository`);
    check(['deployment','independent','repository-settings'].includes(boundary.authority),`${boundary.id}: invalid external authority`);
    for(const id of boundary.gapIds||[]){const gap=canonicalGaps.find(g=>g.id===id);check(Boolean(gap),`${boundary.id}: missing gap ${id}`);check(gap?.status==='open',`${id}: external boundary must remain visible/open`);check(['external-evidence','independent-evidence'].includes(gap?.closureClass),`${id}: external boundary misclassified as repository-internal`);}
  }
  const retiredMappings=capabilities.flatMap(item=>(item.retiresAbsenceClaimFrom||[]).map(gapId=>({capability:item.id,gapId})));
  for(const mapping of retiredMappings){const gap=canonicalGaps.find(g=>g.id===mapping.gapId);check(Boolean(gap),`${mapping.capability}: mapped legacy gap missing`);check(gap?.status==='open',`${mapping.gapId}: residual evidence boundary should remain visible`);check(gap?.closureClass==='external-evidence',`${mapping.gapId}: legacy absence claim must converge to external evidence, not repository absence`);}

  return {ok:failures.length===0,failures,counts:{capabilities:capabilities.length,openGaps:open.length,internalGapIds:internalGapIds.length,externalBoundaries:external.length}};
}

function expectMutationFailure(name,base,mutate){const fixture=clone(base);mutate(fixture);const result=validateCapabilityTruth({...fixture,pathExists:()=>true});assert.equal(result.ok,false,`${name}: mutation survived truth firewall`);return name;}

function main(){
  const root=process.env.ICTC_TRUTH_ROOT?path.resolve(process.env.ICTC_TRUTH_ROOT):defaultRoot;
  const fixture={truth:load(root,'v3/capability-truth.json'),releaseIdentity:load(root,'v3/release-identity.json'),documentationManifest:load(root,'docs/documentation-manifest.json'),gaps:load(root,'v3/gaps.json'),publicRegistry:load(root,'v3/public/gap-registry.json'),root};
  const result=validateCapabilityTruth(fixture);assert.deepEqual(result.failures,[],result.failures.join('\n'));
  const killed=[
    expectMutationFailure('premature-enterprise-candidate',fixture,x=>{x.truth.releaseClaim.enterpriseCandidate=true;}),
    expectMutationFailure('external-self-closure',fixture,x=>{x.truth.externalEvidenceBoundaries[0].status='repository-proven';}),
    expectMutationFailure('missing-capability-proof',fixture,x=>{x.truth.repositoryCapabilities[0].evidencePaths=[];}),
    expectMutationFailure('public-gap-drift',fixture,x=>{x.publicRegistry.gaps=x.publicRegistry.gaps.slice(1);}),
    expectMutationFailure('stale-absence-claim',fixture,x=>{x.gaps.gaps.find(g=>g.id==='GAP-007').title='File acquisiti senza quarantena e scansione malware server-side non implementate';}),
    expectMutationFailure('presentation-authority-regression',fixture,x=>{x.documentationManifest.versionAxes.uiPresentation.value='3.4';}),
    expectMutationFailure('internal-blocker-erasure',fixture,x=>{x.truth.currentInternalBlockers=x.truth.currentInternalBlockers.slice(1);})
  ];
  console.log(JSON.stringify({ok:true,suite:'capability-truth-s0',...result.counts,mutationFamilies:killed.length,killed,claimBoundary:fixture.truth.releaseClaim.claimBoundary}));
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
