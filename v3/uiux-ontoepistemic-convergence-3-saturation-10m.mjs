import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {UIUX_MINING_V2_COVERAGE,validateUiuxMiningV2Coverage} from './uiux-converge-0-model.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const source={footer:read('./public/a6-ux1-fixed-safe-footer.css'),stable:read('./public/ui/stable-shell.js'),model:read('./runtime/model.mjs'),server:read('./server.mjs'),slots:read('./public/ui/procedure-editorial-slots.js'),frame:read('./public/ui/procedure-frame.js'),worklist:read('./public/ui/procedure-worklist.js'),anatomy:read('./public/ui/procedure-anatomy.js'),presentation:read('./public/ui/procedure-ui-ux-1-6.js'),common:read('./public/ui/common.js'),actions:read('./public/ui/actions.js'),grcbase:read('./public/ui/grc-workspace-base.js'),standard:read('./public/ui/standard-browser.js'),proof:read('./public/ui/proof-workspace-3-2.js'),proofSurface:read('./public/ui/proof-surface.js'),ep:read('./public/ui/epistemic-workspace-3-2.js'),admin:read('./public/ui/admin-workspace-3-2.js'),p2:read('./public/enduser-composition-p2.css'),handoff:read('./grc-coverage-handoff-3-2-saturation.mjs'),browserSupport:read('./browser_test_support.py'),browserUx3:read('./browser-s4-a6-ux3-operational-surface.py'),browserUx4:read('./browser-s4-a6-ux4-semantic-surface.py'),browserA5:read('./browser-s4-a5-final-dom-a11y.py'),browserOnto:read('./browser-onto-compliance-v1.py'),browserFinetune:read('./browser-procedure-finetuning-1-4-base.py'),browserRnTruth:read('./browser-surface-truth-rn-controls-2-5.py'),browserSurfaceTruth:read('./browser-surface-truth-2-5.py')};
assert.equal(validateUiuxMiningV2Coverage().ok,true);assert.equal(UIUX_MINING_V2_COVERAGE.issueCount,352);
const sourceLaws=Object.freeze({
 M1:source.footer.includes('position:fixed!important')&&source.footer.includes('padding-bottom:var(--a6-ux1-footer-reserve)!important')&&source.footer.includes('env(safe-area-inset-bottom,0px)'),
 M2:source.stable.includes("api('/api/profile/onboarding'")&&source.stable.includes("onboardingState(){return state.data?.experience?.onboarding||null")&&source.stable.includes('if(!value)return')&&source.server.includes("pathname==='/api/profile/onboarding'")&&source.model.includes("authority:'user-record'")&&source.model.includes("authority:'synthetic-demo-fixture'"),
 M3:source.slots.includes("SUPPORT_NAMES=new Set(['reference','advanced-context'])")&&source.frame.includes('Perimetro e criteri')&&source.frame.includes('Perché esiste')&&source.frame.includes('Cosa non conclude'),
 M4:source.worklist.includes("count.textContent=`${filtered.length}/${source.length}`")&&source.worklist.includes('data-worklist-clear-inline')&&source.anatomy.includes('overlapping-non-additive')&&source.anatomy.includes('non sommabili'),
 M5:source.presentation.includes("uiuxActionHierarchy='record-local'")&&source.p2.includes('.procedure-record-facts')&&source.p2.includes('.procedure-action-rail'),
 M6:source.common.includes('dialogInvokers')&&source.common.includes("dialog.dataset.dirty='true'")&&source.common.includes('invoker.focus')&&source.common.includes('firstDialogFocus'),
 M7:source.presentation.includes('monitorManagerDialog')&&source.presentation.includes('Gestisci monitoraggi')&&source.presentation.includes('data-monitor-manager-id')&&source.presentation.includes('new Map((missions||[]).filter(item=>item?.id).map(item=>[item.id,item]))')&&source.presentation.includes('canonical.length'),
 M8:source.standard.includes('data-standard-depth')&&source.standard.includes('standard-node-provenance')&&source.standard.includes('knowledgePack'),
 M9:[source.proof,source.ep,source.admin].every(x=>x.includes('hideEmptyPresentation'))&&source.proof.includes('node.hidden=bodyEmpty')&&source.proofSurface.includes("reason:'proof-data-rendered'"),
 M10:source.presentation.includes("const readOnly=state.role==='auditor'||state.data?.actor?.role==='auditor'||p.readOnly===true")&&source.presentation.includes("node.remove()")&&source.p2.includes('@media(max-width:719px)'),
 M11:source.common.includes("feedbackKind=error?'error':'status'")&&source.common.includes("setAttribute('aria-live'")&&source.actions.includes('setInteractionBusy(trigger,true)')&&source.grcbase.includes('setInteractionBusy(trigger,true)')
});
assert.deepEqual(Object.entries(sourceLaws).filter(([,ok])=>!ok),[],'production-source baseline does not materialize all 11 mechanisms');
const ciLaws=Object.freeze({
 handoffCurrent:source.handoff.includes('procedure-support-rail')&&!source.handoff.includes('.procedure-decision-frame .composition-process-context'),
 onboardingPrecondition:source.browserSupport.includes('/api/profile/onboarding')&&source.browserSupport.includes('_settle_onboarding_dom'),
 focusPrecondition:source.browserA5.includes("page.set_default_timeout(30000)\n        ensure_onboarded(page,BASE,'admin')\n        page.on('pageerror'")&&source.browserA5.includes("phase('desktop-load')\n        page.goto(BASE + '/', wait_until='networkidle')"),
 supportRailCurrent:source.browserOnto.includes("reference=rail.locator(':scope > [data-editorial-slot=\"reference\"]')")&&source.browserFinetune.includes('procedure-support-rail'),
 proofAsyncRecovery:source.proof.includes('node.hidden=bodyEmpty')&&source.proofSurface.includes("reason:'proof-data-rendered'"),
 legacyOnboardingCoverage:[source.browserRnTruth,source.browserSurfaceTruth].every(x=>x.includes("ensure_onboarded(page,BASE,'admin')")),
 auditorReadinessSeparated:source.browserUx4.includes("PHASE='AP-01-auditor-primary'")&&source.browserUx4.includes("processBoundPrimary':True"),
 rnMonitorOracleCurrent:source.browserFinetune.includes('[data-open-monitor-manager]')&&source.browserFinetune.includes('#monitorManagerDialog')&&source.browserFinetune.includes('[data-a6-registry-count]')&&!source.browserFinetune.includes('data-a6-registry-total')&&!source.browserFinetune.includes('[data-rn-open-scheduler]')
});
assert.deepEqual(Object.entries(ciLaws).filter(([,ok])=>!ok),[],'current CI/browser rails drift from governed UIUX topology');
const base=()=>({
 footerFixed:true,footerReserve:true,safeArea:true,focusReserve:true,footerOwners:1,
 onboardingGate:true,onboardingPersisted:true,onboardingAcceptWrites:1,onboardingReplayReadOnly:true,onboardingHeaderEntry:true,onboardingProgressMonotonic:true,
 supportRails:1,supportBusinessCopy:true,referenceCopies:1,contextProgressive:true,
 universes:1,visible:6,total:9,countReconciled:true,resetReachable:true,noResultsRecovery:true,metricSemantics:'explicit-non-additive',metricOwners:1,
 stateOwners:1,recordPrimaryMax:1,factBudget:4,secondaryProgressive:true,evidencePrimary:false,nestedRecordCards:0,
 modal:true,focusContained:true,focusReturns:true,dirtyGuard:true,dialogBounded:true,dialogPrimaryMax:1,backgroundInert:true,
 monitorManagers:1,inlineMonitorWall:false,jobGranular:true,monitorPrimaryMax:1,monitorSearch:true,
 standardModel:'hierarchical-sections-v1',provenanceProgressive:true,rightsTruth:true,hierarchyBounded:true,sourceDigest:true,standardPrimaryMax:1,
 emptyFirstPlanes:0,technicalFirst:false,proofVerdict:false,epWrites:0,adminEpistemicAuthority:false,specialPlaneOwners:1,
 auditorWrites:0,auditorFailClosed:true,mobileOverflow:false,roleCopyConsistent:true,hiddenFocusableActions:0,targetMin:44,navigationOwners:1,
 errorIdentified:true,statusAnnounced:true,busyVisible:true,duplicateSubmit:false,recoveryReachable:true,freshnessVisible:true,
 businessWriteAuthorities:1,procedures:7,humanAuthority:true,evidenceNotConclusion:true,
 ciHandoffCurrent:true,ciOnboardingPrepared:true,ciFocusPrecondition:true,ciSupportRailCurrent:true,ciProofAsyncRecovery:true,ciLegacyOnboardingCoverage:true,ciAuditorReadinessSeparated:true,ciRnMonitorOracleCurrent:true
});
function fail(s){const f=[];
 if(!s.footerFixed||!s.footerReserve||!s.safeArea||!s.focusReserve||s.footerOwners!==1)f.push('M1');
 if(!s.onboardingGate||!s.onboardingPersisted||s.onboardingAcceptWrites!==1||!s.onboardingReplayReadOnly||!s.onboardingHeaderEntry||!s.onboardingProgressMonotonic)f.push('M2');
 if(s.supportRails!==1||!s.supportBusinessCopy||s.referenceCopies!==1||!s.contextProgressive)f.push('M3');
 if(s.universes!==1||s.visible>s.total||!s.countReconciled||!s.resetReachable||!s.noResultsRecovery||!['single-universe','explicit-non-additive'].includes(s.metricSemantics)||s.metricOwners!==1)f.push('M4');
 if(s.stateOwners!==1||s.recordPrimaryMax>1||s.factBudget>6||!s.secondaryProgressive||s.evidencePrimary||s.nestedRecordCards)f.push('M5');
 if(!s.modal||!s.focusContained||!s.focusReturns||!s.dirtyGuard||!s.dialogBounded||s.dialogPrimaryMax>1||!s.backgroundInert)f.push('M6');
 if(s.monitorManagers!==1||s.inlineMonitorWall||!s.jobGranular||s.monitorPrimaryMax>1||!s.monitorSearch)f.push('M7');
 if(s.standardModel!=='hierarchical-sections-v1'||!s.provenanceProgressive||!s.rightsTruth||!s.hierarchyBounded||!s.sourceDigest||s.standardPrimaryMax>1)f.push('M8');
 if(s.emptyFirstPlanes||s.technicalFirst||s.proofVerdict||s.epWrites||s.adminEpistemicAuthority||s.specialPlaneOwners!==1)f.push('M9');
 if(s.auditorWrites||!s.auditorFailClosed||s.mobileOverflow||!s.roleCopyConsistent||s.hiddenFocusableActions||s.targetMin<44||s.navigationOwners!==1)f.push('M10');
 if(!s.errorIdentified||!s.statusAnnounced||!s.busyVisible||s.duplicateSubmit||!s.recoveryReachable||!s.freshnessVisible)f.push('M11');
 if(!s.ciHandoffCurrent||!s.ciSupportRailCurrent)f.push('M3');
 if(!s.ciOnboardingPrepared||!s.ciFocusPrecondition||!s.ciLegacyOnboardingCoverage)f.push('M2');
 if(!s.ciProofAsyncRecovery)f.push('M9');
 if(!s.ciAuditorReadinessSeparated)f.push('M10');
 if(!s.ciRnMonitorOracleCurrent)f.push('M7');
 if(s.businessWriteAuthorities!==1||s.procedures!==7||!s.humanAuthority||!s.evidenceNotConclusion)f.push('P0');return [...new Set(f)];}
