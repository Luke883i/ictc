import assert from 'node:assert/strict';
import { buildDemoDataset } from './runtime/demo-seed.mjs';
import { applyDemoRealityContext, demoRealityProjection, demoRealityViolations, ensureDemoRealityContext } from './runtime/demo-reality-context.mjs';
import { DEMO_COMPANY_CONTEXT, PROCEDURE_CHALLENGE_QUESTIONS, YEAR_ONE_DOD, YEAR_ONE_EXPECTED_COUNTS } from './runtime/demo-operating-year.mjs';
import { filterProcedureRecords, projectionContext } from './runtime/projection-context.mjs';
import { scopedActionPlanProjection, scopedCoverageProjection, scopedObjectRegistryProjection } from './runtime/grc-scoped-projections.mjs';

const fixture={users:[{id:'local-admin',displayName:'Amministratore locale',role:'admin',status:'active'},{id:'local-user',displayName:'Utente locale',role:'user',status:'active'},{id:'local-auditor',displayName:'Auditor locale',role:'auditor',status:'active'}],settings:{organization:{name:'Organizzazione',jurisdictions:['Italia','Unione europea'],sectors:[]}}};
const dataset=buildDemoDataset(fixture);
function workingState(){return{missions:structuredClone(dataset.records.monitoring),incidents:structuredClone(dataset.records.incidents),grcObjects:structuredClone(dataset.records.objects),grcMappings:structuredClone(dataset.records.coverage),grcActions:structuredClone(dataset.records.actions),grcRisks:structuredClone(dataset.records.risks),grcAssurance:structuredClone(dataset.records.assurance),standardScopes:structuredClone(dataset.support.standardScopes||[]),requirementScopes:structuredClone(dataset.support.requirementScopes||[]),settings:{demoSeed:{status:'complete'}}};}
const state=workingState();
applyDemoRealityContext(state);
assert.deepEqual(demoRealityViolations(state),[]);
const collections={monitoring:state.missions,incidents:state.incidents,objects:state.grcObjects,coverage:state.grcMappings,actions:state.grcActions,risks:state.grcRisks,assurance:state.grcAssurance};
const year=Object.fromEntries(Object.entries(collections).map(([id,rows])=>[id,rows.filter(row=>row.demo?.operatingYear?.showcase===true)]));
for(const [id,expected] of Object.entries(YEAR_ONE_EXPECTED_COUNTS)){assert.equal(year[id].length,expected,`${id} operating-year count`);assert.ok(collections[id].some(row=>row.demo?.operatingYear?.stressOnly===true),`${id} retains stress corpus`);}
for(const id of YEAR_ONE_DOD.selectedProcedures){const questions=PROCEDURE_CHALLENGE_QUESTIONS[id];assert.ok(questions,`${id} questions`);for(const axis of ['ontologyPositive','ontologyNegative','epistemicPositive','epistemicNegative']){assert.ok(Array.isArray(questions[axis])&&questions[axis].length>=3,`${id}:${axis}`);}for(const row of year[id]){assert.equal(row.demo.company,DEMO_COMPANY_CONTEXT.name);assert.equal(row.demo.operatingYear.company,DEMO_COMPANY_CONTEXT.name);assert.equal(row.demo.operatingYear.cohort,'operating-year');assert.equal(row.demo.procedureContext.bidirectional.positiveDemo.valid,true);assert.equal(row.demo.procedureContext.bidirectional.negativeDemo.valid,false);assert.equal(row.demo.procedureContext.bidirectional.dataToProcedure.mustResolveExactlyOne,true);assert.equal(row.demo.procedureContext.bidirectional.crossReference.authorityTransfer,'none');assert.equal(row.demo.procedureContext.bidirectional.uiBudget.primaryActions,1);assert.equal(row.demo.procedureContext.bidirectional.uiBudget.materialQuestions,1);assert.ok(row.demo.procedureContext.bidirectional.uiBudget.primaryFacts.length<=4);assert.equal(/Officine Aurora/i.test(JSON.stringify(row)),false,`${id}:${row.id} legacy company`);}}
const selectedRows=YEAR_ONE_DOD.selectedProcedures.flatMap(id=>year[id]);
assert.equal(new Set(selectedRows.map(row=>row.demo.operatingYear.month)).size,12,'all months represented');
assert.deepEqual(new Set(selectedRows.map(row=>row.demo.operatingYear.phase)),new Set(['Q1','Q2','Q3','Q4']));
assert.equal(new Set(year.objects.map(row=>row.type)).has('requirement'),false,'AO year-one excludes normative requirements');
assert.ok(new Set(year.objects.map(row=>row.type)).size>=8,'AO year-one has useful identity variety without mirroring everything');
const activeRatio=year.objects.filter(row=>row.status==='active').length/year.objects.length;assert.ok(activeRatio>=YEAR_ONE_DOD.thresholds.minOperatingYearAoActiveRatio&&activeRatio<=YEAR_ONE_DOD.thresholds.maxOperatingYearAoActiveRatio,`AO active ratio ${activeRatio}`);
const incidentWithAction=year.incidents.filter(row=>(row.links||[]).some(link=>link.relation==='incident-generates-action')).length,incidentLinkRatio=incidentWithAction/year.incidents.length;assert.ok(incidentWithAction>0,'some incidents create review work');assert.ok(incidentWithAction<year.incidents.length,'not every incident creates an action');assert.ok(incidentLinkRatio<=YEAR_ONE_DOD.thresholds.maxIncidentToActionLinkRatio,`incident/action ratio ${incidentLinkRatio}`);
assert.ok(year.coverage.some(row=>row.crossOrigin),'some MC mappings preserve cross-process provenance');assert.ok(year.coverage.some(row=>!row.crossOrigin),'some MC mappings originate natively without upstream handoff');
assert.ok(year.actions.some(row=>row.crossOrigin),'some AP actions preserve an upstream origin');assert.ok(year.actions.some(row=>row.originType==='manual'&&!row.crossOrigin),'some AP actions are native management commitments');
for(const [id,field] of [['incidents','state'],['objects','status'],['coverage','state'],['actions','state']])assert.ok(new Set(year[id].map(row=>row[field])).size>=YEAR_ONE_DOD.thresholds.minStateKindsPerStatefulProcess,`${id} maturity diversity`);
const rnUniverse=new Set(year.monitoring.flatMap(row=>row.sourceClasses||[]));assert.deepEqual(rnUniverse,new Set(['binding-eu-law','binding-italian-law','competent-authority-decisions','public-jurisprudence-and-case-information-without-personal-data']));

