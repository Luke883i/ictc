import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from './store.mjs';
import { ROLES, now, publicSettings } from './domain.mjs';
import { VERSION } from './version.mjs';
import { accessProfileFor } from './access-profile.mjs';
import { standardProofProjection } from './standard-proof.mjs';
import { actorFrom, assertSafeRuntimeBinding, bodyJson, commandFrom, httpError, json, requirePermission, serveStatic } from './runtime/http.mjs';
import { incidentProjection, validateSettings, visibleState } from './runtime/model.mjs';
import { createMonitoringRuntime } from './runtime/monitoring.mjs';
import { createMonitoringJobHandler } from './runtime/monitoring-jobs.mjs';
import { createContributionHandler } from './runtime/contributions.mjs';
import { createIncidentHandler } from './runtime/incidents.mjs';
import { createIncidentMarketHandler } from './runtime/incident-market-handler.mjs';
import { createEvidenceHandler } from './runtime/evidence.mjs';
import { createAdminHandler } from './runtime/admin.mjs';
import { createGrcRuntime } from './runtime/grc-runtime.mjs';
import { createGrcEvidenceStore } from './runtime/grc-evidence-store.mjs';
import { grcProjection, enhanceGrcProcedures } from './runtime/grc-projection.mjs';
import { createWorkOrchestration, workProjection } from './runtime/work-orchestration.mjs';
import { canonicalReviewInbox } from './runtime/review-inbox.mjs';
import { createInsightRuntime, insightProjection } from './runtime/insights.mjs';
import { createProcessLandscapeHandler } from './runtime/process-landscape-handler.mjs';
import { createManualMonitoringHandler } from './runtime/manual-monitoring.mjs';
import { createManualAssuranceHandler } from './runtime/manual-assurance.mjs';
import { createManualIncidentHandler } from './runtime/manual-incident.mjs';
import { createProcessHandoffHandler } from './runtime/process-handoffs.mjs';
import { createRiskActionFidelityHandler } from './runtime/risk-action-fidelity.mjs';
import { processLandscapeProjection } from './runtime/process-landscape.mjs';
import { runtimeOntologyProjection } from './runtime/ontology.mjs';
import { canonicalDecisionProjection } from './runtime/decision-projection.mjs';
import { canonicalEpistemicProjection } from './runtime/epistemic-projection.mjs';
import { translationPackProjection } from './runtime/translation-packs.mjs';
import { canonicalProcedureHub, createWorkbenchProjection } from './runtime/workbench-projection.mjs';
import { assertWritePathEnabled, enabledProcedureIds, procedureEnabled, procedurePolicyProjection } from './runtime/procedure-policy.mjs';
import { createStandardLibraryHandler } from './runtime/standard-library-handler.mjs';
import { standardLibraryProjection } from './runtime/standard-library.mjs';
import { procedureSummaryProjection } from './runtime/procedure-summary.mjs';
import { createProcedureInvariantHandler } from './runtime/procedure-invariant-handler.mjs';
import { createUserMonitoringHandler } from './runtime/user-monitoring.mjs';
import { visibleMissions } from './runtime/monitoring-access.mjs';
import { authorizeEnterpriseActor, ensureEnterpriseState, enterpriseReadiness } from './enterprise.mjs';
import { configureAiGovernance } from './ai.mjs';
import { aiPolicyProjection, assertAiPolicy, deploymentEvidencePosture, normalizeAiPolicy, readinessRuntimeFromDeployment } from './stable-governance.mjs';

