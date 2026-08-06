import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const processUi = await readFile(new URL('./public/ui/enterprise-2-processes.js', import.meta.url), 'utf8');
const app = await readFile(new URL('./public/app.js', import.meta.url), 'utf8');
const browser = await readFile(new URL('./browser-enterprise-2-check.py', import.meta.url), 'utf8');
const check = await readFile(new URL('./enterprise-2-check.mjs', import.meta.url), 'utf8');
const docs = await readFile(new URL('../docs/ENTERPRISE_2_PROCESS_CATALOG.md', import.meta.url), 'utf8');

const catalog = {
  'RN-01': 'Monitoraggio normativo',
  'EC-01': 'Gestione eventi di conformità',
  'EV-01': 'Evidenze e verifiche',
  'IA-01': 'Identità e accessi',
  'GA-01': 'Governo dei servizi AI'
};
for (const [code, name] of Object.entries(catalog)) {
  for (const source of [processUi, browser, check, docs]) {
    assert.ok(source.includes(code), `${code} missing`);
  }
  assert.ok(processUi.includes(name), `${name} missing from runtime`);
  assert.ok(docs.includes(name), `${name} missing from documentation`);
}
assert.match(app, /installEnterprise2ProcessArchitecture/);
assert.doesNotMatch(app, /enterprise-2-admin-nav/);
assert.match(processUi, /activeRole === 'auditor' \? \[proof, method\]/);
assert.match(processUi, /candidate\.hidden = candidate !== panel/);
assert.match(browser, /get_by_text\('Processo 1', exact=True\)\.count\(\) == 0/);
assert.match(browser, /get_by_text\('Processo 2', exact=True\)\.count\(\) == 0/);
assert.match(browser, /admin-panel:visible/);
console.log('enterprise-2-process-slice-local-check: ok (5 named processes, role disclosure, single admin surface)');
