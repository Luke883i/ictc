import { assertExpectedExperienceParticipants, orderExperienceParticipants } from './experience-constitution.js';

const participants=new Map();
const pendingReasons=new Set();
export const MAX_EXPERIENCE_REPLAY_CYCLES=32;
let lifecycleInstalled=false,scheduled=false,flushing=false,replay=false,cycle=0,scheduleEpoch=0;

export function registerExperienceParticipant(participant){
  if(participants.has(participant?.id)){
    const error=new Error(`Experience participant already registered: ${participant?.id||'unknown'}`);
    error.code='experience-participant-duplicate';
    throw error;
  }
  const candidate=[...participants.values(),participant];
  orderExperienceParticipants(candidate);
  participants.set(participant.id,Object.freeze({...participant}));
}
export function registeredExperienceParticipants(){return orderExperienceParticipants([...participants.values()]);}
export function assertRegisteredExperienceConstitution(){return assertExpectedExperienceParticipants([...participants.values()]);}
function invalidateScheduledLifecycle(){if(!scheduled)return;scheduled=false;scheduleEpoch++;}
export function runExperienceLifecycle(reason='manual'){
  pendingReasons.add(reason);
  if(flushing){replay=true;return;}
  invalidateScheduledLifecycle();
  let replayCycles=0;
  while(true){
    replayCycles++;
    if(replayCycles>MAX_EXPERIENCE_REPLAY_CYCLES){
      const reasons=[...pendingReasons];pendingReasons.clear();replay=false;
      const error=new Error(`Experience lifecycle did not converge within ${MAX_EXPERIENCE_REPLAY_CYCLES} replay cycles`);
      error.code='experience-lifecycle-nonconvergent';error.replayCycles=replayCycles;error.pendingReasons=reasons;
      throw error;
    }
    replay=false;flushing=true;cycle++;
    const reasons=[...pendingReasons];pendingReasons.clear();
    const ordered=orderExperienceParticipants([...participants.values()]);
    try{
      for(const participant of ordered)participant.render(Object.freeze({cycle,reasons,phase:participant.phase,participant:participant.id}));
    }finally{flushing=false;}
    if(!replay&&!pendingReasons.size)break;
  }
}
export function requestExperienceLifecycle(reason='requested'){
  pendingReasons.add(reason);
  if(flushing){replay=true;return;}
  if(scheduled)return;
  scheduled=true;
  const epoch=++scheduleEpoch;
  // Microtask is only a coalescing boundary. Authority order is defined by EXPERIENCE_PHASES.
  queueMicrotask(()=>{if(!scheduled||epoch!==scheduleEpoch)return;scheduled=false;runExperienceLifecycle('coalesced');});
}
export function installExperienceLifecycle(){
  if(lifecycleInstalled)return;
  lifecycleInstalled=true;
  document.addEventListener('ictc:rendered',()=>requestExperienceLifecycle('ictc:rendered'));
  document.addEventListener('ictc:surface-changed',()=>requestExperienceLifecycle('ictc:surface-changed'));
  document.addEventListener('toggle',()=>requestExperienceLifecycle('toggle'),true);
}
