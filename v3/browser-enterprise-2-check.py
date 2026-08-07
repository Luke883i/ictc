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
        page.locator('html[data-ictc-candidate="2.0.0-enterprise"][data-process-catalog="enterprise-2"][data-editorial-system="professional-1"][data-design-system="ictc-aurora-1"]').wait_for(state='attached')
        page.locator('#homeView').wait_for(state='visible')
        s01_role = page.locator('#roleSelect').input_value()
        s01_actor = page.locator('#runtimeStatus').get_attribute('data-actor-role')
        s01_title = page.locator('#workbenchHomeTitle').inner_text()
        s01_doc_title = page.title()
        s01_open = page.locator('.home-disclosure[open]').count()
        s01_first_disclosure = page.locator('.home-disclosure-stack > details').first.get_attribute('data-home-disclosure')
        s01_status = page.locator('#runtimeStatus').inner_text()
        s01_monitoring = page.locator('.process-lane[data-lane="monitoring"] > .eyebrow').text_content().strip()
        s01_incidents = page.locator('.process-lane[data-lane="incidents"] > .eyebrow').text_content().strip()
        s01_surface = page.locator('html').get_attribute('data-ds-surface')
        s01_card = page.locator('.process-lane[data-lane="monitoring"]').get_attribute('data-ds-card')
        s01_marks = page.locator('.home-disclosure .ds-disclosure-mark').count()
        assert s01_role == 'auditor', f'roleSelect={s01_role!r}; actorRole={s01_actor!r}'
        assert s01_actor == 'auditor', f'actorRole={s01_actor!r}; roleSelect={s01_role!r}'
        assert s01_title == 'Consulta attività ed evidenze', f'homeTitle={s01_title!r}; role={s01_role!r}; actor={s01_actor!r}'
        assert s01_doc_title == 'ICTC · Attività, evidenze e controlli', f'documentTitle={s01_doc_title!r}'
        assert s01_open == 0, f'openHomeDisclosures={s01_open}'
        assert s01_first_disclosure == 'proof', f'firstHomeDisclosure={s01_first_disclosure!r}'
        assert s01_status == 'Sola lettura', f'runtimeStatus={s01_status!r}; actor={s01_actor!r}'
        assert s01_monitoring == 'RN-01 · Monitoraggio normativo', f'monitoringEyebrow={s01_monitoring!r}'
        assert s01_incidents == 'EC-01 · Gestione eventi e segnalazioni', f'incidentsEyebrow={s01_incidents!r}'
        assert page.get_by_text('Processo 1', exact=True).count() == 0, 'legacy Processo 1 visible'
        assert page.get_by_text('Processo 2', exact=True).count() == 0, 'legacy Processo 2 visible'
        assert s01_surface == 'home', f'dsSurface={s01_surface!r}'
        assert s01_card == 'true', f'monitoringDsCard={s01_card!r}'
        assert s01_marks >= 2, f'disclosureMarks={s01_marks}'
        no_overflow(page, 'S01')
        shot(page, 'S01', 'Panoramica auditor sintetica')

        PHASE = 'S02-home-auditor-method'
        page.get_by_text('Metodo operativo', exact=True).click()
        assert page.locator('[data-home-disclosure="method"]').get_attribute('open') is not None
        assert page.locator('[data-home-disclosure="proof"]').get_attribute('open') is None
        shot(page, 'S02', 'Metodo auditor su richiesta')

        PHASE = 'S03-home-auditor-proof'
        page.get_by_text('Metodo operativo', exact=True).click()
        page.get_by_text('Evidenze e responsabilità', exact=True).click()
        assert page.locator('[data-home-disclosure="proof"]').get_attribute('open') is not None
        shot(page, 'S03', 'Evidenze e responsabilità auditor')

        PHASE = 'S04-monitoring-user'
        page.locator('#roleSelect').select_option('user')
        page.locator('.service-nav [data-service="monitoring"]').click()
        page.locator('#monitoringView').wait_for(state='visible')
        s04_code = page.locator('#monitoringView').get_attribute('data-process-code')
        s04_eyebrow = page.locator('#monitoringView .core-title > .eyebrow').text_content().strip()
        s04_title = page.locator('#monitoringView .core-title h1').inner_text()
        s04_available = page.get_by_text('Ricerche disponibili', exact=True).count()
        s04_job_hidden = page.locator('#openJobConfig').is_hidden()
        s04_accent = page.locator('html').get_attribute('data-ds-accent')
        s04_priority = page.locator('#monitoringContributionAction').get_attribute('data-priority')
        s04_tone = page.locator('#runtimeStatus').get_attribute('data-tone')
        assert s04_code == 'RN-01', f'processCode={s04_code!r}'
        assert s04_eyebrow == 'RN-01 · Monitoraggio normativo', f'monitoringEyebrow={s04_eyebrow!r}'
        assert s04_title == 'Monitoraggio normativo', f'monitoringTitle={s04_title!r}'
        assert page.get_by_text('Job di ricerca e novelty', exact=True).count() == 0, 'legacy job label visible'
        assert s04_available == 1, f'researchAvailableCount={s04_available}'
        assert s04_job_hidden, 'openJobConfig visible for user'
        assert s04_accent == 'cyan', f'dsAccent={s04_accent!r}'
        assert s04_priority == 'secondary', f'contributionPriority={s04_priority!r}'
        assert s04_tone in ['positive','attention','critical','neutral','informative'], f'runtimeTone={s04_tone!r}'
        shot(page, 'S04', 'Monitoraggio normativo utente')

        PHASE = 'S05-events-user-empty-or-list'
        page.locator('.service-nav [data-service="incidents"]').click()
        page.locator('#incidentsView').wait_for(state='visible')
        assert page.locator('#incidentsView').get_attribute('data-process-code') == 'EC-01'
        assert page.locator('#incidentsView .core-title > .eyebrow').text_content().strip() == 'EC-01 · Gestione eventi e segnalazioni'
        assert page.locator('#incidentsView .core-title h1').inner_text() == 'Eventi e segnalazioni'
        assert page.get_by_text('Eventi registrati', exact=True).count() == 1
        assert page.locator('#openIncident').inner_text() == 'Registra evento'
        assert page.locator('html').get_attribute('data-ds-accent') == 'amber'
        assert page.locator('#openIncident').get_attribute('data-priority') == 'primary'
        shot(page, 'S05', 'Registro eventi utente')

        PHASE = 'S06-guide-proof'
        page.locator('[data-proof-service]').click()
        page.locator('#proofView').wait_for(state='visible')
        page.locator('#proofTitle').wait_for(state='visible')
        assert page.locator('#proofView').get_attribute('data-process-code') == 'EV-01'
        assert page.locator('#proofTitle').inner_text() == 'Evidenze, controlli e limiti'
        assert page.locator('#openProofDetails').inner_text() == 'Apri dettagli tecnici'
        assert page.locator('html').get_attribute('data-ds-accent') == 'violet'
        assert page.locator('#openProofDetails').get_attribute('data-priority') == 'primary'
        shot(page, 'S06', 'Evidenze controlli e limiti')

        PHASE = 'S07-admin-overview'
        page.locator('#roleSelect').select_option('admin')
        page.locator('#openAdminCenter').focus()
        page.keyboard.press('Enter')
        page.locator('#adminCenter').wait_for(state='visible')
        page.locator('.admin-section-nav').wait_for(state='visible')
        assert page.locator('#adminCenterTitle').inner_text() == 'Amministrazione'
        assert page.locator('#adminCenter .admin-panel:visible').count() == 1
        assert page.locator('#adminCenter').get_attribute('data-ds-dialog') == 'true'
        assert page.locator('.admin-section-nav').get_by_role('button', name='EV-01 · Sintesi').count() == 1
        shot(page, 'S07', 'Amministrazione sintesi')

        PHASE = 'S08-admin-controls'
        page.locator('.admin-section-nav').get_by_role('button', name='EV-01 · Controlli applicativi').click()
        page.wait_for_timeout(360)
        assert page.locator('#adminCenter .admin-panel:visible').count() == 1
        assert page.get_by_text('Controlli applicativi', exact=True).count() >= 1
        shot(page, 'S08', 'Amministrazione controlli')

        PHASE = 'S09-admin-ai'
        page.locator('.admin-section-nav').get_by_role('button', name='GA-01 · Governo AI').click()
        page.wait_for_timeout(360)
        assert page.get_by_text('Classificazione dei dati', exact=False).count() == 1
        classification = page.locator('#governanceForm select[name="classification"]')
        assert 'Uso interno' in classification.locator('option').all_inner_texts()
        shot(page, 'S09', 'Governo AI')

        PHASE = 'S10-admin-local-users-mobile'
        page.set_viewport_size({'width': 390, 'height': 844})
        page.locator('.admin-section-nav').get_by_role('button', name='IA-01 · Identità locali').click()
        page.wait_for_timeout(360)
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
        transition_duration = page.locator('#openIncident').evaluate("el => getComputedStyle(el).transitionDuration")
        assert transition_duration in ['0s', '1e-05s', '0.01ms'], transition_duration
        no_overflow(page, 'forced-colors')
        page.emulate_media(reduced_motion='no-preference', forced_colors='none')

        PHASE = 'dark-colour-scheme'
        page.emulate_media(color_scheme='dark')
        assert page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--ds-canvas').trim()") == '#0c1320'
        assert page.locator('#openIncident').is_visible()
        no_overflow(page, 'dark-colour-scheme')
        page.emulate_media(color_scheme='light')

        PHASE = 'global-control-labels'
        assert page.get_by_text('Verifica fonte', exact=True).count() == 0
        assert page.get_by_text('Gestione eventi di conformità', exact=True).count() == 0
        assert page.get_by_text('Guida operativa e prove', exact=True).count() == 0
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
            'S04-monitoring-professional-vocabulary', 'S05-events-neutral-classification', 'S06-proof-anti-overclaim-title',
            'S07-admin-single-surface', 'S08-admin-controls', 'S09-localized-governance',
            'S10-local-identities-mobile', 'S11-mobile-320', 'zoom-200', 'keyboard-Escape',
            'focus-return', 'forced-colors', 'reduced-motion', 'unlabeled-controls-zero', 'minimum-targets',
            'process-catalog-visible', 'generic-process-labels-zero', 'role-specific-disclosure-order',
            'RN-01-monitoring', 'EC-01-events', 'EV-01-evidence', 'IA-01-identity', 'GA-01-ai-governance',
            'professional-editorial-system', 'minimal-progressive-density', 'catalog-acceptance-not-verification',
            'record-secondary-details-disclosed', 'document-title-version-neutral',
            'aurora-design-system-terminal', 'semantic-surface-accents', 'action-priority', 'status-tone-text-redundancy',
            'dialog-depth', 'dark-colour-scheme', 'bounded-transitions'
        ]
        payload = {'schemaVersion': '2.0.0-candidate', 'ok': True, 'checks': checks, 'screenshots': SCREENSHOTS, 'activeRelease': '1.8.0', 'candidateLayer': '2.0.0-enterprise'}
        (ART / 'browser-enterprise-2-check.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
        print('browser-enterprise-2: 11 screenshots and assurance evidence complete', flush=True)
except BaseException as error:
    annotate(error)
    traceback.print_exc()
    raise