import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CANONICAL_SURFACES, CANONICAL_PROCEDURES, EXPECTED_OWNERS, makeBaselineState, validateSemanticState, validateUiuxConvergeContract } from './uiux-converge-0-model.mjs';

const model=JSON.parse(readFileSync(new URL('./uiux-converge-0-contract.json',import.meta.url),'utf8'));
const contractVerdict=validateUiuxConvergeContract(model);assert.equal(contractVerdict.ok,true,contractVerdict.errors.join('\n'));
const baseline=makeBaselineState(model);const baseVerdict=validateSemanticState(baseline);assert.equal(baseVerdict.ok,true,baseVerdict.errors.join('\n'));
const clone=value=>structuredClone(value),families=[];const add=(id,mutate)=>families.push({id,mutate});

for(const id of CANONICAL_SURFACES)add(`surface-missing:${id}`,s=>{s.surfaceIds=s.surfaceIds.filter(x=>x!==id);});
for(const id of CANONICAL_SURFACES)add(`owner-misbinding:${id}`,s=>{s.owners[id]=EXPECTED_OWNERS[id]==='stable-shell.js'?'procedure-frame.js':'stable-shell.js';});
for(const id of CANONICAL_SURFACES)add(`technical-first:${id}`,s=>{s.firstPlanes[id]='technical';});
for(const id of CANONICAL_SURFACES)add(`primary-competition:${id}`,s=>{s.primaryMax[id]=2;});
for(const id of CANONICAL_PROCEDURES)add(`procedure-missing:${id}`,s=>{s.procedureIds=s.procedureIds.filter(x=>x!==id);});
add('second-business-authority',s=>{s.secondBusinessAuthority=true;});
add('global-final-resolver',s=>{s.globalResolver=true;});
add('capability-closure-bypassed',s=>{s.capabilityClosure=false;});
add('c5-gate-bypassed',s=>{s.c5CompletionGate=false;});
add('semantic-order-reordered',s=>{s.semanticOrderInvariant=false;});
add('material-boundary-hidden',s=>{s.materialBoundary=false;});
add('human-authority-delegated',s=>{s.humanAuthority=false;});
add('evidence-equals-conclusion',s=>{s.evidenceNotConclusion=false;});
add('mapping-equals-conformity',s=>{s.mappingNotConformity=false;});
add('completed-equals-verified',s=>{s.completedNotVerified=false;});
add('rating-equals-probability',s=>{s.ratingNotProbability=false;});
add('internal-approval-equals-independent-assurance',s=>{s.internalApprovalNotIndependentAssurance=false;});
add('registry-card-wall',s=>{s.repeatedRecordsDefault='cards';});
add('ascii-directional',s=>{s.asciiDirectional=true;});
add('icon-system-regression',s=>{s.iconSystem='text-glyph';});
add('focus-regression',s=>{s.focusVisible=false;});
add('reduced-motion-regression',s=>{s.reducedMotion=false;});
add('mobile-overflow',s=>{s.overflow=true;});
add('description-hierarchy-inversion',s=>{s.descriptionWeightMax=800;});
add('control-target-regression',s=>{s.controlMin=24;});
add('density-regression',s=>{s.rowMax=96;});
add('motion-budget-regression',s=>{s.motionMax=600;});
assert.ok(families.length>=80,{families:families.length});

let x=0x243f6a88;const rnd=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
const trials=1000000,counts=new Array(families.length).fill(0);let survivors=0,harnessErrors=0;const samples=[];
for(let i=0;i<trials;i++){
  const index=rnd()%families.length,family=families[index],candidate=clone(baseline);counts[index]++;
  try{family.mutate(candidate);const verdict=validateSemanticState(candidate);if(verdict.ok){survivors++;if(samples.length<10)samples.push({i,family:family.id});}}catch(error){harnessErrors++;if(samples.length<10)samples.push({i,family:family.id,error:String(error?.message||error)});}
}
const uncovered=families.filter((_,i)=>counts[i]===0).map(x=>x.id);
assert.equal(uncovered.length,0,`uncovered e2e families: ${uncovered.join(',')}`);
assert.equal(harnessErrors,0,`harness errors: ${harnessErrors} ${JSON.stringify(samples)}`);
assert.equal(survivors,0,`e2e survivors: ${survivors} ${JSON.stringify(samples)}`);
const evidence={ok:true,seed:'ictc-uiux-converge-0-e2e-2026-09-12',trials,materialFamilies:families.length,killed:trials,survivors,harnessErrors,minTrialsPerFamily:Math.min(...counts),maxTrialsPerFamily:Math.max(...counts),digest:createHash('sha256').update(JSON.stringify({ids:families.map(x=>x.id),counts,trials})).digest('hex')};
console.log(JSON.stringify(evidence));
