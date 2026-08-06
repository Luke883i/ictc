import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const contract = JSON.parse(await read('./enterprise-1-7-contract.json'));
const app = await read('./public/app.js');
const router = await read('./public/ui/surface-router.js');
const proof = await read('./public/ui/standard-proof-1-7.js');
const clarity = await read('./public/ui/clarity-1-7.js');
const css = await read('./public/enterprise-1-7.css');
const styles = await read('./public/styles.css');
const index = await read('./public/index.html');
const browser = await read('./browser-enterprise-1-7-check.py');
const version = await read('./version.mjs');
const pkg = JSON.parse(await read('../package.json'));
const lock = JSON.parse(await read('../package-lock.json'));
const claims = JSON.parse(await read('./enterprise-claims.json'));
const verified = [];

function verify(name, assertion) {
  try { assertion(); verified.push(name); }
  catch (error) {
    const message = String(error.message || error).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    console.error(`::error title=enterprise-1-7:${name}::${message}`);
    throw error;
  }
}

verify('contract-shape', () => {
  assert.equal(contract.schemaVersion, '1.7.0');
  assert.equal(contract.release, '1.7.0');
  assert.equal(contract.surfaces.length, 5);
  assert.equal(contract.auditDimensions.length, 15);
  assert.ok(contract.universalInvariants.length >= 18);
  assert.ok(contract.stressScenarios.length >= 30);
  assert.ok(contract.definitionOfDone.length >= 16);
});
verify('saturation', () => {
  const scenarios = Object.values(contract.dimensions).reduce((total, values) => total * values.length, 1);
  assert.equal(scenarios, 87480);
  assert.equal(contract.saturation.M, scenarios + contract.saturation.stabilityWindow);
  assert.equal(contract.saturation.MPlus100, contract.saturation.M + 100);
  assert.equal(contract.saturation.expectedNovelty, 0);
});
verify('single-router', () => {
  assert.match(app, /installSurfaceRouter/);
  assert.match(app, /installStandardProof17Experience/);
  assert.match(app, /installEnterpriseClarity17/);
  assert.doesNotMatch(app, /installStandardProof16Experience\(\)/);
  assert.match(router, /const surfaces/);
  assert.match(router, /ictc:surface-changed/);
  assert.match(router, /stopImmediatePropagation/);
  assert.match(router, /document\.addEventListener\('ictc:rendered', renderSurfaceNavigation\)/);
});
verify('canonical-copy', () => {
  for (const phrase of ['ICTC 1.7 · Enterprise clarity', 'Decisioni, prove e limiti', 'Ruolo attivo', 'Aggiungi materiale', 'Fascicoli evento']) assert.match(index, new RegExp(phrase));
  assert.doesNotMatch(index, />Aggiungi una fonte</);
  assert.doesNotMatch(index, /<span>0[012]<\/span>/);
});
verify('summary-first-home-and-core-pages', () => {
  assert.match(clarity, /homeContextAction/);
  assert.match(clarity, /homeSignalBar/);
  assert.match(clarity, /clarity-visually-deferred/);
  assert.match(clarity, /method\.hidden = true/);
  assert.match(clarity, /monitoringContextAction/);
  assert.match(clarity, /eventsContextAction/);
  assert.match(clarity, /ai-lens-demo/);
  assert.match(clarity, /admin-disclosure/);
});
verify('proof-progressive-detail', () => {
  assert.match(proof, /openProofDetails/);
  assert.match(proof, /proofDetailDialog/);
  assert.match(proof, /Apri mappa completa/);
  assert.match(proof, /aria-label="Riferimento ufficiale \$\{esc\(item\.name\)\}"/);
  assert.match(proof, /data-proof-service="proof"/);
  assert.doesNotMatch(proof, /data-service="proof"/);
});
verify('visual-budgets', () => {
  assert.equal(contract.visualBudgets.desktopHeroMaxPx, 320);
  assert.equal(contract.visualBudgets.homeDecisionMaxPx, 340);
  assert.equal(contract.visualBudgets.minimumTargetPx, 44);
  assert.match(css, /min-height:44px/);
  assert.match(css, /proof-detail-dialog/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /forced-colors:active/);
  assert.match(styles, /@import url\('\.\/enterprise-1-7\.css'\)/);
});
verify('browser-assurance', () => {
  for (const phrase of ['post-merge-keyboard-race-closed', 'home-summary-first', 'monitoring-primary-task', 'proof-detail-dialog', 'admin-progressive-disclosures', 'auditor-zero-write-affordances']) assert.match(browser, new RegExp(phrase));
  assert.match(browser, /height'\] <= 340/);
  assert.match(browser, /height'\] <= 320/);
  assert.match(browser, /document\.documentElement\.scrollWidth/);
});
verify('release-identity', () => {
  assert.match(version, /'1\.7\.0'/);
  assert.equal(pkg.version, '1.7.0');
  assert.equal(lock.version, '1.7.0');
  assert.equal(lock.packages[''].version, '1.7.0');
  assert.equal(claims.release, '1.7.0');
  assert.ok(claims.claims.some(item => item.id === 'enterprise-1-7-clarity'));
});

const report = { schemaVersion: contract.schemaVersion, model: contract.model, ok: true, verified, metrics: contract.visualBudgets, saturation: contract.saturation, limitation: contract.claimBoundary };
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-1-7-audit.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-1-7-check: ok (${verified.length} contract groups)`);
