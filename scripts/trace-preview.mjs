import { writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { buildState } from '../lib/domain.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const output = process.argv[2] || path.join(root, 'artifacts', 'screenshots', 'trace-v2.png');
await mkdir(path.dirname(output), { recursive: true });
const state = await buildState();
const trace = state.views.traceCards.find(item => item.id === 'trace-monitoring') || state.views.traceCards[0];
const glyph = status => ({ observed: '.', verified: '=', 'attention-required': '?', 'awaiting-human-review': '?', 'ai-proposed': 'a', 'human-reviewed': 'r', 'human-owned': 'o', unavailable: '-' })[status] || ':';
const steps = trace.data.steps;
const escaped = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const rows = steps.map((step, index) => {
  const y = 260 + index * 88;
  return `<text x="120" y="${y}" font-family="monospace" font-size="20" fill="#dce2de">${String(index+1).padStart(2,'0')} [${glyph(step.status)}] ${escaped(step.label)}</text>
  <text x="160" y="${y+30}" font-family="Arial" font-size="15" fill="#a8b0ab">${escaped(step.statement.slice(0,118))}</text>
  <text x="160" y="${y+54}" font-family="monospace" font-size="12" fill="#7f8983">${escaped(step.statusLabel)} · ${escaped(step.producer)}</text>`;
}).join('\n');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
<rect width="1600" height="1000" fill="#f1f2f0"/>
<rect x="45" y="38" width="1510" height="924" rx="32" fill="#202522"/>
<rect x="45" y="38" width="1510" height="78" rx="32" fill="#282e2a"/>
<circle cx="86" cy="77" r="6" fill="#5d6862"/><circle cx="108" cy="77" r="6" fill="#5d6862"/><circle cx="130" cy="77" r="6" fill="#5d6862"/>
<text x="165" y="85" font-family="Arial" font-size="18" font-weight="700" fill="#eef1ef">ICTC · traccia runtime locale</text>
<text x="90" y="160" font-family="Arial" font-size="13" letter-spacing="2" fill="#8f9993">CATENA DETERMINISTICA</text>
<text x="90" y="205" font-family="Arial" font-size="31" font-weight="700" fill="#f1f3f1">${escaped(trace.label)}</text>
${rows}
<line x1="90" y1="870" x2="1510" y2="870" stroke="#343b37"/>
<text x="90" y="910" font-family="monospace" font-size="12" fill="#929c96">receipt ${escaped(String(trace.receiptRef || 'non disponibile').slice(0,80))}</text>
<text x="90" y="935" font-family="Arial" font-size="12" fill="#7f8983">Stato locale ricostruito. Le fasi non concluse restano esplicitamente non concluse.</text>
</svg>`;
const svgPath = output.replace(/\.png$/i,'.svg');
await writeFile(svgPath, svg);
try { execFileSync('convert', [svgPath, output]); } catch { await writeFile(output, Buffer.from(svg)); }
console.log(`trace-preview: ${output}`);
