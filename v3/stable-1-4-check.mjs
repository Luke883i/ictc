import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const contract = JSON.parse(await read('./stable-1-4-contract.json'));
const packageJson = JSON.parse(await read('../package.json'));
const packageLock = JSON.parse(await read('../package-lock.json'));
const claims = JSON.parse(await read('./enterprise-claims.json'));
const saturationArtifact = JSON.parse(await read('./artifacts-enterprise-saturation.json'));
const version = await read('./version.mjs');
const app = await read('./public/app.js');
const styles = await read('./public/styles.css');
const stableModule = await read('./public/ui/stable-1-4-home.js');
const stableCss = await read('./public/stable-1-4.css');
const server = await read('./server.mjs');
const accessProfile = await read('./access-profile.mjs');
const browser = await read('./browser-stable-1-4-check.py');
const readme = await read('../README.md');
const verified = [];

function verify(name, assertion) {
  try {
    assertion();
    verified.push(name);
  } catch (error) {
    const message = String(error.message || error).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
    console.error(`::error title=stable-1-4:${name}::${message}`);
    throw error;
  }
}

verify('contract-shape', () => {
  assert.equal(contract.schemaVersion, '1.4.0');
  assert.equal(contract.release, '1.4.0');
  assert.equal(contract.personas.length, 4);
  assert.equal(contract.auditDimensions.length, 12);
  assert.equal(contract.universalInvariants.length, 12);
  assert.equal(contract.stressScenarios.length, 15);
  assert.equal(contract.saturation.tail, 100);
});
verify('release-identity', () => {
  assert.equal(packageJson.version, '1.4.0');
  assert.equal(packageLock.version, '1.4.0');
  assert.equal(packageLock.packages[''].version, '1.4.0');
  assert.equal(claims.release, '1.4.0');
  assert.equal(saturationArtifact.release, '1.4.0');
  assert.match(version, /VERSION = '1\.4\.0'/);
  assert.match(readme, /Release `1\.4\.0`/);
});
verify('runtime-installation', () => {
  assert.match(app, /installStable14Experience/);
  assert.match(styles, /stable-1-4\.css/);
  assert.match(server, /accessProfileFor\(actor\)/);
  assert.match(server, /projected\.accessProfile/);
  assert.match(server, /1\.4-stable/);
});
verify('server-issued-authority', () => {
  for (const role of ['admin', 'user', 'auditor']) assert.match(accessProfile, new RegExp(`${role}: Object\\.freeze`));
  for (const mode of ['read-write', 'contribute', 'read-only']) assert.match(accessProfile, new RegExp(mode));
  assert.match(accessProfile, /authoritySource: 'server-issued'/);
  assert.match(accessProfile, /capabilities: \[\.\.\.new Set\(actor\.permissions/);
});
verify('authority-questions', () => {
  for (const id of ['homeAuthorityIdentity', 'homeAuthorityCan', 'homeAuthorityCannot', 'homeAuthorityEffects', 'homeAuthorityEvidence']) {
    assert.match(stableModule, new RegExp(`id=\\"${id}\\"`), `missing ${id}`);
  }
  for (const phrase of ['Identità attiva', 'Puoi', 'Non puoi', 'Effetti', 'Tracce disponibili']) assert.match(stableModule, new RegExp(phrase));
  assert.match(stableModule, /actor\.role === 'auditor'\) authority\.open = true/);
});
verify('plain-language-ontology', () => {
  assert.match(stableModule, /Aggiungi materiale/);
  assert.match(stableModule, /Fascicoli evento/);
  assert.doesNotMatch(stableModule, /Aggiungi una fonte/);
  assert.match(stableModule, /Ruolo attivo/);
  assert.match(stableModule, /Decisioni, fonti ed eventi/);
});
verify('compact-accessible-geometry', () => {
  assert.match(stableCss, /min-height:220px/);
  assert.match(stableCss, /min-height:44px/);
  assert.match(stableCss, /min-height:60px/);
  assert.match(stableCss, /min-height:54px/);
  assert.doesNotMatch(stableCss, /box-shadow/);
  assert.equal(contract.metrics.maxDesktopDecisionHeightPx, 330);
  assert.equal(contract.metrics.minimumInteractiveTargetPx, 44);
});
verify('browser-assurance', () => {
  for (const role of ['admin', 'user', 'auditor']) assert.match(browser, new RegExp(role));
  assert.match(browser, /decision_box\['height'\] <= 330/);
  assert.match(browser, /homeAuthority/);
  assert.match(browser, /authoritySource/);
  assert.match(browser, /Sola lettura/);
});
verify('honest-boundary', () => {
  assert.match(contract.claimBoundary, /No legal opinion/);
  assert.match(accessProfile, /non verità o conformità sostanziale/);
  assert.match(stableModule, /autorità emessa dal server/);
});

const report = {
  schemaVersion: '1.4.0',
  release: '1.4.0',
  model: contract.model,
  ok: true,
  metrics: contract.metrics,
  saturation: contract.saturation,
  verified,
  limitations: [contract.claimBoundary]
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/stable-1-4-audit.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`stable-1-4-check: ok (${verified.length} contract groups)`);
