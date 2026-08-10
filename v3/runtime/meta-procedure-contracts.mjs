export const EPISTEMIC_META_PROCEDURE=Object.freeze({
  schemaVersion:'1.1.0',
  id:'epistemic-lattice',
  code:'EP-01',
  label:'Reticolo epistemico',
  purpose:'Ispezionare il reticolo cumulato di versioni, effetti, decisioni, review e derivazioni senza trasformarlo in un ottavo processo di compliance.',
  businessProcess:false,
  crossCutting:true,
  roles:Object.freeze(['admin','auditor']),
  permissions:Object.freeze({inspect:'verify-integrity',infer:'view-ai-usage',review:'manage-enterprise'}),
  modes:Object.freeze(['flat','graph']),
  ai:Object.freeze({humanOnRequired:true,outputStatus:'proposed',reviewRoles:Object.freeze(['admin']),businessMutationAllowed:false}),
  claimBoundary:'EP-01 descrive storia, relazioni e proposte di inferenza registrate da ICTC. Non determina applicabilita, conformita, sufficienza, efficacia dei controlli, qualificazione legale o certificazione.'
});
export function epistemicMetaProcedureFor(actor){return EPISTEMIC_META_PROCEDURE.roles.includes(String(actor?.role||''))?structuredClone(EPISTEMIC_META_PROCEDURE):null;}
export function epistemicMetaProcedureProjection(actor){const item=epistemicMetaProcedureFor(actor);return{schemaVersion:'1.1.0',authority:'epistemic-meta-procedure-contract',businessProcedureCountImpact:0,procedures:item?[item]:[]};}
