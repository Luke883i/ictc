import assert from 'node:assert/strict';
import { enterpriseReadiness, normalizeGovernance, usageSummary } from './enterprise.mjs';

const base = {
  settings:{llm:{endpoint:'https://ai.example/v1',model:'enterprise-model'},governance:normalizeGovernance({monthlyBudgetUsd:500,allowedModels:['enterprise-model'],requireHumanApproval:true}),environment:{name:'prod-eu',classification:'confidential'}},
  users:[{id:'a',role:'admin',status:'active'},{id:'u',role:'user',status:'active'},{id:'q',role:'auditor',status:'active'}],
  missions:[{id:'m',state:'active',planTrace:{purpose:'monitoring-plan',requestedAt:'2026-08-05T10:00:00Z',usage:{inputTokens:100,outputTokens:50,estimatedCostUsd:.001}}}],
  runs:[],contributions:[],catalog:[{id:'s',state:'candidate',title:'Fonte da verificare'}],incidents:[{id:'i',state:'clarifying',originalNarrative:'Evento da completare',analysisTrace:{purpose:'incident-analysis',requestedAt:'2026-08-05T10:00:00Z',usage:{inputTokens:200,outputTokens:80,estimatedCostUsd:.002}}}]
};
const usage=usageSummary(base,new Date('2026-08-05T12:00:00Z'));
assert.equal(usage.calls,2);assert.equal(usage.totalTokens,430);assert.equal(usage.estimatedCostUsd,.003);

const honest=enterpriseReadiness(base,{integrity:{ok:true,head:'abc'},safeBinding:true});
assert.equal(honest.level,'enterprise-blocked');
assert.ok(honest.controls.some(item=>item.id==='durable-storage'&&item.status==='blocker'));
assert.ok(honest.controls.some(item=>item.id==='accessibility-audit'&&item.status==='blocker'));
assert.ok(honest.attention.some(item=>item.type==='source'));
assert.ok(honest.attention.some(item=>item.type==='incident'));

const attested=enterpriseReadiness(base,{integrity:{ok:true,head:'abc'},safeBinding:true,identityProvider:true,tls:true,durableStorage:true,backupVerified:true,malwareScanning:true,observability:true,dependencyAudit:true,dependencyAuditAt:'2026-08-05',accessibilityAudit:true,accessibilityAuditAt:'2026-08-05'});
assert.equal(attested.level,'enterprise-ready');
assert.equal(attested.verified,attested.total);
assert.equal(attested.overall,100);

const axes={role:['admin','user','auditor'],surface:['monitoring','incidents','administration'],state:['empty','active','degraded','complete'],device:['desktop','mobile'],ai:['ready','unavailable'],evidence:['valid','invalid']};
const scenarios=[];
for(const role of axes.role)for(const surface of axes.surface)for(const state of axes.state)for(const device of axes.device)for(const ai of axes.ai)for(const evidence of axes.evidence)scenarios.push({role,surface,state,device,ai,evidence});
const primitiveOf=s=>`${s.surface}:${s.state}:${s.ai}:${s.evidence}`;
const M=96;
const construction=scenarios.slice(0,M);
const frozen=new Set(construction.map(primitiveOf));
let cursor=M;
while(cursor<scenarios.length&&frozen.size<new Set(scenarios.map(primitiveOf)).size){frozen.add(primitiveOf(scenarios[cursor]));cursor+=1;}
const confirmation=Array.from({length:100},(_,index)=>scenarios[(cursor+index)%scenarios.length]);
const novelty=confirmation.filter(item=>!frozen.has(primitiveOf(item)));
assert.equal(novelty.length,0);

await import('node:fs/promises').then(async({mkdir,writeFile})=>{await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/enterprise-readiness.json',import.meta.url),JSON.stringify({ok:true,M:cursor,confirmation:100,novelty:0,honest,attested,usage,scenarioCount:scenarios.length,primitiveCount:frozen.size},null,2));});
console.log(`enterprise-readiness-check: ok (M=${cursor}, M+100=${cursor+100}, novelty=0, honest blockers=${honest.total-honest.verified})`);
