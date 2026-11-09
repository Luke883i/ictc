import { createHash, randomUUID } from 'node:crypto';
import {
  ENTERPRISE_RUNTIME_GAPS,
  assertEnterpriseRuntimeProfile,
  asyncProviderAccepted,
  projectionDeltaReceipt,
  revisionGapDecision
} from './enterprise-scale-runtime.mjs';
const text=(value,max=500)=>String(value??'').trim().slice(0,max);
const sha256=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
function fail(code,message,details={}){throw Object.assign(new Error(message),{code,details});}

export function createEnterpriseRuntimeKernel({persistence,blob,rate,telemetry,work=persistence,projectionOwnerResolver=subjects=>subjects.map(item=>item.subject?.type).filter(Boolean)}={}){
  const profile=assertEnterpriseRuntimeProfile({persistence,blob,rate,telemetry,work});
  if(typeof projectionOwnerResolver!=='function')throw new TypeError('projectionOwnerResolver required');
  async function commit({tenantId,commandId,actorId,action,subjects,event={},providerWork=[]}={}){
    const owners=[...new Set(projectionOwnerResolver(subjects)||[])].map(item=>text(item,120)).filter(Boolean);if(!owners.length)fail('projection-owner-missing','Enterprise mutation requires at least one bounded projection owner');
    const workItems=providerWork.map((item,index)=>({workKey:text(item.workKey,500)||`provider:${text(commandId,200)}:${index+1}`,kind:text(item.kind,120)||'provider-work',payload:item.payload??{}}));
    const envelope=await persistence.commitMutation({tenantId,commandId,actorId,action,subjects,projectionOwners:owners,event,workItems}),receipt=envelope.receipt,delta=projectionDeltaReceipt({tenantId,baseRevision:Math.max(0,Number(receipt.tenantRevision)-1),targetRevision:Number(receipt.tenantRevision),subjects:receipt.subjects.map(item=>item.subject),projectionOwners:receipt.projectionOwners}),acceptedWork=workItems.map(item=>asyncProviderAccepted({workItemId:item.workKey,kind:item.kind,tenantId,subject:subjects[0]?.subject,commandId}));
    return Object.freeze({...envelope,delta,providerWork:Object.freeze(acceptedWork)});
  }
  async function query(input){return persistence.readProjection(input);}
  function recover(clientRevision,delta){return revisionGapDecision({clientRevision,delta});}
  async function enqueueProviderWork({tenantId,commandId,subject,kind,payload,workKey=randomUUID()}={}){const queued=await work.enqueueWork({tenantId,workKey,kind:kind||'provider-work',payload:{...payload,commandId,subject}});return asyncProviderAccepted({workItemId:queued.workKey,kind:queued.kind||kind||'provider-work',tenantId,subject,commandId});}
  async function emitTelemetry(fields){return telemetry.emit(fields);}
  function consumeRate(input){return rate.consume(input);}
  return Object.freeze({schemaVersion:'1.0.0',authority:'enterprise-runtime-kernel',profile,capabilities:Object.freeze(Object.fromEntries(ENTERPRISE_RUNTIME_GAPS.map(id=>[id,true]))),commit,query,recover,enqueueProviderWork,claimWork:input=>work.claimWork(input),completeWork:input=>work.completeWork(input),putBlob:input=>blob.put(input),getBlob:input=>blob.get(input),removeBlob:input=>blob.remove(input),promoteBlob:input=>blob.promote(input),consumeRate,emitTelemetry,semanticFingerprint:()=>sha256({profile:profile.capabilities,gaps:ENTERPRISE_RUNTIME_GAPS})});
}
