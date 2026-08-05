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


def main():
    global PHASE
    with sync_playwright() as p:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        chromium = os.environ.get('ICTC_CHROMIUM')
        if chromium:
            launch['executable_path'] = chromium
        browser = p.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1280, 'height': 1000})
        context.add_init_script("try{localStorage.setItem('ictc-role','admin')}catch{}")
        page = context.new_page()
        page.set_default_timeout(10000)
        page.set_default_navigation_timeout(15000)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        PHASE = 'bootstrap'
        print(f'browser-admin-check: {PHASE}', flush=True)
        page.goto(f'{BASE}/', wait_until='networkidle')

        PHASE = 'readiness'
        print(f'browser-admin-check: {PHASE}', flush=True)
        page.locator('#openAdminCenter').click()
        page.locator('#adminCenter').wait_for(state='visible')
        durable_storage = page.locator('#adminReadiness .readiness-row').filter(
            has_text='Storage durevole'
        )
        durable_storage.wait_for()
        blocker = durable_storage.locator('.score.warn')
        blocker.wait_for()
        assert blocker.inner_text().strip() == 'Bloccante'

        PHASE = 'governance'
        print(f'browser-admin-check: {PHASE}', flush=True)
        governance_form = page.locator('#governanceForm')
        governance_form.locator('input[name="environmentName"]').fill('audit-browser')
        governance_form.locator('input[name="owner"]').fill('Security Operations')
        governance_form.locator('textarea[name="allowedModels"]').fill('mock-browser')
        with page.expect_response(
            lambda response: response.url.endswith('/api/admin/governance')
            and response.request.method == 'PUT'
        ) as governance_response:
            governance_form.locator('button[type="submit"]').click()
        assert governance_response.value.status == 200
        page.get_by_text('Governance registrata', exact=True).wait_for()

        PHASE = 'identity-lifecycle'
        print(f'browser-admin-check: {PHASE}', flush=True)
        user_form = page.locator('#userForm')
        user_form.locator('input[name="id"]').fill('browser-auditor')
        user_form.locator('input[name="displayName"]').fill('Auditor Browser')
        user_form.locator('select[name="role"]').select_option('auditor')
        with page.expect_response(
            lambda response: response.url.endswith('/api/admin/users')
            and response.request.method == 'POST'
        ) as create_response:
            user_form.locator('button[type="submit"]').click()
        assert create_response.value.status == 201
        created = create_response.value.json()
        assert created['result']['id'] == 'browser-auditor'
        assert created['result']['displayName'] == 'Auditor Browser'

        PHASE = 'identity-persistence'
        print(f'browser-admin-check: {PHASE}', flush=True)
        page.locator('[data-admin-close]').click()
        page.locator('#openAdminCenter').click()
        page.locator('#adminCenter').wait_for(state='visible')
        row = page.locator('.user-row').filter(has_text='browser-auditor')
        row.wait_for()
        assert 'Auditor Browser' in row.inner_text()

        PHASE = 'identity-disable'
        print(f'browser-admin-check: {PHASE}', flush=True)
        with page.expect_response(
            lambda response: response.url.endswith('/api/admin/users/browser-auditor')
            and response.request.method == 'PATCH'
        ) as disable_response:
            row.locator('[data-user-toggle="browser-auditor"]').click()
        assert disable_response.value.status == 200
        page.locator('.user-row').filter(has_text='browser-auditor').get_by_role(
            'button', name='Riattiva', exact=True
        ).wait_for()

        PHASE = 'auditor-role-change'
        print(f'browser-admin-check: {PHASE}', flush=True)
        page.locator('[data-admin-close]').click()
        page.locator('#roleSelect').select_option('auditor')

        PHASE = 'auditor-identity'
        print(f'browser-admin-check: {PHASE}', flush=True)
        page.locator('#runtimeStatus').get_by_text('Auditor', exact=False).wait_for()
        assert page.locator('#roleSelect').input_value() == 'auditor'

        PHASE = 'auditor-controls'
        print(f'browser-admin-check: {PHASE}', flush=True)
        page.locator('#openAdminCenter').wait_for(state='hidden')
        page.locator('#openSettings').wait_for(state='hidden')

        PHASE = 'page-errors'
        assert not errors, errors
        checks = [
            'honest-blockers',
            'governance-write',
            'user-provision-persisted',
            'user-disable',
            'auditor-least-privilege',
        ]
        (ART / 'browser-admin-check.json').write_text(
            json.dumps({'ok': True, 'checks': checks}, indent=2),
            encoding='utf8',
        )
        print('browser-admin-check: evidence complete', flush=True)
        page.close(run_before_unload=False)
        context.close()
        browser.close()


try:
    main()
except Exception as error:
    payload = {
        'ok': False,
        'phase': PHASE,
        'type': type(error).__name__,
        'message': str(error),
        'traceback': traceback.format_exc(),
    }
    (ART / 'browser-admin-error.json').write_text(
        json.dumps(payload, indent=2),
        encoding='utf8',
    )
    summary = f'{PHASE}: {type(error).__name__}: {error}'
    print(f'::error title=browser-admin-check::{annotation_escape(summary)}', flush=True)
    traceback.print_exc()
    raise
