import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { evaluateClosure, EXTERNAL_GATES } from './deautopoiesis-assurance.mjs';
const registry=JSON.parse(await readFile(new URL('../audit/remediation-registry.json',import.meta.url),'utf8'));
assert.equal(registry.schemaVersion,'1.0.0');assert.equal(registry.findings.length,16);assert.deepEqual(registry.findings.map(x=>x.id),Array.from({length:16},(_,i)=>`F-${String(i+1).padStart(2,'0')}`));
for(const finding of registry.findings){assert.ok(['critical','high','medium'].includes(finding.severity));assert.ok(finding.rootControl);if(EXTERNAL_GATES.has(finding.gate)){assert.notEqual(finding.status,'resolved',`${finding.id} cannot be repository-self-resolved`);const hostile=evaluateClosure({severity:finding.severity,requiredGrade:finding.requiredGrade,observedGrade:'E5',gate:finding.gate,author:'same',oracleAuthor:'same',independentReviewer:'same',independentChannel:false,deploymentEnvelopeValid:false,serverSidePrevention:false,synthetic:false,exactHead:'a'.repeat(40),negativeWitness:true});assert.equal(hostile.resolved,false,`${finding.id} false closure escaped`);}}
console.log(JSON.stringify({ok:true,findings:registry.findings.length,externalBlocked:registry.findings.filter(x=>x.status==='blocked-external').length,claimBoundary:registry.claimBoundary}));
