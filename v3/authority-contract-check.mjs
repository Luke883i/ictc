import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const matrixPath = path.join(root, 'docs', 'authority-matrix.yaml');

function unquote(value) {
  const text = String(value || '').trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1);
  return text;
}

function parseAuthorities(text) {
  const out = {};
  let inSurfaces = false;
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    if (/^surfaces:\s*$/.test(line)) { inSurfaces = true; current = null; continue; }
    if (inSurfaces && /^[^\s]/.test(line)) { inSurfaces = false; current = null; }
    if (!inSurfaces) continue;
    const surface = line.match(/^  ([a-z0-9_]+):\s*$/i);
    if (surface) { current = surface[1]; continue; }
    const authority = line.match(/^    authority:\s*(.+?)\s*$/);
    if (authority && current) out[current] = unquote(authority[1]);
  }
  return out;
}

async function exists(rel) {
  try { await stat(path.join(root, rel.replace(/\/$/, ''))); return true; }
  catch { return false; }
}

const matrixText = await readFile(matrixPath, 'utf8');
const authorities = parseAuthorities(matrixText);
const expected = {
  architecture: 'docs/11_ARCHITECTURE.md',
  api: 'docs/openapi.yaml',
  schemas: 'schemas/',
  runtime_entrypoint: 'v3/server.mjs',
  runtime_domain: 'v3/domain.mjs',
  runtime_state: 'v3/store.mjs',
  runtime_handlers: 'v3/runtime/',
  runtime_enterprise: 'v3/enterprise.mjs',
  runtime_ai: 'v3/ai.mjs',
  public_ui: 'v3/public/',
  launcher: 'ictc.sh',
  package_contract: 'package.json',
  generated_artifacts: 'scripts/'
};
const errors = [];
for (const [surface, expectedPath] of Object.entries(expected)) {
  if (authorities[surface] !== expectedPath) errors.push(`${surface}: expected ${expectedPath}, observed ${authorities[surface] || 'missing'}`);
}
for (const [surface, authority] of Object.entries(authorities)) {
  if (!(await exists(authority))) errors.push(`${surface}: missing authority path ${authority}`);
}
for (const stale of ['lib/domain.mjs', 'server.mjs']) {
  if (Object.values(authorities).includes(stale)) errors.push(`stale runtime authority still declared: ${stale}`);
}

const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (pkg.scripts?.start !== 'node v3/server.mjs') errors.push(`package scripts.start diverges: ${pkg.scripts?.start || 'missing'}`);
const launcher = await readFile(path.join(root, 'ictc.sh'), 'utf8');
if (!/node\s+v3\/server\.mjs/.test(launcher)) errors.push('ictc.sh does not launch v3/server.mjs');

const server = await readFile(path.join(root, 'v3', 'server.mjs'), 'utf8');
for (const requiredImport of ["'./store.mjs'", "'./domain.mjs'", "'./runtime/http.mjs'"]) {
  if (!server.includes(requiredImport)) errors.push(`v3/server.mjs missing canonical import ${requiredImport}`);
}
const store = await readFile(path.join(root, 'v3', 'store.mjs'), 'utf8');
if (!store.includes("path.join(root, 'state.json')")) errors.push('v3/store.mjs state.json SOT boundary not detected');
if (!store.includes('verifyChain()')) errors.push('v3/store.mjs verifyChain boundary not detected');
const integrityBinding = await readFile(path.join(root, 'v3', 'integrity-binding.mjs'), 'utf8');
const currentStateBinding = store.includes('stateSha256: canonicalStateSha256(candidate)') &&
  store.includes('verifyStateIntegrity(persisted)') &&
  integrityBinding.includes("reason: 'state-head-mismatch'") &&
  integrityBinding.includes('current-canonical-state-bound-to-audit-head');
if (!currentStateBinding) errors.push('v3 runtime current-state to audit-head binding not detected');

const agents = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
const architecture = await readFile(path.join(root, 'docs', '11_ARCHITECTURE.md'), 'utf8');
for (const [label, text] of [['AGENTS.md', agents], ['docs/11_ARCHITECTURE.md', architecture]]) {
  for (const forbidden of ['The local ledger is append-only', 'ledger JSONL append-only', 'proiezione ricostruibile']) {
    if (text.includes(forbidden)) errors.push(`${label}: stale integrity claim: ${forbidden}`);
  }
}

const result = {
  schemaVersion: 1,
  check: 'authority-contract',
  ok: errors.length === 0,
  authorities,
  runtime: {
    entrypoint: 'v3/server.mjs',
    domain: 'v3/domain.mjs',
    state: 'v3/store.mjs',
    stateModel: 'mutable-state-json-with-hash-linked-audit',
    canonicalStateAppendOnly: false,
    canonicalStateReconstructibleFromAudit: false,
    canonicalStateBoundToAuditChain: currentStateBinding,
    canonicalStateBindingMode: 'current-head-forward-plus-legacy-checkpoint',
    canonicalStateBindingExcludes: ['audit', 'commandResults']
  },
  errors
};
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts', 'authority-contract-check.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
