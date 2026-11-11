// C2 source-bound, deterministic negative/positive evidence for the existing validator.
// `--cases=N --physical=N --seed=N`; in-memory variants are not N independent Git patches.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateSbomGraph} from './delivery-provenance-check.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const options=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')).map(x=>{const [k,v]=x.slice(2).split('=');return [k,v??true];}));
const cases=Number(options.cases??80),physical=Number(options.physical??20),initialSeed=Number(options.seed??1430797)>>>0;
assert(Number.isSafeInteger(cases)&&cases>=1&&cases<=10000000,'invalid mutation count');
assert(Number.isSafeInteger(physical)&&physical>=0&&physical<=10000,'invalid physical count');
const [pkg,lock]=await Promise.all(['package.json','package-lock.json'].map(async p=>JSON.parse(await readFile(path.join(root,p),'utf8'))));
const packages=lock.packages;const mandatory=new Set();
function collect(p,seen=new Set()){
 if(seen.has(p))return;seen.add(p);
 const deps=packages[p]?.dependencies||{};
 for(const name of Object.keys(deps)){
  let target=p?`${p}/node_modules/${name}`:`node_modules/${name}`;
  if(!packages[target])target=`node_modules/${name}`;
  assert(packages[target],`required fixture dependency missing ${name}`);
  mandatory.add(target);collect(target,seen);
 }
}
collect('');
const formatRef=(name,version)=>`${name}@${version}`;
const pname=p=>p.slice(p.lastIndexOf('node_modules/')+'node_modules/'.length);
const rootRef=formatRef(pkg.name,pkg.version);
const component=p=>({type:'library','bom-ref':formatRef(pname(p),packages[p].version),name:pname(p),version:packages[p].version,purl:`pkg:npm/${pname(p)}@${packages[p].version}`,licenses:[{license:{id:packages[p].license||'NOASSERTION'}}]});
const requiredPaths=[...mandatory].sort();
function fixture(){
 const comps=requiredPaths.map(component),deps=[{ref:rootRef,dependsOn:Object.keys(pkg.dependencies||{}).map(name=>formatRef(name,packages[`node_modules/${name}`].version))}];
 for(const p of requiredPaths)deps.push({ref:formatRef(pname(p),packages[p].version),dependsOn:Object.keys(packages[p].dependencies||{}).map(name=>{
 const target=packages[`${p}/node_modules/${name}`]?`${p}/node_modules/${name}`:`node_modules/${name}`;
 return formatRef(name,packages[target].version);
 })});
 return {bomFormat:'CycloneDX',specVersion:'1.5',version:1,metadata:{tools:[{vendor:'npm',name:'cli',version:'10.9.2'}],component:{'bom-ref':rootRef,name:pkg.name,version:pkg.version,purl:`pkg:npm/${rootRef}`}},components:comps,dependencies:deps};
}
const base=fixture();assert.equal(validateSbomGraph({pkg,lock,sbom:base}).ok,true);
const pg=base.components.findIndex(c=>c.name==='pg');assert(pg>=0);
const transitive=base.components.findIndex(c=>c.name==='pg-types');assert(transitive>=0);
const pgRef=base.components[pg]['bom-ref'];
const pgTypeRef=base.components[transitive]['bom-ref'];
const getEdge=(f,t)=>f.dependencies.find(x=>x.ref===t);
let seed=initialSeed;function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const mutants=[
 {id:'root-version',negative:true,change:(d,i)=>d.metadata.component.version=`0.0.${i+1}`},
 {id:'root-purl',negative:true,change:(d,i)=>d.metadata.component.purl=`pkg:npm/ictc@wrong-${i}`},
 {id:'missing-generator',negative:true,change:d=>{d.metadata.tools=[];}},
 {id:'missing-direct',negative:true,change:d=>{d.components.splice(pg,1);}},
 {id:'missing-transitive',negative:true,change:d=>{d.components.splice(transitive,1);}},
 {id:'wrong-transitive-version',negative:true,change:(d,i)=>{d.components[transitive].version=`2.2.${i+1}`;}},
 {id:'wrong-transitive-purl',negative:true,change:(d,i)=>{d.components[transitive].purl=`pkg:npm/pg-types@2.2.${i+1}`;}},
 {id:'missing-transitive-edge',negative:true,change:d=>{getEdge(d,pgRef).dependsOn=getEdge(d,pgRef).dependsOn.filter(x=>x!==pgTypeRef);}},
 {id:'missing-root-edge',negative:true,change:d=>{d.dependencies[0].dependsOn=[];}},
 {id:'orphan-transitive-row',negative:true,change:d=>{d.dependencies=d.dependencies.filter(x=>x.ref!==pgTypeRef);}},
 {id:'duplicate-relationship',negative:true,change:d=>{d.dependencies.push(structuredClone(d.dependencies[1]));}},
 {id:'unknown-relationship-target',negative:true,change:(d,i)=>{getEdge(d,pgRef).dependsOn.push(`ghost@${i}`);}},
 {id:'duplicate-component-ref',negative:true,change:d=>{d.components[transitive]['bom-ref']=d.components[pg]['bom-ref'];}},
 {id:'unknown-component',negative:true,change:(d,i)=>{d.components.push({name:`ghost-${i}`,version:'1.0.0','bom-ref':`ghost-${i}@1.0.0`,purl:`pkg:npm/ghost-${i}@1.0.0`});}},
 {id:'missing-license-advisory',negative:false,change:d=>{delete d.components[pg].licenses;}},
 {id:'missing-hashes-advisory',negative:false,change:d=>{delete d.components[pg].hashes;}},
];
const runs=[];let killed=0,valid=0,survived=0,positiveRejected=0;
const sha=v=>createHash('sha256').update(v).digest('hex');
function evaluate(kind,index,raw){const d=JSON.parse(raw);let ok,reason='';try{validateSbomGraph({pkg,lock,sbom:d});ok=true;}catch(e){ok=false;reason=String(e.message).slice(0,170);}if(kind.negative){if(ok)survived++;else killed++;}else{if(ok)valid++;else positiveRejected++;}if(runs.length<100)runs.push({index,family:kind.id,negative:kind.negative,accepted:ok,reason,digest:sha(raw)});return ok;}
const start=process.hrtime.bigint();
// One input is materially rewritten and validated for each seed, not a counter-only simulation.
for(let i=0;i<cases;i++){
 const family=mutants[rng()%mutants.length],d=structuredClone(base);family.change(d,i);const raw=JSON.stringify(d);
 evaluate(family,i,raw);
}
const physicalFile=path.join(root,'artifacts','c2-semantic-mutant.cdx.json');await mkdir(path.dirname(physicalFile),{recursive:true});
let physicalRuns=0,physicalKilled=0;
try{
 for(let i=0;i<physical;i++){
  const family=mutants[i%mutants.length],d=structuredClone(base);family.change(d,i+cases);
  await writeFile(physicalFile,JSON.stringify(d,null,2)+'\n');
  const loaded=await readFile(physicalFile,'utf8');const ok=evaluate(family,cases+i,loaded);
  physicalRuns++;if(family.negative&&!ok)physicalKilled++;
 }
}finally{await unlink(physicalFile).catch(()=>{});}
const durationMs=Number(process.hrtime.bigint()-start)/1e6;
const report={schemaVersion:'1.0.0',seed:initialSeed,cases,physicalRuns,semanticFamilies:mutants.length,negativeDetected:killed,positiveAccepted:valid,negativeSurvivors:survived,positiveRejected,physicalKilled,sourceBase:'actual package.json and package-lock.json at candidate tree',durationMs:Math.round(durationMs),firstSamples:runs,boundary:'Deterministic actual JSON semantic mutations and on-disk JSON rewrites; not independently patched Git trees, not production npm install, not 2026 SBOM certification.'};
const dest=path.join(root,'artifacts','c2-semantic-falsification.json');await writeFile(dest,JSON.stringify(report,null,2)+'\n');
assert.equal(survived,0,`invalid C2 mutants survived: ${survived}`);assert.equal(positiveRejected,0,`valid C2 mutants rejected: ${positiveRejected}`);
console.log(JSON.stringify({ok:true,seed:initialSeed,cases,physicalRuns,negativeDetected:killed,positiveAccepted:valid,semanticFamilies:mutants.length,durationMs:report.durationMs}));
