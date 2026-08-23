import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'
PROCESS_SURFACES={
 'RN-01':('#monitoringView','monitoring','procedure-frame.js'),
 'EC-01':('#incidentsView','incidents','procedure-frame.js'),
 'AO-01':('#grcWorkspace','objects','grc-workspace-3-2.js'),
 'MC-01':('#grcWorkspace','coverage','grc-workspace-3-2.js'),
 'AP-01':('#grcWorkspace','actions','grc-workspace-3-2.js'),
 'RC-01':('#grcWorkspace','risks','grc-workspace-3-2.js'),
 'AR-01':('#grcWorkspace','assurance','grc-workspace-3-2.js'),
}
VIEW_OWNERS={
 'home':('#homeView','stable-shell.js'),
 'processes':('#processesView','procedure-frame.js'),
 'proof':('#proofView','proof-workspace-3-2.js'),
 'epistemic':('#epistemicView','epistemic-workspace-3-2.js'),
}
VIEW_READY={
 'home':"()=>{const q=document.querySelector('#homePriorities');return !!(q&&q.offsetParent!==null&&q.dataset.homeWorkQueue==='3.2');}",
 'processes':"()=>{const h=document.querySelector('#procedureHub');return !!(h&&h.dataset.procedureHub==='native-semantic-lattice-3-2'&&h.querySelectorAll(':scope > .procedure-card[data-native-semantic-lattice=\"3.2.0\"]').length===7);}",
 'proof':"()=>{const c=document.querySelector('#proofContent'),d=c?.querySelector(':scope > details[data-proof-domain=\"decisions\"]');return !!(c&&c.offsetParent!==null&&d&&d.open);}",
 'epistemic':"()=>{const r=document.querySelector('#epistemicView'),s=r?.querySelector('#epistemicSearch'),d=r?.querySelector('details[data-epistemic-workspace=\"rules\"]');return !!(r&&s&&s.offsetParent!==null&&d);}",
}

