export const EXPERIENCE_ROOT=Object.freeze({id:'active-experience',installer:'installActiveExperience'});
export const EXPERIENCE_PHASES=Object.freeze(['presentation','integrity','journey']);
export const EXPERIENCE_AUTHORITIES=Object.freeze({
  'decision-presentation':'presentation',
  'integrity-observer':'integrity',
  'journey-overlay':'journey'
});
export const EXPECTED_EXPERIENCE_PARTICIPANTS=Object.freeze([
  Object.freeze({id:'procedure-ui-ux-1-6',phase:'presentation',authority:'decision-presentation',exclusive:true}),
  Object.freeze({id:'procedure-ui-ux-integrity-1-6',phase:'integrity',authority:'integrity-observer',exclusive:false}),
  Object.freeze({id:'procedure-sequential-ux-2-2',phase:'journey',authority:'journey-overlay',exclusive:false})
]);

function unique(values){return[...new Set(values)];}
export function analyzeExperienceParticipants(participants){
  const failures=[];
  if(!Array.isArray(participants))return['participants-not-array'];
  const ids=new Set(),exclusiveAuthorities=new Map();
  for(const participant of participants){
    if(!participant||typeof participant!=='object'){failures.push('participant-invalid');continue;}
    const{id,phase,authority,exclusive,render}=participant;
    if(typeof id!=='string'||!id.trim())failures.push('participant-id-missing');
    else if(ids.has(id))failures.push('duplicate-participant');
    else ids.add(id);
    if(!EXPERIENCE_PHASES.includes(phase))failures.push('unknown-phase');
    if(!Object.hasOwn(EXPERIENCE_AUTHORITIES,authority))failures.push('unknown-authority');
    else if(EXPERIENCE_AUTHORITIES[authority]!==phase)failures.push('phase-authority-mismatch');
    if(typeof exclusive!=='boolean')failures.push('exclusive-flag-invalid');
    if(authority==='decision-presentation'&&exclusive!==true)failures.push('decision-presentation-not-exclusive');
    if(authority!=='decision-presentation'&&exclusive===true)failures.push('non-presentation-authority-exclusive');
    if(exclusive===true&&typeof authority==='string'){
      if(exclusiveAuthorities.has(authority))failures.push('exclusive-authority-conflict');
      else exclusiveAuthorities.set(authority,id);
    }
    if(typeof render!=='function')failures.push('render-missing');
  }
  return unique(failures).sort();
}
export function orderExperienceParticipants(participants){
  const failures=analyzeExperienceParticipants(participants);
  if(failures.length){
    const error=new Error(`Invalid experience constitution: ${failures.join(', ')}`);
    error.code='experience-constitution-invalid';
    error.failures=failures;
    throw error;
  }
  return[...participants].sort((a,b)=>EXPERIENCE_PHASES.indexOf(a.phase)-EXPERIENCE_PHASES.indexOf(b.phase)||a.id.localeCompare(b.id));
}
export function assertExpectedExperienceParticipants(participants){
  const ordered=orderExperienceParticipants(participants);
  const byId=new Map(ordered.map(participant=>[participant.id,participant]));
  const failures=[];
  for(const expected of EXPECTED_EXPERIENCE_PARTICIPANTS){
    const actual=byId.get(expected.id);
    if(!actual){failures.push(`missing:${expected.id}`);continue;}
    for(const key of['phase','authority','exclusive'])if(actual[key]!==expected[key])failures.push(`drift:${expected.id}:${key}`);
  }
  if(ordered.length!==EXPECTED_EXPERIENCE_PARTICIPANTS.length)failures.push('unexpected-participant');
  if(failures.length){
    const error=new Error(`Experience participant drift: ${failures.join(', ')}`);
    error.code='experience-participant-drift';
    error.failures=failures;
    throw error;
  }
  return ordered;
}
