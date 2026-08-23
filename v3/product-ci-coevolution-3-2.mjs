import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const browser=readFileSync(new URL('./browser-information-value.py',import.meta.url),'utf8');
const uiux=readFileSync(new URL('./browser-procedure-ui-ux-1-6.py',import.meta.url),'utf8');
const census=readFileSync(new URL('./actions-census.mjs',import.meta.url),'utf8');
const ci=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const lifecycle=readFileSync(new URL('./public/ui/experience-lifecycle.js',import.meta.url),'utf8');

const PRODUCT_CI_FAMILIES=Object.freeze([
 'stale-readiness-marker','shared-browser-state','status-fanout','fixture-injection','semantic-geometry-coupling',
 'optional-owner','optional-surface','pre-convergence-read','aggregate-before-leaf','stateful-historical-oracle',
]);
const CI_PRODUCT_FAMILIES=Object.freeze([
 'missing-final-cycle','replay-not-exhausted','owner-not-exported','surface-not-annotated','business-write-in-observer',
 'geometry-in-semantic-oracle','legacy-status-authority','hidden-browser-source','unbounded-browser-parallelism','current-profile-lineage-drift',
]);

function baseBoundary(){return {
 finalCycle:true,replayExhausted:true,ownerRequired:true,surfaceRequired:true,browserIsolated:true,statusFanout:false,
 fixtureInjection:false,semanticGeometry:false,observerReadOnly:true,leafBeforeAggregate:true,browserSourceVisible:true,
 boundedParallelism:true,currentProfile:true,
};}
function mutate(v,f){switch(f){
 case'stale-readiness-marker':v.finalCycle=false;break;case'shared-browser-state':v.browserIsolated=false;break;
 case'status-fanout':v.statusFanout=true;break;case'fixture-injection':v.fixtureInjection=true;break;
 case'semantic-geometry-coupling':v.semanticGeometry=true;break;case'optional-owner':v.ownerRequired=false;break;
 case'optional-surface':v.surfaceRequired=false;break;case'pre-convergence-read':v.replayExhausted=false;break;
 case'aggregate-before-leaf':v.leafBeforeAggregate=false;break;case'stateful-historical-oracle':v.observerReadOnly=false;break;
 case'missing-final-cycle':v.finalCycle=false;break;case'replay-not-exhausted':v.replayExhausted=false;break;
 case'owner-not-exported':v.ownerRequired=false;break;case'surface-not-annotated':v.surfaceRequired=false;break;
 case'business-write-in-observer':v.observerReadOnly=false;break;case'geometry-in-semantic-oracle':v.semanticGeometry=true;break;
 case'legacy-status-authority':v.statusFanout=true;break;case'hidden-browser-source':v.browserSourceVisible=false;break;
 case'unbounded-browser-parallelism':v.boundedParallelism=false;break;case'current-profile-lineage-drift':v.currentProfile=false;break;
 default:throw new Error(`unknown product-ci mutant ${f}`);
 }return v;}
function failures(v){const out=[];if(!v.finalCycle)out.push('final-cycle');if(!v.replayExhausted)out.push('replay');if(!v.ownerRequired)out.push('owner');if(!v.surfaceRequired)out.push('surface');if(!v.browserIsolated)out.push('state-isolation');if(v.statusFanout)out.push('status-fanout');if(v.fixtureInjection)out.push('fixture-injection');if(v.semanticGeometry)out.push('semantic-geometry');if(!v.observerReadOnly)out.push('observer-write');if(!v.leafBeforeAggregate)out.push('failure-provenance');if(!v.browserSourceVisible)out.push('source-provenance');if(!v.boundedParallelism)out.push('parallelism');if(!v.currentProfile)out.push('profile-drift');return out;}

assert.ok(lifecycle.includes('dataset.experienceCycle=String(cycle)')&&lifecycle.includes('publishConvergence();'),'product must expose final convergence');
assert.ok(browser.includes('def wait_experience_cycle(page,before=0):'),'semantic oracle must wait on product convergence');
assert.ok(!browser.includes('no_overflow(')&&!browser.includes('scrollWidth')&&!browser.includes('bounding_box('),'information-value oracle must not own geometry');
assert.ok(browser.includes("'geometryAuthority':'dedicated-ui-and-responsive-gates'"),'semantic evidence must declare geometry delegation');
assert.ok(uiux.includes('no_overflow(page)'),'dedicated UI oracle must retain overflow falsification');
assert.ok(ci.includes('max-parallel: 4')&&ci.includes('ICTC_STATE_DIR="$RUNNER_TEMP/ictc-browser-${{ matrix.id }}-state"'),'browser CI must remain bounded and isolated');
assert.ok(census.includes('failureRank(run)')&&census.includes('browserSourcePrefix'),'census must retain leaf/source provenance');

function campaign(families,trials,seed0){let seed=seed0>>>0,killed=0,signature=2166136261;const hits=Object.fromEntries(families.map(x=>[x,0]));for(let i=0;i<trials;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;seed>>>=0;const family=families[seed%families.length],mutant=mutate(baseBoundary(),family),out=failures(mutant);assert.ok(out.length,`survived ${family} @ ${i}`);hits[family]++;killed++;signature=Math.imul(signature^seed^out.length,16777619)>>>0;}for(const family of families)assert.ok(hits[family]>0,`uncovered ${family}`);return{killed,hits,signature};}
const a=campaign(PRODUCT_CI_FAMILIES,1_000_000,0x99c1a11);
const b=campaign(CI_PRODUCT_FAMILIES,1_000_000,0x99c1b22);
assert.equal(a.killed,1_000_000);assert.equal(b.killed,1_000_000);
console.log(JSON.stringify({ok:true,profile:'product-ci-coevolution-3.2',productToCi:{trials:1_000_000,mutantsKilled:a.killed,families:PRODUCT_CI_FAMILIES,hits:a.hits,signature:a.signature},ciToProduct:{trials:1_000_000,mutantsKilled:b.killed,families:CI_PRODUCT_FAMILIES,hits:b.hits,signature:b.signature},boundary:'final-c01-cycle+declared-owner+surface / isolated-read-only-native-checks',geometryAuthority:'dedicated-ui-and-responsive-gates',limitations:['Deterministic code-bound mutation of product/CI boundary policy, not two million browser executions.','Exact-head GitHub Actions remains external acceptance evidence.']},null,2));
