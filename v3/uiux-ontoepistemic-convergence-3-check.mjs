import assert from 'node:assert/strict';
import {UIUX_MINING_V2_COVERAGE,validateUiuxMiningV2Coverage} from './uiux-converge-0-model.mjs';
import {readFileSync} from 'node:fs';
const r=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const src={
 work:r('./public/ui/workspaces.js'),rn:r('./public/ui/rn-source-review-1-4.js'),ux4:r('./public/ui/semantic-surface-a6-ux4.js'),
 grc:r('./public/ui/grc-workspace-3-2.js'),ec:r('./public/ui/procedure-sequential-rn-ec.js'),frame:r('./public/ui/procedure-frame.js'),
 anatomy:r('./public/procedure-anatomy.css'),presentation:r('./public/ui/procedure-ui-ux-1-6.js'),footer:r('./public/a6-ux1-fixed-safe-footer.css'),
 ep:r('./public/ui/epistemic-workspace-3-2.js'),admin:r('./public/ui/admin-center.js'),seqdom:r('./public/ui/procedure-sequential-dom.js'),slots:r('./public/ui/procedure-editorial-slots.js'),registry:r('./current-gate-registry.mjs'),
 workflow:r('../.github/workflows/s4-a6-ux4-semantic-surface.yml'),browser:r('./browser-s4-a6-ux4-semantic-surface.py'),common:r('./public/ui/common.js'),actions:r('./public/ui/actions.js'),grcbase:r('./public/ui/grc-workspace-base.js'),worklist:r('./public/ui/procedure-worklist.js'),p2:r('./public/enduser-composition-p2.css'),standard:r('./public/ui/standard-browser.js'),proof:r('./public/ui/proof-workspace-3-2.js'),stable:r('./public/ui/stable-shell.js'),model:r('./runtime/model.mjs'),server:r('./server.mjs'),anatomyJs:r('./public/ui/procedure-anatomy.js'),adminws:r('./public/ui/admin-workspace-3-2.js')
};
assert.ok(src.work.includes('Classe proposta')&&!src.work.includes('<span>Confidenza AI</span>'),'R1 canonical source truth');
assert.ok(!/normalizeDecisionContext[\s\S]{0,1200}textContent='Classe proposta'/.test(src.rn),'R1 late semantic rewrite returned');
assert.ok(src.rn.includes('data-rn-privacy-review'),'R1 privacy review must remain');
assert.ok(src.ux4.includes('revealNativeTarget')&&src.ux4.includes('exact=missing.length===0')&&!src.ux4.includes('exact=missing.length===0&&hidden.length===0')&&src.ux4.includes('ictc:procedure-worklist-ready')&&src.ux4.includes("import { renderProcedureWorklist, renderProcedureWorklists } from './procedure-worklist.js'")&&src.ux4.includes('renderProcedureWorklist(id);section=attentionSection(root,id)')&&src.ux4.includes('renderProcedureWorklists();schedule();'),'R2 single work plane');
assert.ok(src.slots.includes("SUPPORT_NAMES=new Set(['reference','advanced-context'])")&&src.slots.includes("SYNTHETIC=new Set(['reference','metrics','attention','advanced-context','evidence','technical','boundary'"),'R3 references must be an independent editorial slot before work, not header copy or advanced context');
assert.ok(src.seqdom.includes('const sameNodes=')&&src.seqdom.includes('if(!sameNodes(currentOverflow,desiredOverflow))')&&!src.seqdom.includes("const previous=host.querySelector(':scope > details.seq-overflow');if(previous)"),'R2 progressive overflow must be lifecycle-idempotent');
for(const x of [src.grc,src.ec])assert.ok(x.includes('function revealTarget')&&x.includes("details:not([open])"),'R2 typed target reveal');
assert.ok(src.frame.includes('data-procedure-orientation="compact"')&&src.frame.includes('Perché esiste')&&src.frame.includes('Cosa non conclude')&&!src.frame.includes('Riferimenti'),'R3 orientation must keep landing header value-only');
assert.ok(src.anatomy.includes('.procedure-frame .procedure-boundary{display:grid}')&&src.anatomy.includes('[data-procedure-orientation="compact"]'),'R3 orientation geometry');
assert.ok(src.work.includes("readOnly = (state.data?.actor?.role || state.role) === 'auditor'")&&src.work.includes('data-incident-readonly-question')&&src.work.includes('sola consultazione'),'R4 auditor EC');
assert.ok(src.presentation.includes("container.closest('.procedure-record-card')")&&src.presentation.includes("uiuxActionHierarchy='record-local'"),'R5 record hierarchy');
assert.ok(src.ep.includes("epistemicTechnicalModes='progressive'")&&src.ep.includes('Filtri avanzati')&&src.ep.includes('Viste tecniche'),'R6 epistemic progressive');
assert.ok(src.admin.includes('adoptSettingsSurface')&&src.admin.includes("settings.dataset.adminEmbedded='ai'"),'R6 one AI settings object');
assert.ok(src.footer.includes('position:fixed!important')&&src.footer.includes('--a6-ux1-footer-reserve:calc(var(--a6-ux1-footer-min) + var(--a6-ux1-footer-safe-bottom))')&&!src.footer.includes('position:static!important'),'R7 non-occlusive footer');
for(const token of ['uiux-ontoepistemic-convergence-3-check.mjs','uiux-ontoepistemic-convergence-3-saturation-10m.mjs'])assert.ok(src.registry.includes(token)&&src.workflow.includes(token),'O1 missing '+token);
for(const token of ['RN-01-source-truth','record-action-hierarchy','EC-01-auditor-readonly','AP-01-auditor-readonly','home-onboarding-replay','data-procedure-orientation="compact"'])assert.ok(src.browser.includes(token),'O1 browser oracle '+token);

