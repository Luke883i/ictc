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

def no_overflow(page):
 m=page.evaluate('()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
 assert max(m['html'],m['body'])<=m['inner']+1,m

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
 wait_experience_cycle(page,0)
 wait_view_owner(page,view)
 return experience_cycle(page)

def wait_process_projection(page,code,before):
 wait_experience_cycle(page,before)
 selector,surface,owner=PROCESS_SURFACES[code]
 page.wait_for_function("x=>{const r=document.querySelector(x.selector);return !!(r&&r.offsetParent!==null&&document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.compositionSurface===x.surface&&r.dataset.localCompositionOwner===x.owner);}",arg={'selector':selector,'surface':surface,'owner':owner})

def open_process(page,code):
 open_view(page,'processes')
 card=page.locator(f'#procedureHub [data-process-code="{code}"]')
 expect(card).to_be_visible()
 before=experience_cycle(page)
 card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click()
 wait_process_projection(page,code,before)

def assert_above_fold(page,selector,ratio=.72):
 global PHASE
 node=page.locator(selector).first;expect(node).to_be_visible();box=node.bounding_box();viewport=page.viewport_size or {'height':900}
 budget=max(430,min(int(viewport['height'])-1,round(int(viewport['height'])*ratio)))
 if box and box['y']>=budget:PHASE=f"{PHASE}-y{round(box['y'])}-b{budget}"
 assert box and box['y']<budget,{'selector':selector,'box':box,'budget':budget,'viewport':viewport}

def open_profile(page):
 menu=page.locator('#stableProfileMenu');expect(menu.locator(':scope > summary')).to_be_visible()
 if menu.get_attribute('open') is None:menu.locator(':scope > summary').click()

def wait_admin_owner(page):
 page.wait_for_function("()=>{const r=document.querySelector('#adminCenter');return !!(r&&r.offsetParent!==null&&r.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.localCompositionOwner==='admin-workspace-3-2.js');}")
 page.wait_for_function("()=>{const p=document.querySelector('#procedureAdminPanel');return !!(p&&p.offsetParent!==null&&p.querySelector('button[type=\"submit\"]'));}")

def wait_settings_owner(page):
 page.wait_for_function("()=>{const r=document.querySelector('#settingsDialog');return !!(r&&r.open&&r.dataset.nativeSemanticLattice==='3.2.0'&&r.querySelector('#settingsTitle'));}")

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch)
  ctx=browser.new_context(viewport={'width':1280,'height':900})
  ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  page=ctx.new_page();page.set_default_timeout(30000);errors=[];writes=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda req:writes.append({'method':req.method,'url':req.url}) if req.url.startswith(BASE+'/api/') and req.method!='GET' else None)

  PHASE='home-owner';open_view(page,'home')
  PHASE='home-copy';expect(page.locator('#homeTitle')).to_have_text('Attività di compliance');expect(page.locator('#homeSummary')).to_contain_text('governance');expect(page.locator('#homeSummary')).to_contain_text('GDPR')
  PHASE='home-hierarchy';expect(page.locator('#homePulse')).to_be_hidden();priorities=page.locator('#homePriorities');expect(priorities).to_be_visible();expect(priorities).to_have_attribute('data-home-work-queue','3.2');assert priorities.locator('.home-business-priority').count()<=5;assert_above_fold(page,'#homePriorities')
  PHASE='home-overflow';no_overflow(page)

  PHASE='processes-owner';open_view(page,'processes')
  PHASE='processes-catalogue';cards=page.locator('#procedureHub .procedure-card');expect(cards).to_have_count(7);expect(cards.first).to_have_attribute('data-procedure-frame-variant','matrix');cols=page.evaluate("()=>getComputedStyle(document.querySelector('#procedureHub')).gridTemplateColumns.split(' ').filter(Boolean).length");assert 2<=cols<=4,cols;expect(page.locator('#procedureHub .procedure-signals')).to_have_count(0)
  PHASE='processes-overflow';no_overflow(page)

  PHASE='rn-owner';open_process(page,'RN-01')
  PHASE='rn-hierarchy';expect(page.locator('#monitoringView > .procedure-frame')).to_be_visible();expect(page.locator('#monitoringView > .hero')).to_be_hidden();assert_above_fold(page,'#monitoringView > .section-block')
  PHASE='rn-overflow';no_overflow(page)

  PHASE='ec-owner';open_process(page,'EC-01')
  PHASE='ec-hierarchy';expect(page.locator('#incidentsView > .procedure-frame')).to_be_visible();expect(page.locator('#incidentsView > .hero')).to_be_hidden();assert_above_fold(page,'#incidentsView > .section-block')
  PHASE='ec-overflow';no_overflow(page)

  for code in ['AO-01','MC-01','AP-01','RC-01','AR-01']:
   PHASE=f'grc-{code}-owner';open_process(page,code)
   PHASE=f'grc-{code}-frame';frame=page.locator('#grcWorkspace > .procedure-frame');expect(frame).to_be_visible();expect(frame).to_have_attribute('data-procedure-header-contract','3.2')
   PHASE=f'grc-{code}-work';work=page.locator('#grcWorkspace .grc-list');expect(work).to_be_visible()
   PHASE=f'grc-{code}-status-count';status=page.locator('#grcWorkspace details[data-composition-detail="process-status"]');expect(status).to_have_count(1)
   PHASE=f'grc-{code}-status-closed';expect(status).not_to_have_attribute('open','')
   PHASE=f'grc-{code}-decision-count';decision=page.locator('#grcWorkspace .procedure-decision-frame .composition-process-context');expect(decision).to_have_count(1)
   PHASE=f'grc-{code}-decision-closed';expect(decision).not_to_have_attribute('open','')
   PHASE=f'grc-{code}-order';order=page.evaluate("()=>{const b=document.querySelector('#grcWorkspace .grc-body'),l=b?.querySelector('.grc-list'),k=b?.querySelector('details[data-composition-detail=\"process-status\"]');return !!(b&&l&&k&&l.parentElement===b&&k.parentElement===b&&[...b.children].indexOf(l)<[...b.children].indexOf(k));}");assert order,code
   PHASE=f'grc-{code}-overflow';no_overflow(page)

  PHASE='proof-owner';open_view(page,'proof')
  PHASE='proof-title';expect(page.locator('#proofTitle')).to_have_text('Evidenze ICTC');expect(page.locator('#proofContent')).to_be_visible()
  PHASE='proof-decisions-first';decision=page.locator('#proofContent > details[data-proof-domain="decisions"]');expect(decision).to_have_attribute('open','')
  PHASE='proof-progressive';expect(page.locator('#proofContent > details[data-proof-workspace="interpretation"]')).not_to_have_attribute('open','');expect(page.locator('#proofContent > details[data-proof-domain="external"]')).to_have_count(1)
  PHASE='proof-overflow';no_overflow(page)

  PHASE='epistemic-owner';open_view(page,'epistemic')
  PHASE='epistemic-title';expect(page.locator('#epistemicTitle')).to_have_text('Relazioni tra decisioni, fonti ed evidenze')
  PHASE='epistemic-rules';rules=page.locator('#epistemicView details[data-epistemic-workspace="rules"]');expect(rules).to_have_count(1);expect(rules).not_to_have_attribute('open','')
  PHASE='epistemic-actions';expect(page.locator('[data-epistemic-mode="explore"]')).to_have_text('Quadro');expect(page.locator('[data-epistemic-mode="flat"]')).to_have_text('Vista tecnica');expect(page.locator('#epistemicSearch')).to_be_visible()
  PHASE='epistemic-overflow';no_overflow(page)

  PHASE='admin-home-owner';open_view(page,'home');open_profile(page);page.locator('#stableProfileMenu #openAdminCenter').dispatch_event('click')
  PHASE='admin-owner';wait_admin_owner(page);admin=page.locator('#adminCenter')
  PHASE='admin-hierarchy';expect(admin.locator('#adminMetrics')).to_be_hidden();expect(admin.locator('#procedureAdminPanel .procedure-admin-head h3')).to_have_text('Disponibilità operativa dei processi');expect(admin.locator('#procedurePolicyForm button[type="submit"]')).to_have_text('Salva disponibilità operativa');tech=admin.locator('details[data-composition-detail="technical-controls"]');expect(tech).to_have_count(1);expect(tech).not_to_have_attribute('open','');page.keyboard.press('Escape')

  PHASE='settings-open';open_profile(page);page.locator('#stableProfileMenu #openSettings').dispatch_event('click')
  PHASE='settings-owner';wait_settings_owner(page);settings=page.locator('#settingsDialog')
  PHASE='settings-hierarchy';expect(settings.locator('#settingsTitle')).to_have_text('Configurazione AI');expect(settings.locator('details.advanced')).not_to_have_attribute('open','');page.keyboard.press('Escape')

  for width in [390,320]:
   PHASE=f'mobile-{width}-home';mc=browser.new_context(viewport={'width':width,'height':844});mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')");m=mc.new_page();m.set_default_timeout(30000);m.on('request',lambda req:writes.append({'method':req.method,'url':req.url,'viewport':width}) if req.url.startswith(BASE+'/api/') and req.method!='GET' else None);open_view(m,'home');expect(m.locator('#homePulse')).to_be_hidden();no_overflow(m)
   PHASE=f'mobile-{width}-processes';open_view(m,'processes');mcols=m.evaluate("()=>getComputedStyle(document.querySelector('#procedureHub')).gridTemplateColumns.split(' ').filter(Boolean).length");assert mcols==1,(width,mcols);no_overflow(m)
   PHASE=f'mobile-{width}-grc';open_process(m,'AO-01');no_overflow(m);mc.close()

  PHASE='read-only-boundary';assert not writes,writes
  PHASE='page-errors';assert not errors,errors
  out={'ok':True,'profile':'native-semantic-lattice-3.2','surfaceCoverage':['home','processes','RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01','proof','epistemic','admin','settings'],'semanticReadiness':'monotonic-c01-cycle+declared-owner+surface-invariant','transportQuiescenceDependency':False,'globalRuntimeLocalAdapters':0,'processCatalogue':'matrix-responsive','homeNumericDashboard':False,'proof':'decisions-first','epistemic':'search-first','technicalDefaultOpen':False,'mobileWidths':[390,320],'mobileOverflow':False,'writeCount':len(writes),'claimBoundary':'Rendered hierarchy/compression evidence only; not human comprehension research, legal compliance, accessibility certification or deployment security.'}
  (ART/'browser-information-value.json').write_text(json.dumps(out,indent=2),encoding='utf8');print('browser-information-value-3.2: complete');ctx.close();browser.close()
except BaseException as exc:
 fail(exc);traceback.print_exc();raise
