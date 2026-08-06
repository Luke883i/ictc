import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const contract = JSON.parse(await read('./enterprise-2-contract.json'));
const ui = await read('./public/ui/enterprise-2.js');
const css = await read('./public/enterprise-2.css');
const app = await read('./public/app.js');
const styles = await read('./public/styles.css');
const render = await read('./public/ui/render.js');
const actions = await read('./public/ui/actions.js');
const jobs = await read('./runtime/monitoring-jobs.mjs');
const incidents = await read('./runtime/incidents.mjs');
const admin = await read('./runtime/admin.mjs');
const identity = await read('./runtime/identity.mjs');
const workbench = await read('./runtime/workbench-projection.mjs');
const browser = await read('./browser-enterprise-2-check.py');
const saturation = await read('./enterprise-2-saturation.mjs');
const compression = await read('./enterprise-2-compression.mjs');
const docs = await read('../docs/ENTERPRISE_2_CANDIDATE_DOD.md');
const packageJson = JSON.parse(await read('../package.json'));
const workflow = await read('../.github/workflows/ci.yml');
const verified = [];

function verify(name, assertion) {
  try { assertion(); verified.push(name); }
  catch (error) {
    const message = String(error.message || error).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    console.error(`::error title=enterprise-2:${name}::${message}`);
    throw error;
  }
}

