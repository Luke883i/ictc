import os
from playwright.sync_api import expect,sync_playwright
from browser_test_support import ensure_onboarded
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/');DEMO=os.environ.get('ICTC_EXPECT_DEMO','0')=='1';PROBE=os.environ.get('ICTC_BROWSER_PROBE','desktop')
def load(p):p.goto(BASE,wait_until='networkidle');ensure_onboarded(p,BASE,'admin');p.wait_for_function("()=>document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&!!document.querySelector('#stableProfileMenu')")
def footer_effect(p):
 m=p.evaluate("""()=>{const f=document.querySelector('#stableLegalFooter'),main=document.querySelector('main');if(!f||!main)return{missing:true};const fr=f.getBoundingClientRect(),mr=main.getBoundingClientRect(),fs=getComputedStyle(f),bs=getComputedStyle(document.body),hs=getComputedStyle(document.documentElement),px=v=>parseFloat(v)||0,visible=e=>{const r=e.getBoundingClientRect(),st=getComputedStyle(e);return r.width>0&&r.height>0&&st.visibility!=='hidden'&&st.display!=='none'&&!e.disabled},controls=[...document.querySelectorAll('main button,main a[href],main input,main select,main textarea,main summary')].filter(visible),overlaps=controls.filter(e=>{const r=e.getBoundingClientRect();return Math.max(0,Math.min(r.bottom,fr.bottom)-Math.max(r.top,fr.top))*Math.max(0,Math.min(r.right,fr.right)-Math.max(r.left,fr.left))>.5}).length;return{missing:false,position:fs.position,footerTop:fr.top,footerBottom:fr.bottom,viewportHeight:innerHeight,mainBottom:mr.bottom,footerHeight:fr.height,bodyPaddingBottom:px(bs.paddingBottom),scrollPaddingBottom:px(hs.scrollPaddingBottom),overlaps}}""");assert not m.get('missing') and m['position']=='fixed' and m['footerHeight']>=43.5 and abs(m['footerBottom']-m['viewportHeight'])<=3 and m['bodyPaddingBottom']>=m['footerHeight']-2 and m['scrollPaddingBottom']>=m['footerHeight']-2 and m['overlaps']==0,m;return m
def open_admin(p):
 m=p.locator('#stableProfileMenu');expect(m).to_be_visible();m.locator(':scope > summary').click();b=p.locator('#stableProfileMenu #openAdminCenter');expect(b).to_be_visible();b.click();expect(p.locator('#adminCenter')).to_be_visible()
