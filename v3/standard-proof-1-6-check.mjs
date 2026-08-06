import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const contract = JSON.parse(await read('./standard-proof-1-6-contract.json'));
const projection = await read('./standard-proof.mjs');
const server = await read('./server.mjs');
const app = await read('./public/app.js');
const ui = await read('./public/ui/standard-proof-1-6.js');
const css = await read('./public/standard-proof-1-6.css');
const styles = await read('./public/styles.css');
const browser = await read('./browser-standard-proof-check.py');
const audit = await read('../docs/STANDARD_PROOF_1_6_AUDIT.md');
const version = await read('./version.mjs');
const pkg = JSON.parse(await read('../package.json'));
const lock = JSON.parse(await read('../package-lock.json'));
const claims = JSON.parse(await read('./enterprise-claims.json'));
const verified = [];

function verify(name, assertion) {
  try {
    assertion();
    verified.push(name);
  } catch (error) {
    const message = String(error.message || error).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    console.error(`::error title=standard-proof-1-6:${name}::${message}`);
    throw error;
  }
}

verify('contract-shape', () => {
  assert.equal(contract.schemaVersion, '1.6.0');
  assert.equal(contract.release, '1.6.0');
  assert.equal(contract.personas.length, 5);
  assert.equal(contract.auditDimensions.length, 14);
  assert.equal(contract.benchmarkFamilies.length, contract.metrics.standardsMapped);
  assert.equal(contract.architecture.length, contract.metrics.architectureLayers);
  assert.equal(contract.glossary.length, contract.metrics.glossaryTerms);
  assert.ok(contract.universalInvariants.length >= 20);
});

verify('standards-honesty', () => {
  const allowed = new Set(['implemented-baseline', 'aligned-and-evidenced', 'external-validation-required', 'practice-inspired', 'context-only']);
  for (const item of contract.benchmarkFamilies) {
    assert.ok(allowed.has(item.alignment), item.id);
    assert.match(item.officialUrl, /^https:\/\//, item.id);
    assert.ok(item.principle.length > 40, item.id);
    assert.ok(item.ictcPractice.length > 40, item.id);
    assert.ok(item.evidence.length >= 2, item.id);
    assert.ok(item.limit.length > 40, item.id);
  }
  assert.match(contract.claimBoundary, /No legal opinion|No legal/i);
  assert.doesNotMatch(JSON.stringify(contract.benchmarkFamilies.map(item => item.alignment)), /certified|compliant/i);
});

verify('saturation-and-compression', () => {
  const scenarioCount = Object.values(contract.dimensions).reduce((total, values) => total * values.length, 1);
  assert.equal(scenarioCount, 787320);
  assert.equal(contract.saturation.M, scenarioCount + contract.saturation.stabilityWindow);
  assert.equal(contract.saturation.MPlus100, contract.saturation.M + 100);
  assert.equal(contract.compression.NPlus100, contract.compression.N + 100);
  assert.equal(contract.metrics.MPlus100Novelty, 0);
  assert.equal(contract.metrics.NPlus100Novelty, 0);
});

verify('canonical-runtime-projection', () => {
  assert.match(projection, /standardProofProjection/);
  assert.match(projection, /accessProfileFor/);
  assert.match(projection, /scope !== 'deployment'/);
  assert.match(projection, /scope === 'deployment'/);
  assert.match(server, /GET'&&pathname==='\/api\/standard-proof'/);
  assert.match(server, /standardProofProjection/);
  assert.match(server, /requirePermission\(actor,'read'/);
  assert.doesNotMatch(projection, /apiKeyEnv|temperature|promptOverride/);
});

verify('support-surface-not-domain', () => {
  assert.equal(contract.metrics.operationalServices, 2);
  assert.match(server, /services:\['monitoring','incidents'\]/);
  assert.match(server, /supportSurfaces:\['standard-proof'\]/);
  assert.match(ui, /data-proof-service="proof"/);
  assert.doesNotMatch(ui, /data-service="proof"/);
});

verify('complete-onboarding', () => {
  for (const id of ['proofStart', 'proofArchitecture', 'proofJourneys', 'proofStandards', 'proofGlossary', 'proofLimits']) assert.match(ui, new RegExp(`id="${id}"`));
  for (const phrase of ['ICTC in tre risposte', 'Otto strati, una sola fonte di verità', 'Standard e pratiche di ispirazione', 'Parole che non sono sinonimi', 'Cosa questa prova non dimostra']) assert.match(ui, new RegExp(phrase));
  assert.match(ui, /proofLoading/);
  assert.match(ui, /proofError/);
  assert.match(ui, /retryProof/);
  assert.match(ui, /target="_blank" rel="noopener noreferrer"/);
});

verify('minimal-admin-enrichment', () => {
  assert.equal((ui.match(/id="adminProofPanel"/g) || []).length, 1);
  assert.match(ui, /Postura e confini/);
  assert.match(ui, /Controlli runtime/);
  assert.match(ui, /Gap deployment/);
  assert.doesNotMatch(ui, /method:\s*['"](?:POST|PUT|PATCH|DELETE)/);
});

verify('design-system-and-accessibility', () => {
  assert.match(styles, /@import url\('\.\/stable-1-4\.css'\);\n@import url\('\.\/standard-proof-1-6\.css'\);\n\n\/\* Final/);
  for (const alias of ['--ink:var(--color-text)', '--muted:var(--color-muted)', '--line:var(--color-border)', '--accent:var(--color-brand)']) assert.match(css, new RegExp(alias.replace(/[()*]/g, '\\$&')));
  assert.match(css, /outline:3px solid var\(--color-brand\)/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /forced-colors:active/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /overflow-x:auto/);
  assert.doesNotMatch(css, /outline:none/);
  assert.match(browser, /document\.documentElement\.scrollWidth/);
  assert.match(browser, /bounding_box/);
});

verify('label-ontology', () => {
  const terms = new Set(contract.glossary.map(item => item.term));
  for (const term of ['Materiale', 'Fonte', 'Evidenza', 'Fascicolo', 'Receipt', 'Trace AI', 'Decisione umana', 'Attestazione', 'Standard proof']) assert.ok(terms.has(term), term);
  assert.match(ui, /Aggiungi materiale/);
  assert.match(ui, /Fascicoli evento/);
  assert.doesNotMatch(ui, />Aggiungi una fonte</);
});

verify('release-identity', () => {
  assert.match(version, /'1\.6\.0'/);
  assert.equal(pkg.version, '1.6.0');
  assert.equal(lock.version, '1.6.0');
  assert.equal(lock.packages[''].version, '1.6.0');
  assert.equal(claims.release, '1.6.0');
  assert.match(app, /installStandardProof16Experience/);
  assert.match(audit, /1\.6\.0 Standard Proof/);
});

verify('browser-assurance', () => {
  for (const phrase of ['proof-admin', 'proof-user', 'proof-auditor', 'proof-mobile-reflow', 'proof-keyboard-entry']) assert.match(browser, new RegExp(phrase));
});

const report = {
  schemaVersion: contract.schemaVersion,
  model: contract.model,
  ok: true,
  verified,
  metrics: contract.metrics,
  saturation: contract.saturation,
  compression: contract.compression,
  limitation: contract.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/standard-proof-1-6-audit.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`standard-proof-1-6-check: ok (${verified.length} contract groups, ${contract.benchmarkFamilies.length} benchmark mappings)`);
