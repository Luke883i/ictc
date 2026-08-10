import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Store } from './store.mjs';
import { SqliteStatePersistence } from './sqlite-state-persistence.mjs';

const actor={id:'integrity-admin',role:'admin',permissions:[]};
async function fixture(){const root=await mkdtemp(path.join(tmpdir(),'ictc-semantic-root-')),store=await new Store(root).init(),item={id:'a-integrity',title:'Integrity',description:'bound',state:'open',createdBy:actor.id,owner:actor.id,updates:[],decisions:[],verifications:[]};await store.mutate(actor,'grc.action.created',{type:'action',id:item.id},{title:item.title},draft=>{draft.grcActions??=[];draft.grcActions.push(structuredClone(item));return{ok:true};},{id:`root-${Math.random()}`});store.close();return root;}
async function expectTamper(mutator,code){const root=await fixture();try{const db=new DatabaseSync(path.join(root,'state.sqlite'));mutator(db);db.close();const persistence=await new SqliteStatePersistence(root).init();try{assert.throws(()=>persistence.load(),error=>error?.code===code,`expected ${code}`);}finally{persistence.close();}}finally{await rm(root,{recursive:true,force:true});}}
const cleanRoot=await fixture();try{const p=await new SqliteStatePersistence(cleanRoot).init(),state=p.load(),bound=state.audit.find(event=>event.metadata?.semanticManifestSha256);assert.ok(bound,'business mutation must bind semantic manifest');assert.equal(typeof bound.metadata.semanticManifestSha256,'string');assert.equal(bound.metadata.semanticManifestSha256.length,64);const counts=p.semanticHistoryCounts();assert.ok(counts.boundEvents>=1);assert.ok(counts.steps>=1);p.close();}finally{await rm(cleanRoot,{recursive:true,force:true});}
await expectTamper(db=>{const row=db.prepare('SELECT sha256,payload_json FROM subject_payload LIMIT 1').get(),payload=JSON.parse(row.payload_json);payload.title='tampered';db.prepare('UPDATE subject_payload SET payload_json=? WHERE sha256=?').run(JSON.stringify(payload),row.sha256);},'semantic-payload-digest-mismatch');
await expectTamper(db=>{const row=db.prepare('SELECT id FROM subject_version LIMIT 1').get();db.prepare("UPDATE subject_version SET predecessor_id='tampered-predecessor' WHERE id=?").run(row.id);},'semantic-manifest-mismatch');
await expectTamper(db=>{const row=db.prepare('SELECT revision,payload_json FROM epistemic_step ORDER BY revision DESC LIMIT 1').get(),step=JSON.parse(row.payload_json);step.limitations=['tampered'];db.prepare('UPDATE epistemic_step SET payload_json=? WHERE revision=?').run(JSON.stringify(step),row.revision);},'epistemic-step-digest-mismatch');
console.log('semantic-integrity-root-check: ok (payload/occurrence/step tamper fail-closed)');
