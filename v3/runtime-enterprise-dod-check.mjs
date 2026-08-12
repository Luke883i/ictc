import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const required=[
  ['v3/server.mjs',['RuntimeStore','createTenantAuthority','server.headersTimeout','server.requestTimeout','server.keepAliveTimeout','createOperationalObservability','createAbuseBudget','closeAll']],
  ['v3/runtime/attachment-storage.mjs',["path.join(store.root,'quarantine')",'attachment-quarantined','promoteAttachment']],
  ['v3/runtime/attachment-scanner.mjs',['hmac-sha256','signatureDbVersion','scanner-attestation-invalid']],
  ['v3/runtime/attachment-scanner-handler.mjs',['scanner-attachment-changed','scanner-attestation-conflict']],
  ['v3/runtime/recovery.mjs',['aes-256-gcm','manifestAuthentication','attachmentInventory','recovery-attachment-missing-or-mismatch','recovery-entry-duplicate','rtoMs','rpoSecondsAtRestore']],
  ['v3/runtime/privacy-lifecycle.mjs',['privacy-legal-hold','eraseSubjectPayloads','privacy.erasure.completed']],
  ['v3/runtime/hardened-persistence.mjs',['ai_budget_reservation','BEGIN IMMEDIATE','ALTER TABLE subject_version ADD COLUMN erased_at','liveRefs','erasure_receipt_sha256']],
  ['v3/runtime/evidence.mjs',['attachmentEvidenceUsable','attachment-quarantined']],
  ['v3/runtime/tenant-authority.mjs',['AsyncLocalStorage','sqlite-per-tenant','tenant-membership-required']]
];
for(const[file,tokens]of required){const text=await readFile(file,'utf8');for(const token of tokens)assert.ok(text.includes(token),`${file} missing ${token}`);}
const evidence=await readFile('v3/runtime/evidence.mjs','utf8'),incidentAuth=evidence.indexOf("if(incident&&actor.role!=='auditor'&&!canAccessIncident"),contributionAuth=evidence.indexOf('if(contribution&&!canAccessContribution'),byteRead=evidence.indexOf('store.attachment(params.id)');assert.ok(incidentAuth>=0&&incidentAuth<byteRead,'incident authorization must precede attachment byte read');assert.ok(contributionAuth>=0&&contributionAuth<byteRead,'contribution authorization must precede attachment byte read');
const persistence=await readFile('v3/runtime/hardened-persistence.mjs','utf8');assert.ok(!persistence.includes("ALTER TABLE subject_payload ADD COLUMN erased_at"),'erasure marker must not be global on deduplicated subject_payload');assert.ok(persistence.includes('subject_version SET erased_at'),'erasure must be version-scoped');assert.ok(persistence.includes("liveRefs.get(digest)"),'payload GC must depend on remaining live version references');
const recovery=await readFile('v3/runtime/recovery.mjs','utf8');assert.ok(recovery.includes('backupSnapshot(plainDb)'),'recovery inventory must derive from copied SQLite snapshot');assert.ok(recovery.includes('attachmentInventory(snapshot.state)'),'recovery attachments must be snapshot-bound');
const dod=JSON.parse(await readFile('audit/runtime-enterprise-dod.json','utf8'));assert.equal(dod.schemaVersion,'1.0.0');assert.ok(dod.localDoD.every(item=>item.status==='verified-by-candidate-tests'));assert.ok(dod.externalResiduals.every(item=>item.status==='blocked-external'));assert.ok(dod.globalDoD.some(item=>item.id==='exact-head-ci'&&item.required===true));
console.log('runtime-enterprise-dod-check: ok');
