/** Reviewer-like decisions are test fixtures, never independent human judgments. */
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {runtimeHarness} from './runtime-test-harness.mjs';

const h=await runtimeHarness('ictc-human-like-e2e');
const evidence=[];
const record=(label,result,expected,actor,rationale)=>{
 assert.equal(result.status,expected,`${label}: ${JSON.stringify(result.body).slice(0,400)}`);
 const hash=result.body.receipt?.hash||result.body.raw?.receipt?.hash||null;
 if(expected>=200&&expected<300)assert.match(hash||'',/^[0-9a-f]{64}$/,'missing durable receipt for '+label);
 evidence.push({label,actor,rationale,http:result.status,receiptHash:hash,provenance:'test-harness simulated actor; no human authenticated'});
 return result.body;
};
try{
 let b=await h.bootstrap('admin','model-reviewer');assert.equal(b.status,200);
 // RN-01: contribution is a candidate only; no automatic verification or applicability.
 const contribution=await h.request('POST','/api/contributions',
  {links:['https://eur-lex.europa.eu/eli/dir/2022/2555/oj'],text:'Official public directive candidate',note:'Require human source and relevance assessment'},
  'user','source-reporter');
 assert.ok([200,201].includes(contribution.status),JSON.stringify(contribution.body).slice(0,400));
 const contributionHash=contribution.body.raw?.receipt?.hash;
 assert.match(contributionHash||'',/^[0-9a-f]{64}$/);
 evidence.push({label:'RN-01 source contributed, candidate only',actor:'source-reporter',rationale:'Defer applicability and official verification; no autonomous approval',http:contribution.status,receiptHash:contributionHash,provenance:'simulated user actor'});
 const policyDeny=await h.request('POST','/api/contributions',
  {links:['https://eur-lex.europa.eu/eli/dir/2022/2555/oj'],text:'Auditor attempt'},'auditor','audit-reader');
 record('RN-01 auditor contribution denied',policyDeny,403,'audit-reader','Least privilege blocks source creation');
 // EC-01: preserve original and awareness from user, no AI-to-human promotion.
 const story='At 09:00 an email gateway reported suspicious phishing activity; confirmed impact unknown.';
 const observedAt='2026-11-02T08:00:00.000Z';
 const intake=await h.request('POST','/api/incidents/intake',{originalNarrative:story,awarenessAt:observedAt},'user','case-reporter');
 assert.ok([200,201].includes(intake.status),JSON.stringify(intake.body).slice(0,450));
 const inc=intake.body.incident;assert.ok(inc?.id);assert.equal(inc.originalNarrative,story);assert.equal(inc.awarenessAt,observedAt);
 const incHash=intake.body.raw?.receipt?.hash;assert.match(incHash||'',/^[0-9a-f]{64}$/);
 evidence.push({label:'EC-01 original narrative and awareness preserved',actor:'case-reporter',rationale:'Record original observation, keep impact unresolved',http:intake.status,receiptHash:incHash,provenance:'simulated user actor'});
 const auditor=await h.request('POST','/api/incidents/intake',{originalNarrative:'Forbidden auditor write',awarenessAt:observedAt},'auditor','audit-reader');
 record('EC-01 auditor cannot create case',auditor,403,'audit-reader','Least privilege denies audit write');
 const unreadable=await h.bootstrap('user','other-reporter');assert.equal(unreadable.status,200);
 assert.equal(unreadable.body.incidents.some(x=>x.id===inc.id),false,'cross-user incident privacy');
 const owner=await h.bootstrap('user','case-reporter');assert.equal(owner.body.incidents.find(x=>x.id===inc.id)?.originalNarrative,story);
 // AO-01: model chooses explicit reviewer identity separate from creator identity.
 const obj=await h.request('POST','/api/grc/objects',{type:'server',name:'Human-like review fixture',owner:'IT',criticality:'high',sourceAuthority:'CMDB'},'admin','model-operator');
 const created=record('AO-01 accountable create',obj,201,'model-operator','Source and owner recorded');assert.ok(created.result?.id);
 const id=created.result.id;
 const noBasis=await h.request('POST',`/api/grc/objects/${id}/review`,{decision:'active'},'admin','model-reviewer');
 record('AO-01 review without rationale rejected',noBasis,400,'model-reviewer','Refuse unsupported decision');
 const reviewed=await h.request('POST',`/api/grc/objects/${id}/review`,{decision:'active',reason:'Model-reviewer checks explicit owner and CMDB reference; simulated decision, not external attestation'},'admin','model-reviewer');
 record('AO-01 reasoned review',reviewed,200,'model-reviewer','Separate test identity and explicit rationale');
 const state=await h.bootstrap('admin','model-reviewer');assert.ok(state.body.grc?.objects?.items?.some(x=>x.id===id)||state.body.grc?.objects?.counts?.active>=1||state.body.work);
 const report={schema:'ictc-model-assisted-decision-receipts/v1',classification:'SIMULATION_ONLY',
  modelGeneratedRationales:true,independentHumanApproval:false,externalEvidenceOfAuthority:false,
  processes:['RN-01','EC-01','AO-01'],decisions:evidence,
  checks:{rnCandidateRecorded:true,rnAuditorDenied:true,ecOriginalAndAwarenessPreserved:true,ecAuditorDenied:true,ecCrossUserPrivacy:true,aoReasonedDistinctActor:true,aoUnreasonedDecisionRejected:true},
  claimBoundary:'Attestable HTTP commands, hash receipts, distinct test actor identifiers, rationale and negative controls. The assistant and local test identities are not real independent human reviewers; no external authorization, regulatory decision, human competence or 53-step closure.'};
 await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/model-assisted-decision-receipts.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({ok:true,processes:report.processes,simulatedDecisions:evidence.length,hashes:evidence.filter(x=>x.receiptHash).length,negativeDenied:evidence.filter(x=>x.http>=400).length}));
}finally{await h.close();}
