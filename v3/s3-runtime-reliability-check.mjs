import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { SqliteStatePersistence } from './sqlite-state-persistence.mjs';
import { HardenedSqliteStatePersistence, RUNTIME_STORAGE_SCHEMA_VERSION, runtimeStorageCompatibility } from './runtime/hardened-persistence.mjs';
import { assertPersistenceCapability, persistenceCapabilityProjection } from './runtime/persistence-capability.mjs';
import { evaluateRuntimeSlo } from './runtime/reliability-slo.mjs';
import { evaluateApiReliability } from './runtime/api-reliability.mjs';
import { cleanupTempDir } from './runtime-temp-cleanup.mjs';

const here=path.dirname(new URL(import.meta.url).pathname),repoRoot=path.dirname(here),tmp=await mkdtemp(path.join(os.tmpdir(),'ictc-s3-runtime-'));
const actor={id:'s3-check',role:'admin',permissions:[]};
const state=()=>({schemaVersion:'2.4.0',revision:0,settings:{},missions:[],runs:[],contributions:[],catalog:[],incidents:[],subjectVersions:[],reviewNeeds:[],audit:[],commandResults:{'cmd-1':{actorId:actor.id,action:'s3.test',envelope:{result:{ok:true},receipt:{eventId:'none'}},storedAt:'2026-09-04T00:00:00.000Z'}}});
let phase='bootstrap';
const mark=value=>{phase=value;console.log(`s3-runtime-reliability:phase ${value}`);};

