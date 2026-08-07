import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const model = JSON.parse(await read('./enterprise-2-editorial-model.json'));
const ui = await read('./public/ui/enterprise-2-editorial.js');
const css = await read('./public/enterprise-2-editorial.css');
const app = await read('./public/app.js');
const styles = await read('./public/styles.css');
const browser = await read('./browser-enterprise-2-check.py');
const docs = await read('../docs/ENTERPRISE_2_EDITORIAL_REVIEW.md');
const packageJson = JSON.parse(await read('../package.json'));
const verified = [];

function verify(name, assertion) {
  try { assertion(); verified.push(name); }
  catch (error) {
    const message = String(error.message || error).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    console.error(`::error title=enterprise-2-editorial:${name}::${message}`);
    throw error;
  }
}

verify('model-shape', () => {
  assert.equal(model.schemaVersion, '2.0.0-editorial-candidate');
  assert.equal(model.surfaces.length, 15);
  assert.ok(model.antiOverclaim.length >= 6);
  assert.ok(model.progressiveDisclosure.length >= 7);
  assert.equal(model.complexityBudget.maxInitialBlocks, 5);
  assert.equal(model.complexityBudget.desktopPageMaxPx, 1180);
});

verify('terminal-installation', () => {
  assert.match(app, /installEnterprise2EditorialSystem/);
  assert.match(app, /enterprise-2-editorial\.js/);
  assert.match(styles, /enterprise-2-editorial\.css/);
  assert.match(ui, /editorialSystem = 'professional-1'/);
  assert.match(ui, /informationDensity = 'minimal-progressive'/);
  assert.doesNotMatch(ui, /new MutationObserver/);
});

verify('canonical-vocabulary', () => {
  const expected = {
    'RN-01': 'Monitoraggio normativo',
    'EC-01': 'Gestione eventi e segnalazioni',
    'EV-01': 'Evidenze e controlli',
    'IA-01': 'Identità e accessi',
    'GA-01': 'Governo dei servizi AI'
  };
  for (const [code, label] of Object.entries(expected)) {
    assert.equal(model.canonicalVocabulary[code], label);
    assert.match(ui, new RegExp(code));
    assert.match(ui, new RegExp(label));
    assert.match(browser, new RegExp(code));
  }
  assert.match(ui, /ICTC · Attività, evidenze e controlli/);
  assert.match(ui, /Eventi e segnalazioni/);
  assert.match(ui, /Evidenze, controlli e limiti/);
});

verify('anti-overclaim-source-language', () => {
  assert.equal(model.sourceStateVocabulary.candidate, 'Da valutare');
  assert.equal(model.sourceStateVocabulary.verified, 'Accettata nel catalogo');
  assert.equal(model.sourceStateVocabulary.rejected, 'Esclusa dal catalogo');
  for (const label of ['Da valutare', 'Accettata nel catalogo', 'Esclusa dal catalogo', 'Punteggio indicativo del modello']) {
    assert.match(ui, new RegExp(label));
  }
  assert.match(ui, /Accetta nel catalogo/);
  assert.match(ui, /non dimostra completezza, vigenza o applicabilità/);
  assert.match(docs, /non certifica/i);
});

verify('minimal-first-information-architecture', () => {
  assert.match(ui, /ensureRecordDisclosure/);
  assert.match(ui, /editorial-record-details/);
  assert.match(ui, /disclosureFromSection/);
  for (const label of ['Cronologia della fonte', 'Decisioni registrate', 'Traccia del modello', 'Analisi assistita', 'Promemoria']) {
    assert.match(ui, new RegExp(label));
  }
  assert.match(ui, /standard\.open = false/);
  assert.match(css, /editorial-secondary-disclosure/);
  assert.match(css, /editorial-record-details/);
});

verify('density-and-spacing-budget', () => {
  for (const token of ['--e2e-page-max:1180px', '--e2e-copy-max:66ch', '--e2e-control-min:44px']) assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(css, /min-height:56px/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /padding:10px 12px!important/);
  assert.match(css, /@media\(max-width:340px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /@media\(forced-colors:active\)/);
});

verify('role-specific-copy', () => {
  for (const title of ['Governa attività e controlli', 'Continua le attività', 'Consulta attività ed evidenze']) assert.match(ui, new RegExp(title));
  assert.match(ui, /role\(\) === 'auditor'/);
  assert.match(ui, /in sola lettura/);
});

verify('browser-projection', () => {
  for (const label of [
    'ICTC · Attività, evidenze e controlli',
    'Consulta attività ed evidenze',
    'Gestione eventi e segnalazioni',
    'Monitoraggio normativo',
    'Evidenze, controlli e limiti',
    'EV-01 · Controlli applicativi',
    'GA-01 · Governo AI'
  ]) assert.match(browser, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(browser, /professional-editorial-system/);
  assert.match(browser, /minimal-progressive-density/);
});

verify('package-gates', () => {
  assert.match(packageJson.scripts.check, /enterprise-2-check\.mjs/);
  assert.match(packageJson.scripts['test:contract'], /enterprise-2-check\.mjs/);
  assert.match(packageJson.scripts['test:enterprise2'], /enterprise-2-check\.mjs/);
});

const report = {
  schemaVersion: model.schemaVersion,
  ok: true,
  verified,
  surfaceCount: model.surfaces.length,
  vocabulary: model.canonicalVocabulary,
  sourceStateVocabulary: model.sourceStateVocabulary,
  complexityBudget: model.complexityBudget,
  claimBoundary: model.claimBoundary,
  status: 'candidate-evidence-present'
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-editorial-check.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-editorial-check: ok (${verified.length} groups, ${report.surfaceCount} surfaces)`);
