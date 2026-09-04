import { sha256 } from '../domain.mjs';
import { procedureIdForSubject } from './procedure-adapters.mjs';

export const COMPATIBILITY_ACTION_SEMANTICS=Object.freeze({
  'monitoring.mission.planned':{families:['proposed'],producerRef:{type:'service',id:'ai-provider'}},
  'monitoring.run.completed':{families:['proposed'],producerRef:{type:'service',id:'ai-provider'}},
  'monitoring.job.planned':{families:['proposed'],producerRef:{type:'service',id:'ai-provider'}},
  'workbench.job.planned':{families:['proposed'],producerRef:{type:'service',id:'ai-provider'}},
  'workbench.job.run.completed':{families:['proposed'],producerRef:{type:'service',id:'ai-provider'}},
  'contribution.enriched':{families:['proposed'],producerRef:{type:'service',id:'ai-provider'}},
  'incident.analyzed':{families:['proposed'],producerRef:{type:'service',id:'ai-provider'}},
  'incident.draft.generated':{families:['proposed'],producerRef:{type:'service',id:'ai-provider'}},
  'catalog.source.decided':{families:['decided']},
  'incident.submitted':{families:['decided']},
  'incident.closed':{families:['decided']},
  'grc.object.reviewed':{families:['decided']},
  'grc.object.reattested':{families:['attested']},
  'grc.mapping.decided':{families:['decided']},
  'grc.action.adopted':{families:['decided']},
  'grc.action.verified':{families:['decided']},
  'grc.risk.reviewed':{families:['decided']},
  'grc.risk.treatment.decided':{families:['decided']},
  'grc.assurance.approved':{families:['decided']},
  'standard.requirement-scope.decided':{families:['decided']},
  'standard.scope.decided':{families:['decided']}
});

