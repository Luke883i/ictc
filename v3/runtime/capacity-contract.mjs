import { readFileSync } from 'node:fs';

const contract=Object.freeze(JSON.parse(readFileSync(new URL('../c3-capacity-contract.json',import.meta.url),'utf8')));
export const C3_CAPACITY_CONTRACT=contract;
export const C3_CAPACITY_TARGET=Object.freeze({...contract.targetEnvelope});
export const C3_CAPACITY_ARCHITECTURE_KEYS=Object.freeze([...contract.architectureRequirements]);

const finite=value=>Number.isFinite(Number(value))?Number(value):null;
function architectureState(value){return value===true?'supported':value===false?'unsupported':'unknown';}
function blocker(id,kind,observed,required){return Object.freeze({id,kind,observed:observed??null,required});}

export function capacityContractProjection({architecture={},evidence=null,context={}}={}){
  const normalizedArchitecture=Object.fromEntries(C3_CAPACITY_ARCHITECTURE_KEYS.map(key=>[key,architectureState(architecture?.[key])]));
  const blockers=[];
  for(const key of C3_CAPACITY_ARCHITECTURE_KEYS){if(normalizedArchitecture[key]!=='supported')blockers.push(blocker(`architecture:${key}`,'architecture',normalizedArchitecture[key],'supported'));}
  const requiredEvidence=contract.evidenceRequirements||{};
  const observedEvidence=evidence&&typeof evidence==='object'?evidence:{};
  for(const [key,required] of Object.entries(requiredEvidence)){if(observedEvidence[key]!==required)blockers.push(blocker(`evidence:${key}`,'evidence',observedEvidence[key],required));}
  const target=C3_CAPACITY_TARGET;
  const minimums=[['activeConcurrentUsersFleet','minimumActiveConcurrentUsersFleet'],['hotTenantActiveConcurrentUsers','minimumHotTenantActiveConcurrentUsers'],['applicationReplicas','minimumApplicationReplicas']];
  for(const [observedKey,targetKey] of minimums){const observed=finite(observedEvidence[observedKey]),required=target[targetKey];if(observed==null||observed<required)blockers.push(blocker(`evidence:${observedKey}`,'capacity',observed,`>=${required}`));}
  const replicas=finite(observedEvidence.applicationReplicas);if(replicas!=null&&replicas>target.maximumApplicationReplicas)blockers.push(blocker('evidence:applicationReplicas:max','capacity',replicas,`<=${target.maximumApplicationReplicas}`));
  const maximums=[['ordinaryWriteReceiptP95Ms','ordinaryWriteReceiptP95Ms'],['ordinaryReconcileP95Ms','ordinaryReconcileP95Ms'],['ordinaryReadP95Ms','ordinaryReadP95Ms'],['independentSubjectFalseConflicts','independentSubjectFalseConflicts'],['sameSubjectLostUpdates','sameSubjectLostUpdates'],['duplicateCommittedCommandEffects','duplicateCommittedCommandEffects']];
  for(const [observedKey,targetKey] of maximums){const observed=finite(observedEvidence[observedKey]),required=target[targetKey];if(observed==null||observed>required)blockers.push(blocker(`evidence:${observedKey}`,'capacity',observed,`<=${required}`));}
  if(observedEvidence.revisionGapRecovered!==target.revisionGapMustRecover)blockers.push(blocker('evidence:revisionGapRecovered','correctness',observedEvidence.revisionGapRecovered,target.revisionGapMustRecover));
  const ready=blockers.length===0;
  return Object.freeze({schemaVersion:contract.schemaVersion,contractId:contract.id,status:ready?'scale-ready':'scale-blocked',enterpriseScaleReady:ready,target:Object.freeze({...target}),architecture:Object.freeze(normalizedArchitecture),evidenceClass:observedEvidence.kind||'none',evidenceQualifying:Object.entries(requiredEvidence).every(([key,value])=>observedEvidence[key]===value),blockers:Object.freeze(blockers),context:Object.freeze({...context}),minimumLattice:Object.freeze([...contract.minimumLattice]),claimBoundary:contract.claimBoundary});
}
