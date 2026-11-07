/** C1-3d: derived, zero-authority relocation witness for TRAMA and qualified adjacent
 * command oracles. Never certifies physical deletion of compatibility paths. */
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const BASE='dcf90ae2a2610bcdefb98b6846b9758e7fae4c1d';
const BASE_POST='14d39211e51a3d2360f2ed006d3488701451e373';
const tramaFiles=Object.freeze([
 'trama-causal-qualification-check.mjs',
 'trama-causal-qualification-saturation-1m.mjs',
 'trama-engineering-check.mjs',
 'trama-engineering-saturation.mjs',
 'trama-reconcile-check.mjs',
 'trama-reconcile-saturation.mjs'
]);
const followupFiles=Object.freeze([
 'gov-intent-assurance-a-check.mjs',
 'gov-intent-assurance-a-saturation-1m.mjs',
 'gov-intent-assurance-aggregate-check.mjs',
 'gov-intent-assurance-b-check.mjs',
 'gov-intent-assurance-b-saturation-1m.mjs',
 'gov-intent-assurance-c-check.mjs',
 'gov-intent-assurance-c-saturation-1m.mjs',
 'public-demo-boundary-check.mjs',
 'public-demo-deployment-matrix-check.mjs',
 'public-demo-fault-mutation-check.mjs',
 'public-demo-mutation-1m.mjs',
 'public-demo-runtime-check.mjs',
 'epistemic-lattice-check.mjs',
 'epistemic-lattice-saturation.mjs',
 'demo-suite-3-0-lattice-check.mjs',
 'demo-suite-3-0-module-check.mjs'
]);
const files=Object.freeze([...tramaFiles,...followupFiles]);
// Bounded R3/R4 single-owner moves from merged #266; not a complete v3 cutover.
// Reuse this executable historical-preimage verifier rather than opening a
// new source-of-truth, migration manifest, workflow or compatibility adapter.
const CANARY_BASE='3f2cce9c9ad2603288e11f541d280317961e5121';
const canaryMoves=Object.freeze([
 {previous:'v3/test-helpers/active-experience-install.mjs',
  current:'tests/helpers/active-experience-install.mjs',
  formerImport:"'./test-helpers/active-experience-install.mjs'",
  currentImport:"'../tests/helpers/active-experience-install.mjs'",
  consumers:['tests/ui/epistemic-inference-ui-check.mjs','tests/ui/cross-procedure-create-ui-check.mjs',
             'v3/v1-9-experience-check.mjs','tests/ui/epistemic-lattice-ui-check.mjs']},
 {previous:'v3/runtime/abuse-budget.mjs',current:'src/runtime/abuse-budget.mjs',
  formerImport:"'./runtime/abuse-budget.mjs'",
  currentImport:"'../src/runtime/abuse-budget.mjs'",
  consumers:['v3/server.mjs','v3/runtime-enterprise-boundaries-saturation.mjs',
             'v3/security-attack-saturation.mjs','v3/runtime-enterprise-boundaries-check.mjs']}
]);
function verifyCanaryMoves(at=root){
 const cards=[];
 for(const row of canaryMoves){
  const before=execFileSync('git',['show',CANARY_BASE+':'+row.previous],{cwd:root,maxBuffer:4*1024*1024});
  const current=readFileSync(join(at,row.current));
  assert.deepEqual(current,before,'R3/R4 relocated implementation bytes drift: '+row.current);
  assert.equal(existsSync(join(at,row.previous)),false,'R3/R4 retired path resurrected: '+row.previous);
  for(const rel of row.consumers){
   const body=readFileSync(join(at,rel),'utf8');
   const expectedImport=row.previous.startsWith('v3/test-helpers/')&&rel.startsWith('tests/ui/')
    ? "'../helpers/active-experience-install.mjs'" : row.currentImport;
   assert.ok(body.includes(expectedImport),'R3/R4 consumer not bound: '+rel);
   assert.equal(body.includes(row.formerImport),false,'R3/R4 consumer still points to retired path: '+rel);
  }
  cards.push({from:row.previous,to:row.current,blobEquality:'exact-git-preimage',consumers:row.consumers.length,
              noCompatibilityShim:true,externalConsumerAbsence:'UNKNOWN'});
 }
 return cards;
}
const canaryEvidence=verifyCanaryMoves();
const movedUiNames=Object.freeze([
 'epistemic-inference-ui-check.mjs',
 'epistemic-lattice-ui-check.mjs',
 'cross-procedure-create-ui-check.mjs'
]);
function migrateUiSource(source){
 return source.replace("'./test-helpers/active-experience-install.mjs'","'../helpers/active-experience-install.mjs'")
  .replaceAll("read('./public/","read('../../v3/public/");
}
function verifyRelocatedUi(at=root){
 const suite=readFileSync(join(at,'v3/current-release-suite.mjs'),'utf8');
 const cards=[];
 for(const name of movedUiNames){
  const former='v3/'+name,current='tests/ui/'+name;
  const before=execFileSync('git',['show',CANARY_BASE+':'+former],{cwd:root,maxBuffer:4*1024*1024}).toString('utf8');
  const actual=readFileSync(join(at,current),'utf8');
  assert.equal(actual,migrateUiSource(before),'R3 test source/path transform drift: '+current);
  assert.equal(existsSync(join(at,former)),false,'R3 retired check path resurrected: '+former);
  assert.ok(suite.includes("'"+current+"'"),'R3 current semantic test command missing: '+current);
  assert.equal(suite.includes("'"+former+"'"),false,'R3 old current suite path survives: '+former);
  cards.push({from:former,to:current,commandOwner:'v3/current-release-suite.mjs',
    importMetaUrlReroot:true,noShim:true,externalConsumerAbsence:'UNKNOWN'});
 }
 return cards;
}
const uiRelocationEvidence=verifyRelocatedUi();

