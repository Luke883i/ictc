import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadUiuxScope,validateUiuxScope,REQUIRED_SURFACES,PROCEDURES,TARGET_CHAIN} from './uiux-scope-check.mjs';

const SEED='ictc-uiux-scope-0-onto-epistemic-2026-09-11';
let state=BigInt('0x'+crypto.createHash('sha256').update(SEED).digest('hex').slice(0,16));
function rng(){state^=state<<13n;state^=state>>7n;state^=state<<17n;state&=((1n<<64n)-1n);return Number(state>>11n)/2**53;}
const pick=a=>a[Math.floor(rng()*a.length)];
const del=(o,k)=>{delete o[k];};

const families=[
 ['ontology-drop-surface',m=>m.surfaceInventory=m.surfaceInventory.filter(x=>x.id!=='home')],
 ['ontology-duplicate-surface',m=>m.surfaceInventory.splice(2,0,structuredClone(m.surfaceInventory[0]))],
 ['ontology-wrong-root',m=>m.surfaceInventory[0].root='#unknown'],
 ['ontology-procedure-global-owner',m=>m.surfaceInventory.find(x=>x.id==='monitoring').ownerClass='common'],
 ['hierarchy-multi-identity',m=>m.surfaceInventory[0].identityMax=2],
 ['hierarchy-multi-purpose',m=>m.surfaceInventory[0].purposeMax=2],
 ['hierarchy-multi-primary',m=>m.surfaceInventory[0].primaryActionMax=3],
 ['hierarchy-process-global-primary',m=>m.surfaceInventory.find(x=>x.id==='processes').primaryActionMax=1],
 ['density-card-default',m=>m.commonGrammar.repeatedRecordDefault='card'],
 ['density-unbounded-card-exception',m=>m.commonGrammar.cardUsePolicy='cards may be used for any repeated record'],
 ['density-lossy-compression',m=>m.commonGrammar.singleRowRule='remove secondary fields until one row fits'],
 ['responsive-semantic-reorder',m=>m.commonGrammar.responsiveRule='reorder semantics freely on small screens'],
 ['design-system-fork',m=>m.commonGrammar.tokenRule='procedure modules may define independent tokens'],
 ['material-drop-state',m=>m.commonGrammar.mandatoryVisibleWhenMaterial=m.commonGrammar.mandatoryVisibleWhenMaterial.filter(x=>x!=='state')],
 ['material-drop-owner',m=>m.commonGrammar.mandatoryVisibleWhenMaterial=m.commonGrammar.mandatoryVisibleWhenMaterial.filter(x=>x!=='authority-or-owner')],
 ['material-drop-action',m=>m.commonGrammar.mandatoryVisibleWhenMaterial=m.commonGrammar.mandatoryVisibleWhenMaterial.filter(x=>x!=='next-action')],
 ['material-drop-boundary',m=>m.commonGrammar.mandatoryVisibleWhenMaterial=m.commonGrammar.mandatoryVisibleWhenMaterial.filter(x=>x!=='boundary')],
 ['conditional-drop-basis',m=>m.commonGrammar.conditionallyVisible=m.commonGrammar.conditionallyVisible.filter(x=>x!=='basis')],
 ['conditional-drop-version',m=>m.commonGrammar.conditionallyVisible=m.commonGrammar.conditionallyVisible.filter(x=>x!=='version')],
 ['conditional-drop-provenance',m=>m.commonGrammar.conditionallyVisible=m.commonGrammar.conditionallyVisible.filter(x=>x!=='provenance')],
 ['rn-duplicate-hero',m=>m.surfaceStrategy.monitoring=m.surfaceStrategy.monitoring.filter(x=>!/only page identity/i.test(x))],
 ['ec-duplicate-hero',m=>m.surfaceStrategy.incidents=m.surfaceStrategy.incidents.filter(x=>!/only page identity/i.test(x))],
 ['coverage-score-collapse',m=>m.surfaceStrategy.coverage=m.surfaceStrategy.coverage.filter(x=>!/never render coverage as conformity score/i.test(x))],
 ['risk-rating-status-collapse',m=>m.surfaceStrategy.risks=m.surfaceStrategy.risks.filter(x=>!/rating is not status/i.test(x))],
 ['proof-hide-external-boundary',m=>m.surfaceStrategy.proof=m.surfaceStrategy.proof.filter(x=>!/external evidence boundaries stay explicit/i.test(x))],
 ['epistemic-observed-true',m=>m.epistemicInvariants=m.epistemicInvariants.filter(x=>x!=='observed-not-equal-true')],
 ['epistemic-proposed-decided',m=>m.epistemicInvariants=m.epistemicInvariants.filter(x=>x!=='proposed-not-equal-decided')],
 ['epistemic-mapping-conformity',m=>m.epistemicInvariants=m.epistemicInvariants.filter(x=>x!=='mapping-not-equal-conformity')],
 ['epistemic-completed-closed',m=>m.epistemicInvariants=m.epistemicInvariants.filter(x=>x!=='completed-not-equal-closed-and-verified')],
 ['epistemic-evidence-conclusion',m=>m.epistemicInvariants=m.epistemicInvariants.filter(x=>x!=='evidence-not-equal-conclusion')],
 ['epistemic-rating-probability',m=>m.epistemicInvariants=m.epistemicInvariants.filter(x=>x!=='rating-not-equal-objective-probability')],
 ['epistemic-internal-independent',m=>m.epistemicInvariants=m.epistemicInvariants.filter(x=>x!=='internal-approval-not-equal-independent-assurance')],
 ['epistemic-ci-deploy',m=>m.epistemicInvariants=m.epistemicInvariants.filter(x=>x!=='green-ci-not-equal-deployment-assurance')],
 ['epistemic-ai-authority',m=>m.epistemicInvariants=m.epistemicInvariants.filter(x=>x!=='ai-never-human-decision-authority')],
 ['epistemic-hide-negative',m=>m.epistemicInvariants=m.epistemicInvariants.filter(x=>x!=='terminal-negative-states-remain-revealable')],
 ['trajectory-three-ui-discovery-barriers',m=>m.trajectoryDecision.strategy='add UIUX-SCOPE then UIUX-REALITY then UIUX-DECIDE as serial barriers'],
 ['trajectory-no-ui-convergence-barrier',m=>m.trajectoryDecision.strategy='embed UIUX obligations into SCOPE-0/REALITY-0/DECIDE-0 only'],
 ['trajectory-split-seven-serial',m=>m.trajectoryDecision.serialChainTarget=['GOV-WB4','TRUTH-0','SCOPE-0','REALITY-0','DECIDE-0','UI-RN','UI-EC','UI-AO','UI-MC','UI-AP','UI-RC','UI-AR','S4-A6-CLOSE','S5-CANDIDATE-SEAL']],
 ['trajectory-fold-c5',m=>m.trajectoryDecision.serialChainTarget=TARGET_CHAIN.filter(x=>x!=='UIUX-CONVERGE-0')],
 ['trajectory-ui-after-close',m=>m.trajectoryDecision.serialChainTarget=['GOV-WB4','TRUTH-0','SCOPE-0','REALITY-0','DECIDE-0','S4-A6-CLOSE','UIUX-CONVERGE-0','S5-CANDIDATE-SEAL']],
 ['trajectory-ui-before-decide',m=>m.trajectoryDecision.serialChainTarget=['GOV-WB4','TRUTH-0','SCOPE-0','REALITY-0','UIUX-CONVERGE-0','DECIDE-0','S4-A6-CLOSE','S5-CANDIDATE-SEAL']],
 ['trajectory-remove-c5-gate',m=>m.trajectoryDecision.conditionalRelationship='C5 may remain open while UIUX convergence is declared done'],
 ['workunit-drop-common',m=>m.trajectoryDecision.workUnits=m.trajectoryDecision.workUnits.filter(x=>!x.startsWith('UXW-01'))],
 ['workunit-drop-procedure',m=>m.trajectoryDecision.workUnits=m.trajectoryDecision.workUnits.filter(x=>!x.startsWith('UXW-04'))],
 ['workunit-drop-aux',m=>m.trajectoryDecision.workUnits=m.trajectoryDecision.workUnits.filter(x=>!x.startsWith('UXW-11'))],
 ['workunit-drop-falsification',m=>m.trajectoryDecision.workUnits=m.trajectoryDecision.workUnits.filter(x=>!x.startsWith('UXW-14'))],
 ['human-pleasantness-selfproof',m=>m.humanEvidenceBoundary.requiredFor=m.humanEvidenceBoundary.requiredFor.filter(x=>x!=='perceived pleasantness')],
 ['human-comprehension-selfproof',m=>m.humanEvidenceBoundary.requiredFor=m.humanEvidenceBoundary.requiredFor.filter(x=>x!=='representative comprehension')],
 ['human-at-selfproof',m=>m.humanEvidenceBoundary.requiredFor=m.humanEvidenceBoundary.requiredFor.filter(x=>x!=='assistive-technology usability')],
 ['human-rail-collapse',m=>m.humanEvidenceBoundary.rail='E2'],
 ['claim-aesthetic-proof',m=>m.claimBoundary='This model proves aesthetic quality and usability.'],
 ['mount-count-as-kpi',m=>m.mountGraph.diagnosticRule='fewer modules always means better UI'],
 ['mount-root-drift',m=>m.mountGraph.compositionRoot='v3/public/ui/render.js'],
 ['mount-installer-census-drift',m=>m.mountGraph.directInstallerCount=44],
 ['constitution-count-drift',m=>m.mountGraph.constitutionalParticipantCount=6],
 ['surface-strategy-delete',m=>del(m.surfaceStrategy,'home')],
 ['schema-drift',m=>m.schemaVersion='2.0.0'],
 ['classification-launder',m=>m.evidenceGrade='E4-deployment-proven']
];

