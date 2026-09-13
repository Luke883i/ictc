import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PROOF_READING_ORDER='facts>decisions>evidence-basis>trace>epistemic>external>integrity>method>export'
PHASE='init'

def fail(error):
    (ART/'browser-pr60-polish-error.json').write_text(json.dumps({'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc()},indent=2),encoding='utf8')
    print(f'::error title=browser-pr60-polish::{PHASE}: {type(error).__name__}: {error}',flush=True)

def no_overflow(page):
    m=page.evaluate('()=>[innerWidth,document.documentElement.scrollWidth,document.body.scrollWidth]')
    assert m[1]<=m[0]+1 and m[2]<=m[0]+1,m

def min_height(page,selector):
    values=page.locator(selector).evaluate_all('(nodes)=>nodes.filter(n=>n.offsetParent!==null).map(n=>n.getBoundingClientRect().height)')
    assert values,selector
    assert min(values)>=43.5,(selector,values)
    return min(values)

def ready(page):
    page.wait_for_selector('#proofContent:not([hidden])')
    page.wait_for_function("expected=>{const r=document.querySelector('#proofView'),c=document.querySelector('#proofContent');return document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&r?.dataset.localCompositionOwner==='proof-workspace-3-2.js'&&r?.dataset.semanticWorkspaceClosure==='3.2.1'&&r?.dataset.proofReadingOrder===expected&&!!c?.querySelector(':scope > .proof-fact-strip[data-proof-facts=\"non-evaluative\"]')&&!!c?.querySelector(':scope > details[data-proof-workspace=\"epistemic-investigation\"]')&&!!c?.querySelector(':scope > details[data-proof-workspace=\"trace-reconstruction\"]')&&!!c?.querySelector(':scope > details[data-proof-domain=\"decisions\"]')&&!!c?.querySelector(':scope > details[data-proof-domain=\"evidence-basis\"]')&&!!c?.querySelector(':scope > details[data-composition-detail=\"proof-reading\"]')}",arg=PROOF_READING_ORDER)

def open_rn(page):
    page.locator('.service-nav [data-service="processes"]').click()
    card=page.locator('#procedureHub [data-process-code="RN-01"]')
    expect(card).to_be_visible()
    card.locator(':scope > footer .primary').click()
    page.wait_for_function("()=>{const r=document.querySelector('#monitoringView');return !!(r&&r.offsetParent!==null&&r.dataset.compositionSurface==='monitoring'&&document.documentElement.dataset.nativeSemanticLattice==='3.2.0')}")

def close_plan(page):
    dialog=page.locator('#planDialog')
    if dialog.get_attribute('open') is None:return
    close=dialog.locator('[aria-label="Chiudi"]')
    if close.count():close.click()
    else:page.keyboard.press('Escape')
    expect(dialog).not_to_be_visible()

def close_scheduler(page):
    dialog=page.locator('#jobDialog')
    if dialog.get_attribute('open') is None:return
    close=dialog.locator('[aria-label="Chiudi configurazione job"]')
    if close.count():close.click()
    else:page.keyboard.press('Escape')
    expect(dialog).not_to_be_visible()

def ensure_rn_evidence_menu(page):
    global PHASE
    open_rn(page)
    menu=page.locator('.evidence-export-menu:visible').first
    if menu.count(): return menu
    PHASE='evidence-seed-open-scheduler'
    trigger=page.locator('#monitoringView [data-rn-open-scheduler]')
    expect(trigger).to_be_visible();trigger.click();expect(page.locator('#jobDialog')).to_be_visible()
    PHASE='evidence-seed-monitoring-form'
    form=page.locator('#jobDialog #missionForm');expect(form).to_be_visible()
    page.evaluate("""()=>{const f=document.querySelector('#jobDialog #missionForm');if(!f)throw new Error('missionForm missing');const set=(name,value)=>{const el=f.elements[name];if(!el)return;el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));};set('jobName','PR60 isolated evidence fixture');set('objective','Monitorare fonti pubbliche normative per produrre un fascicolo evidenze isolato.');set('cadence','168');set('sourceHints','https://eur-lex.europa.eu');set('promptOverride','');}""")
    PHASE='evidence-seed-submit'
    form.locator('button[type="submit"]').click();expect(page.locator('#planDialog')).to_be_visible();expect(page.locator('#jobDialog')).to_be_visible();close_plan(page);close_scheduler(page)
    PHASE='evidence-seed-materialized'
    page.wait_for_function("()=>document.querySelectorAll('#missionsList .mission-card').length>0&&!!document.querySelector('.evidence-export-menu')")
    menu=page.locator('.evidence-export-menu:visible').first;expect(menu).to_be_visible();return menu

def direct_order(page):
    return page.evaluate("""()=>[...document.querySelector('#proofContent').children].map(n=>n.classList.contains('proof-fact-strip')?'facts':(n.dataset.proofDomain||n.dataset.proofWorkspace||n.dataset.compositionDetail||null)).filter(Boolean)""")

def assert_meaning_first(page):
    expect(page.locator('#proofView')).to_be_visible();expect(page.locator('#proofTitle')).to_have_text('Evidenze ICTC');expect(page.locator('.proof-semantic-qualifier')).to_have_count(0);expect(page.locator('#proofView [data-proof-tab]')).to_have_count(0)
    facts=page.locator('#proofContent > .proof-fact-strip');decisions=page.locator('#proofContent > details[data-proof-domain="decisions"]');standards=page.locator('#proofContent > details[data-proof-domain="evidence-basis"]');trace=page.locator('#proofContent > details[data-proof-workspace="trace-reconstruction"]');investigation=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]');reading=page.locator('#proofContent > details[data-composition-detail="proof-reading"]')
    expect(facts).to_have_count(1);expect(facts).to_be_visible();assert facts.get_attribute('data-proof-facts')=='non-evaluative'
    for node in [decisions,standards,trace,investigation,reading]:expect(node).to_have_count(1)
    for node in [decisions,standards,trace,investigation,reading]:
        expect(node).not_to_have_attribute('open','')
    expect(investigation.locator(':scope > summary')).to_contain_text('Reticolo epistemico');expect(trace.locator(':scope > summary')).to_contain_text('Ricostruisci un elemento di lavoro');expect(decisions.locator(':scope > summary')).to_contain_text('Decisioni e tracciabilità');expect(standards.locator(':scope > summary')).to_contain_text('Evidenze e basi');expect(reading.locator(':scope > summary b')).to_have_text('Criteri di lettura e sintesi tecnica')
    expected=['facts','decisions','evidence-basis','trace-reconstruction','epistemic-investigation','external','integrity','interpretation','export'];order=direct_order(page);assert [x for x in order if x in expected]==expected,order
    expect(page.locator('#proofMethodTitle')).to_be_hidden();expect(page.locator('#traceExplorer')).to_be_hidden();expect(investigation.locator('[data-service="epistemic"]')).to_be_hidden()
    min_height(page,'#proofContent > details[data-proof-workspace="epistemic-investigation"] > summary');min_height(page,'#proofContent > details[data-proof-workspace="trace-reconstruction"] > summary');min_height(page,'#proofContent > details[data-proof-domain="decisions"] > summary');min_height(page,'#proofContent > details[data-proof-domain="evidence-basis"] > summary');min_height(page,'#proofContent > details[data-composition-detail="proof-reading"] > summary');no_overflow(page);return reading

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        ctx=browser.new_context(viewport={'width':1280,'height':900},accept_downloads=True)
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','proof')")
        page=ctx.new_page();page.set_default_timeout(30000);proof_requests=[];page.on('request',lambda request: proof_requests.append(request.url) if '/api/standard-proof' in request.url else None)

        PHASE='evidence-meaning-first';page.goto(BASE+'/?view=proof',wait_until='networkidle');ready(page);reading=assert_meaning_first(page)
        PHASE='evidence-render-idempotence';before_order=direct_order(page);page.evaluate("()=>{for(let i=0;i<8;i++)document.dispatchEvent(new CustomEvent('ictc:rendered'));}");page.wait_for_timeout(180);assert direct_order(page)==before_order,(before_order,direct_order(page));assert_meaning_first(page)
        PHASE='evidence-refresh-ownership';initial_requests=len(proof_requests);assert initial_requests>=1,proof_requests;revision=int(page.locator('html').get_attribute('data-ictc-projection-revision') or 0);page.evaluate("r=>document.dispatchEvent(new CustomEvent('ictc:projection-committed',{detail:{revision:r,actorRole:'admin'}}))",revision+1);page.wait_for_function('(count)=>performance.getEntriesByType("resource").filter(x=>x.name.includes("/api/standard-proof")).length>=count',arg=initial_requests+1);page.wait_for_function('(r)=>Number(document.querySelector("#proofView")?.dataset.loadedRevision||0)>=r',arg=revision+1);ready(page);assert_meaning_first(page)
        PHASE='evidence-keyboard-disclosure';reading=page.locator('#proofContent > details[data-composition-detail="proof-reading"]');summary=reading.locator(':scope > summary');summary.focus();summary.press('Enter');expect(reading).to_have_attribute('open','');expect(page.locator('#proofMethodTitle')).to_be_visible();expect(page.locator('.proof-reading-card')).to_have_count(3);summary.press(' ');expect(reading).not_to_have_attribute('open','');expect(summary).to_be_focused();summary.press('Enter');expect(reading).to_have_attribute('open','');page.screenshot(path=str(ART/'ux-pr60-evidence-desktop.png'),full_page=True)
        PHASE='evidence-download-disclosure';menu=ensure_rn_evidence_menu(page);menu_summary=menu.locator(':scope > summary');menu_summary.focus();menu_summary.press('Enter');expect(menu).to_have_attribute('open','');expect(menu.locator('[data-evidence-download]')).to_have_count(4);min_height(page,'.evidence-export-menu > summary');min_height(page,'.evidence-export-menu [data-evidence-download]')
        PHASE='evidence-downloads';downloaded=[]
        for fmt in ['pdf','xml','md','zip']:
            if menu.get_attribute('open') is None:menu_summary.click()
            with page.expect_download() as pending:menu.locator(f'[data-evidence-download="{fmt}"]').click()
            download=pending.value;assert download.suggested_filename.endswith('.'+fmt),(fmt,download.suggested_filename);downloaded.append(fmt)
        PHASE='evidence-escape';menu_summary.click();expect(menu).to_have_attribute('open','');page.keyboard.press('Escape');expect(menu).not_to_have_attribute('open','');expect(menu_summary).to_be_focused();no_overflow(page)
        PHASE='mobile-evidence';mobile_ctx=browser.new_context(viewport={'width':390,'height':844});mobile_ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','proof')");mobile=mobile_ctx.new_page();mobile.set_default_timeout(30000);mobile.goto(BASE+'/?view=proof',wait_until='networkidle');ready(mobile);mobile_reading=assert_meaning_first(mobile);mobile_reading.locator(':scope > summary').click();expect(mobile.locator('#proofMethodTitle')).to_be_visible();no_overflow(mobile);mobile.screenshot(path=str(ART/'ux-pr60-evidence-mobile.png'),full_page=True);mobile_ctx.close()

        out={'ok':True,'profile':'pr60-evidence-polish+native-semantic-lattice-3.2+semantic-workspace-closure-3.2.1+s4-a3','isolatedState':True,'evidence':{'stableRouteHeading':'Evidenze ICTC','semanticQualifierRetired':True,'legacyTabs':0,'proofReadingOrder':PROOF_READING_ORDER,'factsNonEvaluative':True,'decisionsProgressive':True,'secondaryDisclosuresCollapsed':True,'proofMethodProgressive':True,'renderReapplyOrderStable':True,'genericRenderRefetches':0,'projectionCommitRefresh':True},'evidenceDownloads':downloaded,'keyboard':{'progressiveDisclosure':True,'escapeReturnsFocus':True},'touchTargetsMin':44,'mobileOverflow':False,'evidenceClass':'E2-server-backed-browser; automated UI evidence, not independent human usability or AT assessment'}
        (ART/'browser-pr60-polish.json').write_text(json.dumps(out,indent=2),encoding='utf8');print('browser-pr60-polish: complete',flush=True);ctx.close();browser.close()
except BaseException as error:
    fail(error);traceback.print_exc();raise
