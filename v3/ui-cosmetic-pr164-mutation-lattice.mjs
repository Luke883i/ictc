import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const here=path.dirname(fileURLToPath(import.meta.url));
const repoRoot=path.dirname(here);
const read=p=>readFileSync(path.join(here,p),'utf8');
const baseline=Object.freeze({
  wrap:{identitySaturates:true,naturalWrap:true,technicalOverflowOwned:true,mutationSafe:true},
  action:{clusterLocal:true,minTargetPx:44,mobileReflow:true},
  state:{axesSeparate:true,unknownStaysUnknown:true,standardUseVocabulary:'tracked/reference/not-used/undeclared',undeclaredLabel:'Uso da dichiarare'},
  context:{canonicalOrder:true,progressive:true,referenceSubordinate:true},
  scope:{opaque:true,cancelWrites:false,explicitSave:true,persistenceReadback:true},
  standardBrowser:{masterDetail:true,selectedVisible:true,provenanceVisible:true,singleDesktopScrollOwner:true,narrowReflow:true},
  admin:{canonicalCopy:true,procedureCount:7,technicalFlagJargon:false,compact:true},
  ai:{visualMode:'icon-only',fixedLabel:false,tooltip:true,roleSeparate:true,readyIcon:'sparkles',unconfiguredIcon:'info',keyMissingIcon:'triangle-alert'},
  verification:{viewports:[1440,820,390,320],newAuthority:false,semanticClaimInflation:false}
});
const clone=o=>structuredClone(o);
function validate(o){
  const f=[];
  if(!o.wrap.identitySaturates||!o.wrap.naturalWrap||!o.wrap.technicalOverflowOwned||!o.wrap.mutationSafe)f.push('wrap');
  if(!o.action.clusterLocal||o.action.minTargetPx<44||!o.action.mobileReflow)f.push('action');
  if(!o.state.axesSeparate||!o.state.unknownStaysUnknown||o.state.standardUseVocabulary!=='tracked/reference/not-used/undeclared'||o.state.undeclaredLabel!=='Uso da dichiarare')f.push('state');
  if(!o.context.canonicalOrder||!o.context.progressive||!o.context.referenceSubordinate)f.push('context');
  if(!o.scope.opaque||o.scope.cancelWrites!==false||!o.scope.explicitSave||!o.scope.persistenceReadback)f.push('scope');
  if(!o.standardBrowser.masterDetail||!o.standardBrowser.selectedVisible||!o.standardBrowser.provenanceVisible||!o.standardBrowser.singleDesktopScrollOwner||!o.standardBrowser.narrowReflow)f.push('standard-browser');
  if(!o.admin.canonicalCopy||o.admin.procedureCount!==7||o.admin.technicalFlagJargon||!o.admin.compact)f.push('admin');
  if(o.ai.visualMode!=='icon-only'||o.ai.fixedLabel||!o.ai.tooltip||!o.ai.roleSeparate||o.ai.readyIcon!=='sparkles'||o.ai.unconfiguredIcon!=='info'||o.ai.keyMissingIcon!=='triangle-alert')f.push('ai');
  if(JSON.stringify(o.verification.viewports)!==JSON.stringify([1440,820,390,320])||o.verification.newAuthority||o.verification.semanticClaimInflation)f.push('verification');
  return f;
}
assert.deepEqual(validate(baseline),[]);
const families=[];
const add=(id,fn,level)=>families.push({id,fn,level});
add('wrap-cap-return',o=>o.wrap.identitySaturates=false,'local');
add('nowrap-return',o=>o.wrap.naturalWrap=false,'local');
add('technical-overflow-globalized',o=>o.wrap.technicalOverflowOwned=false,'local');
add('important-blocks-inline-mutant',o=>o.wrap.mutationSafe=false,'local');
add('action-global-equivalence',o=>o.action.clusterLocal=false,'local');
add('target-36',o=>o.action.minTargetPx=36,'local');
add('mobile-action-overflow',o=>o.action.mobileReflow=false,'local');
add('axis-collapse',o=>o.state.axesSeparate=false,'semantic');
add('unknown-negative',o=>o.state.unknownStaysUnknown=false,'semantic');
add('legacy-standard-use-vocabulary',o=>o.state.standardUseVocabulary='in-scope/reference/out-of-scope/not-assessed','semantic');
add('undeclared-collapsed-to-evaluation',o=>o.state.undeclaredLabel='Da valutare','semantic');
add('css-visual-reorder',o=>o.context.canonicalOrder=false,'component');
add('context-wall',o=>o.context.progressive=false,'component');
add('reference-dominates-work',o=>o.context.referenceSubordinate=false,'component');
add('scope-transparent',o=>o.scope.opaque=false,'component');
add('cancel-autosaves',o=>o.scope.cancelWrites=true,'semantic');
add('implicit-save',o=>o.scope.explicitSave=false,'semantic');
add('save-without-readback',o=>o.scope.persistenceReadback=false,'semantic');
add('browser-flat',o=>o.standardBrowser.masterDetail=false,'component');
add('selection-invisible',o=>o.standardBrowser.selectedVisible=false,'component');
add('provenance-hidden',o=>o.standardBrowser.provenanceVisible=false,'semantic');
add('nested-scroll',o=>o.standardBrowser.singleDesktopScrollOwner=false,'component');
add('narrow-two-columns',o=>o.standardBrowser.narrowReflow=false,'component');
add('admin-copy-drift',o=>o.admin.canonicalCopy=false,'semantic');
add('eighth-procedure',o=>o.admin.procedureCount=8,'semantic');
add('feature-flag-jargon',o=>o.admin.technicalFlagJargon=true,'component');
add('admin-card-wall',o=>o.admin.compact=false,'component');
add('ai-text-pill',o=>o.ai.visualMode='text-pill','component');
add('ai-fixed-label',o=>o.ai.fixedLabel=true,'component');
add('ai-tooltip-loss',o=>o.ai.tooltip=false,'component');
add('ai-role-collapse',o=>o.ai.roleSeparate=false,'semantic');
add('ai-unconfigured-warning',o=>o.ai.unconfiguredIcon='triangle-alert','component');
add('ai-key-info',o=>o.ai.keyMissingIcon='info','component');
add('ai-ready-info',o=>o.ai.readyIcon='info','component');
add('drop-320',o=>o.verification.viewports=o.verification.viewports.filter(x=>x!==320),'global');
add('new-presentation-authority',o=>o.verification.newAuthority=true,'global');
add('claim-inflation',o=>o.verification.semanticClaimInflation=true,'global');

