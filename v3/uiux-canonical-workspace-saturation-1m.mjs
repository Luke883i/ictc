import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const src=Object.freeze({
  frame:read('./public/ui/procedure-frame.js'),
  rn:read('./public/ui/procedure-sequential-rn-ec.js'),
  grc:read('./public/ui/grc-workspace-3-2.js'),
  seq:read('./public/ui/procedure-sequential-dom.js'),
  operational:read('./public/ui/operational-surface-a6-ux3.js'),
  semantic:read('./public/ui/semantic-surface-a6-ux4.js'),
  market:read('./public/ui/procedure-market-ux.js'),
  anatomy:read('./public/ui/procedure-anatomy.js'),
  grcBase:read('./public/ui/grc-workspace-base.js'),
  ep:read('./public/ui/epistemic-lattice.js'),
  epLens:read('./public/ui/epistemic-professional-lenses.js'),
  p2:read('./public/enduser-composition-p2.css'),
  product:read('./product-contract.json')
});

const ORDER=['reference','advanced-context','metrics','attention','controls','primary'];
const ORDER_TOKEN="['reference','advanced-context','metrics','attention','controls','primary']";
const PROCEDURES=['monitoring','incidents','objects','coverage','actions','risks','assurance'];

function sourceLaws(s){
  const marketOrder=[
    s.market.indexOf('<section class="market-section market-library" data-market-library'),
    s.market.indexOf('<section class="market-section market-integrated" data-market-integrated'),
    s.market.indexOf('<details class="market-mapping-panel" data-market-mapping-work')
  ];
  return Object.freeze({
    sevenProcedureOrder:(s.rn.split(ORDER_TOKEN).length-1)===2&&(s.grc.split(ORDER_TOKEN).length-1)===5,
    oneOrientationGuide:s.frame.includes('data-procedure-orientation-token="guide"')&&s.frame.includes('Come leggere questa procedura')&&!s.frame.includes("orientationToken('basis'"),
    orientationSemantics:s.frame.includes('data-orientation-basis')&&s.frame.includes('data-orientation-boundary'),
    nativeQueueOwner:s.rn.includes("ensureQueueWindow($('#missionsList')")&&s.rn.includes("ensureQueueWindow($('#incidentList')")&&!s.rn.includes('compactList('),
    queueCountOwner:s.seq.includes("registryCount.textContent=\`\${shown} di \${matching.length}\`")&&s.seq.includes("tools.dataset.enduserPrimitive='ControlRail'"),
    noLegacyLocalFilter:!s.operational.includes("ensureFilter(details,{id:'monitoring'")&&!s.operational.includes("ensureFilter(details,{id:'incidents'"),
    singleRegistryCount:s.operational.includes('data-a6-registry-count>0 di 0')&&!s.operational.includes('data-a6-registry-total'),
    monitoringSecondary:s.operational.includes("id:'monitoring',label:'Monitoraggi',process:'monitoring',count:byId.size,open:false"),
    incidentRowGrammar:s.operational.includes("card.classList.add('p2-record-row')")&&s.operational.includes("card.dataset.recordGrammar='row-list'"),
    localScopeRetired:s.semantic.includes("const LOCAL_NATIVE_SCOPE=new Set(['monitoring','incidents'])")&&s.semantic.includes('retireLocalScope(root,id)')&&s.semantic.includes("!LOCAL_NATIVE_SCOPE.has(id)"),
    marketHierarchy:marketOrder.every(x=>x>=0)&&marketOrder[0]<marketOrder[1]&&marketOrder[1]<marketOrder[2],
    mappingProgressive:s.market.includes('mappingOpen=priorMapping??false')&&s.market.includes('<details class="market-mapping-panel"'),
    contextBusinessLabel:s.anatomy.includes('Contesto e pratiche applicate')&&!s.anatomy.includes('Contesto e tracciabilità'),
    processStartsAtTop:s.grcBase.includes('function resetProcessStart()')&&s.grcBase.includes('queueMicrotask(resetProcessStart)'),
    proofPeerTypography:s.p2.includes('#proofContent>details.proof-section[data-proof-visual-grammar="peer-section"]>summary b{font-size:1rem')&&!s.p2.includes('details[data-proof-workspace="interpretation"][data-proof-visual-grammar="peer-section"]>summary b'),
    epistemicOneSummary:s.ep.includes('Vista r\${from}–r\${to}')&&!s.ep.includes('<b>\${Number(p.totalSteps||0)}</b> step'),
    epistemicBreadcrumb:s.ep.includes('aria-label="Percorso di esplorazione"')&&s.ep.includes('← \${labels[parent]}'),
    epistemicBusinessLabels:s.epLens.includes('function procedureName(id)')&&s.epLens.includes('procedureName(atom.procedureId'),
    cognitiveOrder:s.product.includes('"procedures":{"order":["procedure-identity","reference-and-context","primary-work","bounded-attention","primary-register"]')
  });
}
const baseSourceLaws=sourceLaws(src);
assert.ok(Object.values(baseSourceLaws).every(Boolean),JSON.stringify(Object.entries(baseSourceLaws).filter(([,v])=>!v)));

