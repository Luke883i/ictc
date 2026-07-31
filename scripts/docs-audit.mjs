import { strict as assert } from 'node:assert';
import { readFile, access, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const artifactDir = path.join(root, 'artifacts');
await mkdir(artifactDir, { recursive: true });
const files = [
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'docs/README.md',
  'docs/DEVELOPMENT.md',
  'docs/TESTING.md',
  'docs/CONFIGURATION.md',
  'docs/DATA_AND_STORAGE.md',
  'docs/OPERATIONS.md',
  'docs/ACCESSIBILITY.md',
  'docs/RUNTIME_AUDIT.md'
];
const checks = [];
const contents = new Map();
for (const file of files) contents.set(file, await readFile(path.join(root, file), 'utf8'));

function mark(name, detail) { checks.push({ name, status: 'passed', detail }); }

try {
  const readme = contents.get('README.md');
  for (const heading of ['## Avvio rapido', '## Comandi principali', '## Architettura essenziale', '## Stato del progetto']) {
    assert.ok(readme.includes(heading), `README senza sezione ${heading}`);
  }
  assert.match(readme, /\.\/ictc\.sh start/);
  assert.match(readme, /\.\/ictc\.sh audit/);
  mark('readme-operational-entrypoint', 'start e audit documentati');

  for (const [file, text] of contents) {
    assert.ok(!/\<repository-url\>|\bTODO\b|\bTBD\b/gi.test(text), `${file}: placeholder residuo`);
    const links = [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
      .map(match => match[1])
      .filter(link => !/^(https?:|mailto:|#)/.test(link));
    for (const link of links) {
      const target = path.resolve(path.dirname(path.join(root, file)), link.split('#')[0]);
      await access(target);
    }
  }
  mark('local-document-links', `${files.length} documenti verificati`);

  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const allText = [...contents.values()].join('\n');
  const npmCommands = [...allText.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)].map(match => match[1]);
  for (const command of new Set(npmCommands)) assert.ok(pkg.scripts[command], `Comando documentato ma assente: npm run ${command}`);
  mark('documented-npm-commands', `${new Set(npmCommands).size} comandi risolti`);

  const operations = contents.get('docs/OPERATIONS.md');
  for (const command of ['start', 'stop', 'status', 'logs', 'doctor', 'audit']) {
    assert.match(operations, new RegExp(`ictc\\.sh ${command}`));
  }
  mark('operations-runbook-complete', 'lifecycle locale documentato');

  const testing = contents.get('docs/TESTING.md');
  for (const command of ['audit:runtime', 'audit:a11y', 'audit:docs']) {
    assert.match(testing, new RegExp(command.replace(':', '\\:')));
  }
  mark('audit-commands-documented', 'runtime, accessibilità e documentazione');

  const payload = { schemaVersion: '1.0.0', generatedAt: new Date().toISOString(), result: 'passed', checks };
  await writeFile(path.join(artifactDir, 'documentation-audit.json'), JSON.stringify(payload, null, 2));
  console.log(`docs-audit: ok (${checks.length} checks)`);
} catch (error) {
  await writeFile(path.join(artifactDir, 'documentation-audit.json'), JSON.stringify({
    schemaVersion: '1.0.0', generatedAt: new Date().toISOString(), result: 'failed', checks, error: error.message
  }, null, 2));
  throw error;
}
