import assert from 'node:assert/strict';
import { EXPERIENCE_PHASES, analyzeExperienceParticipants, orderExperienceParticipants } from './public/ui/experience-constitution.js';

const noop=()=>{};
const BASE=Object.freeze([
  Object.freeze({id:'procedure-ui-ux-1-6',phase:'presentation',authority:'decision-presentation',exclusive:true,render:noop}),
  Object.freeze({id:'procedure-ui-ux-integrity-1-6',phase:'integrity',authority:'integrity-observer',exclusive:false,render:noop}),
  Object.freeze({id:'procedure-sequential-ux-2-2',phase:'journey',authority:'journey-overlay',exclusive:false,render:noop})
]);
const FAILURE_FAMILIES=Object.freeze([
  'participants-not-array','participant-invalid','participant-id-missing','duplicate-participant','unknown-phase','unknown-authority',
  'phase-authority-mismatch','exclusive-flag-invalid','decision-presentation-not-exclusive','non-presentation-authority-exclusive',
  'exclusive-authority-conflict','render-missing'
]);
function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x^x>>>15,1|x)+0x6d2b79f5)>>>0;x^=x+Math.imul(x^x>>>7,61|x);return((x^x>>>14)>>>0)/4294967296;};}
function shuffle(items,seed){const out=[...items],r=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function assertPhaseOrder(ordered){let last=-1;for(const item of ordered){const index=EXPERIENCE_PHASES.indexOf(item.phase);assert.ok(index>=last,`phase regression ${item.id}`);last=index;}}
function mutant(family,seed=1){
  if(family==='participants-not-array')return{not:'an-array'};
  const items=BASE.map(item=>({...item}));
  switch(family){
    case'participant-invalid':items.push(null);break;
    case'participant-id-missing':items[2].id='';break;
    case'duplicate-participant':items.push({...items[2]});break;
    case'unknown-phase':items[2].phase=`phase-${seed}`;break;
    case'unknown-authority':items[1].authority=`authority-${seed}`;break;
    case'phase-authority-mismatch':items[2].phase='integrity';break;
    case'exclusive-flag-invalid':delete items[1].exclusive;break;
    case'decision-presentation-not-exclusive':items[0].exclusive=false;break;
    case'non-presentation-authority-exclusive':items[1].exclusive=true;break;
    case'exclusive-authority-conflict':items.push({id:`presentation-${seed}`,phase:'presentation',authority:'decision-presentation',exclusive:true,render:noop});break;
    case'render-missing':delete items[1].render;break;
  }
  return items;
}

let normal=0,stress=0,edge=0;
for(let seed=1;seed<=4000;seed++){
  const ordered=orderExperienceParticipants(shuffle(BASE,seed));
  assert.deepEqual(ordered.map(item=>item.phase),EXPERIENCE_PHASES);
  normal++;
}
for(let seed=4001;seed<=8000;seed++){
  const extra=[];
  const integrityCount=1+(seed%17),journeyCount=1+((seed*7)%23);
  for(let i=0;i<integrityCount;i++)extra.push({id:`integrity-${seed}-${i}`,phase:'integrity',authority:'integrity-observer',exclusive:false,render:noop});
  for(let i=0;i<journeyCount;i++)extra.push({id:`journey-${seed}-${i}`,phase:'journey',authority:'journey-overlay',exclusive:false,render:noop});
  const ordered=orderExperienceParticipants(shuffle([BASE[0],...extra],seed));
  assertPhaseOrder(ordered);
  assert.equal(ordered.filter(item=>item.authority==='decision-presentation').length,1);
  stress++;
}
for(let seed=8001;seed<=10000;seed++){
  const family=FAILURE_FAMILIES[(Math.imul(seed,2654435761)>>>0)%FAILURE_FAMILIES.length];
  const failures=analyzeExperienceParticipants(mutant(family,seed));
  assert.ok(failures.includes(family),`mutant survived ${family}`);
  edge++;
}
assert.equal(normal+stress+edge,10000);

let M=0,lastNovel=0;const discovered=new Set();
for(let seed=1;seed<=10000;seed++){
  const family=FAILURE_FAMILIES[(seed-1)%FAILURE_FAMILIES.length],before=discovered.size;
  for(const failure of analyzeExperienceParticipants(mutant(family,seed)))discovered.add(failure);
  if(discovered.size>before)lastNovel=seed;
  if(FAILURE_FAMILIES.every(family=>discovered.has(family))&&seed-lastNovel>=100){M=seed;break;}
}
assert.ok(M>0,'discovery did not saturate');
assert.deepEqual([...FAILURE_FAMILIES].sort(),[...discovered].sort(),'discovery vocabulary must equal executable failure vocabulary');
const holdoutNovel=new Set();
for(let seed=M+1;seed<=M+1000;seed++){
  const family=FAILURE_FAMILIES[(Math.imul(seed,1103515245)+12345>>>0)%FAILURE_FAMILIES.length];
  for(const failure of analyzeExperienceParticipants(mutant(family,seed)))if(!discovered.has(failure))holdoutNovel.add(failure);
}
assert.equal(holdoutNovel.size,0,'M+1000 produced a novel normalized constitutional failure');
console.log(JSON.stringify({ok:true,simulations:10000,normal,stress,edge,failureFamilies:FAILURE_FAMILIES.length,M,noNoveltyThrough:M+1000,novelFamiliesInHoldout:0}));