const ENTERPRISE_BROWSER_BASE='02236f4304adb4f817d4ed1e1e8e9eeaf4159c3a';
const enterpriseBrowserMoves=Object.freeze([
 {name:'browser-enterprise-1-7-check.py',readers:['v3/enterprise-1-7-check.mjs']},
 {name:'browser-enterprise-1-8-check.py',readers:['v3/enterprise-1-8-check.mjs','v3/enterprise-claims.json','v3/enterprise-2-historical-contract-alignment-check.mjs']},
 {name:'browser-enterprise-2-check.py',readers:['v3/enterprise-2-check.mjs','v3/enterprise-2-process-check.mjs','v3/enterprise-2-editorial-check.mjs','v3/enterprise-2-design-system-check.mjs','v3/enterprise-2-historical-contract-alignment-check.mjs']},
 {name:'browser-enterprise-2-ui-standard-check.py',readers:['v3/enterprise-2-ui-standard-check.mjs','v3/enterprise-2-historical-contract-alignment-check.mjs']},
 {name:'browser-admin-check.py',readers:['v3/enterprise-claims.json']},
 {name:'browser-product-check.py',readers:['v3/enterprise-2-ui-standard-check.mjs','v3/enterprise-2-historical-contract-alignment-check.mjs']},
 {name:'browser-auditor-check.py',readers:['v3/reborn-3-check.mjs']},
 {name:'browser-enterprise-2-compliance-flow-check.py',readers:['v3/enterprise-2-compliance-flow-check.mjs']},
 {name:'browser-stable-1-4-check.py',readers:['v3/stable-1-4-check.mjs']},
 {name:'browser-standard-proof-check.py',readers:['v3/standard-proof-1-6-contract.json']},
 {name:'browser-v4-1-language-check.py',readers:['.github/workflows/v4-1-dod.yml']},
 {name:'browser-v4-enterprise-nexus-check.py',readers:['.github/workflows/v4-dod.yml']},
 {name:'browser-regulatory-surface.py',readers:['.github/workflows/s4-a6-ux4-semantic-surface.yml']},
 {name:'browser-business-surface-convergence-2-7.py',readers:['.github/workflows/business-surface-convergence-2-7.yml']},
 {name:'browser-s4-a4-admin-truth-closure.py',readers:['.github/workflows/s4-a4-admin-truth-closure.yml','v3/capability-closure-e2-contract.json']}
]);
const oldBrowserRoot='pathlib.Path(__file__).resolve().parents[1]';
const newBrowserRoot='pathlib.Path(__file__).resolve().parents[2]';
const enterpriseBrowserToken=(reader,name)=>(reader.endsWith('.json')||reader.startsWith('.github/workflows/'))
 ? {old:'v3/'+name,current:'tests/browser/'+name}
 : {old:'./'+name,current:'../tests/browser/'+name};
function verifyEnterpriseBrowserMoves(at=root){
 const result=[];
 for(const row of enterpriseBrowserMoves){
  const former='v3/'+row.name,current='tests/browser/'+row.name;
  const original=execFileSync('git',['show',ENTERPRISE_BROWSER_BASE+':'+former],{cwd:root,maxBuffer:2*1024*1024}).toString('utf8');
  const oldRoot=row.oldRoot||oldBrowserRoot,newRoot=row.newRoot||newBrowserRoot;
  assert.equal(original.split(oldRoot).length,2,'R3 source root preimage not unique: '+former);
  const expected=original.replace(oldRoot,newRoot);
  assert.equal(readFileSync(join(at,current),'utf8'),expected,'R3 enterprise browser source/root drift: '+current);
  assert.equal(existsSync(join(at,former)),false,'R3 enterprise browser former path resurrected: '+former);
  for(const reader of row.readers){
   const body=readFileSync(join(at,reader),'utf8'),token=enterpriseBrowserToken(reader,row.name);
   assert.ok(body.includes(token.current),'R3 enterprise browser consumer not rebound: '+reader+' -> '+row.name);
   assert.equal(body.includes(token.old),false,'R3 enterprise browser old consumer path survives: '+reader+' -> '+row.name);
  }
  result.push({previous:former,current,readers:row.readers.length,sourceTransform:'single-ancestor-path-rebind',externalConsumerAbsence:'UNKNOWN'});
 }
 return result;
}
const enterpriseBrowserEvidence=verifyEnterpriseBrowserMoves();

