import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True); BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'
LABELS={'RN-01':'Sorveglia fonti','EC-01':'Gestisci eventi','AO-01':'Verifica inventario','MC-01':'Valuta norme e controlli','AP-01':'Gestisci remediation','RC-01':'Valuta rischi','AR-01':'Gestisci questionari'}
IDS={'RN-01':'monitoring','EC-01':'incidents','AO-01':'objects','MC-01':'coverage','AP-01':'actions','RC-01':'risks','AR-01':'assurance'}
def root_for(code):
 id=IDS[code]; return '#monitoringView' if id=='monitoring' else '#incidentsView' if id=='incidents' else '#grcWorkspace'
def no_overflow(page):
 m=page.evaluate('()=>[innerWidth,document.documentElement.scrollWidth,document.body.scrollWidth]'); assert m[1]<=m[0]+2 and m[2]<=m[0]+2,m
def openp(page,code):
 page.locator('.service-nav [data-service="processes"]').click(); card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); expect(card.locator(':scope > footer .procedure-primary')).to_have_text(LABELS[code]); card.locator(':scope > footer .procedure-primary').click(); page.wait_for_timeout(180)
def check_frame(page,code):
 id=IDS[code]; root=root_for(code); frame=page.locator(f'{root} > .procedure-decision-frame[data-executive-procedure="{id}"]'); expect(frame).to_be_visible(); expect(frame).to_contain_text('Governa'); expect(frame).to_contain_text('Decisione umana'); expect(frame).to_contain_text('Prova che resta'); boundary=frame.locator(':scope > .executive-boundary'); expect(boundary).to_be_visible(); assert boundary.evaluate('e=>e.open') is False; return frame
try:
 with sync_playwright() as pw:
  launch={'headless':True}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch); ctx=browser.new_context(viewport={'width':1440,'height':950}); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')"); page=ctx.new_page(); page.set_default_timeout(30000); page.goto(BASE+'/?view=processes',wait_until='networkidle')
  PHASE='hub'; expect(page.locator('#procedureHub .executive-process-card')).to_have_count(7); assert 'da decidere' not in page.locator('#procedureHub').inner_text()
  for code in LABELS:
   card=page.locator(f'#procedureHub [data-process-code="{code}"]'); evidence=card.locator(':scope > footer .executive-evidence-inline'); expect(evidence).to_be_visible(); expect(evidence).to_contain_text('Prova'); signals=card.locator(':scope > footer .procedure-signals')
   if signals.count(): assert signals.evaluate('e=>getComputedStyle(e).display')=='none'
  no_overflow(page); page.screenshot(path=str(ART/'ux-finetune-executive-hub.png'),full_page=True)
  for code in LABELS:
   PHASE=code; openp(page,code); check_frame(page,code); no_overflow(page)
  PHASE='rc'; openp(page,'RC-01'); expect(page.locator('#grcWorkspace .grc-heat h3')).to_have_text('Matrice dei rischi valutati'); expect(page.locator('#grcWorkspace nav [data-grc-process="actions"]')).to_have_text('Azioni correttive')
  PHASE='ar'; openp(page,'AR-01'); expect(page.locator('#grcWorkspace nav [data-grc-process="assurance"]')).to_have_text('Questionari e verifiche')
  PHASE='mobile'; mobile=browser.new_context(viewport={'width':390,'height':844}); mobile.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')"); m=mobile.new_page(); m.goto(BASE+'/?view=processes',wait_until='networkidle'); no_overflow(m); openp(m,'AR-01'); frame=check_frame(m,'AR-01'); no_overflow(m); assert frame.evaluate("e=>getComputedStyle(e).gridTemplateColumns.trim().split(/\\s+/).length")==1; mobile.close()
  out={'ok':True,'profile':'procedure-executive-harmonization-1.5','procedures':list(LABELS),'canonicalMetricSignalsPreserved':True,'presentationEvidenceSibling':True,'boundaryProgressiveDisclosure':True,'mobileOverflow':False,'evidenceClass':'E2 server-backed browser; not human usability, legal review or independent assurance'}; (ART/'browser-procedure-finetuning-1-4-executive.json').write_text(json.dumps(out,indent=2),encoding='utf8'); print('browser-procedure-executive-harmonization-1-5: complete',flush=True); ctx.close(); browser.close()
except BaseException as e:
 (ART/'browser-procedure-finetuning-1-4-executive-error.json').write_text(json.dumps({'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()},indent=2),encoding='utf8'); print(f'::error title=browser-procedure-executive-harmonization::{PHASE}: {type(e).__name__}: {e}',flush=True); raise
