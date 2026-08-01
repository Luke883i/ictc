import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const contract = JSON.parse(await readFile(path.join(root, 'v3/public/persona-journeys.json'), 'utf8'));
const app = await readFile(path.join(root, 'v3/public/app.js'), 'utf8');
const shell = await readFile(path.join(root, 'v3/public/js/journey-shell.js'), 'utf8');
const model = await readFile(path.join(root, 'v3/public/js/journey-model.js'), 'utf8');
const css = await readFile(path.join(root, 'v3/public/styles.css'), 'utf8');
const api = await readFile(path.join(root, 'v3/lib/api.mjs'), 'utf8');
const checks = [];
const mark = (name, detail) => checks.push({ name, status: 'passed', detail });

assert.equal(contract.claimClass, 'persona-journey-projection-contract');
assert.match(contract.primaryQuestion, /completare adesso/i);
assert.match(contract.boundary, /non è identità.*autenticazione.*autorizzazione/i);
assert.equal(contract.personas.length, 5);
for (const persona of contract.personas) {
  for (const field of ['id', 'label', 'entryQuestion', 'mandate', 'decisionBoundary', 'journey', 'sections']) {
    assert.ok(persona[field], `${persona.id || 'persona'}: ${field} assente`);
  }
  assert.equal(persona.journey.length, 5, `${persona.id}: journey non minimale a cinque passi`);
}
mark('persona-journey-contract', '5 lenti, mandato, confine e journey a cinque passi');

assert.ok(contract.objectPurposes.length >= 7);
for (const purpose of contract.objectPurposes) {
  assert.ok(contract.personas.some(persona => persona.id === purpose.personaId), `${purpose.personaId}: persona sconosciuta`);
  assert.ok(purpose.claimClasses.length && purpose.purpose && purpose.allowedActions.length && purpose.antiEquivalence);
}
mark('object-purpose-boundaries', `${contract.objectPurposes.length} scopi riconciliati con persona e anti-equivalenza`);

const expectedWrites = ['source-propose', 'source-review', 'finding-review', 'change-decision', 'control-map', 'matter-create', 'matter-owner', 'matter-transition'];
const writeActions = contract.actions.filter(action => action.kind === 'write');
assert.deepEqual(writeActions.map(action => action.id).sort(), [...expectedWrites].sort());
for (const action of writeActions) {
  assert.equal(action.receiptExpected, true, `${action.id}: receipt non obbligatoria`);
  const routeToken = action.route.split('/').filter(part => part && !part.startsWith(':')).at(-1);
  assert.ok(api.includes(routeToken), `${action.id}: route non rappresentata nel backend`);
  assert.ok(model.includes(action.id), `${action.id}: task non derivato dal modello`);
}
mark('runtime-write-contract', `${writeActions.length} scritture collegate a task, route e receipt`);

assert.match(app, /startJourneyShell/);
assert.doesNotMatch(app, /mountEpistemicGuide|mountActionFrames|mountAdvancedUx/);
assert.match(shell, /deriveJourneyWorkspace/);
assert.match(shell, /fetch\('\/persona-journeys\.json'/);
assert.match(shell, /api\('\/api\/bootstrap'/);
assert.match(shell, /async function checkpoint/);
assert.match(shell, /dialog\.showModal\(\)/);
assert.match(shell, /async function mutate/);
assert.match(shell, /state\.lastReceipt\s*=\s*result\.receipt/);
assert.match(shell, /await refresh\(\)/);
assert.match(shell, /readbackVerified/);
mark('journey-shell-wiring', 'shell unica, checkpoint, scrittura, refresh e receipt');

for (const token of ['objectPurpose', 'sotRef', 'whyHere', 'consequence', 'doesNotMean', 'evidenceAfter', 'availability']) {
  assert.ok(model.includes(token), `JourneyTask senza ${token}`);
}
assert.match(model, /unavailable/);
assert.match(model, /Il bootstrap non contiene la collezione necessaria/);
assert.match(model, /Assenza di rischio o attività/);
mark('journey-task-epistemics', 'scopo, SOT, conseguenza, limiti, evidenza e stati degradati');

assert.match(shell, /data-task-action/);
assert.match(shell, /class=\"primary\"/);
assert.match(shell, /data-open-object/);
assert.match(shell, /role=\"status\"/);
assert.match(shell, /ArrowLeft|ArrowRight/);
assert.match(shell, /Home|End/);
assert.match(css, /--target:\s*44px/);
assert.match(css, /min-height:\s*var\(--target\)/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /forced-colors:\s*active/);
mark('accessibility-and-ergonomics', 'azione primaria, focus/tastiera, live status, target, motion e forced colors');

for (const pattern of [/compliance score/i, /pienamente conforme/i, /nessun rischio/i, /certificato automaticamente/i]) {
  assert.ok(!pattern.test(`${JSON.stringify(contract)}\n${model}\n${shell}`), `Overclaim nella shell journey-first: ${pattern}`);
}
mark('anti-overclaim', 'nessun verdetto sintetico nelle superfici attive');

const artifactDir = path.join(root, 'artifacts');
await mkdir(artifactDir, { recursive: true });
await writeFile(path.join(artifactDir, 'v3-ux-audit.json'), JSON.stringify({
  schemaVersion: '2.0.0',
  generatedAt: new Date().toISOString(),
  result: 'passed',
  profile: 'journey-first-runtime-ui',
  checks
}, null, 2));
console.log(`v3-ux-audit: ok (${checks.length} checks, journey-first)`);
