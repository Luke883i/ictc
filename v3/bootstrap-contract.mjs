const RENDER_INBOUND_SERVICE_TYPES=Object.freeze(['web','pserv']);

export const BOOTSTRAP_CONTRACT=Object.freeze({
  schemaVersion:'1.3.0',
  authority:'BOOTSTRAP-0',
  node:Object.freeze({engine:'>=22.16.0',major:22}),
  packageManager:'npm',
  defaults:Object.freeze({host:'127.0.0.1',port:4173,healthPath:'/api/health'}),
  profiles:Object.freeze({
    standard:Object.freeze({runtimeRelative:'.ictc/runtime',demoSuite:''}),
    demo:Object.freeze({runtimeRelative:'.ictc/demo-runtime-3-0',demoSuite:'3.0'})
  }),
  deprecatedDemo:Object.freeze({suiteVersion:'2.2',runtimeRelative:'.ictc/demo-runtime-2-2',selection:'explicit-env-only'}),
  precedence:Object.freeze({port:['PORT','ICTC_PORT','4173'],runtime:['ICTC_RUNTIME_DIR','ICTC_STATE_DIR/profile','repo/.ictc/profile'],host:['ICTC_HOST','127.0.0.1']}),
  platforms:Object.freeze({
    render:Object.freeze({detection:'RENDER=true',inboundServiceTypes:RENDER_INBOUND_SERVICE_TYPES,requiredBind:'non-loopback',hostAutoOverride:false,identityAutoTrust:false,filesystemDefault:'ephemeral',persistentDiskShared:false,persistentDiskMultiInstance:false})
  }),
  publicDemo:Object.freeze({optIn:'ICTC_PUBLIC_DEMO=1',suite:'3.0',runtimeBasename:'demo-runtime-3-0',roles:Object.freeze(['admin','user','auditor']),defaultRole:'auditor',actorStrategy:'server-derived-by-role',anonymous:true,readOnly:true,syntheticOnly:true,multiTenant:false,clientActorIdAuthoritative:false,clientRoleHeaderBounded:true,trustedProxySecretAllowed:false}),
  commands:Object.freeze({
    install:'npm ci --ignore-scripts',
    build:'npm run build',
    start:'npm start',
    demo:'npm run demo',
    supervisorStart:'./ictc.sh start',
    supervisorDemo:'./ictc.sh demo',
    renderBuild:'npm ci --ignore-scripts && npm run build',
    renderStart:'npm start'
  }),
  invariants:Object.freeze([
    'standard-demo-same-application-bytes',
    'standard-demo-state-isolated',
    'demo-command-selects-suite-3-0',
    'suite-2-2-explicit-only-deprecated',
    'npm-and-shell-share-foreground-bootstrap',
    'no-bootstrap-network-boundary-bypass',
    'platform-port-precedes-local-port-alias',
    'health-authority-api-health',
    'npm-lock-authoritative',
    'devcontainer-remains-loopback',
    'standard-network-deployment-requires-existing-trusted-identity-boundary',
    'public-demo-network-exception-is-explicit-synthetic-read-only',
    'public-demo-runtime-remains-suite-3-0-isolated',
    'public-demo-bounded-role-projection-uses-server-derived-actors',
    'public-demo-never-consumes-trusted-proxy-secret',
    'public-demo-single-tenant-only',
    'platform-detection-never-grants-network-or-identity-trust',
    'render-inbound-loopback-fails-before-server-import',
    'render-storage-posture-does-not-promote-enterprise-readiness'
  ])
});

export function isLoopbackBootstrapHost(value){const host=String(value||'').trim().toLowerCase();return host==='::1'||host==='localhost'||host==='127.0.0.1'||host.startsWith('127.')||host.startsWith('::ffff:127.');}

export function deploymentPlatformProjection(env={}){
  const render=String(env.RENDER||'').trim().toLowerCase()==='true';
  const serviceType=render?String(env.RENDER_SERVICE_TYPE||'').trim().toLowerCase():'';
  const inbound=render&&RENDER_INBOUND_SERVICE_TYPES.includes(serviceType);
  return Object.freeze({provider:render?'render':'generic',serviceType:serviceType||null,inbound,requiresNonLoopback:inbound});
}

export function assertBootstrapTransport({host,env={}}={}){
  const platform=deploymentPlatformProjection(env);
  if(platform.requiresNonLoopback&&isLoopbackBootstrapHost(host))throw Object.assign(new Error(`Render ${platform.serviceType} service requires ICTC_HOST=0.0.0.0 (or another non-loopback bind host) so the platform proxy can reach ICTC. BOOTSTRAP-0 never widens the bind automatically; the runtime must still authorize either the standard trusted-identity boundary or the explicit synthetic read-only Public DEMO boundary.`),{code:'paas-network-bind-required',platform:platform.provider,serviceType:platform.serviceType});
  return platform;
}

export function resolveBootstrap({requested='auto',env={},root='.'}={}){
  if(!['auto','demo'].includes(requested))throw Object.assign(new Error(`Unknown bootstrap profile: ${requested}`),{code:'bootstrap-profile-unknown'});
  const envSuite=String(env.ICTC_DEMO_SUITE||'').trim();
  if(envSuite&&!['2.2','3.0'].includes(envSuite))throw Object.assign(new Error(`Unknown DEMO suite: ${envSuite}`),{code:'bootstrap-demo-suite-unknown'});
  const demoSuite=requested==='demo'?'3.0':envSuite;
  const demo=Boolean(demoSuite),profile=demo?'demo':'standard';
  const stateDir=env.ICTC_STATE_DIR||`${root}/.ictc`;
  const runtimeDir=env.ICTC_RUNTIME_DIR||`${stateDir}/${demo?(demoSuite==='2.2'?'demo-runtime-2-2':'demo-runtime-3-0'):'runtime'}`;
  return Object.freeze({profile,runtimeDir,port:String(env.PORT||env.ICTC_PORT||BOOTSTRAP_CONTRACT.defaults.port),host:env.ICTC_HOST||BOOTSTRAP_CONTRACT.defaults.host,demoSuite:demo?demoSuite:''});
}

