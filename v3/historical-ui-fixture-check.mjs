import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const fixtures = [
  './public/ui/reborn-3-home.js', './public/ui/stable-1-4-home.js', './public/ui/standard-proof-1-6.js', './public/ui/standard-proof-1-7.js',
  './public/ui/clarity-1-7.js', './public/ui/workbench-1-8.js', './public/ui/enterprise-2.js', './public/ui/enterprise-2-processes.js',
  './public/enterprise-1-7.css', './public/enterprise-1-8.css', './public/enterprise-2.css', './enterprise-2-contract.json'
];
for (const fixture of fixtures) await access(new URL(fixture, import.meta.url));
const app = await readFile(new URL('./public/app.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('./public/styles.css', import.meta.url), 'utf8');
for (const token of ['reborn-3','stable-1-4','standard-proof-1-7','workbench-1-8','enterprise-2']) {
  assert.doesNotMatch(app, new RegExp(token));
  assert.doesNotMatch(styles, new RegExp(token));
}
console.log(`historical-ui-fixture-check: ok (${fixtures.length} retained fixtures, zero active imports)`);
