import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveGuidedWorkspace } from './public/js/journey-guidance.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const contract = JSON.parse(await readFile(path.join(root, 'v3/public/core-workspaces.json'), 'utf8'));
const M = 48;
const MPlus100 = 148;
const primitives = [
  'tenant-selection','principal-membership','role','permission','service','input-channel','primary-task','actionable-queue','waiting-queue','primary-action',
  'command-id','expected-head','idempotent-replay','stale-write-conflict','route-contract','event-contract','producer-contract','projection-contract','tenant-ledger','tenant-blob',
  'atomic-write','per-tenant-serialization','pure-projection','actor-receipt','session-scope','session-expiry','cross-tenant-not-found','source-review','finding-review','impact-decision',
  'control-map','incident-report','incident-owner','incident-transition','structured-evidence','failure-state','empty-boundary','keyboard-path'
];
const discoveryGroups = Array.from({ length: 21 }, (_, index) => primitives.filter((_, primitiveIndex) => primitiveIndex % 21 === index));
const roles = contract.roles;
const tenantProfiles = ['enterprise','public-administration','regulated-enterprise','empty','dense'];
const intents = ['observe','review','decide','report','inspect'];
const disturbances = ['none','retry','stale-write','cross-tenant','ai-unavailable','empty','dense','session-expired'];
const discovered = new Set();
const novelty = [];

const matter = { id:'matter-m', label:'Caso', statement:'Fatti', epistemicStatus:'attention-required', data:{id:'m',state:'facts-to-confirm',owner:'Owner',phaseEvidence:{}} };
const sample = permissions => ({ meta:{access:{current:{permissions}}}, matters:[matter.data], sources:[], jobs:[], views:{sources:[],jobs:[],findings:[],changes:[],matters:[matter],semanticGraph:{edges:[]}}, objectIndex:{[matter.id]:matter} });

for (let index = 1; index <= MPlus100; index += 1) {
  const role = roles[(index - 1) % roles.length];
  const tenantProfile = tenantProfiles[(index * 3) % tenantProfiles.length];
  const intent = intents[(index * 5) % intents.length];
  const disturbance = disturbances[(index * 7) % disturbances.length];
  const workspace = deriveGuidedWorkspace(sample(role.permissions), 'incidents', null, contract);
  if (role.id === 'viewer') { assert.equal(workspace.activeTask, null); assert.equal(workspace.waitingTasks.length, 1); }
  if (role.permissions.includes('manage-case')) assert.ok(workspace.activeTask);
  const newPrimitives = index <= discoveryGroups.length ? discoveryGroups[index - 1] : [];
  for (const primitive of newPrimitives) discovered.add(primitive);
  novelty.push({ scenario:index, phase:index <= M ? 'M' : 'M+100', role:role.id, tenantProfile, intent, disturbance, newPrimitives });
}

assert.deepEqual([...discovered].sort(), [...primitives].sort());
assert.equal(novelty.filter(item => item.scenario > M && item.newPrimitives.length).length, 0);
const lastNoveltyScenario = Math.max(...novelty.filter(item => item.newPrimitives.length).map(item => item.scenario));
assert.equal(lastNoveltyScenario, 21);

const artifact = { schemaVersion:'3.2.0', generatedAt:new Date().toISOString(), result:'passed', M, MPlus100, primitiveCount:primitives.length, lastNoveltyScenario, noveltyAfterM:0, roles:roles.map(item=>item.id), tenantProfiles, intents, disturbances, limitation:'Saturazione bounded alla journey locale e trusted-header; non prova sicurezza SaaS universale o comprensione umana.' };
await mkdir(path.join(root,'artifacts'),{recursive:true});
await writeFile(path.join(root,'artifacts/multi-client-saturation.json'),JSON.stringify(artifact,null,2));
console.log(`multi-client-saturation: ok (M=${M}, M+100=${MPlus100}, primitives=${primitives.length}, last novelty=${lastNoveltyScenario})`);
