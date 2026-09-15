import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ENDUSER_PRIMITIVES, ENDUSER_SURFACE_GRAMMAR, LOCAL_COMPOSITION_OWNERS, PROCEDURE_WORKSPACE, SURFACE_ARCHETYPE_FAMILY } from './public/ui/native-semantic-lattice-3-2.js';
import { INFORMATION_ROLES, SURFACE_BLUEPRINTS } from './public/ui/semantic-composition-model.js';
import { NATIVE_GATES } from './current-gate-registry.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const contract=JSON.parse(readFileSync(path.join(HERE,'uiux-beauty-semantic-p5-new-main-contract.json'),'utf8'));
const p5=JSON.parse(readFileSync(path.join(HERE,'uiux-beauty-semantic-p5-contract.json'),'utf8'));
const workspace=readFileSync(path.join(HERE,'public/ui/native-workspace-3-2.js'),'utf8');
const runtime=readFileSync(path.join(HERE,'public/ui/semantic-composition-runtime.js'),'utf8');
const stateProjection=readFileSync(path.join(HERE,'public/ui/semantic-state-projection-p3.js'),'utf8');
const retired=readFileSync(path.join(HERE,'public/screenshot-semantic-closure-p3a.css'),'utf8');

const surfaces=[...p5.canonicalSurfaces];
const epistemicBoundary=Object.fromEntries(Object.entries(PROCEDURE_WORKSPACE).map(([id,row])=>[id,String(row.boundary||'')]));
const baseline=Object.freeze({
  mainSha:contract.baseObservation.mainSha,
  protectedOverlap:contract.p5TouchedFiles.filter(file=>contract.protectedNewMainFiles.includes(file)).length,
  surfaces:[...Object.keys(SURFACE_BLUEPRINTS)].sort(),
  grammar:[...Object.keys(ENDUSER_SURFACE_GRAMMAR)].sort(),
  archetypes:[...Object.keys(SURFACE_ARCHETYPE_FAMILY)].sort(),
  owners:[...Object.keys(LOCAL_COMPOSITION_OWNERS).filter(id=>id!=='navigation')].sort(),
  archetypeCount:new Set(Object.values(SURFACE_ARCHETYPE_FAMILY)).size,
  aiOwner:LOCAL_COMPOSITION_OWNERS['ai-settings'],
  camelAlias:Boolean(SURFACE_BLUEPRINTS.aiSettings||ENDUSER_SURFACE_GRAMMAR.aiSettings||LOCAL_COMPOSITION_OWNERS.aiSettings||SURFACE_ARCHETYPE_FAMILY.aiSettings),
  statePrimitive:ENDUSER_PRIMITIVES.includes('StateChip'),
  stateRole:INFORMATION_ROLES.includes('state'),
  stateTextStyle:stateProjection.includes("stateEncoding='text+style'"),
  statusProjected:stateProjection.includes("enduserPrimitive='StateChip'")&&stateProjection.includes('.grc-list .status-pill'),
  retiredMounted:workspace.includes('/screenshot-semantic-closure-p3a.css'),
  retiredExecutable:/\{[^}]*\}/s.test(retired),
  runtimeMutatesDom:['textContent=','innerHTML=','replaceChildren(','append(','prepend(','insertBefore(','remove()'].some(x=>runtime.includes(x)),
  nativeGates:[...NATIVE_GATES],
  p5Gate:NATIVE_GATES.indexOf('v3/uiux-beauty-semantic-p5-check.mjs'),
  p5OldMutation:NATIVE_GATES.indexOf('v3/uiux-beauty-semantic-p5-mutation-1m.mjs'),
  p3aGate:NATIVE_GATES.indexOf('v3/uiux-p3a-screenshot-closure-check.mjs'),
  c3Gates:contract.requiredPreservedNativeGates.map(g=>NATIVE_GATES.indexOf(g)),
  boundaries:epistemicBoundary
});

