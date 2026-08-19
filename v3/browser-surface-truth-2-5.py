import json, os, pathlib, traceback, urllib.request
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'; INVENTORY=[]
SEMANTIC='h1,h2,h3,h4,h5,h6,p,small,label,button,a[href],input,select,textarea,summary,dt,dd,th,td,legend,li,span,b,strong,em,option,[role="status"],[role="alert"],.surface-chip,.counter,.empty'
CRITICAL={'title','status','metric','action','input','navigation','disclosure','evidence'}
def _slug(value): return ''.join(c if c.isalnum() or c in '._-' else '-' for c in str(value or 'unknown')).strip('-')[:64] or 'unknown'
def publish_failure(e):
 token=os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN');repo=os.environ.get('GITHUB_REPOSITORY');sha=os.environ.get('HEAD_SHA') or os.environ.get('GITHUB_SHA')
 if not token or not repo or not sha:return
 detail=_slug(f"{type(e).__name__}-{str(e).splitlines()[0] if str(e) else 'error'}")[:52]
 body=json.dumps({'state':'failure','context':f'ictc/browser-2-5-failure/{_slug(PHASE)}/{detail}','description':f'SurfaceTruth 2.5 {PHASE}: {type(e).__name__}'[:140]}).encode()
 req=urllib.request.Request(f'https://api.github.com/repos/{repo}/statuses/{sha}',data=body,method='POST',headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'})
 try:urllib.request.urlopen(req,timeout=8).read()
 except Exception:pass
def fail(e):
 publish_failure(e)
 payload={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc(),'snapshots':len(INVENTORY)};(ART/'browser-procedure-finetuning-1-4-surface-truth-2-5-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8');print(f'::error title=browser-surface-truth-2-5::{PHASE}: {type(e).__name__}: {e}',flush=True)
def visible_root(page,selector): expect(page.locator(selector)).to_be_visible(); page.wait_for_function("()=>document.documentElement.dataset.ictcSurfaceTruth==='2.5.0'")
def snapshot(page,name,selector):
 global PHASE
 PHASE=f'census-{name}'
 page.wait_for_timeout(40)
 result=page.locator(selector).evaluate("""(root,semantic)=>{const nodes=[...root.querySelectorAll(semantic)];const visible=e=>{if(e.tagName==='OPTION')return false;const s=getComputedStyle(e);return !e.closest('[hidden]')&&s.display!=='none'&&s.visibility!=='hidden'&&e.getClientRects().length>0};const key=e=>{if(e.id)return`#${e.id}`;const base=[e.tagName.toLowerCase(),...(String(e.className||'').split(/\\s+/).filter(Boolean).slice(0,2).map(x=>'.'+x)),e.getAttribute('name')?`[name=${e.getAttribute('name')}]`:'' ].join('');if(e.tagName==='SUMMARY'&&e.parentElement?.tagName==='DETAILS'){const pc=String(e.parentElement.className||'').split(/\\s+/).filter(Boolean).slice(0,2).map(x=>'.'+x).join('');return`${base}@details${pc}`;}return base;};const label=e=>{if(!['INPUT','SELECT','TEXTAREA'].includes(e.tagName))return'';if(e.getAttribute('aria-label'))return e.getAttribute('aria-label');if(e.id){const l=document.querySelector(`label[for="${CSS.escape(e.id)}"]`);if(l)return(l.innerText||'').trim()}const p=e.closest('label');return p?(p.innerText||'').trim():''};const items=nodes.map(e=>{const isVisible=visible(e),kind=e.dataset.surfaceKind||'',truth=e.dataset.surfaceTruth||'',confidence=Number(e.dataset.surfaceConfidence||0),text=['INPUT','TEXTAREA','SELECT'].includes(e.tagName)?(label(e)||e.getAttribute('name')||e.getAttribute('placeholder')||''):(e.innerText||e.textContent||'').trim().replace(/\\s+/g,' ').slice(0,160);return{key:key(e),tag:e.tagName.toLowerCase(),id:e.id||null,name:e.getAttribute('name'),text,visible:isVisible,kind,truth,authority:e.dataset.surfaceAuthority||'',cognitive:e.dataset.cognitiveLevel||'',effect:e.dataset.surfaceEffect||'',confidence,producer:e.dataset.surfaceProducer||''}});const vis=items.filter(x=>x.visible),critical=vis.filter(x=>['title','status','metric','action','input','navigation','disclosure','evidence'].includes(x.kind));const controls=[...root.querySelectorAll('button,summary,input,select,textarea')].filter(visible);const smallTargets=controls.map(e=>({key:key(e),h:e.getBoundingClientRect().height})).filter(x=>x.h<43.5);const unnamed=[...root.querySelectorAll('button,a[href],input,select,textarea,summary')].filter(visible).filter(e=>{if(e.tagName==='INPUT'||e.tagName==='SELECT'||e.tagName==='TEXTAREA')return !label(e)&&!e.getAttribute('aria-labelledby');return !((e.innerText||'').trim()||e.getAttribute('aria-label')||e.getAttribute('aria-labelledby'))}).map(key);const maxDepth=Math.max(0,...[...root.querySelectorAll('details')].filter(visible).map(e=>{let d=0,n=e;while((n=n.parentElement))if(n.tagName==='DETAILS')d++;return d+1}));return{items,total:items.length,visible:vis.length,high:vis.filter(x=>x.confidence>=.95).length,critical:critical.length,criticalHigh:critical.filter(x=>x.confidence>=.95).length,fakeVisible:vis.filter(x=>x.truth==='fake').length,unknownVisible:vis.filter(x=>x.truth==='unknown').length,unknownCritical:critical.filter(x=>x.truth==='unknown').length,smallTargets,unnamed,maxDisclosureDepth:maxDepth}}""",SEMANTIC)
 assert result['visible']>0,(name,'no visible semantic nodes')
 coverage=result['high']/result['visible']; critical_coverage=1 if result['critical']==0 else result['criticalHigh']/result['critical']
 assert coverage>=.95,(name,'coverage',coverage,result['unknownVisible'])
 assert critical_coverage==1,(name,'critical coverage',critical_coverage,result['unknownCritical'])
 assert result['fakeVisible']==0,(name,'fake visible',result['fakeVisible'])
 assert result['unknownCritical']==0,(name,'unknown critical',result['unknownCritical'])
 assert not result['smallTargets'],(name,'small targets',result['smallTargets'][:12])
 if result['unnamed']: raise AssertionError(f"unnamed:{result['unnamed'][0]}:{name}:{','.join(result['unnamed'][:4])}")
 assert result['maxDisclosureDepth']<2,(name,'disclosure depth',result['maxDisclosureDepth'])
 INVENTORY.append({'name':name,'selector':selector,'coverage':coverage,'criticalCoverage':critical_coverage,**result})
 return result
def open_view(page,view,selector): page.goto(f'{BASE}/?view={view}',wait_until='networkidle'); visible_root(page,selector)
def open_process(page,code):
 page.locator('.service-nav [data-service="processes"]').click();card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible();card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click();page.wait_for_timeout(120)
def assert_single_orientation(page,selector,label):
 count=page.locator(selector).evaluate("""root=>[...root.querySelectorAll('.procedure-frame,.hero,[data-surface-information-value]')].filter(e=>{const s=getComputedStyle(e);return !e.closest('[hidden]')&&s.display!=='none'&&s.visibility!=='hidden'&&e.getClientRects().length>0}).length""")
 assert count==1,(label,'orientation authorities',count)
def close_dialog(page,selector):
 d=page.locator(selector)
 if d.count() and d.get_attribute('open') is not None: page.evaluate("s=>document.querySelector(s)?.close()",selector)
def census_dialog_seeds(page):
 ids=page.locator('dialog').evaluate_all("ds=>ds.map((d,i)=>d.id||`__dialog_${i}`)")
 for i,did in enumerate(ids):
  global PHASE
  PHASE=f'dialog-seed-{did}'
  if did.startswith('__dialog_'): continue
  page.evaluate("id=>{const d=document.getElementById(id);if(!d)return;if(d.open)d.close();try{d.show()}catch{}}",did);page.wait_for_timeout(30)
  if page.locator(f'#{did}').get_attribute('open') is not None: snapshot(page,f'dialog:{did}',f'#{did}')
  close_dialog(page,f'#{did}')
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  page=ctx.new_page();page.set_default_timeout(30000)
  PHASE='home';open_view(page,'home','#homeView');snapshot(page,'chrome','.topbar');snapshot(page,'home','#homeView');expect(page.locator('#ictcManifest details')).not_to_have_attribute('open','')
  PHASE='processes';open_view(page,'processes','#processesView');snapshot(page,'processes','#processesView');expect(page.locator('#processesView [data-surface-information-value]')).to_have_count(0)
  PHASE='monitoring';open_process(page,'RN-01');visible_root(page,'#monitoringView');assert_single_orientation(page,'#monitoringView','RN');snapshot(page,'procedure:RN-01','#monitoringView');expect(page.locator('#monitoringView > .hero')).to_be_hidden();expect(page.locator('#monitoringView [data-surface-information-value]')).to_have_count(0)
  primary=page.locator('#monitoringView .procedure-frame .procedure-primary');expect(primary).to_be_visible();primary.click();expect(page.locator('#contributionDialog')).to_be_visible();snapshot(page,'dialog:contribution','#contributionDialog');close_dialog(page,'#contributionDialog')
  secondary=page.locator('#monitoringView .procedure-frame .procedure-secondary');
  if secondary.count(): secondary.click();expect(page.locator('#monitoringView [data-procedure-entry-utility] #missionForm')).to_be_visible();snapshot(page,'RN-utility','#monitoringView [data-procedure-entry-utility]')
  PHASE='incidents';open_process(page,'EC-01');visible_root(page,'#incidentsView');assert_single_orientation(page,'#incidentsView','EC');snapshot(page,'procedure:EC-01','#incidentsView');expect(page.locator('#incidentsView > .hero')).to_be_hidden();page.locator('#incidentsView .procedure-frame .procedure-primary').click();expect(page.locator('#incidentDialog')).to_be_visible();snapshot(page,'dialog:incident-intake','#incidentDialog');close_dialog(page,'#incidentDialog')
  cards=page.locator('#incidentList .incident-card')
  if cards.count(): cards.first.locator('.ux-primary,[data-open-incident]').first.click();expect(page.locator('#incidentWorkspace')).to_be_visible();snapshot(page,'dialog:incident-workspace','#incidentWorkspace');close_dialog(page,'#incidentWorkspace')
  for code,name in [('AO-01','objects'),('MC-01','coverage'),('AP-01','actions'),('RC-01','risks'),('AR-01','assurance')]:
   PHASE=f'procedure-{code}';open_process(page,code);visible_root(page,'#grcView');assert_single_orientation(page,'#grcView',code);snapshot(page,f'procedure:{code}','#grcView');expect(page.locator('#grcView [data-surface-information-value]')).to_have_count(0)
   if code=='MC-01':
    button=page.locator('#grcWorkspace [data-open-standard-browser]').first
    if button.count(): button.click();expect(page.locator('#standardBrowserDialog')).to_be_visible();snapshot(page,'dialog:standard-browser','#standardBrowserDialog');close_dialog(page,'#standardBrowserDialog')
  PHASE='proof';open_view(page,'proof','#proofView');snapshot(page,'proof','#proofView');brief=page.locator('#proofView [data-surface-information-value]');expect(brief).to_be_visible();expect(brief.locator('summary')).to_have_text('Perché, prova e limite')
  PHASE='epistemic';open_view(page,'epistemic','#epistemicView');snapshot(page,'epistemic','#epistemicView');brief=page.locator('#epistemicView [data-surface-information-value]');expect(brief).to_be_visible();expect(brief.locator('summary')).to_have_text('Perché, prova e limite')
  PHASE='admin';open_view(page,'home','#homeView');menu=page.locator('#stableProfileMenu');menu.locator('summary').click();page.locator('#stableProfileMenu #openAdminCenter').dispatch_event('click');expect(page.locator('#adminCenter')).to_be_visible();snapshot(page,'dialog:admin','#adminCenter');close_dialog(page,'#adminCenter')
  PHASE='settings';menu=page.locator('#stableProfileMenu');
  if menu.get_attribute('open') is None: menu.locator('summary').click()
  page.locator('#stableProfileMenu #openSettings').dispatch_event('click');expect(page.locator('#settingsDialog')).to_be_visible();snapshot(page,'dialog:settings','#settingsDialog');close_dialog(page,'#settingsDialog')
  PHASE='dialog-seed-census';census_dialog_seeds(page)
  PHASE='mobile';mobile=browser.new_context(viewport={'width':390,'height':844});mobile.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')");m=mobile.new_page();m.set_default_timeout(30000);open_view(m,'processes','#processesView');snapshot(m,'mobile:processes','#processesView');open_process(m,'AO-01');visible_root(m,'#grcView');snapshot(m,'mobile:AO-01','#grcView');metric=m.evaluate('()=>[innerWidth,document.documentElement.scrollWidth,document.body.scrollWidth]');assert metric[1]<=metric[0]+1 and metric[2]<=metric[0]+1,metric;mobile.close()
  visible=sum(x['visible'] for x in INVENTORY);high=sum(x['high'] for x in INVENTORY);critical=sum(x['critical'] for x in INVENTORY);critical_high=sum(x['criticalHigh'] for x in INVENTORY);unknown=sum(x['unknownVisible'] for x in INVENTORY);fake=sum(x['fakeVisible'] for x in INVENTORY)
  out={'ok':True,'profile':'surface-truth-cognitive-disclosure-2.5','snapshots':len(INVENTORY),'visibleSemanticObjects':visible,'highConfidenceVisible':high,'highConfidenceCoverage':high/visible if visible else 0,'criticalObjects':critical,'criticalHighConfidence':critical_high,'criticalCoverage':critical_high/critical if critical else 1,'unknownVisible':unknown,'fakeVisible':fake,'procedures':['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01'],'claimBoundary':'Rendered census and cognitive-ergonomics proxies; not neuroscience experiment, human usability evidence, legal opinion, certification or deployment security assessment.','inventory':INVENTORY}
  assert out['highConfidenceCoverage']>=.95,out['highConfidenceCoverage'];assert out['criticalCoverage']==1,out['criticalCoverage'];assert fake==0,fake
  (ART/'browser-procedure-finetuning-1-4-surface-truth-2-5.json').write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf8');print(json.dumps({k:v for k,v in out.items() if k!='inventory'}));ctx.close();browser.close()
except BaseException as e:fail(e);traceback.print_exc();raise
