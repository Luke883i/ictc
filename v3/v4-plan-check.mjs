import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const doc=await readFile(new URL('./docs/V4_COMPLIANCE_OS_DOD.md',import.meta.url),'utf8');
for(const token of ['Oggi','Processi','Prove','RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01','AI-OFF','100,000','novelty tail','one ProcessDefinition']) assert.ok(doc.includes(token),`missing ${token}`);
for(const slice of ['S0','S1','S2','S3','S4','S5','S6','S7']) assert.ok(doc.includes(`### ${slice}`),`missing slice ${slice}`);
assert.match(doc,/Mandatory AI calls in business state transitions \| 0/);
assert.match(doc,/Auditor write affordances \| 0/);
console.log('v4-plan-check: ok');
