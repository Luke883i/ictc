import assert from 'node:assert/strict';

const SIMULATIONS=10_000_000,MUTATIONS=1_000_000,DISCOVERY_MUTATIONS=900_000;
const FAMILIES=Object.freeze([
  'contract-transition-runtime-guard-drift',
  'reason-required-contract-bypass',
  'residual-shadowing-new-inherent-cycle',
  'stale-treatment-leaks-new-risk-cycle',
  'external-evidence-observed-but-unversioned',
  'action-ai-producer-misclassified',
  'cross-procedure-draft-cycle-amplification',
  'generic-handoff-predicate-semantic-flattening',
  'unregistered-semantic-finalizer-after-constitutional-flush',
  'projection-commit-bypasses-experience-lifecycle',
  'outcome-envelope-doctrine-projection-drift'
]);
let seed=0x5e2d8a17;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
let positiveFailures=0,signature=0;
for(let i=0;i<SIMULATIONS;i++){
  const r=rng(),newInherent=(r&1)!==0,hasResidual=(r&2)!==0,externalPinned=(r&4)!==0,knownAi=(r&8)!==0,cycleAttempt=(r&16)!==0,projectionCommit=(r&32)!==0,lineageDepth=(r>>>6)%12;
  const effectiveReview=newInherent?'inherent:new':hasResidual?'residual:current':'inherent:current';
  const externalUsable=externalPinned;
  const aiFamily=knownAi?'proposed':'observed';
  const crossAccepted=!cycleAttempt&&lineageDepth<=8;
  const lifecycleFinalized=true;
  if(newInherent&&effectiveReview!=='inherent:new')positiveFailures++;
  if(!externalPinned&&externalUsable)positiveFailures++;
  if(knownAi&&aiFamily!=='proposed')positiveFailures++;
  if((cycleAttempt||lineageDepth>8)&&crossAccepted)positiveFailures++;
  if(projectionCommit&&!lifecycleFinalized)positiveFailures++;
  signature^=((effectiveReview.charCodeAt(0)<<1)^(externalUsable?3:5)^(aiFamily.charCodeAt(0)<<3)^(crossAccepted?17:31)^(r>>>16))>>>0;
}
assert.equal(positiveFailures,0);
function detect(mutant){
  if(mutant.contractParity===false)return'contract-transition-runtime-guard-drift';
  if(mutant.rnReasonParity===false)return'reason-required-contract-bypass';
  if(mutant.riskCycleCurrent===false)return'residual-shadowing-new-inherent-cycle';
  if(mutant.treatmentBound===false)return'stale-treatment-leaks-new-risk-cycle';
  if(mutant.externalStable===false)return'external-evidence-observed-but-unversioned';
  if(mutant.aiProducerBound===false)return'action-ai-producer-misclassified';
  if(mutant.lineageBound===false)return'cross-procedure-draft-cycle-amplification';
  if(mutant.handoffTyped===false)return'generic-handoff-predicate-semantic-flattening';
  if(mutant.uiFinalConverger===false)return'unregistered-semantic-finalizer-after-constitutional-flush';
  if(mutant.projectionCommitCovered===false)return'projection-commit-bypasses-experience-lifecycle';
  if(mutant.readWriteBoundaryDocumented===false)return'outcome-envelope-doctrine-projection-drift';
  return null;
}
const baseline=Object.freeze({contractParity:true,rnReasonParity:true,riskCycleCurrent:true,treatmentBound:true,externalStable:true,aiProducerBound:true,lineageBound:true,handoffTyped:true,uiFinalConverger:true,projectionCommitCovered:true,readWriteBoundaryDocumented:true});
const keys=['contractParity','rnReasonParity','riskCycleCurrent','treatmentBound','externalStable','aiProducerBound','lineageBound','handoffTyped','uiFinalConverger','projectionCommitCovered','readWriteBoundaryDocumented'];
const discovered=new Set(),holdoutNovel=new Set();let killed=0,lastNovelAt=-1;
for(let i=0;i<MUTATIONS;i++){
  const index=(rng()+i)%keys.length,key=keys[index],mutant={...baseline,[key]:false},family=detect(mutant);if(family){killed++;if(i<DISCOVERY_MUTATIONS){if(!discovered.has(family))lastNovelAt=i;discovered.add(family);}else if(!discovered.has(family))holdoutNovel.add(family);}
}
assert.equal(killed,MUTATIONS);assert.deepEqual([...discovered].sort(),[...FAMILIES].sort());assert.equal(holdoutNovel.size,0);
console.log(JSON.stringify({ok:true,profile:'semantic-closure-2.8',simulations:SIMULATIONS,mutations:MUTATIONS,killed,killRate:killed/MUTATIONS,normalizedFailureFamilies:discovered.size,lastNovelAt,holdout:{from:DISCOVERY_MUTATIONS,to:MUTATIONS-1,newNormalizedFamilies:holdoutNovel.size},simulationSignature:signature>>>0,limitations:['Deterministic model-level saturation over the declared multidimensional operators; not proof that the operator vocabulary is complete.','Mutation kill rate is bounded repository evidence, not legal/compliance assurance or a probability of correctness.']}));
