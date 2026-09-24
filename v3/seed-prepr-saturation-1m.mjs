import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { loadSeedPrePrContract, validateSeedPrePrContract } from './seed-prepr.mjs';
const base=loadSeedPrePrContract(),clone=x=>structuredClone(x);
const mutations=[
  ['classification-authority',m=>{m.classification='current-product-authority';}],
  ['serial-slice',m=>{m.serialSlice=true;}],
  ['budget-down',m=>{m.semanticMutationBudget=100000;}],
  ['acceptance-weakened',m=>{m.rules.acceptance='exact-head-green';}],
  ['external-laundered',m=>{m.rules.externalEvidenceCannotBeSynthesized=false;}],
  ['duplicate-id',m=>{m.seeds[1].id=m.seeds[0].id;}],
  ['intent-empty',m=>{m.seeds[0].intent='';}],
  ['property-chain-flat',m=>{m.seeds[0].property='single statement';}],
  ['owner-missing',m=>{m.seeds[0].owners=['v3/does-not-exist.mjs'];}],
  ['dependency-missing',m=>{m.seeds[1].requires=['MISSING-SEED'];}],
  ['dependency-self',m=>{m.seeds[1].requires=[m.seeds[1].id];}],
  ['dependency-cycle',m=>{m.seeds[0].requires=['HOMEBOARDING-1'];}],
  ['falsifier-empty',m=>{m.seeds[2].falsifier.nearest=[];}],
  ['falsifier-budget',m=>{m.seeds[2].falsifier.semanticTrials=10000;}],
  ['done-runtime-false',m=>{m.seeds[3].done.runtimeReadback=false;}],
  ['done-head-false',m=>{m.seeds[3].done.exactHead=false;}],
  ['done-main-false',m=>{m.seeds[3].done.postMergeMain=false;}],
  ['boundary-empty',m=>{m.seeds[4].done.claimBoundary='';}],
  ['home-worst-lost',m=>{m.seeds[4].property=m.seeds[4].property.replace('bad e worst scenario','scenari');}],
  ['typing-deprecation-lost',m=>{m.seeds[0].intent=m.seeds[0].intent.replace('legacy','storico');m.seeds[0].property=m.seeds[0].property.replace('deprecazione','pulizia');}],
  ['demo-mechanical-lost',m=>{m.seeds[1].property=m.seeds[1].property.replace('derivata meccanicamente','compilata manualmente');}],
  ['standard-provenance-lost',m=>{m.seeds[2].property=m.seeds[2].property.replace('provenance/version/digest','versione');}],
  ['ep-admin-owner-collapse',m=>{m.seeds[3].owners=['v3/public/ui/epistemic-workspace-3-2.js'];}],
  ['home-reuse-cut',m=>{m.seeds[4].requires=['UI-OBJECT-TYPE-COMPRESSION-1'];}]
];
const baseline=validateSeedPrePrContract(base);assert.equal(baseline.ok,true,baseline.failures.join('\n'));
for(const [name,apply] of mutations){const m=clone(base);apply(m);const v=validateSeedPrePrContract(m,{checkFiles:false});assert.equal(v.ok,false,'survived direct mutant '+name);}
let seed=Number.parseInt(createHash('sha256').update(process.env.GITHUB_SHA||'SEED-PREPR-1').digest('hex').slice(0,8),16)>>>0;
const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const hits=new Map(mutations.map(([name])=>[name,0]));let killed=0,survivors=0;const trials=1_000_000;
for(let i=0;i<trials;i++){
  const m=clone(base),rounds=1+(rnd()%3),chosen=new Set();
  while(chosen.size<rounds)chosen.add(rnd()%mutations.length);
  for(const idx of chosen){const [name,apply]=mutations[idx];apply(m);hits.set(name,hits.get(name)+1);}
  const v=validateSeedPrePrContract(m,{checkFiles:false});if(v.ok){survivors++;break;}killed++;
}
assert.equal(killed,trials);assert.equal(survivors,0);for(const [name,count] of hits)assert.ok(count>0,'unhit mutation '+name);
console.log(JSON.stringify({ok:true,contract:'SEED-PREPR-1',trials,killed,survivors,families:mutations.length,familyHits:Object.fromEntries(hits),claimBoundary:'Deterministic semantic contract mutations; not one million browser sessions, implementations, human studies or deployment observations.'}));
