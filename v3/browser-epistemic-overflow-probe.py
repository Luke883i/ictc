import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4811').rstrip('/')
VIEWPORTS=[('mobile',390,844),('tablet',768,1024),('desktop',1280,900),('wide',1600,1000)]
ROLES=['admin','auditor']
PROOF_READING_ORDER='facts>decisions>trace>evidence-basis>epistemic>external>integrity>method>export'
PHASE='init'; anomalies=[]

def open_epistemic(page):
    page.locator('.service-nav [data-service="proof"]').click()
    expect(page.locator('#proofView')).to_be_visible()
    page.wait_for_function("""expected=>{const root=document.querySelector('#proofView'),content=document.querySelector('#proofContent'),entry=content?.querySelector(':scope > details[data-proof-workspace="epistemic-investigation"]');return !!(root&&root.offsetParent!==null&&root.dataset.localCompositionOwner==='proof-workspace-3-2.js'&&root.dataset.proofReadingOrder===expected&&entry&&!root.querySelector('#epistemicMetaCard')&&entry.querySelector('[data-service="epistemic"]'));}""",arg=PROOF_READING_ORDER)
    investigation=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]')
    expect(investigation).to_have_count(1)
    assert investigation.get_attribute('open') is None
    investigation.locator(':scope > summary').click()
    action=investigation.locator('[data-service="epistemic"]')
    expect(action).to_be_visible()
    action.click()
    expect(page.locator('#epistemicView')).to_be_visible()
    expect(page.locator('#epistemicTitle')).to_have_text('Relazioni tra decisioni, fonti ed evidenze')
    page.wait_for_function("()=>Number(document.querySelector('#epistemicView')?.dataset.loadedRevision||0)>0")

def measure(page):
    return page.evaluate("""()=>{
      const inner=innerWidth, html=document.documentElement.scrollWidth, body=document.body.scrollWidth;
      const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity!==0&&r.width>0&&r.height>0};
      const baseName=e=>{const id=e.id?`#${e.id}`:'';const cls=typeof e.className==='string'&&e.className.trim()?'.'+e.className.trim().split(/\\s+/).slice(0,3).join('.'):'';return `${e.tagName.toLowerCase()}${id}${cls}`};
      const name=e=>{const attrs=[...e.attributes].filter(a=>a.name.startsWith('data-')).slice(0,3).map(a=>`[${a.name}${a.value?`=${a.value}`:''}]`).join('');const text=(e.innerText||e.textContent||'').trim().replace(/\\s+/g,' ').slice(0,36);const parent=e.parentElement?baseName(e.parentElement):'';return `${baseName(e)}${attrs}${text?`:${text}`:''}${parent?`@${parent}`:''}`.slice(0,220)};
      const offenders=[...document.querySelectorAll('#epistemicView, #epistemicView *')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return {selector:name(e),left:+r.left.toFixed(1),right:+r.right.toFixed(1),width:+r.width.toFixed(1),clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,overRight:+Math.max(0,r.right-inner).toFixed(1),overLeft:+Math.max(0,-r.left).toFixed(1),overflowX:getComputedStyle(e).overflowX,minWidth:getComputedStyle(e).minWidth,maxWidth:getComputedStyle(e).maxWidth,whiteSpace:getComputedStyle(e).whiteSpace};}).filter(x=>x.overRight>1||x.overLeft>1).sort((a,b)=>(b.overRight+b.overLeft)-(a.overRight+a.overLeft)).slice(0,8);
      return {innerWidth:inner,html,body,delta:Math.max(html,body)-inner,offenders};
    }""")

def fail(exc):
    payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'anomalies':anomalies}
    (ART/'browser-epistemic-overflow-probe-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(f'::error title=browser-epistemic-overflow-probe::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        for role in ROLES:
            for vp,width,height in VIEWPORTS:
                PHASE=f'{role}-{vp}'
                ctx=browser.new_context(viewport={'width':width,'height':height})
                ctx.add_init_script(f"localStorage.setItem('ictc-role','{role}');localStorage.setItem('ictc-service','processes')")
                page=ctx.new_page(); page.set_default_timeout(30000)
                page.goto(BASE+'/?view=processes',wait_until='networkidle')
                open_epistemic(page)
                metric=measure(page)
                if metric['delta']>1:
                    first=metric['offenders'][0] if metric['offenders'] else {'selector':'unknown','overRight':metric['delta'],'overLeft':0}
                    anomaly={'kind':'document-overflow','role':role,'viewport':vp,'surface':'EP-01','measured':metric,'expected':'document <= viewport+1'}
                    anomalies.append(anomaly)
                    raise AssertionError(f"overflow={metric['delta']};offender={first['selector']};right={first.get('overRight',0)};left={first.get('overLeft',0)};inner={metric['innerWidth']};html={metric['html']};body={metric['body']}")
                ctx.close()
        out={'ok':True,'profile':'epistemic-overflow-causal-guard-3.2+s4-a3-specialized-local-closure','roles':ROLES,'viewports':[x[0] for x in VIEWPORTS],'entryAuthority':'proof-workspace-3-2-progressive-after-evidence-meaning','proofReadingOrder':PROOF_READING_ORDER,'duplicateProofMetaEntry':False,'anomalyCount':0}
        (ART/'browser-epistemic-overflow-probe.json').write_text(json.dumps(out,indent=2),encoding='utf8')
        print('browser-epistemic-overflow-probe: complete anomalies=0',flush=True)
        browser.close()
except BaseException as exc:
    fail(exc); traceback.print_exc(); raise
