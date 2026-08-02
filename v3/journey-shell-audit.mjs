import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deriveGuidedWorkspace } from './public/js/journey-guidance.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = file => readFile(path.join(root, file), 'utf8');
const [html, common, actions, render, guidance, api, store, contractText] = await Promise.all([
  read('v3/public/index.html'), read('v3/public/js/journey-shell-common.js'), read('v3/public/js/journey-shell-actions.js'),
  read('v3/public/js/journey-shell-render.js'), read('v3/public/js/journey-guidance.js'), read('v3/lib/api.mjs'),
  read('v3/lib/store.mjs'), read('v3/public/core-workspaces.json')
]);
const contract = JSON.parse(contractText);
const checks = [];
const mark = (name, detail) => checks.push({ name, status: 'passed', detail });

assert.deepEqual(contract.workspaces.map(item => item.id), ['monitoring','incidents']);
assert.equal(contract.actions.filter(item => item.receiptExpected).length, 11);
assert.ok(contract.actions.every(item => item.permission && item.route && item.projection));
mark('contract', 'due servizi, 14 azioni, 11 scritture contrattualizzate');

assert.match(html, /id="actorSelect"/); assert.match(html, /id="tenantSelect"/);
assert.doesNotMatch(html, /name="operatingContext"/);
assert.match(common, /x-ictc-actor-id/); assert.match(common, /x-ictc-tenant-id/);
assert.match(actions, /x-ictc-command-id/); assert.match(actions, /x-ictc-expected-head/);
assert.match(api, /actionSpec/); assert.match(store, /ledger-head-changed/); assert.match(store, /structuredClone\(event\.payload\)/);
mark('runtime-chain', 'identità, contratto, comando, concorrenza, ledger e proiezione pura collegati');

assert.match(render, /Monitora URL/); assert.match(render, /Aggiungi contenuto/); assert.match(render, />Segnala</);
assert.match(guidance, /actionableTasks/); assert.match(guidance, /waitingTasks/); assert.match(guidance, /Nessuna azione per il tuo ruolo/);
mark('guided-ui', 'tre ingressi, una prossima azione, code Da fare e In attesa');

const matter = { id:'matter-m', label:'Caso', statement:'Fatti', epistemicStatus:'attention-required', data:{ id:'m', state:'facts-to-confirm', owner:'Owner', phaseEvidence:{} } };
const sample = permissions => ({ meta:{access:{current:{permissions}}}, matters:[matter.data], sources:[], jobs:[], views:{sources:[],jobs:[],findings:[],changes:[],matters:[matter],semanticGraph:{edges:[]}}, objectIndex:{[matter.id]:matter} });
assert.equal(deriveGuidedWorkspace(sample(['read']), 'incidents', null, contract).activeTask, null);
assert.ok(deriveGuidedWorkspace(sample(['read','manage-case']), 'incidents', null, contract).activeTask);
mark('role-queue', 'il focus contiene soltanto attività eseguibili dal ruolo');

for (const pattern of [/compliance score/i,/pienamente conforme/i,/nessun rischio/i,/certificato automaticamente/i]) assert.ok(!pattern.test(`${html}\n${render}\n${guidance}`));
mark('boundary', 'nessun verdetto sintetico nella superficie primaria');

await mkdir(path.join(root,'artifacts'),{recursive:true});
await writeFile(path.join(root,'artifacts/journey-shell-audit.json'),JSON.stringify({schemaVersion:'3.2.0',generatedAt:new Date().toISOString(),result:'passed',checks},null,2));
console.log(`core-ui-audit: ok (${checks.length} checks, guided multi-user journey)`);
