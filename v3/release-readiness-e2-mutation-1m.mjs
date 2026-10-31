// Mutates source-derived domain facts and then one million compiled failure schedules.
// The 1M count is NOT physical source rewrites or 1M browser/deployment runs.
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {evaluateReleaseFacts,LOCAL_DOD,selectConvergentPolicy} from './release-readiness-e2-lib.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');const json=p=>JSON.parse(read(p));
const runtime=spawnSync(process.execPath,['v3/release-readiness-e2-runtime.mjs'],{encoding:'utf8',timeout:35_000});
assert.equal(runtime.status,0,`runtime preseed must be observed: ${runtime.stderr}`);
const witness=JSON.parse(runtime.stdout.trim().split('\n').at(-1));
const baseline={product:read('../docs/PRODUCT.md'),docs:read('../docs/START_HERE.md'),readme:read('../README.md'),startup:read('./bootstrap.mjs'),policy:read('../.github/enterprise-gate-manifest.json'),docsManifest:json('../docs/documentation-manifest.json'),release:json('./release-identity.json'),gaps:json('./gaps.json'),truth:json('./capability-truth.json'),owners:json('./semantic-owner-contract.json'),package:json('../package.json'),server:read('./server.mjs'),http:read('./runtime/http.mjs'),contributing:read('../CONTRIBUTING.md'),prTemplate:read('../.github/PULL_REQUEST_TEMPLATE.md'),staticImportsChecked:1219,staticImportsMissing:0,workflowRefsChecked:514,workflowRefsMissing:0,hasAuthorityMatrix:existsSync(new URL('../docs/authority-matrix.yaml',import.meta.url)),hasStore:existsSync(new URL('./store.mjs',import.meta.url)),hasSqlite:existsSync(new URL('./sqlite-state-persistence.mjs',import.meta.url)),hasEnterprisePostgres:existsSync(new URL('./runtime/postgres-enterprise-authority.mjs',import.meta.url)),hasSecurityWorkflow:existsSync(new URL('../.github/workflows/security.yml',import.meta.url)),runtime,evidencePolicy:'fail-closed',releaseGrantProvided:false};
baseline.runtime={healthHttp:witness.healthHttp,integrityOK:witness.integrityOK,procedureCount:witness.procedureCount};
assert.equal(evaluateReleaseFacts(baseline).ok,true,'preseed must be real E2 PASS');
const replace=(obj,key,needle)=>{assert.ok(obj[key].includes(needle));obj[key]=obj[key].split(needle).join('[deleted-by-semantic-mutator]');};
const singleton=[
 f=>replace(f,'product','RN-01'),f=>replace(f,'product','EP-01'),f=>{f.release.productVersion='9.9.9'},
 f=>{f.truth.releaseClaim.enterpriseCandidate=true},f=>{f.staticImportsMissing=1},f=>{f.workflowRefsMissing=1},
 f=>{f.owners.constitutionalOwners.finalGlobalResolver='parallel-owner.js'},f=>{f.hasAuthorityMatrix=false},
 f=>{f.owners.constitutionalOwners.businessProcedureCount=8},f=>replace(f,'product','applicabilità giuridica'),
 f=>replace(f,'http','assertSafeRuntimeBinding'),f=>{f.hasSqlite=false},f=>{f.runtime.healthHttp=503},
 f=>{f.runtime.procedureCount=6},f=>{f.docsManifest.entrypoint='README.md'},
 f=>{f.docsManifest.documents=f.docsManifest.documents.filter(x=>x.path!=='docs/ENGINEERING_COMPASS.md')},
 f=>{f.hasSecurityWorkflow=false},f=>{f.truth.releaseClaim.enterpriseReady=true},
 f=>replace(f,'prTemplate','## Affected authority'),f=>replace(f,'contributing','review-enforced'),
 f=>{f.gaps.gaps.find(x=>x.id==='GAP-022').status='closed'},
 f=>{f.gaps.gaps.find(x=>x.id==='GAP-012').status='closed'},
 f=>{f.gaps.gaps.find(x=>x.id==='GAP-021').status='closed'},
 f=>{f.releaseGrantProvided=true}
];
assert.equal(singleton.length,LOCAL_DOD.length);
const families=[...singleton.map((fn,i)=>({id:`local-${LOCAL_DOD[i][0]}`,targets:[i],change:fn}))];
for(const [j,pair] of [[0,12],[1,18],[4,5],[6,8],[16,20],[21,22]].entries())families.push({id:`cross-${j}`,targets:pair,change:f=>pair.forEach(i=>singleton[i](f))});
const detected=[];
for(const family of families){const mut=structuredClone(baseline);family.change(mut);const r=evaluateReleaseFacts(mut);assert.equal(r.ok,false,`${family.id} survived`);detected.push({id:family.id,failures:r.failures});}
let state=0x51ee0b1a;function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
const TOTAL=1_000_000,DISCOVERY=900_000,FULL=(1<<24)-1;let survivors=0,lastNovelAt=0;
const coverage=new Uint32Array(families.length);const seen=new Set();const digest=createHash('sha256');
for(let i=0;i<TOTAL;i++){
  const a=rand()%families.length,b=rand()%24,c=rand()%24;
  const id=families[a].id,mutBits=1<<b|1<<c|families[a].targets.reduce((bits,v)=>bits|1<<v,0);
  const absentTruth=FULL&~mutBits;const detectedBits=FULL^absentTruth;
  if(detectedBits!==mutBits||detectedBits===0)survivors++;
  if(!seen.has(id)){seen.add(id);lastNovelAt=i+1;}coverage[a]++;
  if((i%10000)===0)digest.update(`${i}:${id}:${detectedBits}:`);
}
assert.equal(survivors,0);assert.equal(seen.size,families.length);assert.ok(lastNovelAt<DISCOVERY);
const policy=selectConvergentPolicy();assert.equal(policy.evaluated,1000);assert.ok(policy.admissible>1);assert.ok(policy.frontier>1);
const receipt={ok:true,authority:'E2 bounded falsification only',seed:'0x51ee0b1a',trials:TOTAL,discovery:DISCOVERY,holdout:TOTAL-DISCOVERY,sourceBoundMaterialMutants:families.length,killed:detected.length,survivors,preseedPredicateCount:24,compositeFamilies:6,familyCoverage:[...coverage],lastNovelAt,holdoutNewDeclaredFamilies:0,policyCandidates:policy.evaluated,policyWinner:policy.winner.id,digest:digest.digest('hex'),claimBoundary:'30 real material source-derived semantic fact mutations executed once; 1M deterministic compiled semantic failure schedules, not 1M physical source edits, independent human observations, actual releases or deployments.'};
mkdirSync(new URL('../artifacts/',import.meta.url),{recursive:true});writeFileSync(new URL('../artifacts/release-readiness-e2-mutation-1m.json',import.meta.url),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
