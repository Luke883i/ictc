import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const baselineUrl = new URL('../.github/ci-truth-baseline.json', import.meta.url);
const runtimeUrl = new URL('../artifacts/enterprise-t-runtime-stress.json', import.meta.url);
const auditUrl = new URL('../artifacts/enterprise-t-audit.json', import.meta.url);
const outputUrl = new URL('../artifacts/ci-truth.json', import.meta.url);
const canonical = value => JSON.stringify(value, Object.keys(value).sort());
const runtimeFingerprint = item => canonical({ id:item.id, profile:item.profile, status:item.status });
const auditFingerprint = item => canonical({ id:item.id, dimension:item.dimension, severity:item.severity, status:item.status, statement:item.statement });
const setOf = (items, fn) => new Set((items || []).map(fn));
const difference = (left, right) => [...left].filter(value => !right.has(value)).sort();
const idsFor = (fingerprints, records, fn) => [...new Set(records.filter(item => fingerprints.has(fn(item))).map(item => item.id))].sort();

function evaluate({ baseline, runtime, audit }) {
  const allowedRuntime = setOf(baseline.allowedRuntimeGaps, runtimeFingerprint);
  const allowedAudit = setOf(baseline.allowedAuditFindings, auditFingerprint);
  const runtimeRecords = (runtime.cases || []).filter(item => item.status === 'detected-gap');
  const auditRecords = (audit.findings || []).filter(item => ['critical','high'].includes(item.severity) && item.status !== 'resolved');
  const runtimeGaps = setOf(runtimeRecords, runtimeFingerprint);
  const auditGaps = setOf(auditRecords, auditFingerprint);
  const newRuntime = difference(runtimeGaps, allowedRuntime);
  const newAudit = difference(auditGaps, allowedAudit);
  const staleRuntime = difference(allowedRuntime, runtimeGaps);
  const staleAudit = difference(allowedAudit, auditGaps);
  return {
    runtimeGapIds: runtimeRecords.map(item => item.id).sort(),
    auditGapIds: auditRecords.map(item => item.id).sort(),
    newRuntimeGapIds: idsFor(new Set(newRuntime), runtimeRecords, runtimeFingerprint),
    newAuditGapIds: idsFor(new Set(newAudit), auditRecords, auditFingerprint),
    staleRuntimeAllowanceIds: idsFor(new Set(staleRuntime), baseline.allowedRuntimeGaps, runtimeFingerprint),
    staleAuditAllowanceIds: idsFor(new Set(staleAudit), baseline.allowedAuditFindings, auditFingerprint),
    newRuntimeFingerprints: newRuntime,
    newAuditFingerprints: newAudit,
    staleRuntimeFingerprints: staleRuntime,
    staleAuditFingerprints: staleAudit
  };
}
function readBaseBaseline(baseSha) {
  if (!baseSha || !/^[0-9a-f]{40}$/i.test(baseSha)) return { state:'not-requested', baseline:null };
  try { return { state:'present', baseline:JSON.parse(execFileSync('git',['show',`${baseSha}:.github/ci-truth-baseline.json`],{encoding:'utf8',stdio:['ignore','pipe','pipe']})) }; }
  catch (error) { const stderr=String(error.stderr||''); if (/does not exist|exists on disk, but not in|path .* not in/i.test(stderr)) return {state:'absent',baseline:null}; throw error; }
}
function compareBaseline(current, previous, baseSha) {
  if (current.schemaVersion === '2.0.0' && previous.schemaVersion === current.migrationFromSchemaVersion && current.migrationBaseSha === baseSha) return { state:'anchored-schema-migration', runtimeAllowanceAdditions:[], auditAllowanceAdditions:[] };
  assert.equal(previous.schemaVersion, current.schemaVersion, 'CI-truth schema changes require an exact-SHA anchored migration');
  return {
    state:'compared',
    runtimeAllowanceAdditions:difference(setOf(current.allowedRuntimeGaps,runtimeFingerprint),setOf(previous.allowedRuntimeGaps,runtimeFingerprint)),
    auditAllowanceAdditions:difference(setOf(current.allowedAuditFindings,auditFingerprint),setOf(previous.allowedAuditFindings,auditFingerprint))
  };
}
function selfTest() {
  const baseline={allowedRuntimeGaps:[{id:'S1',profile:'p',status:'detected-gap'}],allowedAuditFindings:[{id:'A1',dimension:'T1',severity:'critical',status:'open',statement:'one'}]};
  const clean=evaluate({baseline,runtime:{cases:[{id:'S1',profile:'p',status:'detected-gap'}]},audit:{findings:[{id:'A1',dimension:'T1',severity:'critical',status:'open',statement:'one'}]}});
  assert.deepEqual(clean.newRuntimeGapIds,[]); assert.deepEqual(clean.newAuditGapIds,[]); assert.deepEqual(clean.staleAuditAllowanceIds,[]);
  const drift=evaluate({baseline,runtime:{cases:[{id:'S1',profile:'p',status:'detected-gap'}]},audit:{findings:[{id:'A1',dimension:'T1',severity:'critical',status:'open',statement:'semantic drift'}]}});
  assert.deepEqual(drift.newAuditGapIds,['A1']); assert.deepEqual(drift.staleAuditAllowanceIds,['A1']);
  const resolved=evaluate({baseline,runtime:{cases:[{id:'S1',profile:'p',status:'detected-gap'}]},audit:{findings:[]}}); assert.deepEqual(resolved.staleAuditAllowanceIds,['A1']);
  console.log('ci-truth-check self-test: ok (semantic fingerprints + stale-debt fatal)');
}
if (process.argv.includes('--self-test')) { selfTest(); process.exit(0); }
const [baseline,runtime,audit]=await Promise.all([readFile(baselineUrl,'utf8').then(JSON.parse),readFile(runtimeUrl,'utf8').then(JSON.parse),readFile(auditUrl,'utf8').then(JSON.parse)]);
assert.equal(baseline.controlId,'GOV-CI-TRUTH'); assert.equal(baseline.mode,'RATCHET'); assert.equal(baseline.schemaVersion,'2.0.0');
const baseSha=String(process.env.ICTC_CI_TRUTH_BASE_SHA||'').trim(); const base=readBaseBaseline(baseSha); let ratchet={state:base.state,runtimeAllowanceAdditions:[],auditAllowanceAdditions:[]};
if (base.state==='present') { ratchet=compareBaseline(baseline,base.baseline,baseSha); assert.deepEqual(ratchet.runtimeAllowanceAdditions,[],`Runtime debt baseline may not expand: ${ratchet.runtimeAllowanceAdditions.join(', ')}`); assert.deepEqual(ratchet.auditAllowanceAdditions,[],`Audit debt baseline may not expand: ${ratchet.auditAllowanceAdditions.join(', ')}`); }
const evaluation=evaluate({baseline,runtime,audit});
const blocking=evaluation.newRuntimeFingerprints.length||evaluation.newAuditFingerprints.length||evaluation.staleRuntimeFingerprints.length||evaluation.staleAuditFingerprints.length;
const report={schemaVersion:'2.0.0',controlId:'GOV-CI-TRUTH',mode:'RATCHET',baseSha:baseSha||null,ratchet,...evaluation,result:blocking?'blocked':'pass',boundary:'PASS means exact semantic debt fingerprints match an immutable-or-shrinking set. Same-ID semantic drift and stale allowances are regressions; baseline debt remains unresolved debt.'};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true}); await writeFile(outputUrl,JSON.stringify(report,null,2));
if(report.result!=='pass') throw new Error(`CI truth regression: new-runtime=[${evaluation.newRuntimeGapIds}] new-audit=[${evaluation.newAuditGapIds}] stale-runtime=[${evaluation.staleRuntimeAllowanceIds}] stale-audit=[${evaluation.staleAuditAllowanceIds}]`);
console.log(`ci-truth-check: pass (runtime=${evaluation.runtimeGapIds.length}, audit=${evaluation.auditGapIds.length}, ratchet=${ratchet.state})`);
