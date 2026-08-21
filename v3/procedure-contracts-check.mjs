import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canonicalProcedureRegistry } from './runtime/procedure-registry.mjs';
import { canonicalProcedureContracts, procedureContractProjection } from './runtime/procedure-contracts.mjs';

const snapshot=JSON.parse(await readFile(new URL('./procedure-contracts-1-3.json',import.meta.url),'utf8'));
assert.equal(snapshot.schemaVersion,'1.3.0');
assert.equal(snapshot.authority,'canonical-procedure-registry');
assert.equal(snapshot.procedures.length,7);
assert.deepEqual(snapshot.procedures.map(x=>x.code),['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01']);
assert.deepEqual(snapshot.commonSubstrate.epistemicFamilies,['observed','derived','proposed','decided','attested']);
assert.equal(snapshot.commonSubstrate.disclosure.length,5);

const current=canonicalProcedureContracts(),projection=procedureContractProjection(),registry=canonicalProcedureRegistry(),fingerprints=new Set();
for(const p of current){
  for(const key of ['purpose','entryPoints','stateModel','transitions','humanCheckpoints','accessPolicy','evidencePolicy','metrics','ux','aiSupport','claimBoundary','exit']) assert.ok(p[key],`${p.code} missing ${key}`);
  assert.ok(p.entryPoints.length);
  assert.ok(p.transitions.length);
  assert.ok(p.transitions.every(t=>t.id&&Array.isArray(t.from)&&t.to),`${p.code} transition not structured`);
  assert.equal(new Set(p.metrics.map(x=>x.id)).size,p.metrics.length);
  assert.ok(p.metrics.every(x=>x.drilldown&&x.claimBoundary));
  assert.ok((p.ux.firstScreen||[]).length<=4);
  assert.ok(p.aiSupport.allowed.length&&p.aiSupport.forbidden.length);
  fingerprints.add(JSON.stringify(p.stateModel));
}
assert.equal(fingerprints.size,7,'process-specific state models must remain distinct');

const mc=current.find(x=>x.id==='coverage');
assert.equal(mc.label,'Standard e Controlli');
assert.deepEqual(mc.stateModel.scope,['applicable','not-applicable','unknown','deferred']);
assert.deepEqual(mc.stateModel.mapping,['proposed','mapped','gap','rejected']);
assert.deepEqual(mc.stateModel.organizationalUse,['tracked','reference','not-used','undeclared']);
assert.equal(mc.metrics.find(x=>x.id==='scope').label,'Standard tracciati');
assert.equal(mc.metrics.find(x=>x.id==='notAssessed').label,'Uso non dichiarato');

const monitoring=current.find(x=>x.id==='monitoring');
const activate=monitoring.transitions.find(x=>x.id==='activate');
assert.equal(monitoring.ux.primaryAction,'Aggiungi materiale');
assert.equal(activate.human,true);
assert.equal(activate.reasonRequired,false,'RN activation must match the implemented explicit-human checkpoint without inventing a rationale field');
assert.match(activate.implementationBoundary,/human activation/i);
assert.ok(current.find(x=>x.id==='incidents').entryPoints.includes('near-miss'));

assert.equal(projection.schemaVersion,'1.3.0');
assert.equal(projection.compatibility.semanticRevision,'semantic-closure-2.8');
assert.ok(projection.commonSubstrate.projection.includes('transactionAsOf')&&projection.commonSubstrate.projection.includes('validAsOf'));
assert.deepEqual(registry.procedures.map(x=>x.transitions),current.map(x=>x.transitions),'canonical transitions must survive registry composition without destructive compatibility transform');
assert.deepEqual(registry.procedures.map(x=>x.metrics),current.map(x=>x.metrics),'canonical MetricSpec objects must survive registry composition');
assert.ok(registry.procedures.every(x=>x.transitionIds.length===x.transitions.length&&x.metricIds.length===x.metrics.length));

console.log('procedure-contracts-check: ok (1.3 wire compatibility + semantic closure 2.8 normalization + seven process-specific state models)');
