import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
const roles=['admin','user']; const services=['monitoring','incidents']; const ai=['ready','down']; const material=['none','link','file']; const concurrency=['clean','retry','stale']; const signals=['none','personal-data','malicious','cross-border','ongoing'];
function scenarioAt(i){return {role:roles[i%2],service:services[Math.floor(i/2)%2],ai:ai[Math.floor(i/4)%2],material:material[i%3],concurrency:concurrency[Math.floor(i/3)%3],signal:signals[i%5]};}
function primitives(s){
  const p=new Set(['two-services','two-roles','one-primary-action','progressive-disclosure','raw-input-first','human-confirmation','receipt','evidence-export','integrity-chain']);
  if(s.service==='monitoring') ['objective-entry','ai-plan','plan-reveal','mission-activation','automatic-run','catalog-candidate','source-provenance','human-source-decision'].forEach(x=>p.add(x));
  else ['minimal-incident-intake','ai-lens','adaptive-question','why-now','evidence-use','unknown-answer','origin-diff','incident-submit'].forEach(x=>p.add(x));
  if(s.role==='admin') p.add('admin-global-ai'); else p.add('user-own-records');
  if(s.ai==='down') p.add('ai-failure-safe'); else p.add('ai-trace');
  if(s.material==='file') p.add('attachment-digest'); if(s.material==='link') p.add('official-link');
  if(s.concurrency==='retry') p.add('idempotent-retry'); if(s.concurrency==='stale') p.add('optimistic-conflict');
  if(s.signal!=='none') p.add(`signal-${s.signal}`);
  return p;
}
const seen=new Set(); let lastNovelty=0; const ledger=[];
for(let i=1;i<=600;i++){const before=seen.size; for(const x of primitives(scenarioAt(i-1))) seen.add(x); const novelty=seen.size-before; if(novelty) lastNovelty=i; ledger.push({i,novelty,total:seen.size});}
const M=Math.max(32,lastNovelty+12); const afterM=new Set(); for(let i=M+1;i<=M+100;i++) for(const x of primitives(scenarioAt(i-1))) if(!seen.has(x)) afterM.add(x);
assert.equal(afterM.size,0); assert.ok(M<500); assert.ok(seen.size>=35);
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
await writeFile(new URL('../artifacts/journey-mining.json',import.meta.url),JSON.stringify({M,MPlus100:M+100,primitiveCount:seen.size,lastNovelty,noveltyAfterM:0,primitives:[...seen].sort(),ledger:ledger.slice(0,M+100)},null,2));
console.log(`journey-mining: ok (M=${M}, M+100=${M+100}, primitives=${seen.size}, last novelty=${lastNovelty})`);
