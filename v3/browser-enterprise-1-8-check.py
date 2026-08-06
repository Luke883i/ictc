import json
import os
import pathlib
import threading
import traceback
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
MOCK = os.environ.get('ICTC_MOCK_URL', 'http://127.0.0.1:4899').rstrip('/')
PHASE = 'initialization'
WATCHDOG = None


def escape(value):
    return str(value).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')


def failure(error):
    payload = {'ok': False, 'phase': PHASE, 'type': type(error).__name__, 'message': str(error), 'traceback': traceback.format_exc()}
    (ART / 'browser-enterprise-1-8-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    print(f'::error title=browser-enterprise-1-8::{escape(PHASE + ": " + type(error).__name__ + ": " + str(error))}', flush=True)


def enter(name):
    global PHASE, WATCHDOG
    PHASE = name
    if WATCHDOG:
        WATCHDOG.cancel()
    print(f'browser-enterprise-1-8: {name}', flush=True)
    WATCHDOG = threading.Timer(20, lambda: os._exit(2))
    WATCHDOG.daemon = True
    WATCHDOG.start()


def contains(locator, expected):
    observed = locator.inner_text().casefold()
    assert expected.casefold() in observed, f'expected {expected!r} in {observed!r}'


try:
    playwright = sync_playwright().start()
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

    enter('balanced-home-admin')
    page.goto(f'{BASE}/', wait_until='networkidle')
    page.locator('#homeView[data-enterprise18="true"]').wait_for(state='visible')
    assert page.title() == 'ICTC 1.8 · Enterprise Workbench'
    labels = [value.strip() for value in page.locator('.service-nav button').all_inner_texts()]
    assert labels == ['Panoramica', 'Ricerca normativa', 'Eventi e incidenti', 'Guida e prove'], labels
    assert page.locator('.process-lane').count() == 2
    contains(page.locator('[data-lane="monitoring"]'), 'Ricerca normativa')
    contains(page.locator('[data-lane="incidents"]'), 'Eventi e incidenti')
    assert page.locator('[data-lane="monitoring"] button').is_visible()
    assert page.locator('[data-lane="incidents"] button').is_visible()
    home_box = page.locator('.workbench-home').bounding_box()
    assert home_box and home_box['height'] <= 760, home_box
    recommendation = page.locator('.home-recommendation').bounding_box()
    assert recommendation and recommendation['height'] <= 150, recommendation

    enter('configure-provider')
    page.locator('#openSettings').click()
    page.locator('#settingsDialog').wait_for(state='visible')
    assert page.locator('.settings-section-18').count() >= 3
    settings = page.locator('#settingsForm')
    settings.locator('input[name="organizationName"]').fill('Enterprise Browser')
    settings.locator('textarea[name="organizationScope"]').fill('Ricerca normativa e incident response in Italia e UE')
    settings.locator('input[name="jurisdictions"]').fill('Italia, Unione europea')
    settings.locator('input[name="endpoint"]').fill(f'{MOCK}/v1/chat/completions')
    settings.locator('input[name="model"]').fill('mock-enterprise-18')
    settings.locator('input[name="apiKeyEnv"]').fill('ICTC_LLM_API_KEY')
    settings.get_by_role('button', name='Salva configurazione').click()
    page.locator('#settingsDialog').wait_for(state='hidden')

    enter('governed-monitoring-job')
    page.locator('[data-service="monitoring"]').click()
    page.locator('#monitoringView').wait_for(state='visible')
    contains(page.locator('#monitoringView h1'), 'Job di ricerca e novelty')
    assert page.locator('#monitoringView').get_by_text('Definisci cosa monitorare.', exact=True).count() == 0
    page.locator('#openJobConfig').click()
    page.locator('#jobDialog').wait_for(state='visible')
    job = page.locator('#missionForm')
    for field in ['jobName', 'miningMode', 'noveltyBaseline', 'jurisdictions', 'authorities', 'resultLimit']:
        assert job.locator(f'[name="{field}"]').count() == 1, field
    job.locator('input[name="jobName"]').fill('Novelty NIS2 e DORA')
    job.locator('textarea[name="objective"]').fill('Individuare nuove fonti e modifiche ufficiali relative a NIS2 e DORA')
    job.locator('input[name="jurisdictions"]').fill('Italia, Unione europea')
    job.locator('input[name="authorities"]').fill('EUR-Lex, ACN')
    job.locator('input[name="resultLimit"]').fill('75')
    job.get_by_role('button', name='Genera piano del job').click()
    page.locator('#jobDialog').wait_for(state='hidden')
    page.get_by_text('Novelty NIS2 e DORA', exact=True).wait_for()
    assert page.locator('.mission-card [data-edit-job-profile]').count() == 1

    enter('single-material-intake-user')
    page.locator('#roleSelect').select_option('user')
    page.locator('#runtimeStatus').get_by_text('Utente', exact=False).wait_for()
    page.locator('[data-service="home"]').click()
    assert page.locator('.process-lane').count() == 2
    page.locator('[data-service="monitoring"]').click()
    page.locator('#monitoringView').wait_for(state='visible')
    assert page.locator('#openJobConfig').is_hidden()
    visible_material = page.get_by_role('button', name='Contribuisci materiale').filter(visible=True)
    assert visible_material.count() == 1, visible_material.count()
    visible_material.click()
    page.locator('#contributionDialog').wait_for(state='visible')
    assert page.locator('#contributionForm .intake-mode input').count() == 3
    page.locator('#contributionForm input[value="document"]').check()
    assert page.locator('#contributionForm input[name="files"]').is_visible()
    assert page.locator('#contributionForm input[name="links"]').is_hidden()
    page.locator('[data-close="contributionDialog"]').click()

    enter('compact-events-and-named-actions')
    page.locator('[data-service="incidents"]').click()
    page.locator('#incidentsView').wait_for(state='visible')
    contains(page.locator('#incidentsView h1'), 'Registra e completa i fascicoli')
    hero_box = page.locator('#incidentsView > .hero').bounding_box()
    list_box = page.locator('#incidentList').bounding_box()
    assert hero_box and hero_box['height'] <= 280, hero_box
    assert list_box and list_box['y'] < 720, list_box
    page.locator('#openIncident').click()
    page.locator('#incidentDialog textarea[name="narrative"]').fill('Quasi incidente rilevato e contenuto senza impatto confermato')
    page.locator('#incidentForm').get_by_role('button', name='Registra originale').click()
    page.locator('#incidentWorkspace').wait_for(state='visible')
    page.locator('[data-close="incidentWorkspace"]').click()
    page.locator('[data-service="incidents"]').click()
    page.locator('.incident-card').first.wait_for()
    assert page.locator('.incident-card').first.get_by_role('button', name='Apri fascicolo').count() == 1
    assert page.locator('.incident-card').first.get_by_role('button', name='Scarica evidenze').count() == 1

    enter('unlabeled-controls')
    unlabeled = page.locator('button:visible').evaluate_all("els => els.filter(el => !(el.innerText.trim() || el.getAttribute('aria-label') || el.getAttribute('title'))).map(el => el.outerHTML)")
    assert unlabeled == [], unlabeled

    enter('auditor-least-privilege')
    page.locator('#roleSelect').select_option('auditor')
    page.locator('#runtimeStatus').get_by_text('Auditor', exact=False).wait_for()
    page.locator('[data-service="monitoring"]').click()
    assert page.locator('#openJobConfig').is_hidden()
    assert page.locator('#monitoringContributionAction').is_hidden()
    page.locator('[data-service="incidents"]').click()
    assert page.locator('#openIncident').is_hidden()

    enter('keyboard-navigation')
    page.locator('[data-service="home"]').focus()
    page.keyboard.press('Enter')
    page.locator('#homeView').wait_for(state='visible')
    page.locator('#homeMonitoringAction').focus()
    page.keyboard.press('Enter')
    page.locator('#monitoringView').wait_for(state='visible')
    assert page.locator('#monitoringView').evaluate('node => !node.hidden')

    enter('mobile-no-overflow')
    page.set_viewport_size({'width': 390, 'height': 844})
    page.locator('[data-service="home"]').click()
    page.locator('#homeView').wait_for(state='visible')
    overflow = page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
    assert overflow <= 1, overflow
    for selector in ['#homeMonitoringAction', '#homeIncidentAction', '#homePrimaryAction']:
        box = page.locator(selector).bounding_box()
        assert box and box['height'] >= 44, (selector, box)

    assert not errors, errors
    checks = [
        'balanced-home-two-processes', 'compact-recommendation', 'provider-job-boundary',
        'governed-job-fields', 'job-created-and-projected', 'single-material-entry',
        'explicit-material-mode', 'compact-event-intake-and-queue', 'named-event-actions',
        'unlabeled-controls-zero', 'auditor-zero-write', 'keyboard-surface-navigation',
        'mobile-no-overflow', 'minimum-targets'
    ]
    payload = {'schemaVersion': '1.8.0', 'ok': True, 'checks': checks, 'activeRelease': '1.8.0'}
    (ART / 'browser-enterprise-1-8-check.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    if WATCHDOG:
        WATCHDOG.cancel()
    print('browser-enterprise-1-8: evidence complete', flush=True)
    os._exit(0)
except BaseException as error:
    if WATCHDOG:
        WATCHDOG.cancel()
    failure(error)
    traceback.print_exc()
    os._exit(1)
