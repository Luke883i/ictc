import json, os, pathlib, traceback, urllib.request
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'; INVENTORY=[]; VIOLATIONS=[]
SEMANTIC='h1,h2,h3,h4,p,small,label,button,a[href],input,select,textarea,summary,dt,dd,th,td,legend,li,span,b,strong,em,[role="status"],[role="alert"],.surface-chip,.counter,.empty'
def slug(value): return ''.join(c if c.isalnum() or c in '._-' else '-' for c in str(value or 'unknown')).strip('-')[:64] or 'unknown'
def post_status(context,description):
 token=os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN'); repo=os.environ.get('GITHUB_REPOSITORY'); sha=os.environ.get('HEAD_SHA') or os.environ.get('GITHUB_SHA')
 if not token or not repo or not sha:return
 body=json.dumps({'state':'failure','context':context[:100],'description':description[:140]}).encode(); req=urllib.request.Request(f'https://api.github.com/repos/{repo}/statuses/{sha}',data=body,method='POST',headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'})
 try: urllib.request.urlopen(req,timeout=8).read()
 except Exception: pass
def violation(name,kind,detail):
 item={'name':name,'kind':kind,'detail':str(detail)}
 if item not in VIOLATIONS:VIOLATIONS.append(item)
def fail(exc):
 detail=slug(f"{type(exc).__name__}-{str(exc).splitlines()[0] if str(exc) else 'error'}")[:52];post_status(f'ictc/browser-2-5-failure/{slug(PHASE)}/{detail}',f'SurfaceTruth 2.5 {PHASE}: {type(exc).__name__}')
 payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'snapshots':len(INVENTORY),'violations':VIOLATIONS};(ART/'browser-procedure-finetuning-1-4-surface-truth-2-5-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8');print(f'::error title=browser-surface-truth-2-5::{PHASE}: {type(exc).__name__}: {exc}',flush=True)
SNAPSHOT_JS=r'''(root,semantic)=>{const norm=v=>String(v||'').replace(/\s+/g,' ').trim();const visible=e=>{const s=getComputedStyle(e);return !e.closest('[hidden]')&&s.display!=='none'&&s.visibility!=='hidden'&&e.getClientRects().length>0};const label=e=>{const a=norm(e.getAttribute('aria-label'));if(a)return a;const ids=norm(e.getAttribute('aria-labelledby'));if(ids){const x=ids.split(/\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' ');if(norm(x))return norm(x)}if(['INPUT','SELECT','TEXTAREA'].includes(e.tagName)){const ls=e.labels?[...e.labels]:[];if(ls.length&&norm(ls.map(x=>x.textContent).join(' ')))return norm(ls.map(x=>x.textContent).join(' '));if(e.closest('label')&&norm(e.closest('label').textContent))return norm(e.closest('label').textContent)}return norm(e.textContent)||norm(e.getAttribute('title'))};const nodes=[...root.querySelectorAll(semantic)].filter(visible);const semanticRows=nodes.map(e=>({tag:e.tagName.toLowerCase(),id:e.id||'',text:norm(e.textContent).slice(0,140),kind:e.dataset.surfaceKind||'',truth:e.dataset.surfaceTruth||'',confidence:Number(e.dataset.surfaceConfidence||0)}));const critical=semanticRows.filter(x=>['title','status','metric','action','input','navigation','disclosure','evidence'].includes(x.kind));const controls=[...root.querySelectorAll('button,summary,input,select,textarea')].filter(visible);const small=controls.map(e=>{let t=e;if(e.matches('input[type="checkbox"],input[type="radio"],input[type="file"]'))t=[...(e.labels||[])].find(visible)||e;const r=t.getBoundingClientRect();return{tag:e.tagName.toLowerCase(),id:e.id||'',h:r.height,w:r.width}}).filter(x=>x.h<43.5);const unnamed=[...root.querySelectorAll('button,a[href],input,select,textarea,summary')].filter(visible).filter(e=>!label(e)).map(e=>`${e.tagName.toLowerCase()}#${e.id||''}`);const details=[...root.querySelectorAll('details')].filter(visible);const depth=Math.max(0,...details.map(e=>{let d=1,n=e;while((n=n.parentElement))if(n.tagName==='DETAILS')d++;return d}));return{visible:semanticRows.length,high:semanticRows.filter(x=>x.confidence>=.95).length,critical:critical.length,criticalHigh:critical.filter(x=>x.confidence>=.95).length,fakeVisible:semanticRows.filter(x=>x.truth==='fake').length,unknownVisible:semanticRows.filter(x=>x.truth==='unknown').length,unknownCritical:critical.filter(x=>x.truth==='unknown').length,smallTargets:small,unnamed,maxDisclosureDepth:depth}}'''
def snapshot(page,name,selector):
 global PHASE;PHASE=f'census-{name}';page.wait_for_timeout(40);result=page.locator(selector).evaluate(SNAPSHOT_JS,SEMANTIC);coverage=result['high']/result['visible'] if result['visible'] else 0;critical=1 if not result['critical'] else result['criticalHigh']/result['critical']
 if result['visible']<=0:violation(name,'no-visible-semantic-nodes',selector)
 if coverage<.95:violation(name,'coverage',f'{coverage:.4f};unknown={result["unknownVisible"]}')
 if critical!=1:violation(name,'critical-coverage',f'{critical:.4f};unknown={result["unknownCritical"]}')
 if result['fakeVisible']:violation(name,'fake-visible',result['fakeVisible'])
 if result['unknownCritical']:violation(name,'unknown-critical',result['unknownCritical'])
 for item in result['smallTargets']:violation(name,'small-target',f'{item["tag"]}#{item["id"]}:{item["h"]:.1f}px')
 for item in result['unnamed']:violation(name,'unnamed',item)
 if result['maxDisclosureDepth']>2:violation(name,'disclosure-depth',result['maxDisclosureDepth'])
 INVENTORY.append({'name':name,'selector':selector,'coverage':coverage,'criticalCoverage':critical,**result});return result
