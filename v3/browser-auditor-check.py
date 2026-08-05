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


def annotation_escape(value):
    return str(value).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')


def fail(error):
    payload = {
        'ok': False,
        'phase': PHASE,
        'type': type(error).__name__,
        'message': str(error),
        'traceback': traceback.format_exc(),
    }
    (ART / 'browser-auditor-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    summary = f'{PHASE}: {type(error).__name__}: {error}'
    print(f'::error title=browser-auditor-check::{annotation_escape(summary)}', flush=True)
    traceback.print_exc()
    os._exit(1)


try:
    playwright = sync_playwright().start()
    launch = {'headless': True, 'args': ['--no-sandbox']}
    chromium = os.environ.get('ICTC_CHROMIUM')
    if chromium:
        launch['executable_path'] = chromium
    browser = playwright.chromium.launch(**launch)
    context = browser.new_context(viewport={'width': 1280, 'height': 1000})
    context.add_init_script("try{localStorage.setItem('ictc-role','auditor')}catch{}")
    page = context.new_page()
    page.set_default_timeout(10000)
    page.set_default_navigation_timeout(15000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    PHASE = 'auditor-bootstrap'
    print(f'browser-auditor-check: {PHASE}', flush=True)
    with page.expect_response(
        lambda response: response.url.endswith('/api/bootstrap')
        and response.request.method == 'GET'
        and response.request.headers.get('x-ictc-role') == 'auditor'
        and response.request.headers.get('x-ictc-actor-id') == 'local-auditor'
    ) as bootstrap:
        page.goto(f'{BASE}/', wait_until='domcontentloaded')
    assert bootstrap.value.status == 200

    PHASE = 'auditor-observed-state'
    print(f'browser-auditor-check: {PHASE}', flush=True)
    page.wait_for_timeout(1500)
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
            'requestedRole': status.get_attribute('data-requested-role', timeout=1000),
            'selectedRole': page.locator('#roleSelect').input_value(timeout=1000) if role_count else None,
            'storedRole': page.evaluate("localStorage.getItem('ictc-role')"),
        })
    assert not closed and status_count == 1 and role_count == 1, json.dumps(observed, ensure_ascii=False)
    assert observed.get('actorRole') == 'auditor', json.dumps(observed, ensure_ascii=False)
    assert 'Auditor' in observed.get('text', ''), json.dumps(observed, ensure_ascii=False)
    assert observed.get('selectedRole') == 'auditor', json.dumps(observed, ensure_ascii=False)
    assert observed.get('storedRole') == 'auditor', json.dumps(observed, ensure_ascii=False)

    PHASE = 'auditor-least-privilege'
    print(f'browser-auditor-check: {PHASE}', flush=True)
    for selector in ['#openAdminCenter', '#openSettings', '#missionForm', '#openIncident', '#openContribution']:
        page.locator(selector).wait_for(state='hidden')
    intro = page.locator('#userMonitoringIntro')
    intro.wait_for(state='visible')
    assert 'sola lettura' in intro.inner_text().lower()
    assert not errors, errors

    checks = [
        'auditor-bootstrap-identity',
        'auditor-role-projection',
        'auditor-admin-controls-hidden',
        'auditor-write-controls-hidden',
        'auditor-read-only-copy',
    ]
    (ART / 'browser-auditor-check.json').write_text(
        json.dumps({'ok': True, 'checks': checks}, indent=2),
        encoding='utf8',
    )
    print('browser-auditor-check: evidence complete', flush=True)
    os._exit(0)
except Exception as error:
    fail(error)
