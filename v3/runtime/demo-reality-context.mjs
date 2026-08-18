export * from './demo-reality-context-base.mjs';
import { ensureDemoRealityContext as ensureBaseDemoRealityContext } from './demo-reality-context-base.mjs';
import { ensureDemoProcedureOntology } from './demo-procedure-ontology.mjs';

export async function ensureDemoRealityContext(store,options={}){
  const result=await ensureBaseDemoRealityContext(store,options);
  if(process.env.ICTC_DEMO_SEED==='1'||result?.enabled){
    const ontology=await ensureDemoProcedureOntology(store,options);
    return {...result,procedureOntology:ontology};
  }
  return result;
}