function sameSet(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
function validate(s){
 const reasons=[];
 if(s.mainSha!==contract.baseObservation.mainSha)reasons.push('stale-base');
 if(s.protectedOverlap!==0)reasons.push('protected-main-overlap');
 const expected=[...surfaces].sort();
 if(!sameSet(s.surfaces,expected)||!sameSet(s.grammar,expected)||!sameSet(s.archetypes,expected)||!sameSet(s.owners,expected))reasons.push('surface-identity');
 if(s.archetypeCount!==5)reasons.push('archetype-count');
 if(s.aiOwner!=='settings-1-8-fix.js'||s.camelAlias)reasons.push('ai-settings-authority');
 if(!s.statePrimitive||!s.stateRole||!s.stateTextStyle||!s.statusProjected)reasons.push('state-semantic-encoding');
 if(s.retiredMounted||s.retiredExecutable)reasons.push('retired-layer-resurrection');
 if(s.runtimeMutatesDom)reasons.push('global-runtime-local-mutation');
 if(s.p3aGate<0||s.p5Gate<=s.p3aGate||s.p5OldMutation<=s.p5Gate)reasons.push('p5-gate-order');
 if(s.c3Gates.some(i=>i<0))reasons.push('c3-gate-loss');
 for(const [id,boundary] of Object.entries(s.boundaries)){
   if(boundary.length<25||(!/[≠]|non equivale/i.test(boundary)))reasons.push(`epistemic-boundary:${id}`);
 }
 return reasons;
}
assert.deepEqual(validate(baseline),[],`candidate baseline invalid: ${validate(baseline).join(',')}`);

const operators=[
 ['stale_main_sha',s=>{s.mainSha='bd7a2cdc11f5aeff87839a6fa70d0f05ae71277d';}],
 ['protected_file_overlap',s=>{s.protectedOverlap=1;}],
 ['drop_surface_blueprint',s=>{s.surfaces=s.surfaces.slice(1);}],
 ['reintroduce_camel_alias',s=>{s.camelAlias=true;}],
 ['owner_fallback',s=>{s.aiOwner='semantic-composition-runtime.js';}],
 ['drop_surface_grammar',s=>{s.grammar=s.grammar.slice(0,-1);}],
 ['drop_archetype_mapping',s=>{s.archetypes=s.archetypes.slice(1);}],
 ['collapse_archetypes',s=>{s.archetypeCount=4;}],
 ['drop_local_owner',s=>{s.owners=s.owners.slice(1);}],
 ['remove_state_primitive',s=>{s.statePrimitive=false;}],
 ['remove_state_role',s=>{s.stateRole=false;}],
 ['state_color_only',s=>{s.stateTextStyle=false;}],
 ['status_outside_projection',s=>{s.statusProjected=false;}],
 ['remount_screenshot_layer',s=>{s.retiredMounted=true;}],
 ['restore_executable_retired_css',s=>{s.retiredExecutable=true;}],
 ['global_runtime_dom_mutation',s=>{s.runtimeMutatesDom=true;}],
 ['drop_p3a_gate',s=>{s.p3aGate=-1;}],
 ['p5_before_p3a',s=>{s.p5Gate=Math.max(0,s.p3aGate-1);}],
 ['drop_old_p5_mutation',s=>{s.p5OldMutation=-1;}],
 ['drop_c3_capacity_check',s=>{s.c3Gates[0]=-1;}],
 ['drop_c3_capacity_mutation',s=>{s.c3Gates[1]=-1;}],
 ['monitoring_observed_equals_applicable',s=>{s.boundaries.monitoring='Fonte osservata e obbligo applicabile.';}],
 ['incidents_internal_equals_external',s=>{s.boundaries.incidents='Registrazione interna e notifica esterna.';}],
 ['objects_inventory_equals_complete',s=>{s.boundaries.objects='Inventario completo e applicabile.';}],
 ['coverage_mapping_equals_compliance',s=>{s.boundaries.coverage='Mapping equivale a conformità.';}],
 ['actions_completed_equals_verified',s=>{s.boundaries.actions='Completato equivale a verificato.';}],
 ['risks_rating_equals_probability',s=>{s.boundaries.risks='Rating equivale a probabilità oggettiva.';}],
 ['assurance_internal_equals_certified',s=>{s.boundaries.assurance='Approvazione interna equivale a certificazione indipendente.';}]
];

function clone(){return{...baseline,surfaces:[...baseline.surfaces],grammar:[...baseline.grammar],archetypes:[...baseline.archetypes],owners:[...baseline.owners],nativeGates:[...baseline.nativeGates],c3Gates:[...baseline.c3Gates],boundaries:{...baseline.boundaries}};}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
const seed=contract.campaign.seedUint32>>>0,r=rng(seed),counts=Object.fromEntries(operators.map(([id])=>[id,0])),killReasons={};
let survivors=0,multiDefectTrials=0,maxOperators=0;
for(let i=0;i<contract.campaign.trials;i++){
 const s=clone();
 let n=1+(r()<.42?1:0)+(r()<.13?1:0)+(r()<.025?1:0); if(n>1)multiDefectTrials++; if(n>maxOperators)maxOperators=n;
 const chosen=new Set();
 while(chosen.size<n)chosen.add(Math.floor(r()*operators.length));
 for(const idx of chosen){const [id,mutate]=operators[idx];counts[id]++;mutate(s);}
 const reasons=validate(s);
 if(!reasons.length)survivors++;
 for(const reason of new Set(reasons))killReasons[reason]=(killReasons[reason]||0)+1;
}
for(const [id,count] of Object.entries(counts))assert.ok(count>0,`mutation operator not sampled: ${id}`);
assert.equal(survivors,contract.campaign.expectedSurvivors,`survivors=${survivors}`);
const digest=createHash('sha256').update(JSON.stringify({modelId:contract.modelId,mainSha:contract.baseObservation.mainSha,seed:contract.campaign.seedHex,trials:contract.campaign.trials,multiDefectTrials,counts,killReasons,survivors})).digest('hex');
const report={schemaVersion:'1.0.0',modelId:contract.modelId,baseObservation:contract.baseObservation,seed:contract.campaign.seedHex,seedUint32:seed,trials:contract.campaign.trials,multiDefectTrials,maxOperators,operatorCount:operators.length,operatorCounts:counts,killReasons,falsification:{survivors,killRate:1-survivors/contract.campaign.trials},newMainProtection:{prs:contract.protectedNewMainPrs,protectedFileCount:contract.protectedNewMainFiles.length,p5TouchedFileCount:contract.p5TouchedFiles.length,overlap:baseline.protectedOverlap,preservedNativeC3Gates:contract.requiredPreservedNativeGates},digest,claimBoundary:contract.claimBoundary};
mkdirSync(path.join(HERE,'..','artifacts'),{recursive:true});
writeFileSync(path.join(HERE,'..','artifacts','uiux-beauty-semantic-p5-new-main-mutation-1m.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,modelId:report.modelId,baseMain:report.baseObservation.mainSha,seed:report.seed,trials:report.trials,multiDefectTrials:report.multiDefectTrials,operators:report.operatorCount,survivors,digest,protectedNewMainOverlap:report.newMainProtection.overlap,claimBoundary:report.claimBoundary}));
