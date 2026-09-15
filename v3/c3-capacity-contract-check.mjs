import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { C3_CAPACITY_ARCHITECTURE_KEYS,C3_CAPACITY_CONTRACT,C3_CAPACITY_TARGET,capacityContractProjection } from './runtime/capacity-contract.mjs';

assert.equal(C3_CAPACITY_CONTRACT.id,'C3-CAPACITY-CONTRACT');
assert.equal(C3_CAPACITY_TARGET.minimumActiveConcurrentUsersFleet,1000);
assert.equal(C3_CAPACITY_TARGET.minimumHotTenantActiveConcurrentUsers,1000);
assert.deepEqual(C3_CAPACITY_CONTRACT.minimumLattice,['TENANT','TRANSACTION','WORK','PROJECTION','BLOB','EDGE']);
const architecture=Object.fromEntries(C3_CAPACITY_ARCHITECTURE_KEYS.map(key=>[key,true]));
const evidence={kind:'deployment-load',exactHead:true,multiProcess:true,multiTenant:true,hotTenant:true,activeConcurrentUsersFleet:1000,hotTenantActiveConcurrentUsers:1000,applicationReplicas:2,ordinaryWriteReceiptP95Ms:300,ordinaryReconcileP95Ms:500,ordinaryReadP95Ms:250,independentSubjectFalseConflicts:0,sameSubjectLostUpdates:0,duplicateCommittedCommandEffects:0,revisionGapRecovered:true};
assert.equal(capacityContractProjection({architecture,evidence}).enterpriseScaleReady,true);
const simulated=capacityContractProjection({architecture,evidence:{...evidence,kind:'E2-SIMULATED'}});assert.equal(simulated.enterpriseScaleReady,false);assert.ok(simulated.blockers.some(item=>item.id==='evidence:kind'));
const globalOcc=capacityContractProjection({architecture:{...architecture,subjectScopedConcurrency:false},evidence});assert.equal(globalOcc.enterpriseScaleReady,false);assert.ok(globalOcc.blockers.some(item=>item.id==='architecture:subjectScopedConcurrency'));
const localStore=await readFile(new URL('./runtime-store.mjs',import.meta.url),'utf8');
for(const token of ["capacityContractProjection","sharedDurableAuthority:false","subjectScopedConcurrency:false","durableCommandLedger:true","incrementalIntegrity:false","sharedBlobAuthority:false","statelessReplicas:false"])assert.ok(localStore.includes(token),`runtime-store must declassify ${token}`);
const registry=await readFile(new URL('./current-gate-registry.mjs',import.meta.url),'utf8');for(const gate of ['v3/c3-capacity-contract-check.mjs','v3/c3-capacity-contract-mutation-1m.mjs'])assert.ok(registry.includes(gate),`current semantic gate missing ${gate}`);
console.log(JSON.stringify({ok:true,slice:'C3-CAPACITY-CONTRACT',status:'runtime-truth-materialized',currentRuntimeExpected:'scale-blocked',target:C3_CAPACITY_TARGET,architectureRequirements:C3_CAPACITY_ARCHITECTURE_KEYS.length,claimBoundary:C3_CAPACITY_CONTRACT.claimBoundary}));
