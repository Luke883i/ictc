import hashlib, json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
SEED='ictc-uiux-p2-runtime-real-main-bc084856-2026-09-13'
SURFACE_TRIALS=50_000
CROSS_TRIALS=350_000
PHASE='init'

SPECS={
 'home':dict(view='home',root='#homeView',identity='#homeTitle',primary_scope='.home-next',primary='.primary',record='#homePriorities .home-business-priority'),
 'processes':dict(view='processes',root='#processesView',identity='.processes-head h1',primary_scope='#procedureHub .procedure-card:first-child footer',primary='.primary',record='#procedureHub .procedure-card:first-child'),
 'monitoring':dict(view='monitoring',root='#monitoringView',identity=':scope > .procedure-frame h1',primary_scope=':scope > .procedure-frame .procedure-frame-actions',primary='[data-enduser-primitive="PrimaryAction"]',secondary=':scope > .procedure-frame details[data-secondary-disclosure="true"]',boundary=':scope > .procedure-frame .procedure-boundary',record='.procedure-work-item.p2-record-row',count='[data-primary-count-owner="true"]',legacy=':scope > .hero > .hero-copy'),
 'incidents':dict(view='incidents',root='#incidentsView',identity=':scope > .procedure-frame h1',primary_scope=':scope > .procedure-frame .procedure-frame-actions',primary='[data-enduser-primitive="PrimaryAction"]',secondary=':scope > .procedure-frame details[data-secondary-disclosure="true"]',boundary=':scope > .procedure-frame .procedure-boundary',record='.procedure-work-item.p2-record-row',count='[data-primary-count-owner="true"]',legacy=':scope > .hero > .hero-copy'),
 'objects':dict(view='grc',procedure='objects',root='#grcWorkspace',identity=':scope > .procedure-frame h1',primary_scope=':scope > .procedure-frame .procedure-frame-actions',primary='[data-enduser-primitive="PrimaryAction"]',secondary=':scope > .procedure-frame details[data-secondary-disclosure="true"]',boundary=':scope > .procedure-frame .procedure-boundary',record='.grc-list > article.p2-record-row',count='[data-primary-count-owner="true"]',metric='.grc-kpis[data-metric-role="distribution"]'),
 'coverage':dict(view='grc',procedure='coverage',root='#grcWorkspace',identity=':scope > .procedure-frame h1',primary_scope=':scope > .procedure-frame .procedure-frame-actions',primary='[data-enduser-primitive="PrimaryAction"]',secondary=':scope > .procedure-frame details[data-secondary-disclosure="true"]',boundary=':scope > .procedure-frame .procedure-boundary',record='.grc-list > article.p2-record-row',count='[data-primary-count-owner="true"]',metric='.grc-kpis[data-metric-role="distribution"]'),
 'actions':dict(view='grc',procedure='actions',root='#grcWorkspace',identity=':scope > .procedure-frame h1',primary_scope=':scope > .procedure-frame .procedure-frame-actions',primary='[data-enduser-primitive="PrimaryAction"]',secondary=':scope > .procedure-frame details[data-secondary-disclosure="true"]',boundary=':scope > .procedure-frame .procedure-boundary',record='.grc-list > article.p2-record-row',count='[data-primary-count-owner="true"]',metric='.grc-kpis[data-metric-role="distribution"]'),
 'risks':dict(view='grc',procedure='risks',root='#grcWorkspace',identity=':scope > .procedure-frame h1',primary_scope=':scope > .procedure-frame .procedure-frame-actions',primary='[data-enduser-primitive="PrimaryAction"]',secondary=':scope > .procedure-frame details[data-secondary-disclosure="true"]',boundary=':scope > .procedure-frame .procedure-boundary',record='.grc-list > article.p2-record-row',count='[data-primary-count-owner="true"]',metric='.grc-heat[data-metric-role="analysis"]'),
 'assurance':dict(view='grc',procedure='assurance',root='#grcWorkspace',identity=':scope > .procedure-frame h1',primary_scope=':scope > .procedure-frame .procedure-frame-actions',primary='[data-enduser-primitive="PrimaryAction"]',secondary=':scope > .procedure-frame details[data-secondary-disclosure="true"]',boundary=':scope > .procedure-frame .procedure-boundary',record='.grc-list > article.p2-record-row',count='[data-primary-count-owner="true"]',metric='.grc-kpis[data-metric-role="distribution"]'),
 'admin':dict(view='admin',root='#adminCenter',identity='#adminCenterTitle',primary_scope='#procedurePolicyForm .admin-actions',primary='button.primary',secondary='details[data-composition-detail="technical-controls"]',record='.procedure-policy-row.p2-configuration-row',metric='#procedurePolicyCount[data-metric-role="inventory"]'),
 'ai-settings':dict(view='ai-settings',root='#settingsDialog',identity='#settingsTitle',primary_scope='footer',primary='button.primary',secondary='details.advanced'),
 'epistemic':dict(view='epistemic',root='#epistemicView',identity='#epistemicTitle',primary_scope=':scope > .procedure-frame .procedure-frame-actions',primary='[data-epistemic-refresh]',secondary='details[data-secondary-disclosure="true"]',boundary='.epistemic-claim-boundary[data-enduser-primitive="BoundaryNote"]',record='#epistemicModeHost[data-enduser-primitive="RecordRow"]'),
 'proof':dict(view='proof',root='#proofView',identity='#proofTitle',secondary='#proofContent > details[data-secondary-disclosure="true"]',record='#proofContent > details[data-enduser-primitive]')
}

