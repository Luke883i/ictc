import { json, requirePermission } from './http.mjs';
import { buildDemoSuite30EvidenceLattice } from './demo-suite-3-0-lattice.mjs';

// buildDemoSuite30EvidenceLattice is the Suite 3.0 authority adapter over the retained buildClosedDemoEvidenceLattice30 implementation lineage.
export function createDemoEvidenceLattice30Handler({store,permissions}){
  return async function handle(request,response,pathname,actor){
    if((request.method||'GET')!=='GET'||pathname!=='/api/demo/evidence-lattice')return false;
    requirePermission(actor,'read',permissions);
    const graph=buildDemoSuite30EvidenceLattice(store.snapshot());
    if(!graph.enabled){json(response,404,{schemaVersion:'3.0.0',error:'DEMO Evidence Lattice non disponibile fuori da Suite 3.0',code:'demo-evidence-lattice-disabled',enabled:false});return true;}
    json(response,200,graph);return true;
  };
}
