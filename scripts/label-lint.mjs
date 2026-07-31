import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const targets = ['app/index.html','app/app.js','data/seed.json'];
const forbidden = [
  /presidio solido/i,
  /compliance score/i,
  /\bconforme\b/i,
  /fonte valida/i,
  /AI ha identificato/i,
  /incidente NIS2/i,
  /certificato automaticamente/i,
  /nessun rischio/i,
  /pienamente copert[oa]/i,
  /successo completo/i,
  /certificazione automatica/i
];
const allowedContexts = [/non certifica automaticamente/i, /non produce una certificazione automatica/i, /non certifica automaticamente/i, /posso dire che siamo conformi/i];
for (const target of targets) {
  const text = await readFile(path.join(root, target), 'utf8');
  for (const pattern of forbidden) {
    const match = text.match(pattern);
    if (!match) continue;
    const start = Math.max(0, match.index - 80);
    const context = text.slice(start, match.index + match[0].length + 80);
    if (allowedContexts.some(allowed => allowed.test(context))) continue;
    throw new Error(`${target}: forbidden epistemic label ${pattern}`);
  }
}
console.log('label-lint: ok');
