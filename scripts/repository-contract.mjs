/**
 * Repository root contract: current wiring check, not a second authority.
 * Historical paths remain observable as compatibility debt; they are not
 * prerequisites for the current bootstrap. Do not interpret PASS as safe delete.
 */
import {access, readFile, stat} from 'node:fs/promises';
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
const historicalBundleContract='ai/ictc-agent-bundle/config/repository_contract.json';
const historicalBundleProfile='ai/ictc-agent-bundle/bundle_profile.json';
const historicalBundleCatalog='ai/ictc-agent-bundle/config/test_catalog.json';
const failures=[];
async function exists(rel){try{await access(path.join(root,rel));return true}catch{return false}}
for(const rel of currentPaths){
 if(!await exists(rel)){failures.push('missing current path: '+rel);continue}
 if((await stat(path.join(root,rel))).size===0)failures.push('empty current path: '+rel);
}
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
if(bundleProfile.canonical_sot!==false||!(bundleProfile.immutable_in_place||[]).includes('config/repository_contract.json'))failures.push('PR8 historical bundle immutable/non-authoritative boundary drift');
if(!bundleGuide.includes('Historical PR #8')||!bundleGuide.includes('docs/START_HERE.md')||!bundleGuide.includes('npm run docs:check')||!bundleGuide.includes('immutable in place')||!bundleGuide.includes('HOLD_CONSUMERS'))failures.push('AI bundle guide misroutes historical handoff as current');
if(legacyCheckers.some(item=>item.exposedAsCurrent))failures.push('historical legacy checker exposed as current npm script');
const compatibility={
  classification:'HISTORICAL_LINEAGE_HOLD_CONSUMERS',authority:'NONE',source:historicalBundleContract,
  contractPreservedByThisCheck:false,integrityVerifier:'ai/ictc-agent-bundle/tools/verify_integrity.py',
  requiredPaths:historicalRequiredPaths,precommitScriptAvailability:legacyScriptStatus,
  legacyCheckerPaths:legacyCheckers,upToDateDoctorCertified:false,
  currentEntrypoint:'docs/START_HERE.md',currentTestEntry:'npm test',currentDocsEntry:'npm run docs:check',
  retirementAuthorized:false,limitation:'No external-consumer absence, historical doctor freshness or safe deletion is proved.'
};
const result={schema:'ictc-repository-root-contract/v2',authority:'NONE',currentOwner:'docs/START_HERE.md',status:failures.length?'REFUTED':'PASS_SCOPED',currentPathsChecked:currentPaths.length,legacyDiagnostic:historical,legacyDisposition:'HOLD_CONSUMERS',compatibility,retirementAuthorized:false,failures};
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exitCode=1;
