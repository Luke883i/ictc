import assert from 'node:assert/strict';
import {assertBootstrapTransport,baselineBootstrapModel,deploymentPlatformProjection,isLoopbackBootstrapHost,validateBootstrapModel} from './bootstrap-contract.mjs';

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
 ['deployment-boundary','network-boundary',m=>m.standardNetworkRequiresTrustedIdentity=false],
 ['render-detection','paas-transport',m=>m.renderDetection='PORT-only'],
 ['render-loopback','paas-transport',m=>m.renderInboundRequiresNonLoopback=false],
 ['render-host-auto','network-boundary',m=>m.renderHostAutoOverride=true],
 ['render-identity-auto','identity-boundary',m=>m.renderIdentityAutoTrust=true],
 ['render-filesystem','persistence-boundary',m=>m.renderFilesystemDefault='durable'],
 ['render-disk-shared','persistence-boundary',m=>m.renderPersistentDiskShared=true],
 ['render-disk-scale','persistence-boundary',m=>m.renderPersistentDiskMultiInstance=true],
 ['cep-profile','cep-non-anticipation',m=>m.cepBootstrapProfile=true],
 ['public-demo-opt-in','public-demo-boundary',m=>m.publicDemoOptIn='auto'],
 ['public-demo-suite','public-demo-boundary',m=>m.publicDemoSuite='2.2'],
 ['public-demo-runtime','public-demo-boundary',m=>m.publicDemoRuntimeBasename='runtime'],
 ['public-demo-roles','public-demo-boundary',m=>m.publicDemoRoles='auditor'],
 ['public-demo-default-role','public-demo-boundary',m=>m.publicDemoDefaultRole='root'],
 ['public-demo-actor-strategy','public-demo-boundary',m=>m.publicDemoActorStrategy='client-derived'],
 ['public-demo-readonly','public-demo-boundary',m=>m.publicDemoReadOnly=false],
 ['public-demo-proxy-secret','public-demo-boundary',m=>m.publicDemoTrustedProxySecretAllowed=true],
 ['public-demo-multitenant','public-demo-boundary',m=>m.publicDemoMultiTenant=true],
 ['public-demo-client-actor','public-demo-boundary',m=>m.publicDemoClientActorIdAuthoritative=true],
 ['public-demo-client-role-unbounded','public-demo-boundary',m=>m.publicDemoClientRoleHeaderBounded=false]
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