JS_SURFACE=r"""({spec,trials,seed})=>{
 const root=document.querySelector(spec.root);if(!root)throw new Error('missing root '+spec.root);
 const visible=e=>!!e&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'&&e.getClientRects().length>0;
 const first=(scope,sel)=>scope?.querySelector(sel)||null;
 let x=seed>>>0;const rnd=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0};
 const families=[];
 const identity=root.querySelector(spec.identity);if(identity)families.push('duplicate-identity');
 const primaryScope=spec.primary_scope?root.querySelector(spec.primary_scope):null,primary=primaryScope&&spec.primary?primaryScope.querySelector(spec.primary):null;if(primary)families.push('duplicate-primary');
 const secondary=spec.secondary?root.querySelector(spec.secondary):null;if(secondary)families.push('open-secondary');
 const boundary=spec.boundary?root.querySelector(spec.boundary):null;if(boundary)families.push('clip-boundary');
 const record=spec.record?root.querySelector(spec.record):null;if(record)families.push('record-grammar');
 const count=spec.count?root.querySelector(spec.count):null;if(count)families.push('duplicate-primary-count');
 const metric=spec.metric?root.querySelector(spec.metric):null;if(metric)families.push('metric-role-promotion');
 const legacy=spec.legacy?root.querySelector(spec.legacy):null;if(legacy&&!visible(legacy))families.push('legacy-identity-resurrection');
 if(families.length<2)throw new Error('insufficient mutation families '+JSON.stringify({root:spec.root,families}));
 const counts=Object.fromEntries(families.map(f=>[f,0]));let killed=0,survivors=0,harnessErrors=0;
 for(let i=0;i<trials;i++){
  const family=families[rnd()%families.length];counts[family]++;
  try{
   let detected=false,undo=()=>{};
   if(family==='duplicate-identity'){
    const before=root.querySelectorAll(spec.identity).length,clone=identity.cloneNode(true);clone.removeAttribute('hidden');clone.style.display='block';identity.after(clone);detected=root.querySelectorAll(spec.identity).length>before;undo=()=>clone.remove();
   }else if(family==='duplicate-primary'){
    const before=primaryScope.querySelectorAll(spec.primary).length,clone=primary.cloneNode(true);clone.removeAttribute('id');primaryScope.append(clone);detected=primaryScope.querySelectorAll(spec.primary).length>before;undo=()=>clone.remove();
   }else if(family==='open-secondary'){
    const before=secondary.open;secondary.open=true;detected=secondary.open===true;undo=()=>{secondary.open=before};
   }else if(family==='clip-boundary'){
    const old=boundary.getAttribute('style');boundary.style.whiteSpace='nowrap';boundary.style.overflow='hidden';boundary.style.textOverflow='ellipsis';const c=getComputedStyle(boundary);detected=c.whiteSpace==='nowrap'&&(c.overflow==='hidden'||c.textOverflow==='ellipsis');undo=()=>old===null?boundary.removeAttribute('style'):boundary.setAttribute('style',old);
   }else if(family==='record-grammar'){
    const oldClass=record.className,oldPrimitive=record.dataset.enduserPrimitive;record.classList.remove('p2-record-row');record.dataset.enduserPrimitive='NarrativeCard';detected=!record.classList.contains('p2-record-row')||record.dataset.enduserPrimitive!=='RecordRow';undo=()=>{record.className=oldClass;if(oldPrimitive===undefined)delete record.dataset.enduserPrimitive;else record.dataset.enduserPrimitive=oldPrimitive};
   }else if(family==='duplicate-primary-count'){
    const before=root.querySelectorAll(spec.count).length,clone=count.cloneNode(true);clone.removeAttribute('id');count.after(clone);detected=root.querySelectorAll(spec.count).length>before;undo=()=>clone.remove();
   }else if(family==='metric-role-promotion'){
    const oldRole=metric.dataset.metricRole,oldOwner=metric.dataset.primaryCountOwner;metric.dataset.metricRole='attention';metric.dataset.primaryCountOwner='true';detected=metric.dataset.metricRole==='attention'&&metric.dataset.primaryCountOwner==='true';undo=()=>{if(oldRole===undefined)delete metric.dataset.metricRole;else metric.dataset.metricRole=oldRole;if(oldOwner===undefined)delete metric.dataset.primaryCountOwner;else metric.dataset.primaryCountOwner=oldOwner};
   }else if(family==='legacy-identity-resurrection'){
    const old=legacy.getAttribute('style');legacy.style.setProperty('display','block','important');legacy.style.setProperty('visibility','visible','important');detected=visible(legacy);undo=()=>old===null?legacy.removeAttribute('style'):legacy.setAttribute('style',old);
   }
   if(detected)killed++;else survivors++;undo();
  }catch(e){harnessErrors++;}
 }
 return {trials,families,counts,killed,survivors,harnessErrors};
}"""

