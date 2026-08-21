import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'
GUIDANCE=json.loads((ROOT/'v3'/'procedure-executive-harmonization-contract-1-5.json').read_text(encoding='utf8'))
def fail(exc):
 payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc()};(ART/'browser-information-value-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8');print(f'::error title=browser-information-value::{PHASE}: {type(exc).__name__}: {exc}',flush=True)
def no_overflow(page):
 m=page.evaluate('()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})');assert max(m['html'],m['body'])<=m['inner']+1,m
def open_view(page,view):page.goto(f'{BASE}/?view={view}',wait_until='networkidle')
def open_process(page,code):
 open_view(page,'processes');card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible();card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click();page.wait_for_timeout(120)
def assert_compact_brief(page,key,needle):
 brief=page.locator(f'[data-surface-information-value="{key}"]');expect(brief).to_be_visible();expect(brief).to_contain_text(needle);details=brief.locator('details.surface-information-detail');expect(details).to_have_count(1);expect(details.locator('summary')).to_have_text('Perché, prova e limite');expect(details).not_to_have_attribute('open','');no_overflow(page)
def open_profile(page):
 menu=page.locator('#stableProfileMenu');expect(menu.locator(':scope > summary')).to_be_visible();
 if menu.get_attribute('open') is None:menu.locator(':scope > summary').click()
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1280,'height':900});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  page=ctx.new_page();page.set_default_timeout(30000);errors=[];writes=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda req:writes.append({'method':req.method,'url':req.url}) if req.url.startswith(BASE+'/api/') and req.method!='GET' else None)
  PHASE='home';open_view(page,'home');manifest=page.locator('#ictcManifest');expect(manifest).to_be_visible();expect(manifest).to_contain_text('Conformità come lavoro umano verificabile.');details=manifest.locator('details.ictc-manifest-detail');expect(details.locator('summary')).to_have_text('Metodo, dati e limiti');expect(details).not_to_have_attribute('open','');expect(manifest).to_contain_text('decisioni restano umane');no_overflow(page)
  PHASE='processes';open_view(page,'processes');expect(page.locator('#processesView [data-surface-information-value]')).to_have_count(0);expect(page.locator('#procedureHub .procedure-card')).to_have_count(7);expect(page.locator('#processesView .processes-head')).to_be_visible();no_overflow(page)
  PHASE='rn';open_process(page,'RN-01');expect(page.locator('#monitoringView [data-surface-information-value]')).to_have_count(0);expect(page.locator('#monitoringView > .procedure-frame')).to_be_visible();expect(page.locator('#monitoringView > .hero')).to_be_hidden();expect(page.locator('#monitoringView [data-procedure-entry-utility="monitoring"]')).to_have_count(1);no_overflow(page)
  PHASE='ec';open_process(page,'EC-01');expect(page.locator('#incidentsView [data-surface-information-value]')).to_have_count(0);expect(page.locator('#incidentsView > .procedure-frame')).to_be_visible();expect(page.locator('#incidentsView > .hero')).to_be_hidden();no_overflow(page)
  boundaries={code:GUIDANCE['processes'][code]['boundary'] for code in ['AO-01','MC-01','AP-01','RC-01','AR-01']}
  for code,needle in boundaries.items():
   PHASE=f'grc-{code}';open_process(page,code);expect(page.locator('#grcView [data-surface-information-value]')).to_have_count(0);frame=page.locator('#grcWorkspace > .procedure-frame');expect(frame).to_be_visible();boundary=page.locator('#grcWorkspace .executive-boundary');expect(boundary).to_be_visible();expect(boundary).to_contain_text(needle);no_overflow(page)
  PHASE='proof';open_view(page,'proof');assert_compact_brief(page,'proof','non sono certificazione')
  PHASE='epistemic';open_view(page,'epistemic');assert_compact_brief(page,'epistemic','non crea applicabilità')
  PHASE='admin';open_view(page,'home');open_profile(page);page.locator('#stableProfileMenu #openAdminCenter').dispatch_event('click');admin=page.locator('#adminCenter');expect(admin).to_be_visible();note=admin.locator('[data-dialog-information-value="admin"]');expect(note).to_contain_text('Telemetria AI');expect(note.locator('summary')).to_have_text('Perché, prova e limite');page.keyboard.press('Escape')
  PHASE='settings';open_profile(page);page.locator('#stableProfileMenu #openSettings').dispatch_event('click');settings=page.locator('#settingsDialog');expect(settings).to_be_visible();note=settings.locator('[data-dialog-information-value="aiSettings"]');expect(note).to_contain_text('non rende i suoi output veri');expect(note.locator('summary')).to_have_text('Perché, prova e limite');page.keyboard.press('Escape')
  PHASE='mobile';
  for width in [390,320]:
   mc=browser.new_context(viewport={'width':width,'height':844});mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')");m=mc.new_page();m.set_default_timeout(30000);open_view(m,'home');no_overflow(m);open_view(m,'processes');no_overflow(m);open_process(m,'AO-01');no_overflow(m);mc.close()
  assert not writes,writes;assert not errors,errors
  out={'ok':True,'profile':'surface-information-value-2.5','procedureBriefsVisible':False,'transversalBriefs':['proof','epistemic'],'homeProgressiveManifest':True,'legacyNativeHeroesVisible':False,'grcDecisionBoundaryVisible':True,'roles':['admin'],'mobileWidths':[390,320],'mobileOverflow':False,'writeCount':len(writes),'claimBoundary':'Rendered information architecture and geometry evidence only; not human comprehension research, legal compliance, certification or deployment security.'};(ART/'browser-information-value.json').write_text(json.dumps(out,indent=2),encoding='utf8');print('browser-information-value-2.5: complete');ctx.close();browser.close()
except BaseException as exc:fail(exc);traceback.print_exc();raise
