import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const contract = JSON.parse(await read('./reborn-3-contract.json'));
const app = await read('./public/app.js');
const moduleSource = await read('./public/ui/reborn-3-home.js');
const css = await read('./public/reborn-3.css');
const styles = await read('./public/styles.css');
const browser = await read('./browser-check.py');
const auditor = await read('./browser-auditor-check.py');

assert.equal(contract.schemaVersion, '3.0.0');
assert.equal(contract.personas.length, 3);
assert.equal(contract.decisionQuestions.length, 8);
assert.equal(contract.metrics.primaryActionsPerHome, 1);
assert.equal(contract.metrics.topLevelHomeRegions, 3);
assert.equal(contract.metrics.duplicateOperationalRoutePanels, 0);
assert.equal(contract.metrics.MPlus100Novelty, 0);

assert.match(app, /installReborn3Experience/);
assert.match(styles, /reborn-3\.css/);
for (const id of ['homeNextTitle','homeReason','homeWhyMe','homeHow','homeOutcome','homeAiNote','homeHumanGate','homeEvidence','homeJourney','homeMetrics']) {
  assert.match(moduleSource, new RegExp(`id=\\"${id}\\"`), `missing ${id}`);
}
assert.equal((moduleSource.match(/<section class=/g) || []).length, 3);
assert.equal((moduleSource.match(/id=\"homePrimaryAction\"/g) || []).length, 1);
assert.doesNotMatch(moduleSource, /home-route-list|Due percorsi operativi/);
for (const phrase of ['Perché ora','Perché tu','Come','Esito','Checkpoint umano','Evidenza']) assert.match(moduleSource, new RegExp(phrase));
for (const role of ['admin','user','auditor']) assert.match(moduleSource, new RegExp(`${role}:`));
for (const term of ['Materiale','Fonte','Evidenza']) assert.match(moduleSource, new RegExp(term));
assert.doesNotMatch(moduleSource, /l’AI decide|AI decide|certifica automaticamente|garantisce conformità/i);
assert.match(moduleSource, /manual-path|Percorsi manuali preservati|restano disponibili/);
assert.match(css, /font-size:clamp\(2rem,4vw,3\.35rem\)/);
assert.match(css, /min-height:44px/);
assert.match(css, /grid-template-columns:1fr 1fr/);
assert.doesNotMatch(css, /reborn-decision[^}]*box-shadow:/s);
assert.match(browser, /reborn-decision|homeWhyMe/);
assert.match(auditor, /homeEvidence|homeHumanGate/);

const report = {
  schemaVersion: '3.0.0',
  model: contract.model,
  ok: true,
  metrics: contract.metrics,
  findings: contract.findings,
  verified: [
    'single-decision-capsule', 'one-primary-action', 'eight-decision-answers',
    'three-top-level-home-regions', 'no-duplicate-route-panel', 'role-specific-guidance',
    'ai-human-evidence-boundary', 'compact-editorial-layout', 'mobile-and-keyboard-contract',
  ],
  limitations: [
    'Static checks verify repository contracts; browser checks verify rendered geometry and actor journeys.',
    'No claim of deployment certification, legal correctness or complete human accessibility audit is made.',
  ],
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/reborn-3-audit.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`reborn-3-check: ok (${report.verified.length} contracts, ${contract.decisionQuestions.length} decision answers)`);
