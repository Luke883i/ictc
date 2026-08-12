import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url),dod=JSON.parse(await readFile(new URL('../audit/security-enterprise-dod.json',import.meta.url),'utf8')),workflow=await readFile(new URL('../.github/workflows/runtime-enterprise-boundaries.yml',import.meta.url),'utf8'),trust=await readFile(new URL('./runtime/attachment-trust.mjs',import.meta.url),'utf8'),scanner=await readFile(new URL('./runtime/attachment-scanner.mjs',import.meta.url),'utf8'),recovery=await readFile(new URL('./runtime/recovery.mjs',import.meta.url),'utf8'),network=await readFile(new URL('./network-policy.mjs',import.meta.url),'utf8'),exportsSource=await readFile(new URL('./runtime/exports.mjs',import.meta.url),'utf8'),http=await readFile(new URL('./runtime/http.mjs',import.meta.url),'utf8');
assert.equal(dod.schemaVersion,'1.0.0');assert.equal(dod.items.length,7);assert.match(dod.claimBoundary,/E2/);assert.ok(dod.externalResiduals.includes('server-side branch protection'));assert.ok(dod.externalResiduals.includes('independent reviewer/oracle'));
for(const marker of['ICTC_AI_MAX_RESPONSE_BYTES','ai-response-too-large','::ffff:'])assert.ok(network.includes(marker),`network marker missing: ${marker}`);
for(const marker of['tenantId','tenant-id-mismatch','signed-payload-v1'])assert.ok(scanner.includes(marker),`scanner marker missing: ${marker}`);
for(const marker of['tenantBindingRequired','requireTenantBinding','tenantId'])assert.ok(trust.includes(marker),`trust marker missing: ${marker}`);
for(const marker of['recovery-attachment-namespace-mismatch','keyDerivation','manifest-authentication','timingSafeEqual'])assert.ok(recovery.includes(marker),`recovery marker missing: ${marker}`);
assert.match(exportsSource,/csvCell/);assert.match(exportsSource,/\[=\+\\-@\]/);assert.match(http,/tenant-actor-membership-mismatch/);assert.match(http,/route-param-invalid/);
for(const check of['tenant-identity-coherence-check.mjs','attachment-scanner-tenant-check.mjs','csv-export-security-check.mjs','ai-network-policy-check.mjs','runtime-enterprise-boundaries-ci.mjs','security-attack-saturation.mjs'])assert.ok(workflow.includes(check),`workflow missing ${check}`);
assert.match(workflow,/windows-2025/);assert.match(workflow,/ubuntu-24\.04/);assert.match(workflow,/node: \['22', '24'\]/);assert.match(workflow,/actions\/checkout@[a-f0-9]{40}/);assert.match(workflow,/actions\/setup-node@[a-f0-9]{40}/);
console.log('security-enterprise-dod-check: ok (7 local DoD items machine-bound; E3/E4 residuals remain explicit)');
