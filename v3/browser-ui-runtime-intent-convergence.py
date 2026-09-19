import json,os,pathlib,traceback
from playwright.sync_api import sync_playwright,expect
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4807')
ART=pathlib.Path('artifacts');ART.mkdir(exist_ok=True);PHASE='init'
def open_profile(p):
 m=p.locator('#stableProfileMenu');expect(m).to_be_visible()
 if m.get_attribute('open') is None:m.locator(':scope > summary').click()
def open_process(p,code):
 p.locator('.service-nav [data-service="processes"]').click();card=p.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible();card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click()
def home_fit(p,label):
 m=p.evaluate("()=>({inner:innerHeight,html:document.documentElement.scrollHeight,body:document.body.scrollHeight,footer:document.querySelector('#stableLegalFooter')?.getBoundingClientRect(),hero:document.querySelector('#homeView .home-hero')?.getBoundingClientRect()})")
 assert max(m['html'],m['body'])<=m['inner']+1,(label,m)
 assert m['footer'] and m['hero'] and m['hero']['bottom']<=m['footer']['top']+1,(label,m)
 return m
def save_policy(p,pid,enabled):
 open_profile(p);p.locator('#openAdminCenter').click();admin=p.locator('#adminCenter');expect(admin).to_be_visible();admin.locator('[data-admin-nav="overview"]').click()
 box=admin.locator(f'#procedurePolicyList input[name="{pid}"]');expect(box).to_be_visible()
 if enabled:box.check()
 else:box.uncheck()
 ack=admin.locator('#procedurePolicyImpactAck input[data-policy-ack]');expect(ack).to_be_visible();ack.check()
 save=admin.locator('#procedurePolicyForm button[type="submit"]');expect(save).to_be_enabled();save.click()
 expected='7/7 attive' if enabled else '6/7 attive';expect(admin.locator('#procedurePolicyCount')).to_contain_text(expected)
 admin.locator('[data-admin-close]').click();expect(admin).not_to_be_visible()
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1280,'height':900});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  p=ctx.new_page();p.set_default_timeout(30000)
  PHASE='home-1280';p.goto(BASE+'/?view=home',wait_until='networkidle');home_fit(p,'1280x900')
  PHASE='ai-truth';boot=p.evaluate("async()=>await (await fetch('/api/bootstrap')).json()");llm=boot.get('settings',{}).get('llm',{});expected_state='ready' if llm.get('ready') else ('key-missing' if llm.get('configured') else 'unconfigured');expected_tone='positive' if expected_state=='ready' else ('attention' if expected_state=='key-missing' else 'neutral');status=p.locator('#runtimeStatus');expect(status).to_have_attribute('data-ai-state',expected_state);expect(status).to_have_attribute('data-tone',expected_tone)
  if expected_state!='ready':assert status.get_attribute('data-tone')!='positive'
  PHASE='home-1600';p.set_viewport_size({'width':1600,'height':1000});p.wait_for_timeout(120);home_fit(p,'1600x1000')
  PHASE='rn-parentage';open_process(p,'RN-01');root=p.locator('#monitoringView');frame=root.locator(':scope > .procedure-frame');rail=root.locator(':scope > .procedure-support-rail');expect(frame).to_have_count(1);expect(rail).to_have_count(1);assert frame.evaluate('(f,r)=>f.nextElementSibling===r',rail.element_handle());assert rail.evaluate('(r)=>r.parentElement===document.querySelector("#monitoringView")')
  PHASE='rn-jobs';reg=root.locator(':scope > [data-rn-monitoring-secondary][data-a6-registry="monitoring"]');expect(reg).to_have_attribute('open','');expect(reg.locator(':scope > summary')).to_contain_text('Job di mining');expect(reg.locator('#missionsList')).to_be_visible();assert reg.locator('#missionsList .mission-card,#missionsList .empty').count()>0
  PHASE='admin-ai';p.locator('.service-nav [data-service="home"]').click();open_profile(p);p.locator('#openSettings').click();admin=p.locator('#adminCenter');expect(admin).to_be_visible();expect(admin).to_have_attribute('data-admin-view','ai');expect(admin.locator('#adminAiSettingsMount > #settingsForm')).to_have_count(1);assert not p.locator('#settingsDialog').evaluate('d=>d.open')
  PHASE='policy-disable';admin.locator('[data-admin-close]').click();save_policy(p,'coverage',False);p.locator('.service-nav [data-service="processes"]').click();expect(p.locator('#procedureHub .procedure-card')).to_have_count(6);expect(p.locator('#procedureHub [data-process-code="MC-01"]')).to_have_count(0);boot=p.evaluate("async()=>await (await fetch('/api/bootstrap')).json()");assert 'coverage' not in boot['experience']['procedurePolicy']['enabled']
  PHASE='policy-restore';save_policy(p,'coverage',True);p.locator('.service-nav [data-service="processes"]').click();expect(p.locator('#procedureHub .procedure-card')).to_have_count(7);expect(p.locator('#procedureHub [data-process-code="MC-01"]')).to_have_count(1)
  PHASE='standard-closed';open_process(p,'MC-01');btn=p.locator('[data-framework-card="iso-iec-27001-2022"] [data-open-standard-browser]');expect(btn).to_be_visible();btn.click();dlg=p.locator('#standardBrowserDialog');expect(dlg).to_be_visible();master=dlg.locator('[data-standard-nodes]');detail=dlg.locator('[data-standard-detail]');expect(master).to_be_visible();expect(detail).to_be_visible();mb=master.bounding_box();db=detail.bounding_box();assert mb and db and mb['width']<=300 and db['width']>mb['width'],(mb,db);nodes=master.locator('[data-standard-node-select]');assert nodes.count()>=93;assert nodes.evaluate_all("xs=>xs.every(x=>!!x.querySelector('small')&&(x.querySelector('small').textContent||'').includes('focus ICTC'))");expect(detail.locator('[data-neutral-index="true"]')).to_be_visible();dlg.locator('button[aria-label="Chiudi"]').click()
  PHASE='standard-public';g=p.locator('[data-framework-card="eu-gdpr-2016-679"] [data-open-standard-browser]');g.click();expect(dlg).to_be_visible();origin=dlg.locator('[data-standard-content-origin]').first.get_attribute('data-standard-content-origin');boundary=(dlg.locator('[data-standard-boundary]').inner_text() or '').lower()
  if origin=='official-public-text':expect(dlg.locator('.standard-official-text')).to_be_visible()
  else:assert 'pack completo' in boundary and 'testo ufficiale' in boundary,boundary
  dlg.locator('button[aria-label="Chiudi"]').click()
  result={'ok':True,'suite':'ui-runtime-intent-convergence','homeFit':['1280x900','1600x1000'],'supportRailSibling':True,'aiState':expected_state,'aiTone':expected_tone,'adminAiEmbedded':True,'procedurePolicyDisableReadback':True,'rnJobsVisible':True,'standardClosedNeutralIndex':True,'publicExactTextGate':True,'claimBoundary':'Live browser/runtime evidence on an isolated local runtime; not human usability research, deployment assurance or independent assurance.'};(ART/'browser-ui-runtime-intent-convergence.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf8');print(json.dumps(result,ensure_ascii=False));ctx.close();browser.close()
except Exception as e:
 out={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};(ART/'browser-ui-runtime-intent-convergence-error.json').write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf8');print(json.dumps(out,ensure_ascii=False));raise
