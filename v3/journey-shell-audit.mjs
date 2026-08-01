import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fixture } from './journey-fixture.mjs';
import { deriveCoreWorkspace, deriveMonitoringTasks, deriveIncidentTasks, deriveSemanticRows, validateCoreTask } from './public/js/journey-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const contract = JSON.parse(await readFile(path.join(root, 'v3/public/core-workspaces.json'), 'utf8'));
const html = await readFile(path.join(root, 'v3/public/index.html'), 'utf8');
const shell = (await Promise.all(['journey-shell.js','journey-shell-common.js','journey-shell-render.js','journey-shell-actions.js'].map(name => readFile(path.join(root, 'v3/public/js', name), 'utf8')))).join('\n');
const model = await readFile(path.join(root, 'v3/public/js/journey-model.js'), 'utf8');
const common = await readFile(path.join(root, 'v3/public/js/journey-shell-common.js'), 'utf8');
const renderModule = await readFile(path.join(root, 'v3/public/js/journey-shell-render.js'), 'utf8');
const actionsModule = await readFile(path.join(root, 'v3/public/js/journey-shell-actions.js'), 'utf8');
const api = await readFile(path.join(root, 'v3/lib/api.mjs'), 'utf8');
const monitoring = await readFile(path.join(root, 'v3/lib/monitoring-runtime.mjs'), 'utf8');
const checks = [];
const mark = (name, detail) => checks.push({ name, status: 'passed', detail });

for (const name of ['$', '$$', 'statusLabels', 'schedulerLabels']) assert.ok(common.includes(`export const ${name}`), `${name}: export ES module assente`);
for (const name of ['statusLabels', 'schedulerLabels']) assert.ok(renderModule.includes(name), `${name}: import render assente`);
for (const name of ['$', '$$']) assert.ok(actionsModule.includes(name), `${name}: import actions assente`);
mark('es-module-linkage', 'import/export reali della shell verificati');
assert.equal(contract.claimClass, 'core-workspace-contract');
assert.deepEqual(contract.workspaces.map(item => item.id), ['monitoring', 'incidents']);
assert.equal(contract.visibleObjects.length, 9);
assert.equal(contract.incidentPhases.length, 4);
for (const item of contract.visibleObjects) assert.ok(item.id && item.purpose && Array.isArray(item.usedBy) && item.userAction);
const operatingContext = contract.visibleObjects.find(item => item.id === 'operating-context');
assert.deepEqual(operatingContext.usedBy.sort(), ['matter', 'monitoring-job'].sort());
assert.match(api, /normalizeOperatingContext/);
assert.match(shell, /operatingContext: form\.get\('operatingContext'\)/);
for (const phase of contract.incidentPhases) assert.ok(phase.from && phase.to && phase.phase && phase.label && phase.fields.every(field => field.id && field.label && field.required));
mark('two-products-and-incident-process', 'due servizi primari e quattro transizioni documentate');

const sample = fixture();
const monitoringWorkspace = deriveCoreWorkspace(sample, 'monitoring', null, contract);
const incidentWorkspace = deriveCoreWorkspace(sample, 'incidents', null, contract);
assert.equal(monitoringWorkspace.mode, 'monitoring');
assert.equal(incidentWorkspace.mode, 'incidents');
assert.ok(monitoringWorkspace.tasks.length >= 2);
assert.ok(incidentWorkspace.tasks.length >= 1);
for (const value of [...deriveMonitoringTasks(sample), ...deriveIncidentTasks(sample, contract)]) assert.ok(validateCoreTask(value), `${value.id}: attività incompleta`);
mark('runtime-task-projection', `${monitoringWorkspace.tasks.length + incidentWorkspace.tasks.length} attività derivate dal bootstrap`);

const rows = deriveSemanticRows(sample);
assert.ok(rows.some(row => row.origin === 'scheduled' && row.jobs.length && row.findings.length && row.changes.length));
assert.ok(rows.some(row => row.origin === 'manual'));
mark('semantic-chain', 'origine programmata o manuale → fonte → differenza → decisione → controllo');