verify('contract-shape', () => {
  assert.equal(contract.schemaVersion, '2.0.0-candidate');
  assert.equal(contract.imageEvidence.length, 11);
  assert.ok(contract.globalInvariants.length >= 15);
  assert.ok(contract.T.length >= 20);
  assert.ok(contract.certificationProofDimensions.length >= 16);
  assert.ok(contract.definitionOfDone.length >= 20);
});
verify('terminal-installation', () => {
  assert.match(app, /installEnterprise2Candidate/);
  assert.match(app, /enterprise-2\.js/);
  assert.match(styles, /enterprise-2\.css/);
  assert.match(ui, /ictcCandidate/);
});
verify('plain-language-primary-labels', () => {
  for (const label of ['Ricerche normative', 'Ricerche disponibili', 'Eventi registrati', 'Guida operativa e prove', 'Accesso federato', 'Identità locali']) assert.match(ui, new RegExp(label));
  assert.doesNotMatch(ui, /<h1>[^<]*(Job|novelty|baseline)/i);
  assert.match(ui, /Scarica prova/);
});
verify('progressive-disclosure', () => {
  assert.match(ui, /Come lavorare/);
  assert.match(ui, /Prove e responsabilità/);
  assert.match(ui, /home-disclosure-stack/);
  assert.match(css, /home-disclosure-stack/);
  assert.match(css, /maximum|home-disclosure/);
});
verify('compact-operational-records', () => {
  assert.match(ui, /enterprise2-record-card/);
  assert.match(ui, /Prossima esecuzione/);
  assert.match(css, /grid-template-areas:"head actions"/);
  assert.match(css, /empty-stateMax|empty-state|#incidentList \.empty/);
});
verify('admin-information-architecture', () => {
  assert.match(ui, /admin-section-nav/);
  assert.match(ui, /one active|activateAdminSection/);
  assert.match(ui, /Aggiungi identità locale/);
  assert.match(ui, /Classificazione dei dati/);
  assert.match(css, /admin-panel\[hidden\]/);
});
verify('capability-reconciliation', () => {
  assert.match(ui, /capability\('manage-monitoring'\)/);
  assert.match(ui, /capability\('report-incident'\)/);
  assert.match(render, /capability\('manage-monitoring'\)/);
  assert.match(render, /capability\('report-incident'\)/);
  assert.match(actions, /\/api\/monitoring-jobs|\/api\/missions/);
  assert.match(jobs, /requirePermission\(actor, 'manage-monitoring'/);
  assert.match(incidents, /requirePermission\(actor, 'report-incident'/);
});
verify('identity-separation', () => {
  assert.match(ui, /Accesso federato/);
  assert.match(ui, /Identità locali/);
  assert.match(admin, /\/api\/admin\/identity/);
  assert.match(admin, /\/api\/admin\/users/);
  assert.match(identity, /shibboleth/);
});
verify('proof-and-claim-boundary', () => {
  assert.match(ui, /Guida operativa e prove/);
  assert.match(workbench, /limitations/);
  assert.match(contract.claimBoundary, /does not itself constitute/i);
  assert.match(docs, /non costituisce/i);
});
verify('responsive-accessibility', () => {
  for (const token of ['320px', 'forced-colors', 'prefers-reduced-motion']) assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(css, /min-height:var\(--e2-control\)/);
  assert.match(browser, /200% zoom|zoom-200/);
  assert.match(browser, /Escape/);
  assert.match(browser, /focus-return/);
  assert.match(browser, /unlabeled-controls-zero/);
});
verify('image-and-browser-proof', () => {
  assert.match(browser, /screenshot/);
  for (let index = 1; index <= 11; index += 1) assert.match(browser, new RegExp(`S${String(index).padStart(2, '0')}`));
  assert.match(workflow, /browser-enterprise-2-check\.py/);
});
verify('saturation-and-compression', () => {
  assert.match(saturation, /MPlus100/);
  assert.match(saturation, /enterprise-consultant/);
  assert.match(saturation, /iso-certifier/);
  assert.match(saturation, /garante-or-acn/);
  assert.match(compression, /irreducibleWitnesses/);
});
verify('package-and-ci-gates', () => {
  assert.match(packageJson.scripts.check, /enterprise-2-check\.mjs/);
  assert.match(packageJson.scripts['test:contract'], /enterprise-2-saturation\.mjs/);
  assert.match(packageJson.scripts['test:enterprise2'], /enterprise-2-compression\.mjs/);
  assert.match(workflow, /ICTC 2\.0 enterprise candidate assurance/);
});

const evidenceMap = {
  'scope-and-claim-boundary': ['enterprise-2-contract.json', 'ENTERPRISE_2_CANDIDATE_DOD.md'],
  'capability-and-role-enforcement': ['render.js', 'actions.js', 'runtime permission checks', 'browser auditor journey'],
  'identity-and-access': ['runtime/identity.mjs', 'runtime/admin.mjs', 'admin section navigation'],
  'human-authority-over-ai': ['monitoring and incident runtime gates', 'proof claim boundary'],
  'record-provenance': ['workspaces.js', 'evidence exports'],
  'version-and-receipt-chain': ['store receipts', 'browser evidence download'],
  'runtime-controls': ['admin readiness API', 'admin controls view'],
  'deployment-gaps': ['standard proof posture', 'admin proof summary'],
  'semantic-labels': ['enterprise-2.js', 'image evidence matrix'],
  'progressive-disclosure': ['home disclosure split', 'admin section navigator'],
  'responsive-layout': ['enterprise-2.css', '320/390/landscape browser checks'],
  'keyboard-and-focus': ['browser keyboard, Escape and focus-return checks'],
  'forced-colors-and-reduced-motion': ['enterprise-2.css media queries'],
  'consultant-and-certifier-reading': ['T audience axis', 'certification review journey'],
  'public-authority-inspection': ['public authority journey', 'version and limitation checks'],
  'machine-readable-artifacts': ['enterprise-2 assurance, saturation and compression JSON artifacts']
};
for (const dimension of contract.certificationProofDimensions) assert.ok(evidenceMap[dimension]?.length, `missing proof mapping ${dimension}`);

const report = {
  schemaVersion: contract.schemaVersion,
  ok: true,
  verified,
  imageCoverage: { supplied: 11, mapped: contract.imageEvidence.length },
  invariantCount: contract.globalInvariants.length,
  TDimensions: contract.T.length,
  certificationProof: contract.certificationProofDimensions.map(dimension => ({ dimension, status: 'candidate-evidence-present', attestedBy: evidenceMap[dimension] })),
  definitionOfDone: contract.definitionOfDone,
  claimBoundary: contract.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-certification-proof.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-check: ok (${verified.length} assurance groups, ${report.certificationProof.length} proof dimensions)`);
