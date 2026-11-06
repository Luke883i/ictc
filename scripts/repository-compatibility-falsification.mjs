/**
 * C1-2/F7 falsifier for the existing repository-contract owner, not a new SOT.
 * Each edit is isolated under OS tmpdir and rolled back. Old checks are NOT
 * executed as current runtime/CI requirements, and no delete is authorized.
 */
import {cpSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,relative,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
const sourceRoot=resolve(fileURLToPath(new URL('..',import.meta.url)));
const args=process.argv.slice(2);
if(!args.includes('--falsify'))throw Error('Use --falsify (source mutation is performed only in an isolated disposable copy)');
const argCases=args.find(arg=>arg.startsWith('--model-cases='));
const count=argCases?Number(argCases.split('=')[1]):100000;
if(!Number.isSafeInteger(count)||count<0||count>10000000)throw Error('model-cases must be an integer from 0 to 10000000');
// A separate, repeatable 12-bit policy model. This is NOT a source mutation.
let seed=0xc120f7a5,seen=new Uint8Array(4096),observed=0,escapes=0;
function xorshift(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
function qualify(guards){return guards.every(Boolean)}
for(let i=0;i<count;i++){
  const mask=(i%8192===0)?4095:(i%8192<=12?4095^(1<<(i%8192-1)):xorshift()&4095);
  const guards=Array.from({length:12},(_,b)=>Boolean(mask&(1<<b)));
  if(qualify(guards)!==(mask===4095))escapes++;
  if(!seen[mask]){seen[mask]=1;observed++}
}
// Exhaust the finite contract even if the seeded campaign missed a profile.
let exhausted=0;for(let mask=0;mask<4096;mask++){
 const flags=Array.from({length:12},(_,b)=>(mask&(1<<b))!==0);
 if(qualify(flags)!==(mask===4095))escapes++;
 exhausted++;
}
const sandbox=mkdtempSync(join(tmpdir(),'ictc-c12-f7-'));
const candidate=join(sandbox,'repo');
const excluded=new Set(['.git','node_modules']);
const toolFiles=['schema-check.mjs','ui-wiring-check.mjs','verify.mjs'];
const cases=[
 {id:'bundle-guide-promoted-to-current',file:'docs/AI_AGENT_BUNDLE.md',bad:s=>s.replace('Historical PR #8','CURRENT_PRODUCT_AUTHORITY'),expect:'AI bundle guide misroutes historical handoff as current'},
 ...toolFiles.map(name=>({id:'npm-promotes-'+name,file:'package.json',bad:s=>{const j=JSON.parse(s);j.scripts['current-legacy']='node scripts/'+name;return JSON.stringify(j)},expect:'legacy historical checker promoted to current route'})),
 ...toolFiles.map(name=>({id:'ci-promotes-'+name,file:'.github/workflows/docs-command-contract.yml',bad:s=>s.replace('      - name: Validate documented commands',`      - name: Accidental legacy current job\n        run: node scripts/${name}\n      - name: Validate documented commands`),expect:'legacy historical checker promoted to current route'})),
 {id:'model-old-literal-promoted',file:'v3/runtime/model.mjs',bad:s=>s.replace('experience:{services:2','experience:{services:7'),expect:'legacy service literal vs current HTTP projection drift'},
 {id:'server-current-http-redirected',file:'v3/server.mjs',bad:s=>s.replace('projected.experience.services=7','projected.experience.services=2'),expect:'legacy service literal vs current HTTP projection drift'},
 {id:'atlas-omits-F7',file:'docs/REPOSITORY_ATLAS.md',bad:s=>s.replace('C1-2 · Legacy tooling / F7','unqualified legacy checkers'),expect:'legacy tooling classification missing'},
 {id:'atlas-promotes-F7',file:'docs/REPOSITORY_ATLAS.md',bad:s=>s.replace('HISTORICAL_DIAGNOSTIC_HOLD_CONSUMERS','CURRENT_RUNTIME_CERTIFIED'),expect:'legacy tooling classification missing'},
 {id:'legacy-schema-repointed',file:'scripts/schema-check.mjs',bad:s=>s.replace('../v3/tests/legacy/lib/domain.mjs','../v3/domain.mjs'),expect:'historical tooling source signature drift'},
 {id:'legacy-ui-repointed',file:'scripts/ui-wiring-check.mjs',bad:s=>s.replace("'server.mjs'","'v3/server.mjs'"),expect:'historical tooling source signature drift'},
 {id:'legacy-verify-repointed',file:'scripts/verify.mjs',bad:s=>s.replace("'v3/tests/legacy/v1/release.json'","'v3/release-identity.json'"),expect:'historical tooling source signature drift'},
 ...toolFiles.map(name=>({id:'legacy-tool-deleted-'+name,file:'scripts/'+name,bad:()=>null,expect:'historical tooling source signature drift'}))
];
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
const absentRootMutants=[
 {id:'historical-ai-root-resurrected',file:'ai/ictc-agent-bundle/README.md',content:'old public path should stay retired\n',expectPath:'ai/',cleanupDirectory:'ai'},
 {id:'former-test-helper-reintroduced',file:'v3/test-helpers/active-experience-install.mjs',content:'export const falseOwner=true;\n',expectedFailure:'retired migrated path reintroduced: v3/test-helpers/active-experience-install.mjs',cleanupDirectory:'v3/test-helpers'},
 {id:'former-abuse-budget-reintroduced',file:'v3/runtime/abuse-budget.mjs',content:'export const falseOwner=true;\n',expectedFailure:'retired migrated path reintroduced: v3/runtime/abuse-budget.mjs'},
 {id:'former-ui-epistemic-inference-ui-check-reintroduced',file:'v3/epistemic-inference-ui-check.mjs',content:'export const falseOwner=true;\\n',expectedFailure:'retired migrated path reintroduced: v3/epistemic-inference-ui-check.mjs'},
 {id:'former-ui-epistemic-lattice-ui-check-reintroduced',file:'v3/epistemic-lattice-ui-check.mjs',content:'export const falseOwner=true;\\n',expectedFailure:'retired migrated path reintroduced: v3/epistemic-lattice-ui-check.mjs'},
 {id:'former-ui-cross-procedure-create-ui-check-reintroduced',file:'v3/cross-procedure-create-ui-check.mjs',content:'export const falseOwner=true;\\n',expectedFailure:'retired migrated path reintroduced: v3/cross-procedure-create-ui-check.mjs'},
 {id:'parallel-bootstrap-source-authority',file:'src/bootstrap.mjs',content:'export const shadow=true;\n',expectedFailure:'parallel current runtime roots: src/bootstrap.mjs and v3/bootstrap.mjs'},
 {id:'parallel-server-source-authority',file:'src/server.mjs',content:'export const shadow=true;\n',expectedFailure:'parallel current runtime roots: src/server.mjs and v3/server.mjs'},
 {id:'parallel-runtime-store-source-authority',file:'src/runtime-store.mjs',content:'export const shadow=true;\n',expectedFailure:'parallel current runtime roots: src/runtime-store.mjs and v3/runtime-store.mjs'},
 {id:'parallel-store-source-authority',file:'src/store.mjs',content:'export const shadow=true;\n',expectedFailure:'parallel current runtime roots: src/store.mjs and v3/store.mjs'},
 {id:'parallel-sqlite-state-persistence-source-authority',file:'src/sqlite-state-persistence.mjs',content:'export const shadow=true;\n',expectedFailure:'parallel current runtime roots: src/sqlite-state-persistence.mjs and v3/sqlite-state-persistence.mjs'},
 {id:'obsolete-launcher-resurrected',file:'ictc-v3.sh',content:'#!/bin/sh\nexit 0\n'},
 {id:'shadow-codeowners-resurrected',file:'CODEOWNERS',content:'# stray second file\n'},
 {id:'legacy-blob-placeholder-resurrected',file:'runtime/blobs/.gitkeep',content:''},
 {id:'archived-historical-1-resurrected',file:'dist/README.md',content:'archived-only\n'},
 {id:'archived-historical-2-resurrected',file:'dist/ICTC_AI_HANDOFF_BUNDLE_V1.zip.sha256',content:'archived-only\n'},
 {id:'archived-historical-3-resurrected',file:'audit/CHAIN_MAIN115.json',content:'{}\n'},
 {id:'archived-historical-4-resurrected',file:'audit/CHAIN_MAIN115_README.md',content:'archived-only\n'},
 {id:'archived-historical-5-resurrected',file:'audit/CONVERGENCE_MAIN115_CLAIM_BOUNDARY.md',content:'archived-only\n'},
 {id:'archived-historical-6-resurrected',file:'audit/README_CONVERGENCE_MAIN115.md',content:'archived-only\n'},
 {id:'archived-historical-7-resurrected',file:'audit/convergence-main115-10m.json',content:'{}\n'},
 {id:'former-root-1-resurrected',file:'app/app.js',content:'path-reappearance\n'},
 {id:'former-root-2-resurrected',file:'app/index.html',content:'path-reappearance\n'},
 {id:'former-root-3-resurrected',file:'app/styles.css',content:'path-reappearance\n'},
 {id:'former-root-4-resurrected',file:'data/seed.json',content:'path-reappearance\n'},
 {id:'former-root-5-resurrected',file:'lib/domain.mjs',content:'path-reappearance\n'},
 {id:'former-root-6-resurrected',file:'v1/buyer-simulation.mjs',content:'path-reappearance\n'},
 {id:'former-root-7-resurrected',file:'v1/fixture-audit.mjs',content:'path-reappearance\n'},
 {id:'former-root-8-resurrected',file:'v1/fixtures/manifest.json',content:'path-reappearance\n'},
 {id:'former-root-9-resurrected',file:'v1/fixtures/release-evidence.txt',content:'path-reappearance\n'},
 {id:'former-root-10-resurrected',file:'v1/release.json',content:'path-reappearance\n'},
 {id:'former-root-11-resurrected',file:'v1/release.mjs',content:'path-reappearance\n'},
 {id:'former-root-12-resurrected',file:'v1/saturation.mjs',content:'path-reappearance\n'},
 {id:'former-root-13-resurrected',file:'v1/stability-audit.mjs',content:'path-reappearance\n'},
 ...legacySchemaNames.map(name=>({id:'former-schema-root-'+name,file:'schemas/'+name,content:'{}\n'}))
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
 ...legacySchemaNames.map(name=>'v3/tests/legacy/schemas/'+name),
];
const result={schema:'ictc-c1-2-f7-falsification/v1',sourceTreeOnly:true,authority:'NONE',seedHex:'0xc120f7a5',semanticPolicyModel:{cases:count,observedProfiles:observed,profileSpace:4096,exhaustedProfiles:exhausted,escapes,modelOnly:true},physical:{cases:cases.length+absentRootMutants.length+historicalFixturePaths.length+3,killed:0,survivors:[],results:[]},negativeControls:[],limitations:['No dynamic import or external consumer absence proof','F7 global closure not claimed','10M semantic policy models are not 10M physical file rewrites']};
// Runtime path-boundary oracle: unlike source-only checks, this actually loads
// the historical domain/release from the disposable checkout. It does not
// certify the historical product as a current runtime or grant deletion rights.
const historicalPathProbes=[
 {id:'legacy-seed-runtime-root',file:'v3/tests/legacy/lib/domain.mjs',method:'readSeed',from:"new URL('../../../..', import.meta.url)",to:"new URL('..', import.meta.url)"},
 {id:'legacy-release-runtime-root',file:'v3/tests/legacy/v1/release.mjs',method:'readReleaseManifest',from:"new URL('../../../..', import.meta.url)",to:"new URL('..', import.meta.url)"}
];
const invokePathProbe=probe=>{
 const url=pathToFileURL(join(candidate,probe.file)).href;
 const script='import {'+probe.method+'} from '+JSON.stringify(url)+'; const value=await '+probe.method+'(); if(!value||typeof value!=="object")process.exit(23);';
 const p=spawnSync(process.execPath,['--input-type=module','--eval',script],{cwd:candidate,encoding:'utf8',timeout:16000});
 return {exit:p.status,signal:p.signal||null,stderr:String(p.stderr||p.error?.message||'').slice(0,280)};
};
const invoke=()=>{
 const p=spawnSync(process.execPath,[join(sourceRoot,'scripts/repository-contract.mjs'),candidate],{cwd:candidate,encoding:'utf8',timeout:25000});
 let data=null;try{data=JSON.parse(p.stdout)}catch{}
 return {exit:p.status,status:data?.status,failures:data?.failures||[],error:p.error?.message||p.stderr?.slice(0,200)||''};
};
try{
 cpSync(sourceRoot,candidate,{recursive:true,filter:p=>{if(p===sourceRoot)return true;const rel=relative(sourceRoot,p).split(/[\\/]/);return !excluded.has(rel[0])&&!['runtime','artifacts'].includes(rel[0]);}});
 const baseline=invoke();if(baseline.exit!==0||baseline.status!=='PASS_SCOPED')throw Error('baseline checker not PASS_SCOPED: '+JSON.stringify(baseline));
 for(const test of cases){
  const p=join(candidate,test.file),before=readFileSync(p,'utf8'),after=test.bad(before);
  if(after===before)throw Error('vacuous physical mutant: '+test.id);
  if(after===null)rmSync(p);else writeFileSync(p,after);
  const actual=invoke();writeFileSync(p,before);
  const killed=actual.exit===1&&actual.status==='REFUTED'&&actual.failures.some(x=>x.includes(test.expect));
  result.physical.results.push({id:test.id,killed,failure:actual.failures.find(x=>x.includes(test.expect))||actual.error});
  if(killed)result.physical.killed++;else result.physical.survivors.push(test.id);
 }
 // C1 root-debt counterfactuals: physically reintroduce each removed path and
 // prove the existing root contract rejects it (then restore byte-for-byte).
 for(const test of absentRootMutants){
  const p=join(candidate,test.file);mkdirSync(join(p,'..'),{recursive:true});writeFileSync(p,test.content);
  const actual=invoke();rmSync(p,{force:true});
  if(test.cleanupDirectory)rmSync(join(candidate,test.cleanupDirectory),{recursive:true,force:true});
  const rejectedPath=test.expectPath||test.file;
  const expectedFailure=test.expectedFailure||'retired repository path reintroduced: '+rejectedPath;
  const killed=actual.exit===1&&actual.status==='REFUTED'&&actual.failures.some(x=>x.includes(expectedFailure));
  result.physical.results.push({id:test.id,killed,failure:actual.failures.find(x=>x.includes(rejectedPath))||actual.error});
  if(killed)result.physical.killed++;else result.physical.survivors.push(test.id);
 }
 // Kill two real executable path-binding mutations, not merely string diffs.
 result.pathBindingProbes=[];
 for(const probe of historicalPathProbes){
  const baseline=invokePathProbe(probe);
  if(baseline.exit!==0||baseline.signal)throw Error('historical baseline path probe failed: '+probe.id+': '+JSON.stringify(baseline));
  const file=join(candidate,probe.file),before=readFileSync(file,'utf8');
  if(!before.includes(probe.from))throw Error('historical mutation anchor absent: '+probe.id);
  writeFileSync(file,before.replace(probe.from,probe.to));
  const mutated=invokePathProbe(probe);writeFileSync(file,before);
  const killed=mutated.exit!==0&&!mutated.signal&&/ENOENT/.test(mutated.stderr);
  result.physical.results.push({id:probe.id,killed,baseline,mutant:mutated});
  result.pathBindingProbes.push({id:probe.id,baselinePassed:true,mutantKilled:killed});
  if(killed)result.physical.killed++;else result.physical.survivors.push(probe.id);
 }
 // For each relocated fixture, physical removal must be caught by the existing owner.
 for(const rel of historicalFixturePaths){
  const p=join(candidate,rel),bytes=readFileSync(p);
  rmSync(p,{force:true});const outcome=invoke();writeFileSync(p,bytes);
  const killed=outcome.exit===1&&outcome.status==='REFUTED'&&outcome.failures.some(x=>x.includes('missing historical verification fixture: '+rel));
  result.physical.results.push({id:'relocated-fixture-removal-'+rel,killed,failure:outcome.failures.find(x=>x.includes(rel))||outcome.error});
  if(killed)result.physical.killed++;else result.physical.survivors.push('relocated-fixture-removal-'+rel);
 }
 // Positive-control inverse: removing the CURRENT supervisor must be rejected.
 const active=join(candidate,'ictc.sh'),originalActive=readFileSync(active);
 rmSync(active);const missingActive=invoke();writeFileSync(active,originalActive);
 const activeKilled=missingActive.exit===1&&missingActive.status==='REFUTED'&&missingActive.failures.some(x=>x.includes('missing current path: ictc.sh'));
 result.physical.results.push({id:'active-supervisor-removal-rejected',killed:activeKilled,failure:missingActive.failures.find(x=>x.includes('ictc.sh'))||missingActive.error});
 if(activeKilled)result.physical.killed++;else result.physical.survivors.push('active-supervisor-removal-rejected');
 // False-positive control: a comment mentioning a command is not a live CI invocation.
 const workflow=join(candidate,'.github/workflows/docs-command-contract.yml'),original=readFileSync(workflow,'utf8');
 writeFileSync(workflow,original+'\n# node scripts/schema-check.mjs is an historical reference only\n');
 const commentOnly=invoke();writeFileSync(workflow,original);
 result.negativeControls.push({id:'comment-not-CI',pass:commentOnly.exit===0&&commentOnly.status==='PASS_SCOPED'});
 const reverted=invoke();result.negativeControls.push({id:'revert-is-identical-PASS',pass:reverted.exit===0&&reverted.status==='PASS_SCOPED'});
}finally{rmSync(sandbox,{recursive:true,force:true})}
result.status=result.physical.killed===result.physical.cases&&result.semanticPolicyModel.escapes===0&&result.negativeControls.every(x=>x.pass)?'PASS_SCOPED':'REFUTED';
console.log(JSON.stringify(result,null,2));if(result.status!=='PASS_SCOPED')process.exitCode=1;
