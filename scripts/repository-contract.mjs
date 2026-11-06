/**
 * Repository root contract: current wiring check, not a second authority.
 * Historical paths remain observable as compatibility debt; they are not
 * prerequisites for the current bootstrap. Do not interpret PASS as safe delete.
 */
import {access, readFile, readdir, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(process.argv[2]||fileURLToPath(new URL('..',import.meta.url)));
const currentPaths=[
  'README.md','AGENTS.md','CONTRIBUTING.md','SECURITY.md','GOVERNANCE.md',
  '.github/CODEOWNERS','.github/PULL_REQUEST_TEMPLATE.md','.github/workflows/ci.yml',
  'package.json','package-lock.json','ictc.sh',
  'docs/PRODUCT.md','docs/11_ARCHITECTURE.md','docs/START_HERE.md',
  'docs/REPOSITORY_ATLAS.md','docs/DEVELOPMENT.md','docs/TESTING.md','docs/AI_AGENT_BUNDLE.md',
  'docs/documentation-manifest.json','docs/authority-matrix.yaml',
  'v3/bootstrap.mjs','v3/server.mjs','v3/store.mjs','v3/sqlite-state-persistence.mjs',
  'scripts/documentation-lattice-check.mjs','scripts/repository-inventory.mjs'
];
// The previous root contract treated these as required runtime files.
// They are a diagnostic inventory, not current owner, authority or safe-delete proof.
const legacyPaths=[
  'app/index.html','app/styles.css','app/app.js',
  'server.mjs','lib/domain.mjs',
  '.github/workflows/visual.yml','.github/workflows/core-ui.yml',
  'v3/lib/api.mjs','v3/lib/store.mjs'
];
// C1 compatibility contraction: inspect the sealed PR #8 handoff as lineage.
// Never mutate the bundle, substitute its historical contract for today's
// package/architecture owners, or infer that an absent consumer makes deletion safe.
const historicalBundleContract='audit/archive/ictc-agent-bundle/config/repository_contract.json';
const historicalBundleProfile='audit/archive/ictc-agent-bundle/bundle_profile.json';
const historicalBundleCatalog='audit/archive/ictc-agent-bundle/config/test_catalog.json';
const failures=[];
// The historic agent handoff is preserved under docs/archive, never restored as a root sibling.
if(await exists('ai'))failures.push('retired repository path reintroduced: ai/');
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
for(const rel of currentPaths){
 if(!await exists(rel)){failures.push('missing current path: '+rel);continue}
 if((await stat(path.join(root,rel))).size===0)failures.push('empty current path: '+rel);
}
// C1 root contraction: these former aliases/placeholders must not silently re-enter.
// The active supervisor ictc.sh and canonical .github/CODEOWNERS remain protected above.
// Keep the active checkout free of relocated historic receipts and generated handoff records.
// This is a path-removal regression guard, not external-consumer clearance.
for(const rel of ['ictc-v3.sh','CODEOWNERS','runtime/blobs/.gitkeep',
 'dist/README.md',
 'dist/ICTC_AI_HANDOFF_BUNDLE_V1.zip.sha256',
 'audit/CHAIN_MAIN115.json',
 'audit/CHAIN_MAIN115_README.md',
 'audit/CONVERGENCE_MAIN115_CLAIM_BOUNDARY.md',
 'audit/README_CONVERGENCE_MAIN115.md',
 'audit/convergence-main115-10m.json']){
 if(await exists(rel))failures.push('retired repository path reintroduced: '+rel);
}
const legacySchemaNames=[
  "action-frame.schema.json",
  "action-wiring.schema.json",
  "audit-event.schema.json",
  "core-ui.schema.json",
  "core-workspaces.schema.json",
  "finding.schema.json",
  "gap-registry.schema.json",
  "matter.schema.json",
  "outcome-envelope.schema.json",
  "receipt.schema.json",
  "scout-job.schema.json",
  "source-record.schema.json",
  "trace-view.schema.json",
  "ui-wiring-manifest.schema.json",
  "visual-attestation.schema.json",
];
const historicalFixturePaths=[
  'audit/archive/ictc-agent-bundle/README.md',
 'v3/tests/legacy/app/app.js',
 'v3/tests/legacy/app/index.html',
 'v3/tests/legacy/app/styles.css',
 'v3/tests/legacy/data/seed.json',
 'v3/tests/legacy/lib/domain.mjs',
 'v3/tests/legacy/v1/buyer-simulation.mjs',
 'v3/tests/legacy/v1/fixture-audit.mjs',
 'v3/tests/legacy/v1/fixtures/manifest.json',
 'v3/tests/legacy/v1/fixtures/release-evidence.txt',
 'v3/tests/legacy/v1/release.json',
 'v3/tests/legacy/v1/release.mjs',
 'v3/tests/legacy/v1/saturation.mjs',
 'v3/tests/legacy/v1/stability-audit.mjs',
];
for(const rel of historicalFixturePaths){
 if(!await exists(rel))failures.push('missing historical verification fixture: '+rel);
}
// Preserve the legacy schema bytes within the existing verification boundary;
// reject restoration of the former root paths, without inferring external URL safety.
for(const name of legacySchemaNames){
 const original='schemas/'+name,relocated='v3/tests/legacy/schemas/'+name;
 if(await exists(original))failures.push('retired repository path reintroduced: '+original);
 if(!await exists(relocated))failures.push('missing historical verification fixture: '+relocated);
}
// Current root must not silently restore the four older parallel app trees.
for(const rel of [
 'app/app.js',
 'app/index.html',
 'app/styles.css',
 'data/seed.json',
 'lib/domain.mjs',
 'v1/buyer-simulation.mjs',
 'v1/fixture-audit.mjs',
 'v1/fixtures/manifest.json',
 'v1/fixtures/release-evidence.txt',
 'v1/release.json',
 'v1/release.mjs',
 'v1/saturation.mjs',
 'v1/stability-audit.mjs',
]){
 if(await exists(rel))failures.push('retired repository path reintroduced: '+rel);
}
const devBootstrap=await readFile(path.join(root,'.devcontainer/post-create.sh'),'utf8');
if(devBootstrap.includes('ictc-v3.sh')||!devBootstrap.includes('chmod +x ictc.sh'))failures.push('devcontainer launcher compatibility drift');
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
const expectedScripts={start:'node v3/bootstrap.mjs',demo:'node v3/bootstrap.mjs demo',check:'node scripts/syntax-check.mjs',test:'npm run test:current', 'docs:check':'node scripts/documentation-lattice-check.mjs', 'repo:inventory':'node scripts/repository-inventory.mjs'};
for(const [script,entry] of Object.entries(expectedScripts)){
 const value=pkg.scripts?.[script];
 if(!value||!value.includes(entry))failures.push('current npm script drift: '+script);
}
const [readme,product,architecture,docRegistry]=await Promise.all([
 readFile(path.join(root,'README.md'),'utf8'),
 readFile(path.join(root,'docs/PRODUCT.md'),'utf8'),
 readFile(path.join(root,'docs/11_ARCHITECTURE.md'),'utf8'),
 readFile(path.join(root,'docs/documentation-manifest.json'),'utf8')
]);
if(!readme.includes('docs/PRODUCT.md')||!readme.includes('docs/START_HERE.md'))failures.push('README owner routing drift');
if(!product.includes('RN-01')||!product.includes('AR-01'))failures.push('product process owner drift');
if(!architecture.includes('v3/server.mjs'))failures.push('software architecture owner drift');
if(JSON.parse(docRegistry).entrypoint!=='docs/START_HERE.md')failures.push('documentation entrypoint drift');
const historical=await Promise.all(legacyPaths.map(async path=>({path,exists:await exists(path)})));
const [bundleContract,bundleProfile,bundleCatalog]=await Promise.all([
  historicalBundleContract,historicalBundleProfile,historicalBundleCatalog
].map(async rel=>JSON.parse(await readFile(path.join(root,rel),'utf8'))));
const bundleGuide=await readFile(path.join(root,'docs/AI_AGENT_BUNDLE.md'),'utf8');
const historicalRequiredPaths=await Promise.all(bundleContract.required_paths.map(async rel=>({path:rel,exists:await exists(rel)})));
const historicalCommands=[...(bundleCatalog.precommit_quick||[]),...(bundleCatalog.precommit_full||[])];
const historicalNpmScripts=[...new Set(historicalCommands.map(item=>item.argv||[]).filter(argv=>argv[0]==='npm').map(argv=>argv[1]==='run'?argv[2]:argv[1]).filter(Boolean))].sort();
const legacyScriptStatus=historicalNpmScripts.map(name=>({name,available:Boolean(pkg.scripts?.[name])}));
const legacyCheckerPaths=['scripts/schema-check.mjs','scripts/ui-wiring-check.mjs','scripts/verify.mjs'];
const routedScripts=new Set(Object.values(pkg.scripts||{}).join(' ').match(/scripts\/[\w-]+\.mjs/g)||[]);
const legacyCheckers=legacyCheckerPaths.map(path=>({path,exists:false,exposedAsCurrent:routedScripts.has(path)}));
for(const item of legacyCheckers)item.exists=await exists(item.path);
// C1-2 / F7: a scoped source-level consumer ledger, not an ES module or
// external-consumer absence proof. A historical checker must not quietly become
// a current npm entrypoint, a CI command, or a rewritten current-runtime claim.
const historicalTooling=[
  {path:'scripts/schema-check.mjs',tokens:["../v3/tests/legacy/lib/domain.mjs",'data', 'seed'],reason:'v1-era schema/seed and legacy domain fixture; a passing invocation is not current runtime assurance'},
  {path:'scripts/ui-wiring-check.mjs',tokens:["'v3/tests/legacy/app/index.html'","'v3/tests/legacy/app/app.js'","'server.mjs'"],reason:'checks historical app/ paths and missing root server.mjs; not v3/UI wiring'},
  {path:'scripts/verify.mjs',tokens:["'v3/tests/legacy/v1/release.json'","../v3/tests/legacy/lib/domain.mjs"],reason:'checks historical release/domain identity; not current package or runtime release certification'}
];
const workflowNames=(await readdir(path.join(root,'.github/workflows'))).filter(name=>/\.ya?ml$/.test(name)).sort();
const workflowSources=await Promise.all(workflowNames.map(async name=>({name,text:await readFile(path.join(root,'.github/workflows',name),'utf8')})));
const historicalToolingLedger=[];
for(const tool of historicalTooling){
  const present=await exists(tool.path),source=present?await readFile(path.join(root,tool.path),'utf8'):'';
  const sourceSignaturePreserved=present&&tool.tokens.every(token=>source.includes(token));
  const npmConsumers=Object.entries(pkg.scripts||{}).filter(([,value])=>new RegExp(`(?:^|[^\\w])(?:node\\s+)?${tool.path.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?=\\s|$|[;&])`).test(value)).map(([name])=>name);
  // This is an *exact command* census, not a text mention/grep absence proof.
  const ciConsumers=workflowSources.filter(({text})=>text.split(/\r?\n/).some(line=>!/^\s*#/.test(line)&&new RegExp(`\\bnode\\s+${tool.path.replace(/\./g,'\\.')}(?=\\s|$|[;&])`).test(line))).map(({name})=>name);
  if(!sourceSignaturePreserved)failures.push('historical tooling source signature drift: '+tool.path);
  if(npmConsumers.length||ciConsumers.length)failures.push('legacy historical checker promoted to current route: '+tool.path);
  historicalToolingLedger.push({path:tool.path,classification:'HISTORICAL_DIAGNOSTIC_HOLD_CONSUMERS',present,sourceSignaturePreserved,npmConsumers,ciConsumers,reason:tool.reason,mayBeCurrentRuntimeProof:false,retirementAuthorized:false});
}
const runtimeModelText=await readFile(path.join(root,'v3/runtime/model.mjs'),'utf8');
const runtimeServerText=await readFile(path.join(root,'v3/server.mjs'),'utf8');
const legacyServiceLiteral=runtimeModelText.includes('experience:{services:2');
const httpProjectionSeven=runtimeServerText.includes('projected.experience.services=7');
if(!legacyServiceLiteral||!httpProjectionSeven)failures.push('legacy service literal vs current HTTP projection drift: F7 requires review');
const atlasText=await readFile(path.join(root,'docs/REPOSITORY_ATLAS.md'),'utf8');
if(!atlasText.includes('C1-2 · Legacy tooling / F7')||!atlasText.includes('HISTORICAL_DIAGNOSTIC_HOLD_CONSUMERS'))failures.push('legacy tooling classification missing from repository Atlas');

if(bundleProfile.canonical_sot!==false||!(bundleProfile.immutable_in_place||[]).includes('config/repository_contract.json'))failures.push('PR8 historical bundle immutable/non-authoritative boundary drift');
if(!bundleGuide.includes('Historical PR #8')||!bundleGuide.includes('docs/START_HERE.md')||!bundleGuide.includes('npm run docs:check')||!bundleGuide.includes('byte-immutable in the archive')||!bundleGuide.includes('HOLD_CONSUMERS'))failures.push('AI bundle guide misroutes historical handoff as current');
if(legacyCheckers.some(item=>item.exposedAsCurrent))failures.push('historical legacy checker exposed as current npm script');
const compatibility={
  classification:'HISTORICAL_LINEAGE_HOLD_CONSUMERS',authority:'NONE',source:historicalBundleContract,
  contractPreservedByThisCheck:false,integrityVerifier:'audit/archive/ictc-agent-bundle/tools/verify_integrity.py',
  requiredPaths:historicalRequiredPaths,precommitScriptAvailability:legacyScriptStatus,
  legacyCheckerPaths:legacyCheckers,legacyTooling:historicalToolingLedger,serviceProjection:{historicalModelServices:legacyServiceLiteral?2:null,currentHttpSourceProjectsSeven:httpProjectionSeven,proofScope:'SOURCE_ONLY: server HTTP projection assignment; no generic direct-model or deployed-response equivalence'},upToDateDoctorCertified:false,
  currentEntrypoint:'docs/START_HERE.md',currentTestEntry:'npm test',currentDocsEntry:'npm run docs:check',
  retirementAuthorized:false,limitation:'No external-consumer absence, historical doctor freshness or safe deletion is proved.'
};
const result={schema:'ictc-repository-root-contract/v2',authority:'NONE',currentOwner:'docs/START_HERE.md',status:failures.length?'REFUTED':'PASS_SCOPED',currentPathsChecked:currentPaths.length,legacyDiagnostic:historical,legacyDisposition:'HOLD_CONSUMERS',compatibility,retirementAuthorized:false,failures};
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exitCode=1;
