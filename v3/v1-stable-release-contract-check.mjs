import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { DISCLOSURE, PROCESS_SPECS, SURFACES } from './v1-stable-experience-model.mjs';
const contract=JSON.parse(await readFile(new URL('./v1-stable-release-contract.json',import.meta.url),'utf8'));
const packageManifest=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
assert.equal(contract.releaseProfile,'1.0_stable');
assert.equal(contract.runtimeCompatibility.packageVersion,packageManifest.version);
assert.equal(contract.runtimeCompatibility.packageVersion,'1.8.0');
assert.deepEqual(contract.permanentSurfaces,SURFACES.map(x=>x.id));
assert.equal(contract.maxDisclosureLevels,DISCLOSURE.length);
assert.equal(contract.processes.length,Object.keys(PROCESS_SPECS).length);
for(const [id,spec] of Object.entries(PROCESS_SPECS)){const actual=contract.processes.find(x=>x.id===id);assert.ok(actual,id);assert.equal(actual.code,spec.code);assert.equal(actual.archetype,spec.archetype);}
assert.equal(contract.proofSurface.code,'EV-01');assert.equal(contract.proofSurface.businessProcess,false);assert.equal(contract.experience.fullProcessCatalogCopies,1);assert.equal(contract.experience.homeFullCatalog,false);assert.equal(contract.experience.homeAttentionCap,3);assert.equal(contract.experience.primaryActionsPerContext,1);assert.equal(contract.experience.technicalTraceLevel,5);assert.equal(contract.experience.evidenceDetailLevel,4);assert.equal(contract.experience.aiMandatory,false);assert.equal(contract.experience.auditorWrite,false);assert.equal(packageManifest.private,false);assert.equal(packageManifest.license,contract.distribution.license);
for(const path of contract.distribution.documents)await access(new URL(`../${path}`,import.meta.url));
assert.ok(contract.boundaries.length>=4);assert.ok(contract.boundaries.every(x=>x.length>30));
console.log('v1-stable-release-contract-check: ok (public stable profile over PR49 runtime compatibility)');