try{
  mark('persistence-capability');
  assert.throws(()=>assertPersistenceCapability({init(){}}),e=>e.code==='persistence-capability-incomplete');

  mark('sqlite-restart-command-ledger');
  const baseRoot=path.join(tmp,'base'),base=new SqliteStatePersistence(baseRoot);
  assert.equal(assertPersistenceCapability(base).complete,true);
  await base.init();
  base.save(state());
  assert.equal(base.findCommandResult('cmd-1').actorId,actor.id);
  base.close();
  const reopened=new SqliteStatePersistence(baseRoot);
  await reopened.init();
  assert.equal(reopened.load().revision,0);
  assert.equal(reopened.findCommandResult('cmd-1').action,'s3.test');
  reopened.close();

  mark('storage-migration-upgrade');
  const preUpgrade=path.join(tmp,'pre-upgrade.sqlite');
  await copyFile(path.join(baseRoot,'state.sqlite'),preUpgrade);
  const hardened=new HardenedSqliteStatePersistence(baseRoot);
  assert.equal(assertPersistenceCapability(hardened).complete,true);
  await hardened.init();
  assert.equal(hardened.runtimeStoragePosture().storageSchemaVersion,RUNTIME_STORAGE_SCHEMA_VERSION);
  assert.equal(runtimeStorageCompatibility(1).action,'upgrade');
  assert.equal(runtimeStorageCompatibility(RUNTIME_STORAGE_SCHEMA_VERSION).action,'current');
  assert.equal(runtimeStorageCompatibility(RUNTIME_STORAGE_SCHEMA_VERSION+1).action,'refuse');
  hardened.close();

  mark('storage-rollback-reopen');
  await copyFile(preUpgrade,path.join(baseRoot,'state.sqlite'));
  const rollbackReopen=new HardenedSqliteStatePersistence(baseRoot);
  await rollbackReopen.init();
  assert.equal(rollbackReopen.findCommandResult('cmd-1').actorId,actor.id);
  rollbackReopen.close();

  mark('storage-future-version-refusal');
  const futureRoot=path.join(tmp,'future'),future=new HardenedSqliteStatePersistence(futureRoot);
  await future.init();
  future.db.prepare("UPDATE meta SET value=? WHERE key='runtime-storage-schema-version'").run(String(RUNTIME_STORAGE_SCHEMA_VERSION+1));
  future.close();
  const futureOpen=new HardenedSqliteStatePersistence(futureRoot);
  await assert.rejects(()=>futureOpen.init(),e=>e.code==='runtime-storage-version-too-new');
  futureOpen.close();

  mark('storage-schema-drift-refusal');
  const driftRoot=path.join(tmp,'drift'),drift=new HardenedSqliteStatePersistence(driftRoot);
  await drift.init();
  drift.db.exec('DROP TABLE scheduler_claim');
  drift.close();
  const driftOpen=new HardenedSqliteStatePersistence(driftRoot);
  await assert.rejects(()=>driftOpen.init(),e=>e.code==='runtime-storage-schema-drift');
  driftOpen.close();

  mark('scheduler-fencing');
  const schedulerRoot=path.join(tmp,'scheduler'),p1=new HardenedSqliteStatePersistence(schedulerRoot),p2=new HardenedSqliteStatePersistence(schedulerRoot);
  await p1.init();
  await p2.init();
  const at='2098-01-01T00:00:00.000Z',due='2098-01-01T00:00:00.000Z',a=p1.claimSchedulerWork({workKey:'monitoring:m1',dueAt:due,ownerId:'node-a',leaseMs:120000,at});
  assert.equal(a.claimed,true);
  const self=p1.claimSchedulerWork({workKey:'monitoring:m1',dueAt:due,ownerId:'node-a',leaseMs:120000,at:'2098-01-01T00:00:30.000Z'});
  assert.equal(self.claimed,false);
  assert.equal(self.replayed,true);
  const held=p2.claimSchedulerWork({workKey:'monitoring:m1',dueAt:due,ownerId:'node-b',leaseMs:120000,at:'2098-01-01T00:01:00.000Z'});
  assert.equal(held.claimed,false);
  const b=p2.claimSchedulerWork({workKey:'monitoring:m1',dueAt:due,ownerId:'node-b',leaseMs:120000,at:'2098-01-01T00:02:01.000Z'});
  assert.equal(b.claimed,true);
  assert.equal(b.fence,a.fence+1);
  assert.throws(()=>p1.assertSchedulerClaim(a,{at:'2098-01-01T00:02:02.000Z'}),e=>e.code==='scheduler-claim-fenced');
  assert.equal(p2.assertSchedulerClaim(b,{at:'2098-01-01T00:02:02.000Z'}),true);
  p2.releaseSchedulerWork(b,{at:'2098-01-01T00:02:03.000Z'});
  assert.throws(()=>p2.assertSchedulerClaim(b,{at:'2098-01-01T00:02:04.000Z'}),e=>e.code==='scheduler-claim-released');
  const next=p1.claimSchedulerWork({workKey:'monitoring:m1',dueAt:'2098-01-01T01:00:00.000Z',ownerId:'node-c',leaseMs:120000,at:'2098-01-01T01:00:00.000Z'});
  assert.equal(next.fence,b.fence+1);
  p1.close();
  p2.close();

  mark('api-reliability');
  const [openApiText,httpSource,latticeSource,serverSource,runtimeStoreSource,recoverySource]=await Promise.all([
    readFile(path.join(repoRoot,'docs/openapi.yaml'),'utf8'),
    readFile(path.join(here,'runtime/http.mjs'),'utf8'),
    readFile(path.join(here,'runtime/epistemic-lattice.mjs'),'utf8'),
    readFile(path.join(here,'server.mjs'),'utf8'),
    readFile(path.join(here,'runtime-store.mjs'),'utf8'),
    readFile(path.join(here,'runtime/recovery.mjs'),'utf8')
  ]);
  const api=evaluateApiReliability({openApiText,httpSource,latticeSource,serverSource});
  assert.equal(api.ok,true,api.violations.join(','));
  assert.ok(serverSource.includes('claimSchedulerWork')&&serverSource.includes('withSchedulerClaim')&&serverSource.includes('releaseSchedulerWork'));
  assert.ok(runtimeStoreSource.includes('schedulerExecution')&&runtimeStoreSource.includes('assertSchedulerClaim'));
  assert.ok(recoverySource.includes('restoreEncryptedRecoveryPoint'));

  mark('api-mounted-contract');
  const apiContract=spawnSync(process.execPath,[path.join(here,'api-contract-check.mjs')],{cwd:repoRoot,encoding:'utf8',env:process.env,timeout:90_000,killSignal:'SIGKILL'});
  const apiContractOutput=`${apiContract.stdout||''}\n${apiContract.stderr||''}`;
  if(apiContractOutput.trim())process.stdout.write(apiContractOutput.endsWith('\n')?apiContractOutput:`${apiContractOutput}\n`);
  if(apiContract.error)throw Object.assign(new Error(`API contract checker spawn failed: ${apiContract.error.code||apiContract.error.message}`),{code:'api-contract-spawn-failed'});
  if(apiContract.status!==0){const line=apiContractOutput.split(/\r?\n/).map(value=>value.trim()).find(value=>value.includes('API contract drift'))||apiContractOutput.split(/\r?\n/).map(value=>value.trim()).filter(Boolean).at(-1)||`exit ${apiContract.status}`;throw Object.assign(new Error(`API contract drift: ${line}`),{code:'api-contract-drift'});}

  mark('runtime-slo');
  const good={counters:{requestsTotal:1000,errorsTotal:2,rateLimitedTotal:5},durationMsBuckets:{'5':100,'25':200,'100':300,'250':250,'500':100,'1000':50,'2500':0,'5000':0,'10000':0,'+Inf':0}};
  const badErrors={counters:{requestsTotal:1000,errorsTotal:20,rateLimitedTotal:5},durationMsBuckets:{'5':100,'25':200,'100':300,'250':250,'500':100,'1000':50,'2500':0,'5000':0,'10000':0,'+Inf':0}};
  const badLatency={counters:{requestsTotal:1000,errorsTotal:0,rateLimitedTotal:0},durationMsBuckets:{'5':0,'25':0,'100':0,'250':0,'500':0,'1000':0,'2500':900,'5000':100,'10000':0,'+Inf':0}};
  assert.equal(evaluateRuntimeSlo(good).status,'within-budget');
  assert.equal(evaluateRuntimeSlo(badErrors).status,'budget-exhausted');
  assert.ok(evaluateRuntimeSlo(badErrors).violations.includes('server-error-rate'));
  assert.equal(evaluateRuntimeSlo(badLatency).status,'budget-exhausted');
  assert.ok(evaluateRuntimeSlo(badLatency).violations.includes('p95-latency'));
  assert.equal(evaluateRuntimeSlo({counters:{requestsTotal:10,errorsTotal:10,rateLimitedTotal:0},durationMsBuckets:{'5':10}}).status,'insufficient-sample');

  mark('complete');
  console.log(JSON.stringify({ok:true,suite:'s3-runtime-reliability',persistence:{base:persistenceCapabilityProjection(new SqliteStatePersistence(tmp)).complete,hardened:true,schemaVersion:RUNTIME_STORAGE_SCHEMA_VERSION,rollback:'restore-pre-migration-recovery-point'},scheduler:{durableClaim:true,fencing:true,restartOverlap:true,dueVersionBound:true},api:{baselineBound:true,mountedParity:true,jsonWriteBound:8000000,paginationMax:200},slo:{internal:true,minimumRequests:100},claimBoundary:'Repository-bounded S3 reliability contract. No HA, enterprise-ready, approved RTO/RPO, or production SLO claim.'}));
}catch(error){
  console.error(JSON.stringify({ok:false,suite:'s3-runtime-reliability',phase,code:error?.code||null,name:error?.name||null,message:error?.message||String(error)},null,2));
  throw error;
}finally{
  await cleanupTempDir(tmp);
}
