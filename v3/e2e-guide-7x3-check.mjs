import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {runtimeHarness} from './runtime-test-harness.mjs';

// This proves 21 live HTTP procedure-guide views and three fail-closed
// placeholder/unknown cases. It does not execute business state transitions.
const processes=[['monitoring','RN-01'],['incidents','EC-01'],['objects','AO-01'],
 ['coverage','MC-01'],['actions','AP-01'],['risks','RC-01'],['assurance','AR-01']];
const roles=['admin','user','auditor'];const cells=[];const negative=[];
const h=await runtimeHarness('ictc-e2e-guide-7x3');
try{
 for(const role of roles){
   for(const [id,code] of processes){
     const response=await fetch(`${h.base}/api/work/procedures/${id}`,
       {headers:h.identity(role,`e2e-guide-${role}`)});
     const body=await response.json();
     const humanSteps=Array.isArray(body.steps)?body.steps.filter(x=>x.humanRequired===true):[];
     const humanTransitions=Array.isArray(body.transitionSpecs)?body.transitionSpecs.filter(x=>x.human===true):[];
     const result={role,id,code,http:response.status,authority:body.authority,
       processId:body.process?.id,processCode:body.process?.code,
       steps:body.steps?.length||0,humanSteps:humanSteps.length,humanTransitions:humanTransitions.length};
     result.pass=result.http===200&&result.authority==='runtime-procedure-guide<-canonical-procedure-registry'&&
       result.processId===id&&result.processCode===code&&result.steps>0&&result.humanTransitions>0;
     assert.ok(result.pass,`live guide failed: ${JSON.stringify(result)}`);cells.push(result);
   }
 }
 for(const id of ['policy-documents','organization-documents','__unknown__']){
   const response=await fetch(`${h.base}/api/work/procedures/${id}`,
     {headers:h.identity('admin','e2e-guide-admin')});
   const body=await response.json();
   const result={id,http:response.status,code:body.code,pass:response.status===400&&body.code==='procedure-policy-unknown'};
   assert.ok(result.pass,`nonoperational guide promoted: ${JSON.stringify(result)}`);negative.push(result);
 }
 assert.equal(cells.length,21);assert.equal(negative.length,3);
 const report={schemaVersion:'ictc-scoped-e2e-guides/v1',source:'live server and SQLite',
   denominator:21,numerator:cells.filter(x=>x.pass).length,negativeDenominator:3,
   negativePassed:negative.filter(x=>x.pass).length,processes,roles,cells,negative,
   totalProductCoverage:null,fullJourneyStepAttestations:0,
   claimBoundary:'Live HTTP guide availability, code/owner and human-transition representation only; not 53 user-journey step execution, persistence, human review, deployment or global E2E.'};
 await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
 await writeFile(new URL('../artifacts/e2e-guides-7x3.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({ok:true,cells:report.numerator,negative:report.negativePassed,globalProductCoverage:null}));
}finally{await h.close();}
