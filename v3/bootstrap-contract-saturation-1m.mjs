import assert from 'node:assert/strict';
import {baselineBootstrapModel,validateBootstrapModel} from './bootstrap-contract.mjs';
const mutations=[
 ['authority',m=>m.authority='OTHER'],['node-major',m=>m.nodeMajor=20],['node-engine',m=>m.nodeEngine='>=20'],['package-manager',m=>m.packageManager='yarn'],['lock',m=>m.lock='yarn.lock'],
 ['profiles',m=>m.profiles=['standard']],['standard-runtime',m=>m.standardRuntime='.ictc/shared'],['demo-runtime',m=>m.demoRuntime=m.standardRuntime],['demo-suite',m=>m.demoSuite=''],['host',m=>m.defaultHost='0.0.0.0'],
 ['network-bypass',m=>m.networkBypass=true],['port-precedence',m=>m.portPrecedence='ICTC_PORT>PORT>4173'],['health',m=>m.healthPath='/health'],['npm-start',m=>m.npmStart='node v3/server.mjs'],['npm-demo',m=>m.npmDemo='node v3/server.mjs'],
 ['shell-direct',m=>m.shellDirectServer=true],['shell-bootstrap',m=>m.shellBootstrap=false],['devcontainer-host',m=>m.devcontainerHostOverride=true],['devcontainer-start',m=>m.devcontainerStart='./ictc.sh codespace'],['render-build',m=>m.renderBuild='yarn'],
 ['render-start',m=>m.renderStart='node v3/server.mjs'],['deployment-boundary',m=>m.publicNetworkRequiresTrustedIdentity=false]
];
for(const [id,mutate] of mutations){const m=structuredClone(baselineBootstrapModel());mutate(m);assert.equal(validateBootstrapModel(m).ok,false,`single mutation survived: ${id}`);}
let x=0x9e3779b9>>>0;const rnd=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
const trials=1_000_000;for(let i=0;i<trials;i++){const m=structuredClone(baselineBootstrapModel());const count=1+(rnd()%4);const used=new Set();for(let j=0;j<count;j++){let idx=rnd()%mutations.length;while(used.has(idx))idx=(idx+1)%mutations.length;used.add(idx);mutations[idx][1](m);}assert.equal(validateBootstrapModel(m).ok,false,`composite mutation survived at ${i}`);}
console.log(JSON.stringify({ok:true,suite:'bootstrap-contract-saturation',trials,families:mutations.length,survivors:0,seed:'0x9e3779b9',levels:['runtime-profile','package-toolchain','state-authority','network-boundary','command-graph','devcontainer','paas-command-projection']}));
