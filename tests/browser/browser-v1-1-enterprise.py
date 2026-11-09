import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'
def fail(e):
 p={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}; (ART/'browser-v1-1-error.json').write_text(json.dumps(p,indent=2),encoding='utf8'); print(f'::error title=browser-v1-1::{PHASE}: {type(e).__name__}: {e}',flush=True)
def box(page,selector):
 b=page.locator(selector).first.bounding_box(); assert b is not None,selector; return {k:round(v,2) for k,v in b.items()}
def screenshot(page,name): page.screenshot(path=str(ART/name),full_page=True)
def scroll_regions(page,dialog_selector):
 return page.locator(dialog_selector).evaluate("""root => [...root.querySelectorAll('*')].filter(el=>!['TEXTAREA','SELECT'].includes(el.tagName)).map(el=>{const s=getComputedStyle(el);return {tag:el.tagName,id:el.id,cls:el.className||'',overflowY:s.overflowY,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}}).filter(x=>(x.overflowY==='auto'||x.overflowY==='scroll')&&x.scrollHeight>x.clientHeight+3)""")
def assert_inside(inner,outer):
 assert inner['x']>=outer['x']-1 and inner['y']>=outer['y']-1 and inner['x']+inner['width']<=outer['x']+outer['width']+1 and inner['y']+inner['height']<=outer['y']+outer['height']+1,(inner,outer)
