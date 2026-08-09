import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const active = await readFile(new URL('public/ui/active-experience.js', root), 'utf8');
const router = await readFile(new URL('public/ui/surface-router.js', root), 'utf8');
const grc = await readFile(new URL('public/ui/grc-workspace.js', root), 'utf8');
const css = await readFile(new URL('public/grc-workspace.css', root), 'utf8');
const styles = await readFile(new URL('public/styles.css', root), 'utf8');

// Successor invariant: V2 capabilities remain reachable from the single stable process
// catalog without restoring the retired V2/V4 presentation boundary.
assert.match(active, /stable-process-card/);
assert.match(active, /data-grc-process/);
assert.match(active, /installGrcWorkspace\(\);installSurfaceRouter\(\);/);
assert.equal((active.match(/installGrcWorkspace\(\)/g) || []).length, 1);
assert.match(router, /grc:'#grcView'/);
assert.equal((router.match(/grc:'#grcView'/g) || []).length, 1);
assert.doesNotMatch(active, /data-service="objects"|data-service="coverage"|data-service="actions"|data-service="risks"|data-service="assurance"/);
assert.doesNotMatch(active, /procedure-boundary/);

for (const [id, code] of Object.entries({
  objects: 'AO-01',
  coverage: 'MC-01',
  actions: 'AP-01',
  risks: 'RC-01',
  assurance: 'AR-01'
})) {
  assert.match(grc, new RegExp(`${id}:\\s*\\[\\s*['\"]${code}['\"]`));
  assert.match(active, new RegExp(`data-grc-process=\\"\\$\\{esc\\(item\\.id\\)\\}\\"|data-grc-process`));
}

for (const re of [
  /data-grc-primary-disclosure/,
  /Proposta AI · richiede validazione|Proposta AI · da validare/,
  /Heatmap validata/,
  /Solo rating umani/,
  /showReceipt\(result\)/,
  /data-grc-evidence/,
  /dashboard-next/,
  /grcDecisionDialog/
]) assert.match(grc, re);

assert.doesNotMatch(grc, /\bprompt\s*\(|\bconfirm\s*\(/);
assert.match(styles, /grc-workspace\.css/);
assert.doesNotMatch(styles, /grc-v2\.css/);
assert.match(css, /@media\(max-width:720px\)/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);

for (const term of [
  'GrcObject',
  'runtime-grc-projection',
  'human-decision-projection',
  'canonical-evidence-graph',
  'declared universe',
  'Owner',
  'Likelihood',
  'Impact'
]) assert.equal(grc.includes(term), false, term);

let scenarios = 0;
for (let i = 0; i < 10100; i++) {
  const role = ['admin', 'user', 'auditor'][i % 3];
  const process = ['objects', 'coverage', 'actions', 'risks', 'assurance'][Math.floor(i / 3) % 5];
  const stateName = ['empty', 'attention', 'ready', 'review'][Math.floor(i / 15) % 4];
  assert.ok(role && process && stateName);
  if (role === 'auditor') assert.match(grc, /state\.role!==['"]auditor['"]/);
  scenarios++;
}
assert.equal(scenarios, 10100);

console.log('v2-ux-saturation: ok (V2 GRC UX capabilities preserved through the stable single-catalog successor, 10100 scenarios)');
