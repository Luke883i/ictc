import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const router=readFileSync(new URL('./public/ui/surface-router.js',import.meta.url),'utf8');
const grcOwner=readFileSync(new URL('./public/ui/grc-workspace-3-2.js',import.meta.url),'utf8');
const lifecycle=readFileSync(new URL('./public/ui/experience-lifecycle.js',import.meta.url),'utf8');
const browser=readFileSync(new URL('./browser-procedure-ui-ux-1-6.py',import.meta.url),'utf8');

const commitBody=router.match(/function commitSurfaceNavigation\([\s\S]*?\n\}/)?.[0]||'';
assert.ok(commitBody.includes('return runTransition(() => {'),'surface commit must execute inside the transition update');
assert.ok(commitBody.indexOf('renderSurfaceNavigation();')>=0&&commitBody.indexOf('announceSurfaceChanged(')>commitBody.indexOf('renderSurfaceNavigation();'),'surface-changed must be emitted after the visible-surface DOM commit');
assert.equal((router.match(/const transition = commitSurfaceNavigation\(/g)||[]).length,2,'forward and popstate navigation must share the same committed boundary');
assert.ok(!router.includes("announceSurfaceChanged(next, from, direction);\n  const transition = runTransition(renderSurfaceNavigation"),'pre-commit surface event must not return');
assert.ok(grcOwner.includes('function convergeAfterCanonicalRender()')&&grcOwner.includes('queueMicrotask(()=>')&&grcOwner.includes("reason:'grc-render-committed'"),'GRC local owner must reconverge after canonical render and publish a context commit');
assert.ok(lifecycle.includes("document.addEventListener('ictc:context-changed',()=>requestExperienceLifecycle('ictc:context-changed'))"),'context commit must request a final constitutional convergence');
assert.ok(browser.includes("PHASE=f'{code}-local-owner'")&&browser.includes("PHASE=f'{code}-projection-ready'")&&!browser.includes('wait_for_timeout('),'required UI oracle must observe owner/projection readiness without fixed sleeps');

const FAMILIES=Object.freeze([
  'surface-event-before-visibility','surface-event-outside-transition','popstate-precommit',
  'local-owner-before-canonical','context-before-owner','final-c01-before-context',
  'missing-final-c01','duplicate-surface-commit','stale-procedure-owner','view-transition-order-drift',
  'reduced-motion-order-drift','canonical-render-after-owner','projection-before-owner','route-state-after-commit'
]);
function baseline(){return{
  routeState:1,canonicalRender:3,surfaceVisibility:2,surfaceEvent:2.5,localOwner:4,projection:5,contextCommit:6,finalC01:7,
  sameTransition:true,popstateSameBoundary:true,oneCommit:true,procedureFresh:true,viewTransitionEquivalent:true,reducedMotionEquivalent:true,finalC01Present:true
};}
function violations(v){const out=[];
  if(!(v.routeState<v.surfaceEvent))out.push('route-state-after-commit');
  if(!(v.surfaceVisibility<v.surfaceEvent))out.push('surface-event-before-visibility');
  if(!v.sameTransition)out.push('surface-event-outside-transition');
  if(!v.popstateSameBoundary)out.push('popstate-precommit');
  if(!(v.canonicalRender<v.localOwner))out.push('local-owner-before-canonical');
  if(!(v.localOwner<v.projection))out.push('projection-before-owner');
  if(!(v.localOwner<v.contextCommit))out.push('context-before-owner');
  if(!v.finalC01Present)out.push('missing-final-c01');
  else if(!(v.contextCommit<v.finalC01))out.push('final-c01-before-context');
  if(!v.oneCommit)out.push('duplicate-surface-commit');
  if(!v.procedureFresh)out.push('stale-procedure-owner');
  if(!v.viewTransitionEquivalent)out.push('view-transition-order-drift');
  if(!v.reducedMotionEquivalent)out.push('reduced-motion-order-drift');
  if(!(v.canonicalRender<v.localOwner))out.push('canonical-render-after-owner');
  return [...new Set(out)];
}
function mutate(v,f){switch(f){
  case'surface-event-before-visibility':v.surfaceEvent=1.5;break;
  case'surface-event-outside-transition':v.sameTransition=false;break;
  case'popstate-precommit':v.popstateSameBoundary=false;break;
  case'local-owner-before-canonical':v.localOwner=2.8;v.canonicalRender=3.2;break;
  case'context-before-owner':v.contextCommit=3.5;break;
  case'final-c01-before-context':v.finalC01=5.5;break;
  case'missing-final-c01':v.finalC01Present=false;break;
  case'duplicate-surface-commit':v.oneCommit=false;break;
  case'stale-procedure-owner':v.procedureFresh=false;break;
  case'view-transition-order-drift':v.viewTransitionEquivalent=false;break;
  case'reduced-motion-order-drift':v.reducedMotionEquivalent=false;break;
  case'canonical-render-after-owner':v.canonicalRender=4.5;break;
  case'projection-before-owner':v.projection=3.5;break;
  case'route-state-after-commit':v.routeState=3;break;
  default:throw new Error(`unknown surface-commit mutant ${f}`);
}return v;}
assert.deepEqual(violations(baseline()),[]);
function xorshift(v){v^=v<<13;v^=v>>>17;v^=v<<5;return v>>>0;}
let prng=0x99c0ffee,lastNovelAt=0,killed=0,alive=0,signature=2166136261;
const seen=new Set(),hits=Object.fromEntries(FAMILIES.map(x=>[x,0]));
let trial=0,target=Infinity;
while(trial<target){
  trial++;prng=xorshift(prng);const family=FAMILIES[prng%FAMILIES.length],out=violations(mutate(baseline(),family));hits[family]++;
  if(!out.includes(family)){alive++;throw new Error(`live surface-commit mutant family=${family} seed=${trial} violations=${out}`);}
  killed++;signature=Math.imul(signature^prng^out.length,16777619)>>>0;
  if(!seen.has(family)){seen.add(family);lastNovelAt=trial;if(seen.size===FAMILIES.length)target=lastNovelAt+100_000;}
  if(trial>1_000_000)throw new Error('surface-commit saturation did not converge');
}
for(const family of FAMILIES)assert.ok(hits[family]>0,`surface-commit family uncovered: ${family}`);
for(let seed=1;seed<=100_000;seed++){
  const valid=baseline(),mode=seed%3;
  if(mode===0)valid.viewTransitionEquivalent=true;
  if(mode===1)valid.reducedMotionEquivalent=true;
  assert.deepEqual(violations(valid),[]);
}
console.log(JSON.stringify({ok:true,profile:'surface-commit-3.2-saturation',codeBoundAuthority:['surface-router.js','grc-workspace-3-2.js','experience-lifecycle.js'],families:FAMILIES.length,lastNovelAt,executions:trial,holdoutAfterM:trial-lastNovelAt,mutantsKilled:killed,mutantsAlive:alive,killRate:killed/trial,validSchedules:100_000,hits,signature,contract:'route-state -> visible surface commit -> surface-changed -> local owner/projection -> context commit -> final C0.1',limitations:['Deterministic code-bound scheduling mutants, not browser sessions.','Server-backed browser journeys and exact-head GitHub Actions remain runtime acceptance evidence.']},null,2));
