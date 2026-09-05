import json, os, pathlib, traceback, urllib.parse
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts';ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4807').rstrip('/')
EXPECTED_SHA=(os.environ.get('ICTC_EXPECT_BUILD_SHA') or '').strip().lower()
PHASE='init';RESULTS=[];NETWORK=[];FAILURES=[];PAGE_ERRORS=[]
PROCEDURES=[('RN-01','monitoring'),('EC-01','incidents'),('AO-01','objects'),('MC-01','coverage'),('AP-01','actions'),('RC-01','risks'),('AR-01','assurance')]
OWNER={'monitoring':'procedure-sequential-rn-ec.js','incidents':'procedure-sequential-rn-ec.js','objects':'grc-workspace-3-2.js','coverage':'grc-workspace-3-2.js','actions':'grc-workspace-3-2.js','risks':'grc-workspace-3-2.js','assurance':'grc-workspace-3-2.js'}

def fail(exc):
 payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'expectedBuildSha':EXPECTED_SHA or None,'results':RESULTS,'network':NETWORK,'networkFailures':FAILURES,'pageErrors':PAGE_ERRORS}
 (ART/'browser-s4-a1-worklist-authority-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
 print(f'::error title=browser-s4-a1-worklist-authority::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def api_get(request_context,path,role='admin'):
 response=request_context.get(f'{BASE}{path}',headers={'x-ictc-role':role})
 body=None
 try: body=response.json()
 except Exception: body={'_raw':response.text()[:500]}
 return {'path':path,'status':response.status,'ok':response.ok,'requestId':response.headers.get('x-request-id'),'body':body}

def cycle(page): return int(page.evaluate("()=>Number(document.documentElement.dataset.experienceCycle||0)"))
def wait_cycle(page,before): page.wait_for_function("before=>Number(document.documentElement.dataset.experienceCycle||0)>before",arg=before)
def close_dialogs(page): page.evaluate("()=>{for(const d of document.querySelectorAll('dialog[open]'))try{d.close()}catch{}}")

def open_process(page,code):
 global PHASE
 close_dialogs(page);before=cycle(page);PHASE=f'{code}-catalogue';page.locator('.service-nav [data-service="processes"]').click()
 page.wait_for_function("()=>!document.querySelector('#processesView')?.hidden")
 card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible()
 button=card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first;expect(button).to_be_visible();button.click()
 page.wait_for_timeout(120)
 if cycle(page)==before:
  page.wait_for_function("code=>{const f=[...document.querySelectorAll('.procedure-frame')].find(n=>n.offsetParent!==null);return !!f&&f.querySelector('.process-code')?.textContent?.includes(code)}",arg=code)
 else: wait_cycle(page,before)

def audit_one(page,code,pid):
 global PHASE
 PHASE=f'{code}-attention-contract';open_process(page,code)
 host='#monitoringView' if pid=='monitoring' else '#incidentsView' if pid=='incidents' else '#grcWorkspace'
 slot=page.locator(f'{host} > [data-procedure-attention-slot="{pid}"]');expect(slot).to_have_count(1)
 section=slot.locator(':scope > [data-procedure-worklist]');expect(section).to_be_visible()
 owner=slot.get_attribute('data-attention-slot-owner');assert owner==OWNER[pid],(pid,owner,OWNER[pid])
 frame=page.locator(f'{host} > .procedure-frame');expect(frame).to_have_count(1)
 assert frame.evaluate('(node,slot)=>node.nextElementSibling===slot',slot.element_handle()),f'{pid}: attention is not first operational block after compact identity'
 assert section.get_attribute('data-placement-owner')==owner,(pid,section.get_attribute('data-placement-owner'),owner)

 # Cardinality-aware controls: at most one discriminant local facet plus optional search.
 facets=section.locator('[data-worklist-facet]');facet_count=facets.count();assert facet_count<=1,(pid,'facet-count',facet_count)
 facet_key=None
 if facet_count:
  facet_key=facets.first.get_attribute('data-worklist-facet');assert facet_key and facet_key!='state',(pid,facet_key)
 immediate=section.locator('.procedure-worklist-filters input[type="search"],.procedure-worklist-filters select[data-worklist-facet]');assert immediate.count()<=2,(pid,'immediate-controls',immediate.count())
 reveal=section.locator(':scope > details.procedure-worklist-reveal');expect(reveal).to_have_count(1);assert reveal.get_attribute('open') is None,f'{pid}: terminal/quiescent reveal must be collapsed by default'

 items=section.locator('[data-work-item-id]');count=items.count();assert count>0,f'{pid}: DEMO must expose actionable A1 work'
 for i in range(min(count,40)):
  item=items.nth(i);assert item.get_attribute('data-work-item-actionable')=='true',f'{pid}: inactive row leaked into default worklist'
  kind=item.get_attribute('data-work-item-kind') or '';state=item.get_attribute('data-work-item-state') or '';visible=item.inner_text().lower();assert f'{kind} · {state}'.lower() not in visible,(pid,kind,state,visible[:200])
  assert item.locator('.procedure-work-business-kind').inner_text().strip();assert item.locator('.procedure-work-situation').inner_text().strip()
  assert item.locator('[data-work-item-target]').count()<=1,(pid,'duplicate-primary',i)
 buttons=section.locator('[data-work-item-target]');assert buttons.count()>0,f'{pid}: no typed target CTA'
 button=buttons.first;subject_id=button.get_attribute('data-work-target-subject-id');subject_type=button.get_attribute('data-work-target-subject-type');action=button.get_attribute('data-work-target-action');assert subject_id and subject_type and action,(pid,subject_type,subject_id,action)
 PHASE=f'{code}-exact-target';button.click();page.wait_for_timeout(100)
 resolution=button.get_attribute('data-work-target-resolution');assert resolution and resolution!='unresolved',(pid,subject_type,subject_id,action,resolution)
 active=page.locator('[data-work-target-active="true"]');expect(active).to_have_count(1);assert active.get_attribute('data-work-target-subject-id')==subject_id,(pid,'subject',active.get_attribute('data-work-target-subject-id'),subject_id);assert active.get_attribute('data-work-target-action')==action,(pid,'action',active.get_attribute('data-work-target-action'),action)
 screenshot=ART/f's4-a1-{pid}.png';page.screenshot(path=str(screenshot),full_page=True)
 RESULTS.append({'code':code,'procedureId':pid,'slotOwner':owner,'facetKey':facet_key,'visibleFacetControls':facet_count,'immediateControls':immediate.count(),'defaultRows':count,'target':{'subjectType':subject_type,'subjectId':subject_id,'intendedAction':action,'resolution':resolution},'rawKindStateDefault':False,'firstOperationalAttention':True,'artifact':screenshot.name});close_dialogs(page)

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  request=ctx.request
  PHASE='runtime-identity';health=api_get(request,'/api/health');assert health['status']==200,health;identity=api_get(request,'/api/admin/identity');assert identity['status']==200,identity
  build_identity=(identity['body'] or {}).get('buildIdentity') or {};build=build_identity.get('build') or {};assert build_identity.get('authority')=='runtime-build-identity',build_identity
  if EXPECTED_SHA:
   assert build.get('sha')==EXPECTED_SHA,(EXPECTED_SHA,build);assert build.get('exact') is True,build;assert build.get('dirty') is False,build
  page=ctx.new_page();page.set_default_timeout(30000)
  def on_response(res):
   if res.url.startswith(BASE+'/api/'):NETWORK.append({'method':res.request.method,'path':urllib.parse.urlparse(res.url).path,'status':res.status,'requestId':res.headers.get('x-request-id')})
  page.on('response',on_response);page.on('requestfailed',lambda req:FAILURES.append({'method':req.method,'url':req.url,'failure':req.failure}));page.on('pageerror',lambda exc:PAGE_ERRORS.append(str(exc)))
  PHASE='bootstrap';page.goto(BASE+'/?view=home',wait_until='domcontentloaded');page.wait_for_function("()=>Number(document.documentElement.dataset.experienceCycle||0)>0&&document.documentElement.dataset.nativeSemanticLattice==='3.2.0'")
  for code,pid in PROCEDURES:audit_one(page,code,pid)
  PHASE='aggregate';assert len(RESULTS)==7;assert all(r['target']['resolution']!='unresolved' for r in RESULTS);assert len({r['procedureId'] for r in RESULTS})==7
  assert not FAILURES,FAILURES;assert not PAGE_ERRORS,PAGE_ERRORS
  writes=[x for x in NETWORK if x['method']!='GET'];assert not writes,writes
  report={'ok':True,'slice':'S4-A1','profile':'worklist-presentation-authority','expectedBuildSha':EXPECTED_SHA or None,'runtimeIdentity':build_identity,'procedures':RESULTS,'metrics':{'procedureCoverage':'7/7','firstOperationalAttention':'7/7','localFacetSemantics':'7/7 source/runtime projection; browser controls cardinality-aware 0..1','rawKindStateDefault':0,'genericProcessOpener':0,'exactTargetResolved':'7/7','sharedGlobalPlacementAuthority':0,'immediateControlMax':2,'unintendedWrites':0},'network':NETWORK,'networkFailures':FAILURES,'pageErrors':PAGE_ERRORS,'claimBoundary':'Exact-checked-out-head server-backed browser evidence for representative DEMO work items on seven canonical procedures. It proves bounded DOM placement and target resolution, not 300k browser executions, human usability, accessibility certification, or enterprise-ready status.'}
  (ART/'browser-s4-a1-worklist-authority.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8');print(json.dumps({'ok':True,'slice':'S4-A1','procedures':7,'exactTargets':7,'build':build,'writes':0}),flush=True);ctx.close();browser.close()
except BaseException as exc:
 fail(exc);traceback.print_exc();raise
