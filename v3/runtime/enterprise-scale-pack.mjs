import { readFileSync } from 'node:fs';

const pack=Object.freeze(JSON.parse(readFileSync(new URL('../c3-enterprise-scale-pack.json',import.meta.url),'utf8')));
export const C3_ENTERPRISE_SCALE_PACK=pack;
export const C3_ENTERPRISE_SCALE_REQUIREMENTS=Object.freeze(pack.requirements.map(item=>item.id));

const finite=value=>Number.isFinite(Number(value))?Number(value):null;
const normalizedState=value=>value===true||value==='implemented'?'implemented':value===false||value==='blocked'?'blocked':value==='partial'?'partial':'unknown';
const blocker=(id,kind,observed,required,details={})=>Object.freeze({id,kind,observed:observed??null,required,...details});

function targetBlockers(evidence={}){
  const target=pack.targetEnvelope, blockers=[];
  const minimums=[['activeConcurrentUsersFleet','minimumActiveConcurrentUsersFleet'],['applicationReplicas','minimumApplicationReplicas'],['configuredTenants','minimumConfiguredTenants'],['hotTenantSustainedWritesPerSecond','minimumHotTenantSustainedWritesPerSecond'],['fleetSustainedWritesPerSecond','minimumFleetSustainedWritesPerSecond'],['activeRecordsPerTenant','stressActiveRecordsPerTenant'],['auditEventsPerTenant','stressAuditEventsPerTenant']];
  for(const [key,targetKey] of minimums){const observed=finite(evidence[key]),required=target[targetKey];if(observed==null||observed<required)blockers.push(blocker(`target:${key}`,'capacity',observed,`>=${required}`));}
  const maximums=[['writeReceiptP95Ms','ordinaryWriteReceiptP95Ms'],['reconcileP95Ms','ordinaryReconcileP95Ms'],['readP95Ms','ordinaryReadP95Ms'],['auditHeadCriticalSectionMs','auditHeadCriticalSectionTargetMs'],['independentSubjectFalseConflicts','independentSubjectFalseConflicts'],['sameSubjectLostUpdates','sameSubjectLostUpdates'],['duplicateCommittedCommandEffects','duplicateCommittedCommandEffects'],['duplicateCommittedWorkerEffects','duplicateCommittedWorkerEffects'],['acceptedWritesLostOnNodeDeath','acceptedWritesLostOnNodeDeath']];
  for(const [key,targetKey] of maximums){const observed=finite(evidence[key]),required=target[targetKey];if(observed==null||observed>required)blockers.push(blocker(`target:${key}`,'correctness-or-latency',observed,`<=${required}`));}
  const replicas=finite(evidence.applicationReplicas);if(replicas!=null&&replicas>target.maximumApplicationReplicas)blockers.push(blocker('target:applicationReplicas:max','capacity',replicas,`<=${target.maximumApplicationReplicas}`));
  if(evidence.standardSameTenantBurstWrites==null||finite(evidence.standardSameTenantBurstWrites)<target.standardSameTenantBurstWrites)blockers.push(blocker('target:standardSameTenantBurstWrites','burst',finite(evidence.standardSameTenantBurstWrites),`>=${target.standardSameTenantBurstWrites}`));
  if(evidence.catastrophicSameTenantBurstWrites==null||finite(evidence.catastrophicSameTenantBurstWrites)<target.catastrophicSameTenantBurstWrites)blockers.push(blocker('target:catastrophicSameTenantBurstWrites','burst',finite(evidence.catastrophicSameTenantBurstWrites),`>=${target.catastrophicSameTenantBurstWrites}`));
  return blockers;
}

export function enterpriseScalePackProjection({capabilities={},evidence=null,context={}}={}){
  const states=Object.fromEntries(pack.requirements.map(item=>[item.id,normalizedState(capabilities[item.id])]));
  const coverage=pack.requirements.filter(item=>Object.prototype.hasOwnProperty.call(capabilities,item.id)).length;
  const implemented=pack.requirements.filter(item=>states[item.id]==='implemented').length;
  const blockers=[];
  for(const item of pack.requirements)if(states[item.id]!=='implemented')blockers.push(blocker(`requirement:${item.id}`,'runtime-requirement',states[item.id],'implemented',{layer:item.layer,owner:item.owner,reuse:item.reuse,currentKnownState:item.currentKnownState}));
  const observed=evidence&&typeof evidence==='object'?evidence:{};
  for(const [key,required] of Object.entries(pack.requiredEvidence))if(observed[key]!==required)blockers.push(blocker(`evidence:${key}`,'deployment-evidence',observed[key],required));
  blockers.push(...targetBlockers(observed));
  const semanticCoveragePercent=Number((coverage/pack.requirements.length*100).toFixed(2));
  const runtimeImplementationPercent=Number((implemented/pack.requirements.length*100).toFixed(2));
  const operationalReady=blockers.length===0;
  return Object.freeze({schemaVersion:pack.schemaVersion,packId:pack.id,semanticCoveragePercent,semanticCoverageComplete:coverage===pack.requirements.length,runtimeImplementationPercent,runtimeImplementedCount:implemented,requirementCount:pack.requirements.length,requirementStates:Object.freeze(states),operationalReady,status:operationalReady?'enterprise-scale-ready':'enterprise-scale-blocked',blockers:Object.freeze(blockers),target:Object.freeze({...pack.targetEnvelope}),evidenceClass:observed.kind||'none',hotPathProhibitions:Object.freeze([...pack.hotPathProhibitions]),context:Object.freeze({...context}),claimBoundary:pack.claimBoundary});
}

export function currentRuntimeEnterpriseScaleCapabilities(){return Object.freeze({sharedDurableAuthority:false,tenantIsolationRls:false,subjectScopedConcurrency:false,incrementalIntegrity:false,atomicBoundedCommitReceipt:false,orderedTenantAuditHead:'partial',durableCommandLedger:true,durableWorkClaims:'partial',durableAsyncProviderWork:false,sharedBlobAuthority:false,distributedRateAuthority:false,boundedQueryProjections:'partial',projectionDeltaReceipts:false,revisionGapRecovery:false,statelessReplicas:false,externalObservability:'partial'});}
export function currentRuntimeEnterpriseScalePosture({evidence=null,context={}}={}){return enterpriseScalePackProjection({capabilities:currentRuntimeEnterpriseScaleCapabilities(),evidence,context:{scope:'current-runtime',...context}});}
export function enterpriseKernelEnterpriseScaleCapabilities(){return Object.freeze(Object.fromEntries(C3_ENTERPRISE_SCALE_REQUIREMENTS.map(id=>[id,true])));}
export function enterpriseKernelEnterpriseScalePosture({evidence=null,context={}}={}){return enterpriseScalePackProjection({capabilities:enterpriseKernelEnterpriseScaleCapabilities(),evidence,context:{scope:'enterprise-runtime-kernel',implementation:'v3/runtime/enterprise-runtime-kernel.mjs',claim:'runtime substrate implemented; deployment-load evidence still required',...context}});}
