import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {ALL_MUTATIONS,END_USER_QUESTIONS,MUTATION_FAMILIES,ONTOLOGY_AXES,baseline,evaluate,mutate} from './s4-a6-ux4-ontology-uiux-model.mjs';
let seed=0xa6f4e17d;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
assert.deepEqual(evaluate(baseline()),[]);const killed=Object.fromEntries(ALL_MUTATIONS.map(x=>[x.name,0]));const categoryKills=Object.fromEntries(Object.keys(MUTATION_FAMILIES).map(x=>[x,0]));let survivors=0;
for(let i=0;i<100000;i++){
 const role=rnd()<.16?'auditor':rnd()<.5?'user':'admin';const s=baseline({role,writeVisible:role!=='auditor',worklistCount:1+Math.floor(rnd()*34),recordsPerScreen:4+Math.floor(rnd()*8)});s.nativeActionableCount=s.worklistCount;
 const op=ALL_MUTATIONS[i%ALL_MUTATIONS.length];mutate(s,op.name);const failures=evaluate(s);if(failures.length){killed[op.name]++;categoryKills[op.category]++;}else survivors++;
}
assert.equal(survivors,0);assert.equal(Object.values(killed).filter(Boolean).length,ALL_MUTATIONS.length);assert.equal(ONTOLOGY_AXES.length,13);assert.equal(END_USER_QUESTIONS.length,13);
for(const [category,names] of Object.entries(MUTATION_FAMILIES))for(const name of names)assert.ok(killed[name]>0,`${category}:${name} survived`);
const report={ok:true,suite:'s4-a6-ux4-ontology-uiux-fuzz-100k',trials:100000,seed:'0xa6f4e17d',ontologyAxes:ONTOLOGY_AXES.length,endUserQuestions:END_USER_QUESTIONS.length,mutationFamilies:ALL_MUTATIONS.length,categories:Object.fromEntries(Object.entries(MUTATION_FAMILIES).map(([k,v])=>[k,v.length])),categoryKills,killed:100000,survivors,evidenceClass:'E2-model/source',claimBoundary:'Deterministic editorial, semantic, visual and minimum-complete ontological mutation evidence. It is not 100,000 browser sessions, representative-human usability, accessibility certification, deployment evidence, legal/compliance proof or enterprise-ready evidence.'};mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});writeFileSync(new URL('../artifacts/s4-a6-ux4-ontology-uiux-fuzz-100k.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
