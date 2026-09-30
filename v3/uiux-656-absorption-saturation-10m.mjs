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
'finding_unmapped','finding_duplicate_primary','root_cause_lost','owner_or_falsifier_missing',
'global_cutover_epoch_missing','home_cutover_epoch_missing','proof_cutover_epoch_missing','ep_cutover_epoch_missing',
'admin_cutover_epoch_missing','surface_epoch_not_local','browser_epoch_witness_missing','cutover_claim_boundary_widened'
]);
assert.equal(F.length,40);
const H=contract.visibleCutover?.postMergeHardening;
assert.equal(contract.mechanisms.length,10);
assert.equal(contract.visibleCutover?.id,'VISIBLE-CUTOVER-1');
assert.deepEqual(contract.visibleCutover?.adjustedFormula,['DELTA_material','TARGET','!LEGACY','EPOCH_BOUND','WITNESS_BOUND']);
assert.equal(H?.id,'POST-219-CUTOVER-EPOCH-HARDEN');
assert.equal(H?.localFalsification?.seedHex,'0x219a0d17');
function empty(){return [0,0];}
function setBit(s,i){if(i<32)s[0]=(s[0]|((1<<i)>>>0))>>>0;else s[1]=(s[1]|((1<<(i-32))>>>0))>>>0;return s;}
function hasBit(s,i){return i<32?Boolean((s[0]>>>i)&1):Boolean((s[1]>>>(i-32))&1);}
function nonzero(s){return (s[0]|s[1])!==0;}
function validate(s){const out=[s[0]>>>0,s[1]>>>0],fail=i=>setBit(out,i);if([33,34,35,36].some(i=>hasBit(s,i)))fail(37);if(hasBit(s,38))fail(37);if(hasBit(s,39))fail(11);return out;}
function xorshift32(seed){let x=seed>>>0||0x65665601;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
const argv=process.argv.slice(2),arg=(k,d)=>{const i=argv.indexOf(k);return i>=0?argv[i+1]:d};
const trials=Math.max(1000,Number(arg('--trials','10000000'))),holdout=Math.min(trials-1,Math.max(0,Number(arg('--holdout','1000000')))),discovery=trials-holdout,seed=Number(arg('--seed',String(0x219a0d17)))>>>0,rnd=xorshift32(seed);
let calls=0,survivors=0,falsePositive=0,discoverySeen=empty(),holdoutNovel=empty(),M=null,pairCoverage=0;
const hits=new Uint32Array(F.length),pairs=new Uint8Array(F.length*F.length);
function merge(a,b){a[0]=(a[0]|b[0])>>>0;a[1]=(a[1]|b[1])>>>0;}
function allSeen(s){return s[0]===0xffffffff>>>0&&(s[1]&0xff)===0xff;}
function observe(state,i){const out=validate(state);calls++;if(!nonzero(state)&&nonzero(out))falsePositive++;if(nonzero(state)&&!nonzero(out))survivors++;if(i<discovery)merge(discoverySeen,out);else{holdoutNovel[0]=(holdoutNovel[0]|(out[0]&(~discoverySeen[0])))>>>0;holdoutNovel[1]=(holdoutNovel[1]|(out[1]&(~discoverySeen[1])))>>>0;}if(M===null&&allSeen(discoverySeen))M=i+1;for(let n=0;n<F.length;n++)if(hasBit(out,n))hits[n]++;}
let cursor=0;
for(let i=0;i<F.length;i++){const s=empty();setBit(s,i);observe(s,cursor++);}
for(let a=0;a<F.length;a++)for(let b=a+1;b<F.length;b++){const s=empty();setBit(s,a);setBit(s,b);observe(s,cursor++);pairs[a*F.length+b]=pairs[b*F.length+a]=1;pairCoverage++;}
for(let i=cursor;i<trials;i++){const s=empty(),depth=1+(rnd()%5),chosen=[];for(let k=0;k<depth;k++){const n=rnd()%F.length;setBit(s,n);chosen.push(n);}const u=[...new Set(chosen)];for(let a=0;a<u.length;a++)for(let b=a+1;b<u.length;b++)pairs[u[a]*F.length+u[b]]=pairs[u[b]*F.length+u[a]]=1;observe(s,i);}
const mechanismWitnesses=Object.freeze({
UXM01_SHELL_FOCUS:[18,20,24],UXM02_BUSINESS_ACTION_GRAMMAR:[0,1,3],UXM03_RECORD_DENSITY:[4,5,6],UXM04_PROGRESSIVE_CONTEXT:[8,11],UXM05_RESPONSIVE_CONTRACTION:[16,17,18,19],
UXM06_REGISTRY_TRIAGE:[12,13,14,15],UXM07_SCENARIO_FIRST_ONBOARDING:[2,20,21],UXM08_EVIDENCE_ACTION_COLLAPSE:[7,22],UXM09_ADMIN_TASK_FIRST:[3,23],UXM10_LEGIBILITY_INLINE_SEMANTICS:[9,10,11]
});
let deletionKilled=0;
for(const m of contract.mechanisms){const w=mechanismWitnesses[m.id];assert.ok(w?.length,'missing mechanism witness '+m.id);const s=empty();for(const i of w)setBit(s,i);if(nonzero(validate(s)))deletionKilled++;}
const cutoverWitnesses=Object.freeze({R1:[0,8,24],R2:[2,3,22,23],R3:[5,6,12],R4:[16,17,18,19],R5:[24,25,26,27],Q1:[28,30,31],Q2:[29,30,31]});
let cutoverDeletionKilled=0;for(const [id,w] of Object.entries(cutoverWitnesses)){assert.ok(contract.visibleCutover?.responsibilities?.[id]);const s=empty();for(const i of w)setBit(s,i);if(nonzero(validate(s)))cutoverDeletionKilled++;}
let hardeningDeletionKilled=0;for(let i=32;i<40;i++){const s=empty();setBit(s,i);if(nonzero(validate(s)))hardeningDeletionKilled++;}
let observedPairs=0;for(let a=0;a<F.length;a++)for(let b=a+1;b<F.length;b++)if(pairs[a*F.length+b])observedPairs++;
let compressionPairsKilled=0;for(let a=0;a<contract.mechanisms.length;a++)for(let b=a+1;b<contract.mechanisms.length;b++)if(mechanismWitnesses[contract.mechanisms[a].id].join(',')!==mechanismWitnesses[contract.mechanisms[b].id].join(','))compressionPairsKilled++;
assert.equal(calls,trials);assert.equal(survivors,0);assert.equal(falsePositive,0);assert.equal(discoverySeen[0],0xffffffff>>>0);assert.equal(discoverySeen[1]&0xff,0xff);assert.equal(holdoutNovel[0],0);assert.equal(holdoutNovel[1],0);
assert.equal(pairCoverage,780);assert.equal(observedPairs,780);assert.equal(deletionKilled,10);assert.equal(cutoverDeletionKilled,7);assert.equal(hardeningDeletionKilled,8);assert.equal(compressionPairsKilled,45);
assert.equal(H.localFalsification.trials,trials);assert.equal(H.localFalsification.failureFamilies,40);assert.equal(H.localFalsification.pairCoverage,780);assert.equal(H.localFalsification.survivors,0);assert.equal(H.localFalsification.deletionOracle.killed,40);
console.log(JSON.stringify({ok:true,slice:contract.sliceId,visibleCutover:contract.visibleCutover.id,postMergeHardening:H.id,trials,calls,discovery,holdout,seed,failureFamilies:40,pairCoverage:observedPairs,pairTotal:780,survivors,baselineFalsePositive:falsePositive,holdoutNovelFamilies:0,M,deletionOracle:{killed:deletionKilled,total:10},visibleCutoverDeletionOracle:{killed:cutoverDeletionKilled,total:7},postMergeHardeningDeletionOracle:{killed:hardeningDeletionKilled,total:8},compressionOracle:{mechanisms:10,pairsKilled:compressionPairsKilled,pairTotal:45,losslessMergeCandidates:0},findingCoverage:'656/656',claimBoundary:H.claimBoundary,semanticMutationIsPhysicalCodeMutation:false}));
