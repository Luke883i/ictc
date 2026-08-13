import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'
LABELS={'RN-01':'Sorveglia fonti','EC-01':'Gestisci eventi','AO-01':'Verifica inventario','MC-01':'Valuta norme e controlli','AP-01':'Gestisci remediation','RC-01':'Valuta rischi','AR-01':'Gestisci questionari'}
IDS={'RN-01':'monitoring','EC-01':'incidents','AO-01':'objects','MC-01':'coverage','AP-01':'actions','RC-01':'risks','AR-01':'assurance'}
def fail(e):
 payload={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}; (ART/'browser-procedure-finetuning-1-4-executive-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8'); print(f'::error title=browser-procedure-executive-harmonization::{PHASE}: {type(e).__name__}: {e}',flush=True)
def no_orphans(page,root):
 bad=page.locator(root).evaluate("r=>[...r.querySelectorAll('button,a[href],summary')].filter(n=>n.offsetParent!==null).filter(n=>!n.dataset.journeyProcess||!n.dataset.journeyStage||!n.dataset.journeyIntent||!n.dataset.journeyAuthority||!n.dataset.journeyEvidenceEffect).map(n=>n.outerHTML.slice(0,220))"); assert not bad,(root,bad[:10])
def no_overflow(page):
 bad=page.locator('body').evaluate("b=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})"); assert bad['sw']<=bad['cw']+2,bad
def open_process(page,code):
 page.locator('.service-nav [data-service="processes"]').click(); card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); assert 'executive-process-card' in (card.get_attribute('class') or ''); expect(card.locator('.finetune-card-nature')).to_contain_text('Governa ·'); expect(card.locator('.finetune-card-decision')).not_to_contain_text('da decidere'); expect(card.locator(':scope > footer .procedure-primary')).to_have_text(LABELS[code]); card.locator(':scope > footer .procedure-primary').click(); page.wait_for_timeout(220)
def decision_frame(page,code):
 id=IDS[code]; root='#monitoringView' if id=='monitoring' else '#incidentsView' if id=='incidents' else '#grcWorkspace'; frame=page.locator(f'{root} > .procedure-decision-frame[data-executive-procedure="{id}"]'); expect(frame).to_be_visible(); expect(frame.locator(':scope > .executive-frame-cell')).to_have_count(3); expect(frame).to_contain_text('Governa'); expect(frame).to_contain_text('Decisione umana'); expect(frame).to_contain_text('Prova che resta'); details=frame.locator(':scope > .executive-boundary'); expect(details).to_be_visible(); no_orphans(page,root); assert details.evaluate('e=>e.open') is False; expect(details.locator(':scope > summary')).to_have_text('Limite del processo'); return frame
try:
 with sync_playwright() as pw:
  launch={'headless':True};
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch); ctx=browser.new_context(viewport={'width':1440,'height':950}); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
  page=ctx.new_page(); page.set_default_timeout(30000); page.goto(BASE+'/?view=processes',wait_until='networkidle')
  PHASE='hub'; expect(page.locator('#procedureHub .executive-process-card')).to_have_count(7); expect(page.locator('#procedureHub .finetune-card-nature')).to_have_count(7); expect(page.locator('#procedureHub .finetune-card-decision')).to_have_count(7); assert 'da decidere' not in page.locator('#procedureHub').inner_text(); expect(page.locator('#processesView .processes-head')).to_contain_text('Sette procedure distinte')
  for code,label in LABELS.items():
   card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card.locator(':scope > footer .procedure-primary')).to_have_text(label); signals=card.locator(':scope > footer .procedure-signals'); expect(signals).to_be_visible(); expect(signals).to_contain_text('Prova'); expect(signals.locator('.procedure-signal')).to_have_count(1)
  no_overflow(page); page.screenshot(path=str(ART/'ux-finetune-executive-hub.png'),full_page=True)
  for code in LABELS:
   PHASE=code; open_process(page,code); decision_frame(page,code); no_overflow(page); page.screenshot(path=str(ART/f'ux-finetune-executive-{code.lower()}.png'),full_page=True)
   if code=='RC-01': expect(page.locator('#grcWorkspace nav [data-grc-process="actions"]')).to_have_text('Azioni correttive'); expect(page.locator('#grcWorkspace nav [data-grc-process="assurance"]')).to_have_text('Questionari e verifiche'); expect(page.locator('#grcWorkspace .grc-heat h3')).to_have_text('Matrice dei rischi valutati')
  PHASE='mobile'; mobile=browser.new_context(viewport={'width':390,'height':844}); mobile.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')"); m=mobile.new_page(); m.goto(BASE+'/?view=processes',wait_until='networkidle'); no_overflow(m); open_process(m,'AR-01'); f=decision_frame(m,'AR-01'); no_overflow(m); assert f.evaluate("e=>getComputedStyle(e).gridTemplateColumns.trim().split(/\\s+/).length")==1; m.screenshot(path=str(ART/'ux-finetune-executive-mobile-ar.png'),full_page=True); mobile.close()
  out={'ok':True,'profile':'procedure-executive-harmonization-1.5','procedures':list(LABELS),'sameExecutiveAnatomy':True,'attentionIsOperationalNotDecisionCount':True,'singleNonDuplicativeEvidenceSignal':True,'boundaryProgressiveDisclosure':True,'rcAndArPromotedFromRegressionOnly':True,'evidenceClass':'E2 server-backed browser; not human usability, legal review or independent assurance'}; (ART/'browser-procedure-finetuning-1-4-executive.json').write_text(json.dumps(out,indent=2),encoding='utf8'); print('browser-procedure-executive-harmonization-1-5: complete',flush=True); ctx.close(); browser.close()
except BaseException as e:
 fail(e); raise
