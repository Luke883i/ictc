import { createHash, randomUUID } from 'node:crypto';
import { normalizeEnterpriseTenantId, sharedBlobKey, enterpriseTelemetryRecord } from './enterprise-scale-runtime.mjs';
import { withTenantReadTransaction, withTenantTransaction } from './postgres-enterprise-authority.mjs';

const text=(value,max=1000)=>String(value??'').trim().slice(0,max);
const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');
function fail(code,message,details={}){throw Object.assign(new Error(message),{code,details});}

export class PostgresSharedBlobAuthority{
  constructor(pool,{namespace='ictc',clock=()=>new Date().toISOString()}={}){this.pool=pool;this.namespace=text(namespace,80)||'ictc';this.clock=clock;}
  runtimePosture(){return Object.freeze({schemaVersion:'1.0.0',backend:'postgresql-bytea',scope:'shared-object-storage',implementation:'shared-blob-store',tenantIsolation:'rls+tenant-key',quarantine:'state-bound-keyspace',processLocalBusinessAuthority:false,limitations:['Bench/default shared blob adapter; production may replace with object storage without changing the kernel port.']});}
  _key(input){return `${this.namespace}/${sharedBlobKey(input)}`;}
  async put({tenantId,attachmentId,digest,buffer,metadata={},state='quarantine'}={}){
    const tenant=normalizeEnterpriseTenantId(tenantId),body=Buffer.isBuffer(buffer)?buffer:Buffer.from(buffer||[]),declared=text(digest,64).toLowerCase();
    if(!body.length)fail('shared-blob-empty','Blob body required');
    const actual=sha256(body);if(actual!==declared)fail('shared-blob-digest-mismatch','Blob body does not match declared digest',{declared,actual});
    const storageState=state==='clean'?'clean':'quarantine',key=this._key({tenantId:tenant,attachmentId,digest:declared,state:storageState}),at=this.clock();
    await withTenantTransaction(this.pool,tenant,client=>client.query(`INSERT INTO ictc_blob_object(tenant_id,object_key,state,digest,body,metadata_json,updated_at) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7) ON CONFLICT(tenant_id,object_key) DO UPDATE SET state=excluded.state,digest=excluded.digest,body=excluded.body,metadata_json=excluded.metadata_json,updated_at=excluded.updated_at`,[tenant,key,storageState,declared,body,JSON.stringify(metadata||{}),at]));
    return Object.freeze({key,state:storageState,bytes:body.length,sha256:declared});
  }
  async get({tenantId,attachmentId,digest,state='clean'}={}){
    const tenant=normalizeEnterpriseTenantId(tenantId),declared=text(digest,64).toLowerCase(),storageState=state==='clean'?'clean':'quarantine',key=this._key({tenantId:tenant,attachmentId,digest:declared,state:storageState});
    return withTenantReadTransaction(this.pool,tenant,async client=>{const row=(await client.query('SELECT state,digest,body,metadata_json FROM ictc_blob_object WHERE tenant_id=$1 AND object_key=$2',[tenant,key])).rows?.[0];if(!row)return null;const body=Buffer.from(row.body),actual=sha256(body);if(actual!==row.digest||actual!==declared)fail('shared-blob-integrity-mismatch','Persisted blob digest mismatch',{key,declared,persisted:row.digest,actual});return Object.freeze({key,state:row.state,body,metadata:row.metadata_json,sha256:actual});});
  }
  async remove({tenantId,attachmentId,digest,state='quarantine'}={}){const tenant=normalizeEnterpriseTenantId(tenantId),key=this._key({tenantId:tenant,attachmentId,digest,state});await withTenantTransaction(this.pool,tenant,client=>client.query('DELETE FROM ictc_blob_object WHERE tenant_id=$1 AND object_key=$2',[tenant,key]));return Object.freeze({key,removed:true});}
  async promote({tenantId,attachmentId,digest}={}){
    const tenant=normalizeEnterpriseTenantId(tenantId),declared=text(digest,64).toLowerCase(),from=this._key({tenantId:tenant,attachmentId,digest:declared,state:'quarantine'}),to=this._key({tenantId:tenant,attachmentId,digest:declared,state:'clean'}),at=this.clock();
    return withTenantTransaction(this.pool,tenant,async client=>{const row=(await client.query('SELECT digest,body,metadata_json FROM ictc_blob_object WHERE tenant_id=$1 AND object_key=$2 FOR UPDATE',[tenant,from])).rows?.[0];if(!row){const clean=(await client.query('SELECT digest FROM ictc_blob_object WHERE tenant_id=$1 AND object_key=$2',[tenant,to])).rows?.[0];if(clean?.digest===declared)return Object.freeze({fromKey:from,toKey:to,state:'clean',replayed:true});fail('shared-blob-quarantine-missing','Quarantined blob missing',{from});}const body=Buffer.from(row.body),actual=sha256(body);if(actual!==declared||row.digest!==declared)fail('shared-blob-integrity-mismatch','Blob failed integrity check before promotion',{declared,persisted:row.digest,actual});await client.query(`INSERT INTO ictc_blob_object(tenant_id,object_key,state,digest,body,metadata_json,updated_at) VALUES($1,$2,'clean',$3,$4,$5::jsonb,$6) ON CONFLICT(tenant_id,object_key) DO UPDATE SET state='clean',digest=excluded.digest,body=excluded.body,metadata_json=excluded.metadata_json,updated_at=excluded.updated_at`,[tenant,to,declared,body,JSON.stringify(row.metadata_json||{}),at]);await client.query('DELETE FROM ictc_blob_object WHERE tenant_id=$1 AND object_key=$2',[tenant,from]);return Object.freeze({fromKey:from,toKey:to,state:'clean',replayed:false});});
  }
}

export class PostgresTelemetryAuthority{
  constructor(pool,{clock=()=>new Date().toISOString()}={}){this.pool=pool;this.clock=clock;}
  runtimePosture(){return Object.freeze({schemaVersion:'1.0.0',backend:'postgresql-telemetry-bench-sink',scope:'external',authority:'shared-external-sink',processLocalBusinessAuthority:false,limitations:['Bench sink proves cross-process export semantics; production collector/alerting remains deployment evidence.']});}
  async emit(fields){const record=enterpriseTelemetryRecord({...fields,at:fields?.at||this.clock()}),eventId=randomUUID();await withTenantTransaction(this.pool,record.tenantId,client=>client.query('INSERT INTO ictc_telemetry_event(tenant_id,event_id,event_json,created_at) VALUES($1,$2,$3::jsonb,$4)',[record.tenantId,eventId,JSON.stringify(record),record.at]));return Object.freeze({...record,eventId});}
  async count(tenantId){const tenant=normalizeEnterpriseTenantId(tenantId);return withTenantReadTransaction(this.pool,tenant,async client=>Number((await client.query('SELECT count(*)::bigint AS c FROM ictc_telemetry_event WHERE tenant_id=$1',[tenant])).rows?.[0]?.c||0));}
}
