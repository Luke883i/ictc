/** Derived step-level evidence ledger. No new journey or runtime authority. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {root} from './repository-inventory.mjs';
const dir=join(root,'artifacts');
const sha=x=>createHash('sha256').update(x).digest('hex');
const read=name=>{const bytes=readFileSync(join(dir,name));return {bytes,object:JSON.parse(bytes)};};
const stepsFile=read('e2e-journey-denominator.json');
const runtimeFile=read('e2e-cross-process-receipts.json');
const steps=stepsFile.object,runtime=runtimeFile.object;
assert.equal(steps.declaredStepDenominator,53,'reconcile journey owner before changing denominators');
assert.equal(steps.journeys,9);
assert.equal(runtime.runtimeCommands,10);
assert.equal(runtime.commandReceipts.length,10);
assert.ok(Object.values(runtime.asserts).every(x=>x===true),'runtime cross-process readback must be proved');
assert.equal(runtime.negative.status,403,'auditor negative control');
// An operation + hashed receipt + readback is evidence of a machine-executed
// COMPONENT of one declared step, not of a full human-governed step.
const mapping=[
 ['AO-01','Inventario',1,'create',/crea o riceve/],
 ['AO-01','Inventario',4,'activate-with-human-reason',/valida l.identit/],
 ['MC-01','Controlli e copertura',4,'map-object-to-requirement',/mapping/],
 ['MC-01','Controlli e copertura',5,'review-gap-with-reason',/Mapping, gap/],
 ['AP-01','Azioni correttive',2,'adopt-with-reason',/adotta\/prioritizza/],
 ['AP-01','Azioni correttive',3,'progress-with-note',/aggiornamenti/],
 ['RC-01','Rischi compliance',1,'create-risk-linked-to-action',/scenario/],
 ['RC-01','Rischi compliance',2,'human-risk-review',/impatto inerenti/],
 ['AR-01','Questionari e verifiche',1,'intake-original-request',/richiesta originale/]
];
function build(){
 const entries=[],mapped=new Set();
 for(const journey of steps.details){
  for(const step of journey.steps){
   const key=`${journey.id}|${journey.scenario}|${step.number}`;
   const matched=mapping.filter(m=>m[0]===journey.id&&m[1]===journey.scenario&&m[2]===step.number);
   assert.ok(matched.length<=1,'ambiguous witness '+key);
   const witness=matched[0];let replay=null;
   if(witness){
    assert.match(step.description,witness[4],'changed journey semantics '+key);
    const command=runtime.commandReceipts.filter(c=>c.process===journey.id&&c.operation===witness[3]);
    assert.equal(command.length,1,'missing or duplicate witnessed operation '+key);
    assert.match(command[0].receiptHash,/^[a-f0-9]{64}$/);
    replay={operation:witness[3],receiptHash:command[0].receiptHash,readback:runtime.asserts.grcReadback===true,
      simulatedActor:true,source:'artifacts/e2e-cross-process-receipts.json'};
    mapped.add(witness[3]);
   }
   entries.push({key,process:journey.id,scenario:journey.scenario,step:step.number,
     statement:step.description,componentStatus:replay?'MACHINE_COMPONENT_WITNESSED':'NO_STEP_WITNESS',
     fullStepStatus:'NOT_ATTESTED',missingEvidence:replay?[
       'independent human decision and identity attestation','complete step-specific before/after state and proof linkage',
       'browser interaction, negative paths and external applicability where relevant'
     ]:['live step-specific setup/action/state/review/readback/receipt and human evidence'],machineReplay:replay});
  }
 }
 assert.equal(entries.length,53);
 assert.equal(mapped.size,mapping.length);
 const count=entries.filter(e=>e.machineReplay).length;
 return {schema:'ictc-53-step-evidence-ledger/v1',source:'docs/04_USER_JOURNEYS.md',
  inputs:{declaredStepsSha256:sha(stepsFile.bytes),runtimeReceiptsSha256:sha(runtimeFile.bytes)},
  denominator:entries.length,machineComponentWitnesses:count,fullStepAttestations:0,
  globalProductE2ECoverage:null,completeCoverageCertified:false,
  claimBoundary:'Machine replay for nine bounded components within 53 declared steps; test identity impersonates human role. No full-step, representative human, seven-process business workflow, external legal, or deployment proof.',entries};
}
function verify(data){
 assert.equal(data.denominator,53);assert.equal(data.entries.length,53);
 assert.equal(data.fullStepAttestations,0);assert.equal(data.completeCoverageCertified,false);
 assert.equal(data.globalProductE2ECoverage,null);
 assert.equal(new Set(data.entries.map(x=>x.key)).size,53);
 assert.equal(data.machineComponentWitnesses,mapping.length);
 const fresh=build();assert.deepEqual(data,fresh);
 return true;
}
const ledger=build();verify(ledger);
if(process.argv.includes('--falsify')){
 const mutations=[
  x=>x.denominator--,
  x=>x.machineComponentWitnesses++,
  x=>x.entries.pop(),
  x=>x.entries[0].fullStepStatus='PASS',
  x=>x.fullStepAttestations=53,
  x=>x.completeCoverageCertified=true,
  x=>x.entries.find(e=>e.machineReplay).machineReplay.receiptHash='0'.repeat(64),
  x=>x.entries.find(e=>e.machineReplay).componentStatus='FULL_STEP_PROVEN',
  x=>x.inputs.runtimeReceiptsSha256='0'.repeat(64),
  x=>x.entries[1].key=x.entries[0].key
 ];
 let killed=0;for(const mutation of mutations){const copy=structuredClone(ledger);mutation(copy);try{verify(copy);}catch{killed++;}}
 assert.equal(killed,mutations.length,'witness forgery escaped');ledger.negativeMutants={killed,total:mutations.length};
}
mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'e2e-step-evidence-ledger.json'),JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify({ok:true,denominator:ledger.denominator,machineComponentWitnesses:ledger.machineComponentWitnesses,fullStepAttestations:0,negatives:ledger.negativeMutants||null}));