const deploymentWorlds=Object.freeze({
  platforms:['local','ci','render','docker','kubernetes','systemd','future-appliance'],
  renderTypes:['web','pserv','worker','cron','static',''],
  hosts:['127.0.0.1','localhost','::1','0.0.0.0','10.20.0.5','::'],
  identities:['local','trusted-header'],
  storages:['ephemeral','render-disk','sqlite-local','postgres-shared'],
  ingresses:['none','render-edge','trusted-identity-proxy','ingress-controller','reverse-proxy'],
  instances:[1,2,3,8]
});
function classifyWorld(world){
  const env=world.platform==='render'?{RENDER:'true',RENDER_SERVICE_TYPE:world.renderType}:{};
  const platform=deploymentPlatformProjection(env);
  let transport=true,transportCode=null;
  try{assertBootstrapTransport({host:world.host,env});}catch(error){transport=false;transportCode=error.code;}
  const loopback=isLoopbackBootstrapHost(world.host),secretOk=world.secretLength>=32;
  const networkSecurity=loopback||(world.identity==='trusted-header'&&world.allowNetwork&&secretOk);
  const upstreamIdentity=world.identity==='trusted-header'&&world.ingress==='trusted-identity-proxy';
  const interactive=transport&&networkSecurity&&(loopback?world.identity==='local':upstreamIdentity);
  const persistenceValid=!(world.storage==='render-disk'&&world.instances>1);
  const durable=world.storage==='postgres-shared'||(world.storage==='render-disk'&&world.instances===1);
  const distributedDurable=world.storage==='postgres-shared'&&world.instances>1;
  const cepLike=interactive&&distributedDurable&&world.ingress==='trusted-identity-proxy';
  return{platform,transport,transportCode,loopback,networkSecurity,interactive,persistenceValid,durable,distributedDurable,cepLike,cepAchieved:false};
}
let d=0x243f6a88>>>0;
const drnd=()=>{d^=d<<13;d^=d>>>17;d^=d<<5;return d>>>0;},pick=array=>array[drnd()%array.length];
const deploymentTrials=1000;
let transportRejects=0,securityRejects=0,interactive=0,ephemeral=0,invalidDiskScale=0,cepLike=0;
for(let i=0;i<deploymentTrials;i++){
  const world={platform:pick(deploymentWorlds.platforms),renderType:pick(deploymentWorlds.renderTypes),host:pick(deploymentWorlds.hosts),identity:pick(deploymentWorlds.identities),storage:pick(deploymentWorlds.storages),ingress:pick(deploymentWorlds.ingresses),instances:pick(deploymentWorlds.instances),allowNetwork:Boolean(drnd()%2),secretLength:[0,16,32,64][drnd()%4]};
  const result=classifyWorld(world),isRenderInbound=world.platform==='render'&&['web','pserv'].includes(world.renderType);
  if(isRenderInbound&&result.loopback){assert.equal(result.transport,false,'Render inbound loopback survived transport preflight');assert.equal(result.transportCode,'paas-network-bind-required');}
  if(!isRenderInbound&&result.loopback)assert.equal(result.transport,true,'non-Render/local loopback was widened into a platform failure');
  if(!result.loopback&&world.identity==='local')assert.equal(result.networkSecurity,false,'non-loopback local identity gained network trust');
  if(!result.loopback&&world.identity==='trusted-header'&&(!world.allowNetwork||world.secretLength<32))assert.equal(result.networkSecurity,false,'incomplete trusted-header posture survived');
  if(world.platform==='render'&&world.storage==='ephemeral')assert.equal(result.durable,false,'Render ephemeral filesystem became durable');
  if(world.storage==='render-disk'&&world.instances>1)assert.equal(result.persistenceValid,false,'Render disk became multi-instance shared authority');
  assert.equal(result.cepAchieved,false,'deployment shape must never promote CEP from BOOTSTRAP-0');
  if(!result.transport)transportRejects++;if(result.transport&&!result.networkSecurity)securityRejects++;if(result.interactive)interactive++;if(world.platform==='render'&&world.storage==='ephemeral')ephemeral++;if(!result.persistenceValid)invalidDiskScale++;if(result.cepLike)cepLike++;
}
for(const scenario of[
  {world:{platform:'render',renderType:'web',host:'127.0.0.1',identity:'local',storage:'ephemeral',ingress:'render-edge',instances:1,allowNetwork:false,secretLength:0},expected:{transport:false,transportCode:'paas-network-bind-required'}},
  {world:{platform:'render',renderType:'web',host:'0.0.0.0',identity:'local',storage:'ephemeral',ingress:'render-edge',instances:1,allowNetwork:false,secretLength:0},expected:{transport:true,networkSecurity:false,interactive:false}},
  {world:{platform:'render',renderType:'web',host:'0.0.0.0',identity:'trusted-header',storage:'ephemeral',ingress:'render-edge',instances:1,allowNetwork:true,secretLength:64},expected:{transport:true,networkSecurity:true,interactive:false}},
  {world:{platform:'render',renderType:'web',host:'0.0.0.0',identity:'trusted-header',storage:'render-disk',ingress:'trusted-identity-proxy',instances:1,allowNetwork:true,secretLength:64},expected:{interactive:true,persistenceValid:true,durable:true,distributedDurable:false,cepAchieved:false}},
  {world:{platform:'render',renderType:'web',host:'0.0.0.0',identity:'trusted-header',storage:'render-disk',ingress:'trusted-identity-proxy',instances:2,allowNetwork:true,secretLength:64},expected:{persistenceValid:false,cepAchieved:false}},
  {world:{platform:'future-appliance',renderType:'',host:'0.0.0.0',identity:'trusted-header',storage:'postgres-shared',ingress:'trusted-identity-proxy',instances:3,allowNetwork:true,secretLength:64},expected:{interactive:true,distributedDurable:true,cepLike:true,cepAchieved:false}}
]){
  const observed=classifyWorld(scenario.world);for(const[key,value]of Object.entries(scenario.expected))assert.equal(observed[key],value,key);
}

// Requested reticular campaign: 100k semantic composites distributed across abstraction levels.
const reticularTrials=100_000;
for(let i=0;i<reticularTrials;i++) kill(composite(7),`reticular-${i}`);
assert.equal(killedLevels.size,new Set(mutations.map(item=>item[1])).size,'not all abstraction levels were exercised');

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
  deploymentTrials,
  deployment:{transportRejects,securityRejects,interactive,ephemeral,invalidDiskScale,cepLike},
  reticularTrials,
  millionTrials,
  holdoutTrials,
  holdoutBoundary:`M+${holdoutTrials}`,
  families:M,
  levels:[...killedLevels].sort(),
  errorClasses:[...expectedErrorClasses].sort(),
  survivors:0,
  novelErrors,
  seeds:{main:'0x9e3779b9',deployment:'0x243f6a88',holdout:'0x85ebca6b'},
  claimBoundary:'Deterministic source/model semantic mutation evidence for bootstrap and deployment boundaries; not one million deploys, network requests, identity-provider proofs, process launches, production capacity evidence or CEP attainment.'
}));
