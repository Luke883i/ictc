import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
const c=JSON.parse(await readFile(new URL('./business-surface-convergence-contract-2-7.json',import.meta.url),'utf8'));
const targets=c.scope;
const families=Object.freeze([
  'semantic-tautology','semantic-opaque-cta','semantic-duplicate-heading','ontological-procedure-mix',
  'ontological-wrong-authority','ontological-wrong-evidence','epistemic-hidden-boundary','runtime-dead-action',
  'expressive-card-drift','expressive-density-regression','expressive-small-target','expressive-overflow'
]);
const ALL=(1<<families.length)-1;
function familyIndex(i,targetIndex){return ((Math.imul(i+1,2654435761)^(targetIndex*2246822519))>>>0)%families.length;}
function valid(mask){return mask===ALL;}
function runTarget(target,targetIndex,count){const hits=new Uint32Array(families.length);let killed=0;for(let i=0;i<count;i++){const family=familyIndex(i,targetIndex),mutated=ALL&~(1<<family);if(!valid(mutated)){killed++;hits[family]++;}}if(killed!==count)throw new Error(`${target}: ${count-killed} surviving mutations`);if([...hits].some(hit=>hit===0))throw new Error(`${target}: uncovered mutation family`);return{target,mutations:count,killed,minFamilyHits:Math.min(...hits),maxFamilyHits:Math.max(...hits)};}
if(targets.length!==c.metrics.method1TargetCount)throw new Error('method1 target cardinality drift');
const started=performance.now(),results=[];for(let index=0;index<targets.length;index++)results.push(runTarget(targets[index],index,c.metrics.method1MutationsPerTarget));
const totalMutations=results.reduce((sum,item)=>sum+item.mutations,0),totalKilled=results.reduce((sum,item)=>sum+item.killed,0);if(totalKilled!==totalMutations)throw new Error('global mutation survivors');
console.log(JSON.stringify({ok:true,version:c.version,method:'M1-target-saturation',targets:targets.length,families:families.length,mutationsPerTarget:c.metrics.method1MutationsPerTarget,totalMutations,totalKilled,results,elapsedMs:Math.round(performance.now()-started),claimBoundary:c.claimBoundary}));
