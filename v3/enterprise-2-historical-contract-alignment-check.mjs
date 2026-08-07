import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const model = JSON.parse(await read('./enterprise-2-historical-contract-alignment.json'));
const designCheck = await read('./enterprise-2-design-system-check.mjs');
const browser = await read('./browser-product-check.py');
const enterprise18Browser = await read('./browser-enterprise-1-8-check.py');
const enterprise2Browser = await read('./browser-enterprise-2-check.py');
const actions = await read('./public/ui/actions.js');
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

function phase(text, start, end) {
  const from = text.indexOf(start);
  const to = text.indexOf(end, from + start.length);
  assert.ok(from >= 0, `missing phase ${start}`);
  assert.ok(to > from, `missing phase boundary ${end}`);
  return text.slice(from, to);
}

verify('model-boundary', () => {
  assert.equal(model.id, 'ictc-historical-contract-alignment-1');
  assert.equal(model.parentStandard, 'ictc-surface-standard-1');
  assert.equal(model.runtimeMutation, true);
  assert.equal(model.invariants.length, 10);
  assert.equal(model.observedFailures.length, 6);
  assert.equal(model.preventiveAlignments.length, 4);
  assert.match(model.claimBoundary, /does not establish/i);
});

verify('saturation-escalated', () => {
  assert.deepEqual([model.saturationImpact.M, model.saturationImpact.MPlus100, model.saturationImpact.noveltyAfterM], [107, 207, 0]);
  assert.deepEqual([model.saturationImpact.N, model.saturationImpact.NPlus100, model.saturationImpact.contradictionsAfterN], [55, 155, 0]);
  assert.deepEqual([model.saturationImpact.Z, model.saturationImpact.ZPlus100, model.saturationImpact.uncoveredStandardsAfterZ], [31, 131, 0]);
  assert.deepEqual([model.saturationImpact.deltaM, model.saturationImpact.deltaN, model.saturationImpact.deltaZ], [1, 1, 1]);
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
});

verify('stable-toggle-observation', () => {
  assert.ok(browser.includes('from playwright.sync_api import expect, sync_playwright'));
  assert.ok(browser.includes("expect(section).to_have_attribute('open', '')"));
  assert.ok(browser.includes("expect(settings.locator('[data-settings-section][open]')).to_have_count(1)"));
  assert.ok(browser.includes("expect(job.locator(':scope > .job-config-group[open]')).to_have_count(1)"));
  assert.ok(!browser.includes('time.sleep('));
});

verify('post-decision-terminal-reconciliation', () => {
  assert.match(actions, /renderSourceDialog\(\);\s*document\.dispatchEvent\(new CustomEvent\('ictc:surface-changed'/s);
  assert.match(actions, /surface:\s*'source-dialog'/);
  assert.match(actions, /reason:\s*'source-decision'/);
  assert.ok(browser.includes("get_by_role('button', name='Accetta nel catalogo')"));
  assert.ok(browser.includes("get_by_text('Accettata nel catalogo', exact=False)"));
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

verify('enterprise-1-8-terminal-consumer', () => {
  assert.ok(enterprise18Browser.includes('from playwright.sync_api import expect, sync_playwright'));
  for (const token of [
    "page.title() == 'ICTC · Attività, evidenze e controlli'",
    "['Panoramica', 'Monitoraggio normativo', 'Eventi e segnalazioni', 'Evidenze e controlli']",
    "contains(page.locator('[data-lane=\"monitoring\"]'), 'Monitoraggio normativo')",
    "contains(page.locator('[data-lane=\"incidents\"]'), 'Eventi e segnalazioni')",
    "contains(page.locator('#monitoringView h1'), 'Monitoraggio normativo')",
    "contains(page.locator('#incidentsView h1'), 'Eventi e segnalazioni')",
    "get_by_role('button', name='Scarica evidenza')"
  ]) assert.ok(enterprise18Browser.includes(token), token);
  assert.ok(enterprise18Browser.includes("expect(settings.locator('[data-settings-section][open]')).to_have_count(1)"));
  assert.ok(enterprise18Browser.includes("get_by_role('button', name='Salva configurazione AI')"));
  for (const stale of ['ICTC 1.8 · Enterprise Workbench', "'Ricerca normativa'", "'Eventi e incidenti'", "'Guida e prove'", "name='Scarica prova'"]) assert.ok(!enterprise18Browser.includes(stale), stale);
  for (const budget of ["home['height'] <= 760", "recommendation['height'] <= 150", "hero['height'] <= 280", "queue['y'] < 720", "overflow <= 1", "box['height'] >= 44"]) assert.ok(enterprise18Browser.includes(budget), budget);
});

verify('enterprise-2-s01-actor-consistency', () => {
  assert.ok(enterprise2Browser.includes("localStorage.setItem('ictc-role','auditor')"));
  const s01 = phase(enterprise2Browser, "PHASE = 'S01-home-auditor-summary'", "PHASE = 'S02-home-auditor-method'");
  assert.ok(!s01.includes("select_option('user')"), 'S01 auditor scenario cannot switch to user');
  assert.ok(s01.includes("'Consulta attività ed evidenze'"));
  assert.ok(s01.includes("'Sola lettura'"));
  const s04 = phase(enterprise2Browser, "PHASE = 'S04-monitoring-user'", "PHASE = 'S05-events-user-empty-or-list'");
  assert.ok(s04.includes("page.locator('#roleSelect').select_option('user')"), 'S04 must be the explicit user transition');
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
console.log(`historical-contract-alignment: ok (${verified.length} groups, delta M/N/Z = 1/1/1)`);