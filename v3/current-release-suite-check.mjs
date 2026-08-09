import { access, readFile } from 'node:fs/promises';
import { CURRENT_RUNTIME, CURRENT_SEMANTIC } from './current-release-suite.mjs';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const ci = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const postMerge = await readFile(new URL('../.github/workflows/post-merge-evidence.yml', import.meta.url), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(pkg.scripts?.test === 'npm run test:current', 'package.json test must resolve to test:current');
check(pkg.scripts?.['test:current:semantic'] === 'node v3/current-release-suite.mjs semantic', 'semantic current suite script drift');
check(pkg.scripts?.['test:current:runtime'] === 'node v3/current-release-suite.mjs runtime', 'runtime current suite script drift');
check(pkg.scripts?.['test:current'] === 'npm run test:current:semantic && npm run test:current:runtime', 'current suite aggregator drift');
check(postMerge.includes('npm run test:current'), 'post-merge evidence must execute the current suite');
check(!postMerge.includes('- run: npm test'), 'post-merge evidence must not execute the historical npm test alias directly');
check(ci.includes('npm run test:current:semantic'), 'PR CI must consume the canonical semantic current suite');
check(ci.includes('npm run test:current:runtime'), 'PR CI must consume the canonical runtime current suite');

const paths = [...new Set([...CURRENT_SEMANTIC, ...CURRENT_RUNTIME])];
for (const path of paths) {
  try { await access(new URL(`../${path}`, import.meta.url)); }
  catch { failures.push(`current suite path missing: ${path}`); }
}
check(CURRENT_SEMANTIC.length >= 35, 'semantic suite unexpectedly contracted');
check(CURRENT_RUNTIME.length >= 20, 'runtime suite unexpectedly contracted');

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, semanticChecks: CURRENT_SEMANTIC.length, runtimeChecks: CURRENT_RUNTIME.length, uniqueChecks: paths.length }));
