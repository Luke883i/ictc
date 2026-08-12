import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const model=JSON.parse(await read('./enterprise-t-model.json'));
const [server,http,store,persistence,enterprise,ai,network,product,packageJson,ci,security,index,render,compactCss,journeyCss,informationArchitecture]=await Promise.all([read('./server.mjs'),read('./runtime/http.mjs'),read('./store.mjs'),read('./sqlite-state-persistence.mjs'),read('./enterprise.mjs'),read('./ai.mjs'),read('./network-policy.mjs'),read('./product-contract.json'),read('../package.json'),read('../.github/workflows/ci.yml'),read('../.github/workflows/security.yml'),read('./public/index.html'),read('./public/ui/render.js'),read('./public/enterprise-compact.css'),read('./public/journey-reborn.css'),read('../docs/06_INFORMATION_ARCHITECTURE.md')]);
const facts={
 canonicalRoleCount:(JSON.parse(product).roles||[]).length,
 safeBindingPolicy:server.includes('assertSafeRuntimeBinding(host)')&&http.includes('unsafe-network-bind'),
 trustedProxySecret:http.includes('ICTC_TRUSTED_PROXY_SECRET')&&http.includes('timingSafeEqual'),
 serverPermissions:http.includes('requirePermission(actor')&&server.includes('projected.capabilities'),
 localJsonStore:store.includes("path.join(root, 'state.json')"),
 processLocalSqliteStore:store.includes('new SqliteStatePersistence(root)')&&persistence.includes("path.join(root,'state.sqlite')"),
 sqliteWalTransactions:persistence.includes('PRAGMA journal_mode=WAL')&&persistence.includes('BEGIN IMMEDIATE')&&persistence.includes('CREATE TABLE IF NOT EXISTS snapshot')&&persistence.includes('CREATE TABLE IF NOT EXISTS audit'),
 fsyncAndRename:store.includes('await handle.sync()')&&store.includes('await rename(tmp, this.statePath)'),
 auditChain:store.includes('previousHash')&&store.includes('verifyChain()'),
 deploymentBlockersExplicit:enterprise.includes("control('durable-storage'")&&enterprise.includes("control('accessibility-audit'"),
 aiTimeoutAndTrace:ai.includes('AbortController')&&ai.includes('promptSha256')&&ai.includes('outputSha256'),
 aiStrictSchemaValidator:/\b(ajv|zod|jsonschema|validateSchema)\b/i.test(ai+packageJson),
 privateNetworkDenied:network.includes('private-ai-endpoint')&&network.includes("redirect: 'manual'"),
 rfc9457Problems:http.includes('application/problem+json'),
 centralizedCsp:/content-security-policy/i.test(http+server),
 rateLimiting:/rate.?limit|token.?bucket|leaky.?bucket/i.test(server+http),
 opentelemetry:/opentelemetry|traceparent/i.test(packageJson+server),
 immutableActionPins:!/uses:\s+[^\s]+@v\d+/g.test(ci+security),
 signedBuildProvenance:false,
 codeqlAlwaysEnabled:!security.includes("vars.ICTC_ENABLE_GHAS == 'true'"),
 singleRoleAwareHome:index.includes('id="homeView"')&&index.includes('id="homePrimaryAction"')&&index.includes('id="homeJourney"'),
 canonicalRoleProjection:render.includes('data-actor-role')||render.includes('dataset.actorRole'),
 compactDensityLayer:compactCss.includes('44px')&&journeyCss.includes('.home-hero'),
 legacyWowVocabulary:product.includes('"wowMechanisms"'),
 legacyFiveSpaceArchitecture:informationArchitecture.includes('cinque spazi')&&informationArchitecture.includes('Presidio')
};
for(const[name,value]of Object.entries({canonicalRoleCount:facts.canonicalRoleCount===3,safeBindingPolicy:facts.safeBindingPolicy,trustedProxySecret:facts.trustedProxySecret,serverPermissions:facts.serverPermissions,processLocalSqliteStore:facts.processLocalSqliteStore,sqliteWalTransactions:facts.sqliteWalTransactions,auditChain:facts.auditChain,deploymentBlockersExplicit:facts.deploymentBlockersExplicit,aiTimeoutAndTrace:facts.aiTimeoutAndTrace,privateNetworkDenied:facts.privateNetworkDenied,singleRoleAwareHome:facts.singleRoleAwareHome,compactDensityLayer:facts.compactDensityLayer}))assert.equal(value,true,name);
const findings=[
 {id:'A01',dimension:'T01',severity:'critical',status:'open-external',statement:'The baseline GitHub API observation reports main as unprotected; repository code cannot enforce review or required checks.'},
 {id:'A02',dimension:'T05',severity:'critical',status:'open',statement:'Persistence is now a transactional process-local SQLite/WAL snapshot plus audit ledger, but cross-process/multi-instance state coordination, HA and restore evidence remain unproven.'},
 {id:'A03',dimension:'T07',severity:'high',status:facts.opentelemetry?'resolved':'open',statement:'No correlated traces, metrics and logs or SLO model is present.'},
 {id:'A04',dimension:'T10',severity:'high',status:facts.signedBuildProvenance?'resolved':'open',statement:'CI actions are pinned to immutable commits, but signed build provenance is not produced and verified by the repository gate.'},
 {id:'A05',dimension:'T10',severity:'medium',status:facts.codeqlAlwaysEnabled?'resolved':'open',statement:'CodeQL is conditional on a repository variable.'},
 {id:'A06',dimension:'T11',severity:'medium',status:facts.rfc9457Problems?'resolved':'open',statement:'API errors do not use RFC 9457 problem details.'},
 {id:'A07',dimension:'T03',severity:'high',status:facts.centralizedCsp?'resolved':'open',statement:'A centralized browser security-header policy is absent.'},
 {id:'A08',dimension:'T03',severity:'high',status:facts.rateLimiting?'resolved':'open',statement:'No request-rate or abuse budget is enforced by the application boundary.'},
 {id:'A09',dimension:'T13',severity:'high',status:facts.aiStrictSchemaValidator?'resolved':'open',statement:'AI output is parsed as JSON but not validated against strict runtime schemas.'},
 {id:'A10',dimension:'T14',severity:'medium',status:facts.legacyWowVocabulary?'open':'resolved',statement:'Legacy promotional vocabulary remains in the canonical product contract.'},
 {id:'A11',dimension:'T15',severity:'medium',status:facts.legacyFiveSpaceArchitecture?'open':'resolved',statement:'The legacy five-space information architecture conflicts with the merged Home/Monitoraggio/Eventi journey.'},
 {id:'A12',dimension:'T16',severity:'low',status:'open',statement:'Compact CSS is additive and split across layers; density budgets are not yet component contracts.'},
 {id:'A13',dimension:'T09',severity:'critical',status:'open-external',statement:'Backup, restore, RTO and RPO are declared blockers rather than implemented controls.'},
 {id:'A14',dimension:'T17',severity:'high',status:'open-external',statement:'Human assistive-technology evidence is absent.'}
];
const openFindings=findings.filter(item=>item.status!=='resolved');
const dimensions=model.dimensions.map(item=>({id:item.id,title:item.title,status:item.status,logicalAudit:item.logicalAudit,technicalAudit:item.technicalAudit,functionalAudit:item.functionalAudit,blockers:item.blockers,standardRefs:item.standardRefs,minimumSlice:item.minimumSlice,findings:findings.filter(f=>f.dimension===item.id).map(f=>f.id)}));
assert.equal(dimensions.length,18);assert.ok(dimensions.every(item=>item.logicalAudit&&item.technicalAudit&&item.functionalAudit));assert.ok(dimensions.every(item=>item.minimumSlice&&item.blockers.length));
const report={schemaVersion:'1.2.0',model:model.model,baselineCommit:model.baselineCommit,verdict:openFindings.some(item=>item.severity==='critical')?'enterprise-materialization-required':'refinement-required',facts,findingCount:findings.length,openFindingCount:openFindings.length,findings,dimensions,minimumRuntimePath:model.minimumRuntimePath,certificationBoundary:model.certificationBoundary};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/enterprise-t-audit.json',import.meta.url),JSON.stringify(report,null,2));console.log(`enterprise-t-audit: ok (T=${dimensions.length}, findings=${findings.length}, open=${openFindings.length}, verdict=${report.verdict})`);
