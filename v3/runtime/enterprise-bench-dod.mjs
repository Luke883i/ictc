export const ENTERPRISE_BENCH_DOD_ASPECTS=Object.freeze([
  'dependencyPinned',
  'postgresSharedAuthority',
  'tenantRlsDefaultDeny',
  'subjectScopedOcc',
  'crossReplicaCommandReplay',
  'incrementalIntegrity',
  'orderedTenantAuditHead',
  'durableWorkFence',
  'asyncProviderQueue',
  'sharedBlobCrossReplica',
  'distributedRateAttestation',
  'boundedProjection',
  'revisionGapRecovery',
  'statelessReplicaMount',
  'externalTelemetrySink',
  'httpKernelMount',
  'nodeDeathDurability',
  'thousandClientHarness'
]);
export const ENTERPRISE_BENCH_DOD_FULL_MASK=(1<<ENTERPRISE_BENCH_DOD_ASPECTS.length)-1;
export const ENTERPRISE_BENCH_CANARY=Object.freeze({minimumConcurrentClients:1000,minimumReplicas:2,maximumReplicas:32,minimumHotTenantConcurrentWrites:200,maximumFailedWrites:0,maximumSameSubjectLostUpdates:0,maximumDuplicateCommittedEffects:0,maximumAcceptedWritesLostOnReplicaDeath:0,maximumCiCanaryP95Ms:5000});
const finite=value=>Number.isFinite(Number(value))?Number(value):NaN;
export function enterpriseBenchReadyFromMask(mask,metrics={}){
  const m=Number(mask)>>>0,c=ENTERPRISE_BENCH_CANARY;
  return (m&ENTERPRISE_BENCH_DOD_FULL_MASK)===ENTERPRISE_BENCH_DOD_FULL_MASK&&finite(metrics.concurrentClients)>=c.minimumConcurrentClients&&finite(metrics.replicas)>=c.minimumReplicas&&finite(metrics.replicas)<=c.maximumReplicas&&finite(metrics.hotTenantConcurrentWrites)>=c.minimumHotTenantConcurrentWrites&&finite(metrics.failedWrites)<=c.maximumFailedWrites&&finite(metrics.sameSubjectLostUpdates)<=c.maximumSameSubjectLostUpdates&&finite(metrics.duplicateCommittedEffects)<=c.maximumDuplicateCommittedEffects&&finite(metrics.acceptedWritesLostOnReplicaDeath)<=c.maximumAcceptedWritesLostOnReplicaDeath&&finite(metrics.ciCanaryP95Ms)<=c.maximumCiCanaryP95Ms;
}
export function enterpriseBenchDodProjection(evidence={}){
  let mask=0;const states={};for(let index=0;index<ENTERPRISE_BENCH_DOD_ASPECTS.length;index++){const id=ENTERPRISE_BENCH_DOD_ASPECTS[index],ok=evidence[id]===true;states[id]=ok;if(ok)mask|=1<<index;}
  const metrics={concurrentClients:finite(evidence.concurrentClients),replicas:finite(evidence.replicas),hotTenantConcurrentWrites:finite(evidence.hotTenantConcurrentWrites),failedWrites:finite(evidence.failedWrites),sameSubjectLostUpdates:finite(evidence.sameSubjectLostUpdates),duplicateCommittedEffects:finite(evidence.duplicateCommittedEffects),acceptedWritesLostOnReplicaDeath:finite(evidence.acceptedWritesLostOnReplicaDeath),ciCanaryP95Ms:finite(evidence.ciCanaryP95Ms)};
  const blockers=[];for(const[id,ok]of Object.entries(states))if(!ok)blockers.push(`aspect:${id}`);const c=ENTERPRISE_BENCH_CANARY;if(!(metrics.concurrentClients>=c.minimumConcurrentClients))blockers.push('metric:concurrentClients');if(!(metrics.replicas>=c.minimumReplicas&&metrics.replicas<=c.maximumReplicas))blockers.push('metric:replicas');if(!(metrics.hotTenantConcurrentWrites>=c.minimumHotTenantConcurrentWrites))blockers.push('metric:hotTenantConcurrentWrites');if(!(metrics.failedWrites<=0))blockers.push('metric:failedWrites');if(!(metrics.sameSubjectLostUpdates<=0))blockers.push('metric:sameSubjectLostUpdates');if(!(metrics.duplicateCommittedEffects<=0))blockers.push('metric:duplicateCommittedEffects');if(!(metrics.acceptedWritesLostOnReplicaDeath<=0))blockers.push('metric:acceptedWritesLostOnReplicaDeath');if(!(metrics.ciCanaryP95Ms<=c.maximumCiCanaryP95Ms))blockers.push('metric:ciCanaryP95Ms');
  const benchReady=enterpriseBenchReadyFromMask(mask,metrics);
  return Object.freeze({schemaVersion:'1.0.0',authority:'c3-enterprise-bench-dod',benchReady,status:benchReady?'enterprise-bench-ready':'enterprise-bench-blocked',aspectCount:ENTERPRISE_BENCH_DOD_ASPECTS.length,aspects:Object.freeze(states),metrics:Object.freeze(metrics),blockers:Object.freeze(blockers),claimBoundary:'Bench-ready proves the real kernel can be mounted and exercised with a shared PostgreSQL concurrency canary. It does not prove production +1000 capacity, HA, or the Pack deployment-load SLO.'});
}
