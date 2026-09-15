import pg from 'pg';
import { createEnterpriseRuntimeKernel } from './enterprise-runtime-kernel.mjs';
import { PostgresEnterpriseAuthority } from './postgres-enterprise-authority.mjs';
import { PostgresSharedBlobAuthority, PostgresTelemetryAuthority } from './enterprise-postgres-bench-adapters.mjs';
import { createDistributedIngressRateAuthority } from './enterprise-edge-authorities.mjs';
import { procedureIdForSubject } from './procedure-adapters.mjs';

const { Pool }=pg;
const text=(value,max=2000)=>String(value??'').trim().slice(0,max);
function fail(code,message,details={}){throw Object.assign(new Error(message),{code,details});}

export function enterpriseBenchConfig(env=process.env){
  const databaseUrl=text(env.ICTC_ENTERPRISE_DATABASE_URL,2000),rateSecret=text(env.ICTC_ENTERPRISE_RATE_SECRET,2000);
  if(!databaseUrl)fail('enterprise-database-url-required','ICTC_ENTERPRISE_DATABASE_URL is required');
  if(rateSecret.length<32)fail('enterprise-rate-secret-required','ICTC_ENTERPRISE_RATE_SECRET must contain at least 32 characters');
  const requestedPoolMax=Number(env.ICTC_ENTERPRISE_POOL_MAX||32)||32,max=Math.max(32,Math.min(128,requestedPoolMax));
  const connectionTimeoutMillis=Math.max(1000,Math.min(30000,Number(env.ICTC_ENTERPRISE_CONNECT_TIMEOUT_MS||5000)||5000));
  const statementTimeout=Math.max(1000,Math.min(120000,Number(env.ICTC_ENTERPRISE_STATEMENT_TIMEOUT_MS||30000)||30000));
  return Object.freeze({databaseUrl,rateSecret,max,connectionTimeoutMillis,statementTimeout});
}

export async function createEnterpriseBenchRuntime({env=process.env,pool=null,clock=()=>new Date().toISOString(),installSchema=false}={}){
  const config=enterpriseBenchConfig(env),ownedPool=!pool;
  const database=pool||new Pool({connectionString:config.databaseUrl,max:config.max,connectionTimeoutMillis:config.connectionTimeoutMillis,statement_timeout:config.statementTimeout,application_name:'ictc-enterprise-bench'});
  const persistence=new PostgresEnterpriseAuthority(database,{clock});
  if(installSchema)await persistence.init();
  if(!await persistence.ping())fail('enterprise-database-unreachable','PostgreSQL enterprise authority ping failed');
  const blob=new PostgresSharedBlobAuthority(database,{clock});
  const telemetry=new PostgresTelemetryAuthority(database,{clock});
  const rate=createDistributedIngressRateAuthority({secret:config.rateSecret});
  const projectionOwnerResolver=subjects=>[...new Set((subjects||[]).map(item=>procedureIdForSubject(item?.subject?.type)).filter(Boolean))];
  const kernel=createEnterpriseRuntimeKernel({persistence,blob,rate,telemetry,projectionOwnerResolver});
  return Object.freeze({schemaVersion:'1.0.0',mode:'enterprise-bench',config:Object.freeze({poolMax:config.max,statementTimeoutMs:config.statementTimeout}),pool:database,persistence,blob,telemetry,rate,kernel,posture:()=>Object.freeze({schemaVersion:'1.0.0',mode:'enterprise-bench',benchReady:true,kernel:kernel.profile,operationalReady:false,claimBoundary:'Bench-ready means the real shared runtime is mountable and falsifiable. Production +1000 capacity remains deployment-load evidence.'}),close:async()=>{if(ownedPool)await database.end();}});
}
