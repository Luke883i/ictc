import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';

const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const source={
  slots:read('./public/ui/procedure-editorial-slots.js'),
  rn:read('./public/ui/procedure-sequential-rn-ec.js'),
  grc:read('./public/ui/grc-workspace-3-2.js'),
  frame:read('./public/ui/procedure-frame.js'),
  market:read('./public/ui/procedure-market-ux.js'),
  grcBase:read('./public/ui/grc-workspace-base.js'),
  ep:read('./public/ui/epistemic-lattice.js'),
  router:read('./public/ui/surface-router.js'),
  workbench:read('./runtime/workbench-projection.mjs'),
  admin:read('./public/ui/admin-center.js'),
  semanticSurface:read('./public/ui/semantic-surface-a6-ux4.js')
};

const CANON=['attention','controls','primary','advanced-context','reference'];
const PROCEDURES=['monitoring','incidents','objects','coverage','actions','risks','assurance'];

function sourceLaws(s){
  const orderToken="['attention','controls','primary','advanced-context','reference']";
  return {
    sevenOwners:(s.rn.split(orderToken).length-1)===2&&(s.grc.split(orderToken).length-1)===5,
    rnUniquePrimary:s.rn.includes('PRIMARY_SELECTOR')&&s.rn.includes('[data-rn-primary-work="sources"]')&&s.rn.includes("incidents:':scope > .section-block'"),
    dynamicSupportRail:s.slots.includes('function positionSupportRail(')&&s.slots.includes('function validPhysicalOrder('),
    contiguousDeclaredBlock:s.slots.includes('function reconcilePhysicalOrder(')&&s.slots.includes('index!==cursor+1')&&s.slots.includes('orderedTopLevelNodes'),
    firstRoleAdjacent:s.slots.includes('let previous=null')&&s.slots.includes('host.insertBefore(node,next)')&&s.slots.includes('if(frame?.parentElement===host){frame.after(node);return;}'),
    supportSecondary:s.frame.includes("rail.dataset.secondaryDisclosure='true'"),
    marketPrimaryFirst:s.market.indexOf('<details class="market-mapping-panel" data-market-primary-work')>=0&&s.market.indexOf('<details class="market-mapping-panel" data-market-primary-work')<s.market.indexOf('<details class="market-section market-library"'),
    marketLibraryProgressive:s.market.includes('details class="market-section market-library"')&&s.market.includes('data-market-library'),
    marketIntegratedProgressive:s.market.includes('details class="market-section market-integrated"')&&s.market.includes('data-market-integrated'),
    coverageScopePrimary:s.semanticSurface.includes("coverageAnchor=id==='coverage'?root.querySelector('.market-mapping-panel[open] .grc-list'):null")&&s.semanticSurface.indexOf('if(coverageAnchor)')<s.semanticSurface.indexOf('else if(nativeFilter)'),
    riskAnalysisProgressive:s.grcBase.includes('data-risk-analysis-disclosure')&&s.grcBase.includes('<details class="grc-heat"'),
    riskAnalysisAfterList:s.grcBase.indexOf('<div class="grc-list">${p.risks.map')<s.grcBase.indexOf('${analysis}'),
    epHumanProjection:s.ep.includes('const PROCEDURE_LABELS=Object.freeze')&&s.ep.includes('const STATUS_LABELS=Object.freeze')&&s.ep.includes('const FAMILY_LABELS=Object.freeze')&&s.ep.includes('const kindLabel='),
    epNoDigestFirstPlane:s.ep.includes('label.dataset.projectionDigest=digest')&&!s.ep.includes('· digest ${(p.projectionSha256'),
    backNoSelf:s.router.includes('if (!from || sameRoute(from, current))'),
    aiOptional:!s.workbench.includes("kind: 'configure-ai'")&&s.workbench.indexOf("kind: 'create-monitoring'")<s.workbench.indexOf("if (!llmReady) return nextAction({ kind: 'monitor-activity'"),
    adminBusinessLanguage:!s.admin.includes('>Control plane<')
  };
}
const baselineSource=sourceLaws(source);
assert.ok(Object.values(baselineSource).every(Boolean),JSON.stringify(baselineSource));

