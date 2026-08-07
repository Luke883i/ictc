import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { createContributionHandler } from './runtime/contributions.mjs';
import { createMonitoringRuntime } from './runtime/monitoring.mjs';
import { Store } from './store.mjs';

const root = await mkdtemp(path.join(tmpdir(), 'ictc-fi01-reference-'));
const artifacts = new URL('../artifacts/', import.meta.url);
const cases = [];
const record = (id, evidence) => cases.push({ id, status: 'passed', evidence });

function request(method, body = {}, commandId = '') {
  const req = Readable.from([Buffer.from(JSON.stringify(body))]);
  req.method = method;
  req.headers = {
    'content-type': 'application/json',
    'user-agent': 'fi01-reference-check',
    ...(commandId ? { 'x-ictc-command-id': commandId } : {})
  };
  return req;
}
function responseCapture() {
  const result = { status: null, headers: null, body: null };
  return {
    result,
    writeHead(status, headers) { result.status = status; result.headers = headers; },
    end(payload = '') { result.body = payload ? JSON.parse(String(payload)) : null; }
  };
}

const permissions = {
  admin: new Set(['read','manage-monitoring','review-source','contribute-source']),
  user: new Set(['read','contribute-source']),
  auditor: new Set(['read'])
};
const admin = { id: 'fi01-admin', role: 'admin', permissions: [...permissions.admin] };
const user = { id: 'fi01-user', role: 'user', permissions: [...permissions.user] };
const auditor = { id: 'fi01-auditor', role: 'auditor', permissions: [...permissions.auditor] };
const digestV1 = 'a'.repeat(64);
const digestV2 = 'b'.repeat(64);
const inputV1 = {
  title: 'Procedura interna NIS2',
  documentType: 'guideline',
  authority: 'Funzione Compliance',
  jurisdiction: 'Italia',
  identifier: 'INT-NIS2-001',
  publicSourceUrl: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj',
  masterSystem: 'OneTrust',
  masterId: 'DOC-12345',
  masterVersion: '7',
  contentSha256: digestV1,
  referenceUrl: 'https://dms.example.test/documents/DOC-12345/versions/7',
  note: 'Riferimento interno governato; applicabilità da verificare.'
};

