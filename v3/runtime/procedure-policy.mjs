import { surfaceProcessDefinitions } from './process-kernel.mjs';
import { procedureAdapterIds, procedureAdapters, procedureIdsForWriteRoute } from './procedure-adapters.mjs';

export const PROCEDURE_IDS=Object.freeze(procedureAdapterIds());
export const PROCEDURE_SCOPE=Object.freeze(Object.fromEntries(procedureAdapters().map(item=>[item.id,item.userScope])));
function definitions(){const byId=new Map(surfaceProcessDefinitions().filter(item=>item.kind==='service'&&item.id!=='evidence').map(item=>[item.id,item]));return PROCEDURE_IDS.map(id=>byId.get(id)).filter(Boolean);}
function defaults(){return Object.fromEntries(PROCEDURE_IDS.map(id=>[id,true]));}
function currentFeatures(state){return{...defaults(),...(state?.settings?.procedures?.features||{})};}
export function normalizeProcedureFeatures(input={},current={}){const source=input.features&&typeof input.features==='object'?input.features:input,next={...defaults(),...(current.features||current||{})};for(const id of PROCEDURE_IDS)if(Object.prototype.hasOwnProperty.call(source,id))next[id]=source[id]!==false;if(!PROCEDURE_IDS.some(id=>next[id]))throw Object.assign(new Error('Almeno una procedura deve restare attiva'),{status:409,code:'procedure-policy-empty'});return next;}
export function procedurePolicy(state){const features=currentFeatures(state);return{schemaVersion:'1.3.0',authority:'runtime-procedure-policy<-procedure-adapter-registry',features,enabled:PROCEDURE_IDS.filter(id=>features[id]),disabled:PROCEDURE_IDS.filter(id=>!features[id]),dataRetention:'disabled-procedures-retain-history-evidence-and-readability'};}
export function procedurePolicyProjection(state,actor){const policy=procedurePolicy(state),entries=definitions().map(def=>({id:def.id,code:def.code,label:def.id==='coverage'?'Standard e Controlli':def.label,enabled:policy.features[def.id]!==false,userScope:PROCEDURE_SCOPE[def.id],scopeAuthority:'procedure-adapter-registry'}));return{...policy,procedures:actor?.role==='admin'?entries:entries.filter(item=>item.enabled)};}
export function procedureEnabled(state,id){return PROCEDURE_IDS.includes(id)&&currentFeatures(state)[id]!==false;}
export function enabledProcedureIds(state){return PROCEDURE_IDS.filter(id=>procedureEnabled(state,id));}
export function assertProcedureEnabled(state,id){if(!PROCEDURE_IDS.includes(id))throw Object.assign(new Error(`Procedura sconosciuta: ${id}`),{status:400,code:'procedure-policy-unknown'});if(!procedureEnabled(state,id))throw Object.assign(new Error(`Procedura disabilitata dall'amministratore: ${id}`),{status:409,code:'procedure-disabled',details:{procedureId:id}});return true;}
export function filterEnabledProcedures(state,items=[]){return items.filter(item=>!item?.id||!PROCEDURE_IDS.includes(item.id)||procedureEnabled(state,item.id));}
export function procedureIdsForWritePath(pathname=''){return procedureIdsForWriteRoute(pathname);}
export function assertWritePathEnabled(state,method,pathname){const verb=String(method||'GET').toUpperCase();if(['GET','HEAD','OPTIONS'].includes(verb))return true;for(const id of procedureIdsForWritePath(pathname))assertProcedureEnabled(state,id);return true;}
