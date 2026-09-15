import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { C3_CAPACITY_ARCHITECTURE_KEYS,C3_CAPACITY_TARGET,capacityContractProjection } from './runtime/capacity-contract.mjs';

const TRIALS=1_000_000,SEED=0xC3C00126;
let state=SEED>>>0;
function rnd(){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;}
function chance(p){return rnd()<p;}
function around(value,spread=.6){return Math.max(0,value*(1-spread+2*spread*rnd()));}
function oracle(architecture,evidence){
  if(C3_CAPACITY_ARCHITECTURE_KEYS.some(key=>architecture[key]!==true))return false;
  if(evidence.kind!=='deployment-load'||evidence.exactHead!==true||evidence.multiProcess!==true||evidence.multiTenant!==true||evidence.hotTenant!==true)return false;
  const t=C3_CAPACITY_TARGET;
  return evidence.activeConcurrentUsersFleet>=t.minimumActiveConcurrentUsersFleet&&evidence.hotTenantActiveConcurrentUsers>=t.minimumHotTenantActiveConcurrentUsers&&evidence.applicationReplicas>=t.minimumApplicationReplicas&&evidence.applicationReplicas<=t.maximumApplicationReplicas&&evidence.ordinaryWriteReceiptP95Ms<=t.ordinaryWriteReceiptP95Ms&&evidence.ordinaryReconcileP95Ms<=t.ordinaryReconcileP95Ms&&evidence.ordinaryReadP95Ms<=t.ordinaryReadP95Ms&&evidence.independentSubjectFalseConflicts<=t.independentSubjectFalseConflicts&&evidence.sameSubjectLostUpdates<=t.sameSubjectLostUpdates&&evidence.duplicateCommittedCommandEffects<=t.duplicateCommittedCommandEffects&&evidence.revisionGapRecovered===true;
}
const stats={ready:0,blocked:0,simulatedDenied:0,architectureDenied:0,boundaryDenied:0,mutantsKilled:{trustSimulation:0,ignoreArchitecture:0,globalOcc:0,looseLatency:0,oneReplica:0}};
const digest=createHash('sha256');
for(let i=0;i<TRIALS;i++){
  const architecture={};for(const key of C3_CAPACITY_ARCHITECTURE_KEYS)architecture[key]=chance(.93)?true:(chance(.55)?false:null);
  const kind=chance(.58)?'deployment-load':chance(.5)?'E2-SIMULATED':'MEASURED-LOCAL';
  const evidence={kind,exactHead:chance(.96),multiProcess:chance(.92),multiTenant:chance(.94),hotTenant:chance(.9),activeConcurrentUsersFleet:Math.floor(around(1300,.65)),hotTenantActiveConcurrentUsers:Math.floor(around(1200,.7)),applicationReplicas:1+Math.floor(rnd()*36),ordinaryWriteReceiptP95Ms:around(220,.8),ordinaryReconcileP95Ms:around(360,.8),ordinaryReadP95Ms:around(180,.8),independentSubjectFalseConflicts:chance(.985)?0:1,sameSubjectLostUpdates:chance(.992)?0:1,duplicateCommittedCommandEffects:chance(.992)?0:1,revisionGapRecovered:chance(.97)};
  const expected=oracle(architecture,evidence),projection=capacityContractProjection({architecture,evidence});
  assert.equal(projection.enterpriseScaleReady,expected,`oracle mismatch at ${i}`);
  if(expected)stats.ready++;else stats.blocked++;
  if(kind!=='deployment-load'&&!projection.enterpriseScaleReady)stats.simulatedDenied++;
  if(C3_CAPACITY_ARCHITECTURE_KEYS.some(key=>architecture[key]!==true)&&!projection.enterpriseScaleReady)stats.architectureDenied++;
  if([evidence.exactHead,evidence.multiProcess,evidence.multiTenant,evidence.hotTenant].some(v=>v!==true)&&!projection.enterpriseScaleReady)stats.boundaryDenied++;
  const evidenceGood=oracle(Object.fromEntries(C3_CAPACITY_ARCHITECTURE_KEYS.map(k=>[k,true])),evidence),archGood=C3_CAPACITY_ARCHITECTURE_KEYS.every(key=>architecture[key]===true);
  if(kind!=='deployment-load'&&archGood&&oracle(architecture,{...evidence,kind:'deployment-load'})&&!expected)stats.mutantsKilled.trustSimulation++;
  if(!archGood&&evidenceGood&&!expected)stats.mutantsKilled.ignoreArchitecture++;
  if(architecture.subjectScopedConcurrency!==true&&evidenceGood&&!expected)stats.mutantsKilled.globalOcc++;
  if(archGood&&evidence.kind==='deployment-load'&&evidence.exactHead&&evidence.multiProcess&&evidence.multiTenant&&evidence.hotTenant&&evidence.ordinaryWriteReceiptP95Ms>C3_CAPACITY_TARGET.ordinaryWriteReceiptP95Ms&&evidence.ordinaryWriteReceiptP95Ms<=C3_CAPACITY_TARGET.ordinaryWriteReceiptP95Ms*2&&!expected)stats.mutantsKilled.looseLatency++;
  if(archGood&&evidence.applicationReplicas===1&&oracle(architecture,{...evidence,applicationReplicas:2})&&!expected)stats.mutantsKilled.oneReplica++;
  if((i%10000)===0)digest.update(`${i}|${expected?1:0}|${projection.blockers.length}|${kind}\n`);
}
assert.equal(stats.ready+stats.blocked,TRIALS);for(const [name,count] of Object.entries(stats.mutantsKilled))assert.ok(count>0,`mutant not killed: ${name}`);
console.log(JSON.stringify({schemaVersion:'1.0.0',slice:'C3-CAPACITY-CONTRACT',trials:TRIALS,seed:`0x${SEED.toString(16).toUpperCase()}`,result:'model-saturated',semanticDigest:digest.digest('hex'),stats,claimBoundary:'Deterministic semantic falsification of the runtime capacity claim boundary; not production load evidence.'}));
