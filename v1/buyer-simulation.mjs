import { strict as assert } from 'node:assert';
import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readReleaseManifest } from './release.mjs';
const root=path.resolve(new URL('..',import.meta.url).pathname); const manifest=await readReleaseManifest();
const attestation=JSON.parse(await readFile(path.join(root,'artifacts/v1-stability-attestation.json'),'utf8'));
assert.equal(attestation.result,'passed'); assert.equal(attestation.externallyCertified,false); assert.equal(attestation.metrics.crossTenantDisclosureCount,0); assert.equal(attestation.metrics.unauthorizedWriteSuccessCount,0); assert.equal(attestation.metrics.receiptAttributionRate,1);
assert.ok(manifest.claim.includes('pilot multi-cliente')); assert.ok(manifest.excludedScope.some(item=>/OIDC/.test(item))); assert.ok(manifest.excludedScope.some(item=>/SaaS/.test(item)));
for(const persona of ['c-level','auditor','cto']) { const item=manifest.buyerResistances.find(value=>value.persona===persona); assert.ok(item?.mitigation.length>30); assert.ok(item?.residualRisk.length>20); }
const artifact={schemaVersion:'1.1.0',generatedAt:new Date().toISOString(),result:'passed',personas:manifest.buyerResistances,differentiationCount:manifest.differentiators.length,limitation:'Simulazione documentale; non sostituisce procurement, audit indipendente o pilot.'}; await mkdir(path.join(root,'artifacts'),{recursive:true}); await writeFile(path.join(root,'artifacts/v1-buyer-simulation.json'),JSON.stringify(artifact,null,2)); console.log(`v1-buyer-simulation: ok (${manifest.buyerResistances.length} personas, ${manifest.differentiators.length} differentiators)`);
