import json, os, pathlib, traceback, urllib.parse
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
EXPECTED_SHA=(os.environ.get('ICTC_EXPECT_BUILD_SHA') or '').strip().lower()
PHASE='init'; PAGE_ERRORS=[]; NETWORK_FAILURES=[]; RESULTS=[]
SLICES={
 'readiness':'/api/admin/readiness',
 'usage':'/api/admin/usage',
 'users':'/api/admin/users',
 'identity':'/api/admin/identity',
}
INJECTED_STATUS={'readiness':404,'usage':503,'users':500,'identity':502}

def open_admin(page):
    page.goto(f'{BASE}/?view=home',wait_until='domcontentloaded')
    page.wait_for_function("()=>Number(document.documentElement.dataset.experienceCycle||0)>0")
    menu=page.locator('#stableProfileMenu'); expect(menu.locator(':scope > summary')).to_be_visible()
    if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()
    before=page.url
    button=menu.locator('#openAdminCenter'); expect(button).to_be_visible(); button.click()
    dialog=page.locator('#adminCenter'); expect(dialog).to_be_visible()
    expect(dialog).to_have_attribute('data-admin-failure-isolation','slice-local')
    expect(dialog).to_have_attribute('data-admin-routeability','modal-local')
    assert page.url==before,(before,page.url)
    return dialog,before

def settled(page):
    page.wait_for_function("keys=>keys.every(k=>['ready','error'].includes(document.querySelector('#adminCenter')?.getAttribute('data-admin-slice-'+k)||''))",arg=list(SLICES))

def run_single_failure(browser,key):
    global PHASE
    ctx=browser.new_context(viewport={'width':1440,'height':950})
    ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
    page=ctx.new_page(); page.set_default_timeout(30000)
    page.on('pageerror',lambda exc: PAGE_ERRORS.append(f'{key}: {exc}'))
    page.on('requestfailed',lambda req: NETWORK_FAILURES.append({'slice':key,'url':req.url,'failure':req.failure}))
    path=SLICES[key]; calls={'n':0}; status=INJECTED_STATUS[key]
    def route_handler(route):
        calls['n']+=1
        if calls['n']==1:
            route.fulfill(status=status,content_type='application/json',body=json.dumps({'error':f'A4 injected {key} failure','code':'a4-injected'}))
        else:
            route.continue_()
    page.route(f'**{path}',route_handler)
    PHASE=f'{key}-open-under-failure'
    dialog,before=open_admin(page); settled(page)
    expect(dialog).to_have_attribute(f'data-admin-slice-{key}','error')
    for other in SLICES:
        if other!=key: expect(dialog).to_have_attribute(f'data-admin-slice-{other}','ready')
    error=dialog.locator(f'[data-admin-slice-error="{key}"]'); expect(error).to_be_visible(); expect(error.get_by_role('button',name='Riprova')).to_be_visible()
    PHASE=f'{key}-retry'
    error.get_by_role('button',name='Riprova').click()
    expect(dialog).to_have_attribute(f'data-admin-slice-{key}','ready')
    expect(dialog.locator(f'[data-admin-slice-error="{key}"]')).to_have_count(0)
    assert calls['n']>=2,calls
    PHASE=f'{key}-modal-routeability'
    page.keyboard.press('Escape'); expect(dialog).not_to_be_visible(); assert page.url==before,(before,page.url)
    RESULTS.append({'slice':key,'injectedStatus':status,'otherSlicesReady':3,'retryRecovered':True,'requestCount':calls['n'],'routeability':'modal-local'})
    page.close();ctx.close()

def run_dual_failure(browser):
    global PHASE
    ctx=browser.new_context(viewport={'width':1280,'height':900})
    ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
    page=ctx.new_page(); page.set_default_timeout(30000)
    page.on('pageerror',lambda exc: PAGE_ERRORS.append(f'dual: {exc}'))
    for key in ['readiness','usage']:
        page.route(f'**{SLICES[key]}',lambda route,k=key: route.fulfill(status=503,content_type='application/json',body=json.dumps({'error':f'A4 dual {k}','code':'a4-dual'})))
    PHASE='dual-failure-isolation';dialog,_=open_admin(page);settled(page)
    expect(dialog).to_have_attribute('data-admin-slice-readiness','error');expect(dialog).to_have_attribute('data-admin-slice-usage','error')
    expect(dialog).to_have_attribute('data-admin-slice-users','ready');expect(dialog).to_have_attribute('data-admin-slice-identity','ready')
    expect(dialog.locator('[data-admin-slice-error]')).to_have_count(2)
    nav=dialog.locator('[data-admin-nav="identity"]');nav.click();expect(dialog.locator('[data-admin-view="identity"]')).to_be_visible();expect(dialog.locator('#identityRuntime .readiness-row').first).to_be_visible()
    RESULTS.append({'slice':'dual-readiness-usage','failed':2,'remainingReady':2,'identityStillUsable':True})
    page.close();ctx.close()

def fail(exc):
    payload={'ok':False,'slice':'S4-A4','phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'expectedBuildSha':EXPECTED_SHA or None,'results':RESULTS,'pageErrors':PAGE_ERRORS,'networkFailures':NETWORK_FAILURES}
    (ART/'browser-s4-a4-admin-truth-closure-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(f'::error title=browser-s4-a4-admin-truth-closure::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

try:
  with sync_playwright() as pw:
    launch={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
    browser=pw.chromium.launch(**launch)
    for key in SLICES: run_single_failure(browser,key)
    run_dual_failure(browser)
    PHASE='browser-errors';assert not PAGE_ERRORS,PAGE_ERRORS;assert not NETWORK_FAILURES,NETWORK_FAILURES
    report={'ok':True,'slice':'S4-A4','profile':'admin-truth-closure','expectedBuildSha':EXPECTED_SHA or None,'singleEndpointTotalDenial':0,'singleFailureCases':len(SLICES),'dualFailureCase':True,'results':RESULTS,'pageErrors':PAGE_ERRORS,'networkFailures':NETWORK_FAILURES,'claimBoundary':'Exact-head browser failure-injection evidence for Admin read isolation and modal-local routeability. It does not prove deployment availability, human usability or enterprise-ready status.'}
    (ART/'browser-s4-a4-admin-truth-closure.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8')
    print(json.dumps({'ok':True,'slice':'S4-A4','singleFailureCases':len(SLICES),'singleEndpointTotalDenial':0,'dualFailureCase':True}),flush=True)
    browser.close()
except BaseException as exc:
  fail(exc);traceback.print_exc();raise
