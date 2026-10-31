import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluateReleaseFacts,selectConvergentPolicy,LOCAL_DOD} from './release-readiness-e2-lib.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');const json=p=>JSON.parse(read(p));
const entries=[];function walk(d){for(const e of readdirSync(join(root,d),{withFileTypes:true})){const p=join(d,e.name);if(e.isDirectory()){if(['node_modules','.git','.ictc','artifacts'].includes(e.name))continue;walk(p);}else if(e.isFile())entries.push(p.replaceAll('\\','/'));}}walk('.');
const have=new Set(entries.map(p=>p.startsWith('./')?p.slice(2):p));
let staticImportsChecked=0,staticImportsMissing=0,workflowRefsChecked=0,workflowRefsMissing=0;
const relImport=/^\s*(?:import\s+(?:[^\n]*?\s+from\s*)?|export\s+(?:\*|\{)[^\n]*?\s+from\s*)['"](\.[^'"]+)['"]/gm;
for(const path of have){if(/\.(mjs|js)$/.test(path)){const text=read(path);for(const [,src] of text.matchAll(relImport)){staticImportsChecked++;let dest=resolve(dirname(join(root,path)),src);if(!existsSync(dest)&&!existsSync(dest+'.js')&&!existsSync(dest+'.mjs'))staticImportsMissing++;}}
  if(path.startsWith('.github/workflows/')&&/\.ya?ml$/.test(path))for(const [,ref] of read(path).matchAll(/\b((?:v3|scripts)\/[\w./-]+\.(?:mjs|py|sh))\b/g)){workflowRefsChecked++;if(!have.has(ref))workflowRefsMissing++;}
}
// A real runtime readback must be provided by the separate isolated HTTP smoke.
// Without it this command fails closed; an environment flag alone cannot simulate it.
const witnessPath=process.env.ICTC_RELEASE_RUNTIME_WITNESS;
let runtime={};if(witnessPath){const witness=JSON.parse(readFileSync(witnessPath,'utf8'));runtime={healthHttp:witness.healthHttp,integrityOK:witness.integrityOK,procedureCount:witness.procedureCount};}
const f={product:read('docs/PRODUCT.md'),docs:read('docs/START_HERE.md'),readme:read('README.md'),startup:read('v3/bootstrap.mjs'),policy:read('.github/enterprise-gate-manifest.json'),docsManifest:json('docs/documentation-manifest.json'),release:json('v3/release-identity.json'),gaps:json('v3/gaps.json'),truth:json('v3/capability-truth.json'),owners:json('v3/semantic-owner-contract.json'),package:json('package.json'),server:read('v3/server.mjs'),http:read('v3/runtime/http.mjs'),contributing:read('CONTRIBUTING.md'),prTemplate:read('.github/PULL_REQUEST_TEMPLATE.md'),staticImportsChecked,staticImportsMissing,workflowRefsChecked,workflowRefsMissing,hasAuthorityMatrix:have.has('docs/authority-matrix.yaml'),hasStore:have.has('v3/store.mjs'),hasSqlite:have.has('v3/sqlite-state-persistence.mjs'),hasEnterprisePostgres:have.has('v3/runtime/postgres-enterprise-authority.mjs'),hasSecurityWorkflow:have.has('.github/workflows/security.yml'),runtime,evidencePolicy:'fail-closed',releaseGrantProvided:false};
const result=evaluateReleaseFacts(f),policy=selectConvergentPolicy();
assert.equal(policy.evaluated,1000);assert.equal(policy.admissible,1);assert.equal(LOCAL_DOD.length,24);
const report={...result,policySelection:policy,sourceCensus:{files:have.size,staticImportsChecked,staticImportsMissing,workflowRefsChecked,workflowRefsMissing}};
console.log(JSON.stringify(report));if(!result.ok)process.exit(2);
// A deliberately distinct command: actual release MUST never be minted from E2 only.
if(process.argv.includes('--require-release'))process.exit(3);
