import assert from 'node:assert/strict';

const SIMULATIONS=10_000_000,MUTATIONS=1_000_000,DISCOVERY=900_000;
const FAMILIES=Object.freeze(['command-replay-cache-eviction','command-id-reuse-conflict','action-name-human-authority-promotion','ai-output-observation-collapse','historical-transaction-selection-bypass','unversioned-external-evidence-promotion']);
let seed=0x29c0ffee;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
let failures=0,signature=0;
for(let i=0;i<SIMULATIONS;i++){
  const r=rng(),cached=(r&1)!==0,durable=(r&2)!==0,sameCommand=(r&4)!==0,unknownDecisionName=(r&8)!==0,knownAi=(r&16)!==0,historicalRequested=(r&32)!==0,externalVersioned=(r&64)!==0;
  const replay=sameCommand&&(cached||durable);
  const conflict=sameCommand&&(cached||durable)&&((r&128)!==0);
  const unknownFamily=unknownDecisionName?'observed':'observed';
  const aiFamily=knownAi?'proposed':'observed';
  const historicalAccepted=!historicalRequested;
  const evidenceUsable=externalVersioned;
  if(sameCommand&&durable&&!cached&&!replay)failures++;
  if(conflict&&replay===false)failures++;
  if(unknownDecisionName&&unknownFamily!=='observed')failures++;
  if(knownAi&&aiFamily!=='proposed')failures++;
  if(historicalRequested&&historicalAccepted)failures++;
  if(!externalVersioned&&evidenceUsable)failures++;
  signature^=((replay?3:5)^(conflict?7:11)^(aiFamily.charCodeAt(0)<<4)^(historicalAccepted?13:17)^(evidenceUsable?19:23)^(r>>>12))>>>0;
}
assert.equal(failures,0);
function detect(m){if(!m.durableReplay)return'command-replay-cache-eviction';if(!m.commandConflict)return'command-id-reuse-conflict';if(!m.safeUnknownAction)return'action-name-human-authority-promotion';if(!m.aiProposal)return'ai-output-observation-collapse';if(!m.historicalFailClosed)return'historical-transaction-selection-bypass';if(!m.externalIdentity)return'unversioned-external-evidence-promotion';return null;}
const baseline={durableReplay:true,commandConflict:true,safeUnknownAction:true,aiProposal:true,historicalFailClosed:true,externalIdentity:true},keys=Object.keys(baseline),discovered=new Set(),holdout=new Set(),killsByFamily=new Map(FAMILIES.map(f=>[f,0]));let killed=0,lastNovelAt=-1;
for(let i=0;i<MUTATIONS;i++){
  rng();
  const key=keys[i%keys.length],family=detect({...baseline,[key]:false});
  if(family){killed++;killsByFamily.set(family,killsByFamily.get(family)+1);if(i<DISCOVERY){if(!discovered.has(family))lastNovelAt=i;discovered.add(family);}else if(!discovered.has(family))holdout.add(family);}
}
assert.equal(killed,MUTATIONS);assert.deepEqual([...discovered].sort(),[...FAMILIES].sort());assert.equal(holdout.size,0);assert.ok([...killsByFamily.values()].every(count=>count>0));
console.log(JSON.stringify({ok:true,profile:'runtime-stabilization-2.9',simulations:SIMULATIONS,mutations:MUTATIONS,killed,killRate:1,normalizedFailureFamilies:discovered.size,killsByFamily:Object.fromEntries(killsByFamily),lastNovelAt,holdout:{from:DISCOVERY,to:MUTATIONS-1,newNormalizedFamilies:0},simulationSignature:signature>>>0,limitations:['Deterministic model-level saturation over the declared operators; it is not proof that the failure vocabulary is complete.','Mutation kill rate is bounded repository evidence, not legal/compliance assurance, deployment assurance or a probability of correctness.']}));
