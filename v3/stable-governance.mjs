import { asString } from './domain.mjs';

export const DEPLOYMENT_CONTROL_IDS=Object.freeze(['tls','durable-storage','backup','malware-scan','observability','dependency-audit','accessibility-audit']);
export function normalizeAiPolicy(value){return String(value||'').toLowerCase()==='disabled'?'disabled':'enabled';}
export function aiPolicyProjection(state){const mode=normalizeAiPolicy(state?.settings?.aiPolicy);return{mode,serverEnforced:true,manualPathsRequired:true};}
export function assertAiPolicy(state){const policy=aiPolicyProjection(state);if(policy.mode==='disabled')throw Object.assign(new Error('AI disabilitata dalla policy organizzativa'),{status:409,code:'ai-policy-disabled',details:policy});return policy;}
function isSha(value){return /^[a-f0-9]{64}$/i.test(String(value||''));}
function isUri(value){try{const u=new URL(String(value||''));return ['https:','file:','urn:'].includes(u.protocol);}catch{return false;}}
function validInstant(value){const t=new Date(value).getTime();return Number.isFinite(t)?t:null;}
export function deploymentEvidencePosture(env=process.env,nowValue=new Date()){
  let raw={};
  try{raw=JSON.parse(env.ICTC_DEPLOYMENT_EVIDENCE_JSON||'{}');}catch{raw={};}
  const now=nowValue.getTime(),deploymentId=asString(raw.deploymentId,300),issuer=asString(raw.issuer,500),controls={};
  for(const id of DEPLOYMENT_CONTROL_IDS){const item=raw.controls?.[id]||{},observed=validInstant(item.observedAt),expires=validInstant(item.expiresAt),reasons=[];if(!deploymentId)reasons.push('deployment-id-missing');if(!issuer)reasons.push('issuer-missing');if(!observed)reasons.push('observed-at-invalid');if(observed&&observed>now+300000)reasons.push('observed-in-future');if(!expires)reasons.push('expires-at-invalid');if(expires&&expires<=now)reasons.push('evidence-expired');if(!isUri(item.evidenceUri))reasons.push('evidence-uri-invalid');if(!isSha(item.sha256))reasons.push('sha256-invalid');controls[id]={verified:reasons.length===0,deploymentId:deploymentId||null,issuer:issuer||null,observedAt:item.observedAt||null,expiresAt:item.expiresAt||null,evidenceUri:item.evidenceUri||null,sha256:item.sha256||null,reasons};}
  const legacySignals={tls:env.ICTC_TLS_ATTESTED==='1','durable-storage':env.ICTC_DURABLE_STORAGE==='1',backup:Boolean(env.ICTC_BACKUP_VERIFIED_AT),'malware-scan':env.ICTC_MALWARE_SCAN_MODE==='external',observability:env.ICTC_OBSERVABILITY_ATTESTED==='1','dependency-audit':Boolean(env.ICTC_DEPENDENCY_AUDIT_AT),'accessibility-audit':Boolean(env.ICTC_ACCESSIBILITY_AUDIT_AT)};
  return{schemaVersion:'1.0.0',deploymentId:deploymentId||null,issuer:issuer||null,controls,legacySignals,claimBoundary:'Legacy boolean environment signals are observations only and cannot verify deployment controls.'};
}
export function readinessRuntimeFromDeployment(base,deployment){const c=deployment.controls||{},verified=id=>c[id]?.verified===true;return{...base,tls:verified('tls'),durableStorage:verified('durable-storage'),backupVerified:verified('backup'),malwareScanning:verified('malware-scan'),observability:verified('observability'),dependencyAudit:verified('dependency-audit'),dependencyAuditAt:c['dependency-audit']?.observedAt||null,accessibilityAudit:verified('accessibility-audit'),accessibilityAuditAt:c['accessibility-audit']?.observedAt||null,deploymentEvidence:deployment};}
