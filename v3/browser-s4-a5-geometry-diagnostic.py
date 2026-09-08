import json, os, pathlib
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts';ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')

def snap(e):
    return e.evaluate("""e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{tag:e.tagName,id:e.id||'',cls:String(e.className||'').slice(0,100),top:r.top,bottom:r.bottom,height:r.height,position:s.position,display:s.display,overflow:s.overflow,overflowY:s.overflowY,transform:s.transform,contain:s.contain,marginTop:s.marginTop,marginBottom:s.marginBottom,paddingTop:s.paddingTop,paddingBottom:s.paddingBottom}}""")

def settle(p):
    p.evaluate("""async()=>{const frame=()=>new Promise(r=>requestAnimationFrame(r));const animations=document.getAnimations().filter(a=>{const t=a.effect?.target,x=a.effect?.getComputedTiming?.();return t?.closest?.('main')&&a.playState!=='finished'&&Number.isFinite(x?.endTime)});if(animations.length)await Promise.race([Promise.allSettled(animations.map(a=>a.finished)),new Promise(r=>setTimeout(r,700))]);let last=scrollY,stable=0;for(let i=0;i<36&&stable<3;i++){await frame();const now=scrollY;if(Math.abs(now-last)<.5)stable++;else stable=0;last=now}}""")

with sync_playwright() as pw:
    launch={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
    browser=pw.chromium.launch(**launch)
    ctx=browser.new_context(viewport={'width':390,'height':844})
    ctx.add_init_script("try{localStorage.setItem('ictc-role','user');localStorage.setItem('ictc-service','home')}catch{}")
    p=ctx.new_page();p.set_default_timeout(30000);p.goto(BASE+'/',wait_until='networkidle')
    expect(p.locator('#homePriorities')).to_have_attribute('data-home-work-queue','3.2')
    p.locator('.service-nav [data-service="processes"]').click();expect(p.locator('#procedureHub .procedure-card')).to_have_count(7)
    p.locator('.service-nav [data-service="proof"]').click();expect(p.locator('#proofView')).to_be_visible();settle(p)
    footer=p.locator('#stableLegalFooter');main=p.locator('main');proof=p.locator('#proofView');content=p.locator('#proofContent')
    offenders=[]
    candidates=p.locator('main button,main a[href],main input,main select,main textarea,main summary')
    for i in range(min(candidates.count(),48)):
        e=candidates.nth(i)
        if not e.is_visible() or e.is_disabled(): continue
        e.focus();settle(p)
        r=e.bounding_box();fr=footer.bounding_box()
        if not r or not fr: continue
        h=max(0,min(r['y']+r['height'],fr['y']+fr['height'])-max(r['y'],fr['y']))
        w=max(0,min(r['x']+r['width'],fr['x']+fr['width'])-max(r['x'],fr['x']))
        if h*w>0:
            chain=e.evaluate("""e=>{const out=[];for(let n=e;n&&out.length<10;n=n.parentElement){const r=n.getBoundingClientRect(),s=getComputedStyle(n);out.push({tag:n.tagName,id:n.id||'',cls:String(n.className||'').slice(0,80),top:r.top,bottom:r.bottom,height:r.height,position:s.position,display:s.display,overflowY:s.overflowY,transform:s.transform,contain:s.contain,marginTop:s.marginTop,marginBottom:s.marginBottom,paddingTop:s.paddingTop,paddingBottom:s.paddingBottom});if(n.tagName==='MAIN')break}return out}""")
            offenders.append({'tag':e.evaluate('e=>e.tagName'),'text':e.inner_text().strip().replace('\n',' ')[:90],'bottom':r['y']+r['height'],'footerTop':fr['y'],'area':h*w,'chain':chain})
            break
    payload={'scrollY':p.evaluate('scrollY'),'maxScroll':p.evaluate('Math.max(0,document.documentElement.scrollHeight-innerHeight)'),'footer':snap(footer),'main':snap(main),'proof':snap(proof),'content':snap(content),'offender':offenders[0] if offenders else None}
    o=payload.get('offender') or {};chain=o.get('chain') or []
    details=next((x for x in chain if x['tag']=='DETAILS'),{})
    parent=chain[1] if len(chain)>1 else {}
    payload['compact']=f"f:{payload['footer']['position']} fT:{payload['footer']['top']:.1f} mB:{payload['main']['bottom']:.1f} pB:{payload['proof']['bottom']:.1f} cB:{payload['content']['bottom']:.1f} o:{o.get('tag','-')}:{o.get('bottom',-1):.1f} dB:{details.get('bottom',-1):.1f} p:{parent.get('position','?')}/{parent.get('overflowY','?')}/{parent.get('contain','?')}"
    (ART/'s4-a5-geometry-diagnostic.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(json.dumps(payload,ensure_ascii=False))
    ctx.close();browser.close()
