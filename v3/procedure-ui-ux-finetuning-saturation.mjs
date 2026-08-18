import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

const contract=JSON.parse(await readFile(new URL('./procedure-ui-ux-ontoepistemic-contract-1-6.json',import.meta.url),'utf8'));
const PROCEDURES=Object.freeze(['RN-01','EC-01','AO-01','MC-01','AP-01']);
const RUNS_PER_PROCEDURE=100000;
const CROSS_RUNS=100000;
const NOVELTY_HOLDOUT=1000;
const COMPRESSION_HOLDOUT=1000;
const SEED=0x61f00d1d;

function mix(x){x|=0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
function word(seed,index){return mix((seed^Math.imul(index+1,0x9e3779b1))>>>0);}
function pick(list,seed,index){return list[word(seed,index)%list.length];}
function baseModel(code,index=0){
  const process=contract.procedures[code],surface=process.surfaces[index%process.surfaces.length];
  return{
    code,id:process.id,purpose:true,governedObject:process.governedObject,procedureMatches:1,phase:surface.phase,
    humanDecision:true,primaryActions:surface.primaryCta==='nessuna'?0:1,materialQuestions:1,primaryFacts:Math.min(4,1+(index%4)),
    cta:surface.primaryCta==='nessuna'?'':surface.primaryCta,ctaVerbFirst:true,ctaGeneric:false,ctaPhaseValid:true,
    runtimeRead:Boolean(surface.runtimeRead),runtimeWriteNeeded:(surface.writes||[]).length>0,runtimeWriteBound:(surface.writes||[]).length>0,
    persistenceReadbackReceipt:(surface.writes||[]).length>0?true:null,proofVisible:surface.proof!=='nessuna',proofMeaning:'support-only',
    claimBoundary:true,aiAuthority:'proposal-only',technicalDetail:'progressive-disclosure',decisionBeforeEvidence:true,
    touchTargetPx:44,focusVisible:true,motionReduction:true,denseColumns:3,presentationOwners:1,
    crossAuthorityTransfer:false,sharedLifecycle:false,rawAtomPrimary:false,percentageShortcut:false,epistemicAsProcess:false,
    mappingNaOwner:code==='MC-01'?'requirement-scope':'n/a',completionMeaning:code==='AP-01'?'ready-for-review-before-closed':'n/a',
    observationMeaning:code==='RN-01'?'observed-not-applicable':'n/a',activeObjectMeaning:code==='AO-01'?'registered-not-effective':'n/a',
    eventMeaning:code==='EC-01'?'fact-not-legal-conclusion':'n/a',labelLanguage:'it-readable',unknownPolicy:'preserve',
    surfaceId:surface.id
  };
}
function validate(m){
  const out=[];
  if(!m.purpose)out.push('purpose-erasure');
  if(!m.governedObject||m.procedureMatches!==1)out.push('ontology-ambiguity');
  if(!m.humanDecision)out.push('human-decision-erasure');
  if(m.primaryActions>1)out.push('primary-action-fanout');
  if(m.materialQuestions>1)out.push('material-question-fanout');
  if(m.primaryFacts>4)out.push('primary-fact-overflow');
  if(m.cta&&(!m.ctaVerbFirst||m.ctaGeneric))out.push('cta-language-ambiguity');
  if(!m.ctaPhaseValid)out.push('out-of-phase-primary-cta');
  if(m.runtimeWriteNeeded&&!m.runtimeWriteBound)out.push('fake-cta-runtime-owner');
  if(m.runtimeWriteNeeded&&m.runtimeWriteBound!==false&&!m.persistenceReadbackReceipt)out.push('write-without-readback-receipt');
  if(m.proofMeaning!=='support-only')out.push('evidence-truth-promotion');
  if(!m.claimBoundary)out.push('claim-boundary-erasure');
  if(m.aiAuthority!=='proposal-only')out.push('ai-authority-promotion');
  if(m.technicalDetail!=='progressive-disclosure')out.push('technical-detail-promotion');
  if(!m.decisionBeforeEvidence)out.push('evidence-before-decision');
  if(m.touchTargetPx<44)out.push('touch-target-regression');
  if(!m.focusVisible)out.push('focus-indicator-erasure');
  if(!m.motionReduction)out.push('motion-reduction-erasure');
  if(m.denseColumns>3)out.push('dense-card-overstimulation');
  if(m.presentationOwners!==1)out.push('presentation-owner-overlap');
  if(m.crossAuthorityTransfer)out.push('cross-procedure-authority-transfer');
  if(m.sharedLifecycle)out.push('cross-procedure-lifecycle-collapse');
  if(m.rawAtomPrimary)out.push('raw-atom-primary-dominance');
  if(m.percentageShortcut)out.push('percentage-decision-shortcut');
  if(m.epistemicAsProcess)out.push('epistemic-eighth-process');
  if(m.code==='MC-01'&&m.mappingNaOwner!=='requirement-scope')out.push('mapping-na-scope-conflation');
  if(m.code==='AP-01'&&m.completionMeaning!=='ready-for-review-before-closed')out.push('completion-closure-collapse');
  if(m.code==='RN-01'&&m.observationMeaning!=='observed-not-applicable')out.push('observation-applicability-collapse');
  if(m.code==='AO-01'&&m.activeObjectMeaning!=='registered-not-effective')out.push('active-object-effectiveness-collapse');
  if(m.code==='EC-01'&&m.eventMeaning!=='fact-not-legal-conclusion')out.push('event-legal-conclusion-collapse');
  if(m.code==='EC-01'&&m.unknownPolicy!=='preserve')out.push('unknown-fact-fabrication');
  if(m.labelLanguage!=='it-readable')out.push('inaccessible-jargon-label');
  return out;
}
const COMMON_ATTACKS=Object.freeze([
  ['drop-purpose',m=>{m.purpose=false;}],['ambiguous-object',m=>{m.procedureMatches=2;}],['remove-human-decision',m=>{m.humanDecision=false;}],
  ['duplicate-primary',m=>{m.primaryActions=2;}],['duplicate-question',m=>{m.materialQuestions=2;}],['overflow-facts',m=>{m.primaryFacts=7;}],
  ['generic-cta',m=>{m.cta='Drilldown';m.ctaGeneric=true;m.ctaVerbFirst=false;}],['wrong-phase-cta',m=>{m.ctaPhaseValid=false;}],
  ['fake-endpoint',m=>{m.runtimeWriteNeeded=true;m.runtimeWriteBound=false;}],['no-receipt',m=>{m.runtimeWriteNeeded=true;m.runtimeWriteBound=true;m.persistenceReadbackReceipt=false;}],
  ['evidence-is-truth',m=>{m.proofMeaning='substantive-truth';}],['hide-boundary',m=>{m.claimBoundary=false;}],['ai-decides',m=>{m.aiAuthority='decision-authority';}],
  ['raw-primary',m=>{m.technicalDetail='primary';}],['evidence-first',m=>{m.decisionBeforeEvidence=false;}],['small-target',m=>{m.touchTargetPx=32;}],
  ['no-focus',m=>{m.focusVisible=false;}],['no-reduced-motion',m=>{m.motionReduction=false;}],['four-dense-columns',m=>{m.denseColumns=4;}],
  ['duplicate-owner',m=>{m.presentationOwners=2;}],['jargon-label',m=>{m.labelLanguage='technical-jargon';}]
]);
const SPECIFIC=Object.freeze({
  'RN-01':[
    ['observed-is-applicable',m=>{m.observationMeaning='applicable';}],['confidence-authority',m=>{m.aiAuthority='confidence-authority';}],['run-and-pause-primary',m=>{m.primaryActions=3;}]
  ],
  'EC-01':[
    ['legal-conclusion-as-fact',m=>{m.eventMeaning='legal-conclusion-as-fact';}],['guess-unknown',m=>{m.unknownPolicy='guess';}],['ai-draft-primary-only',m=>{m.aiAuthority='primary-path';}]
  ],
  'AO-01':[
    ['active-is-effective',m=>{m.activeObjectMeaning='effective';}],['requirement-as-object',m=>{m.procedureMatches=2;}],['validate-and-reject-primary',m=>{m.primaryActions=2;}]
  ],
  'MC-01':[
    ['mapping-na',m=>{m.mappingNaOwner='mapping';}],['coverage-percent-primary',m=>{m.percentageShortcut=true;}],['three-mapping-decisions-primary',m=>{m.primaryActions=3;}]
  ],
  'AP-01':[
    ['completion-is-closed',m=>{m.completionMeaning='closed-on-complete';}],['orphan-verify',m=>{m.runtimeWriteNeeded=true;m.runtimeWriteBound=false;}],['start-and-complete-primary',m=>{m.primaryActions=2;}]
  ]
});
const CROSS_ATTACKS=Object.freeze([
  ['authority-transfer',m=>{m.crossAuthorityTransfer=true;}],['shared-lifecycle',m=>{m.sharedLifecycle=true;}],['ep-as-process',m=>{m.epistemicAsProcess=true;}],
  ['two-presentation-owners',m=>{m.presentationOwners=2;}],['raw-atoms-primary',m=>{m.rawAtomPrimary=true;}],['cross-fake-endpoint',m=>{m.runtimeWriteNeeded=true;m.runtimeWriteBound=false;}],
  ['rn-to-mc-applicability',m=>{m.code='RN-01';m.observationMeaning='applicable';}],['ec-to-ap-auto-close',m=>{m.code='AP-01';m.completionMeaning='closed-on-complete';}],
  ['ao-to-mc-effective',m=>{m.code='AO-01';m.activeObjectMeaning='effective';}],['mc-to-ap-compliant',m=>{m.percentageShortcut=true;}],
  ['ai-cross-decision',m=>{m.aiAuthority='decision-authority';}],['cross-question-fanout',m=>{m.materialQuestions=3;}],['cross-action-fanout',m=>{m.primaryActions=4;}],
  ['cross-jargon',m=>{m.labelLanguage='technical-jargon';}],['cross-boundary-erasure',m=>{m.claimBoundary=false;}]
]);
function mutate(base,attack){const m=structuredClone(base);attack[1](m);return m;}
const baselineViolations=[];for(const code of PROCEDURES)for(let i=0;i<contract.procedures[code].surfaces.length;i++)baselineViolations.push(...validate(baseModel(code,i)));
assert.deepEqual(baselineViolations,[],'canonical UI/UX model must start valid');

let globalIndex=0,lastNovel=0,attempted=0,killed=0;const discovered=new Set(),perProcedure={},perAttack={},samples=[];
function runMutation(code,attack,index,domain){
  const base=baseModel(code,index),mutant=mutate(base,attack),violations=validate(mutant);attempted++;assert.ok(violations.length,`${domain}:${code}:${attack[0]} survived`);killed++;
  perProcedure[code]??={attempted:0,killed:0};perProcedure[code].attempted++;perProcedure[code].killed++;
  perAttack[attack[0]]??={attempted:0,killed:0};perAttack[attack[0]].attempted++;perAttack[attack[0]].killed++;
  globalIndex++;
  for(const family of violations)if(!discovered.has(family)){discovered.add(family);lastNovel=globalIndex;if(samples.length<80)samples.push({at:globalIndex,domain,procedure:code,attack:attack[0],family,surfaceId:base.surfaceId});}
}
for(let p=0;p<PROCEDURES.length;p++){
  const code=PROCEDURES[p],attacks=[...COMMON_ATTACKS,...SPECIFIC[code]],seed=SEED^(0x1020304*(p+1));
  for(let i=0;i<RUNS_PER_PROCEDURE;i++)runMutation(code,pick(attacks,seed,i),i,'procedure');
}
for(let i=0;i<CROSS_RUNS;i++){
  const code=pick(PROCEDURES,SEED^0xa5a55a5a,i),attack=pick(CROSS_ATTACKS,SEED^0x5aa5a55a,i);runMutation(code,attack,i,'cross');
}
assert.equal(attempted,600000);assert.equal(killed,attempted);for(const row of Object.values(perProcedure))assert.equal(row.killed,row.attempted);for(const row of Object.values(perAttack))assert.equal(row.killed,row.attempted);
const known=new Set(discovered),novelHoldout=new Set();for(let j=1;j<=NOVELTY_HOLDOUT;j++){
  const code=pick(PROCEDURES,SEED^0xf00dcafe,lastNovel+j),pool=(j%3===0)?CROSS_ATTACKS:[...COMMON_ATTACKS,...SPECIFIC[code]],attack=pick(pool,SEED^0x77112233,lastNovel+j),violations=validate(mutate(baseModel(code,lastNovel+j),attack));assert.ok(violations.length,`M+${j} mutant survived`);for(const family of violations)if(!known.has(family))novelHoldout.add(family);
}
assert.equal(novelHoldout.size,0,`M+1000 novelty: ${[...novelHoldout].join(',')}`);

const COMPRESSION_ATTACKS=Object.freeze([
  ['remove-purpose',m=>{m.purpose=false;}],['remove-object',m=>{m.governedObject='';}],['remove-decision',m=>{m.humanDecision=false;}],
  ['remove-boundary',m=>{m.claimBoundary=false;}],['genericize-cta',m=>{if(m.cta){m.cta='Apri';m.ctaGeneric=true;}}],['unlink-write',m=>{m.runtimeWriteNeeded=true;m.runtimeWriteBound=false;}],
  ['promote-raw-instead-of-proof',m=>{m.technicalDetail='primary';}],['remove-focus',m=>{m.focusVisible=false;}],['shrink-target',m=>{m.touchTargetPx=36;}],
  ['merge-evidence-with-decision',m=>{m.proofMeaning='substantive-truth';}],['hide-current-phase',m=>{m.ctaPhaseValid=false;}],['remove-receipt',m=>{m.runtimeWriteNeeded=true;m.runtimeWriteBound=true;m.persistenceReadbackReceipt=false;}]
]);
function compressionApplicable(base,attack){if(attack[0]==='genericize-cta')return Boolean(base.cta);if(['unlink-write','remove-receipt'].includes(attack[0]))return base.runtimeWriteNeeded;return true;}
let compressionIndex=0,lastCompressionNovel=0;const compressionFamilies=new Set();let safeCompressionSurvivors=0;const compressionSamples=[];
for(;compressionIndex<100000;compressionIndex++){
  const code=pick(PROCEDURES,SEED^0x0ddc0ffe,compressionIndex),base=baseModel(code,compressionIndex),pool=COMPRESSION_ATTACKS.filter(a=>compressionApplicable(base,a)),attack=pick(pool,SEED^0x1234fedc,compressionIndex),violations=validate(mutate(base,attack));
  if(!violations.length){safeCompressionSurvivors++;continue;}
  for(const family of violations)if(!compressionFamilies.has(family)){compressionFamilies.add(family);lastCompressionNovel=compressionIndex+1;if(compressionSamples.length<40)compressionSamples.push({at:lastCompressionNovel,code,attack:attack[0],family,surfaceId:base.surfaceId});}
}
assert.equal(safeCompressionSurvivors,0,'canonical model still admits a sampled safe destructive compression');
let holdoutSafe=0;const compressionNovelHoldout=new Set();for(let j=1;j<=COMPRESSION_HOLDOUT;j++){
  const i=lastCompressionNovel+j,code=pick(PROCEDURES,SEED^0x77773333,i),base=baseModel(code,i),pool=COMPRESSION_ATTACKS.filter(a=>compressionApplicable(base,a)),attack=pick(pool,SEED^0x33337777,i),violations=validate(mutate(base,attack));
  if(!violations.length){holdoutSafe++;continue;}for(const family of violations)if(!compressionFamilies.has(family))compressionNovelHoldout.add(family);
}
assert.equal(holdoutSafe,0,'N+1000 found further safe simplification without invariant loss');assert.equal(compressionNovelHoldout.size,0,`N+1000 compression novelty: ${[...compressionNovelHoldout].join(',')}`);

const surfaceCount=PROCEDURES.reduce((sum,code)=>sum+contract.procedures[code].surfaces.length,0),covered=PROCEDURES.reduce((sum,code)=>sum+contract.procedures[code].surfaces.filter(s=>s.selector&&s.purpose&&s.primaryQuestion&&s.runtimeRead).length,0),coverage=covered/surfaceCount;
assert.ok(coverage>=contract.globalDoD.surfaceInventoryCoverageMin,`surface inventory coverage ${coverage}`);
const report={schemaVersion:'1.0.0',generator:'procedure-ui-ux-finetuning-saturation',contractVersion:contract.schemaVersion,procedures:PROCEDURES,simulation:{perProcedure:RUNS_PER_PROCEDURE,cross:CROSS_RUNS,total:attempted,mutationKillRate:killed/attempted},M:lastNovel,normalizedFailureFamilies:[...discovered].sort(),Mholdout:NOVELTY_HOLDOUT,MholdoutNovel:[...novelHoldout],N:lastCompressionNovel,compressionFamilies:[...compressionFamilies].sort(),Nholdout:COMPRESSION_HOLDOUT,NholdoutNovel:[...compressionNovelHoldout],safeCompressionSurvivors,holdoutSafeCompressionSurvivors:holdoutSafe,surfaceInventory:{surfaceCount,covered,coverage},perProcedure,perAttack,representativeNovelty:samples,representativeCompressionFrontier:compressionSamples,claimBoundary:contract.evidenceBoundary};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/procedure-ui-ux-finetuning-saturation.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,totalMutations:attempted,perProcedure:RUNS_PER_PROCEDURE,cross:CROSS_RUNS,mutationKillRate:report.simulation.mutationKillRate,M:report.M,Mholdout:report.Mholdout,Mnovel:report.MholdoutNovel.length,N:report.N,Nholdout:report.Nholdout,Nnovel:report.NholdoutNovel.length,safeCompressionSurvivors:report.safeCompressionSurvivors,holdoutSafeCompressionSurvivors:report.holdoutSafeCompressionSurvivors,failureFamilies:report.normalizedFailureFamilies.length,compressionFamilies:report.compressionFamilies.length,surfaceCoverage:coverage}));
