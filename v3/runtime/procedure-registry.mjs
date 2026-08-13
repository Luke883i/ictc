import { procedureContractProjection } from './procedure-contracts.mjs';
import { adapterPublicMetadata } from './procedure-adapters.mjs';
import { procedureGuidanceProjection } from './procedure-guidance.mjs';
const projection=procedureContractProjection();
function decorateCanonical(item){const canonical=structuredClone(item),transitionSpecs=structuredClone(canonical.transitions||[]),metricSpecs=structuredClone(canonical.metrics||[]);return Object.freeze({...canonical,states:[...new Set(Object.values(canonical.stateModel||{}).flat())],transitions:transitionSpecs,transitionIds:transitionSpecs.map(t=>t.id),transitionSpecs,access:structuredClone(canonical.accessPolicy||{}),evidence:structuredClone(canonical.evidencePolicy||[]),metrics:metricSpecs,metricSpecs,metricIds:metricSpecs.map(m=>m.id),adapter:adapterPublicMetadata(canonical.id)});}
const procedures=Object.freeze((projection.procedures||[]).map(decorateCanonical));const byId=new Map(procedures.map(item=>[item.id,item]));
export function canonicalProcedureRegistry(){return{schemaVersion:projection.schemaVersion,authority:projection.authority,releaseProfile:projection.releaseProfile,commonSubstrate:structuredClone(projection.commonSubstrate),guidance:procedureGuidanceProjection(),procedures:procedures.map(item=>structuredClone(item))};}
export function procedureContract(id){const item=byId.get(id);if(!item)throw Object.assign(new Error(`Procedura sconosciuta: ${id}`),{code:'procedure-contract-missing'});return structuredClone(item);}
export function procedureMetricSpecs(id){return procedureContract(id).metricSpecs.map(item=>structuredClone(item));}
export function procedureIds(){return procedures.map(item=>item.id);}
