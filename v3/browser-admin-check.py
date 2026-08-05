import json
import os
import pathlib
import urllib.error
import urllib.request
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts';ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
ORIGIN='https://ictc.example'

with sync_playwright() as p:
    launch={'headless':True,'args':['--no-sandbox']}
    chromium=os.environ.get('ICTC_CHROMIUM')
    if chromium: launch['executable_path']=chromium
    browser=p.chromium.launch(**launch)
    context=browser.new_context(viewport={'width':1280,'height':1000})
    context.add_init_script("try{localStorage.setItem('ictc-role','admin')}catch{}")
    def proxy(route):
        req=route.request; target=BASE+req.url.removeprefix(ORIGIN)
        headers={k:v for k,v in req.headers.items() if k.lower() not in {'host','content-length','accept-encoding'}}
        data=req.post_data_buffer if req.method not in {'GET','HEAD'} else None
        upstream=urllib.request.Request(target,data=data,headers=headers,method=req.method)
        try:
            with urllib.request.urlopen(upstream,timeout=30) as response: route.fulfill(status=response.status,headers=dict(response.headers),body=response.read())
        except urllib.error.HTTPError as error: route.fulfill(status=error.code,headers=dict(error.headers),body=error.read())
    context.route(f'{ORIGIN}/**',proxy)
    page=context.new_page(); errors=[]; page.on('pageerror',lambda error:errors.append(str(error)))
    html=urllib.request.urlopen(BASE+'/',timeout=30).read().decode('utf8').replace('<head>',f'<head><base href="{ORIGIN}/">',1)
    page.set_content(html,wait_until='networkidle')
    page.get_by_role('button',name='Amministrazione').click()
    page.locator('#adminCenter').wait_for(state='visible')
    page.get_by_text('Storage durevole',exact=True).wait_for()
    page.get_by_text('Blocco',exact=True).first.wait_for()
    form=page.locator('#governanceForm')
    form.locator('input[name="environmentName"]').fill('audit-browser')
    form.locator('input[name="owner"]').fill('Security Operations')
    form.locator('textarea[name="allowedModels"]').fill('mock-browser')
    form.get_by_role('button',name='Registra governance').click()
    page.get_by_text('Governance registrata').wait_for()
    user=page.locator('#userForm')
    user.locator('input[name="id"]').fill('browser-auditor')
    user.locator('input[name="displayName"]').fill('Auditor Browser')
    user.locator('select[name="role"]').select_option('auditor')
    user.get_by_role('button',name='Provisiona utente').click()
    page.get_by_text('Auditor Browser').wait_for()
    row=page.locator('.user-row').filter(has_text='browser-auditor')
    row.get_by_role('button',name='Disabilita').click(); row.get_by_role('button',name='Riattiva').wait_for()
    page.locator('[data-admin-close]').click()
    page.locator('#roleSelect').select_option('auditor')
    assert page.get_by_role('button',name='Amministrazione').is_hidden()
    assert page.get_by_role('button',name='AI').is_hidden()
    assert not errors, errors
    (ART/'browser-admin-check.json').write_text(json.dumps({'ok':True,'checks':['honest-blockers','governance-write','user-provision','user-disable','auditor-least-privilege']},indent=2),encoding='utf8')
    print('browser-admin-check: ok (5 live administration checks)')
    browser.close()
