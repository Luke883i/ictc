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
SHOTS = []


def shot(page, name):
    path = ART / f'ui-standard-{name}.png'
    page.screenshot(path=str(path), full_page=False)
    SHOTS.append(path.name)


def no_overflow(page, label, selector='html'):
    delta = page.locator(selector).evaluate('el => el.scrollWidth - el.clientWidth')
    assert delta <= 1, f'{label}: horizontal overflow {delta}px'


def close_box_in_header(page, dialog_selector):
    header = page.locator(f'{dialog_selector} .ui-dialog-header').first
    close = page.locator(f'{dialog_selector} .ui-dialog-close').first
    hb = header.bounding_box()
    cb = close.bounding_box()
    assert hb and cb
    assert cb['width'] >= 44 and cb['height'] >= 44, cb
    assert cb['x'] + cb['width'] >= hb['x'] + hb['width'] - 64, (hb, cb)
    assert cb['y'] <= hb['y'] + 20, (hb, cb)


def annotate(error):
    payload = {'ok': False, 'phase': PHASE, 'type': type(error).__name__, 'message': str(error), 'traceback': traceback.format_exc()}
    (ART / 'browser-enterprise-2-ui-standard-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    message = str(error).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
    print(f'::error title=ui-standard-browser::{PHASE}: {type(error).__name__}: {message}', flush=True)


try:
    with sync_playwright() as playwright:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path'] = os.environ['ICTC_CHROMIUM']
        browser = playwright.chromium.launch(**launch)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.set_default_timeout(15000)

        PHASE = 'home-metric-atomicity'
        page.goto(f'{BASE}/', wait_until='networkidle')
        page.locator('html[data-ui-standard="ictc-surface-standard-1"]').wait_for(state='attached')
        page.locator('#roleSelect').select_option('admin')
        page.locator('#homeView').wait_for(state='visible')
        assert page.locator('.process-lane .lane-status[data-metric-pairs="true"]').count() >= 2
        for host in page.locator('.process-lane .lane-status[data-metric-pairs="true"]').all():
            assert host.locator(':scope > .ui-metric-pair').count() == 2

        PHASE = 'home-metric-rerender-reconciliation'
        page.locator('#roleSelect').select_option('user')
        page.locator('#openSettings').wait_for(state='hidden')
        page.locator('#homeView').wait_for(state='visible')
        for host in page.locator('.process-lane .lane-status[data-metric-pairs="true"]').all():
            assert host.locator(':scope > .ui-metric-pair').count() == 2, 'metric pair reconciliation after rerender'
        shot(page, 'home-desktop')

        PHASE = 'restore-admin-deterministically'
        page.evaluate("localStorage.setItem('ictc-role','admin')")
        page.reload(wait_until='networkidle')
        page.locator('html[data-ui-standard="ictc-surface-standard-1"]').wait_for(state='attached')
        page.locator('#openSettings').wait_for(state='visible')
        assert page.locator('#roleSelect').input_value() == 'admin'

        PHASE = 'settings-dialog-chrome'
        page.locator('#openSettings').click()
        page.locator('#settingsDialog').wait_for(state='visible')
        close_box_in_header(page, '#settingsDialog')
        assert page.locator('#settingsDialog .ui-dialog-body').count() == 1
        assert page.locator('#settingsDialog .ui-dialog-footer').count() == 1
        assert page.locator('#settingsForm .settings-section-18[open]').count() == 1
        page.set_viewport_size({'width': 390, 'height': 844})
        no_overflow(page, 'settings-390', '#settingsDialog')
        page.set_viewport_size({'width': 320, 'height': 568})
        no_overflow(page, 'settings-320', '#settingsDialog')
        assert page.locator('#settingsDialog .configuration-overview ol').evaluate("el => getComputedStyle(el).gridTemplateColumns.split(' ').length") == 3
        footer = page.locator('#settingsDialog .ui-dialog-footer').bounding_box()
        assert footer and footer['height'] <= 72, footer
        shot(page, 'settings-320')
        page.keyboard.press('Escape')

        PHASE = 'monitoring-dialog-chrome'
        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.locator('.service-nav [data-service="monitoring"]').click()
        page.locator('#openJobConfig').click()
        page.locator('#jobDialog').wait_for(state='visible')
        close_box_in_header(page, '#jobDialog')
        assert page.locator('#missionForm > .job-config-group[open]').count() == 1
        assert page.get_by_text('Novelty rispetto alla baseline', exact=True).count() == 0
        shot(page, 'monitoring-config')
        page.keyboard.press('Escape')

        PHASE = 'admin-isolation-and-vocabulary'
        page.locator('#openAdminCenter').click()
        page.locator('#adminCenter').wait_for(state='visible')
        page.locator('.admin-section-nav').get_by_role('button', name='GA-01 · Governo AI').click()
        assert page.locator('#adminCenter .admin-grid > .admin-panel:visible').count() == 1
        classification = page.locator('#governanceForm select[name="classification"]')
        option_text = classification.locator('option').all_inner_texts()
        assert 'Uso interno' in option_text and 'internal' not in option_text
        close_box_in_header(page, '#adminCenter')
        shot(page, 'admin-governance')
        page.keyboard.press('Escape')

        PHASE = 'proof-disclosure-and-placeholder'
        page.locator('[data-proof-service]').click()
        page.locator('#proofView').wait_for(state='visible')
        assert page.get_by_text('Descrizione.', exact=True).count() == 0
        for standard in page.locator('.proof-standard:visible').all():
            box = standard.bounding_box()
            parent_width = standard.evaluate('el => el.parentElement.getBoundingClientRect().width')
            assert box and box['width'] >= parent_width * 0.88, (box, parent_width)
            summary = standard.locator(':scope > summary')
            if summary.count():
                sb = summary.bounding_box()
                assert sb and sb['height'] >= 44, sb
        page.set_viewport_size({'width': 320, 'height': 568})
        no_overflow(page, 'proof-320')
        assert page.locator('.brand small').is_hidden()
        assert page.locator('.service-nav [data-service]:visible').count() >= 3
        shot(page, 'proof-320')

        PHASE = 'zoom-200-and-preferences'
        page.evaluate("document.documentElement.style.fontSize='200%'")
        no_overflow(page, 'zoom-200')
        page.evaluate("document.documentElement.style.fontSize=''")
        page.emulate_media(reduced_motion='reduce', forced_colors='active')
        assert page.locator('button:visible').evaluate_all("els => els.every(el => el.innerText.trim() || el.getAttribute('aria-label') || el.getAttribute('title'))")
        no_overflow(page, 'forced-colors')
        browser.close()

        report = {
            'schemaVersion': '2.0.0-candidate',
            'ok': True,
            'standard': 'ictc-surface-standard-1',
            'screenshots': SHOTS,
            'checks': [
                'metric-value-label-atomic', 'metric-rerender-reconciled', 'deterministic-role-reload',
                'dialog-close-in-header', 'dialog-single-scroll-body', 'compact-mobile-footer',
                'settings-three-column-mobile-stepper', 'monitoring-single-open', 'admin-single-direct-panel',
                'classification-localized', 'placeholder-copy-zero', 'proof-standard-contained', 'mobile-brand-compact',
                '320-reflow', '390-reflow', 'zoom-200', 'reduced-motion', 'forced-colors'
            ]
        }
        (ART / 'browser-enterprise-2-ui-standard-check.json').write_text(json.dumps(report, indent=2), encoding='utf8')
        print('browser-enterprise-2-ui-standard: complete', flush=True)
except BaseException as error:
    annotate(error)
    raise
