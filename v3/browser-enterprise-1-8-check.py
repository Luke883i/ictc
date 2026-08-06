import json
import os
import pathlib
import traceback
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
MOCK = os.environ.get('ICTC_MOCK_URL', 'http://127.0.0.1:4899').rstrip('/')
PHASE = 'initialization'


def annotate(error):
    message = str(error).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
    payload = {'ok': False, 'phase': PHASE, 'type': type(error).__name__, 'message': str(error), 'traceback': traceback.format_exc()}
    (ART / 'browser-enterprise-1-8-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    print(f'::error title=browser-enterprise-1-8::{PHASE}: {type(error).__name__}: {message}', flush=True)


def contains(locator, value):
    observed = (locator.text_content() or '').casefold()
    assert value.casefold() in observed, f'expected {value!r} in {observed!r}'


try:
    with sync_playwright() as playwright:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path'] = os.environ['ICTC_CHROMIUM']
        browser = playwright.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000})
        context.add_init_script("try{localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')}catch{}")
        page = context.new_page()
        page.set_default_timeout(12000)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        PHASE = 'balanced-home'
        page.goto(f'{BASE}/', wait_until='networkidle')
        page.locator('#homeView[data-enterprise18="true"]').wait_for(state='visible')
        assert page.title() == 'ICTC 1.8 · Enterprise Workbench'
        labels = [value.strip() for value in page.locator('.service-nav button').all_inner_texts()]
        assert labels == ['Panoramica', 'Ricerca normativa', 'Eventi e incidenti', 'Guida e prove'], labels
        assert page.locator('.process-lane').count() == 2
        contains(page.locator('[data-lane="monitoring"]'), 'Ricerca normativa')
        contains(page.locator('[data-lane="incidents"]'), 'Eventi e incidenti')
        home = page.locator('.workbench-home').bounding_box()
        recommendation = page.locator('.home-recommendation').bounding_box()
        assert home and home['height'] <= 760, home
        assert recommendation and recommendation['height'] <= 150, recommendation
        assert page.locator('#homeMonitoringAction').is_visible()
        assert page.locator('#homeIncidentAction').is_visible()

        PHASE = 'provider-and-settings-boundary'
        setup = page.locator('#homePrimaryAction')
        if setup.get_attribute('data-home-action') == 'settings':
            setup.click()
        else:
            assert page.locator('#openSettings').is_visible()
            page.locator('#openSettings').click()
        page.locator('#settingsDialog').wait_for(state='visible')
        sections = page.locator('#settingsForm > .settings-section-18, #settingsForm > .settings-18 > .settings-section-18')
        assert sections.count() == 3, sections.count()
        organization = page.locator('#settingsForm [data-settings-section="organization"]')
        provider = page.locator('#settingsForm [data-settings-section="provider"]')
        policy = page.locator('#settingsForm [data-settings-section="policy"]')
        assert organization.count() == provider.count() == policy.count() == 1
        if organization.get_attribute('open') is None:
            organization.locator(':scope > summary').click()
        if provider.get_attribute('open') is None:
            provider.locator(':scope > summary').click()
        settings = page.locator('#settingsForm')
        settings.locator('input[name="organizationName"]').fill('Enterprise Browser')
        settings.locator('textarea[name="organizationScope"]').fill('Ricerca normativa e incident response in Italia e UE')
        settings.locator('input[name="jurisdictions"]').fill('Italia, Unione europea')
        settings.locator('input[name="endpoint"]').fill(f'{MOCK}/v1/chat/completions')
        settings.locator('input[name="model"]').fill('mock-enterprise-18')
        settings.locator('input[name="apiKeyEnv"]').fill('ICTC_LLM_API_KEY')
        settings.get_by_role('button', name='Salva configurazione').click()
        page.locator('#settingsDialog').wait_for(state='hidden')

        PHASE = 'admin-regulatory-job-surface'
        page.locator('.service-nav [data-service="monitoring"]').click()
        page.locator('#monitoringView').wait_for(state='visible')
        contains(page.locator('#monitoringView h1'), 'Job di ricerca e novelty')
        assert page.get_by_text('Definisci cosa monitorare.', exact=True).count() == 0
        assert page.locator('#openJobConfig').is_visible()
        page.locator('#openJobConfig').click()
        page.locator('#jobDialog').wait_for(state='visible')
        for field in ['jobName', 'miningMode', 'noveltyBaseline', 'jurisdictions', 'authorities', 'resultLimit']:
            assert page.locator(f'#missionForm [name="{field}"]').count() == 1, field
        page.locator('[data-workbench-close="jobDialog"]').click()

        PHASE = 'user-single-material-intake'
        page.locator('#roleSelect').select_option('user')
        page.locator('#runtimeStatus').get_by_text('Utente', exact=False).wait_for()
        page.locator('.service-nav [data-service="home"]').click()
        assert page.locator('.process-lane').count() == 2
        page.locator('.service-nav [data-service="monitoring"]').click()
        assert page.locator('#openJobConfig').is_hidden()
        assert page.locator('#monitoringContributionAction:visible').count() == 1
        page.locator('#monitoringContributionAction').click()
        page.locator('#contributionDialog').wait_for(state='visible')
        assert page.locator('#contributionForm .intake-mode input').count() == 3
        page.locator('#contributionForm input[value="document"]').check()
        assert page.locator('#contributionForm input[name="files"]').is_visible()
        assert page.locator('#contributionForm input[name="links"]').is_hidden()
        page.locator('[data-close="contributionDialog"]').click()

        PHASE = 'compact-events-and-labels'
        page.locator('.service-nav [data-service="incidents"]').click()
        page.locator('#incidentsView').wait_for(state='visible')
        contains(page.locator('#incidentsView h1'), 'Registra e completa i fascicoli')
        hero = page.locator('#incidentsView > .hero').bounding_box()
        queue = page.locator('#incidentList').bounding_box()
        assert hero and hero['height'] <= 280, hero
        assert queue and queue['y'] < 720, queue
        page.locator('#openIncident').click()
        incident = page.locator('#incidentForm')
        incident.locator('textarea[name="originalNarrative"]').fill('Quasi incidente rilevato e contenuto senza impatto confermato')
        incident.get_by_role('button', name='Registra evento').click()
        page.locator('#incidentWorkspace').wait_for(state='visible')
        page.locator('[data-close="incidentWorkspace"]').click()
        page.locator('.service-nav [data-service="incidents"]').click()
        card = page.locator('.incident-card').first
        card.wait_for()
        assert card.get_by_role('button', name='Apri fascicolo').count() == 1
        assert card.get_by_role('button', name='Scarica evidenze').count() == 1
        unlabeled = page.locator('button:visible').evaluate_all("els => els.filter(el => !(el.innerText.trim() || el.getAttribute('aria-label') || el.getAttribute('title'))).map(el => el.outerHTML)")
        assert unlabeled == [], unlabeled

        PHASE = 'auditor-least-privilege'
        page.locator('#roleSelect').select_option('auditor')
        page.locator('#runtimeStatus').get_by_text('Auditor', exact=False).wait_for()
        page.locator('.service-nav [data-service="monitoring"]').click()
        assert page.locator('#openJobConfig').is_hidden()
        assert page.locator('#monitoringContributionAction').is_hidden()
        page.locator('.service-nav [data-service="incidents"]').click()
        assert page.locator('#openIncident').is_hidden()

        PHASE = 'keyboard'
        page.locator('.service-nav [data-service="home"]').focus()
        page.keyboard.press('Enter')
        page.locator('#homeView').wait_for(state='visible')
        page.locator('#homeMonitoringAction').focus()
        page.keyboard.press('Enter')
        page.locator('#monitoringView').wait_for(state='visible')

        PHASE = 'mobile-no-overflow'
        page.set_viewport_size({'width': 390, 'height': 844})
        page.locator('.service-nav [data-service="home"]').click()
        page.locator('#homeView').wait_for(state='visible')
        overflow = page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
        assert overflow <= 1, overflow
        for selector in ['#homeMonitoringAction', '#homeIncidentAction', '#homePrimaryAction']:
            box = page.locator(selector).bounding_box()
            assert box and box['height'] >= 44, (selector, box)
        assert not errors, errors

        checks = ['balanced-home-two-processes', 'compact-recommendation', 'three-settings-disclosures', 'provider-job-boundary', 'governed-job-fields', 'single-material-entry', 'explicit-material-mode', 'compact-event-queue', 'named-event-actions', 'unlabeled-controls-zero', 'auditor-zero-write', 'keyboard-navigation', 'mobile-no-overflow', 'minimum-targets']
        (ART / 'browser-enterprise-1-8-check.json').write_text(json.dumps({'schemaVersion': '1.8.0', 'ok': True, 'checks': checks, 'activeRelease': '1.8.0'}, indent=2), encoding='utf8')
        print('browser-enterprise-1-8: evidence complete', flush=True)
except BaseException as error:
    annotate(error)
    traceback.print_exc()
    raise
