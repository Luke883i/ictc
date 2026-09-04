const text=(value,max=500)=>String(value??'').trim().slice(0,max);
const ms=value=>{const n=Number(value);return Number.isFinite(n)?Math.trunc(n):NaN;};
export const SCHEDULER_LEASE_MIN_MS=30_000;
export const SCHEDULER_LEASE_MAX_MS=30*60_000;
export function normalizeSchedulerClaimRequest({workKey,dueAt,ownerId,leaseMs,at=new Date().toISOString()}={}){
  const key=text(workKey,500),owner=text(ownerId,300),due=new Date(dueAt),now=new Date(at),lease=ms(leaseMs);
  if(!key||!owner||Number.isNaN(due.valueOf())||Number.isNaN(now.valueOf())||!Number.isFinite(lease))throw Object.assign(new Error('Invalid scheduler claim request'),{code:'scheduler-claim-invalid'});
  const bounded=Math.max(SCHEDULER_LEASE_MIN_MS,Math.min(SCHEDULER_LEASE_MAX_MS,lease));
  return{workKey:key,dueAt:due.toISOString(),ownerId:owner,leaseMs:bounded,at:now.toISOString(),leaseUntil:new Date(now.valueOf()+bounded).toISOString()};
}
export function schedulerClaimDecision(current,raw){
  const request=normalizeSchedulerClaimRequest(raw),now=Date.parse(request.at);
  if(!current)return{kind:'claim',fence:1,request};
  const alive=!current.releasedAt&&Date.parse(current.leaseUntil)>now;
  const sameDue=String(current.dueAt)===request.dueAt;
  const sameOwner=String(current.ownerId)===request.ownerId;
  if(alive&&sameDue&&sameOwner)return{kind:'replay',fence:Number(current.fence),request:{...request,leaseUntil:current.leaseUntil}};
  if(alive)return{kind:'held',fence:Number(current.fence),request,holder:{ownerId:current.ownerId,dueAt:current.dueAt,leaseUntil:current.leaseUntil}};
  return{kind:'claim',fence:Number(current.fence||0)+1,request};
}
export function assertSchedulerClaimRecord(current,claim,{at=new Date().toISOString()}={}){
  const now=Date.parse(at);if(!current||!claim)throw Object.assign(new Error('Scheduler claim missing'),{code:'scheduler-claim-missing'});
  if(current.releasedAt)throw Object.assign(new Error('Scheduler claim released'),{code:'scheduler-claim-released'});
  if(String(current.workKey)!==String(claim.workKey)||String(current.ownerId)!==String(claim.ownerId)||String(current.dueAt)!==String(claim.dueAt)||Number(current.fence)!==Number(claim.fence))throw Object.assign(new Error('Scheduler claim fenced'),{code:'scheduler-claim-fenced'});
  if(!(Date.parse(current.leaseUntil)>now))throw Object.assign(new Error('Scheduler claim expired'),{code:'scheduler-claim-expired'});
  return true;
}
