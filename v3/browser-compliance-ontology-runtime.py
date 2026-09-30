import json, os, pathlib, traceback
from playwright.sync_api import sync_playwright, expect
from browser_test_support import ensure_onboarded
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'/'compliance-ontology-runtime'; ART.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); MODE=os.environ.get('ICTC_COMPLIANCE_MODE','standard'); EXPECTED=os.environ.get('ICTC_EXPECT_BUILD_SHA','').strip(); TARGET=os.environ.get('ICTC_COMPLIANCE_SURFACE','').strip()
SURFACES=[('home','home','#homeView'),('processes','processes','#processesView'),('monitoring','monitoring','#monitoringView'),('incidents','incidents','#incidentsView'),('grc_objects','objects','#grcView'),('grc_coverage','coverage','#grcView'),('grc_actions','actions','#grcView'),('grc_risks','risks','#grcView'),('grc_assurance','assurance','#grcView'),('proof','proof','#proofView'),('epistemic','epistemic','#epistemicView')]
CODES={'monitoring':'RN-01','incidents':'EC-01','objects':'AO-01','coverage':'MC-01','actions':'AP-01','risks':'RC-01','assurance':'AR-01'}

def no_overflow(page):
 m=page.evaluate("()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})")
 assert max(m['html'],m['body'])<=m['inner']+1,m

def build_identity(page):
 h=page.request.get(BASE+'/api/admin/identity',headers={'X-ICTC-Role':'admin'}).json(); build=((h.get('buildIdentity') or {}).get('build') or {}); sha=(build.get('sha') or ''); dirty=build.get('dirty'); assert build.get('exact') is True,build
 if EXPECTED: assert sha.startswith(EXPECTED) or EXPECTED.startswith(sha),(sha,EXPECTED)
 return {'sha':sha,'dirty':dirty}

def goto(page,view,selector):
 page.goto(f'{BASE}/?view={view}',wait_until='networkidle'); expect(page.locator(selector)).to_be_visible(); page.wait_for_timeout(120)

def open_process(page,proc):
 goto(page,'processes','#processesView'); code=CODES[proc]; card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); card.locator('footer button').first.click(); root='#monitoringView' if proc=='monitoring' else '#incidentsView' if proc=='incidents' else '#grcView'; expect(page.locator(root)).to_be_visible(); page.wait_for_timeout(120)

def check_context(page,key,root):
 loc=page.locator(f'{root} [data-compliance-context="{key}"]'); assert loc.count()==1,(key,loc.count()); expect(loc).to_be_visible(); assert loc.locator('[data-compliance-atom]').count()==3,key; txt=loc.inner_text();
 for token in ['Capire','Decidere','Dimostrare','Limite']: assert token in txt,(key,token)
 assert loc.locator('.compliance-regime-chip').count()>=3,key
 no_overflow(page)

def screenshot(page,name): page.screenshot(path=str(ART/f'{MODE}__{name}.png'),full_page=True)

out={'ok':False,'mode':MODE,'surfaces':[]}
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}; browser_path=os.environ.get('ICTC_CHROMIUM');
  if browser_path: launch['executable_path']=browser_path
  browser=pw.chromium.launch(**launch); ctx=browser.new_context(viewport={'width':1440,'height':950}); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')"); page=ctx.new_page(); page.set_default_timeout(25000)
  if MODE=='fresh':
   page.goto(BASE+'/?view=home',wait_until='networkidle'); dlg=page.locator('#ictcOnboardingDialog[open]'); expect(dlg).to_be_visible(); assert dlg.locator('[data-homeboarding-lesson]').count()==15; body='\n'.join(dlg.locator('[data-homeboarding-lesson]').all_text_contents());
   for token in ['GDPR','NIS2','DORA','AI Act','CRA','applicabilità','obbligo','evidenza']: assert token.lower() in body.lower(),token
   screenshot(page,'onboarding-fresh'); out['identity']=build_identity(page); out['onboardingLessons']=15
   ensure_onboarded(page,BASE,'admin')
  else: ensure_onboarded(page,BASE,'admin'); out['identity']=build_identity(page)
  selected=[row for row in SURFACES if not TARGET or row[0]==TARGET]
  assert selected,(TARGET,'unknown target')
  for key,route,root in selected:
   if route in CODES: open_process(page,route)
   else: goto(page,route,root)
   check_context(page,key,root); screenshot(page,key); out['surfaces'].append(key)
   if key=='processes': assert page.locator('[data-compliance-process-placement] article').count()==7
  out['ok']=True; out['count']=len(out['surfaces']); out['claimBoundary']='Rendered semantic context evidence only; not legal applicability, compliance, certification, human-usability or deployment assurance.'
  (ART/f'{MODE}.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)); print(json.dumps(out,ensure_ascii=False)); browser.close()
except BaseException as exc:
 out['error']=str(exc); out['traceback']=traceback.format_exc(); (ART/f'{MODE}-error.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)); raise
