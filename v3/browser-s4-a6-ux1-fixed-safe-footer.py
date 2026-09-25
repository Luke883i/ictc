import json,os,pathlib,traceback
from playwright.sync_api import expect,sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1];ART=ROOT/'artifacts';ART.mkdir(exist_ok=True);BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4865').rstrip('/');RESULTS=[];PHASE='init'
def mark(x):
 global PHASE;PHASE=x
def metrics(page,label):
 data=page.evaluate("""async()=>{const raf=()=>new Promise(r=>requestAnimationFrame(r));await raf();await raf();const f=document.querySelector('#stableLegalFooter'),m=document.querySelector('main');if(!f||!m)return{missing:true};const fr=f.getBoundingClientRect(),mr=m.getBoundingClientRect(),fs=getComputedStyle(f),bs=getComputedStyle(document.body),hs=getComputedStyle(document.documentElement),visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&!e.disabled},controls=[...document.querySelectorAll('main button,main a[href],main input,main select,main textarea,main summary')].filter(visible).slice(0,48),off=[];for(const e of controls){e.focus?.();await raf();const r=e.getBoundingClientRect(),q=f.getBoundingClientRect(),h=Math.max(0,Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top)),w=Math.max(0,Math.min(r.right,q.right)-Math.max(r.left,q.left));if(h*w>0)off.push({tag:e.tagName,id:e.id||'',area:h*w})}return{missing:false,position:fs.position,footer:{top:fr.top,bottom:fr.bottom,height:fr.height},main:{top:mr.top,bottom:mr.bottom},bodyPaddingBottom:parseFloat(bs.paddingBottom)||0,scrollPaddingBottom:parseFloat(hs.scrollPaddingBottom)||0,bodyDisplay:bs.display,bodyPosition:bs.position,bodyOverflowY:bs.overflowY,docWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,viewportHeight:innerHeight,focusOverlap:off.length,offenders:off};}""")
 assert not data.get('missing'),data
 assert data['position']=='fixed',(label,data)
 assert abs(data['footer']['bottom']-data['viewportHeight'])<=3,(label,data)
 assert data['footer']['height']>=43.5,(label,data)
 assert data['bodyPaddingBottom']>=data['footer']['height']-2 and data['scrollPaddingBottom']>=data['footer']['height']-2,(label,data)
 assert data['bodyDisplay']!='flex' and data['bodyPosition']!='fixed' and data['bodyOverflowY']!='hidden',(label,data)
 assert data['docWidth']<=data['viewportWidth']+2,(label,data)
 assert data['focusOverlap']==0,(label,data['offenders'][:3])
 RESULTS.append({'oracle':'fixed-persistent-non-overlap','reserveOracle':'reserve-coupling','reflow':'reflow-1440-390-320','rootTrap':'root-trap-negative','case':label,**data})
def run(browser,w,h,label):
 mark(label+'-context');ctx=browser.new_context(viewport={'width':w,'height':h});ctx.add_init_script("try{localStorage.setItem('ictc-role','user');localStorage.setItem('ictc-service','home')}catch{}");p=ctx.new_page();p.set_default_timeout(30000);mark(label+'-load');p.goto(BASE+'/',wait_until='networkidle');expect(p.locator('html')).to_have_attribute('data-ictc-experience','market-1');expect(p.locator('#stableLegalFooter')).to_be_visible();expect(p.locator('#homeView')).to_be_visible();mark(label+'-geometry');metrics(p,label);ctx.close()
try:
 with sync_playwright() as pw:
  opts={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):opts['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**opts)
  for w,h,label in [(1440,950,'desktop-1440'),(390,844,'mobile-390'),(320,800,'mobile-320')]:run(browser,w,h,label)
  report={'ok':True,'slice':'S4-A6','executionUnit':'A6-UX1','oracles':['fixed-persistent-non-overlap','reserve-coupling','safe-area-coupling','native-focus-non-overlap','reflow-1440-390-320','root-trap-negative'],'results':RESULTS,'claimBoundary':'Exact-head automated Chromium flow geometry only. Human assistive-technology/usability and production effectiveness remain external evidence.'};(ART/'browser-s4-a6-ux1-fixed-safe-footer.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8');print(json.dumps({'ok':True,'slice':'S4-A6','executionUnit':'A6-UX1','viewports':len(RESULTS)}),flush=True);browser.close()
except BaseException as exc:
 payload={'ok':False,'slice':'S4-A6','executionUnit':'A6-UX1','phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'results':RESULTS};(ART/'browser-s4-a6-ux1-fixed-safe-footer-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8');print(f'::error title=s4-a6-ux1-fixed-safe-footer::{PHASE}: {type(exc).__name__}: {exc}',flush=True);raise
