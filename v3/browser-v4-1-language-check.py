import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'
PROCESS={
 'monitoring':('RN-01','Monitoraggio normativo','Monitora fonti e cambiamenti normativi'),
 'incidents':('EC-01','Eventi e segnalazioni','Registra e gestisci un evento'),
 'objects':('AO-01','Inventario di sistemi e oggetti','Inventario di sistemi e oggetti'),
 'coverage':('MC-01','Controlli e copertura','Controlli e copertura'),
 'actions':('AP-01','Azioni correttive','Azioni correttive'),
 'risks':('RC-01','Rischi di compliance','Rischi di compliance'),
 'assurance':('AR-01','Questionari e verifiche','Questionari e verifiche'),
}
def fail(e):
 p={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}; (ART/'browser-v4-1-language-error.json').write_text(json.dumps(p,indent=2),encoding='utf8'); print(f'::error title=browser-v4-1-language::{PHASE}: {type(e).__name__}: {e}',flush=True)
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch); ctx=browser.new_context(viewport={'width':1440,'height':1100}); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home');localStorage.setItem('ictc-ai-assist','on')")
  page=ctx.new_page(); page.set_default_timeout(20000); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  PHASE='shell-home'; page.goto(BASE+'/',wait_until='networkidle')
  expect(page.locator('.brand small')).to_have_text('Compliance operativa e tracciabile'); expect(page.locator('.role-control span')).to_have_text('Profilo'); expect(page.locator('#openSettings')).to_have_text('Impostazioni AI')
  expect(page.locator('.service-nav [data-service]')).to_have_count(3); expect(page.locator('.service-nav')).to_contain_text('Oggi'); expect(page.locator('.service-nav')).to_contain_text('Processi'); expect(page.locator('.service-nav')).to_contain_text('Prove')
  nexus=page.locator('#complianceNexus'); nexus.wait_for(state='visible'); expect(nexus.locator('[data-nexus-process]')).to_have_count(7)
  for pid,(_,title,_) in PROCESS.items(): expect(nexus.locator(f'[data-nexus-process="{pid}"] h3')).to_have_text(title)
  expect(page.locator('#nexusAiToggle')).to_contain_text('Attivo'); page.locator('#nexusAiToggle').click(); expect(page.locator('#nexusAiToggle')).to_contain_text('Disattivato'); expect(nexus.locator('[data-nexus-process]')).to_have_count(7)
  PHASE='home-progressive-disclosure'; expect(page.locator('#v3OperationalHome')).to_contain_text('Non sai da dove iniziare?'); expect(page.locator('#v3OperationalHome')).to_contain_text('Da fare'); expect(page.locator('#v3OperationalHome')).to_contain_text('Decisioni da confermare'); expect(page.locator('#v3OperationalHome')).to_contain_text('Indicatori di compliance')
  PHASE='processes-landscape'; page.locator('.service-nav [data-service="processes"]').click(); expect(page.locator('#processesView h1')).to_have_text('Processi di compliance'); expect(page.locator('#processLandscape')).to_contain_text('Vista per ciclo operativo'); assert page.locator('#processLandscape details').count()>=8
  PHASE='process-guides'
  for pid,(code,title,surface_title) in PROCESS.items():
   page.locator('.service-nav [data-service="home"]').click(); card=page.locator(f'#complianceNexus [data-nexus-process="{pid}"]'); card.locator('[data-v3-guide]').click(); dialog=page.locator('#v3ProcedureDialog'); dialog.wait_for(state='visible'); expect(page.locator('#v3ProcedureTitle')).to_have_text(f'{code} · {title}'); expect(dialog).to_contain_text('Per iniziare'); expect(dialog).to_contain_text('Risultato atteso'); expect(dialog.locator('details > summary')).to_have_text('Prove, limiti e dettagli metodologici'); expect(page.locator('#v3LaunchProcedure')).to_have_text('Apri processo'); page.locator('#v3LaunchProcedure').click()
   if pid=='monitoring': expect(page.locator('#monitoringView .hero-copy h1')).to_have_text(surface_title)
   elif pid=='incidents': expect(page.locator('#incidentsView .hero-copy h1')).to_have_text(surface_title)
   else: expect(page.locator('#grcWorkspace .grc-head h1')).to_have_text(surface_title)
  PHASE='proof'; page.locator('.service-nav [data-service="proof"]').click(); page.locator('#proofContent').wait_for(state='visible'); expect(page.locator('#proofTitle')).to_have_text('Prove e tracciabilità'); expect(page.locator('#proofView')).to_contain_text('Riferimenti a standard'); expect(page.locator('#traceExplorerTitle')).to_have_text('Ricostruisci una decisione o un fascicolo')
  PHASE='auditor'; page.locator('#roleSelect').select_option('auditor'); page.locator('.service-nav [data-service="home"]').click(); expect(page.locator('#complianceNexus [data-nexus-process]')).to_have_count(7); buttons=page.locator('#complianceNexus [data-nexus-process] [data-v3-guide]'); assert all((buttons.nth(i).inner_text()).startswith('Consulta') for i in range(buttons.count()))
  page.locator('#complianceNexus [data-nexus-process="assurance"] [data-v3-guide]').click(); page.locator('#v3ProcedureDialog').wait_for(state='visible'); expect(page.locator('#v3LaunchProcedure')).to_have_text('Consulta processo'); page.locator('#v3ProcedureDialog [data-v3-close]').first.click()
  assert not errors,errors
  report={'ok':True,'screens':['shell','oggi','processi','RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01','prove','trace','auditor'],'processes':7,'aiOffDiscoverability':True}; (ART/'browser-v4-1-language.json').write_text(json.dumps(report,indent=2),encoding='utf8'); print('browser-v4-1-language: complete',flush=True); browser.close()
except BaseException as e: fail(e); traceback.print_exc(); raise