export function validateBootstrapModel(model){
  const errors=[]; const fail=(id)=>errors.push(id);
  if(model?.authority!=='BOOTSTRAP-0')fail('authority');
  if(model?.nodeMajor!==22||model?.nodeEngine!=='>=22.16.0')fail('node');
  if(model?.packageManager!=='npm'||model?.lock!=='package-lock.json')fail('package-manager');
  if(model?.profiles?.join(',')!=='standard,demo')fail('profiles');
  if(model?.standardRuntime!=='.ictc/runtime'||model?.demoRuntime!=='.ictc/demo-runtime-3-0'||model?.standardRuntime===model?.demoRuntime)fail('state-isolation');
  if(model?.demoSuite!=='3.0'||model?.deprecatedDemoSuite!=='2.2')fail('demo-suite');
  if(model?.defaultHost!=='127.0.0.1'||model?.networkBypass!==false)fail('network-boundary');
  if(model?.portPrecedence!=='PORT>ICTC_PORT>4173')fail('port-precedence');
  if(model?.healthPath!=='/api/health')fail('health');
  if(model?.npmStart!=='node v3/bootstrap.mjs'||model?.npmDemo!=='node v3/bootstrap.mjs demo')fail('npm-entry');
  if(model?.shellDirectServer!==false||model?.shellBootstrap!==true)fail('shell-entry');
  if(model?.devcontainerHostOverride!==false||model?.devcontainerStart!=='./ictc.sh start --no-open')fail('devcontainer');
  if(model?.renderBuild!=='npm ci --ignore-scripts && npm run build'||model?.renderStart!=='npm start')fail('render');
  if(model?.standardNetworkRequiresTrustedIdentity!==true)fail('deployment-boundary');
  if(model?.publicDemoOptIn!=='ICTC_PUBLIC_DEMO=1'||model?.publicDemoSuite!=='3.0'||model?.publicDemoRuntimeBasename!=='demo-runtime-3-0'||model?.publicDemoRoles!=='admin,user,auditor'||model?.publicDemoDefaultRole!=='auditor'||model?.publicDemoActorStrategy!=='server-derived-by-role'||model?.publicDemoReadOnly!==true||model?.publicDemoAnonymous!==true||model?.publicDemoSyntheticOnly!==true||model?.publicDemoTrustedProxySecretAllowed!==false||model?.publicDemoMultiTenant!==false||model?.publicDemoClientActorIdAuthoritative!==false||model?.publicDemoClientRoleHeaderBounded!==true)fail('public-demo-boundary');
  if(model?.renderDetection!=='RENDER=true+RENDER_SERVICE_TYPE:web|pserv'||model?.renderInboundRequiresNonLoopback!==true)fail('render-transport');
  if(model?.renderHostAutoOverride!==false||model?.renderIdentityAutoTrust!==false)fail('render-no-auto-trust');
  if(model?.renderFilesystemDefault!=='ephemeral'||model?.renderPersistentDiskShared!==false||model?.renderPersistentDiskMultiInstance!==false)fail('render-storage-boundary');
  if(model?.cepBootstrapProfile!==false)fail('cep-non-anticipation');
  return {ok:errors.length===0,errors};
}

export function baselineBootstrapModel(){return {
  authority:'BOOTSTRAP-0',nodeMajor:22,nodeEngine:'>=22.16.0',packageManager:'npm',lock:'package-lock.json',profiles:['standard','demo'],
  standardRuntime:'.ictc/runtime',demoRuntime:'.ictc/demo-runtime-3-0',demoSuite:'3.0',deprecatedDemoSuite:'2.2',defaultHost:'127.0.0.1',networkBypass:false,
  portPrecedence:'PORT>ICTC_PORT>4173',healthPath:'/api/health',npmStart:'node v3/bootstrap.mjs',npmDemo:'node v3/bootstrap.mjs demo',
  shellDirectServer:false,shellBootstrap:true,devcontainerHostOverride:false,devcontainerStart:'./ictc.sh start --no-open',
  renderBuild:'npm ci --ignore-scripts && npm run build',renderStart:'npm start',standardNetworkRequiresTrustedIdentity:true,
  publicDemoOptIn:'ICTC_PUBLIC_DEMO=1',publicDemoSuite:'3.0',publicDemoRuntimeBasename:'demo-runtime-3-0',publicDemoRoles:'admin,user,auditor',publicDemoDefaultRole:'auditor',publicDemoActorStrategy:'server-derived-by-role',publicDemoReadOnly:true,publicDemoAnonymous:true,publicDemoSyntheticOnly:true,publicDemoTrustedProxySecretAllowed:false,publicDemoMultiTenant:false,publicDemoClientActorIdAuthoritative:false,publicDemoClientRoleHeaderBounded:true,
  renderDetection:'RENDER=true+RENDER_SERVICE_TYPE:web|pserv',renderInboundRequiresNonLoopback:true,renderHostAutoOverride:false,renderIdentityAutoTrust:false,
  renderFilesystemDefault:'ephemeral',renderPersistentDiskShared:false,renderPersistentDiskMultiInstance:false,cepBootstrapProfile:false
};}
