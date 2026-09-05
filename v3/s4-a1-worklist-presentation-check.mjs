import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { presentProcedureWorklist, procedureWorklistPresentationIds } from './runtime/procedure-worklist-presentation.mjs';

const ids=procedureWorklistPresentationIds();
assert.deepEqual(ids,['monitoring','incidents','objects','coverage','actions','risks','assurance']);
const fixtures={
 monitoring:{row:{id:'mission:m-1',kind:'mission',state:'needs-plan',title:'Monitor NIS2',reason:'Piano operativo da completare.',actionable:true,canAct:true,primaryAction:'complete-plan',facets:{state:'needs-plan'}},state:{}},
 incidents:{row:{id:'i-1',kind:'incident',state:'review',title:'Evento accesso',reason:'Fascicolo ancora aperto.',actionable:true,canAct:true,primaryAction:'open-case',facets:{state:'review',eventKind:'near-miss'}},state:{}},
 objects:{row:{id:'o-1',kind:'object',state:'candidate',title:'CRM',reason:'Oggetto candidato da validare.',actionable:true,canAct:true,primaryAction:'review-object',facets:{state:'candidate',type:'saas-service'}},state:{}},
 coverage:{row:{id:'mapping:map-1',kind:'mapping',state:'gap',title:'Art. 32',reason:'Gap dichiarato da gestire.',actionable:true,canAct:true,primaryAction:'resolve-gap',facets:{state:'gap',kind:'mapping'}},state:{}},
 actions:{row:{id:'a-1',kind:'action',state:'ready-for-review',title:'Ruota credenziali',reason:'Risultato da verificare.',actionable:true,canAct:true,primaryAction:'verify-action',facets:{state:'ready-for-review',priority:'2'}},state:{}},
 risks:{row:{id:'r-1',kind:'risk',state:'review-due',title:'Account privilegiati',reason:'Riesame dovuto.',actionable:true,canAct:true,primaryAction:'review-risk',facets:{state:'review-due',band:'high',high:'true'}},state:{}},
 assurance:{row:{id:'ar-1',kind:'assurance-case',state:'review',title:'Questionario cliente',reason:'Response set da completare o approvare.',actionable:true,canAct:true,primaryAction:'review-response',facets:{state:'review',source:'Cliente A'}},state:{}}
};
for(const id of ids){
  const f=fixtures[id],base={id,rows:[f.row],allRows:[f.row],counts:{actionable:1},policy:{default:'actionable-only'}};
  const p=presentProcedureWorklist(base,f.state,{role:'admin'}),row=p.rows[0],view=row.presentation;
  assert.equal(view.targetRef.procedureId,id);assert.ok(view.targetRef.subjectId);assert.equal(view.targetRef.intendedAction,row.primaryAction);
  assert.ok(view.kindLabel&&view.situationLabel&&view.actionLabel);assert.notEqual(view.situationLabel.trim().toLowerCase(),String(row.state).trim().toLowerCase(),`${id}: raw state rendered as business situation`);
  assert.ok(!/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(view.situationLabel.trim()),`${id}: technical slug leaked as business situation`);
  assert.equal(view.facets.length,1);assert.equal(p.presentationFacets.length,1);assert.notEqual(p.presentationFacets[0].key,'state');assert.equal(p.presentationPolicy.sharedBusinessVocabulary,false);
}
const run={id:'run:run-1',kind:'run',state:'failed',title:'run-1',reason:'Esecuzione fallita da verificare.',actionable:true,canAct:true,primaryAction:'inspect-failed-run',facets:{state:'failed',kind:'run'}};
const runP=presentProcedureWorklist({id:'monitoring',rows:[run],allRows:[run],counts:{actionable:1}}, {runs:[{id:'run-1',missionId:'m-9'}]}, {role:'admin'}).rows[0].presentation;assert.equal(runP.targetRef.context.missionId,'m-9');
const scope={id:'scope:rs-1',kind:'requirement-scope',state:'unknown',title:'Art. 32',reason:'Applicabilità da decidere.',actionable:true,canAct:true,primaryAction:'decide-requirement-scope',facets:{state:'unknown',kind:'requirement-scope'}};
const scopeP=presentProcedureWorklist({id:'coverage',rows:[scope],allRows:[scope],counts:{actionable:1}}, {requirementScopes:[{id:'rs-1',requirementRef:'gdpr:art32',binding:{frameworkId:'eu-gdpr-2016-679',nodeId:'art-32'}}]}, {role:'admin'}).rows[0].presentation;assert.equal(scopeP.targetRef.context.frameworkId,'eu-gdpr-2016-679');assert.equal(scopeP.targetRef.context.nodeId,'art-32');assert.equal(scopeP.targetRef.context.requirementRef,'gdpr:art32');
const auditor=presentProcedureWorklist({id:'actions',rows:[{...fixtures.actions.row,canAct:false,primaryAction:null}],allRows:[{...fixtures.actions.row,canAct:false,primaryAction:null}],counts:{actionable:1}}, {}, {role:'auditor'}).rows[0].presentation;assert.equal(auditor.targetRef.intendedAction,'inspect-record');assert.equal(auditor.actionLabel,'Apri dettaglio');

