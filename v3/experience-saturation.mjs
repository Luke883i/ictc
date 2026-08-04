import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
const roles = ['admin','user'];
const services = ['monitoring','incidents'];
const ai = ['ready','missing','unavailable','invalid-output'];
const material = ['none','link','text','file'];
const continuity = ['clean','retry','stale','restart','interrupted'];
const epistemic = ['observed','suggested','adopted','corrected','unknown','decided'];
const accessibility = ['pointer','keyboard','reduced-motion','narrow'];
const MINIMUM = 64;
const STABILITY = 32;
const TAIL = 100;
const LIMIT = 1000;
function scenarioAt(index) {
  return {
    role: roles[index % roles.length],
    service: services[Math.floor(index / 2) % services.length],
    ai: ai[Math.floor(index / 3) % ai.length],
    material: material[Math.floor(index / 5) % material.length],
    continuity: continuity[Math.floor(index / 7) % continuity.length],
    epistemic: epistemic[Math.floor(index / 11) % epistemic.length],
    accessibility: accessibility[Math.floor(index / 13) % accessibility.length]
  };
}
function primitives(s) {
  const p = new Set(['two-services','two-roles','one-next-action','progressive-intake','raw-before-ai','proposal-not-decision','write-receipt','linked-evidence-bundle','no-false-green','continuity','accessible-proof']);
  p.add(`role-${s.role}`); p.add(`service-${s.service}`); p.add(`ai-${s.ai}`); p.add(`material-${s.material}`); p.add(`continuity-${s.continuity}`); p.add(`epistemic-${s.epistemic}`); p.add(`access-${s.accessibility}`);
  if (s.service === 'monitoring') ['objective-preserved','plan-reveal','human-revise','activate','pause-resume','source-lineage','reasoned-source-decision'].forEach(x=>p.add(x));
  else ['narrative-preserved','ai-lens','question-purpose','explicit-human-adoption','versioned-formulation','author-confirmation','reasoned-closure'].forEach(x=>p.add(x));
  if (s.ai !== 'ready') p.add('recoverable-ai'); else p.add('ai-governance-trace');
  if (s.material === 'file') p.add('attachment-digest-cleanup');
  if (s.continuity === 'retry') p.add('idempotent-replay');
  if (s.continuity === 'stale') p.add('optimistic-conflict');
  if (s.continuity === 'restart') p.add('restart-integrity');
  if (s.role === 'user') p.add('least-privilege-projection');
  if (['adopted','corrected'].includes(s.epistemic)) p.add('human-ai-relation');
  return p;
}
const known = new Set(); const ledger=[]; let lastNovelty=0; let M=null;
for (let i=0;i<LIMIT;i++) {
  const before=known.size; for (const p of primitives(scenarioAt(i))) known.add(p);
  const novelty=known.size-before; if(novelty) lastNovelty=i+1; ledger.push({scenario:i+1,novelty,total:known.size});
  if(M===null && i+1>=MINIMUM && i+1-lastNovelty>=STABILITY){M=i+1;break;}
}
assert.ok(M,'abstract saturation not reached');
const frozen=new Set(known); let noveltyAfterM=0; const tail=[];
for(let i=M;i<M+TAIL;i++){let novelty=0;for(const p of primitives(scenarioAt(i)))if(!frozen.has(p)){frozen.add(p);novelty++;}noveltyAfterM+=novelty;tail.push({scenario:i+1,novelty,total:frozen.size});}
assert.equal(noveltyAfterM,0);
assert.ok(known.size>=40);
const report={schemaVersion:'3.0.0',method:{minimum:MINIMUM,stabilityWindow:STABILITY,validationTail:TAIL,rule:'M is selected online; primitives are frozen at M; the next 100 scenarios are evaluated only against that snapshot.'},M,MPlus100:M+TAIL,primitiveCount:known.size,lastNovelty,noveltyAfterM,primitives:[...known].sort(),ledger:[...ledger,...tail]};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/experience-saturation.json',import.meta.url),JSON.stringify(report,null,2));
console.log(`experience-saturation: ok (M=${M}, M+100=${M+TAIL}, primitives=${known.size}, last novelty=${lastNovelty}, validation novelty=${noveltyAfterM})`);
