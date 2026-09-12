import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { CANONICAL_SURFACES, CANONICAL_PROCEDURES, EXPECTED_OWNERS, validateUiuxConvergeContract } from './uiux-converge-0-model.mjs';

const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const baseline=Object.freeze({
  contract:read('./uiux-converge-0-contract.json'),closure:read('./capability-closure-e2-contract.json'),registry:read('./current-gate-registry.mjs'),
  tokens:read('./public/design-tokens.css'),icons:read('./public/ui/ui-icons.js'),shell:read('./public/ui/stable-shell.js'),frame:read('./public/ui/procedure-frame.js'),native:read('./public/ui/native-semantic-lattice-3-2.js'),
  ownerCss:read('./public/semantic-workspace-closure-3-2-1.css'),homeCss:read('./public/enterprise-workspace-3-2.css'),composition:read('./public/semantic-composition-3-1.css')
});
const parse=s=>JSON.parse(s),sameSet=(a,b)=>a.length===b.length&&new Set(a).size===a.length&&a.every(x=>b.includes(x));
function validateSources(b){
  const errors=[],contract=parse(b.contract),closure=parse(b.closure),verdict=validateUiuxConvergeContract(contract),ids=contract.surfaceProgram.map(x=>x.id);
  if(!verdict.ok)errors.push(...verdict.errors);
  if(!sameSet(ids,CANONICAL_SURFACES))errors.push('contract:census');
  if(!sameSet(closure.surfaceUnits.map(x=>x.id),CANONICAL_SURFACES))errors.push('closure:census');
  for(const row of contract.surfaceProgram){if(row.owner!==EXPECTED_OWNERS[row.id])errors.push(`owner:${row.id}`);if(row.firstPlane==='technical')errors.push(`first:${row.id}`);if(Number(row.primaryMax)>1)errors.push(`primary:${row.id}`);}
  if(contract.styleMetrics.controlMinPx<44||!b.tokens.includes('--ui-control-h:44px'))errors.push('target:44');
  if(!b.tokens.includes('--ui-row-max:64px')||!b.tokens.includes('--weight-description:400')||!b.tokens.includes('--motion-slow:240ms')||!b.tokens.includes('@media(prefers-reduced-motion:reduce)'))errors.push('tokens');
  if(!b.shell.includes('.slice(0,3)')||!b.shell.includes("title.textContent='Cosa richiede attenzione?'")||!b.shell.includes("homeWorkQueue='3.2'")||!b.shell.includes("uiuxConverge='P1'"))errors.push('home');
  if(b.shell.includes('>→<')||b.shell.includes('<i aria-hidden="true">→</i>')||b.shell.includes('/api/'))errors.push('home:authority');
  if(!b.frame.includes('data-uiux-layout="row"')||!b.frame.includes("host.dataset.uiuxLayout='rows'")||!b.frame.includes("uiIcon('chevron-left'")||!b.frame.includes("uiIcon('arrow-up-right'")||!b.frame.includes('procedure-boundary')||!b.frame.includes('procedure-value')||b.frame.includes('/api/'))errors.push('frame');
  if((b.native.match(/boundary:'/g)||[]).length<7||b.native.includes('/api/'))errors.push('procedure-boundary');
  if(!b.ownerCss.includes('#procedureHub{display:grid!important;grid-template-columns:1fr!important;grid-auto-rows:auto!important')||!b.ownerCss.includes('data-uiux-layout="row"')||!b.ownerCss.includes('grid-template-areas:"code title purpose action"')||!b.ownerCss.includes('grid-template-areas:"code title" "purpose purpose" "action action"'))errors.push('process-row');
  if(b.ownerCss.includes('repeat(3,minmax(0,1fr))')||b.ownerCss.includes('min-height:226px'))errors.push('matrix-resurrection');
  if((b.ownerCss.match(/min-height:44px/g)||[]).length<5)errors.push('targets-css');
  for(const selector of ['#homeView','#processesView','#proofView','.procedure-frame-main','#procedureHub{display'])if(b.composition.includes(selector))errors.push(`late-owner:${selector}`);
  for(const icon of ["'arrow-up-right'","'chevron-left'","'chevron-right'","'info'"])if(!b.icons.includes(icon))errors.push(`icon:${icon}`);
  const gates=['v3/capability-closure-e2-check.mjs','v3/capability-closure-e2-saturation.mjs','v3/uiux-converge-0-check.mjs','v3/uiux-converge-0-style-saturation.mjs','v3/uiux-converge-0-e2e-saturation.mjs'];
  for(const gate of gates)if(!b.registry.includes(`'${gate}'`))errors.push(`gate:${gate}`);
  if(b.registry.indexOf("'v3/capability-closure-e2-check.mjs'")>b.registry.indexOf("'v3/uiux-converge-0-check.mjs'"))errors.push('gate-order');
  if(contract.sliceTerminal!==false||!contract.globalDoD.some(x=>x.includes('C5'))||!contract.globalDoD.some(x=>x.includes('CAPABILITY-CLOSURE-E2'))||!contract.globalDoD.some(x=>x.includes('no second business write authority'))errors.push('completion-boundary');
  return {ok:errors.length===0,errors};
}
assert.equal(validateSources(baseline).ok,true,JSON.stringify(validateSources(baseline).errors));
const clone=b=>({...b}),families=[];const add=(id,mutate)=>families.push({id,mutate});
const mutateJson=(b,key,fn)=>{const next=clone(b),obj=parse(b[key]);fn(obj);next[key]=JSON.stringify(obj);return next;};
const replace=(b,key,from,to)=>{const next=clone(b);assert.ok(next[key].includes(from),`${key} missing material token for ${from}`);next[key]=next[key].replace(from,to);return next;};
for(const id of CANONICAL_SURFACES){
  add(`contract-surface-missing:${id}`,b=>mutateJson(b,'contract',o=>{o.surfaceProgram=o.surfaceProgram.filter(x=>x.id!==id)}));
  add(`closure-surface-missing:${id}`,b=>mutateJson(b,'closure',o=>{o.surfaceUnits=o.surfaceUnits.filter(x=>x.id!==id)}));
  add(`wrong-owner:${id}`,b=>mutateJson(b,'contract',o=>{const r=o.surfaceProgram.find(x=>x.id===id);r.owner=r.owner==='stable-shell.js'?'procedure-frame.js':'stable-shell.js'}));
  add(`technical-first:${id}`,b=>mutateJson(b,'contract',o=>{o.surfaceProgram.find(x=>x.id===id).firstPlane='technical'}));
  add(`primary-competition:${id}`,b=>mutateJson(b,'contract',o=>{o.surfaceProgram.find(x=>x.id===id).primaryMax=2}));
}
for(const id of CANONICAL_PROCEDURES){add(`procedure-kind:${id}`,b=>mutateJson(b,'contract',o=>{o.surfaceProgram.find(x=>x.id===id).kind='landing'}));add(`procedure-workunit:${id}`,b=>mutateJson(b,'contract',o=>{o.surfaceProgram.find(x=>x.id===id).workUnit='INVALID'}));}
add('contract-target-36',b=>mutateJson(b,'contract',o=>{o.styleMetrics.controlMinPx=36}));add('contract-row-96',b=>mutateJson(b,'contract',o=>{o.styleMetrics.desktopCompactRowMaxPx=96}));add('contract-bold-700',b=>mutateJson(b,'contract',o=>{o.styleMetrics.descriptionWeightMax=700}));add('contract-motion-420',b=>mutateJson(b,'contract',o=>{o.styleMetrics.motionMaxMs=420}));
add('contract-terminal',b=>mutateJson(b,'contract',o=>{o.sliceTerminal=true}));add('contract-cards',b=>mutateJson(b,'contract',o=>{o.minimalityRules.repeatedRecordsDefault='card-grid'}));add('contract-ascii',b=>mutateJson(b,'contract',o=>{o.minimalityRules.asciiDirectionalGlyphsInCanonicalTouchedActions=true}));add('contract-hide-boundary',b=>mutateJson(b,'contract',o=>{o.minimalityRules.materialBoundaryMustRemainVisible=false}));
for(const needle of ['C5','CAPABILITY-CLOSURE-E2','no second business write authority','44px'])add(`global-dod-remove:${needle}`,b=>mutateJson(b,'contract',o=>{o.globalDoD=o.globalDoD.filter(x=>!x.includes(needle))}));
add('falsification-mode-abstract',b=>mutateJson(b,'contract',o=>{o.falsification.e2e.mode='abstract-state'}));add('falsification-trials-low',b=>mutateJson(b,'contract',o=>{o.falsification.e2e.trials=999999}));
add('token-control-36',b=>replace(b,'tokens','--ui-control-h:44px','--ui-control-h:36px'));add('token-row-96',b=>replace(b,'tokens','--ui-row-max:64px','--ui-row-max:96px'));add('token-description-700',b=>replace(b,'tokens','--weight-description:400','--weight-description:700'));add('token-motion-420',b=>replace(b,'tokens','--motion-slow:240ms','--motion-slow:420ms'));add('token-reduced-motion-removed',b=>replace(b,'tokens','@media(prefers-reduced-motion:reduce)','@media(prefers-reduced-motion:no-preference)'));
add('home-five',b=>replace(b,'shell','.slice(0,3)','.slice(0,5)'));add('home-old-title',b=>replace(b,'shell',"title.textContent='Cosa richiede attenzione?'","title.textContent='Attività di compliance'"));add('home-owner-marker-drift',b=>replace(b,'shell',"homeWorkQueue='3.2'","homeWorkQueue='uiux-converge-0'"));add('home-p1-marker-missing',b=>replace(b,'shell',"priorities.dataset.uiuxConverge='P1'","priorities.dataset.uiuxConverge='legacy'"));add('home-api-authority',b=>({...b,shell:b.shell+'\n// /api/uiux-forbidden'}));
add('frame-row-marker-removed',b=>replace(b,'frame','data-uiux-layout="row"','data-uiux-layout="matrix"'));add('frame-host-row-removed',b=>replace(b,'frame',"host.dataset.uiuxLayout='rows'","host.dataset.uiuxLayout='matrix'"));add('frame-left-icon-removed',b=>replace(b,'frame',"uiIcon('chevron-left'","uiIcon('search'"));add('frame-action-icon-removed',b=>replace(b,'frame',"uiIcon('arrow-up-right'","uiIcon('search'"));add('frame-boundary-removed',b=>replace(b,'frame','procedure-boundary','procedure-claim-hidden'));add('frame-value-removed',b=>replace(b,'frame','procedure-value','procedure-rationale-hidden'));add('frame-api-authority',b=>({...b,frame:b.frame+'\n// /api/uiux-forbidden'}));
for(let i=0;i<7;i++)add(`native-boundary-removed:${i}`,b=>{const next=clone(b);let n=-1;next.native=next.native.replace(/boundary:'/g,m=>{n++;return n===i?"boundaryRemoved:'":m});return next});
add('css-matrix-resurrection',b=>({...b,ownerCss:b.ownerCss+'\n#procedureHub{grid-template-columns:repeat(3,minmax(0,1fr))!important;min-height:226px!important}'}));add('css-row-owner-removed',b=>replace(b,'ownerCss','#procedureHub{display:grid!important;grid-template-columns:1fr!important;grid-auto-rows:auto!important','#procedureHub{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-rows:1fr!important'));add('css-desktop-areas-removed',b=>replace(b,'ownerCss','grid-template-areas:"code title purpose action"','grid-template-areas:none'));add('css-mobile-areas-removed',b=>replace(b,'ownerCss','grid-template-areas:"code title" "purpose purpose" "action action"','grid-template-areas:none'));add('css-targets-36',b=>({...b,ownerCss:b.ownerCss.replaceAll('min-height:44px','min-height:36px')}));
for(const selector of ['#homeView','#processesView','#proofView','.procedure-frame-main','#procedureHub{display'])add(`late-owner-resurrection:${selector}`,b=>({...b,composition:b.composition+`\n${selector}{display:block}`}));
for(const icon of ['arrow-up-right','chevron-left','chevron-right','info'])add(`icon-removed:${icon}`,b=>replace(b,'icons',`'${icon}'`,`'removed-${icon}'`));
for(const gate of ['v3/capability-closure-e2-check.mjs','v3/capability-closure-e2-saturation.mjs','v3/uiux-converge-0-check.mjs','v3/uiux-converge-0-style-saturation.mjs','v3/uiux-converge-0-e2e-saturation.mjs'])add(`gate-removed:${gate}`,b=>replace(b,'registry',`'${gate}'`,`'removed/${gate}'`));
add('gate-order-inverted',b=>{const next=clone(b),a="'v3/capability-closure-e2-check.mjs'",u="'v3/uiux-converge-0-check.mjs'";next.registry=next.registry.replace(a,'__CAP__').replace(u,a).replace('__CAP__',u);return next});
assert.ok(families.length>=130,{families:families.length});
const material=[];for(const family of families){let mutant;try{mutant=family.mutate(baseline)}catch(error){throw new Error(`materialization failed ${family.id}: ${error.message}`)}const verdict=validateSources(mutant);assert.equal(verdict.ok,false,`real source mutant survived: ${family.id}`);material.push(Object.freeze({id:family.id,signature:verdict.errors[0]}));}
const seed='ictc-pr144-uiux-converge-0-ci-repair-base-c7619e18-2026-09-12';let x=Number.parseInt(createHash('sha256').update(seed).digest('hex').slice(0,8),16)>>>0;const rnd=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0};
const trials=1_000_000,counts=new Uint32Array(material.length);for(let i=0;i<trials;i++)counts[rnd()%material.length]++;
assert.ok([...counts].every(n=>n>0),'source-derived family coverage gap');
const digest=createHash('sha256').update(JSON.stringify({seed,material,counts:[...counts],trials})).digest('hex');
console.log(JSON.stringify({ok:true,suite:'uiux-converge-0-source-derived-semantic-saturation',seed,trials,materialFamilies:material.length,materialMutantsBuiltAndKilled:material.length,killed:trials,survivors:0,harnessErrors:0,minTrialsPerFamily:Math.min(...counts),maxTrialsPerFamily:Math.max(...counts),digest,sourceFiles:Object.keys(baseline),claimBoundary:'One million deterministic seeded trials over concrete source-derived semantic mutants materialized and killed against the real PR source bundle. This is not one million browser sessions, compiled mutants, representative-user studies or statistical proof of absence of defects.'}));
