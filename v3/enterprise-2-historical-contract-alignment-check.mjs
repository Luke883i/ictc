import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const model = JSON.parse(await read('./enterprise-2-historical-contract-alignment.json'));
const designCheck = await read('./enterprise-2-design-system-check.mjs');
const browser = await read('./browser-product-check.py');
const verified = [];

function verify(name, assertion) {
  try { assertion(); verified.push(name); }
  catch (error) {
    const message = String(error.message || error).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    console.error(`::error title=historical-contract-alignment:${name}::${message}`);
    throw error;
  }
}

function ordered(text, tokens) {
  let cursor = -1;
  for (const token of tokens) {
    const next = text.indexOf(token, cursor + 1);
    assert.ok(next > cursor, `missing or out-of-order token: ${token}`);
    cursor = next;
  }
}

verify('model-boundary', () => {
  assert.equal(model.id, 'ictc-historical-contract-alignment-1');
  assert.equal(model.parentStandard, 'ictc-surface-standard-1');
  assert.equal(model.runtimeMutation, false);
  assert.equal(model.invariants.length, 6);
  assert.equal(model.observedFailures.length, 2);
  assert.equal(model.preventiveAlignments.length, 2);
  assert.match(model.claimBoundary, /does not establish/i);
});

verify('saturation-preserved', () => {
  assert.deepEqual([model.saturationImpact.M, model.saturationImpact.MPlus100, model.saturationImpact.noveltyAfterM], [106, 206, 0]);
  assert.deepEqual([model.saturationImpact.N, model.saturationImpact.NPlus100, model.saturationImpact.contradictionsAfterN], [54, 154, 0]);
  assert.deepEqual([model.saturationImpact.Z, model.saturationImpact.ZPlus100, model.saturationImpact.uncoveredStandardsAfterZ], [30, 130, 0]);
  assert.deepEqual([model.saturationImpact.deltaM, model.saturationImpact.deltaN, model.saturationImpact.deltaZ], [0, 0, 0]);
});

verify('semantic-token-consumer', () => {
  assert.ok(designCheck.includes("'--ds-ease:'"), 'design-system check must validate --ds-ease:');
  assert.ok(!designCheck.includes("'--ds-ease;'"), 'stale --ds-ease; literal must be absent');
});

verify('progressive-settings-sequencing', () => {
  ordered(browser, [
    'open_disclosure(organization_section)',
    'settings.locator(\'input[name="organizationName"]\').fill(\'Azienda Browser\')',
    'settings.locator(\'input[name="jurisdictions"]\').fill(\'Italia, Unione europea\')',
    'open_disclosure(provider_section)',
    'settings.locator(\'input[name="endpoint"]\').fill',
    'settings.locator(\'input[name="apiKeyEnv"]\').fill',
    "settings.get_by_role('button', name='Salva configurazione AI').click()"
  ]);
  assert.ok(browser.includes("assert settings.locator('[data-settings-section][open]').count() == 1"));
});

verify('progressive-job-sequencing', () => {
  ordered(browser, [
    'criteria_section = job.locator(\'[data-job-config-group="criteria"]\')',
    'schedule_section = job.locator(\'[data-job-config-group="schedule"]\')',
    'open_disclosure(scope_section)',
    'job.locator(\'input[name="jobName"]\').fill',
    'open_disclosure(criteria_section)',
    'job.locator(\'input[name="authorities"]\').fill',
    'open_disclosure(schedule_section)',
    'job.locator(\'input[name="sourceHints"]\').fill',
    "job.get_by_role('button', name='Genera piano').click()"
  ]);
  assert.ok(browser.includes("assert job.locator(':scope > .job-config-group[open]').count() == 1"));
});

verify('canonical-terminal-vocabulary', () => {
  for (const token of [
    "get_by_role('button', name='Accetta nel catalogo')",
    "get_by_text('Accettata nel catalogo', exact=False)",
    "get_by_role('button', name='Scarica evidenza')"
  ]) assert.ok(browser.includes(token), token);
  for (const stale of [
    "get_by_role('button', name='Verifica fonte')",
    "get_by_text('Verificata', exact=False)",
    "get_by_role('button', name='Scarica prova')"
  ]) assert.ok(!browser.includes(stale), stale);
});

const report = {
  schemaVersion: model.schemaVersion,
  alignment: model.id,
  ok: true,
  verified,
  observedFailures: model.observedFailures,
  preventiveAlignments: model.preventiveAlignments,
  saturationImpact: model.saturationImpact,
  runtimeMutation: model.runtimeMutation,
  claimBoundary: model.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-ui-standard-historical-contract-alignment.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`historical-contract-alignment: ok (${verified.length} groups, delta M/N/Z = 0/0/0)`);
