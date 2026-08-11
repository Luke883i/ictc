import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildDemoDataset, demoDatasetViolations, DEMO_RECORDS_PER_PROCEDURE, DEMO_SEED_ID, seedFingerprint } from './runtime/demo-seed.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [launcher,server,adapters,dod,shell]=await Promise.all([read('../ictc.sh'),read('./server.mjs'),read('./runtime/procedure-adapters.mjs'),read('./procedure-dod.mjs'),read('./public/ui/stable-shell.js')]);
for(const token of ['demo','--demo-seed','ICTC_DEMO_SEED','demo-runtime'])assert.ok(launcher.includes(token),`launcher missing ${token}`);
assert.ok(server.includes("from './runtime/demo-seed.mjs'")&&server.includes('ensureDemoSeed'),'server demo seed gate missing');
assert.ok(server.includes("if(process.env.ICTC_DEMO_SEED==='1')return"),'demo mode must suppress autonomous scheduler activity');
for(const token of ['ictcDemoBanner','demoMode','DEMO · dati sintetici','scheduler operativo disabilitato','conclusione reale di compliance'])assert.ok(shell.includes(token),`demo shell disclosure missing ${token}`);
for(const id of ['monitoring','incidents','objects','coverage','actions','risks','assurance']){assert.ok(adapters.includes(`id:'${id}'`),`adapter missing ${id}`);assert.ok(dod.includes(`${id}:dod(`),`DoD missing ${id}`);}
assert.equal(DEMO_RECORDS_PER_PROCEDURE,100);assert.match(DEMO_SEED_ID,/pmi-italiana/);assert.match(seedFingerprint(),/^[a-f0-9]{64}$/);
const fixture={users:[{id:'local-admin',displayName:'Amministratore locale',role:'admin',status:'active'},{id:'local-user',displayName:'Utente locale',role:'user',status:'active'},{id:'local-auditor',displayName:'Auditor locale',role:'auditor',status:'active'}],settings:{organization:{name:'Organizzazione',jurisdictions:['Italia','Unione europea'],sectors:[]}}};const dataset=buildDemoDataset(fixture);assert.equal(dataset.primaryRecordCount,700);assert.deepEqual(Object.values(dataset.counts),Array(7).fill(100));assert.deepEqual(demoDatasetViolations(dataset),[]);for(const records of Object.values(dataset.records))for(const record of records){assert.equal(record.demo?.synthetic,true);assert.equal(Object.prototype.hasOwnProperty.call(record,'legalClassification'),false);assert.notEqual(record.proposalSource,'ai');}
console.log('demo-seed-contract-check: ok (isolated launcher / visible demo posture / canonical owners / 700 primary records / bounded authority)');
