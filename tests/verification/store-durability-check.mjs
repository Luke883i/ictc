import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Store } from '../../src/store.mjs';
import { cleanupTempDir } from '../../src/lib/runtime-temp-cleanup.mjs';
const root=await mkdtemp(path.join(tmpdir(),'ictc-store-durability-'));
const actor={id:'durability-check',role:'admin',permissions:[]};
const cases=[];const record=(id,status,evidence)=>cases.push({id,status,evidence});
try{
 const store=await new Store(root).init();const baseline=store.snapshot();let releasePersist,persistEnteredResolve;const persistEntered=new Promise(resolve=>{persistEnteredResolve=resolve;});const persistBarrier=new Promise(resolve=>{releasePersist=resolve;});const originalPersist=store.persist.bind(store);store.persist=async state=>{persistEnteredResolve();await persistBarrier;return originalPersist(state);};let settled=false;const mutation=store.mutate(actor,'durability.visibility',{type:'durability-check',id:'visibility'},{value:1},draft=>{draft.settings.organization.name='Persisted before visible';return{changed:true};},{id:'durability-visibility'}).finally(()=>{settled=true;});await persistEntered;assert.equal(settled,false);assert.deepEqual(store.snapshot(),baseline);releasePersist();const envelope=await mutation;store.persist=originalPersist;assert.equal(envelope.replayed,false);record('D01','passed','Snapshot remains at the last durable revision while SQLite transaction/readback is pending.');
 const reopened=new Store(root);await reopened.init();assert.equal(reopened.snapshot().revision,store.snapshot().revision);assert.equal(reopened.snapshot().settings.organization.name,'Persisted before visible');assert.equal(reopened.verifyChain().ok,true);reopened.close();record('D02','passed','Successful mutation is reconstructed from SQLite snapshot plus append-only audit ledger.');
 const beforeFailure=store.snapshot();store.persist=async()=>{const error=new Error('simulated persistence failure');error.code='ENOSPC';throw error;};await assert.rejects(store.mutate(actor,'durability.failure',{type:'durability-check',id:'failure'},{},draft=>{draft.settings.organization.name='Ghost state';return{changed:true};},{id:'durability-failure'}),e=>e.code==='ENOSPC');store.persist=originalPersist;assert.deepEqual(store.snapshot(),beforeFailure);record('D03','passed','Failed persistence does not advance visible state.');
 const replay=await store.mutate(actor,'durability.visibility',{type:'durability-check',id:'visibility'},{value:1},()=>{throw new Error('replay change must not execute');},{id:'durability-visibility'});assert.equal(replay.replayed,true);assert.equal(replay.receipt.revision,envelope.receipt.revision);record('D04','passed','Command replay resolves to the already-durable receipt.');
 assert.ok(store.persistence.db.prepare('SELECT COUNT(*) AS n FROM audit').get().n>=1);record('D05','passed','Audit is persisted in append-only rows, separate from mutable snapshot payload.');
 store.close(); // Close/checkpoint before copying real SQLite bytes into independent disposable roots.
 const trial=async(label,tamper,expected)=>{
  const isolated=await mkdtemp(path.join(tmpdir(),'ictc-store-forensic-'));
  try{
   const dbFile=path.join(isolated,'state.sqlite');await copyFile(path.join(root,'state.sqlite'),dbFile);
   if(tamper){const db=new DatabaseSync(dbFile);try{tamper(db);}finally{db.close();}}
   const inspected=new Store(isolated);
   try{
    if(expected){await assert.rejects(inspected.init(),error=>expected(error),label+' must fail closed');}
    else{await inspected.init();assert.equal(inspected.verifyChain().ok,true,label+' must preserve the original chain');}
   }finally{inspected.close();}
  }finally{await cleanupTempDir(isolated);}
 };
 await trial('untampered DB copy',null,null);record('D06','passed','Independent unmodified SQLite copy reopens and verifies its audit/state binding.');
 await trial('mutated snapshot payload',db=>{
  const payload=JSON.parse(db.prepare('SELECT payload FROM snapshot WHERE id=1').get().payload);
  payload.settings.organization.name='Tampered after durable commit';
  db.prepare('UPDATE snapshot SET payload=? WHERE id=1').run(JSON.stringify(payload));
 },error=>error.code==='state-head-mismatch');record('D07','passed','Semantically altered SQLite snapshot is rejected against the original audit HEAD.');
 await trial('mutated audit ledger',db=>{
  const last=db.prepare('SELECT revision,hash FROM audit ORDER BY revision DESC LIMIT 1').get();
  db.prepare('UPDATE audit SET hash=? WHERE revision=?').run('0'.repeat(64),last.revision);
 },error=>error.code==='sqlite-ledger-row-mismatch');record('D08','passed','Modified audit ledger row is rejected on restart.');
 const report={schemaVersion:'2.0.0',control:'W0-PERSIST',backend:'sqlite-wal',invariant:'persist-readback-before-visible',caseCount:cases.length,result:'passed',cases,limitations:['This check proves local SQLite persistence, verified copies and controlled corruption rejection in disposable roots.','It does not claim multi-process HA, backup/restore, RTO/RPO or external deployment durability.']};
 await mkdir(new URL('../../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../../artifacts/store-durability.json',import.meta.url),JSON.stringify(report,null,2));console.log(`store-durability-check: ok (cases=${cases.length}, backend=sqlite-wal)`);store.close();
}finally{await cleanupTempDir(root);}
