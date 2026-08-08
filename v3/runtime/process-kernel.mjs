import { readFile } from 'node:fs/promises';

const source = JSON.parse(await readFile(new URL('../process-kernel.json', import.meta.url), 'utf8'));
const ROLE_IDS = new Set(['admin', 'user', 'auditor']);
const ARCHETYPES = new Set(['monitor-review', 'case-workflow', 'assurance-view', 'governance']);

function clone(value) { return structuredClone(value); }
function fail(message, code = 'process-kernel-invalid') {
  const error = new Error(message); error.code = code; throw error;
}

export function validateProcessKernel(kernel = source) {
  if (!kernel || typeof kernel !== 'object') fail('Process kernel mancante');
  if (kernel.authority !== 'runtime') fail('Il process kernel deve avere authority runtime');
  const ids = new Set(); const codes = new Set();
  for (const definition of kernel.processes || []) {
    if (!definition?.id || ids.has(definition.id)) fail(`ProcessDefinition id non valido o duplicato: ${definition?.id || '<missing>'}`);
    ids.add(definition.id);
    if (definition.code) {
      if (codes.has(definition.code)) fail(`ProcessDefinition code duplicato: ${definition.code}`);
      codes.add(definition.code);
    }
    if (!ARCHETYPES.has(definition.archetype)) fail(`Archetipo non valido per ${definition.id}: ${definition.archetype}`);
    if (!definition.label || !definition.kind) fail(`ProcessDefinition incompleta: ${definition.id}`);
    if (!definition.authority || definition.authority.ai == null) fail(`Authority topology mancante: ${definition.id}`);
    if (!definition.evidence || typeof definition.evidence.bundle !== 'boolean') fail(`Evidence contract mancante: ${definition.id}`);
    if (!definition.decision || typeof definition.decision.humanRequired !== 'boolean') fail(`Decision contract mancante: ${definition.id}`);
    const roles = Object.keys(definition.roleModes || {});
    if (!roles.length || roles.some(role => !ROLE_IDS.has(role))) fail(`Role mode non valido: ${definition.id}`);
    for (const [role, mode] of Object.entries(definition.roleModes)) {
      if (!mode.actionLabel || !mode.description || !['read-write', 'contribute', 'read-only'].includes(mode.mode)) fail(`Role mode incompleto: ${definition.id}.${role}`);
    }
  }
  for (const definition of kernel.processes || []) if (definition.parent && !ids.has(definition.parent)) fail(`Parent process inesistente: ${definition.id} -> ${definition.parent}`);
  for (const [id, relation] of Object.entries(kernel.relations || {})) {
    if (!id || !Array.isArray(relation.from) || !relation.from.length || !Array.isArray(relation.to) || !relation.to.length || !relation.semantics) fail(`RelationDefinition incompleta: ${id}`);
  }
  return { ok: true, processCount: ids.size, relationCount: Object.keys(kernel.relations || {}).length, archetypeCount: Object.keys(kernel.archetypes || {}).length };
}

validateProcessKernel(source);

export function processDefinitions() { return clone(source.processes); }
export function surfaceProcessDefinitions() { return processDefinitions().filter(item => item.surface); }
export function processDefinition(id) {
  const item = source.processes.find(definition => definition.id === id);
  if (!item) fail(`ProcessDefinition sconosciuta: ${id}`, 'process-definition-not-found');
  return clone(item);
}
export function relationDefinition(id) {
  const item = source.relations[id];
  if (!item) fail(`Relazione fuori grammatica: ${id}`, 'relation-not-in-grammar');
  return { id, ...clone(item) };
}
export function assertRelation(id, fromType = null, toType = null) {
  const relation = relationDefinition(id);
  if (fromType && !relation.from.includes(fromType)) fail(`Relazione ${id} non ammette from=${fromType}`, 'relation-endpoint-invalid');
  if (toType && !relation.to.includes(toType)) fail(`Relazione ${id} non ammette to=${toType}`, 'relation-endpoint-invalid');
  return id;
}
export function processKernelProjection() { return clone(source); }
export function compileProcessRegistry(extraDefinitions = []) {
  const candidate = clone(source);
  candidate.processes.push(...clone(extraDefinitions));
  const validation = validateProcessKernel(candidate);
  return { ...validation, definitions: candidate.processes, expectedCoreEdits: 0 };
}
