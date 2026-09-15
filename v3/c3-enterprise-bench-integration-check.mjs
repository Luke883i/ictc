import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { setupEnterpriseBenchDatabase } from './runtime/enterprise-bench-database.mjs';
import { createEnterpriseBenchRuntime } from './runtime/enterprise-bench-runtime.mjs';
import { withTenantReadTransaction } from './runtime/postgres-enterprise-authority.mjs';

const digest=value=>createHash('sha256').update(Buffer.isBuffer(value)?value:Buffer.from(JSON.stringify(value))).digest('hex');
const env={...process.env};
if(!env.ICTC_ENTERPRISE_DATABASE_URL)throw new Error('ICTC_ENTERPRISE_DATABASE_URL required');
if(!env.ICTC_ENTERPRISE_RATE_SECRET)throw new Error('ICTC_ENTERPRISE_RATE_SECRET required');
await setupEnterpriseBenchDatabase({reset:true});
const replicaA=await createEnterpriseBenchRuntime({env:{...env,ICTC_ENTERPRISE_POOL_MAX:'12'}}),replicaB=await createEnterpriseBenchRuntime({env:{...env,ICTC_ENTERPRISE_POOL_MAX:'12'}});
const tenant='alpha',actorId='bench-user';
const subject=(id,type='risk')=>({type,id});
const write=(id,payload,expectedVersion=null,type='risk')=>({subject:subject(id,type),expectedVersion,payload,payloadSha256:digest(payload)});
const commit=(runtime,{commandId,id,payload,expectedVersion=null,type='risk',action='risk.bench',providerWork=[]})=>runtime.kernel.commit({tenantId:tenant,commandId,actorId,action,subjects:[write(id,payload,expectedVersion,type)],event:{source:'enterprise-bench-check'},providerWork});
try{
  assert.equal(replicaA.kernel.profile.complete,true);assert.equal(replicaB.kernel.profile.complete,true);
  const first=await commit(replicaA,{commandId:'cmd-first',id:'risk-first',payload:{score:1}});assert.equal(first.receipt.subjects[0].version,1);assert.equal(first.replayed,false);
  const cross=await replicaB.kernel.query({tenantId:tenant,subjectTypes:['risk'],limit:10});assert.ok(cross.records.some(item=>item.subject.id==='risk-first'));

  const noTenantRows=await replicaB.pool.query("SELECT count(*)::int AS c FROM ictc_subject_current WHERE tenant_id='alpha'");assert.equal(Number(noTenantRows.rows[0].c),0,'RLS must default deny without tenant context');
  const betaCannotSeeAlpha=await withTenantReadTransaction(replicaB.pool,'beta',async client=>Number((await client.query("SELECT count(*)::int AS c FROM ictc_subject_current WHERE tenant_id='alpha'")).rows[0].c));assert.equal(betaCannotSeeAlpha,0,'RLS must prevent cross-tenant reads');

  await commit(replicaA,{commandId:'cmd-occ-seed',id:'risk-occ',payload:{v:1}});
  const occ=await Promise.allSettled([
    commit(replicaA,{commandId:'cmd-occ-a',id:'risk-occ',payload:{v:2,writer:'a'},expectedVersion:1}),
    commit(replicaB,{commandId:'cmd-occ-b',id:'risk-occ',payload:{v:2,writer:'b'},expectedVersion:1})
  ]);
  assert.equal(occ.filter(item=>item.status==='fulfilled').length,1);assert.equal(occ.filter(item=>item.status==='rejected'&&item.reason?.code==='subject-version-conflict').length,1);

  const independent=await Promise.all([
    commit(replicaA,{commandId:'cmd-independent-a',id:'risk-independent-a',payload:{writer:'a'}}),
    commit(replicaB,{commandId:'cmd-independent-b',id:'risk-independent-b',payload:{writer:'b'}})
  ]);assert.equal(independent.length,2);

  const replayInput={commandId:'cmd-replay',id:'risk-replay',payload:{stable:true}};
  const replayResults=await Promise.all(Array.from({length:16},(_,index)=>commit(index%2?replicaA:replicaB,replayInput)));
  assert.equal(replayResults.filter(item=>item.replayed===false).length,1);assert.equal(replayResults.filter(item=>item.replayed===true).length,15);assert.equal(new Set(replayResults.map(item=>item.receipt.tenantRevision)).size,1);

  const asyncCommit=await commit(replicaA,{commandId:'cmd-provider',id:'risk-provider',payload:{provider:'queued'},providerWork:[{workKey:'provider-work-1',kind:'provider-evaluate',payload:{prompt:'bounded'}}]});assert.equal(asyncCommit.providerWork[0].state,'queued');
  const claims=await Promise.all([replicaA.kernel.claimWork({tenantId:tenant,ownerId:'worker-a',leaseMs:60000}),replicaB.kernel.claimWork({tenantId:tenant,ownerId:'worker-b',leaseMs:60000})]);
  const claimed=claims.find(Boolean),missed=claims.find(item=>item===null);assert.ok(claimed);assert.equal(missed,null);
  await assert.rejects(()=>replicaB.kernel.completeWork({tenantId:tenant,workKey:claimed.workKey,ownerId:'wrong-worker',fence:claimed.fence,result:{bad:true}}),error=>error?.code==='work-claim-fenced');
  const completed=await (claimed.ownerId==='worker-a'?replicaA:replicaB).kernel.completeWork({tenantId:tenant,workKey:claimed.workKey,ownerId:claimed.ownerId,fence:claimed.fence,result:{ok:true}});assert.equal(completed.state,'completed');

  const body=Buffer.from('ictc-enterprise-bench-shared-blob'),blobDigest=digest(body);
  await replicaA.kernel.putBlob({tenantId:tenant,attachmentId:'blob-1',digest:blobDigest,buffer:body,metadata:{kind:'bench'},state:'quarantine'});
  await replicaA.kernel.promoteBlob({tenantId:tenant,attachmentId:'blob-1',digest:blobDigest});
  const sharedBlob=await replicaB.kernel.getBlob({tenantId:tenant,attachmentId:'blob-1',digest:blobDigest,state:'clean'});assert.equal(Buffer.compare(sharedBlob.body,body),0);assert.equal(await replicaB.kernel.getBlob({tenantId:'beta',attachmentId:'blob-1',digest:blobDigest,state:'clean'}),null);

  const telemetry=await replicaA.kernel.emitTelemetry({tenantId:tenant,event:'bench_check',route:'/api/risks/:id',status:200,durationMs:7});assert.equal(telemetry.tenantId,tenant);assert.ok(await replicaB.telemetry.count(tenant)>=1);

  await Promise.all(Array.from({length:24},(_,index)=>commit(index%2?replicaA:replicaB,{commandId:`cmd-page-${index}`,id:`risk-page-${String(index).padStart(2,'0')}`,payload:{index}})));
  const page1=await replicaA.kernel.query({tenantId:tenant,subjectTypes:['risk'],limit:10}),page2=await replicaB.kernel.query({tenantId:tenant,subjectTypes:['risk'],limit:10,cursor:page1.nextCursor});assert.equal(page1.returned,10);assert.ok(page1.total>=24);assert.ok(page1.nextCursor);assert.equal(page2.returned,10);assert.equal(new Set([...page1.records,...page2.records].map(item=>item.subject.id)).size,20);

  const deltaSource=await commit(replicaA,{commandId:'cmd-delta',id:'risk-delta',payload:{delta:true}});assert.equal(replicaB.kernel.recover(deltaSource.delta.baseRevision,deltaSource.delta).action,'apply-delta');assert.equal(replicaB.kernel.recover(deltaSource.delta.targetRevision,deltaSource.delta).action,'noop');assert.equal(replicaB.kernel.recover(Math.max(0,deltaSource.delta.baseRevision-2),deltaSource.delta).action,'refetch');

  const audit=await withTenantReadTransaction(replicaB.pool,tenant,async client=>{const head=(await client.query('SELECT revision,audit_hash,state_root FROM ictc_tenant_head WHERE tenant_id=$1',[tenant])).rows[0],events=(await client.query('SELECT revision,hash,previous_hash,state_root FROM ictc_audit_event WHERE tenant_id=$1 ORDER BY revision',[tenant])).rows;return{head,events};});
  assert.equal(Number(audit.head.revision),audit.events.length);let previous='GENESIS';for(let index=0;index<audit.events.length;index++){const event=audit.events[index];assert.equal(Number(event.revision),index+1);assert.equal(event.previous_hash,previous);previous=event.hash;}assert.equal(previous,audit.head.audit_hash);assert.match(audit.head.state_root,/^[a-f0-9]{64}$/);

  const durableInput={commandId:'cmd-node-death',id:'risk-node-death',payload:{accepted:true}};const durable=await commit(replicaA,durableInput);await replicaA.close();const afterDeath=await replicaB.kernel.query({tenantId:tenant,subjectTypes:['risk'],limit:200});assert.ok(afterDeath.records.some(item=>item.subject.id==='risk-node-death'));const replayAfterDeath=await commit(replicaB,durableInput);assert.equal(replayAfterDeath.replayed,true);assert.equal(replayAfterDeath.receipt.tenantRevision,durable.receipt.tenantRevision);

  console.log(JSON.stringify({ok:true,slice:'C3-ENTERPRISE-BENCH-INTEGRATION',replicas:2,rlsDefaultDeny:true,subjectOcc:true,independentSubjectConcurrency:true,concurrentReplay:true,durableWorkFence:true,sharedBlobCrossReplica:true,externalTelemetryCrossReplica:true,boundedProjection:true,revisionGapRecovery:true,auditChainOrdered:true,nodeDeathDurability:true,tenantRevision:Number(audit.head.revision)}));
}finally{await replicaA.close().catch(()=>{});await replicaB.close().catch(()=>{});}
