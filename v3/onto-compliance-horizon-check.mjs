import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [frame,anatomy,market,css,styles,contracts,meta,doc,browser]=await Promise.all([
 read('./public/ui/procedure-frame.js'),read('./public/ui/procedure-anatomy.js'),read('./public/ui/procedure-market-ux.js'),read('./public/onto-compliance-v1.css'),read('./public/styles.css'),read('./procedure-contracts-1-2.json'),read('./runtime/meta-procedure-contracts.mjs'),read('../docs/ONTO_COMPLIANCE_HORIZON_V1.md'),read('./browser-onto-compliance-v1.py')
]);
const registry=JSON.parse(contracts).procedures;
assert.equal(registry.length,7,'business procedure registry must remain exactly seven');
assert.ok(meta.includes("businessProcess:false")&&meta.includes("code:'EP-01'"),'EP-01 must remain cross-cutting, not an eighth business procedure');
for(const token of ['Nessuna attenzione aperta','Attenzione aperta','Consulta record','openReadSurface','readTarget'])assert.ok(frame.includes(token),`procedure frame missing ${token}`);
for(const forbidden of ["'In ordine'",'navigateSurface(\'proof\')','placeTechnicalContext'])assert.equal(frame.includes(forbidden),false,`procedure frame retains forbidden authority/placement pattern ${forbidden}`);
assert.ok(anatomy.includes('function workAnchor(')&&anatomy.includes('anchor.after(box)'),'technical anatomy must own placement after native work');
assert.equal(anatomy.includes('host.prepend(box)'),false,'technical trace must not prepend ahead of native work');
assert.ok(anatomy.includes('queueMicrotask(render)'),'anatomy rerender must converge in the current event turn');
assert.ok(market.includes('procedure senza attenzione aperta'),'home summary must use observational attention language');
assert.equal(/processi in ordine|>In ordine</i.test(market),false,'home must not convert absence of attention into a favorable verdict');
for(const token of ['market-scope-editor','scopeOptions(decision)',"decision===value?'selected':''",'f.scope?.reason'])assert.ok(market.includes(token),`coverage disclosure missing ${token}`);
assert.ok(css.includes('.procedure-state.ready')&&css.includes('background:#f1f4f8'),'zero-attention presentation must be neutral');
assert.ok(css.includes('.market-scope.in-scope')&&css.includes('background:#eef1ff'),'scope decision must not use success-green semantics');
for(const bp of ['@media(max-width:900px)','@media(max-width:820px)'])assert.ok(css.includes(bp),`responsive horizon missing ${bp}`);
assert.ok(css.includes('.service-nav')&&css.includes('overflow-x:auto'),'tablet navigation must own overflow locally');
assert.equal(css.includes('body{overflow-x:hidden}'),false,'document overflow must not be masked at body level');
assert.ok(styles.trim().split('\n').filter(Boolean).at(-3)?.includes("onto-compliance-v1.css")||styles.includes("@import url('./onto-compliance-v1.css');\n\n[hidden]"),'onto-compliance layer must be final imported experience layer');
for(const token of ['Identity','Action','Work','Evidence / Trace','M+100','G+100','Rice'])assert.ok(doc.includes(token),`design convergence contract missing ${token}`);
for(const token of ["'work':'#monitoringView > .section-block'","'work':'#incidentsView > .section-block'",'coverage-scope-editors-expanded-by-default','auditor-primary-leaves-procedure'])assert.ok(browser.includes(token),`runtime visual audit missing ${token}`);
console.log('onto-compliance-horizon-check: ok (visual hierarchy + epistemic wording + single trace owner + tablet containment)');