try {
  const store = await new Store(root).init();
  const contribution = createContributionHandler({ store, permissions });
  const monitoring = createMonitoringRuntime({ store, permissions, runningMissions: new Set() });

  const createResponse = responseCapture();
  assert.equal(await contribution(request('POST', inputV1, 'fi01-v1'), createResponse, '/api/internal-sources/reference', user), true);
  assert.equal(createResponse.result.status, 201);
  const sourceId = createResponse.result.body.result.id;
  const created = store.snapshot().catalog.find(item => item.id === sourceId);
  assert.ok(created);
  assert.equal(created.state, 'candidate');
  assert.equal(created.origin.kind, 'internal-reference');
  assert.equal(created.internalReference.masterSystem, 'OneTrust');
  assert.equal(created.internalReference.masterId, 'DOC-12345');
  assert.equal(created.internalReference.masterVersion, '7');
  assert.equal(created.internalReference.contentSha256, digestV1);
  assert.equal(created.internalReference.authorityMode, 'external-master');
  assert.equal(created.aiTrace, null);
  assert.equal(createResponse.result.body.receipt.stateSha256, store.verifyChain().canonicalStateSha256);
  record('FI01-01', 'User with contribute-source records an internal master reference directly as a catalog candidate without AI authority.');

  const beforeDuplicate = store.snapshot().revision;
  await assert.rejects(
    contribution(request('POST', inputV1, 'fi01-duplicate'), responseCapture(), '/api/internal-sources/reference', user),
    error => error.code === 'internal-reference-version-exists' && error.status === 409
  );
  assert.equal(store.snapshot().revision, beforeDuplicate);
  record('FI01-02', 'Duplicate master-system/master-id/version is rejected without advancing canonical revision.');

  await assert.rejects(
    contribution(request('POST', inputV1, 'fi01-auditor'), responseCapture(), '/api/internal-sources/reference', auditor),
    error => error.code === 'forbidden' && error.status === 403
  );
  record('FI01-03', 'Auditor cannot create an internal source reference through the runtime handler.');

  const decisionResponse = responseCapture();
  assert.equal(await monitoring.handle(
    request('POST', { decision: 'verified', reason: 'Master ID, versione e digest verificati nel sistema autorevole.' }, 'fi01-decision'),
    decisionResponse,
    `/api/catalog/${sourceId}/decision`,
    admin
  ), true);
  assert.equal(decisionResponse.result.status, 200);
  assert.equal(store.snapshot().catalog.find(item => item.id === sourceId).state, 'verified');
  assert.equal(decisionResponse.result.body.receipt.stateSha256, store.verifyChain().canonicalStateSha256);
  record('FI01-04', 'Existing human catalog decision flow verifies the internal reference with a state-bound receipt.');

  const evidence = store.evidenceBundle('catalog', sourceId, admin);
  assert.ok(evidence);
  assert.equal(evidence.subject.internalReference.masterId, 'DOC-12345');
  assert.equal(evidence.subject.internalReference.contentSha256, digestV1);
  assert.equal(evidence.manifest.stateBoundToAuditHead, true);
  assert.ok(evidence.events.some(event => event.action === 'catalog.internal-reference.recorded'));
  assert.ok(evidence.events.some(event => event.action === 'catalog.source.decided'));
  record('FI01-05', 'Evidence bundle contains master identity, version digest, intake event, human decision and current state/audit binding.');

  const v2 = { ...inputV1, masterVersion: '8', contentSha256: digestV2, referenceUrl: 'https://dms.example.test/documents/DOC-12345/versions/8' };
  const v2Response = responseCapture();
  assert.equal(await contribution(request('POST', v2, 'fi01-v2'), v2Response, '/api/internal-sources/reference', user), true);
  assert.equal(v2Response.result.status, 201);
  assert.notEqual(v2Response.result.body.result.id, sourceId);
  assert.equal(store.snapshot().catalog.filter(item => item.internalReference?.masterId === 'DOC-12345').length, 2);
  assert.equal(store.snapshot().catalog.find(item => item.id === sourceId).state, 'verified');
  assert.equal(store.snapshot().catalog.find(item => item.id === v2Response.result.body.result.id).state, 'candidate');
  record('FI01-06', 'A new master version becomes a new candidate without silently invalidating the previous human decision.');

  const repoRoot = new URL('../', import.meta.url);
  const [app, ui, contributions, openapi, product] = await Promise.all([
    readFile(new URL('public/app.js', repoRoot), 'utf8'),
    readFile(new URL('public/ui/fi01-reference.js', repoRoot), 'utf8'),
    readFile(new URL('runtime/contributions.mjs', repoRoot), 'utf8'),
    readFile(new URL('../docs/openapi.yaml', repoRoot), 'utf8'),
    readFile(new URL('product-contract.json', repoRoot), 'utf8')
  ]);
  assert.ok(app.includes("installFi01Reference"));
  assert.ok(ui.includes('/api/internal-sources/reference'));
  assert.ok(ui.includes('Sistema master'));
  assert.ok(contributions.includes("pathname === '/api/internal-sources/reference'"));
  assert.ok(openapi.includes('/api/internal-sources/reference:'));
  const contract = JSON.parse(product);
  assert.equal(contract.experienceMetrics.internalMasterReferenceCoverage, 1);
  assert.ok(contract.services.find(item => item.id === 'monitoring').primaryJourney.includes('internal-master-reference'));
  record('FI01-07', 'UI wiring, runtime route, OpenAPI declaration and product contract converge on the same FI-01 reference capability.');

  const report = {
    schemaVersion: '1.0.0',
    capability: 'FI-01-REFERENCE',
    result: 'passed',
    caseCount: cases.length,
    cases,
    boundary: {
      canonicalObject: 'catalog',
      masterAuthority: 'external-system',
      aiUsedForIntake: false,
      copiesManagedByThisSlice: false,
      humanDecisionRequiredForVerifiedState: true
    },
    limitations: [
      'This slice registers references and externally supplied SHA-256 digests; it does not ingest or govern document copies.',
      'DMS/OneTrust or the declared external master remains authoritative for the document and its version.',
      'A verified catalog state records a human ICTC decision about the reference; it is not legal applicability or compliance certification.'
    ]
  };
  await mkdir(artifacts, { recursive: true });
  await writeFile(new URL('../artifacts/fi01-reference.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(`fi01-reference-check: ok (cases=${cases.length}, canonical=catalog, master=external)`);
} finally {
  await rm(root, { recursive: true, force: true });
}
