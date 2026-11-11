// E2 differential witness: run the REAL npm CycloneDX generator on an isolated,
// synthetic install tree assembled from the committed lockfile metadata. This
// does not fetch/execute packages and is NOT evidence of npm ci or vendor bytes.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSbomGraph} from './delivery-provenance-check.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const args=Object.fromEntries(process.argv.slice(2).filter(a=>a.startsWith('--')).map(a=>a.slice(2).split('=')));
const count=Number(args.cases??96),initialSeed=Number(args.seed??1430797)>>>0;
assert(Number.isSafeInteger(count)&&count>=1&&count<=10000,'bounded physical cases required');
const [pkg,lock]=await Promise.all(['package.json','package-lock.json'].map(async p=>JSON.parse(await readFile(path.join(root,p),'utf8'))));
const tmp=await mkdtemp(path.join(os.tmpdir(),'ictc-c2-native-'));
const tempRoot=path.join(tmp,'ictc');
let seed=initialSeed,accepted=0,killed=0,survivors=0,falseRejected=0;
const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0));
const sha=v=>createHash('sha256').update(v).digest('hex');
const tempLock=structuredClone(lock);
// The actual lock contains pg-native as an optional peer. The test has no
// native binary or network, so suppress just this optional-peer declaration
// in the isolated metadata tree; the ORIGINAL lock is used by the oracle.
const peer=tempLock.packages['node_modules/pg'];
assert(peer?.peerDependenciesMeta?.['pg-native']?.optional===true,'pg-native peer policy changed; requalify this fixture');
delete peer.peerDependencies;delete peer.peerDependenciesMeta;
const receipt={schemaVersion:'1.0.0',evidence:'E2-NATIVE-CLI-SYNTHETIC-INSTALL',seed:initialSeed,physicalCases:count,unmodifiedProductLockSha256:sha(JSON.stringify(lock)),note:'Real npm sbom CLI; temporary synthetic installed package metadata, no npm ci, no retrieved archive bytes. Optional pg-native peer metadata suppressed only in temporary fixture; production validator receives unmodified lock.'};
try{
 await mkdir(tempRoot,{recursive:true});
 await writeFile(path.join(tempRoot,'package.json'),JSON.stringify(pkg));
 await writeFile(path.join(tempRoot,'package-lock.json'),JSON.stringify(tempLock));
 for(const [p,entry] of Object.entries(tempLock.packages)){
  if(!p)continue;
  const folder=path.join(tempRoot,p);await mkdir(folder,{recursive:true});
  const name=p.slice(p.lastIndexOf('node_modules/')+'node_modules/'.length);
  const data={name,version:entry.version,license:entry.license,dependencies:entry.dependencies||{},optionalDependencies:entry.optionalDependencies||{},peerDependencies:entry.peerDependencies||{}};
  await writeFile(path.join(folder,'package.json'),JSON.stringify(data));
 }
 const npm=process.platform==='win32'?'npm.cmd':'npm';
 const run=spawnSync(npm,['sbom','--sbom-format','cyclonedx'],{cwd:tempRoot,encoding:'utf8',timeout:40000,maxBuffer:10*1024*1024,env:{...process.env,npm_config_offline:'true',npm_config_update_notifier:'false',npm_config_audit:'false'}});
 assert.equal(run.status,0,`real npm sbom failed: ${(run.stderr||run.error||'').toString().slice(0,1600)}`);
 const sbom=JSON.parse(run.stdout);const original=validateSbomGraph({pkg,lock,sbom});
 assert.equal(original.ok,true);
 receipt.realNpmOutputSha256=sha(run.stdout);receipt.nativeVersion=sbom.specVersion;
 receipt.realNpmCli=sbom.metadata.tools;receipt.nativeVerifiedGraph=original;
 const pg=sbom.components.find(c=>c.name==='pg'),pgTypes=sbom.components.find(c=>c.name==='pg-types');
 assert(pg&&pgTypes,'native generator lacks direct/transitive graph');
 const pgRef=pg['bom-ref'],typeRef=pgTypes['bom-ref'];
 const mutate=[
  ['wrong-pg-integrity',true,d=>{d.components.find(x=>x.name==='pg').hashes[0].content='0'.repeat(128);}],
  ['remove-pg-integrity',true,d=>{delete d.components.find(x=>x.name==='pg').hashes;}],
  ['wrong-transitive-integrity',true,d=>{d.components.find(x=>x.name==='pg-types').hashes[0].content='1'.repeat(128);}],
  ['wrong-pg-license',true,d=>{d.components.find(x=>x.name==='pg').licenses=[{license:{id:'GPL-3.0'}}];}],
  ['missing-transitive',true,d=>{d.components=d.components.filter(x=>x.name!=='pg-types');}],
  ['missing-relationship',true,d=>{const r=d.dependencies.find(x=>x.ref===pgRef);r.dependsOn=r.dependsOn.filter(x=>x!==typeRef);}],
  ['unknown-relationship',true,(d,i)=>{d.dependencies.find(x=>x.ref===pgRef).dependsOn.push(`unknown-${i}`);}],
  ['wrong-root',true,(d,i)=>{d.metadata.component.version=`0.0.${i+1}`;}],
  ['wrong-transitive-version',true,(d,i)=>{d.components.find(x=>x.name==='pg-types').version=`0.0.${i+1}`;}],
  ['native-serial-change',false,(d,i)=>{d.serialNumber=`urn:uuid:00000000-0000-4000-8000-${String(i).padStart(12,'0')}`;}],
  ['native-build-timestamp',false,(d,i)=>{d.metadata.timestamp=`2026-11-10T00:00:${String(i%60).padStart(2,'0')}Z`;}]
 ];
 const target=path.join(tmp,'mutated-native.cdx.json');const families={};
 for(let i=0;i<count;i++){
  const [id,negative,edit]=mutate[rng()%mutate.length];const variant=structuredClone(sbom);edit(variant,i);
  const bytes=JSON.stringify(variant);await writeFile(target,bytes); // real filesystem write, reread, full oracle
  const loaded=JSON.parse(await readFile(target,'utf8'));
  let ok=false;try{validateSbomGraph({pkg,lock,sbom:loaded});ok=true;}catch{}
  families[id]??={negative,count:0,killed:0,accepted:0};families[id].count++;
  if(ok){accepted++;families[id].accepted++;if(negative)survivors++;}
  else{families[id].killed++;if(negative)killed++;else falseRejected++;}
 }
 assert.equal(survivors,0,'mutants survived native source oracle');assert.equal(falseRejected,0,'valid source mutants rejected');
 Object.assign(receipt,{ok:true,physicalDiskWrites:count,negativeRejected:killed,positiveAccepted:accepted,negativeSurvivors:survivors,positiveRejected:falseRejected,families});
 await mkdir(path.join(root,'artifacts'),{recursive:true});
 await writeFile(path.join(root,'artifacts','delivery-native-cli-falsification.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({ok:true,physicalDiskWrites:count,negativeRejected:killed,positiveAccepted:accepted,nativeComponents:original.listedComponents,lockedDigestMatches:original.lockedDigestMatches,lockedLicenseMatches:original.lockedLicenseMatches,source:'actual npm CLI / synthetic package metadata'}));
}finally{await rm(tmp,{recursive:true,force:true});}
