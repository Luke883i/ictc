import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

await import('./enterprise-2-ui-standard-saturation.mjs');
const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const model = JSON.parse(await read('./enterprise-2-ui-standard-model.json'));
const saturation = JSON.parse(await read('../artifacts/enterprise-2-ui-standard-saturation.json'));
const ui = await read('./public/ui/enterprise-2-ui-standard.js');
const css = await read('./public/enterprise-2-ui-standard.css');
const app = await read('./public/app.js');
const styles = await read('./public/styles.css');
const docs = await read('../docs/ENTERPRISE_2_UI_STANDARD.md');
const browser = await read('./browser-enterprise-2-ui-standard-check.py');
const verified = [];

function verify(name, assertion) {
  assertion();
  verified.push(name);
}

verify('javascript-syntax', () => {
  execFileSync(process.execPath, ['--check', new URL('./public/ui/enterprise-2-ui-standard.js', import.meta.url).pathname], { stdio: 'pipe' });
});
verify('terminal-wiring', () => {
  assert.match(app, /installEnterprise2UiStandard/);
  assert.ok(app.indexOf('installEnterprise2UiStandard()') > app.indexOf('installEnterprise2ComplianceFlow()'));
  assert.match(styles, /enterprise-2-ui-standard\.css/);
  assert.ok(styles.indexOf('enterprise-2-ui-standard.css') > styles.indexOf('enterprise-2-compliance-configuration.css'));
});
verify('authority-safe', () => {
  assert.doesNotMatch(ui, /\bfetch\s*\(|\bapi\s*\(|localStorage|sessionStorage/);
  assert.doesNotMatch(ui, /capabilities\s*=|permissions\s*=/);
  assert.match(ui, /ictc:rendered/);
  assert.match(ui, /ictc:surface-changed/);
});
verify('dialog-standard', () => {
  assert.match(ui, /ui-dialog-close/);
  assert.match(css, /grid-template-rows:auto minmax\(0,1fr\) auto/);
  assert.match(css, /width:var\(--uis-control\)!important/);
  assert.match(css, /height:var\(--uis-control\)!important/);
  assert.equal(model.budgets.dialogScrollOwners, 1);
});
verify('metric-atomicity', () => {
  assert.match(ui, /ui-metric-pair/);
  assert.match(ui, /role', 'listitem'/);
  assert.match(css, /\.ui-metric-pair/);
});
verify('progressive-border-depth', () => {
  assert.equal(model.budgets.visibleBorderDepthMax, 2);
  assert.match(css, /\.settings-section-18,.job-config-group,.admin-config-group/);
  assert.match(css, /border:0!important/);
});
verify('proof-disclosure-containment', () => {
  assert.match(ui, /proof-standard/);
  assert.match(css, /proof-standard\[data-ui-standard-block="true"\]/);
  assert.match(css, /grid-template-columns:minmax\(0,1fr\) 24px/);
});
verify('placeholder-and-vocabulary', () => {
  assert.match(ui, /PLACEHOLDER_COPY/);
  assert.match(ui, /Uso interno/);
  assert.match(ui, /Riservato/);
  assert.match(ui, /Limitato/);
  assert.match(browser, /Descrizione\./);
});
verify('admin-isolation', () => {
  assert.match(ui, /enforceAdminIsolation/);
  assert.match(ui, /panel\.hidden = panel !== owner/);
  assert.match(browser, /admin-panel:visible/);
});
verify('responsive-contract', () => {
  for (const token of ['max-width:480px', 'max-width:340px', '100dvh', '68ch']) assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(model.budgets.controlMinPx, 44);
  assert.match(browser, /320/);
  assert.match(browser, /390/);
  assert.match(browser, /zoom-200/);
});
verify('surface-coverage', () => {
  assert.equal(model.surfaces.length, 22);
  for (const surface of model.surfaces) assert.ok(saturation.coverage[surface.id]?.length, surface.id);
  assert.equal(saturation.standardCoverage.length, model.standardObligations.length);
});
verify('triple-saturation', () => {
  assert.equal(saturation.M, 102);
  assert.equal(saturation.MPlus100, 202);
  assert.equal(saturation.noveltyAfterM, 0);
  assert.equal(saturation.N, 50);
  assert.equal(saturation.NPlus100, 150);
  assert.equal(saturation.contradictionsAfterN, 0);
  assert.equal(saturation.Z, 26);
  assert.equal(saturation.ZPlus100, 126);
  assert.equal(saturation.uncoveredStandardsAtZ, 0);
  assert.equal(saturation.uncoveredStandardsAfterZ, 0);
});
verify('documented-dod', () => {
  assert.equal(model.definitionOfDone.length, 19);
  assert.match(docs, /M \+ 100/);
  assert.match(docs, /N \+ 100/);
  assert.match(docs, /Z \+ 100/);
  assert.match(docs, /non dichiara conformità WCAG/i);
});

const report = {
  schemaVersion: model.schemaVersion,
  standard: model.id,
  ok: true,
  verified,
  surfaces: model.surfaces.length,
  components: model.components.length,
  budgets: model.budgets,
  saturation: {
    M: saturation.M, MPlus100: saturation.MPlus100, noveltyAfterM: saturation.noveltyAfterM,
    N: saturation.N, NPlus100: saturation.NPlus100, contradictionsAfterN: saturation.contradictionsAfterN,
    Z: saturation.Z, ZPlus100: saturation.ZPlus100, uncoveredStandardsAtZ: saturation.uncoveredStandardsAtZ, uncoveredStandardsAfterZ: saturation.uncoveredStandardsAfterZ
  },
  definitionOfDone: model.definitionOfDone,
  claimBoundary: model.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-ui-standard-check.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-ui-standard-check: ok (${verified.length} groups, ${model.surfaces.length} surfaces)`);
