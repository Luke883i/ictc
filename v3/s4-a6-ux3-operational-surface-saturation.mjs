import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateOperationalSurface} from './s4-a6-ux3-operational-surface-model.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const sources={bootstrap:await read('./public/ui/visual-epistemic-runtime.js'),operational:await read('./public/ui/operational-surface-a6-ux3.js'),standardBrowser:await read('./public/ui/standard-browser.js'),css:await read('./public/a6-ux3-operational-surface.css'),styles:await read('./public/styles.css'),finetuningBrowser:await read('./browser-procedure-finetuning-1-4-base.py'),browserUx3:await read('./browser-s4-a6-ux3-operational-surface.py'),registry:await read('./current-gate-registry.mjs'),workflow:await read('../.github/workflows/s4-a6-ux3-operational-surface.yml'),authority:await read('../docs/convergence/convergence-authority.json'),contract:await read('./s4-a6-ux3-operational-surface-contract.json')};
assert.deepEqual(validateOperationalSurface(sources),[],'baseline must satisfy A6-UX3 source model');
const remove=(key,token)=>({key,token});
const inject=(key,text)=>({key,inject:text});
const families=[
 remove('bootstrap','installOperationalSurfaceA6Ux3();'),inject('bootstrap',"\n// mutant late style owner: a6-ux3-operational-surface.css\n"),
 remove('styles',"@import url('./a6-ux3-operational-surface.css');"),remove('styles',"@import url('./a6-ux1-fixed-safe-footer.css');"),
 remove('operational',"const VERSION='a6-ux3'"),remove('operational','PROCESS_ICONS'),remove('operational','Integrated Compliance Tower Control'),remove('operational','data-a6-registry'),remove('operational','missionId(card)'),remove('operational','incidentId(card)'),remove('operational','a6RecordBinding'),remove('operational','a6StableRecordSearch'),remove('operational','a6ObjectLifecycle'),remove('operational','a6ScopePopup'),remove('operational','ictc:work-target-resolved'),remove('operational',"const TERMINAL_INCIDENT_STATES=new Set(['closed','resolved','cancelled'])"),remove('operational',"id:'monitoring',label:'Monitoraggi',process:'monitoring',count:byId.size,open:true"),remove('operational',"ensureFilter(details,{id:'monitoring',process:'monitoring',defaultValue:'active'"),remove('operational',"id:'incidents',label:'Eventi registrati',process:'incidents',count:byId.size,open:true"),remove('operational',"ensureFilter(details,{id:'incidents',process:'incidents',defaultValue:'open'"),inject('operational',"\nfunction ensureStyle(){document.head.dataset.a6Ux3Style='mutant';}\n"),
 remove('standardBrowser','standard-browser-master-detail'),remove('standardBrowser','data-standard-node-select'),remove('standardBrowser','specificSummary(node)'),remove('standardBrowser','Sintesi specifica ICTC non disponibile'),remove('standardBrowser','Comprendi standard'),
 remove('css','#homeView{padding-bottom:max(var(--a6-ux1-footer-reserve),1rem)!important}'),remove('css','scroll-margin-bottom:calc(var(--a6-ux1-footer-reserve) + .5rem)'),remove('css','.a6-process-icon{width:16px!important;height:16px!important'),remove('css','.procedure-frame[data-a6-operational-frame="compact"]'),remove('css','[data-a6-attention-queue="compact"]'),remove('css','.a6-operational-registry'),remove('css','.standard-browser-master-detail'),remove('css','.finetune-concept-drilldown'),remove('css','.market-scope-editor[data-a6-scope-popup="native-details-overlay"][open]'),remove('css','position:fixed!important'),
 remove('finetuningBrowser','scopePopup'),remove('finetuningBrowser',"scopes=page.locator('#grcWorkspace .market-scope-editor')"),remove('browserUx3',"position=='fixed'"),remove('registry','s4-a6-ux3-operational-surface-check.mjs'),remove('workflow','A6-UX3 100k source antagonists'),remove('authority','"currentSubSlice": "A6-UX3"'),remove('authority','scope editor becomes an in-page popup overlay'),remove('contract','"mutationTrials":100000')
];
const killed=Object.fromEntries(families.map((_,i)=>[`F${String(i+1).padStart(2,'0')}`,0]));let survivors=0;
for(let i=0;i<100000;i++){
  const familyIndex=i%families.length,family=families[familyIndex],mutant={...sources};
  if(family.inject!==undefined)mutant[family.key]=`${mutant[family.key]}${family.inject}`;
  else mutant[family.key]=mutant[family.key].split(family.token).join(`__A6UX3_MUTANT_${familyIndex}__`);
  const failures=validateOperationalSurface(mutant);
  if(failures.length)killed[`F${String(familyIndex+1).padStart(2,'0')}`]++;else survivors++;
}
assert.equal(survivors,0,'every A6-UX3 source antagonist must be killed');
assert.equal(Object.values(killed).filter(Boolean).length,families.length,'every mutation family must be exercised and killed');
console.log(JSON.stringify({ok:true,slice:'S4-A6',executionUnit:'A6-UX3',trials:100000,mutantFamilies:families.length,mutantFamiliesKilled:families.length,survivors,seed:'deterministic-round-robin',claimBoundary:'E2 source/model antagonists only; not runtime, human usability, production effectiveness or independent assurance.'}));
