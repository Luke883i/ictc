import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const excluded = new Set(['artifacts/release-manifest.json','runtime/ledger.jsonl','runtime/state.json']);
const files = [];
async function walk(dir, relative = '') {
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    const rel = path.posix.join(relative, name);
    const info = await stat(full);
    if (info.isDirectory()) await walk(full, rel);
    else if (!excluded.has(rel) && !rel.startsWith('runtime/blobs/')) {
      const bytes = await readFile(full);
      files.push({ path: rel, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
}
await walk(root);
files.sort((a, b) => a.path.localeCompare(b.path));
const manifest = { product: 'ICTC', version: '2.0.0-beta.2', generatedAt: new Date().toISOString(), fileCount: files.length, files };
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts', 'release-manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`release-manifest: ${files.length} files`);
