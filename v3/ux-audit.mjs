import { strict as assert } from 'node:assert';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const contract = JSON.parse(await readFile(path.join(root, 'v3/public/epistemic-contract.json'), 'utf8'));
const guide = await readFile(path.join(root, 'v3/public/js/epistemic-guide.js'), 'utf8');
const app = await readFile(path.join(root, 'v3/public/app.js'), 'utf8');
const guideCss = await readFile(path.join(root, 'v3/public/epistemic-guide.css'), 'utf8');
const frameModel = await readFile(path.join(root, 'v3/public/js/action-frame-model.js'), 'utf8');
const frameUi = await readFile(path.join(root, 'v3/public/js/action-frame-ui.js'), 'utf8');
const frameCss = await readFile(path.join(root, 'v3/public/action-frame.css'), 'utf8');
const interactions = await readFile(path.join(root, 'v3/public/js/interactions.js'), 'utf8');
const support = await readFile(path.join(root, 'v3/public/js/support-bundle-model.js'), 'utf8');
const checks = [];
const mark = (name, detail) => checks.push({ name, status: 'passed', detail });

assert.deepEqual(contract.lenses.map(item => item.id), ['orient', 'decide', 'verify']);
for (const lens of contract.lenses) {
  assert.ok(lens.question && lens.requiredFields.length >= 4);
  assert.ok(lens.maxPrimaryFacts <= 8, `${lens.id}: densità primaria eccessiva`);
}
mark('progressive-lenses', 'orientarsi, decidere, verificare');

assert.match(contract.primaryQuestion, /Che cosa deve fare qui/);
assert.match(contract.secondaryQuestion, /processo/);
assert.ok(contract.intermediateObjects.some(item => item.claimClass === 'action-frame'));
assert.ok(contract.intermediateObjects.some(item => item.claimClass === 'decision-checkpoint'));
mark('object-focused-abstractions', 'ActionFrame prima, processo nel drill-down, DecisionCheckpoint prima della scrittura');

for (const [state, meaning] of Object.entries(contract.stateMeanings)) {
  assert.ok(meaning.length >= 30, `${state}: significato troppo breve`);
  assert.ok(!/^conforme|certificato|sicuro$/i.test(meaning));
}
assert.ok(contract.stateMeanings['derived-guidance']);
mark('state-language', `${Object.keys(contract.stateMeanings).length} stati spiegati senza verdetti`);

for (const action of contract.writeActions) {
  for (const field of ['id', 'before', 'after', 'requiresHumanConfirmation', 'requiresReceipt', 'doesNotMean']) assert.notEqual(action[field], undefined, `${action.id}: ${field} assente`);
  assert.equal(action.requiresHumanConfirmation, true);
  assert.equal(action.requiresReceipt, true);
  assert.ok(action.doesNotMean.length >= 2);
  assert.match(interactions, new RegExp(`withActionCheckpoint\\('${action.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`), `${action.id}: checkpoint non wired`);
}
mark('write-action-boundaries', `${contract.writeActions.length} azioni con before/after/receipt e checkpoint`);

assert.match(app, /mountEpistemicGuide/);
assert.match(app, /mountActionFrames/);
assert.match(app, /mountSupportBundle/);
for (const token of ['/epistemic-contract.json', '/gap-registry.json', 'data-guide-lens', 'data-guide-object']) assert.ok(guide.includes(token), `Guida senza token ${token}`);
assert.match(guide, /receipt/i);
assert.match(guide, /limitations|limit/);
assert.match(guide, /Escape/);
assert.match(guideCss, /prefers-reduced-motion/);
assert.match(guideCss, /min-height:44px/);
mark('guide-wiring', 'contratto, gap, oggetto selezionato, tastiera e target minimi');

for (const token of ['userQuestion', 'processRef', 'prerequisites', 'consequence', 'doesNotMean', 'evidenceAfter']) assert.ok(frameModel.includes(token), `ActionFrame senza ${token}`);
assert.match(frameUi, /Che cosa devi fare qui/);
assert.match(frameUi, /Perché questa azione compare qui/);
assert.match(frameUi, /showModal/);
assert.match(frameCss, /min-height:44px/);
assert.match(frameCss, /prefers-reduced-motion/);
mark('action-frame-wiring', 'una sola azione primaria, processo secondario, checkpoint e accessibilità di base');

for (const forbidden of ['narrative', 'locator', 'contentBase64', 'rationale']) assert.match(support, new RegExp(forbidden, 'i'));
assert.match(support, /redactions/);
assert.match(support, /non attesta/i);
mark('support-bundle-boundary', 'diagnostica locale con denylist e limiti espliciti');

for (const pattern of [/compliance score/i, /pienamente conforme/i, /nessun rischio/i, /certificato automaticamente/i]) {
  assert.ok(!pattern.test(`${JSON.stringify(contract)}\n${guide}\n${frameModel}\n${frameUi}`), `Overclaim nella nuova superficie: ${pattern}`);
}
mark('anti-overclaim', 'nessuna label vietata nelle superfici object-focused');

const artifactDir = path.join(root, 'artifacts');
await mkdir(artifactDir, { recursive: true });
await writeFile(path.join(artifactDir, 'v3-ux-audit.json'), JSON.stringify({ schemaVersion: '1.1.0', generatedAt: new Date().toISOString(), result: 'passed', checks }, null, 2));
console.log(`v3-ux-audit: ok (${checks.length} checks)`);
