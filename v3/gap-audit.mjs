import { strict as assert } from 'node:assert';
import { readFile, access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const registry = JSON.parse(await readFile(path.join(root, 'v3/gaps.json'), 'utf8'));
const publicRegistry = JSON.parse(await readFile(path.join(root, 'v3/public/gap-registry.json'), 'utf8'));
assert.deepEqual(publicRegistry.gaps.map(gap => gap.id), registry.gaps.filter(gap => gap.status === 'open').map(gap => gap.id), 'Registro gap pubblico non sincronizzato con i gap aperti canonici');
const checks = [];
const mark = (name, detail) => checks.push({ name, status: 'passed', detail });

assert.match(registry.schemaVersion, /^1\.[0-9]+\.0$/);
assert.ok(Array.isArray(registry.gaps) && registry.gaps.length >= 10);
mark('registry-present', `${registry.gaps.length} gap codificati`);

const ids = new Set();
for (const gap of registry.gaps) {
  assert.match(gap.id, /^GAP-[0-9]{3}$/);
  assert.ok(!ids.has(gap.id), `ID duplicato: ${gap.id}`); ids.add(gap.id);
  for (const field of ['title','status','severity','layer','userImpact','epistemicRisk','nextAction']) assert.ok(String(gap[field] || '').trim(), `${gap.id}: ${field} assente`);
  assert.ok(Array.isArray(gap.evidence) && gap.evidence.length, `${gap.id}: evidence assente`);
  assert.ok(Array.isArray(gap.limitations) && gap.limitations.length, `${gap.id}: limitations assente`);
  assert.ok(Array.isArray(gap.changePaths) && Array.isArray(gap.testPaths), `${gap.id}: path non strutturati`);
  if (gap.status === 'closed') {
    assert.ok(gap.changePaths.length && gap.testPaths.length, `${gap.id}: chiuso senza change/test path`);
    for (const item of [...gap.changePaths, ...gap.testPaths]) await access(path.join(root, item));
  }
  if (gap.status === 'open') assert.ok(gap.nextAction.length >= 12, `${gap.id}: gap aperto senza azione concreta`);
}
mark('gap-shape', 'ID, stato, impatto, rischio, evidenze, limiti e azioni verificati');

const criticalOpen = registry.gaps.filter(gap => gap.status === 'open' && gap.severity === 'critical');
assert.ok(criticalOpen.length >= 1, 'Il registro non deve nascondere i gap critici residui');
mark('critical-gaps-visible', criticalOpen.map(gap => gap.id).join(', '));

const artifactDir = path.join(root, 'artifacts'); await mkdir(artifactDir, { recursive: true });
const payload = { schemaVersion: registry.schemaVersion, generatedAt: new Date().toISOString(), result: 'passed', checks, totals: Object.fromEntries(['closed','mitigated','open','accepted'].map(status => [status, registry.gaps.filter(gap => gap.status === status).length])) };
await writeFile(path.join(artifactDir, 'gap-audit.json'), JSON.stringify(payload, null, 2));
console.log(`gap-audit: ok (${registry.gaps.length} gaps; ${criticalOpen.length} critical open)`);
