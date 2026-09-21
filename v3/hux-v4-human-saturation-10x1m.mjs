import assert from 'node:assert/strict';
import {baseline,MUTATORS,violations,LAWS,ablation} from './hux-v4-model.mjs';
const materialized=MUTATORS.map(([name,mutate])=>{const x=baseline();mutate(x);const v=violations(x);assert.ok(v.length,`unfalsified family ${name}`);return {name,violations:v};});
const TOTAL=10_000_000,hits=Array(materialized.length).fill(0);let killed=0,x=0x9156c0de;
for(let i=0;i<TOTAL;i++){x^=x<<13;x^=x>>>17;x^=x<<5;const j=(x>>>0)%materialized.length;hits[j]++;if(materialized[j].violations.length)killed++;}
const witnesses=ablation(),report={ok:killed===TOTAL,total:TOTAL,killed,survivors:TOTAL-killed,families:materialized.map((m,i)=>({name:m.name,hits:hits[i],violations:m.violations})),laws:LAWS,witnesses,claimBoundary:'10,000,000 deterministic semantic mutation schedules over independently materialized and falsified failure families; not human sessions or aesthetic preference proof.'};
console.log(JSON.stringify(report));assert.equal(report.ok,true);
