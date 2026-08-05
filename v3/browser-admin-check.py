import json
import os
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')

with sync_playwright() as p:
    launch = {'headless': True, 'args': ['--no-sandbox']}
    chromium = os.environ.get('ICTC_CHROMIUM')
    if chromium:
        launch['executable_path'] = chromium
    browser = p.chromium.launch(**launch)
    context = browser.new_context(viewport={'width': 1280, 'height': 1000})
    context.add_init_script("try{if(!localStorage.getItem('ictc-role'))localStorage.setItem('ictc-role','admin')}catch{}")
    page = context.new_page()
    page.set_default_timeout(10000)
    page.set_default_navigation_timeout(15000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    print('browser-admin-check: bootstrap', flush=True)
    page.goto(f'{BASE}/', wait_until='networkidle')

    print('browser-admin-check: readiness', flush=True)
    page.locator('#openAdminCenter').click()
    page.locator('#adminCenter').wait_for(state='visible')
    durable_storage = page.locator('#adminReadiness .readiness-row').filter(
        has_text='Storage durevole'
    )
    durable_storage.wait_for()
    blocker = durable_storage.locator('.score.warn')
    blocker.wait_for()
    assert blocker.inner_text().strip() == 'Bloccante'

    print('browser-admin-check: governance', flush=True)
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

    print('browser-admin-check: identity lifecycle', flush=True)
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

    page.locator('[data-admin-close]').click()
    page.locator('#openAdminCenter').click()
    page.locator('#adminCenter').wait_for(state='visible')
    row = page.locator('.user-row').filter(has_text='browser-auditor')
    row.wait_for()
    assert 'Auditor Browser' in row.inner_text()

    with page.expect_response(
        lambda response: response.url.endswith('/api/admin/users/browser-auditor')
        and response.request.method == 'PATCH'
    ) as disable_response:
        row.locator('[data-user-toggle="browser-auditor"]').click()
    assert disable_response.value.status == 200
    page.locator('.user-row').filter(has_text='browser-auditor').get_by_role(
        'button', name='Riattiva', exact=True
    ).wait_for()

    print('browser-admin-check: auditor least privilege', flush=True)
    page.locator('[data-admin-close]').click()
    page.evaluate("localStorage.setItem('ictc-role','auditor')")
    page.goto(f'{BASE}/', wait_until='domcontentloaded')
    page.locator('#runtimeStatus').get_by_text('Auditor', exact=False).wait_for()
    assert page.locator('#roleSelect').input_value() == 'auditor'
    page.locator('#openAdminCenter').wait_for(state='hidden')
    page.locator('#openSettings').wait_for(state='hidden')

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
    print('browser-admin-check: teardown', flush=True)
    page.close(run_before_unload=False)
    context.close()
    browser.close()
    print('browser-admin-check: ok (5 live administration checks, teardown complete)', flush=True)
