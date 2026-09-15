import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import pg from 'pg';
import { setupEnterpriseBenchDatabase } from './runtime/enterprise-bench-database.mjs';
import { signIngressRateDecision } from './runtime/enterprise-edge-authorities.mjs';
const { Pool }=pg;
const databaseUrl=process.env.ICTC_ENTERPRISE_DATABASE_URL,adminDatabaseUrl=process.env.ICTC_ENTERPRISE_ADMIN_DATABASE_URL,secret=process.env.ICTC_ENTERPRISE_RATE_SECRET;
if(!databaseUrl||!adminDatabaseUrl||!secret)throw new Error('Enterprise bench database/admin/rate env required');
await setupEnterpriseBenchDatabase({reset:true});
const ports=[4711,4712],children=[];
const percentile=(values,p)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.max(0,Math.ceil(sorted.length*p)-1))]||0;};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function spawnReplica(port){const child=spawn(process.execPath,['v3/enterprise-bench-server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,ICTC_ENTERPRISE_BENCH_PORT:String(port),ICTC_ENTERPRISE_POOL_MAX:'16'},stdio:['ignore','pipe','pipe']});children.push(child);let stderr='';child.stderr.on('data',chunk=>{stderr+=chunk.toString();});const ready=new Promise((resolve,reject)=>{let buffer='';const timer=setTimeout(()=>reject(new Error(`Replica ${port} startup timeout: ${stderr}`)),20000);child.stdout.on('data',chunk=>{buffer+=chunk.toString();for(const line of buffer.split('\n')){if(line.includes('ictc-enterprise-bench-listening')){clearTimeout(timer);resolve();return;}}});child.once('exit',code=>{clearTimeout(timer);reject(new Error(`Replica ${port} exited ${code}: ${stderr}`));});});return{child,ready,getStderr:()=>stderr};}
function attestation(tenantId,subject){return signIngressRateDecision({secret,tenantId,subject,scope:'authenticated',allowed:true,remaining:100000,retryAfterSeconds:0,expiresAt:Date.now()+55000});}
function rateHeader(tenantId,subject){return Buffer.from(JSON.stringify(attestation(tenantId,subject))).toString('base64url');}
async function request(port,path,{method='GET',body=null,tenantId='bench-system',subject='bench-user'}={}){const started=performance.now(),headers={};if(body!=null){headers['content-type']='application/json';headers['x-ictc-rate-attestation']=rateHeader(tenantId,subject);}const response=await fetch(`http://127.0.0.1:${port}${path}`,{method,headers,body:body==null?undefined:JSON.stringify(body)}),text=await response.text();let payload;try{payload=JSON.parse(text);}catch{payload={raw:text};}return{status:response.status,payload,durationMs:performance.now()-started};}
async function commit(index,{tenantId=`tenant-${String(index%20).padStart(2,'0')}`,port=ports[index%2],commandId=`fleet-${index}`,subjectId=`risk-fleet-${index}`,actorId=`user-${index}`,expectedVersion=null,payload={index}}={}){return request(port,'/commit',{method:'POST',tenantId,subject:actorId,body:{tenantId,commandId,actorId,action:'risk.bench.load',subjects:[{subject:{type:'risk',id:subjectId},expectedVersion,payload}]}});}
try{
  const replicas=ports.map(spawnReplica);await Promise.all(replicas.map(item=>item.ready));
  for(const port of ports){const health=await request(port,'/health');assert.equal(health.status,200);assert.equal(health.payload.posture.benchReady,true);assert.equal(health.payload.posture.operationalReady,false);}

  const fleet=await Promise.all(Array.from({length:1000},(_,index)=>commit(index)));
  const fleetFailures=fleet.filter(item=>item.status!==200);assert.deepEqual(fleetFailures.slice(0,3),[],'1000-client fleet canary must have no failed point writes');
  const fleetP95=percentile(fleet.map(item=>item.durationMs),.95),fleetP99=percentile(fleet.map(item=>item.durationMs),.99);assert.ok(fleetP95<5000,`fleet canary p95 pathological: ${fleetP95}`);

  const hotTenant='hot-tenant',hot=await Promise.all(Array.from({length:200},(_,index)=>commit(1000+index,{tenantId:hotTenant,commandId:`hot-${index}`,subjectId:`risk-hot-${index}`,actorId:`hot-user-${index}`})));
  assert.equal(hot.filter(item=>item.status===200).length,200);const hotP95=percentile(hot.map(item=>item.durationMs),.95);assert.ok(hotP95<5000,`hot tenant canary p95 pathological: ${hotP95}`);

  const contention=await Promise.all(Array.from({length:32},(_,index)=>commit(2000+index,{tenantId:'contention',commandId:`contention-${index}`,subjectId:'risk-one',actorId:`contender-${index}`,expectedVersion:null,payload:{writer:index}})));
  assert.equal(contention.filter(item=>item.status===200).length,1);assert.equal(contention.filter(item=>item.status===409&&item.payload.code==='subject-version-conflict').length,31);

  const replayBody={tenantId:'replay-tenant',commandId:'replay-command',actorId:'replay-user',action:'risk.bench.load',subjects:[{subject:{type:'risk',id:'risk-replay'},expectedVersion:null,payload:{same:true}}]};
  const replay=await Promise.all(Array.from({length:32},(_,index)=>request(ports[index%2],'/commit',{method:'POST',tenantId:'replay-tenant',subject:'replay-user',body:replayBody})));
  assert.equal(replay.filter(item=>item.status===200).length,32);assert.equal(replay.filter(item=>item.payload.replayed===false).length,1);assert.equal(replay.filter(item=>item.payload.replayed===true).length,31);assert.equal(new Set(replay.map(item=>item.payload.receipt.tenantRevision)).size,1);

  const blobBody=Buffer.from('ictc-http-cross-replica-blob'),blobDigest=createHash('sha256').update(blobBody).digest('hex'),blobInput={tenantId:'blob-tenant',attachmentId:'blob-http-1',digest:blobDigest,dataBase64:blobBody.toString('base64'),metadata:{source:'http-canary'},state:'quarantine',subject:'blob-user'};
  assert.equal((await request(ports[0],'/blob/put',{method:'POST',tenantId:'blob-tenant',subject:'blob-user',body:blobInput})).status,200);assert.equal((await request(ports[0],'/blob/promote',{method:'POST',tenantId:'blob-tenant',subject:'blob-user',body:{tenantId:'blob-tenant',attachmentId:'blob-http-1',digest:blobDigest,subject:'blob-user'}})).status,200);const blobRead=await request(ports[1],`/blob?tenantId=blob-tenant&attachmentId=blob-http-1&digest=${blobDigest}&state=clean`);assert.equal(blobRead.status,200);assert.equal(Buffer.from(blobRead.payload.dataBase64,'base64').toString(),blobBody.toString());

  const accepted=await commit(3000,{tenantId:'death-tenant',port:ports[0],commandId:'accepted-before-death',subjectId:'risk-before-death',actorId:'death-user',payload:{durable:true}});assert.equal(accepted.status,200);
  replicas[0].child.kill('SIGTERM');await new Promise(resolve=>replicas[0].child.once('exit',resolve));await sleep(100);
  const afterDeath=await request(ports[1],'/projection?tenantId=death-tenant&type=risk&limit=200');assert.equal(afterDeath.status,200);assert.ok(afterDeath.payload.records.some(item=>item.subject.id==='risk-before-death'));

  const admin=new Pool({connectionString:adminDatabaseUrl,max:2});const counts=await admin.query('SELECT (SELECT count(*)::int FROM ictc_command_result) commands,(SELECT count(*)::int FROM ictc_audit_event) events,(SELECT count(*)::int FROM ictc_subject_current) subjects');await admin.end();assert.equal(Number(counts.rows[0].commands),Number(counts.rows[0].events));assert.ok(Number(counts.rows[0].commands)>=1203);

  console.log(JSON.stringify({ok:true,slice:'C3-ENTERPRISE-BENCH-HTTP-1000',concurrentClients:1000,replicas:2,fleetWrites:1000,fleetP95Ms:Number(fleetP95.toFixed(2)),fleetP99Ms:Number(fleetP99.toFixed(2)),hotTenantConcurrentWrites:200,hotTenantP95Ms:Number(hotP95.toFixed(2)),sameSubject:{attempts:32,accepted:1,conflicts:31},concurrentReplay:{attempts:32,committedEffects:1,replays:31},crossReplicaBlob:true,acceptedWriteSurvivesReplicaDeath:true,claimBoundary:'CI-local PostgreSQL concurrency canary; not production capacity evidence.'}));
}finally{for(const child of children)if(!child.killed)child.kill('SIGTERM');}
