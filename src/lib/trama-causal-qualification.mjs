import crypto from 'node:crypto';

export const CAUSAL_STAGES=Object.freeze(['INTENT','CONTRACT','OWNER','STATE','WRITER','TRANSITION','PROJECTION','AUTHORITY','ORACLE','EVIDENCE','CLAIM','PATCH','QUALIFICATION','INVALIDATION']);
export const CAUSAL_VERDICTS=Object.freeze(['PASS','EXTERNAL_ORACLE_BLOCKED','EXECUTED_FAILURE','INSUFFICIENT_EVIDENCE','CONTROL_PLANE_BLOCKED']);
export const PATCH_DISPOSITIONS=Object.freeze(['SUPPORTED','INVESTIGATE','RETRY_ORACLE','RECONCILE_CONTROL_PLANE','NOT_REQUIRED','BLOCKED']);
export const FAILURE_FAMILIES=Object.freeze([
  'intent_unbound','contract_missing','owner_missing','owner_collision','state_unknown_promoted','writer_missing','writer_collision','transition_untyped','transition_owner_bypass','projection_authority_widening','evaluator_side_effect','oracle_missing','oracle_wrong_class','oracle_not_executed','external_admission_laundered','live_fact_without_provenance','evidence_wrong_class','evidence_cross_candidate','claim_exceeds_evidence','executed_failure_root_cause_assumed','patch_without_causal_support','qualification_self_promotion','stale_qualification_reused'
]);
const EVIDENCE_RANK=Object.freeze({E0:0,E1:1,E2:2,E3:3,E4:4});
const stable=value=>JSON.stringify(value,Object.keys(value||{}).sort());
const digest=value=>crypto.createHash('sha256').update(typeof value==='string'?value:stable(value)).digest('hex');
const arr=value=>Array.isArray(value)?value:[];
const one=value=>arr(value).filter(Boolean);
const knownState=value=>value!=null&&!['','unknown','unobserved','assumed'].includes(String(value).toLowerCase());
const evidenceAtLeast=(actual,required)=>Number.isInteger(EVIDENCE_RANK[actual])&&Number.isInteger(EVIDENCE_RANK[required])&&EVIDENCE_RANK[actual]>=EVIDENCE_RANK[required];

export function validateCausalCase(input={}){
  const f=[];
  if(!String(input.intent?.id||input.intent?.digest||'').trim())f.push('intent_unbound');
  if(!String(input.contract?.id||input.contract?.digest||'').trim())f.push('contract_missing');
  const owners=one(input.owner?.candidates||input.owner?.ids||[input.owner?.id]);
  if(owners.length===0)f.push('owner_missing');
  if(new Set(owners).size>1)f.push('owner_collision');
  if(!knownState(input.state?.value))f.push('state_unknown_promoted');
  const writers=one(input.writer?.candidates||input.writer?.ids||[input.writer?.id]);
  if(writers.length===0)f.push('writer_missing');
  if(new Set(writers).size>1)f.push('writer_collision');
  const tr=input.transition||{};
  if(!tr.type||!knownState(tr.from)||!knownState(tr.to))f.push('transition_untyped');
  if(tr.ownerId&&owners.length===1&&tr.ownerId!==owners[0])f.push('transition_owner_bypass');
  if(input.projection?.authorityEffect&&input.projection.authorityEffect!=='NONE')f.push('projection_authority_widening');
  const ev=input.evaluator||{};
  if(ev.authorityEffect!=='NONE'||ev.writer!==false||ev.networkAccess!==false||ev.persistsState!==false)f.push('evaluator_side_effect');
  const oracle=input.oracle;
  if(!oracle)f.push('oracle_missing');
  else {
    if(!['REPOSITORY','RUNTIME','BROWSER','EXTERNAL','CONTROL_PLANE'].includes(String(oracle.class||'')))f.push('oracle_wrong_class');
    const executed=Number(oracle.stepsExecuted||0)>0||oracle.executed===true;
    if(!executed)f.push('oracle_not_executed');
    if(oracle.admissionBlocked===true&&!executed&&oracle.semanticRegressionClaim===true)f.push('external_admission_laundered');
  }
  const facts=arr(input.liveFacts);
  if(facts.some(x=>!x||!String(x.source||'').trim()||!String(x.observedAt||'').trim()))f.push('live_fact_without_provenance');
  const evidence=input.evidence||{};
  const claim=input.claim||{};
  if(claim.requiredEvidenceClass&&!evidenceAtLeast(evidence.class,claim.requiredEvidenceClass))f.push('evidence_wrong_class');
  if(claim.candidateSha&&evidence.candidateSha&&claim.candidateSha!==evidence.candidateSha)f.push('evidence_cross_candidate');
  if(claim.requiredEvidenceClass&&evidence.class&&EVIDENCE_RANK[evidence.class]<EVIDENCE_RANK[claim.requiredEvidenceClass])f.push('claim_exceeds_evidence');
  const executedFailure=Boolean(oracle&&(Number(oracle.stepsExecuted||0)>0||oracle.executed===true)&&String(oracle.conclusion||'').toLowerCase()==='failure');
  if(executedFailure&&input.rootCause?.assumed===true&&!input.rootCause?.supportedByEvidence)f.push('executed_failure_root_cause_assumed');
  if(input.patch?.requested===true&&input.patch?.causalSupport!==true)f.push('patch_without_causal_support');
  if(input.qualification?.selfPromotesCapability===true)f.push('qualification_self_promotion');
  if(input.qualification?.status==='STALE'&&input.qualification?.usedAsCurrent===true)f.push('stale_qualification_reused');
  return [...new Set(f)];
}

