import json, os, pathlib
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts';ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')

def snap(e):
    return e.evaluate("""e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{tag:e.tagName,id:e.id||'',cls:String(e.className||'').slice(0,100),top:r.top,bottom:r.bottom,height:r.height,position:s.position,display:s.display,overflow:s.overflow,overflowY:s.overflowY,transform:s.transform,contain:s.contain,marginTop:s.marginTop,marginBottom:s.marginBottom,paddingTop:s.paddingTop,paddingBottom:s.paddingBottom}}""")

with sync_playwright() as pw:
    launch={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
    browser=pw.chromium.launch(**launch)
    ctx=browser.new_context(viewport={'width':390,'height':844})
    ctx.add_init_script("try{localStorage.setItem('ictc-role','user');localStorage.setItem('ictc-service','home')}catch{}")
    p=ctx.new_page();p.set_default_timeout(30000);p.goto(BASE+'/',wait_until='networkidle')
    p.locator('.service-nav [data-service="proof"]').click();expect(p.locator('#proofView')).to_be_visible();p.wait_for_timeout(500)
    footer=p.locator('#stableLegalFooter');main=p.locator('main');proof=p.locator('#proofView');content=p.locator('#proofContent')
    offenders=[]
    for i in range(p.locator('main summary').count()):
        e=p.locator('main summary').nth(i)
        if not e.is_visible(): continue
        e.focus();p.wait_for_timeout(30)
        r=e.bounding_box();fr=footer.bounding_box()
        if not r or not fr: continue
        h=max(0,min(r['y']+r['height'],fr['y']+fr['height'])-max(r['y'],fr['y']))
        w=max(0,min(r['x']+r['width'],fr['x']+fr['width'])-max(r['x'],fr['x']))
        if h*w>0:
            chain=e.evaluate("""e=>{const out=[];for(let n=e;n&&out.length<8;n=n.parentElement){const r=n.getBoundingClientRect(),s=getComputedStyle(n);out.push({tag:n.tagName,id:n.id||'',cls:String(n.className||'').slice(0,80),top:r.top,bottom:r.bottom,height:r.height,position:s.position,display:s.display,overflowY:s.overflowY,transform:s.transform,contain:s.contain,marginTop:s.marginTop,marginBottom:s.marginBottom,paddingTop:s.paddingTop,paddingBottom:s.paddingBottom});if(n.tagName==='MAIN')break}return out}""")
            offenders.append({'text':e.inner_text().strip().replace('\n',' ')[:90],'area':h*w,'chain':chain})
            break
    payload={'scrollY':p.evaluate('scrollY'),'maxScroll':p.evaluate('Math.max(0,document.documentElement.scrollHeight-innerHeight)'),'footer':snap(footer),'main':snap(main),'proof':snap(proof),'content':snap(content),'offender':offenders[0] if offenders else None}
    o=payload.get('offender');chain=(o or {}).get('chain') or []
    details=next((x for x in chain if x['tag']=='DETAILS'),{})
    payload['compact']=f"f:{payload['footer']['position']}/{payload['footer']['marginTop']} mB:{payload['main']['bottom']:.1f} pB:{payload['proof']['bottom']:.1f} cB:{payload['content']['bottom']:.1f} dB:{details.get('bottom',-1):.1f} t:{details.get('transform','?')} c:{details.get('contain','?')}"
    (ART/'s4-a5-geometry-diagnostic.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(json.dumps(payload,ensure_ascii=False))
    ctx.close();browser.close()