function gitV3TopLevelAt(revision){
 const paths=execFileSync('git',['ls-tree','-r','--name-only',revision,'--','v3/'],{cwd:root,maxBuffer:4*1024*1024}).toString('utf8');
 return new Set(paths.split(/\r?\n/).filter(rel=>/^v3\/[^/]+$/.test(rel)));
}
function verifyEnterpriseBrowserTreeDelta(){
 const before=gitV3TopLevelAt(ENTERPRISE_BROWSER_BASE);
 const after=gitV3TopLevelAt('HEAD');
 const retired=[...before].filter(rel=>!after.has(rel)).sort();
 const introduced=[...after].filter(rel=>!before.has(rel)).sort();
 const expected=enterpriseBrowserMoves.map(row=>'v3/'+row.name).sort();
 assert.deepEqual(retired,expected,'R3 enterprise browser Git-tree retirement delta drift');
 assert.deepEqual(introduced,[],'R3 enterprise browser Git-tree introduced unexpected v3 root path');
 assert.equal(before.size-after.size,enterpriseBrowserMoves.length,'R3 enterprise browser top-level contraction mismatch');
 return Object.freeze({baseSha:ENTERPRISE_BROWSER_BASE,oldTopLevel:before.size,newTopLevel:after.size,
   retiredPaths:retired,unexpectedIntroductions:introduced,externalConsumerAbsence:'UNKNOWN'});
}
const enterpriseBrowserGitCensus=verifyEnterpriseBrowserTreeDelta();
if(process.argv.includes('--diagnose=browser'))process.exit(0);




const digest=b=>createHash('sha256').update(b).digest('hex');

/** K2: actual retained synthetic fixture bytes at their new, single test owner.
 * All proofs are grounded in immutable Git preimages, not a second manifest authority. */
