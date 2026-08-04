import { strict as assert } from 'node:assert';
import { readdir, readFile } from 'node:fs/promises';
const publicRoot = new URL('./public/', import.meta.url);
const html = await readFile(new URL('index.html', publicRoot), 'utf8');
const cssFiles = (await readdir(publicRoot)).filter(name => name.endsWith('.css'));
const uiFiles = (await readdir(new URL('ui/', publicRoot))).filter(name => name.endsWith('.js'));
const js = [
  await readFile(new URL('app.js', publicRoot), 'utf8'),
  ...await Promise.all(uiFiles.map(name => readFile(new URL(`ui/${name}`, publicRoot), 'utf8')))
].join('\n');
const css = (await Promise.all(cssFiles.map(name => readFile(new URL(name, publicRoot), 'utf8')))).join('\n');
assert.equal((html.match(/data-service=/g)||[]).length, 2);
assert.ok(html.includes('Che cosa deve sorvegliare ICTC?'));
assert.ok(html.includes('Racconto originale'));
assert.ok(html.includes('Quando ne avete avuto conoscenza?'));
assert.equal((html.match(/name="objective"[^>]*required/g)||[]).length, 1);
assert.equal((html.match(/name="originalNarrative"[^>]*required/g)||[]).length, 1);
assert.equal((html.match(/name="awarenessAt"[^>]*required/g)||[]).length, 1);
for (const wow of ['proofPulse','Plan Reveal','AI Lens','Question Compass','Origin Diff']) assert.ok(html.includes(wow) || js.includes(wow), wow);
for (const forbidden of ['tenantSelect','reviewer','semantic graph','control mapping','owner confirmation']) assert.ok(!`${html}\n${js}`.toLowerCase().includes(forbidden.toLowerCase()), forbidden);
assert.ok(js.includes('evidenceUrl') || js.includes('/api/evidence/'));
assert.ok(js.includes('x-ictc-expected-revision'));
assert.ok(css.includes('prefers-reduced-motion'));
assert.ok(uiFiles.length >= 5, 'UI responsibilities must stay modular');
console.log(`ui-contract-check: ok (${uiFiles.length} UI modules, progressive intake, provenance wow)`);
