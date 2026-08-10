import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')

def snapshot(page):
    return page.evaluate("""()=>{
      const q=s=>document.querySelector(s), info=e=>{
        if(!e)return null;
        const s=getComputedStyle(e),r=e.getBoundingClientRect();
        return {tag:e.tagName,className:e.className,hidden:e.hidden,ariaHidden:e.getAttribute('aria-hidden'),display:s.display,visibility:s.visibility,opacity:s.opacity,position:s.position,width:r.width,height:r.height,x:r.x,y:r.y,innerText:e.innerText,textContent:e.textContent,outerHTML:e.outerHTML.slice(0,1800)};
      };
      const view=q('main > .view:not([hidden])'),frame=view?.querySelector('.procedure-frame'),main=frame?.querySelector('.procedure-frame-main'),copy=frame?.querySelector('.procedure-frame-copy'),operate=frame?.querySelector('.procedure-frame-operate');
      return {surface:document.documentElement.dataset.ictcSurface,activeView:view?.id||null,frame:info(frame),main:info(main),copy:info(copy),operate:info(operate),allVisibleFrames:[...document.querySelectorAll('.procedure-frame')].filter(e=>e.getClientRects().length).map(e=>({parent:e.parentElement?.id||e.parentElement?.className,text:e.innerText,html:e.outerHTML.slice(0,900)}))};
    }""")

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        ctx=browser.new_context(viewport={'width':390,'height':844})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
        page=ctx.new_page(); page.set_default_timeout(30000)
        page.goto(BASE+'/?view=home',wait_until='networkidle')
        page.locator('.service-nav [data-service="processes"]').click()
        card=page.locator('#procedureHub [data-process-code="RN-01"]'); expect(card).to_be_visible(); card.locator(':scope > footer .primary').click()
        page.wait_for_timeout(500)
        diag=snapshot(page)
        print('::error title=mobile-frame-probe::'+json.dumps(diag,ensure_ascii=False,separators=(',',':')),flush=True)
        raise AssertionError('mobile-frame-probe-intentional-failure')
except BaseException:
    traceback.print_exc(); raise
