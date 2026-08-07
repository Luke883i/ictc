import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

await import('./enterprise-2-ui-standard-saturation.mjs');
const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const baseModel = JSON.parse(await read('./enterprise-2-ui-standard-model.json'));
const runtimeFindings = JSON.parse(await read('./enterprise-2-ui-standard-runtime-findings.json'));
const model = {
  ...baseModel,
  lexicalRules: [...baseModel.lexicalRules, ...(runtimeFindings.lexicalRules || [])],
  layoutRules: [...baseModel.layoutRules, ...runtimeFindings.layoutRules],
  contradictionPrimitives: [...baseModel.contradictionPrimitives, ...runtimeFindings.contradictionPrimitives],
  standardObligations: [...baseModel.standardObligations, ...runtimeFindings.standardObligations],
  definitionOfDone: [...baseModel.definitionOfDone, ...runtimeFindings.definitionOfDone]
};
const saturation = JSON.parse(await read('../artifacts/enterprise-2-ui-standard-saturation.json'));
const ui = await read('./public/ui/enterprise-2-ui-standard.js');
const runtimeCss = await read('./public/enterprise-2-ui-standard-runtime-refinement.css');
const css = `${await read('./public/enterprise-2-ui-standard.css')}\n${runtimeCss}`;
const actions = await read('./public/ui/actions.js');
const app = await read('./public/app.js');
const styles = await read('./public/styles.css');
const docs = await read('../docs/ENTERPRISE_2_UI_STANDARD.md');
const convergenceDocs = await read('../docs/ENTERPRISE_2_UI_STANDARD_RUNTIME_CONVERGENCE.md');
const browser = await read('./browser-enterprise-2-ui-standard-check.py');
const productBrowser = await read('./browser-product-check.py');
const verified = [];

function verify(name, assertion) { assertion(); verified.push(name); }

