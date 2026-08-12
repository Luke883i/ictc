import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const coverage=JSON.parse(await readFile(new URL('./procedure-finetuning-intent-coverage-1-4.json',import.meta.url),'utf8'));
assert.equal(coverage.authority,'procedure-finetuning-intent-coverage');assert.deepEqual(coverage.scope,['RN-01','EC-01','AO-01','MC-01','AP-01']);assert.deepEqual(coverage.regressionOnly,['RC-01','AR-01']);assert.ok(coverage.intents.length>=20);
const resolvePath=path=>new URL(path.startsWith('v3/')?`./${path.slice(3)}`:`../${path}`,import.meta.url);
const ids=new Set();for(const row of coverage.intents){assert.ok(row.id&&!ids.has(row.id),`duplicate ${row.id}`);ids.add(row.id);assert.ok(row.intent.length>40,row.id);assert.ok(row.evidence.length>0,row.id);for(const path of row.evidence){const text=await readFile(resolvePath(path),'utf8');assert.ok(text.length>0,`${row.id}:${path}`);}}
for(const id of ['COMMON-NATURE-FIRST','COMMON-COGNITIVE-SUBSTRATE','COMMON-CONTROL-ANCHOR','COMMON-SCREENSHOT-MINING','COMMON-AI-BOUNDARY','COMMON-CROSS-REFERENCE','COMMON-SIMULATION','COMMON-ONTO-COMPLIANCE-SIMULATION','RN-SOURCE-UNIVERSE','RN-HUMAN-CONTRIBUTOR','RN-SCHEDULED-AI','RN-SEMANTIC-LATTICE','EC-COPY-COMPRESSION','AO-AUDITOR-ACCEPTANCE','MC-ATOMIC-ABSTRACTION','MC-OPAQUE-DRILLDOWN','AP-REMEDIATION-NARRATIVE','AP-COMPLETE-NOT-CLOSED','RC-AR-NO-RESTYLE','DOD-EXACT-SHA'])assert.ok(ids.has(id),id);
console.log(JSON.stringify({ok:true,control:'PROCEDURE-FINETUNING-INTENT-COVERAGE',intents:coverage.intents.length,scope:coverage.scope,regressionOnly:coverage.regressionOnly}));