const actor={id:'local-admin',role:'admin'},ctx=projectionContext(actor,{asOf:'2026-06-30T23:59:59.000Z'});
assert.equal(filterProcedureRecords('monitoring',state.missions,ctx,'mission').length,YEAR_ONE_EXPECTED_COUNTS.monitoring,'RN ordinary projection excludes stress corpus');
assert.equal(filterProcedureRecords('incidents',state.incidents,ctx).length,YEAR_ONE_EXPECTED_COUNTS.incidents,'EC ordinary projection excludes stress corpus');
assert.equal(scopedObjectRegistryProjection(state,actor,ctx).objects.length,YEAR_ONE_EXPECTED_COUNTS.objects,'AO ordinary projection excludes stress corpus');
assert.equal(scopedCoverageProjection(state,actor,ctx).mappings.length,YEAR_ONE_EXPECTED_COUNTS.coverage,'MC ordinary projection excludes stress corpus');
assert.equal(scopedActionPlanProjection(state,actor,ctx).actions.length,YEAR_ONE_EXPECTED_COUNTS.actions,'AP ordinary projection excludes stress corpus');
assert.equal(state.grcObjects.length,100,'projection filtering never deletes AO stress corpus from state');
assert.equal(state.grcMappings.length,100,'projection filtering never deletes MC stress corpus from state');
assert.equal(state.grcActions.length,100,'projection filtering never deletes AP stress corpus from state');

class MemoryStore{constructor(initial){this.state=initial;}snapshot(){return structuredClone(this.state);}async mutate(_actor,_event,_subject,_payload,fn){return fn(this.state);}}
const runtimeState=workingState(),store=new MemoryStore(runtimeState);await ensureDemoRealityContext(store,{enabled:true});const projection=demoRealityProjection(store.snapshot());assert.equal(store.state.settings.organization.name,DEMO_COMPANY_CONTEXT.name);assert.equal(projection.operatingYear,true);assert.equal(projection.company,DEMO_COMPANY_CONTEXT.name);assert.equal(projection.showcaseRecords,Object.values(YEAR_ONE_EXPECTED_COUNTS).reduce((sum,value)=>sum+value,0));assert.deepEqual(projection.showcaseCounts,YEAR_ONE_EXPECTED_COUNTS);
console.log(JSON.stringify({ok:true,control:'DEMO-OPERATING-YEAR',company:DEMO_COMPANY_CONTEXT.name,period:[DEMO_COMPANY_CONTEXT.operatingYear.start,DEMO_COMPANY_CONTEXT.operatingYear.end],showcaseCounts:YEAR_ONE_EXPECTED_COUNTS,stressCorpusSeparated:true,stressCorpusHiddenFromOrdinaryProjection:true,aoRequirementOverlap:0,incidentActionLinkRatio:Number(incidentLinkRatio.toFixed(3)),months:12,phases:4,challengeQuestionSets:Object.keys(PROCEDURE_CHALLENGE_QUESTIONS).length}));
