import json, os, pathlib, re, traceback
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4866').rstrip('/')
RESULTS=[]; PHASE='init'
def mark(x):
    global PHASE; PHASE=x
def rgb(value):
    value=value.strip()
    if re.fullmatch(r'#[0-9a-fA-F]{6}',value): return [int(value[i:i+2],16)/255 for i in (1,3,5)]
    nums=[float(x) for x in re.findall(r'[\d.]+',value)[:3]]
    if len(nums)!=3: raise AssertionError(('unparseable-color',value))
    return [x/255 for x in nums]
def lum(value):
    vals=rgb(value); f=lambda x:x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4
    return .2126*f(vals[0])+.7152*f(vals[1])+.0722*f(vals[2])
def contrast(a,b):
    x,y=lum(a),lum(b); return (max(x,y)+.05)/(min(x,y)+.05)
def run(browser,w,h,label):
    mark(label+'-context'); ctx=browser.new_context(viewport={'width':w,'height':h})
    ctx.add_init_script("try{localStorage.setItem('ictc-role','user');localStorage.setItem('ictc-service','home')}catch{}")
    p=ctx.new_page(); p.set_default_timeout(30000); mark(label+'-load'); p.goto(BASE+'/',wait_until='networkidle')
    p.wait_for_function("()=>document.documentElement.dataset.workspaceChrome==='3.3'")
    p.wait_for_function("()=>getComputedStyle(document.querySelector('.topbar')).backgroundImage.includes('linear-gradient')")
    expect(p.locator('.topbar')).to_be_visible(); expect(p.locator('#stableLegalFooter')).to_be_visible()
    mark(label+'-palette')
    data=p.evaluate(r"""async()=>{
      const frame=()=>new Promise(r=>requestAnimationFrame(r)); await frame(); await frame();
      const root=getComputedStyle(document.documentElement), h=document.querySelector('.topbar'), f=document.querySelector('#stableLegalFooter');
      const hs=getComputedStyle(h),fs=getComputedStyle(f),fr=f.getBoundingClientRect(),bs=getComputedStyle(document.body),rs=getComputedStyle(document.documentElement),px=v=>parseFloat(v)||0;
      const v=n=>root.getPropertyValue(n).trim();
      return {headerImage:hs.backgroundImage,footerImage:fs.backgroundImage,headerColor:hs.color,footerColor:fs.color,
        header:[v('--chrome-header-start'),v('--chrome-header-mid'),v('--chrome-header-end')],footer:[v('--chrome-footer-start'),v('--chrome-footer-mid'),v('--chrome-footer-end')],on:v('--chrome-on-dark'),muted:v('--chrome-on-dark-muted'),
        position:fs.position,footerBottom:fr.bottom,footerHeight:fr.height,viewportHeight:innerHeight,bodyPaddingBottom:px(bs.paddingBottom),scrollPaddingBottom:px(rs.scrollPaddingBottom),docWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth};
    }""")
    assert 'linear-gradient' in data['headerImage'],data
    assert 'linear-gradient' in data['footerImage'],data
    for i in range(3): assert lum(data['footer'][i]) < lum(data['header'][i]),data
    for bg in data['header']+data['footer']:
        assert contrast(data['on'],bg)>=4.5,(data['on'],bg,contrast(data['on'],bg))
        assert contrast(data['muted'],bg)>=4.5,(data['muted'],bg,contrast(data['muted'],bg))
    assert data['position']=='fixed',data
    assert abs(data['footerBottom']-data['viewportHeight'])<=1.5,data
    assert abs(data['bodyPaddingBottom']-data['footerHeight'])<=1.5,data
    assert abs(data['scrollPaddingBottom']-data['footerHeight'])<=1.5,data
    assert data['docWidth']<=data['viewportWidth']+2,data
    RESULTS.append({'case':label,**data,'minOnDarkContrast':min(contrast(data['on'],x) for x in data['header']+data['footer']),'minMutedContrast':min(contrast(data['muted'],x) for x in data['header']+data['footer'])})
    p.screenshot(path=str(ART/f'browser-s4-a6-ux2-chrome-palette-{label}.png'),full_page=False); ctx.close()
try:
    with sync_playwright() as pw:
        opts={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): opts['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**opts)
        for w,h,label in [(1440,950,'desktop-1440'),(390,844,'mobile-390'),(320,800,'mobile-320')]: run(browser,w,h,label)
        out={'ok':True,'slice':'S4-A6','executionUnit':'A6-UX2','viewports':len(RESULTS),'results':RESULTS,'claimBoundary':'Exact-head automated Chromium palette, contrast math and UX1 geometry evidence only; not human aesthetic preference, WCAG certification, production effectiveness or independent assurance.'}
        (ART/'browser-s4-a6-ux2-chrome-palette.json').write_text(json.dumps(out,indent=2,ensure_ascii=False),encoding='utf8'); print(json.dumps({'ok':True,'executionUnit':'A6-UX2','viewports':len(RESULTS)})); browser.close()
except BaseException as exc:
    payload={'ok':False,'slice':'S4-A6','executionUnit':'A6-UX2','phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'results':RESULTS}
    (ART/'browser-s4-a6-ux2-chrome-palette-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8'); print(f'::error title=s4-a6-ux2-chrome-palette::{PHASE}: {type(exc).__name__}: {exc}',flush=True); raise
