import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [proof,epistemic,evidenceUi,css,copy]=await Promise.all([read('./public/ui/proof-surface.js'),read('./public/ui/epistemic-lattice.js'),read('./public/ui/evidence-download-ui.js'),read('./public/procedure-journey-2-1.css'),read('./public/ui/product-copy.js')]);
assert.ok(proof.includes("SURFACE_LABELS.proof"),'Postura title must consume product-copy authority');
for(const label of ['Osservabile','Da completare','Confine','Decisioni e lineage','Runtime e integrità','Deployment e gap','Standard e riferimenti','Export della vista corrente'])assert.ok(proof.includes(label),`Postura progressive section missing: ${label}`);
assert.ok(!proof.includes('<h1 id="proofTitle">Evidenze e tracciabilità</h1>'),'stale proof title returned');
assert.ok(proof.includes('non la sufficienza sostanziale'),'Postura must keep evidence/conclusion boundary visible');
for(const level of ['Quadro','Gruppi','Relazioni','Atomo'])assert.ok(epistemic.includes(level),`EP progressive level missing ${level}`);
assert.ok(epistemic.includes("epistemicStatus==='proposed'"),'proposed AI readings must stay distinguishable');
assert.ok(epistemic.includes('Flat / raw')&&epistemic.includes('Proto-grafo'),'alternate epistemic representations missing');
for(const label of ['Fascicolo','Stampa PDF','XML strutturato','Markdown','ZIP completo'])assert.ok(evidenceUi.includes(label),`evidence disclosure missing ${label}`);
assert.ok((evidenceUi.match(/document\.addEventListener\('click'/g)||[]).length===1,'evidence formats should share one delegated click owner');
for(const token of ['.proof-snapshot','.proof-reading-grid','.proof-section','.evidence-export-menu','@media(max-width:420px)','prefers-reduced-motion'])assert.ok(css.includes(token),`2.1 polish css missing ${token}`);
assert.ok(copy.includes("proof:'Postura Standard & Security ICTC'"),'canonical proof label drift');
const forbidden=[/Postura[^\n]{0,80}\bconforme\b/i,/Reticolo[^\n]{0,80}\bcertezza\b/i,/Fascicolo[^\n]{0,80}\bprova definitiva\b/i];for(const pattern of forbidden){assert.doesNotMatch(proof,pattern);assert.doesNotMatch(epistemic,pattern);}
console.log(JSON.stringify({ok:true,check:'ux-language-polish',surfaces:['posture','epistemic','evidence-download'],boundary:'lexical/structural audit; not a human visual review or legal assessment'}));