def open_view(page,view,selector):page.goto(f'{BASE}/?view={view}',wait_until='networkidle');expect(page.locator(selector)).to_be_visible();page.wait_for_function("()=>document.documentElement.dataset.ictcSurfaceTruth==='2.5.0'")
def open_process(page,code):
 page.locator('.service-nav [data-service="processes"]').click();card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible();card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click();page.wait_for_timeout(140)
def no_overflow(page):
 m=page.evaluate('()=>[innerWidth,document.documentElement.scrollWidth,document.body.scrollWidth]');assert m[1]<=m[0]+1 and m[2]<=m[0]+1,m
def close_dialog(page,selector):
 d=page.locator(selector)
 if d.count() and d.get_attribute('open') is not None:page.evaluate('s=>document.querySelector(s)?.close()',selector)
def single_orientation(page,selector):
 count=page.locator(selector).evaluate("root=>[...root.querySelectorAll(':scope > .procedure-frame,:scope > .hero')].filter(e=>{const s=getComputedStyle(e);return !e.closest('[hidden]')&&s.display!=='none'&&s.visibility!=='hidden'&&e.getClientRects().length>0}).length");assert count==1,count
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')");page=ctx.new_page();page.set_default_timeout(30000)
  PHASE='home';open_view(page,'home','#homeView');snapshot(page,'chrome','.topbar');snapshot(page,'home','#homeView');expect(page.locator('#ictcManifest')).to_have_count(0);expect(page.locator('#homePulse')).to_be_hidden();expect(page.locator('#homePriorities')).to_be_visible();assert page.locator('#homePriorities').get_attribute('data-home-work-queue')=='3.1'
  PHASE='processes';open_view(page,'processes','#processesView');snapshot(page,'processes','#processesView');expect(page.locator('#processesView [data-surface-information-value]')).to_have_count(0);expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)
  for code,selector in [('RN-01','#monitoringView'),('EC-01','#incidentsView'),('AO-01','#grcView'),('MC-01','#grcView'),('AP-01','#grcView'),('RC-01','#grcView'),('AR-01','#grcView')]:
   PHASE=f'procedure-{code}';open_process(page,code);expect(page.locator(selector)).to_be_visible();single_orientation(page,selector);snapshot(page,f'procedure:{code}',selector);expect(page.locator(f'{selector} [data-surface-information-value]')).to_have_count(0);ctxbox=page.locator(f'{selector} .procedure-decision-frame details.composition-process-context')
   if ctxbox.count():assert ctxbox.get_attribute('open') is None
  PHASE='proof';open_view(page,'proof','#proofView');snapshot(page,'proof','#proofView');expect(page.locator('#proofView [data-surface-information-value]')).to_have_count(0);decision=page.locator('#proofContent > details.proof-section[open]').first;expect(decision).to_be_visible();expect(decision.locator(':scope > summary')).to_contain_text('Decisioni e tracciabilità');reading=page.locator('#proofContent > details[data-composition-detail="proof-reading"]');expect(reading).to_be_visible();assert reading.get_attribute('open') is None
  PHASE='epistemic';open_view(page,'epistemic','#epistemicView');snapshot(page,'epistemic','#epistemicView');expect(page.locator('#epistemicView [data-surface-information-value]')).to_have_count(0);expect(page.locator('#epistemicTitle')).to_have_text('Relazioni tra decisioni, fonti ed evidenze');boundary=page.locator('#epistemicView details[data-composition-detail="epistemic-boundary"]');expect(boundary).to_be_visible();assert boundary.get_attribute('open') is None
  PHASE='admin';open_view(page,'home','#homeView');menu=page.locator('#stableProfileMenu');menu.locator('summary').click();page.locator('#stableProfileMenu #openAdminCenter').dispatch_event('click');expect(page.locator('#adminCenter')).to_be_visible();snapshot(page,'dialog:admin','#adminCenter');expect(page.locator('#adminMetrics')).to_be_hidden();close_dialog(page,'#adminCenter')
  PHASE='settings';menu=page.locator('#stableProfileMenu');
  if menu.get_attribute('open') is None:menu.locator('summary').click()
  page.locator('#stableProfileMenu #openSettings').dispatch_event('click');expect(page.locator('#settingsDialog')).to_be_visible();snapshot(page,'dialog:settings','#settingsDialog');close_dialog(page,'#settingsDialog')
  PHASE='mobile';mobile=browser.new_context(viewport={'width':390,'height':844});mobile.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')");m=mobile.new_page();m.set_default_timeout(30000);open_view(m,'processes','#processesView');snapshot(m,'mobile:processes','#processesView');open_process(m,'AO-01');expect(m.locator('#grcView')).to_be_visible();snapshot(m,'mobile:AO-01','#grcView');no_overflow(m);mobile.close()
  visible=sum(x['visible'] for x in INVENTORY);high=sum(x['high'] for x in INVENTORY);critical=sum(x['critical'] for x in INVENTORY);critical_high=sum(x['criticalHigh'] for x in INVENTORY);unknown=sum(x['unknownVisible'] for x in INVENTORY);fake=sum(x['fakeVisible'] for x in INVENTORY)
  out={'ok':not VIOLATIONS,'profile':'surface-truth-cognitive-disclosure-2.5+semantic-composition-3.1','snapshots':len(INVENTORY),'visibleSemanticObjects':visible,'highConfidenceVisible':high,'highConfidenceCoverage':high/visible if visible else 0,'criticalObjects':critical,'criticalHighConfidence':critical_high,'criticalCoverage':critical_high/critical if critical else 1,'unknownVisible':unknown,'fakeVisible':fake,'violationCount':len(VIOLATIONS),'violations':VIOLATIONS,'procedures':['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01'],'claimBoundary':'Rendered census and cognitive-ergonomics proxies; not neuroscience experiment, human usability evidence, legal opinion, certification or deployment security assessment.','inventory':INVENTORY}
  if out['highConfidenceCoverage']<.95:violation('aggregate','coverage',out['highConfidenceCoverage'])
  if out['criticalCoverage']!=1:violation('aggregate','critical-coverage',out['criticalCoverage'])
  if fake:violation('aggregate','fake-visible',fake)
  out['ok']=not VIOLATIONS;out['violationCount']=len(VIOLATIONS);out['violations']=VIOLATIONS;(ART/'browser-procedure-finetuning-1-4-surface-truth-2-5.json').write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf8');print(json.dumps({k:v for k,v in out.items() if k not in {'inventory','violations'}}),flush=True)
  if VIOLATIONS:
   for v in VIOLATIONS[:12]:post_status(f'ictc/browser-2-5-failure/census-{slug(v["name"])}/{slug(v["kind"])}',f'SurfaceTruth 2.5 {v["name"]}: {v["kind"]}')
   PHASE='census-aggregate';raise AssertionError(f'{len(VIOLATIONS)} census violations')
  ctx.close();browser.close()
except BaseException as exc:fail(exc);traceback.print_exc();raise