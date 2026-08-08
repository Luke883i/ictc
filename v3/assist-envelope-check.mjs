import assert from 'node:assert/strict';
import { assertAssistOnly, assistEnvelope, adoptAssistEnvelope } from './runtime/assist-envelope.mjs';

const envelope=assistEnvelope({purpose:'risk-proposal',subject:{type:'risk',id:'r1'},output:{likelihood:4,impact:3,rationale:'Scenario da verificare',confidence:0.7},trace:{purpose:'risk-proposal',limitations:['schema only']}});
assert.equal(envelope.authority,'ai-assist-only');assert.equal(envelope.humanAdoptionRequired,true);assert.equal(envelope.adoption,null);assert.equal(envelope.proposalSha256.length,64);
assert.throws(()=>assertAssistOnly({decision:'approve'}),error=>error.code==='ai-authority-field-forbidden');
assert.throws(()=>assertAssistOnly({nested:{compliant:true}}),error=>error.code==='ai-authority-field-forbidden');
const adopted=adoptAssistEnvelope(envelope,{actor:{id:'admin-1',role:'admin'},reason:'Valutazione umana del contesto'});assert.equal(adopted.adoption.authority,'human');assert.equal(adopted.adoption.proposalSha256,envelope.proposalSha256);assert.throws(()=>adoptAssistEnvelope(envelope,{actor:{id:'audit',role:'auditor'},reason:'x'}),error=>error.code==='assist-human-required');
console.log('assist-envelope-check: ok');
