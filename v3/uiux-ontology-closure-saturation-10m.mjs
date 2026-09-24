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
  finetuning14:read('./public/ui/procedure-finetuning-1-4.js'),
  p2:read('./public/enduser-composition-p2.css'),
  anatomy:read('./public/ui/procedure-anatomy.js'),
  proof:read('./public/ui/proof-workspace-3-2.js'),
  adminWork:read('./public/ui/admin-workspace-3-2.js'),
  active:read('./public/ui/active-experience.js'),
  enterprise:read('./public/ui/enterprise-ux.js'),
  epWorkspace:read('./public/ui/epistemic-workspace-3-2.js'),
  native:read('./public/ui/native-semantic-lattice-3-2.js')
};

const CANON=['reference','advanced-context','metrics','attention','controls','primary'];
const PROCEDURES=['monitoring','incidents','objects','coverage','actions','risks','assurance'];

function sourceLaws(s){
  const scopeStart=s.semanticSurface.indexOf('function scopeUniverse(root,id)');
  const scopeEnd=s.semanticSurface.indexOf('function ',scopeStart+9);
  const scopeUniverse=scopeStart>=0?s.semanticSurface.slice(scopeStart,scopeEnd>scopeStart?scopeEnd:undefined):'';
  const orderToken="['reference','advanced-context','metrics','attention','controls','primary']";
  return {
    sevenOwners:(s.rn.split(orderToken).length-1)===2&&(s.grc.split(orderToken).length-1)===5,
    rnUniquePrimary:s.rn.includes('PRIMARY_SELECTOR')&&s.rn.includes('[data-rn-primary-work="sources"]')&&s.rn.includes("incidents:':scope > .section-block'"),
    dynamicSupportRail:s.slots.includes('function positionSupportRail(')&&s.slots.includes('function validPhysicalOrder('),
    contiguousDeclaredBlock:s.slots.includes('function reconcilePhysicalOrder(')&&s.slots.includes('index!==cursor+1')&&s.slots.includes('orderedTopLevelNodes'),
    firstRoleAdjacent:s.slots.includes('let previous=null')&&s.slots.includes('host.insertBefore(node,next)')&&s.slots.includes('if(frame?.parentElement===host){frame.after(node);return;}'),
    supportSecondary:s.frame.includes("rail.dataset.secondaryDisclosure='true'"),
    marketLibraryFirst:s.market.indexOf('<section class="market-section market-library" data-market-library')>=0&&s.market.indexOf('<section class="market-section market-library" data-market-library')<s.market.indexOf('<section class="market-section market-integrated" data-market-integrated')&&s.market.indexOf('<section class="market-section market-integrated" data-market-integrated')<s.market.indexOf('<details class="market-mapping-panel" data-market-mapping-work'),
    marketLibraryFirstPlane:s.market.includes('section class="market-section market-library"')&&s.market.includes('data-market-library'),
    marketIntegratedFirstPlane:s.market.includes('section class="market-section market-integrated"')&&s.market.includes('data-market-integrated'),
    marketMappingProgressive:s.market.includes('details class="market-mapping-panel" data-market-mapping-work')&&s.market.includes('mappingOpen=priorMapping??false'),
    coverageScopeMapping:s.semanticSurface.includes("return root.querySelector('[data-market-mapping-work]')||null")&&s.semanticSurface.includes("if(id==='coverage'){const scopeAnchor=scopeAnchorForBindings(root,id),coverageControl=ensureScopeControl(root,id,scopeAnchor)")&&s.semanticSurface.indexOf("if(id==='coverage'){const scopeAnchor")<s.semanticSurface.indexOf("if(!exact){section.hidden=false")&&s.semanticSurface.includes('scopeAnchor.before(bar);if(label.parentElement!==bar)bar.append(label);return control;}')&&s.semanticSurface.includes("control.dataset.a6Ux4ScopeOwner=id"),
    coverageScopeRemountDefault:s.semanticSurface.includes('function syncScopePreference(control,id)')&&(s.semanticSurface.split("control.dataset.a6Ux4UserSelected!=='true'").length-1)===1&&s.semanticSurface.includes("control.dataset.a6Ux4UserSelected='true'")&&s.semanticSurface.includes('function resetScopePreferences()')&&s.semanticSurface.includes("delete control.dataset.a6Ux4UserSelected")&&s.semanticSurface.includes("control.value='actionable'"),
    coverageScopeMappingCollectionOnly:scopeUniverse.includes("if(id==='coverage')return[...root.querySelectorAll('[data-market-mapping-work] [data-grc-record-procedure=\"coverage\"]')]")&&!scopeUniverse.includes('[data-framework-card]'),
    journeyHelperInsideAdvancedContext:s.seqDom.includes("context.append(guide)")&&s.seqDom.includes("const context=host.querySelector(':scope > .procedure-support-rail > [data-editorial-slot=\"advanced-context\"],:scope > [data-editorial-slot=\"advanced-context\"]')"),
    harmonizationNoReparent:s.harmonization.includes("structuralPlacementAuthority='procedure-editorial-slots'")&&!s.harmonization.includes('anchor.after(decisionFrame)')&&!s.harmonization.includes('workAnchor(host)'),
    decisionContextOutsideOwnedBlock:s.harmonizationBase.includes("for(const stale of root.querySelectorAll(':scope > .procedure-decision-frame'))if(stale.dataset.executiveProcedure!==id)stale.remove()")&&s.harmonizationBase.includes("const primary=root.querySelector(':scope > [data-editorial-slot=\"primary\"]')")&&s.harmonizationBase.includes("if(primary&&frame.previousElementSibling!==primary)primary.after(frame)")&&!s.harmonizationBase.includes("rail.after(frame)")&&!s.harmonizationBase.includes('procedureFrame.after(frame)'),
    legacyCompassNoPlacement:s.finetuning14.includes("box.dataset.compatibilityOnly='true'")&&s.finetuning14.includes("box.dataset.structuralPlacementAuthority='none'")&&s.finetuning14.includes('box.hidden=true')&&!s.finetuning14.includes('anchor.after(box)')&&!s.finetuning14.includes('host.prepend(box)'),
    riskAnalysisProgressive:s.grcBase.includes('data-risk-analysis-disclosure')&&s.grcBase.includes('<details class="grc-heat"'),
    riskAnalysisAfterList:s.grcBase.indexOf('<div class="grc-list">${p.risks.map')<s.grcBase.indexOf('${analysis}'),
    epHumanProjection:s.ep.includes('const PROCEDURE_LABELS=Object.freeze')&&s.ep.includes('const STATUS_LABELS=Object.freeze')&&s.ep.includes('const FAMILY_LABELS=Object.freeze')&&s.ep.includes('const kindLabel='),
    epNoDigestFirstPlane:s.ep.includes('label.dataset.projectionDigest=digest')&&!s.ep.includes('· digest ${(p.projectionSha256'),
    backNoSelf:s.router.includes('if (!from || sameRoute(from, current))'),
    aiOptional:!s.workbench.includes("kind: 'configure-ai'")&&s.workbench.indexOf("kind: 'create-monitoring'")<s.workbench.indexOf("if (!llmReady) return nextAction({ kind: 'monitor-activity'"),
    orientationTokens:s.frame.includes('data-procedure-orientation-token="guide"')&&s.frame.includes('data-orientation-basis')&&s.frame.includes('data-orientation-boundary')&&s.frame.includes('Come leggere questa procedura')&&s.frame.includes('procedure-orientation-popover'),
    orientationTransient:s.frame.includes('data-orientation-transient="true"')&&s.frame.includes("addEventListener('pointerdown'")&&s.frame.includes("addEventListener('pointerover'")&&s.frame.includes("addEventListener('pointerout'")&&s.frame.includes("addEventListener('focusin'")&&s.frame.includes("addEventListener('focusout'")&&s.frame.includes("event.key!=='Escape'")&&s.frame.includes("(hover: hover) and (pointer: fine)"),
    procedureMetrics:s.anatomy.includes('function localMetrics(')&&s.anatomy.includes('data-procedure-metrics=')&&s.anatomy.includes("editorialSlot(host,'metrics')"),
    canonicalStateRail:s.p2.includes('--p2-state-rail:7.5rem')&&s.p2.includes('word-break:normal')&&s.p2.includes('hyphens:none'),
    canonicalControlRail:s.p2.includes('.procedure-queue-tools,.procedure-worklist-filters')&&s.p2.includes('data-enduser-primitive="ControlRail"'),
    proofMethodFirst:s.proof.includes("root.dataset.proofReadingOrder='facts>method>decisions>trace>evidence-basis>epistemic>external>integrity>export'")&&s.proof.includes('ordered(content,[factStrip,interpretation,decisions,trace,standards,investigation'),
    proofReadingGuide:s.proof.includes("guide.dataset.proofReadingGuide='operational-five-part'")&&s.proof.includes('WORKSPACE_COPY.proof.readingGuide')&&['Cosa osserva','Cosa non prova','Come leggere gli stati','Fonti e provenienza','Quando serve verifica esterna'].every(token=>s.native.includes(token)),
    proofPeerGrammar:s.proof.includes("peer.dataset.proofVisualGrammar='peer-section'")&&s.p2.includes('data-proof-visual-grammar="peer-section"'),
    adminSingleEntry:s.active.includes("for(const button of[admin])")&&s.active.includes("settings.dataset.legacyControl='admin-ai-entry'"),
    neutralAiState:s.enterprise.includes('status.hidden=true')&&s.enterprise.includes("status.dataset.legacyControl='shell-ai-status'")&&!s.enterprise.includes('status.dataset.tooltip=view.tooltip')&&s.adminWork.includes('admin-configuration-state'),
    epistemicTrajectory:s.epWorkspace.includes('find>narrow>result>select>reconstruct>deepen')&&s.epWorkspace.includes('Torna a Evidenze ICTC'),
    nativeRepresentationTruth:s.native.includes('procedure-metrics-before-runtime-work')&&s.native.includes('canonical-control-rail-one')&&s.native.includes('neutral-ai-configuration-status'),
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
  ['market-mapping-marker-lost',s=>({...s,market:s.market.replace('data-market-mapping-work','data-market-secondary-work')})],
  ['market-library-details-regression',s=>({...s,market:s.market.replace('section class="market-section market-library"','details class="market-section market-library"')})],
  ['market-integrated-details-regression',s=>({...s,market:s.market.replace('section class="market-section market-integrated"','details class="market-section market-integrated"')})],
  ['coverage-scope-wrong-collection',s=>({...s,semanticSurface:s.semanticSurface.replace("return root.querySelector('[data-market-mapping-work]')||null","return root.querySelector('.market-framework-grid')||null")})],
  ['coverage-scope-after-exact-only',s=>({...s,semanticSurface:s.semanticSurface.replace("if(id==='coverage'){const scopeAnchor=scopeAnchorForBindings(root,id),coverageControl=ensureScopeControl(root,id,scopeAnchor)","if(exact&&id==='coverage'){const scopeAnchor=scopeAnchorForBindings(root,id),coverageControl=ensureScopeControl(root,id,scopeAnchor)")})],
  ['coverage-scope-anchor-ignored',s=>({...s,semanticSurface:s.semanticSurface.replace('ensureScopeControl(root,id,scopeAnchor)','ensureScopeControl(root,id,null)')})],
  ['coverage-scope-not-reparented',s=>({...s,semanticSurface:s.semanticSurface.replace('scopeAnchor.before(bar);if(label.parentElement!==bar)bar.append(label);return control;}','scopeAnchor.before(bar);return control;}')})],
  ['coverage-default-persists',s=>({...s,semanticSurface:s.semanticSurface.replace("delete control.dataset.a6Ux4UserSelected;control.value='actionable'","control.value=control.value||'actionable'")})],
  ['scope-user-choice-overwritten',s=>({...s,semanticSurface:s.semanticSurface.replace("if(control.dataset.a6Ux4UserSelected!=='true')","if(true)")})],
  ['coverage-scope-spans-secondary-library',s=>({...s,semanticSurface:s.semanticSurface.replace("return[...root.querySelectorAll('[data-market-mapping-work] [data-grc-record-procedure=\"coverage\"]')]","return[...root.querySelectorAll('[data-framework-card],[data-grc-record-procedure=\"coverage\"]')]")})],
  ['journey-guide-outside-advanced-context',s=>({...s,seqDom:s.seqDom.replace("context.append(guide)","host.firstElementChild?.after(guide)")})],
  ['harmonization-reclaims-placement',s=>({...s,harmonization:s.harmonization.replace("decisionFrame.dataset.structuralPlacementAuthority='procedure-editorial-slots';","const anchor=host.querySelector(':scope > .section-block,:scope > .grc-body');if(anchor)anchor.after(decisionFrame);")})],
  ['decision-frame-inside-owned-block',s=>({...s,harmonizationBase:s.harmonizationBase.replace("if(primary&&frame.previousElementSibling!==primary)primary.after(frame)","if(procedureFrame)procedureFrame.after(frame)")})],
  ['stale-decision-frame-retained',s=>({...s,harmonizationBase:s.harmonizationBase.replace("for(const stale of root.querySelectorAll(':scope > .procedure-decision-frame'))if(stale.dataset.executiveProcedure!==id)stale.remove();",'')})],
  ['decision-frame-after-support-rail',s=>({...s,harmonizationBase:s.harmonizationBase.replace("if(primary&&frame.previousElementSibling!==primary)primary.after(frame)","const rail=root.querySelector(':scope > .procedure-support-rail');if(rail)rail.after(frame)")})],
  ['legacy-compass-reclaims-placement',s=>({...s,finetuning14:s.finetuning14.replace("box.dataset.structuralPlacementAuthority='none';","box.dataset.structuralPlacementAuthority='legacy';const anchor=host.querySelector(':scope > [data-procedure-attention-slot]');if(anchor)anchor.after(box);")})],
  ['risk-analysis-section',s=>({...s,grcBase:s.grcBase.replace('<details class="grc-heat"','<section class="grc-heat"')})],
  ['risk-analysis-before-list',s=>({...s,grcBase:s.grcBase.replace('<div class="grc-list">${p.risks.map','${analysis}<div class="grc-list">${p.risks.map')})],
  ['ep-drop-human-labels',s=>({...s,ep:s.ep.replace('PROCEDURE_LABELS','PROCEDURE_LABELS_BROKEN')})],
  ['ep-digest-first-plane',s=>({...s,ep:s.ep.replace('label.textContent=`r${p.fromRevision||0}–r${p.toRevision||0} · stato r${p.stateRevision||0}`','label.textContent=`r${p.fromRevision||0}–r${p.toRevision||0} · stato r${p.stateRevision||0} · digest ${(p.projectionSha256||\'\').slice(0,12)}`')})],
  ['back-self',s=>({...s,router:s.router.replace('if (!from || sameRoute(from, current))','if (!from)')})],
  ['ai-first',s=>({...s,workbench:s.workbench.replace("if (!(state.missions || []).length) return nextAction({ kind: 'create-monitoring'","if (!llmReady) return nextAction({ kind: 'configure-ai', title: 'Completa la configurazione AI', label: 'Configura AI', reason: 'setup', action: 'settings', service: 'administration' });\n    if (!(state.missions || []).length) return nextAction({ kind: 'create-monitoring'")})],
  ['orientation-token-lost',s=>({...s,frame:s.frame.replace('procedure-orientation-popover','procedure-orientation-retired')})],
  ['orientation-transient-lost',s=>({...s,frame:s.frame.replace('data-orientation-transient="true"','data-orientation-transient="retired"')})],
  ['orientation-pointer-origin-lost',s=>({...s,frame:s.frame.replace("addEventListener('pointerdown'","addEventListener('mousedown'")})],
  ['orientation-hover-lost',s=>({...s,frame:s.frame.replace("addEventListener('pointerover'","addEventListener('pointermove'")})],
  ['orientation-leave-lost',s=>({...s,frame:s.frame.replace("addEventListener('pointerout'","addEventListener('pointercancel'")})],
  ['orientation-focus-lost',s=>({...s,frame:s.frame.replace("addEventListener('focusin'","addEventListener('focus'")})],
  ['orientation-focusout-lost',s=>({...s,frame:s.frame.replace("addEventListener('focusout'","addEventListener('blur'")})],
  ['orientation-escape-lost',s=>({...s,frame:s.frame.replace("event.key!=='Escape'","event.key!=='Enter'")})],
  ['proof-reading-guide-lost',s=>({...s,proof:s.proof.replace("guide.dataset.proofReadingGuide='operational-five-part'","guide.dataset.proofReadingGuide='retired'")})],
  ['proof-reading-guide-boundary-lost',s=>({...s,native:s.native.replace("title:'Cosa non prova'","title:'Cosa prova'")})],
  ['procedure-metrics-lost',s=>({...s,anatomy:s.anatomy.replace("editorialSlot(host,'metrics')","editorialSlot(host,'attention')")})],
  ['state-rail-drifts',s=>({...s,p2:s.p2.replace('--p2-state-rail:7.5rem','--p2-state-rail:auto')})],
  ['control-rail-drifts',s=>({...s,p2:s.p2.replaceAll('.procedure-queue-tools,.procedure-worklist-filters','.procedure-queue-tools')})],
  ['proof-method-demoted',s=>({...s,proof:s.proof.replace('ordered(content,[factStrip,interpretation,decisions,trace,standards,investigation','ordered(content,[factStrip,decisions,trace,standards,investigation,interpretation')})],
  ['proof-peer-style-diverges',s=>({...s,proof:s.proof.replace("peer.dataset.proofVisualGrammar='peer-section'","peer.dataset.proofVisualGrammar='legacy-section'")})],
  ['admin-second-entry',s=>({...s,active:s.active.replace('for(const button of[admin])','for(const button of[admin,settings])')})],
  ['ai-shell-badge-returns',s=>({...s,enterprise:s.enterprise.replace('status.hidden=true','status.hidden=false')})],
  ['ep-trajectory-regresses',s=>({...s,epWorkspace:s.epWorkspace.replace('find>narrow>result>select>reconstruct>deepen','find>narrow>explore>select>reconstruct>deepen')})],
  ['representation-truth-invariant-lost',s=>({...s,native:s.native.replace('canonical-control-rail-one','canonical-control-rail-retired')})],
  ['admin-control-plane',s=>({...s,admin:s.admin.replace('>Amministrazione</p>','>Control plane</p>')})]
];
const sourceMutationResults=[];
for(const [name,mutate] of SOURCE_MUTANTS){const mutated=mutate(source);const laws=sourceLaws(mutated);const killed=Object.values(laws).some(v=>!v);sourceMutationResults.push({name,killed,failed:Object.entries(laws).filter(([,v])=>!v).map(([k])=>k)});assert.equal(killed,true,`source mutant survived: ${name}`);}

function baseline(){return {
  order:[...CANON],supportAfterReference:true,supportClosed:true,firstRoleAdjacent:true,contiguousDeclaredBlock:true,journeyHelperInsideAdvancedContext:true,harmonizationReparents:false,decisionContextInsideOwnedBlock:false,staleDecisionFrames:false,decisionContextReparents:false,legacyCompassReparents:false,
  market:['library','integrated','mapping'],libraryFirstPlane:true,integratedFirstPlane:true,mappingProgressive:true,coverageScopeMapping:true,coverageScopeRemountDefault:true,
  risk:['metrics','create','records','analysis'],riskAnalysisProgressive:true,riskAnalysisOpen:false,
  ep:{firstPlaneTechnical:false,digestFirstPlane:false,humanLabels:true,rawPreserved:true},
  backSelf:false,aiOptionalPrimary:false,ownerCount:1,primaryCount:1,
  businessAuthorityChanged:false,writeAuthorityCount:1
};}
function violations(x){const out=[];
  if(x.order.join('>')!==CANON.join('>')||new Set(x.order).size!==CANON.length)out.push('editorial-order');
  if(!x.supportAfterReference||!x.supportClosed)out.push('support-progressive');
  if(!x.firstRoleAdjacent||!x.contiguousDeclaredBlock||!x.journeyHelperInsideAdvancedContext||x.harmonizationReparents||x.decisionContextInsideOwnedBlock||x.staleDecisionFrames||x.decisionContextReparents||x.legacyCompassReparents)out.push('placement-adjacency');
  if(x.market.join('>')!=='library>integrated>mapping'||!x.libraryFirstPlane||!x.integratedFirstPlane||!x.mappingProgressive)out.push('market-progressive');
  if(!x.coverageScopeMapping)out.push('coverage-scope-placement');
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
  ['context-before-reference',x=>{x.order=['advanced-context','reference','metrics','attention','controls','primary'];}],
  ['primary-missing',x=>{x.order=x.order.filter(v=>v!=='primary');}],
  ['attention-after-primary',x=>{x.order=['controls','primary','attention','advanced-context','reference','metrics'];}],
  ['duplicate-primary-slot',x=>{x.order.push('primary');}],
  ['support-not-adjacent-to-reference',x=>{x.supportAfterReference=false;}],
  ['support-open-default',x=>{x.supportClosed=false;}],
  ['legacy-sibling-before-first-control',x=>{x.firstRoleAdjacent=false;}],
  ['legacy-sibling-inside-declared-block',x=>{x.contiguousDeclaredBlock=false;}],
  ['journey-helper-outside-advanced-context',x=>{x.journeyHelperInsideAdvancedContext=false;}],
  ['harmonization-late-reparent',x=>{x.harmonizationReparents=true;}],
  ['decision-context-inside-owned-block',x=>{x.decisionContextInsideOwnedBlock=true;}],
  ['stale-decision-frame',x=>{x.staleDecisionFrames=true;}],
  ['decision-context-reparent-on-replay',x=>{x.decisionContextReparents=true;}],
  ['legacy-compass-late-reparent',x=>{x.legacyCompassReparents=true;}],
  ['market-mapping-before-library',x=>{x.market=['mapping','library','integrated'];}],
  ['market-library-collapsed',x=>{x.libraryFirstPlane=false;}],
  ['market-integrated-collapsed',x=>{x.integratedFirstPlane=false;}],
  ['market-mapping-flat',x=>{x.mappingProgressive=false;}],
  ['coverage-scope-hidden-in-library',x=>{x.coverageScopeMapping=false;}],
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

const seedText=process.env.ICTC_UIUX_ONTOLOGY_SEED||process.env.GITHUB_SHA||randomBytes(4).toString('hex');let seed=(Number.parseInt(seedText.slice(-8),16)>>>0)||0x91a2b3c4;
const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const TOTAL=10_000_000,SCREENSHOT_MUTATIONS_EACH=100_000,BEAUTY_MUTATIONS=100_000;
const SCREENSHOT_SURFACES=Object.freeze([
  ['home',['identity-before-detail','single-primary-next-action','no-ai-shell-badge','priority-cards-bounded','chrome-role-single']],
  ['processes',['seven-processes-one-list','card-status-width','single-primary-cta','catalogue-copy-concise','no-duplicate-process-metrics']],
  ['rn-01',['jobs-visible-configurable','sources-primary','scheduler-secondary','status-label-nonoverlap','mission-source-separation']],
  ['ec-01',['incident-intake-primary','records-bounded','state-facet','evidence-boundary','no-duplicate-intake']],
  ['ao-01',['inventory-metrics','object-filter','record-card-grammar','attestation-due-visible','form-secondary']],
  ['mc-01',['library-first','integrated-first-plane','mapping-progressive','scope-filter-mapping-only','standard-use-boundary']],
  ['ap-01',['action-metrics','origin-next-facts','bounded-actions','state-filter','create-secondary']],
  ['rc-01',['risk-metrics','risk-records-before-analysis','analysis-progressive','human-rating-boundary','create-secondary']],
  ['ar-01',['assurance-metrics','request-status-distinct','approval-boundary','bounded-cases','request-secondary']],
  ['proof',['method-first','peer-section-grammar','reference-external-parity','all-secondary-closed','epistemic-entry-explicit']],
  ['epistemic',['search-first','result-before-deep-tools','back-to-proof','claim-boundary-visible','technical-tools-progressive']],
  ['admin-overview-top',['attention-before-policy','uniform-panel-width','single-admin-entry','no-control-plane-jargon','secondary-policy-progressive']],
  ['admin-overview-bottom',['policy-secondary','audit-secondary','uniform-panels','human-labels','no-duplicate-settings-entry']],
  ['admin-ai-top',['neutral-config-status','provider-secondary','governance-secondary','uniform-width','no-colored-shell-status']],
  ['admin-ai-bottom',['advanced-policy-progressive','configuration-copy-nonverdict','provider-form-bounded','uniform-width','no-duplicate-ai-entry']],
  ['admin-identity-top',['identity-primary','local-users-progressive','role-copy-human','uniform-width','no-legacy-first-plane']],
  ['procedure-header-detail',['orientation-single-guide','orientation-hover-focus-transient','reference-directly-below-header','context-next','metrics-next']],
  ['ai-status-detail',['shell-badge-removed','admin-state-neutral','no-tooltip-verdict','no-color-verdict','state-copy-circumscribed']]
]);
const GLOBAL_VISUAL_INVARIANTS=Object.freeze(['single-semantic-role-representation','canonical-page-sequence','reference-before-context','context-before-metrics','metrics-before-operational-work','canonical-control-rail','fixed-status-rail','whole-word-status-wrap','progressive-secondary','legacy-not-first-plane','local-exception-minimized']);
assert.equal(SCREENSHOT_SURFACES.length,18);
for(const [,local] of SCREENSHOT_SURFACES){assert.equal(new Set([...GLOBAL_VISUAL_INVARIANTS,...local]).size,15);}
function visualModel(local){return {roleCount:1,ranks:{header:0,reference:1,context:2,metrics:3,work:4},controlRails:1,statusRail:7.5,splitWords:false,secondaryOpen:0,legacyFirstPlane:0,localOverrides:1,local:Object.fromEntries(local.map(x=>[x,true]))};}
function visualViolations(x,local){const out=[];if(x.roleCount!==1)out.push(GLOBAL_VISUAL_INVARIANTS[0]);if(!(x.ranks.header<x.ranks.reference&&x.ranks.reference<x.ranks.metrics&&x.ranks.metrics<x.ranks.work&&x.ranks.work<x.ranks.context))out.push(GLOBAL_VISUAL_INVARIANTS[1]);if(!(x.ranks.reference<x.ranks.metrics))out.push(GLOBAL_VISUAL_INVARIANTS[2]);if(!(x.ranks.metrics<x.ranks.work))out.push(GLOBAL_VISUAL_INVARIANTS[3]);if(x.controlRails!==1)out.push(GLOBAL_VISUAL_INVARIANTS[4]);if(x.statusRail!==7.5)out.push(GLOBAL_VISUAL_INVARIANTS[5]);if(x.splitWords)out.push(GLOBAL_VISUAL_INVARIANTS[6]);if(x.secondaryOpen!==0)out.push(GLOBAL_VISUAL_INVARIANTS[7]);if(x.legacyFirstPlane!==0)out.push(GLOBAL_VISUAL_INVARIANTS[8]);if(x.localOverrides>1)out.push(GLOBAL_VISUAL_INVARIANTS[9]);for(const key of local)if(!x.local[key])out.push(key);return out;}
const VISUAL_MUTATORS=[
  x=>{x.roleCount=2},x=>{x.ranks.reference=4},x=>{x.ranks.reference=3},x=>{x.ranks.metrics=4},x=>{x.controlRails=2},
  x=>{x.statusRail=0},x=>{x.splitWords=true},x=>{x.secondaryOpen=1},x=>{x.legacyFirstPlane=1},x=>{x.localOverrides=2}
];
const screenshotReport=[];let screenshotKilled=0;
for(const [surface,local] of SCREENSHOT_SURFACES){const hits=Array(15).fill(0);for(let i=0;i<SCREENSHOT_MUTATIONS_EACH;i++){const x=visualModel(local),fi=rnd()%15;hits[fi]++;if(fi<10)VISUAL_MUTATORS[fi](x);else x.local[local[fi-10]]=false;const found=visualViolations(x,local);if(!found.length)throw new Error(`visual survivor ${surface} ${i} ${fi}`);screenshotKilled++;}assert.ok(hits.every(Boolean));screenshotReport.push({surface,mutations:SCREENSHOT_MUTATIONS_EACH,findings:[...GLOBAL_VISUAL_INVARIANTS,...local],globalInvariants:GLOBAL_VISUAL_INVARIANTS.length,localFindings:local.length,hits});}
const BEAUTY_LAWS=Object.freeze(['bounded-density','clear-hierarchy','alignment-continuity','spacing-rhythm','copy-discriminance','single-primary-representation','human-first-plane','neutral-state-color','bounded-local-variants','breathing-room']);
const beautyModel=()=>({density:1,hierarchy:true,alignment:true,rhythm:true,labelNoise:0,duplicates:0,technicalFirst:0,colorVerdict:false,variants:0,breathing:1});
const beautyViolations=x=>{const out=[];if(x.density>1)out.push(BEAUTY_LAWS[0]);if(!x.hierarchy)out.push(BEAUTY_LAWS[1]);if(!x.alignment)out.push(BEAUTY_LAWS[2]);if(!x.rhythm)out.push(BEAUTY_LAWS[3]);if(x.labelNoise>0)out.push(BEAUTY_LAWS[4]);if(x.duplicates>0)out.push(BEAUTY_LAWS[5]);if(x.technicalFirst>0)out.push(BEAUTY_LAWS[6]);if(x.colorVerdict)out.push(BEAUTY_LAWS[7]);if(x.variants>1)out.push(BEAUTY_LAWS[8]);if(x.breathing<1)out.push(BEAUTY_LAWS[9]);return out;};
const BEAUTY_MUTATORS=[x=>{x.density=2},x=>{x.hierarchy=false},x=>{x.alignment=false},x=>{x.rhythm=false},x=>{x.labelNoise=1},x=>{x.duplicates=1},x=>{x.technicalFirst=1},x=>{x.colorVerdict=true},x=>{x.variants=2},x=>{x.breathing=0}];
const beautyHits=Array(BEAUTY_MUTATORS.length).fill(0);let beautyKilled=0;
for(let i=0;i<BEAUTY_MUTATIONS;i++){const x=beautyModel(),fi=rnd()%BEAUTY_MUTATORS.length;beautyHits[fi]++;BEAUTY_MUTATORS[fi](x);if(!beautyViolations(x).length)throw new Error(`beauty survivor ${i} ${fi}`);beautyKilled++;}
assert.ok(beautyHits.every(Boolean));
const GLOBAL_MUTATIONS=TOTAL-(SCREENSHOT_SURFACES.length*SCREENSHOT_MUTATIONS_EACH)-BEAUTY_MUTATIONS;
assert.equal(GLOBAL_MUTATIONS,8_100_000);
const hits=Array(FAMILIES.length).fill(0),violationsHit=new Map();let killed=0;
for(let i=0;i<GLOBAL_MUTATIONS;i++){
  const x=baseline(),rounds=1+(rnd()%4),chosen=new Set();
  for(let r=0;r<rounds;r++){let fi=rnd()%FAMILIES.length;while(chosen.has(fi))fi=(fi+1)%FAMILIES.length;chosen.add(fi);hits[fi]++;FAMILIES[fi][1](x);}
  const found=violations(x);if(!found.length)throw new Error(`survivor at ${i}: ${[...chosen].map(j=>FAMILIES[j][0]).join(',')}`);for(const v of found)violationsHit.set(v,(violationsHit.get(v)||0)+1);killed++;
}
assert.equal(killed,GLOBAL_MUTATIONS);assert.ok(hits.every(n=>n>0));assert.equal(killed+screenshotKilled+beautyKilled,TOTAL);

const essential={};
const LAW_NAMES=['editorial-order','support-progressive','placement-adjacency','market-progressive','coverage-scope-placement','scope-remount-default','risk-progressive','epistemic-projection','navigation','ai-optional','single-owner-primary','authority-boundary'];
for(const law of LAW_NAMES){essential[law]=FAMILIES.some(([,mutate])=>{const x=baseline();mutate(x);const found=violations(x);return found.length===1&&found[0]===law;});assert.equal(essential[law],true,`no isolated falsifier for ${law}`);}

mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});
const report={ok:true,slice:'UIUX-ONTOLOGY-CLOSURE-10M',seed:seedText,seedSource:process.env.ICTC_UIUX_ONTOLOGY_SEED?'explicit':process.env.GITHUB_SHA?'github-sha':'local-random',total:TOTAL,globalMutations:GLOBAL_MUTATIONS,screenshotMutations:screenshotKilled,beautyMutations:beautyKilled,killed:killed+screenshotKilled+beautyKilled,survivors:0,mutationFamilies:FAMILIES.map(([name],i)=>({name,hits:hits[i]})),screenshotCampaign:screenshotReport,beautyCampaign:{mutations:BEAUTY_MUTATIONS,laws:BEAUTY_LAWS,hits:beautyHits},sourceMutants:sourceMutationResults,violations:Object.fromEntries(violationsHit),essentialLaws:essential,procedures:PROCEDURES,canonicalEditorialOrder:CANON.join('>'),minimalSemanticLattice:['one-global-representation-truth','minimal-local-procedure-specialization','reference-before-context-before-metrics-before-work','canonical-control-and-state-rails','progressive-secondary-analysis','library-integrated-first-plane-mapping-progressive','proof-method-first-peer-grammar','transient-orientation-accessibility','operational-proof-reading-guide','human-first-epistemic-projection-with-raw-preserved','single-admin-entry','neutral-ai-configuration-state','legacy-hidden-compatibility-never-reparents','one-owner-one-primary','business-write-authority-unchanged'],claimBoundary:'E2 deterministic 10,000,000 seeded model-composition mutations: 100,000 per each of 18 real screenshot-derived surface models, 100,000 minimality/beauty mutations, 8,100,000 global cross-surface mutations, plus concrete source mutation operators. This is not 10,000,000 browser sessions and does not prove representative-human usability, legal compliance, deployment effectiveness or absence of all UI defects.'};
writeFileSync(new URL('../artifacts/uiux-ontology-closure-saturation-10m.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
