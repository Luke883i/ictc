import { surfaceProcessDefinitions } from './process-kernel.mjs';
import { procedureAdapterIds, procedureAdapters, procedureIdsForWriteRoute } from './procedure-adapters.mjs';

export const PROCEDURE_IDS=Object.freeze(procedureAdapterIds());
export const PROCEDURE_SCOPE=Object.freeze(Object.fromEntries(procedureAdapters().map(item=>[item.id,item.userScope])));

// Presentation-only catalogue metadata; no extra business adapters, writers or routes.
const CATALOGUE_SPEC=Object.freeze([
  Object.freeze({id:"policy-documents",code:"OP-01",label:"Regolamenti, Policy, Procedure, Istruzioni di Lavoro",description:"Consulta, pubblica, gestisci documento.",maturity:"placeholder",kind:"placeholder"}),
  Object.freeze({id:"organization-documents",code:"OG-01",label:"Strutture Organizzative, Deleghe, Poteri di Firma e di Rappresentanza",description:"Consulta, pubblica, gestisci documento.",maturity:"placeholder",kind:"placeholder"}),
  Object.freeze({id:"coverage",code:"MC-01",label:"Standard e Controlli",description:"Registra requisiti, decisioni di perimetro e mapping verso controlli o oggetti senza trasformare la copertura in un giudizio di conformità.",maturity:"ready",kind:"procedure"}),
  Object.freeze({id:"monitoring",code:"RN-01",label:"Monitoraggio normativo e fonti",description:"Raccoglie fonti e cambiamenti, conserva la versione osservata e porta alla verifica umana ciò che può generare nuovo lavoro.",maturity:"scaffold-yellow",kind:"procedure"}),
  Object.freeze({id:"objects",code:"AO-01",label:"Inventario di sistemi e oggetti",description:"Mantiene il registro di sistemi, servizi, dati, fornitori, processi, policy e controlli usati come base del lavoro di compliance.",maturity:"scaffold-yellow",kind:"procedure"}),
  Object.freeze({id:"incidents",code:"EC-01",label:"Incidenti e quasi incidenti",description:"Registra fatti, chiarimenti e versioni di un evento prima delle decisioni di invio o chiusura.",maturity:"ready",kind:"procedure"}),
  Object.freeze({id:"actions",code:"AP-01",label:"Azioni correttive",description:"Trasforma gap, rischi e decisioni in azioni assegnate, con scadenza, evidenze di completamento e verifica distinta di chiusura.",maturity:"scaffold-yellow",kind:"procedure"}),
  Object.freeze({id:"risks",code:"RC-01",label:"Monitoraggio e Gestione dei Rischi",description:"Consulta e registra scenari di rischio di compliance, valutazioni umane, trattamenti e date di riesame.",maturity:"scaffold-yellow",kind:"procedure"}),
  Object.freeze({id:"assurance",code:"AR-01",label:"Questionari e verifiche",description:"Gestisce richieste di verifica e questionari, versiona le risposte e collega le evidenze usate per l’approvazione interna.",maturity:"scaffold-orange",kind:"procedure"})
]);
const CATALOGUE_IDS=Object.freeze(CATALOGUE_SPEC.map(item=>item.id));
function definitions(){const byId=new Map(surfaceProcessDefinitions().filter(item=>item.kind==='service'&&item.id!=='evidence').map(item=>[item.id,item]));return PROCEDURE_IDS.map(id=>byId.get(id)).filter(Boolean);}
function defaults(){return Object.fromEntries(CATALOGUE_IDS.map(id=>[id,true]));}
function currentFeatures(state){return{...defaults(),...(state?.settings?.procedures?.features||{})};}
export function normalizeProcedureFeatures(input={},current={}){const source=input.features&&typeof input.features==='object'?input.features:input,next={...defaults(),...(current.features||current||{})};for(const id of CATALOGUE_IDS)if(Object.prototype.hasOwnProperty.call(source,id))next[id]=source[id]!==false;if(!PROCEDURE_IDS.some(id=>next[id]))throw Object.assign(new Error('Almeno una procedura deve restare attiva'),{status:409,code:'procedure-policy-empty'});return next;}
export function procedurePolicy(state){const features=currentFeatures(state);return{schemaVersion:'1.3.0',authority:'runtime-procedure-policy<-procedure-adapter-registry',features,enabled:PROCEDURE_IDS.filter(id=>features[id]),disabled:PROCEDURE_IDS.filter(id=>!features[id]),dataRetention:'disabled-procedures-retain-history-evidence-and-readability'};}
export function procedurePolicyProjection(state,actor){
  const policy=procedurePolicy(state),defs=new Map(definitions().map(def=>[def.id,def]));
  const entries=definitions().map(def=>({id:def.id,code:def.code,label:def.id==='coverage'?'Standard e Controlli':def.label,enabled:policy.features[def.id]!==false,userScope:PROCEDURE_SCOPE[def.id],scopeAuthority:'procedure-adapter-registry'}));
  const catalogue=CATALOGUE_SPEC.map(item=>{
    const def=defs.get(item.id);
    if(item.kind==='procedure'&&(!def||def.code!==item.code))throw new Error('Catalogue drift: '+item.id);
    return {...item,enabled:policy.features[item.id]!==false,operational:item.kind==='procedure',maturityBasis:'product-declared-not-runtime-certification'};
  });
  const isAdmin=actor?.role==='admin';
  return {...policy,procedures:isAdmin?entries:entries.filter(item=>item.enabled),catalogue:isAdmin?catalogue:catalogue.filter(item=>item.enabled)};
}
export function procedureEnabled(state,id){return PROCEDURE_IDS.includes(id)&&currentFeatures(state)[id]!==false;}
export function enabledProcedureIds(state){return PROCEDURE_IDS.filter(id=>procedureEnabled(state,id));}
export function assertProcedureEnabled(state,id){if(!PROCEDURE_IDS.includes(id))throw Object.assign(new Error(`Procedura sconosciuta: ${id}`),{status:400,code:'procedure-policy-unknown'});if(!procedureEnabled(state,id))throw Object.assign(new Error(`Procedura disabilitata dall'amministratore: ${id}`),{status:409,code:'procedure-disabled',details:{procedureId:id}});return true;}
export function filterEnabledProcedures(state,items=[]){return items.filter(item=>!item?.id||!PROCEDURE_IDS.includes(item.id)||procedureEnabled(state,item.id));}
export function procedureIdsForWritePath(pathname=''){return procedureIdsForWriteRoute(pathname);}
export function assertWritePathEnabled(state,method,pathname){const verb=String(method||'GET').toUpperCase();if(['GET','HEAD','OPTIONS'].includes(verb))return true;for(const id of procedureIdsForWritePath(pathname))assertProcedureEnabled(state,id);return true;}
