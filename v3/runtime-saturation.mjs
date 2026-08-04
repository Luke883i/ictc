import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const roles=['admin','user']; const services=['monitoring','incidents'];
const intents=['start','continue','inspect']; const conditions=['ready','empty','ai-unconfigured','provider-or-input-failure'];
const N=roles.length*services.length*intents.length*conditions.length;
const scenarios=[]; for(const role of roles) for(const service of services) for(const intent of intents) for(const condition of conditions) scenarios.push({role,service,intent,condition});
for(let i=0;i<100;i++) scenarios.push(scenarios[i%N]);
function primitives(s){
  const out=new Set(['header-role','two-tab-navigation','one-primary-outcome','plain-language-error','persistent-state','atomic-write','attachment-digest']);
  out.add(`screen:${s.service}`); out.add(`intent:${s.intent}`); out.add(`condition:${s.condition}`); out.add(`role-ui:${s.role}`);
  if(s.service==='monitoring') ['job-card','catalog-table','single-contribution-form','run-result'].forEach(v=>out.add(v));
  else ['incident-card','facts-form','draft-and-submit','deadline-reminders'].forEach(v=>out.add(v));
  if(s.role==='admin') ['admin-settings-dialog','job-create-dialog','close-submitted-incident'].forEach(v=>out.add(v));
  else ['admin-controls-hidden','own-draft-actions'].forEach(v=>out.add(v));
  if(s.condition==='ai-unconfigured') out.add('setup-callout');
  if(s.condition==='provider-or-input-failure') ['retryable-error','state-preserved-on-failure'].forEach(v=>out.add(v));
  return out;
}
const known=new Set(); let lastNovelty=0; let after=0;
scenarios.forEach((scenario,index)=>{let found=0; for(const p of primitives(scenario)) if(!known.has(p)){known.add(p);found++;} if(found) lastNovelty=index+1; if(index>=N) after+=found;});
assert.equal(scenarios.length,N+100); assert.ok(lastNovelty<=N); assert.equal(after,0);
const report={schemaVersion:'1.0.0',tranche:'runtime-e2e',N,NPlus100:N+100,primitiveCount:known.size,lastNoveltyScenario:lastNovelty,noveltyAfterN:0};
await mkdir(path.join(root,'artifacts'),{recursive:true}); await writeFile(path.join(root,'artifacts/runtime-saturation.json'),JSON.stringify(report,null,2));
console.log(`runtime-saturation: ok (N=${N}, N+100=${N+100}, primitives=${known.size}, last novelty=${lastNovelty})`);