const PRODUCT_EDITION='1.2 Market Candidate';
const PRODUCT_NAME='Integrated Compliance Tower Control';
const STABILITY_PROFILE='1.2_market_candidate';
const here=path.dirname(fileURLToPath(import.meta.url));
const publicRoot=path.join(here,'public');
const contract=JSON.parse(await readFile(path.join(here,'product-contract-1-2.json'),'utf8'));
const permissions=Object.fromEntries(contract.roles.map(role=>[role.id,new Set(role.permissions)]));
const mime=new Map([['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],['.json','application/json; charset=utf-8'],['.svg','image/svg+xml'],['.png','image/png']]);
const runtimeRoot=process.env.ICTC_RUNTIME_DIR||path.join(here,'runtime');
const store=await new Store(runtimeRoot).init();
await ensureEnterpriseState(store);
configureAiGovernance(()=>{const snapshot=store.snapshot();assertAiPolicy(snapshot);return snapshot;});
const evidenceStore=createGrcEvidenceStore(store);
const port=Number(process.env.PORT||process.env.ICTC_PORT||4173);
const host=process.env.ICTC_HOST||'127.0.0.1';
assertSafeRuntimeBinding(host);
const schedulerMs=Math.max(10000,Number(process.env.ICTC_SCHEDULER_TICK_MS||60000));
const runningMissions=new Set();
const monitoring=createMonitoringRuntime({store,permissions,runningMissions});
function runtimePosture(){const state=store.snapshot();const base={integrity:store.verifyChain(),safeBinding:true,identityProvider:process.env.ICTC_IDENTITY_MODE==='trusted-header',identityStrategy:state.settings.identity?.strategy||'legacy-role-header'};return readinessRuntimeFromDeployment(base,deploymentEvidencePosture(process.env));}
const handlers=[createWorkOrchestration({store,permissions}),createProcessLandscapeHandler({store,permissions}),createManualMonitoringHandler({store,permissions}),createManualAssuranceHandler({store,permissions}),createManualIncidentHandler({store,permissions}),createProcessHandoffHandler({store,permissions}),createRiskActionFidelityHandler({store,permissions}),createInsightRuntime({store,permissions}),createWorkbenchProjection({store,permissions}),createStandardLibraryHandler({store,permissions}),createProcedureInvariantHandler({store,permissions}),createGrcRuntime({store,permissions}),createMonitoringJobHandler({store,permissions}),createUserMonitoringHandler({store,runMission:monitoring.runMission}),monitoring.handle,createContributionHandler({store,permissions}),createIncidentMarketHandler({store,permissions}),createIncidentHandler({store,permissions}),createEvidenceHandler({store:evidenceStore,permissions}),createAdminHandler({store,permissions,posture:runtimePosture})];
function proofFor(actor){const posture=runtimePosture();return standardProofProjection({actor,version:VERSION,readiness:enterpriseReadiness(store.snapshot(),posture),integrity:posture.integrity});}
function applyProcedureSummary(procedures,summary){const byId=new Map(summary.rows.map(row=>[row.id,row]));return procedures.map(item=>{const row=byId.get(item.id);return row?{...item,label:row.label,attentionCount:row.attention,metrics:row.metrics}:item;});}
async function handleApi(request,response,url,actor){const pathname=url.pathname,method=request.method||'GET',snapshot=store.snapshot();
if(method==='GET'&&pathname==='/api/health'){const enterprise=enterpriseReadiness(snapshot,runtimePosture()),policy=procedurePolicyProjection(snapshot,actor);json(response,200,{ok:true,service:'ictc',version:VERSION,product:PRODUCT_NAME,productEdition:PRODUCT_EDITION,stabilityProfile:STABILITY_PROFILE,services:enabledProcedureIds(snapshot),supportedServices:['monitoring','incidents','objects','coverage','actions','risks','assurance'],supportSurfaces:['standard-proof'],controlPlane:'administration',roles:ROLES,integrity:store.verifyChain(),aiPolicy:aiPolicyProjection(snapshot),procedurePolicy:policy,enterprise});return;}
if(method==='GET'&&pathname==='/api/bootstrap'){const projected=visibleState(actor,store,VERSION),readiness=enterpriseReadiness(snapshot,runtimePosture()),grc=grcProjection(snapshot,actor),procedurePolicy=procedurePolicyProjection(snapshot,actor),summary=procedureSummaryProjection(snapshot,actor);projected.missions=visibleMissions({missions:projected.missions},actor);projected.capabilities=[...(actor.permissions||[])];projected.accessProfile=accessProfileFor(actor);projected.experience.roles=ROLES.length;projected.experience.services=7;projected.experience.enabledServices=procedurePolicy.enabled.length;projected.experience.controlPlane='administration';projected.experience.release=VERSION;projected.experience.product=PRODUCT_NAME;projected.experience.productEdition=PRODUCT_EDITION;projected.experience.stabilityProfile=STABILITY_PROFILE;projected.experience.marketExperience='market-candidate-1-2';projected.experience.shell=['home','processes','proof'];projected.experience.aiPolicy=aiPolicyProjection(snapshot);projected.experience.procedurePolicy=procedurePolicy;projected.ontology=runtimeOntologyProjection();projected.grc=grc;projected.standards=standardLibraryProjection(snapshot,actor);projected.procedureSummary=summary;projected.work=workProjection(snapshot,actor,{llmReady:Boolean(projected.settings?.llm?.ready)});projected.reviewInbox=canonicalReviewInbox(snapshot,actor);projected.insights=insightProjection(snapshot,actor);projected.homeNextAction=projected.work.queue.nextAction;const hub=enhanceGrcProcedures(canonicalProcedureHub(snapshot,actor,{readiness}).filter(item=>!item?.id||!['monitoring','incidents','objects','coverage','actions','risks','assurance'].includes(item.id)||procedureEnabled(snapshot,item.id)),grc);projected.procedures=applyProcedureSummary(hub,summary);projected.processLandscape=processLandscapeProjection({procedures:projected.procedures,work:projected.work,reviewInbox:projected.reviewInbox});projected.decisions=canonicalDecisionProjection(snapshot,actor);projected.epistemic=canonicalEpistemicProjection(snapshot,actor);projected.translationPacks=translationPackProjection();projected.exports={currentView:{json:'/api/export/current.json',csv:'/api/export/current.csv'},evidenceDossier:{template:'/api/evidence/{type}/{id}.zip'},authorization:'same-as-read'};if(actor.role==='auditor'){projected.incidents=snapshot.incidents.map(incidentProjection);projected.recentEvents=snapshot.audit.slice(-8).reverse();}json(response,200,projected);return;}
if(method==='GET'&&pathname==='/api/standard-proof'){requirePermission(actor,'read',permissions);json(response,200,proofFor(actor));return;}
if(method==='PUT'&&pathname==='/api/admin/ai-policy'){requirePermission(actor,'manage-enterprise',permissions);const input=await bodyJson(request);const aiPolicy=normalizeAiPolicy(input.aiPolicy);const envelope=await store.mutate(actor,'admin.ai-policy.updated',{type:'settings',id:'ai-policy'},{aiPolicy},draft=>{draft.settings.aiPolicy=aiPolicy;return aiPolicyProjection(draft);},commandFrom(request));json(response,200,envelope);return;}
if(method==='PUT'&&pathname==='/api/admin/settings'){requirePermission(actor,'configure-ai',permissions);const input=await bodyJson(request),normalized=validateSettings(input,snapshot.settings),envelope=await store.mutate(actor,'settings.updated',{type:'settings',id:'global'},normalized,draft=>{draft.settings={...draft.settings,...normalized,updatedAt:now(),updatedBy:actor.id};return publicSettings(draft.settings);},commandFrom(request));json(response,200,envelope);return;}
assertWritePathEnabled(snapshot,method,pathname);for(const handler of handlers)if(await handler(request,response,pathname,actor))return;throw httpError(404,'Endpoint non trovato','not-found');}
const server=http.createServer(async(request,response)=>{try{const url=new URL(request.url||'/',`http://${request.headers.host||'localhost'}`),state=store.snapshot(),actor=authorizeEnterpriseActor(actorFrom(request,permissions,state.settings.identity),state);if(url.pathname.startsWith('/api/'))await handleApi(request,response,url,actor);else await serveStatic(response,url.pathname,publicRoot,mime);}catch(error){if(!response.headersSent)json(response,error.status||500,{error:error.message||'Errore interno',code:error.code||'internal-error',details:error.details||null});else response.end();}});
async function schedulerTick(){const state=store.snapshot();if(!procedureEnabled(state,'monitoring'))return;const due=state.missions.filter(item=>item.state==='active'&&item.nextRunAt&&new Date(item.nextRunAt)<=new Date());for(const mission of due){try{await monitoring.runMission(mission.id,{id:'scheduler',role:'admin',identityMode:'system',identityStrategy:'system',permissions:[...permissions.admin]},{id:`scheduler-${mission.id}-${mission.nextRunAt}`});}catch(error){console.error('scheduler',mission.id,error.message);}}}
const scheduler=setInterval(()=>schedulerTick().catch(error=>console.error('scheduler tick',error)),schedulerMs);scheduler.unref();server.listen(port,host,()=>console.log(`ICTC ${VERSION} http://${host}:${port}`));for(const signal of['SIGINT','SIGTERM'])process.on(signal,()=>{clearInterval(scheduler);server.close(()=>process.exit(0));});export{server,store,monitoring as monitoringRuntime};
