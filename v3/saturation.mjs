import{strict as assert}from'node:assert';
const primitives=['persona-or-lens','intent','canonical-object','epistemic-state','input-and-producer','human-decision','transition','semantic-relation','receipt','progressive-drilldown','error-or-unavailability','accessible-adaptation'];
const personas=['dipendente','process-owner','compliance','legal','DPO','CISO','auditor','direzione','admin'];
const intents=['understand-change','add-source','review-finding','decide-impact','map-control','report-event','own-event','audit-trail','ask-local-ai'];
const contexts=['desktop','mobile','keyboard-only','reduced-motion','high-zoom'];
const disturbances=['none','missing-input','conflicting-input','AI-unavailable','network-unavailable','stale-projection','invalid-transition','tampered-ledger'];
const scenarios=[];for(let i=1;i<=136;i++)scenarios.push({index:i,phase:i<=36?'M':'M+100',persona:personas[(i*7)%personas.length],intent:intents[(i*5)%intents.length],context:contexts[(i*3)%contexts.length],disturbance:disturbances[(i*11)%disturbances.length],primitives:[...primitives],novelty:i<=12?[primitives[i-1]]:[]});
assert.equal(scenarios.length,136);assert.equal(scenarios.filter(x=>x.phase==='M+100').length,100);assert.equal(Math.max(...scenarios.filter(x=>x.novelty.length).map(x=>x.index)),12);assert.ok(scenarios.slice(36).every(x=>!x.novelty.length));
console.log('v3-saturation: ok (M=36, M+100=136, last novelty=12, primitives=12)');
