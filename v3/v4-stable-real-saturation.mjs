import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { AXES, scenarios, semanticStimulus, evaluateScenario, behavioralSignaturePayload, cartesian } from './v4-stable-semantic-model.mjs';
import { classifyHoldout } from './v4-stable-holdout-oracle.mjs';

const here=new URL('.',import.meta.url);
const contract=JSON.parse(await readFile(new URL('v4-stable-assurance-contract.json',here),'utf8'));
const holdouts=JSON.parse(await readFile(new URL('v4-stable-holdouts.json',here),'utf8')).cases;
function canonical(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return`[${value.map(canonical).join(',')}]`;return`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;}
const hash=value=>createHash('sha256').update(canonical(value)).digest('hex');

const names=Object.keys(AXES);
const rows=scenarios().map(scenario=>{
  const stimulus=semanticStimulus(scenario);
  const outcome=evaluateScenario(scenario);
  return {
    scenario,
    stimulus,
    outcome,
    stimulusSignature:hash(stimulus),
    behaviorSignature:hash(behavioralSignaturePayload(scenario,outcome))
  };
});
const stimulusSignatures=new Set(rows.map(r=>r.stimulusSignature));
const behaviorSignatures=new Set(rows.map(r=>r.behaviorSignature));
const duplicateSemanticStimulusSignatures=rows.length-stimulusSignatures.size;

let pairTotal=0,pairSeen=0;
for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){
  const a=names[i],b=names[j];
  const expected=new Set(cartesian([AXES[a],AXES[b]]).map(x=>JSON.stringify(x)));
  const observed=new Set(rows.map(r=>JSON.stringify([r.scenario[a],r.scenario[b]])));
  pairTotal+=expected.size;pairSeen+=[...expected].filter(x=>observed.has(x)).length;
}
const pairwiseCoverage=pairSeen/pairTotal;
const criticalTriples=[['role','aiPolicy','operation'],['process','entry','operation'],['aiPolicy','assistPreference','operation'],['claim','role','operation']];
let tripleTotal=0,tripleSeen=0;
for(const [a,b,c] of criticalTriples){
  const expected=new Set(cartesian([AXES[a],AXES[b],AXES[c]]).map(x=>JSON.stringify(x)));
  const observed=new Set(rows.map(r=>JSON.stringify([r.scenario[a],r.scenario[b],r.scenario[c]])));
  tripleTotal+=expected.size;tripleSeen+=[...expected].filter(x=>observed.has(x)).length;
}
const criticalTripleCoverage=tripleSeen/tripleTotal;

const dimensionInfluence={};
for(const axis of names){
  const groups=new Map();
  for(const row of rows){
    const key=JSON.stringify(names.filter(n=>n!==axis).map(n=>row.scenario[n]));
    if(!groups.has(key))groups.set(key,new Set());
    groups.get(key).add(row.behaviorSignature);
  }
  dimensionInfluence[axis]=[...groups.values()].filter(set=>set.size>1).length/groups.size;
}

const holdoutFailures=holdouts.filter(h=>classifyHoldout(h.situation)!==h.expected).map(h=>({id:h.id,expected:h.expected,got:classifyHoldout(h.situation)}));
const holdoutPassRate=(holdouts.length-holdoutFailures.length)/holdouts.length;
const req=contract.realSaturation;
const errors=[];
if(duplicateSemanticStimulusSignatures>req.duplicateSemanticStimulusSignaturesMax)errors.push('duplicate-semantic-stimulus-signatures');
if(pairwiseCoverage<req.pairwiseCoverageMin)errors.push('pairwise-coverage');
if(criticalTripleCoverage<req.criticalTripleCoverageMin)errors.push('critical-triple-coverage');
if(Math.min(...Object.values(dimensionInfluence))<req.dimensionInfluenceMin)errors.push('inert-dimension');
if(holdouts.length<req.minimumHoldouts||holdoutPassRate<req.holdoutPassRateMin)errors.push('holdout');
if(behaviorSignatures.size<req.minimumBehavioralOutcomes)errors.push('behavioral-outcome-variety');
if(behaviorSignatures.size>=stimulusSignatures.size)errors.push('behavioral-vs-stimulus-separation');
const report={
  schemaVersion:'1.1.0',releaseId:contract.releaseId,ok:errors.length===0,
  classification:errors.length?'INSUFFICIENT_REAL_SATURATION':'REAL_SATURATION_E2_COMPONENT',
  declaredScenarioInputs:rows.length,
  semanticStimulusUnique:stimulusSignatures.size,
  duplicateSemanticStimulusSignatures,
  behaviorallyDistinctOutcomes:behaviorSignatures.size,
  behavioralCompression:Number((rows.length/behaviorSignatures.size).toFixed(4)),
  pairwiseCoverage,criticalTripleCoverage,dimensionInfluence,
  holdouts:holdouts.length,holdoutPassRate,
  oracleSeparation:'holdout-oracle-separated-from-generator',
  stimulusMatrixDigest:hash([...stimulusSignatures].sort()),
  behaviorMatrixDigest:hash([...behaviorSignatures].sort()),
  holdoutDigest:hash(holdouts),errors,claimBoundary:contract.claim,
  metricBoundary:'Declared scenario inputs measure the semantic stimulus geometry. Behavioral uniqueness is computed from outcome/path/control/evidence only and never from raw scenario identity.'
};
assert.deepEqual(errors,[]);
await mkdir(new URL('../artifacts/',here),{recursive:true});
await writeFile(new URL('../artifacts/v4-stable-real-saturation.json',here),JSON.stringify(report,null,2));
console.log(`v4-stable-real-saturation: ok (inputs=${rows.length}, stimuli=${stimulusSignatures.size}, behaviors=${behaviorSignatures.size})`);
