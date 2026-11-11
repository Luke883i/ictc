import assert from 'node:assert/strict';
import {pageProcedureTraces} from '../../src/runtime/api-reliability.mjs';
import {runtimeHarness} from './runtime-test-harness.mjs';
const actor={id:'alice',role:'admin'},other={id:'bob',role:'admin'};
const graph={schemaVersion:'4.2.0',authority:'runtime-procedure-trace<-decision-2.4+epistemic-2.1',traces:Array.from({length:117},(_,i)=>({id:`trace:catalog:${String(i).padStart(4,'0')}`,subject:{type:'catalog',id:String(i)}})),counts:{subjects:117}};
const page=(query,who=actor,rev=7)=>pageProcedureTraces(graph,new URLSearchParams(query),who,rev);
assert.equal(page('',actor,7),graph,'unpaged legacy must preserve source object identity');
for(const limit of ['0','-1','1.1','50.0','51','99999999999999999999999','nan',''])assert.throws(()=>page(`limit=${encodeURIComponent(limit)}`),x=>x.status===400);
for(const query of ['limit=2&limit=3','limit=2&fake=yes','cursor=!!','limit=%20','cursor=%2f'])assert.throws(()=>page(query),x=>x.status===400);
let cursor=null,ids=[];for(let i=0;i<20;i++){const q=cursor?`limit=7&cursor=${encodeURIComponent(cursor)}`:'limit=7',result=page(q);assert.ok(result.traces.length<=7);assert.equal(result.page.total,117);assert.equal(result.counts.subjects,117);ids.push(...result.traces.map(x=>x.id));cursor=result.page.nextCursor;if(!cursor){assert.equal(result.page.hasMore,false);break;}}
assert.equal(ids.length,117);assert.equal(new Set(ids).size,117,'no duplicate or skipped results');
const first=page('limit=3'),next=first.page.nextCursor;
assert.throws(()=>page(`limit=3&cursor=${next}`,actor,8),e=>e.code==='trace-cursor-stale'&&e.status===409);
assert.throws(()=>page(`limit=3&cursor=${next}`,other,7),e=>e.code==='trace-cursor-actor-mismatch'&&e.status===403);
assert.throws(()=>page(`limit=4&cursor=${next}`),e=>e.code==='trace-cursor-limit-mismatch');
const payload=JSON.parse(Buffer.from(next,'base64url').toString('utf8'));payload.anchor='trace:fake:999';const forged=Buffer.from(JSON.stringify(payload)).toString('base64url');assert.throws(()=>page(`limit=3&cursor=${forged}`),e=>e.code==='trace-cursor-invalid');
const env=await runtimeHarness('ictc-c3-trace');try{
 const req=async(path,id='alice')=>{const r=await fetch(`${env.base}${path}`,{headers:env.identity('admin',id)});return {status:r.status,body:await r.json()};};
 const legacy=await req('/api/work/traces');assert.equal(legacy.status,200);assert.equal('page' in legacy.body,false);
 const good=await req('/api/work/traces?limit=1');assert.equal(good.status,200);assert.equal(good.body.page.limit,1);assert.equal(good.body.page.total,legacy.body.traces.length);
 for(const path of ['/api/work/traces?limit=0','/api/work/traces?limit=51','/api/work/traces?limit=1&limit=2']){const bad=await req(path);assert.equal(bad.status,400);assert.equal(bad.body.schemaVersion,'1.0.0');assert.ok(bad.body.requestId);}
}finally{await env.close();}
console.log('c3-trace-pagination-check: PASS synthetic 117 traces, role/revision/limit negatives and runtime HTTP');