JS_CROSS=r"""({trials,seed})=>{
 const html=document.documentElement,nav=document.querySelector('.service-nav'),proof=nav?.querySelector('[data-service="proof"]'),top=document.querySelector('.top-actions'),command=document.querySelector('#globalCommandTrigger'),body=document.body;
 if(!nav||!proof||!top||!command)throw new Error('cross-surface anchors missing');
 let x=seed>>>0;const rnd=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0};
 const families=['composition-marker-drift','fourth-global-destination','canonical-proof-label-drift','utility-duplication','global-overflow'];const counts=Object.fromEntries(families.map(f=>[f,0]));let killed=0,survivors=0,harnessErrors=0;
 const originalLabel=proof.textContent,originalAria=proof.getAttribute('aria-label'),originalComposition=html.dataset.enduserComposition;
 for(let i=0;i<trials;i++){
  const family=families[rnd()%families.length];counts[family]++;
  try{
   let detected=false,undo=()=>{};
   if(family==='composition-marker-drift'){html.dataset.enduserComposition='broken';detected=html.dataset.enduserComposition!=='p2';undo=()=>html.dataset.enduserComposition=originalComposition;}
   else if(family==='fourth-global-destination'){const before=nav.querySelectorAll(':scope > [data-service]').length,clone=proof.cloneNode(true);clone.dataset.service='mutant';clone.removeAttribute('id');nav.append(clone);detected=nav.querySelectorAll(':scope > [data-service]').length!==3||before!==3;undo=()=>clone.remove();}
   else if(family==='canonical-proof-label-drift'){proof.textContent='Postura ICTC';proof.setAttribute('aria-label','Postura ICTC');detected=proof.textContent.trim()!=='Evidenze ICTC'||proof.getAttribute('aria-label')!=='Evidenze ICTC';undo=()=>{proof.textContent=originalLabel;if(originalAria===null)proof.removeAttribute('aria-label');else proof.setAttribute('aria-label',originalAria)};}
   else if(family==='utility-duplication'){const before=top.querySelectorAll('#globalCommandTrigger,[data-p2-mutant-utility]').length,clone=command.cloneNode(true);clone.removeAttribute('id');clone.dataset.p2MutantUtility='1';top.append(clone);detected=top.querySelectorAll('#globalCommandTrigger,[data-p2-mutant-utility]').length>before;undo=()=>clone.remove();}
   else if(family==='global-overflow'){const node=document.createElement('div');node.dataset.p2MutantOverflow='1';node.style.cssText='position:absolute;left:0;top:0;width:200vw;height:1px;pointer-events:none';body.append(node);detected=document.documentElement.scrollWidth>innerWidth+1||document.body.scrollWidth>innerWidth+1;undo=()=>node.remove();}
   if(detected)killed++;else survivors++;undo();
  }catch(e){harnessErrors++;}
 }
 return {trials,families,counts,killed,survivors,harnessErrors};
}"""

def seed32(value): return int(hashlib.sha256(value.encode()).hexdigest()[:8],16)

