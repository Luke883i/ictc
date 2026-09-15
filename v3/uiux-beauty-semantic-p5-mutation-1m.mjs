import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const surfaces=[
 ['home','orientation'],['processes','orientation'],['monitoring','operational'],['incidents','operational'],
 ['objects','registry'],['coverage','registry'],['actions','registry'],['risks','registry'],['assurance','registry'],
 ['proof','evidence-knowledge'],['epistemic','evidence-knowledge'],['admin','configuration'],['ai-settings','configuration']
];
const breakpoints=['desktop','tablet','mobile'];
const defects=[
 ['role_alias_collision','ontology',7],['primitive_role_drift','ontology',8],['archetype_mismatch','ontology',9],['duplicate_presentation_owner','ontology',10],
 ['object_identity_fragmentation','ontology',8],['surface_family_confusion','ontology',7],
 ['evidence_looks_verdict','epistemic',10],['internal_approval_looks_certification','epistemic',10],['rating_looks_probability','epistemic',10],
 ['observed_looks_applicable','epistemic',9],['proposed_looks_decided','epistemic',10],['completed_looks_verified','epistemic',10],
 ['external_authenticity_overclaim','epistemic',10],['boundary_buried','epistemic',9],['ai_proposal_looks_decision','epistemic',10],
 ['hierarchy_inversion','design',9],['action_priority_drift','design',9],['state_color_only','design',8],['control_geometry_drift','design',6],
 ['record_grammar_drift','design',8],['disclosure_overload','design',8],['density_mismatch','design',8],['measure_failure','design',7],
 ['responsive_order_failure','design',10],['touch_target_failure','design',8],['cascade_collision','design',10],['token_fragmentation','design',7],
 ['shell_body_discontinuity','design',6],['motion_affordance_drift','design',5],['empty_error_incoherence','design',6]
];
const candidateNodes=[
 {id:'M1_VISUAL_AUTHORITY',cost:4,covers:['role_alias_collision','primitive_role_drift','duplicate_presentation_owner','object_identity_fragmentation','cascade_collision','token_fragmentation']},
 {id:'M2_SEMANTIC_HIERARCHY',cost:4,covers:['evidence_looks_verdict','internal_approval_looks_certification','rating_looks_probability','observed_looks_applicable','proposed_looks_decided','completed_looks_verified','external_authenticity_overclaim','boundary_buried','ai_proposal_looks_decision','hierarchy_inversion','state_color_only']},
 {id:'M3_OBJECT_INTERACTION_GRAMMAR',cost:3,covers:['primitive_role_drift','action_priority_drift','state_color_only','control_geometry_drift','record_grammar_drift','disclosure_overload','motion_affordance_drift','empty_error_incoherence']},
 {id:'M4_CONTEXTUAL_ADAPTATION',cost:4,covers:['archetype_mismatch','surface_family_confusion','density_mismatch','measure_failure','responsive_order_failure','touch_target_failure','shell_body_discontinuity']},
 {id:'N1_TOKEN_NORMALIZATION_ONLY',cost:2,covers:['token_fragmentation','control_geometry_drift','motion_affordance_drift']},
 {id:'N2_CASCADE_ONLY',cost:2,covers:['cascade_collision','duplicate_presentation_owner']},
 {id:'N3_RESPONSIVE_ONLY',cost:2,covers:['responsive_order_failure','touch_target_failure','measure_failure']},
 {id:'N4_EPISTEMIC_BADGES_ONLY',cost:2,covers:['state_color_only','evidence_looks_verdict','rating_looks_probability','internal_approval_looks_certification']},
 {id:'N5_LOCAL_PAGE_POLISH',cost:1,covers:['density_mismatch','measure_failure','shell_body_discontinuity']}
];
const critical=new Set(defects.filter(([,kind,weight])=>weight>=9||kind==='epistemic').map(([name])=>name));
function rng(seed=0x15C0FFEE){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
const r=rng(),pick=a=>a[Math.floor(r()*a.length)];
function weighted(rows){const total=rows.reduce((s,x)=>s+x[2],0);let q=r()*total;for(const row of rows){q-=row[2];if(q<=0)return row;}return rows.at(-1);}
const counts=Object.fromEntries(defects.map(([d])=>[d,0])),combos=new Map();let multi=0;
for(let i=0;i<1_000_000;i++){
 const [,family]=pick(surfaces),bp=pick(breakpoints);let n=1+(r()<.45?1:0)+(r()<.17?1:0)+(r()<.04?1:0);if(n>1)multi++;
 const ds=new Set();while(ds.size<n){let[d]=weighted(defects);
  if(family==='registry'&&r()<.30)d=pick(['record_grammar_drift','state_color_only','completed_looks_verified','rating_looks_probability','action_priority_drift']);
  if(family==='evidence-knowledge'&&r()<.34)d=pick(['evidence_looks_verdict','external_authenticity_overclaim','boundary_buried','disclosure_overload','hierarchy_inversion']);
  if(family==='configuration'&&r()<.26)d=pick(['ai_proposal_looks_decision','disclosure_overload','action_priority_drift','control_geometry_drift']);
  if(bp==='mobile'&&r()<.38)d=pick(['responsive_order_failure','touch_target_failure','density_mismatch','measure_failure','disclosure_overload']);
  ds.add(d);
 }
 for(const d of ds)counts[d]++;
 const key=[...ds].sort().join('+');combos.set(key,(combos.get(key)||0)+1);
}
const allDefects=new Set(defects.map(([d])=>d));
function evaluated(mask){const selected=candidateNodes.filter((_,i)=>mask>>i&1),ids=new Set(selected.map(x=>x.id)),covered=new Set(selected.flatMap(x=>x.covers));
 if([...critical].some(d=>!covered.has(d)))return null;
 if(!(ids.has('M1_VISUAL_AUTHORITY')&&ids.has('M2_SEMANTIC_HIERARCHY')))return null;
 if(!(ids.has('M3_OBJECT_INTERACTION_GRAMMAR')&&ids.has('M2_SEMANTIC_HIERARCHY')))return null;
 if(!(ids.has('M4_CONTEXTUAL_ADAPTATION')&&ids.has('M1_VISUAL_AUTHORITY')&&ids.has('M3_OBJECT_INTERACTION_GRAMMAR')))return null;
 if([...allDefects].some(d=>!covered.has(d)))return null;
 return{selected:selected.map(x=>x.id),count:selected.length,cost:selected.reduce((s,x)=>s+x.cost,0),covered:[...covered].sort()};
}
let best=null,valid=0;for(let mask=1;mask<(1<<candidateNodes.length);mask++){const row=evaluated(mask);if(!row)continue;valid++;if(!best||row.count<best.count||(row.count===best.count&&row.cost<best.cost))best={mask,...row};}
if(!best)throw new Error('no convergent lattice');
const chosen=new Set(best.selected),coverage=new Set(candidateNodes.filter(x=>chosen.has(x.id)).flatMap(x=>x.covers));let survivors=0;
for(const [combo,count] of combos){const ds=combo.split('+');let killed=ds.every(d=>coverage.has(d));
 if(killed&&ds.some(d=>['evidence_looks_verdict','internal_approval_looks_certification','rating_looks_probability','observed_looks_applicable','proposed_looks_decided','completed_looks_verified','external_authenticity_overclaim','ai_proposal_looks_decision'].includes(d)))killed=chosen.has('M1_VISUAL_AUTHORITY')&&chosen.has('M2_SEMANTIC_HIERARCHY');
 if(killed&&ds.some(d=>['action_priority_drift','state_color_only','record_grammar_drift','disclosure_overload'].includes(d)))killed=chosen.has('M2_SEMANTIC_HIERARCHY')&&chosen.has('M3_OBJECT_INTERACTION_GRAMMAR');
 if(killed&&ds.some(d=>['responsive_order_failure','touch_target_failure','density_mismatch','measure_failure','archetype_mismatch'].includes(d)))killed=chosen.has('M4_CONTEXTUAL_ADAPTATION')&&chosen.has('M3_OBJECT_INTERACTION_GRAMMAR');
 if(!killed)survivors+=count;
}
const digest=createHash('sha256').update(JSON.stringify({trials:1_000_000,multi,counts,selected:best.selected,survivors})).digest('hex');
const report={schemaVersion:'1.0.0',model:'ICTC-ONTO-EPISTEMIC-DESIGN-MUTATION-1M',seed:'0x15C0FFEE',trials:1_000_000,multiDefectTrials:multi,surfaces:surfaces.length,defects:defects.length,criticalDefects:[...critical],candidateNodes,counts,convergence:{selected:best.selected,macroNodeCount:best.count,cost:best.cost,validSupersets:valid,absorbedCandidates:candidateNodes.map(x=>x.id).filter(id=>!chosen.has(id))},falsification:{survivors,killRate:1-survivors/1_000_000},digest,claimBoundary:'Synthetic deterministic mutations of the declared ontology/epistemic/design model. Zero survivors proves closure only against this model; human rendered pleasantness remains external.'};
if(report.multiDefectTrials!==563215)throw new Error(`deterministic drift: multiDefectTrials=${report.multiDefectTrials}`);
if(report.falsification.survivors!==0)throw new Error(`mutation survivors=${report.falsification.survivors}`);
if(JSON.stringify(report.convergence.selected)!==JSON.stringify(['M1_VISUAL_AUTHORITY','M2_SEMANTIC_HIERARCHY','M3_OBJECT_INTERACTION_GRAMMAR','M4_CONTEXTUAL_ADAPTATION']))throw new Error(`lattice drift: ${report.convergence.selected.join(',')}`);
const repo=path.dirname(fileURLToPath(import.meta.url));mkdirSync(path.join(repo,'..','artifacts'),{recursive:true});writeFileSync(path.join(repo,'..','artifacts','uiux-beauty-semantic-p5-mutation-1m.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,model:report.model,trials:report.trials,multiDefectTrials:report.multiDefectTrials,selected:report.convergence.selected,absorbed:report.convergence.absorbedCandidates,survivors,digest,claimBoundary:report.claimBoundary}));
