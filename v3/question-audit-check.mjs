import { strict as assert } from 'node:assert';
import { allQuestionDefinitions, deriveQuestions, nextQuestion, submissionReadiness } from './question-engine.mjs';
const definitions = allQuestionDefinitions();
assert.ok(definitions.length >= 8);
for (const q of definitions) {
  for (const key of ['id','phase','type','label','whyNow','evidenceUse']) assert.ok(q[key], `${q.id} missing ${key}`);
  assert.ok(q.whyNow.length >= 35, `${q.id} whyNow too weak`);
  assert.ok(q.evidenceUse.length >= 35, `${q.id} evidenceUse too weak`);
}
assert.deepEqual(deriveQuestions({state:'intake'}), [], 'questions before raw intake');
const base = {state:'clarifying',originalNarrative:'Accesso anomalo rilevato nei log',awarenessAt:new Date().toISOString(),analysis:{signals:[],affectedServices:[],impact:'',mitigations:[]},answers:{},finalNarrative:''};
const initial = deriveQuestions(base);
assert.ok(initial.some(q=>q.id==='classification'));
assert.ok(initial.some(q=>q.id==='affectedServices'));
assert.equal(nextQuestion(base).id, initial[0].id);
const signaled = {...base,analysis:{...base.analysis,signals:['personal-data','malicious','technical-detection']}};
for (const id of ['personalData','maliciousActivity','detectedAt']) assert.ok(deriveQuestions(signaled).some(q=>q.id===id));
const complete = structuredClone(base);
complete.answers = {classification:{value:'incident'},affectedServices:{value:'CRM'},impact:{value:'Possibile indisponibilità'},actionsTaken:{value:'Account sospeso'}};
complete.finalNarrative = 'Formulazione verificata';
assert.equal(submissionReadiness(complete).ready, true);
assert.deepEqual(deriveQuestions({...complete,state:'submitted'}), []);
console.log(`question-audit-check: ok (${definitions.length} justified adaptive questions)`);
