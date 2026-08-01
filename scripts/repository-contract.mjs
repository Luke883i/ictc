import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const required = [
  'README.md','AGENTS.md','CONTRIBUTING.md','SECURITY.md','SUPPORT.md','CODE_OF_CONDUCT.md','CHANGELOG.md','CODEOWNERS','ictc.sh',
  '.github/CODEOWNERS','.editorconfig','.nvmrc','package.json','package-lock.json',
  'docs/README.md','docs/DEVELOPMENT.md','docs/TESTING.md','docs/CONFIGURATION.md','docs/DATA_AND_STORAGE.md','docs/OPERATIONS.md','docs/ACCESSIBILITY.md','docs/RUNTIME_AUDIT.md','docs/RELEASE.md','docs/ROADMAP.md','docs/ENGINEERING_GOVERNANCE.md','docs/DECISION_RECORDS.md','docs/authority-matrix.yaml','docs/openapi.yaml',
  'docs/00_PROMPT_CLARIFICATION.md','docs/02_EPISTEMIC_CONTRACT.md','docs/04_USER_JOURNEYS.md','docs/19_DELIVERY_REPORT.md','docs/21_DESIGN_SYSTEM.md','docs/23_VALIDATION_REPORT_V2.md','docs/24_BLUEPRINT_V2_ITALIANO.md','docs/22_ASCII_RUNTIME_POC.md','docs/ui-wiring-manifest.json',
  'docs/CORE_UI_COPY_AUDIT.md','docs/CORE_UI_DESIGN.md','docs/CORE_UI_DOD.md',
  'schemas/outcome-envelope.schema.json','schemas/trace-view.schema.json','schemas/source-record.schema.json','schemas/scout-job.schema.json','schemas/finding.schema.json','schemas/matter.schema.json','schemas/receipt.schema.json','schemas/audit-event.schema.json','schemas/ui-wiring-manifest.schema.json','schemas/visual-attestation.schema.json','schemas/core-workspaces.schema.json','schemas/core-ui.schema.json',
  '.github/workflows/ci.yml','.github/workflows/visual.yml','.github/workflows/security.yml','.github/workflows/core-ui.yml','.github/pull_request_template.md','.github/dependabot.yml',
  'app/index.html','app/styles.css','app/app.js','server.mjs','lib/domain.mjs',
  'scripts/runtime-audit.mjs','scripts/accessibility-audit.mjs','scripts/docs-audit.mjs',
  'v3/core-workspaces.json','v3/core-ui.json','v3/lib/monitoring-runtime.mjs','v3/mock-monitoring-provider.mjs','v3/journey-shell-audit.mjs','v3/journey-accessibility-audit.mjs','v3/core-copy-audit.mjs','v3/journey-runtime-check.mjs','v3/journey-saturation.mjs','v3/journey-browser-check.py','v3/public/core-workspaces.json','v3/public/js/journey-model.js','v3/public/js/journey-shell.js','v3/public/js/journey-shell-common.js','v3/public/js/journey-shell-render.js','v3/public/js/journey-shell-actions.js'
];
for (const file of required) await access(path.join(root, file));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
for (const script of ['contract','schema:check','labels:check','epistemic:check','wiring:check','verify','e2e','visual','visual:ux','git:handshake','release:manifest','ascii:export','trace:preview','audit:runtime','audit:a11y','audit:docs','audit:ux:core','audit:ux:journey','audit','test']) {
  if (!pkg.scripts?.[script]) throw new Error(`Missing npm script: ${script}`);
}
for (const file of required) {
  const size = (await stat(path.join(root, file))).size;
  if (size === 0 && !file.endsWith('.gitkeep')) throw new Error(`Empty required file: ${file}`);
}
console.log(`repository-contract: ok (${required.length} required files)`);
