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
    payload = {
        'ok': False,
        'phase': PHASE,
        'type': error_type,
        'message': message,
        'traceback': trace,
    }
    (ART / 'browser-auditor-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    summary = f'{PHASE}: {error_type}: {message}'
    print(f'::error title=browser-auditor-check::{annotation_escape(summary)}', flush=True)


def watchdog_expired():
    write_failure('WatchdogTimeout', 'phase exceeded 12 seconds')
    os._exit(2)


def enter_phase(name):
    global PHASE, WATCHDOG
    PHASE = name
    if WATCHDOG:
        WATCHDOG.cancel()
    print(f'browser-auditor-check: {PHASE}', flush=True)
    WATCHDOG = threading.Timer(12, watchdog_expired)
    WATCHDOG.daemon = True
    WATCHDOG.start()


def fail(error):
    if WATCHDOG:
        WATCHDOG.cancel()
    write_failure(type(error).__name__, str(error), traceback.format_exc())
    traceback.print_exc()
    os._exit(1)


try:
    enter_phase('playwright-start')
    playwright = sync_playwright().start()
    launch = {'headless': True, 'args': ['--no-sandbox']}
    chromium = os.environ.get('ICTC_CHROMIUM')
    if chromium:
        launch['executable_path'] = chromium
    browser = playwright.chromium.launch(**launch)
    context = browser.new_context(viewport={'width': 1280, 'height': 1000})
    context.add_init_script("try{localStorage.setItem('ictc-role','auditor');localStorage.setItem('ictc-service','home')}catch{}")
    page = context.new_page()
    page.set_default_timeout(10000)
    page.set_default_navigation_timeout(15000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    enter_phase('auditor-bootstrap')
    page.goto(f'{BASE}/', wait_until='domcontentloaded')

    enter_phase('auditor-observed-state')
    page.wait_for_timeout(1000)
    closed = page.is_closed()
    status_count = 0 if closed else page.locator('#runtimeStatus').count()
    role_count = 0 if closed else page.locator('#roleSelect').count()
    observed = {
        'url': None if closed else page.url,
        'closed': closed,
        'statusCount': status_count,
        'roleSelectCount': role_count,
        'pageErrors': list(errors),
    }
    if not closed and status_count:
        status = page.locator('#runtimeStatus')
        observed.update({
            'text': status.inner_text(timeout=1000),
            'actorRole': status.get_attribute('data-actor-role', timeout=1000),
            'selectedRole': page.locator('#roleSelect').input_value(timeout=1000) if role_count else None,
            'storedRole': page.evaluate("localStorage.getItem('ictc-role')"),
            'storedService': page.evaluate("localStorage.getItem('ictc-service')"),
        })
    assert not closed and status_count == 1 and role_count == 1, json.dumps(observed, ensure_ascii=False)
    assert observed.get('actorRole') == 'auditor', json.dumps(observed, ensure_ascii=False)
    assert 'Auditor' in observed.get('text', ''), json.dumps(observed, ensure_ascii=False)
    assert observed.get('selectedRole') == 'auditor', json.dumps(observed, ensure_ascii=False)
    assert observed.get('storedRole') == 'auditor', json.dumps(observed, ensure_ascii=False)
    assert observed.get('storedService') == 'home', json.dumps(observed, ensure_ascii=False)

    enter_phase('auditor-server-identity')
    bootstrap = context.request.get(
        f'{BASE}/api/bootstrap',
        headers={'x-ictc-role': 'auditor', 'x-ictc-actor-id': 'local-auditor'},
        timeout=10000,
    )
    assert bootstrap.status == 200
    body = bootstrap.json()
    assert body['actor']['role'] == 'auditor'

    enter_phase('auditor-home-guidance')
    page.locator('#homeView').wait_for(state='visible')
    page.get_by_role('heading', name='Consulta le evidenze disponibili', exact=True).wait_for()
    page.locator('#homePrimaryAction').get_by_text('Apri le evidenze', exact=True).wait_for()
    assert page.locator('#homeJourney .journey-step').count() == 4
    assert 'sola lettura' in page.locator('#homeSummary').inner_text().lower()
    assert 'auditor' in page.locator('#homeWhyMe').inner_text().lower()
    page.locator('.trust-brief summary').click()
    assert 'non verità sostanziale' in page.locator('#homeEvidence').inner_text().lower()
    assert 'decisioni restano attribuite' in page.locator('#homeHumanGate').inner_text().lower()
    for selector in ['#openAdminCenter', '#openSettings']:
        page.locator(selector).wait_for(state='hidden')

    enter_phase('auditor-monitoring-read-only')
    page.locator('#homePrimaryAction').click()
    page.locator('#monitoringView').wait_for(state='visible')
    for selector in ['#missionForm', '#openContribution']:
        page.locator(selector).wait_for(state='hidden')
    intro = page.locator('#userMonitoringIntro')
    intro.wait_for(state='visible')
    assert 'sola lettura' in intro.inner_text().lower()

    enter_phase('auditor-events-read-only')
    page.locator('[data-service="incidents"]').click()
    page.locator('#incidentsView').wait_for(state='visible')
    page.locator('#openIncident').wait_for(state='hidden')
    assert not errors, errors

    checks = [
        'auditor-bootstrap-identity',
        'reborn-3-auditor-decision-capsule',
        'auditor-why-me',
        'auditor-human-evidence-boundary',
        'auditor-horizontal-method',
        'auditor-admin-controls-hidden',
        'auditor-monitoring-write-controls-hidden',
        'auditor-event-write-controls-hidden',
        'auditor-read-only-copy',
    ]
    (ART / 'browser-auditor-check.json').write_text(
        json.dumps({'ok': True, 'checks': checks}, indent=2),
        encoding='utf8',
    )
    if WATCHDOG:
        WATCHDOG.cancel()
    print('browser-auditor-check: evidence complete', flush=True)
    os._exit(0)
except Exception as error:
    fail(error)
