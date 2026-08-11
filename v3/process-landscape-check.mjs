import assert from 'node:assert/strict';
import { processLandscapeProjection, PHASES } from './runtime/process-landscape.mjs';
import { canonicalProcedureContracts } from './runtime/procedure-contracts.mjs';
import { PROCEDURE_DOD } from './procedure-dod.mjs';
const contracts=canonicalProcedureContracts();
const procedures=[...contracts.map((contract,index)=>({id:contract.id,code:contract.code,label:contract.label,description:contract.purpose,kind:'service',readOnly:false,attentionCount:index%2,metrics:[{value:index,label:'x'}]})),{id:'evidence',code:'EV-01',label:'Prove e tracciabilità',description:'Ricostruisci la prova.',kind:'assurance',readOnly:false,attentionCount:0,metrics:[]}];
const ids=procedures.map(item=>item.id),work={queue:{items:[{processId:'risks'},{processId:'actions'}]},procedures:ids.map(id=>({processId:id,checkpoint:id==='evidence'?null:`${id}-review`,entry:`entry ${id}`}))},reviewInbox={items:[{processId:'risks'},{processId:'coverage'}]};
const out=processLandscapeProjection({procedures,work,reviewInbox});
assert.equal(out.authority,'runtime-process-landscape-projection');assert.equal(out.schemaVersion,'4.1.0');assert.equal(PHASES.length,4);assert.match(out.limitations[0],/quattro macro-fasi/i);
const flattened=out.phases.flatMap(phase=>phase.items);assert.equal(new Set(flattened.map(item=>item.processId)).size,8);assert.equal(out.ungrouped.length,0);assert.equal(flattened.find(item=>item.processId==='risks').reviewCount,1);assert.equal(flattened.find(item=>item.processId==='actions').workCount,1);
for(const contract of contracts){const item=flattened.find(candidate=>candidate.processId===contract.id),dod=PROCEDURE_DOD[contract.id];assert.ok(item,`${contract.id}: missing from landscape`);assert.equal(item.processCode,contract.code);assert.equal(item.label,contract.label);assert.equal(item.purpose,contract.purpose);assert.deepEqual(item.method,[...dod.completion]);assert.deepEqual(item.handoffs,[...dod.handoffs]);assert.deepEqual(item.benchmarkRefs,[...dod.benchmarkRefs]);assert.ok(item.proofHint);}
const evidence=flattened.find(item=>item.processId==='evidence');assert.equal(evidence.supportSurface,true);assert.deepEqual(evidence.method,[]);assert.deepEqual(evidence.handoffs,[]);
console.log('process-landscape-check: ok canonical contracts + procedure DoD');