const expectedWrites = ['job-create','job-schedule','job-run','source-propose','source-review','finding-review','change-decision','control-map','matter-create','matter-owner','matter-transition'];
const actualWrites = contract.actions.filter(item => item.receiptExpected).map(item => item.id);
assert.deepEqual(actualWrites.sort(), expectedWrites.sort());
for (const action of contract.actions.filter(item => item.receiptExpected)) {
  const routeToken = action.route.split('/').filter(part => part && !part.startsWith(':')).at(-1);
  assert.ok(api.includes(routeToken) || monitoring.includes(routeToken), `${action.id}: route assente`);
}
for (const token of ['/api/jobs', '/schedule', '/run', '/api/sources', '/review', '/decide', '/map-control', '/api/matters', '/confirm-owner', '/transition']) assert.ok(shell.includes(token), `shell senza ${token}`);
assert.match(shell, /state\.lastReceipt\s*=\s*result\.receipt/);
assert.match(shell, /await refresh\(\)/);
mark('runtime-write-wiring', '11 scritture con checkpoint, receipt e refresh');

const dialogIds = new Set([...html.matchAll(/<dialog\b[^>]*id="([^"]+)"/g)].map(match => match[1]));
const staticForms = [...html.matchAll(/<form\b[^>]*id="([^"]+)"/g)].map(match => match[1]);
for (const formId of staticForms) assert.ok(shell.includes(`$('#${formId}').addEventListener`) || formId === 'checkpointForm', `${formId}: form senza handler`);
for (const target of [...`${html}\n${shell}`.matchAll(/data-open-dialog="([^"]+)"/g)].map(match => match[1])) assert.ok(dialogIds.has(target), `${target}: dialog target assente`);
for (const id of ['searchOpen','comfortOpen','assistantOpen']) assert.ok(shell.includes(`$('#${id}').addEventListener`), `${id}: controllo statico senza handler`);
for (const kind of ['source-review','finding-review','job-schedule','change-decision','control-map','matter-owner','matter-transition']) assert.ok(shell.includes(`kind === '${kind}'`) || shell.includes(`kind === 'source-review' || kind === 'finding-review'`), `${kind}: attività senza handler`);
assert.doesNotMatch(html, /sourceNotes|name="notes"/);
mark('no-orphan-controls', `${staticForms.length} form, ${dialogIds.size} dialog e attività runtime senza controlli orfani`);

for (const token of ['ICTC_AI_ENDPOINT', 'ICTC_MONITORING_REMOTE', 'writeFile', 'blobRef', 'inputDigest', 'schedulerTick']) assert.ok(monitoring.includes(token), `monitoring runtime senza ${token}`);
assert.match(api, /contentText/);
assert.match(api, /phaseEvidence|validateIncidentEvidence/);
mark('backend-services', 'scheduler, provider AI configurabile, storage blob e prove di fase');
assert.match(html, /data-mode="monitoring"/);
assert.match(html, /data-mode="incidents"/);
assert.doesNotMatch(html, /personaDialog|Lente di lavoro|Qual è il tuo incarico/);
assert.match(shell, /Nuovo monitoraggio/);
assert.match(shell, /Aggiungi fonte/);
assert.match(shell, /Segnala evento/);
assert.match(shell, /Collegamenti tra fonti e decisioni/);
assert.match(shell, /Fasi del processo|phase-path/);
mark('compact-composition', 'due ingressi, focus compatto e tabelle runtime');

const visibleText = `${html.replace(/<[^>]+>/g, ' ')} ${shell} ${model}`;
for (const pattern of [/compliance score/i, /pienamente conforme/i, /nessun rischio/i, /certificato automaticamente/i]) assert.ok(!pattern.test(visibleText), `overclaim: ${pattern}`);
assert.doesNotMatch(html, />[^<]*\bjourney\b[^<]*</i);
assert.doesNotMatch(html, />[^<]*\bSOT\b[^<]*</i);
mark('copy-boundary', 'nessun gergo interno o verdetto sintetico nella superficie primaria');
assert.match(shell, /class="primary" data-task-action/);
assert.match(shell, /compact-table/);
assert.match(shell, /monitor-table/);
assert.match(shell, /case-table/);
mark('single-focus', 'una prossima azione e viste sintetiche per servizio');

const artifactDir = path.join(root, 'artifacts');
await mkdir(artifactDir, { recursive: true });
await writeFile(path.join(artifactDir, 'journey-shell-audit.json'), JSON.stringify({ schemaVersion: '3.0.0', generatedAt: new Date().toISOString(), result: 'passed', profile: 'two-core-runtime-services', checks }, null, 2));
console.log(`core-ui-audit: ok (${checks.length} checks, 2 services)`);
