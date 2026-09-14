import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RuntimeStore } from './runtime-store.mjs';
import { ROLES, now, publicSettings } from './domain.mjs';
import { VERSION } from './version.mjs';
import { accessProfileFor } from './access-profile.mjs';
import { standardProofProjection } from './standard-proof.mjs';
import { actorFrom, assertBrowserWriteBoundary, assertSafeRuntimeBinding, bodyJson, commandFrom, httpError, json, requirePermission, serveStatic } from './runtime/http.mjs';
import { incidentProjection, validateSettings, visibleState } from './runtime/model.mjs';
import { createMonitoringRuntime } from './runtime/monitoring.mjs';
import { createGrcEvidenceStore } from './runtime/grc-evidence-store.mjs';
import { grcProjection, enhanceGrcProcedures } from './runtime/grc-projection.mjs';
import { workProjection } from './runtime/work-orchestration.mjs';
import { canonicalReviewInbox } from './runtime/review-inbox.mjs';
import { insightProjection } from './runtime/insights.mjs';
import { processLandscapeProjection } from './runtime/process-landscape.mjs';
import { runtimeOntologyProjection } from './runtime/ontology.mjs';
import { canonicalDecisionProjection } from './runtime/decision-projection-1-3.mjs';
import { canonicalEpistemicProjection } from './runtime/epistemic-projection-1-3.mjs';
import { translationPackProjection } from './runtime/translation-packs.mjs';
import { canonicalProcedureHub } from './runtime/workbench-projection.mjs';
import { assertWritePathEnabled, enabledProcedureIds, procedureEnabled, procedurePolicyProjection } from './runtime/procedure-policy.mjs';
import { standardLibraryProjection } from './runtime/standard-library.mjs';
import { procedureSummaryProjection } from './runtime/procedure-summary.mjs';
import { controlTestProjection } from './runtime/control-test.mjs';
import { standardEditionHistoryProjection } from './runtime/standard-edition-history.mjs';
import { visibleMissions } from './runtime/monitoring-access.mjs';
import { filterProcedureRecords, projectionContext } from './runtime/projection-context.mjs';
import { canonicalProcedureRegistry } from './runtime/procedure-registry.mjs';
import { metricCatalogProjection } from './runtime/metric-spec.mjs';
import { subjectVersionIndexProjection } from './runtime/subject-version.mjs';
import { requirementScopeProjection } from './runtime/requirement-scope.mjs';
import { attachmentTrustPosture } from './runtime/attachment-trust.mjs';
import { scannerRuntimePosture } from './runtime/attachment-scanner.mjs';
import { createRuntimeHandlers } from './runtime/runtime-handler-registry.mjs';
import { procedureAdapterIds } from './runtime/procedure-adapters.mjs';
import { sweepClockReviewNeeds } from './runtime/review-need-handler.mjs';
import { demoSuite22Enabled, demoSuite22Projection, ensureDemoSuite22 } from './runtime/demo-suite-2-2.mjs';
import { authorizeEnterpriseActor, ensureEnterpriseState, enterpriseReadiness } from './enterprise.mjs';
import { configureAiGovernance } from './ai.mjs';
import { aiPolicyProjection, assertAiPolicy, deploymentEvidencePosture, normalizeAiPolicy, readinessRuntimeFromDeployment } from './stable-governance.mjs';
import { createTenantAuthority } from './runtime/tenant-authority.mjs';
import { ensurePrivacyState, privacyLifecycleProjection } from './runtime/privacy-lifecycle.mjs';
import { createOperationalObservability } from './runtime/operational-observability.mjs';
import { createAbuseBudget } from './runtime/abuse-budget.mjs';
import { authenticatedRateLimitKey, edgeRateLimitKey } from './runtime/security-boundaries.mjs';
import { evaluateRuntimeSlo } from './runtime/reliability-slo.mjs';

