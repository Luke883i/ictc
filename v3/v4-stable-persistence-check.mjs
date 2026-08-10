import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SqliteStatePersistence } from './sqlite-state-persistence.mjs';
const root=await mkdtemp(path.join(tmpdir(),'ictc-sqlite-ledger-'));
try{
 const p=await new SqliteStatePersistence(root).init();
 const at='2026-08-10T00:00:00.000Z';
 const events=Array.from({length:10001},(_,i)=>({id:`event-${i+1}`,revision:i+1,at,actorId:'system:test',role:'system',action:'test.persistence.event',subject:{type:'state',id:`s-${i+1}`},inputSha256:'0'.repeat(64),resultSha256:'1'.repeat(64),stateSha256:'2'.repeat(64),hash:(i+1).toString(16).padStart(64,'0'),previousHash:i?i.toString(16).padStart(64,'0'):'GENESIS',metadata:{}}));
 const state={schemaVersion:'test',revision:10001,settings:{},missions:[],runs:[],contributions:[],catalog:[],incidents:[],commandResults:{},subjectVersions:[],reviewNeeds:[],audit:events};
 const loaded=p.save(state);assert.equal(loaded.revision,10001);assert.equal(loaded.audit.length,10001);assert.equal(p.db.prepare('SELECT COUNT(*) AS n FROM audit').get().n,10001);assert.equal(p.db.prepare('SELECT COUNT(*) AS n FROM epistemic_step').get().n,10001,'every persisted audit transaction must have semantic lineage');
 const payload=p.db.prepare('SELECT payload FROM snapshot WHERE id=1').get().payload,parsed=JSON.parse(payload);assert.equal(parsed.audit,undefined);assert.equal(parsed.subjectVersions,undefined);assert.ok(payload.length<1200,'audit and semantic history must not be embedded in mutable snapshot');
 p.close();
 const legacyRoot=await mkdtemp(path.join(tmpdir(),'ictc-legacy-import-'));try{await writeFile(path.join(legacyRoot,'state.json'),JSON.stringify({schemaVersion:'test',revision:0,settings:{},missions:[],runs:[],contributions:[],catalog:[],incidents:[],commandResults:{},subjectVersions:[],audit:[]}));const q=await new SqliteStatePersistence(legacyRoot).init();const result=await q.importLegacyIfPresent();assert.equal(result.imported,true);await access(path.join(legacyRoot,'state.legacy-imported.json'));assert.equal(q.hasSnapshot(),true);q.close();}finally{await rm(legacyRoot,{recursive:true,force:true});}
 console.log('v4-stable-persistence-check: ok (audit+semantic ledger rows=10001; bounded snapshot; legacy migration=ok)');
}finally{await rm(root,{recursive:true,force:true});}