const miningCoverage=validateUiuxMiningV2Coverage();assert.equal(miningCoverage.ok,true,`V2 issue coverage drift: ${miningCoverage.errors.join(',')}`);assert.equal(miningCoverage.issueCount,352);assert.equal(miningCoverage.mechanisms,11);assert.equal(UIUX_MINING_V2_COVERAGE.registerSha256,'43333a22d54533cad68aa398b093a8811cce9a9e1081aca194ec19e1145840e6');
const mechanismLaws={
 M1:src.footer.includes('position:fixed!important')&&src.footer.includes('padding-bottom:var(--a6-ux1-footer-reserve)!important')&&src.footer.includes('scroll-margin-bottom:calc(var(--a6-ux1-footer-reserve) + 12px)'),
 M2:src.stable.includes("api('/api/profile/onboarding'")&&src.server.includes("pathname==='/api/profile/onboarding'")&&src.model.includes("authority:'user-record'")&&src.model.includes("authority:'synthetic-demo-fixture'"),
 M3:src.slots.includes("SUPPORT_NAMES=new Set(['reference','advanced-context'])")&&src.frame.includes('Perimetro e criteri')&&src.frame.includes('Perché esiste')&&src.frame.includes('Cosa non conclude'),
 M4:src.worklist.includes("count.textContent=`${filtered.length}/${source.length}`")&&src.worklist.includes('data-worklist-clear-inline')&&src.anatomyJs.includes('overlapping-non-additive')&&src.anatomyJs.includes('non sommabili'),
 M5:src.presentation.includes("uiuxActionHierarchy='record-local'")&&src.p2.includes('.procedure-record-facts')&&src.p2.includes('.procedure-action-rail'),
 M6:src.common.includes('dialogInvokers')&&src.common.includes("dialog.dataset.dirty='true'")&&src.common.includes('window.confirm')&&src.common.includes('invoker.focus')&&src.common.includes('firstDialogFocus'),
 M7:src.presentation.includes('monitorManagerDialog')&&src.presentation.includes('Gestisci monitoraggi')&&src.presentation.includes('data-monitor-manager-id'),
 M8:src.standard.includes('data-standard-depth')&&src.standard.includes('standard-node-provenance')&&src.standard.includes('knowledgePack')&&src.standard.includes('<span class="standard-objective-chip"'),
 M9:[src.proof,src.ep,src.adminws].every(x=>x.includes('hideEmptyPresentation')),
 M10:src.presentation.includes("const readOnly=(state.data?.actor?.role||state.role)==='auditor'||p.readOnly===true")&&src.presentation.includes("node.remove()")&&src.p2.includes('@media(max-width:719px)'),
 M11:src.common.includes("feedbackKind=error?'error':'status'")&&src.common.includes("setAttribute('aria-live'")&&src.common.includes('setInteractionBusy')&&src.actions.includes('setInteractionBusy(trigger,true)')&&src.grcbase.includes('setInteractionBusy(trigger,true)')&&src.presentation.includes('setInteractionBusy(trigger,true)')
};
for(const [id,ok] of Object.entries(mechanismLaws))assert.ok(ok,`V2 mechanism law not materialized: ${id}`);
const commitCoverage=new Set(Object.values(UIUX_MINING_V2_COVERAGE.mechanisms).map(x=>x.commit));assert.deepEqual([...commitCoverage].sort(),['C1-role-chrome-feedback','C2-dialog-lifecycle','C3-procedure-grammar','C4-specialized-surfaces','C5-onboarding-persistence'].sort());
console.log(JSON.stringify({ok:true,slice:'UIUX-ONTOEPISTEMIC-CONVERGENCE-3',reticulum:['R1-presentation-truth','R2-single-work-plane','R3-orientation-sequence','R4-role-authority','R5-object-grammar','R6-progressive-secondary','R7-shell-interaction','O1-oracle-envelope'],businessAuthorityChanged:false,claimBoundary:'E2 source/contract evidence. Exact-head Chromium and representative-human usability remain independent evidence classes.'}));
