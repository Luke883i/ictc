import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const r=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const src={
 work:r('./public/ui/workspaces.js'),rn:r('./public/ui/rn-source-review-1-4.js'),ux4:r('./public/ui/semantic-surface-a6-ux4.js'),
 grc:r('./public/ui/grc-workspace-3-2.js'),ec:r('./public/ui/procedure-sequential-rn-ec.js'),frame:r('./public/ui/procedure-frame.js'),
 anatomy:r('./public/procedure-anatomy.css'),presentation:r('./public/ui/procedure-ui-ux-1-6.js'),footer:r('./public/a6-ux1-fixed-safe-footer.css'),
 ep:r('./public/ui/epistemic-workspace-3-2.js'),admin:r('./public/ui/admin-center.js'),registry:r('./current-gate-registry.mjs'),
 workflow:r('../.github/workflows/s4-a6-ux4-semantic-surface.yml'),browser:r('./browser-s4-a6-ux4-semantic-surface.py')
};
assert.ok(src.work.includes('Classe proposta')&&!src.work.includes('<span>Confidenza AI</span>'),'R1 canonical source truth');
assert.ok(!/normalizeDecisionContext[\s\S]{0,1200}textContent='Classe proposta'/.test(src.rn),'R1 late semantic rewrite returned');
assert.ok(src.rn.includes('data-rn-privacy-review'),'R1 privacy review must remain');
assert.ok(src.ux4.includes('revealNativeTarget')&&src.ux4.includes('exact=missing.length===0')&&!src.ux4.includes('exact=missing.length===0&&hidden.length===0')&&src.ux4.includes('ictc:procedure-worklist-ready')&&src.ux4.includes("import { renderProcedureWorklist, renderProcedureWorklists } from './procedure-worklist.js'")&&src.ux4.includes('renderProcedureWorklist(id);section=attentionSection(root,id)')&&src.ux4.includes('renderProcedureWorklists();schedule();'),'R2 single work plane');
for(const x of [src.grc,src.ec])assert.ok(x.includes('function revealTarget')&&x.includes("details:not([open])"),'R2 typed target reveal');
assert.ok(src.frame.includes('data-procedure-orientation="compact"')&&src.frame.includes('Fondamento')&&src.frame.includes('Limite')&&src.frame.includes('Riferimenti'),'R3 orientation');
assert.ok(src.anatomy.includes('.procedure-frame .procedure-boundary{display:grid}')&&src.anatomy.includes('[data-procedure-orientation="compact"]'),'R3 orientation geometry');
assert.ok(src.work.includes("readOnly = (state.data?.actor?.role || state.role) === 'auditor'")&&src.work.includes('data-incident-readonly-question')&&src.work.includes('sola consultazione'),'R4 auditor EC');
assert.ok(src.presentation.includes("container.closest('.procedure-record-card')")&&src.presentation.includes("uiuxActionHierarchy='record-local'"),'R5 record hierarchy');
assert.ok(src.ep.includes("epistemicTechnicalModes='progressive'")&&src.ep.includes('Filtri avanzati')&&src.ep.includes('Viste tecniche'),'R6 epistemic progressive');
assert.ok(src.admin.includes('adoptSettingsSurface')&&src.admin.includes("settings.dataset.adminEmbedded='ai'"),'R6 one AI settings object');
assert.ok(src.footer.includes('position:static!important')&&src.footer.includes('--a6-ux1-footer-reserve:0px')&&!src.footer.includes('position:fixed!important'),'R7 non-occlusive footer');
for(const token of ['uiux-ontoepistemic-convergence-3-check.mjs','uiux-ontoepistemic-convergence-3-saturation-10m.mjs'])assert.ok(src.registry.includes(token)&&src.workflow.includes(token),'O1 missing '+token);
for(const token of ['RN-01-source-truth','record-action-hierarchy','EC-01-auditor-readonly','data-procedure-orientation="compact"'])assert.ok(src.browser.includes(token),'O1 browser oracle '+token);
console.log(JSON.stringify({ok:true,slice:'UIUX-ONTOEPISTEMIC-CONVERGENCE-3',reticulum:['R1-presentation-truth','R2-single-work-plane','R3-orientation-sequence','R4-role-authority','R5-object-grammar','R6-progressive-secondary','R7-shell-interaction','O1-oracle-envelope'],businessAuthorityChanged:false,claimBoundary:'E2 source/contract evidence. Exact-head Chromium and representative-human usability remain independent evidence classes.'}));
