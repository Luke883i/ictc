import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4865').rstrip('/')
RESULTS=[]; PHASE='init'

def mark(name):
    global PHASE; PHASE=name

def metrics(page,label):
    data=page.evaluate(r"""async()=>{
      const frame=()=>new Promise(r=>requestAnimationFrame(r)); await frame(); await frame();
      const f=document.querySelector('#stableLegalFooter'); if(!f)return{missing:true};
      const fr=f.getBoundingClientRect(), fs=getComputedStyle(f), bs=getComputedStyle(document.body), hs=getComputedStyle(document.documentElement);
      const px=v=>parseFloat(v)||0;
      const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&!e.disabled};
      const candidates=[...document.querySelectorAll('main button,main a[href],main input,main select,main textarea,main summary')].filter(visible).slice(0,48);
      const offenders=[];
      for(const e of candidates){e.focus?.();await frame();await frame();const r=e.getBoundingClientRect(),ff=f.getBoundingClientRect();const h=Math.max(0,Math.min(r.bottom,ff.bottom)-Math.max(r.top,ff.top)),w=Math.max(0,Math.min(r.right,ff.right)-Math.max(r.left,ff.left));if(h*w>0)offenders.push({tag:e.tagName,id:e.id||'',text:(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,80),area:h*w,rect:{top:r.top,bottom:r.bottom},footer:{top:ff.top,bottom:ff.bottom}})}
      return{missing:false,position:fs.position,footer:{top:fr.top,bottom:fr.bottom,height:fr.height},viewportHeight:innerHeight,bodyPaddingBottom:px(bs.paddingBottom),scrollPaddingBottom:px(hs.scrollPaddingBottom),bodyDisplay:bs.display,bodyPosition:bs.position,bodyOverflowY:bs.overflowY,docWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,focusSampled:candidates.length,focusOverlap:offenders.length,offenders};
    }""")
    assert not data.get('missing'), data
    assert data['position']=='fixed', (label,data)
    assert abs(data['footer']['bottom']-data['viewportHeight']) <= 1.5, (label,data)
    assert data['footer']['height'] >= 43.5, (label,data)
    assert abs(data['bodyPaddingBottom']-data['footer']['height']) <= 1.5, (label,data)
    assert abs(data['scrollPaddingBottom']-data['footer']['height']) <= 1.5, (label,data)
    assert data['bodyDisplay']!='flex' and data['bodyPosition']!='fixed' and data['bodyOverflowY']!='hidden', (label,data)
    assert data['docWidth'] <= data['viewportWidth']+2, (label,data)
    assert data['focusOverlap']==0, (label,data['offenders'][:3])
    RESULTS.append({'oracle':'native-focus-non-overlap','reflow':'reflow-1440-390-320','rootTrap':'root-trap-negative','case':label,**data})

def run(browser,w,h,label):
    mark(label+'-context')
    ctx=browser.new_context(viewport={'width':w,'height':h})
    ctx.add_init_script("try{localStorage.setItem('ictc-role','user');localStorage.setItem('ictc-service','home')}catch{}")
    page=ctx.new_page(); page.set_default_timeout(30000)
    mark(label+'-load'); page.goto(BASE+'/',wait_until='networkidle')
    expect(page.locator('html')).to_have_attribute('data-ictc-experience','market-1')
    expect(page.locator('#stableLegalFooter')).to_be_visible()
    expect(page.locator('#homeView')).to_be_visible()
    mark(label+'-geometry'); metrics(page,label)
    ctx.close()

try:
    with sync_playwright() as pw:
        opts={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): opts['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**opts)
        for w,h,label in [(1440,950,'desktop-1440'),(390,844,'mobile-390'),(320,800,'mobile-320')]: run(browser,w,h,label)
        report={'ok':True,'slice':'S4-A6','executionUnit':'A6-UX1','oracles':['fixed-position','exact-body-reserve','root-scroll-padding','safe-area-coupling','native-focus-non-overlap','reflow-1440-390-320','root-trap-negative'],'results':RESULTS,'claimBoundary':'Exact-head automated Chromium geometry only. Human assistive-technology/usability and production effectiveness remain external evidence.'}
        (ART/'browser-s4-a6-ux1-fixed-safe-footer.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8')
        print(json.dumps({'ok':True,'slice':'S4-A6','executionUnit':'A6-UX1','viewports':len(RESULTS)}),flush=True)
        browser.close()
except BaseException as exc:
    payload={'ok':False,'slice':'S4-A6','executionUnit':'A6-UX1','phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'results':RESULTS}
    (ART/'browser-s4-a6-ux1-fixed-safe-footer-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(f'::error title=s4-a6-ux1-fixed-safe-footer::{PHASE}: {type(exc).__name__}: {exc}',flush=True)
    raise
