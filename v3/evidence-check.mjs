import { strict as assert } from 'node:assert';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os'; import path from 'node:path';
import { Store } from './store.mjs';
import { applyCatalogDecision, catalogKey, mergeCatalogObservation, normalizeCatalogItem } from './runtime/model.mjs';
await import('./fi01-reference-check.mjs');
await import('./home-next-action-check.mjs');
const root=await mkdtemp(path.join(os.tmpdir(),'ictc-evidence-')); const store=await new Store(root).init(); const actor={id:'admin-test',role:'admin'};
try{
  const first=await store.mutate(actor,'test.created',{type:'mission',id:'m1'},{secret:'x'},draft=>{draft.missions.push({id:'m1'});return {id:'m1'};},{id:'cmd-1',expectedRevision:0});
  assert.equal(first.receipt.previousHash,'GENESIS'); assert.equal(first.receipt.revision,1); assert.equal(first.receipt.inputSha256.length,64);
  const replay=await store.mutate(actor,'test.created',{type:'mission',id:'m1'},{secret:'x'},()=>{throw new Error('must not run');},{id:'cmd-1'}); assert.equal(replay.replayed,true); assert.equal(replay.receipt.hash,first.receipt.hash);
  await assert.rejects(()=>store.mutate(actor,'test.stale',{type:'mission',id:'m1'},{},()=>({}),{expectedRevision:0}),error=>error.code==='revision-conflict');
  const [attachment]=await store.saveAttachments([{name:'proof.txt',mime:'text/plain',dataBase64:Buffer.from('proof').toString('base64')}]); assert.equal(attachment.sha256.length,64);
  const beforeFiles=(await readdir(path.join(root,'attachments'))).length;
  const oversized=Buffer.alloc(5*1024*1024+1).toString('base64');
  await assert.rejects(()=>store.saveAttachments([
    {name:'partial.txt',mime:'text/plain',dataBase64:Buffer.from('partial').toString('base64')},
    {name:'too-large.bin',mime:'application/octet-stream',dataBase64:oversized}
  ]),error=>error.code==='attachment-too-large');
  assert.equal((await readdir(path.join(root,'attachments'))).length,beforeFiles,'partial attachment failure must not leave orphan files');

  assert.equal(catalogKey({identifier:'CELEX:1',sourceUrl:'https://one.example',title:'Old title'}),catalogKey({identifier:'CELEX:1',sourceUrl:'https://two.example',title:'New title'}));
  assert.equal(catalogKey({sourceUrl:'https://example.org/source#one',title:'A'}),catalogKey({sourceUrl:'https://example.org/source#two',title:'B'}));
  const source=normalizeCatalogItem({title:'Old title',identifier:'CELEX:1',sourceUrl:'https://example.org/one'}, {kind:'mission-run',missionId:'m1',runId:'r1',observedAt:new Date().toISOString()}, null, prefix=>`${prefix}-1`);
  applyCatalogDecision(source,'verified','Checked','admin-test');
  assert.equal(source.decisions.at(-1).observationSha256.length,64);
  mergeCatalogObservation(source,normalizeCatalogItem({title:'New title',identifier:'CELEX:1',sourceUrl:'https://example.org/two'}, {kind:'mission-run',missionId:'m1',runId:'r2',observedAt:new Date().toISOString()}, null, prefix=>`${prefix}-2`));
  assert.equal(source.state,'candidate','new observation must require a new human decision');
  assert.equal(source.observations.length,2);

  await store.mutate({id:'alice',role:'user'},'contribution.recorded',{type:'contribution',id:'c1'},{},draft=>{
    draft.contributions.push({id:'c1',links:['https://secret.example/item'],text:'private body',note:'private note',attachments:[{id:'hidden-file',name:'secret.pdf',sha256:'b'.repeat(64)}],state:'enriched',createdAt:new Date().toISOString(),createdBy:'alice'});
    draft.catalog.push({id:'cat1',title:'Public candidate',identifier:'PUB:1',sourceUrl:'https://public.example',state:'candidate',decisions:[],observations:[{origin:{kind:'contribution',contributionId:'c1'},observedAt:new Date().toISOString()}],origin:{kind:'contribution',contributionId:'c1'}});
    return {id:'c1'};
  });
  const bobBundle=store.evidenceBundle('catalog','cat1',{id:'bob',role:'user'});
  const serialized=JSON.stringify(bobBundle);
  assert.equal(bobBundle.related.contributions.length,0);
  assert.equal(bobBundle.related.restrictedContributionCount,1);
  for(const secret of ['secret.example','private body','private note','secret.pdf','alice']) assert.equal(serialized.includes(secret),false,`catalog bundle leaked ${secret}`);
  assert.equal(serialized.includes('[restricted]'),true);

  assert.equal(store.verifyChain().ok,true); const bundle=store.evidenceBundle('mission','m1',actor); assert.equal(bundle.integrity.ok,true); assert.equal(bundle.events.length,1);
  const restarted=await new Store(root).init(); assert.equal(restarted.verifyChain().head,store.verifyChain().head);
  console.log('evidence-check: ok (receipt, idempotency, conflict, atomic attachments, stable identity, private bundle, restart, FI-01 reference, home next action)');
}finally{await rm(root,{recursive:true,force:true});}
