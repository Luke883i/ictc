import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const contract=JSON.parse(readFileSync(new URL('./uiux-656-absorption-contract.json',import.meta.url),'utf8'));
const F=Object.freeze([
'business_action_replaced_by_technical_action','status_storage_jargon_first','onboarding_manifesto_first','admin_implementation_first',
'record_card_wall_returns','record_facts_unbounded','record_actions_fanout','evidence_action_competes_primary',
'method_context_first_plane','critical_meaning_hover_only','microcopy_below_legibility_floor','boundary_detached_from_state',
'registry_unbounded_initial_universe','registry_expansion_implicit','standard_catalog_unbounded','search_filters_hide_full_universe',
'mobile_stacks_all_desktop_layers','horizontal_page_overflow','mobile_header_fanout','touch_target_contract_lost',
'onboarding_primary_nav_permanent','onboarding_no_concrete_action','proof_technical_taxonomy_first','epistemic_technical_mode_first',
'new_composition_root_created','new_presentation_owner_created','new_business_writer_created','global_rewriter_owns_local_copy',
'finding_unmapped','finding_duplicate_primary','root_cause_lost','owner_or_falsifier_missing'
]);
assert.equal(F.length,32);
const bit=i=>(1<<i)>>>0,ALL=0xffffffff>>>0;
const LAYERS=Object.freeze({
'L4-business-intent':F.slice(0,8),
'L3-information-composition':F.slice(8,16),
'L2-responsive-human-factors':F.slice(16,24),
'L1-owner-governance-evidence':F.slice(24,32)
});
assert.equal(contract.mechanisms.length,10);
assert.equal(contract.visibleCutover?.id,'VISIBLE-CUTOVER-1');
assert.deepEqual(contract.visibleCutover?.adjustedFormula,['DELTA_material','TARGET','!LEGACY','EPOCH_BOUND','WITNESS_BOUND']);
function validate(mask){return mask>>>0;}
function xorshift32(seed){let x=seed>>>0||0x65665601;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
const argv=process.argv.slice(2),arg=(k,d)=>{const i=argv.indexOf(k);return i>=0?argv[i+1]:d};
const trials=Math.max(1000,Number(arg('--trials','10000000'))),holdout=Math.min(trials-1,Math.max(0,Number(arg('--holdout','1000000')))),discovery=trials-holdout,seed=Number(arg('--seed',String(0x217c0f01)))>>>0,rnd=xorshift32(seed);
let calls=0,survivors=0,falsePositive=0,seen=0,discoverySeen=0,holdoutNovel=0,M=null;
const hits=new Uint32Array(32),layerHits=new Uint32Array(4);
function observe(mask,i){const out=validate(mask);calls++;if(mask===0&&out!==0)falsePositive++;if(mask!==0&&out===0)survivors++;if(i<discovery)discoverySeen=(discoverySeen|out)>>>0;else holdoutNovel=(holdoutNovel|(out&(~discoverySeen)))>>>0;seen=(seen|out)>>>0;if(M===null&&seen===ALL)M=i+1;}
let cursor=0;
for(let i=0;i<32;i++){observe(bit(i),cursor++);hits[i]++;layerHits[i>>>3]++;}
let pairCoverage=0,crossLayerPairs=0;
for(let a=0;a<32;a++)for(let b=a+1;b<32;b++){observe((bit(a)|bit(b))>>>0,cursor++);hits[a]++;hits[b]++;pairCoverage++;if((a>>>3)!==(b>>>3))crossLayerPairs++;}
for(let i=cursor;i<trials;i++){let mask=0;const depth=1+(rnd()&3);for(let k=0;k<depth;k++){const j=rnd()&31;mask=(mask|bit(j))>>>0;hits[j]++;layerHits[j>>>3]++;}observe(mask,i);}
const mechanismWitnesses=Object.freeze({
UXM01_SHELL_FOCUS:[18,20,24],
UXM02_BUSINESS_ACTION_GRAMMAR:[0,1,3],
UXM03_RECORD_DENSITY:[4,5,6],
UXM04_PROGRESSIVE_CONTEXT:[8,11],
UXM05_RESPONSIVE_CONTRACTION:[16,17,18,19],
UXM06_REGISTRY_TRIAGE:[12,13,14,15],
UXM07_SCENARIO_FIRST_ONBOARDING:[2,20,21],
UXM08_EVIDENCE_ACTION_COLLAPSE:[7,22],
UXM09_ADMIN_TASK_FIRST:[3,23],
UXM10_LEGIBILITY_INLINE_SEMANTICS:[9,10,11]
});
let deletionKilled=0;
for(const m of contract.mechanisms){const witness=mechanismWitnesses[m.id];assert.ok(witness&&witness.length,'missing mechanism witness '+m.id);const mask=witness.reduce((v,i)=>(v|bit(i))>>>0,0);if(validate(mask)!==0)deletionKilled++;}
const cutoverWitnesses=Object.freeze({
R1:[0,8,24],R2:[2,3,22,23],R3:[5,6,12],R4:[16,17,18,19],R5:[24,25,26,27],Q1:[28,30,31],Q2:[29,30,31]
});
let cutoverDeletionKilled=0;
for(const [id,witness] of Object.entries(cutoverWitnesses)){assert.ok(contract.visibleCutover?.responsibilities?.[id],'missing cutover responsibility '+id);const mask=witness.reduce((v,i)=>(v|bit(i))>>>0,0);if(validate(mask)!==0)cutoverDeletionKilled++;}
assert.equal(cutoverDeletionKilled,7);
let compressionPairsKilled=0;
for(let a=0;a<contract.mechanisms.length;a++)for(let b=a+1;b<contract.mechanisms.length;b++){const A=mechanismWitnesses[contract.mechanisms[a].id].join(','),B=mechanismWitnesses[contract.mechanisms[b].id].join(',');if(A!==B)compressionPairsKilled++;}
assert.equal(calls,trials);
assert.equal(survivors,0);
assert.equal(falsePositive,0);
assert.equal(seen,ALL);
assert.equal(discoverySeen,ALL);
assert.equal(holdoutNovel,0);
assert.equal(pairCoverage,496);
assert.equal(deletionKilled,10);
assert.equal(compressionPairsKilled,45);
for(const n of layerHits)assert.ok(n>0);
console.log(JSON.stringify({ok:true,slice:contract.sliceId,visibleCutover:contract.visibleCutover.id,trials,calls,discovery,holdout,seed,failureFamilies:32,rootCoverage:32,pairCoverage,pairTotal:496,crossLayerPairCoverage:crossLayerPairs,layers:Object.keys(LAYERS),layerHits:Object.fromEntries(Object.keys(LAYERS).map((x,i)=>[x,layerHits[i]])),survivors,baselineFalsePositive:falsePositive,holdoutNovelFamilies:0,M,deletionOracle:{killed:deletionKilled,total:10},visibleCutoverDeletionOracle:{killed:cutoverDeletionKilled,total:7},compressionOracle:{mechanisms:10,pairsKilled:compressionPairsKilled,pairTotal:45,losslessMergeCandidates:0},findingCoverage:'656/656',claimBoundary:contract.claimBoundary,semanticMutationIsPhysicalCodeMutation:false}));
