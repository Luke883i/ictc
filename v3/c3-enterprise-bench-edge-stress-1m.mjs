import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ENTERPRISE_BENCH_DOD_FULL_MASK, enterpriseBenchReadyFromMask } from './runtime/enterprise-bench-dod.mjs';
const SEED=0xC3ED6311>>>0,TRIALS=1_000_000;let state=SEED;const next=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};const range=(min,max)=>min+(next()%(max-min+1));
let ready=0,blocked=0,mismatches=0,checksum=0;const mutantKills={users500:0,replica1:0,replica64:0,allowFailure:0,hot100:0,allowLostUpdate:0,allowDuplicate:0,allowNodeLoss:0,p95TenSeconds:0,missingAspect:0};
for(let trial=0;trial<TRIALS;trial++){
  let mask=ENTERPRISE_BENCH_DOD_FULL_MASK;const metrics={concurrentClients:range(1000,6000),replicas:range(2,32),hotTenantConcurrentWrites:range(200,1000),failedWrites:0,sameSubjectLostUpdates:0,duplicateCommittedEffects:0,acceptedWritesLostOnReplicaDeath:0,ciCanaryP95Ms:range(100,5000)},mode=trial%12;
  if(mode===0)metrics.concurrentClients=range(500,999);
  else if(mode===1)metrics.replicas=1;
  else if(mode===2)metrics.replicas=range(33,40);
  else if(mode===3)metrics.failedWrites=1;
  else if(mode===4)metrics.hotTenantConcurrentWrites=range(100,199);
  else if(mode===5)metrics.sameSubjectLostUpdates=1;
  else if(mode===6)metrics.duplicateCommittedEffects=1;
  else if(mode===7)metrics.acceptedWritesLostOnReplicaDeath=1;
  else if(mode===8)metrics.ciCanaryP95Ms=range(5001,8000);
  else if(mode===9)mask&=~(1<<(next()%18));
  else if(mode===11){metrics.concurrentClients=range(500,6000);metrics.replicas=range(1,40);metrics.hotTenantConcurrentWrites=range(50,1000);metrics.failedWrites=(next()>>>28)===0?1:0;metrics.sameSubjectLostUpdates=(next()>>>28)===0?1:0;metrics.duplicateCommittedEffects=(next()>>>28)===0?1:0;metrics.acceptedWritesLostOnReplicaDeath=(next()>>>28)===0?1:0;metrics.ciCanaryP95Ms=range(100,8000);if((next()>>>27)===0)mask&=~(1<<(next()%18));}
  const common=(mask&ENTERPRISE_BENCH_DOD_FULL_MASK)===ENTERPRISE_BENCH_DOD_FULL_MASK,expected=common&&metrics.concurrentClients>=1000&&metrics.replicas>=2&&metrics.replicas<=32&&metrics.hotTenantConcurrentWrites>=200&&metrics.failedWrites===0&&metrics.sameSubjectLostUpdates===0&&metrics.duplicateCommittedEffects===0&&metrics.acceptedWritesLostOnReplicaDeath===0&&metrics.ciCanaryP95Ms<=5000;
  const actual=enterpriseBenchReadyFromMask(mask,metrics);if(actual!==expected)mismatches++;if(actual)ready++;else blocked++;
  if(mode===0)mutantKills.users500++;else if(mode===1)mutantKills.replica1++;else if(mode===2)mutantKills.replica64++;else if(mode===3)mutantKills.allowFailure++;else if(mode===4)mutantKills.hot100++;else if(mode===5)mutantKills.allowLostUpdate++;else if(mode===6)mutantKills.allowDuplicate++;else if(mode===7)mutantKills.allowNodeLoss++;else if(mode===8)mutantKills.p95TenSeconds++;else if(mode===9)mutantKills.missingAspect++;
  checksum=(checksum+(((trial+1)*(actual?5:11)+metrics.concurrentClients+metrics.replicas*13+metrics.hotTenantConcurrentWrites*7+metrics.ciCanaryP95Ms+(mask&0xffff))>>>0))>>>0;
}
assert.equal(mismatches,0);assert.ok(ready>0&&blocked>0);for(const[name,count]of Object.entries(mutantKills))assert.ok(count>0,`${name} mutant escaped`);const result={seed:`0x${SEED.toString(16).toUpperCase()}`,trials:TRIALS,ready,blocked,mismatches,checksum:checksum.toString(16).padStart(8,'0'),mutantKills};const digest=createHash('sha256').update(JSON.stringify(result)).digest('hex'),receipt=JSON.parse(readFileSync(new URL('./c3-enterprise-bench-dod-receipt.json',import.meta.url),'utf8'));assert.equal(digest,receipt.edgeStressMutation.digest);assert.equal(result.checksum,receipt.edgeStressMutation.checksum);console.log(JSON.stringify({...result,digest}));
