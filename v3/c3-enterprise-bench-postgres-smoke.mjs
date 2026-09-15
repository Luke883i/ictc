import assert from 'node:assert/strict';
import pg from 'pg';
import { createHash } from 'node:crypto';
import { setupEnterpriseBenchDatabase } from './runtime/enterprise-bench-database.mjs';
import { createEnterpriseBenchRuntime } from './runtime/enterprise-bench-runtime.mjs';
import { withTenantReadTransaction } from './runtime/postgres-enterprise-authority.mjs';
const {Pool}=pg;
const stage=process.argv[2]||'setup';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
await setupEnterpriseBenchDatabase({reset:true});
if(stage==='setup'){console.log(JSON.stringify({ok:true,stage}));process.exit(0);}
const pool=new Pool({connectionString:process.env.ICTC_ENTERPRISE_DATABASE_URL,max:2});
try{
  const who=(await pool.query('SELECT current_user AS u')).rows[0].u;assert.equal(who,process.env.ICTC_ENTERPRISE_APP_ROLE||'ictc_app');
  const flags=(await pool.query("SELECT bool_and(relrowsecurity) AS rls,bool_and(relforcerowsecurity) AS force FROM pg_class WHERE relname = ANY($1::text[])",[['ictc_subject_current','ictc_command_result','ictc_work_item']])).rows[0];assert.equal(flags.rls,true);assert.equal(flags.force,true);
  const hidden=Number((await pool.query("SELECT count(*)::int AS c FROM ictc_subject_current WHERE tenant_id='probe'")).rows[0].c);assert.equal(hidden,0);
  if(stage==='rls'){console.log(JSON.stringify({ok:true,stage,currentUser:who,rls:true,force:true,defaultDeny:true}));process.exit(0);}
}finally{await pool.end();}
if(stage!=='commit')throw new Error(`unknown stage ${stage}`);
const runtime=await createEnterpriseBenchRuntime();
try{
  const payload={probe:true},envelope=await runtime.kernel.commit({tenantId:'probe',commandId:'probe-command',actorId:'probe-user',action:'risk.probe',subjects:[{subject:{type:'risk',id:'probe-risk'},expectedVersion:null,payload,payloadSha256:digest(payload)}],event:{source:'postgres-smoke'}});assert.equal(envelope.receipt.subjects[0].version,1);
  const page=await runtime.kernel.query({tenantId:'probe',subjectTypes:['risk'],limit:10});assert.equal(page.returned,1);assert.equal(page.records[0].subject.id,'probe-risk');
  const visible=await withTenantReadTransaction(runtime.pool,'probe',async client=>Number((await client.query("SELECT count(*)::int AS c FROM ictc_subject_current WHERE tenant_id='probe'")).rows[0].c));assert.equal(visible,1);
  console.log(JSON.stringify({ok:true,stage,tenantRevision:envelope.receipt.tenantRevision,subjectVersion:1,visible}));
}finally{await runtime.close();}
