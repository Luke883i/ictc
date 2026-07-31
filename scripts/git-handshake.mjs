import { execFileSync } from 'node:child_process';
import { mkdtemp, cp, readdir, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const version = execFileSync('git', ['--version'], { encoding: 'utf8' }).trim();
const temp = await mkdtemp(path.join(os.tmpdir(), 'ictc-git-'));
await cp(root, path.join(temp, 'repo'), { recursive: true, filter: src => !src.includes('/artifacts/screenshots/') && !src.endsWith('.zip') && !src.endsWith('.tar.gz') });
const repo = path.join(temp, 'repo');
execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: repo });
execFileSync('git', ['config', 'user.email', 'ictc@example.invalid'], { cwd: repo });
execFileSync('git', ['config', 'user.name', 'ICTC Handshake'], { cwd: repo });
execFileSync('git', ['checkout', '-q', '-b', 'agent/ictc-v2-epistemic-market-ready'], { cwd: repo });
execFileSync('git', ['add', '.'], { cwd: repo });
const staged = execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (!staged.length) throw new Error('No files staged in handshake');
const forbidden = staged.filter(file => /\.(zip|tar\.gz)$/.test(file) || file.startsWith('runtime/blobs/') && !file.endsWith('.gitkeep') || file === 'runtime/ledger.jsonl');
if (forbidden.length) throw new Error(`Forbidden transfer files: ${forbidden.join(', ')}`);
async function walk(dir, relative = '') {
  const out = [];
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    const rel = path.join(relative, name);
    const info = await stat(full);
    if (info.isDirectory()) out.push(...await walk(full, rel)); else if (info.size > 9_000_000) out.push(`${rel}:${info.size}`);
  }
  return out;
}
const large = await walk(root);
if (large.length) throw new Error(`Files over 9 MB: ${large.join(', ')}`);
console.log(`git-handshake: ok (${version}, ${staged.length} staged source files)`);
