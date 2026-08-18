import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canonicalProcedureRegistry } from './runtime/procedure-registry.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const contract=JSON.parse(await read('./procedure-intent-convergence-contract-2-0.json'));
const guidance=canonicalProcedureRegistry().guidance;
const [finetune,execUi,finetuneUi,rnUi,aoUi,active,styles,demoOntology]=await Promise.all([
  './procedure-finetuning-contract-1-4.json','./public/ui/procedure-executive-harmonization-1-5.js','./public/ui/procedure-finetuning-1-4.js','./public/ui/rn-scheduler-dialog-1-4.js','./public/ui/ao-auditor-facts-1-4.js','./public/ui/active-experience.js','./public/styles.css','./runtime/demo-procedure-ontology.mjs'
].map(read));
const historical=JSON.parse(finetune);
assert.equal(contract.authority,'procedure-intent-convergence-contract');
assert.deepEqual(contract.scope,['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01']);
assert.equal(guidance.procedures.length,7);assert.deepEqual(guidance.procedures.map(x=>x.code),contract.scope);
assert.deepEqual(historical.scope,['RN-01','EC-01','AO-01','MC-01','AP-01']);assert.deepEqual(historical.regressionOnly,['RC-01','AR-01']);
for(const code of contract.scope){const p=contract.procedures[code],g=guidance.procedures.find(x=>x.code===code);assert.ok(p&&g,code);assert.equal(p.id,g.id);assert.ok(String(p.object).length>20,`${code}:object`);assert.ok(String(p.intent).length>30,`${code}:intent`);assert.ok(Array.isArray(p.journey)&&p.journey.length>=6,`${code}:journey`);assert.ok(String(p.demoRule).length>20,`${code}:demoRule`);assert.ok(String(p.localMetric).length>10,`${code}:localMetric`);}
assert.equal(contract.commonPrimitives.length,5);assert.ok(contract.cognitiveInvariants.length>=6);assert.equal(contract.globalDoD.mutationKillRate,1);assert.equal(contract.globalDoD.noNoveltyHoldout,1000);
for(const token of ['Governa','Decisione umana','Prova che resta','Limite del processo'])assert.ok(execUi.includes(token),token);
for(const token of ['monitoring','incidents','objects','coverage','actions'])assert.ok(finetuneUi.includes(token),`finetune ${token}`);
for(const token of ['RN-01 · contributore AI schedulato','data-rn-scheduler-form-slot'])assert.ok(rnUi.includes(token),token);
const aoLower=aoUi.toLowerCase();for(const token of ['identità','sourceauthority','owner','attest'])assert.ok(aoLower.includes(token),`AO ${token}`);
assert.ok(active.includes('installProcedureFinetuning'));assert.ok(active.includes('installRnSchedulerDialog'));assert.ok(active.includes('installAoAuditorFacts'));
assert.ok(styles.includes('procedure-finetuning-1-4.css'));assert.ok(styles.includes('procedure-executive-harmonization-1-5.css'));
for(const token of ['binding-eu-law','binding-italian-law','competent-authority-decisions','public-jurisprudence-and-case-information-without-personal-data','closureRequiresHumanVerification','conceptAtom','auditorReadPath'])assert.ok(demoOntology.includes(token),`demo ontology ${token}`);
const rnBlock=demoOntology.slice(demoOntology.indexOf('RN_SOURCES'),demoOntology.indexOf('AO_AUTHORITY'));for(const forbidden of ['Microsoft 365','ERP cloud','Clienti strategici','Fornitori critici','Backup e DR'])assert.equal(rnBlock.includes(forbidden),false,`RN source contamination ${forbidden}`);
assert.match(demoOntology,/demoProcedureOntologyViolations/);assert.match(demoOntology,/ensureDemoProcedureOntology/);
console.log(JSON.stringify({ok:true,control:'PROCEDURE-INTENT-CONVERGENCE',procedures:7,commonPrimitives:contract.commonPrimitives.map(x=>x.id),demoOntology:true,noNoveltyHoldout:contract.globalDoD.noNoveltyHoldout}));
