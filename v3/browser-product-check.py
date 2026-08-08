import json
import os
import pathlib
import traceback
from playwright.sync_api import expect, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
MOCK = os.environ.get('ICTC_MOCK_URL', 'http://127.0.0.1:4899').rstrip('/')
PHASE = 'initialization'


def fail(error):
    payload = {'ok': False, 'phase': PHASE, 'type': type(error).__name__, 'message': str(error), 'traceback': traceback.format_exc()}
    (ART / 'browser-product-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    print(f'::error title=browser-product-check::{PHASE}: {type(error).__name__}: {str(error)}', flush=True)


def open_settings_section(form, section_id):
    section = form.locator(f'[data-settings-section="{section_id}"]')
    if section.get_attribute('open') is None:
        section.locator(':scope > summary').click()
    expect(section).to_have_attribute('open', '')
    expect(form.locator('[data-settings-section][open]')).to_have_count(1)


try:
    with sync_playwright() as playwright:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path'] = os.environ['ICTC_CHROMIUM']
        browser = playwright.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True)
        context.add_init_script("try{localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')}catch{}")
        page = context.new_page()
        page.set_default_timeout(15000)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        PHASE = 'canonical-bootstrap'
        page.goto(f'{BASE}/', wait_until='networkidle')
        expect(page.locator('html')).to_have_attribute('data-ictc-experience', 'active-1')
        assert 'Enterprise clarity' not in page.title()
        assert '1.7' not in page.title()
        hub = page.locator('#procedureHub[data-procedure-hub="server-derived"]')
        hub.wait_for(state='visible')
        assert hub.locator('[data-procedure-id]').count() == 4
        assert hub.locator('[data-procedure-id="monitoring"][data-process-code="RN-01"]').count() == 1
        assert hub.locator('[data-procedure-id="incidents"][data-process-code="EC-01"]').count() == 1
        assert hub.locator('[data-procedure-id="evidence"][data-process-code="EV-01"]').count() == 1

        PHASE = 'settings-and-ai'
        page.locator('#homePrimaryAction').click()
        page.locator('#settingsDialog').wait_for(state='visible')
        settings = page.locator('#settingsForm')
        expect(settings.locator('[data-settings-section]')).to_have_count(3)
        open_settings_section(settings, 'organization')
        settings.locator('input[name="organizationName"]').fill('Azienda Browser')
        settings.locator('textarea[name="organizationScope"]').fill('Sicurezza delle informazioni in Italia e Unione europea')
        settings.locator('input[name="jurisdictions"]').fill('Italia, Unione europea')
        open_settings_section(settings, 'provider')
        settings.locator('input[name="endpoint"]').fill(f'{MOCK}/v1/chat/completions')
        settings.locator('input[name="model"]').fill('mock-browser')
        settings.locator('input[name="apiKeyEnv"]').fill('ICTC_LLM_API_KEY')
        settings.get_by_role('button', name='Salva configurazione AI').click()
        page.locator('#settingsDialog').wait_for(state='hidden')

        PHASE = 'monitoring-lifecycle'
        page.locator('.service-nav [data-service="monitoring"]').click()
        mission = page.locator('#missionForm')
        mission.locator('textarea[name="objective"]').fill('Fonti ufficiali sulla sicurezza delle informazioni e servizi cloud in Italia e UE')
        mission.locator('select[name="cadence"]').select_option('168')
        mission.locator('input[name="sourceHints"]').fill('https://eur-lex.europa.eu')
        mission.get_by_role('button', name='Crea piano').click()
        page.locator('#planDialog').wait_for(state='visible')
        page.get_by_role('button', name='Attiva monitoraggio').click()
        page.locator('[data-close="planDialog"]').click()
        card = page.locator('.mission-card').first
        card.get_by_role('button', name='Esegui ora').click()
        page.locator('[data-open-source]').first.wait_for()

        admin_response = context.request.get(f'{BASE}/api/bootstrap', headers={'x-ictc-role': 'admin', 'x-ictc-actor-id': 'local-admin'})
        assert admin_response.status == 200
        admin_body = admin_response.json()
        assert admin_body['ontology']['authority'] == 'runtime'
        assert admin_body['homeNextAction']['schemaVersion'] == '1.0.0'
        assert all(item['schemaVersion'] == '1.0.0' for item in admin_body['procedures'])
        candidate = next(item for item in admin_body['catalog'] if item['state'] == 'candidate')

        PHASE = 'human-source-decision'
        page.locator('.service-nav [data-service="home"]').click()
        primary = page.locator('#homePrimaryAction')
        expect(primary).to_have_attribute('data-home-action', 'monitoring-catalog')
        expect(primary).to_have_attribute('data-home-target-id', candidate['id'])
        primary.click()
        page.locator('#sourceDialog').wait_for(state='visible')
        page.locator('#sourceDecisionReason').fill('Autorità, URL e identificativo verificati da operatore umano.')
        page.locator('[data-source-decision="verified"]').click()
        page.locator('#sourceBody').get_by_text('Accettata nel catalogo', exact=False).first.wait_for()
        page.locator('[data-close="sourceDialog"]').click()

        PHASE = 'user-contribution-and-event'
        page.locator('#roleSelect').select_option('user')
        page.locator('.service-nav [data-service="monitoring"]').click()
        page.locator('#openContribution').click()
        contribution = page.locator('#contributionForm')
        contribution.locator('textarea[name="text"]').fill('Delibera ufficiale da conservare e verificare')
        contribution.locator('textarea[name="note"]').fill('Materiale osservato nel perimetro UE')
        contribution.get_by_role('button', name='Conserva e analizza').click()
        page.locator('#contributionDialog').wait_for(state='hidden')
        page.locator('#contributionList').get_by_text('Materiale osservato nel perimetro UE', exact=False).wait_for()

        page.locator('.service-nav [data-service="incidents"]').click()
        page.locator('#openIncident').click()
        incident = page.locator('#incidentForm')
        incident.locator('textarea[name="originalNarrative"]').fill('Quasi incidente: email sospetta ricevuta e bloccata prima dell’apertura')
        incident.get_by_role('button', name='Registra evento').click()
        page.locator('#incidentWorkspace').wait_for(state='visible')
        page.locator('[data-close="incidentWorkspace"]').click()
        page.locator('.incident-card').first.get_by_role('button', name='Evidenze').wait_for()

        PHASE = 'proof-and-auditor'
        page.locator('#roleSelect').select_option('auditor')
        page.locator('#openProofSurface').click()
        page.locator('#proofContent').wait_for(state='visible')
        expect(page.locator('#proofActor')).to_contain_text('Auditor')
        expect(page.locator('#proofBoundary')).not_to_have_text('')
        response = context.request.get(f'{BASE}/api/bootstrap', headers={'x-ictc-role': 'auditor', 'x-ictc-actor-id': 'local-auditor'})
        body = response.json()
        assert response.status == 200
        assert body['integrity']['ok'] is True
        assert body['homeNextAction']['readOnly'] is True
        assert not errors, errors

        checks = [
            'one-active-experience', 'neutral-static-shell', 'server-derived-procedure-hub', 'single-open-settings',
            'monitoring-plan-human-activation', 'candidate-source-human-decision', 'ontology-derived-state-labels',
            'material-original-preserved', 'event-original-preserved', 'canonical-proof-surface', 'auditor-read-only', 'integrity-ok'
        ]
        (ART / 'browser-check.json').write_text(json.dumps({'ok': True, 'checks': checks, 'release': admin_body['version'], 'experience': 'active-1'}, indent=2), encoding='utf8')
        print('browser-product-check: evidence complete', flush=True)
        browser.close()
except BaseException as error:
    fail(error)
    traceback.print_exc()
    raise
