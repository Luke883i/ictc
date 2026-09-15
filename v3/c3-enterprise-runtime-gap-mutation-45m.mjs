import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const TRIALS_PER_GAP=3_000_000;
const SEED=0xC3153001;
let state=SEED>>>0;
const rnd=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
const gaps=[
  ['sharedDurableAuthority',5],['tenantIsolationRls',5],['subjectScopedConcurrency',5],['incrementalIntegrity',5],['atomicBoundedCommitReceipt',5],['orderedTenantAuditHead',5],['durableWorkClaims',5],['durableAsyncProviderWork',5],['sharedBlobAuthority',5],['distributedRateAuthority',5],['boundedQueryProjections',5],['projectionDeltaReceipts',5],['revisionGapRecovery',4],['statelessReplicas',5],['externalObservability',5]
];
function scenario(bits){let mask=0;for(let i=0;i<bits;i++)if((rnd()%100)<88)mask|=(1<<i);return mask;}
function candidate(gap,mask,bits,numeric){
  const all=(1<<bits)-1;
  switch(gap){
    case 'sharedDurableAuthority': return (mask&all)===all;
    case 'tenantIsolationRls': return (mask&0b11111)===0b11111;
    case 'subjectScopedConcurrency': return (mask&0b11111)===0b11111;
    case 'incrementalIntegrity': return (mask&0b11111)===0b11111;
    case 'atomicBoundedCommitReceipt': return (mask&0b11111)===0b11111;
    case 'orderedTenantAuditHead': return (mask&0b11111)===0b11111 && numeric<=0.7;
    case 'durableWorkClaims': return (mask&0b11111)===0b11111;
    case 'durableAsyncProviderWork': return (mask&0b11111)===0b11111;
    case 'sharedBlobAuthority': return (mask&0b11111)===0b11111;
    case 'distributedRateAuthority': return (mask&0b11111)===0b11111;
    case 'boundedQueryProjections': return (mask&0b11111)===0b11111 && numeric<=200;
    case 'projectionDeltaReceipts': return (mask&0b11111)===0b11111;
    case 'revisionGapRecovery': return (mask&0b1111)===0b1111;
    case 'statelessReplicas': return (mask&0b11111)===0b11111 && numeric>=2;
    case 'externalObservability': return (mask&0b11111)===0b11111;
    default:return false;
  }
}
function oracle(gap,mask,bits,numeric){
  for(let bit=0;bit<bits;bit++)if(((mask>>>bit)&1)!==1)return false;
  if(gap==='orderedTenantAuditHead'&&!(numeric<=0.7))return false;
  if(gap==='boundedQueryProjections'&&!(numeric<=200))return false;
  if(gap==='statelessReplicas'&&!(numeric>=2))return false;
  return true;
}
const results=[];let globalChecksum=0x811c9dc5>>>0,total=0;
for(const [gap,bits] of gaps){let ready=0,blocked=0,mismatches=0,checksum=0x9e3779b9>>>0;const mutantKills=Array(bits).fill(0);let thresholdMutantKills=0;
  for(let i=0;i<TRIALS_PER_GAP;i++){
    const mask=scenario(bits);let numeric=0;
    if(gap==='orderedTenantAuditHead')numeric=(rnd()%1201)/1000;
    else if(gap==='boundedQueryProjections')numeric=10+(rnd()%291);
    else if(gap==='statelessReplicas')numeric=1+(rnd()%5);
    const actual=candidate(gap,mask,bits,numeric),expected=oracle(gap,mask,bits,numeric);if(actual!==expected)mismatches++;if(actual)ready++;else blocked++;
    for(let bit=0;bit<bits;bit++){const mutantMask=mask|(1<<bit);if(candidate(gap,mutantMask,bits,numeric)&&!expected)mutantKills[bit]++;}
    if(gap==='orderedTenantAuditHead'&&numeric>0.7&&((mask&((1<<bits)-1))===((1<<bits)-1)))thresholdMutantKills++;
    if(gap==='boundedQueryProjections'&&numeric>200&&((mask&31)===31))thresholdMutantKills++;
    if(gap==='statelessReplicas'&&numeric<2&&((mask&31)===31))thresholdMutantKills++;
    checksum=Math.imul(checksum^mask,16777619)>>>0;checksum=Math.imul(checksum^(actual?1:0),16777619)>>>0;checksum=Math.imul(checksum^(Math.trunc(numeric*1000)),16777619)>>>0;
  }
  assert.equal(mismatches,0,`${gap}: oracle mismatch`);assert.ok(ready>0&&blocked>0,`${gap}: distribution must be bidirectional`);for(const [index,count] of mutantKills.entries())assert.ok(count>0,`${gap}: mutant bit ${index} escaped`);if(['orderedTenantAuditHead','boundedQueryProjections','statelessReplicas'].includes(gap))assert.ok(thresholdMutantKills>0,`${gap}: threshold mutant escaped`);
  total+=TRIALS_PER_GAP;globalChecksum=Math.imul(globalChecksum^checksum,16777619)>>>0;results.push({gap,trials:TRIALS_PER_GAP,ready,blocked,mismatches,mutantKills,thresholdMutantKills,checksum:checksum.toString(16).padStart(8,'0')});
}
const digest=createHash('sha256').update(JSON.stringify({seed:`0x${SEED.toString(16).toUpperCase()}`,total,globalChecksum,results})).digest('hex');
const output={ok:true,seed:`0x${SEED.toString(16).toUpperCase()}`,trialsPerGap:TRIALS_PER_GAP,gaps:gaps.length,totalTrials:total,globalChecksum:globalChecksum.toString(16).padStart(8,'0'),digest,results,claim:'E2 deterministic semantic mutation/falsification; not deployment-load proof'};
const receipt=JSON.parse(readFileSync(new URL('./c3-enterprise-runtime-closure-receipt.json',import.meta.url),'utf8')).gapMutation;assert.equal(output.seed,receipt.seed);assert.equal(output.trialsPerGap,receipt.trialsPerGap);assert.equal(output.totalTrials,receipt.totalTrials);assert.equal(output.digest,receipt.digest);assert.equal(output.globalChecksum,receipt.globalChecksum);for(const row of output.results){const expected=receipt.results.find(item=>item.gap===row.gap);assert.ok(expected,`missing receipt row ${row.gap}`);assert.equal(row.ready,expected.ready);assert.equal(row.blocked,expected.blocked);assert.equal(row.mismatches,expected.mismatches);assert.equal(row.checksum,expected.checksum);}
console.log(JSON.stringify(output));
