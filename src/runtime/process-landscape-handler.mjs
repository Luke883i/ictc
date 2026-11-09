import { json, requirePermission } from './http.mjs';
import { grcProjection, enhanceGrcProcedures } from './grc-projection.mjs';
import { canonicalProcedureHub } from './workbench-projection.mjs';
import { workProjection } from './work-orchestration.mjs';
import { canonicalReviewInbox } from './review-inbox.mjs';
import { processLandscapeProjection } from './process-landscape.mjs';
export function createProcessLandscapeHandler({store,permissions}){return async function handle(request,response,pathname,actor){if((request.method||'GET')!=='GET'||pathname!=='/api/process-landscape')return false;requirePermission(actor,'read',permissions);const snapshot=store.snapshot(),grc=grcProjection(snapshot,actor),procedures=enhanceGrcProcedures(canonicalProcedureHub(snapshot,actor),grc),work=workProjection(snapshot,actor,{llmReady:Boolean(snapshot.settings?.llm?.endpoint&&snapshot.settings?.llm?.model)}),reviewInbox=canonicalReviewInbox(snapshot,actor);json(response,200,processLandscapeProjection({procedures,work,reviewInbox}));return true;};}
