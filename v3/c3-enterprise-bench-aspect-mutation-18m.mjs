import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ENTERPRISE_BENCH_DOD_ASPECTS, ENTERPRISE_BENCH_DOD_FULL_MASK, enterpriseBenchReadyFromMask } from './runtime/enterprise-bench-dod.mjs';
const SEED=0xC3B3A118>>>0,TRIALS=1_000_000;let state=SEED;const rnd=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};
const metrics={concurrentClients:1000,replicas:2,hotTenantConcurrentWrites:200,failedWrites:0,sameSubjectLostUpdates:0,duplicateCommittedEffects:0,acceptedWritesLostOnReplicaDeath:0,ciCanaryP95Ms:4999};
const results=[];let globalChecksum=0;
for(let index=0;index<ENTERPRISE_BENCH_DOD_ASPECTS.length;index++){
  const bit=1<<index;let ready=0,blocked=0,mismatches=0,mutantKills=0,checksum=0;
  for(let trial=0;trial<TRIALS;trial++){
    const enabled=rnd()>=.5,mask=enabled?ENTERPRISE_BENCH_DOD_FULL_MASK:(ENTERPRISE_BENCH_DOD_FULL_MASK&~bit),expected=enabled,actual=enterpriseBenchReadyFromMask(mask,metrics),mutant=enterpriseBenchReadyFromMask(mask|bit,metrics);
    if(actual)mismatches+=expected?0:1;else mismatches+=expected?1:0;if(actual)ready++;else blocked++;if(!expected&&mutant)mutantKills++;checksum=(checksum+(((trial+1)*(actual?3:7)+(enabled?11:13)+index*17)>>>0))>>>0;
  }
  assert.equal(mismatches,0,`${ENTERPRISE_BENCH_DOD_ASPECTS[index]} oracle mismatch`);assert.ok(ready>0&&blocked>0,`${ENTERPRISE_BENCH_DOD_ASPECTS[index]} must be bidirectional`);assert.ok(mutantKills>0,`${ENTERPRISE_BENCH_DOD_ASPECTS[index]} omission mutant escaped`);globalChecksum=(globalChecksum^checksum)>>>0;results.push({aspect:ENTERPRISE_BENCH_DOD_ASPECTS[index],trials:TRIALS,ready,blocked,mismatches,mutantKills,checksum:checksum.toString(16).padStart(8,'0')});
}
const canonical=JSON.stringify({seed:`0x${SEED.toString(16).toUpperCase()}`,trialsPerAspect:TRIALS,aspects:ENTERPRISE_BENCH_DOD_ASPECTS.length,totalTrials:TRIALS*ENTERPRISE_BENCH_DOD_ASPECTS.length,globalChecksum:globalChecksum.toString(16).padStart(8,'0'),results}),digest=createHash('sha256').update(canonical).digest('hex'),receipt=JSON.parse(readFileSync(new URL('./c3-enterprise-bench-dod-receipt.json',import.meta.url),'utf8'));assert.equal(digest,receipt.aspectMutation.digest);assert.equal(globalChecksum.toString(16).padStart(8,'0'),receipt.aspectMutation.globalChecksum);assert.equal(receipt.aspectMutation.totalTrials,TRIALS*ENTERPRISE_BENCH_DOD_ASPECTS.length);console.log(JSON.stringify({...JSON.parse(canonical),digest}));
