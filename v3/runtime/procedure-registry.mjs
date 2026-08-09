import { procedureContractProjection } from './procedure-contracts.mjs';
const projection = procedureContractProjection();
function asCanonical(item) {
  const transitionSpecs = structuredClone(item.transitionSpecs || []);
  const metricSpecs = structuredClone(item.metricSpecs || []);
  return Object.freeze({
    ...structuredClone(item),
    states: [...new Set(Object.values(item.stateModel || {}).flat())],
    transitions: transitionSpecs,
    transitionIds: transitionSpecs.map(t => t.id),
    transitionSpecs,
    access: structuredClone(item.accessPolicy || item.access || {}),
    evidence: structuredClone(item.evidencePolicy || item.evidence || []),
    metrics: metricSpecs,
    metricSpecs,
    metricIds: metricSpecs.map(m => m.id)
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
