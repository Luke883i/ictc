import assert from 'node:assert/strict';

const FAMILIES=Object.freeze([
  'stale-integrity-marker',
  'cycle-not-advanced',
  'cycle-regressed',
  'replay-pending',
  'pre-annotation-cycle',
  'owner-drift',
  'surface-drift',
  'lattice-drift',
  'projection-missing',
  'transport-only-ready',
]);

function baseline(seed){
  const before=1+(seed%97);
  return {
    before,
    after:before+1+(seed%3),
    finalPhase:'annotation',
    replayPending:false,
    ownerMatches:true,
    surfaceMatches:true,
    lattice:'3.2.0',
    projectionReady:true,
    integrityMarker:'1.6.1',
    transportReady:seed%2===0,
  };
}

function canonicalReady(state){
  return Number.isInteger(state.before)&&Number.isInteger(state.after)&&
    state.after>state.before&&
    state.finalPhase==='annotation'&&
    state.replayPending===false&&
    state.ownerMatches===true&&
    state.surfaceMatches===true&&
    state.lattice==='3.2.0'&&
    state.projectionReady===true;
}

function legacyIntegrityReady(state){
  return state.integrityMarker==='1.6.1'&&state.ownerMatches&&state.surfaceMatches&&state.projectionReady;
}

function mutate(state,family){
  switch(family){
    case 'stale-integrity-marker':state.after=state.before;state.integrityMarker='1.6.1';break;
    case 'cycle-not-advanced':state.after=state.before;state.integrityMarker='';break;
    case 'cycle-regressed':state.after=Math.max(0,state.before-1);break;
    case 'replay-pending':state.replayPending=true;break;
    case 'pre-annotation-cycle':state.finalPhase='journey';break;
    case 'owner-drift':state.ownerMatches=false;break;
    case 'surface-drift':state.surfaceMatches=false;break;
    case 'lattice-drift':state.lattice='3.1.0';break;
    case 'projection-missing':state.projectionReady=false;break;
    case 'transport-only-ready':state.projectionReady=false;state.transportReady=true;break;
    default:throw new Error(`unknown readiness mutant ${family}`);
  }
  return state;
}

for(let seed=1;seed<=1000;seed++)assert.equal(canonicalReady(baseline(seed)),true,`baseline rejected at seed ${seed}`);

const counts=Object.fromEntries(FAMILIES.map(family=>[family,0]));
let killed=0,legacyFalsePositives=0;
for(let seed=1;seed<=10000;seed++){
  const family=FAMILIES[(seed-1)%FAMILIES.length];
  const state=mutate(baseline(seed),family);
  assert.equal(canonicalReady(state),false,`readiness mutant survived ${family} seed=${seed}`);
  if(family==='stale-integrity-marker'){
    assert.equal(legacyIntegrityReady(state),true,`stale marker no longer demonstrates the legacy false-positive at seed=${seed}`);
    legacyFalsePositives++;
  }
  if(family==='transport-only-ready')assert.equal(state.transportReady,true);
  counts[family]++;killed++;
}

assert.equal(killed,10000);
assert.equal(legacyFalsePositives,1000);
for(const family of FAMILIES)assert.equal(counts[family],1000,`unbalanced mutation family ${family}`);

console.log(JSON.stringify({
  ok:true,
  profile:'experience-readiness-3.2',
  mutations:10000,
  mutantsKilled:killed,
  killRate:killed/10000,
  families:FAMILIES,
  familyCounts:counts,
  staleBooleanFalsePositivesKilled:legacyFalsePositives,
  readinessAuthority:'monotonic-final-c01-cycle+declared-owner+surface+observable-projection',
  transportQuiescenceAuthority:false,
}));