def api_eval(page,script,arg=None):
 return page.evaluate("""async ({script,arg}) => { const headers={'content-type':'application/json','x-ictc-role':'admin','x-ictc-actor-id':'local-admin'}; const fn=new Function('headers','arg',`return (async()=>{${script}})()`); return await fn(headers,arg); }""",{'script':script,'arg':arg})
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch); ctx=browser.new_context(viewport={'width':1440,'height':1000}); ctx.add_init_script("try{localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')}catch{}")
  page=ctx.new_page(); page.set_default_timeout(20000); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  PHASE='brand-home'; page.goto(BASE+'/',wait_until='networkidle')
  expect(page.locator('html')).to_have_attribute('data-ictc-experience','stable-2'); expect(page.locator('html')).to_have_attribute('data-ictc-edition','1.1-stable')
  expect(page.locator('.service-nav [data-service]')).to_have_count(3); expect(page.locator('.service-nav')).to_contain_text('Oggi'); expect(page.locator('.service-nav')).to_contain_text('Processi'); expect(page.locator('.service-nav')).to_contain_text('Evidenze'); assert 'Prove' not in page.locator('.service-nav').inner_text()
  mark=page.locator('.ictc-brand-mark'); expect(mark).to_be_visible(); assert mark.evaluate('(img)=>img.complete&&img.naturalWidth>0')
  expect(page.locator('.brand')).to_have_attribute('aria-label','ICTC · Integrated Compliance Tower Control'); expect(page.locator('.brand small')).to_have_text('Integrated Compliance Tower Control')
  expect(page.locator('#homeTitle')).to_have_text('Governa la compliance operativa, senza perdere la traccia.'); expect(page.locator('#homePulse > div')).to_have_count(4); expect(page.locator('#homePriorities')).to_be_visible(); assert page.locator('#homeView .stable-process-card').count()==0
  header=box(page,'.topbar'); hero=box(page,'.home-hero'); footer=box(page,'#stableLegalFooter'); action=box(page,'#homePrimaryAction'); assert header['height']<=52,header; assert hero['height']>=260,hero; assert action['y']+action['height']<footer['y'],(action,footer); assert abs((footer['y']+footer['height'])-1000)<=2,footer
  home_text=page.locator('#homeView').inner_text().lower(); assert 'sha256' not in home_text and 'audit event' not in home_text and 'deployment' not in home_text
  screenshot(page,'ux-v11-home-desktop.png')

  PHASE='seven-peer-processes'; page.locator('.service-nav [data-service="processes"]').click(); hub=page.locator('#procedureHub'); expect(hub).to_be_visible(); expect(hub.locator('.stable-process-card')).to_have_count(7)
  codes=['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01']; assert page.locator('#procedureHub [data-process-code="EV-01"]').count()==0
  for code in codes: assert hub.locator(f'[data-process-code="{code}"]').count()==1,code
  screenshot(page,'ux-v11-processes-desktop.png')
  grc={'AO-01':'Inventario di sistemi e oggetti','MC-01':'Controlli e copertura','AP-01':'Azioni correttive','RC-01':'Rischi di compliance','AR-01':'Questionari e verifiche'}
  for code,title in grc.items():
   page.locator('.service-nav [data-service="processes"]').click(); card=page.locator(f'#procedureHub [data-process-code="{code}"]'); card.locator('.primary').click(); expect(page.locator('#grcView')).to_be_visible(); expect(page.locator('.grc-head h1')).to_have_text(title); assert page.locator('.grc-head nav[aria-label="Processi GRC"]:visible').count()==0,(code,page.locator('.grc-head').inner_text())
  screenshot(page,'ux-v11-grc-ar.png')
  page.locator('.service-nav [data-service="processes"]').click(); page.locator('#procedureHub [data-process-code="RN-01"] .primary').click(); expect(page.locator('#monitoringView')).to_be_visible()
  page.locator('.service-nav [data-service="processes"]').click(); page.locator('#procedureHub [data-process-code="EC-01"] .primary').click(); expect(page.locator('#incidentsView')).to_be_visible()

  PHASE='business-first-evidence'; page.locator('.service-nav [data-service="proof"]').click(); expect(page.locator('#proofView')).to_be_visible(); expect(page.locator('#proofContent')).to_be_visible(); expect(page.locator('#proofTitle')).to_have_text('Evidenze e tracciabilità'); expect(page.locator('.evidence-summary')).to_be_visible(); expect(page.locator('#evidenceDecisionList')).to_be_visible(); expect(page.locator('#proofAdvanced')).not_to_have_attribute('open','')
  evidence_text=page.locator('#proofView').inner_text(); assert evidence_text.index('Decisioni umane recenti')<evidence_text.index('Postura tecnica, export e limiti')
  screenshot(page,'ux-v11-evidence-desktop.png')

  PHASE='admin-modal-geometry'; page.locator('#stableProfileMenu summary').click(); page.locator('#openAdminCenter').click(); expect(page.locator('#adminCenter')).to_be_visible(); expect(page.locator('#procedurePolicyList input')).to_have_count(7); expect(page.locator('#procedurePolicyCount')).to_contain_text('/7 attive')
  admin_dialog=box(page,'#adminCenter .admin-shell'); admin_close=box(page,'#adminCenter [data-admin-close]'); assert_inside(admin_close,admin_dialog); admin_scroll=scroll_regions(page,'#adminCenter'); assert len(admin_scroll)<=1,admin_scroll; assert page.locator('#adminCenter').evaluate("el=>getComputedStyle(el).overflowY")=='hidden'
  screenshot(page,'ux-v11-admin-procedures.png')
  page.locator('#adminCenter [data-admin-close]').click(); expect(page.locator('#adminCenter')).not_to_be_visible()

  PHASE='ai-settings-geometry'; page.locator('#stableProfileMenu summary').click(); page.locator('#openSettings').click(); expect(page.locator('#settingsDialog')).to_be_visible(); settings_shell=box(page,'#settingsDialog .dialog-shell'); settings_close=box(page,'#settingsDialog [data-close="settingsDialog"]'); assert_inside(settings_close,settings_shell); settings_scroll=scroll_regions(page,'#settingsDialog'); assert len(settings_scroll)<=1,settings_scroll; expect(page.locator('#settingsDialog footer')).to_be_visible(); expect(page.locator('#settingsDialog button[type="submit"]')).to_be_visible(); screenshot(page,'ux-v11-settings.png'); page.locator('#settingsDialog [data-close="settingsDialog"]').first.click()

  PHASE='feature-flag-enforcement'; page.locator('#stableProfileMenu summary').click(); page.locator('#openAdminCenter').click(); expect(page.locator('#procedurePolicyList input[name="coverage"]')).to_be_checked(); page.locator('#procedurePolicyList input[name="coverage"]').uncheck(); expect(page.locator('#procedurePolicyAcknowledge')).to_be_visible(); page.locator('#procedurePolicyAcknowledge').check(); page.locator('#procedurePolicyForm button[type="submit"]').click(); expect(page.locator('#procedurePolicyCount')).to_contain_text('6/7 disponibili'); projection=api_eval(page,"const r=await fetch('/api/bootstrap',{headers});return {status:r.status,body:await r.json()};"); assert projection['status']==200 and 'coverage' not in projection['body']['experience']['procedurePolicy']['enabled'],projection; page.locator('#adminCenter [data-admin-close]').click(); page.locator('.service-nav [data-service="processes"]').click(); expect(page.locator('#procedureHub .procedure-card')).to_have_count(6); assert page.locator('#procedureHub [data-process-code="MC-01"]').count()==0
  routed=api_eval(page,"const r=await fetch('/api/work/route',{method:'POST',headers,body:JSON.stringify({text:'mapping copertura requisito gap',inputType:'text'})}); return {status:r.status,body:await r.json()};"); assert routed['status']==200,routed; assert all(x.get('processId')!='coverage' for x in routed['body']['candidates']),routed
  blocked=api_eval(page,"const r=await fetch('/api/grc/mappings',{method:'POST',headers,body:JSON.stringify({requirementLabel:'test disabled'})}); return {status:r.status,body:await r.json()};"); assert blocked['status']==409 and blocked['body'].get('code')=='procedure-disabled',blocked
  readable=api_eval(page,"const r=await fetch('/api/grc',{headers}); return {status:r.status,body:await r.json()};"); assert readable['status']==200,readable
  restored=api_eval(page,"const r=await fetch('/api/admin/procedures',{method:'PUT',headers,body:JSON.stringify({features:{coverage:true}})}); return {status:r.status,body:await r.json()};"); assert restored['status']==200,restored; page.reload(wait_until='networkidle'); page.locator('.service-nav [data-service="processes"]').click(); expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)

  PHASE='monitoring-action-cleanup'; page.locator('#procedureHub [data-process-code="RN-01"] .primary').click(); assert page.locator('button:visible').evaluate_all("els=>els.filter(x=>!(x.innerText||x.getAttribute('aria-label')||'').trim()).length")==0
  if page.locator('.contribute-card').count():
   bg=page.locator('.contribute-card').evaluate("el=>getComputedStyle(el).backgroundColor"); assert bg in ['rgb(255, 255, 255)','rgba(0, 0, 0, 0)'] or '255' in bg,bg

  PHASE='mobile'; mobile_ctx=browser.new_context(viewport={'width':390,'height':844}); mobile_ctx.add_init_script("try{localStorage.setItem('ictc-role','user');localStorage.setItem('ictc-service','home')}catch{}") ; mobile=mobile_ctx.new_page(); mobile.goto(BASE+'/',wait_until='networkidle'); expect(mobile.locator('html')).to_have_attribute('data-ictc-experience','stable-2'); expect(mobile.locator('.service-nav [data-service]')).to_have_count(3); expect(mobile.locator('#homePulse > div')).to_have_count(4); mh=box(mobile,'.topbar'); mf=box(mobile,'#stableLegalFooter'); ma=box(mobile,'#homePrimaryAction'); assert mh['height']<=48,mh; assert abs((mf['y']+mf['height'])-844)<=2,mf; assert ma['y']+ma['height']<844,ma; expect(mobile.locator('.ictc-brand-mark')).to_be_visible(); screenshot(mobile,'ux-v11-home-mobile.png'); mobile_ctx.close()
  assert not errors,errors
  report={'ok':True,'releaseProfile':'1.1_stable','experience':'stable-2','surfaces':['Oggi','Processi','Evidenze'],'processes':7,'processCatalogCopies':1,'homeFullCatalog':False,'homePulseSignals':4,'homePriorityCap':3,'grcStandalonePeers':5,'adminProcedureFlags':7,'featureFlagWriteBlocked':True,'featureFlagRoutingBlocked':True,'historyReadableWhenDisabled':True,'dialogScrollRegions':{'admin':admin_scroll,'settings':settings_scroll},'geometry':{'header':header,'hero':hero,'footer':footer,'primaryAction':action},'screenshots':['ux-v11-home-desktop.png','ux-v11-processes-desktop.png','ux-v11-grc-ar.png','ux-v11-evidence-desktop.png','ux-v11-admin-procedures.png','ux-v11-settings.png','ux-v11-home-mobile.png'],'evidenceClass':'E2-browser-geometry-not-human-research'}; (ART/'browser-v1-1-enterprise.json').write_text(json.dumps(report,indent=2),encoding='utf8'); print('browser-v1-1-enterprise: complete',flush=True); browser.close()
except BaseException as e: fail(e); traceback.print_exc(); raise
