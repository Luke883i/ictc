import json, os, pathlib
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts';ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')

with sync_playwright() as pw:
    launch={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
    browser=pw.chromium.launch(**launch)
    ctx=browser.new_context(viewport={'width':1440,'height':950})
    ctx.add_init_script("try{localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')}catch{}")
    p=ctx.new_page();p.set_default_timeout(30000);p.goto(BASE+'/',wait_until='networkidle')
    expect(p.locator('#homePriorities')).to_have_attribute('data-home-work-queue','3.2')
    p.locator('.service-nav [data-service="processes"]').click()
    cards=p.locator('#procedureHub .procedure-card');expect(cards).to_have_count(7)
    targets=p.locator('#procedureHub .procedure-card footer .primary:visible')
    rows=targets.evaluate_all("""els=>els.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{tag:e.tagName,cls:String(e.className||''),text:(e.textContent||'').trim().slice(0,40),height:r.height,width:r.width,minHeight:s.minHeight,heightStyle:s.height,boxSizing:s.boxSizing,display:s.display,transform:s.transform,paddingTop:s.paddingTop,paddingBottom:s.paddingBottom,lineHeight:s.lineHeight,visibility:s.visibility}})""")
    payload={'targetCount':len(rows),'targets':rows}
    heights=[float(x['height']) for x in rows]
    mins=sorted(set(x['minHeight'] for x in rows))
    transforms=sorted(set(x['transform'] for x in rows))
    displays=sorted(set(x['display'] for x in rows))
    payload['compact']=f"targets:{len(rows)} minH:{min(heights) if heights else -1:.1f} maxH:{max(heights) if heights else -1:.1f} cssMin:{'/'.join(mins)[:32] or '-'} display:{'/'.join(displays)[:20] or '-'} transform:{'/'.join(transforms)[:24] or '-'}"
    (ART/'s4-a5-geometry-diagnostic.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(json.dumps(payload,ensure_ascii=False))
    ctx.close();browser.close()
