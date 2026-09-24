import argparse, base64, hashlib, io, json, os, sys
from playwright.sync_api import expect, sync_playwright
from PIL import Image

BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4841').rstrip('/')
SURFACES={
 'home':('home',None,'#homeView'),
 'processes':('processes',None,'#processesView'),
 'monitoring':('monitoring',None,'#monitoringView'),
 'incidents':('incidents',None,'#incidentsView'),
 'objects':('grc','objects','#grcWorkspace'),
 'coverage':('grc','coverage','#grcWorkspace'),
 'actions':('grc','actions','#grcWorkspace'),
 'risks':('grc','risks','#grcWorkspace'),
 'assurance':('grc','assurance','#grcWorkspace'),
 'proof':('proof',None,'#proofView'),
 'epistemic':('epistemic',None,'#epistemicView'),
 'admin-overview':('admin','overview','#adminCenter'),
 'admin-ai':('admin','ai','#adminCenter'),
 'admin-identity':('admin','identity','#adminCenter')
}

def mount(page,surface):
    view,procedure,root=SURFACES[surface]
    if view=='grc':
        page.goto(f'{BASE}/?view=grc&procedure={procedure}',wait_until='networkidle')
        expect(page.locator('#grcView')).to_be_visible()
        page.wait_for_function('p=>document.querySelector("#grcWorkspace")?.dataset.compositionSurface===p',arg=procedure)
    elif view=='admin':
        page.goto(f'{BASE}/?view=home',wait_until='networkidle')
        menu=page.locator('#stableProfileMenu');expect(menu).to_be_visible()
        if menu.get_attribute('open') is None:menu.locator(':scope > summary').click()
        page.locator('#openAdminCenter').click();expect(page.locator('#adminCenter')).to_be_visible()
        if procedure!='overview':
            page.locator(f'#adminCenter [data-admin-nav="{procedure}"]').click()
            expect(page.locator(f'#adminCenter [data-admin-view="{procedure}"]')).to_be_visible()
        page.wait_for_timeout(250)
    elif view=='epistemic':
        page.goto(f'{BASE}/?view=proof',wait_until='networkidle');expect(page.locator('#proofView')).to_be_visible()
        detail=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]');expect(detail).to_have_count(1)
        if detail.get_attribute('open') is None:detail.locator(':scope > summary').click()
        detail.locator('[data-service="epistemic"]').click();expect(page.locator('#epistemicView')).to_be_visible()
    else:
        page.goto(f'{BASE}/?view={view}',wait_until='networkidle');expect(page.locator(root)).to_be_visible()
    page.wait_for_function('()=>document.documentElement.dataset.enduserComposition==="p2"')
    if surface=='proof':
        first=page.locator('#proofContent > details.proof-section').first
        if first.count() and first.get_attribute('open') is None:first.locator(':scope > summary').click()
        page.wait_for_timeout(200)
    return root

def compress(raw):
    im=Image.open(io.BytesIO(raw)).convert('RGB')
    if im.width>1100:
        h=round(im.height*1100/im.width);im=im.resize((1100,h),Image.Resampling.LANCZOS)
    for q in (48,42,36,30):
        out=io.BytesIO();im.save(out,format='JPEG',quality=q,optimize=True,progressive=True)
        data=out.getvalue()
        if len(data)<=300000:return data,im.width,im.height,q
    return data,im.width,im.height,q

def annotate(surface,data,w,h,q):
    enc=base64.b64encode(data).decode('ascii');chunk=48000
    parts=[enc[i:i+chunk] for i in range(0,len(enc),chunk)]
    meta={'surface':surface,'bytes':len(data),'width':w,'height':h,'quality':q,'sha256':hashlib.sha256(data).hexdigest(),'chunks':len(parts)}
    print(f"::notice title=ICTC_SCREENSHOT_META_{surface}::{json.dumps(meta,separators=(',',':'))}",flush=True)
    for i,part in enumerate(parts,1):
        print(f"::notice title=ICTC_SCREENSHOT_{surface}_{i:02d}_OF_{len(parts):02d}::{part}",flush=True)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('surface',choices=sorted(SURFACES));args=ap.parse_args()
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        ctx=browser.new_context(viewport={'width':1440,'height':1000})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
        page=ctx.new_page();page.set_default_timeout(30000)
        root=mount(page,args.surface)
        raw=page.screenshot(full_page=True,type='jpeg',quality=70)
        data,w,h,q=compress(raw);annotate(args.surface,data,w,h,q)
        print(json.dumps({'ok':True,'surface':args.surface,'root':root,'bytes':len(data),'width':w,'height':h,'quality':q}),flush=True)
        ctx.close();browser.close()
if __name__=='__main__':main()
