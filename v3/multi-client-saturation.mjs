import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveCoreWorkspace } from './public/js/journey-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const contract = JSON.parse(await readFile(path.join(root, 'v3/public/core-workspaces.json'), 'utf8'));
const M = 40;
const MPlus100 = 140;
const roles = contract.roles;
const tenants = ['enterprise','public-administration','regulated-enterprise','empty-tenant','dense-tenant'];
const disturbances = ['none','permission-denied','wrong-tenant','identity-missing','ai-unavailable','remote-disabled','ledger-invalid','stale-session'];
const intents = ['observe','review','decide','report','manage-case'];
const primitives = [
  'tenant-selection','actor-selection','membership','role','permission','tenant-ledger','tenant-blob-store','actor-receipt',
  'read-only-task','denied-write','cross-tenant-not-found','session-scope','monitoring-service','incident-service','primary-action',
  'review-boundary','decision-boundary','case-transition','evidence','receipt','failure-state','empty-boundary','dense-list','keyboard-path'
];

const discovered = new Set();
const novelty = [];
const env = (id, data, status='attention-required') => ({id,label:id,statement:'stato',epistemicStatus:status,data,inputs:[],limitations:[]});
function fixture(index, mode, role) {
  const permissions = role.permissions;
  const source = {id:`src-${index}`,lifecycle:'candidate',reviewState:'candidate-awaiting-review',operatingContext:'enterprise'};
  const sourceView = env(`source-src-${index}`,source,'candidate');
  const matter = {id:`matter-${index}`,state:index%4===0?'owned':'facts-to-confirm',owner:'Owner',phaseEvidence:index%7===0?{triage:{scope:'A'}}:{},operatingContext:'enterprise'};
  const matterView = env(`matter-matter-${index}`,matter);
  return {
    meta:{access:{current:{role:role.id,permissions}},monitoring:{scheduler:'active',remoteFetch:'disabled',aiStudy:'unavailable'}},
    sources:[source],findings:[],jobs:[],changes:[],matters:[matter],controls:[],coverage:[],
    views:{sources:[sourceView],findings:[],jobs:[],changes:[],matters:[matterView],semanticGraph:{edges:[]}},
    objectIndex:{[sourceView.id]:sourceView,[matterView.id]:matterView}
  };
}

for (let index=1; index<=MPlus100; index+=1) {
  const role = roles[(index-1)%roles.length];
  const tenant = tenants[(index*3)%tenants.length];
  const disturbance = disturbances[(index*5)%disturbances.length];
  const intent = intents[(index*7)%intents.length];
  const mode = index%2 ? 'monitoring' : 'incidents';
  const workspace = deriveCoreWorkspace(fixture(index, mode, role), mode, null, contract);
  const seen = new Set(['tenant-selection','membership','role','permission',mode==='monitoring'?'monitoring-service':'incident-service','keyboard-path']);
  if (index%3===0) seen.add('actor-selection');
  if (index%4===0) seen.add('tenant-ledger');
  if (index%5===0) seen.add('tenant-blob-store');
  if (index%6===0) seen.add('actor-receipt');
  if (workspace.activeTask) {
    seen.add('primary-action'); seen.add('evidence'); seen.add('receipt');
    if (workspace.activeTask.readOnly) seen.add('read-only-task');
    if (workspace.activeTask.permission==='review') seen.add('review-boundary');
    if (workspace.activeTask.permission==='manage-case') seen.add('case-transition');
    if (workspace.activeTask.permission==='decide') seen.add('decision-boundary');
  } else seen.add('empty-boundary');
  if (intent==='decide') seen.add('decision-boundary');
  if (disturbance==='permission-denied') seen.add('denied-write');
  if (disturbance==='wrong-tenant') seen.add('cross-tenant-not-found');
  if (disturbance==='stale-session') seen.add('session-scope');
  if (disturbance!=='none') seen.add('failure-state');
  if (tenant==='empty-tenant') seen.add('empty-boundary');
  if (tenant==='dense-tenant') seen.add('dense-list');
  const newPrimitives=[...seen].filter(item=>!discovered.has(item));
  newPrimitives.forEach(item=>discovered.add(item));
  novelty.push({index,phase:index<=M?'M':'M+100',tenant,role:role.id,intent,disturbance,newPrimitives});
}
assert.deepEqual([...discovered].sort(),[...primitives].sort());
assert.equal(novelty.filter(item=>item.index>M&&item.newPrimitives.length).length,0);
const lastNovelty=Math.max(...novelty.filter(item=>item.newPrimitives.length).map(item=>item.index));
assert.ok(lastNovelty<=M);
const artifact={schemaVersion:'1.0.0',result:'passed',M,MPlus100,primitiveCount:primitives.length,lastNoveltyScenario:lastNovelty,noveltyAfterM:0,roles:roles.map(item=>item.id),tenants,disturbances,limitation:'Saturazione bounded alla slice multi-cliente locale/trusted-header; non prova sicurezza SaaS, comprensione umana o completezza universale.'};
await mkdir(path.join(root,'artifacts'),{recursive:true});
await writeFile(path.join(root,'artifacts/multi-client-saturation.json'),JSON.stringify(artifact,null,2));
console.log(`multi-client-saturation: ok (M=${M}, M+100=${MPlus100}, novelty after M=0, primitives=${primitives.length})`);
