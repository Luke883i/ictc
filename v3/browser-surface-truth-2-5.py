import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'; INVENTORY=[]; VIOLATIONS=[]
PROOF_READING_ORDER='facts>decisions>evidence-basis>trace>epistemic>external>integrity>method>export'
SEMANTIC='h1,h2,h3,h4,p,small,label,button,a[href],input,select,textarea,summary,dt,dd,th,td,legend,li,span,b,strong,em,[role="status"],[role="alert"],.surface-chip,.counter,.empty'

def fail(exc):
 payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'violations':VIOLATIONS}
 (ART/'browser-procedure-finetuning-1-4-surface-truth-2-5-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
 print(f'::error title=browser-surface-truth-2-5::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def no_overflow(page):
 m=page.evaluate('()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
 assert max(m['html'],m['body'])<=m['inner']+1,m

def open_view(page,view,selector):
 page.goto(f'{BASE}/?view={view}',wait_until='networkidle')
 expect(page.locator(selector)).to_be_visible()
 page.wait_for_function("()=>document.documentElement.dataset.ictcSurfaceTruth==='2.5.0'")

def open_process(page,code):
 open_view(page,'processes','#processesView')
 card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible()
 card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click(); page.wait_for_timeout(160)

def visible_orientation_count(page,selector):
 return page.locator(selector).evaluate("""root=>[...root.querySelectorAll('.procedure-frame,.hero:not([data-editorial-slot="controls"])')].filter(e=>{const s=getComputedStyle(e);return !e.closest('[hidden]')&&s.display!=='none'&&s.visibility!=='hidden'&&e.getClientRects().length>0}).length""")

def snapshot(page,name,selector):
 page.wait_for_timeout(40)
 result=page.locator(selector).evaluate("""(root,semantic)=>{const norm=v=>String(v||'').replace(/\s+/g,' ').trim();const visible=e=>{const s=getComputedStyle(e);return !e.closest('[hidden]')&&s.display!=='none'&&s.visibility!=='hidden'&&e.getClientRects().length>0};const label=e=>{const a=norm(e.getAttribute('aria-label'));if(a)return a;const ids=norm(e.getAttribute('aria-labelledby'));if(ids){const x=ids.split(/\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' ');if(norm(x))return norm(x)}if(['INPUT','SELECT','TEXTAREA'].includes(e.tagName)){const ls=e.labels?[...e.labels]:[];if(ls.length&&norm(ls.map(x=>x.textContent).join(' ')))return norm(ls.map(x=>x.textContent).join(' '));if(e.closest('label')&&norm(e.closest('label').textContent))return norm(e.closest('label').textContent)}return norm(e.textContent)||norm(e.getAttribute('title'))};const nodes=[...root.querySelectorAll(semantic)].filter(visible);const rows=nodes.map(e=>({kind:e.dataset.surfaceKind||'',truth:e.dataset.surfaceTruth||'',confidence:Number(e.dataset.surfaceConfidence||0)}));const critical=rows.filter(x=>['title','status','metric','action','input','navigation','disclosure','evidence'].includes(x.kind));const controls=[...root.querySelectorAll('button,summary,input,select,textarea')].filter(visible);const small=controls.map(e=>{let t=e;if(e.matches('input[type=checkbox],input[type=radio],input[type=file]'))t=[...(e.labels||[])].find(visible)||e;const r=t.getBoundingClientRect();return{tag:e.tagName.toLowerCase(),id:e.id||'',h:r.height}}).filter(x=>x.h<43.5);const unnamed=[...root.querySelectorAll('button,a[href],input,select,textarea,summary')].filter(visible).filter(e=>!label(e)).map(e=>`${e.tagName.toLowerCase()}#${e.id||''}`);const details=[...root.querySelectorAll('details')].filter(visible);const depth=Math.max(0,...details.map(e=>{let d=1,n=e;while((n=n.parentElement))if(n.tagName==='DETAILS')d++;return d}));return{visible:rows.length,high:rows.filter(x=>x.confidence>=.95).length,critical:critical.length,criticalHigh:critical.filter(x=>x.confidence>=.95).length,fakeVisible:rows.filter(x=>x.truth==='fake').length,unknownCritical:critical.filter(x=>x.truth==='unknown').length,smallTargets:small,unnamed,maxDisclosureDepth:depth}}""",SEMANTIC)
 cov=result['high']/result['visible'] if result['visible'] else 0
 crit=1 if not result['critical'] else result['criticalHigh']/result['critical']
 if result['visible']<=0: VIOLATIONS.append({'name':name,'kind':'empty-census'})
 if cov<.95: VIOLATIONS.append({'name':name,'kind':'coverage','value':cov})
 if crit!=1: VIOLATIONS.append({'name':name,'kind':'critical-coverage','value':crit})
 if result['fakeVisible']: VIOLATIONS.append({'name':name,'kind':'fake-visible','value':result['fakeVisible']})
 if result['unknownCritical']: VIOLATIONS.append({'name':name,'kind':'unknown-critical','value':result['unknownCritical']})
 for item in result['smallTargets']: VIOLATIONS.append({'name':name,'kind':'small-target','value':item})
 for item in result['unnamed']: VIOLATIONS.append({'name':name,'kind':'unnamed','value':item})
 if result['maxDisclosureDepth']>2: VIOLATIONS.append({'name':name,'kind':'disclosure-depth','value':result['maxDisclosureDepth']})
 INVENTORY.append({'name':name,'coverage':cov,'criticalCoverage':crit,**result})

def open_profile(page):
 menu=page.locator('#stableProfileMenu'); expect(menu.locator(':scope > summary')).to_be_visible()
 if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch); ctx=browser.new_context(viewport={'width':1440,'height':950})
  ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  page=ctx.new_page(); page.set_default_timeout(30000)

  PHASE='home'; open_view(page,'home','#homeView'); snapshot(page,'chrome','.topbar'); snapshot(page,'home','#homeView')
  expect(page.locator('#ictcManifest')).to_have_count(0); expect(page.locator('#homePulse')).to_be_hidden(); expect(page.locator('#homePriorities')).to_be_visible(); no_overflow(page)

  PHASE='processes'; open_view(page,'processes','#processesView'); snapshot(page,'processes','#processesView')
  expect(page.locator('#procedureHub .procedure-card')).to_have_count(7); expect(page.locator('#processesView [data-surface-information-value]')).to_have_count(0); no_overflow(page)

  for code,root in [('RN-01','#monitoringView'),('EC-01','#incidentsView'),('AO-01','#grcView'),('MC-01','#grcView'),('AP-01','#grcView'),('RC-01','#grcView'),('AR-01','#grcView')]:
   PHASE=f'procedure-{code}'; open_process(page,code); expect(page.locator(root)).to_be_visible(); assert visible_orientation_count(page,root)==1,(code,visible_orientation_count(page,root)); snapshot(page,f'procedure:{code}',root)
   expect(page.locator(f'{root} [data-surface-information-value]')).to_have_count(0)
   detail=page.locator(f'{root} .procedure-decision-frame details.composition-process-context')
   if detail.count(): assert detail.get_attribute('open') is None
   no_overflow(page)

  PHASE='proof'; open_view(page,'proof','#proofView'); page.wait_for_function("expected=>document.querySelector('#proofView')?.dataset.proofReadingOrder===expected",arg=PROOF_READING_ORDER); snapshot(page,'proof','#proofView')
  expect(page.locator('#proofView [data-surface-information-value]')).to_have_count(0)
  investigation=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]'); trace=page.locator('#proofContent > details[data-proof-workspace="trace-reconstruction"]'); decision=page.locator('#proofContent > details[data-proof-domain="decisions"]'); standards=page.locator('#proofContent > details[data-proof-domain="evidence-basis"]')
  for disclosure in [investigation,trace,decision,standards]: expect(disclosure).to_be_visible()
  expect(decision).to_have_attribute('open','')
  for disclosure in [standards,trace,investigation]: expect(disclosure).not_to_have_attribute('open','')
  expect(investigation.locator(':scope > summary')).to_contain_text('Reticolo epistemico'); expect(trace.locator(':scope > summary')).to_contain_text('Ricostruisci un elemento di lavoro'); expect(decision.locator(':scope > summary')).to_contain_text('Decisioni e tracciabilità'); expect(standards.locator(':scope > summary')).to_contain_text('Evidenze e basi')
  order=page.locator('#proofContent > details').evaluate_all("nodes=>nodes.map(n=>n.dataset.proofWorkspace||n.dataset.proofDomain||n.dataset.compositionDetail||'unknown')"); expected_details=['decisions','evidence-basis','trace-reconstruction','epistemic-investigation','external','integrity','interpretation','export']; assert [x for x in order if x in expected_details]==expected_details,order
  reading=page.locator('#proofContent > details[data-composition-detail="proof-reading"]'); expect(reading).to_be_visible(); assert reading.get_attribute('open') is None

  PHASE='epistemic'; open_view(page,'epistemic','#epistemicView'); snapshot(page,'epistemic','#epistemicView')
  expect(page.locator('#epistemicTitle')).to_have_text('Relazioni tra decisioni, fonti ed evidenze')
  rules=page.locator('#epistemicView details[data-epistemic-workspace="rules"]'); expect(rules).to_be_visible(); assert rules.get_attribute('open') is None
  expect(rules.locator('.epistemic-claim-boundary')).to_have_count(1)

  PHASE='admin'; open_view(page,'home','#homeView'); open_profile(page); page.locator('#stableProfileMenu #openAdminCenter').dispatch_event('click'); expect(page.locator('#adminCenter')).to_be_visible(); snapshot(page,'dialog:admin','#adminCenter'); expect(page.locator('#adminMetrics')).to_be_hidden(); page.keyboard.press('Escape')
  PHASE='settings'; open_profile(page); page.locator('#stableProfileMenu #openSettings').dispatch_event('click'); expect(page.locator('#settingsDialog')).to_be_visible(); snapshot(page,'dialog:settings','#settingsDialog'); expect(page.locator('#settingsDialog details.advanced')).not_to_have_attribute('open',''); page.keyboard.press('Escape')

  PHASE='mobile'; mc=browser.new_context(viewport={'width':390,'height':844}); mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')"); m=mc.new_page(); m.set_default_timeout(30000); open_view(m,'processes','#processesView'); snapshot(m,'mobile:processes','#processesView'); open_process(m,'AO-01'); snapshot(m,'mobile:AO-01','#grcView'); no_overflow(m); mc.close()

  visible=sum(x['visible'] for x in INVENTORY); high=sum(x['high'] for x in INVENTORY); critical=sum(x['critical'] for x in INVENTORY); critical_high=sum(x['criticalHigh'] for x in INVENTORY)
  aggregate_cov=high/visible if visible else 0; aggregate_critical=critical_high/critical if critical else 1
  assert aggregate_cov>=.95,aggregate_cov; assert aggregate_critical==1,aggregate_critical; assert not VIOLATIONS,VIOLATIONS
  out={'ok':True,'profile':'surface-truth-2.5+native-semantic-lattice-3.2+semantic-workspace-closure-3.2.1+s4-a3','snapshots':len(INVENTORY),'visibleSemanticObjects':visible,'highConfidenceCoverage':aggregate_cov,'criticalCoverage':aggregate_critical,'procedures':['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01'],'homeManifest':False,'proofHierarchy':'facts>decisions>evidence-basis>trace>epistemic>external>integrity>method>export','technicalProgressive':True,'mobileOverflow':False,'inventory':INVENTORY,'claimBoundary':'Rendered census and cognitive-ergonomics proxies; not human usability evidence, legal opinion, certification or deployment security assessment.'}
  (ART/'browser-procedure-finetuning-1-4-surface-truth-2-5.json').write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf8'); print('browser-surface-truth-2-5+s4-a3: complete',flush=True); ctx.close(); browser.close()
except BaseException as exc:
 fail(exc); traceback.print_exc(); raise
