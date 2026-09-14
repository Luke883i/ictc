import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts';ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4868').rstrip('/')
PHASE='init'; RESULTS=[]
CODES={'RN-01':('monitoring','#monitoringView'),'EC-01':('incidents','#incidentsView'),'AO-01':('objects','#grcWorkspace'),'MC-01':('coverage','#grcWorkspace'),'AP-01':('actions','#grcWorkspace')}

def record(name, data=True): RESULTS.append({'oracle':name,'result':data})
def visible_exact(page,text):
    return page.evaluate("""text=>[...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&e.children.length===0&&(e.textContent||'').trim()===text}).length""",text)
def fail(exc):
    payload={'ok':False,'slice':'UIUX-P3','phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'results':RESULTS}
    (ART/'browser-uiux-semantic-runtime-closure-p3-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(json.dumps(payload,ensure_ascii=False),flush=True)

def processes(page): return page.locator('.service-nav [data-service="processes"]')
def open_process(page,code):
    global PHASE
    processes(page).click(); card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); card.locator('.procedure-primary').click(); pid,root=CODES[code]; PHASE=f'{code}-mounted'; page.wait_for_function("x=>{const r=document.querySelector(x.root);return !!(r&&r.offsetParent!==null&&document.documentElement.dataset.semanticRuntimeClosure==='p3')}",arg={'root':root}); return page.locator(root)

def run(browser):
    global PHASE
    ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
    page=ctx.new_page();page.set_default_timeout(30000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'/?view=processes',wait_until='networkidle');page.wait_for_function("()=>document.documentElement.dataset.semanticRuntimeClosure==='p3'")
    PHASE='hub-hierarchy'; cards=page.locator('#procedureHub .procedure-card');expect(cards).to_have_count(7)
    hierarchy=cards.first.evaluate("e=>{const t=e.querySelector('h2'),p=e.querySelector('.procedure-purpose'),a=e.querySelector('.procedure-primary');return{title:parseFloat(getComputedStyle(t).fontSize),purpose:parseFloat(getComputedStyle(p).fontSize),action:[a.getBoundingClientRect().width,a.getBoundingClientRect().height]}}")
    assert hierarchy['title']>hierarchy['purpose'],hierarchy
    widths=cards.evaluate_all("els=>els.map(e=>e.querySelector('.procedure-primary')?.getBoundingClientRect().width||0)");assert max(widths)-min(widths)<3,widths;record('process-directory-hierarchy',hierarchy)

    rn=open_process(page,'RN-01'); PHASE='rn-single-owner'; expect(rn.locator('[data-a6-registry="monitoring"]')).to_be_visible(); assert visible_exact(page,'Monitoraggi')==1,visible_exact(page,'Monitoraggi')
    count=rn.locator('[data-a6-registry="monitoring"] [data-a6-registry-count-group]');expect(count).to_be_visible();assert 'totali' in count.inner_text().lower(); rail=rn.locator('[data-control-rail="monitoring"]');expect(rail).to_have_count(1);expect(rail.locator('[data-a6-search="monitoring"]')).to_have_count(1);expect(rail.locator('[data-a6-state="monitoring"]')).to_have_count(1);expect(rail.locator('[data-a6-ux4-scope="monitoring"]')).to_have_count(1)
    frame=rn.locator('.procedure-frame');expect(frame.locator('.procedure-boundary')).to_be_visible();expect(frame.locator('.procedure-context-detail')).to_be_visible();assert frame.locator('.procedure-value').get_attribute('hidden') is None
    assert visible_exact(page,'Motivazione non disponibile')==0
    record('rn-single-registry-and-typed-count',count.inner_text())

    ec=open_process(page,'EC-01'); PHASE='ec-single-owner';assert visible_exact(page,'Eventi registrati')==1;ereg=ec.locator('[data-a6-registry="incidents"]');expect(ereg).to_be_visible();ecrail=ec.locator('[data-control-rail="incidents"]');expect(ecrail).to_have_count(1);expect(ecrail.locator('[data-a6-ux4-scope="incidents"]')).to_have_count(1);record('ec-single-registry',ereg.locator('[data-a6-registry-count-group]').inner_text())

    ao=open_process(page,'AO-01'); PHASE='ao-control-rail';aorail=ao.locator('.procedure-queue-tools[data-enduser-primitive="ControlRail"]');expect(aorail).to_have_count(1);expect(aorail.locator('[data-a6-ux4-scope="objects"]')).to_have_count(1);record('ao-control-rail')
    ap=open_process(page,'AP-01'); PHASE='ap-control-rail';aprail=ap.locator('.procedure-queue-tools[data-enduser-primitive="ControlRail"]');expect(aprail).to_have_count(1);expect(aprail.locator('[data-a6-ux4-scope="actions"]')).to_have_count(1);record('ap-control-rail')

    mc=open_process(page,'MC-01'); PHASE='mc-state-axis';scopes=mc.locator('.market-scope[data-state-axis="organizational-use"]');assert scopes.count()>0,scopes.count();entries=mc.locator('[data-open-standard-browser]');expect(entries.first).to_be_visible();target=mc.locator('[data-framework-card="eu-nis2-2022-2555"] [data-open-standard-browser]');(target if target.count() else entries.first).click();dialog=page.locator('#standardBrowserDialog');expect(dialog).to_be_visible();PHASE='standard-origin';expect(dialog.locator('[data-standard-content-origin]')).to_be_visible();origin=dialog.locator('[data-standard-content-origin]').get_attribute('data-standard-content-origin');assert origin in ['official-public-reference','authorized-licensed','ictc-operational-formulation','reference-only'],origin
    if target.count():expect(dialog.locator('.standard-source-link')).to_be_visible();mapper=dialog.locator('[data-standard-map]');expect(mapper).to_be_visible();mapper.click();PHASE='mapping-context';mapping=mc.locator('[data-mapping-journey="requirement-first"]');expect(mapping).to_be_visible();assert 'Requisito' in mapping.locator(':scope > summary').inner_text();record('standard-and-mapping-context',origin)

    PHASE='command-palette';page.locator('#globalCommandTrigger').click();cmd=page.locator('#globalCommandDialog');expect(cmd).to_be_visible();expect(cmd.locator('footer kbd')).to_have_count(4);footer=cmd.locator('footer').inner_text();assert 'sposta selezione' in footer and 'Invio' in footer and 'Esc' in footer;cmd.locator('[data-command-close]').click();record('command-keyboard-legend')

    PHASE='provider-guided-settings';menu=page.locator('#stableProfileMenu');menu.locator(':scope > summary').click();settings=page.locator('#openSettings');expect(settings).to_be_visible();settings.click();dlg=page.locator('#settingsDialog');expect(dlg).to_be_visible();provider=dlg.locator('[data-ai-provider]');expect(provider).to_be_visible();labels=provider.locator('option').all_text_contents();assert labels==['OpenAI','Anthropic','DeepSeek','Personalizzato (OpenAI-compatible)'],labels;expect(dlg.locator('[data-ai-provider-test]')).to_be_visible();advanced=dlg.locator('[data-ai-provider-advanced]');expect(advanced).to_have_count(1);record('guided-provider-settings',labels);dlg.locator('[data-close="settingsDialog"]').first.click()

    PHASE='proof-disclosure';page.locator('.service-nav [data-service="proof"]').click();proof=page.locator('#proofView');expect(proof).to_be_visible();summaries=proof.locator('#proofContent details.proof-section > summary');assert summaries.count()>0;metric=summaries.first.evaluate("e=>{const r=e.getBoundingClientRect(),s=e.querySelector('span')?.getBoundingClientRect();return{summaryY:r.y,spanY:s?.y||0,display:getComputedStyle(e).display}}");assert metric['display']=='flex',metric;record('proof-row-composition',metric)
    assert not errors,errors
    ctx.close()

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch);run(browser);browser.close()
    report={'ok':True,'slice':'UIUX-P3','oracles':RESULTS,'claimBoundary':'Exact-head Chromium evidence for screenshot-derived repository/runtime presentation only; human usability and external assurance remain separate.'}
    (ART/'browser-uiux-semantic-runtime-closure-p3.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8');print(json.dumps({'ok':True,'slice':'UIUX-P3','oracles':len(RESULTS)}),flush=True)
except BaseException as exc:
    fail(exc);raise