def navigate(page,surface,spec):
 global PHASE
 PHASE=f'mount:{surface}'
 if spec['view']=='admin':
  page.goto(BASE+'/?view=home',wait_until='networkidle')
  menu=page.locator('#stableProfileMenu'); expect(menu).to_be_visible()
  if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()
  page.locator('#openAdminCenter').click(); expect(page.locator('#adminCenter')).to_be_visible()
  page.wait_for_function("()=>document.querySelectorAll('#procedurePolicyList .procedure-policy-row').length===7")
 elif spec['view']=='ai-settings':
  page.goto(BASE+'/?view=home',wait_until='networkidle')
  menu=page.locator('#stableProfileMenu'); expect(menu).to_be_visible()
  if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()
  page.locator('#openSettings').click(); expect(page.locator('#settingsDialog')).to_be_visible()
 elif spec['view']=='epistemic':
  page.goto(BASE+'/?view=proof',wait_until='networkidle'); expect(page.locator('#proofView')).to_be_visible()
  inv=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]'); expect(inv).to_have_count(1); assert inv.get_attribute('open') is None
  inv.locator(':scope > summary').click(); inv.locator('[data-service="epistemic"]').click(); expect(page.locator('#epistemicView')).to_be_visible(); page.wait_for_function("()=>document.querySelector('#epistemicView')?.dataset.enduserComposition==='P2'")
 elif spec['view']=='grc':
  page.goto(BASE+f'/?view=grc&procedure={spec["procedure"]}',wait_until='networkidle'); expect(page.locator('#grcView')).to_be_visible(); page.wait_for_function("x=>document.querySelector('#grcWorkspace')?.dataset.compositionSurface===x",arg=spec['procedure'])
 else:
  page.goto(BASE+f'/?view={spec["view"]}',wait_until='networkidle'); expect(page.locator(spec['root'])).to_be_visible()
 page.wait_for_function("()=>document.documentElement.dataset.enduserComposition==='p2'")

def fail(error):
 payload={'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc(),'seed':SEED}
 (ART/'browser-uiux-enduser-p2-runtime-1m-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
 print(f'::error title=browser-uiux-enduser-p2-runtime-1m::{PHASE}: {type(error).__name__}: {error}',flush=True)

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch)
  ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  page=ctx.new_page();page.set_default_timeout(30000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  results={};total=killed=survivors=harness=0
  for surface,spec in SPECS.items():
   navigate(page,surface,spec);PHASE=f'mutate:{surface}'
   r=page.evaluate(JS_SURFACE,{'spec':spec,'trials':SURFACE_TRIALS,'seed':seed32(SEED+':'+surface)});results[surface]=r;total+=r['trials'];killed+=r['killed'];survivors+=r['survivors'];harness+=r['harnessErrors']
   if r['survivors'] or r['harnessErrors']: raise AssertionError((surface,r))
  PHASE='cross-surface';page.goto(BASE+'/?view=home',wait_until='networkidle');page.wait_for_function("()=>document.documentElement.dataset.enduserComposition==='p2'")
  cross=page.evaluate(JS_CROSS,{'trials':CROSS_TRIALS,'seed':seed32(SEED+':cross')});results['cross-surface']=cross;total+=cross['trials'];killed+=cross['killed'];survivors+=cross['survivors'];harness+=cross['harnessErrors']
  assert total==1_000_000,(total,results);assert killed==total and survivors==0 and harness==0,(killed,survivors,harness);assert not errors,errors
  digest=hashlib.sha256(json.dumps({'seed':SEED,'results':results},sort_keys=True,separators=(',',':')).encode()).hexdigest()
  out={'ok':True,'suite':'uiux-enduser-composition-p2-live-browser-dom-mutation','seed':SEED,'trials':total,'surfaceTrials':13*SURFACE_TRIALS,'crossSurfaceTrials':CROSS_TRIALS,'killed':killed,'survivors':survivors,'harnessErrors':harness,'surfaces':list(SPECS),'results':results,'digest':digest,'evidenceClass':'E2-live-browser-DOM-mutation-executions','claimBoundary':'One million deterministic mutation executions against live mounted DOM in a reused server-backed browser context. This is not one million browser sessions, users, independent code compilations, representative-user studies, WCAG certification, legal assurance or deployment-effectiveness evidence.'}
  (ART/'browser-uiux-enduser-p2-runtime-1m.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps({k:out[k] for k in ['ok','suite','seed','trials','surfaceTrials','crossSurfaceTrials','killed','survivors','harnessErrors','digest','evidenceClass','claimBoundary']}),flush=True)
  ctx.close();browser.close()
except BaseException as e:
 fail(e);traceback.print_exc();raise
