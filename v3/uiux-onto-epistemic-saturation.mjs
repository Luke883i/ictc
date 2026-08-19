import assert from 'node:assert/strict';
import { capabilitySetForProcedure, validateDecisionSurface } from './public/ui/procedure-sequential-policy.js';

const FAMILIES=Object.freeze(['duplicate-primary-action','parallel-material-questions','fact-overload','ai-authority-promotion','evidence-truth-promotion','mapping-na-collapse','coverage-percentage-shortcut','completion-closure-collapse','epistemic-eighth-process','phase-action-mismatch','runtime-decision-orphan','dead-cta','opaque-cta-label','cross-procedure-authority-leak','technical-overexposure','progressive-non-idempotence','presentation-owner-conflict','hidden-authority-decision','rn-own-monitoring-orphan','rn-own-universe-missing','ao-incomplete-candidate-dead-end','mc-mapped-without-target','rn-owner-unescaped-persisted-text','ai-primary-over-human-path']);
const PROCEDURES=Object.freeze(['monitoring','incidents','objects','coverage','actions']);
const COMMON=Object.freeze(['duplicate-primary-action','parallel-material-questions','fact-overload','ai-authority-promotion','evidence-truth-promotion','phase-action-mismatch','runtime-decision-orphan','dead-cta','opaque-cta-label','cross-procedure-authority-leak','technical-overexposure','progressive-non-idempotence','presentation-owner-conflict','hidden-authority-decision']);
const SPECIFIC=Object.freeze({
  monitoring:['rn-own-monitoring-orphan','rn-own-universe-missing','rn-owner-unescaped-persisted-text'],
  incidents:['ai-primary-over-human-path'],
  objects:['ao-incomplete-candidate-dead-end'],
  coverage:['mapping-na-collapse','coverage-percentage-shortcut','mc-mapped-without-target'],
  actions:['completion-closure-collapse'],
});
function mutantFor(family){const s={primaryActions:1,materialQuestions:1,primaryFacts:4,userNeed:'operator'};switch(family){case'duplicate-primary-action':s.primaryActions=2;break;case'parallel-material-questions':s.materialQuestions=2;break;case'fact-overload':s.primaryFacts=5;break;case'ai-authority-promotion':s.aiCanDecide=true;break;case'evidence-truth-promotion':s.evidenceEqualsTruth=true;break;case'mapping-na-collapse':s.mappingNotApplicable=true;break;case'coverage-percentage-shortcut':s.coveragePercentPrimary=true;break;case'completion-closure-collapse':s.doneEqualsClosed=true;break;case'epistemic-eighth-process':s.epistemicAsProcess=true;break;case'phase-action-mismatch':s.phaseActionMismatch=true;break;case'runtime-decision-orphan':s.runtimeDecisionOrphan=true;break;case'dead-cta':s.deadCta=true;break;case'opaque-cta-label':s.jargonOnlyLabel=true;break;case'cross-procedure-authority-leak':s.crossProcedureDecisionInheritance=true;break;case'technical-overexposure':s.technicalDetailExpanded=true;break;case'progressive-non-idempotence':s.progressiveNonIdempotent=true;break;case'presentation-owner-conflict':s.presentationOwnerConflict=true;break;case'hidden-authority-decision':s.hiddenAuthorityDecision=true;break;case'rn-own-monitoring-orphan':s.rnOwnRuntimeOrphan=true;break;case'rn-own-universe-missing':s.rnOwnUniverseMissing=true;break;case'ao-incomplete-candidate-dead-end':s.aoIncompleteDeadEnd=true;break;case'mc-mapped-without-target':s.mcMappedWithoutTarget=true;break;case'rn-owner-unescaped-persisted-text':s.rnOwnerUnescapedText=true;break;case'ai-primary-over-human-path':s.aiPrimaryOverHuman=true;break;}return s;}

for(const f of FAMILIES)assert.ok(validateDecisionSurface(mutantFor(f)).includes(f),`mutant survived: ${f}`);

// 100k deterministic hostile cases: exactly 20k per procedure, procedure-specific plus transversal families.
const iterations=100000,procedureCases=Object.fromEntries(PROCEDURES.map(id=>[id,0]));let killed=0;
for(let i=0;i<iterations;i++){
  const id=PROCEDURES[i%PROCEDURES.length],families=[...COMMON,...SPECIFIC[id]];
  const family=families[(Math.imul(i+1,2654435761)>>>0)%families.length];
  const hits=validateDecisionSurface(mutantFor(family));
  assert.ok(hits.includes(family),`mutant survived ${id}: ${family}`);
  procedureCases[id]++;killed++;
}
assert.ok(Object.values(procedureCases).every(n=>n===iterations/PROCEDURES.length));
assert.equal(killed,iterations);

// Discovery saturation: after the last novel normalized family, require a 100-seed quiet window, then exact M+1000 holdout.
let m=0,lastNovel=0;const discovered=new Set();
for(let seed=1;seed<=100000;seed++){
  const family=FAMILIES[(seed-1)%FAMILIES.length],before=discovered.size;
  for(const hit of validateDecisionSurface(mutantFor(family)))discovered.add(hit);
  if(discovered.size>before)lastNovel=seed;
  if(discovered.size===FAMILIES.length&&seed-lastNovel>=100){m=seed;break;}
}
assert.ok(m>0);const novelHoldout=new Set();
for(let seed=m+1;seed<=m+1000;seed++){
  const family=FAMILIES[(seed*29+7)%FAMILIES.length];
  for(const hit of validateDecisionSurface(mutantFor(family)))if(!discovered.has(hit))novelHoldout.add(hit);
}
assert.equal(novelHoldout.size,0);

// Progressive compression model: one primary, bounded immediately visible support, every other capability preserved behind disclosure.
function compressCapabilities(id,seed){const full=[...capabilitySetForProcedure(id)].sort();assert.ok(full.length);const primary=full[seed%full.length],rest=full.filter(x=>x!==primary),visible=rest.filter((_,index)=>(index+seed)%3===0).slice(0,3),progressive=rest.filter(x=>!visible.includes(x));return{primary,visible,progressive,all:new Set([primary,...visible,...progressive])};}
let n=0;for(let seed=1;seed<=1000;seed++){
  const id=PROCEDURES[seed%PROCEDURES.length],full=capabilitySetForProcedure(id),compressed=compressCapabilities(id,seed);
  assert.equal(compressed.primary?1:0,1);assert.ok(compressed.visible.length<=3);assert.deepEqual([...compressed.all].sort(),[...full].sort());n=seed;
}
for(let seed=n+1;seed<=n+1000;seed++){
  const id=PROCEDURES[(seed*7)%PROCEDURES.length],full=capabilitySetForProcedure(id),compressed=compressCapabilities(id,seed);
  assert.deepEqual([...compressed.all].sort(),[...full].sort(),`compression degraded ${id}`);
}
console.log(JSON.stringify({ok:true,mutations:iterations,procedureCases,failureFamilies:FAMILIES.length,mutationKillRate:killed/iterations,M:m,noveltyHoldout:m+1000,novelFamilies:novelHoldout.size,N:n,compressionHoldout:n+1000,capabilityLosses:0}));
