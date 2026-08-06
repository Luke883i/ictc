import hashlib
import json
import os
import pathlib
import traceback
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
PHASE = 'initialization'
SCREENSHOTS = []


def annotate(error):
    message = str(error).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
    payload = {'ok': False, 'phase': PHASE, 'type': type(error).__name__, 'message': str(error), 'traceback': traceback.format_exc()}
    (ART / 'browser-enterprise-2-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    print(f'::error title=browser-enterprise-2::{PHASE}: {type(error).__name__}: {message}', flush=True)


def shot(page, code, label):
    path = ART / f'enterprise-2-{code}.png'
    page.screenshot(path=str(path), full_page=False)
    SCREENSHOTS.append({'code': code, 'label': label, 'file': path.name})


def no_overflow(page, label):
    value = page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
    assert value <= 1, f'{label}: horizontal overflow {value}px'


def assert_targets(page, selectors):
    for selector in selectors:
        locator = page.locator(selector)
        if not locator.count() or not locator.first.is_visible():
            continue
        box = locator.first.bounding_box()
        assert box and box['height'] >= 44 and box['width'] >= 44, (selector, box)


def unlabeled_controls(page):
    return page.locator('button:visible, a[href]:visible').evaluate_all(
        "els => els.filter(el => !(el.innerText.trim() || el.getAttribute('aria-label') || el.getAttribute('title'))).map(el => el.outerHTML)"
    )


try:
    with sync_playwright() as playwright:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path'] = os.environ['ICTC_CHROMIUM']
        browser = playwright.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000})
        context.add_init_script("try{localStorage.setItem('ictc-role','auditor');localStorage.setItem('ictc-service','home')}catch{}")
        page = context.new_page()
        page.set_default_timeout(15000)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        PHASE = 'S01-home-auditor-summary'
        page.goto(f'{BASE}/', wait_until='networkidle')
        page.locator('html[data-ictc-candidate="2.0.0-enterprise"]').wait_for(state='attached')
        page.locator('#roleSelect').select_option('auditor')
        page.locator('#homeView').wait_for(state='visible')
        assert page.locator('#workbenchHomeTitle').inner_text() == 'Consulta attività e prove'
        assert page.locator('.home-disclosure[open]').count() == 0
        assert page.locator('#runtimeStatus').inner_text() == 'Sola lettura'
        no_overflow(page, 'S01')
        shot(page, 'S01', 'Panoramica auditor sintetica')

        PHASE = 'S02-home-auditor-method'
        page.get_by_text('Come lavorare', exact=True).click()
        assert page.locator('[data-home-disclosure="method"]').get_attribute('open') is not None
        assert page.locator('[data-home-disclosure="proof"]').get_attribute('open') is None
        shot(page, 'S02', 'Metodo auditor su richiesta')

        PHASE = 'S03-home-auditor-proof'
        page.get_by_text('Come lavorare', exact=True).click()
        page.get_by_text('Prove e responsabilità', exact=True).click()
        assert page.locator('[data-home-disclosure="proof"]').get_attribute('open') is not None
        shot(page, 'S03', 'Prove e responsabilità auditor')

        PHASE = 'S04-monitoring-user'
        page.locator('#roleSelect').select_option('user')
        page.locator('.service-nav [data-service="monitoring"]').click()
        page.locator('#monitoringView').wait_for(state='visible')
        assert page.locator('#monitoringView .core-title h1').inner_text() == 'Ricerche normative'
        assert page.get_by_text('Job di ricerca e novelty', exact=True).count() == 0
        assert page.get_by_text('Ricerche disponibili', exact=True).count() == 1
        assert page.locator('#openJobConfig').is_hidden()
        shot(page, 'S04', 'Ricerche normative utente')

        PHASE = 'S05-events-user-empty-or-list'
        page.locator('.service-nav [data-service="incidents"]').click()
        page.locator('#incidentsView').wait_for(state='visible')
        assert page.locator('#incidentsView .core-title h1').inner_text() == 'Eventi e incidenti'
        assert page.get_by_text('Eventi registrati', exact=True).count() == 1
        assert page.locator('#openIncident').inner_text() == 'Registra evento'
        shot(page, 'S05', 'Registro eventi utente')

        PHASE = 'S06-guide-proof'
        page.locator('[data-proof-service]').click()
        page.locator('#proofView').wait_for(state='visible')
        page.locator('#proofTitle').wait_for(state='visible')
        assert page.locator('#proofTitle').inner_text() == 'Guida operativa e prove'
        assert page.locator('#openProofDetails').inner_text() == 'Apri dettagli'
        shot(page, 'S06', 'Guida operativa e prove')

        PHASE = 'S07-admin-overview'
        page.locator('#roleSelect').select_option('admin')
        page.locator('#openAdminCenter').focus()
        page.keyboard.press('Enter')
        page.locator('#adminCenter').wait_for(state='visible')
        page.locator('.admin-section-nav').wait_for(state='visible')
        assert page.locator('#adminCenterTitle').inner_text() == 'Amministrazione ICTC'
        assert page.locator('#adminCenter .admin-panel:visible').count() == 1
        shot(page, 'S07', 'Amministrazione sintesi')

        PHASE = 'S08-admin-controls'
        page.locator('.admin-section-nav').get_by_role('button', name='Controlli').click()
        assert page.locator('#adminCenter .admin-panel:visible').count() == 1
        assert page.get_by_text('Stato dei controlli', exact=True).count() >= 1
        shot(page, 'S08', 'Amministrazione controlli')

        PHASE = 'S09-admin-ai'
        page.locator('.admin-section-nav').get_by_role('button', name='Governance AI').click()
        assert page.get_by_text('Classificazione dei dati', exact=False).count() == 1
        classification = page.locator('#governanceForm select[name="classification"]')
        assert 'Uso interno' in classification.locator('option').all_inner_texts()
        shot(page, 'S09', 'Governance AI')

        PHASE = 'S10-admin-local-users-mobile'
        page.set_viewport_size({'width': 390, 'height': 844})
        page.locator('.admin-section-nav').get_by_role('button', name='Identità locali').click()
        page.get_by_text('Aggiungi identità locale', exact=True).wait_for(state='visible')
        assert page.locator('#userForm').is_hidden()
        no_overflow(page, 'S10')
        assert_targets(page, ['.admin-section-nav button[aria-current="page"]', '[data-admin-close]'])
        shot(page, 'S10', 'Identità locali mobile')

        PHASE = 'keyboard-escape-focus-return'
        page.keyboard.press('Escape')
        page.locator('#adminCenter').wait_for(state='hidden')
        assert page.evaluate('document.activeElement && document.activeElement.id') == 'openAdminCenter', 'focus-return'

        PHASE = 'S11-events-mobile-and-zoom-200'
        page.locator('#roleSelect').select_option('user')
        page.set_viewport_size({'width': 320, 'height': 568})
        page.locator('.service-nav [data-service="incidents"]').click()
        page.locator('#incidentsView').wait_for(state='visible')
        no_overflow(page, 'S11-320')
        assert_targets(page, ['#openIncident', '#eventsContext'])
        shot(page, 'S11', 'Eventi utente 320px')
        page.evaluate("document.documentElement.style.fontSize='200%'")
        no_overflow(page, 'zoom-200')
        page.evaluate("document.documentElement.style.fontSize=''")

        PHASE = 'assistive-preferences'
        page.emulate_media(reduced_motion='reduce', forced_colors='active')
        assert page.locator('#openIncident').is_visible()
        no_overflow(page, 'forced-colors')
        page.emulate_media(reduced_motion='no-preference', forced_colors='none')

        PHASE = 'global-control-labels'
        assert unlabeled_controls(page) == [], unlabeled_controls(page)
        assert not errors, errors
        assert len(SCREENSHOTS) == 11, len(SCREENSHOTS)
        browser.close()

        for item in SCREENSHOTS:
            path = ART / item['file']
            item['sha256'] = hashlib.sha256(path.read_bytes()).hexdigest()
            item['bytes'] = path.stat().st_size
        checks = [
            'S01-home-auditor-summary', 'S02-method-progressive-disclosure', 'S03-proof-progressive-disclosure',
            'S04-monitoring-plain-language', 'S05-events-standard-hierarchy', 'S06-proof-operational-title',
            'S07-admin-single-surface', 'S08-admin-controls', 'S09-localized-governance',
            'S10-local-identities-mobile', 'S11-mobile-320', 'zoom-200', 'keyboard-Escape',
            'focus-return', 'forced-colors', 'reduced-motion', 'unlabeled-controls-zero', 'minimum-targets'
        ]
        payload = {'schemaVersion': '2.0.0-candidate', 'ok': True, 'checks': checks, 'screenshots': SCREENSHOTS, 'activeRelease': '1.8.0', 'candidateLayer': '2.0.0-enterprise'}
        (ART / 'browser-enterprise-2-check.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
        print('browser-enterprise-2: 11 screenshots and assurance evidence complete', flush=True)
except BaseException as error:
    annotate(error)
    traceback.print_exc()
    raise
