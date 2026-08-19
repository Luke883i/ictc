import { assertExpectedExperienceParticipants, orderExperienceParticipants } from './experience-constitution.js';

const participants=new Map();
const pendingReasons=new Set();
let lifecycleInstalled=false,scheduled=false,flushing=false,replay=false,cycle=0;

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
export function runExperienceLifecycle(reason='manual'){
  pendingReasons.add(reason);
  if(flushing){replay=true;return;}
  do{
    replay=false;flushing=true;cycle++;
    const reasons=[...pendingReasons];pendingReasons.clear();
    const ordered=orderExperienceParticipants([...participants.values()]);
    try{
      for(const participant of ordered)participant.render(Object.freeze({cycle,reasons,phase:participant.phase,participant:participant.id}));
    }finally{flushing=false;}
  }while(replay||pendingReasons.size);
}
export function requestExperienceLifecycle(reason='requested'){
  pendingReasons.add(reason);
  if(scheduled)return;
  scheduled=true;
  // Microtask is only a coalescing boundary. Authority order is defined by EXPERIENCE_PHASES.
  queueMicrotask(()=>{scheduled=false;runExperienceLifecycle('coalesced');});
}
export function installExperienceLifecycle(){
  if(lifecycleInstalled)return;
  lifecycleInstalled=true;
  document.addEventListener('ictc:rendered',()=>requestExperienceLifecycle('ictc:rendered'));
  document.addEventListener('ictc:surface-changed',()=>requestExperienceLifecycle('ictc:surface-changed'));
  document.addEventListener('toggle',()=>requestExperienceLifecycle('toggle'),true);
}
