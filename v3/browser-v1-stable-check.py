import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'
def fail(e):
 p={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}; (ART/'browser-v1-stable-error.json').write_text(json.dumps(p,indent=2),encoding='utf8'); print(f'::error title=browser-v1-stable::{PHASE}: {type(e).__name__}: {e}',flush=True)
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch); ctx=browser.new_context(viewport={'width':1440,'height':1000}); ctx.add_init_script("try{localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')}catch{}")
  page=ctx.new_page(); page.set_default_timeout(20000); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  PHASE='stable-shell'; page.goto(BASE+'/',wait_until='networkidle')
  expect(page.locator('html')).to_have_attribute('data-ictc-experience','stable-1')
  expect(page.locator('html')).to_have_attribute('data-ictc-edition','1.0-stable')
  expect(page.locator('.service-nav [data-service]')).to_have_count(3)
  expect(page.locator('.service-nav')).to_contain_text('Oggi'); expect(page.locator('.service-nav')).to_contain_text('Processi'); expect(page.locator('.service-nav')).to_contain_text('Prove')
  expect(page.locator('.home-journey-panel')).to_be_hidden(); expect(page.locator('.home-overview-grid')).to_be_hidden()
  assert page.locator('#complianceNexus').count()==0
  assert page.locator('#downloadCurrentView').count()==0
  PHASE='single-process-catalog'; page.locator('.service-nav [data-service="processes"]').click(); hub=page.locator('#procedureHub'); hub.wait_for(state='visible'); expect(hub.locator('.stable-process-card')).to_have_count(7)
  codes=['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01']
  for code in codes: assert hub.locator(f'[data-process-code="{code}"]').count()==1,code
  assert hub.locator('[data-process-code="EV-01"]').count()==0
  PHASE='process-entry'; hub.locator('[data-process-code="AP-01"] .primary').click(); expect(page.locator('#grcView')).to_be_visible(); expect(page.locator('#grcWorkspace')).to_be_visible()
  PHASE='proof'; page.locator('.service-nav [data-service="proof"]').click(); expect(page.locator('#proofView')).to_be_visible(); expect(page.locator('#proofContent')).to_be_visible()
  PHASE='auditor'; page.locator('#roleSelect').select_option('auditor'); page.locator('.service-nav [data-service="processes"]').click(); expect(page.locator('#procedureHub .stable-process-card')).to_have_count(7)
  assert not errors,errors
  report={'ok':True,'surfaces':['Oggi','Processi','Prove'],'processes':7,'processCatalogCopies':1,'homeFullCatalog':False,'maxDisclosure':5}; (ART/'browser-v1-stable.json').write_text(json.dumps(report,indent=2),encoding='utf8'); print('browser-v1-stable: complete',flush=True); browser.close()
except BaseException as e: fail(e); traceback.print_exc(); raise