const ui=readFileSync(new URL('./public/ui/procedure-worklist.js',import.meta.url),'utf8');
for(const forbidden of ['frame.after(section)','host.prepend(section)','model.facets?.state','ACTION_LABELS','Apri nel processo','complete-plan','review-object','decide-standard-use','adopt-action','review-risk','draft-response','data-object-review','data-action-adopt','data-risk-review'])assert.equal(ui.includes(forbidden),false,`shared primitive owns local business/placement token: ${forbidden}`);
for(const required of ['data-procedure-attention-slot','presentationFacets','procedure-work-business-kind','procedure-work-situation','ictc:work-target-request','ictc:work-target-unresolved','ictc:work-target-resolved','usefulPresentationFacets','shouldSearch','procedure-worklist-reveal'])assert.ok(ui.includes(required),`shared primitive missing ${required}`);
assert.ok(ui.includes(".filter(local=>(local.values||[]).length>1).slice(0,1)"),'facet controls must be discriminant and capped');
assert.ok(ui.includes(".length>=6"),'search must be cardinality-aware');
const rn=readFileSync(new URL('./public/ui/procedure-sequential-rn-ec.js',import.meta.url),'utf8'),grc=readFileSync(new URL('./public/ui/grc-workspace-3-2.js',import.meta.url),'utf8');
for(const source of [rn,grc])assert.ok(source.includes('ictc:work-target-request'),'local target owner missing request handler');
assert.ok(rn.includes("attentionSlotOwner='procedure-sequential-rn-ec.js'")&&rn.includes("ref.procedureId==='monitoring'")&&rn.includes("ref.procedureId==='incidents'"));
assert.ok(grc.includes("attentionSlotOwner='grc-workspace-3-2.js'")&&grc.includes('grcRecordTargetMap')&&grc.includes('grcRequirementRef')&&grc.includes("ref.subjectType==='requirement-scope'"));for(const token of ['data-v4-risk-treatment','data-v4-action-verify','data-work-target-active'])assert.ok(grc.includes(token),`GRC local target owner missing ${token}`);assert.ok(rn.includes('data.workTargetActive')||rn.includes('workTargetActive'));
for(const source of [rn,grc])assert.equal(source.includes('host.prepend(section)'),false);
console.log(JSON.stringify({ok:true,suite:'s4-a1-worklist-presentation-check',procedures:ids.length,typedTargets:ids.length,localFacets:ids.length,sharedPlacementAuthority:0,sharedBusinessActionAuthority:0,rawKindStateDefault:0,immediateFacetMax:1,searchThreshold:6,claimBoundary:'Repository/model contract evidence only; actual browser resolution remains separately tested.'}));