with sync_playwright() as pw:
 launch={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
 browser=pw.chromium.launch(**launch);w,h=(390,844) if PROBE=='mobile' else (1440,950);ctx=browser.new_context(viewport={'width':w,'height':h});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')");p=ctx.new_page();p.set_default_timeout(30000);load(p)
 if PROBE=='desktop':
  expect(p.locator('.service-nav > [data-service]')).to_have_count(3);expect(p.locator('#stableProfileMenu')).to_contain_text('Amministratore');expect(p.locator('#stableProfileMenu')).to_contain_text('Ruolo attivo');f=p.locator('#stableLegalFooter');expect(f).to_be_visible();footer_effect(p)
  if DEMO:
   c=p.locator('#ictcDemoCard');expect(c).to_be_visible();expect(c).to_contain_text('Suite 3.0');expect(p.locator('#ictcDemoBanner')).to_have_count(0);c.click();d=p.locator('#ictcDemoDialog');expect(d).to_be_visible();expect(d).to_contain_text('188 record business 3.0');expect(d).to_contain_text('512 fixture escluse');expect(d).to_contain_text('Evidence Lattice');expect(d).to_contain_text('Suite 2.2 deprecata');expect(d).to_contain_text('demo-suite-3-0');expect(d).to_contain_text('Dimostrazione, non verdetto');assert p.locator('html').get_attribute('data-ictc-demo-projection')=='demo-suite-3-0';assert p.locator('html').get_attribute('data-ictc-demo-suite')=='3.0'
  else:expect(p.locator('#ictcDemoCard')).to_have_count(0)
 elif PROBE=='admin':
  open_admin(p);a=p.locator('#adminCenter');expect(a.locator('[data-admin-nav]')).to_have_count(3);expect(a.locator('[data-admin-view]:visible')).to_have_count(1);a.locator('[data-admin-nav="ai"]').click();expect(a.locator('[data-admin-view="ai"]')).to_be_visible();a.locator('[data-admin-nav="identity"]').click();expect(a.locator('[data-admin-view="identity"]')).to_be_visible()
 elif PROBE=='procedures':
  p.locator('.service-nav [data-service="processes"]').click()
  hub=p.locator('#procedureHub')
  expect(hub).to_have_attribute('data-catalogue-item-count','9')
  expect(hub.locator('[data-procedure-id]')).to_have_count(7)
  expect(hub.locator('[data-catalogue-placeholder-id]')).to_have_count(2)
  entries=hub.locator(':scope > [data-process-code]').evaluate_all("els=>els.map(e=>[e.dataset.processCode,e.querySelector('[data-maturity]')?.dataset.maturity])")
  assert entries==[['OP-01','placeholder'],['OG-01','placeholder'],['MC-01','ready'],['RN-01','scaffold-yellow'],['AO-01','scaffold-yellow'],['EC-01','ready'],['AP-01','scaffold-yellow'],['RC-01','scaffold-yellow'],['AR-01','scaffold-orange']],entries
  assert hub.locator('[data-catalogue-placeholder-id] button,[data-catalogue-placeholder-id] a[href]').count()==0
 elif PROBE=='procedure-toggle':
  p.locator('.service-nav [data-service="processes"]').click()
  hub=p.locator('#procedureHub')
  expect(hub).to_have_attribute('data-catalogue-item-count','9')
  p.locator('.service-nav [data-service="home"]').click();open_admin(p)
  expect(p.locator('#procedurePolicyList input')).to_have_count(9)
  op=p.locator('#procedurePolicyList input[name="policy-documents"]')
  expect(op).to_be_checked();op.uncheck()
  p.locator('#procedurePolicyAcknowledge').check()
  p.locator('#procedurePolicyForm button[type="submit"]').click()
  expect(op).not_to_be_checked()
  p.locator('#adminCenter [data-admin-close]').click()
  p.locator('.service-nav [data-service="processes"]').click()
  expect(hub.locator('[data-catalogue-placeholder-id]')).to_have_count(1)
  assert hub.locator('[data-process-code="OP-01"]').count()==0
  assert hub.locator('[data-process-code="OG-01"]').count()==1
  expect(hub.locator('[data-procedure-id]')).to_have_count(7)
  p.locator('.service-nav [data-service="home"]').click();open_admin(p)
  op=p.locator('#procedurePolicyList input[name="policy-documents"]')
  expect(op).not_to_be_checked();op.check()
  p.locator('#procedurePolicyAcknowledge').check()
  p.locator('#procedurePolicyForm button[type="submit"]').click()
  expect(op).to_be_checked()
  p.locator('#adminCenter [data-admin-close]').click()
  p.locator('.service-nav [data-service="processes"]').click()
  expect(hub.locator('[data-catalogue-placeholder-id]')).to_have_count(2)
 elif PROBE=='mobile':
  m=p.evaluate('()=>({w:innerWidth,h:document.documentElement.scrollWidth,b:document.body.scrollWidth,header:document.querySelector(".stable-header-inner")?.getBoundingClientRect().height||0})');assert max(m['h'],m['b'])<=m['w']+1,m;assert m['header']<=112,m;open_admin(p);m=p.evaluate('()=>({w:innerWidth,h:document.documentElement.scrollWidth,b:document.body.scrollWidth})');assert max(m['h'],m['b'])<=m['w']+1,m
 else:raise SystemExit(f'unknown probe {PROBE}')
 print({'ok':True,'probe':PROBE,'demo':DEMO,'demoProjectionAuthority':'demo-suite-3-0' if DEMO else None});ctx.close();browser.close()