const SOURCE_MUTANTS=Object.freeze([
  ['order-rn',s=>({...s,rn:s.rn.replace(ORDER_TOKEN,"['reference','metrics','attention','controls','primary','advanced-context']")})],
  ['order-grc',s=>({...s,grc:s.grc.replace(ORDER_TOKEN,"['reference','metrics','attention','controls','primary','advanced-context']")})],
  ['orientation-split',s=>({...s,frame:s.frame.replace('data-procedure-orientation-token="guide"','data-procedure-orientation-token="basis"')})],
  ['orientation-basis-lost',s=>({...s,frame:s.frame.replace('data-orientation-basis','data-orientation-missing')})],
  ['orientation-boundary-lost',s=>({...s,frame:s.frame.replace('data-orientation-boundary','data-orientation-missing')})],
  ['rn-window-lost',s=>({...s,rn:s.rn.replace("ensureQueueWindow($('#missionsList')","retiredQueue($('#missionsList')")})],
  ['ec-window-lost',s=>({...s,rn:s.rn.replace("ensureQueueWindow($('#incidentList')","retiredQueue($('#incidentList')")})],
  ['queue-count-detached',s=>({...s,seq:s.seq.replace('registryCount.textContent=\`\${shown} di \${matching.length}\`','registryCount.textContent=String(matching.length)')})],
  ['monitor-filter-returns',s=>({...s,operational:s.operational.replace("const details=registryWrap(list,{id:'monitoring',label:'Monitoraggi',process:'monitoring',count:byId.size,open:false});","const details=registryWrap(list,{id:'monitoring',label:'Monitoraggi',process:'monitoring',count:byId.size,open:false});ensureFilter(details,{id:'monitoring'});")})],
  ['registry-total-returns',s=>({...s,operational:s.operational.replace('data-a6-registry-count>0 di 0','data-a6-registry-count>0 di 0<span data-a6-registry-total>0</span>')})],
  ['monitor-open-default',s=>({...s,operational:s.operational.replace("count:byId.size,open:false","count:byId.size,open:true")})],
  ['incident-card-wall',s=>({...s,operational:s.operational.replace("card.classList.add('p2-record-row')","card.classList.add('legacy-card-wall')")})],
  ['rn-ec-scope-returns',s=>({...s,semantic:s.semantic.replace("const LOCAL_NATIVE_SCOPE=new Set(['monitoring','incidents'])","const LOCAL_NATIVE_SCOPE=new Set([])")})],
  ['market-mapping-before-integrated',s=>({...s,market:s.market.replace('<section class="market-section market-integrated" data-market-integrated','<details class="market-mapping-panel" data-market-mapping-work-broken')})],
  ['mapping-flat',s=>({...s,market:s.market.replace('<details class="market-mapping-panel" data-market-mapping-work','<section class="market-mapping-panel" data-market-mapping-work')})],
  ['context-technical-label',s=>({...s,anatomy:s.anatomy.replaceAll('Contesto e pratiche applicate','Contesto e tracciabilità')})],
  ['top-reset-lost',s=>({...s,grcBase:s.grcBase.replace('queueMicrotask(resetProcessStart)','queueMicrotask(()=>{})')})],
  ['proof-featured-again',s=>({...s,p2:s.p2+'\nhtml[data-enduser-composition="p2"] #proofContent>details[data-proof-workspace="interpretation"][data-proof-visual-grammar="peer-section"]>summary b{font-size:1.2rem}\n'})],
  ['ep-multi-summary',s=>({...s,ep:s.ep.replace('Vista r\${from}–r\${to}','\${Number(p.totalSteps||0)} step · Vista r\${from}–r\${to}')})],
  ['ep-raw-process-id',s=>({...s,epLens:s.epLens.replace('procedureName(atom.procedureId','String(atom.procedureId')})],
  ['cognitive-order-regression',s=>({...s,product:s.product.replace('"procedures":{"order":["procedure-identity","reference-and-context","primary-work","bounded-attention","primary-register"]','"procedures":{"order":["procedure-identity","primary-work","bounded-attention","primary-register","advanced-context","reference"]')})]
]);
const sourceMutationResults=[];
for(const [name,mutate] of SOURCE_MUTANTS){
  const m=mutate(src),laws=sourceLaws(m),failed=Object.entries(laws).filter(([,v])=>!v).map(([k])=>k);
  assert.ok(failed.length>0,`source mutant survived: ${name}`);
  sourceMutationResults.push({name,failed});
}

