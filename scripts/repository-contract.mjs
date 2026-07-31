import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const required = [
  'README.md','AGENTS.md','CONTRIBUTING.md','SECURITY.md','SUPPORT.md','CODE_OF_CONDUCT.md','CHANGELOG.md','CODEOWNERS','.github/CODEOWNERS','.editorconfig','.nvmrc','package.json',
  'docs/README.md','docs/DEVELOPMENT.md','docs/TESTING.md','docs/CONFIGURATION.md','docs/DATA_AND_STORAGE.md','docs/OPERATIONS.md','docs/RELEASE.md','docs/ROADMAP.md','docs/ENGINEERING_GOVERNANCE.md','docs/DECISION_RECORDS.md','docs/authority-matrix.yaml','docs/openapi.yaml',
  'docs/00_PROMPT_CLARIFICATION.md','docs/02_EPISTEMIC_CONTRACT.md','docs/04_USER_JOURNEYS.md','docs/19_DELIVERY_REPORT.md','docs/21_DESIGN_SYSTEM.md','docs/23_VALIDATION_REPORT_V2.md','docs/24_BLUEPRINT_V2_ITALIANO.md','docs/22_ASCII_RUNTIME_POC.md','docs/ui-wiring-manifest.json',
  'schemas/outcome-envelope.schema.json','schemas/trace-view.schema.json','schemas/source-record.schema.json','schemas/scout-job.schema.json','schemas/finding.schema.json','schemas/matter.schema.json','schemas/receipt.schema.json','schemas/audit-event.schema.json','schemas/ui-wiring-manifest.schema.json','schemas/visual-attestation.schema.json',
  '.github/workflows/ci.yml','.github/workflows/visual.yml','.github/workflows/security.yml','.github/pull_request_template.md','.github/dependabot.yml','app/index.html','app/styles.css','app/app.js','server.mjs','lib/domain.mjs'
];
for (const file of required) await access(path.join(root, file));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
for (const script of ['contract','schema:check','labels:check','epistemic:check','wiring:check','verify','e2e','visual','git:handshake','release:manifest','ascii:export','trace:preview','test']) {
  if (!pkg.scripts?.[script]) throw new Error(`Missing npm script: ${script}`);
}
for (const file of required) {
  const size = (await stat(path.join(root, file))).size;
  if (size === 0) throw new Error(`Empty required file: ${file}`);
}
console.log(`repository-contract: ok (${required.length} required files)`);
