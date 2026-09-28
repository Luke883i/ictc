import json, os, pathlib
from playwright.sync_api import expect, sync_playwright
from browser_test_support import ensure_onboarded

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts';ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')

def box(page, selector):
    return page.locator(selector).first.evaluate("""e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{top:r.top,bottom:r.bottom,height:r.height,display:s.display,position:s.position,overflow:s.overflow,visibility:s.visibility}}""")

with sync_playwright() as pw:
    launch={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
    browser=pw.chromium.launch(**launch)
    ctx=browser.new_context(viewport={'width':390,'height':844})
    ctx.add_init_script("try{localStorage.setItem('ictc-role','user');localStorage.setItem('ictc-service','home')}catch{}")
    p=ctx.new_page();p.set_default_timeout(30000);p.goto(BASE+'/',wait_until='networkidle');ensure_onboarded(p,BASE,'user')
    expect(p.locator('#homePriorities')).to_have_attribute('data-home-work-queue','3.2')
    p.locator('.service-nav [data-service="processes"]').click()
    expect(p.locator('#procedureHub .procedure-card')).to_have_count(7)
    expect(p.locator('#procedureHub .procedure-card footer .primary').first).to_be_visible()
    p.locator('.service-nav [data-service="proof"]').click()
    expect(p.locator('#proofView')).to_be_visible()
    expect(p.locator('#proofContent')).to_be_visible()
    target=p.locator('#proofBenchmarkMappings .proof-mapping summary').filter(has_text='ISO 37301').first
    expect(target).to_be_attached()
    payload=p.evaluate("""()=>{const summary=[...document.querySelectorAll('#proofBenchmarkMappings .proof-mapping summary')].find(e=>(e.textContent||'').includes('ISO 37301'));const f=document.querySelector('#stableLegalFooter');const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{top:r.top,bottom:r.bottom,height:r.height,display:s.display,position:s.position,overflow:s.overflow,visibility:s.visibility}};const details=summary?.closest('.proof-mapping');const mappings=summary?.closest('.proof-mappings');const section=summary?.closest('details.proof-section');const content=document.querySelector('#proofContent'),proof=document.querySelector('#proofView'),main=document.querySelector('#main');return{summary:rect(summary),details:rect(details),mappings:rect(mappings),section:rect(section),content:rect(content),proof:rect(proof),main:rect(main),footer:rect(f),sectionOpen:!!section?.open,summaryRendered:!!summary&&summary.getClientRects().length>0,scrollY,scrollHeight:document.documentElement.scrollHeight,innerHeight};}""")
    def b(key):
        v=payload.get(key) or {}; return float(v.get('bottom',-1))
    ft=float((payload.get('footer') or {}).get('top',-1))
    payload['compact']=f"sB:{b('summary'):.1f} dB:{b('details'):.1f} mapsB:{b('mappings'):.1f} secB:{b('section'):.1f} cB:{b('content'):.1f} pB:{b('proof'):.1f} mB:{b('main'):.1f} fT:{ft:.1f} open:{int(payload.get('sectionOpen',False))} rend:{int(payload.get('summaryRendered',False))}"
    (ART/'s4-a5-geometry-diagnostic.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(json.dumps(payload,ensure_ascii=False))
    ctx.close();browser.close()