const SOURCE_MUTANTS=[
  ['old-order-rn',s=>({...s,rn:s.rn.replaceAll(CANON.map(x=>`'${x}'`).join(','),"'advanced-context','reference','attention','controls','primary'")})],
  ['rn-broad-primary',s=>({...s,rn:s.rn.replace('[data-rn-primary-work="sources"]','.section-block')})],
  ['old-order-grc',s=>({...s,grc:s.grc.replaceAll(CANON.map(x=>`'${x}'`).join(','),"'advanced-context','reference','attention','controls','primary'")})],
  ['drop-rail-positioner',s=>({...s,slots:s.slots.replaceAll('positionSupportRail','positionSupportRailBROKEN')})],
  ['first-role-after-frame',s=>({...s,slots:s.slots.replace('let previous=null','let previous=frame')})],
  ['drop-contiguous-reconcile',s=>({...s,slots:s.slots.replaceAll('reconcilePhysicalOrder','reconcilePhysicalOrderBROKEN')})],
  ['support-not-secondary',s=>({...s,frame:s.frame.replace("rail.dataset.secondaryDisclosure='true'",'')})],
  ['market-primary-marker-lost',s=>({...s,market:s.market.replace('data-market-primary-work','data-market-secondary-work')})],
  ['market-library-section',s=>({...s,market:s.market.replace('details class="market-section market-library"','section class="market-section market-library"')})],
  ['market-integrated-section',s=>({...s,market:s.market.replace('details class="market-section market-integrated"','section class="market-section market-integrated"')})],
  ['coverage-scope-in-library',s=>({...s,semanticSurface:s.semanticSurface.replace("coverageAnchor=id==='coverage'?root.querySelector('.market-mapping-panel[open] .grc-list'):null","coverageAnchor=null")})],
  ['coverage-generic-filter-wins',s=>({...s,semanticSurface:s.semanticSurface.replace('if(coverageAnchor){','if(false&&coverageAnchor){')})],
  ['risk-analysis-section',s=>({...s,grcBase:s.grcBase.replace('<details class="grc-heat"','<section class="grc-heat"')})],
  ['risk-analysis-before-list',s=>({...s,grcBase:s.grcBase.replace('<div class="grc-list">${p.risks.map','${analysis}<div class="grc-list">${p.risks.map')})],
  ['ep-drop-human-labels',s=>({...s,ep:s.ep.replace('PROCEDURE_LABELS','PROCEDURE_LABELS_BROKEN')})],
  ['ep-digest-first-plane',s=>({...s,ep:s.ep.replace('label.textContent=`r${p.fromRevision||0}–r${p.toRevision||0} · stato r${p.stateRevision||0}`','label.textContent=`r${p.fromRevision||0}–r${p.toRevision||0} · stato r${p.stateRevision||0} · digest ${(p.projectionSha256||\'\').slice(0,12)}`')})],
  ['back-self',s=>({...s,router:s.router.replace('if (!from || sameRoute(from, current))','if (!from)')})],
  ['ai-first',s=>({...s,workbench:s.workbench.replace("if (!(state.missions || []).length) return nextAction({ kind: 'create-monitoring'","if (!llmReady) return nextAction({ kind: 'configure-ai', title: 'Completa la configurazione AI', label: 'Configura AI', reason: 'setup', action: 'settings', service: 'administration' });\n    if (!(state.missions || []).length) return nextAction({ kind: 'create-monitoring'")})],
  ['admin-control-plane',s=>({...s,admin:s.admin.replace('>Amministrazione</p>','>Control plane</p>')})]
];
const sourceMutationResults=[];
for(const [name,mutate] of SOURCE_MUTANTS){const mutated=mutate(source);const laws=sourceLaws(mutated);const killed=Object.values(laws).some(v=>!v);sourceMutationResults.push({name,killed,failed:Object.entries(laws).filter(([,v])=>!v).map(([k])=>k)});assert.equal(killed,true,`source mutant survived: ${name}`);}

