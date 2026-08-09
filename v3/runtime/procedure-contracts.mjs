import { readFile } from 'node:fs/promises';
const raw=JSON.parse(await readFile(new URL('../procedure-contracts-1-2.json',import.meta.url),'utf8'));
const required=['id','code','label','job','entryPoints','states','transitions','humanCheckpoints','access','evidence','exit','metrics','ux','claimBoundary'];
const ids=new Set(),codes=new Set();for(const item of raw.procedures||[]){for(const field of required)if(item[field]==null)throw new Error(`Procedure contract ${item.id||'<unknown>'} missing ${field}`);if(ids.has(item.id)||codes.has(item.code))throw new Error(`Duplicate procedure contract ${item.id}/${item.code}`);ids.add(item.id);codes.add(item.code);}if(ids.size!==7)throw new Error(`Expected seven business procedure contracts, got ${ids.size}`);
const byId=new Map(raw.procedures.map(item=>[item.id,Object.freeze(structuredClone(item))]));
export function procedureContract(id){const item=byId.get(id);if(!item)throw Object.assign(new Error(`Contratto procedura non trovato: ${id}`),{status:404,code:'procedure-contract-not-found'});return structuredClone(item);}
export function businessProcedureContracts(){return raw.procedures.map(item=>structuredClone(item));}
export function procedureContractProjection(){return{schemaVersion:raw.schemaVersion,releaseProfile:raw.releaseProfile,authority:raw.authority,procedures:businessProcedureContracts(),principles:structuredClone(raw.principles||[])};}
