import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import pg from 'pg';
import { setupEnterpriseBenchDatabase } from './runtime/enterprise-bench-database.mjs';
import { signIngressRateDecision } from './runtime/enterprise-edge-authorities.mjs';

const { Pool }=pg;
const databaseUrl=process.env.ICTC_ENTERPRISE_DATABASE_URL,adminDatabaseUrl=process.env.ICTC_ENTERPRISE_ADMIN_DATABASE_URL,secret=process.env.ICTC_ENTERPRISE_RATE_SECRET;
const stage=process.argv[2]||'all';
if(!databaseUrl||!adminDatabaseUrl||!secret)throw new Error('Enterprise bench database/admin/rate env required');
const ports=[4711,4712],children=[];
const percentile=(values,p)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.max(0,Math.ceil(sorted.length*p)-1))]||0;};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function spawnReplica(port){
  const child=spawn(process.execPath,['v3/enterprise-bench-server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,ICTC_ENTERPRISE_BENCH_PORT:String(port),ICTC_ENTERPRISE_POOL_MAX:'16'},stdio:['ignore','pipe','pipe']});
  children.push(child);let stderr='',buffer='';child.stderr.on('data',chunk=>{stderr+=chunk.toString();});
  const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`Replica ${port} startup timeout: ${stderr}`)),20000);child.stdout.on('data',chunk=>{buffer+=chunk.toString();let newline;while((newline=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,newline);buffer=buffer.slice(newline+1);if(line.includes('ictc-enterprise-bench-listening')){clearTimeout(timer);resolve();return;}}});child.once('exit',code=>{clearTimeout(timer);reject(new Error(`Replica ${port} exited ${code}: ${stderr}`));});});
  return{child,ready,getStderr:()=>stderr};
}
async function stopChildren(){await Promise.all(children.map(child=>new Promise(resolve=>{if(child.exitCode!==null||child.signalCode!==null){resolve();return;}const timer=setTimeout(()=>{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');},2000);timer.unref?.();child.once('exit',()=>{clearTimeout(timer);resolve();});child.kill('SIGTERM');})));}
function attestation(tenantId,subject){return signIngressRateDecision({secret,tenantId,subject,scope:'authenticated',allowed:true,remaining:100000,retryAfterSeconds:0,expiresAt:Date.now()+55000});}
function rateHeader(tenantId,subject){return Buffer.from(JSON.stringify(attestation(tenantId,subject))).toString('base64url');}
async function request(port,path,{method='GET',body=null,tenantId='bench-system',subject='bench-user'}={}){const started=performance.now(),headers={};if(body!=null){headers['content-type']='application/json';headers['x-ictc-rate-attestation']=rateHeader(tenantId,subject);}const response=await fetch(`http://127.0.0.1:${port}${path}`,{method,headers,body:body==null?undefined:JSON.stringify(body)}),text=await response.text();let payload;try{payload=JSON.parse(text);}catch{payload={raw:text};}return{status:response.status,payload,durationMs:performance.now()-started};}
async function commit(index,{tenantId=`tenant-${String(index%20).padStart(2,'0')}`,port=ports[index%2],commandId=`fleet-${index}`,subjectId=`risk-fleet-${index}`,actorId=`user-${index}`,expectedVersion=null,payload={index}}={}){return request(port,'/commit',{method:'POST',tenantId,subject:actorId,body:{tenantId,commandId,actorId,action:'risk.bench.load',subjects:[{subject:{type:'risk',id:subjectId},expectedVersion,payload}]}});}
async function health(){for(const port of ports){const result=await request(port,'/health');assert.equal(result.status,200);assert.equal(result.payload.posture.benchReady,true);assert.equal(result.payload.posture.operationalReady,false);}return{replicas:2};}
async function fleet1000({checkStatus=true,checkLatency=true}={}){const fleet=await Promise.all(Array.from({length:1000},(_,index)=>commit(index))),failures=fleet.filter(item=>item.status!==200),p95=percentile(fleet.map(item=>item.durationMs),.95),p99=percentile(fleet.map(item=>item.durationMs),.99);if(checkStatus)assert.deepEqual(failures.slice(0,3),[],'1000-client fleet canary must have no failed point writes');if(checkLatency)assert.ok(p95<5000,`fleet canary p95 pathological: ${p95}`);return{writes:1000,failures:failures.length,p95Ms:Number(p95.toFixed(2)),p99Ms:Number(p99.toFixed(2))};}
async function hot200(){const tenantId='hot-tenant',hot=await Promise.all(Array.from({length:200},(_,index)=>commit(1000+index,{tenantId,commandId:`hot-${index}`,subjectId:`risk-hot-${index}`,actorId:`hot-user-${index}`}))),accepted=hot.filter(item=>item.status===200).length,p95=percentile(hot.map(item=>item.durationMs),.95);assert.equal(accepted,200);assert.ok(p95<5000,`hot tenant canary p95 pathological: ${p95}`);return{writes:200,accepted,p95Ms:Number(p95.toFixed(2))};}
async function contention32(){const results=await Promise.all(Array.from({length:32},(_,index)=>commit(2000+index,{tenantId:'contention',commandId:`contention-${index}`,subjectId:'risk-one',actorId:`contender-${index}`,expectedVersion:null,payload:{writer:index}}))),accepted=results.filter(item=>item.status===200).length,conflicts=results.filter(item=>item.status===409&&item.payload.code==='subject-version-conflict').length;assert.equal(accepted,1);assert.equal(conflicts,31);return{attempts:32,accepted,conflicts};}
async function replay32(){const body={tenantId:'replay-tenant',commandId:'replay-command',actorId:'replay-user',action:'risk.bench.load',subjects:[{subject:{type:'risk',id:'risk-replay'},expectedVersion:null,payload:{same:true}}]},results=await Promise.all(Array.from({length:32},(_,index)=>request(ports[index%2],'/commit',{method:'POST',tenantId:'replay-tenant',subject:'replay-user',body}))),accepted=results.filter(item=>item.status===200).length,committed=results.filter(item=>item.payload.replayed===false).length,replayed=results.filter(item=>item.payload.replayed===true).length,revisions=new Set(results.filter(item=>item.status===200).map(item=>item.payload.receipt?.tenantRevision));assert.equal(accepted,32);assert.equal(committed,1);assert.equal(replayed,31);assert.equal(revisions.size,1);return{attempts:32,accepted,committedEffects:committed,replays:replayed};}
async function blobCrossReplica(){const body=Buffer.from('ictc-http-cross-replica-blob'),digest=createHash('sha256').update(body).digest('hex'),input={tenantId:'blob-tenant',attachmentId:'blob-http-1',digest,dataBase64:body.toString('base64'),metadata:{source:'http-canary'},state:'quarantine',subject:'blob-user'};assert.equal((await request(ports[0],'/blob/put',{method:'POST',tenantId:'blob-tenant',subject:'blob-user',body:input})).status,200);assert.equal((await request(ports[0],'/blob/promote',{method:'POST',tenantId:'blob-tenant',subject:'blob-user',body:{tenantId:'blob-tenant',attachmentId:'blob-http-1',digest,subject:'blob-user'}})).status,200);const read=await request(ports[1],`/blob?tenantId=blob-tenant&attachmentId=blob-http-1&digest=${digest}&state=clean`);assert.equal(read.status,200);assert.equal(Buffer.from(read.payload.dataBase64,'base64').toString(),body.toString());return{crossReplica:true};}
async function replicaDeath(replicas){const accepted=await commit(3000,{tenantId:'death-tenant',port:ports[0],commandId:'accepted-before-death',subjectId:'risk-before-death',actorId:'death-user',payload:{durable:true}});assert.equal(accepted.status,200);replicas[0].child.kill('SIGTERM');if(replicas[0].child.exitCode===null&&replicas[0].child.signalCode===null)await new Promise(resolve=>replicas[0].child.once('exit',resolve));await sleep(100);const after=await request(ports[1],'/projection?tenantId=death-tenant&type=risk&limit=200');assert.equal(after.status,200);assert.ok(after.payload.records.some(item=>item.subject.id==='risk-before-death'));return{acceptedWriteSurvivesReplicaDeath:true};}
async function countLedger(minimum){const admin=new Pool({connectionString:adminDatabaseUrl,max:2});try{const counts=await admin.query('SELECT (SELECT count(*)::int FROM ictc_command_result) commands,(SELECT count(*)::int FROM ictc_audit_event) events,(SELECT count(*)::int FROM ictc_subject_current) subjects'),row=counts.rows[0];assert.equal(Number(row.commands),Number(row.events));assert.ok(Number(row.commands)>=minimum);return{commands:Number(row.commands),events:Number(row.events),subjects:Number(row.subjects)};}finally{await admin.end();}}

await setupEnterpriseBenchDatabase({reset:true});
const replicas=ports.map(spawnReplica);
try{
  await Promise.all(replicas.map(item=>item.ready));
  const result={stage,...await health()};
  if(stage==='health')Object.assign(result,{ok:true});
  else if(stage==='fleet-status')Object.assign(result,await fleet1000({checkStatus:true,checkLatency:false}),{ok:true});
  else if(stage==='fleet-latency')Object.assign(result,await fleet1000({checkStatus:false,checkLatency:true}),{ok:true});
  else if(stage==='fleet')Object.assign(result,await fleet1000(),{ok:true});
  else if(stage==='hot')Object.assign(result,await hot200(),{ok:true});
  else if(stage==='contention')Object.assign(result,await contention32(),{ok:true});
  else if(stage==='replay')Object.assign(result,await replay32(),{ok:true});
  else if(stage==='blob')Object.assign(result,await blobCrossReplica(),{ok:true});
  else if(stage==='death')Object.assign(result,await replicaDeath(replicas),{ok:true});
  else if(stage==='all'){
    const fleet=await fleet1000(),hot=await hot200(),sameSubject=await contention32(),replay=await replay32(),blob=await blobCrossReplica(),death=await replicaDeath(replicas),ledger=await countLedger(1203);
    Object.assign(result,{ok:true,slice:'C3-ENTERPRISE-BENCH-HTTP-1000',concurrentClients:1000,fleet,hot,sameSubject,replay,blob,death,ledger,claimBoundary:'CI-local PostgreSQL concurrency canary; not production capacity evidence.'});
  }else throw new Error(`Unknown HTTP bench stage ${stage}`);
  console.log(JSON.stringify(result));
}finally{await stopChildren();}
