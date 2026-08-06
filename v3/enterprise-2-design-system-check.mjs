import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

await import('./enterprise-2-design-system-saturation.mjs');

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const model = JSON.parse(await read('./enterprise-2-design-system-model.json'));
const ui = await read('./public/ui/enterprise-2-design-system.js');
const css = `${await read('./public/enterprise-2-design-system.css')}\n${await read('./public/enterprise-2-design-system-refinement.css')}`;
const app = await read('./public/app.js');
const styles = await read('./public/styles.css');
const browser = await read('./browser-enterprise-2-check.py');
const docs = await read('../docs/ENTERPRISE_2_DESIGN_SYSTEM.md');
const saturation = JSON.parse(await read('../artifacts/enterprise-2-design-system-saturation.json'));
const verified = [];

function verify(name, assertion) {
  try { assertion(); verified.push(name); }
  catch (error) {
    const message = String(error.message || error).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    console.error(`::error title=enterprise-2-design-system:${name}::${message}`);
    throw error;
  }
}

verify('javascript-syntax', () => {
  execFileSync(process.execPath, ['--check', new URL('./public/ui/enterprise-2-design-system.js', import.meta.url).pathname], { stdio: 'pipe' });
});
verify('model-shape', () => {
  assert.equal(model.id, 'ictc-aurora-1');
  assert.equal(model.tokenFamilies.length, 8);
  assert.ok(model.components.length >= 16);
  assert.ok(model.surfaces.length >= 17);
  assert.ok(model.invariants.length >= 16);
  assert.equal(model.budgets.targetMinCssPx, 44);
  assert.equal(model.budgets.maxPrimaryActionsPerContext, 1);
  assert.match(model.claimBoundary, /does not establish/i);
});
verify('terminal-wiring', () => {
  assert.match(app, /enterprise-2-design-system\.js/);
  assert.match(app, /installEnterprise2DesignSystem\(\)/);
  assert.ok(app.indexOf('installEnterprise2DesignSystem()') > app.indexOf('installEnterprise2EditorialSystem()'));
  assert.match(styles, /enterprise-2-design-system\.css/);
  assert.match(styles, /enterprise-2-design-system-refinement\.css/);
  assert.ok(styles.indexOf('enterprise-2-design-system.css') > styles.indexOf('enterprise-2-editorial.css'));
  assert.ok(styles.indexOf('enterprise-2-design-system-refinement.css') > styles.indexOf('enterprise-2-design-system.css'));
});
verify('authority-safe-js', () => {
  assert.doesNotMatch(ui, /\bfetch\s*\(/);
  assert.doesNotMatch(ui, /\bapi\s*\(/);
  assert.doesNotMatch(ui, /localStorage|sessionStorage/);
  assert.doesNotMatch(ui, /new\s+MutationObserver/);
  assert.doesNotMatch(ui, /\.focus\s*\(/);
  assert.doesNotMatch(ui, /permissions|capabilities\s*=/);
  assert.match(ui, /ictc:surface-changed/);
  assert.match(ui, /prefers-reduced-motion/);
  assert.match(ui, /data\.priority|dataset\.priority/);
  assert.match(ui, /data\.tone|dataset\.tone/);
});
verify('semantic-token-system', () => {
  for (const token of ['--ds-ink:', '--ds-canvas:', '--ds-accent:', '--ds-shadow-1:', '--ds-radius:', '--ds-ease:']) assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  for (const accent of ['cyan', 'amber', 'violet']) assert.match(css, new RegExp(`data-ds-accent="${accent}"`));
  assert.doesNotMatch(css, /@import\s+url\(['"]?https?:/i);
  assert.match(css, /font-family:var\(--ds-font\)/);
});
verify('interaction-hierarchy', () => {
  assert.match(ui, /openJobConfig: 'primary'/);
  assert.match(ui, /openIncident: 'primary'/);
  assert.match(ui, /openProofDetails: 'primary'/);
  assert.match(css, /button\[data-priority="primary"\]/);
  assert.match(css, /button\[data-priority="quiet"\]/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-height:44px/);
});
verify('bounded-motion', () => {
  assert.match(ui, /duration: 260/);
  assert.match(ui, /duration: 220/);
  assert.match(ui, /duration: 180/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /animation-delay:calc\(var\(--ds-stagger-index,0\)\s*\*?\s*22ms\)/);
  assert.match(docs, /do not change focus|non cambia.*focus|focus/iu);
});
verify('preference-and-accessibility-guards', () => {
  assert.match(css, /prefers-color-scheme:dark/);
  assert.match(css, /forced-colors:active/);
  assert.match(css, /HighlightText/);
  assert.match(css, /outline:3px solid/);
  assert.match(css, /@media\(max-width:420px\)/);
  assert.match(css, /service-nav\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /proof-standard>summary>span:not\(\.ds-disclosure-mark\)/);
  assert.match(css, /home-recommendation>button\{align-self:center/);
  assert.match(css, /@media\(max-width:760px\)/);
});
verify('browser-evidence', () => {
  assert.match(browser, /data-design-system="ictc-aurora-1"/);
  assert.match(browser, /data-priority/);
  assert.match(browser, /data-tone/);
  assert.match(browser, /reduced_motion='reduce'/);
  assert.match(browser, /color_scheme='dark'/);
  assert.match(browser, /no_overflow/);
});
verify('saturation-convergence', () => {
  assert.equal(saturation.M, 96);
  assert.equal(saturation.MPlus100, 196);
  assert.equal(saturation.noveltyAfterM, 0);
  assert.equal(saturation.contradictionsAfterM, 0);
  assert.equal(saturation.scenarios.length, 196);
  assert.equal(saturation.scenarios.slice(saturation.M).flatMap(item => item.novelty).length, 0);
});
verify('claim-boundary', () => {
  assert.match(docs, /does not establish|non.*stabilisce|non.*certifica/iu);
  assert.match(docs, /not a substitute|non.*sostituisce/iu);
  assert.match(model.claimBoundary, /accessibility conformance|legal compliance|production readiness/i);
});

const report = {
  schemaVersion: model.schemaVersion,
  designSystem: model.id,
  ok: true,
  verified,
  tokenFamilies: model.tokenFamilies,
  componentCount: model.components.length,
  surfaceCount: model.surfaces.length,
  invariantCount: model.invariants.length,
  budgets: model.budgets,
  saturation: {
    M: saturation.M,
    MPlus100: saturation.MPlus100,
    noveltyAfterM: saturation.noveltyAfterM,
    contradictionsAfterM: saturation.contradictionsAfterM
  },
  claimBoundary: model.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-design-system-check.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-design-system-check: ok (${verified.length} groups, ${report.surfaceCount} surfaces, M=${saturation.M}, M+100=${saturation.MPlus100})`);
