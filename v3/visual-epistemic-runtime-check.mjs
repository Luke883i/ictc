import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files=Object.freeze({
  shell:'v3/public/ui/stable-shell.js',
  copy:'v3/public/ui/product-copy.js',
  proof:'v3/public/ui/proof-surface.js',
  trace:'v3/public/ui/trace-explorer.js',
  traceCss:'v3/public/trace-explorer.css',
  runtime:'v3/public/ui/visual-epistemic-runtime.js',
  runtimeCss:'v3/public/visual-epistemic-runtime.css',
  active:'v3/public/ui/active-experience.js',
  styles:'v3/public/styles.css'
});
const content=Object.fromEntries(await Promise.all(Object.entries(files).map(async([key,path])=>[key,await readFile(path,'utf8')])));
const checks=[];
function check(id,fn){try{fn();checks.push(id);}catch(error){console.error(`::error title=visual-epistemic-runtime:${id}::${error.message}`);throw error;}}

check('demo-chip-context',()=>{
  assert.match(content.shell,/demo-context-badge/);
  assert.match(content.shell,/demo-context-chip/);
  assert.match(content.shell,/Nessun dato, contatore o esito demo rappresenta una conclusione reale/);
  assert.doesNotMatch(content.shell,/DEMO · dati sintetici<\/strong><span>/);
});
check('shell-proportion-guard',()=>{
  assert.match(content.runtimeCss,/stable-header-inner\{height:46px/);
  assert.match(content.runtimeCss,/home-intro h1\{font-size:clamp\(1\.85rem,3\.25vw,2\.7rem\)/);
});
check('proof-name-boundary',()=>{
  assert.match(content.copy,/proof:'Prove e limiti ICTC'/);
  assert.doesNotMatch(content.copy,/proof:'Postura ICTC'/);
  assert.match(content.copy,/non costituiscono certificazione/);
});
check('proof-evidence-not-score',()=>{
  assert.match(content.proof,/Controlli con evidenza/);
  assert.match(content.proof,/non è un punteggio di conformità o sicurezza/);
  assert.match(content.proof,/Catena integra · r/);
  assert.doesNotMatch(content.proof,/Coerente · r/);
});
check('proof-progressive-technical-disclosure',()=>{
  assert.match(content.proof,/proof-technical-detail/);
  assert.match(content.proof,/Attestazione assente, incompleta o non valida/);
  assert.match(content.proof,/<details class="proof-section"><summary><span><b>Decisioni e tracciabilità/);
  assert.doesNotMatch(content.proof,/<details class="proof-section" open><summary><span><b>Decisioni e tracciabilità/);
});
check('trace-no-nested-scroll',()=>{
  assert.match(content.traceCss,/trace-list\{[^}]*max-height:none;overflow:visible/);
  assert.doesNotMatch(content.traceCss,/max-height:68vh/);
});
check('trace-subject-identity',()=>{
  assert.match(content.trace,/Identificativo \$\{esc\(String\(t\.subject\.id/);
  assert.match(content.trace,/aria-current=/);
});
check('trace-technical-disclosure',()=>{
  assert.match(content.trace,/trace-technical/);
  assert.match(content.trace,/Digest e identificativi/);
  assert.match(content.trace,/Hash di audit/);
  assert.match(content.trace,/Stato epistemico/);
});
check('grc-non-additive-metrics',()=>{
  assert.match(content.runtime,/Le categorie possono sovrapporsi/);
  assert.match(content.runtime,/metricSemantics='non-additive-unless-explicit'/);
});
check('risk-axis-and-boundary',()=>{
  assert.match(content.runtime,/Impatto →/);
  assert.match(content.runtime,/Probabilità →/);
  assert.match(content.runtime,/non è una probabilità oggettiva né una conclusione regolatoria/);
});
check('next-human-action-hierarchy',()=>{
  assert.match(content.runtime,/epistemic-next-action/);
  assert.match(content.runtimeCss,/epistemic-next-action[^}]*font-weight:800/);
  assert.match(content.runtime,/epistemic-evidence-action/);
});
check('demo-time-boundary',()=>{
  assert.match(content.runtime,/lo scheduler operativo è disabilitato/);
  assert.match(content.runtime,/non indicano job mancati/);
});
check('ai-secondary-salience',()=>{
  assert.match(content.runtime,/epistemic-secondary-banner/);
  assert.match(content.runtimeCss,/setup-banner\.epistemic-secondary-banner/);
});
check('epistemic-professional-language',()=>{
  assert.match(content.runtime,/actions:'Azioni'/);
  assert.match(content.runtime,/recorded:'Registrato'/);
  assert.match(content.runtime,/tracce tecniche nella pagina/);
  assert.match(content.runtime,/La vista raggruppa la presentazione senza modificare origine, versione, integrità, base, stato o relazioni registrate/);
});
check('runtime-owner-installed',()=>{
  assert.match(content.active,/installVisualEpistemicRuntime/);
  assert.match(content.active,/installSurfacePrimitives,installVisualEpistemicRuntime/);
  assert.match(content.styles,/visual-epistemic-runtime\.css/);
});

console.log(JSON.stringify({ok:true,control:'VISUAL-EPISTEMIC-RUNTIME',checks:checks.length,checked:checks}));
