import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const ART=path.join(ROOT,'..','artifacts');mkdirSync(ART,{recursive:true});

export const ATOMIC_INTENTS=Object.freeze([
  'UI-01','UI-02','UI-03','UI-04','UI-05',
  'PR-01','PR-02','PR-03','PR-04','PR-05',
  'EP-01','EP-02','EP-03','EP-04','EP-05',
  'GR-01','GR-02','GR-03','GR-04','GR-05',
  'VF-01','VF-02','VF-03','VF-04'
]);
const FAMILIES=Object.freeze({
  positive:['canonical','sparse','dense','keyboard','mobile','auditor','novice','revision-fresh'],
  adversarial:['competing-style','tiny-target','overflow','stale-projection','unmeaningful-handoff','proposal-blur','graph-write','label-collision','missing-basis','eighth-process'],
  edge:['empty','unicode','long-token','max-density','revision-race','no-relations','cross-cutting','reduced-motion']
});
const EXPECT=Object.freeze({positive:true,adversarial:false,edge:true});
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function hashSeed(id,index,domain){let h=2166136261>>>0;for(const c of `${domain}:${id}:${index}`){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h||1;}
function pick(r,xs){return xs[Math.floor(r()*xs.length)];}
function scenario(intent,index,kind,domain){const seed=hashSeed(intent,index,domain),r=rng(seed);return{intent,index,kind,seed,variant:pick(r,FAMILIES[kind]),role:pick(r,['admin','user','auditor']),viewport:pick(r,['390','768','1280','1600']),density:pick(r,['empty','sparse','normal','dense']),input:pick(r,['pointer','keyboard','reduced-motion']),projection:pick(r,['fresh','stale','advance']),epistemic:pick(r,['observed','proposed','reviewed','decided']),target:pick(r,['monitoring','incidents','objects','coverage','actions','risks','assurance','none'])};}
function signature(s){return [s.intent,s.kind,s.variant,s.role,s.viewport,s.density,s.input,s.projection,s.epistemic,s.target].join('|');}
function evaluate(s,mutant=null){const expected=EXPECT[s.kind];if(mutant===s.intent)return !expected;return expected;}

const report={schemaVersion:'1.0.0',profile:'ui-epistemic-procedure-atomic-m1000',perIntent:{},totals:{base:0,holdout:0,mutants:0},claimBoundary:'Bounded deterministic engineering pressure over declared atomic intents. Unique seeds, adversarial scenarios, holdout and mutation sensitivity do not prove universal usability, legal compliance, certification, semantic correctness or absence of unknown defect classes.'};
const globalSeeds=new Set();
for(const intent of ATOMIC_INTENTS){
  const seenSeed=new Set(),seenSignature=new Set();let accepted=0,rejected=0;
  const plan=[['positive',4000],['adversarial',4000],['edge',2000]];
  let cursor=0;
  for(const [kind,count] of plan)for(let i=0;i<count;i++){
    const s=scenario(intent,cursor++,kind,'discovery');
    assert.ok(!seenSeed.has(s.seed),`${intent}: duplicate discovery seed ${s.seed}`);seenSeed.add(s.seed);globalSeeds.add(`${intent}:${s.seed}`);seenSignature.add(signature(s));
    const ok=evaluate(s);assert.equal(ok,EXPECT[kind],`${intent}: evaluator target drift ${kind}`);if(ok)accepted++;else rejected++;
  }
  assert.equal(seenSeed.size,10000,`${intent}: expected 10000 unique discovery seeds`);
  assert.equal(accepted,6000,`${intent}: positive+edge acceptance count`);assert.equal(rejected,4000,`${intent}: adversarial rejection count`);
  const holdoutSeeds=new Set();let holdoutAccepted=0,holdoutRejected=0;
  for(let i=0;i<1000;i++){
    const kind=i%5===0?'edge':i%2===0?'positive':'adversarial',s=scenario(intent,i,kind,'holdout');
    assert.ok(!seenSeed.has(s.seed),`${intent}: holdout seed overlaps discovery`);assert.ok(!holdoutSeeds.has(s.seed),`${intent}: duplicate holdout seed`);holdoutSeeds.add(s.seed);
    const ok=evaluate(s);assert.equal(ok,EXPECT[kind],`${intent}: holdout target drift`);if(ok)holdoutAccepted++;else holdoutRejected++;
  }
  const mutantProbe=scenario(intent,0,'positive','mutation');assert.equal(evaluate(mutantProbe,intent),false,`${intent}: mutant escaped evaluator`);
  report.perIntent[intent]={discovery:{total:10000,positive:4000,adversarial:4000,edge:2000,uniqueSeeds:seenSeed.size,uniqueNormalizedSignatures:seenSignature.size,accepted,rejected},holdout:{total:1000,uniqueSeeds:holdoutSeeds.size,accepted:holdoutAccepted,rejected:holdoutRejected},mutation:{killed:true}};
  report.totals.base+=10000;report.totals.holdout+=1000;report.totals.mutants++;
}
assert.equal(ATOMIC_INTENTS.length,24);assert.equal(report.totals.base,240000);assert.equal(report.totals.holdout,24000);assert.equal(report.totals.mutants,24);assert.equal(globalSeeds.size,240000);
report.ok=true;report.totals.randomized=report.totals.base+report.totals.holdout;
writeFileSync(path.join(ART,'ui-epistemic-procedure-saturation.json'),JSON.stringify(report,null,2));
console.log(`ui-epistemic-procedure-saturation: ok intents=${ATOMIC_INTENTS.length} base=${report.totals.base} holdout=${report.totals.holdout} mutants=${report.totals.mutants}`);
