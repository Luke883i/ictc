import { execFileSync } from 'node:child_process';
import { mkdtemp, cp, readdir, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const version = execFileSync('git', ['--version'], { encoding: 'utf8' }).trim();
const temp = await mkdtemp(path.join(os.tmpdir(), 'ictc-git-'));
const destination = path.join(temp, 'repo');
const excludedRoots = new Set(['.git', 'node_modules', 'artifacts']);

await cp(root, destination, {
  recursive: true,
  filter: source => {
    const relative = path.relative(root, source);
    if (!relative) return true;
    const [topLevel] = relative.split(path.sep);
    if (excludedRoots.has(topLevel)) return false;
    if (/\.(zip|tar\.gz)$/.test(relative)) return false;
    if (relative === path.join('runtime', 'ledger.jsonl')) return false;
    if (relative.startsWith(`${path.join('runtime', 'blobs')}${path.sep}`) && !relative.endsWith('.gitkeep')) return false;
    return true;
  },
});

execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: destination });
execFileSync('git', ['config', 'user.email', 'ictc@example.invalid'], { cwd: destination });
execFileSync('git', ['config', 'user.name', 'ICTC Handshake'], { cwd: destination });
execFileSync('git', ['checkout', '-q', '-b', 'agent/ictc-v2-epistemic-market-ready'], { cwd: destination });
execFileSync('git', ['add', '.'], { cwd: destination });
const staged = execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: destination, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (!staged.length) throw new Error('No files staged in handshake');
const forbidden = staged.filter(file => /\.(zip|tar\.gz)$/.test(file) || file.startsWith('runtime/blobs/') && !file.endsWith('.gitkeep') || file === 'runtime/ledger.jsonl');
if (forbidden.length) throw new Error(`Forbidden transfer files: ${forbidden.join(', ')}`);

async function walk(dir, relative = '') {
  const out = [];
  for (const name of await readdir(dir)) {
    if (relative === '' && excludedRoots.has(name)) continue;
    const full = path.join(dir, name);
    const rel = path.join(relative, name);
    const info = await stat(full);
    if (info.isDirectory()) out.push(...await walk(full, rel));
    else if (info.size > 9_000_000) out.push(`${rel}:${info.size}`);
  }
  return out;
}

const large = await walk(root);
if (large.length) throw new Error(`Files over 9 MB: ${large.join(', ')}`);
console.log(`git-handshake: ok (${version}, ${staged.length} staged source files)`);
