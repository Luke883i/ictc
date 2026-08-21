import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Store } from './store.mjs';

const root=await mkdtemp(path.join(tmpdir(),'ictc-runtime-stabilization-'));
const actor={id:'runtime-stabilization',role:'admin',permissions:[]};
try{
  const store=await new Store(root).init();
  let first=null;
  for(let index=0;index<502;index++){
    const envelope=await store.mutate(actor,'stabilization.command.recorded',{type:'stabilization-command',id:String(index)},{index},draft=>({index,revisionBefore:draft.revision}),{id:`stabilization-${index}`});
    if(index===0)first=envelope;
  }
  assert.equal(Object.keys(store.snapshot().commandResults).length,500,'snapshot replay cache remains bounded');
  assert.equal(store.snapshot().commandResults['stabilization-0'],undefined,'oldest replay leaves bounded snapshot cache');
  const durable=store.persistence.findCommandResult('stabilization-0');
  assert.equal(durable?.envelope?.receipt?.revision,first.receipt.revision,'durable command ledger retains evicted replay');
  assert.equal(store.persistence.commandResultCount(),502,'all command ids are retained durably');
  const revisionBeforeReplay=store.snapshot().revision;
  const replay=await store.mutate(actor,'stabilization.command.recorded',{type:'stabilization-command',id:'0'},{index:0},()=>{throw new Error('evicted command replay must not execute mutation');},{id:'stabilization-0'});
  assert.equal(replay.replayed,true);
  assert.equal(replay.receipt.eventId,first.receipt.eventId);
  assert.equal(store.snapshot().revision,revisionBeforeReplay,'durable replay cannot advance revision');
  await assert.rejects(store.mutate({...actor,id:'other-actor'},'stabilization.command.recorded',{type:'stabilization-command',id:'0'},{index:0},()=>({bad:true}),{id:'stabilization-0'}),error=>error.code==='command-id-conflict');
  store.close();

  const reopened=await new Store(root).init();
  assert.equal(reopened.snapshot().commandResults['stabilization-0'],undefined,'restart does not need to inflate bounded snapshot cache');
  const replayAfterRestart=await reopened.mutate(actor,'stabilization.command.recorded',{type:'stabilization-command',id:'0'},{index:0},()=>{throw new Error('durable replay after restart must not execute mutation');},{id:'stabilization-0'});
  assert.equal(replayAfterRestart.replayed,true);
  assert.equal(replayAfterRestart.receipt.eventId,first.receipt.eventId);
  assert.equal(reopened.persistence.commandResultCount(),502);
  reopened.close();
  console.log('runtime-stabilization-command-ledger-check: ok (502 commands, bounded cache, durable replay + restart + conflict)');
}finally{
  await rm(root,{recursive:true,force:true});
}
