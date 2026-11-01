import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {runtimeHarness} from './runtime-test-harness.mjs';

// Executable E2: 7 named process projections x 3 actual actor roles, not 121-operation coverage.
// Each cell makes a separate HTTP GET through the real Node server and SQLite instance.
const codes=['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01'];
const roles=['admin','user','auditor'];
const h=await runtimeHarness('ictc-e2e-7x3');
const cells=[];
try{
 for(const role of roles){
  for(const code of codes){
   const response=await fetch(`${h.base}/api/bootstrap`,{headers:h.identity(role,`local-${role}`)});
   const data=await response.json();
   const summary=(data.procedureSummary?.rows||[]).find(x=>x.code===code);
   const projection=(data.procedures||[]).find(x=>x.code===code);
   const actual={role,code,http:response.status,actorRole:data.actor?.role||null,summary:!!summary,projection:!!projection,roleReadOnly:projection?.readOnly??null,integrityOk:data.integrity?.ok===true};
   actual.pass=actual.http===200&&actual.actorRole===role&&actual.summary&&actual.projection&&actual.integrityOk&&(role!=='auditor'||actual.roleReadOnly===true);
   cells.push(actual);
   assert.ok(actual.pass,`actual HTTP business projection failed: ${JSON.stringify(actual)}`);
  }
 }
 assert.equal(cells.length,21);
 const result={schemaVersion:'ictc-bounded-e2e-coverage-7x3/v1',authority:'real-server-and-sqlite-http-readback',denominator:21,numerator:cells.filter(x=>x.pass).length,percentage:100*Number((cells.filter(x=>x.pass).length/cells.length).toFixed(4)),scenarioDefinition:'Canonical process registry + role-filtered projection + actual HTTP readback + integrity; not workflow closure, human review, operation coverage or browser interaction',scope:{codes,roles},totalProductCoverage:null,cells};
 await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/e2e-coverage-7x3.json',import.meta.url),JSON.stringify(result,null,2));
 console.log(JSON.stringify({ok:true,denominator:result.denominator,numerator:result.numerator,percentage:result.percentage,totalProductCoverage:null,authority:result.authority}));
}finally{await h.close();}
