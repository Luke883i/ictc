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
PHASE = 'initialization'
WATCHDOG = None


def annotation_escape(value):
    return str(value).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')


def write_failure(error_type, message, trace=''):
    payload = {'ok': False, 'phase': PHASE, 'type': error_type, 'message': message, 'traceback': trace}
    (ART / 'browser-stable-1-4-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    print(f'::error title=browser-stable-1-4::{annotation_escape(f"{PHASE}: {error_type}: {message}")}', flush=True)


def watchdog_expired():
    write_failure('WatchdogTimeout', 'phase exceeded 15 seconds')
    os._exit(2)


def enter_phase(name):
    global PHASE, WATCHDOG
    PHASE = name
    if WATCHDOG:
        WATCHDOG.cancel()
    print(f'browser-stable-1-4: {name}', flush=True)
    WATCHDOG = threading.Timer(15, watchdog_expired)
    WATCHDOG.daemon = True
    WATCHDOG.start()


def assert_contains(locator, text):
    observed = locator.inner_text().casefold()
    assert text.casefold() in observed, f'expected {text!r} in {observed!r}'


try:
    enter_phase('playwright-start')
    playwright = sync_playwright().start()
    launch = {'headless': True, 'args': ['--no-sandbox']}
    chromium = os.environ.get('ICTC_CHROMIUM')
    if chromium:
        launch['executable_path'] = chromium
    browser = playwright.chromium.launch(**launch)
    context = browser.new_context(viewport={'width': 1440, 'height': 1100})
    context.add_init_script("try{localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')}catch{}")
    page = context.new_page()
    page.set_default_timeout(10000)
    page.set_default_navigation_timeout(15000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    enter_phase('admin-first-experience')
    page.goto(f'{BASE}/', wait_until='networkidle')
    page.locator('#homeView[data-stable14="true"]').wait_for(state='visible')
    assert page.title() == 'ICTC 1.4 · Decisioni, fonti ed eventi'
    assert [item.strip() for item in page.locator('.service-nav button').all_inner_texts()] == ['Home', 'Monitoraggio', 'Eventi']
    assert page.locator('#homePrimaryAction').count() == 1
    decision_box = page.locator('.reborn-decision').bounding_box()
    assert decision_box and decision_box['height'] <= 330, decision_box
    authority = page.locator('#homeAuthority')
    authority.locator('summary').click()
    assert_contains(page.locator('#homeAuthorityMode'), 'Lettura e scrittura')
    assert_contains(page.locator('#homeAuthorityIdentity'), 'local-admin')
    assert page.locator('#homeAuthority .authority-grid section').count() == 5
    for selector in ['#homeAuthorityCan', '#homeAuthorityCannot', '#homeAuthorityEffects', '#homeAuthorityEvidence']:
        assert page.locator(selector).locator('li').count() > 0, selector

    enter_phase('user-authority')
    page.locator('#roleSelect').select_option('user')
    page.locator('#runtimeStatus').get_by_text('Utente', exact=False).wait_for()
    page.locator('[data-service="home"]').click()
    page.locator('#homeView').wait_for(state='visible')
    page.locator('#homeAuthority summary').click()
    assert_contains(page.locator('#homeAuthorityMode'), 'Lettura e contributo')
    assert_contains(page.locator('#homeAuthorityCan'), 'materiale')
    assert_contains(page.locator('#homeAuthorityCannot'), 'configurare')
    assert page.locator('#openAdminCenter').is_hidden()
    assert page.locator('#openSettings').is_hidden()

    enter_phase('auditor-authority')
    page.locator('#roleSelect').select_option('auditor')
    page.locator('#runtimeStatus').get_by_text('Auditor', exact=False).wait_for()
    page.locator('[data-service="home"]').click()
    page.locator('#homeView').wait_for(state='visible')
    assert page.locator('#homeAuthority').get_attribute('open') is not None
    assert_contains(page.locator('#homeAuthorityMode'), 'Sola lettura')
    assert_contains(page.locator('#homeAuthorityIdentity'), 'local-auditor')
    assert_contains(page.locator('#homeAuthorityCannot'), 'creare')
    assert_contains(page.locator('#homeAuthorityEffects'), 'non cambiano lo stato')
    assert_contains(page.locator('#homeAuthorityEvidence'), 'deployment')
    for selector in ['#openAdminCenter', '#openSettings', '#missionForm', '#openContribution', '#openIncident']:
        page.locator(selector).wait_for(state='hidden')

    enter_phase('server-profile')
    response = context.request.get(
        f'{BASE}/api/bootstrap',
        headers={'x-ictc-role': 'auditor', 'x-ictc-actor-id': 'local-auditor'},
        timeout=10000,
    )
    assert response.status == 200
    profile = response.json()['accessProfile']
    assert profile['mode'] == 'read-only'
    assert profile['authoritySource'] == 'server-issued'
    assert profile['actorId'] == 'local-auditor'

    enter_phase('ontology-labels')
    page.locator('[data-service="monitoring"]').click()
    page.locator('#monitoringView').wait_for(state='visible')
    assert_contains(page.locator('.contribute-card h2'), 'Aggiungi materiale')
    page.locator('[data-service="incidents"]').click()
    page.locator('#incidentsView').wait_for(state='visible')
    assert_contains(page.locator('#incidentsView .section-head h2'), 'Fascicoli evento')
    assert not errors, errors

    checks = [
        'stable-1-4-first-minute-orientation',
        'stable-1-4-compact-decision-height',
        'stable-1-4-plain-navigation',
        'stable-1-4-admin-authority-map',
        'stable-1-4-user-authority-map',
        'stable-1-4-auditor-authority-map-open',
        'stable-1-4-server-issued-profile',
        'stable-1-4-auditor-least-privilege',
        'stable-1-4-material-source-evidence-ontology',
    ]
    (ART / 'browser-stable-1-4-check.json').write_text(json.dumps({'ok': True, 'checks': checks}, indent=2), encoding='utf8')
    if WATCHDOG:
        WATCHDOG.cancel()
    print('browser-stable-1-4: evidence complete', flush=True)
    os._exit(0)
except Exception as error:
    if WATCHDOG:
        WATCHDOG.cancel()
    write_failure(type(error).__name__, str(error), traceback.format_exc())
    traceback.print_exc()
    os._exit(1)
