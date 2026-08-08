import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { runtimeHarness } from './runtime-test-harness.mjs';

const runtime = await runtimeHarness('ictc-standard-proof-16');
const checks = [];
const verify = (name, assertion) => { assertion(); checks.push(name); };

try {
  for (const [role, expectedMode] of [['admin', 'read-write'], ['user', 'contribute'], ['auditor', 'read-only']]) {
    const response = await fetch(`${runtime.base}/api/standard-proof`, { headers: runtime.identity(role, `local-${role}`) });
    const body = await response.json();
    verify(`${role}-status`, () => assert.equal(response.status, 200));
    verify(`${role}-active-release`, () => assert.equal(body.release, '1.8.0'));
    verify(`${role}-identity`, () => assert.equal(body.actor.role, role));
    verify(`${role}-mode`, () => assert.equal(body.actor.mode, expectedMode));
    verify(`${role}-authority-source`, () => assert.equal(body.actor.authoritySource, 'server-issued'));
    verify(`${role}-content`, () => {
      assert.equal(body.schemaVersion, '1.6.0');
      assert.equal(body.architecture.length, 8);
      assert.equal(body.benchmarkFamilies.length, 12);
      assert.equal(body.glossary.length, 14);
      assert.equal(body.proof.rule, 'Ogni promessa deve mostrare pratica, evidenza e limite.');
      assert.equal(body.proof.complianceSemantics.model, 'selected-practice-evidence-v1');
      assert.equal(body.proof.complianceSemantics.standardConclusion, 'not-assessed');
      for (const item of body.benchmarkFamilies) {
        assert.equal(item.complianceClaim.scope, 'selected-practice');
        assert.equal(item.complianceClaim.standardConclusion, 'not-assessed');
        assert.equal(item.complianceClaim.externalAssessmentRequired, true);
        assert.deepEqual(item.complianceClaim.evidenceRefs, item.evidence);
        assert.ok(item.complianceClaim.limitation.length >= 20);
      }
      assert.ok(body.proof.posture.runtime.total > 0);
      assert.ok(body.proof.posture.deployment.total > 0);
    });
    verify(`${role}-no-secret-fields`, () => {
      const serialized = JSON.stringify(body);
      for (const forbidden of ['apiKeyEnv', 'ICTC_LLM_API_KEY', 'promptOverride', 'commandResults']) assert.doesNotMatch(serialized, new RegExp(forbidden));
      assert.doesNotMatch(serialized, /"standardConclusion":"(?:certified|compliant|conformant)"/i);
    });
  }
  const writeAttempt = await runtime.request('POST', '/api/standard-proof', { mutate: true }, 'admin', 'local-admin');
  verify('read-only-route', () => assert.equal(writeAttempt.status, 404));
  const report = { schemaVersion: '1.6.0', activeRelease: '1.8.0', model: 'ictc-standard-proof-1-6-runtime', ok: true, checks, roles: ['admin', 'user', 'auditor'], complianceSemantics: 'selected-practice-evidence-v1', limitation: 'Selected local runtime assurance; standard-wide conformity, certification and deployment controls remain external or not assessed.' };
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(new URL('../artifacts/standard-proof-1-6-runtime.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(`standard-proof-1-6-runtime-check: ok (${checks.length} checks, active release 1.8.0)`);
} finally { await runtime.close(); }
