import assert from 'node:assert/strict';
import { canonicalWorkQueue, routeWorkIntent } from './runtime/work-orchestration.mjs';

const actor={id:'admin',role:'admin',permissions:['read','manage-enterprise','manage-grc']};
const empty={catalog:[],incidents:[],missions:[],grcObjects:[],grcMappings:[],grcActions:[],grcRisks:[],grcAssurance:[]};
const start=canonicalWorkQueue(empty,actor,{llmReady:true});
assert.equal(start.nextAction.kind,'create-object');
assert.equal(start.nextAction.processId,'objects');
const source={...empty,catalog:[{id:'s1',title:'DORA RTS',state:'candidate',createdAt:'2026-08-08T10:00:00Z',updatedAt:'2026-08-08T10:00:00Z'}]};
const sourceQueue=canonicalWorkQueue(source,actor,{llmReady:true});
assert.equal(sourceQueue.nextAction.kind,'verify-source','human source decision must outrank onboarding inventory work');
assert.equal(sourceQueue.nextAction.processId,'monitoring');
const risk={...empty,grcRisks:[{id:'r1',title:'Accesso privilegiato',description:'MFA assente',state:'proposed',proposal:{likelihood:4,impact:4,rationale:'AI proposal'},proposalSource:'ai',reviews:[],createdBy:'admin'}]};
const riskQueue=canonicalWorkQueue(risk,actor,{llmReady:true});
assert.equal(riskQueue.nextAction.kind,'review-risk');
assert.ok(riskQueue.items.every(item=>item.authority==='runtime-work-queue'));
const auditor=canonicalWorkQueue(source,{id:'audit',role:'auditor',permissions:['read']},{llmReady:true});
assert.equal(auditor.nextAction.readOnly,true);
for(const [text,expected] of [
  ['Abbiamo ricevuto una segnalazione di phishing e possibile violazione','incidents'],
  ['Voglio inventariare firewall server e applicazioni cloud','objects'],
  ['Mappare requisiti NIS2 ai controlli esistenti e trovare gap','coverage'],
  ['Creare remediation con responsabile e scadenza','actions'],
  ['Valutare scenario di rischio con probabilità e impatto','risks'],
  ['Compilare questionario di assurance richiesto dal cliente','assurance'],
  ['Monitorare nuove linee guida ACN e fonti EUR-Lex','monitoring']
]){const routed=routeWorkIntent({objective:text,inputType:'natural-language-objective'});assert.equal(routed.candidates[0].processId,expected,text);assert.equal(routed.requiresHumanSelection,true);assert.equal(routed.authority,'runtime-intent-routing');}
const ambiguous=routeWorkIntent({objective:'Serve supporto compliance',inputType:'natural-language-objective'});assert.equal(ambiguous.proposedProcessId,null);assert.equal(ambiguous.requiresHumanSelection,true);
console.log(`work-orchestration-check: ok (queue=${sourceQueue.items.length}, routes=8)`);
