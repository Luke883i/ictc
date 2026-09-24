import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'
LABELS={'RN-01':'Sorveglia fonti','EC-01':'Gestisci eventi','AO-01':'Verifica inventario','MC-01':'Valuta norme e controlli','AP-01':'Gestisci remediation','RC-01':'Valuta rischi','AR-01':'Gestisci questionari'}
IDS={'RN-01':'monitoring','EC-01':'incidents','AO-01':'objects','MC-01':'coverage','AP-01':'actions','RC-01':'risks','AR-01':'assurance'}

def root_for(code):
    process_id=IDS[code]
    return '#monitoringView' if process_id=='monitoring' else '#incidentsView' if process_id=='incidents' else '#grcWorkspace'

def no_overflow(page):
    measured=page.evaluate('()=>[innerWidth,document.documentElement.scrollWidth,document.body.scrollWidth]')
    assert measured[1]<=measured[0]+2 and measured[2]<=measured[0]+2, measured

def openp(page,code):
    global PHASE
    process_id=IDS[code]
    root=root_for(code)
    PHASE=f'{code}-open-nav'
    page.locator('.service-nav [data-service="processes"]').click()
    PHASE=f'{code}-open-card'
    card=page.locator(f'#procedureHub [data-process-code="{code}"]')
    expect(card).to_be_visible()
    PHASE=f'{code}-open-action'
    primary=card.locator(':scope > footer .procedure-primary')
    expect(primary).to_have_text(LABELS[code])
    primary.click()
    PHASE=f'{code}-open-root'
    expect(page.locator(root)).to_be_visible()
    PHASE=f'{code}-open-frame'
    frame=page.locator(f'{root} > .procedure-decision-frame[data-executive-procedure="{process_id}"]')
    expect(frame).to_have_count(1)
    ux4=page.locator('html').get_attribute('data-a6-ux4-semantic')=='a6-ux4'
    if not ux4:
        expect(frame).to_be_visible()

def check_frame(page,code):
    global PHASE
    process_id=IDS[code]
    root=root_for(code)
    frame=page.locator(f'{root} > .procedure-decision-frame[data-executive-procedure="{process_id}"]')
    expect(frame).to_have_count(1)
    ux4=page.locator('html').get_attribute('data-a6-ux4-semantic')=='a6-ux4'
    if not ux4:
        expect(frame).to_be_visible()
    assert frame.get_attribute('data-procedure-guidance-authority')=='procedure-guidance-projection'
    legacy=frame.locator(':scope > details.composition-process-context')
    if ux4:
        PHASE=f'{code}-ux4-convergence'
        page.wait_for_function("""x=>{
            const r=document.querySelector(x.root);
            if(!r)return false;
            const frame=r.querySelector(`:scope > .procedure-decision-frame[data-executive-procedure="${x.pid}"]`);
            const a=r.querySelector(`[data-procedure-anatomy="${x.pid}"][data-a6-ux4-context="canonical"]`);
            const s=a?.querySelector(':scope > summary');
            const legacy=frame?.querySelector(':scope > details.composition-process-context');
            const w=r.querySelector(`:scope > [data-procedure-attention-slot="${x.pid}"] [data-procedure-worklist]`);
            const predecessorReady=!!(frame&&frame.dataset.procedureGuidanceAuthority==='procedure-guidance-projection');
            const anatomyReady=!!(a&&a.getClientRects().length&&s?.getAttribute('aria-label')==='Contesto e pratiche applicate'&&(s.textContent||'').includes('Contesto e pratiche applicate'));
            const legacyReady=!legacy||(legacy.hidden&&legacy.dataset.a6Ux4Context==='superseded');
            const collectionReady=!!(w?.dataset.a6Ux4Mount&&['native','fallback'].includes(r.dataset.a6Ux4SingleCollection));
            return predecessorReady&&anatomyReady&&legacyReady&&collectionReady;
        }""",arg={'root':root,'pid':process_id})
        PHASE=f'{code}-ux4-assert'
        anatomy=page.locator(f'{root} [data-procedure-anatomy="{process_id}"][data-a6-ux4-context="canonical"]')
        expect(anatomy).to_have_count(1)
        expect(anatomy).to_be_visible()
        summary=anatomy.locator(':scope > summary')
        expect(summary).to_have_attribute('aria-label','Contesto e pratiche applicate')
        expect(summary).to_contain_text('Contesto e pratiche applicate')
        if legacy.count():
            expect(legacy).to_be_hidden()
            expect(legacy).to_have_attribute('data-a6-ux4-context','superseded')
        owner=page.locator(root)
        assert owner.get_attribute('data-a6-ux4-single-collection') in ('native','fallback'), (code,owner.get_attribute('data-a6-ux4-single-collection'))
    else:
        PHASE=f'{code}-legacy-context'
        expect(legacy).to_have_count(1)
        expect(legacy.locator(':scope > summary')).to_have_text('Contesto decisionale')
        assert legacy.get_attribute('open') is None
        assert frame.evaluate('e=>{const work=e.previousElementSibling;return !!work}')
    return frame

