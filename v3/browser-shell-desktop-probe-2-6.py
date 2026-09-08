import os
from playwright.sync_api import expect,sync_playwright
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PROBE=os.environ.get('ICTC_DESKTOP_PROBE','nav')
def footer_effect(page):
    metric=page.evaluate("""()=>{const f=document.querySelector('#stableLegalFooter'),main=document.querySelector('main');if(!f||!main)return{missing:true};const fr=f.getBoundingClientRect(),mr=main.getBoundingClientRect(),visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'},controls=[...document.querySelectorAll('main button,main a[href],main input,main select,main textarea,main summary')].filter(visible),overlaps=controls.filter(e=>{const r=e.getBoundingClientRect();return Math.max(0,Math.min(r.bottom,fr.bottom)-Math.max(r.top,fr.top))*Math.max(0,Math.min(r.right,fr.right)-Math.max(r.left,fr.left))>0}).length;return{missing:false,footerTopDoc:fr.top+scrollY,mainBottomDoc:mr.bottom+scrollY,footerHeight:fr.height,overlaps}}""")
    assert not metric.get('missing') and metric['footerHeight']>0 and metric['footerTopDoc']>=metric['mainBottomDoc']-1 and metric['overlaps']==0,metric
    return metric
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
        footer=page.locator('#stableLegalFooter');expect(footer).to_be_visible();footer_effect(page)
    else: raise SystemExit(f'unknown probe {PROBE}')
    print({'ok':True,'probe':PROBE});ctx.close();browser.close()
