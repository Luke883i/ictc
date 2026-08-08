import assert from 'node:assert/strict';
import { canonicalDecisionProjection, incidentDecisionRecords, sourceDecisionRecords } from './runtime/decision-projection.mjs';
import { assertRelation, processKernelProjection } from './runtime/process-kernel.mjs';

const source = { id:'s1', decisions:[{decision:'verified',reason:'human checked',at:'2026-08-08T10:00:00Z',by:'admin-1',observationSha256:'a'.repeat(64)}] };
const sourceRecords = sourceDecisionRecords(source);
assert.equal(sourceRecords.length,1);
assert.equal(sourceRecords[0].authority,'human');
assert.equal(sourceRecords[0].checkpoint,'source-review');
assert.equal(sourceRecords[0].subjectVersion.sha256,'a'.repeat(64));
assert.equal(sourceRecords[0].legacyProjection,true);

const incident = {
 id:'i1', createdBy:'alice', closureNote:'case completed', closedBy:'admin-1', closedAt:'2026-08-08T13:00:00Z',
 answers:{classification:{value:'event',unknown:false,answeredAt:'2026-08-08T11:00:00Z',answeredBy:'alice',adoption:'ai-suggestion-confirmed',suggestedValue:'event',evidenceUse:'human adoption'}},
 submissionConfirmation:{by:'alice',at:'2026-08-08T12:00:00Z',formulationSha256:'b'.repeat(64)}
};
const incidentRecords=incidentDecisionRecords(incident);
assert.equal(incidentRecords.length,3);
assert.deepEqual(new Set(incidentRecords.map(item=>item.kind)),new Set(['incident-answer-adoption','incident-submission','incident-closure']));
assert.ok(incidentRecords.every(item=>item.authority==='human'));
assert.equal(incidentRecords.find(item=>item.kind==='incident-submission').subjectVersion.sha256,'b'.repeat(64));
assert.equal(incidentRecords.find(item=>item.kind==='incident-closure').subjectVersion.sha256,'b'.repeat(64));

const admin = canonicalDecisionProjection({catalog:[source],incidents:[incident]}, {id:'admin-1',role:'admin'});
const user = canonicalDecisionProjection({catalog:[source],incidents:[incident]}, {id:'bob',role:'user'});
assert.equal(admin.records.length,4);
assert.equal(user.records.length,1,'other user must not receive private incident decisions');
assert.ok(admin.records.every(item=>item.subjectVersion.sha256));
assert.ok(new Set(admin.records.map(item=>item.id)).size===admin.records.length);
for(const relation of ['object-has-version','object-has-decision','decision-binds-version','human-made-decision','version-supersedes-version']) assert.ok(processKernelProjection().relations[relation],`missing ${relation}`);
assert.equal(assertRelation('decision-binds-version','decision','formulation-version'),'decision-binds-version');
assert.throws(()=>assertRelation('decision-binds-version','source','formulation-version'),error=>error.code==='relation-endpoint-invalid');
console.log(`decision-binding-check: ok (adminRecords=${admin.records.length}, privateUserRecords=${user.records.length})`);