try:
    with sync_playwright() as pw:
        launch={'headless':True}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        ctx=browser.new_context(viewport={'width':1440,'height':950})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        page=ctx.new_page(); page.set_default_timeout(30000)
        page.goto(BASE+'/?view=processes',wait_until='networkidle')

        PHASE='hub'
        expect(page.locator('#procedureHub .executive-process-card')).to_have_count(7)
        assert 'da decidere' not in page.locator('#procedureHub').inner_text()
        assert 'Nessuna attenzione aperta' not in page.locator('#procedureHub').inner_text()
        for code in LABELS:
            card=page.locator(f'#procedureHub [data-process-code="{code}"]')
            evidence=card.locator(':scope > footer .executive-evidence-inline')
            expect(evidence).to_have_count(1)
            assert 'Prova' in (evidence.text_content() or '')
            assert evidence.evaluate('e=>getComputedStyle(e).display')=='none'
            signals=card.locator(':scope > footer .procedure-signals')
            if signals.count():
                assert signals.evaluate('e=>getComputedStyle(e).display')=='none'
        no_overflow(page)
        page.screenshot(path=str(ART/'ux-finetune-executive-hub.png'),full_page=True)

        for code in LABELS:
            PHASE=code
            openp(page,code)
            check_frame(page,code)
            PHASE=f'{code}-overflow'
            no_overflow(page)

        PHASE='rc'
        openp(page,'RC-01')
        expect(page.locator('#grcWorkspace .grc-heat h3')).to_have_text('Matrice dei rischi valutati')
        expect(page.locator('#grcWorkspace nav [data-grc-process="actions"]')).to_have_text('Azioni correttive')

        PHASE='ar'
        openp(page,'AR-01')
        expect(page.locator('#grcWorkspace nav [data-grc-process="assurance"]')).to_have_text('Questionari e verifiche')

        PHASE='mobile-hub'
        mobile=browser.new_context(viewport={'width':390,'height':844})
        mobile.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        m=mobile.new_page(); m.set_default_timeout(30000)
        m.goto(BASE+'/?view=processes',wait_until='networkidle')
        no_overflow(m)
        PHASE='mobile-ar'
        openp(m,'AR-01')
        check_frame(m,'AR-01')
        PHASE='mobile-ar-overflow'
        no_overflow(m)
        mobile.close()

        out={
            'ok':True,
            'profile':'procedure-executive-harmonization-1.5+semantic-composition-3.1+ui-finetuning-3.4+a6-ux4-context-aware',
            'procedures':list(LABELS),
            'canonicalMetricSignalsPreservedButHidden':True,
            'catalogueEvidenceAnnotationPreservedButHidden':True,
            'decisionContextProgressiveDisclosure':True,
            'canonicalContextOwnerAware':True,
            'predecessorAuthorityPreservedWhenContextSuperseded':True,
            'workBeforeDecisionContext':True,
            'conditionBasedProcessReadiness':True,
            'mobileOverflow':False,
            'evidenceClass':'E2 server-backed browser; not human usability, legal review or independent assurance'
        }
        (ART/'browser-procedure-finetuning-1-4-executive.json').write_text(json.dumps(out,indent=2),encoding='utf8')
        print('browser-procedure-executive-harmonization-1-5: complete',flush=True)
        ctx.close(); browser.close()
except BaseException as e:
    (ART/'browser-procedure-finetuning-1-4-executive-error.json').write_text(json.dumps({'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()},indent=2),encoding='utf8')
    print(f'::error title=browser-procedure-executive-harmonization::{PHASE}: {type(e).__name__}: {e}',flush=True)
    raise
