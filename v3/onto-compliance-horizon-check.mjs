import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [frame,anatomy,market,css,styles,convergence,contracts,meta,doc,browser]=await Promise.all([
 read('./public/ui/procedure-frame.js'),read('./public/ui/procedure-anatomy.js'),read('./public/ui/procedure-market-ux.js'),read('./public/onto-compliance-v1.css'),read('./public/styles.css'),read('./public/ui-convergence.css'),read('./procedure-contracts-1-2.json'),read('./runtime/meta-procedure-contracts.mjs'),read('../docs/ONTO_COMPLIANCE_HORIZON_V1.md'),read('./browser-onto-compliance-v1.py')
]);
const registry=JSON.parse(contracts).procedures;
assert.equal(registry.length,7,'business process registry must remain exactly seven');
assert.ok(meta.includes("businessProcess:false")&&meta.includes("code:'EP-01'"),'EP-01 must remain cross-cutting, not an eighth business process');
for(const token of ['Nessuna attenzione aperta','Attenzione aperta','Consulta registrazioni','openReadSurface','readTarget','Processo di Compliance','Scopo del processo'])assert.ok(frame.includes(token),`process frame missing ${token}`);
for(const forbidden of ["'In ordine'",'navigateSurface(\'proof\')','placeTechnicalContext','Consulta record','Scopo della procedura'])assert.equal(frame.includes(forbidden),false,`process frame retains forbidden authority/placement/lexical pattern ${forbidden}`);
assert.ok(anatomy.includes('function workAnchor(')&&anatomy.includes('anchor.after(box)'),'technical anatomy must own placement after native work');
assert.equal(anatomy.includes('host.prepend(box)'),false,'technical trace must not prepend ahead of native work');
assert.ok(anatomy.includes('queueMicrotask(render)'),'anatomy rerender must converge in the current event turn');
assert.ok(market.includes('procedure senza attenzione aperta'),'home summary implementation must use observational attention language');
assert.equal(/processi in ordine|>In ordine</i.test(market),false,'home must not convert absence of attention into a favorable verdict');
for(const token of ['market-scope-editor','scopeOptions(decision)',"decision===value?'selected':''",'f.scope?.reason'])assert.ok(market.includes(token),`coverage disclosure missing ${token}`);
assert.ok(css.includes('.procedure-state.ready')&&css.includes('background:#f1f4f8'),'zero-attention presentation must be neutral');
assert.ok(css.includes('.market-scope.in-scope')&&css.includes('background:#eef1ff'),'scope decision must not use success-green semantics');
for(const bp of ['@media(max-width:900px)','@media(max-width:820px)'])assert.ok(css.includes(bp),`responsive horizon missing ${bp}`);
assert.ok(css.includes('.service-nav')&&css.includes('overflow-x:auto'),'tablet navigation must own overflow locally');
assert.equal(css.includes('body{overflow-x:hidden}'),false,'document overflow must not be masked at body level');
const imports=[...styles.matchAll(/@import\s+url\(['"]?([^)'"\s]+)['"]?\)/g)].map(match=>match[1]);
assert.deepEqual(imports.slice(-2),['./onto-compliance-v1.css','./ui-convergence.css'],'Onto-Compliance must remain the semantic visual horizon immediately before the final geometry/rhythm convergence resolver');
assert.doesNotMatch(convergence,/(?:^|[;{])\s*(?:color|background(?:-color)?)\s*:/m,'final UI convergence resolver must not create an independent palette authority');
for(const token of ['Identity','Action','Work','Evidence / Trace','M+100','G+100','Rice'])assert.ok(doc.includes(token),`design convergence contract missing ${token}`);
for(const token of ["'work':'#monitoringView > .section-block'","'work':'#incidentsView > .section-block'",'coverage-scope-editors-expanded-by-default','auditor-primary-leaves-process','epistemic-family-convergence','posture-proof-method-count'])assert.ok(browser.includes(token),`runtime visual audit missing ${token}`);
console.log('onto-compliance-horizon-check: ok (visual hierarchy + canonical process wording + Onto horizon followed only by palette-neutral convergence resolver)');
