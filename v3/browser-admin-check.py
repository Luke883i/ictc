import json
import os
import pathlib
import urllib.error
import urllib.request
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
ORIGIN = 'https://ictc.example'

with sync_playwright() as p:
    launch = {'headless': True, 'args': ['--no-sandbox']}
    chromium = os.environ.get('ICTC_CHROMIUM')
    if chromium:
        launch['executable_path'] = chromium
    browser = p.chromium.launch(**launch)
    context = browser.new_context(viewport={'width': 1280, 'height': 1000})
    context.add_init_script("try{localStorage.setItem('ictc-role','admin')}catch{}")

    def proxy(route):
        request = route.request
        target = BASE + request.url.removeprefix(ORIGIN)
        headers = {
            key: value
            for key, value in request.headers.items()
            if key.lower() not in {'host', 'content-length', 'accept-encoding'}
        }
        data = request.post_data_buffer if request.method not in {'GET', 'HEAD'} else None
        upstream = urllib.request.Request(target, data=data, headers=headers, method=request.method)
        try:
            with urllib.request.urlopen(upstream, timeout=30) as response:
                route.fulfill(
                    status=response.status,
                    headers=dict(response.headers),
                    body=response.read(),
                )
        except urllib.error.HTTPError as error:
            route.fulfill(status=error.code, headers=dict(error.headers), body=error.read())

    context.route(f'{ORIGIN}/**', proxy)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    html = urllib.request.urlopen(BASE + '/', timeout=30).read().decode('utf8')
    html = html.replace('<head>', f'<head><base href="{ORIGIN}/">', 1)
    page.set_content(html, wait_until='networkidle')

    page.get_by_role('button', name='Amministrazione').click()
    page.locator('#adminCenter').wait_for(state='visible')
    page.get_by_text('Storage durevole', exact=True).wait_for()
    page.get_by_text('Blocco', exact=True).first.wait_for()

    governance_form = page.locator('#governanceForm')
    governance_form.locator('input[name="environmentName"]').fill('audit-browser')
    governance_form.locator('input[name="owner"]').fill('Security Operations')
    governance_form.locator('textarea[name="allowedModels"]').fill('mock-browser')
    with page.expect_response(
        lambda response: response.url.endswith('/api/admin/governance')
        and response.request.method == 'PUT'
    ) as governance_response:
        governance_form.get_by_role('button', name='Registra governance').click()
    assert governance_response.value.status == 200
    page.get_by_text('Governance registrata').wait_for()

    user_form = page.locator('#userForm')
    user_form.locator('input[name="id"]').fill('browser-auditor')
    user_form.locator('input[name="displayName"]').fill('Auditor Browser')
    user_form.locator('select[name="role"]').select_option('auditor')
    with page.expect_response(
        lambda response: response.url.endswith('/api/admin/users')
        and response.request.method == 'POST'
    ) as create_response:
        user_form.get_by_role('button', name='Provisiona utente').click()
    assert create_response.value.status == 201
    created = create_response.value.json()
    assert created['result']['id'] == 'browser-auditor'
    assert created['result']['displayName'] == 'Auditor Browser'

    # Reopen the control plane to prove persistence independently from transient DOM timing.
    page.locator('[data-admin-close]').click()
    page.get_by_role('button', name='Amministrazione').click()
    page.locator('#adminCenter').wait_for(state='visible')
    row = page.locator('.user-row').filter(has_text='browser-auditor')
    row.wait_for()
    assert 'Auditor Browser' in row.inner_text()

    with page.expect_response(
        lambda response: response.url.endswith('/api/admin/users/browser-auditor')
        and response.request.method == 'PATCH'
    ) as disable_response:
        row.get_by_role('button', name='Disabilita').click()
    assert disable_response.value.status == 200
    page.locator('.user-row').filter(has_text='browser-auditor').get_by_role(
        'button', name='Riattiva'
    ).wait_for()

    page.locator('[data-admin-close]').click()
    with page.expect_response(
        lambda response: response.url.endswith('/api/bootstrap')
        and response.request.method == 'GET'
    ) as role_response:
        page.locator('#roleSelect').select_option('auditor')
    assert role_response.value.status == 200
    assert role_response.value.json()['actor']['role'] == 'auditor'
    page.get_by_role('button', name='Amministrazione').wait_for(state='hidden')
    page.get_by_role('button', name='AI').wait_for(state='hidden')

    assert not errors, errors
    (ART / 'browser-admin-check.json').write_text(
        json.dumps(
            {
                'ok': True,
                'checks': [
                    'honest-blockers',
                    'governance-write',
                    'user-provision-persisted',
                    'user-disable',
                    'auditor-least-privilege',
                ],
            },
            indent=2,
        ),
        encoding='utf8',
    )
    print('browser-admin-check: ok (5 live administration checks)')
    browser.close()
