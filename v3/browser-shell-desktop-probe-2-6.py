import os
from playwright.sync_api import expect,sync_playwright
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PROBE=os.environ.get('ICTC_DESKTOP_PROBE','nav')
with sync_playwright() as pw:
    launch={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
    browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
    page=ctx.new_page();page.set_default_timeout(30000);page.goto(BASE,wait_until='networkidle');page.wait_for_function("()=>document.documentElement.dataset.ictcExperienceEdition==='1.9-experience-candidate'")
    if PROBE=='nav':
        expect(page.locator('.service-nav > [data-service]')).to_have_count(3)
        assert page.locator('.stable-header-inner').bounding_box()['height']<=70
    elif PROBE=='profile':
        menu=page.locator('#stableProfileMenu');expect(menu).to_be_visible();expect(menu).to_contain_text('Amministratore');expect(menu).to_contain_text('Ruolo attivo')
    elif PROBE=='footer':
        footer=page.locator('#stableLegalFooter');expect(footer).to_be_visible();metric=footer.evaluate("e=>({pos:getComputedStyle(e).position,bottom:getComputedStyle(e).bottom,h:e.getBoundingClientRect().height,pad:parseFloat(getComputedStyle(document.body).paddingBottom)||0,z:getComputedStyle(e).zIndex})");assert metric['pos']=='fixed' and metric['bottom']=='0px' and metric['pad']>=metric['h']-1,metric
    else: raise SystemExit(f'unknown probe {PROBE}')
    print({'ok':True,'probe':PROBE});ctx.close();browser.close()
