import assert from 'node:assert/strict';
import {baselineBootstrapModel,validateBootstrapModel} from './bootstrap-contract.mjs';

const mutations=[
 ['authority','runtime-profile',m=>m.authority='OTHER'],
 ['node-major','package-toolchain',m=>m.nodeMajor=20],
 ['node-engine','package-toolchain',m=>m.nodeEngine='>=20'],
 ['package-manager','package-toolchain',m=>m.packageManager='yarn'],
 ['lock','package-toolchain',m=>m.lock='yarn.lock'],
 ['profiles','runtime-profile',m=>m.profiles=['standard']],
 ['standard-runtime','state-authority',m=>m.standardRuntime='.ictc/shared'],
 ['demo-runtime','state-authority',m=>m.demoRuntime=m.standardRuntime],
 ['demo-suite','runtime-profile',m=>m.demoSuite=''],
 ['host','network-boundary',m=>m.defaultHost='0.0.0.0'],
 ['network-bypass','network-boundary',m=>m.networkBypass=true],
 ['port-precedence','runtime-profile',m=>m.portPrecedence='ICTC_PORT>PORT>4173'],
 ['health','runtime-profile',m=>m.healthPath='/health'],
 ['npm-start','command-graph',m=>m.npmStart='node v3/server.mjs'],
 ['npm-demo','command-graph',m=>m.npmDemo='node v3/server.mjs'],
 ['shell-direct','command-graph',m=>m.shellDirectServer=true],
 ['shell-bootstrap','command-graph',m=>m.shellBootstrap=false],
 ['devcontainer-host','devcontainer',m=>m.devcontainerHostOverride=true],
 ['devcontainer-start','devcontainer',m=>m.devcontainerStart='./ictc.sh codespace'],
 ['render-build','paas-command-projection',m=>m.renderBuild='yarn'],
 ['render-start','paas-command-projection',m=>m.renderStart='node v3/server.mjs'],
 ['deployment-boundary','network-boundary',m=>m.publicNetworkRequiresTrustedIdentity=false]
];

const M=mutations.length;
const knownErrorClasses=new Set();
const killedFamilies=new Set();
const killedLevels=new Set();
function kill(indices,label){
  const model=structuredClone(baselineBootstrapModel());
  for(const index of indices){
    const [id,level,mutate]=mutations[index];
    mutate(model); killedFamilies.add(id); killedLevels.add(level);
  }
  const result=validateBootstrapModel(model);
  assert.equal(result.ok,false,`${label} survived`);
  for(const error of result.errors) knownErrorClasses.add(error);
  return result.errors;
}

// 1 -> M depth saturation: every mutation depth from one family to the full reticulum must die.
for(let depth=1;depth<=M;depth++) kill(Array.from({length:depth},(_,i)=>i),`depth-${depth}`);
assert.equal(killedFamilies.size,M,'not all mutation families were killed');

let x=0x9e3779b9>>>0;
const rnd=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
function composite(maxDepth=6){
  const depth=1+(rnd()%Math.min(maxDepth,M));
  const used=new Set();
  while(used.size<depth) used.add(rnd()%M);
  return [...used];
}

// Requested reticular campaign: 100k semantic composites distributed across abstraction levels.
const reticularTrials=100_000;
for(let i=0;i<reticularTrials;i++) kill(composite(7),`reticular-${i}`);
assert.equal(killedLevels.size,7,'not all abstraction levels were exercised');

// Preserve the existing million-trial proof rail.
const millionTrials=1_000_000;
for(let i=0;i<millionTrials;i++) kill(composite(4),`million-${i}`);

// M + 10,000 holdout: use an independent deterministic seed and require no novel error class.
const expectedErrorClasses=new Set(knownErrorClasses);
let h=0x85ebca6b>>>0;
const holdoutRnd=()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return h>>>0;};
const holdoutTrials=10_000;
let novelErrors=0;
for(let i=0;i<holdoutTrials;i++){
  const depth=1+(holdoutRnd()%M),used=new Set();
  while(used.size<depth) used.add(holdoutRnd()%M);
  const model=structuredClone(baselineBootstrapModel());
  for(const index of used) mutations[index][2](model);
  const result=validateBootstrapModel(model);
  assert.equal(result.ok,false,`holdout-${i} survived`);
  for(const error of result.errors) if(!expectedErrorClasses.has(error)) novelErrors++;
}
assert.equal(novelErrors,0,'holdout discovered novel validator error classes');

console.log(JSON.stringify({
  ok:true,
  suite:'bootstrap-contract-saturation',
  M,
  depthSaturation:`1..${M}`,
  reticularTrials,
  millionTrials,
  holdoutTrials,
  holdoutBoundary:`M+${holdoutTrials}`,
  families:M,
  levels:[...killedLevels].sort(),
  errorClasses:[...expectedErrorClasses].sort(),
  survivors:0,
  novelErrors,
  seeds:{main:'0x9e3779b9',holdout:'0x85ebca6b'},
  claimBoundary:'Deterministic source/model semantic mutation evidence; not deployment, network, identity-provider or process-launch assurance.'
}));
