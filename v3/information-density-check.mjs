import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {DENSITY_INTENTIONS,DENSITY_RISKS,DUPLICATION_FAMILIES,DUPLICATION_WITNESS_COUNT,evaluateDensityScenario,compactScenario} from './information-density-model.mjs';

const TOTAL=10000,FAMILIES=['normal','edge','stress','adversarial'],PER_FAMILY=2500;
const VIEWS=['home','processes','monitoring','incidents','grc','proof','epistemic','admin','ai-settings'];
const ROLES=['admin','user','auditor'],WIDTHS=[320,390,768,1280,1440],VOLUMES=['empty','sparse','normal','dense','stress'];
const pick=(items,r)=>items[Math.floor(r()*items.length)],chance=(r,p)=>r()<p;
function randomFor(seed){let state=seed>>>0;return()=>((state=(state*1664525+1013904223)>>>0)/0x100000000);}
function scenario(family,index){
  const r=randomFor((0x51ed270b^((index+1)*2654435761)^FAMILIES.indexOf(family))>>>0),width=pick(WIDTHS,r),volume=pick(VOLUMES,r),fit=width>=768||chance(r,.45),pressure=family==='normal'?.18:family==='edge'?.45:family==='stress'?.72:.88;
  const budget=family==='normal'?210:family==='edge'?190:180;
  return {family,index,view:pick(VIEWS,r),role:pick(ROLES,r),width,volume,
    primaryConceptCopies:chance(r,pressure)?2+(chance(r,.2)?1:0):1,
    controlRows:chance(r,pressure)?2+(chance(r,.15)?1:0):1,widthCanFitControls:fit,
    framingHeight:chance(r,pressure)?budget+40+Math.floor(r()*220):90+Math.floor(r()*90),framingBudget:budget,
    firstActionY:chance(r,pressure)?760+Math.floor(r()*360):420+Math.floor(r()*260),foldBudget:760,
    counterSpecificity:chance(r,pressure)?'generic':'canonical',attentionCount:chance(r,.55)?0:1+Math.floor(r()*8),zeroStateBadge:chance(r,pressure),
    proofReachable:!chance(r,pressure*.45),boundaryReachable:!chance(r,pressure*.45),humanAuthorityDistinct:!chance(r,pressure*.35),aiAuthorityDistinct:!chance(r,pressure*.35),
    frontstageTechnicalDetail:chance(r,pressure*.55),forceSingleLine:chance(r,pressure*.55),minTargetPx:chance(r,pressure*.45)?32+Math.floor(r()*12):44,
    roleSpecificOntology:chance(r,pressure*.35),presentationAuthorities:chance(r,pressure*.25)?2:1};
}
const mutants={
  forceSingleLine:x=>({...compactScenario(x),forceSingleLine:true,widthCanFitControls:false}),
  dropProof:x=>({...compactScenario(x),proofReachable:false}),
  dropBoundary:x=>({...compactScenario(x),boundaryReachable:false}),
  genericCounters:x=>({...compactScenario(x),counterSpecificity:'generic'}),
  keepZeroBadge:x=>({...compactScenario(x),attentionCount:0,zeroStateBadge:true}),
  copyContext:x=>({...compactScenario(x),primaryConceptCopies:2}),
  shrinkTargets:x=>({...compactScenario(x),minTargetPx:36}),
  collapseAuthority:x=>({...compactScenario(x),humanAuthorityDistinct:false}),
  roleOntology:x=>({...compactScenario(x),roleSpecificOntology:true}),
  secondRenderer:x=>({...compactScenario(x),presentationAuthorities:2}),
  keepTallFraming:x=>({...compactScenario(x),framingHeight:x.framingBudget+80}),
  verticalControls:x=>({...compactScenario(x),widthCanFitControls:true,controlRows:2}),
  technicalHeadline:x=>({...compactScenario(x),frontstageTechnicalDetail:true})
};
const familyCounts=Object.fromEntries(FAMILIES.map(x=>[x,0])),baselineRiskCounts=Object.fromEntries(DENSITY_RISKS.map(x=>[x,0])),mutantWitnesses=Object.fromEntries(Object.keys(mutants).map(x=>[x,0]));
const digest=createHash('sha256');let compactFailures=0;
for(const family of FAMILIES){for(let i=0;i<PER_FAMILY;i++){
  const input=scenario(family,i),before=evaluateDensityScenario(input),afterInput=compactScenario(input),after=evaluateDensityScenario(afterInput);
  familyCounts[family]++;for(const risk of before.risks)baselineRiskCounts[risk]++;if(!after.ok)compactFailures++;
  for(const [name,mutate] of Object.entries(mutants)){const result=evaluateDensityScenario(mutate(input));if(!result.ok)mutantWitnesses[name]++;}
  digest.update(JSON.stringify([input,before.risks,after.risks]));
}}
assert.equal(Object.values(familyCounts).reduce((a,b)=>a+b,0),TOTAL);
for(const family of FAMILIES)assert.equal(familyCounts[family],PER_FAMILY,`${family} scenario count drift`);
assert.equal(DENSITY_INTENTIONS.length,12,'density intention lattice drift');
assert.equal(new Set(DENSITY_INTENTIONS.map(x=>x.id)).size,DENSITY_INTENTIONS.length,'duplicate density intention id');
assert.ok(DUPLICATION_FAMILIES.length>=8,'duplication family audit collapsed');
assert.ok(DUPLICATION_WITNESS_COUNT>100,`duplication witness pressure too small: ${DUPLICATION_WITNESS_COUNT}`);
assert.equal(compactFailures,0,'canonical compaction left modeled risks unresolved');
for(const [risk,count] of Object.entries(baselineRiskCounts))assert.ok(count>0,`scenario generator never exercised ${risk}`);
for(const [name,count] of Object.entries(mutantWitnesses))assert.ok(count>0,`mutant not discriminated: ${name}`);
const out={ok:true,boundary:'Deterministic semantic/layout model pressure only; not 10,000 browser executions, human-comprehension evidence, legal conformity or certification.',total:TOTAL,perFamily:PER_FAMILY,familyCounts,intentions:DENSITY_INTENTIONS.map(x=>x.id),duplicationFamilies:DUPLICATION_FAMILIES.map(x=>x.id),duplicationPairWitnesses:DUPLICATION_WITNESS_COUNT,baselineRiskCounts,compactFailures,mutantWitnesses,replayDigest:digest.digest('hex')};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/information-density-saturation.json',import.meta.url),JSON.stringify(out,null,2));
console.log('information-density-check: ok',JSON.stringify(out));
