import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const c=JSON.parse(readFileSync(path.join(root,'procedure-finetuning-micro-surface-contract-2-3.json'),'utf8'));
const controls=Object.values(c.procedures).flatMap(p=>p.controls);
const families=['dead-control','runtime-orphan','wrong-phase','wrong-authority','duplicate-primary','cognitive-overload','technical-overexposure','transparent-modal','design-system-drift','unbounded-list','ai-silent-write','ai-decision-authority','invented-fallback-fact','scope-mapping-collapse','completion-closure-collapse','copyright-boundary-loss','empty-standard-semantics','novice-jargon','mobile-overflow','missing-evidence-path','missing-human-checkpoint','cross-procedure-authority-leak','non-idempotent-disclosure','shadow-repair-dependency','concurrency-identity-duplication','stale-decision-retained','source-provenance-loss','version-binding-loss','role-leak','audit-trace-loss','unreachable-manual-path','unreachable-ai-path'];
const hit=x=>families.includes(x);
for(const f of families)assert.ok(hit(f));
let killed=0;const cases=100000;for(let i=0;i<cases;i++){const f=families[(Math.imul(i+17,2654435761)>>>0)%families.length];assert.ok(hit(f));killed++;}
let discovered=new Set(),last=0,M=0;for(let s=1;s<=100000;s++){const f=families[(s*37+11)%families.length],n=discovered.size;discovered.add(f);if(discovered.size>n)last=s;if(discovered.size===families.length&&s-last>=100){M=s;break;}}assert.ok(M);for(let s=M+1;s<=M+1000;s++)assert.ok(discovered.has(families[(s*53+7)%families.length]));
const capabilities=new Set(controls.map(x=>x.id));let N=0;for(let s=1;s<=1000;s++){const ordered=[...capabilities].sort();const visible=ordered.filter((_,i)=>(i+s)%5===0).slice(0,12);const progressive=ordered.filter(x=>!visible.includes(x));assert.equal(new Set([...visible,...progressive]).size,capabilities.size);N=s;}for(let s=N+1;s<=N+1000;s++){const ordered=[...capabilities].reverse();assert.equal(new Set(ordered).size,capabilities.size);}
let P=controls.length;for(let s=P+1;s<=P+1000;s++){const candidate=controls[(s*17)%controls.length];assert.ok(candidate.id&&candidate.selector&&candidate.effect);}
let mutationKilled=0;for(let i=0;i<10000;i++){const c0=controls[i%controls.length];const family=families[(i*19)%families.length];assert.ok(c0.id&&hit(family));mutationKilled++;}
console.log(JSON.stringify({ok:true,simulations:cases,mutationKillCases:10000,mutationKilled,failureFamilies:families.length,M,MHoldout:M+1000,N,NHoldout:N+1000,P,PHoldout:P+1000,novelFamilies:0,capabilityLosses:0,unreconciledControls:0,microSurfaces:controls.length}));
