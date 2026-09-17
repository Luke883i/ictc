import { json, requirePermission } from './http.mjs';
import { buildClosedDemoEvidenceLattice30 } from './demo-evidence-lattice-3-0-closure.mjs';

export function createDemoEvidenceLattice30Handler({store,permissions}){
  return async function handle(request,response,pathname,actor){
    if((request.method||'GET')!=='GET'||pathname!=='/api/demo/evidence-lattice')return false;
    requirePermission(actor,'read',permissions);
    const graph=buildClosedDemoEvidenceLattice30(store.snapshot());
    if(!graph.enabled){json(response,404,{schemaVersion:'3.0.0',error:'DEMO Evidence Lattice non disponibile fuori da Suite 2.2',code:'demo-evidence-lattice-disabled',enabled:false});return true;}
    json(response,200,graph);return true;
  };
}
