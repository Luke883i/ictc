import json, os, pathlib, traceback, urllib.parse
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
EXPECTED_SHA=(os.environ.get('ICTC_EXPECT_BUILD_SHA') or '').strip().lower()
PHASE='init'; NETWORK=[]; FAILURES=[]; PAGE_ERRORS=[]; API_PROBE={}
VIEWS={
 'home':'#homeView',
 'processes':'#processesView',
 'proof':'#proofView',
 'epistemic':'#epistemicView',
}
ADMIN_ENDPOINTS=['/api/admin/readiness','/api/admin/usage','/api/admin/users','/api/admin/identity']

def api_get(request_context,path,role='admin'):
 response=request_context.get(f'{BASE}{path}',headers={'x-ictc-role':role})
 body=None
 try: body=response.json()
 except Exception: body={'_raw':response.text()[:500]}
 return {'path':path,'status':response.status,'ok':response.ok,'requestId':response.headers.get('x-request-id'),'body':body}

def experience_cycle(page):
 return int(page.evaluate("()=>Number(document.documentElement.dataset.experienceCycle||0)"))

def open_view(page,name):
 global PHASE
 PHASE=f'view-{name}'
 page.goto(f'{BASE}/?view={name}',wait_until='domcontentloaded')
 page.wait_for_function("()=>Number(document.documentElement.dataset.experienceCycle||0)>0")
 selector=VIEWS[name]
 page.wait_for_function("sel=>{const n=document.querySelector(sel);return !!(n&&n.offsetParent!==null)}",arg=selector)
 snap=page.evaluate("sel=>{const root=document.querySelector(sel),html=document.documentElement;const child=n=>({tag:n.tagName.toLowerCase(),id:n.id||null,className:String(n.className||'').slice(0,160),role:n.dataset?.informationRole||null,owner:n.dataset?.localCompositionOwner||null});return{html:{experienceEdition:html.dataset.ictcExperienceEdition||null,nativeSemanticLattice:html.dataset.nativeSemanticLattice||null,experienceCycle:Number(html.dataset.experienceCycle||0)},root:{id:root.id,owner:root.dataset.localCompositionOwner||null,nativeSemanticLattice:root.dataset.nativeSemanticLattice||null,semanticWorkspaceClosure:root.dataset.semanticWorkspaceClosure||null},children:[...root.children].slice(0,50).map(child),geometry:{innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}}}",selector)
 page.screenshot(path=str(ART/f's4-a0-{name}.png'),full_page=True)
 return snap

def open_admin(page):
 global PHASE
 PHASE='view-admin'
 page.goto(f'{BASE}/?view=home',wait_until='domcontentloaded')
 page.wait_for_function("()=>Number(document.documentElement.dataset.experienceCycle||0)>0")
 menu=page.locator('#stableProfileMenu');expect(menu.locator(':scope > summary')).to_be_visible()
 if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()
 button=page.locator('#stableProfileMenu #openAdminCenter');expect(button).to_be_visible();button.click()
 expect(page.locator('#adminCenter')).to_be_visible()
 snap=page.evaluate("()=>{const root=document.querySelector('#adminCenter');return{open:root.open,owner:root.dataset.localCompositionOwner||null,nativeSemanticLattice:root.dataset.nativeSemanticLattice||null,visibleSections:[...root.querySelectorAll('[data-admin-view]')].filter(n=>!n.hidden).map(n=>n.dataset.adminView),nav:[...root.querySelectorAll('[data-admin-nav]')].map(n=>n.dataset.adminNav)}}")
 page.screenshot(path=str(ART/'s4-a0-admin.png'),full_page=True)
 page.keyboard.press('Escape')
 return snap

def fail(exc):
 payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'expectedBuildSha':EXPECTED_SHA or None,'apiProbe':API_PROBE,'networkFailures':FAILURES,'pageErrors':PAGE_ERRORS}
 (ART/'browser-s4-a0-observability-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
 print(f'::error title=browser-s4-a0-observability::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch)
  ctx=browser.new_context(viewport={'width':1440,'height':950})
  ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  request=ctx.request
  PHASE='health';health=api_get(request,'/api/health');API_PROBE['health']=health;assert health['status']==200,health
  PHASE='admin-endpoint-probe'
  admin={}
  for endpoint in ADMIN_ENDPOINTS:
   probe=api_get(request,endpoint);admin[endpoint]=probe;assert probe['status']==200,probe
  API_PROBE['admin']=admin
  PHASE='runtime-identity'
  ib=(admin['/api/admin/identity']['body'] or {}).get('buildIdentity') or {}
  API_PROBE['runtimeIdentity']=ib
  assert ib.get('authority')=='runtime-build-identity',ib
  assert ib.get('productVersion')==health['body'].get('version'),(ib,health)
  build=ib.get('build') or {}
  if EXPECTED_SHA:
   assert build.get('sha')==EXPECTED_SHA,(EXPECTED_SHA,build)
   assert build.get('exact') is True,build
   assert build.get('dirty') is False,build

  page=ctx.new_page();page.set_default_timeout(30000)
  def on_response(res):
   if res.url.startswith(BASE+'/api/'):
    NETWORK.append({'method':res.request.method,'path':urllib.parse.urlparse(res.url).path,'status':res.status,'requestId':res.headers.get('x-request-id')})
  def on_failed(req):
   FAILURES.append({'method':req.method,'url':req.url,'failure':req.failure})
  page.on('response',on_response);page.on('requestfailed',on_failed);page.on('pageerror',lambda exc:PAGE_ERRORS.append(str(exc)))
  snapshots={name:open_view(page,name) for name in VIEWS}
  snapshots['admin']=open_admin(page)
  PHASE='browser-errors';assert not FAILURES,FAILURES;assert not PAGE_ERRORS,PAGE_ERRORS
  writes=[x for x in NETWORK if x['method']!='GET'];PHASE='read-only-boundary';assert not writes,writes
  out={'ok':True,'slice':'S4-A0','profile':'rta-observability-bootstrap','expectedBuildSha':EXPECTED_SHA or None,'runtimeIdentity':ib,'health':{'version':health['body'].get('version'),'handlerRegistry':health['body'].get('handlerRegistry'),'requestId':health.get('requestId')},'adminEndpointProbe':{k:{'status':v['status'],'requestId':v.get('requestId')} for k,v in admin.items()},'surfaces':snapshots,'network':NETWORK,'networkFailures':FAILURES,'pageErrors':PAGE_ERRORS,'writeCount':len(writes),'artifacts':['s4-a0-home.png','s4-a0-processes.png','s4-a0-proof.png','s4-a0-epistemic.png','s4-a0-admin.png'],'claimBoundary':'Exact-head runtime/browser baseline evidence for S4-A0. Build identity is projected through the existing Admin identity contract; no extra runtime route is minted. This does not prove final-view correctness, human usability, accessibility certification, deployment immutability, supply-chain provenance or enterprise-ready status.'}
  (ART/'browser-s4-a0-observability.json').write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf8')
  print(json.dumps({'ok':True,'slice':'S4-A0','build':build,'adminEndpoints':4,'surfaces':list(snapshots),'networkEvents':len(NETWORK)}),flush=True)
  ctx.close();browser.close()
except BaseException as exc:
 fail(exc);traceback.print_exc();raise
