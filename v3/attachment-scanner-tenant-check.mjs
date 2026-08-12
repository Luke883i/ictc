import assert from 'node:assert/strict';
import { scannerRuntimePosture, signScannerAttestation, verifyScannerAttestation } from './runtime/attachment-scanner.mjs';

const env={ICTC_ATTACHMENT_SCANNER_MODE:'external-attested',ICTC_ATTACHMENT_SCANNER_ID:'scanner-enterprise',ICTC_ATTACHMENT_SCANNER_SECRET:'z'.repeat(64)},metadata={id:'file-shared',sha256:'a'.repeat(64)},observedAt=new Date().toISOString(),alpha={tenantId:'alpha',verdict:'clean',scannerId:'scanner-enterprise',scannerVersion:'2.0.0',signatureDbVersion:'db-2026-08',observedAt};
alpha.signature=signScannerAttestation(metadata,alpha,env,{tenantId:'alpha'});const accepted=verifyScannerAttestation(metadata,alpha,env,new Date(),{tenantId:'alpha'});assert.equal(accepted.state,'scan-clean');assert.equal(accepted.tenantId,'alpha');
await assert.rejects(async()=>verifyScannerAttestation(metadata,alpha,env,new Date(),{tenantId:'beta'}),error=>error.code==='scanner-attestation-invalid'&&error.details.reasons.includes('tenant-id-mismatch'));
const local={verdict:'clean',scannerId:'scanner-enterprise',scannerVersion:'2.0.0',signatureDbVersion:'db-2026-08',observedAt};local.signature=signScannerAttestation(metadata,local,env);assert.equal(verifyScannerAttestation(metadata,local,env).tenantId,'local-default');assert.equal(scannerRuntimePosture(env).tenantBinding,'signed-payload-v1');
console.log('attachment-scanner-tenant-check: ok (scanner attestations are tenant-bound and local-default remains deterministic)');
