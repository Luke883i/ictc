import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [launcher,server,demo,adapters,dod]=await Promise.all([
  read('../ictc.sh'),
  read('./server.mjs'),
  read('./runtime/demo-seed.mjs'),
  read('./runtime/procedure-adapters.mjs'),
  read('./procedure-dod.mjs')
]);
for(const token of ['demo','--demo-seed','ICTC_DEMO_SEED','demo-runtime'])assert.ok(launcher.includes(token),`launcher missing ${token}`);
assert.ok(server.includes("from './runtime/demo-seed.mjs'")&&server.includes('ensureDemoSeed'),'server demo seed gate missing');
for(const token of ['DEMO_SEED_ID','DEMO_RECORDS_PER_PROCEDURE=100','synthetic-demo','seedFingerprint','ensureDemoSeed','buildDemoDataset'])assert.ok(demo.includes(token),`demo seed contract missing ${token}`);
for(const id of ['monitoring','incidents','objects','coverage','actions','risks','assurance']){
  assert.ok(adapters.includes(`id:'${id}'`),`adapter missing ${id}`);
  assert.ok(dod.includes(`${id}:dod(`),`DoD missing ${id}`);
}
assert.equal(demo.includes('legalClassification'),false,'demo seed must not create a legal classification');
console.log('demo-seed-contract-check: ok');
