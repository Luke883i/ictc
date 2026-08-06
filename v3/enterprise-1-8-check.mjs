import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const contract = JSON.parse(await read('./enterprise-1-8-contract.json'));
const ui = await read('./public/ui/workbench-1-8.js');
const css = await read('./public/enterprise-1-8.css');
const app = await read('./public/app.js');
const server = await read('./server.mjs');
const jobs = await read('./runtime/monitoring-jobs.mjs');
const ai = await read('./ai.mjs');
const saturation = await read('./enterprise-1-8-saturation.mjs');
const runtime = await read('./enterprise-1-8-runtime-check.mjs');
const browser = await read('./browser-enterprise-1-8-check.py');
const packageJson = JSON.parse(await read('../package.json'));
const workflow = await read('../.github/workflows/ci.yml');
const docs = await read('../docs/ENTERPRISE_1_8_WORKBENCH_AUDIT.md');
const verified = [];

function verify(name, assertion) {
  try { assertion(); verified.push(name); }
  catch (error) {
    const message = String(error.message || error).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    console.error(`::error title=enterprise-1-8:${name}::${message}`);
    throw error;
  }
}

verify('contract-shape', () => {
  assert.equal(contract.schemaVersion, '1.8.0');
  assert.equal(contract.T.length, 12);
  assert.equal(contract.labelMatrix.length, 4);
  assert.equal(contract.definitionOfDone.length, 16);
});
verify('saturation-declared', () => {
  assert.equal(contract.saturation.perTDeclaredScenarios, 15552);
  assert.equal(contract.saturation.perTM, 15616);
  assert.equal(contract.saturation.perTMPlus100, 15716);
  assert.equal(contract.saturation.totalScenarios, 187824);
  assert.equal(contract.saturation.expectedNoveltyAfterM, 0);
  assert.match(saturation, /tailPerT/);
});
verify('balanced-home', () => {
  assert.match(ui, /process-lanes/);
  assert.match(ui, /data-lane=\"monitoring\"/);
  assert.match(ui, /data-lane=\"incidents\"/);
  assert.match(ui, /Due processi distinti/);
  assert.match(css, /grid-template-columns:1fr 1fr/);
});
verify('governed-job-profile', () => {
  for (const field of ['jobName','miningMode','noveltyBaseline','baselineAt','jurisdictions','authorities','changeTypes','resultLimit']) {
    assert.match(jobs, new RegExp(field), `missing backend field ${field}`);
    assert.match(ui, new RegExp(field), `missing UI field ${field}`);
  }
  assert.match(server, /createMonitoringJobHandler/);
  assert.match(ai, /jobProfile/);
  assert.match(ai, /previousIdentifiers/);
  assert.match(runtime, /job-profile-persisted/);
});
verify('material-intake', () => {
  assert.match(ui, /Cosa stai registrando/);
  for (const mode of ['link','text','document']) assert.match(ui, new RegExp(`value=\\"${mode}\\"`));
  assert.match(ui, /conserva l'originale/i);
});
verify('event-clarity', () => {
  assert.match(ui, /Registra e completa i fascicoli/);
  assert.match(ui, /Apri fascicolo/);
  assert.match(ui, /Scarica evidenze/);
  assert.match(css, /#incidentsView>\.hero/);
});
verify('label-matrix', () => {
  for (const label of ['Panoramica','Ricerca normativa','Eventi e incidenti','Guida e prove']) assert.match(ui, new RegExp(label));
  assert.doesNotMatch(ui, /Definisci cosa monitorare/);
  assert.match(docs, /oggetto → stato → azione → effetto/);
});
verify('progressive-detail', () => {
  assert.match(ui, /Perché, metodo, AI, responsabilità ed evidenze/);
  assert.match(ui, /Metodo e confini/);
  assert.match(ui, /settings-section-18/);
  assert.match(css, /home-context-18/);
});
verify('accessibility-budgets', () => {
  assert.equal(contract.visualBudgets.minimumTargetPx, 44);
  assert.equal(contract.visualBudgets.unlabeledInteractiveControls, 0);
  assert.match(browser, /unlabeled-controls/);
  assert.match(browser, /mobile-no-overflow/);
  assert.match(browser, /keyboard/);
});
verify('runtime-chain', () => {
  assert.match(app, /installEnterpriseWorkbench18/);
  assert.match(server, /1\.8-enterprise-workbench/);
  assert.match(workflow, /ICTC 1\.8 Enterprise Workbench/);
  assert.match(workflow, /browser-enterprise-1-8-check\.py/);
});
verify('release-boundary', () => {
  assert.equal(packageJson.version, '1.8.0');
  assert.match(contract.claimBoundary, /does not certify|Non certifica|does not/i);
  assert.doesNotMatch(ui, /garantisce conformità|certifica automaticamente|AI decide/i);
});

const report = {
  schemaVersion: '1.8.0',
  model: contract.model,
  ok: true,
  verified,
  metrics: contract.visualBudgets,
  saturation: contract.saturation,
  limitation: contract.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-1-8-assurance.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-1-8-check: ok (${verified.length} assurance groups)`);
