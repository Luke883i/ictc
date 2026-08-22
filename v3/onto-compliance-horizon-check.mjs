import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [frame,anatomy,market,css,styles,convergence,contracts,meta,doc,browser,compositionCss,compositionRuntime]=await Promise.all([
 read('./public/ui/procedure-frame.js'),read('./public/ui/procedure-anatomy.js'),read('./public/ui/procedure-market-ux.js'),read('./public/onto-compliance-v1.css'),read('./public/styles.css'),read('./public/ui-convergence.css'),read('./procedure-contracts-1-2.json'),read('./runtime/meta-procedure-contracts.mjs'),read('../docs/ONTO_COMPLIANCE_HORIZON_V1.md'),read('./browser-onto-compliance-v1.py'),read('./public/semantic-composition-3-1.css'),read('./public/ui/semantic-composition-runtime.js')
]);
const registry=JSON.parse(contracts).procedures;
assert.equal(registry.length,7,'business process registry must remain exactly seven');
assert.ok(meta.includes("businessProcess:false")&&meta.includes("code:'EP-01'"),'EP-01 must remain cross-cutting, not an eighth business process');
for(const token of ['PROCEDURE_COMPOSITION','Consulta registrazioni','openReadSurface','readTarget','data-procedure-frame-variant="row"'])assert.ok(frame.includes(token),`compact process frame missing ${token}`);
for(const forbidden of ["'In ordine'",'Nessuna attenzione aperta','<span>Processo di Compliance</span>','<b>Scopo del processo</b>','<small>da vedere</small>','<small>registrazioni</small>','semanticSignals','Consulta record','Scopo della procedura'])assert.equal(frame.includes(forbidden),false,`process frame retains forbidden pattern ${forbidden}`);
assert.ok(anatomy.includes('function workAnchor(')&&anatomy.includes('anchor.after(box)'),'technical anatomy must own placement after native work');
assert.equal(anatomy.includes('host.prepend(box)'),false,'technical trace must not prepend ahead of native work');
assert.ok(anatomy.includes('queueMicrotask(render)'),'anatomy rerender must converge in current event turn');
assert.ok(market.includes('procedure senza attenzione aperta'),'legacy market summary may preserve observational language');
for(const token of ['market-scope-editor','scopeOptions(decision)',"decision===value?'selected':''",'f.scope?.reason'])assert.ok(market.includes(token),`coverage disclosure missing ${token}`);
assert.ok(css.includes('.market-scope.in-scope'),'scope visual state remains available to native owner');
const imports=[...styles.matchAll(/@import\s+url\(['"]?([^)'"\s]+)['"]?\)/g)].map(match=>match[1]);
for(const layer of ['./onto-compliance-v1.css','./procedure-finetuning-1-4.css','./procedure-executive-harmonization-1-5.css','./visual-epistemic-runtime.css','./ui-convergence.css','./semantic-composition-3-1.css'])assert.ok(imports.includes(layer),`cascade layer missing ${layer}`);
assert.equal(imports.at(-1),'./semantic-composition-3-1.css','Semantic Composition 3.1 must be final geometry/hierarchy resolver');
assert.doesNotMatch(compositionCss,/(?:^|[;{])\s*(?:color|background-color)\s*:/m,'composition resolver must not create independent palette authority');
for(const token of ['#homeView #homePulse','#procedureHub .procedure-card','.finetune-compass,.seq-guide','#epistemicView #epistemicCompression','#adminCenter #adminMetrics'])assert.ok(compositionCss.includes(token),`composition compression missing ${token}`);
for(const token of ['compactHome','compactProcesses','compactNative','compactGrc','compactProof','compactEpistemic','compactAdmin','compactAiSettings'])assert.ok(compositionRuntime.includes(`function ${token}`),`all-surface adapter missing ${token}`);
for(const token of ['Identity','Action','Work','Evidence / Trace','M+100','G+100','Rice'])assert.ok(doc.includes(token),`design lineage contract missing ${token}`);
for(const token of ["'work':'#monitoringView > .section-block'","'work':'#incidentsView > .section-block'",'auditor-primary-leaves-process','epistemic-family-convergence'])assert.ok(browser.includes(token),`runtime visual audit missing ${token}`);
console.log('onto-compliance-horizon-check: ok (seven-process authority + work-first composition + final hierarchy resolver)');