const K2_BLOB_FIXTURE_NAMES=Object.freeze(['README.md','manifest.json','source-note.txt']);
function verifyK2BlobFixtureBoundary(at=root){
 const origin='v3/blob-fixtures',destination='tests/fixtures/blobs';
 const evidence=[];
 for(const name of K2_BLOB_FIXTURE_NAMES){
  const oldPath=origin+'/'+name,newPath=destination+'/'+name;
  const historical=execFileSync('git',['show',ENTERPRISE_BROWSER_BASE+':'+oldPath],{cwd:root,maxBuffer:1024*1024});
  const current=readFileSync(join(at,newPath));
  assert.deepEqual(current,historical,'K2 synthetic blob fixture drift: '+newPath);
  assert.equal(existsSync(join(at,oldPath)),false,'K2 obsolete fixture path resurrected: '+oldPath);
  evidence.push({oldPath,newPath,sha256:digest(current),bytes:current.length,sourceByteParity:true});
 }
 const historicalAudit=execFileSync('git',['show',ENTERPRISE_BROWSER_BASE+':v3/blob-audit.mjs'],{cwd:root,maxBuffer:1024*1024}).toString('utf8');
 const oldToken="'v3/blob-fixtures'",newToken="'tests/fixtures/blobs'";
 assert.equal(historicalAudit.split(oldToken).length,2,'K2 blob-audit preimage path not unique');
 assert.equal(readFileSync(join(at,'v3/blob-audit.mjs'),'utf8'),historicalAudit.replace(oldToken,newToken),
  'K2 blob-audit consumer or behavior drift');
 const manifest=JSON.parse(readFileSync(join(at,destination,'manifest.json'),'utf8'));
 assert.equal(manifest.file,'source-note.txt','K2 fixture source file identity drift');
 const source=readFileSync(join(at,destination,manifest.file));
 assert.equal(digest(source),manifest.sha256,'K2 fixture declared content digest drift');
 assert.equal(source.length,manifest.bytes,'K2 fixture declared size drift');
 return evidence;
}
const k2BlobFixtures=verifyK2BlobFixtureBoundary();
function falsifyK2BlobFixtures(){
 const scratch=mkdtempSync(join(tmpdir(),'ictc-k2-blob-'));
 let killed=0;
 try{
  for(const name of K2_BLOB_FIXTURE_NAMES){
   const p=join(scratch,'tests/fixtures/blobs',name);
   mkdirSync(dirname(p),{recursive:true});
   writeFileSync(p,readFileSync(join(root,'tests/fixtures/blobs',name)));
  }
  mkdirSync(join(scratch,'v3'),{recursive:true});
  writeFileSync(join(scratch,'v3/blob-audit.mjs'),readFileSync(join(root,'v3/blob-audit.mjs')));
  assert.equal(verifyK2BlobFixtureBoundary(scratch).length,3,'K2 temporary preimage baseline failed');
  const corruptedSource=join(scratch,'tests/fixtures/blobs/source-note.txt');
  const good=readFileSync(corruptedSource);
  writeFileSync(corruptedSource,Buffer.concat([good,Buffer.from('\ncorrupted\n')]));
  try{verifyK2BlobFixtureBoundary(scratch);}catch(error){if(/fixture drift/.test(String(error.message)))killed++;else throw error;}
  writeFileSync(corruptedSource,good);
  const corruptedAudit=join(scratch,'v3/blob-audit.mjs');
  const goodAudit=readFileSync(corruptedAudit);
  writeFileSync(corruptedAudit,Buffer.concat([goodAudit,Buffer.from('\n// unauthorized path change\n')]));
  try{verifyK2BlobFixtureBoundary(scratch);}catch(error){if(/consumer or behavior drift/.test(String(error.message)))killed++;else throw error;}
  writeFileSync(corruptedAudit,goodAudit);
  const resurrected=join(scratch,'v3/blob-fixtures/README.md');
  mkdirSync(dirname(resurrected),{recursive:true});
  writeFileSync(resurrected,readFileSync(join(root,'tests/fixtures/blobs/README.md')));
  try{verifyK2BlobFixtureBoundary(scratch);}catch(error){if(/obsolete fixture path resurrected/.test(String(error.message)))killed++;else throw error;}
 }finally{rmSync(scratch,{recursive:true,force:true});}
 assert.equal(killed,3,'K2 physical negative mutants escaped');
 return killed;
}
const k2BlobPhysicalMutantsKilled=falsifyK2BlobFixtures();
if(process.argv.includes('--diagnose=blob'))process.exit(0);

