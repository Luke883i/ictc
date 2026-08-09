import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { BUSINESS_PROCESS_COPY, businessProcessAction } from './public/ui/business-language.js';

const professions=['compliance','legal','privacy','internal-audit','risk','security','it-ops','quality','procurement','finance','hr','executive','operations','vendor-management','business-owner'];
const roles=['admin','user','auditor'];
const experience=['novice','intermediate','expert'];
const aiModes=['on','off'];
const urgency=['normal','urgent'];
const entryModes=['known-process','unknown-process','proof-first','task-first'];
const processes=['monitoring','incidents','objects','coverage','actions','risks','assurance'];
const forbiddenPrimary=['mapping','assurance','heatmap','checkpoint','receipt','projection','epistemic','sha-256','sha256','bounded','declared universe','target ids','action plan','remediation'];
const aiCoupling=[/richiede ai/i,/solo con ai/i,/devi usare l.?ai/i,/configura l.?ai per/i];
const genericActions=new Set(['apri','vai','continua','gestisci','consulta processo','apri processo']);
const findings=[];
let state=0x41c7e19d;
function rand(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}
function pick(xs){return xs[Math.floor(rand()*xs.length)];}
function critical(kind,scenario,detail){findings.push({kind,scenario,detail});}
function containsForbidden(s){const text=String(s||'').toLowerCase();return forbiddenPrimary.filter(x=>text.includes(x));}
for(let i=0;i<100000;i++){
  const scenario={i,profession:pick(professions),role:pick(roles),experience:pick(experience),ai:pick(aiModes),urgency:pick(urgency),entry:pick(entryModes),process:pick(processes)};
  const copy=BUSINESS_PROCESS_COPY[scenario.process];
  assert.ok(copy,scenario.process);
  const readOnly=scenario.role==='auditor';
  const action=businessProcessAction(scenario.process,readOnly);
  const primary=[copy.title,copy.purpose,copy.next,action].join(' | ');
  const forbidden=containsForbidden(primary);
  if(forbidden.length)critical('primary-jargon',scenario,forbidden);
  if(copy.title.length>42)critical('title-too-long',scenario,copy.title.length);
  if(copy.purpose.length<45||copy.purpose.length>150)critical('purpose-density',scenario,copy.purpose.length);
  if(action.length>30)critical('cta-too-long',scenario,action);
  if(genericActions.has(action.toLowerCase()))critical('cta-not-specific',scenario,action);
  if(readOnly&&!/^Consulta\b/.test(action))critical('auditor-write-affordance',scenario,action);
  if(!readOnly&&!/^Apri\b/.test(action))critical('operational-readonly-affordance',scenario,action);
  if(aiCoupling.some(rx=>rx.test(primary)))critical('ai-mandatory-copy',scenario,primary);
  if(scenario.ai==='off'&&!action)critical('ai-off-dead-end',scenario,'missing action');
  if(scenario.entry==='known-process'&&!copy.title)critical('direct-entry-friction',scenario,'missing title');
  if(scenario.entry==='proof-first'&&!copy.proof)critical('proof-context-missing',scenario,'missing proof');
  if(!copy.next)critical('next-step-missing',scenario,'missing next');
}
const counts=findings.reduce((o,x)=>(o[x.kind]=(o[x.kind]||0)+1,o),{});
const digest=createHash('sha256').update(JSON.stringify({seed:'v4.1-language-0x41c7e19d',counts,processes,professions})).digest('hex');
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
await writeFile(new URL('../artifacts/v4-1-language-saturation.json',import.meta.url),JSON.stringify({ok:findings.length===0,scenarios:100000,profiles:professions.length*roles.length*experience.length*aiModes.length,counts,digest,sample:findings.slice(0,20)},null,2));
assert.deepEqual(counts,{});
console.log(`v4-1-language-saturation: ok (100000 scenarios; digest=${digest})`);
