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


def no_overflow(page, label, selector='html'):
    value = page.locator(selector).evaluate('el => el.scrollWidth - el.clientWidth')
    assert value <= 1, f'{label}: horizontal overflow {value}px'


def annotate(error):
    payload = {'ok': False, 'phase': PHASE, 'type': type(error).__name__, 'message': str(error), 'traceback': traceback.format_exc()}
    (ART / 'browser-enterprise-2-compliance-flow-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')


try:
    with sync_playwright() as playwright:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path'] = os.environ['ICTC_CHROMIUM']
        browser = playwright.chromium.launch(**launch)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.set_default_timeout(15000)

        PHASE = 'home-guided-stage'
        page.goto(f'{BASE}/', wait_until='networkidle')
        page.locator('html[data-compliance-flow="compliance-guided-1"]').wait_for(state='attached')
        page.locator('#roleSelect').select_option('admin')
        page.locator('#homeView').wait_for(state='visible')
        assert page.locator('#homeView [data-compliance-flow-cue="home"]').count() == 1
        assert page.locator('#homeView .flow-stage-list li').count() == 6
        assert page.locator('#homeView .flow-cue-details[open]').count() == 0

        PHASE = 'settings-essential-first'
        page.locator('#openSettings').click()
        page.locator('#settingsDialog').wait_for(state='visible')
        assert page.locator('.configuration-overview button').count() == 3
        assert page.locator('#settingsForm .settings-section-18[open]').count() == 1
        assert page.get_by_text('Contesto organizzativo', exact=True).count() >= 1
        assert page.get_by_text('Connessione AI', exact=True).count() >= 1
        assert page.get_by_text('Istruzioni assistite', exact=True).count() >= 1
        assert page.locator('#settingsForm label').filter(has_text='Indirizzo del servizio').count() == 1
        assert page.locator('#settingsForm label').filter(has_text='Modello autorizzato').count() == 1
        page.set_viewport_size({'width': 390, 'height': 844})
        no_overflow(page, 'settings-390', '#settingsDialog')
        page.set_viewport_size({'width': 320, 'height': 568})
        no_overflow(page, 'settings-320', '#settingsDialog')
        page.keyboard.press('Escape')

        PHASE = 'monitoring-configuration'
        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.locator('.service-nav [data-service="monitoring"]').click()
        page.locator('#monitoringView').wait_for(state='visible')
        page.locator('#openJobConfig').click()
        page.locator('#jobDialog').wait_for(state='visible')
        assert page.locator('.job-configuration-overview button').count() == 3
        assert page.locator('#missionForm > .job-config-group[open]').count() == 1
        assert page.get_by_text('Obiettivo e ambito', exact=True).count() >= 1
        assert page.get_by_text('Criteri di ricerca', exact=True).count() >= 1
        assert page.get_by_text('Frequenza e istruzioni', exact=True).count() >= 1
        assert page.get_by_text('Riferimento del confronto', exact=True).count() == 1
        assert page.get_by_text('Novelty rispetto alla baseline', exact=True).count() == 0
        page.keyboard.press('Escape')

        PHASE = 'admin-progressive-groups'
        page.locator('#openAdminCenter').click()
        page.locator('#adminCenter').wait_for(state='visible')
        page.locator('.admin-section-nav').get_by_role('button', name='GA-01 · Governo AI').click()
        assert page.locator('#governanceForm > .admin-config-group').count() == 2
        assert page.locator('#governanceForm > .admin-config-group[open]').count() == 1
        page.locator('.admin-section-nav').get_by_role('button', name='IA-01 · Identità locali').click()
        assert page.locator('#userForm > .admin-config-group').count() == 1
        assert page.locator('#userForm > .admin-config-group[open]').count() == 0
        no_overflow(page, 'admin-progressive-groups')

        PHASE = 'preferences-and-labels'
        page.emulate_media(reduced_motion='reduce', forced_colors='active')
        assert page.get_by_text('Stato di conformità', exact=True).count() == 0
        assert page.get_by_text('Compliance score', exact=True).count() == 0
        assert page.locator('button:visible').evaluate_all("els => els.every(el => el.innerText.trim() || el.getAttribute('aria-label') || el.getAttribute('title'))")
        browser.close()

        report = {
            'schemaVersion': '2.0.0-candidate',
            'ok': True,
            'model': 'compliance-guided-1',
            'checks': [
                'six-stage-guidance', 'full-path-progressive-disclosure', 'settings-three-steps',
                'settings-single-open', 'settings-390', 'settings-320', 'monitoring-three-steps',
                'monitoring-single-open', 'technical-primary-labels-zero', 'governance-two-groups',
                'local-identity-collapsed', 'reduced-motion', 'forced-colors', 'unlabeled-controls-zero'
            ]
        }
        (ART / 'browser-enterprise-2-compliance-flow-check.json').write_text(json.dumps(report, indent=2), encoding='utf8')
        print('browser-enterprise-2-compliance-flow: complete', flush=True)
except BaseException as error:
    annotate(error)
    raise