def fail(exc):
 payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc()}
 (ART/'browser-information-value-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
 print(f'::error title=browser-information-value::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def experience_cycle(page):
 return int(page.evaluate("()=>Number(document.documentElement.dataset.experienceCycle||0)"))

def wait_experience_cycle(page,before=0):
 page.wait_for_function("before=>Number(document.documentElement.dataset.experienceCycle||0)>before",arg=before)
 return experience_cycle(page)

def wait_view_owner(page,view):
 selector,owner=VIEW_OWNERS[view]
 page.wait_for_function("x=>{const r=document.querySelector(x.selector);return !!(r&&r.offsetParent!==null&&document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.localCompositionOwner===x.owner);}",arg={'selector':selector,'owner':owner})
 page.wait_for_function(VIEW_READY[view])

def open_view(page,view):
 page.goto(f'{BASE}/?view={view}',wait_until='domcontentloaded')
 wait_experience_cycle(page,0);wait_view_owner(page,view)
 return experience_cycle(page)

def wait_process_projection(page,code,before):
 wait_experience_cycle(page,before)
 selector,surface,owner=PROCESS_SURFACES[code]
 page.wait_for_function("x=>{const r=document.querySelector(x.selector);return !!(r&&r.offsetParent!==null&&document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.compositionSurface===x.surface&&r.dataset.localCompositionOwner===x.owner);}",arg={'selector':selector,'surface':surface,'owner':owner})

def open_process(page,code):
 open_view(page,'processes')
 card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible();before=experience_cycle(page)
 card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click();wait_process_projection(page,code,before)
 frame=page.locator('.procedure-frame:visible').first;expect(frame).to_be_visible();expect(frame.locator('.procedure-frame-code')).to_have_text(code)

def open_profile(page):
 menu=page.locator('#stableProfileMenu');expect(menu.locator(':scope > summary')).to_be_visible()
 if menu.get_attribute('open') is None:menu.locator(':scope > summary').click()

def wait_admin_owner(page):
 page.wait_for_function("()=>{const r=document.querySelector('#adminCenter');return !!(r&&r.offsetParent!==null&&r.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.localCompositionOwner==='admin-workspace-3-2.js');}")

def wait_settings_owner(page):
 page.wait_for_function("()=>{const r=document.querySelector('#settingsDialog');return !!(r&&r.open&&r.dataset.nativeSemanticLattice==='3.2.0'&&r.querySelector('#settingsTitle'));}")

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1280,'height':900});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  page=ctx.new_page();page.set_default_timeout(30000);errors=[];writes=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda req:writes.append({'method':req.method,'url':req.url}) if req.url.startswith(BASE+'/api/') and req.method!='GET' else None)

  PHASE='home';open_view(page,'home');expect(page.locator('#homeTitle')).to_have_text('Attività di compliance');expect(page.locator('#homeSummary')).to_contain_text('governance');expect(page.locator('#homeSummary')).to_contain_text('GDPR');expect(page.locator('#homePulse')).to_be_hidden();priorities=page.locator('#homePriorities');expect(priorities).to_be_visible();assert priorities.locator('.home-business-priority').count()<=5
  PHASE='processes';open_view(page,'processes');cards=page.locator('#procedureHub .procedure-card');expect(cards).to_have_count(7);expect(cards.first).to_have_attribute('data-procedure-frame-variant','matrix');expect(page.locator('#procedureHub .procedure-signals')).to_have_count(0)

  for code in PROCESS_SURFACES:
   PHASE=f'process-{code}';open_process(page,code)

  PHASE='proof';open_view(page,'proof');expect(page.locator('#proofTitle')).to_have_text('Evidenze ICTC');expect(page.locator('#proofContent > details[data-proof-domain="decisions"]')).to_have_attribute('open','');expect(page.locator('#proofContent > details[data-proof-workspace="interpretation"]')).not_to_have_attribute('open','')
  PHASE='epistemic';open_view(page,'epistemic');expect(page.locator('#epistemicTitle')).to_have_text('Relazioni tra decisioni, fonti ed evidenze');expect(page.locator('#epistemicSearch')).to_be_visible();rules=page.locator('#epistemicView details[data-epistemic-workspace="rules"]');expect(rules).to_have_count(1);expect(rules).not_to_have_attribute('open','')

  PHASE='admin';open_view(page,'home');open_profile(page);page.locator('#stableProfileMenu #openAdminCenter').dispatch_event('click');wait_admin_owner(page);admin=page.locator('#adminCenter');expect(admin.locator('#procedureAdminPanel .procedure-admin-head h3')).to_have_text('Disponibilità operativa dei processi');expect(admin.locator('#procedurePolicyForm button[type="submit"]')).to_have_text('Salva disponibilità operativa');page.keyboard.press('Escape')
  PHASE='settings';open_profile(page);page.locator('#stableProfileMenu #openSettings').dispatch_event('click');wait_settings_owner(page);expect(page.locator('#settingsTitle')).to_have_text('Configurazione AI');page.keyboard.press('Escape')

  for width in [390,320]:
   PHASE=f'responsive-semantic-{width}';mc=browser.new_context(viewport={'width':width,'height':844});mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')");m=mc.new_page();m.set_default_timeout(30000);mobile_writes=[];m.on('request',lambda req:mobile_writes.append({'method':req.method,'url':req.url}) if req.url.startswith(BASE+'/api/') and req.method!='GET' else None);open_view(m,'home');open_view(m,'processes');expect(m.locator('#procedureHub .procedure-card')).to_have_count(7);assert not mobile_writes,mobile_writes;mc.close()

  PHASE='read-only-boundary';assert not writes,writes;PHASE='page-errors';assert not errors,errors
  out={'ok':True,'profile':'native-semantic-lattice-3.2-information-value','surfaceCoverage':['home','processes',*PROCESS_SURFACES.keys(),'proof','epistemic','admin','settings'],'semanticReadiness':'monotonic-final-c01-cycle+declared-owner+surface-invariant','geometryAuthority':'dedicated-ui-and-responsive-gates','transportQuiescenceDependency':False,'globalRuntimeLocalAdapters':0,'processCatalogue':'matrix-responsive','homeNumericDashboard':False,'proof':'decisions-first','epistemic':'search-first','technicalDefaultOpen':False,'semanticViewportSamples':[390,320],'writeCount':len(writes),'claimBoundary':'Rendered semantic hierarchy/compression evidence only; geometry belongs to dedicated UI/responsive gates and this is not human comprehension research, legal compliance, accessibility certification or deployment security.'}
  (ART/'browser-information-value.json').write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf8');print('browser-information-value-3.2: complete');ctx.close();browser.close()
except BaseException as exc:
 fail(exc);traceback.print_exc();raise
