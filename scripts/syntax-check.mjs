import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['v3', 'scripts'];
const files = [];
function walk(root) {
  for (const name of readdirSync(root)) {
    if (['node_modules','.git'].includes(name)) continue;
    const file = path.join(root, name);
    const stat = statSync(file);
    if (stat.isDirectory()) walk(file);
    else if (/\.(?:mjs|js)$/.test(name)) files.push(file);
  }
}
for (const root of roots) walk(root);
for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || `syntax failure: ${file}\n`);
    process.exit(result.status || 1);
  }
}
console.log(`syntax-check: ok (${files.length} JavaScript modules)`);