/** K2: 12 immutable source chunks loaded by the actual runtime DEMO 2.2 owner. */
const K2_DEMO_PARTS=Object.freeze(Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')));
const K2_DEMO_BASE='v3/demo/',K2_DEMO_TARGET='tests/fixtures/demo-suite-2-2/';
const K2_DEMO_OLD_SEGMENT='../demo/demo-suite-2-2-fixture-';
const K2_DEMO_NEW_SEGMENT='../../tests/fixtures/demo-suite-2-2/demo-suite-2-2-fixture-';
function verifyK2DemoFixtureBoundary(at=root){
 const result=[],fragments=[];
 for(const part of K2_DEMO_PARTS){
  const name='demo-suite-2-2-fixture-'+part+'.b64',before=K2_DEMO_BASE+name,after=K2_DEMO_TARGET+name;
  const original=execFileSync('git',['show',ENTERPRISE_BROWSER_BASE+':'+before],{cwd:root,maxBuffer:1024*1024});
  const now=readFileSync(join(at,after));
  assert.deepEqual(now,original,'K2 DEMO chunk drift: '+after);
  assert.equal(existsSync(join(at,before)),false,'K2 DEMO old fixture path resurrected: '+before);
  result.push({part,oldPath:before,newPath:after,sha256:digest(now),bytes:now.length,sourceByteParity:true});
  fragments.push(now.toString('utf8'));
 }
 const oldLoader=execFileSync('git',['show',ENTERPRISE_BROWSER_BASE+':v3/runtime/demo-suite-2-2-fixture.mjs'],{cwd:root,maxBuffer:1024*1024}).toString('utf8');
 const oldWorkflow=execFileSync('git',['show',ENTERPRISE_BROWSER_BASE+':.github/workflows/demo-suite-2-2-runtime.yml'],{cwd:root,maxBuffer:1024*1024}).toString('utf8');
 assert.equal(oldLoader.split(K2_DEMO_OLD_SEGMENT).length,2,'K2 DEMO runtime loader preimage not unique');
 const oldWorkflowToken='v3/demo/demo-suite-2-2-fixture-*.b64';
 const newWorkflowToken='tests/fixtures/demo-suite-2-2/demo-suite-2-2-fixture-*.b64';
 assert.equal(oldWorkflow.split(oldWorkflowToken).length,2,'K2 DEMO CI preimage not unique');
 const actualLoader=readFileSync(join(at,'v3/runtime/demo-suite-2-2-fixture.mjs'),'utf8');
 const actualWorkflow=readFileSync(join(at,'.github/workflows/demo-suite-2-2-runtime.yml'),'utf8');
 assert.equal(actualLoader,oldLoader.replace(K2_DEMO_OLD_SEGMENT,K2_DEMO_NEW_SEGMENT),'K2 DEMO loader semantic drift');
 assert.equal(actualWorkflow,oldWorkflow.replace(oldWorkflowToken,newWorkflowToken),'K2 DEMO CI consumer drift');
 const combined=fragments.join('').replace(/\s+/g,'');
 const expectedSha=/encodedSha256:'([0-9a-f]{64})'/.exec(actualLoader)?.[1];
 assert.ok(expectedSha,'K2 DEMO canonical runtime SHA missing');
 assert.equal(digest(combined),expectedSha,'K2 DEMO combined encoded SHA drift');
 return result;
}
const k2DemoFixtures=verifyK2DemoFixtureBoundary();
function falsifyK2DemoFixtureBoundary(){
 const scratch=mkdtempSync(join(tmpdir(),'ictc-k2-demo-'));
 let killed=0;
 try{
  for(const part of K2_DEMO_PARTS){
   const file='demo-suite-2-2-fixture-'+part+'.b64',rel=K2_DEMO_TARGET+file,p=join(scratch,rel);
   mkdirSync(dirname(p),{recursive:true});writeFileSync(p,readFileSync(join(root,rel)));
  }
  for(const rel of ['v3/runtime/demo-suite-2-2-fixture.mjs','.github/workflows/demo-suite-2-2-runtime.yml']){
   const p=join(scratch,rel);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,readFileSync(join(root,rel)));
  }
  assert.equal(verifyK2DemoFixtureBoundary(scratch).length,12,'K2 DEMO scratch baseline failed');
  const runtimePath=join(scratch,'v3/runtime/demo-suite-2-2-fixture.mjs');
  const run=()=>spawnSync(process.execPath,[runtimePath],{cwd:scratch,encoding:'utf8',timeout:15000});
  const baseline=run();assert.equal(baseline.status,0,'K2 DEMO source-bound loader failed '+baseline.stderr);
  const source=join(scratch,K2_DEMO_TARGET+'demo-suite-2-2-fixture-01.b64');
  const original=readFileSync(source),mutant=Buffer.from(original);mutant[0]^=1;writeFileSync(source,mutant);
  if(run().status!==0)killed++;
  writeFileSync(source,original);
  assert.equal(run().status,0,'K2 DEMO loader did not recover after blob restoration');
  const validLoader=readFileSync(runtimePath,'utf8');
  writeFileSync(runtimePath,validLoader.replace(K2_DEMO_NEW_SEGMENT,'../../tests/fixtures/demo-suite-2-2/absent-'));
  if(run().status!==0)killed++;
  writeFileSync(runtimePath,validLoader);
  assert.equal(run().status,0,'K2 DEMO loader did not recover after URL restoration');
  const resurrected=join(scratch,K2_DEMO_BASE+'demo-suite-2-2-fixture-01.b64');
  mkdirSync(dirname(resurrected),{recursive:true});writeFileSync(resurrected,original);
  try{verifyK2DemoFixtureBoundary(scratch);}catch(e){if(/old fixture path resurrected/.test(String(e.message)))killed++;else throw e;}
 }finally{rmSync(scratch,{recursive:true,force:true});}
 assert.equal(killed,3,'K2 DEMO physically executed mutants escaped');
 return killed;
}
const k2DemoPhysicalMutantsKilled=falsifyK2DemoFixtureBoundary();
if(process.argv.includes('--diagnose=demo'))process.exit(0);


