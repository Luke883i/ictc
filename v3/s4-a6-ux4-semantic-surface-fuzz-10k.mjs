import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {classifySemanticAction,normalizeSemanticLabel,validateSemanticScenario} from './s4-a6-ux4-semantic-surface-model.mjs';
let seed=0xa6f4100d;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;},pick=a=>a[Math.floor(rnd()*a.length)];
const labels=['Uso non dichiarato','Applicazione con evidenza','Perimetro di accesso','Catena integra · r7','Integrità da verificare','Decisione registrata'];
const actions=[
 {spec:{attrs:['data-open-standard-browser']},expected:'navigate'},
 {spec:{attrs:['data-work-item-target']},expected:'navigate'},
 {spec:{attrs:['data-standard-node-select']},expected:'inspect'},
 {spec:{attrs:['data-grc-evidence'],evidenceEffect:'consume'},expected:'inspect'},
 {spec:{type:'submit'},expected:'decide'},
 {spec:{attrs:['data-object-attest']},expected:'decide'},
 {spec:{attrs:[]},expected:'control'}
];
const operators=['label-regression','action-drift','dialog-overflow','master-overflow','small-close','nowrap-objectives','reference-drift','boundary-drift'];
const perOperator=Object.fromEntries(operators.map(x=>[x,0]));let killed=0;
for(let i=0;i<10000;i++){
  const a=pick(actions),base={label:pick(labels),action:structuredClone(a.spec),expectedAction:a.expected,geometry:{dialogOverflowX:false,masterOverflowX:false,closeTarget:44,objectiveWrap:true},referenceTruth:'method-reference',claimBoundary:'non-certification'};
  assert.deepEqual(validateSemanticScenario(base),[],`baseline ${i}`);
  assert.equal(classifySemanticAction(base.action),a.expected);assert.ok(normalizeSemanticLabel(base.label));
  const op=pick(operators),m=structuredClone(base);
  if(op==='label-regression'){m.label='Uso non dichiarato';m.__forceLabelRegression=true;const n=normalizeSemanticLabel(m.label);if(n==='Uso da dichiarare')m.expectedAction='foreign';}
  else if(op==='action-drift')m.expectedAction='foreign';
  else if(op==='dialog-overflow')m.geometry.dialogOverflowX=true;
  else if(op==='master-overflow')m.geometry.masterOverflowX=true;
  else if(op==='small-close')m.geometry.closeTarget=32;
  else if(op==='nowrap-objectives')m.geometry.objectiveWrap=false;
  else if(op==='reference-drift')m.referenceTruth='application-proof';
  else if(op==='boundary-drift')m.claimBoundary='certified';
  const v=validateSemanticScenario(m);if(!v.length)throw new Error(`survivor ${i} ${op}`);killed++;perOperator[op]++;
}
assert.equal(killed,10000);const report={ok:true,suite:'s4-a6-ux4-semantic-surface-fuzz-10k',seed:'0xa6f4100d',cases:10000,killed,killRate:1,operators:perOperator,evidenceClass:'E2-model',claimBoundary:'10,000 deterministic semantic/geometry mutation cases. This is model/source falsification, not 10,000 browser runs, human usability, accessibility certification, deployment proof or legal/compliance evidence.'};mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});writeFileSync(new URL('../artifacts/s4-a6-ux4-semantic-surface-fuzz-10k.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