export function qualifyCausalCase(input={}){
  const violations=validateCausalCase(input);
  const oracle=input.oracle||null;
  const executed=Boolean(oracle&&(Number(oracle.stepsExecuted||0)>0||oracle.executed===true));
  let verdict='PASS',patchDisposition='NOT_REQUIRED',brokenStage=null;
  if(!oracle){verdict='INSUFFICIENT_EVIDENCE';brokenStage='ORACLE';patchDisposition='BLOCKED';}
  else if(oracle.controlPlaneBlocked===true){verdict='CONTROL_PLANE_BLOCKED';brokenStage='ORACLE';patchDisposition='RECONCILE_CONTROL_PLANE';}
  else if(oracle.admissionBlocked===true&&!executed){verdict='EXTERNAL_ORACLE_BLOCKED';brokenStage='ORACLE';patchDisposition='RETRY_ORACLE';}
  else if(!executed){verdict='INSUFFICIENT_EVIDENCE';brokenStage='ORACLE';patchDisposition='BLOCKED';}
  else if(String(oracle.conclusion||'').toLowerCase()==='failure'){
    verdict='EXECUTED_FAILURE';brokenStage=input.rootCause?.stage||'ORACLE';patchDisposition=input.rootCause?.supportedByEvidence===true&&input.patch?.causalSupport===true?'SUPPORTED':'INVESTIGATE';
  }
  if(violations.some(x=>['owner_missing','owner_collision','writer_missing','writer_collision','transition_owner_bypass','evaluator_side_effect','projection_authority_widening'].includes(x))){verdict='CONTROL_PLANE_BLOCKED';patchDisposition='RECONCILE_CONTROL_PLANE';brokenStage=brokenStage||'AUTHORITY';}
  if(violations.some(x=>['live_fact_without_provenance','evidence_wrong_class','evidence_cross_candidate','claim_exceeds_evidence'].includes(x))&&verdict==='PASS'){verdict='INSUFFICIENT_EVIDENCE';patchDisposition='BLOCKED';brokenStage='EVIDENCE';}
  const qualificationEligible=verdict==='PASS'&&violations.length===0&&Boolean(input.evidence?.candidateSha)&&Boolean(input.claim?.id);
  const body={schema:'ictc-trama-causal-qualification/v1',authorityEffect:'NONE',sourceOfTruth:false,writer:false,networkAccess:false,persistsState:false,verdict,brokenStage,violations,patchDisposition,qualificationDisposition:qualificationEligible?'ELIGIBLE':'NOT_ELIGIBLE',candidateSha:input.evidence?.candidateSha||null,claimId:input.claim?.id||null,limitations:['Derived causal qualification only; it does not mutate repository/product truth, promote capabilities, merge, release or close external evidence rails.']};
  body.digest=digest(body);
  return Object.freeze(body);
}

export function qualificationValidity(receipt={},current={}){
  const keys=['contractDigest','ownerId','writerId','candidateSha','oracleClass','evidenceProducerDigest'];
  const changed=keys.filter(k=>receipt[k]!=null&&current[k]!=null&&receipt[k]!==current[k]);
  const status=changed.length?'INVALIDATED':receipt.status==='STALE'?'STALE':'VALID';
  return Object.freeze({schema:'ictc-trama-qualification-validity/v1',status,changed,authorityEffect:'NONE'});
}
