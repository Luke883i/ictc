import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectRuntimeObservation,loadScope0,semanticState,validateSemanticState} from './scope-0-check.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const MODEL=process.argv[2]||path.join(HERE,'scope-0-model.json');
const ROOT=path.resolve(process.argv[3]||path.join(HERE,'..'));
const SEED='ictc-scope-0-runtime-semantic-2026-09-11';
const TRIALS=1_000_000;
const model=loadScope0(MODEL);
const observation=collectRuntimeObservation(ROOT);
const baseline=semanticState(model,observation);
const baselineFailures=validateSemanticState(baseline);
assert.equal(baselineFailures.length,0,JSON.stringify(baselineFailures));

// Mutation values are deliberately type-destructive or invariant-destructive. Every family
// is first materialized and must be killed by the same full semantic validator used below.
function invalidValue(value){
  if(typeof value==='boolean') return !value;
  if(typeof value==='number') return value===0?1:0;
  if(value===null) return 'scope-mutant-non-null';
  if(typeof value==='string') return '';
  return null;
}
const keys=Object.keys(baseline);
const families=keys.map(key=>({
  id:`field-${key}`,
  key,
  mutate:s=>{s[key]=invalidValue(s[key]);}
}));

const material=[];
for(const family of families){
  const mutant={...baseline};
  family.mutate(mutant);
  const failures=validateSemanticState(mutant);
  material.push({family:family.id,key:family.key,killed:failures.length>0,firstFailure:failures[0]?.code||null});
}
const survivorsMaterial=material.filter(x=>!x.killed);
assert.equal(survivorsMaterial.length,0,JSON.stringify(survivorsMaterial));

let rngState=Number.parseInt(crypto.createHash('sha256').update(SEED).digest('hex').slice(0,8),16)>>>0;
function rng(){rngState^=rngState<<13;rngState^=rngState>>>17;rngState^=rngState<<5;rngState>>>=0;return rngState/0x100000000;}
function pickDistinct(count){
  const out=[];
  while(out.length<count){const idx=Math.floor(rng()*families.length);if(!out.includes(idx))out.push(idx);}
  return out;
}
function category(key){
  if(key.startsWith('obs'))return 'runtime-observation';
  if(/^operator|buyer|contributors|assuranceReader|persona/.test(key))return 'operator-buyer';
  if(/^jobs|jobNames|nonJob/.test(key))return 'must-win-jobs';
  if(/^process|policy|minimum|disable|epCross/.test(key))return 'process-breadth';
  if(/^topology|defaultBind|tenant|networked|directPublic|activeActive|managedSaas/.test(key))return 'deployment-topology';
  if(/^scale|namedUsers|sessions|tenants|activeRecords|writeBurst|svLimit|writeSerialized|capacityState|noSilentLoss/.test(key))return 'scale-capacity';
  if(/^primaryClient|authoringWidth|responsiveWidth|secondaryReview|a11y|crossEngine|nativeApps|offline|legacyBrowser/.test(key))return 'clients';
  if(/^launcher|engine|installMode|preRecovery|rollback|blind|autoUpdater|zeroDowntime|provenance/.test(key))return 'delivery';
  if(/^data|secrets|residency|aiOptIn|aiNoLegal|universalRegulated/.test(key))return 'data-residency';
  if(/^serviceClass|haRequired|downtime|availability|universalRto|recoveryE4|capacityNoSilent|safety/.test(key))return 'availability-recovery';
  if(/^inbound|identityUpstream|aiOptional|outbound|masterExternal|bidir|marketplace|vendorCore/.test(key))return 'integrations';
  if(/^scopeRoles|roleExpansion|delegation|auditorMutation|aiAuthority|identityTrace|hardMaker|sod/.test(key))return 'roles-sod';
  if(/^metric|timeTarget|completionTarget|comprehensionTarget|receiptTarget|processTarget|surfaceTarget|atTarget|forbiddenProxies|marketFit/.test(key))return 'success-metrics';
  if(/^preserveArch|changeAuthority|forbiddenArch|allowedGrowth|ownerBudget/.test(key))return 'architecture-budget';
  if(/^ui/.test(key))return 'uiux-inheritance';
  if(/^handoff/.test(key))return 'reality-handoff';
  if(key==='epistemic')return 'epistemic-boundary';
  return 'model-control-plane';
}
const abstractionCounts={};
for(const k of keys)abstractionCounts[category(k)]=0;
let survivors=0,harnessErrors=0,totalAppliedMutations=0;
let firstSurvivor=null;
for(let i=0;i<TRIALS;i++){
  try{
    const count=1+Math.floor(rng()*4);
    const indices=pickDistinct(count);
    const mutant={...baseline};
    for(const idx of indices){
      const family=families[idx];family.mutate(mutant);abstractionCounts[category(family.key)]++;totalAppliedMutations++;
    }
    const failures=validateSemanticState(mutant);
    if(failures.length===0){survivors++;if(!firstSurvivor)firstSurvivor={trial:i,families:indices.map(x=>families[x].id)};}
  }catch(error){harnessErrors++;if(harnessErrors<4)console.error(`harness:${i}:${error?.stack||error}`);}
}
const runtimeObservedKeys=keys.filter(k=>k.startsWith('obs'));
const sourceDigest=crypto.createHash('sha256').update(JSON.stringify({
  baseMain:model.observedMainSha,
  sourceAuthorities:model.sourceAuthorities.map(x=>x.path),
  runtimeObserved:Object.fromEntries(runtimeObservedKeys.map(k=>[k,baseline[k]]))
})).digest('hex');
const result={
  ok:survivors===0&&harnessErrors===0,
  evidenceGrade:'E2-repository-runtime-semantic-model',
  seed:SEED,
  trials:TRIALS,
  compositionSize:'1..4 distinct mutation families per trial',
  semanticFields:keys.length,
  runtimeObservedFields:runtimeObservedKeys.length,
  families:families.length,
  materialMutants:material.length,
  materialKilled:material.filter(x=>x.killed).length,
  totalAppliedMutations,
  survivors,
  harnessErrors,
  firstSurvivor,
  abstractionCounts,
  runtimeObservationDigest:sourceDigest,
  method:'collectRuntimeObservation reads canonical repository/runtime sources; semanticState normalizes target plus observed runtime contracts; every material family corrupts one validated semantic field and must fail; each of 1,000,000 deterministic trials then applies 1..4 distinct corruptions to a fresh normalized state and executes validateSemanticState on the mutated state.',
  claimBoundary:'These are one million actually applied and validated semantic mutations over a repository/runtime-derived contract state. They are not one million HTTP requests, server processes, browser sessions, human studies, independent code mutants, deployment tests or external assurance.'
};
console.log(JSON.stringify(result,null,2));
if(!result.ok)process.exit(1);
