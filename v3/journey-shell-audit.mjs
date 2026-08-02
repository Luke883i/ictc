import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveCoreWorkspace, validateCoreTask } from './public/js/journey-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = value => readFile(path.join(root, value), 'utf8');
const [html, common, render, actions, bindings, api, store, access, contractText] = await Promise.all([
  read('v3/public/index.html'), read('v3/public/js/journey-shell-common.js'), read('v3/public/js/journey-shell-render.js'),
  read('v3/public/js/journey-shell-actions.js'), read('v3/public/js/journey-shell-bindings.js'), read('v3/lib/api.mjs'), read('v3/lib/store.mjs'),
  read('v3/lib/access-context.mjs'), read('v3/public/core-workspaces.json')
]);
const shell = `${common}\n${render}\n${actions}\n${bindings}`;
const contract = JSON.parse(contractText);
const checks=[]; const mark=(name,detail)=>checks.push({name,status:'passed',detail});

assert.deepEqual(contract.workspaces.map(item=>item.id),['monitoring','incidents']);
assert.equal(contract.visibleObjects.length,9);
assert.ok(contract.visibleObjects.some(item=>item.id==='tenant-context'));
assert.equal(contract.incidentPhases.length,4);
mark('two-services-one-tenant-context','due servizi e un solo confine cliente condiviso');

assert.match(html,/id="actorSelect"/); assert.match(html,/id="tenantSelect"/);
assert.doesNotMatch(html,/name="operatingContext"|id="monitorContext"|id="sourceContext"|id="matterContext"/);
assert.match(common,/x-ictc-actor-id/); assert.match(common,/x-ictc-tenant-id/);
assert.match(actions,/switchAccess/); assert.match(api,/resolveAccessContext/); assert.match(access,/requirePermission/);
mark('identity-membership-boundary','attore, membership, tenant, ruolo e permesso attraversano UI e API');

assert.match(store,/tenants.*tenantId/s); assert.match(store,/tenantId: paths\.tenantId/);
assert.match(store,/actorId: actor\.id/); assert.match(store,/rename\(temporary, paths\.ledger\)/);
assert.match(api,/tenantPaths\(context\)/); assert.match(api,/Sessione assente, scaduta o appartenente a un altro tenant/);
mark('tenant-storage-and-receipt','ledger, blob, sessione e receipt confinati al tenant');

const writes=contract.actions.filter(item=>item.receiptExpected);
assert.equal(writes.length,11); assert.ok(writes.every(item=>item.permission));
for(const token of ['/api/jobs','/schedule','/run','/api/sources','/review','/decide','/map-control','/api/matters','/confirm-owner','/transition']) assert.ok(shell.includes(token),`shell senza ${token}`);
assert.match(actions,/state\.lastReceipt\s*=\s*result\.receipt/); assert.match(actions,/await refresh\(\)/);
mark('write-cycle','11 scritture con permesso, checkpoint, receipt e refresh');

assert.match(render,/Monitora URL/); assert.match(render,/Aggiungi contenuto/); assert.match(render,/>Segnala</);
assert.doesNotMatch(render,/Monitoraggi programmati|Collegamenti tra fonti e decisioni/);
assert.match(render,/id="primaryTaskAction"/); assert.match(render,/task\.readOnly/);
mark('minimal-composition','due ingressi monitoraggio, un ingresso incidenti e una sola azione primaria');

const env=(id,data,status='attention-required')=>({id,label:id,statement:'stato',epistemicStatus:status,data,inputs:[],limitations:[]});
const source={id:'src',lifecycle:'candidate',reviewState:'candidate-awaiting-review'}; const sourceView=env('source-src',source,'candidate');
const matter={id:'matter',state:'facts-to-confirm',owner:'Owner',phaseEvidence:{}}; const matterView=env('matter-matter',matter);
const fixture=permissions=>({meta:{access:{current:{permissions}},monitoring:{}},sources:[source],findings:[],jobs:[],changes:[],matters:[matter],controls:[],coverage:[],views:{sources:[sourceView],findings:[],jobs:[],changes:[],matters:[matterView],semanticGraph:{edges:[]}},objectIndex:{[sourceView.id]:sourceView,[matterView.id]:matterView}});
const readOnly=deriveCoreWorkspace(fixture(['read']),'monitoring',null,contract).activeTask;
const reviewer=deriveCoreWorkspace(fixture(['read','review']),'monitoring',null,contract).activeTask;
assert.ok(validateCoreTask(readOnly)&&validateCoreTask(reviewer)); assert.equal(readOnly.readOnly,true); assert.equal(reviewer.readOnly,false);
mark('permission-aware-projection','la stessa attività è read-only o eseguibile in base al ruolo');

const dialogIds=new Set([...html.matchAll(/<dialog\b[^>]*id="([^"]+)"/g)].map(match=>match[1]));
for(const target of [...`${html}\n${shell}`.matchAll(/data-open-dialog="([^"]+)"/g)].map(match=>match[1])) assert.ok(dialogIds.has(target),`${target}: dialog assente`);
assert.doesNotMatch(actions,/operatingContext\s*|\bby\s*:/);
mark('no-spoofable-or-orphan-controls',`${dialogIds.size} dialog collegati; tenant e attore non provengono dai form`);

for(const pattern of [/compliance score/i,/pienamente conforme/i,/nessun rischio/i,/certificato automaticamente/i]) assert.ok(!pattern.test(`${html}\n${shell}`),`overclaim ${pattern}`);
mark('epistemic-boundary','copy primaria senza verdetti sintetici');

await mkdir(path.join(root,'artifacts'),{recursive:true});
await writeFile(path.join(root,'artifacts/journey-shell-audit.json'),JSON.stringify({schemaVersion:'3.1.0',generatedAt:new Date().toISOString(),result:'passed',profile:'multi-client-two-core-services',checks},null,2));
console.log(`core-ui-audit: ok (${checks.length} checks, 2 services, tenant-aware)`);
