import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [operations,data,persistence,store]=await Promise.all([read('../docs/OPERATIONS.md'),read('../docs/DATA_AND_STORAGE.md'),read('./sqlite-state-persistence.mjs'),read('./store.mjs')]);
for(const [name,text] of [['OPERATIONS',operations],['DATA_AND_STORAGE',data]]){
  assert.match(text,/state\.sqlite/,`${name} must name current SQLite authority`);
  assert.match(text,/attachments\//,`${name} must name attachment storage`);
  for(const token of ['ledger.jsonl','state.json'])for(const line of text.split(/\r?\n/).filter(x=>x.includes(token)))assert.match(line,/legacy|non (?:è|e)|ritirat|import/i,`${name} must mark ${token} retired/legacy wherever named: ${line}`);
}
for(const token of ['PRAGMA journal_mode=WAL','PRAGMA synchronous=FULL','CREATE TABLE IF NOT EXISTS snapshot','CREATE TABLE IF NOT EXISTS audit','CREATE TABLE IF NOT EXISTS subject_version','CREATE TABLE IF NOT EXISTS epistemic_step'])assert.ok(persistence.includes(token),`persistence authority missing ${token}`);
assert.ok(store.includes('SqliteStatePersistence'));assert.ok(store.includes('verifyReceiptAgainstState'));assert.match(operations,/non è un backup verificato/i);assert.match(data,/restore su host pulito/i);
console.log(JSON.stringify({ok:true,authority:'v3/sqlite-state-persistence.mjs',operationalConsumers:['docs/OPERATIONS.md','docs/DATA_AND_STORAGE.md'],retiredAuthorities:['ledger.jsonl','state.json'],claimBoundary:'Documentation alignment proves current repository guidance only; it does not prove backup/restore or deployment readiness.'}));
