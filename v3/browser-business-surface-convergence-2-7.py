import json,os,pathlib,traceback
from playwright.sync_api import expect,sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1];ART=ROOT/'artifacts';ART.mkdir(exist_ok=True);BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/');DEMO=os.environ.get('ICTC_EXPECT_DEMO','0')=='1';MODE='demo' if DEMO else 'standard';PHASE='init'
IDS=['monitoring','incidents','objects','coverage','actions','risks','assurance']
def no_overflow(page,label):
 m=page.evaluate('()=>({inner:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth})');assert max(m['doc'],m['body'])<=m['inner']+1,(label,m)
def assert_target(locator,label):
 box=locator.bounding_box();assert box and box['height']>=43.5,(label,box)
def goto_processes(page):
 page.locator('.service-nav [data-service="processes"]').click();expect(page.locator('#processesView')).to_be_visible();expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)
def enter_procedure(page,pid):
 goto_processes(page);card=page.locator(f'#procedureHub .procedure-card[data-procedure-id="{pid}"]');expect(card).to_be_visible();entry=card.locator('.procedure-primary');assert_target(entry,f'{pid}-hub-entry');entry.click();copy={'monitoring':'#monitoringView','incidents':'#incidentsView'}.get(pid,'#grcWorkspace');expect(page.locator(copy)).to_be_visible();return page.locator(f'[data-procedure-primary="{pid}"]')
def light_blue(page,selector):
 rgb=page.locator(selector).evaluate("e=>getComputedStyle(e).backgroundColor.match(/\\d+/g).slice(0,3).map(Number)");return min(rgb)>=200 and rgb[2]>=rgb[0]-10
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']};
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')");p=ctx.new_page();p.set_default_timeout(30000);p.goto(BASE,wait_until='networkidle');p.wait_for_function("()=>document.documentElement.dataset.businessSurfaceConvergence==='2.7.0'")
  PHASE='navigation';expect(p.locator('.service-nav [data-service="home"]')).to_have_text('Home');expect(p.locator('.service-nav [data-service="proof"]')).to_have_text('Evidenze ICTC');assert p.locator('.service-nav').get_by_text('Oggi',exact=True).count()==0;assert p.locator('.service-nav').get_by_text('Postura ICTC',exact=True).count()==0;assert light_blue(p,'.topbar');assert light_blue(p,'#stableLegalFooter')
  PHASE='home';expect(p.locator('#homeView')).to_be_visible();metrics=p.locator('#homePulse .home-business-metric');assert metrics.count()>=6,metrics.count();assert p.locator('#homePulse .metric-explain').count()>=6;expect(p.locator('#homeView')).not_to_contain_text('punteggio di conformità',use_inner_text=True);no_overflow(p,'home-desktop')
  PHASE='procedure-hub';goto_processes(p);cards=p.locator('#procedureHub .procedure-card');assert cards.count()==7
  for pid in IDS:
   card=p.locator(f'#procedureHub .procedure-card[data-procedure-id="{pid}"]');assert card.locator('h2,h3').count()==0,(pid,'heading inflation');assert card.locator(':scope > .procedure-purpose').count()==1,(pid,'purpose cardinality');expect(card.locator(':scope > .procedure-card-brief')).to_have_count(1);assert_target(card.locator('.procedure-primary'),f'{pid}-primary')
  PHASE='actions'
  for pid in IDS:
   primary=enter_procedure(p,pid);expect(primary).to_be_visible();assert_target(primary,f'{pid}-frame-primary');primary.click()
   if pid=='monitoring':expect(p.locator('#contributionDialog')).to_be_visible();p.locator('#contributionDialog [data-close="contributionDialog"]').click()
   elif pid=='incidents':expect(p.locator('#incidentDialog')).to_be_visible();p.locator('#incidentDialog [data-close="incidentDialog"]').click()
   else:
    disclosure=p.locator('#grcPrimaryForm');expect(disclosure).to_be_visible();assert disclosure.evaluate('e=>e.open===true'),pid
  PHASE='record-cards'
  if DEMO:
   for pid in IDS:
    enter_procedure(p,pid)
    selector='#grcWorkspace .grc-list > article' if pid not in ['monitoring','incidents'] else ('#missionsList > article, #catalogList > article' if pid=='monitoring' else '#incidentList > article')
    records=p.locator(selector);count=records.count()
    if count: assert records.evaluate_all("els=>els.every(e=>e.dataset.canonicalRecordCard==='2.7')"),(pid,count)
  PHASE='evidence-tabs';p.locator('.service-nav [data-service="proof"]').click();expect(p.locator('#proofView')).to_be_visible();p.wait_for_selector('#proofContent:not([hidden])');tabs=p.locator('#proofView [data-proof-tab]');assert tabs.count()==6,tabs.count();expect(p.locator('#proofTitle')).to_have_text('Evidenze ICTC')
  for key in ['summary','decisions','runtime','deployment','standards','export']:
   p.locator(f'[data-proof-tab="{key}"]').click();expect(p.locator(f'[data-proof-panel="{key}"]')).to_be_visible();assert p.locator('#proofView [data-proof-panel]:visible').count()==1,key
  PHASE='incident-acceptance'
  if DEMO:
   enter_procedure(p,'incidents');opens=p.locator('#incidentList [data-open-incident]')
   if opens.count():
    opens.first.click();expect(p.locator('#incidentWorkspace')).to_be_visible();acceptance=p.locator('#incidentWorkspace .confirm-row')
    if acceptance.count(): expect(acceptance).to_have_attribute('data-incident-acceptance','2.7');expect(acceptance).to_contain_text('non anticipi conclusioni legali')
  PHASE='mobile';mctx=browser.new_context(viewport={'width':390,'height':844});mctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')");m=mctx.new_page();m.set_default_timeout(30000);m.goto(BASE,wait_until='networkidle');m.wait_for_function("()=>document.documentElement.dataset.businessSurfaceConvergence==='2.7.0'");no_overflow(m,'home-390');expect(m.locator('#homePulse .home-business-metric')).to_have_count(6);goto_processes(m);no_overflow(m,'processes-390');m.locator('.service-nav [data-service="proof"]').click();expect(m.locator('#proofView')).to_be_visible();no_overflow(m,'evidence-390');m.screenshot(path=str(ART/f'business-surface-convergence-2-7-{MODE}.png'),full_page=True);mctx.close()
  out={'ok':True,'profile':'business-surface-convergence-2.7','mode':MODE,'homeMetrics':metrics.count(),'procedureCards':cards.count(),'evidenceTabs':tabs.count(),'actionsProbed':len(IDS),'mobileWidth':390,'claimBoundary':'Server-backed browser evidence of structure, action reachability and responsive geometry; not human usability research, legal compliance, certification or universal aesthetic proof.'};(ART/f'browser-business-surface-convergence-2-7-{MODE}.json').write_text(json.dumps(out,indent=2,ensure_ascii=False));print(json.dumps(out,ensure_ascii=False));ctx.close();browser.close()
except BaseException as exc:
 (ART/f'browser-business-surface-convergence-2-7-{MODE}-error.json').write_text(json.dumps({'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc()},indent=2,ensure_ascii=False));raise
