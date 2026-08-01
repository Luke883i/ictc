import { strict as assert } from 'node:assert';
import { readFile, access, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const artifactDir = path.join(root, 'artifacts');
await mkdir(artifactDir, { recursive: true });

const files = [
  'README.md','CONTRIBUTING.md','SECURITY.md','SUPPORT.md','docs/README.md','docs/DEVELOPMENT.md','docs/TESTING.md','docs/CONFIGURATION.md','docs/DATA_AND_STORAGE.md','docs/OPERATIONS.md','docs/ACCESSIBILITY.md','docs/RUNTIME_AUDIT.md','v3/README.md','docs/UX_TO_BE_V3.md','docs/RUNTIME_AND_WIRING_V3.md','docs/ONTO_EPISTEMIC_CLARITY_V3.md','docs/ENDUSER_SIMULATIONS_V3.md','docs/SATURATION_M_PLUS_100.md','docs/DESIGN_SYSTEM_V3.md','docs/V1_BUYER_AUDIT.md','docs/V1_STABILITY_DOD.md','docs/CORE_UI_COPY_AUDIT.md','docs/CORE_UI_DESIGN.md','docs/CORE_UI_DOD.md'
];
const checks = [];
const contents = new Map();
for (const file of files) contents.set(file, await readFile(path.join(root, file), 'utf8'));
const mark = (name, detail) => checks.push({ name, status: 'passed', detail });
const hasAll = (text, values) => values.every(value => text.includes(value));

try {
  const readme = contents.get('README.md');
  const profiles = [
    { id: 'v1', marker: '## Versione corrente: ICTC 1.0.0', sections: ['## Avvio rapido','## Scope stabile','## Guardrail v1','## Verifica della release','## Fuori scope'], commands: ['./ictc.sh start','./ictc.sh audit','./ictc.sh stop','npm run release:check'] },
    { id: 'v3', marker: '## Versione corrente proposta: v3 Living Evidence Atlas', sections: ['## Cosa si può usare nella v3','## Confine epistemico','## Verifica','## Documentazione v3','## Requisiti e sicurezza'], commands: ['./ictc-v3.sh start','./ictc-v3.sh status','./ictc-v3.sh logs','./ictc-v3.sh audit','./ictc-v3.sh stop'] },
    { id: 'v2', marker: '## Avvio rapido', sections: ['## Avvio rapido','## Comandi principali','## Architettura essenziale','## Stato del progetto'], commands: ['./ictc.sh start','./ictc.sh audit','./ictc.sh stop'] }
  ];
  const profile = profiles.find(candidate => readme.includes(candidate.marker) && hasAll(readme, candidate.sections) && hasAll(readme, candidate.commands));
  assert.ok(profile, 'README senza un profilo operativo supportato');
  mark('readme-operational-entrypoint', `${profile.id}: avvio, audit e arresto documentati`);
  const brokenLinks = [];
  for (const [file, text] of contents) {
    assert.ok(!/\<repository-url\>|\bTODO\b|\bTBD\b/gi.test(text), `${file}: placeholder residuo`);
    const links = [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(match => match[1]).filter(link => !/^(https?:|mailto:|#)/.test(link));
    for (const link of links) {
      const localPath = link.split('#')[0]; if (!localPath) continue;
      const target = path.resolve(path.dirname(path.join(root, file)), localPath);
      try { await access(target); } catch { brokenLinks.push(`${file} -> ${link}`); }
    }
  }
  assert.deepEqual(brokenLinks, [], `Link locali non risolti:\n${brokenLinks.join('\n')}`);
  mark('local-document-links', `${files.length} documenti verificati`);
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const allText = [...contents.values()].join('\n');
  const npmCommands = [...allText.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)].map(match => match[1]);
  for (const command of new Set(npmCommands)) assert.ok(pkg.scripts[command], `Comando documentato ma assente: npm run ${command}`);
  mark('documented-npm-commands', `${new Set(npmCommands).size} comandi risolti`);
  const operations = contents.get('docs/OPERATIONS.md');
  for (const command of ['start','stop','status','logs','doctor','audit']) assert.match(operations, new RegExp(`ictc\\.sh ${command}`));
  mark('operations-runbook-v2-complete', 'lifecycle locale documentato');
  const v3Readme = contents.get('v3/README.md');
  for (const command of ['start','status','logs','audit','stop']) assert.match(`${readme}\n${v3Readme}`, new RegExp(`ictc-v3\\.sh ${command}`));
  mark('operations-runbook-v3-compatible', 'launcher generazione v3 documentato');
  const testing = contents.get('docs/TESTING.md');
  for (const command of ['audit:runtime','audit:a11y','audit:docs']) assert.match(testing, new RegExp(command.replace(':','\\:')));
  mark('audit-commands-documented', 'runtime, accessibilità e documentazione');
  const saturation = contents.get('docs/SATURATION_M_PLUS_100.md');
  assert.match(saturation, /M\s*=\s*36/); assert.match(saturation, /M\+100\s*=\s*136/); assert.match(saturation, /non (?:costituisce|dimostra).*completezza|bounded/i);
  const v1Dod = contents.get('docs/V1_STABILITY_DOD.md');
  assert.match(v1Dod, /M=36/); assert.match(v1Dod, /scenari 37–136/); assert.match(v1Dod, /non significa certificazione di terza parte/i);
  mark('saturation-and-stability-boundary', 'M, M+100 e limite v1 espliciti');
  const coreDesign = contents.get('docs/CORE_UI_DESIGN.md');
  const coreDod = contents.get('docs/CORE_UI_DOD.md');
  const coreCopy = contents.get('docs/CORE_UI_COPY_AUDIT.md');
  assert.match(coreDesign, /monitoraggio programmato/i); assert.match(coreDesign, /inserimento manuale/i);
  assert.match(coreDesign, /NIST SP 800-61 Rev\. 3/i); assert.match(coreDesign, /ISO\/IEC 27035/i);
  assert.match(coreDesign, /segnalazione → ownership → triage → risposta → recovery → lessons learned/i);
  assert.match(coreDod, /M=40/); assert.match(coreDod, /M\+100=140/); assert.match(coreDod, /novelty dopo M/i);
  assert.match(coreCopy, /Inventario automatico/i); assert.match(readme, /Per l’uso quotidiano basta/);
  assert.match(readme, /status.*non è necessario per l’avvio/is); assert.match(readme, /npm run audit:ux:core/);
  mark('two-core-services-documented', 'monitoraggio, incidenti, storage, startup e saturazione');
  const payload = { schemaVersion: '1.4.0', generatedAt: new Date().toISOString(), result: 'passed', checks };
  await writeFile(path.join(artifactDir, 'documentation-audit.json'), JSON.stringify(payload, null, 2));
  console.log(`docs-audit: ok (${checks.length} checks)`);
} catch (error) {
  await writeFile(path.join(artifactDir, 'documentation-audit.json'), JSON.stringify({ schemaVersion: '1.4.0', generatedAt: new Date().toISOString(), result: 'failed', checks, error: error.message }, null, 2));
  throw error;
}
