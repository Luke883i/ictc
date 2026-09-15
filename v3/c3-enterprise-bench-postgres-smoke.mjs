import assert from 'node:assert/strict';
import pg from 'pg';
import { createHash } from 'node:crypto';
import { setupEnterpriseBenchDatabase } from './runtime/enterprise-bench-database.mjs';
import { createEnterpriseBenchRuntime } from './runtime/enterprise-bench-runtime.mjs';
import { withTenantReadTransaction, withTenantTransaction } from './runtime/postgres-enterprise-authority.mjs';
const {Pool}=pg;
const stage=process.argv[2]||'setup';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
await setupEnterpriseBenchDatabase({reset:true});
if(stage==='setup'){console.log(JSON.stringify({ok:true,stage}));process.exit(0);}
if(stage==='factory'){
  const runtime=await createEnterpriseBenchRuntime();try{assert.equal(runtime.kernel.profile.complete,true);assert.equal(runtime.posture().benchReady,true);console.log(JSON.stringify({ok:true,stage,profileComplete:true}));}finally{await runtime.close();}process.exit(0);
}
const pool=new Pool({connectionString:process.env.ICTC_ENTERPRISE_DATABASE_URL,max:2});
try{
  const who=(await pool.query('SELECT current_user AS u')).rows[0].u;assert.equal(who,process.env.ICTC_ENTERPRISE_APP_ROLE||'ictc_app');
  const flags=(await pool.query("SELECT bool_and(relrowsecurity) AS rls,bool_and(relforcerowsecurity) AS force FROM pg_class WHERE relname = ANY($1::text[])",[['ictc_subject_current','ictc_command_result','ictc_work_item']])).rows[0];assert.equal(flags.rls,true);assert.equal(flags.force,true);
  const hidden=Number((await pool.query("SELECT count(*)::int AS c FROM ictc_subject_current WHERE tenant_id='probe'")).rows[0].c);assert.equal(hidden,0);
  if(stage==='rls'){console.log(JSON.stringify({ok:true,stage,currentUser:who,rls:true,force:true,defaultDeny:true}));process.exit(0);}
  if(stage==='tenant-tx'){
    const setting=await withTenantTransaction(pool,'probe',async client=>(await client.query("SELECT current_setting('ictc.tenant_id',true) AS tenant")).rows[0].tenant);assert.equal(setting,'probe');console.log(JSON.stringify({ok:true,stage,tenant:setting}));process.exit(0);
  }
  if(stage==='advisory'){
    await withTenantTransaction(pool,'probe',client=>client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`probe\u0000risk\u0000probe-risk`]));console.log(JSON.stringify({ok:true,stage}));process.exit(0);
  }
  if(stage==='subject-write'){
    await withTenantTransaction(pool,'probe',async client=>{await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`probe\u0000risk\u0000probe-risk`]);await client.query(`INSERT INTO ictc_subject_current(tenant_id,subject_type,subject_id,version,payload_sha256,payload_json,bucket) VALUES($1,'risk','probe-risk',1,$2,$3::jsonb,1)`,['probe','a'.repeat(64),JSON.stringify({probe:true})]);await client.query(`INSERT INTO ictc_subject_version(tenant_id,subject_type,subject_id,version,payload_sha256,payload_json,command_id) VALUES($1,'risk','probe-risk',1,$2,$3::jsonb,'probe-command')`,['probe','a'.repeat(64),JSON.stringify({probe:true})]);const count=Number((await client.query("SELECT count(*)::int AS c FROM ictc_subject_current WHERE tenant_id='probe'")).rows[0].c);assert.equal(count,1);});console.log(JSON.stringify({ok:true,stage}));process.exit(0);
  }
  if(stage==='ledger-write'){
    await withTenantTransaction(pool,'probe',async client=>{await client.query(`INSERT INTO ictc_state_bucket(tenant_id,bucket,root_sha256,leaf_count) VALUES($1,1,$2,1)`,['probe','b'.repeat(64)]);await client.query(`INSERT INTO ictc_tenant_head(tenant_id,revision,audit_hash,state_root) VALUES($1,0,'GENESIS',$2)`,['probe','c'.repeat(64)]);const head=(await client.query('SELECT revision FROM ictc_tenant_head WHERE tenant_id=$1 FOR UPDATE',['probe'])).rows[0];assert.equal(Number(head.revision),0);await client.query(`INSERT INTO ictc_audit_event(tenant_id,revision,hash,previous_hash,state_root,event_json) VALUES($1,1,$2,'GENESIS',$3,$4::jsonb)`,['probe','d'.repeat(64),'c'.repeat(64),JSON.stringify({probe:true})]);await client.query(`INSERT INTO ictc_command_result(tenant_id,command_id,actor_id,action,envelope_json) VALUES($1,'probe-command','probe-user','risk.probe',$2::jsonb)`,['probe',JSON.stringify({receipt:{probe:true}})]);});console.log(JSON.stringify({ok:true,stage}));process.exit(0);
  }
}finally{await pool.end();}
if(stage!=='commit')throw new Error(`unknown stage ${stage}`);
const runtime=await createEnterpriseBenchRuntime();
try{
  const payload={probe:true},envelope=await runtime.kernel.commit({tenantId:'probe',commandId:'probe-command',actorId:'probe-user',action:'risk.probe',subjects:[{subject:{type:'risk',id:'probe-risk'},expectedVersion:null,payload,payloadSha256:digest(payload)}],event:{source:'postgres-smoke'}});assert.equal(envelope.receipt.subjects[0].version,1);
  const page=await runtime.kernel.query({tenantId:'probe',subjectTypes:['risk'],limit:10});assert.equal(page.returned,1);assert.equal(page.records[0].subject.id,'probe-risk');
  const visible=await withTenantReadTransaction(runtime.pool,'probe',async client=>Number((await client.query("SELECT count(*)::int AS c FROM ictc_subject_current WHERE tenant_id='probe'")).rows[0].c));assert.equal(visible,1);
  console.log(JSON.stringify({ok:true,stage,tenantRevision:envelope.receipt.tenantRevision,subjectVersion:1,visible}));
}finally{await runtime.close();}
