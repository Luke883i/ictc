import json, os, pathlib, traceback
from playwright.sync_api import sync_playwright, expect
from browser_test_support import ensure_onboarded
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'/'compliance-ontology-runtime'; ART.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); MODE=os.environ.get('ICTC_COMPLIANCE_MODE','standard'); EXPECTED=os.environ.get('ICTC_EXPECT_BUILD_SHA','').strip(); TARGET=os.environ.get('ICTC_COMPLIANCE_SURFACE','').strip(); VIEWPORT=os.environ.get('ICTC_COMPLIANCE_VIEWPORT','1440x950')
VW,VH=[int(x) for x in VIEWPORT.lower().split('x',1)]; VTAG=f'{VW}x{VH}'; TTAG=TARGET or 'all'
SURFACES=[('home','home','#homeView'),('processes','processes','#processesView'),('monitoring','monitoring','#monitoringView'),('incidents','incidents','#incidentsView'),('grc_objects','objects','#grcView'),('grc_coverage','coverage','#grcView'),('grc_actions','actions','#grcView'),('grc_risks','risks','#grcView'),('grc_assurance','assurance','#grcView'),('proof','proof','#proofView'),('epistemic','epistemic','#epistemicView')]
CODES={'monitoring':'RN-01','incidents':'EC-01','objects':'AO-01','coverage':'MC-01','actions':'AP-01','risks':'RC-01','assurance':'AR-01'}

def no_overflow(page):
 m=page.evaluate("()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})"); assert max(m['html'],m['body'])<=m['inner']+1,m

def build_identity(page):
 h=page.request.get(BASE+'/api/admin/identity',headers={'X-ICTC-Role':'admin'}).json(); build=((h.get('buildIdentity') or {}).get('build') or {}); sha=(build.get('sha') or ''); assert build.get('exact') is True,build
 if EXPECTED: assert sha.startswith(EXPECTED) or EXPECTED.startswith(sha),(sha,EXPECTED)
 return {'sha':sha,'dirty':build.get('dirty')}

def goto(page,view,selector): page.goto(f'{BASE}/?view={view}',wait_until='networkidle'); expect(page.locator(selector)).to_be_visible(); page.wait_for_timeout(80)
def open_process(page,proc):
 goto(page,'processes','#processesView'); card=page.locator(f'#procedureHub [data-process-code="{CODES[proc]}"]'); expect(card).to_be_visible(); card.locator('footer button').first.click(); root='#monitoringView' if proc=='monitoring' else '#incidentsView' if proc=='incidents' else '#grcView'; expect(page.locator(root)).to_be_visible(); page.wait_for_timeout(80)
def follows(page,a,b): return page.evaluate("([a,b])=>Boolean(document.querySelector(a)?.compareDocumentPosition(document.querySelector(b)) & Node.DOCUMENT_POSITION_FOLLOWING)",[a,b])
def placement_ok(page,key,root):
 ctx=f'{root} [data-compliance-context="{key}"]'
 if key=='home': return follows(page,'#homePriorities',ctx)
 if key=='processes': return follows(page,'#procedureHub',ctx)
 if key in ('monitoring','incidents'): return page.evaluate("([r,c])=>document.querySelector(r)?.lastElementChild?.matches(c)===true",[root,ctx])
 if key.startswith('grc_'): return page.evaluate("c=>document.querySelector('.grc-body')?.lastElementChild?.matches(c)===true",ctx)
 if key=='proof': return follows(page,'#proofContent',ctx)
 if key=='epistemic': return page.evaluate("c=>{const x=document.querySelector(c),p=document.querySelector('#epistemicView .surface-panel');return !!(p&&x&&(p.compareDocumentPosition(x)&Node.DOCUMENT_POSITION_FOLLOWING))}",ctx)
 return False

