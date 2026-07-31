import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const manifest = JSON.parse(await readFile(path.join(root,'docs/ui-wiring-manifest.json'),'utf8'));
const html = await readFile(path.join(root,'app/index.html'),'utf8');
const js = await readFile(path.join(root,'app/app.js'),'utf8');
const server = await readFile(path.join(root,'server.mjs'),'utf8');
const corpus = `${html}\n${js}`;
for (const control of manifest.controls) {
  const token = control.selector.replace(/^#/, '').replace(/^\[|\]$/g,'').split('=')[0];
  if (!corpus.includes(token)) throw new Error(`${control.id}: selector not represented: ${control.selector}`);
  if (!js.includes(control.evidence.split('/')[0])) throw new Error(`${control.id}: handler evidence missing: ${control.evidence}`);
  const apiMatch = control.effect.match(/(GET|POST) (\/api\/[^ ,]+)/);
  if (apiMatch) { const parts = apiMatch[2].split('/').filter(Boolean); const routeToken = parts[1] || parts[0]; if (!server.includes(routeToken)) throw new Error(`${control.id}: server route missing: ${apiMatch[2]}`); }
}
console.log(`ui-wiring-check: ok (${manifest.controls.length} controls)`);
