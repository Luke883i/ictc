import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

const sourcePath=new URL('./runtime/public-demo.mjs',import.meta.url);
const source=await readFile(sourcePath,'utf8');
const mutations=[
 ['actor-constant',"PUBLIC_DEMO_ACTOR_ID='local-auditor'","PUBLIC_DEMO_ACTOR_ID='local-admin'"],
 ['role-constant',"PUBLIC_DEMO_ROLE='auditor'","PUBLIC_DEMO_ROLE='user'"],
 ['suite-constant',"PUBLIC_DEMO_SUITE='3.0'","PUBLIC_DEMO_SUITE='2.2'"],
 ['runtime-constant',"PUBLIC_DEMO_RUNTIME_BASENAME='demo-runtime-3-0'","PUBLIC_DEMO_RUNTIME_BASENAME='runtime'"],
 ['opt-in-invert',"env.ICTC_PUBLIC_DEMO==='1'","env.ICTC_PUBLIC_DEMO!=='1'"],
 ['off-valid-false','enabled:false,valid:true','enabled:false,valid:false'],
 ['off-readonly-true','readOnly:false,anonymous:false','readOnly:true,anonymous:false'],
 ['suite-condition-invert','suite!==PUBLIC_DEMO_SUITE','suite===PUBLIC_DEMO_SUITE'],
 ['runtime-check-remove',"if(path.basename(runtimeDir)!==PUBLIC_DEMO_RUNTIME_BASENAME)errors.push","if(false&&path.basename(runtimeDir)!==PUBLIC_DEMO_RUNTIME_BASENAME)errors.push"],
 ['bind-condition-invert',"env.ICTC_ALLOW_NETWORK_BIND!=='1'","env.ICTC_ALLOW_NETWORK_BIND==='1'"],
 ['identity-check-remove','if(identityMode)errors.push','if(false&&identityMode)errors.push'],
 ['secret-check-remove','if(proxySecret)errors.push','if(false&&proxySecret)errors.push'],
 ['multi-check-remove','if(multiTenant)errors.push','if(false&&multiTenant)errors.push'],
 ['actor-switch-check-remove','if(actorSwitch)errors.push','if(false&&actorSwitch)errors.push'],
 ['tenant-switch-check-remove','if(tenantSwitch)errors.push','if(false&&tenantSwitch)errors.push'],
 ['valid-always','valid:errors.length===0','valid:errors.length>=0'],
 ['enabled-readonly-false','readOnly:true,anonymous:true','readOnly:false,anonymous:true'],
 ['anonymous-false','anonymous:true,syntheticOnly:true','anonymous:false,syntheticOnly:true'],
 ['synthetic-false','anonymous:true,syntheticOnly:true','anonymous:true,syntheticOnly:false'],
 ['error-order-last','const code=posture.errors[0]','const code=posture.errors.at(-1)'],
 ['permission-admin','permissions?.[PUBLIC_DEMO_ROLE]','permissions?.admin'],
 ['actor-id-inline-admin',"id:PUBLIC_DEMO_ACTOR_ID,role:PUBLIC_DEMO_ROLE","id:'local-admin',role:PUBLIC_DEMO_ROLE"],
 ['actor-role-inline-admin',"id:PUBLIC_DEMO_ACTOR_ID,role:PUBLIC_DEMO_ROLE","id:PUBLIC_DEMO_ACTOR_ID,role:'admin'"],
 ['identity-mode-local',"identityMode:'public-demo'","identityMode:'local'"],
 ['identity-strategy-local',"identityStrategy:'fixed-public-demo'","identityStrategy:'local'"],
 ['permissions-admin-return','permissions:Object.freeze([...permissionSet])','permissions:Object.freeze([...permissions.admin])'],
 ['default-method-post',"request?.method||'GET'","request?.method||'POST'"],
 ['allow-post',"['GET','HEAD'].includes(method)","['GET','HEAD','POST'].includes(method)"],
 ['deny-head',"['GET','HEAD'].includes(method)","['GET'].includes(method)"],
 ['readonly-status-200',"status:405,code:'public-demo-read-only'","status:200,code:'public-demo-read-only'"],
 ['readonly-code-forbidden',"code:'public-demo-read-only'","code:'forbidden'"],
 ['config-return-invert','if(!enabled)return Object.freeze','if(enabled)return Object.freeze'],
 ['assert-valid-invert','posture.enabled&&!posture.valid','posture.enabled&&posture.valid'],
 ['actor-enabled-invert','if(!posture.enabled)return null','if(posture.enabled)return null'],
 ['permission-check-invert','if(!(permissionSet instanceof Set))throw','if(permissionSet instanceof Set)throw'],
 ['request-enabled-invert','if(!posture.enabled)return posture','if(posture.enabled)return posture']
];
const valid=()=>({ICTC_PUBLIC_DEMO:'1',ICTC_DEMO_SUITE:'3.0',ICTC_RUNTIME_DIR:'/tmp/ictc/demo-runtime-3-0',ICTC_ALLOW_NETWORK_BIND:'1'});
const permissions={admin:new Set(['read','manage-enterprise']),user:new Set(['read','contribute-grc']),auditor:new Set(['read','verify-integrity'])};
function expectCode(fn,code,status){try{fn();return false;}catch(e){return e?.code===code&&(status==null||e?.status===status);}}
function semanticOracle(m){
  try{
    const off=m.publicDemoConfiguration({});if(off.enabled||!off.valid||off.readOnly||off.anonymous||off.syntheticOnly)return false;
    const good=m.publicDemoConfiguration(valid());if(!good.enabled||!good.valid||!good.readOnly||!good.anonymous||!good.syntheticOnly||good.suite!=='3.0'||path.basename(good.runtimeDir)!=='demo-runtime-3-0'||good.role!=='auditor'||good.actorId!=='local-auditor')return false;
    const actor=m.publicDemoActor(permissions,valid());if(actor.id!=='local-auditor'||actor.role!=='auditor'||actor.identityMode!=='public-demo'||actor.identityStrategy!=='fixed-public-demo'||actor.permissions.includes('manage-enterprise')||!actor.permissions.includes('verify-integrity'))return false;
    if(!m.assertPublicDemoRequestBoundary({method:'GET'},valid()).valid)return false;
    if(!m.assertPublicDemoRequestBoundary({method:'HEAD'},valid()).valid)return false;
    if(!expectCode(()=>m.assertPublicDemoRequestBoundary({method:'POST'},valid()),'public-demo-read-only',405))return false;
    if(!m.assertPublicDemoRequestBoundary({},valid()).valid)return false;
    const invalids=[
      [{...valid(),ICTC_DEMO_SUITE:'2.2'},'public-demo-requires-suite-3-0'],
      [{...valid(),ICTC_RUNTIME_DIR:'/tmp/ictc/runtime'},'public-demo-runtime-dir-required'],
      [{...valid(),ICTC_ALLOW_NETWORK_BIND:'0'},'public-demo-network-opt-in-required'],
      [{...valid(),ICTC_IDENTITY_MODE:'trusted-header'},'public-demo-identity-mode-must-be-unset'],
      [{...valid(),ICTC_TRUSTED_PROXY_SECRET:'x'.repeat(64)},'public-demo-proxy-secret-must-be-unset'],
      [{...valid(),ICTC_MULTI_TENANT:'0'},'public-demo-single-tenant-only'],
      [{...valid(),ICTC_ALLOW_LOCAL_ACTOR_SWITCH:'0'},'public-demo-actor-switch-forbidden'],
      [{...valid(),ICTC_ALLOW_LOCAL_TENANT_SWITCH:'0'},'public-demo-tenant-switch-forbidden']
    ];
    for(const [env,code] of invalids)if(!expectCode(()=>m.assertPublicDemoConfiguration(env),code,503))return false;
    const aggregate={...valid(),ICTC_DEMO_SUITE:'2.2',ICTC_RUNTIME_DIR:'/tmp/ictc/runtime',ICTC_IDENTITY_MODE:'trusted-header',ICTC_TRUSTED_PROXY_SECRET:'x'.repeat(64),ICTC_MULTI_TENANT:'1'};
    if(!expectCode(()=>m.assertPublicDemoConfiguration(aggregate),'public-demo-requires-suite-3-0',503))return false;
    return true;
  }catch{return false;}
}
const baseline=await import(`${pathToFileURL(fileURLToPath(sourcePath)).href}?base=1`);
assert.equal(semanticOracle(baseline),true,'baseline oracle must pass');
const dir=await mkdtemp(path.join(os.tmpdir(),'ictc-public-demo-mutants-'));let killed=0;const survivors=[];
try{
 for(let i=0;i<mutations.length;i++){
  const [id,from,to]=mutations[i],count=source.split(from).length-1;assert.ok(count>=1,`mutation ${id} target missing`);const mutant=source.replace(from,to),file=path.join(dir,`mutant-${i}.mjs`);await writeFile(file,mutant);let survived=false;try{const mod=await import(`${pathToFileURL(file).href}?m=${i}`);survived=semanticOracle(mod);}catch{survived=false;}if(survived)survivors.push(id);else killed++;
 }
}finally{await rm(dir,{recursive:true,force:true});}
assert.deepEqual(survivors,[]);assert.equal(killed,mutations.length);
console.log(JSON.stringify({ok:true,suite:'public-demo-fault-mutation',generated:mutations.length,killed,survived:survivors.length}));
