import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const SEED=190957;
const N=10000;
const dims=Object.freeze({
  procedure:['monitoring','incidents','objects','coverage','actions','risks','assurance'],
  role:['admin','user','auditor'],
  viewport:['390x844','768x1024','1024x768','1365x900','1600x1000'],
  origin:['home','processes','command','deep-link','browser-back','evidence'],
  attention:['zero','low','medium','high'],
  density:['empty','sparse','normal','dense','saturated'],
  motion:['normal','reduced'],
  ai:['off','on'],
  evidence:['none','light','rich','stale'],
  standardUse:['undeclared','reference','in-scope','out-of-scope']
});
const names=Object.keys(dims);
function mulberry32(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const rng=mulberry32(SEED);
function pick(a){return a[Math.floor(rng()*a.length)];}
const scenarios=[];
for(let i=0;i<N;i++)scenarios.push(Object.fromEntries(names.map(name=>[name,pick(dims[name])])));
let cursor=0;
for(let a=0;a<names.length;a++)for(let b=a+1;b<names.length;b++)for(const av of dims[names[a]])for(const bv of dims[names[b]]){const s=scenarios[cursor++%N];s[names[a]]=av;s[names[b]]=bv;}
const pairCoverage={};
for(let a=0;a<names.length;a++)for(let b=a+1;b<names.length;b++){
  const A=names[a],B=names[b],seen=new Set(scenarios.map(s=>`${s[A]}\u0000${s[B]}`)),possible=dims[A].length*dims[B].length;
  pairCoverage[`${A}×${B}`]={seen:seen.size,possible,coverage:seen.size/possible};assert.equal(seen.size,possible,`pair coverage ${A}×${B}`);
}
const classes=new Map();function hit(id,i){if(!classes.has(id))classes.set(id,{first:i+1,count:0});classes.get(id).count++;}
for(let i=0;i<scenarios.length;i++){
  const s=scenarios[i];
  if(s.origin==='browser-back'||s.origin==='deep-link')hit('K01-navigation-context-restoration',i);
  if(s.origin==='command')hit('K02-command-palette-discoverability',i);
  if(s.role==='auditor')hit('K03-auditor-no-write-primary',i);
  if(s.viewport==='390x844'||s.viewport==='768x1024')hit('K04-responsive-composition-pressure',i);
  if(s.density==='dense'||s.density==='saturated')hit('K05-density-compression-pressure',i);
  if(s.motion==='reduced')hit('K06-reduced-motion-parity',i);
  if(s.evidence==='stale')hit('K07-freshness-visible-without-overclaim',i);
  if(s.procedure==='coverage')hit('K08-standard-catalog-use-separation',i);
  if(s.procedure==='coverage'&&s.standardUse==='undeclared')hit('K09-standard-browse-without-org-use',i);
  if(s.ai==='on')hit('K10-ai-assist-visual-separation',i);
  if(s.ai==='off')hit('K11-ai-off-critical-journey',i);
  if(s.attention==='high'&&s.density==='saturated')hit('K12-first-fold-attention-under-load',i);
  if(s.origin==='evidence')hit('K13-proof-boundary-progressive-disclosure',i);
  if(s.role==='user'&&['actions','risks','assurance'].includes(s.procedure))hit('K14-role-action-hierarchy',i);
  if(s.viewport==='390x844'&&s.origin==='command')hit('K15-mobile-command-palette',i);
  if(s.viewport==='390x844'&&s.density==='saturated')hit('K16-mobile-overflow-pressure',i);
  if(s.procedure==='monitoring'&&s.density!=='empty')hit('K17-monitoring-side-panel-competition',i);
  if(s.procedure==='incidents'&&s.origin==='deep-link')hit('K18-dialog-entry-context',i);
  if(s.procedure==='coverage'&&s.evidence==='rich')hit('K19-standard-node-and-evidence-density',i);
  if(s.origin==='browser-back'&&s.procedure==='coverage')hit('K20-history-plus-standard-context',i);
}
assert.equal(classes.size,20);const lastNew=Math.max(...[...classes.values()].map(x=>x.first));assert.ok(lastNew<=N-100,`saturation requires >=100 trailing scenarios without new normalized class; last=${lastNew}`);const trailing=N-lastNew;
const report={ok:true,model:'v1.9-experience-saturation',seed:SEED,scenarios:N,dimensions:names.length,pairwise:{pairs:Object.keys(pairCoverage).length,coverage:1},normalizedStressClasses:Object.fromEntries(classes),lastNewClassAt:lastNew,trailingNoNew:trailing,claimBoundary:'Model trigger frequency is design pressure, not empirical bug probability or runtime/browser proof.'};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/v1-9-experience-saturation.json',import.meta.url),JSON.stringify(report,null,2));
console.log(`v1-9-experience-saturation: ok (${N} scenarios; ${names.length} dimensions; pairwise 100%; last new class ${lastNew}; trailing ${trailing})`);
