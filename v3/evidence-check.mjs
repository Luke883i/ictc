import { strict as assert } from 'node:assert';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os'; import path from 'node:path';
import { Store } from './store.mjs';
const root=await mkdtemp(path.join(os.tmpdir(),'ictc-evidence-')); const store=await new Store(root).init(); const actor={id:'admin-test',role:'admin'};
try{
  const first=await store.mutate(actor,'test.created',{type:'mission',id:'m1'},{secret:'x'},draft=>{draft.missions.push({id:'m1'});return {id:'m1'};},{id:'cmd-1',expectedRevision:0});
  assert.equal(first.receipt.previousHash,'GENESIS'); assert.equal(first.receipt.revision,1); assert.equal(first.receipt.inputSha256.length,64);
  const replay=await store.mutate(actor,'test.created',{type:'mission',id:'m1'},{secret:'x'},()=>{throw new Error('must not run');},{id:'cmd-1'}); assert.equal(replay.replayed,true); assert.equal(replay.receipt.hash,first.receipt.hash);
  await assert.rejects(()=>store.mutate(actor,'test.stale',{type:'mission',id:'m1'},{},()=>({}),{expectedRevision:0}),error=>error.code==='revision-conflict');
  const [attachment]=await store.saveAttachments([{name:'proof.txt',mime:'text/plain',dataBase64:Buffer.from('proof').toString('base64')}]); assert.equal(attachment.sha256.length,64);
  assert.equal(store.verifyChain().ok,true); const bundle=store.evidenceBundle('mission','m1',actor); assert.equal(bundle.integrity.ok,true); assert.equal(bundle.events.length,1);
  const restarted=await new Store(root).init(); assert.equal(restarted.verifyChain().head,store.verifyChain().head);
  console.log('evidence-check: ok (receipt, idempotency, conflict, digest, bundle, restart)');
}finally{await rm(root,{recursive:true,force:true});}
