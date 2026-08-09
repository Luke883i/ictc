import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { PROCESS_CODES, ENTRY_PATHS, scenarios, semanticStimulus, evaluateScenario, behavioralSignaturePayload } from './v4-stable-semantic-model.mjs';

const here=new URL('.',import.meta.url);
const contract=JSON.parse(await readFile(new URL('v4-stable-assurance-contract.json',here),'utf8'));
const oracle=JSON.parse(await readFile(new URL('v4-stable-e2e-oracle.json',here),'utf8'));
const mutants=JSON.parse(await readFile(new URL('v4-stable-e2e-mutants.json',here),'utf8')).mutants;
function canonical(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return`[${value.map(canonical).join(',')}]`;return`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;}
const hash=value=>createHash('sha256').update(canonical(value)).digest('hex');
const rows=scenarios();
function matchValue(actual,expected){return Array.isArray(expected)?expected.includes(actual):actual===expected;}
function matchesWhen(s,when={}){return Object.entries(when).every(([k,v])=>matchValue(s[k],v));}
function checkInvariant(inv,s,outcome,metrics){
  if(!matchesWhen(s,inv.when))return true;
  if(inv.kind==='decision')return outcome.decision===inv.expect.decision;
  if(inv.kind==='evidence')return outcome.evidence.includes(inv.expect.contains);
  if(inv.kind==='control')return outcome.controls.includes(inv.expect.contains);
  if(inv.kind==='process-identity')return outcome.path.processCode===PROCESS_CODES[s[inv.expect.source]];
  if(inv.kind==='entry-identity')return outcome.path.entryPath===ENTRY_PATHS[s[inv.expect.source]];
  if(inv.kind==='metric-separation')return metrics.behavioralUniqueLessThanSemanticStimuli===inv.expect.behavioralUniqueLessThanSemanticStimuli;
  throw new Error(`Unknown oracle kind ${inv.kind}`);
}
function evaluateSet(modelPatch={},metricPatch={}){
  const evaluated=rows.map(s=>({scenario:s,stimulus:semanticStimulus(s),outcome:evaluateScenario(s,modelPatch)}));
  const stimulusUnique=new Set(evaluated.map(r=>hash(r.stimulus))).size;
  const behaviorUnique=new Set(evaluated.map(r=>hash(behavioralSignaturePayload(r.scenario,r.outcome,metricPatch)))).size;
  const metrics={semanticStimulusUnique:stimulusUnique,behaviorallyDistinctOutcomes:behaviorUnique,behavioralUniqueLessThanSemanticStimuli:behaviorUnique<stimulusUnique};
  const violations=[];
  for(const row of evaluated)for(const inv of oracle.invariants)if(!checkInvariant(inv,row.scenario,row.outcome,metrics))violations.push({oracleId:inv.id,scenario:row.scenario});
  return{evaluated,metrics,violations};
}
const baseline=evaluateSet();
assert.equal(baseline.violations.length,0,'Baseline violates declarative E2 oracle');
const baselineBehavior=baseline.evaluated.map(r=>hash(behavioralSignaturePayload(r.scenario,r.outcome)));
const results=[];
for(const mutant of mutants){
  const run=evaluateSet(mutant.patch||{},mutant.metricPatch||{});
  const changed=[];
  for(let i=0;i<run.evaluated.length;i++){
    const candidateHash=hash(behavioralSignaturePayload(run.evaluated[i].scenario,run.evaluated[i].outcome,mutant.metricPatch||{}));
    if(candidateHash!==baselineBehavior[i])changed.push(run.evaluated[i].scenario);
  }
  const violatedIds=new Set(run.violations.map(v=>v.oracleId));
  const targetViolations=(mutant.targetOracleIds||[]).filter(id=>violatedIds.has(id));
  const killed=changed.length>=contract.e2eMutation.minimumWitnessesPerMutant&&(!contract.e2eMutation.requireTargetOracleViolation||targetViolations.length===(mutant.targetOracleIds||[]).length);
  results.push({id:mutant.id,killed,changedWitnesses:changed.length,targetOracleIds:mutant.targetOracleIds,targetViolations,witness:changed[0]||null,metrics:run.metrics});
}
const killed=results.filter(r=>r.killed).length;
const mutationScore=killed/results.length;
const errors=[];
if(mutants.length<contract.e2eMutation.minimumMutants)errors.push('too-few-mutants');
if(mutationScore<contract.e2eMutation.mutationScoreMin)errors.push('mutation-score');
if(results.some(r=>!r.killed))errors.push('surviving-mutant');
const report={schemaVersion:'1.0.0',releaseId:contract.releaseId,ok:errors.length===0,classification:errors.length?'E2E_MUTATION_INSUFFICIENT':'E2E_MUTATION_E2',mutants:mutants.length,killed,mutationScore,baselineMetrics:baseline.metrics,oracleSeparation:oracle.oracleSeparation,results,errors,claimBoundary:'This is an internal E2 mutation rail for the S1 assurance model. It does not replace exact-runtime E3 or human/external E4 evidence.'};
assert.deepEqual(errors,[]);
await mkdir(new URL('../artifacts/',here),{recursive:true});
await writeFile(new URL('../artifacts/v4-stable-e2e-mutation.json',here),JSON.stringify(report,null,2));
console.log(`v4-stable-e2e-mutation-check: ok (${killed}/${mutants.length} mutants killed)`);
