import assert from 'node:assert/strict';
import {normalizeProcedureFeatures,normalizeProcedurePresentation,procedurePolicyProjection,PROCEDURE_IDS} from '../../src/runtime/procedure-policy.mjs';
const state={settings:{procedures:{features:{}}}};
assert.deepEqual(normalizeProcedurePresentation({},{}),{showMaturity:false});
assert.deepEqual(normalizeProcedurePresentation({presentation:{showMaturity:true}},{}),{showMaturity:true});
assert.deepEqual(normalizeProcedurePresentation({presentation:{showMaturity:false}},{presentation:{showMaturity:true}}),{showMaturity:false});
assert.deepEqual(procedurePolicyProjection(state,{role:'admin'}).presentation,{showMaturity:false});
assert.deepEqual(procedurePolicyProjection({settings:{procedures:{presentation:{showMaturity:true}}}},{role:'auditor'}).presentation,{showMaturity:true});
for(const bad of [null,{},[],{showMaturity:'true'},{showMaturity:null}])assert.throws(()=>normalizeProcedurePresentation({presentation:bad}),e=>e.code==='procedure-presentation-invalid');
for(let mask=1;mask<1<<PROCEDURE_IDS.length;mask++){
 const features=Object.fromEntries(PROCEDURE_IDS.map((id,i)=>[id,Boolean(mask&(1<<i))]));
 assert.deepEqual(normalizeProcedureFeatures({features},{}),{...Object.fromEntries(['policy-documents','organization-documents'].map(x=>[x,true])),...features});
 assert.deepEqual(normalizeProcedurePresentation({presentation:{showMaturity:false}},{features}),{showMaturity:false});
}
console.log('R8 procedure presentation policy: PASS, 127 availability subsets and negative cases');
