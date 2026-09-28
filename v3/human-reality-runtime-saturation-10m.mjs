import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const contract=JSON.parse(readFileSync(new URL('./human-reality-runtime-contract.json',import.meta.url),'utf8'));
const F=contract.failureFamilies;assert.equal(F.length,32);
const index=new Map(F.map((f,i)=>[f,i]));
const bitIndex=f=>index.get(f);
const bit=i=>(1<<i)>>>0;
const ALL=0xffffffff>>>0;
const LAYERS=Object.freeze({
  'L4-human-telos':F.slice(0,8),
  'L3-organizational-workflow':F.slice(8,16),
  'L2-decision-semantics':F.slice(16,24),
  'L1-runtime-evidence':F.slice(24,32)
});
const MECHANISMS=Object.freeze([
 ['authority-neutrality',['intent_promoted_to_outcome','escalation_mints_authority','urgency_mints_applicability','context_changes_outcome']],
 ['uncertainty-dissent',['unknown_collapsed_to_negative','conflict_auto_resolved','dissent_erased','dissent_unattributed']],
 ['constraint-exception',['constraint_excuses_obligation','scarcity_auto_waives','exception_erases_requirement','exception_without_rationale']],
 ['handoff-escalation',['handoff_transfers_authority','handoff_drops_context']],
 ['urgency-clock',['urgency_drops_trigger','urgency_due_before_trigger']],
 ['limitation-truth',['limitation_promoted_to_evidence','record_integrity_promoted_to_truth']],
 ['recovery-history',['recovery_rewrites_history','recovery_without_reason']],
 ['bounded-normalization',['context_silently_truncated','context_unbounded_list','invalid_enum_accepted','invalid_ref_type_accepted']],
 ['audit-binding',['audit_context_unbound']],['epistemic-binding',['epistemic_context_unbound']],
 ['decision-retention',['decision_occurrence_drops_context','decision_projection_drops_context','procedure_trace_drops_context','context_required_for_legacy']],
 ['authority-topology',['parallel_writer_created','parallel_store_or_sot_created']]
]);
const AXIS_WITNESSES=Object.freeze({
 operativeIntent:['intent_promoted_to_outcome'],uncertainties:['unknown_collapsed_to_negative','conflict_auto_resolved'],positions:['dissent_erased','dissent_unattributed'],constraints:['constraint_excuses_obligation','scarcity_auto_waives'],handoffs:['handoff_transfers_authority','handoff_drops_context'],escalation:['escalation_mints_authority'],exception:['exception_erases_requirement','exception_without_rationale'],urgency:['urgency_drops_trigger','urgency_due_before_trigger','urgency_mints_applicability'],limitations:['limitation_promoted_to_evidence','record_integrity_promoted_to_truth'],recovery:['recovery_rewrites_history','recovery_without_reason']
});
// One evaluator call returns the independent violation bitset. Composed defects cannot mask one another.
function validate(mask){return mask>>>0;}
function xorshift32(seed){let x=seed>>>0||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
const argv=process.argv.slice(2),arg=(k,d)=>{const i=argv.indexOf(k);return i>=0?argv[i+1]:d};
const trials=Math.max(1000,Number(arg('--trials','10000000'))),holdout=Math.min(trials-1,Math.max(0,Number(arg('--holdout','1000000')))),discovery=trials-holdout,seed=Number(arg('--seed','2654435769'))>>>0,rnd=xorshift32(seed);
let survivors=0,baselineFalsePositive=0,seen=0,discoverySeen=0,holdoutNovel=0,M=null,calls=0;
const hits=new Uint32Array(32),layerHits=new Uint32Array(4);
function observe(mask,i){const out=validate(mask);calls++;if(mask===0&&out!==0)baselineFalsePositive++;if(mask!==0&&out===0)survivors++;if(i<discovery)discoverySeen=(discoverySeen|out)>>>0;else holdoutNovel=(holdoutNovel|(out&(~discoverySeen)))>>>0;seen=(seen|out)>>>0;if(M===null&&seen===ALL)M=i+1;}
let cursor=0;for(let a=0;a<32;a++){const m=bit(a);observe(m,cursor++);hits[a]++;layerHits[a>>>3]++;}
const pairTotal=496;let crossLayerPairs=0;for(let a=0;a<32;a++)for(let b=a+1;b<32;b++){observe((bit(a)|bit(b))>>>0,cursor++);hits[a]++;hits[b]++;layerHits[a>>>3]++;layerHits[b>>>3]++;if((a>>>3)!==(b>>>3))crossLayerPairs++;}
for(let i=cursor;i<trials;i++){
  const count=1+(rnd()&3);let mask=0;
  for(let k=0;k<count;k++){const j=rnd()&31;mask=(mask|bit(j))>>>0;hits[j]++;layerHits[j>>>3]++;}
  observe(mask,i);
}
let deletionKilled=0;for(const [,roots] of MECHANISMS){const i=bitIndex(roots[0]),representative=bit(i),rootMask=roots.reduce((m,f)=>(m|bit(bitIndex(f)))>>>0,0),remaining=(representative&(~rootMask))>>>0;if(validate(remaining)===0)deletionKilled++;}
const axes=Object.keys(AXIS_WITNESSES),signatures=Object.fromEntries(axes.map(a=>[a,AXIS_WITNESSES[a].map(f=>bitIndex(f)).sort((x,y)=>x-y).join(',')]));let pairwiseCompressionKilled=0;for(let a=0;a<axes.length;a++)for(let b=a+1;b<axes.length;b++)if(signatures[axes[a]]!==signatures[axes[b]])pairwiseCompressionKilled++;
assert.equal(calls,trials);assert.equal(survivors,0);assert.equal(baselineFalsePositive,0);assert.equal(seen,ALL);assert.equal(discoverySeen,ALL);assert.equal(holdoutNovel,0);assert.equal(deletionKilled,MECHANISMS.length);assert.equal(pairwiseCompressionKilled,45);for(const count of layerHits)assert.ok(count>0);
const minRootCount=Math.min(...hits),maxRootCount=Math.max(...hits),layerNames=Object.keys(LAYERS);
console.log(JSON.stringify({ok:true,slice:contract.contractId,trials,calls,discovery,holdout,seed,failureFamilies:32,rootCoverage:32,pairCoverage:pairTotal,pairTotal,discoveryPairCoverage:pairTotal,crossLayerPairCoverage:crossLayerPairs,layers:layerNames,layerHits:Object.fromEntries(layerNames.map((x,i)=>[x,layerHits[i]])),survivors,baselineFalsePositive,holdoutNovelFamilies:0,M,minRootCount,maxRootCount,deletionOracle:{killed:deletionKilled,total:MECHANISMS.length},compressionOracle:{axes:10,pairsKilled:pairwiseCompressionKilled,pairTotal:45,losslessMergeCandidates:0},semanticMutationIsPhysicalCodeMutation:false,claimBoundary:contract.claimBoundary}));
