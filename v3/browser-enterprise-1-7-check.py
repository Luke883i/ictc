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


def no_overflow(page, label):
    geometry = page.evaluate("""() => ({viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth})""")
    assert geometry['document'] <= geometry['viewport'] + 1, f'{label}: document overflow {geometry}'
    assert geometry['body'] <= geometry['viewport'] + 1, f'{label}: body overflow {geometry}'


def primary_count(root):
    return root.locator('.primary:visible').count()


def main():
    global PHASE
    with sync_playwright() as p:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        chromium = os.environ.get('ICTC_CHROMIUM')
        if chromium:
            launch['executable_path'] = chromium
        browser = p.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000})
        context.add_init_script("try{localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')}catch{}")
        page = context.new_page()
        page.set_default_timeout(15000)
        page.set_default_navigation_timeout(20000)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        PHASE = 'home-summary-first'
        page.goto(f'{BASE}/', wait_until='networkidle')
        page.locator('#runtimeStatus').get_by_text('Amministratore', exact=False).wait_for()
        page.locator('#homeView').wait_for(state='visible')
        assert page.locator('.service-nav button').count() == 4
        assert primary_count(page.locator('#homeView')) == 1
        assert page.locator('.reborn-method').is_hidden()
        assert page.locator('.home-status-strip').is_hidden()
        assert page.locator('#homeContextAction').is_visible()
        assert page.locator('#homeSignalBar > span').count() <= 3
        decision = page.locator('.reborn-decision').bounding_box()
        assert decision and decision['height'] <= 340, decision
        no_overflow(page, 'home-desktop')

        PHASE = 'home-context-dialog'
        page.locator('#homeContextAction').click()
        page.locator('#clarityContextDialog').wait_for(state='visible')
        body = page.locator('#clarityContextBody').inner_text()
        for phrase in ['Perché spetta a te', 'Come procedere', 'Metodo del ruolo', 'Stato del lavoro']:
            assert phrase in body, phrase
        page.locator('[data-clarity-close]').click()

        PHASE = 'monitoring-primary-task'
        page.locator('[data-service="monitoring"]').click()
        page.locator('#monitoringView').wait_for(state='visible')
        assert page.locator('#homeView').is_hidden()
        assert page.locator('#proofView').is_hidden()
        assert primary_count(page.locator('#monitoringView .hero')) == 1
        assert page.locator('#monitoringGuide').get_attribute('open') is None
        page.locator('#monitoringContextAction').click()
        page.locator('#clarityContextDialog').get_by_text('Come funziona il monitoraggio', exact=True).wait_for()
        page.locator('[data-clarity-close]').click()

        PHASE = 'events-primary-task'
        page.locator('[data-service="incidents"]').click()
        page.locator('#incidentsView').wait_for(state='visible')
        assert primary_count(page.locator('#incidentsView .hero')) == 1
        assert page.locator('.ai-lens-demo').is_hidden()
        page.locator('#eventsContextAction').click()
        page.locator('#clarityContextDialog').get_by_text('Come viene trattato un evento', exact=True).wait_for()
        page.locator('[data-clarity-close]').click()

        PHASE = 'proof-keyboard-router'
        page.locator('[data-service="home"]').click()
        proof_button = page.locator('#openStandardProof')
        proof_button.focus()
        assert page.evaluate('document.activeElement.id') == 'openStandardProof'
        page.keyboard.press('Enter')
        page.locator('#proofView').wait_for(state='visible')
        page.locator('#proofContent').wait_for(state='visible')
        assert page.evaluate('document.activeElement.id') == 'proofView'
        assert page.locator('#homeView').is_hidden()
        assert page.locator('#monitoringView').is_hidden()
        assert page.locator('#incidentsView').is_hidden()
        hero = page.locator('.proof-hero-17').bounding_box()
        assert hero and hero['height'] <= 320, hero
        assert primary_count(page.locator('#proofView')) == 1

        PHASE = 'proof-progressive-detail'
        page.locator('#openProofDetails').click()
        page.locator('#proofDetailDialog').wait_for(state='visible')
        assert page.locator('#proofStack > li').count() == 8
        assert page.locator('.proof-standard').count() == 12
        assert page.locator('#proofGlossaryList > div').count() == 14
        assert page.locator('.proof-standard a[aria-label^="Riferimento ufficiale"]').count() == 12
        page.locator('[data-proof-close]').click()

        PHASE = 'admin-progressive-governance'
        page.locator('[data-service="home"]').click()
        page.locator('#openAdminCenter').click()
        page.locator('#adminCenter').wait_for(state='visible')
        assert page.locator('#adminProofPanel').is_visible()
        disclosures = page.locator('.admin-disclosure')
        assert disclosures.count() == 5
        assert page.locator('.admin-disclosure[open]').count() <= 1
        page.locator('.admin-disclosure').filter(has_text='Governance AI').locator('summary').click()
        page.locator('#governanceForm').wait_for(state='visible')
        page.locator('.admin-disclosure').filter(has_text='Utenti e ruoli').locator('summary').click()
        page.locator('#userForm').wait_for(state='visible')
        page.locator('[data-admin-close]').click()

        PHASE = 'auditor-read-only'
        page.locator('#roleSelect').select_option('auditor')
        page.locator('#runtimeStatus').get_by_text('Auditor', exact=False).wait_for()
        page.locator('#openStandardProof').click()
        page.locator('#proofView').wait_for(state='visible')
        assert page.locator('#openAdminCenter').is_hidden()
        assert page.locator('#openSettings').is_hidden()
        assert page.locator('#proofView [data-write]:visible').count() == 0
        assert 'sola lettura' in page.locator('#proofRoleIntro').inner_text().casefold()

        PHASE = 'mobile-reflow'
        page.set_viewport_size({'width': 390, 'height': 844})
        no_overflow(page, 'proof-mobile')
        page.locator('#openProofDetails').click()
        page.locator('#proofDetailDialog').wait_for(state='visible')
        no_overflow(page, 'proof-dialog-mobile')
        page.locator('[data-proof-close]').click()

        PHASE = 'page-errors'
        assert not errors, errors
        checks = ['single-surface-router','post-merge-keyboard-race-closed','home-summary-first','one-primary-action-home','home-context-dialog','compact-home-geometry','monitoring-primary-task','monitoring-progressive-context','events-primary-task','events-progressive-context','proof-summary-first','proof-detail-dialog','accessible-standard-link-names','admin-progressive-disclosures','auditor-zero-write-affordances','desktop-no-overflow','mobile-no-overflow','minimum-target-baseline','no-page-errors']
        (ART / 'browser-enterprise-1-7-check.json').write_text(json.dumps({'ok': True, 'checks': checks, 'homeDecisionHeight': decision['height'], 'proofHeroHeight': hero['height']}, indent=2), encoding='utf8')
        print('browser-enterprise-1-7-check: evidence complete', flush=True)
        page.close(run_before_unload=False)
        context.close()
        browser.close()

try:
    main()
except Exception as error:
    payload = {'ok': False, 'phase': PHASE, 'type': type(error).__name__, 'message': str(error), 'traceback': traceback.format_exc()}
    (ART / 'browser-enterprise-1-7-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    summary = f'{PHASE}: {type(error).__name__}: {error}'
    print(f'::error title=browser-enterprise-1-7-check::{annotation_escape(summary)}', flush=True)
    traceback.print_exc()
    raise
