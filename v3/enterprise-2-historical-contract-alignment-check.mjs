import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const model = JSON.parse(await read('./enterprise-2-historical-contract-alignment.json'));
const designCheck = await read('./enterprise-2-design-system-check.mjs');
const browser = await read('./browser-product-check.py');
const enterprise18Browser = await read('./browser-enterprise-1-8-check.py');
const enterprise2Browser = await read('./browser-enterprise-2-check.py');
const standardBrowser = await read('./browser-enterprise-2-ui-standard-check.py');
const standardCss = `${await read('./public/enterprise-2-ui-standard.css')}\n${await read('./public/enterprise-2-ui-standard-runtime-refinement.css')}`;
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
  assert.equal(model.invariants.length, 12);
  assert.equal(model.observedFailures.length, 8);
  assert.equal(model.preventiveAlignments.length, 6);
  assert.match(model.claimBoundary, /does not establish/i);
});
verify('saturation-escalated', () => {
  assert.deepEqual([model.saturationImpact.M, model.saturationImpact.MPlus100, model.saturationImpact.noveltyAfterM], [108, 208, 0]);
  assert.deepEqual([model.saturationImpact.N, model.saturationImpact.NPlus100, model.saturationImpact.contradictionsAfterN], [56, 156, 0]);
  assert.deepEqual([model.saturationImpact.Z, model.saturationImpact.ZPlus100, model.saturationImpact.uncoveredStandardsAfterZ], [31, 131, 0]);
  assert.deepEqual([model.saturationImpact.deltaM, model.saturationImpact.deltaN, model.saturationImpact.deltaZ], [2, 2, 1]);
});
verify('semantic-token-consumer', () => {
  assert.ok(designCheck.includes("'--ds-ease:'"));
  assert.ok(!designCheck.includes("'--ds-ease;'"));
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
  assert.ok(browser.includes("get_by_text('Accettata nel catalogo', exact=False)"));
});
verify('canonical-terminal-vocabulary', () => {
  for (const token of ["get_by_role('button', name='Accetta nel catalogo')", "get_by_text('Accettata nel catalogo', exact=False)", "get_by_role('button', name='Scarica evidenza')"]) assert.ok(browser.includes(token), token);
  for (const stale of ["get_by_role('button', name='Verifica fonte')", "get_by_text('Verificata', exact=False)", "get_by_role('button', name='Scarica prova')"]) assert.ok(!browser.includes(stale), stale);
});
verify('enterprise-1-8-terminal-consumer', () => {
  for (const token of [
    "page.title() == 'ICTC · Attività, evidenze e controlli'",
    "['Panoramica', 'Monitoraggio normativo', 'Eventi e segnalazioni', 'Evidenze e controlli']",
    "contains(page.locator('[data-lane=\"monitoring\"]'), 'Monitoraggio normativo')",
    "contains(page.locator('[data-lane=\"incidents\"]'), 'Eventi e segnalazioni')",
    "get_by_role('button', name='Scarica evidenza')"
  ]) assert.ok(enterprise18Browser.includes(token), token);
  assert.ok(enterprise18Browser.includes("expect(settings.locator('[data-settings-section][open]')).to_have_count(1)"));
  for (const budget of ["home['height'] <= 760", "recommendation['height'] <= 150", "hero['height'] <= 280", "queue['y'] < 720", "overflow <= 1", "box['height'] >= 44"]) assert.ok(enterprise18Browser.includes(budget), budget);
});
verify('enterprise-2-s01-actor-consistency', () => {
  assert.ok(enterprise2Browser.includes("localStorage.setItem('ictc-role','auditor')"));
  const s01 = phase(enterprise2Browser, "PHASE = 'S01-home-auditor-summary'", "PHASE = 'S02-home-auditor-method'");
  assert.ok(!s01.includes("select_option('user')"));
  assert.ok(s01.includes("'Consulta attività ed evidenze'"));
  assert.ok(s01.includes("'Sola lettura'"));
  const s04 = phase(enterprise2Browser, "PHASE = 'S04-monitoring-user'", "PHASE = 'S05-events-user-empty-or-list'");
  assert.ok(s04.includes("page.locator('#roleSelect').select_option('user')"));
});
verify('enterprise-2-semantic-process-copy', () => {
  const s01 = phase(enterprise2Browser, "PHASE = 'S01-home-auditor-summary'", "PHASE = 'S02-home-auditor-method'");
  const s04 = phase(enterprise2Browser, "PHASE = 'S04-monitoring-user'", "PHASE = 'S05-events-user-empty-or-list'");
  const s05 = phase(enterprise2Browser, "PHASE = 'S05-events-user-empty-or-list'", "PHASE = 'S06-guide-proof'");
  for (const [name, block, expected] of [
    ['S01', s01, ['RN-01 · Monitoraggio normativo', 'EC-01 · Gestione eventi e segnalazioni']],
    ['S04', s04, ['RN-01 · Monitoraggio normativo']],
    ['S05', s05, ['EC-01 · Gestione eventi e segnalazioni']]
  ]) {
    assert.ok(block.includes('.text_content().strip()'), `${name} process vocabulary must read DOM text content`);
    for (const token of expected) assert.ok(block.includes(`'${token}'`), `${name}:${token}`);
  }
});
verify('enterprise-2-stable-admin-observation', () => {
  const s08 = phase(enterprise2Browser, "PHASE = 'S08-admin-controls'", "PHASE = 'S09-admin-ai'");
  const s09 = phase(enterprise2Browser, "PHASE = 'S09-admin-ai'", "PHASE = 'S10-admin-local-users-mobile'");
  const s10 = phase(enterprise2Browser, "PHASE = 'S10-admin-local-users-mobile'", "PHASE = 'keyboard-escape-focus-return'");
  for (const [name, block] of [['S08', s08], ['S09', s09], ['S10', s10]]) assert.ok(block.includes('wait_for_timeout(360)'), `${name} must observe after terminal reconciliation`);
  assert.ok(s08.includes("#adminCenter .admin-panel:visible').count() == 1"));
});
verify('admin-navigation-target-budget', () => {
  assert.match(standardCss, /#adminCenter \.admin-section-nav button\{[^}]*min-height:var\(--uis-control\)!important/);
  assert.ok(standardBrowser.includes("'admin-nav-min-target'"));
  const s10 = phase(enterprise2Browser, "PHASE = 'S10-admin-local-users-mobile'", "PHASE = 'keyboard-escape-focus-return'");
  assert.ok(s10.includes("assert_targets(page, ['.admin-section-nav button[aria-current=\"page\"]', '[data-admin-close]'])"));
});

const report = {schemaVersion:model.schemaVersion, alignment:model.id, ok:true, verified, observedFailures:model.observedFailures, preventiveAlignments:model.preventiveAlignments, saturationImpact:model.saturationImpact, runtimeMutation:model.runtimeMutation, claimBoundary:model.claimBoundary};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-ui-standard-historical-contract-alignment.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`historical-contract-alignment: ok (${verified.length} groups, delta M/N/Z = 2/2/1)`);