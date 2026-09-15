import { createHash } from 'node:crypto';
import {
  assertBoundedCommitReceipt,
  boundedCommitReceipt,
  enterpriseBucketDigest,
  enterpriseLeafDigest,
  enterpriseStateRoot,
  enterpriseSubjectBucket,
  nextTenantAuditHead,
  normalizeEnterpriseTenantId,
  orderedSubjectWriteSet,
  subjectOccDecision,
  workClaimDecision
} from './enterprise-scale-runtime.mjs';

const sha256=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const text=(value,max=500)=>String(value??'').trim().slice(0,max);
function fail(code,message,details={}){throw Object.assign(new Error(message),{code,details});}
async function acquire(pool){
  if(typeof pool?.connect==='function'){
    const client=await pool.connect();
    return {client,release:()=>client.release?.()};
  }
  if(typeof pool?.query==='function')return {client:pool,release:()=>{}};
  throw new TypeError('PostgreSQL pool/client with query() required');
}

export async function withTenantTransaction(pool,tenantId,fn,{readOnly=false,isolation='READ COMMITTED'}={}){
  const tenant=normalizeEnterpriseTenantId(tenantId),{client,release}=await acquire(pool);
  try{
    await client.query('BEGIN');
    if(readOnly)await client.query(`SET TRANSACTION ISOLATION LEVEL ${isolation} READ ONLY`);
    else if(isolation!=='READ COMMITTED')await client.query(`SET TRANSACTION ISOLATION LEVEL ${isolation}`);
    await client.query("SELECT set_config('ictc.tenant_id',$1,true)",[tenant]);
    const out=await fn(client,tenant);
    await client.query('COMMIT');
    return out;
  }catch(error){
    try{await client.query('ROLLBACK');}catch{}
    throw error;
  }finally{release();}
}
export function withTenantReadTransaction(pool,tenantId,fn){return withTenantTransaction(pool,tenantId,fn,{readOnly:true,isolation:'REPEATABLE READ'});}

export const ENTERPRISE_POSTGRES_DDL=`
CREATE TABLE IF NOT EXISTS ictc_tenant_head(
  tenant_id text PRIMARY KEY,
  revision bigint NOT NULL DEFAULT 0,
  audit_hash text NOT NULL DEFAULT 'GENESIS',
  state_root text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ictc_subject_current(
  tenant_id text NOT NULL,
  subject_type text NOT NULL,
  subject_id text NOT NULL,
  version bigint NOT NULL CHECK(version >= 1),
  payload_sha256 text NOT NULL,
  payload_json jsonb,
  bucket smallint NOT NULL CHECK(bucket BETWEEN 0 AND 255),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,subject_type,subject_id)
);
CREATE INDEX IF NOT EXISTS ictc_subject_current_bucket_idx ON ictc_subject_current(tenant_id,bucket,subject_type,subject_id);
CREATE TABLE IF NOT EXISTS ictc_subject_version(
  tenant_id text NOT NULL,
  subject_type text NOT NULL,
  subject_id text NOT NULL,
  version bigint NOT NULL CHECK(version >= 1),
  tenant_revision bigint,
  payload_sha256 text NOT NULL,
  payload_json jsonb,
  command_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,subject_type,subject_id,version)
);
CREATE INDEX IF NOT EXISTS ictc_subject_version_command_idx ON ictc_subject_version(tenant_id,command_id);
CREATE TABLE IF NOT EXISTS ictc_state_bucket(
  tenant_id text NOT NULL,
  bucket smallint NOT NULL CHECK(bucket BETWEEN 0 AND 255),
  root_sha256 text NOT NULL,
  leaf_count integer NOT NULL CHECK(leaf_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,bucket)
);
CREATE TABLE IF NOT EXISTS ictc_audit_event(
  tenant_id text NOT NULL,
  revision bigint NOT NULL CHECK(revision >= 1),
  hash text NOT NULL,
  previous_hash text NOT NULL,
  state_root text NOT NULL,
  event_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,revision),
  UNIQUE(tenant_id,hash)
);
CREATE TABLE IF NOT EXISTS ictc_command_result(
  tenant_id text NOT NULL,
  command_id text NOT NULL,
  actor_id text NOT NULL,
  action text NOT NULL,
  envelope_json jsonb NOT NULL,
  stored_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,command_id)
);
CREATE TABLE IF NOT EXISTS ictc_work_item(
  tenant_id text NOT NULL,
  work_key text NOT NULL,
  kind text NOT NULL,
  payload_json jsonb NOT NULL,
  state text NOT NULL DEFAULT 'queued',
  available_at timestamptz NOT NULL DEFAULT now(),
  owner_id text,
  fence bigint NOT NULL DEFAULT 0 CHECK(fence >= 0),
  lease_until timestamptz,
  released_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK(attempts >= 0),
  result_json jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,work_key)
);
CREATE INDEX IF NOT EXISTS ictc_work_claim_idx ON ictc_work_item(tenant_id,state,available_at,lease_until);
CREATE TABLE IF NOT EXISTS ictc_blob_object(
  tenant_id text NOT NULL,
  object_key text NOT NULL,
  state text NOT NULL CHECK(state IN ('quarantine','clean')),
  digest text NOT NULL,
  body bytea NOT NULL,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,object_key)
);
CREATE TABLE IF NOT EXISTS ictc_telemetry_event(
  tenant_id text NOT NULL,
  event_id text NOT NULL,
  event_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(tenant_id,event_id)
);
CREATE INDEX IF NOT EXISTS ictc_telemetry_created_idx ON ictc_telemetry_event(tenant_id,created_at,event_id);
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['ictc_tenant_head','ictc_subject_current','ictc_subject_version','ictc_state_bucket','ictc_audit_event','ictc_command_result','ictc_work_item','ictc_blob_object','ictc_telemetry_event'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname=current_schema() AND tablename=t AND policyname=t||'_tenant') THEN
      EXECUTE format('CREATE POLICY %I ON %I USING (tenant_id = current_setting(''ictc.tenant_id'', true)) WITH CHECK (tenant_id = current_setting(''ictc.tenant_id'', true))',t||'_tenant',t);
    END IF;
  END LOOP;
END $$;
`;

