/** R8 maturity preference: real authenticated HTTP write, receipt, readback and role boundary.
 * This witnesses runtime behavior, not comprehension or external human usability.
 */
import assert from 'node:assert/strict';
import {runtimeHarness} from './runtime-test-harness.mjs';

const h=await runtimeHarness('ictc-r8-presentation-http');
const get=async(role='admin',actor='local-admin')=>{
 const r=await fetch(h.base+'/api/admin/procedures',{headers:h.identity(role,actor)});
 return{status:r.status,body:await r.json()};
};
try{
 await h.onboard('admin','local-admin');
 await h.onboard('auditor','local-auditor');
 const initial=await get();
 assert.equal(initial.status,200);
 assert.equal(initial.body.presentation?.showMaturity,false,'R8 default must be off');
 assert.equal(initial.body.enabled?.length,7);
 const available=initial.body.enabled;
 const before=await h.bootstrap('admin','local-admin');
 const optIn=await h.ok('PUT','/api/admin/procedures',{presentation:{showMaturity:true}},'admin','local-admin');
 assert.match(optIn.body.receipt?.hash||'',/^[0-9a-f]{64}$/,'administrative write receipt');
 assert.ok(optIn.body.receipt.revision>before.body.revision,'revision advanced');
 const enabled=await get();
 assert.equal(enabled.status,200);
 assert.equal(enabled.body.presentation?.showMaturity,true,'opt-in persisted and read back');
 assert.deepEqual(enabled.body.enabled,available,'presentation must not change process availability');
 assert.equal(enabled.body.catalogue?.length,9,'placeholders still informational');
 const auditor=await get('auditor','local-auditor');
 assert.equal(auditor.status,403,'auditor cannot read admin policy');
 const forbiddenWrite=await h.request('PUT','/api/admin/procedures',{presentation:{showMaturity:false}},'auditor','local-auditor');
 assert.equal(forbiddenWrite.status,403,'auditor cannot mutate presentation preference');
 const invalid=await h.request('PUT','/api/admin/procedures',{presentation:{showMaturity:'true'}},'admin','local-admin');
 assert.equal(invalid.status,422,'string bool must fail closed');
 const afterInvalid=await get();
 assert.equal(afterInvalid.body.presentation.showMaturity,true,'invalid input cannot change persisted preference');
 const off=await h.ok('PUT','/api/admin/procedures',{presentation:{showMaturity:false}},'admin','local-admin');
 assert.match(off.body.receipt?.hash||'',/^[0-9a-f]{64}$/);
 assert.ok(off.body.receipt.revision>optIn.body.receipt.revision);
 const disabled=await get();
 assert.equal(disabled.body.presentation.showMaturity,false);
 assert.deepEqual(disabled.body.enabled,available);
 console.log(JSON.stringify({ok:true,gate:'ux-r8-presentation-http',writes:2,receipts:2,readbacks:3,negativeRole:2,invalidInput:1,processesUnaffected:7,claimLimit:'repository-side HTTP integration, not external UX assurance'}));
}finally{await h.close();}
