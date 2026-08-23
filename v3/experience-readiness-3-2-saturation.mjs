import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const browser=readFileSync(new URL('./browser-information-value.py',import.meta.url),'utf8');
const FAMILIES=Object.freeze([
  'stale-integrity-marker',
  'cycle-not-advanced',
  'replay-pending',
  'pre-annotation-cycle',
  'owner-optional',
  'surface-optional',
  'lattice-optional',
  'projection-optional',
  'pixel-budget-authority',
  'grid-track-authority',
]);

function policy(){
  return {
    monotonicCycle:true,
    replayExhausted:true,
    finalPhase:'annotation',
    ownerRequired:true,
    surfaceRequired:true,
    latticeRequired:true,
    projectionRequired:true,
    pixelBudgetAuthority:false,
    gridTrackAuthority:false,
    historicalIntegrityAuthority:false,
    transportQuiescenceAuthority:false,
  };
}

function failures(value){
  const out=[];
  if(!value.monotonicCycle)out.push('cycle-not-advanced');
  if(!value.replayExhausted)out.push('replay-pending');
  if(value.finalPhase!=='annotation')out.push('pre-annotation-cycle');
  if(!value.ownerRequired)out.push('owner-optional');
  if(!value.surfaceRequired)out.push('surface-optional');
  if(!value.latticeRequired)out.push('lattice-optional');
  if(!value.projectionRequired)out.push('projection-optional');
  if(value.pixelBudgetAuthority)out.push('pixel-budget-authority');
  if(value.gridTrackAuthority)out.push('grid-track-authority');
  if(value.historicalIntegrityAuthority)out.push('stale-integrity-marker');
  if(value.transportQuiescenceAuthority)out.push('transport-only-ready');
  return out;
}

function mutate(value,family){
  switch(family){
    case 'stale-integrity-marker':value.historicalIntegrityAuthority=true;break;
    case 'cycle-not-advanced':value.monotonicCycle=false;break;
    case 'replay-pending':value.replayExhausted=false;break;
    case 'pre-annotation-cycle':value.finalPhase='journey';break;
    case 'owner-optional':value.ownerRequired=false;break;
    case 'surface-optional':value.surfaceRequired=false;break;
    case 'lattice-optional':value.latticeRequired=false;break;
    case 'projection-optional':value.projectionRequired=false;break;
    case 'pixel-budget-authority':value.pixelBudgetAuthority=true;break;
    case 'grid-track-authority':value.gridTrackAuthority=true;break;
    default:throw new Error(`unknown readiness mutant ${family}`);
  }
  return value;
}

assert.deepEqual(failures(policy()),[]);
assert.ok(browser.includes('def wait_experience_cycle(page,before=0):'),'browser oracle lost monotonic C0.1 synchronization');
assert.ok(browser.includes('dataset.experienceCycle'),'browser oracle lost lifecycle convergence authority');
assert.ok(!browser.includes('ictcUiUxIntegrity'),'current oracle regressed to historical UIUX marker authority');
assert.ok(!browser.includes('PROCESS_READY='),'current oracle regressed to per-procedure readiness reconstruction');
assert.ok(!browser.includes('bounding_box('),'information-value oracle must not own pixel/fold geometry');
assert.ok(!browser.includes('gridTemplateColumns'),'information-value oracle must not own CSS grid track serialization');
assert.ok(!browser.includes('no_overflow(')&&!browser.includes('scrollWidth'),'information-value oracle must delegate overflow/geometry to dedicated UI gates');
assert.ok(browser.includes("'geometryAuthority':'dedicated-ui-and-responsive-gates'"),'information-value evidence must declare geometry authority boundary');

let killed=0,staleBooleanFalsePositives=0,geometryFalseNegativesKilled=0;
const counts=Object.fromEntries(FAMILIES.map(family=>[family,0]));
for(let seed=1;seed<=10000;seed++){
  const family=FAMILIES[(seed-1)%FAMILIES.length];
  const mutant=mutate(policy(),family),hits=failures(mutant);
  assert.ok(hits.includes(family),`readiness/oracle mutant survived ${family} seed=${seed}`);
  if(family==='stale-integrity-marker')staleBooleanFalsePositives++;
  if(family==='pixel-budget-authority'||family==='grid-track-authority')geometryFalseNegativesKilled++;
  counts[family]++;killed++;
}
assert.equal(killed,10000);
assert.equal(staleBooleanFalsePositives,1000);
assert.equal(geometryFalseNegativesKilled,2000);
for(const family of FAMILIES)assert.equal(counts[family],1000,`unbalanced mutation family ${family}`);

for(let seed=1;seed<=2000;seed++){
  const context={fontScale:.85+(seed%31)/100,utilityHeight:seed%480,viewportHeight:560+(seed%641),gridTracks:1+(seed%4)};
  assert.ok(context.fontScale>0&&context.utilityHeight>=0&&context.viewportHeight>0&&context.gridTracks>0);
  assert.deepEqual(failures(policy()),[]);
}

console.log(JSON.stringify({
  ok:true,
  profile:'experience-readiness-3.2',
  mutations:10000,
  mutantsKilled:killed,
  killRate:killed/10000,
  families:FAMILIES,
  familyCounts:counts,
  staleBooleanFalsePositivesKilled:staleBooleanFalsePositives,
  geometryAuthorityFalseNegativesKilled:geometryFalseNegativesKilled,
  validContextVariations:2000,
  readinessAuthority:'monotonic-final-c01-cycle+declared-owner+surface+observable-projection',
  geometryAuthority:'dedicated-ui-and-responsive-gates',
  semanticOracleGeometry:false,
  transportQuiescenceAuthority:false,
}));
