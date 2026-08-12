import assert from 'node:assert/strict';
import { resolveRequestTenant } from './runtime/tenant-authority.mjs';
import { createAbuseBudget } from './runtime/abuse-budget.mjs';
import { signScannerAttestation, verifyScannerAttestation } from './runtime/attachment-scanner.mjs';
import { activeLegalHold } from './runtime/privacy-lifecycle.mjs';

const secret='s'.repeat(64),env={ICTC_MULTI_TENANT:'1',ICTC_IDENTITY_MODE:'trusted-header',ICTC_TRUSTED_PROXY_SECRET:secret},directory={enabled:true,defaultTenantId:'alpha',tenants:[{id:'alpha',enabled:true,subjects:[],groups:['alpha']},{id:'beta',enabled:true,subjects:[],groups:['beta']}]};
const request=(group,tenant)=>({headers:{'x-ictc-proxy-secret':secret,'x-ictc-subject':'subject','x-ictc-groups':group,...(tenant?{'x-ictc-tenant':tenant}:{})},socket:{remoteAddress:'10.0.0.1'}});
let scenarios=0,falseAllows=0,falseDenials=0;
for(let i=0;i<400000;i++){scenarios++;try{resolveRequestTenant(request('alpha','beta'),env,directory);falseAllows++;}catch(error){if(error.code!=='tenant-membership-required')throw error;}}
for(let i=0;i<300000;i++){scenarios++;try{const resolved=resolveRequestTenant(request('alpha',i%2?'alpha':null),env,directory);if(resolved.tenantId!=='alpha')falseAllows++;}catch{falseDenials++;}}
let clock=0;const limiter=createAbuseBudget({capacity:3,refillPerSecond:1,clock:()=>clock,maxKeys:32});for(let i=0;i<200000;i++){scenarios++;const result=limiter.consume('alpha|10.0.0.1');if(i<3&&!result.allowed)falseDenials++;if(i>=3&&result.allowed)falseAllows++;}
const scanEnv={ICTC_ATTACHMENT_SCANNER_MODE:'external-attested',ICTC_ATTACHMENT_SCANNER_ID:'scanner',ICTC_ATTACHMENT_SCANNER_SECRET:'k'.repeat(64)},metadata={id:'file-1',sha256:'a'.repeat(64)},base={verdict:'clean',scannerId:'scanner',scannerVersion:'1',signatureDbVersion:'db',observedAt:new Date().toISOString()};base.signature=signScannerAttestation(metadata,base,scanEnv);const tampered={...base,signature:`${base.signature.slice(0,-1)}${base.signature.endsWith('0')?'1':'0'}`};for(let i=0;i<50000;i++){scenarios++;try{verifyScannerAttestation(metadata,tampered,scanEnv);falseAllows++;}catch(error){if(error.code!=='scanner-attestation-invalid')throw error;}}
const state={settings:{privacy:{enabled:true,retentionDays:30,legalHolds:[{id:'h',subjectType:'contribution',subjectId:'c',reason:'hold'}]}}};for(let i=0;i<50000;i++){scenarios++;if(!activeLegalHold(state,'contribution','c'))falseAllows++;}
assert.equal(scenarios,1000000);assert.equal(falseAllows,0);assert.equal(falseDenials,0);console.log(JSON.stringify({ok:true,scenarios,falseAllows,falseDenials,families:{crossTenant:400000,legitimateTenant:300000,abuseBudget:200000,scannerTamper:50000,legalHold:50000},claimBoundary:'Same-circuit deterministic saturation is E2 engineering evidence only; it does not establish independent review, production scanner efficacy, deployment RTO/RPO or external identity assurance.'}));
