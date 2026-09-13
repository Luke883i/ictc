export const BOOTSTRAP_CONTRACT=Object.freeze({
  schemaVersion:'1.0.0',
  authority:'BOOTSTRAP-0',
  node:Object.freeze({engine:'>=22.16.0',major:22}),
  packageManager:'npm',
  defaults:Object.freeze({host:'127.0.0.1',port:4173,healthPath:'/api/health'}),
  profiles:Object.freeze({
    standard:Object.freeze({runtimeRelative:'.ictc/runtime',demoSuite:''}),
    demo:Object.freeze({runtimeRelative:'.ictc/demo-runtime-2-2',demoSuite:'2.2'})
  }),
  precedence:Object.freeze({port:['PORT','ICTC_PORT','4173'],runtime:['ICTC_RUNTIME_DIR','ICTC_STATE_DIR/profile','repo/.ictc/profile'],host:['ICTC_HOST','127.0.0.1']}),
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
    'npm-and-shell-share-foreground-bootstrap',
    'no-bootstrap-network-boundary-bypass',
    'platform-port-precedes-local-port-alias',
    'health-authority-api-health',
    'npm-lock-authoritative',
    'devcontainer-remains-loopback',
    'network-deployment-requires-existing-trusted-identity-boundary'
  ])
});


export function resolveBootstrap({requested='auto',env={},root='.'}={}){
  if(!['auto','demo'].includes(requested))throw Object.assign(new Error(`Unknown bootstrap profile: ${requested}`),{code:'bootstrap-profile-unknown'});
  const demo=requested==='demo'||env.ICTC_DEMO_SUITE==='2.2';
  const profile=demo?'demo':'standard',spec=BOOTSTRAP_CONTRACT.profiles[profile];
  const stateDir=env.ICTC_STATE_DIR||`${root}/.ictc`;
  const runtimeDir=env.ICTC_RUNTIME_DIR||`${stateDir}/${profile==='demo'?'demo-runtime-2-2':'runtime'}`;
  return Object.freeze({profile,runtimeDir,port:String(env.PORT||env.ICTC_PORT||BOOTSTRAP_CONTRACT.defaults.port),host:env.ICTC_HOST||BOOTSTRAP_CONTRACT.defaults.host,demoSuite:spec.demoSuite});
}

export function validateBootstrapModel(model){
  const errors=[]; const fail=(id)=>errors.push(id);
  if(model?.authority!=='BOOTSTRAP-0')fail('authority');
  if(model?.nodeMajor!==22||model?.nodeEngine!=='>=22.16.0')fail('node');
  if(model?.packageManager!=='npm'||model?.lock!=='package-lock.json')fail('package-manager');
  if(model?.profiles?.join(',')!=='standard,demo')fail('profiles');
  if(model?.standardRuntime!=='.ictc/runtime'||model?.demoRuntime!=='.ictc/demo-runtime-2-2'||model?.standardRuntime===model?.demoRuntime)fail('state-isolation');
  if(model?.demoSuite!=='2.2')fail('demo-suite');
  if(model?.defaultHost!=='127.0.0.1'||model?.networkBypass!==false)fail('network-boundary');
  if(model?.portPrecedence!=='PORT>ICTC_PORT>4173')fail('port-precedence');
  if(model?.healthPath!=='/api/health')fail('health');
  if(model?.npmStart!=='node v3/bootstrap.mjs'||model?.npmDemo!=='node v3/bootstrap.mjs demo')fail('npm-entry');
  if(model?.shellDirectServer!==false||model?.shellBootstrap!==true)fail('shell-entry');
  if(model?.devcontainerHostOverride!==false||model?.devcontainerStart!=='./ictc.sh start --no-open')fail('devcontainer');
  if(model?.renderBuild!=='npm ci --ignore-scripts && npm run build'||model?.renderStart!=='npm start')fail('render');
  if(model?.publicNetworkRequiresTrustedIdentity!==true)fail('deployment-boundary');
  return {ok:errors.length===0,errors};
}

export function baselineBootstrapModel(){return {
  authority:'BOOTSTRAP-0',nodeMajor:22,nodeEngine:'>=22.16.0',packageManager:'npm',lock:'package-lock.json',profiles:['standard','demo'],
  standardRuntime:'.ictc/runtime',demoRuntime:'.ictc/demo-runtime-2-2',demoSuite:'2.2',defaultHost:'127.0.0.1',networkBypass:false,
  portPrecedence:'PORT>ICTC_PORT>4173',healthPath:'/api/health',npmStart:'node v3/bootstrap.mjs',npmDemo:'node v3/bootstrap.mjs demo',
  shellDirectServer:false,shellBootstrap:true,devcontainerHostOverride:false,devcontainerStart:'./ictc.sh start --no-open',
  renderBuild:'npm ci --ignore-scripts && npm run build',renderStart:'npm start',publicNetworkRequiresTrustedIdentity:true
};}
