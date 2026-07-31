import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildState } from '../lib/domain.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const outDir = path.join(root, 'artifacts', 'ascii');
await mkdir(outDir, { recursive: true });
const state = await buildState();

const glyph = status => ({
  observed: '.', verified: '=', 'attention-required': '?',
  'awaiting-human-review': '?', 'ai-proposed': 'a',
  'human-reviewed': 'r', 'human-owned': 'o',
  candidate: '?', unavailable: '-', failed: 'x'
})[status] || ':';

const render = trace => {
  const steps = trace.data.steps;
  const width = Math.max(78, ...steps.map(step => step.statement.length + 36));
  const line = char => char.repeat(width);
  const body = [];
  body.push(`+${line('-')}+`);
  body.push(`| ${trace.label.padEnd(width - 1)}|`);
  body.push(`| ${trace.statement.padEnd(width - 1)}|`);
  body.push(`+${line('-')}+`);
  steps.forEach((step, index) => {
    const prefix = `${String(index + 1).padStart(2, '0')} [${glyph(step.status)}] ${step.label}`;
    body.push(`| ${prefix.padEnd(width - 1)}|`);
    body.push(`|    ${step.statement.slice(0, width - 6).padEnd(width - 5)}|`);
    body.push(`|    stato=${step.statusLabel}; produttore=${step.producer}`.padEnd(width + 1) + '|');
    if (index < steps.length - 1) body.push(`| ${'|'.padStart(5)}${''.padEnd(width - 6)}|`);
  });
  body.push(`+${line('-')}+`);
  body.push(`Limiti: ${trace.limitations.join(' | ')}`);
  body.push(`Receipt head: ${trace.receiptRef || 'non disponibile'}`);
  return body.join('\n');
};

const index = [];
for (const trace of state.views.traceCards) {
  const content = render(trace);
  const fileName = `${trace.id}.txt`;
  await writeFile(path.join(outDir, fileName), `${content}\n`, 'utf8');
  index.push({ id: trace.id, file: `artifacts/ascii/${fileName}`, epistemicStatus: trace.epistemicStatus, receiptRef: trace.receiptRef });
}
await writeFile(path.join(outDir, 'index.json'), JSON.stringify({ generatedAt: new Date().toISOString(), source: 'buildState().views.traceCards', traces: index }, null, 2));
console.log(`ascii-export: ok (${index.length} runtime traces)`);
