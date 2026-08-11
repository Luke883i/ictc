import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PROCEDURE_DOD, BUSINESS_PROCEDURE_IDS, MEANINGFUL_HANDOFFS } from './procedure-dod.mjs';
const contracts=JSON.parse(await readFile(new URL('./procedure-contracts-1-2.json',import.meta.url),'utf8'));
const standards=JSON.parse(await readFile(new URL('./standard-proof-1-6-contract.json',import.meta.url),'utf8'));
const contractById=new Map(contracts.procedures.map(x=>[x.id,x])),benchmarks=new Set(standards.benchmarkFamilies.map(x=>x.id));
assert.deepEqual(BUSINESS_PROCEDURE_IDS,['monitoring','incidents','objects','coverage','actions','risks','assurance']);
assert.equal(Object.keys(PROCEDURE_DOD).length,7);assert.equal(PROCEDURE_DOD['epistemic-lattice'],undefined);
for(const id of BUSINESS_PROCEDURE_IDS){const d=PROCEDURE_DOD[id],c=contractById.get(id);assert.ok(c,`${id}: canonical contract`);assert.equal(d.code,c.code);assert.ok(d.completion.length>=4,`${id}: standalone completion`);assert.ok(c.humanCheckpoints.length&&c.evidence.length&&c.exit&&c.claimBoundary,`${id}: native standalone contract incomplete`);assert.ok(d.benchmarkRefs.length>=1,`${id}: benchmark refs`);for(const ref of d.benchmarkRefs)assert.ok(benchmarks.has(ref),`${id}: undeclared benchmark ${ref}`);assert.ok(d.epistemicFamilies.includes('observed')&&d.epistemicFamilies.includes('decided'),`${id}: common epistemic family compatibility`);assert.ok(d.handoffs.length>=1,`${id}: no meaningful outbound draft handoff`);assert.ok(!d.handoffs.includes(id),`${id}: self handoff forbidden`);assert.match(d.limitation,/non determinano|non determina/i);}
assert.ok(MEANINGFUL_HANDOFFS.length>7&&MEANINGFUL_HANDOFFS.length<42,'handoff graph must be useful but not universal 7x7');
assert.equal(new Set(MEANINGFUL_HANDOFFS.map(x=>`${x.sourceProcedureId}->${x.targetProcedureId}`)).size,MEANINGFUL_HANDOFFS.length,'duplicate handoff edge');
console.log(`procedure-dod-check: ok processes=7 meaningfulHandoffs=${MEANINGFUL_HANDOFFS.length}`);
