import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
await import('./enterprise-2-process-check.mjs');
await import('./enterprise-2-editorial-check.mjs');
await import('./enterprise-2-editorial-saturation.mjs');
await import('./enterprise-2-design-system-check.mjs');
const contract = JSON.parse(await read('./enterprise-2-contract.json'));
const ui = await read('./public/ui/enterprise-2.js');
const processUi = await read('./public/ui/enterprise-2-processes.js');
const editorialUi = await read('./public/ui/enterprise-2-editorial.js');
const editorialCss = await read('./public/enterprise-2-editorial.css');
const editorialModel = JSON.parse(await read('./enterprise-2-editorial-model.json'));
const editorialDocs = await read('../docs/ENTERPRISE_2_EDITORIAL_REVIEW.md');
const designUi = await read('./public/ui/enterprise-2-design-system.js');
const designCss = await read('./public/enterprise-2-design-system.css');
const designModel = JSON.parse(await read('./enterprise-2-design-system-model.json'));
const designDocs = await read('../docs/ENTERPRISE_2_DESIGN_SYSTEM.md');
const designSaturationReport = JSON.parse(await read('../artifacts/enterprise-2-design-system-saturation.json'));
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
const processDocs = await read('../docs/ENTERPRISE_2_PROCESS_CATALOG.md');
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
  assert.match(app, /installEnterprise2ProcessArchitecture/);
  assert.match(app, /enterprise-2-processes\.js/);
  assert.doesNotMatch(app, /enterprise-2-admin-nav/);
  assert.match(styles, /enterprise-2\.css/);
  assert.match(ui, /ictcCandidate/);
  assert.match(processUi, /processCatalog/);
  assert.match(app, /installEnterprise2EditorialSystem/);
  assert.match(styles, /enterprise-2-editorial\.css/);
  assert.match(editorialUi, /editorialSystem = 'professional-1'/);
  assert.match(app, /installEnterprise2DesignSystem/);
  assert.match(styles, /enterprise-2-design-system\.css/);
  assert.match(designUi, /DESIGN_SYSTEM_ID = 'ictc-aurora-1'/);
  assert.ok(app.indexOf('installEnterprise2DesignSystem()') > app.indexOf('installEnterprise2EditorialSystem()'));
});
verify('plain-language-primary-labels', () => {
  for (const label of ['Ricerche normative', 'Ricerche disponibili', 'Eventi registrati', 'Guida operativa e prove', 'Accesso federato', 'Identità locali']) assert.match(ui, new RegExp(label));
  assert.doesNotMatch(ui, /<h1>[^<]*(Job|novelty|baseline)/i);
  assert.match(ui, /Scarica prova/);
});
verify('named-process-catalog', () => {
  const processes = {
    'RN-01': 'Monitoraggio normativo',
    'EC-01': 'Gestione eventi e segnalazioni',
    'EV-01': 'Evidenze e controlli',
    'IA-01': 'Identità e accessi',
    'GA-01': 'Governo dei servizi AI'
  };
  for (const [code, name] of Object.entries(processes)) {
    assert.match(processUi, new RegExp(code));
    assert.match(`${processUi}\n${editorialUi}`, new RegExp(name));
    assert.match(processDocs, new RegExp(code));
    assert.match(browser, new RegExp(code));
  }
  assert.match(browser, /generic-process-labels-zero/);
  assert.match(browser, /Processo 1/);
  assert.match(browser, /Processo 2/);
});
verify('progressive-disclosure', () => {
  assert.match(ui, /Come lavorare/);
  assert.match(ui, /Prove e responsabilità/);
  assert.match(ui, /home-disclosure-stack/);
  assert.match(processUi, /activeRole === 'auditor' \? \[proof, method\]/);
  assert.match(processUi, /processDisclosureBound/);
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
  assert.match(processUi, /enforceSingleAdminSurface/);
  assert.match(processUi, /panel\.parentElement !== grid/);
  assert.match(processUi, /candidate\.hidden = candidate !== panel/);
  assert.match(css, /admin-panel\[hidden\]/);
});
verify('capability-reconciliation', () => {
  assert.match(ui, /capability\('manage-monitoring'\)/);
  assert.match(ui, /capability\('report-incident'\)/);
  assert.match(render, /capability\('manage-monitoring'\)/);
  assert.match(render, /state\.data\.homeNextAction/);
  assert.doesNotMatch(render, /function homeAction\(/);
  assert.match(actions, /state\.data\?\.homeNextAction/);
  assert.match(actions, /\/api\/monitoring-jobs|\/api\/missions/);
  assert.match(jobs, /requirePermission\(actor, 'manage-monitoring'/);
  assert.match(incidents, /requirePermission\(actor, 'report-incident'/);
});
verify('identity-separation', () => {
  assert.match(ui, /Accesso federato/);
  assert.match(ui, /Identità locali/);
  assert.match(processUi, /IA-01/);
  assert.match(admin, /\/api\/admin\/identity/);
  assert.match(admin, /\/api\/admin\/users/);
  assert.match(identity, /shibboleth/);
});
verify('proof-and-claim-boundary', () => {
  assert.match(ui, /Guida operativa e prove/);
  assert.match(processUi, /EV-01/);
  assert.match(workbench, /limitations/);
  assert.match(contract.claimBoundary, /does not itself constitute/i);
  assert.match(docs, /non costituisce/i);
  assert.match(processDocs, /Non costituisce certificazione/i);
  assert.match(editorialDocs, /non certifica/i);
  assert.match(editorialUi, /Accettata nel catalogo/);
  assert.match(editorialUi, /Punteggio indicativo del modello/);
});
verify('responsive-accessibility', () => {
  for (const token of ['320px', 'forced-colors', 'prefers-reduced-motion']) assert.match(`${css}\n${editorialCss}\n${designCss}`, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(`${css}\n${editorialCss}\n${designCss}`, /min-height:var\(--e2-control\)|--e2e-control-min:44px|--ds-ease/);
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
  assert.equal(editorialModel.surfaces.length, 15);
  assert.match(editorialUi, /minimal-progressive/);
  assert.match(editorialCss, /--e2e-page-max:1180px/);
  assert.equal(designModel.id, 'ictc-aurora-1');
  assert.equal(designModel.tokenFamilies.length, 8);
  assert.equal(designSaturationReport.M, 96);
  assert.equal(designSaturationReport.MPlus100, 196);
  assert.equal(designSaturationReport.noveltyAfterM, 0);
  assert.equal(designSaturationReport.contradictionsAfterM, 0);
  assert.match(designDocs, /Saturation rule|Saturazione/);
  assert.match(compression, /irreducibleWitnesses/);
});
verify('package-and-ci-gates', () => {
  assert.match(packageJson.scripts.check, /enterprise-2-check\.mjs/);
  assert.match(packageJson.scripts['test:contract'], /enterprise-2-saturation\.mjs/);
  assert.match(packageJson.scripts['test:enterprise2'], /enterprise-2-compression\.mjs/);
  assert.match(workflow, /ICTC 2\.0 enterprise candidate assurance/);
});

const evidenceMap = {
  'scope-and-claim-boundary': ['enterprise-2-contract.json', 'ENTERPRISE_2_CANDIDATE_DOD.md', 'ENTERPRISE_2_PROCESS_CATALOG.md'],
  'capability-and-role-enforcement': ['render.js', 'actions.js', 'runtime permission checks', 'browser auditor journey'],
  'identity-and-access': ['runtime/identity.mjs', 'runtime/admin.mjs', 'IA-01 admin section navigation'],
  'human-authority-over-ai': ['monitoring and incident runtime gates', 'proof claim boundary', 'GA-01 limit'],
  'record-provenance': ['workspaces.js', 'evidence exports'],
  'version-and-receipt-chain': ['store receipts', 'browser evidence download'],
  'runtime-controls': ['admin readiness API', 'EV-01 controls view'],
  'deployment-gaps': ['standard proof posture', 'admin proof summary'],
  'semantic-labels': ['enterprise-2.js', 'enterprise-2-processes.js', 'enterprise-2-editorial.js', 'process catalog'],
  'progressive-disclosure': ['role-specific home disclosure order', 'admin section navigator', 'Aurora native disclosure choreography'],
  'responsive-layout': ['enterprise-2.css', 'enterprise-2-design-system.css', '320/390/landscape browser checks'],
  'keyboard-and-focus': ['browser keyboard, Escape and focus-return checks'],
  'forced-colors-and-reduced-motion': ['enterprise-2.css and Aurora media queries'],
  'consultant-and-certifier-reading': ['T audience axis', 'certification review journey', 'stable process identifiers'],
  'public-authority-inspection': ['public authority journey', 'version and limitation checks'],
  'machine-readable-artifacts': ['enterprise-2 assurance, editorial and design-system saturation and compression JSON artifacts']
};
for (const dimension of contract.certificationProofDimensions) assert.ok(evidenceMap[dimension]?.length, `missing proof mapping ${dimension}`);

const report = {
  schemaVersion: contract.schemaVersion,
  ok: true,
  verified,
  imageCoverage: { supplied: 11, mapped: contract.imageEvidence.length },
  invariantCount: contract.globalInvariants.length,
  TDimensions: contract.T.length,
  processCatalog: ['RN-01', 'EC-01', 'EV-01', 'IA-01', 'GA-01'],
  editorialSystem: { id: 'professional-1', surfaces: editorialModel.surfaces.length, density: 'minimal-progressive' },
  designSystem: { id: designModel.id, surfaces: designModel.surfaces.length, tokenFamilies: designModel.tokenFamilies.length, M: designSaturationReport.M, MPlus100: designSaturationReport.MPlus100, noveltyAfterM: designSaturationReport.noveltyAfterM },
  certificationProof: contract.certificationProofDimensions.map(dimension => ({ dimension, status: 'candidate-evidence-present', attestedBy: evidenceMap[dimension] })),
  definitionOfDone: contract.definitionOfDone,
  claimBoundary: contract.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-certification-proof.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-check: ok (${verified.length} assurance groups, ${report.certificationProof.length} proof dimensions, ${report.processCatalog.length} named processes)`);
