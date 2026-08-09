import { procedureContractProjection } from './procedure-contracts.mjs';
const projection = procedureContractProjection();
function asCanonical(item) {
  return Object.freeze({
    ...structuredClone(item),
    states: [...new Set(Object.values(item.stateModel || {}).flat())],
    transitionIds: (item.transitions || []).map(t => t.id),
    transitionSpecs: structuredClone(item.transitions || []),
    access: structuredClone(item.accessPolicy || {}),
    evidence: structuredClone(item.evidencePolicy || []),
    metricSpecs: structuredClone(item.metrics || []),
    metricIds: (item.metrics || []).map(m => m.id)
  });
}
const procedures = Object.freeze((projection.procedures || []).map(asCanonical));
const byId = new Map(procedures.map(item => [item.id, item]));
export function canonicalProcedureRegistry() {
  return { schemaVersion: projection.schemaVersion, authority: projection.authority, releaseProfile: projection.releaseProfile, commonSubstrate: structuredClone(projection.commonSubstrate), procedures: procedures.map(item => structuredClone(item)) };
}
export function procedureContract(id) {
  const item = byId.get(id);
  if (!item) throw Object.assign(new Error(`Procedura sconosciuta: ${id}`), { code: 'procedure-contract-missing' });
  return structuredClone(item);
}
export function procedureMetricSpecs(id) { return procedureContract(id).metricSpecs.map(item => structuredClone(item)); }
export function procedureIds() { return procedures.map(item => item.id); }