const baseline=()=>({
  order:[...ORDER],orientationGuide:1,orientationBasis:1,orientationBoundary:1,
  localSearchOwners:{monitoring:1,incidents:1},localScopeOwners:{monitoring:1,incidents:1},
  registryCountOwners:{monitoring:1,incidents:1},monitoringOpen:false,incidentPresentation:'row',
  market:['library','integrated','mapping'],libraryPlane:'first',integratedPlane:'first',mappingPlane:'progressive',
  contextPosition:'before-metrics',contextLabel:'business',processStart:'top',proofPeer:true,
  epSummaryOwners:1,epNavigation:'breadcrumb',epLabels:'business',writeAuthorities:1
});
function violations(x){
  const out=[];
  if(x.order.join('>')!==ORDER.join('>')||new Set(x.order).size!==ORDER.length)out.push('editorial-order');
  if(x.orientationGuide!==1||x.orientationBasis!==1||x.orientationBoundary!==1)out.push('orientation');
  if(x.localSearchOwners.monitoring!==1||x.localSearchOwners.incidents!==1)out.push('local-search-owner');
  if(x.localScopeOwners.monitoring!==1||x.localScopeOwners.incidents!==1)out.push('local-scope-owner');
  if(x.registryCountOwners.monitoring!==1||x.registryCountOwners.incidents!==1)out.push('registry-count-owner');
  if(x.monitoringOpen!==false)out.push('monitoring-secondary');
  if(x.incidentPresentation!=='row')out.push('incident-presentation');
  if(x.market.join('>')!=='library>integrated>mapping'||x.libraryPlane!=='first'||x.integratedPlane!=='first'||x.mappingPlane!=='progressive')out.push('market-hierarchy');
  if(x.contextPosition!=='before-metrics'||x.contextLabel!=='business')out.push('context');
  if(x.processStart!=='top')out.push('entry-position');
  if(!x.proofPeer)out.push('proof-peer');
  if(x.epSummaryOwners!==1||x.epNavigation!=='breadcrumb'||x.epLabels!=='business')out.push('epistemic-ia');
  if(x.writeAuthorities!==1)out.push('authority');
  return out;
}
assert.deepEqual(violations(baseline()),[]);

