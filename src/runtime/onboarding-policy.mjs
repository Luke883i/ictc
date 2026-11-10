import { createHash } from 'node:crypto';
import { HOMEBOARDING_STAGES } from '../../public/ui/product-copy.js';
import { HOMEBOARDING_LESSONS } from '../../public/ui/homeboarding-lessons-v3.js';
export const ONBOARDING_VERSION='2.0.0';
const lessonIndex=new Map(HOMEBOARDING_LESSONS.map(x=>[x.id,x]));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const ONBOARDING_CHAPTERS=Object.freeze(HOMEBOARDING_STAGES.map((stage,index)=>{
 const lessons=stage.lesson_ids.map(id=>lessonIndex.get(id));
 if(stage.id!=='C'+(index+1)||lessons.length!==3||lessons.some(x=>!x))throw new Error('Invalid onboarding lesson mapping');
 return Object.freeze({...stage,lessons:Object.freeze(lessons),contentDigest:hash({stage,lessons})});
}));
export const ONBOARDING_CONTRACT_DIGEST=hash({version:ONBOARDING_VERSION,chapters:ONBOARDING_CHAPTERS.map(c=>c.contentDigest)});
export function onboardingProjectionV2(saved,synthetic=false){
 const o=saved||{},oldAccepted=Boolean(o.acceptedAt),count=Array.isArray(o.chapterAcknowledgements)?o.chapterAcknowledgements.length:0;
 const accepted=!synthetic&&oldAccepted,progress=accepted?100:Math.min(100,count*20),index=accepted?0:Math.min(count,4);
 return {schemaVersion:o.schemaVersion||ONBOARDING_VERSION,authority:synthetic?'synthetic-demo-fixture':'user-record',
  startedAt:o.startedAt||null,progress,elapsedMs:Number(o.elapsedMs||0),acceptedAt:accepted?o.acceptedAt:null,accepted,
  readOnly:accepted,synthetic:Boolean(synthetic),policyVersion:ONBOARDING_VERSION,contractDigest:ONBOARDING_CONTRACT_DIGEST,
  chapterIndex:index,chapter:ONBOARDING_CHAPTERS[index],completedChapters:accepted?5:count,
  acceptanceMeaning:'presa-visione-dichiarata-non-prova-di-lettura-o-comprensione'};
}
export function acknowledgeOnboardingV2(saved,input,{actorId,tenantId,at}){
 if(typeof actorId!=='string'||!actorId||typeof tenantId!=='string'||!tenantId||!Number.isFinite(Date.parse(at)))throw Object.assign(new Error('Identità o tempo non validi'),{code:'onboarding-context-invalid',status:403});
 if(!input||typeof input!=='object')throw Object.assign(new Error('Comando mancante'),{code:'onboarding-input-invalid',status:422});
 for(const key of ['progress','accept','percent','acceptedAt','tenantId','actorId','chapterIndex'])if(Object.hasOwn(input,key))throw Object.assign(new Error('Stato di completamento non attribuibile al client'),{code:'onboarding-client-authority',status:422});
 if(input.explicitAcknowledgement!==true||typeof input.chapterId!=='string'||typeof input.contentDigest!=='string')throw Object.assign(new Error('Presa visione esplicita richiesta'),{code:'onboarding-ack-required',status:422});
 const old=saved||{};
 if(old.acceptedAt)return {state:old,recorded:false,kind:'already-accepted'};
 const previous=Array.isArray(old.chapterAcknowledgements)?old.chapterAcknowledgements:[];
 if(old.schemaVersion===ONBOARDING_VERSION&&old.contractDigest!==ONBOARDING_CONTRACT_DIGEST)throw Object.assign(new Error('Contenuto modificato durante il percorso'),{code:'onboarding-version-conflict',status:409});
 const previousAck=previous.at(-1);
 if(previousAck?.chapterId===input.chapterId&&previousAck.contentDigest===input.contentDigest)return {state:old,recorded:false,kind:'replay'};
 const current=ONBOARDING_CHAPTERS[previous.length];
 if(!current||input.chapterId!==current.id)throw Object.assign(new Error('Completa il capitolo corrente'),{code:'onboarding-chapter-order',status:409});
 if(input.contentDigest!==current.contentDigest)throw Object.assign(new Error('La versione del capitolo è cambiata'),{code:'onboarding-chapter-digest',status:409});
 const receipt={chapterId:current.id,contentDigest:current.contentDigest,actorId,tenantId,acknowledgedAt:at,
  meaning:'explicit-self-attestation-not-reading-or-comprehension'};
 const next=[...previous,receipt];
 const elapsed=Number(input.elapsedMs||0);
 const state={schemaVersion:ONBOARDING_VERSION,authority:'user-record',contractDigest:ONBOARDING_CONTRACT_DIGEST,
  startedAt:old.startedAt||at,chapterAcknowledgements:next,progress:next.length*20,
  elapsedMs:Number.isFinite(elapsed)&&elapsed>=0?Math.max(Number(old.elapsedMs||0),Math.min(elapsed,86400000)):Number(old.elapsedMs||0),
  acceptedAt:next.length===5?at:null};
 return {state,receipt,recorded:true,kind:state.acceptedAt?'completed':'advanced'};
}
export function requiresOnboardingForWrite(method,path,user){
 return ['POST','PUT','PATCH','DELETE'].includes(method)&&path!=='/api/profile/onboarding'&&!user?.onboarding?.acceptedAt;
}
