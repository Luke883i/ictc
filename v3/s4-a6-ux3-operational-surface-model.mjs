const must=(f,source,token,code)=>{if(!String(source||'').includes(token))f.push({code,token});};
export function validateOperationalSurface(s){
  const f=[];
  must(f,s.bootstrap,"import { installOperationalSurfaceA6Ux3 } from './operational-surface-a6-ux3.js'",'BOOTSTRAP_IMPORT');
  must(f,s.bootstrap,'installOperationalSurfaceA6Ux3();schedule();','BOOTSTRAP_INSTALL');
  for(const token of ["const VERSION='a6-ux3'",'PROCESS_ICONS','Integrated Compliance Tower Control','data-a6-registry','Aggiungi fonte o materiale','Materiali in ingresso','missionId(card)','incidentId(card)','a6RecordBinding','a6StableRecordSearch','a6ObjectLifecycle','a6RetiredDuplicate','a6ScopePopup','ictc:work-target-resolved'])must(f,s.operational,token,`OP_${token}`);
  if(/\bapi\s*\(/.test(s.operational)||/\bfetch\s*\(/.test(s.operational))f.push({code:'OP_BUSINESS_WRITE_AUTHORITY'});
  if(s.operational.includes('items[index]')||s.operational.includes('missions[index]')||s.operational.includes('incidents[index]'))f.push({code:'OP_INDEX_BINDING'});
  if(/applyCardFilter[\s\S]{0,1800}card\.textContent/.test(s.operational))f.push({code:'OP_DOM_AS_DATA_FILTER'});
  for(const token of ['standard-browser-master-detail','data-standard-node-select','data-standard-detail','specificSummary(node)','Sintesi specifica ICTC non disponibile','Comprendi standard'])must(f,s.standardBrowser,token,`STD_${token}`);
  for(const forbidden of ['data-standard-use','data-standard-use-save',"method:'POST'"])if(s.standardBrowser.includes(forbidden))f.push({code:`STD_READ_ONLY_${forbidden}`});
  for(const token of ['.home-business-priority[data-a6-priority-row="compact"]','.procedure-frame[data-a6-operational-frame="compact"]','[data-a6-attention-queue="compact"]','.a6-operational-registry','.standard-browser-master-detail','.finetune-concept-drilldown','.market-scope-editor[data-a6-scope-popup="native-details-overlay"][open]','position:fixed!important','@media(max-width:390px)'])must(f,s.css,token,`CSS_${token}`);
  if(/#[0-9a-fA-F]{3,8}\b/.test(s.css))f.push({code:'CSS_INDEPENDENT_PALETTE'});
  for(const token of ["finetune-concept-drilldown:visible')).to_have_count(0)","scopes=page.locator('#grcWorkspace .market-scope-editor')",'[data-open-standard-browser]','[data-standard-detail]','scopePopup'])must(f,s.finetuningBrowser,token,`FT_${token}`);
  if(s.finetuningBrowser.includes('atoms.count()==21'))f.push({code:'FT_RETIRED_CONCEPT_ORACLE'});
  for(const token of ['data-a6-unbound-records','Integrated Compliance Tower Control','[data-standard-detail]','position==\'fixed\'','320','390'])must(f,s.browserUx3,token,`BROWSER_${token}`);
  for(const token of ['s4-a6-ux3-operational-surface-check.mjs','s4-a6-ux3-operational-surface-saturation.mjs'])must(f,s.registry,token,`REG_${token}`);
  for(const token of ['A6-UX3 source contract','A6-UX3 100k source antagonists','browser-s4-a6-ux3-operational-surface.py','Start canonical current runtime'])must(f,s.workflow,token,`WF_${token}`);
  for(const token of ['"currentSubSlice": "A6-UX3"','"trajectoryImpact": "planned"','"parentRemainsOpen": true','"nextSlice": "S4-A6"','scope editor becomes an in-page popup overlay'])must(f,s.authority,token,`AUTH_${token}`);
  for(const token of ['"executionUnit":"A6-UX3"','"parentRemainsOpen":true','"mutationTrials":100000','"Scope editing becomes an overlay without changing the existing standards scope route."'])must(f,s.contract,token,`CONTRACT_${token}`);
  return f;
}
