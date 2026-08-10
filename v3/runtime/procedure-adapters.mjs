import { canonicalProcedureContracts } from './procedure-contracts.mjs';

const ADAPTERS=Object.freeze([
  Object.freeze({id:'monitoring',surface:'monitoring',userScope:'own-monitors-plus-organization-sources',subjectTypes:Object.freeze(['mission','catalog','contribution']),stateCollections:Object.freeze({mission:'missions',catalog:'catalog',contribution:'contributions'}),writeRoutes:Object.freeze(['/api/catalog','/api/user/monitors','/api/missions','/api/contributions','/api/manual/monitoring']),handoffRoutes:Object.freeze(['/api/catalog/:id/actions'])}),
  Object.freeze({id:'incidents',surface:'incidents',userScope:'created-by',subjectTypes:Object.freeze(['incident']),stateCollections:Object.freeze({incident:'incidents'}),writeRoutes:Object.freeze(['/api/incidents','/api/manual/incidents']),handoffRoutes:Object.freeze(['/api/incidents/:id/actions'])}),
  Object.freeze({id:'objects',surface:'grc',userScope:'organization',subjectTypes:Object.freeze(['grc-object']),stateCollections:Object.freeze({'grc-object':'grcObjects'}),writeRoutes:Object.freeze(['/api/grc/objects']),handoffRoutes:Object.freeze([])}),
  Object.freeze({id:'coverage',surface:'grc',userScope:'organization',subjectTypes:Object.freeze(['mapping','control-test']),stateCollections:Object.freeze({mapping:'grcMappings','control-test':'controlTests'}),writeRoutes:Object.freeze(['/api/standards','/api/grc/mappings','/api/control-tests']),handoffRoutes:Object.freeze(['/api/grc/mappings/:id/actions'])}),
  Object.freeze({id:'actions',surface:'grc',userScope:'assigned-or-created',subjectTypes:Object.freeze(['action']),stateCollections:Object.freeze({action:'grcActions'}),writeRoutes:Object.freeze(['/api/grc/actions']),handoffRoutes:Object.freeze([])}),
  Object.freeze({id:'risks',surface:'grc',userScope:'organization',subjectTypes:Object.freeze(['risk']),stateCollections:Object.freeze({risk:'grcRisks'}),writeRoutes:Object.freeze(['/api/grc/risks']),handoffRoutes:Object.freeze(['/api/grc/risks/:id/actions'])}),
  Object.freeze({id:'assurance',surface:'grc',userScope:'created-by',subjectTypes:Object.freeze(['assurance-case']),stateCollections:Object.freeze({'assurance-case':'grcAssurance'}),writeRoutes:Object.freeze(['/api/grc/assurance','/api/manual/assurance']),handoffRoutes:Object.freeze([])})
]);
const canonicalIds=canonicalProcedureContracts().map(item=>item.id);const adapterIds=ADAPTERS.map(item=>item.id);if(JSON.stringify(canonicalIds)!==JSON.stringify(adapterIds))throw new Error(`Procedure adapter registry drift: ${adapterIds.join(',')}`);
const byId=new Map(ADAPTERS.map(item=>[item.id,item]));const bySubject=new Map();for(const adapter of ADAPTERS)for(const type of adapter.subjectTypes){if(bySubject.has(type))throw new Error(`Duplicate subject adapter: ${type}`);bySubject.set(type,adapter);}
export function procedureAdapters(){return ADAPTERS.map(item=>structuredClone(item));}
export function procedureAdapter(id){const item=byId.get(id);if(!item)throw Object.assign(new Error(`Procedure adapter sconosciuto: ${id}`),{code:'procedure-adapter-missing'});return structuredClone(item);}
export function procedureAdapterIds(){return ADAPTERS.map(item=>item.id);}
export function procedureAdapterForSubject(type){const item=bySubject.get(type);return item?structuredClone(item):null;}
export function procedureIdForSubject(type){return bySubject.get(type)?.id||null;}
export function stateCollectionForSubject(type){return bySubject.get(type)?.stateCollections?.[type]||null;}
function routePrefix(route){return route.replace(/\/:.*$/,'');}
export function procedureIdsForWriteRoute(pathname=''){const p=String(pathname||''),ids=[];for(const adapter of ADAPTERS){if(adapter.writeRoutes.some(route=>p.startsWith(routePrefix(route))))ids.push(adapter.id);if(adapter.handoffRoutes.some(route=>{const prefix=routePrefix(route);return p.startsWith(prefix)&&p.includes('/actions');}))ids.push(adapter.id);}
if(p.includes('/actions')){if(p.startsWith('/api/catalog/')||p.startsWith('/api/incidents/')||p.startsWith('/api/grc/mappings/')||p.startsWith('/api/grc/risks/'))ids.push('actions');}
return[...new Set(ids)];}
export function adapterPublicMetadata(id){const a=procedureAdapter(id);return{id:a.id,surface:a.surface,userScope:a.userScope,subjectTypes:a.subjectTypes};}
