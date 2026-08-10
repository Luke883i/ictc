import { createWorkOrchestration } from './work-orchestration.mjs';
import { createProcessLandscapeHandler } from './process-landscape-handler.mjs';
import { createManualMonitoringHandler } from './manual-monitoring.mjs';
import { createManualAssuranceHandler } from './manual-assurance.mjs';
import { createManualIncidentHandler } from './manual-incident.mjs';
import { createProcessHandoffHandler } from './process-handoffs.mjs';
import { createRiskActionFidelityHandler } from './risk-action-fidelity.mjs';
import { createInsightRuntime } from './insights.mjs';
import { createWorkbenchProjection } from './workbench-projection.mjs';
import { createStandardLibraryHandler } from './standard-library-handler.mjs';
import { createProcedureInvariantHandler } from './procedure-invariant-handler.mjs';
import { createControlTestHandler } from './control-test-handler.mjs';
import { createGrcRuntime } from './grc-runtime.mjs';
import { createMonitoringJobHandler } from './monitoring-jobs.mjs';
import { createUserMonitoringHandler } from './user-monitoring.mjs';
import { createContributionHandler } from './contributions.mjs';
import { createIncidentMarketHandler } from './incident-market-handler.mjs';
import { createIncidentHandler } from './incidents.mjs';
import { createEvidenceHandler } from './evidence.mjs';
import { createAdminHandler } from './admin.mjs';
import { procedureAdapters } from './procedure-adapters.mjs';

const HANDLER_KEYS=Object.freeze({monitoring:['manual-monitoring','monitoring-jobs','user-monitoring','monitoring-runtime','contributions'],incidents:['manual-incidents','incident-market','incidents'],objects:['grc-runtime'],coverage:['standard-library','control-test','grc-runtime'],actions:['grc-runtime'],risks:['risk-action-fidelity','grc-runtime'],assurance:['manual-assurance','grc-runtime']});
const SHARED_KEYS=Object.freeze(['work-orchestration','process-landscape','process-handoffs','insights','workbench','procedure-invariant','evidence','admin']);
for(const adapter of procedureAdapters())if(!HANDLER_KEYS[adapter.id])throw new Error(`Missing runtime handler registration for ${adapter.id}`);
export function runtimeHandlerPlan(){const ordered=[...SHARED_KEYS];for(const adapter of procedureAdapters())for(const key of HANDLER_KEYS[adapter.id])if(!ordered.includes(key))ordered.push(key);return ordered;}
export function createRuntimeHandlers({store,permissions,monitoring,evidenceStore,posture}){const factories={
  'work-orchestration':()=>createWorkOrchestration({store,permissions}),
  'process-landscape':()=>createProcessLandscapeHandler({store,permissions}),
  'manual-monitoring':()=>createManualMonitoringHandler({store,permissions}),
  'manual-assurance':()=>createManualAssuranceHandler({store,permissions}),
  'manual-incidents':()=>createManualIncidentHandler({store,permissions}),
  'process-handoffs':()=>createProcessHandoffHandler({store,permissions}),
  'risk-action-fidelity':()=>createRiskActionFidelityHandler({store,permissions}),
  'insights':()=>createInsightRuntime({store,permissions}),
  'workbench':()=>createWorkbenchProjection({store,permissions}),
  'standard-library':()=>createStandardLibraryHandler({store,permissions}),
  'procedure-invariant':()=>createProcedureInvariantHandler({store,permissions}),
  'control-test':()=>createControlTestHandler({store,permissions}),
  'grc-runtime':()=>createGrcRuntime({store,permissions}),
  'monitoring-jobs':()=>createMonitoringJobHandler({store,permissions}),
  'user-monitoring':()=>createUserMonitoringHandler({store,runMission:monitoring.runMission}),
  'monitoring-runtime':()=>monitoring.handle,
  'contributions':()=>createContributionHandler({store,permissions}),
  'incident-market':()=>createIncidentMarketHandler({store,permissions}),
  'incidents':()=>createIncidentHandler({store,permissions}),
  'evidence':()=>createEvidenceHandler({store:evidenceStore,permissions}),
  'admin':()=>createAdminHandler({store,permissions,posture})
};const plan=runtimeHandlerPlan();for(const key of plan)if(!factories[key])throw new Error(`Missing runtime handler factory: ${key}`);return{authority:'procedure-adapter-handler-registry',plan,handlers:plan.map(key=>factories[key]())};}
