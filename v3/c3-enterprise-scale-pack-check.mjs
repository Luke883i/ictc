import assert from 'node:assert/strict';
import { C3_ENTERPRISE_SCALE_PACK, C3_ENTERPRISE_SCALE_REQUIREMENTS, currentRuntimeEnterpriseScaleCapabilities, currentRuntimeEnterpriseScalePosture, enterpriseScalePackProjection } from './runtime/enterprise-scale-pack.mjs';

assert.equal(C3_ENTERPRISE_SCALE_PACK.id,'C3-ENTERPRISE-SCALE-PACK');
assert.equal(new Set(C3_ENTERPRISE_SCALE_REQUIREMENTS).size,C3_ENTERPRISE_SCALE_REQUIREMENTS.length);
assert.ok(C3_ENTERPRISE_SCALE_REQUIREMENTS.length>=15);
assert.ok(C3_ENTERPRISE_SCALE_PACK.hotPathProhibitions.length>=8);
for(const item of C3_ENTERPRISE_SCALE_PACK.requirements){assert.ok(item.layer);assert.ok(item.owner);assert.ok(Array.isArray(item.reuse)&&item.reuse.length);assert.equal(item.requiredRuntimeState,'implemented');}

const current=currentRuntimeEnterpriseScalePosture();
assert.equal(current.semanticCoveragePercent,100);
assert.equal(current.semanticCoverageComplete,true);
assert.equal(current.operationalReady,false);
assert.equal(current.requirementStates.durableCommandLedger,'implemented');
assert.equal(current.requirementStates.subjectScopedConcurrency,'blocked');
assert.equal(current.requirementStates.orderedTenantAuditHead,'partial');
assert.ok(current.blockers.some(item=>item.id==='requirement:sharedDurableAuthority'));
assert.ok(current.blockers.some(item=>item.id==='requirement:durableAsyncProviderWork'));
assert.ok(current.blockers.some(item=>item.id==='evidence:kind'));

const capabilities=Object.fromEntries(C3_ENTERPRISE_SCALE_REQUIREMENTS.map(id=>[id,true]));
const target=C3_ENTERPRISE_SCALE_PACK.targetEnvelope;
const qualifying={kind:'deployment-load',exactHead:true,multiProcess:true,multiTenant:true,hotTenant:true,nodeFailure:true,sharedDatabase:true,sharedObjectStorage:true,distributedIngress:true,externalTelemetry:true,activeConcurrentUsersFleet:1000,applicationReplicas:4,configuredTenants:1000,hotTenantSustainedWritesPerSecond:200,fleetSustainedWritesPerSecond:500,activeRecordsPerTenant:target.stressActiveRecordsPerTenant,auditEventsPerTenant:target.stressAuditEventsPerTenant,standardSameTenantBurstWrites:500,catastrophicSameTenantBurstWrites:1000,writeReceiptP95Ms:300,reconcileP95Ms:500,readP95Ms:250,auditHeadCriticalSectionMs:0.7,independentSubjectFalseConflicts:0,sameSubjectLostUpdates:0,duplicateCommittedCommandEffects:0,duplicateCommittedWorkerEffects:0,acceptedWritesLostOnNodeDeath:0};
const ready=enterpriseScalePackProjection({capabilities,evidence:qualifying});
assert.equal(ready.semanticCoveragePercent,100);
assert.equal(ready.runtimeImplementationPercent,100);
assert.equal(ready.operationalReady,true);
assert.equal(ready.blockers.length,0);

const simulated=enterpriseScalePackProjection({capabilities,evidence:{...qualifying,kind:'simulation'}});
assert.equal(simulated.operationalReady,false);
assert.ok(simulated.blockers.some(item=>item.id==='evidence:kind'));
assert.equal(enterpriseScalePackProjection({capabilities:{...capabilities,subjectScopedConcurrency:false},evidence:qualifying}).operationalReady,false);
assert.equal(enterpriseScalePackProjection({capabilities:{...capabilities,durableAsyncProviderWork:false},evidence:qualifying}).operationalReady,false);
assert.equal(enterpriseScalePackProjection({capabilities:{...capabilities,redis:true,kafka:true},evidence:qualifying}).operationalReady,true);
assert.deepEqual(Object.keys(currentRuntimeEnterpriseScaleCapabilities()).sort(),[...C3_ENTERPRISE_SCALE_REQUIREMENTS].sort());
console.log(JSON.stringify({ok:true,pack:C3_ENTERPRISE_SCALE_PACK.id,requirements:C3_ENTERPRISE_SCALE_REQUIREMENTS.length,currentImplemented:current.runtimeImplementedCount,currentStatus:current.status}));
