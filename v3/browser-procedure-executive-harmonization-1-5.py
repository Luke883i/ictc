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
    page.locator('.service-nav [data-service="processes"]').click()
    card=page.locator(f'#procedureHub [data-process-code="{code}"]')
    expect(card).to_be_visible()
    primary=card.locator(':scope > footer .procedure-primary')
    expect(primary).to_have_text(LABELS[code])
    primary.click()
    expect(page.locator(root_for(code))).to_be_visible()
    expect(page.locator(f'{root_for(code)} > .procedure-decision-frame[data-executive-procedure="{IDS[code]}"]')).to_be_visible()

def check_frame(page,code):
    process_id=IDS[code]
    root=root_for(code)
    frame=page.locator(f'{root} > .procedure-decision-frame[data-executive-procedure="{process_id}"]')
    expect(frame).to_have_count(1)
    expect(frame).to_be_visible()
    assert frame.get_attribute('data-procedure-guidance-authority')=='procedure-guidance-projection'
    ux4=page.locator('html').get_attribute('data-a6-ux4-semantic')=='a6-ux4'
    legacy=frame.locator(':scope > details.composition-process-context')
    if ux4:
        anatomy=page.locator(f'{root} [data-procedure-anatomy="{process_id}"][data-a6-ux4-context="canonical"]')
        expect(anatomy).to_have_count(1)
        expect(anatomy).to_be_visible()
        summary=anatomy.locator(':scope > summary')
        expect(summary).to_have_attribute('aria-label','Contesto e tracciabilità')
        expect(summary).to_contain_text('Contesto e tracciabilità')
        if legacy.count():
            expect(legacy).to_be_hidden()
            expect(legacy).to_have_attribute('data-a6-ux4-context','superseded')
        page.wait_for_function("x=>{const r=document.querySelector(x.root),w=r?.querySelector(':scope > [data-procedure-attention-slot=\"'+x.pid+'\"] [data-procedure-worklist]');return !!(w?.dataset.a6Ux4Mount&&['native','fallback'].includes(r?.dataset.a6Ux4SingleCollection))}",arg={'root':root,'pid':process_id})
        owner=page.locator(root)
        assert owner.get_attribute('data-a6-ux4-single-collection') in ('native','fallback'), (code,owner.get_attribute('data-a6-ux4-single-collection'))
    else:
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
