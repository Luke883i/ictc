import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runtimeOntologyProjection } from './runtime/ontology.mjs';

const ontology = runtimeOntologyProjection();
const processUi = await readFile(new URL('./public/ui/enterprise-2-processes.js', import.meta.url), 'utf8');
const app = await readFile(new URL('./public/app.js', import.meta.url), 'utf8');
const browser = await readFile(new URL('./browser-enterprise-2-check.py', import.meta.url), 'utf8');
const check = await readFile(new URL('./enterprise-2-check.mjs', import.meta.url), 'utf8');
const docs = await readFile(new URL('../docs/ENTERPRISE_2_PROCESS_CATALOG.md', import.meta.url), 'utf8');

const processIds = ['monitoring','incidents','evidence','identity','ai'];
for (const id of processIds) {
  const term = ontology.processes[id];
  assert.ok(term?.code, `${id} code missing from runtime ontology`);
  assert.ok(term?.label, `${id} label missing from runtime ontology`);
  for (const source of [browser, check, docs]) assert.ok(source.includes(term.code), `${term.code} missing`);
  assert.ok(browser.includes(term.code), `${term.code} missing from browser witness`);
  assert.ok(docs.includes(term.label), `${term.label} missing from documentation`);
}
assert.match(processUi, /state\.data\?\.ontology\?\.processes/);
assert.match(processUi, /ontologyAuthority/);
assert.doesNotMatch(processUi, /ENTERPRISE_PROCESS_CATALOG/);
assert.match(app, /installEnterprise2ProcessArchitecture/);
assert.doesNotMatch(app, /enterprise-2-admin-nav/);
assert.match(processUi, /activeRole === 'auditor' \? \[proof, method\]/);
assert.match(processUi, /candidate\.hidden = candidate !== panel/);
assert.match(browser, /get_by_text\('Processo 1', exact=True\)\.count\(\) == 0/);
assert.match(browser, /get_by_text\('Processo 2', exact=True\)\.count\(\) == 0/);
assert.match(browser, /admin-panel:visible/);
console.log('enterprise-2-process-slice-local-check: ok (runtime ontology authority, 5 named processes, role disclosure, single admin surface)');
