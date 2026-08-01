import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fixture } from './journey-fixture.mjs';
import { deriveMonitoringTasks, deriveIncidentTasks } from './public/js/journey-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const html = await readFile(path.join(root, 'v3/public/index.html'), 'utf8');
const shell = (await Promise.all(['journey-shell.js','journey-shell-common.js','journey-shell-render.js','journey-shell-actions.js'].map(name => readFile(path.join(root, 'v3/public/js', name), 'utf8')))).join('\n');
const contract = JSON.parse(await readFile(path.join(root, 'v3/public/core-workspaces.json'), 'utf8'));
const sample = fixture();
const clone = value => structuredClone(value);
const scenarios = [sample];
{
  const value = clone(sample);
  value.jobs[0].enabled = false;
  value.views.jobs[0].data.enabled = false;
  scenarios.push(value);
}
for (const state of ['impact-to-assess', 'controls-to-map']) {
  const value = clone(sample);
  value.changes[0].state = state;
  value.views.changes[0].data.state = state;
  scenarios.push(value);
}
for (const state of ['facts-to-confirm', 'owned', 'assessing', 'responding', 'closure-review']) {
  const value = clone(sample);
  value.matters[0].state = state;
  value.views.matters[0].data.state = state;
  scenarios.push(value);
}
const tasks = scenarios.flatMap(value => [...deriveMonitoringTasks(value), ...deriveIncidentTasks(value, contract)]);
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const htmlWithoutCode = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
const staticText = [...htmlWithoutCode.matchAll(/>([^<>]+)</g)].map(match => clean(match[1])).filter(Boolean);
const accessibleText = [...html.matchAll(/\b(?:aria-label|title|placeholder)="([^"]+)"/g)].map(match => clean(match[1])).filter(Boolean);
const taskText = tasks.flatMap(task => [task.title, task.summary, task.action.label, task.consequence, ...task.doesNotMean, ...task.evidenceAfter]).map(clean);
const contractText = [contract.primaryQuestion,...contract.workspaces.flatMap(item => [item.label,item.shortLabel,item.description,item.boundary,...item.flow]),...contract.operatingScenarios.flatMap(item => [item.label,item.boundary,...item.typicalInputs,...item.roles,...item.highLeverageContext,...(item.requiredSafeguards || [])]),...contract.visibleObjects.map(item => item.purpose),...contract.incidentPhases.flatMap(item => [item.label,item.summary,...item.fields.map(field => field.label)])].map(clean);
const records = [...staticText.map(text => ({ source: 'html', text })),...accessibleText.map(text => ({ source: 'accessible-name', text })),...taskText.map(text => ({ source: 'runtime-task', text })),...contractText.map(text => ({ source: 'contract', text }))];
const inventory = [...new Map(records.filter(item => item.text).map(item => [`${item.source}:${item.text}`, item])).values()].sort((a, b) => a.text.localeCompare(b.text, 'it'));
const primary = inventory.filter(item => ['html', 'accessible-name', 'runtime-task'].includes(item.source));
const forbidden = ['journey', 'SOT', 'lente', 'claim class', 'checkpoint', 'readback', 'proiezione'];
const findings = [];
for (const item of primary) {
  const words = item.text.split(/\s+/).filter(Boolean).length;
  const hits = forbidden.filter(term => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(item.text));
  if (hits.length) findings.push({ severity: 'error', ...item, issue: `gergo interno: ${hits.join(', ')}` });
  if (words > 26) findings.push({ severity: 'warning', ...item, issue: `${words} parole` });
  if (/compliance score|pienamente conforme|nessun rischio|certificato automaticamente/i.test(item.text)) findings.push({ severity: 'error', ...item, issue: 'verdetto sintetico vietato' });
}
const requiredLabels = ['Nuovo monitoraggio','Aggiungi fonte','Esegui ora','Rivedi la fonte','Attiva il monitoraggio','Valuta la differenza','Registra la decisione','Collega il controllo','Segnala un evento','Conferma responsabilità','Azienda','Ente pubblico o istituzione','Impresa regolamentata','Registra il triage','Avvia la risposta','Registra il ripristino','Chiudi e registra le lezioni'];
for (const label of requiredLabels) assert.ok(inventory.some(item => item.text.includes(label)) || shell.includes(label), `azione non inventariata: ${label}`);
assert.equal(findings.filter(item => item.severity === 'error').length, 0, JSON.stringify(findings, null, 2));
assert.ok(inventory.length >= 95, `inventario troppo piccolo: ${inventory.length}`);
const artifact = {schemaVersion:'2.0.0',generatedAt:new Date().toISOString(),result:'passed',strings:inventory.length,sources:Object.fromEntries([...new Set(inventory.map(item => item.source))].map(source => [source, inventory.filter(item => item.source === source).length])),inventory,findings,forbiddenTerms:forbidden,limitation:'L’audit copre HTML, nomi accessibili, testi contrattuali e attività generate dalla fixture. I contenuti inseriti dagli utenti e le risposte di provider esterni restano fuori dal controllo editoriale.'};
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts/core-copy-audit.json'), JSON.stringify(artifact, null, 2));
console.log(`core-copy-audit: ok (${inventory.length} strings, ${findings.length} warnings)`);