function emptyBucketRoot(){return enterpriseBucketDigest([]);}
function decodeCursor(value){if(!value)return null;try{const decoded=Buffer.from(String(value),'base64url').toString('utf8'),[type,id]=decoded.split('\u0000');return type&&id?{type,id}:null;}catch{return null;}}
function encodeCursor(type,id){return Buffer.from(`${type}\u0000${id}`,'utf8').toString('base64url');}
function isCommandResultUnique(error){return error?.code==='23505'&&String(error?.constraint||'').includes('ictc_command_result');}
export function enterpriseSubjectAdvisoryLockKey(tenantId,subject={}){
  const tenant=normalizeEnterpriseTenantId(tenantId),type=text(subject?.type,80),id=text(subject?.id,300);
  if(!type||!id)fail('enterprise-subject-lock-key-invalid','Subject type/id required for advisory lock',{tenantId:tenant,subject});
  return createHash('sha256').update(`${tenant}\u0000${type}\u0000${id}`,'utf8').digest().readBigInt64BE(0).toString();
}

export class PostgresEnterpriseAuthority{
  constructor(pool,{clock=()=>new Date().toISOString()}={}){this.pool=pool;this.clock=clock;}
  async init(){const {client,release}=await acquire(this.pool);try{await client.query(ENTERPRISE_POSTGRES_DDL);}finally{release();}return this;}
  async ping(){const result=await this.pool.query('SELECT 1 AS ok');return result.rows?.[0]?.ok===1;}
  runtimePosture(){return Object.freeze({schemaVersion:'1.1.0',backend:'postgresql',scope:'shared-durable',tenantIsolation:'rls+explicit-tenant-key',concurrency:'subject-version',integrity:'bucketed-state-root',commitReceipt:'bounded-atomic',auditOrdering:'tenant-head-row-lock',claims:'durable-fenced',asyncProviderWork:true,projections:'bounded-cursor',projectionDelta:true,revisionGapRecovery:true,processLocalBusinessAuthority:false,limitations:['Deployment must supply a PostgreSQL role that cannot bypass FORCE ROW LEVEL SECURITY and must prove latency/failover under exact-head load.']});}
  _tenantTx(tenantId,fn){return withTenantTransaction(this.pool,tenantId,fn);}
  _tenantRead(tenantId,fn){return withTenantReadTransaction(this.pool,tenantId,fn);}
  async findCommandResult(tenantId,commandId,{client=null}={}){
    const tenant=normalizeEnterpriseTenantId(tenantId),command=text(commandId,200);if(!command)return null;
    const run=async db=>{const row=(await db.query('SELECT actor_id,action,envelope_json,stored_at FROM ictc_command_result WHERE tenant_id=$1 AND command_id=$2',[tenant,command])).rows?.[0];return row?{tenantId:tenant,commandId:command,actorId:row.actor_id,action:row.action,envelope:row.envelope_json,storedAt:row.stored_at}:null;};
    if(client)return run(client);
    return this._tenantRead(tenant,run);
  }
  async commitMutation({tenantId,commandId,actorId,action,subjects=[],projectionOwners=[],event={},workItems=[]}={}){
    const tenant=normalizeEnterpriseTenantId(tenantId),command=text(commandId,200),actor=text(actorId,240),operation=text(action,240),writes=orderedSubjectWriteSet(subjects),at=this.clock();
    if(!command||!actor||!operation||!writes.length)fail('enterprise-commit-input-invalid','Enterprise commit requires command, actor, action and at least one subject');
    const perform=()=>this._tenantTx(tenant,async client=>{
      const replay=await this.findCommandResult(tenant,command,{client});
      if(replay){if(replay.actorId!==actor||replay.action!==operation)fail('command-id-conflict','Command id already used for another operation');return Object.freeze({...replay.envelope,replayed:true});}
      for(const write of writes)await client.query('SELECT pg_advisory_xact_lock($1::bigint)',[enterpriseSubjectAdvisoryLockKey(tenant,write.subject)]);
      const replayAfterLock=await this.findCommandResult(tenant,command,{client});
      if(replayAfterLock){if(replayAfterLock.actorId!==actor||replayAfterLock.action!==operation)fail('command-id-conflict','Command id already used for another operation');return Object.freeze({...replayAfterLock.envelope,replayed:true});}
      const committed=[];const changedBuckets=new Set();
      for(const write of writes){
        const current=(await client.query('SELECT version,payload_sha256 FROM ictc_subject_current WHERE tenant_id=$1 AND subject_type=$2 AND subject_id=$3 FOR UPDATE',[tenant,write.subject.type,write.subject.id])).rows?.[0]||null;
        const decision=subjectOccDecision({expectedVersion:write.expectedVersion,currentVersion:current?.version??null,exists:Boolean(current)});
        if(!decision.ok)fail('subject-version-conflict','Subject version changed',{subject:write.subject,expectedVersion:decision.expectedVersion,currentVersion:decision.currentVersion});
        const bucket=enterpriseSubjectBucket(tenant,write.subject);changedBuckets.add(bucket);
        await client.query(`INSERT INTO ictc_subject_current(tenant_id,subject_type,subject_id,version,payload_sha256,payload_json,bucket,updated_at) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$8) ON CONFLICT(tenant_id,subject_type,subject_id) DO UPDATE SET version=excluded.version,payload_sha256=excluded.payload_sha256,payload_json=excluded.payload_json,bucket=excluded.bucket,updated_at=excluded.updated_at`,[tenant,write.subject.type,write.subject.id,decision.nextVersion,write.payloadSha256,JSON.stringify(write.payload),bucket,at]);
        await client.query('INSERT INTO ictc_subject_version(tenant_id,subject_type,subject_id,version,payload_sha256,payload_json,command_id,created_at) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$8)',[tenant,write.subject.type,write.subject.id,decision.nextVersion,write.payloadSha256,JSON.stringify(write.payload),command,at]);
        committed.push({subject:write.subject,version:decision.nextVersion,payloadSha256:write.payloadSha256,bucket});
      }
      for(const bucket of [...changedBuckets].sort((a,b)=>a-b)){
        await client.query('INSERT INTO ictc_state_bucket(tenant_id,bucket,root_sha256,leaf_count) VALUES($1,$2,$3,0) ON CONFLICT(tenant_id,bucket) DO NOTHING',[tenant,bucket,emptyBucketRoot()]);
        await client.query('SELECT bucket FROM ictc_state_bucket WHERE tenant_id=$1 AND bucket=$2 FOR UPDATE',[tenant,bucket]);
        const rows=(await client.query('SELECT subject_type,subject_id,version,payload_sha256 FROM ictc_subject_current WHERE tenant_id=$1 AND bucket=$2 ORDER BY subject_type,subject_id',[tenant,bucket])).rows||[];
        const leaves=rows.map(row=>enterpriseLeafDigest({tenantId:tenant,subject:{type:row.subject_type,id:row.subject_id},version:Number(row.version),payloadSha256:row.payload_sha256})),root=enterpriseBucketDigest(leaves);
        await client.query('UPDATE ictc_state_bucket SET root_sha256=$3,leaf_count=$4,updated_at=$5 WHERE tenant_id=$1 AND bucket=$2',[tenant,bucket,root,rows.length,at]);
      }
      const initialRoot=enterpriseStateRoot({});
      await client.query("INSERT INTO ictc_tenant_head(tenant_id,revision,audit_hash,state_root,updated_at) VALUES($1,0,'GENESIS',$2,$3) ON CONFLICT(tenant_id) DO NOTHING",[tenant,initialRoot,at]);
      const previous=(await client.query('SELECT revision,audit_hash,state_root FROM ictc_tenant_head WHERE tenant_id=$1 FOR UPDATE',[tenant])).rows?.[0];
      const bucketRows=(await client.query('SELECT bucket,root_sha256 FROM ictc_state_bucket WHERE tenant_id=$1 ORDER BY bucket',[tenant])).rows||[];
      const bucketRoots=Object.fromEntries(bucketRows.map(row=>[Number(row.bucket),row.root_sha256])),stateRoot=enterpriseStateRoot(bucketRoots),eventDigest=sha256({tenantId:tenant,commandId:command,actorId:actor,action:operation,subjects:committed,event,at}),head=nextTenantAuditHead({tenantId:tenant,previousHead:{revision:Number(previous.revision),hash:previous.audit_hash},eventDigest,stateRoot,at});
      const receipt=boundedCommitReceipt({commandId:command,tenantId:tenant,tenantRevision:head.revision,auditHash:head.hash,stateRoot,subjects:committed,projectionOwners,workItems:workItems.map(item=>item.workKey)}),envelope=Object.freeze({receipt,replayed:false});
      await client.query('UPDATE ictc_subject_version SET tenant_revision=$3 WHERE tenant_id=$1 AND command_id=$2 AND tenant_revision IS NULL',[tenant,command,head.revision]);
      await client.query('INSERT INTO ictc_audit_event(tenant_id,revision,hash,previous_hash,state_root,event_json,created_at) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7)',[tenant,head.revision,head.hash,head.previousHash,stateRoot,JSON.stringify({schemaVersion:'1.1.0',...event,tenantId:tenant,commandId:command,actorId:actor,action:operation,subjects:committed,projectionOwners,at}),at]);
      await client.query('UPDATE ictc_tenant_head SET revision=$2,audit_hash=$3,state_root=$4,updated_at=$5 WHERE tenant_id=$1',[tenant,head.revision,head.hash,stateRoot,at]);
      await client.query('INSERT INTO ictc_command_result(tenant_id,command_id,actor_id,action,envelope_json,stored_at) VALUES($1,$2,$3,$4,$5::jsonb,$6)',[tenant,command,actor,operation,JSON.stringify(envelope),at]);
      for(const item of workItems)await this._enqueueWorkClient(client,tenant,item);
      return assertBoundedCommitReceipt(receipt)&&envelope;
    });
    try{return await perform();}
    catch(error){
      if(!isCommandResultUnique(error))throw error;
      const replay=await this.findCommandResult(tenant,command);
      if(!replay)throw error;
      if(replay.actorId!==actor||replay.action!==operation)fail('command-id-conflict','Command id already used for another operation');
      return Object.freeze({...replay.envelope,replayed:true});
    }
  }
  async readProjection({tenantId,subjectTypes=[],cursor=null,limit=80}={}){
    const tenant=normalizeEnterpriseTenantId(tenantId),bounded=Math.max(10,Math.min(200,Math.trunc(Number(limit)||80))),types=[...new Set(subjectTypes.map(value=>text(value,80)).filter(Boolean))],after=decodeCursor(cursor);
    return this._tenantRead(tenant,async client=>{
      const filters=['tenant_id=$1'],params=[tenant];if(types.length){params.push(types);filters.push(`subject_type = ANY($${params.length}::text[])`);}if(after){params.push(after.type,after.id);filters.push(`(subject_type,subject_id) > ($${params.length-1},$${params.length})`);}const where=filters.join(' AND ');
      const total=Number((await client.query(`SELECT count(*)::bigint AS c FROM ictc_subject_current WHERE tenant_id=$1${types.length?' AND subject_type = ANY($2::text[])':''}`,types.length?[tenant,types]:[tenant])).rows?.[0]?.c||0);params.push(bounded+1);
      const rows=(await client.query(`SELECT subject_type,subject_id,version,payload_sha256,payload_json FROM ictc_subject_current WHERE ${where} ORDER BY subject_type,subject_id LIMIT $${params.length}`,params)).rows||[],hasMore=rows.length>bounded,selected=rows.slice(0,bounded),last=selected.at(-1);
      return Object.freeze({schemaVersion:'1.1.0',tenantId:tenant,limit:bounded,returned:selected.length,total,nextCursor:hasMore&&last?encodeCursor(last.subject_type,last.subject_id):null,records:Object.freeze(selected.map(row=>({subject:{type:row.subject_type,id:row.subject_id},version:Number(row.version),payloadSha256:row.payload_sha256,payload:row.payload_json})))});
    });
  }
  async _enqueueWorkClient(client,tenantId,{workKey,kind,payload={},availableAt=this.clock()}={}){const key=text(workKey,500),type=text(kind,120);if(!key||!type)fail('work-item-invalid','Work item key/kind required');await client.query(`INSERT INTO ictc_work_item(tenant_id,work_key,kind,payload_json,state,available_at,updated_at) VALUES($1,$2,$3,$4::jsonb,'queued',$5,$5) ON CONFLICT(tenant_id,work_key) DO NOTHING`,[tenantId,key,type,JSON.stringify(payload),availableAt]);return{tenantId,workKey:key,kind:type,state:'queued'};}
  async enqueueWork({tenantId,...item}={}){const tenant=normalizeEnterpriseTenantId(tenantId);return this._tenantTx(tenant,client=>this._enqueueWorkClient(client,tenant,item));}
  async claimWork({tenantId,ownerId,leaseMs=300000,kinds=[]}={}){const tenant=normalizeEnterpriseTenantId(tenantId),owner=text(ownerId,300),types=[...new Set(kinds.map(value=>text(value,120)).filter(Boolean))],at=this.clock();if(!owner)fail('work-owner-invalid','Work owner required');return this._tenantTx(tenant,async client=>{const params=[tenant,at];let kindSql='';if(types.length){params.push(types);kindSql=` AND kind = ANY($${params.length}::text[])`;}const row=(await client.query(`SELECT * FROM ictc_work_item WHERE tenant_id=$1 AND state IN ('queued','claimed') AND available_at<=$2::timestamptz AND (state='queued' OR lease_until IS NULL OR lease_until<=$2::timestamptz)${kindSql} ORDER BY available_at,work_key FOR UPDATE SKIP LOCKED LIMIT 1`,params)).rows?.[0];if(!row)return null;const decision=workClaimDecision(row.owner_id?{tenantId:tenant,workKey:row.work_key,ownerId:row.owner_id,fence:Number(row.fence),leaseUntil:row.lease_until,releasedAt:row.released_at}:null,{tenantId:tenant,workKey:row.work_key,ownerId:owner,leaseMs,at});if(decision.kind==='held')return null;const fence=decision.fence,leaseUntil=decision.request.leaseUntil;await client.query(`UPDATE ictc_work_item SET state='claimed',owner_id=$3,fence=$4,lease_until=$5,released_at=NULL,attempts=attempts+1,updated_at=$6 WHERE tenant_id=$1 AND work_key=$2`,[tenant,row.work_key,owner,fence,leaseUntil,at]);return Object.freeze({tenantId:tenant,workKey:row.work_key,kind:row.kind,payload:row.payload_json,ownerId:owner,fence,leaseUntil});});}
  async completeWork({tenantId,workKey,ownerId,fence,result=null}={}){const tenant=normalizeEnterpriseTenantId(tenantId),key=text(workKey,500),owner=text(ownerId,300),at=this.clock();return this._tenantTx(tenant,async client=>{const resultSet=await client.query(`UPDATE ictc_work_item SET state='completed',result_json=$5::jsonb,released_at=$6,updated_at=$6 WHERE tenant_id=$1 AND work_key=$2 AND owner_id=$3 AND fence=$4 AND state='claimed' AND lease_until>$6::timestamptz RETURNING work_key`,[tenant,key,owner,Number(fence),JSON.stringify(result),at]);if(!resultSet.rowCount)fail('work-claim-fenced','Work completion rejected by durable fence');return{tenantId:tenant,workKey:key,state:'completed',fence:Number(fence)};});}
}
