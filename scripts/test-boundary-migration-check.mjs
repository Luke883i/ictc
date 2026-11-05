/** C1-3d: derived, zero-authority relocation witness for six existing TRAMA
 * command oracles. Never certifies physical deletion of compatibility paths. */
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const BASE='dcf90ae2a2610bcdefb98b6846b9758e7fae4c1d';
const files=Object.freeze([
 'trama-causal-qualification-check.mjs',
 'trama-causal-qualification-saturation-1m.mjs',
 'trama-engineering-check.mjs',
 'trama-engineering-saturation.mjs',
 'trama-reconcile-check.mjs',
 'trama-reconcile-saturation.mjs'
]);
const digest=b=>createHash('sha256').update(b).digest('hex');
const wrapper=name=>`/** Stable command compatibility entrypoint; implementation lives under v3/tests/. */
import './tests/${name}';
`;
function relocate(source){
 return source.replace(/(\bfrom\s*['"])\.\//g,'$1../')
  .replace(/(\bimport\s*['"])\.\//g,'$1../')
  .replace(/new URL\((['"])(\.\.\/|\.\/)/g,(_,q,path)=>`new URL(${q}${path==='../'?'../../':'../'}`);
}
function baseline(name){
 return execFileSync('git',['show',BASE+':v3/'+name],{cwd:root,maxBuffer:2*1024*1024});
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
 try{
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
  ['trama-causal-qualification-saturation-1m.mjs',['--trials','100000','--tail','10000','--seed','7000000000000104730']]
 ].map(([name,args])=>{
  const old=child('v3/'+name,args),next=child('v3/tests/'+name,args);
  assert.equal(old.status,0,'old command failed '+name+' '+old.stderr);
  assert.equal(next.status,0,'new direct command failed '+name+' '+next.stderr);
  assert.equal(old.stdout,next.stdout,'command output changed: '+name);
  return {name,oldExit:old.status,newExit:next.status,stdoutSha256:digest(old.stdout)};
 });
 negative={physicalMutantsKilled:killed,physicallyRestored:restored,realCommandEquivalence:runs};
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
   claimBoundary:'Only seeded in-memory five-axis scenarios. Twelve real disposable file mutations and two command comparisons are separate observations; no full-repository 10M source edits or external-URL evidence.'};
}
const result={schema:'ictc-c1-3d-test-relocation/v1',authorityEffect:'NONE',baseline:BASE,
 evidenceClass:'bounded-source-tree-and-disposable-counterfactual',...recorded,cards,
 negative,model,safeToDeleteAdapters:false,fullC13dClosed:false,
 remaining:{topLevelV3FilesBefore:678,topLevelV3FilesAfter:678,
   totalV3VerificationLikeCandidatesBefore:447,
   selectedVerificationModules:6,remainingVerificationLikeCandidates:441,
   externalAndDynamicConsumers:'UNKNOWN',compatibilityRemoval:'BLOCKED'},
 claimBoundary:'Six real TRAMA verifier implementations have moved to v3/tests/ with stable old paths. Repository-wide verifier separation, external consumer review, and adapter deletion remain OPEN. Neither model saturation nor a CI run closes C1 or C1-3d globally.'};
mkdirSync(join(root,'artifacts'),{recursive:true});
writeFileSync(join(root,'artifacts/c1-3d-test-boundary.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({ok:true,selected:6,movedBytes:recorded.flatImplementationBytesRelocated,
 physicalMutantsKilled:negative?.physicalMutantsKilled||0,realCommandComparisons:negative?.realCommandEquivalence.length||0,
 modelTrials:model?.trials||0,safeToDeleteAdapters:false,fullC13dClosed:false}));
