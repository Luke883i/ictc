import os,sys
from playwright.sync_api import expect,sync_playwright
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
DEMO=os.environ.get('ICTC_EXPECT_DEMO','0')=='1'
PROBE=os.environ.get('ICTC_BROWSER_PROBE','desktop')

def load(page):
    page.goto(BASE,wait_until='networkidle')
    page.wait_for_function("()=>document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&!!document.querySelector('#stableProfileMenu')")

def open_admin(page):
    menu=page.locator('#stableProfileMenu');expect(menu).to_be_visible();menu.locator(':scope > summary').click()
    button=page.locator('#stableProfileMenu #openAdminCenter');expect(button).to_be_visible();button.click();expect(page.locator('#adminCenter')).to_be_visible()

with sync_playwright() as pw:
    launch={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
    browser=pw.chromium.launch(**launch)
    width,height=(390,844) if PROBE=='mobile' else (1440,950)
    ctx=browser.new_context(viewport={'width':width,'height':height})
    ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
    page=ctx.new_page();page.set_default_timeout(30000);load(page)
    if PROBE=='desktop':
        expect(page.locator('.service-nav > [data-service]')).to_have_count(3)
        expect(page.locator('#stableProfileMenu')).to_contain_text('Amministratore')
        expect(page.locator('#stableProfileMenu')).to_contain_text('Ruolo attivo')
        footer=page.locator('#stableLegalFooter');expect(footer).to_be_visible()
        metric=footer.evaluate("e=>({pos:getComputedStyle(e).position,bottom:getComputedStyle(e).bottom,h:e.getBoundingClientRect().height,pad:parseFloat(getComputedStyle(document.body).paddingBottom)||0})")
        assert metric['pos']=='fixed' and metric['bottom']=='0px' and metric['pad']>=metric['h']-1,metric
        if DEMO:
            card=page.locator('#ictcDemoCard');expect(card).to_be_visible();expect(page.locator('#ictcDemoBanner')).to_have_count(0);card.click();dialog=page.locator('#ictcDemoDialog');expect(dialog).to_be_visible();expect(dialog).to_contain_text('Scheduler disabilitato');expect(dialog).to_contain_text('Dimostrazione, non verdetto')
        else: expect(page.locator('#ictcDemoCard')).to_have_count(0)
    elif PROBE=='admin':
        open_admin(page);admin=page.locator('#adminCenter');expect(admin.locator('[data-admin-nav]')).to_have_count(3);expect(admin.locator('[data-admin-view]:visible')).to_have_count(1);admin.locator('[data-admin-nav="ai"]').click();expect(admin.locator('[data-admin-view="ai"]')).to_be_visible();admin.locator('[data-admin-nav="identity"]').click();expect(admin.locator('[data-admin-view="identity"]')).to_be_visible()
    elif PROBE=='procedures':
        page.locator('.service-nav [data-service="processes"]').click();expect(page.locator('#procedureHub [data-process-code]')).to_have_count(7);codes=page.locator('#procedureHub [data-process-code]').evaluate_all('els=>els.map(e=>e.dataset.processCode)');assert codes==['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01'],codes
    elif PROBE=='mobile':
        metric=page.evaluate('()=>({w:innerWidth,h:document.documentElement.scrollWidth,b:document.body.scrollWidth,header:document.querySelector(".stable-header-inner")?.getBoundingClientRect().height||0})');assert max(metric['h'],metric['b'])<=metric['w']+1,metric;assert metric['header']<=112,metric;open_admin(page);metric=page.evaluate('()=>({w:innerWidth,h:document.documentElement.scrollWidth,b:document.body.scrollWidth})');assert max(metric['h'],metric['b'])<=metric['w']+1,metric
    else: raise SystemExit(f'unknown probe {PROBE}')
    print({'ok':True,'probe':PROBE,'demo':DEMO});ctx.close();browser.close()