const F=[
 ['footer-static',s=>s.footerFixed=false],['footer-zero-reserve',s=>s.footerReserve=false],['footer-safe-area-lost',s=>s.safeArea=false],['footer-focus-occluded',s=>s.focusReserve=false],['second-footer-owner',s=>s.footerOwners=2],
 ['onboarding-bypass',s=>s.onboardingGate=false],['onboarding-local-only',s=>s.onboardingPersisted=false],['onboarding-repeat-accept',s=>s.onboardingAcceptWrites=2],['onboarding-replay-editable',s=>s.onboardingReplayReadOnly=false],['onboarding-entry-lost',s=>s.onboardingHeaderEntry=false],['onboarding-progress-regresses',s=>s.onboardingProgressMonotonic=false],
 ['split-support-rails',s=>s.supportRails=2],['generic-procedure-help',s=>s.supportBusinessCopy=false],['duplicate-reference-copy',s=>s.referenceCopies=2],['technical-context-first',s=>s.contextProgressive=false],
 ['parallel-count-universe',s=>s.universes=2],['visible-exceeds-total',s=>{s.visible=10;s.total=9}],['count-label-drift',s=>s.countReconciled=false],['reset-missing',s=>s.resetReachable=false],['no-results-dead-end',s=>s.noResultsRecovery=false],['heterogeneous-metric-sum',s=>s.metricSemantics='implicit-additive'],['duplicate-metric-owner',s=>s.metricOwners=2],
 ['duplicate-state-owner',s=>s.stateOwners=2],['record-two-primary',s=>s.recordPrimaryMax=2],['record-fact-wall',s=>s.factBudget=12],['secondary-first-plane',s=>s.secondaryProgressive=false],['evidence-as-primary',s=>s.evidencePrimary=true],['nested-record-card',s=>s.nestedRecordCards=1],
 ['non-modal-dialog',s=>s.modal=false],['dialog-focus-escape',s=>s.focusContained=false],['dialog-focus-return-lost',s=>s.focusReturns=false],['dirty-form-silent-close',s=>s.dirtyGuard=false],['unbounded-dialog-scroll',s=>s.dialogBounded=false],['dialog-two-primary',s=>s.dialogPrimaryMax=2],['modal-background-active',s=>s.backgroundInert=false],
 ['inline-monitor-wall',s=>s.inlineMonitorWall=true],['second-monitor-manager',s=>s.monitorManagers=2],['monitor-job-opaque',s=>s.jobGranular=false],['monitor-two-primary',s=>s.monitorPrimaryMax=2],['monitor-search-lost',s=>s.monitorSearch=false],
 ['flat-standard-document',s=>s.standardModel='flat-nodes'],['provenance-first-plane',s=>s.provenanceProgressive=false],['licensed-text-laundered',s=>s.rightsTruth=false],['hierarchy-cycle-unbounded',s=>s.hierarchyBounded=false],['source-digest-lost',s=>s.sourceDigest=false],['standard-action-wall',s=>s.standardPrimaryMax=3],
 ['empty-special-plane',s=>s.emptyFirstPlanes=1],['technical-special-first',s=>s.technicalFirst=true],['proof-as-verdict',s=>s.proofVerdict=true],['ep-write-authority',s=>s.epWrites=1],['admin-epistemic-authority',s=>s.adminEpistemicAuthority=true],['duplicate-special-plane-owner',s=>s.specialPlaneOwners=2],
 ['auditor-write-visible',s=>s.auditorWrites=1],['auditor-role-projection-disagreement',s=>s.auditorFailClosed=false],['mobile-horizontal-overflow',s=>s.mobileOverflow=true],['role-copy-mismatch',s=>s.roleCopyConsistent=false],['hidden-write-focusable',s=>s.hiddenFocusableActions=1],['touch-target-small',s=>s.targetMin=32],['second-navigation-owner',s=>s.navigationOwners=2],
 ['silent-error',s=>s.errorIdentified=false],['silent-success',s=>s.statusAnnounced=false],['long-write-no-busy',s=>s.busyVisible=false],['duplicate-submit',s=>s.duplicateSubmit=true],['failure-no-recovery',s=>s.recoveryReachable=false],['stale-state-unmarked',s=>s.freshnessVisible=false],
 ['ci-retired-dom-authority',s=>s.ciHandoffCurrent=false],['ci-onboarding-precondition-bypass',s=>s.ciOnboardingPrepared=false],['ci-focus-precondition-after-navigation',s=>s.ciFocusPrecondition=false],['ci-support-rail-topology-drift',s=>s.ciSupportRailCurrent=false],['ci-proof-async-hidden-stale',s=>s.ciProofAsyncRecovery=false],['ci-legacy-onboarding-gap',s=>s.ciLegacyOnboardingCoverage=false],['ci-auditor-readiness-copy-conflated',s=>s.ciAuditorReadinessSeparated=false],['ci-rn-monitor-oracle-legacy',s=>s.ciRnMonitorOracleCurrent=false]
];
assert.equal(F.length,73);assert.deepEqual(fail(base()),[]);for(const [id,mutate] of F){const s=base();mutate(s);assert.ok(fail(s).length,`preflight survivor ${id}`);}
let seed=0x25c0ffee;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};const TOTAL=10_000_000,DISCOVERY=9_000_000;const hits=Object.fromEntries(F.map(([id])=>[id,0])),familiesSeen=new Set(),novelInHoldout=new Set();let lastNovelTrial=-1,maxDepth=0;
for(let i=0;i<TOTAL;i++){const s=base(),depth=1+(rnd()%6),chosen=new Set();maxDepth=Math.max(maxDepth,depth);while(chosen.size<depth)chosen.add(rnd()%F.length);for(const k of chosen){F[k][1](s);hits[F[k][0]]++;}const failures=fail(s);if(!failures.length)throw new Error(`survivor ${i}`);for(const family of failures){if(!familiesSeen.has(family)){familiesSeen.add(family);lastNovelTrial=i;if(i>=DISCOVERY)novelInHoldout.add(family);}}}
assert.ok(Object.values(hits).every(n=>n>0));assert.equal(novelInHoldout.size,0,`holdout novelty: ${[...novelInHoldout]}`);
const mechanisms=[...Array(11)].map((_,i)=>`M${i+1}`),deletedMechanismKills=[];for(const mechanism of mechanisms){const s=base();const family=F.find(([id,mutate])=>{const c=base();mutate(c);return fail(c).includes(mechanism);});assert.ok(family,`no deletion witness ${mechanism}`);family[1](s);assert.ok(fail(s).includes(mechanism));deletedMechanismKills.push(mechanism);}
let pairKills=0;for(let i=0;i<mechanisms.length;i++)for(let j=i+1;j<mechanisms.length;j++){const s=base();for(const mechanism of [mechanisms[i],mechanisms[j]]){const family=F.find(([,mutate])=>{const c=base();mutate(c);return fail(c).includes(mechanism);});family[1](s);}const observed=fail(s);assert.ok(observed.includes(mechanisms[i])&&observed.includes(mechanisms[j]));pairKills++;}
const issueCoverage=Object.fromEntries(Object.entries(UIUX_MINING_V2_COVERAGE.mechanisms).map(([id,value])=>[id,value.issues.length]));assert.equal(Object.values(issueCoverage).reduce((a,b)=>a+b,0),352);
console.log(JSON.stringify({ok:true,slice:'UIUX-MINING-CLOSURE-V2',campaign:'source-calibrated complete end-user semantic runtime model',trials:TOTAL,killed:TOTAL,survivors:0,mutationFamilies:F.length,ciFailureFamilies:8,normalizedFailureFamilies:[...familiesSeen].sort(),lastNovelTrial,discoveryTrials:DISCOVERY,holdoutTrials:TOTAL-DISCOVERY,holdoutNovelFamilies:0,maxMutationDepth:maxDepth,mechanismDeletionOracle:{killed:deletedMechanismKills.length,total:11},pairDeletionOracle:{killed:pairKills,total:55},issueCoverage,totalIssues:352,registerSha256:UIUX_MINING_V2_COVERAGE.registerSha256,seed:'0x25c0ffee',claimBoundary:'10,000,000 deterministic source-calibrated semantic runtime-model compositions over complete end-user obligations; not 10M browser sessions, representative users, accessibility certification, legal/compliance proof or deployment effectiveness.'}));
