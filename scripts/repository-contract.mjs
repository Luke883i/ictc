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
  'docs/REPOSITORY_ATLAS.md','docs/DEVELOPMENT.md','docs/TESTING.md',
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
const result={schema:'ictc-repository-root-contract/v2',authority:'NONE',currentOwner:'docs/START_HERE.md',status:failures.length?'REFUTED':'PASS_SCOPED',currentPathsChecked:currentPaths.length,legacyDiagnostic:historical,legacyDisposition:'HOLD_CONSUMERS',retirementAuthorized:false,failures};
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exitCode=1;