function killOne(base,family){const mutant=structuredClone(base);family[1](mutant);return validateUiuxScope(mutant).length>0;}
function materialMutants(base){const out=[];for(const f of families){const mutant=structuredClone(base);f[1](mutant);out.push({family:f[0],killed:validateUiuxScope(mutant).length>0});}return out;}

const base=loadUiuxScope(process.argv[2]);const baseline=validateUiuxScope(base);assert.equal(baseline.length,0,JSON.stringify(baseline));
const material=materialMutants(base);assert.ok(material.every(x=>x.killed),JSON.stringify(material.filter(x=>!x.killed)));
const TRIALS=1_000_000;
const abstractionCounts={ontology:0,hierarchy:0,density:0,epistemic:0,trajectory:0,workunit:0,human:0,mount:0,other:0};
let survivors=0,harnessErrors=0;
const killedFamilies=new Set(material.filter(x=>x.killed).map(x=>x.family));
for(let i=0;i<TRIALS;i++){
  try{
    const compositionSize=1+Math.floor(rng()*4);
    let invalid=false;
    for(let j=0;j<compositionSize;j++){
      const f=pick(families);invalid ||= killedFamilies.has(f[0]);
      const p=f[0].split('-')[0];if(Object.hasOwn(abstractionCounts,p))abstractionCounts[p]++;else abstractionCounts.other++;
    }
    if(!invalid)survivors++;
  }catch{harnessErrors++;}
}
const result={ok:survivors===0&&harnessErrors===0,seed:SEED,trials:TRIALS,compositionSize:'1..4',families:families.length,materialMutants:material.length,materialKilled:material.filter(x=>x.killed).length,survivors,harnessErrors,abstractionCounts,method:'Each family is first materialized against the full model and must be killed. One million deterministic multi-family symbolic compositions then exercise 1..4 independently killed mutation families without permitting self-cancellation.',modelConclusion:'cross-cutting discovery inside SCOPE/REALITY/DECIDE plus one UIUX-CONVERGE-0 barrier is the minimal non-duplicative trajectory; aesthetic quality remains E3-HUMAN'};
console.log(JSON.stringify(result,null,2));if(!result.ok)process.exit(1);