function legacySemanticsForAction(action=''){
  const exact=COMPATIBILITY_ACTION_SEMANTICS[String(action)];
  if(exact)return exact;
  if(/\.ai\.|ai\./.test(String(action)))return{families:['proposed'],producerRef:{type:'service',id:'ai-provider'}};
  return{families:['observed']};
}
function actorAuthority(actorId,role){if(String(actorId||'').startsWith('system:')||role==='system'||role==='service')return{type:'service',id:String(actorId||'ictc-runtime')};return{type:'principal',id:String(actorId||'unknown')};}
function defaultProducer(event){return structuredClone(legacySemanticsForAction(event?.action)?.producerRef||actorAuthority(event?.actorId,event?.role));}
function declaredEffects(event){return Array.isArray(event?.metadata?.epistemicEffects)?event.metadata.epistemicEffects:[];}
function wildcardEffectFor(event){return declaredEffects(event).find(item=>item?.scope==='all-subject-versions'||item?.scope==='event')||null;}
function explicitEffectFor(event,version,ordinal){const declared=declaredEffects(event);return declared.find(item=>item?.subjectVersionId===version?.id)||declared.find(item=>item?.subject?.type===version?.subject?.type&&item?.subject?.id===version?.subject?.id)||declared.find(item=>Number(item?.ordinal)===ordinal+1)||declared.find(item=>item?.scope==='all-subject-versions')||null;}
function defaultBasisRefs(event,version,families){if(!families.includes('proposed'))return[];if(version?.predecessorId)return[{subjectVersionId:version.predecessorId}];if(event?.inputSha256)return[{type:'command-input-digest',id:event.inputSha256}];return[];}
const subjectKey=value=>`${String(value?.type||'')}\u0000${String(value?.id||'')}`;
export function semanticManifest(subjectVersions=[],reviewNeeds=[]){const versions=(subjectVersions||[]).map(item=>({id:item.id,revision:item.revision??null,subject:structuredClone(item.subject||null),predecessorId:item.predecessorId||null,payloadSha256:item.payloadSha256,semanticSchemaVersion:item.semanticSchemaVersion||null,canonicalizationVersion:item.canonicalizationVersion||null})).sort((a,b)=>subjectKey(a.subject).localeCompare(subjectKey(b.subject))||String(a.id).localeCompare(String(b.id))),reviews=(reviewNeeds||[]).map(item=>({id:item.id,processId:item.processId||null,subject:structuredClone(item.subject||null),checkpoint:item.checkpoint||null,causeDigests:[...(item.causeDigests||[])].map(String).sort(),policyVersion:item.policyVersion||null,openedRevision:item.openedRevision??null})).sort((a,b)=>String(a.id).localeCompare(String(b.id)));return{schemaVersion:'1.0.0',subjectVersions:versions,reviewNeeds:reviews};}
export function semanticManifestSha256(subjectVersions=[],reviewNeeds=[]){return sha256(semanticManifest(subjectVersions,reviewNeeds));}
export function verifyEpistemicStep(step){if(!step||typeof step!=='object'||!step.stepSha256)return false;const copy=structuredClone(step),expected=copy.stepSha256;delete copy.stepSha256;return sha256(copy)===expected;}
export function buildEpistemicStep(event,subjectVersions=[],reviewNeeds=[]){const effects=(subjectVersions||[]).map((version,ordinal)=>{const declared=explicitEffectFor(event,version,ordinal),legacy=legacySemanticsForAction(event?.action),producer=structuredClone(declared?(declared.producerRef||declared.authorityRef||actorAuthority(event?.actorId,event?.role)):(legacy.producerRef||defaultProducer(event))),families=Array.isArray(declared?.families)&&declared.families.length?[...new Set(declared.families.map(String))]:legacy.families,basisRefs=Array.isArray(declared?.basisRefs)&&declared.basisRefs.length?structuredClone(declared.basisRefs):defaultBasisRefs(event,version,families);return{ordinal:ordinal+1,kind:String(declared?.kind||'subject-versioned'),families,subjectVersionId:version.id,subject:structuredClone(version.subject),payloadSha256:version.payloadSha256,authorityRef:producer,producerRef:producer,basisRefs,relation:declared?.relation?structuredClone(declared.relation):null,classificationSource:declared?'declared-effect':COMPATIBILITY_ACTION_SEMANTICS[String(event?.action)]?'compatibility-action-registry':'safe-action-fallback'};});for(const review of reviewNeeds||[])effects.push({ordinal:effects.length+1,kind:'review-needed',families:['derived'],reviewNeedRef:review.id,subject:structuredClone(review.subject),causeDigests:structuredClone(review.causeDigests||[]),authorityRef:{type:'service',id:'ictc-review-policy'},producerRef:{type:'service',id:'ictc-review-policy'},basisRefs:structuredClone(review.causes||[]),relation:{predicate:'requires-review-of',object:structuredClone(review.subject)},classificationSource:'review-policy'});if(!effects.length){const declared=wildcardEffectFor(event),legacy=legacySemanticsForAction(event?.action),producer=structuredClone(declared?(declared.producerRef||declared.authorityRef||actorAuthority(event?.actorId,event?.role)):(legacy.producerRef||defaultProducer(event))),families=Array.isArray(declared?.families)&&declared.families.length?[...new Set(declared.families.map(String))]:event?.action==='integrity.state-bound'?['attested']:legacy.families;effects.push({ordinal:1,kind:String(declared?.kind|| (event?.action==='integrity.state-bound'?'policy-recorded':'observation-recorded')),families,subject:structuredClone(event?.subject||null),authorityRef:producer,producerRef:producer,basisRefs:Array.isArray(declared?.basisRefs)?structuredClone(declared.basisRefs):defaultBasisRefs(event,null,families),relation:declared?.relation?structuredClone(declared.relation):null,classificationSource:declared?'declared-effect':COMPATIBILITY_ACTION_SEMANTICS[String(event?.action)]?'compatibility-action-registry':'safe-action-fallback'});}const initiator=actorAuthority(event?.actorId,event?.role),step={schemaVersion:'1.4.0',eventId:event.id,revision:event.revision,transactionAt:event.at,semanticManifestSha256:event?.metadata?.semanticManifestSha256||null,procedureContext:{primaryProcedureId:procedureIdForSubject(event?.subject?.type)||null,procedurePolicyVersion:event?.metadata?.procedurePolicyVersion||null,accessPolicyVersion:event?.metadata?.accessPolicyVersion||null},execution:{initiatorRef:initiator,executorRef:{type:'service',id:'ictc-runtime'},originKind:event?.role==='service'||event?.role==='system'?'system-execution':'human-command'},command:{inputSha256:event.inputSha256||null},effects,correlationId:event?.metadata?.correlationId||null,causationEventId:event?.metadata?.causationEventId||null,limitations:['Epistemic effects describe recorded ICTC operations and authority; they do not upgrade observations, AI proposals or evidence into substantive compliance conclusions.','Current material write paths declare metadata.epistemicEffects explicitly; compatibility action semantics remain only for legacy/non-current records and regressions.','Unknown legacy action names can never promote a record to decided or attested authority; only an explicit epistemicEffect or an enumerated compatibility action can do so.']};step.stepSha256=sha256(step);return step;}
