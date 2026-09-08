import assert from 'node:assert/strict';
import {ADMIN_SLICE_ENDPOINTS,ADMIN_SLICE_KEYS,createAdminSliceCoordinator} from './public/ui/admin-slice-coordinator.js';

assert.deepEqual(ADMIN_SLICE_KEYS,['readiness','usage','users','identity']);
const okPayload=Object.fromEntries(ADMIN_SLICE_KEYS.map(key=>[ADMIN_SLICE_ENDPOINTS[key],{key,ok:true}]));

for(const failedKey of ADMIN_SLICE_KEYS){
  const events=[];
  const c=createAdminSliceCoordinator({
    request:async path=>{if(path===ADMIN_SLICE_ENDPOINTS[failedKey]){const e=new Error(`boom:${failedKey}`);e.status=503;e.code='slice-down';throw e;}return okPayload[path];},
    onState:event=>events.push(event)
  });
  const results=await c.loadMany();
  assert.equal(results.length,4);
  assert.equal(results.filter(x=>x.status==='error').length,1);
  assert.equal(results.filter(x=>x.status==='ready').length,3);
  assert.equal(results.find(x=>x.key===failedKey).error.status,503);
  assert.equal(events.filter(x=>x.status==='loading').length,4);
  assert.equal(events.filter(x=>x.status==='ready').length,3);
  assert.equal(events.filter(x=>x.status==='error').length,1);
}

{
  let releaseFirst;
  const first=new Promise(resolve=>{releaseFirst=resolve;});
  let call=0;const events=[];
  const c=createAdminSliceCoordinator({request:async()=>{call++;if(call===1)return first;return{revision:'new'};},onState:e=>events.push(e)});
  const stalePromise=c.load('readiness');
  const current=await c.load('readiness');
  assert.equal(current.status,'ready');assert.equal(current.value.revision,'new');
  releaseFirst({revision:'old'});
  const stale=await stalePromise;
  assert.equal(stale.stale,true);
  assert.equal(c.snapshot().readiness.value.revision,'new');
  assert.equal(events.filter(e=>e.status==='ready').length,1,'stale completion must not overwrite current render state');
}

await assert.rejects(()=>createAdminSliceCoordinator({request:async()=>({})}).load('unknown'),/unknown admin slice/);
console.log(JSON.stringify({ok:true,slice:'S4-A4',checks:['four independent read slices','single failure leaves 3 ready','normalized local error metadata','retry race is latest-wins','stale completion cannot overwrite current state']}));
