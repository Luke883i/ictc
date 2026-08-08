import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { objectTerm, processTerm, procedureActionLabel, runtimeOntologyProjection, stateTerm } from './runtime/ontology.mjs';
import { canonicalProcedureHub } from './runtime/workbench-projection.mjs';
import { runtimeHarness } from './runtime-test-harness.mjs';

const checks = [];
const verify = (name, assertion) => { assertion(); checks.push(name); };
const ontology = runtimeOntologyProjection();

verify('ontology-contract', () => {
  assert.equal(ontology.schemaVersion, '1.0.0');
  assert.equal(ontology.locale, 'it');
  assert.equal(ontology.authority, 'runtime');
  assert.deepEqual(['monitoring','incidents','evidence','administration','identity','ai'].map(id => ontology.processes[id]?.id), ['monitoring','incidents','evidence','administration','identity','ai']);
  assert.equal(processTerm('incidents').code, 'EC-01');
  assert.equal(processTerm('incidents').label, 'Gestione eventi e segnalazioni');
  assert.equal(objectTerm('source').singular, 'Fonte');
  assert.equal(objectTerm('material').plural, 'Materiali');
  assert.equal(stateTerm('source', 'candidate'), 'Da valutare');
  assert.equal(stateTerm('source', 'verified'), 'Accettata nel catalogo');
  assert.equal(procedureActionLabel('monitoring', 'auditor'), 'Consulta monitoraggio');
  assert.throws(() => processTerm('invented'), error => error.code === 'runtime-ontology-missing-term');
});

const editorialModel = JSON.parse(await readFile(new URL('./enterprise-2-editorial-model.json', import.meta.url), 'utf8'));
verify('editorial-vocabulary-matches-runtime', () => {
  const ids = ['monitoring','incidents','evidence','identity','ai'];
  for (const id of ids) {
    const term = ontology.processes[id];
    assert.equal(editorialModel.canonicalVocabulary[term.code], term.label);
  }
  assert.equal(editorialModel.sourceStateVocabulary.candidate, ontology.states.source.candidate);
  assert.equal(editorialModel.sourceStateVocabulary.verified, ontology.states.source.verified);
  assert.equal(editorialModel.sourceStateVocabulary.rejected, ontology.states.source.rejected);
});

const processUi = await readFile(new URL('./public/ui/enterprise-2-processes.js', import.meta.url), 'utf8');
verify('browser-process-architecture-consumes-runtime-ontology', () => {
  assert.match(processUi, /state\.data\?\.ontology\?\.processes/);
  assert.match(processUi, /ontologyAuthority/);
  assert.doesNotMatch(processUi, /ENTERPRISE_PROCESS_CATALOG/);
});

const pureState = { missions: [], catalog: [], contributions: [], incidents: [], users: [] };
const pureReadiness = { verified: 0, controls: [] };
verify('procedure-hub-is-bound-to-ontology', () => {
  const admin = canonicalProcedureHub(pureState, { id: 'admin', role: 'admin', permissions: ['read','manage-enterprise'] }, { readiness: pureReadiness });
  for (const item of admin) {
    const term = ontology.processes[item.id];
    assert.ok(term, item.id);
    assert.equal(item.code, term.code);
    assert.equal(item.kind, term.kind);
    assert.equal(item.label, term.label);
    assert.equal(item.service, term.service);
    assert.equal(item.actionLabel, ontology.ctas[item.id].admin || ontology.ctas[item.id].default);
  }
});

const runtime = await runtimeHarness('ictc-runtime-ontology');
try {
  const admin = await runtime.bootstrap('admin', 'ontology-admin');
  const user = await runtime.bootstrap('user', 'ontology-user');
  const auditor = await runtime.bootstrap('auditor', 'ontology-auditor');
  verify('bootstrap-projects-runtime-ontology', () => {
    assert.equal(admin.status, 200);
    assert.deepEqual(admin.body.ontology, ontology);
    assert.deepEqual(user.body.ontology, ontology);
    assert.deepEqual(auditor.body.ontology, ontology);
    assert.equal(admin.body.procedures.find(item => item.id === 'incidents').label, ontology.processes.incidents.label);
    assert.equal(user.body.procedures.find(item => item.id === 'monitoring').actionLabel, ontology.ctas.monitoring.user);
    assert.equal(auditor.body.procedures.find(item => item.id === 'incidents').actionLabel, ontology.ctas.incidents.auditor);
    assert.equal(auditor.body.procedures.find(item => item.id === 'evidence').actionLabel, ontology.ctas.evidence.default);
  });
} finally {
  await runtime.close();
}

const report = {
  schemaVersion: ontology.schemaVersion,
  ok: true,
  authority: ontology.authority,
  checks,
  processIds: Object.keys(ontology.processes),
  objectIds: Object.keys(ontology.objects),
  stateFamilies: Object.keys(ontology.states),
  limitation: 'Runtime UI vocabulary only; persisted identifiers and legal/compliance semantics remain unchanged.'
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/runtime-ontology-check.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`runtime-ontology-check: ok (${checks.length} checks)`);
