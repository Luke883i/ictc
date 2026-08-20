import json,os,urllib.request
from playwright.sync_api import expect,sync_playwright
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PROBE=os.environ.get('ICTC_DESKTOP_PROBE','nav')
def publish_footer_metric(metric):
    token=os.environ.get('GH_TOKEN','');repo=os.environ.get('GITHUB_REPOSITORY','');sha=os.environ.get('HEAD_SHA','')
    if not token or not repo or len(sha)!=40:return
    pos=str(metric.get('pos','na')).replace('/','-');bottom=str(metric.get('bottom','na')).replace('px','');h=round(float(metric.get('h') or 0));pad=round(float(metric.get('pad') or 0))
    context=f'ictc/footer-metric-pos-{pos}-bottom-{bottom}-h-{h}-pad-{pad}'[:100]
    payload=json.dumps({'state':'success','context':context,'description':'diagnostic footer geometry only'}).encode()
    req=urllib.request.Request(f'https://api.github.com/repos/{repo}/statuses/{sha}',data=payload,method='POST',headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=20) as response: response.read()
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
        footer=page.locator('#stableLegalFooter');expect(footer).to_be_visible();metric=footer.evaluate("e=>({pos:getComputedStyle(e).position,bottom:getComputedStyle(e).bottom,h:e.getBoundingClientRect().height,pad:parseFloat(getComputedStyle(document.body).paddingBottom)||0})");print({'footerMetric':metric});publish_footer_metric(metric);assert metric['pos']=='fixed' and metric['bottom']=='0px' and metric['pad']>=metric['h']-1,metric
    else: raise SystemExit(f'unknown probe {PROBE}')
    print({'ok':True,'probe':PROBE});ctx.close();browser.close()
