import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildSupportBundle, hasForbiddenSupportData } from './public/js/support-bundle-model.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const data = {
  meta: { version: '3.0.0-beta.1', integrity: { ok: true, eventCount: 7, head: '0123456789abcdef0123456789abcdef' } },
  sources: [{ id: 'src-1', locator: 'https://secret.example', contentBase64: 'secret' }],
  findings: [{ id: 'f-1', payload: { secret: true } }],
  changes: [{ id: 'c-1', rationale: 'sensitive' }],
  matters: [{ id: 'm-1', narrative: 'sensitive narrative' }],
  jobs: [{ id: 'j-1' }],
  objectIndex: { a: {}, b: {} },
  views: { semanticGraph: { edges: [{ from: 'a', to: 'b' }] }, supply: [{ id: 's1', label: 'Ledger', epistemicStatus: 'operational', limitations: ['Locale'] }] }
};
const bundle = buildSupportBundle(data, { generatedAt: '2026-07-31T20:00:00.000Z', correlationId: 'audit-correlation' });
assert.equal(bundle.correlationId, 'audit-correlation');
assert.equal(bundle.counts.sources, 1);
assert.equal(bundle.counts.projectedObjects, 2);
assert.equal(bundle.integrity.headPrefix, '0123456789abcdef');
assert.equal(hasForbiddenSupportData(bundle), false, 'Il support bundle contiene campi vietati');
assert.ok(bundle.redactions.length >= 5);
assert.ok(bundle.limitations.some(item => /non attesta/i.test(item)));
const artifactDir = path.join(root, 'artifacts');
await mkdir(artifactDir, { recursive: true });
await writeFile(path.join(artifactDir, 'support-bundle-audit.json'), JSON.stringify({ result: 'passed', bundle }, null, 2));
console.log('support-bundle-audit: ok (sanitized counts, integrity and capabilities)');
