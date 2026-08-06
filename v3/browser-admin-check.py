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

def open_admin_section(page, title):
    details = page.locator('.admin-disclosure').filter(has_text=title)
    details.wait_for()
    if details.get_attribute('open') is None:
        details.locator('summary').click()
    return details

def main():
    global PHASE
    with sync_playwright() as p:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        chromium = os.environ.get('ICTC_CHROMIUM')
        if chromium: launch['executable_path'] = chromium
        browser = p.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1280, 'height': 1000})
        context.add_init_script("try{localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')}catch{}")
        page = context.new_page(); page.set_default_timeout(10000); page.set_default_navigation_timeout(15000)
        errors = []; page.on('pageerror', lambda error: errors.append(str(error)))
        PHASE='bootstrap'; print(f'browser-admin-check: {PHASE}',flush=True)
        page.goto(f'{BASE}/',wait_until='networkidle')
        page.locator('#homeView[data-reborn3="true"]').wait_for(state='visible')
        observed_role=page.locator('#homeRole').inner_text().strip(); assert observed_role.casefold()=='amministratore',observed_role
        assert page.locator('#homePrimaryAction').count()==1
        for selector in ['#homeReason','#homeWhyMe','#homeHow','#homeOutcome']:
            assert (page.locator(selector).text_content() or '').strip(),selector
        disclosure=page.locator('.trust-brief')
        if disclosure.get_attribute('open') is None: disclosure.locator('summary').click()
        for selector in ['#homeAiNote','#homeHumanGate','#homeEvidence']:
            assert (page.locator(selector).text_content() or '').strip(),selector
        PHASE='readiness'; print(f'browser-admin-check: {PHASE}',flush=True)
        page.locator('#openAdminCenter').click(); page.locator('#adminCenter').wait_for(state='visible')
        open_admin_section(page,'Stato dei controlli')
        durable=page.locator('#adminReadiness .readiness-row').filter(has_text='Storage durevole'); durable.wait_for()
        assert durable.locator('.score.warn').inner_text().strip()=='Bloccante'
        PHASE='governance'; print(f'browser-admin-check: {PHASE}',flush=True)
        open_admin_section(page,'Governance AI'); form=page.locator('#governanceForm')
        form.locator('input[name="environmentName"]').fill('audit-browser'); form.locator('input[name="owner"]').fill('Security Operations'); form.locator('textarea[name="allowedModels"]').fill('mock-browser')
        with page.expect_response(lambda response: response.url.endswith('/api/admin/governance') and response.request.method=='PUT') as response_info: form.locator('button[type="submit"]').click()
        assert response_info.value.status==200; page.get_by_text('Governance salvata',exact=True).wait_for()
        PHASE='identity-lifecycle'; print(f'browser-admin-check: {PHASE}',flush=True)
        open_admin_section(page,'Utenti e ruoli'); user_form=page.locator('#userForm')
        user_form.locator('input[name="id"]').fill('browser-auditor'); user_form.locator('input[name="displayName"]').fill('Auditor Browser'); user_form.locator('select[name="role"]').select_option('auditor')
        with page.expect_response(lambda response: response.url.endswith('/api/admin/users') and response.request.method=='POST') as create_response: user_form.locator('button[type="submit"]').click()
        assert create_response.value.status==201; created=create_response.value.json(); assert created['result']['id']=='browser-auditor'
        PHASE='identity-persistence'; print(f'browser-admin-check: {PHASE}',flush=True)
        page.locator('[data-admin-close]').click(); page.locator('#openAdminCenter').click(); page.locator('#adminCenter').wait_for(state='visible'); open_admin_section(page,'Utenti e ruoli')
        row=page.locator('.user-row').filter(has_text='browser-auditor'); row.wait_for(); assert 'Auditor Browser' in row.inner_text()
        PHASE='identity-disable'; print(f'browser-admin-check: {PHASE}',flush=True)
        with page.expect_response(lambda response: response.url.endswith('/api/admin/users/browser-auditor') and response.request.method=='PATCH') as disable_response: row.locator('[data-user-toggle="browser-auditor"]').click()
        assert disable_response.value.status==200; page.locator('.user-row').filter(has_text='browser-auditor').get_by_role('button',name='Riattiva',exact=True).wait_for()
        PHASE='page-errors'; assert not errors,errors
        checks=['reborn-3-admin-entry','admin-state-independent-decision-capsule','admin-eight-decision-answers','admin-trust-disclosure','admin-role-label-presentation-independent','honest-blockers','progressive-admin-disclosures','governance-write','user-provision-persisted','user-disable']
        (ART/'browser-admin-check.json').write_text(json.dumps({'ok':True,'checks':checks},indent=2),encoding='utf8')
        print('browser-admin-check: evidence complete',flush=True); page.close(run_before_unload=False); context.close(); browser.close()
try: main()
except Exception as error:
    payload={'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc()}; (ART/'browser-admin-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
    print(f'::error title=browser-admin-check::{annotation_escape(f"{PHASE}: {type(error).__name__}: {error}")}',flush=True); traceback.print_exc(); raise
