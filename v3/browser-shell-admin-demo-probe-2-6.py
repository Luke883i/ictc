import os
from playwright.sync_api import expect,sync_playwright
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/');DEMO=os.environ.get('ICTC_EXPECT_DEMO','0')=='1';PROBE=os.environ.get('ICTC_BROWSER_PROBE','desktop')
def load(p):p.goto(BASE,wait_until='networkidle');p.wait_for_function("()=>document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&!!document.querySelector('#stableProfileMenu')")
def open_admin(p):
 m=p.locator('#stableProfileMenu');expect(m).to_be_visible();m.locator(':scope > summary').click();b=p.locator('#stableProfileMenu #openAdminCenter');expect(b).to_be_visible();b.click();expect(p.locator('#adminCenter')).to_be_visible()
with sync_playwright() as pw:
 launch={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
 browser=pw.chromium.launch(**launch);w,h=(390,844) if PROBE=='mobile' else (1440,950);ctx=browser.new_context(viewport={'width':w,'height':h});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')");p=ctx.new_page();p.set_default_timeout(30000);load(p)
 if PROBE=='desktop':
  expect(p.locator('.service-nav > [data-service]')).to_have_count(3);expect(p.locator('#stableProfileMenu')).to_contain_text('Amministratore');expect(p.locator('#stableProfileMenu')).to_contain_text('Ruolo attivo');f=p.locator('#stableLegalFooter');expect(f).to_be_visible();m=f.evaluate("e=>({pos:getComputedStyle(e).position,bottom:getComputedStyle(e).bottom,h:e.getBoundingClientRect().height,pad:parseFloat(getComputedStyle(document.body).paddingBottom)||0})");assert m['pos']=='fixed' and m['bottom']=='0px' and m['pad']>=m['h']-1,m
  if DEMO:
   c=p.locator('#ictcDemoCard');expect(c).to_be_visible();expect(c).to_contain_text('Suite 2.2');expect(p.locator('#ictcDemoBanner')).to_have_count(0);c.click();d=p.locator('#ictcDemoDialog');expect(d).to_be_visible();expect(d).to_contain_text('188 record positivi');expect(d).to_contain_text('512 mutanti esclusi');expect(d).to_contain_text('demo-suite-2-2');expect(d).to_contain_text('Dimostrazione, non verdetto');assert p.locator('html').get_attribute('data-ictc-demo-projection')=='demo-suite-2-2'
  else:expect(p.locator('#ictcDemoCard')).to_have_count(0)
 elif PROBE=='admin':
  open_admin(p);a=p.locator('#adminCenter');expect(a.locator('[data-admin-nav]')).to_have_count(3);expect(a.locator('[data-admin-view]:visible')).to_have_count(1);a.locator('[data-admin-nav="ai"]').click();expect(a.locator('[data-admin-view="ai"]')).to_be_visible();a.locator('[data-admin-nav="identity"]').click();expect(a.locator('[data-admin-view="identity"]')).to_be_visible()
 elif PROBE=='procedures':p.locator('.service-nav [data-service="processes"]').click();expect(p.locator('#procedureHub [data-process-code]')).to_have_count(7);codes=p.locator('#procedureHub [data-process-code]').evaluate_all('els=>els.map(e=>e.dataset.processCode)');assert codes==['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01'],codes
 elif PROBE=='mobile':
  m=p.evaluate('()=>({w:innerWidth,h:document.documentElement.scrollWidth,b:document.body.scrollWidth,header:document.querySelector(".stable-header-inner")?.getBoundingClientRect().height||0})');assert max(m['h'],m['b'])<=m['w']+1,m;assert m['header']<=112,m;open_admin(p);m=p.evaluate('()=>({w:innerWidth,h:document.documentElement.scrollWidth,b:document.body.scrollWidth})');assert max(m['h'],m['b'])<=m['w']+1,m
 else:raise SystemExit(f'unknown probe {PROBE}')
 print({'ok':True,'probe':PROBE,'demo':DEMO,'demoProjectionAuthority':'demo-suite-2-2' if DEMO else None});ctx.close();browser.close()
