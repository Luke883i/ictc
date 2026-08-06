import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const contract = JSON.parse(await read('./reborn-3-contract.json'));
const app = await read('./public/app.js');
const standardProofModule = await read('./public/ui/standard-proof-1-6.js');
const stableModule = await read('./public/ui/stable-1-4-home.js');
const moduleSource = await read('./public/ui/reborn-3-home.js');
const css = await read('./public/reborn-3.css');
const styles = await read('./public/styles.css');
const browser = await read('./browser-check.py');
const auditor = await read('./browser-auditor-check.py');
const verified = [];

function verify(name, assertion) {
  try {
    assertion();
    verified.push(name);
  } catch (error) {
    const message = String(error.message || error).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    console.error(`::error title=reborn-3:${name}::${message}`);
    throw error;
  }
}

verify('contract-shape', () => {
  assert.equal(contract.schemaVersion, '3.0.0');
  assert.equal(contract.personas.length, 3);
  assert.equal(contract.decisionQuestions.length, 8);
});
verify('declared-metrics', () => {
  assert.equal(contract.metrics.primaryActionsPerHome, 1);
  assert.equal(contract.metrics.topLevelHomeRegions, 3);
  assert.equal(contract.metrics.duplicateOperationalRoutePanels, 0);
  assert.equal(contract.metrics.MPlus100Novelty, 0);
});
verify('runtime-installation-chain', () => {
  assert.match(app, /installStandardProof16Experience/);
  assert.match(standardProofModule, /installStable14Experience\(\)/);
  assert.match(stableModule, /installReborn3Experience\(\)/);
  assert.match(styles, /reborn-3\.css/);
});
verify('decision-answers', () => {
  for (const id of ['homeNextTitle','homeReason','homeWhyMe','homeHow','homeOutcome','homeAiNote','homeHumanGate','homeEvidence','homeJourney','homeMetrics']) {
    assert.match(moduleSource, new RegExp(`id=\\"${id}\\"`), `missing ${id}`);
  }
  for (const phrase of ['Perché ora','Perché tu','Come','Esito','Checkpoint umano','Evidenza']) assert.match(moduleSource, new RegExp(phrase));
});
verify('home-composition', () => {
  assert.equal((moduleSource.match(/<section class=/g) || []).length, 3);
  assert.equal((moduleSource.match(/id=\"homePrimaryAction\"/g) || []).length, 1);
  assert.doesNotMatch(moduleSource, /home-route-list|Due percorsi operativi/);
});
verify('role-and-ontology', () => {
  for (const role of ['admin','user','auditor']) assert.match(moduleSource, new RegExp(`${role}:`));
  for (const stem of [/material/i, /font/i, /evidenz/i]) assert.match(moduleSource, stem);
});
verify('epistemic-boundary', () => {
  assert.doesNotMatch(moduleSource, /l’AI decide|AI decide|certifica automaticamente|garantisce conformità/i);
  assert.match(moduleSource, /Percorsi manuali preservati|restano disponibili|restano governati/);
});
verify('compact-accessible-style', () => {
  assert.match(css, /font-size:clamp\(2rem,4vw,3\.35rem\)/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /grid-template-columns:1fr 1fr/);
  assert.doesNotMatch(css, /reborn-decision[^}]*box-shadow:/s);
});
verify('browser-assurance', () => {
  assert.match(browser, /reborn-decision|homeWhyMe/);
  assert.match(auditor, /homeEvidence|homeHumanGate/);
});

const report = {
  schemaVersion: '3.0.0', model: contract.model, ok: true,
  activeRelease: '1.6.0',
  metrics: contract.metrics, findings: contract.findings, verified,
  limitations: [
    'Static checks verify repository contracts; browser checks verify rendered geometry and actor journeys.',
    'No claim of deployment certification, legal correctness or complete human accessibility audit is made.',
  ],
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/reborn-3-audit.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`reborn-3-check: ok (${verified.length} regression groups, ${contract.decisionQuestions.length} decision answers)`);
