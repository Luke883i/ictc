import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from './store.mjs';
import { ROLES, VERSION, now, publicSettings } from './domain.mjs';
import { actorFrom, assertSafeRuntimeBinding, bodyJson, commandFrom, httpError, json, requirePermission, serveStatic } from './runtime/http.mjs';
import { incidentProjection, validateSettings, visibleState } from './runtime/model.mjs';
import { createMonitoringRuntime } from './runtime/monitoring.mjs';
import { createContributionHandler } from './runtime/contributions.mjs';
import { createIncidentHandler } from './runtime/incidents.mjs';
import { createEvidenceHandler } from './runtime/evidence.mjs';
import { createAdminHandler } from './runtime/admin.mjs';
import { createWorkbenchProjection } from './runtime/workbench-projection.mjs';
import { authorizeEnterpriseActor, ensureEnterpriseState, enterpriseReadiness } from './enterprise.mjs';
import { configureAiGovernance } from './ai.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const publicRoot=path.join(here,'public');
const contract=JSON.parse(await readFile(path.join(here,'product-contract.json'),'utf8'));
const permissions=Object.fromEntries(contract.roles.map(role=>[role.id,new Set(role.permissions)]));
const mime=new Map([['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],['.json','application/json; charset=utf-8'],['.svg','image/svg+xml']]);
const runtimeRoot=process.env.ICTC_RUNTIME_DIR||path.join(here,'runtime');
const store=await new Store(runtimeRoot).init();
await ensureEnterpriseState(store);
configureAiGovernance(()=>store.snapshot());
const port=Number(process.env.PORT||process.env.ICTC_PORT||4173);
const host=process.env.ICTC_HOST||'127.0.0.1';
assertSafeRuntimeBinding(host);
const schedulerMs=Math.max(10000,Number(process.env.ICTC_SCHEDULER_TICK_MS||60000));
const runningMissions=new Set();
const monitoring=createMonitoringRuntime({store,permissions,runningMissions});
const handlers=[createWorkbenchProjection({store,permissions}),monitoring.handle,createContributionHandler({store,permissions}),createIncidentHandler({store,permissions}),createEvidenceHandler({store,permissions}),createAdminHandler({store,permissions,posture:runtimePosture})];

function runtimePosture(){
  return {
    integrity:store.verifyChain(),safeBinding:true,
    identityProvider:process.env.ICTC_IDENTITY_MODE==='trusted-header',
    tls:process.env.ICTC_TLS_ATTESTED==='1',durableStorage:process.env.ICTC_DURABLE_STORAGE==='1',
    backupVerified:Boolean(process.env.ICTC_BACKUP_VERIFIED_AT),
    malwareScanning:process.env.ICTC_MALWARE_SCAN_MODE==='external',
    observability:process.env.ICTC_OBSERVABILITY_ATTESTED==='1',
    dependencyAudit:Boolean(process.env.ICTC_DEPENDENCY_AUDIT_AT),dependencyAuditAt:process.env.ICTC_DEPENDENCY_AUDIT_AT||null,
    accessibilityAudit:Boolean(process.env.ICTC_ACCESSIBILITY_AUDIT_AT),accessibilityAuditAt:process.env.ICTC_ACCESSIBILITY_AUDIT_AT||null
  };
}

async function handleApi(request,response,url,actor){
  const pathname=url.pathname,method=request.method||'GET';
  if(method==='GET'&&pathname==='/api/health'){
    const enterprise=enterpriseReadiness(store.snapshot(),runtimePosture());
    json(response,200,{ok:true,service:'ictc',version:VERSION,readiness:enterprise.level,services:['monitoring','incidents'],controlPlane:'administration',roles:ROLES,integrity:store.verifyChain(),enterprise});return;
  }
  if(method==='GET'&&pathname==='/api/bootstrap'){
    const projected=visibleState(actor,store,VERSION);
    projected.capabilities=[...(actor.permissions||[])];
    projected.experience.roles=ROLES.length;
    projected.experience.controlPlane='administration';
    if(actor.role==='auditor'){
      projected.incidents=store.snapshot().incidents.map(incidentProjection);
      projected.recentEvents=store.snapshot().audit.slice(-8).reverse();
    }
    json(response,200,projected);return;
  }
  if(method==='PUT'&&pathname==='/api/admin/settings'){
    requirePermission(actor,'configure-ai',permissions);const input=await bodyJson(request);const normalized=validateSettings(input,store.snapshot().settings);
    const envelope=await store.mutate(actor,'settings.updated',{type:'settings',id:'global'},normalized,draft=>{draft.settings={...draft.settings,...normalized,updatedAt:now(),updatedBy:actor.id};return publicSettings(draft.settings);},commandFrom(request));
    json(response,200,envelope);return;
  }
  for(const handler of handlers)if(await handler(request,response,pathname,actor))return;
  throw httpError(404,'Endpoint non trovato','not-found');
}

const server=http.createServer(async(request,response)=>{try{const url=new URL(request.url||'/',`http://${request.headers.host||'localhost'}`);const actor=authorizeEnterpriseActor(actorFrom(request,permissions),store.snapshot());if(url.pathname.startsWith('/api/'))await handleApi(request,response,url,actor);else await serveStatic(response,url.pathname,publicRoot,mime);}catch(error){if(!response.headersSent)json(response,error.status||500,{error:error.message||'Errore interno',code:error.code||'internal-error',details:error.details||null});else response.end();}});
async function schedulerTick(){const state=store.snapshot();const due=state.missions.filter(item=>item.state==='active'&&item.nextRunAt&&new Date(item.nextRunAt)<=new Date());for(const mission of due){try{await monitoring.runMission(mission.id,{id:'scheduler',role:'admin',identityMode:'system',permissions:[...permissions.admin]},{id:`scheduler-${mission.id}-${mission.nextRunAt}`});}catch(error){console.error('scheduler',mission.id,error.message);}}}
const scheduler=setInterval(()=>schedulerTick().catch(error=>console.error('scheduler tick',error)),schedulerMs);scheduler.unref();server.listen(port,host,()=>console.log(`ICTC ${VERSION} http://${host}:${port}`));for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{clearInterval(scheduler);server.close(()=>process.exit(0));});
export{server,store,monitoring as monitoringRuntime};
