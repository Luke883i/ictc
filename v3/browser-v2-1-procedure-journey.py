import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
PHASE = 'init'
PROCS = {'RN-01':'monitoring','EC-01':'incidents','AO-01':'objects','MC-01':'coverage','AP-01':'actions','RC-01':'risks','AR-01':'assurance'}
FORM_TYPES = {'objects':'object','actions':'action','risks':'risk','assurance':'assurance'}
PROOF_READING_ORDER = 'facts>decisions>trace>evidence-basis>epistemic>external>integrity>method>export'

def fail(e):
    payload = {'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}
    (ART/'browser-v2-1-procedure-journey-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    print(f'::error title=browser-v2-1-procedure-journey::{PHASE}: {type(e).__name__}: {e}', flush=True)

def processes(page):
    return page.locator('.service-nav [data-service="processes"]')

def experience_cycle(page):
    return int(page.evaluate("()=>Number(document.documentElement.dataset.experienceCycle||0)"))

def wait_navigation_ready(page, surface, before):
    page.wait_for_function("x=>document.documentElement.dataset.ictcSurface===x[0]&&Number(document.documentElement.dataset.experienceCycle||0)>x[1]&&!document.documentElement.dataset.ictcTransitionDirection", arg=[surface, before])

def no_overflow(page):
    m = page.evaluate('()=>[innerWidth,document.documentElement.scrollWidth,document.body.scrollWidth]')
    assert m[1] <= m[0] + 1 and m[2] <= m[0] + 1, m

def bootstrap(page):
    return page.evaluate("""async()=>{const r=await fetch('/api/bootstrap',{headers:{'content-type':'application/json','x-ictc-role':'admin','x-ictc-actor-id':'browser-v21'}});return await r.json()}""")

def current_revision(page):
    return int(page.locator('html').get_attribute('data-ictc-projection-revision') or 0)

def wait_advance(page, before):
    page.wait_for_function('(old)=>Number(document.documentElement.dataset.ictcProjectionRevision||0)>old', arg=before)
    after = current_revision(page)
    assert after > before, (before, after)
    return after

def check_surface_revision(page, selector, rev):
    page.wait_for_function('([sel,r])=>Number(document.querySelector(sel)?.dataset.projectionRevision||0)>=r', arg=[selector, rev])
    assert int(page.locator(selector).get_attribute('data-projection-revision') or 0) >= rev

def openp(page, code):
    global PHASE
    PHASE = f'{code}-open-card'
    processes(page).click()
    card = page.locator(f'#procedureHub [data-process-code="{code}"]')
    expect(card).to_be_visible()
    pid = PROCS[code]
    expect(card).to_have_attribute('data-procedure-id', pid)
    PHASE = f'{code}-open-route'
    before = experience_cycle(page)
    card.locator(':scope > footer .primary').click()
    surface = pid if pid in ('monitoring','incidents') else 'grc'
    wait_navigation_ready(page, surface, before)
    root = '#monitoringView' if surface == 'monitoring' else '#incidentsView' if surface == 'incidents' else '#grcView'
    expect(page.locator(root)).to_be_visible()
    PHASE = f'{code}-open-frame'
    frame = page.locator(f'{root} .procedure-frame[data-procedure-frame="canonical-1-9"]:visible')
    expect(frame).to_have_count(1)
    expect(page.locator('.procedure-frame:visible')).to_have_count(1)
    PHASE = f'{code}-open-code'
    expect(frame.locator('.procedure-frame-code')).to_have_text(code)
    PHASE = f'{code}-open-context'
    expect(page.locator('[data-surface-context-strip]:visible')).to_have_count(0)
    PHASE = f'{code}-open'
    return card

def verify_process_projection(page, code, pid, rev):
    processes(page).click()
    check_surface_revision(page, '#processesView', rev)
    card = page.locator(f'#procedureHub [data-process-code="{code}"]')
    expect(card).to_be_visible()
    expect(card).to_have_attribute('data-procedure-id', pid)
    expect(card.locator('.procedure-signals .procedure-signal')).to_have_count(0)
    expect(card.locator(':scope > footer .procedure-primary')).to_be_visible()
    no_overflow(page)

def fill_user(locator, value, phase):
    global PHASE
    PHASE = phase
    expect(locator).to_have_count(1)
    expect(locator).to_be_visible()
    expect(locator).to_be_editable()
    locator.fill(value)

def select_user(locator, value, phase):
    global PHASE
    PHASE = phase
    expect(locator).to_have_count(1)
    expect(locator).to_be_visible()
    expect(locator).to_be_editable()
    locator.select_option(value)

def open_technical_modes(page):
    detail = page.locator('#epistemicView details[data-epistemic-a3="technical-modes"]')
    expect(detail).to_be_visible()
    if detail.get_attribute('open') is None:
        detail.locator(':scope > summary').click()
    expect(detail).to_have_attribute('open', '')
    return detail

def submit_grc(page, code, pid, fill, needle):
    global PHASE
    openp(page, code)
    check_surface_revision(page, '#grcView', current_revision(page))
    page.locator('.procedure-frame:visible .procedure-primary').click()
    disclosure = page.locator('#grcPrimaryForm')
    PHASE = f'{code}-primary-disclosure'
    expect(disclosure).to_have_count(1)
    expect(disclosure).to_have_attribute('open', '')
    form = page.locator(f'[data-grc-form="{FORM_TYPES[pid]}"]')
    PHASE = f'{code}-form-ready'
    expect(form).to_have_count(1)
    expect(form).to_be_visible()
    before = current_revision(page)
    fill(form)
    PHASE = f'{code}-submit-click'
    if pid == 'risks':
        with page.expect_response(lambda response: response.request.method == 'POST' and response.url.rstrip('/').endswith('/api/grc/risks')) as response_info:
            form.locator('button[type="submit"]').click()
        response = response_info.value
        if response.status >= 400:
            PHASE = f'{code}-submit-http-{response.status}'
            raise AssertionError({'status':response.status,'body':response.text()[:1200]})
    else:
        form.locator('button[type="submit"]').click()
    PHASE = f'{code}-submit-revision'
    after = wait_advance(page, before)
    PHASE = f'{code}-local-projection'
    records = page.locator('#grcWorkspace .grc-list')
    expect(records).to_contain_text(needle)
    PHASE = f'{code}-bounded-universe-filter'
    search = page.locator(f'#grcWorkspace [data-seq-queue-search="{pid}"]')
    expect(search).to_have_count(1)
    expect(search).to_be_visible()
    search.fill(needle)
    visible_match = page.locator('#grcWorkspace .grc-list > article:visible').filter(has_text=needle)
    expect(visible_match.first).to_be_visible()
    assert visible_match.count() >= 1, (code, pid, needle)
    search.fill('')
    verify_process_projection(page, code, pid, after)
    return after

def submit_coverage(page):
    global PHASE
    openp(page, 'MC-01')
    check_surface_revision(page, '#grcView', current_revision(page))

    PHASE = 'MC-01-active-surface'
    expect(page.locator('#grcWorkspace .market-section').first).to_be_visible()
    assert page.locator('#grcPrimaryForm').count() == 0, 'legacy coverage disclosure competes with active Standard e Controlli surface'
    expect(page.locator('[data-grc-form="mapping"]')).to_have_count(1)

    page.locator('.procedure-frame:visible .procedure-primary').click()
    expect(page.locator('#marketFrameworkGrid')).to_be_visible()

    card = page.locator('#marketFrameworkGrid [data-framework-card]').first
    expect(card).to_be_visible()
    framework_id = card.get_attribute('data-framework-card')
    assert framework_id
    PHASE = 'MC-01-scope-disclosure'
    scope_editor = card.locator('.market-scope-editor')
    expect(scope_editor).to_have_count(1)
    if scope_editor.get_attribute('open') is None:
        scope_editor.locator(':scope > summary').click()
    expect(scope_editor).to_have_attribute('open', '')
    select_user(card.locator('[data-standard-scope-decision]'), 'reference', 'MC-01-scope-decision')
    fill_user(card.locator('[data-standard-scope-reason]'), 'Riferimento selezionato nel journey V2.1; nessuna conclusione di applicabilita o conformita.', 'MC-01-scope-reason')
    before_scope = current_revision(page)
    PHASE = 'MC-01-scope-submit'
    card.locator(f'[data-standard-scope="{framework_id}"]').click()
    scope_rev = wait_advance(page, before_scope)
    check_surface_revision(page, '#grcView', scope_rev)

    PHASE = 'MC-01-mapping-panel'
    panel = page.locator('#grcWorkspace .market-mapping-panel')
    expect(panel).to_have_count(1)
    if panel.get_attribute('open') is None:
        panel.locator(':scope > summary').click()
    expect(panel).to_have_attribute('open', '')
    form = panel.locator('[data-grc-form="mapping"]')
    expect(form).to_have_count(1)
    expect(form).to_be_visible()
    select_user(form.locator('#marketFrameworkSelect'), framework_id, 'MC-01-framework')
    PHASE = 'MC-01-requirements-load'
    page.wait_for_function("()=>{const s=document.querySelector('#marketRequirementSelect');return s&&!s.disabled&&s.options.length>1}")
    requirement = form.locator('#marketRequirementSelect')
    expect(requirement).to_be_editable()
    requirement.select_option(index=1)
    requirement_ref = requirement.input_value()
    requirement_label = form.locator('#marketRequirementLabel').input_value()
    assert requirement_ref and requirement_label, (requirement_ref, requirement_label)
    before_mapping = current_revision(page)
    PHASE = 'MC-01-mapping-submit'
    form.locator('button[type="submit"]').click()
    mapping_rev = wait_advance(page, before_mapping)
    PHASE = 'MC-01-local-projection'
    expect(page.locator('#grcWorkspace .grc-list')).to_contain_text(requirement_ref)
    verify_process_projection(page, 'MC-01', 'coverage', mapping_rev)
    return mapping_rev, scope_rev, framework_id, requirement_ref

try:
    with sync_playwright() as pw:
        launch = {'headless':True, 'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path'] = os.environ['ICTC_CHROMIUM']
        browser = pw.chromium.launch(**launch)
        ctx = browser.new_context(viewport={'width':1440,'height':950})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        page = ctx.new_page()
        page.set_default_timeout(30000)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))

        PHASE = 'bootstrap'
        page.goto(BASE+'/?view=processes', wait_until='networkidle')
        expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)
        initial = current_revision(page)
        assert initial == int(bootstrap(page).get('revision') or 0)
        no_overflow(page)

        openp(page, 'RN-01')
        page.locator('.procedure-frame:visible .procedure-primary').click()
        expect(page.locator('#contributionDialog')).to_be_visible()
        before = current_revision(page)
        fill_user(page.locator('#contributionDialog textarea[name="text"]'), 'Materiale end-user V2.1: aggiornamento normativo osservato e registrato senza conclusione automatica.', 'RN-01-material')
        fill_user(page.locator('#contributionDialog textarea[name="note"]'), 'RN-01 V2.1 journey material', 'RN-01-note')
        PHASE = 'RN-01-submit'
        page.locator('#contributionDialog button[type="submit"]').click()
        expect(page.locator('#contributionDialog')).not_to_be_visible()
        r1 = wait_advance(page, before)
        expect(page.locator('#contributionList')).to_contain_text('RN-01 V2.1 journey material')
        check_surface_revision(page, '#monitoringView', r1)
        verify_process_projection(page, 'RN-01', 'monitoring', r1)

        openp(page, 'EC-01')
        PHASE = 'EC-01-projection-ready'
        check_surface_revision(page, '#incidentsView', current_revision(page))
        PHASE = 'EC-01-open-intake'
        page.locator('.procedure-frame:visible .procedure-primary').click()
        expect(page.locator('#incidentDialog')).to_be_visible()
        before = current_revision(page)
        fill_user(page.locator('#incidentDialog textarea[name="originalNarrative"]'), 'EC-01 V2.1 journey: evento osservato durante verifica di convergenza delle proiezioni.', 'EC-01-narrative')
        fill_user(page.locator('#incidentDialog input[name="awarenessAt"]'), '2026-08-10T15:00', 'EC-01-awareness')
        PHASE = 'EC-01-submit'
        page.locator('#incidentDialog button[type="submit"]').click()
        expect(page.locator('#incidentDialog')).not_to_be_visible()
        r2 = wait_advance(page, before)
        expect(page.locator('#incidentList')).to_contain_text('EC-01 V2.1 journey')
        if page.locator('#incidentWorkspace').is_visible():
            page.locator('#incidentWorkspace button[aria-label="Chiudi"]').click()
        check_surface_revision(page, '#incidentsView', r2)
        verify_process_projection(page, 'EC-01', 'incidents', r2)

        def ao(form):
            fill_user(form.locator('input[name="name"]'), 'AO-01 V2.1 Inventory Object', 'AO-01-name')
            fill_user(form.locator('input[name="owner"]'), 'browser-v21', 'AO-01-owner')
        r3 = submit_grc(page, 'AO-01', 'objects', ao, 'AO-01 V2.1 Inventory Object')

        r4, mc_scope_rev, mc_framework, mc_requirement = submit_coverage(page)

        def ap(form):
            fill_user(form.locator('input[name="title"]'), 'AP-01 V2.1 Action', 'AP-01-title')
            fill_user(form.locator('textarea[name="description"]'), 'Azione creata dal journey end-user V2.1.', 'AP-01-description')
        r5 = submit_grc(page, 'AP-01', 'actions', ap, 'AP-01 V2.1 Action')

        def rc(form):
            fill_user(form.locator('input[name="title"]'), 'RC-01 V2.1 Risk', 'RC-01-title')
            fill_user(form.locator('textarea[name="description"]'), 'Scenario di rischio registrato dal journey end-user V2.1.', 'RC-01-description')
            select_user(form.locator('select[name="likelihood"]'), '2', 'RC-01-likelihood')
            select_user(form.locator('select[name="impact"]'), '3', 'RC-01-impact')
        r6 = submit_grc(page, 'RC-01', 'risks', rc, 'RC-01 V2.1 Risk')

        def ar(form):
            fill_user(form.locator('input[name="title"]'), 'AR-01 V2.1 Assurance', 'AR-01-title')
            fill_user(form.locator('textarea[name="requestText"]'), 'Richiesta assurance preservata dal journey end-user V2.1.', 'AR-01-request')
            fill_user(form.locator('input[name="source"]'), 'browser-v21', 'AR-01-source')
        r7 = submit_grc(page, 'AR-01', 'assurance', ar, 'AR-01 V2.1 Assurance')

        final_rev = current_revision(page)
        assert final_rev >= r7 > r6 > r5 > r4 > mc_scope_rev > r3 > r2 > r1 >= initial

        PHASE = 'home-projection'
        page.locator('.service-nav [data-service="home"]').click()
        check_surface_revision(page, '#homeView', final_rev)
        expect(page.locator('#homeView')).to_be_visible()
        no_overflow(page)

        PHASE = 'epistemic-explore'
        processes(page).click()
        expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)
        page.locator('.service-nav [data-service="proof"]').click()
        expect(page.locator('#proofView')).to_be_visible()
        page.wait_for_function('expected=>document.querySelector("#proofView")?.dataset.proofReadingOrder===expected', arg=PROOF_READING_ORDER)
        investigation = page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]')
        expect(investigation).to_have_count(1)
        expect(page.locator('#proofView #epistemicMetaCard')).to_have_count(0)
        assert investigation.get_attribute('open') is None
        investigation.locator(':scope > summary').click()
        action = investigation.locator('[data-service="epistemic"]')
        expect(action).to_be_visible()
        action.click()
        expect(page.locator('#epistemicView')).to_be_visible()
        page.wait_for_function('(r)=>Number(document.querySelector("#epistemicView")?.dataset.loadedRevision||0)>=r', arg=final_rev)
        expect(page.locator('[data-epistemic-mode="explore"]')).to_have_attribute('aria-pressed', 'true')
        expect(page.locator('.epistemic-level-nav')).to_contain_text('Quadro')
        clusters = page.locator('[data-explore-procedure]')
        assert clusters.count() > 0
        visible_procedures = clusters.evaluate_all('xs=>xs.map(x=>x.dataset.exploreProcedure)')
        assert any(pid in PROCS.values() for pid in visible_procedures), visible_procedures
        assert all(pid == 'cross-cutting' or pid in PROCS.values() or pid == 'epistemic-lattice' for pid in visible_procedures), visible_procedures
        drill_pid = 'actions' if 'actions' in visible_procedures else next(pid for pid in visible_procedures if pid in PROCS.values())

        PHASE = 'epistemic-drill'
        cluster = page.locator(f'[data-explore-procedure="{drill_pid}"]')
        expect(cluster).to_be_visible(); cluster.click()
        expect(page.locator('.epistemic-level-nav')).to_contain_text('Gruppi')
        family = page.locator('[data-explore-family]').first
        expect(family).to_be_visible(); family.click()
        expect(page.locator('.epistemic-level-nav')).to_contain_text('Relazioni')
        atom = page.locator('[data-explore-atom]').first
        expect(atom).to_be_visible(); atom.click()
        expect(page.locator('.epistemic-atom-readable')).to_be_visible()
        expect(page.locator('.epistemic-level-nav')).to_contain_text('Elemento')
        expect(page.locator('[data-surface-context-strip]:visible')).to_have_count(0)
        page.locator('[data-epistemic-level="overview"]').click()
        expect(page.locator('.epistemic-level-nav')).to_contain_text('Quadro')

        PHASE = 'same-digest-expert-modes'
        digest_before = page.locator('#epistemicPageLabel').get_attribute('data-projection-digest')
        open_technical_modes(page)
        page.locator('[data-epistemic-mode="flat"]').click(); expect(page.locator('.epistemic-table')).to_be_visible()
        digest_flat = page.locator('#epistemicPageLabel').get_attribute('data-projection-digest')
        open_technical_modes(page)
        page.locator('[data-epistemic-mode="graph"]').click(); expect(page.locator('.epistemic-graph-canvas')).to_be_visible()
        graph = page.locator('.epistemic-graph')
        focus = graph.get_attribute('data-epistemic-graph-focus') or ''
        nodes = int(graph.get_attribute('data-epistemic-graph-node-count') or '0')
        edges = int(graph.get_attribute('data-epistemic-graph-edge-count') or '0')
        assert focus and 1 <= nodes <= 24 and 0 <= edges <= 48, (focus,nodes,edges)
        assert page.locator(f'.epistemic-node-list [data-epistemic-node="{focus}"]').count() == 1
        digest_graph = page.locator('#epistemicPageLabel').get_attribute('data-projection-digest')
        assert digest_before == digest_flat == digest_graph
        no_overflow(page)
        page.screenshot(path=str(ART/'ux-v21-epistemic-explore-desktop.png'), full_page=True)

        PHASE = 'history-transition'
        processes(page).click()
        risk_card = page.locator('#procedureHub [data-process-code="RC-01"]')
        expect(risk_card).to_be_visible()
        risk_card.locator(':scope > footer .primary').click()
        expect(page.locator('#grcView')).to_be_visible()
        page.go_back(wait_until='networkidle'); expect(page.locator('#processesView')).to_be_visible()
        page.go_forward(wait_until='networkidle'); expect(page.locator('#grcView')).to_be_visible()

        PHASE = 'mobile'
        mcx = browser.new_context(viewport={'width':390,'height':844})
        mcx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','epistemic')")
        m = mcx.new_page(); m.goto(BASE+'/?view=epistemic', wait_until='networkidle')
        expect(m.locator('#epistemicView')).to_be_visible()
        m.wait_for_function('(r)=>Number(document.querySelector("#epistemicView")?.dataset.loadedRevision||0)>=r', arg=final_rev)
        expect(m.locator('[data-epistemic-mode="explore"]')).to_have_attribute('aria-pressed', 'true')
        no_overflow(m)
        m.screenshot(path=str(ART/'ux-v21-epistemic-explore-mobile.png'), full_page=True)
        mcx.close()

        PHASE = 'reduced-motion-route'
        rcx = browser.new_context(viewport={'width':1280,'height':850}, reduced_motion='reduce')
        rcx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        rp = rcx.new_page(); rp.goto(BASE+'/?view=processes', wait_until='networkidle')
        action_card = rp.locator('#procedureHub [data-process-code="AP-01"]')
        expect(action_card).to_be_visible()
        action_card.locator(':scope > footer .primary').click()
        expect(rp.locator('#grcView')).to_be_visible(); no_overflow(rp); rcx.close()

        assert not errors, errors
        out = {
            'ok':True,'profile':'2.1-procedure-journey+semantic-composition-3.1+s4-a3',
            'baseRevision':initial,'finalRevision':final_rev,'sevenVisibleUiWrites':list(PROCS.keys()),
            'coverageWrites':['standard-scope-decision','mapping-proposal'],'coverageFramework':mc_framework,
            'coverageRequirementRef':mc_requirement,'coverageEntryGrammar':'standard-library -> scope-disclosure -> scope-decision -> operational-mapping',
            'projectionConvergence':True,'surfaceRevisionStamp':True,'epistemicLoadedRevision':final_rev,
            'epistemicEntrySurface':'Evidenze ICTC / progressive canonical disclosure after evidence meaning','proofReadingOrder':PROOF_READING_ORDER,'duplicateProofMetaEntry':False,'epistemicPageProcedures':visible_procedures,'epistemicDrillProcedure':drill_pid,
            'exploreLevels':['Quadro','Gruppi','Relazioni','Elemento'],'sameProjectionDigestAcrossModes':True,
            'focusedGraphBounded':True,'focusedGraphLimits':{'nodes':24,'edges':48},
            'procedureIdentity':'canonical-frame','numericSignalWall':False,'contextStrip':False,
            'history':True,'mobileOverflow':False,'reducedMotionRoute':True,
            'evidenceClass':'E2-server-backed-browser+seven-procedure-writes+page-local-progressive-epistemic-exploration'
        }
        (ART/'browser-v2-1-procedure-journey.json').write_text(json.dumps(out, indent=2), encoding='utf8')
        print('browser-v2-1-procedure-journey: complete', flush=True)
        ctx.close(); browser.close()
except BaseException as e:
    fail(e); traceback.print_exc(); raise