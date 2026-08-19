import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const v3 = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(v3, 'public');
const historical = /(?:reborn-3|stable-1-4|standard-proof-1-[67]|clarity-1-7|workbench-1-8|settings-1-8|labels-1-8|enterprise-1-[78]|enterprise-2)/;
const prototypeUi = /\/public\/js\//;

function imports(source) {
  return [...source.matchAll(/(?:import\s+(?:[^'";]+?\s+from\s+)?|import\()['"]([^'"]+)['"]/g)].map(match => match[1]);
}
function cssImports(source) {
  return [...source.matchAll(/@import\s+url\(['"]?([^)'"\s]+)['"]?\)/g)].map(match => match[1]);
}
function localTarget(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  return path.resolve(path.dirname(fromFile), specifier);
}
async function graph(entry, extractor) {
  const seen = new Set();
  const edges = new Map();
  async function visit(file) {
    const normalized = path.normalize(file);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    const source = await readFile(normalized, 'utf8');
    const local = [];
    for (const specifier of extractor(source)) {
      const target = localTarget(normalized, specifier);
      if (target) { local.push(path.normalize(target)); await visit(target); }
    }
    edges.set(normalized, local);
  }
  await visit(entry);
  return { files: [...seen], edges };
}

const appPath = path.join(publicRoot, 'app.js');
const stylesPath = path.join(publicRoot, 'styles.css');
const indexPath = path.join(publicRoot, 'index.html');
const app = await readFile(appPath, 'utf8');
const styles = await readFile(stylesPath, 'utf8');
const index = await readFile(indexPath, 'utf8');

const rootInstalls = app.match(/\binstall[A-Z][A-Za-z0-9_]*\(\);/g) || [];
assert.deepEqual(rootInstalls, ['installActiveExperience();'], 'app.js must have exactly one composition root installer');
assert.match(app, /\.\/ui\/active-experience\.js/);
assert.doesNotMatch(app, /procedure-sequential-ux-2-2|installSequentialProcedureUx/, 'journey overlay cannot be a sibling app composition');
assert.doesNotMatch(app, /install(?:Enterprise|Stable|Reborn|StandardProof|Clarity|Workbench|Settings|Labels).*Experience|installEnterprise2|installEnterpriseWorkbench18/);
assert.doesNotMatch(index.match(/<title>(.*?)<\/title>/i)?.[1] || '', /(?:1\.7|1\.8|Enterprise\s*(?:2|clarity|Workbench))/i, 'static shell title is stale');

const jsGraph = await graph(appPath, imports);
for (const file of jsGraph.files) {
  const rel = file.replaceAll('\\', '/');
  assert.doesNotMatch(rel, historical, `historical runtime enhancer loaded: ${rel}`);
  assert.doesNotMatch(rel, prototypeUi, `prototype UI family loaded: ${rel}`);
}
assert.equal(jsGraph.files.filter(file => file.endsWith('/active-experience.js') || file.endsWith('\\active-experience.js')).length, 1);
const directAppImports = jsGraph.edges.get(path.normalize(appPath)) || [];
const directInstallerModules = directAppImports.filter(file => /\/ui\/.*experience|\/ui\/procedure-sequential/.test(file.replaceAll('\\','/')));
assert.deepEqual(directInstallerModules.map(file=>path.basename(file)), ['active-experience.js'], 'only active-experience may be composed directly by app.js');
assert.ok(jsGraph.files.some(file=>file.endsWith('experience-lifecycle.js')), 'constitutional lifecycle must be reachable from active experience');
assert.ok(jsGraph.files.some(file=>file.endsWith('procedure-sequential-ux-2-2.js')), 'journey overlay must remain reachable through active experience');

const cssGraph = await graph(stylesPath, cssImports);
for (const file of cssGraph.files) assert.doesNotMatch(file.replaceAll('\\', '/'), historical, `historical runtime CSS loaded: ${file}`);
assert.ok(cssGraph.files.some(file => file.endsWith('active-experience.css')));

for (const fixture of [
  'ui/reborn-3-home.js','ui/stable-1-4-home.js','ui/standard-proof-1-7.js','ui/workbench-1-8.js','ui/enterprise-2.js',
  'enterprise-1-8.css','enterprise-2.css'
]) await access(path.join(publicRoot, fixture));

for (const sample of ['ui/workbench-1-8.js','enterprise-2.css','ui/standard-proof-1-7.js']) assert.match(sample, historical, `negative detector missed ${sample}`);
for (const sample of ['ui/active-experience.js','active-experience.css','ui/proof-surface.js']) assert.doesNotMatch(sample, historical, `canonical path misclassified ${sample}`);

const common = await readFile(path.join(publicRoot, 'ui/common.js'), 'utf8');
assert.match(common, /state\.data\?\.ontology\?\.states/);
assert.match(common, /new Proxy\(presentationLabels/);
assert.doesNotMatch(common, /candidate:'Da verificare'|active:'Attivo'|closed:'Chiuso'/);

console.log(`ui-active-experience-audit: ok (js=${jsGraph.files.length}, css=${cssGraph.files.length}, active-compositions=${rootInstalls.length})`);