for(const f of families){
  const m=clone(baseline);
  f.fn(m);
  assert.ok(validate(m).length>0,'survived material mutant: '+f.id);
}
function seed32(text){let h=2166136261>>>0;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h||0x9e3779b9}
function rng(seed){let x=seed32(seed);return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
const campaigns=[
  {id:'PR164-L0-GEOMETRY',trials:1_000,levels:new Set(['local'])},
  {id:'PR164-L1-COMPONENT',trials:10_000,levels:new Set(['local','component'])},
  {id:'PR164-L2-CROSS-SURFACE',trials:100_000,levels:new Set(['component','semantic'])},
  {id:'PR164-L3-GLOBAL',trials:1_000_000,levels:new Set(['local','component','semantic','global'])}
];
const reports=[];
for(const spec of campaigns){
  const pool=families.filter(f=>spec.levels.has(f.level));
  const next=rng('ictc-pr164-'+spec.id);
  const hits=Object.fromEntries(pool.map(f=>[f.id,0]));
  let killed=0;
  const digest=createHash('sha256');
  for(let i=0;i<spec.trials;i++){
    const depth=spec.id.endsWith('GLOBAL')?1+(next()%4):1+(next()%Math.min(3,pool.length));
    const m=clone(baseline),chosen=[];
    for(let j=0;j<depth;j++){const f=pool[next()%pool.length];f.fn(m);hits[f.id]++;chosen.push(f.id)}
    const findings=validate(m);
    assert.ok(findings.length>0,'schedule survived: '+spec.id+':'+i);
    killed++;
    digest.update(i+':'+chosen.join(',')+':'+findings.join(',')+'\n');
  }
  assert.equal(killed,spec.trials);
  assert.ok(Object.values(hits).every(n=>n>0),'unhit family in '+spec.id);
  reports.push({id:spec.id,trials:spec.trials,families:pool.length,killed,survivors:0,minHits:Math.min(...Object.values(hits)),maxHits:Math.max(...Object.values(hits)),digest:digest.digest('hex')});
}

const styles=read('public/styles.css');
const shared=read('public/semantic-workspace-closure-3-2-1.css');
const ux4=read('public/a6-ux4-semantic-surface.css');
const enterprise=read('public/enterprise-workspace-3-2.css');
const chrome=read('public/workspace-chrome-3-3.css');
const market=read('public/ui/procedure-market-ux.js');
const ai=read('public/ui/enterprise-ux.js');
const browser=read('browser-uiux-beauty-p4.py');
assert.ok(!styles.includes('cosmetic-convergence-3-5.css'),'temporary resolver still mounted');
for(const token of ['PR164','max-width:none!important','overflow-wrap:break-word'])assert.ok(shared.includes(token),'shared owner missing '+token);
for(const token of ['data-scope-back-label','Salva scelta','Tornare indietro non salva la scelta',"'tracked','Tracciato'","'not-used','Non utilizzato'",'Uso da dichiarare',"['tracked','reference'].includes(standardUse(f.scope?.decision))"])assert.ok(market.includes(token),'scope runtime missing '+token);
for(const token of ['market-scope-editor[open] [data-scope-back-label]','#standardBrowserDialog','standard-node-select[aria-current="true"]'])assert.ok(ux4.includes(token),'UX4 owner missing '+token);
for(const token of ['#procedurePolicyList','dialog .dialog-shell>footer'])assert.ok(enterprise.includes(token),'enterprise owner missing '+token);
for(const token of ['#runtimeStatus::after','content:attr(data-tooltip)'])assert.ok(chrome.includes(token),'chrome owner missing '+token);
assert.ok(ai.includes("llm.ready?'sparkles':llm.configured?'triangle-alert':'info'")&&!ai.includes('runtime-role-label'),'AI owner not icon-only');
for(const token of ["('narrow', 320, 780)",'scope-cancel-no-write-save-readback','header-ai-icon-only'])assert.ok(browser.includes(token),'browser oracle missing '+token);

const payload={ok:true,suite:'PR164-cosmetic-semantic-mutation-lattice',materialFamilies:families.length,materialMutantsBuiltAndKilled:families.length,totalSchedules:reports.reduce((n,x)=>n+x.trials,0),campaigns:reports,survivors:0,claimBoundary:'Deterministic repository/model mutation evidence plus source anchors; not representative human aesthetic/usability evidence or independent assurance.'};
mkdirSync(path.join(repoRoot,'artifacts'),{recursive:true});
writeFileSync(path.join(repoRoot,'artifacts','ui-cosmetic-pr164-mutation-lattice.json'),JSON.stringify(payload,null,2));
console.log(JSON.stringify(payload));