verify('javascript-syntax', () => {
  execFileSync(process.execPath, ['--check', new URL('./public/ui/enterprise-2-ui-standard.js', import.meta.url).pathname], { stdio: 'pipe' });
  execFileSync(process.execPath, ['--check', new URL('./public/ui/actions.js', import.meta.url).pathname], { stdio: 'pipe' });
});
verify('terminal-wiring', () => {
  assert.match(app, /installEnterprise2UiStandard/);
  assert.ok(app.indexOf('installEnterprise2UiStandard()') > app.indexOf('installEnterprise2ComplianceFlow()'));
  assert.match(styles, /enterprise-2-ui-standard\.css/);
  assert.match(styles, /enterprise-2-ui-standard-runtime-refinement\.css/);
  assert.ok(styles.indexOf('enterprise-2-ui-standard-runtime-refinement.css') > styles.indexOf('enterprise-2-ui-standard.css'));
});
verify('authority-safe', () => {
  assert.doesNotMatch(ui, /\bfetch\s*\(|\bapi\s*\(|localStorage|sessionStorage/);
  assert.doesNotMatch(ui, /capabilities\s*=|permissions\s*=/);
  assert.match(ui, /ictc:rendered/);
  assert.match(ui, /ictc:surface-changed/);
});
verify('server-issued-authority-visibility', () => {
  assert.match(ui, /reconcileServerIssuedAdminVisibility/);
  assert.match(ui, /state\.data\?\.actor\?\.role/);
  assert.match(ui, /settings\.hidden = role !== 'admin'/);
  assert.ok(model.standardObligations.some(item => item.id === 'ICTC-L11'));
});
verify('server-backed-runtime-findings', () => {
  assert.equal(runtimeFindings.observedFailures.length, 7);
  for (const rule of ['terminal-mobile-action-bar-cascade-final','stable-admin-owner-after-delayed-legacy-pass','intrinsic-zoom-reflow-grid','admin-navigation-target-min-44-terminal','admin-navigation-row-ownership-and-hit-testing']) assert.ok(model.layoutRules.includes(rule));
  assert.ok(model.lexicalRules.includes('direct-workspace-rerender-reconciles-terminal-vocabulary'));
  for (const contradiction of ['legacy-progressive-footer-exceeds-mobile-height-budget','legacy-delayed-admin-activation-hides-owner-panel','200-percent-text-expansion-overflows-global-nav','source-decision-rerender-reverts-to-legacy-vocabulary','admin-navigation-target-below-control-budget','admin-navigation-hit-target-occluded-after-section-transition']) assert.ok(model.contradictionPrimitives.includes(contradiction));
  for (const id of ['ICTC-L12','ICTC-L13','ICTC-L14','ICTC-L15','ICTC-L16']) assert.ok(model.standardObligations.some(item => item.id === id));
  assert.match(ui, /setTimeout\(applyUiStandard, 320\)/);
  assert.match(runtimeCss, /max-height:72px!important/);
  assert.match(runtimeCss, /repeat\(auto-fit,minmax\(min\(100%,9rem\),1fr\)\)/);
  assert.match(runtimeCss, /#roleSelect/);
  assert.match(css, /#adminCenter \.admin-section-nav button\{[^}]*min-height:var\(--uis-control\)!important/);
  assert.match(runtimeCss, /#adminCenter \.admin-shell\{[^}]*grid-template-rows:auto auto minmax\(0,1fr\)!important/);
  assert.match(runtimeCss, /#adminCenter \.admin-grid\{[^}]*min-height:0!important/);
  assert.match(browser, /admin-nav-min-target/);
  assert.match(browser, /admin-nav-sequential-hit-test/);
  assert.match(browser, /assert_pointer_target/);
  assert.match(actions, /renderSourceDialog\(\);\s*document\.dispatchEvent\(new CustomEvent\('ictc:surface-changed'/s);
  assert.match(actions, /surface:\s*'source-dialog'/);
  assert.match(actions, /reason:\s*'source-decision'/);
  assert.match(productBrowser, /Accettata nel catalogo/);
});
verify('dialog-standard', () => {
  assert.match(ui, /ui-dialog-close/);
  assert.match(css, /grid-template-rows:auto minmax\(0,1fr\) auto/);
  assert.match(css, /width:var\(--uis-control\)!important/);
  assert.equal(model.budgets.dialogScrollOwners, 1);
});
verify('metric-atomicity', () => {
  assert.match(ui, /ui-metric-pair/);
  assert.match(ui, /existingPairs/);
  assert.doesNotMatch(ui, /dataset\.metricPairs === 'true'\) continue/);
});
verify('progressive-border-depth', () => {
  assert.equal(model.budgets.visibleBorderDepthMax, 2);
  assert.match(css, /border:0!important/);
});
verify('proof-disclosure-containment', () => {
  assert.match(ui, /proof-standard/);
  assert.match(css, /proof-standard\[data-ui-standard-block="true"\]/);
});
verify('placeholder-and-vocabulary', () => {
  assert.match(ui, /PLACEHOLDER_COPY/);
  for (const label of ['Uso interno','Riservato','Limitato']) assert.match(ui, new RegExp(label));
  assert.match(browser, /Descrizione\./);
});
verify('admin-isolation', () => {
  assert.match(ui, /enforceAdminIsolation/);
  assert.match(ui, /panel\.hidden = panel !== owner/);
  assert.match(browser, /admin-panel:visible/);
});
verify('responsive-contract', () => {
  for (const token of ['max-width:480px','100dvh','68ch']) assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(model.budgets.controlMinPx, 44);
  for (const token of ['320','390','zoom-200']) assert.match(browser, new RegExp(token));
});
verify('surface-coverage', () => {
  assert.equal(model.surfaces.length, 22);
  for (const surface of model.surfaces) assert.ok(saturation.coverage[surface.id]?.length, surface.id);
  assert.equal(saturation.standardCoverage.length, model.standardObligations.length);
});
verify('triple-saturation', () => {
  assert.equal(saturation.M, 109); assert.equal(saturation.MPlus100, 209); assert.equal(saturation.noveltyAfterM, 0);
  assert.equal(saturation.N, 57); assert.equal(saturation.NPlus100, 157); assert.equal(saturation.contradictionsAfterN, 0);
  assert.equal(saturation.Z, 32); assert.equal(saturation.ZPlus100, 132); assert.equal(saturation.uncoveredStandardsAtZ, 0); assert.equal(saturation.uncoveredStandardsAfterZ, 0);
});
verify('documented-dod', () => {
  assert.equal(model.definitionOfDone.length, 26);
  assert.match(docs, /non dichiara conformità WCAG/i);
  assert.match(convergenceDocs, /M = 109/); assert.match(convergenceDocs, /N = 57/); assert.match(convergenceDocs, /Z = 32/);
  assert.match(convergenceDocs, /38/);
  assert.match(convergenceDocs, /hit-testing/i);
  assert.match(convergenceDocs, /post-decision/i);
  assert.match(convergenceDocs, /supersede/i);
});

const report = {
  schemaVersion: model.schemaVersion,
  standard: model.id,
  ok: true,
  verified,
  surfaces: model.surfaces.length,
  components: model.components.length,
  runtimeFindingCount: runtimeFindings.observedFailures.length,
  effectiveModel: saturation.effectiveModel,
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
console.log(`enterprise-2-ui-standard-check: ok (${verified.length} groups, ${model.surfaces.length} surfaces, ${runtimeFindings.observedFailures.length} server-backed findings)`);
