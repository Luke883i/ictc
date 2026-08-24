import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const root = fileURLToPath(new URL('../', import.meta.url));
const [readme, agents, startHere, architecture, testing, development, security, persistence, pkgText, identityText, product, manifestText] = await Promise.all([
  read('../README.md'), read('../AGENTS.md'), read('../docs/START_HERE.md'), read('../docs/11_ARCHITECTURE.md'),
  read('../docs/TESTING.md'), read('../docs/DEVELOPMENT.md'), read('../SECURITY.md'), read('./sqlite-state-persistence.mjs'),
  read('../package.json'), read('./release-identity.json'), read('../docs/PRODUCT.md'), read('../docs/documentation-manifest.json')
]);

const pkg = JSON.parse(pkgText);
const identity = JSON.parse(identityText);
const manifest = JSON.parse(manifestText);
const normative = [
  ['README', readme], ['AGENTS', agents], ['START_HERE', startHere], ['PRODUCT', product], ['architecture', architecture],
  ['testing', testing], ['development', development], ['security', security]
];
for (const [name, text] of normative) assert.ok(text.length > 300, `${name} unexpectedly empty`);
for (const [name, text] of [['README', readme], ['AGENTS', agents], ['architecture', architecture]]) {
  assert.match(text, /SQLite/i, `${name} must name current SQLite persistence`);
  assert.ok(!/current[^\n]{0,80}(?:SOT|persistence)[^\n]{0,80}state\.json/i.test(text), `${name} claims state.json is current persistence`);
}

for (const token of ['PRAGMA journal_mode=WAL', 'PRAGMA synchronous=FULL', 'CREATE TABLE IF NOT EXISTS snapshot', 'CREATE TABLE IF NOT EXISTS audit', 'CREATE TABLE IF NOT EXISTS subject_version', 'CREATE TABLE IF NOT EXISTS epistemic_step']) assert.ok(persistence.includes(token), `persistence executable contract missing ${token}`);
assert.match(architecture, /snapshot[^\n]*mutabile/i);assert.match(architecture, /audit[^\n]*append-only/i);assert.match(architecture, /subject_version[^\n]*append-only/i);assert.match(architecture, /epistemic_step[^\n]*append-only/i);assert.match(architecture, /non è oggi un event store completo/i);
assert.equal(pkg.scripts.test, 'npm run test:current');assert.equal(pkg.private,true);assert.equal(pkg.scripts['test:current:semantic'],'node v3/current-semantic-3-2.mjs');assert.match(testing, /npm test` esegue `test:current`/);assert.match(testing, /exact PR HEAD/i);assert.match(development, /state\.sqlite/);
assert.equal(identity.schemaVersion,'2.0.0');assert.equal(identity.productVersion,pkg.version);assert.equal(identity.releaseStage,'candidate');assert.equal(identity.contracts.journey,'2.2-sequential-onto-epistemic');assert.equal(identity.contracts.constitution,'C0.1');assert.ok(readme.includes(identity.contracts.journey));assert.ok(readme.includes(identity.contracts.constitution));
assert.match(security, /CodeQL is conditional|CodeQL è condizionale/i);assert.match(security, /not executed|non eseguito/i);for (const format of ['PDF', 'XML', 'Markdown', 'ZIP']) assert.ok(readme.includes(format), `README missing evidence format ${format}`);
assert.ok(readme.includes('docs/START_HERE.md'), 'README must expose the newcomer route');assert.ok(agents.includes('docs/START_HERE.md'), 'AGENTS must expose the newcomer route');assert.match(startHere, /entrypoint canonico/i, 'START_HERE must declare the canonical documentation entrypoint');assert.ok(startHere.includes('PRODUCT.md'), 'START_HERE must route current product authority');assert.ok(startHere.includes('documentation-manifest.json'), 'START_HERE must route the documentation registry');
assert.equal(manifest.entrypoint,'docs/START_HERE.md');assert.equal(manifest.documentationRuntime,'1.0');assert.equal(manifest.versionAxes?.product?.value,pkg.version);assert.equal(manifest.versionAxes?.journey?.value,identity.contracts.journey);assert.equal(manifest.versionAxes?.constitution?.value,identity.contracts.constitution);
const lattice = spawnSync(process.execPath,['scripts/documentation-lattice-check.mjs'],{cwd:root,stdio:'inherit',env:process.env,timeout:30_000,killSignal:'SIGKILL'});
if(lattice.error) throw lattice.error;assert.equal(lattice.signal,null,'documentation lattice check terminated by signal');assert.equal(lattice.status,0,'documentation lattice check failed');
console.log(JSON.stringify({ok:true,check:'documentation-authority',authorities:['sqlite-state-persistence','package:test','release-identity-v2','security-workflow-boundary','documentation-runtime-1.0'],onboardingRoute:'docs/START_HERE.md',documentationRuntime:manifest.documentationRuntime,files:normative.map(([name]) => name)}));