function baseline(){return {
  order:[...CANON],supportAfterPrimary:true,supportClosed:true,firstRoleAdjacent:true,contiguousDeclaredBlock:true,
  market:['mapping','library','integrated'],libraryProgressive:true,integratedProgressive:true,coverageScopePrimary:true,
  risk:['metrics','create','records','analysis'],riskAnalysisProgressive:true,riskAnalysisOpen:false,
  ep:{firstPlaneTechnical:false,digestFirstPlane:false,humanLabels:true,rawPreserved:true},
  backSelf:false,aiOptionalPrimary:false,ownerCount:1,primaryCount:1,
  businessAuthorityChanged:false,writeAuthorityCount:1
};}
function violations(x){const out=[];
  if(x.order.join('>')!==CANON.join('>')||new Set(x.order).size!==CANON.length)out.push('editorial-order');
  if(!x.supportAfterPrimary||!x.supportClosed)out.push('support-progressive');
  if(!x.firstRoleAdjacent||!x.contiguousDeclaredBlock)out.push('placement-adjacency');
  if(x.market.join('>')!=='mapping>library>integrated'||!x.libraryProgressive||!x.integratedProgressive)out.push('market-progressive');
  if(!x.coverageScopePrimary)out.push('coverage-scope-placement');
  if(x.risk.join('>')!=='metrics>create>records>analysis'||!x.riskAnalysisProgressive||x.riskAnalysisOpen)out.push('risk-progressive');
  if(x.ep.firstPlaneTechnical||x.ep.digestFirstPlane||!x.ep.humanLabels||!x.ep.rawPreserved)out.push('epistemic-projection');
  if(x.backSelf)out.push('navigation');
  if(x.aiOptionalPrimary)out.push('ai-optional');
  if(x.ownerCount!==1||x.primaryCount!==1)out.push('single-owner-primary');
  if(x.businessAuthorityChanged||x.writeAuthorityCount!==1)out.push('authority-boundary');
  return out;
}
const FAMILIES=[
  ['context-before-work',x=>{x.order=['advanced-context','reference','attention','controls','primary'];}],
  ['primary-missing',x=>{x.order=x.order.filter(v=>v!=='primary');}],
  ['attention-after-primary',x=>{x.order=['controls','primary','attention','advanced-context','reference'];}],
  ['duplicate-primary-slot',x=>{x.order.splice(3,0,'primary');}],
  ['support-before-primary',x=>{x.supportAfterPrimary=false;}],
  ['support-open-default',x=>{x.supportClosed=false;}],
  ['legacy-sibling-before-first-control',x=>{x.firstRoleAdjacent=false;}],
  ['legacy-sibling-inside-declared-block',x=>{x.contiguousDeclaredBlock=false;}],
  ['market-library-before-mapping',x=>{x.market=['library','mapping','integrated'];}],
  ['market-library-flat',x=>{x.libraryProgressive=false;}],
  ['market-integrated-flat',x=>{x.integratedProgressive=false;}],
  ['coverage-scope-hidden-in-library',x=>{x.coverageScopePrimary=false;}],
  ['risk-analysis-before-records',x=>{x.risk=['metrics','analysis','create','records'];}],
  ['risk-analysis-flat',x=>{x.riskAnalysisProgressive=false;}],
  ['risk-analysis-open-default',x=>{x.riskAnalysisOpen=true;}],
  ['ep-raw-token-first-plane',x=>{x.ep.firstPlaneTechnical=true;}],
  ['ep-digest-first-plane',x=>{x.ep.digestFirstPlane=true;}],
  ['ep-human-labels-off',x=>{x.ep.humanLabels=false;}],
  ['ep-raw-truth-lost',x=>{x.ep.rawPreserved=false;}],
  ['self-back-label',x=>{x.backSelf=true;}],
  ['ai-setup-primary',x=>{x.aiOptionalPrimary=true;}],
  ['second-owner',x=>{x.ownerCount=2;}],
  ['duplicate-primary-representation',x=>{x.primaryCount=2;}],
  ['business-authority-change',x=>{x.businessAuthorityChanged=true;}],
  ['second-write-authority',x=>{x.writeAuthorityCount=2;}]
];

const seedText=process.env.ICTC_UIUX_ONTOLOGY_SEED||randomBytes(4).toString('hex');let seed=(Number.parseInt(seedText.slice(-8),16)>>>0)||0x91a2b3c4;
const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const TOTAL=10_000_000,hits=Array(FAMILIES.length).fill(0),violationsHit=new Map();let killed=0;
for(let i=0;i<TOTAL;i++){
  const x=baseline(),rounds=1+(rnd()%4),chosen=new Set();
  for(let r=0;r<rounds;r++){let fi=rnd()%FAMILIES.length;while(chosen.has(fi))fi=(fi+1)%FAMILIES.length;chosen.add(fi);hits[fi]++;FAMILIES[fi][1](x);}
  const found=violations(x);if(!found.length)throw new Error(`survivor at ${i}: ${[...chosen].map(j=>FAMILIES[j][0]).join(',')}`);for(const v of found)violationsHit.set(v,(violationsHit.get(v)||0)+1);killed++;
}
assert.equal(killed,TOTAL);assert.ok(hits.every(n=>n>0));

const essential={};
const LAW_NAMES=['editorial-order','support-progressive','placement-adjacency','market-progressive','coverage-scope-placement','risk-progressive','epistemic-projection','navigation','ai-optional','single-owner-primary','authority-boundary'];
for(const law of LAW_NAMES){essential[law]=FAMILIES.some(([,mutate])=>{const x=baseline();mutate(x);const found=violations(x);return found.length===1&&found[0]===law;});assert.equal(essential[law],true,`no isolated falsifier for ${law}`);}

mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});
const report={ok:true,slice:'UIUX-ONTOLOGY-CLOSURE-10M',seed:seedText,total:TOTAL,killed, survivors:0,mutationFamilies:FAMILIES.map(([name],i)=>({name,hits:hits[i]})),sourceMutants:sourceMutationResults,violations:Object.fromEntries(violationsHit),essentialLaws:essential,procedures:PROCEDURES,canonicalEditorialOrder:CANON.join('>'),minimalSemanticLattice:['work-before-support','declared-owner-adjacency-over-legacy-siblings','scope-controls-live-with-primary-collection','one-owner-one-primary','progressive-secondary-analysis','human-first-epistemic-projection-with-raw-preserved','optional-ai-never-primary','non-self-back-navigation','business-write-authority-unchanged'],claimBoundary:'E2 deterministic 10,000,000 model-composition mutations plus concrete source mutation operators. This is not 10,000,000 browser sessions and does not prove representative-human usability, legal compliance, deployment effectiveness or absence of all UI defects.'};
writeFileSync(new URL('../artifacts/uiux-ontology-closure-saturation-10m.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
