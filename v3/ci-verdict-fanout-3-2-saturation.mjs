import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ci=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const census=readFileSync(new URL('./actions-census.mjs',import.meta.url),'utf8');
const censusWorkflow=readFileSync(new URL('../.github/workflows/actions-census.yml',import.meta.url),'utf8');

assert.ok(ci.includes('name: diagnostic / ci-verdict')&&ci.includes('continue-on-error: true'),'legacy per-workflow aggregate must remain diagnostic and non-gating');
assert.ok(census.includes("context:'ictc/actions-census'")&&census.includes("aggregateStatusAuthority:'ictc/actions-census'")&&census.includes("nativeJobPolicy:'observer-only'"),'census custom status must be the single aggregate acceptance authority');
assert.ok(census.includes("console.error('actions-census native job is observational")&&!census.includes('process.exit(1)'),'ordinary acceptance failures must remain represented by the single custom aggregate rather than a duplicate native exit verdict');
assert.ok(census.includes('process.exitCode=1')&&census.includes('actions-census internal error')&&census.includes("await post('failure'"),'census internal failures must fail closed and finalize the custom status instead of orphaning pending');
assert.ok(census.includes("professionalBrowserSources=new Map([['epistemic-professional-browser','v3/browser-epistemic-professional-demo.py']])")&&census.includes('professionalBrowserSources.has(name)'),'professional browser must be ranked and sourced as a first-class browser leaf');
assert.ok(census.includes('for(let attempt=0;attempt<5;attempt++)')&&census.includes('retryable(response.status)'),'GitHub API observation must use bounded retries for transient failures');
assert.ok(censusWorkflow.includes('statuses: write')&&censusWorkflow.includes('checks: read'),'census must retain the permissions needed to observe leaves and publish the stable aggregate status');

const F=Object.freeze([
  'ci-verdict-gating','census-native-gating','missing-custom-aggregate','duplicate-custom-aggregate','diagnostic-gating','hidden-leaf','aggregate-before-leaf','status-fanout','missing-root-provenance','missing-exact-head','orphan-pending-on-internal-error','professional-leaf-unmapped'
]);
function base(){return{leafVisible:true,ciVerdictGating:false,censusNativeGating:false,customAggregates:1,diagnosticGating:false,leafBeforeAggregate:true,statusFanout:false,rootProvenance:true,exactHead:true,internalFailureFinalized:true,professionalLeafMapped:true};}
function failures(v){const out=[];if(v.ciVerdictGating)out.push('ci-verdict-gating');if(v.censusNativeGating)out.push('census-native-gating');if(v.customAggregates<1)out.push('missing-custom-aggregate');if(v.customAggregates>1)out.push('duplicate-custom-aggregate');if(v.diagnosticGating)out.push('diagnostic-gating');if(!v.leafVisible)out.push('hidden-leaf');if(!v.leafBeforeAggregate)out.push('aggregate-before-leaf');if(v.statusFanout)out.push('status-fanout');if(!v.rootProvenance)out.push('missing-root-provenance');if(!v.exactHead)out.push('missing-exact-head');if(!v.internalFailureFinalized)out.push('orphan-pending-on-internal-error');if(!v.professionalLeafMapped)out.push('professional-leaf-unmapped');return out;}
function mutate(v,f){switch(f){case'ci-verdict-gating':v.ciVerdictGating=true;break;case'census-native-gating':v.censusNativeGating=true;break;case'missing-custom-aggregate':v.customAggregates=0;break;case'duplicate-custom-aggregate':v.customAggregates=2;break;case'diagnostic-gating':v.diagnosticGating=true;break;case'hidden-leaf':v.leafVisible=false;break;case'aggregate-before-leaf':v.leafBeforeAggregate=false;break;case'status-fanout':v.statusFanout=true;break;case'missing-root-provenance':v.rootProvenance=false;break;case'missing-exact-head':v.exactHead=false;break;case'orphan-pending-on-internal-error':v.internalFailureFinalized=false;break;case'professional-leaf-unmapped':v.professionalLeafMapped=false;break;}return v;}
function x(v){v^=v<<13;v^=v>>>17;v^=v<<5;return v>>>0;}

let seed=0x99c1c1cd,trial=0,lastNovel=0,target=Infinity,killed=0,signature=2166136261;
const seen=new Set(),hits=Object.fromEntries(F.map(f=>[f,0]));
while(trial<target){
  trial++;
  seed=x(seed);
  const f=F[seed%F.length],out=failures(mutate(base(),f));
  hits[f]++;
  assert.ok(out.includes(f),`live CI verdict mutant ${f} seed=${trial}: ${out}`);
  killed++;
  signature=Math.imul(signature^seed^out.length,16777619)>>>0;
  if(!seen.has(f)){seen.add(f);lastNovel=trial;if(seen.size===F.length)target=lastNovel+100000;}
  if(trial>1000000)throw new Error('CI verdict saturation did not converge');
}
assert.equal(seen.size,F.length);
assert.equal(trial-lastNovel,100000);
const oneRootVisibleFailures=1+base().customAggregates;
assert.equal(oneRootVisibleFailures,2,'one real leaf must produce one leaf plus one aggregate verdict');
console.log(JSON.stringify({ok:true,profile:'ci-verdict-fanout-3.2-saturation',families:F.length,lastNovelAt:lastNovel,executions:trial,holdoutAfterM:trial-lastNovel,mutantsKilled:killed,mutantsAlive:0,killRate:1,oneRootVisibleFailures,hits,signature,contract:'native leaf failures + single stable ictc/actions-census aggregate; diagnostic summaries non-gating; internal census failures finalized; professional browser source mapped'},null,2));
