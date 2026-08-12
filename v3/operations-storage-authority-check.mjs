import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [operations,data,persistence,store,runtimeStore]=await Promise.all([read('../docs/OPERATIONS.md'),read('../docs/DATA_AND_STORAGE.md'),read('./sqlite-state-persistence.mjs'),read('./store.mjs'),read('./runtime-store.mjs')]);
for(const [name,text] of [['OPERATIONS',operations],['DATA_AND_STORAGE',data]]){
  assert.match(text,/state\.sqlite/,`${name} must name current SQLite authority`);
  assert.match(text,/attachments\//,`${name} must name attachment storage`);
  assert.match(text,/quarantine\//,`${name} must name quarantine storage`);
  for(const token of ['ledger.jsonl','state.json'])for(const line of text.split(/\r?\n/).filter(x=>x.includes(token)))assert.match(line,/legacy|non (?:è|e)|ritirat|import/i,`${name} must mark ${token} retired/legacy wherever named: ${line}`);
}
for(const token of ['PRAGMA journal_mode=WAL','PRAGMA synchronous=FULL','CREATE TABLE IF NOT EXISTS snapshot','CREATE TABLE IF NOT EXISTS audit','CREATE TABLE IF NOT EXISTS subject_version','CREATE TABLE IF NOT EXISTS epistemic_step'])assert.ok(persistence.includes(token),`persistence authority missing ${token}`);
assert.ok(store.includes('SqliteStatePersistence'));assert.ok(store.includes('verifyReceiptAgainstState'));assert.ok(runtimeStore.includes('extends Store'));assert.match(operations,/recovery point|backup/i);assert.match(operations,/non sono RTO\/RPO approvati|non sono RTO\/RPO|non dimostrano off-host/i);assert.match(data,/restore avviene su staging vuoto|clean-target restore|target restore/i);assert.match(data,/AES-256-GCM/);
console.log(JSON.stringify({ok:true,authority:'v3/sqlite-state-persistence.mjs',runtimeAdapter:'v3/runtime-store.mjs',operationalConsumers:['docs/OPERATIONS.md','docs/DATA_AND_STORAGE.md'],retiredAuthorities:['ledger.jsonl','state.json'],implemented:['physical-quarantine','encrypted-recovery-point','clean-target-restore-verification'],claimBoundary:'Documentation and executable repository alignment prove E2 repository controls only; approved RTO/RPO, off-host durability and deployment key custody remain external.'}));
