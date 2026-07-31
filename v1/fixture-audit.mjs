import { strict as assert } from 'node:assert';
import path from 'node:path';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { sha256 } from './release.mjs';

const root = path.resolve(new URL('.', import.meta.url).pathname);
const manifest = JSON.parse(await readFile(path.join(root, 'fixtures', 'manifest.json'), 'utf8'));
const source = await readFile(path.join(root, 'fixtures', manifest.file));
assert.equal(source.length, manifest.bytes);
assert.equal(sha256(source), manifest.sha256);
assert.ok(manifest.doesNotMean.includes('assenza di malware'));
const temp = await mkdtemp(path.join(os.tmpdir(), 'ictc-v1-fixture-'));
try {
  const target = path.join(temp, manifest.sha256);
  await writeFile(target, source);
  const readback = await readFile(target);
  assert.equal(sha256(readback), manifest.sha256);
  console.log(`v1-fixture-audit: ok (${source.length} bytes, deterministic hash and readback)`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
