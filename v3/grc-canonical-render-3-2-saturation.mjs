import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const owner=readFileSync(new URL('./public/ui/grc-workspace-3-2.js',import.meta.url),'utf8');
const lifecycle=readFileSync(new URL('./public/ui/experience-lifecycle.js',import.meta.url),'utf8');
assert.ok(owner.includes("observer.observe(root,{childList:true})"),'GRC owner must observe only direct canonical root replacement');
assert.ok(owner.includes("body===lastCanonicalBody")&&owner.includes("reason:'grc-render-committed'"),'GRC owner must dedupe by canonical body identity and publish one context commit per replacement');
assert.ok(!owner.includes('surfaceCommitPending')&&!owner.includes('queueMicrotask(()=>{surfaceCommitPending'),'surface timing inference must be retired');
assert.ok(lifecycle.includes("'ictc:context-changed'"),'GRC canonical context commit must feed final C0.1');
const F=Object.freeze(['stale-root-owner','missing-canonical-observer','subtree-feedback','duplicate-body-commit','missing-local-reapply','missing-context-commit','context-before-local-owner','missing-final-c01','surface-timing-inference','procedure-stale']);
function base(){return{observer:true,directOnly:true,newBody:true,dedupe:true,local:true,context:true,localBeforeContext:true,finalC01:true,surfaceInference:false,procedureFresh:true};}
function fail(v){const out=[];if(!v.observer)out.push('missing-canonical-observer');if(!v.directOnly)out.push('subtree-feedback');if(!v.dedupe)out.push('duplicate-body-commit');if(!v.local)out.push('missing-local-reapply');if(!v.context)out.push('missing-context-commit');if(!v.localBeforeContext)out.push('context-before-local-owner');if(!v.finalC01)out.push('missing-final-c01');if(v.surfaceInference)out.push('surface-timing-inference');if(!v.procedureFresh)out.push('procedure-stale');if(!v.newBody&&v.local)out.push('stale-root-owner');return out;}
function mutate(v,f){switch(f){case'stale-root-owner':v.newBody=false;break;case'missing-canonical-observer':v.observer=false;break;case'subtree-feedback':v.directOnly=false;break;case'duplicate-body-commit':v.dedupe=false;break;case'missing-local-reapply':v.local=false;break;case'missing-context-commit':v.context=false;break;case'context-before-local-owner':v.localBeforeContext=false;break;case'missing-final-c01':v.finalC01=false;break;case'surface-timing-inference':v.surfaceInference=true;break;case'procedure-stale':v.procedureFresh=false;break;}return v;}
function x(v){v^=v<<13;v^=v>>>17;v^=v<<5;return v>>>0;}
let seed=0x32c0ffee,trial=0,lastNovel=0,target=Infinity,killed=0;const seen=new Set(),hits=Object.fromEntries(F.map(f=>[f,0]));
while(trial<target){trial++;seed=x(seed);const f=F[seed%F.length],v=mutate(base(),f),out=fail(v);hits[f]++;assert.ok(out.includes(f),`live GRC render mutant ${f} seed=${trial}: ${out}`);killed++;if(!seen.has(f)){seen.add(f);lastNovel=trial;if(seen.size===F.length)target=lastNovel+100000;}if(trial>1000000)throw new Error('GRC render saturation did not converge');}
assert.equal(seen.size,F.length);assert.equal(trial-lastNovel,100000);
console.log(JSON.stringify({ok:true,profile:'grc-canonical-render-3.2-saturation',families:F.length,lastNovelAt:lastNovel,executions:trial,holdoutAfterM:trial-lastNovel,mutantsKilled:killed,mutantsAlive:0,killRate:1,hits,contract:'canonical body replacement -> local owner reapply -> context commit -> final C0.1'},null,2));
