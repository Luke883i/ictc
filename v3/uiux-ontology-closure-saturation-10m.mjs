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
  semanticSurface:read('./public/ui/semantic-surface-a6-ux4.js'),
  seqDom:read('./public/ui/procedure-sequential-dom.js'),
  harmonization:read('./public/ui/procedure-executive-harmonization-1-5.js'),
  harmonizationBase:read('./public/ui/procedure-executive-harmonization-1-5-base.js'),
  finetuning14:read('./public/ui/procedure-finetuning-1-4.js')
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
    coverageScopePrimary:s.semanticSurface.includes("return root.querySelector('[data-market-primary-work]')||null")&&s.semanticSurface.includes("if(id==='coverage'){const scopeAnchor=scopeAnchorForBindings(root,id),coverageControl=ensureScopeControl(root,id,scopeAnchor)")&&s.semanticSurface.indexOf("if(id==='coverage'){const scopeAnchor")<s.semanticSurface.indexOf("if(!exact){section.hidden=false")&&s.semanticSurface.includes('scopeAnchor.before(bar);if(label.parentElement!==bar)bar.append(label);return control;}')&&s.semanticSurface.includes("control.dataset.a6Ux4ScopeOwner=id"),
    coverageScopeRemountDefault:s.semanticSurface.includes('function syncScopePreference(control,id)')&&(s.semanticSurface.split("control.dataset.a6Ux4UserSelected!=='true'").length-1)===1&&s.semanticSurface.includes("control.dataset.a6Ux4UserSelected='true'")&&s.semanticSurface.includes('function resetScopePreferences()')&&s.semanticSurface.includes("delete control.dataset.a6Ux4UserSelected")&&s.semanticSurface.includes("control.value='actionable'"),
    coverageScopePrimaryCollectionOnly:s.semanticSurface.includes("function scopeUniverse(root,id){if(id==='coverage')return[...root.querySelectorAll('[data-market-primary-work] [data-grc-record-procedure=\"coverage\"]')]")&&!s.semanticSurface.includes("function scopeUniverse(root,id){if(id==='coverage')return[...root.querySelectorAll('[data-framework-card]"),
    journeyHelperOutsideOwnedBlock:s.seqDom.includes("host.append(guide)")&&s.seqDom.includes("rail.after(guide)")&&!s.seqDom.includes("(compass||host.firstElementChild)?.after(guide)"),
    harmonizationNoReparent:s.harmonization.includes("structuralPlacementAuthority='procedure-editorial-slots'")&&!s.harmonization.includes('anchor.after(decisionFrame)')&&!s.harmonization.includes('workAnchor(host)'),
    decisionContextOutsideOwnedBlock:s.harmonizationBase.includes("for(const stale of root.querySelectorAll(':scope > .procedure-decision-frame'))if(stale.dataset.executiveProcedure!==id)stale.remove()")&&s.harmonizationBase.includes("if(rail)rail.after(frame);else root.append(frame)")&&!s.harmonizationBase.includes("else if(rail&&frame.previousElementSibling!==rail)rail.after(frame)")&&!s.harmonizationBase.includes('const reference=procedureFrame?.nextElementSibling')&&!s.harmonizationBase.includes('procedureFrame.after(frame)'),
    legacyCompassNoPlacement:s.finetuning14.includes("box.dataset.compatibilityOnly='true'")&&s.finetuning14.includes("box.dataset.structuralPlacementAuthority='none'")&&s.finetuning14.includes('box.hidden=true')&&!s.finetuning14.includes('anchor.after(box)')&&!s.finetuning14.includes('host.prepend(box)'),
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
  ['coverage-scope-wrong-collection',s=>({...s,semanticSurface:s.semanticSurface.replace("return root.querySelector('[data-market-primary-work]')||null","return root.querySelector('.market-framework-grid')||null")})],
  ['coverage-scope-after-exact-only',s=>({...s,semanticSurface:s.semanticSurface.replace("if(id==='coverage'){const scopeAnchor=scopeAnchorForBindings(root,id),coverageControl=ensureScopeControl(root,id,scopeAnchor)","if(exact&&id==='coverage'){const scopeAnchor=scopeAnchorForBindings(root,id),coverageControl=ensureScopeControl(root,id,scopeAnchor)")})],
  ['coverage-scope-anchor-ignored',s=>({...s,semanticSurface:s.semanticSurface.replace('ensureScopeControl(root,id,scopeAnchor)','ensureScopeControl(root,id,null)')})],
  ['coverage-scope-not-reparented',s=>({...s,semanticSurface:s.semanticSurface.replace('scopeAnchor.before(bar);if(label.parentElement!==bar)bar.append(label);return control;}','scopeAnchor.before(bar);return control;}')})],
  ['coverage-default-persists',s=>({...s,semanticSurface:s.semanticSurface.replace("delete control.dataset.a6Ux4UserSelected;control.value='actionable'","control.value=control.value||'actionable'")})],
  ['scope-user-choice-overwritten',s=>({...s,semanticSurface:s.semanticSurface.replace("if(control.dataset.a6Ux4UserSelected!=='true')","if(true)")})],
  ['coverage-scope-spans-secondary-library',s=>({...s,semanticSurface:s.semanticSurface.replace("return[...root.querySelectorAll('[data-market-primary-work] [data-grc-record-procedure=\"coverage\"]')]","return[...root.querySelectorAll('[data-framework-card],[data-grc-record-procedure=\"coverage\"]')]")})],
  ['journey-guide-inside-owner-block',s=>({...s,seqDom:s.seqDom.replace("host.append(guide)","host.firstElementChild?.after(guide)").replace("rail.after(guide)","host.firstElementChild?.after(guide)")})],
  ['harmonization-reclaims-placement',s=>({...s,harmonization:s.harmonization.replace("decisionFrame.dataset.structuralPlacementAuthority='procedure-editorial-slots';","const anchor=host.querySelector(':scope > .section-block,:scope > .grc-body');if(anchor)anchor.after(decisionFrame);")})],
  ['decision-frame-inside-owned-block',s=>({...s,harmonizationBase:s.harmonizationBase.replace("if(rail)rail.after(frame);else root.append(frame)","if(procedureFrame)procedureFrame.after(frame);else root.prepend(frame)")})],
  ['stale-decision-frame-retained',s=>({...s,harmonizationBase:s.harmonizationBase.replace("for(const stale of root.querySelectorAll(':scope > .procedure-decision-frame'))if(stale.dataset.executiveProcedure!==id)stale.remove();",'')})],
  ['decision-frame-reparent-on-replay',s=>({...s,harmonizationBase:s.harmonizationBase.replace("if(!frame){frame=document.createElement('section');frame.className='procedure-decision-frame';frame.dataset.executiveProcedure=id;if(rail)rail.after(frame);else root.append(frame);}","if(!frame){frame=document.createElement('section');frame.className='procedure-decision-frame';frame.dataset.executiveProcedure=id;if(rail)rail.after(frame);else root.append(frame);}else if(rail&&frame.previousElementSibling!==rail)rail.after(frame);")})],
  ['legacy-compass-reclaims-placement',s=>({...s,finetuning14:s.finetuning14.replace("box.dataset.structuralPlacementAuthority='none';","box.dataset.structuralPlacementAuthority='legacy';const anchor=host.querySelector(':scope > [data-procedure-attention-slot]');if(anchor)anchor.after(box);")})],
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
  order:[...CANON],supportAfterPrimary:true,supportClosed:true,firstRoleAdjacent:true,contiguousDeclaredBlock:true,journeyHelperOutsideOwnedBlock:true,harmonizationReparents:false,decisionContextInsideOwnedBlock:false,staleDecisionFrames:false,decisionContextReparents:false,legacyCompassReparents:false,
  market:['mapping','library','integrated'],libraryProgressive:true,integratedProgressive:true,coverageScopePrimary:true,coverageScopeRemountDefault:true,
  risk:['metrics','create','records','analysis'],riskAnalysisProgressive:true,riskAnalysisOpen:false,
  ep:{firstPlaneTechnical:false,digestFirstPlane:false,humanLabels:true,rawPreserved:true},
  backSelf:false,aiOptionalPrimary:false,ownerCount:1,primaryCount:1,
  businessAuthorityChanged:false,writeAuthorityCount:1
};}
function violations(x){const out=[];
  if(x.order.join('>')!==CANON.join('>')||new Set(x.order).size!==CANON.length)out.push('editorial-order');
  if(!x.supportAfterPrimary||!x.supportClosed)out.push('support-progressive');
  if(!x.firstRoleAdjacent||!x.contiguousDeclaredBlock||!x.journeyHelperOutsideOwnedBlock||x.harmonizationReparents||x.decisionContextInsideOwnedBlock||x.staleDecisionFrames||x.decisionContextReparents||x.legacyCompassReparents)out.push('placement-adjacency');
  if(x.market.join('>')!=='mapping>library>integrated'||!x.libraryProgressive||!x.integratedProgressive)out.push('market-progressive');
  if(!x.coverageScopePrimary)out.push('coverage-scope-placement');
  if(!x.coverageScopeRemountDefault)out.push('scope-remount-default');
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
  ['journey-helper-inside-owned-block',x=>{x.journeyHelperOutsideOwnedBlock=false;}],
  ['harmonization-late-reparent',x=>{x.harmonizationReparents=true;}],
  ['decision-context-inside-owned-block',x=>{x.decisionContextInsideOwnedBlock=true;}],
  ['stale-decision-frame',x=>{x.staleDecisionFrames=true;}],
  ['decision-context-reparent-on-replay',x=>{x.decisionContextReparents=true;}],
  ['legacy-compass-late-reparent',x=>{x.legacyCompassReparents=true;}],
  ['market-library-before-mapping',x=>{x.market=['library','mapping','integrated'];}],
  ['market-library-flat',x=>{x.libraryProgressive=false;}],
  ['market-integrated-flat',x=>{x.integratedProgressive=false;}],
  ['coverage-scope-hidden-in-library',x=>{x.coverageScopePrimary=false;}],
  ['coverage-scope-remount-persists-all',x=>{x.coverageScopeRemountDefault=false;}],
  ['scope-user-selection-not-stable',x=>{x.coverageScopeRemountDefault=false;}],
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
const LAW_NAMES=['editorial-order','support-progressive','placement-adjacency','market-progressive','coverage-scope-placement','scope-remount-default','risk-progressive','epistemic-projection','navigation','ai-optional','single-owner-primary','authority-boundary'];
for(const law of LAW_NAMES){essential[law]=FAMILIES.some(([,mutate])=>{const x=baseline();mutate(x);const found=violations(x);return found.length===1&&found[0]===law;});assert.equal(essential[law],true,`no isolated falsifier for ${law}`);}

mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});
const report={ok:true,slice:'UIUX-ONTOLOGY-CLOSURE-10M',seed:seedText,total:TOTAL,killed, survivors:0,mutationFamilies:FAMILIES.map(([name],i)=>({name,hits:hits[i]})),sourceMutants:sourceMutationResults,violations:Object.fromEntries(violationsHit),essentialLaws:essential,procedures:PROCEDURES,canonicalEditorialOrder:CANON.join('>'),minimalSemanticLattice:['work-before-support','single-structural-commit-after-local-enhancement','journey-helpers-outside-owned-block','harmonization-never-reparents-after-commit','one-active-decision-context-outside-owned-block','post-owner-helpers-never-reparent-on-replay','legacy-hidden-compatibility-never-reparents','declared-owner-adjacency-over-legacy-siblings','scope-controls-follow-visible-actionable-collection','scope-controls-reparent-on-remount','one-owner-one-primary','progressive-secondary-analysis','human-first-epistemic-projection-with-raw-preserved','optional-ai-never-primary','non-self-back-navigation','business-write-authority-unchanged'],claimBoundary:'E2 deterministic 10,000,000 model-composition mutations plus concrete source mutation operators. This is not 10,000,000 browser sessions and does not prove representative-human usability, legal compliance, deployment effectiveness or absence of all UI defects.'};
writeFileSync(new URL('../artifacts/uiux-ontology-closure-saturation-10m.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
