import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { VERSION } from './version.mjs';
import { runtimeOntologyProjection } from './runtime/ontology.mjs';
import { canonicalHomeNextAction, canonicalProcedureHub } from './runtime/workbench-projection.mjs';

const root = new URL('./', import.meta.url);
const contract = JSON.parse(await readFile(new URL('semantic-api-contract.json', root), 'utf8'));
const product = JSON.parse(await readFile(new URL('product-contract.json', root), 'utf8'));
const packageManifest = JSON.parse(await readFile(new URL('../package.json', root), 'utf8'));
const server = await readFile(new URL('server.mjs', root), 'utf8');

assert.equal(contract.schemaVersion, '1.0.0');
assert.equal(contract.surface, 'GET /api/bootstrap');
assert.equal(contract.authority, 'server-runtime');
assert.equal(packageManifest.version, VERSION);
assert.match(VERSION, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);

const ontology = runtimeOntologyProjection();
assert.equal(ontology.schemaVersion, contract.fields.ontology.schemaVersion);
assert.equal(ontology.authority, 'runtime');
assert.deepEqual(Object.fromEntries(['monitoring','incidents','evidence','identity','ai'].map(id => [id, ontology.processes[id].code])), {
  monitoring: 'RN-01', incidents: 'EC-01', evidence: 'EV-01', identity: 'IA-01', ai: 'GA-01'
});

for (const binding of [
  /projected\.capabilities=\[\.\.\.\(actor\.permissions\|\|\[\]\)\]/,
  /projected\.accessProfile=accessProfileFor\(actor\)/,
  /projected\.experience\.release=VERSION/,
  /projected\.ontology=runtimeOntologyProjection\(\)/,
  /projected\.homeNextAction=canonicalHomeNextAction\(/,
  /projected\.procedures=canonicalProcedureHub\(/
]) assert.match(server, binding, `bootstrap derivation binding missing: ${binding}`);

const emptyState = { missions: [], catalog: [], contributions: [], incidents: [], users: [] };
const readiness = { controls: [], verified: 0 };
const roles = Object.fromEntries(product.roles.map(role => [role.id, role]));
const requiredNext = contract.fields.homeNextAction.required;
const requiredProcedure = contract.fields.procedures.required;

for (const roleId of ['admin','user','auditor']) {
  const role = roles[roleId];
  assert.ok(role, `missing product role ${roleId}`);
  const actor = { id: `contract-${roleId}`, role: roleId, permissions: role.permissions };
  const next = canonicalHomeNextAction(emptyState, actor, { llmReady: false });
  assert.equal(next.schemaVersion, contract.fields.homeNextAction.schemaVersion);
  for (const field of requiredNext) assert.ok(Object.hasOwn(next, field), `${roleId} next action missing ${field}`);
  assert.equal(next.readOnly, roleId === 'auditor');

  const procedures = canonicalProcedureHub(emptyState, actor, { readiness });
  assert.ok(procedures.length >= 3, `${roleId} procedure hub too small`);
  for (const item of procedures) {
    assert.equal(item.schemaVersion, contract.fields.procedures.itemSchemaVersion);
    for (const field of requiredProcedure) assert.ok(Object.hasOwn(item, field), `${item.id} missing ${field}`);
    const process = ontology.processes[item.id];
    assert.ok(process, `procedure ${item.id} absent from runtime ontology`);
    assert.equal(item.label, process.label);
    assert.equal(item.code, process.code);
  }
  assert.equal(procedures.some(item => item.id === 'administration'), roleId === 'admin');
}

assert.ok(contract.limitations.length >= 2);
assert.match(contract.ratchetRule, /extend/i);
console.log(`semantic-api-contract-check: ok (${contract.id}, release ${VERSION})`);