const GROUPS=Object.freeze([
  [
    ['order-context-last',x=>{x.order=['reference','metrics','attention','controls','primary','advanced-context'];}],
    ['order-primary-early',x=>{x.order=['reference','advanced-context','primary','metrics','attention','controls'];}],
    ['order-duplicate-reference',x=>{x.order.splice(2,0,'reference');}],
    ['context-after-work',x=>{x.contextPosition='after-work';}],
    ['context-technical-copy',x=>{x.contextLabel='technical';}]
  ],
  [
    ['split-orientation',x=>{x.orientationGuide=2;}],
    ['orientation-basis-missing',x=>{x.orientationBasis=0;}],
    ['orientation-boundary-missing',x=>{x.orientationBoundary=0;}],
    ['rn-second-search',x=>{x.localSearchOwners.monitoring=2;}],
    ['ec-second-search',x=>{x.localSearchOwners.incidents=2;}],
    ['rn-second-scope',x=>{x.localScopeOwners.monitoring=2;}],
    ['ec-second-scope',x=>{x.localScopeOwners.incidents=2;}]
  ],
  [
    ['rn-second-count',x=>{x.registryCountOwners.monitoring=2;}],
    ['ec-second-count',x=>{x.registryCountOwners.incidents=2;}],
    ['monitoring-open',x=>{x.monitoringOpen=true;}],
    ['incident-card-wall',x=>{x.incidentPresentation='card-wall';}],
    ['market-mapping-first',x=>{x.market=['mapping','library','integrated'];}],
    ['market-integrated-last',x=>{x.market=['library','mapping','integrated'];}],
    ['market-library-collapsed',x=>{x.libraryPlane='progressive';}],
    ['market-integrated-collapsed',x=>{x.integratedPlane='progressive';}],
    ['market-mapping-flat',x=>{x.mappingPlane='first';}]
  ],
  [
    ['entry-scroll-retained',x=>{x.processStart='retained-scroll';}],
    ['proof-featured-method',x=>{x.proofPeer=false;}],
    ['ep-two-summary-owners',x=>{x.epSummaryOwners=2;}],
    ['ep-peer-tabs',x=>{x.epNavigation='peer-tabs';}],
    ['ep-raw-identifiers',x=>{x.epLabels='raw';}],
    ['second-write-authority',x=>{x.writeAuthorities=2;}]
  ]
]);

const seedText=process.env.ICTC_UIUX_CANONICAL_WORKSPACE_SEED||process.env.GITHUB_SHA||'9e3779b9';
let seed=(Number.parseInt(createHash('sha256').update(seedText).digest('hex').slice(0,8),16)>>>0)||0x9e3779b9;
const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const ri=n=>rnd()%n;
const TOTAL=1_000_000,hits=new Map(),violationHits=new Map();let killed=0;
for(let i=0;i<TOTAL;i++){
  const x=baseline(),applied=[];
  for(const group of GROUPS){
    const [name,mutate]=group[ri(group.length)];
    mutate(x);applied.push(name);hits.set(name,(hits.get(name)||0)+1);
  }
  if((rnd()&3)===0){
    const group=GROUPS[ri(GROUPS.length)],[name,mutate]=group[ri(group.length)];
    mutate(x);applied.push(name);hits.set(name,(hits.get(name)||0)+1);
  }
  const failed=violations(x);
  if(!failed.length)throw new Error(`survivor ${i}: ${applied.join(',')}`);
  for(const law of failed)violationHits.set(law,(violationHits.get(law)||0)+1);
  killed++;
}
assert.equal(killed,TOTAL);
for(const group of GROUPS)for(const [name] of group)assert.ok((hits.get(name)||0)>0,`unhit family: ${name}`);
for(const law of ['editorial-order','orientation','local-search-owner','local-scope-owner','registry-count-owner','monitoring-secondary','incident-presentation','market-hierarchy','context','entry-position','proof-peer','epistemic-ia','authority'])assert.ok((violationHits.get(law)||0)>0,`unexercised law: ${law}`);

mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});
const report={
  ok:true,slice:'UIUX-CANONICAL-WORKSPACE-1',seed:seedText,total:TOTAL,killed,survivors:0,
  procedures:PROCEDURES,canonicalOrder:ORDER.join('>'),
  sourceLaws:baseSourceLaws,sourceMutationOperators:sourceMutationResults,
  semanticFamilies:[...hits].map(([name,count])=>({name,count})),
  violationHits:Object.fromEntries(violationHits),
  scenarioShape:'Each execution applies one mutation from each of four independent semantic domains (global hierarchy/context; orientation/local control ownership; registry/MC hierarchy; entry/proof/epistemic/authority), plus an optional fifth mutation.',
  claimBoundary:'E2 deterministic semantic mutation execution over the complete targeted UI/UX slice plus concrete source mutants. These are not one million browser sessions, representative-human usability evidence, accessibility certification, legal/compliance proof or deployment-effectiveness evidence.'
};
writeFileSync(new URL('../artifacts/uiux-canonical-workspace-saturation-1m.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
