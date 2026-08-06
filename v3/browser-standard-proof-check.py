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


def check_no_overflow(page, label):
    geometry = page.evaluate("""() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    })""")
    assert geometry['document'] <= geometry['viewport'] + 1, f'{label}: document overflow {geometry}'
    assert geometry['body'] <= geometry['viewport'] + 1, f'{label}: body overflow {geometry}'


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
        page.set_default_timeout(12000)
        page.set_default_navigation_timeout(18000)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        PHASE = 'proof-admin'
        page.goto(f'{BASE}/', wait_until='networkidle')
        page.locator('#runtimeStatus').get_by_text('Amministratore', exact=False).wait_for()
        nav = page.locator('.service-nav button')
        assert nav.count() == 4, f'expected four top-level areas, observed {nav.count()}'
        proof_button = page.locator('#openStandardProof')
        proof_button.focus()
        page.keyboard.press('Enter')
        page.locator('#proofView').wait_for(state='visible')
        page.get_by_role('heading', name='Capire il sistema. Verificare le promesse.', exact=True).wait_for()
        page.locator('#proofRelease').get_by_text('1.6.0', exact=True).wait_for()
        page.locator('#proofContent').wait_for(state='visible')
        assert page.locator('#proofStack > li').count() == 8
        assert page.locator('.proof-standard').count() == 12
        assert page.locator('#proofGlossaryList > div').count() == 14
        assert page.locator('.proof-standard').first.get_attribute('open') is not None
        assert page.locator('.proof-standard a[target="_blank"][rel="noopener noreferrer"]').count() == 12
        hero = page.locator('.proof-hero').bounding_box()
        assert hero and hero['height'] <= 320, hero
        for selector in ['#openStandardProof', '#retryProof', '.proof-index a']:
            locator = page.locator(selector).first
            if locator.is_visible():
                box = locator.bounding_box()
                assert box and box['height'] >= 44, f'{selector} target below 44px: {box}'
        check_no_overflow(page, 'desktop')

        PHASE = 'proof-admin-panel'
        page.locator('[data-service="home"]').click()
        page.locator('#openAdminCenter').click()
        page.locator('#adminCenter').wait_for(state='visible')
        page.locator('#adminProofPanel').wait_for(state='visible')
        page.locator('#adminProofMetrics .metric').nth(3).wait_for()
        assert page.locator('#adminProofMetrics .metric').count() == 4
        admin_proof_button = page.locator('#openProofFromAdmin')
        box = admin_proof_button.bounding_box()
        assert box and box['height'] >= 44, box
        admin_proof_button.click()
        page.locator('#proofView').wait_for(state='visible')

        PHASE = 'proof-user'
        page.locator('#roleSelect').select_option('user')
        page.locator('#runtimeStatus').get_by_text('Utente', exact=False).wait_for()
        page.locator('#proofRoleIntro').get_by_text('Scopri cosa puoi registrare', exact=False).wait_for()
        assert page.locator('#openAdminCenter').is_hidden()
        assert page.locator('#proofView button:visible').count() == 0

        PHASE = 'proof-auditor'
        page.locator('#roleSelect').select_option('auditor')
        page.locator('#runtimeStatus').get_by_text('Auditor', exact=False).wait_for()
        page.locator('#proofRoleIntro').get_by_text('sola lettura', exact=False).wait_for()
        assert page.locator('#openAdminCenter').is_hidden()
        assert page.locator('#openSettings').is_hidden()
        assert page.locator('#proofView button:visible').count() == 0
        assert 'certific' in page.locator('#proofLimits').inner_text().casefold()
        check_no_overflow(page, 'auditor-desktop')

        PHASE = 'proof-mobile-reflow'
        page.set_viewport_size({'width': 390, 'height': 844})
        page.locator('#proofView').wait_for(state='visible')
        check_no_overflow(page, 'mobile')
        stack_width = page.locator('#proofStack').bounding_box()['width']
        view_width = page.locator('#proofView').bounding_box()['width']
        assert stack_width <= view_width + 1, {'stack': stack_width, 'view': view_width}

        PHASE = 'proof-keyboard-entry'
        page.locator('[data-service="home"]').click()
        page.locator('#openStandardProof').focus()
        assert page.evaluate("document.activeElement.id") == 'openStandardProof'
        page.keyboard.press('Enter')
        page.locator('#proofView').wait_for(state='visible')
        assert page.evaluate("document.activeElement.id") == 'proofView'
        assert not errors, errors

        checks = [
            'proof-admin',
            'proof-admin-panel',
            'proof-user',
            'proof-auditor',
            'proof-mobile-reflow',
            'proof-keyboard-entry',
            'four-top-level-areas-two-operational-services',
            'eight-architecture-layers',
            'twelve-standard-mappings',
            'fourteen-glossary-terms',
            'desktop-no-overflow',
            'mobile-no-overflow',
            'minimum-44px-targets',
            'honest-certification-boundary',
            'no-page-errors'
        ]
        (ART / 'browser-standard-proof-check.json').write_text(
            json.dumps({'ok': True, 'checks': checks, 'heroHeight': hero['height']}, indent=2),
            encoding='utf8'
        )
        print('browser-standard-proof-check: evidence complete', flush=True)
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
        'traceback': traceback.format_exc()
    }
    (ART / 'browser-standard-proof-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    summary = f'{PHASE}: {type(error).__name__}: {error}'
    print(f'::error title=browser-standard-proof-check::{annotation_escape(summary)}', flush=True)
    traceback.print_exc()
    raise