def check_context(page,key,root):
 def mark(name): out['phase']=f'{key}-{name}'
 mark('present'); loc=page.locator(f'{root} [data-compliance-context="{key}"]'); assert loc.count()==1,(key,loc.count()); expect(loc).to_be_visible()
 mark('closed-default'); assert loc.get_attribute('open') is None,key
 mark('placement'); assert placement_ok(page,key,root),(key,'context-before-work')
 mark('open'); summary=loc.locator(':scope > summary'); expect(summary).to_be_visible(); summary.focus(); summary.press('Enter'); expect(loc.locator('.compliance-context-body')).to_be_visible()
 mark('atoms'); assert loc.locator('[data-compliance-atom]').count()==3,key; txt=loc.inner_text()
 mark('tokens')
 for token in ['Capire','Decidere','Dimostrare','Limite']: assert token in txt,(key,token)
 mark('regimes'); assert loc.locator('.compliance-regime-chip').count()>=3,key
 mark('close'); close=loc.locator('[data-compliance-sidecar-close]'); close.click(); assert loc.get_attribute('open') is None,key
 mark('focus-return'); assert page.evaluate("e=>e===document.activeElement",summary.element_handle()),(key,'focus-return')
 mark('overflow'); no_overflow(page)

def check_admin(page):
 goto(page,'home','#homeView'); page.locator('#openAdminCenter').click(); dlg=page.locator('#adminCenter[open]'); expect(dlg).to_be_visible(); assert dlg.locator('.admin-nav').get_attribute('data-admin-progression')=='status>ai>identity'; rows=[]
 for key in ['overview','ai','identity']:
  dlg.locator(f'[data-admin-nav="{key}"]').click(); view=dlg.locator(f'[data-admin-view="{key}"]'); expect(view).to_be_visible(); heading=view.locator('h3').first; expect(heading).to_be_visible(); no_overflow(page); rows.append('admin_'+key)
 dlg.locator('[data-admin-close]').click(); return rows

def screenshot(page,name): page.screenshot(path=str(ART/f'{MODE}__{VTAG}__{name}.png'),full_page=True)
out={'ok':False,'mode':MODE,'viewport':VTAG,'surfaces':[]}
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}; browser_path=os.environ.get('ICTC_CHROMIUM');
  if browser_path: launch['executable_path']=browser_path
  browser=pw.chromium.launch(**launch); ctx=browser.new_context(viewport={'width':VW,'height':VH},ignore_https_errors=True); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')"); page=ctx.new_page(); page.set_default_timeout(25000)
  if MODE=='fresh':
   page.goto(BASE+'/?view=home',wait_until='networkidle'); dlg=page.locator('#ictcOnboardingDialog[open]'); expect(dlg).to_be_visible(); assert dlg.locator('[data-homeboarding-lesson]').count()==15; ensure_onboarded(page,BASE,'admin')
  else: ensure_onboarded(page,BASE,'admin')
  out['identity']=build_identity(page); admin_only=TARGET=='admin'; selected=[] if admin_only else [row for row in SURFACES if not TARGET or row[0]==TARGET]; assert selected or admin_only,(TARGET,'unknown target')
  for key,route,root in selected:
   if route in CODES: open_process(page,route)
   else: goto(page,route,root)
   check_context(page,key,root); screenshot(page,key); out['surfaces'].append(key)
   if key=='processes': assert page.locator('[data-compliance-process-placement] article').count()==7 and page.locator('[data-compliance-process-placement]').get_attribute('open') is None
  if not TARGET or admin_only: out['surfaces'].extend(check_admin(page))
  expected=14 if not TARGET else 3 if admin_only else 1; assert len(out['surfaces'])==expected,out['surfaces']; out['ok']=True; out['count']=len(out['surfaces']); out['claimBoundary']='Rendered exact-build composition evidence only; not legal applicability, compliance, certification, representative-human usability or deployment assurance.'; (ART/f'{MODE}__{VTAG}__{TTAG}.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)); print(json.dumps(out,ensure_ascii=False)); browser.close()
except BaseException as exc:
 out['error']=str(exc); out['traceback']=traceback.format_exc(); (ART/f'{MODE}__{VTAG}__{TTAG}-error.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)); raise
