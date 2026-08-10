import { procedureIdForSubject } from './procedure-adapters.mjs';

const clean=value=>value==null?null:structuredClone(value);
const byId=(collection,id)=>Array.isArray(collection)?collection.find(item=>item?.id===id)||null:null;
const latest=(collection,predicate)=>{const rows=(collection||[]).filter(predicate);return rows.at(-1)||null;};
function generic(type,collection){return{type,procedureId:procedureIdForSubject(type),canonicalizationVersion:'subject-record-v1',resolve(state,subject){return byId(state?.[collection],subject?.id);},canonicalize:clean};}
const ADAPTERS=[
  generic('mission','missions'),generic('catalog','catalog'),generic('contribution','contributions'),generic('incident','incidents'),
  generic('grc-object','grcObjects'),generic('mapping','grcMappings'),generic('action','grcActions'),generic('risk','grcRisks'),generic('assurance-case','grcAssurance'),generic('control-test','controlTests'),
  {type:'requirement-scope',procedureId:'coverage',canonicalizationVersion:'requirement-scope-v1',resolve(state,subject,result){return byId(state?.requirementScopes,result?.id)||latest(state?.requirementScopes,item=>item.requirementRef===subject?.id||item.requirementKey===subject?.id);},canonicalize:clean},
  {type:'standard',procedureId:'coverage',canonicalizationVersion:'standard-record-v1',resolve(state,subject,result){return byId(state?.standardPacks,subject?.id)||latest(state?.standardScopes,item=>item.frameworkId===subject?.id)||byId(state?.standardPackHistory,result?.id);},canonicalize:clean},
  {type:'crosswalk',procedureId:'coverage',canonicalizationVersion:'crosswalk-v1',resolve(state,subject,result){return byId(state?.standardCrosswalks,result?.id)||byId(state?.standardCrosswalks,subject?.id);},canonicalize:clean}
].map(item=>Object.freeze(item));
const BY_TYPE=new Map(ADAPTERS.map(item=>[item.type,item]));
export function subjectAdapters(){return ADAPTERS.map(item=>({type:item.type,procedureId:item.procedureId,canonicalizationVersion:item.canonicalizationVersion}));}
export function subjectAdapter(type){return BY_TYPE.get(String(type||''))||null;}
export function resolveCanonicalSubjectAfter(state,subject,result=null){if(!subject?.type||!subject?.id)return null;const adapter=subjectAdapter(subject.type);if(!adapter)return null;const record=adapter.resolve(state,subject,result);if(!record)return null;const payload=adapter.canonicalize(record,{state,subject,result});if(!payload||typeof payload!=='object'||Array.isArray(payload))return null;return{procedureId:adapter.procedureId||procedureIdForSubject(subject.type),subject:{type:String(subject.type),id:String(record.id||subject.id)},payload,semanticSchemaVersion:'1.0.0',canonicalizationVersion:adapter.canonicalizationVersion};}
