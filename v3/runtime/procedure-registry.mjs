import { businessProcedureContracts, procedureContractProjection } from './procedure-contracts.mjs';
const contract=procedureContractProjection();const procedures=Object.freeze(businessProcedureContracts().map(item=>Object.freeze(structuredClone(item))));const byId=new Map(procedures.map(item=>[item.id,item]));
export function canonicalProcedureRegistry(){return{schemaVersion:contract.schemaVersion,authority:contract.authority,releaseProfile:contract.releaseProfile,commonSubstrate:structuredClone(contract.commonSubstrate),procedures:procedures.map(item=>structuredClone(item))};}
export function procedureContract(id){const item=byId.get(id);if(!item)throw Object.assign(new Error(`Procedura sconosciuta: ${id}`),{code:'procedure-contract-missing'});return structuredClone(item);}
export function procedureMetricSpecs(id){return procedureContract(id).metricSpecs.map(item=>structuredClone(item));}export function procedureIds(){return procedures.map(item=>item.id);}
