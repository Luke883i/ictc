import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { C3_ENTERPRISE_SCALE_PACK, C3_ENTERPRISE_SCALE_REQUIREMENTS, enterpriseScalePackProjection } from './runtime/enterprise-scale-pack.mjs';

const TRIALS=1_000_000;
let state=0xC3E5A126>>>0;
const rnd=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/0x100000000;};
const bool=(p=.5)=>rnd()<p;
const target=C3_ENTERPRISE_SCALE_PACK.targetEnvelope;
const digest=createHash('sha256');
let ready=0,blocked=0,mismatches=0;
const mutantEscapes={trustSimulation:0,ignoreSubjectOcc:0,ignoreIncrementalIntegrity:0,ignoreProjectionDelta:0,ignoreWorkClaims:0,ignoreAsyncProviderWork:0,ignoreObjectStorage:0,ignoreRateAuthority:0,ignoreTenantRls:0,ignoreStateless:0,ignoreNodeFailure:0,looseLatency:0,ignoreAuditHead:0};

function oracle(cap,e){
  if(C3_ENTERPRISE_SCALE_REQUIREMENTS.some(id=>cap[id]!==true))return false;
  for(const [key,value] of Object.entries(C3_ENTERPRISE_SCALE_PACK.requiredEvidence))if(e[key]!==value)return false;
  if(e.activeConcurrentUsersFleet<target.minimumActiveConcurrentUsersFleet)return false;
  if(e.applicationReplicas<target.minimumApplicationReplicas||e.applicationReplicas>target.maximumApplicationReplicas)return false;
  if(e.configuredTenants<target.minimumConfiguredTenants)return false;
  if(e.hotTenantSustainedWritesPerSecond<target.minimumHotTenantSustainedWritesPerSecond)return false;
  if(e.fleetSustainedWritesPerSecond<target.minimumFleetSustainedWritesPerSecond)return false;
  if(e.activeRecordsPerTenant<target.stressActiveRecordsPerTenant||e.auditEventsPerTenant<target.stressAuditEventsPerTenant)return false;
  if(e.standardSameTenantBurstWrites<target.standardSameTenantBurstWrites||e.catastrophicSameTenantBurstWrites<target.catastrophicSameTenantBurstWrites)return false;
  if(e.writeReceiptP95Ms>target.ordinaryWriteReceiptP95Ms||e.reconcileP95Ms>target.ordinaryReconcileP95Ms||e.readP95Ms>target.ordinaryReadP95Ms||e.auditHeadCriticalSectionMs>target.auditHeadCriticalSectionTargetMs)return false;
  if(e.independentSubjectFalseConflicts>0||e.sameSubjectLostUpdates>0||e.duplicateCommittedCommandEffects>0||e.duplicateCommittedWorkerEffects>0||e.acceptedWritesLostOnNodeDeath>0)return false;
  return true;
}

for(let i=0;i<TRIALS;i++){
  const cap=Object.fromEntries(C3_ENTERPRISE_SCALE_REQUIREMENTS.map(id=>[id,bool(.97)]));
  const e={kind:bool(.97)?'deployment-load':'simulation',exactHead:bool(.98),multiProcess:bool(.97),multiTenant:bool(.98),hotTenant:bool(.97),nodeFailure:bool(.96),sharedDatabase:bool(.97),sharedObjectStorage:bool(.97),distributedIngress:bool(.97),externalTelemetry:bool(.97),activeConcurrentUsersFleet:Math.floor(800+rnd()*4400),applicationReplicas:1+Math.floor(rnd()*34),configuredTenants:Math.floor(800+rnd()*700),hotTenantSustainedWritesPerSecond:Math.floor(150+rnd()*200),fleetSustainedWritesPerSecond:Math.floor(400+rnd()*300),activeRecordsPerTenant:Math.floor(200_000+rnd()*100_000),auditEventsPerTenant:Math.floor(1_500_000+rnd()*1_000_000),standardSameTenantBurstWrites:Math.floor(400+rnd()*200),catastrophicSameTenantBurstWrites:Math.floor(800+rnd()*400),writeReceiptP95Ms:150+rnd()*200,reconcileP95Ms:300+rnd()*300,readP95Ms:120+rnd()*200,auditHeadCriticalSectionMs:.3+rnd()*.8,independentSubjectFalseConflicts:bool(.985)?0:1,sameSubjectLostUpdates:bool(.99)?0:1,duplicateCommittedCommandEffects:bool(.995)?0:1,duplicateCommittedWorkerEffects:bool(.99)?0:1,acceptedWritesLostOnNodeDeath:bool(.985)?0:1};
  const actual=enterpriseScalePackProjection({capabilities:cap,evidence:e}).operationalReady,expected=oracle(cap,e);
  if(actual!==expected)mismatches++;
  if(actual)ready++;else blocked++;
  digest.update(`${i}:${actual?1:0}:${expected?1:0}:${Object.values(cap).filter(Boolean).length}:${e.kind}:${Math.floor(e.writeReceiptP95Ms)}\n`);
  if(e.kind==='simulation'&&actual)mutantEscapes.trustSimulation++;
  if(cap.subjectScopedConcurrency!==true&&actual)mutantEscapes.ignoreSubjectOcc++;
  if(cap.incrementalIntegrity!==true&&actual)mutantEscapes.ignoreIncrementalIntegrity++;
  if(cap.projectionDeltaReceipts!==true&&actual)mutantEscapes.ignoreProjectionDelta++;
  if(cap.durableWorkClaims!==true&&actual)mutantEscapes.ignoreWorkClaims++;
  if(cap.durableAsyncProviderWork!==true&&actual)mutantEscapes.ignoreAsyncProviderWork++;
  if(cap.sharedBlobAuthority!==true&&actual)mutantEscapes.ignoreObjectStorage++;
  if(cap.distributedRateAuthority!==true&&actual)mutantEscapes.ignoreRateAuthority++;
  if(cap.tenantIsolationRls!==true&&actual)mutantEscapes.ignoreTenantRls++;
  if(cap.statelessReplicas!==true&&actual)mutantEscapes.ignoreStateless++;
  if(e.nodeFailure!==true&&actual)mutantEscapes.ignoreNodeFailure++;
  if((e.writeReceiptP95Ms>300||e.reconcileP95Ms>500||e.readP95Ms>250)&&actual)mutantEscapes.looseLatency++;
  if(e.auditHeadCriticalSectionMs>.7&&actual)mutantEscapes.ignoreAuditHead++;
}
assert.equal(mismatches,0);assert.ok(ready>0);assert.ok(blocked>0);
for(const [name,count] of Object.entries(mutantEscapes))assert.equal(count,0,`${name} escaped`);
console.log(JSON.stringify({ok:true,trials:TRIALS,seed:'0xC3E5A126',ready,blocked,mismatches,mutantEscapes,digest:digest.digest('hex'),claim:'semantic mutation/falsification rail only; not production load proof'}));