const PRODUCT_EDITION='1.2 Market Candidate';
const PRODUCT_NAME='Integrated Compliance Tower Control';
const STABILITY_PROFILE='1.2_market_candidate';
const here=path.dirname(fileURLToPath(import.meta.url));
const publicRoot=path.join(here,'public');
const contract=JSON.parse(await readFile(path.join(here,'product-contract.json'),'utf8'));
const permissions=Object.fromEntries(contract.roles.map(role=>[role.id,new Set(role.permissions)]));
const mime=new Map([['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],['.json','application/json; charset=utf-8'],['.svg','image/svg+xml'],['.png','image/png']]);
const runtimeRoot=process.env.ICTC_RUNTIME_DIR||path.join(here,'runtime');

async function initializeRuntimeStore(store){await store.init();await ensureEnterpriseState(store);await ensurePrivacyState(store);await ensureDemoSuite22(store);return store;}
const tenantAuthority=await createTenantAuthority({runtimeRoot,createStore:async root=>new RuntimeStore(root),initializeStore:initializeRuntimeStore});
const store=tenantAuthority.store;
configureAiGovernance(()=>({
  state:()=>{const snapshot=store.snapshot();assertAiPolicy(snapshot);return snapshot;},
  reserve:input=>store.persistence.reserveAiBudget(input),
  settle:input=>store.persistence.settleAiBudget(input),
  release:input=>store.persistence.releaseAiBudget(input)
}));
const evidenceStore=createGrcEvidenceStore(store);
const port=Number(process.env.PORT||process.env.ICTC_PORT||4173);
const host=process.env.ICTC_HOST||'127.0.0.1';assertSafeRuntimeBinding(host);
const schedulerMs=Math.max(10000,Number(process.env.ICTC_SCHEDULER_TICK_MS||60000));
const schedulerLeaseMs=Math.max(30000,Math.min(30*60*1000,Number(process.env.ICTC_SCHEDULER_LEASE_MS||5*60*1000)));
const schedulerOwnerId=`scheduler:${process.pid}:${Date.now().toString(36)}`;
const missionLocks=new Set();
const runningMissions={has(value){return missionLocks.has(`${tenantAuthority.current().tenantId}\u0000${value}`);},add(value){missionLocks.add(`${tenantAuthority.current().tenantId}\u0000${value}`);return this;},delete(value){return missionLocks.delete(`${tenantAuthority.current().tenantId}\u0000${value}`);}};
const monitoring=createMonitoringRuntime({store,permissions,runningMissions});
const observability=createOperationalObservability();
const edgeAbuseBudget=createAbuseBudget({capacity:Number(process.env.ICTC_EDGE_RATE_LIMIT_BURST||2000),refillPerSecond:Number(process.env.ICTC_EDGE_RATE_LIMIT_PER_SECOND||100),maxKeys:Number(process.env.ICTC_EDGE_RATE_LIMIT_KEYS||4096)});
const abuseBudget=createAbuseBudget({capacity:Number(process.env.ICTC_RATE_LIMIT_BURST||120),refillPerSecond:Number(process.env.ICTC_RATE_LIMIT_PER_SECOND||2),maxKeys:Number(process.env.ICTC_RATE_LIMIT_KEYS||4096)});
function runtimePosture(){const state=store.snapshot();const base={integrity:store.verifyChain(),safeBinding:true,identityProvider:process.env.ICTC_IDENTITY_MODE==='trusted-header',identityStrategy:state.settings.identity?.strategy||'legacy-role-header',attachmentTrust:attachmentTrustPosture(process.env),scanner:scannerRuntimePosture(process.env),tenancy:tenantAuthority.projection(),privacy:privacyLifecycleProjection(state),abuseControl:{edge:edgeAbuseBudget.projection(),subject:abuseBudget.projection()}};return readinessRuntimeFromDeployment(base,deploymentEvidencePosture(process.env));}
const runtimeHandlers=createRuntimeHandlers({store,permissions,monitoring,evidenceStore,posture:runtimePosture});
const handlers=runtimeHandlers.handlers;
function proofFor(actor){const posture=runtimePosture();return standardProofProjection({actor,version:VERSION,readiness:enterpriseReadiness(store.snapshot(),posture),integrity:posture.integrity});}
function applyProcedureSummary(procedures,summary){const byId=new Map(summary.rows.map(row=>[row.id,row]));return procedures.map(item=>{const row=byId.get(item.id);return row?{...item,label:row.label,attentionCount:row.attention,metrics:row.metrics}:item;});}
function demoPosture(state){const demo=demoSuite22Projection(state);return demo.enabled?{...demo,schedulerEnabled:false,schedulerMode:'disabled-in-demo'}:demo;}
function operationalSnapshot(){const telemetry=observability.snapshot();return{...telemetry,slo:evaluateRuntimeSlo(telemetry),storage:store.persistence.runtimeStoragePosture?.()||null,abuseBudget:abuseBudget.projection(),edgeAbuseBudget:edgeAbuseBudget.projection(),tenant:tenantAuthority.projection()};}

async function handleApi(request,response,url,actor){
  const pathname=url.pathname,method=request.method||'GET',snapshot=store.snapshot();
  if(method==='GET'&&pathname==='/api/health'){
    const enterprise=enterpriseReadiness(snapshot,runtimePosture()),policy=procedurePolicyProjection(snapshot,actor);
    json(response,200,{ok:true,service:'ictc',version:VERSION,product:PRODUCT_NAME,productEdition:PRODUCT_EDITION,stabilityProfile:STABILITY_PROFILE,services:enabledProcedureIds(snapshot),supportedServices:procedureAdapterIds(),supportSurfaces:['standard-proof'],controlPlane:'administration',roles:ROLES,integrity:store.verifyChain(),aiPolicy:aiPolicyProjection(snapshot),procedurePolicy:policy,attachmentTrust:attachmentTrustPosture(process.env),scanner:scannerRuntimePosture(process.env),tenancy:tenantAuthority.projection(),handlerRegistry:{authority:runtimeHandlers.authority,count:runtimeHandlers.plan.length},demo:demoPosture(snapshot),enterprise});return;
  }
  if(method==='GET'&&pathname==='/api/runtime/tenancy'){requirePermission(actor,'read',permissions);json(response,200,tenantAuthority.projection());return;}
  if(method==='GET'&&pathname==='/api/runtime/observability'){requirePermission(actor,'manage-enterprise',permissions);json(response,200,operationalSnapshot());return;}
  if(method==='GET'&&pathname==='/api/bootstrap'){
    const projected=visibleState(actor,store,VERSION),readiness=enterpriseReadiness(snapshot,runtimePosture()),procedurePolicy=procedurePolicyProjection(snapshot,actor),ctx=projectionContext(actor,{asOf:now(),stateRevision:snapshot.revision,procedurePolicyVersion:procedurePolicy.updatedAt||snapshot.settings?.procedurePolicy?.updatedAt||null,accessPolicyVersion:'procedure-contract-1.3',scopeRef:{mode:'actor-visible',organization:snapshot.settings?.organization?.name||null,jurisdictions:snapshot.settings?.organization?.jurisdictions||[]}}),grc=grcProjection(snapshot,actor,ctx),summary=procedureSummaryProjection(snapshot,actor,ctx),demo=demoPosture(snapshot);
    projected.missions=visibleMissions({missions:projected.missions},actor);projected.capabilities=[...(actor.permissions||[])];projected.accessProfile=accessProfileFor(actor);projected.experience.roles=ROLES.length;projected.experience.services=7;projected.experience.enabledServices=procedurePolicy.enabled.length;projected.experience.controlPlane='administration';projected.experience.release=VERSION;projected.experience.product=PRODUCT_NAME;projected.experience.productEdition=PRODUCT_EDITION;projected.experience.stabilityProfile=STABILITY_PROFILE;projected.experience.marketExperience='market-candidate-1-2';projected.experience.shell=['home','processes','proof'];projected.experience.aiPolicy=aiPolicyProjection(snapshot);projected.experience.procedurePolicy=procedurePolicy;projected.experience.attachmentTrust=attachmentTrustPosture(process.env);projected.experience.tenancy=tenantAuthority.projection();projected.experience.handlerRegistry={authority:runtimeHandlers.authority,count:runtimeHandlers.plan.length};projected.experience.demo=demo;projected.experience.demoMode=demo.enabled;projected.projectionContext=ctx;projected.procedureRegistry=canonicalProcedureRegistry();projected.metricCatalog=metricCatalogProjection();projected.ontology=runtimeOntologyProjection();projected.grc=grc;projected.standards=standardLibraryProjection(snapshot,actor);projected.requirementScopes=requirementScopeProjection(snapshot);projected.standardEditionHistory=standardEditionHistoryProjection(snapshot,actor);projected.controlTests=controlTestProjection(snapshot,actor);projected.procedureSummary=summary;projected.work=workProjection(snapshot,actor,{llmReady:Boolean(projected.settings?.llm?.ready)});projected.reviewInbox=canonicalReviewInbox(snapshot,actor);projected.insights=insightProjection(snapshot,actor);projected.homeNextAction=projected.work.queue.nextAction;const businessIds=new Set(procedureAdapterIds());const hub=enhanceGrcProcedures(canonicalProcedureHub(snapshot,actor,{readiness}).filter(item=>!item?.id||!businessIds.has(item.id)||procedureEnabled(snapshot,item.id)),grc);projected.procedures=applyProcedureSummary(hub,summary);projected.processLandscape=processLandscapeProjection({procedures:projected.procedures,work:projected.work,reviewInbox:projected.reviewInbox});projected.decisions=canonicalDecisionProjection(snapshot,actor,ctx,{subjectVersionResolver:value=>store.resolvePersistedSubjectVersion(value)});projected.epistemic=canonicalEpistemicProjection(snapshot,actor,ctx);projected.subjectVersions=subjectVersionIndexProjection(snapshot,actor,ctx);projected.translationPacks=translationPackProjection();projected.exports={currentView:{json:'/api/export/current.json',csv:'/api/export/current.csv'},evidenceDossier:{template:'/api/evidence/{type}/{id}.zip'},authorization:'same-as-read'};if(actor.role==='auditor'){projected.incidents=filterProcedureRecords('incidents',snapshot.incidents,ctx).map(incidentProjection);projected.recentEvents=snapshot.audit.slice(-8).reverse();}json(response,200,projected);return;
  }
  if(method==='GET'&&pathname==='/api/standard-proof'){requirePermission(actor,'read',permissions);json(response,200,proofFor(actor));return;}
  if(method==='PUT'&&pathname==='/api/admin/ai-policy'){requirePermission(actor,'manage-enterprise',permissions);const input=await bodyJson(request);const aiPolicy=normalizeAiPolicy(input.aiPolicy);const envelope=await store.mutate(actor,'admin.ai-policy.updated',{type:'settings',id:'ai-policy'},{aiPolicy},draft=>{draft.settings.aiPolicy=aiPolicy;return aiPolicyProjection(draft);},commandFrom(request));json(response,200,envelope);return;}
  if(method==='PUT'&&pathname==='/api/admin/settings'){requirePermission(actor,'configure-ai',permissions);const input=await bodyJson(request),normalized=validateSettings(input,snapshot.settings),envelope=await store.mutate(actor,'settings.updated',{type:'settings',id:'global'},normalized,draft=>{draft.settings={...draft.settings,...normalized,updatedAt:now(),updatedBy:actor.id};return publicSettings(draft.settings);},commandFrom(request));json(response,200,envelope);return;}
  assertWritePathEnabled(snapshot,method,pathname);for(const handler of handlers)if(await handler(request,response,pathname,actor))return;throw httpError(404,'Endpoint non trovato','not-found');
}

const server=http.createServer(async(request,response)=>{
  const url=new URL(request.url||'/',`http://${request.headers.host||'localhost'}`),trace=observability.start({method:request.method||'GET',pathname:url.pathname,tenantId:'unresolved'});response.setHeader('x-request-id',trace.requestId);let errorCode=null,rateLimited=false;
  try{
    if(url.pathname.startsWith('/api/'))await tenantAuthority.runRequest(request,async resolved=>{assertBrowserWriteBoundary(request);const remoteAddress=request.socket?.remoteAddress,edgeKey=edgeRateLimitKey({tenantId:resolved.tenantId,remoteAddress}),edgeBudget=edgeAbuseBudget.consume(edgeKey);if(!edgeBudget.allowed){rateLimited=true;response.setHeader('retry-after',String(edgeBudget.retryAfterSeconds));throw httpError(429,'Troppe richieste','edge-rate-limited',{retryAfterSeconds:edgeBudget.retryAfterSeconds});}const state=store.snapshot(),actor=authorizeEnterpriseActor(actorFrom(request,permissions,state.settings.identity),state),key=authenticatedRateLimitKey({tenantId:resolved.tenantId,actor,remoteAddress}),budget=abuseBudget.consume(key);if(!budget.allowed){rateLimited=true;response.setHeader('retry-after',String(budget.retryAfterSeconds));throw httpError(429,'Troppe richieste','rate-limited',{retryAfterSeconds:budget.retryAfterSeconds});}await handleApi(request,response,url,actor);});else await serveStatic(response,url.pathname,publicRoot,mime);
  }catch(error){errorCode=error.code||'internal-error';if(!response.headersSent)json(response,error.status||500,{schemaVersion:'1.0.0',error:error.message||'Errore interno',code:errorCode,details:error.details||null,requestId:trace.requestId});else response.end();}
  finally{trace.finish({status:response.statusCode||500,code:errorCode,rateLimited});}
});
server.headersTimeout=Math.max(5000,Math.min(60000,Number(process.env.ICTC_HTTP_HEADERS_TIMEOUT_MS||15000)));
server.requestTimeout=Math.max(server.headersTimeout,Math.min(300000,Number(process.env.ICTC_HTTP_REQUEST_TIMEOUT_MS||90000)));
server.keepAliveTimeout=Math.max(1000,Math.min(30000,Number(process.env.ICTC_HTTP_KEEPALIVE_TIMEOUT_MS||5000)));
server.maxRequestsPerSocket=Math.max(1,Math.min(100000,Number(process.env.ICTC_HTTP_MAX_REQUESTS_PER_SOCKET||1000)));
server.maxHeadersCount=Math.max(20,Math.min(1000,Number(process.env.ICTC_HTTP_MAX_HEADERS||100)));

async function schedulerTickCurrentTenant(){
  const before=store.snapshot();if(demoSuite22Projection(before).enabled)return;const tickAt=now();try{await sweepClockReviewNeeds({store,actor:{id:'system:review-clock',role:'system'},validAsOf:tickAt,command:{id:`review-clock-${tickAt}`}});}catch(error){observability.log('review_clock_error',{tenantId:tenantAuthority.current().tenantId,code:error.code||'error'});}const state=store.snapshot();if(!procedureEnabled(state,'monitoring'))return;const due=state.missions.filter(item=>item.state==='active'&&item.nextRunAt&&new Date(item.nextRunAt)<=new Date());for(const mission of due){const workKey=`monitoring:${mission.id}`;let claim;try{claim=store.persistence.claimSchedulerWork({workKey,dueAt:mission.nextRunAt,ownerId:schedulerOwnerId,leaseMs:schedulerLeaseMs,at:tickAt});if(!claim.claimed){observability.log('scheduler_claim_held',{tenantId:tenantAuthority.current().tenantId,missionId:mission.id,workKey,fence:claim.fence});continue;}await store.withSchedulerClaim(claim,()=>monitoring.runMission(mission.id,{id:'scheduler',role:'admin',identityMode:'system',identityStrategy:'system',permissions:[...permissions.admin]},{id:`scheduler-${mission.id}-${mission.nextRunAt}`}));}catch(error){observability.log('scheduler_error',{tenantId:tenantAuthority.current().tenantId,missionId:mission.id,code:error.code||'error'});}finally{if(claim?.claimed)try{store.persistence.releaseSchedulerWork(claim,{at:now()});}catch(error){observability.log('scheduler_release_error',{tenantId:tenantAuthority.current().tenantId,missionId:mission.id,code:error.code||'error'});}}}
}
async function schedulerTick(){if(demoSuite22Enabled())return;for(const tenantId of tenantAuthority.tenantIds())await tenantAuthority.runTenant(tenantId,schedulerTickCurrentTenant);}
schedulerTick().catch(error=>observability.log('initial_scheduler_error',{code:error.code||'error'}));const scheduler=setInterval(()=>schedulerTick().catch(error=>observability.log('scheduler_tick_error',{code:error.code||'error'})),schedulerMs);scheduler.unref();server.listen(port,host,()=>observability.log('server_listening',{host,port,tenancy:tenantAuthority.directory.enabled?'multi':'single'}));
let shuttingDown=false;async function shutdown(signal){if(shuttingDown)return;shuttingDown=true;clearInterval(scheduler);observability.log('server_shutdown',{signal});server.close(async()=>{await tenantAuthority.closeAll();process.exit(0);});setTimeout(async()=>{await tenantAuthority.closeAll().catch(()=>{});process.exit(1);},10000).unref();}
for(const signal of['SIGINT','SIGTERM'])process.on(signal,()=>shutdown(signal));
export{server,store,tenantAuthority,observability,monitoring as monitoringRuntime};