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
function publishConvergence(){
  if(typeof document==='undefined'||!document.documentElement)return;
  document.documentElement.dataset.experienceCycle=String(cycle);
  document.dispatchEvent(new CustomEvent('ictc:experience-converged',{detail:Object.freeze({cycle})}));
}
export function runExperienceLifecycle(reason='manual'){
  pendingReasons.add(reason);
  if(flushing){replay=true;return cycle;}
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
  publishConvergence();
  return cycle;
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
  // Non-final enhancers are installed before this listener. Their coalesced work therefore runs first;
  // the constitutional lifecycle is always the final converger for every semantic projection/surface event.
  document.addEventListener('ictc:rendered',()=>requestExperienceLifecycle('ictc:rendered'));
  document.addEventListener('ictc:surface-changed',()=>requestExperienceLifecycle('ictc:surface-changed'));
  document.addEventListener('ictc:context-changed',()=>requestExperienceLifecycle('ictc:context-changed'));
  document.addEventListener('ictc:projection-committed',()=>requestExperienceLifecycle('ictc:projection-committed'));
  document.addEventListener('toggle',()=>requestExperienceLifecycle('toggle'),true);
}
