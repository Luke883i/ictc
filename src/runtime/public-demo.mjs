import path from 'node:path';

export const PUBLIC_DEMO_ROLES=Object.freeze(['admin','user','auditor']);
export const PUBLIC_DEMO_DEFAULT_ROLE='auditor';
export const PUBLIC_DEMO_SUITE='3.0';
export const PUBLIC_DEMO_RUNTIME_BASENAME='demo-runtime-3-0';

const text=(value,max=1000)=>String(value??'').trim().slice(0,max);
const demoRole=value=>PUBLIC_DEMO_ROLES.includes(text(value,20).toLowerCase())?text(value,20).toLowerCase():PUBLIC_DEMO_DEFAULT_ROLE;

export function publicDemoRequested(env=process.env){return env.ICTC_PUBLIC_DEMO==='1';}

export function publicDemoConfiguration(env=process.env){
  const enabled=publicDemoRequested(env),errors=[];
  if(!enabled)return Object.freeze({enabled:false,valid:true,errors:Object.freeze([]),suite:null,roles:Object.freeze([]),defaultRole:null,actorStrategy:null,readOnly:false,anonymous:false,syntheticOnly:false,runtimeDir:null});
  const suite=text(env.ICTC_DEMO_SUITE,40);
  const runtimeDir=text(env.ICTC_RUNTIME_DIR,2000);
  const identityMode=text(env.ICTC_IDENTITY_MODE,80);
  const proxySecret=text(env.ICTC_TRUSTED_PROXY_SECRET,1000);
  const multiTenant=text(env.ICTC_MULTI_TENANT,40);
  const actorSwitch=text(env.ICTC_ALLOW_LOCAL_ACTOR_SWITCH,40);
  const tenantSwitch=text(env.ICTC_ALLOW_LOCAL_TENANT_SWITCH,40);
  if(suite!==PUBLIC_DEMO_SUITE)errors.push('public-demo-requires-suite-3-0');
  if(path.basename(runtimeDir)!==PUBLIC_DEMO_RUNTIME_BASENAME)errors.push('public-demo-runtime-dir-required');
  if(env.ICTC_ALLOW_NETWORK_BIND!=='1')errors.push('public-demo-network-opt-in-required');
  if(identityMode)errors.push('public-demo-identity-mode-must-be-unset');
  if(proxySecret)errors.push('public-demo-proxy-secret-must-be-unset');
  if(multiTenant)errors.push('public-demo-single-tenant-only');
  if(actorSwitch)errors.push('public-demo-actor-switch-forbidden');
  if(tenantSwitch)errors.push('public-demo-tenant-switch-forbidden');
  return Object.freeze({enabled:true,valid:errors.length===0,errors:Object.freeze(errors),suite,runtimeDir,roles:PUBLIC_DEMO_ROLES,defaultRole:PUBLIC_DEMO_DEFAULT_ROLE,actorStrategy:'server-derived-by-role',readOnly:true,anonymous:true,syntheticOnly:true});
}

export function assertPublicDemoConfiguration(env=process.env){
  const posture=publicDemoConfiguration(env);
  if(posture.enabled&&!posture.valid){
    const code=posture.errors[0];
    throw Object.assign(new Error(`Configurazione Public DEMO non valida: ${posture.errors.join(', ')}`),{status:503,code,details:{errors:[...posture.errors]}});
  }
  return posture;
}

export function publicDemoActor(permissions,env=process.env,requestedRole=PUBLIC_DEMO_DEFAULT_ROLE){
  const posture=assertPublicDemoConfiguration(env);
  if(!posture.enabled)return null;
  const role=demoRole(requestedRole),permissionSet=permissions?.[role];
  if(!(permissionSet instanceof Set))throw Object.assign(new Error(`Permessi ${role} non disponibili per Public DEMO`),{status:503,code:'public-demo-role-permissions-missing',details:{role}});
  return Object.freeze({id:`local-${role}`,role,identityMode:'public-demo',identityStrategy:'synthetic-demo-role',permissions:Object.freeze([...permissionSet])});
}

export function assertPublicDemoRequestBoundary(request,env=process.env){
  const posture=assertPublicDemoConfiguration(env);
  if(!posture.enabled)return posture;
  const method=text(request?.method||'GET',20).toUpperCase();
  if(!['GET','HEAD'].includes(method))throw Object.assign(new Error('Public DEMO è in sola lettura'),{status:405,code:'public-demo-read-only',details:{method}});
  return posture;
}