const wrapper=name=>['/** Stable command compatibility entrypoint; implementation lives under v3/tests/. */',"import './tests/"+name+"';",''].join('\n');
function relocate(source){
 return source.replace(/(\bfrom\s*['"])\.\//g,'$1../')
  .replace(/(\bimport\s*['"])\.\//g,'$1../')
  .replace(/new URL\((['"])(\.\.\/|\.\/)/g,(_,q,path)=>`new URL(${q}${path==='../'?'../../':'../'}`)
  .replaceAll("path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')","path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..')");
}
function baseline(name){
 return execFileSync('git',['show',(tramaFiles.includes(name)?BASE:BASE_POST)+':v3/'+name],{cwd:root,maxBuffer:2*1024*1024});
}
function verify(at=root){
 const cards=[];
 for(const name of files){
  const before=baseline(name),actualWrapper=readFileSync(join(at,'v3',name));
  const target=readFileSync(join(at,'v3/tests',name));
  assert.equal(actualWrapper.toString('utf8'),wrapper(name),'compatibility entrypoint drift: '+name);
  assert.equal(target.toString('utf8'),relocate(before.toString('utf8')),'logic or relative resolution drift: '+name);
  assert.notEqual(target.toString('utf8'),wrapper(name),'new test cannot be just a forwarder: '+name);
  cards.push({name,preimageSha256:digest(before),implementationSha256:digest(target),
    originalBytes:before.byteLength,compatibilityBytes:actualWrapper.byteLength,
    implementationBytes:target.byteLength,bytesMovedFromFlatRoot:before.byteLength-actualWrapper.byteLength,
    unchangedPublicEntrypoint:'v3/'+name,newTestPath:'v3/tests/'+name});
 }
 return cards;
}
const cards=verify(),flatBaselineBytes=cards.reduce((n,x)=>n+x.originalBytes,0);
const flatResidualBytes=cards.reduce((n,x)=>n+x.compatibilityBytes,0);
const recorded={physicalSourceGroup:files.length,preimageBytes:flatBaselineBytes,
 implementationBytes:cards.reduce((n,x)=>n+x.implementationBytes,0),
 rootAdapterBytes:flatResidualBytes,flatImplementationBytesRelocated:flatBaselineBytes-flatResidualBytes,
 executableCommandPathsPreserved:cards.length,deletedPaths:0,
 installedRuntimeModulesMoved:0,docsRewrittenAsRuntime:0,
 adaptersAreDelegationOnly:true,canonicalWritersAdded:0};

let negative=null,model=null;
if(process.argv.includes('--falsify')){
 const scratch=mkdtempSync(join(tmpdir(),'ictc-c1-3d-'));
 let killed=0,restored=0;
 let canaryMutantsKilled=0,enterpriseBrowserMutantsKilled=0;
 try{
  const mirror=join(scratch,'canary');
  for(const row of canaryMoves){
   for(const rel of [row.current,...row.consumers]){
    const source=join(root,rel),dest=join(mirror,rel);
    mkdirSync(dirname(dest),{recursive:true});
    writeFileSync(dest,readFileSync(source));
   }
  }
  assert.equal(verifyCanaryMoves(mirror).length,canaryMoves.length);
  for(const row of canaryMoves){
   const dest=join(mirror,row.current),before=readFileSync(dest);
   writeFileSync(dest,Buffer.concat([before,Buffer.from('\\n// real mutated implementation\\n')]));
   try{verifyCanaryMoves(mirror);assert.fail('R3/R4 physical code corruption survived: '+row.current);}
   catch(e){if(!String(e.message).includes('relocated implementation bytes drift'))throw e;canaryMutantsKilled++;}
   finally{writeFileSync(dest,before);}
   assert.equal(verifyCanaryMoves(mirror).length,canaryMoves.length);
  }
  assert.equal(canaryMutantsKilled,canaryMoves.length,'R3/R4 actual file mutations survived');
  // Three additional executable UI-check migrations: actual source bytes are
  // corrupted in the disposable checkout, then restored and re-verified.
  for(const rel of ['v3/current-release-suite.mjs',...movedUiNames.map(n=>'tests/ui/'+n)]){
   const dest=join(mirror,rel);
   mkdirSync(dirname(dest),{recursive:true});
   writeFileSync(dest,readFileSync(join(root,rel)));
  }
  assert.equal(verifyRelocatedUi(mirror).length,movedUiNames.length);
  for(const name of movedUiNames){
   const dest=join(mirror,'tests/ui',name),before=readFileSync(dest);
   writeFileSync(dest,Buffer.concat([before,Buffer.from('\\n// adversarial UI-check source mutation\\n')]));
   try{verifyRelocatedUi(mirror);assert.fail('R3 UI-check source corruption survived: '+name);}
   catch(e){if(!String(e.message).includes('R3 test source/path transform drift'))throw e;canaryMutantsKilled++;}
   finally{writeFileSync(dest,before);}
   assert.equal(verifyRelocatedUi(mirror).length,movedUiNames.length);
  }
  assert.equal(canaryMutantsKilled,canaryMoves.length+movedUiNames.length,'R3/R4 actual source modifications escaped');

  const enterpriseMirrorFiles=new Set(enterpriseBrowserMoves.flatMap(row=>['tests/browser/'+row.name,...row.readers]));
  for(const rel of enterpriseMirrorFiles){
   const dest=join(mirror,rel);mkdirSync(dirname(dest),{recursive:true});
   writeFileSync(dest,readFileSync(join(root,rel)));
  }
  assert.equal(verifyEnterpriseBrowserMoves(mirror).length,enterpriseBrowserMoves.length);
  for(const row of enterpriseBrowserMoves){
   const rel='tests/browser/'+row.name,dest=join(mirror,rel),original=readFileSync(dest);
   writeFileSync(dest,Buffer.concat([original,Buffer.from('\n# source mutant\n')]));
   try{verifyEnterpriseBrowserMoves(mirror);assert.fail('R3 enterprise browser mutant survived: '+rel);}
   catch(e){if(!String(e.message).includes('R3 enterprise browser source/root drift'))throw e;enterpriseBrowserMutantsKilled++;}
   finally{writeFileSync(dest,original);}
   const restoredLegacy=join(mirror,'v3',row.name);
   mkdirSync(dirname(restoredLegacy),{recursive:true});
   writeFileSync(restoredLegacy,original);
   try{verifyEnterpriseBrowserMoves(mirror);assert.fail('R3 enterprise old-path resurrection survived: '+row.name);}
   catch(e){if(!String(e.message).includes('R3 enterprise browser former path resurrected'))throw e;enterpriseBrowserMutantsKilled++;}
   finally{rmSync(restoredLegacy,{force:true});}
   for(const reader of row.readers){
    const token=enterpriseBrowserToken(reader,row.name),source=join(mirror,reader);
    const before=readFileSync(source,'utf8');
    assert.ok(before.includes(token.current),'R3 enterprise browser test precondition: '+reader);
    writeFileSync(source,before.replace(token.current,token.old));
    try{verifyEnterpriseBrowserMoves(mirror);assert.fail('R3 enterprise reader mutant survived: '+reader);}
    catch(e){if(!String(e.message).includes('R3 enterprise browser'))throw e;enterpriseBrowserMutantsKilled++;}
    finally{writeFileSync(source,before);}
   }
  }
  assert.equal(verifyEnterpriseBrowserMoves(mirror).length,enterpriseBrowserMoves.length);
  assert.equal(enterpriseBrowserMutantsKilled,enterpriseBrowserMoves.length*2+enterpriseBrowserMoves.reduce((n,row)=>n+row.readers.length,0),'R3 enterprise browser mutants survived');



  for(const card of cards){
   for(const kind of ['wrapper','implementation']){
    const dest=join(scratch,'v3',kind==='wrapper'?card.name:'tests/'+card.name);
    mkdirSync(dirname(dest),{recursive:true});
   }
   writeFileSync(join(scratch,'v3',card.name),readFileSync(join(root,'v3',card.name)));
   writeFileSync(join(scratch,'v3/tests',card.name),readFileSync(join(root,'v3/tests',card.name)));
  }
  assert.equal(verify(scratch).length,files.length);
  for(const name of files){
   for(const kind of ['wrapper','implementation']){
    const dest=join(scratch,'v3',kind==='wrapper'?name:'tests/'+name);
    const original=readFileSync(dest);
    writeFileSync(dest,Buffer.concat([original,Buffer.from('\n// adversarial mutation\n')]));
    try{verify(scratch);}catch(e){if(/drift/.test(String(e.message)))killed++;else throw e;}
    finally{writeFileSync(dest,original);}
    assert.equal(verify(scratch).length,files.length);restored++;
   }
  }
 }finally{rmSync(scratch,{recursive:true,force:true});}
 assert.equal(killed,files.length*2,'physical mutation survived');
 assert.equal(restored,files.length*2,'restoration not established');
 // Exact old/new command equivalence on a small real executable policy test,
 // not an assumption inferred from successful static parsing.
 const child=(path,args=[])=>spawnSync(process.execPath,[path,...args],{cwd:root,encoding:'utf8',timeout:120000});
 const runs=[
  ['trama-causal-qualification-check.mjs',[]],
  ['trama-causal-qualification-saturation-1m.mjs',['--trials','100000','--tail','10000','--seed','7000000000000104730']],
  ['gov-intent-assurance-aggregate-check.mjs',[]],
  ['public-demo-boundary-check.mjs',[]],
  ['epistemic-lattice-check.mjs',[]],
  ['demo-suite-3-0-module-check.mjs',[]]
 ].map(([name,args])=>{
  const old=child('v3/'+name,args),next=child('v3/tests/'+name,args);
  assert.equal(old.status,0,'old command failed '+name+' '+old.stderr);
  assert.equal(next.status,0,'new direct command failed '+name+' '+next.stderr);
  assert.equal(old.stdout,next.stdout,'command output changed: '+name);
  return {name,oldExit:old.status,newExit:next.status,stdoutSha256:digest(old.stdout)};
 });
 const uiExecutions=movedUiNames.map(name=>{
  const command='tests/ui/'+name,actual=child(command);
  assert.equal(actual.status,0,'relocated R3 executable UI oracle failed: '+name+' '+String(actual.stderr||actual.error||'').slice(-600));
  return {name,command,exit:actual.status,stdoutSha256:digest(actual.stdout),
          sourceByteParityAndReadRerootChecked:true};
 });
 negative={physicalMutantsKilled:killed,physicallyRestored:restored,realCommandEquivalence:runs,
  relocatedCanaryPhysicalMutantsKilled:canaryMutantsKilled,relocatedEnterpriseBrowserPhysicalMutantsKilled:enterpriseBrowserMutantsKilled,relocatedCanaryBlobParity:canaryEvidence,
  relocatedUiExecutableRuns:uiExecutions};
 const AXES=['logicBytes','stableEntrypoint','relativeResolution','singleAuthority','reversible'];
 const full=Object.fromEntries(AXES.map(x=>[x,true]));
 const decision=f=>AXES.every(k=>f[k]===true)?'RELOCATABLE_WITH_COMPAT':'HOLD';
 let seed=0x1c7c13d;
 const next=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 let killedCases=0,escaped=0,unsafePromotions=0;
 const failures=[false,null,undefined,'VERIFIED',0];
 for(let i=0;i<10_000_000;i++){
  const mutant={...full},hole=AXES[next()%AXES.length];
  mutant[hole]=failures[next()%failures.length];
  if(i%9===0)mutant[AXES[next()%AXES.length]]=null;
  if(decision(mutant)==='HOLD')killedCases++;else escaped++;
  if(decision({...full,[AXES[next()%AXES.length]]:null})!=='HOLD')unsafePromotions++;
 }
 let finite=0,finiteErrors=0;
 for(let n=0;n<3**AXES.length;n++){
  let id=n,verified=0;const f={};
  for(const k of AXES){const v=[false,true,null][id%3];id=Math.floor(id/3);f[k]=v;if(v===true)verified++;}
  const expected=verified===AXES.length?'RELOCATABLE_WITH_COMPAT':'HOLD';
  if(decision(f)!==expected)finiteErrors++;
  finite++;
 }
 const indispensable=AXES.filter(k=>decision({...full,[k]:null})==='HOLD');
 assert.equal(killedCases,10_000_000);assert.equal(escaped+unsafePromotions+finiteErrors,0);
 assert.equal(indispensable.length,5);
 model={seed:'0x1c7c13d',trials:10_000_000,killed:killedCases,escaped,unsafePromotions,
   finiteProfiles:finite,finiteErrors,indispensable,
   minimumFixedWidthDiagnosticBits:Math.ceil(Math.log2(finite)),
   noNoveltyRelativeToFiniteFiveAxisFamily:true,
   claimBoundary:'Only seeded in-memory five-axis scenarios. Physical disposable file mutations and six command comparisons are separate observations; no full-repository 10M source edits or external-URL evidence.'};
}
const result={schema:'ictc-c1-3d-test-relocation/v2',authorityEffect:'NONE',baseline:{trama:BASE,followup:BASE_POST},
 evidenceClass:'bounded-source-tree-and-disposable-counterfactual',...recorded,cards,
 migratedPhysicalCanaries:canaryEvidence,migratedUiCheckCanaries:uiRelocationEvidence,
 migratedEnterpriseBrowserCanaries:enterpriseBrowserEvidence,
 enterpriseBrowserGitCensus,k2BlobFixtures,k2BlobPhysicalMutantsKilled,k2DemoFixtures,k2DemoPhysicalMutantsKilled,
 negative,model,safeToDeleteAdapters:false,fullC13dClosed:false,
 remaining:{topLevelV3FilesBefore:enterpriseBrowserGitCensus.oldTopLevel,topLevelV3FilesAfter:enterpriseBrowserGitCensus.newTopLevel,
   totalV3VerificationLikeCandidatesBefore:447,
   selectedVerificationModules:files.length,remainingVerificationLikeCandidates:447-files.length,
   externalAndDynamicConsumers:'UNKNOWN',compatibilityRemoval:'BLOCKED'},
 claimBoundary:'Six TRAMA verifiers plus sixteen subsequently qualified GOV/public-demo/epistemic/DEMO verifiers have moved to v3/tests/ while stable old paths remain. Runtime import/path assumptions have explicit bounded rewrites. All other verifier families, external consumers, and adapter retirement remain OPEN. Neither model saturation nor CI alone closes global C1-3d.'};
mkdirSync(join(root,'artifacts'),{recursive:true});
writeFileSync(join(root,'artifacts/c1-3d-test-boundary.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({ok:true,selected:files.length,movedBytes:recorded.flatImplementationBytesRelocated,
 enterpriseBrowserPathsRetired:enterpriseBrowserGitCensus.retiredPaths.length,topLevelV3FilesAfter:enterpriseBrowserGitCensus.newTopLevel,
 physicalMutantsKilled:negative?.physicalMutantsKilled||0,realCommandComparisons:negative?.realCommandEquivalence.length||0,
 modelTrials:model?.trials||0,safeToDeleteAdapters:false,fullC13dClosed:false}));
