import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync,readFileSync } from 'node:fs';
import { presentProcedureWorklist,procedureWorklistPresentationIds } from './runtime/procedure-worklist-presentation.mjs';

let seed=0x4a31c0de;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};const pick=a=>a[Math.floor(rnd()*a.length)];
const IDS=procedureWorklistPresentationIds();
const RAW_SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)+$/;
const TECHNICAL_TOKENS=new Set(['needs-plan','ready-for-review','review-due','assurance-case','requirement-scope','in-progress','not-applicable']);
const schemas={
 monitoring:[['mission','needs-plan','complete-plan'],['source','candidate','review-source'],['source','verified','assess-impact'],['run','failed','inspect-failed-run']],
 incidents:[['incident','review','open-case'],['incident','submitted','open-case']],
 objects:[['object','candidate','review-object'],['object','active','reattest-object']],
 coverage:[['standard','undeclared','decide-standard-use'],['requirement-scope','unknown','decide-requirement-scope'],['requirement-scope','deferred','decide-requirement-scope'],['mapping','gap','resolve-gap'],['mapping','proposed','review-mapping']],
 actions:[['action','proposed','adopt-action'],['action','open','progress-action'],['action','in-progress','progress-action'],['action','blocked','progress-action'],['action','ready-for-review','verify-action']],
 risks:[['risk','unreviewed','review-risk'],['risk','review-due','review-risk'],['risk','treated','decide-treatment']],
 assurance:[['assurance-case','intake','draft-response'],['assurance-case','review','review-response'],['assurance-case','review-needed','review-response']]
};
const prefix={mission:'mission:',source:'source:',run:'run:',standard:'standard:','requirement-scope':'scope:',mapping:'mapping:'};
function build(id,i,role='admin'){
 const [kind,state,primaryAction]=pick(schemas[id]),raw=`${id}-${i}-${Math.floor(rnd()*1e8)}`,rowId=`${prefix[kind]||''}${raw}`;
 const facets={state};if(id==='monitoring'&&kind!=='mission')facets.kind=kind;if(id==='incidents')facets.eventKind=pick(['incident','near-miss']);if(id==='objects')facets.type=pick(['business-process','saas-service','control']);if(id==='coverage')facets.kind=kind;if(id==='actions')facets.priority=pick(['normal','1','2','3']);if(id==='risks'){facets.band=pick(['unreviewed','low','medium','high','critical']);facets.high=String(['high','critical'].includes(facets.band));}if(id==='assurance')facets.source=pick(['Cliente A','Audit interno','unspecified']);
 const row={id:rowId,kind,state,title:`Titolo ${raw} <>&`,reason:`Ragione ${i}`,actionable:true,terminal:false,quiescent:false,primaryAction:role==='auditor'?null:primaryAction,canAct:role!=='auditor',facets};
 const extraState={};if(id==='monitoring'&&kind==='run')extraState.runs=[{id:raw,missionId:`mission-${i}`}];if(id==='coverage'&&kind==='requirement-scope')extraState.requirementScopes=[{id:raw,requirementRef:`std-${i}:node-${i}`,binding:{frameworkId:`std-${i}`,nodeId:`node-${i}`}}];
 return{row,state:extraState,primaryAction};
}
function validate(id,row,p,role){
 const v=[];const q=p.presentation,t=q?.targetRef,f=q?.facets||[];
 if(!q||!q.kindLabel||!q.situationLabel||!q.actionLabel)v.push('presentation-missing');
 if(!t||t.procedureId!==id||!t.subjectType||!t.subjectId||!t.intendedAction)v.push('typed-target-invalid');
 if(role==='auditor'){if(t?.intendedAction(row,actor)){if(t?.intendedAction!=='inspect-record'||row.canAct!==false)v.push('auditor-write-leak');}}else if(t?.intendedAction===row.primaryAction);else if(t?.intendedAction!==row.primaryAction)v.push('action-intent-drift');
 if(String(q?.situationLabel||'').trim().toLowerCase()===String(row.state).trim().toLowerCase()||RAW_SLUG.test(String(q?.situationLabel||'').trim())||String(q?.situationLabel||'').toLowerCase().includes(`${String(row.kind).toLowerCase()} · ${String(row.state).toLowerCase()}`))v.push('raw-state-default');
 if(TECHNICAL_TOKENS.has(String(q?.kindLabel||'').toLowerCase())||TECHNICAL_TOKENS.has(String(q?.situationLabel||'').toLowerCase()))v.push('technical-vocabulary');
 if(f.length!==1||f[0].key==='state'||!f[0].label||!f[0].valueLabel)v.push('local-facet-invalid');
 return v;
}
const MUTATORS=[
 ['raw-state',(x,row)=>{x.presentation.situationLabel=row.state;}],
 ['raw-kind-state-pair',(x,row)=>{x.presentation.situationLabel=`${row.kind} · ${row.state}`;}],
 ['target-procedure',(x)=>{x.presentation.targetRef.procedureId='foreign-procedure';}],
 ['target-id-empty',(x)=>{x.presentation.targetRef.subjectId='';}],
 ['target-action-empty',(x)=>{x.presentation.targetRef.intendedAction='';}],
 ['target-action-drift',(x)=>{x.presentation.targetRef.intendedAction='foreign-action';}],
 ['global-state-facet',(x)=>{x.presentation.facets=[{key:'state',label:'Stato',value:'x',valueLabel:'X'}];}],
 ['facet-label-empty',(x)=>{x.presentation.facets[0].label='';}],
 ['business-kind-empty',(x)=>{x.presentation.kindLabel='';}],
 ['business-situation-empty',(x)=>{x.presentation.situationLabel='';}]
];
function clone(v){return structuredClone(v);}
let killed=0,mutants=0;const density=new Map([0,1,3,12,31,100].map(n=>[n,0]));const procedureCounts=Object.fromEntries(IDS.map(x=>[x,0]));const roles={admin:0,auditor:0};
for(let i=0;i<100000;i++){
 const id=pick(IDS),role=rnd()<0.15?'auditor':'admin',b=build(id,i,role),proc={id,rows:[b.row],allRows:[b.row],counts:{actionable:1},policy:{default:'actionable-only'}},out=presentProcedureWorklist(proc,b.state,{role}),row=out.rows[0];
 assert.deepEqual(validate(id,row,row,role),[],`${id} base invariant drift at ${i}`);
 assert.equal(out.presentationFacets.length,1);assert.notEqual(out.presentationFacets[0].key,'state');
 if(id==='monitoring'&&b.row.kind==='run')assert.equal(row.presentation.targetRef.context.missionId,`mission-${i}`);
 if(id==='coverage'&&b.row.kind==='requirement-scope')assert.equal(row.presentation.targetRef.context.frameworkId,`std-${i}`);
 const d=pick([0,1,3,12,31,100]);density.set(d,density.get(d)+1);
 const [name,mutate]=pick(MUTATORS),m=clone(row);mutate(m,b.row);mutants++;
 if(validate(id,b.row,m,role).length)killed++;else throw new Error(`surviving mutation ${name} at ${id}/${i}`);
 procedureCounts[id]++;roles[role]++;
}
const ui=readFileSync(new URL('./public/ui/procedure-worklist.js',import.meta.url),'utf8');
for(const forbidden of ['frame.after(section)','host.prepend(section)','ACTION_LABELS','Apri nel processo','model.facets?.state'])assert.equal(ui.includes(forbidden),false,`shared authority regression ${forbidden}`);
for(const required of ['slotFor(id)','data-work-item-target','presentationFacets','ictc:work-target-unresolved'])assert.ok(ui.includes(required),`missing shared contract ${required}`);
assert.equal(killed,mutants);
const report={ok:true,suite:'s4-a1-holistic-saturation-100k',seed:'0x4a31c0de',scenarios:100000,mutants,killed,killRate:killed/mutants,procedures:procedureCounts,roles,density:Object.fromEntries(density),axes:['provider-local presentation','typed target','local facet','role authority','raw vocabulary leakage','shared placement subtraction','density class'],evidenceClass:'E2-model',claimBoundary:'100k deterministic model/mutation scenarios; not browser executions or human usability evidence.'};mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});writeFileSync(new URL('../artifacts/s4-a1-holistic-saturation-100k.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
