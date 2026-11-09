import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadReality0,collectRealityObservation,validateReality0,generateUseCases,expectedCaseSemantics,validateUseCase,validateAssessmentVector,validateObservationVector,OBSERVATION_KEYS,EXPECTED_VERDICTS,CASE_COUNT} from './reality-0-check.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const modelPath=process.argv[2]?path.resolve(process.argv[2]):path.join(HERE,'reality-0-model.json');
const root=process.argv[3]?path.resolve(process.argv[3]):path.resolve(HERE,'..');
const model=loadReality0(modelPath),obs=collectRealityObservation(root),baseFailures=validateReality0(model,obs);if(baseFailures.length)throw Error(`baseline:${JSON.stringify(baseFailures.slice(0,3))}`);
const cases=[...generateUseCases()];if(cases.length!==CASE_COUNT)throw Error('case-count');
const baselineVerdicts=model.assessments.map(x=>x.verdict);
const families=[];
for(let i=0;i<13;i++)families.push({id:`assessment-${i+1}`,kind:'model',index:i});
for(const key of OBSERVATION_KEYS)families.push({id:`obs-${key}`,kind:'observation',key});
const caseMutations=[
 ['ai-authority',s=>s.aiHasNoDecisionAuthority=false],['evidence-conclusion',s=>s.evidenceDoesNotBecomeConclusion=false],['proposal-decision',s=>s.proposedDoesNotBecomeDecided=false],['mapping-conformity',s=>s.mappingDoesNotBecomeConformity=false],['completed-verified',s=>s.completedDoesNotBecomeClosedVerified=false],['rating-probability',s=>s.ratingDoesNotBecomeProbability=false],['internal-independent',s=>s.internalApprovalDoesNotBecomeIndependentAssurance=false],['ci-deploy',s=>s.greenCiDoesNotBecomeDeploymentAssurance=false],['tenant-membership',s=>s.tenantSelectorDoesNotGrantMembership=false],['failed-visible',s=>s.staleOrFailedWriteDoesNotBecomeVisible=false],['export-bypass',s=>s.exportRemainsSameAsRead=false],['observed-true',s=>s.observedDoesNotBecomeTrue=false]
];
for(const [id,apply] of caseMutations)families.push({id:`case-${id}`,kind:'case',applyCase:apply});
if(families.length!==63)throw Error(`families:${families.length}`);
function materialKilled(fam){
 if(fam.kind==='model'){const v=[...baselineVerdicts];v[fam.index]=v[fam.index]==='fit'?'contradiction':'fit';return validateAssessmentVector(v).length>0;}
 if(fam.kind==='observation'){const o={...obs,[fam.key]:false};return validateObservationVector(o).length>0;}
 const c=cases[(fam.id.length*997)%cases.length],s=expectedCaseSemantics(c);fam.applyCase(s);return validateUseCase(c,s).length>0;
}
let materialKilledCount=0;for(const fam of families)if(materialKilled(fam))materialKilledCount++;
const seed=model.mutationEvidence.seed;let state=BigInt('0x'+crypto.createHash('sha256').update(seed).digest('hex').slice(0,16));const rnd=()=>{state^=state<<13n;state^=state>>7n;state^=state<<17n;state&=(1n<<64n)-1n;return Number(state&0xffffffffn)>>>0;};
const trials=1_000_000;let survivors=0,harnessErrors=0,caseTrials=0,modelTrials=0,observationTrials=0;const familyCounts=Object.fromEntries(families.map(x=>[x.id,0]));
for(let i=0;i<trials;i++)try{const fam=families[rnd()%families.length];familyCounts[fam.id]++;if(fam.kind==='model'){modelTrials++;const v=[...baselineVerdicts];v[fam.index]=v[fam.index]==='fit'?'contradiction':'fit';if(validateAssessmentVector(v).length===0)survivors++;}else if(fam.kind==='observation'){observationTrials++;const o={...obs,[fam.key]:false};if(validateObservationVector(o).length===0)survivors++;}else{caseTrials++;const c=cases[rnd()%cases.length],s=expectedCaseSemantics(c);fam.applyCase(s);if(validateUseCase(c,s).length===0)survivors++;}}catch{harnessErrors++;}
const digest=crypto.createHash('sha256').update(JSON.stringify({seed,trials,materialKilled:materialKilledCount,survivors,harnessErrors,caseTrials,modelTrials,observationTrials,familyCounts})).digest('hex');
const result={ok:materialKilledCount===families.length&&survivors===0&&harnessErrors===0,seed,useCases:CASE_COUNT,layers:model.useCaseModel.layers.length,trials,materialFamilies:families.length,materialKilled:materialKilledCount,caseTrials,modelTrials,observationTrials,survivors,harnessErrors,minTrialsPerFamily:Math.min(...Object.values(familyCounts)),digest,claimBoundary:'One million mutations are deterministic E2 mutations of runtime-derived semantic observations, REALITY assessments and use-case invariants; they are not one million HTTP/browser/deployment executions.'};
console.log(JSON.stringify(result));if(!result.ok)process.exit(1);
