import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { makeBaselineState, validateSemanticState, validateUiuxConvergeContract } from './uiux-converge-0-model.mjs';

const model=JSON.parse(readFileSync(new URL('./uiux-converge-0-contract.json',import.meta.url),'utf8'));
assert.equal(validateUiuxConvergeContract(model).ok,true,validateUiuxConvergeContract(model).errors.join('\n'));
const baseline=makeBaselineState(model);
assert.equal(validateSemanticState(baseline).ok,true,validateSemanticState(baseline).errors.join('\n'));

const clone=value=>structuredClone(value);
const families=[];
const add=(id,mutate)=>families.push({id,mutate});
add('row-height-bloat',s=>{s.rowMax=84;});
add('control-target-too-small',s=>{s.controlMin=28;});
add('description-overbold',s=>{s.descriptionWeightMax=700;});
add('motion-too-slow',s=>{s.motionMax=420;});
add('reduced-motion-missing',s=>{s.reducedMotion=false;});
add('focus-ring-missing',s=>{s.focusVisible=false;});
add('status-color-only',s=>{s.statusColorOnly=true;});
add('mobile-horizontal-overflow',s=>{s.overflow=true;});
add('registry-card-wall',s=>{s.repeatedRecordsDefault='card-grid';});
add('ascii-icon-system',s=>{s.iconSystem='ascii';});
add('ascii-directional-action',s=>{s.asciiDirectional=true;});
add('material-boundary-hidden',s=>{s.materialBoundary=false;});
add('long-description-bold-allowed',s=>{s.longDescriptionBoldForbidden=false;});
add('responsive-semantic-reorder',s=>{s.semanticOrderInvariant=false;});
add('late-global-resolver',s=>{s.globalResolver=true;});
add('legacy-presentation-resurrection',s=>{s.legacyPresentationRetired=false;});
add('projected-object-role-loss',s=>{s.projectedObjectRoles=s.projectedObjectRoles.slice(1);});
add('surface-object-profile-loss',s=>{s.projectedObjectProfiles.monitoring=s.projectedObjectProfiles.monitoring.filter(x=>x!=='record');});
for(const id of ['home','monitoring','incidents','objects','coverage','actions','risks','assurance','admin','epistemic','proof','ai-settings'])add(`primary-action-competition:${id}`,s=>{s.primaryMax[id]=2;});
for(const id of ['home','processes','monitoring','actions','proof','epistemic','admin','ai-settings'])add(`technical-first:${id}`,s=>{s.firstPlanes[id]='technical';});
for(const [id,wrong] of [['home','procedure-frame.js'],['processes','stable-shell.js'],['monitoring','grc-workspace-3-2.js'],['incidents','grc-workspace-3-2.js'],['objects','procedure-frame.js'],['coverage','proof-workspace-3-2.js'],['actions','admin-workspace-3-2.js'],['risks','epistemic-workspace-3-2.js'],['assurance','stable-shell.js'],['proof','epistemic-workspace-3-2.js'],['epistemic','proof-workspace-3-2.js'],['admin','stable-shell.js']])add(`wrong-owner:${id}`,s=>{s.owners[id]=wrong;});
assert.ok(families.length>=40,{families:families.length});

let x=0x9e3779b9;
const rnd=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
const trials=100000,counts=new Array(families.length).fill(0),survivors=[];
for(let i=0;i<trials;i++){
  const index=rnd()%families.length,family=families[index],candidate=clone(baseline);counts[index]++;family.mutate(candidate);const verdict=validateSemanticState(candidate);if(verdict.ok&&survivors.length<20)survivors.push({i,family:family.id});
}
const uncovered=families.filter((_,i)=>counts[i]===0).map(x=>x.id);
assert.equal(uncovered.length,0,`uncovered style families: ${uncovered.join(',')}`);
assert.equal(survivors.length,0,`style survivors: ${JSON.stringify(survivors)}`);
const evidence={ok:true,seed:'ictc-uiux-converge-0-style-2026-09-12',trials,materialFamilies:families.length,killed:trials,survivors:0,harnessErrors:0,minTrialsPerFamily:Math.min(...counts),maxTrialsPerFamily:Math.max(...counts),digest:createHash('sha256').update(JSON.stringify({ids:families.map(x=>x.id),counts,trials})).digest('hex')};
console.log(JSON.stringify(evidence));
