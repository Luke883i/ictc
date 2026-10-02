import json,os,pathlib
from playwright.sync_api import sync_playwright,expect
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
ART=pathlib.Path(__file__).resolve().parents[1]/'artifacts';ART.mkdir(exist_ok=True)
def no_overflow(p,label):
 m=p.evaluate("()=>({v:innerWidth,h:document.documentElement.scrollWidth,b:document.body.scrollWidth})");assert max(m['h'],m['b'])<=m['v']+2,(label,m)
def ensure_onboarding(page):
 d=page.locator('#ictcOnboardingDialog')
 accepted_now=False
 if d.count() and d.is_visible():
  assert d.get_attribute('data-onboarding-mode')=='first-run-gate'
  nxt=d.locator('[data-onboarding-next]')
  for step in range(4):
   expect(nxt).to_have_text('Continua');nxt.click()
  expect(nxt).to_have_text('Accetta e continua');nxt.click();expect(d).not_to_be_visible();accepted_now=True
 profile=page.locator('#stableProfileMenu > summary');profile.click();proof=page.locator('#stableProfileMenu .profile-onboarding-proof');expect(proof).to_be_visible();assert 'Onboarding accettato' in proof.inner_text();profile.click()
 return accepted_now
def run(browser,w,h,label):
 c=browser.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')");p=c.new_page();p.set_default_timeout(20000);p.goto(BASE,wait_until='networkidle');accepted_now=ensure_onboarding(p)
 # Canonical navigation authority remains exactly three services.
 expect(p.locator('.service-nav [data-service]')).to_have_count(3);expect(p.locator('[data-regulatory-open]')).to_have_count(1)
 p.locator('[data-regulatory-open]').click();d=p.locator('#regulatoryDialog');expect(d).to_be_visible();assert d.get_attribute('data-authority-effect')=='none'
 expect(d.locator('.regulatory-card-law')).to_have_count(5);expect(d.locator('.regulatory-card-reference')).to_have_count(17)
 txt=d.inner_text();
 for token in ['GDPR','NIS2','DORA','EU AI Act','CRA','ISO/IEC 27001','Riferimento ≠ applicabilità','Mapping ≠ conformità','Evidenza ≠ conclusione']: assert token in txt,(label,token)
 assert d.locator('a.regulatory-source-link').count()>=20
 nis=d.locator('[data-regulatory-reference="NIS2"] details');nis.locator('summary').click();expect(nis).to_have_attribute('open','')
 iso=d.locator('[data-open-standard-browser="iso-iec-27001-2022"]').first;iso.click();expect(p.locator('#standardBrowserDialog')).to_be_visible();p.locator('#standardBrowserDialog button[aria-label="Chiudi"]').click()
 if w<=620:
  box=d.bounding_box();assert box and abs(box['width']-w)<=2,(label,box,w)
 no_overflow(p,label);c.close()
 return {'label':label,'width':w,'height':h,'acceptedOnThisRun':accepted_now,'onboardingReceipt':'visible'}
with sync_playwright() as pw:
 opts={'headless':True,'args':['--no-sandbox']};
 if os.environ.get('ICTC_CHROMIUM'):opts['executable_path']=os.environ['ICTC_CHROMIUM']
 else: opts['executable_path']='/usr/bin/chromium'
 b=pw.chromium.launch(**opts);results=[run(b,1440,950,'desktop'),run(b,390,844,'mobile')];b.close()
report={'ok':True,'surface':'regulatory-first-plane','viewports':results,'canonicalServiceAuthorities':3,'legalPrimerCards':5,'referenceCards':17,'authorityEffect':'NONE','onboardingHumanAcceptance':'verified','onboardingReceipt':'visible','claimBoundary':'Rendered discoverability/drilldown only; not legal applicability, compliance, certification or human usability proof.'};(ART/'browser-regulatory-surface.json').write_text(json.dumps(report,indent=2,ensure_ascii=False));print(json.dumps(report,ensure_ascii=False))
