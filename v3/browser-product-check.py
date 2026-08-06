import json
import os
import pathlib
import traceback
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
MOCK = os.environ.get('ICTC_MOCK_URL', 'http://127.0.0.1:4899').rstrip('/')
PHASE = 'initialization'


def fail(error):
    payload = {'ok': False, 'phase': PHASE, 'type': type(error).__name__, 'message': str(error), 'traceback': traceback.format_exc()}
    (ART / 'browser-product-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    message = str(error).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
    print(f'::error title=browser-product-check::{PHASE}: {type(error).__name__}: {message}', flush=True)


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

        PHASE = 'bootstrap-and-provider'
        page.goto(f'{BASE}/', wait_until='networkidle')
        page.locator('#homeView[data-enterprise18="true"]').wait_for(state='visible')
        assert page.locator('.process-lane').count() == 2
        setup = page.locator('#homePrimaryAction')
        setup.wait_for(state='visible')
        assert setup.get_attribute('data-home-action') == 'settings'
        setup.click()
        page.locator('#settingsDialog').wait_for(state='visible')
        settings = page.locator('#settingsForm')
        organization_section = settings.locator('[data-settings-section="organization"]')
        provider_section = settings.locator('[data-settings-section="provider"]')
        assert organization_section.count() == provider_section.count() == 1
        if organization_section.get_attribute('open') is None:
            organization_section.locator(':scope > summary').click()
        if provider_section.get_attribute('open') is None:
            provider_section.locator(':scope > summary').click()
        settings.locator('input[name="organizationName"]').fill('Azienda Browser')
        settings.locator('textarea[name="organizationScope"]').fill('Sicurezza delle informazioni in Italia e Unione europea')
        settings.locator('input[name="jurisdictions"]').fill('Italia, Unione europea')
        settings.locator('input[name="endpoint"]').fill(f'{MOCK}/v1/chat/completions')
        settings.locator('input[name="model"]').fill('mock-browser')
        settings.locator('input[name="apiKeyEnv"]').fill('ICTC_LLM_API_KEY')
        settings.get_by_role('button', name='Salva configurazione').click()
        page.locator('#settingsDialog').wait_for(state='hidden')

        PHASE = 'governed-job-lifecycle'
        page.locator('.service-nav [data-service="monitoring"]').click()
        page.locator('#openJobConfig').click()
        job = page.locator('#missionForm')
        job.locator('input[name="jobName"]').fill('Fonti ufficiali cybersecurity UE')
        job.locator('textarea[name="objective"]').fill('Fonti ufficiali sulla sicurezza delle informazioni e servizi cloud in Italia e UE')
        job.locator('input[name="jurisdictions"]').fill('Italia, Unione europea')
        job.locator('input[name="authorities"]').fill('EUR-Lex, ACN, Garante')
        job.locator('input[name="sourceHints"]').fill('https://eur-lex.europa.eu')
        job.get_by_role('button', name='Genera piano del job').click()
        page.locator('#jobDialog').wait_for(state='hidden')
        card = page.locator('.mission-card').filter(has_text='Fonti ufficiali cybersecurity UE').first
        card.wait_for()
        assert card.locator('.mission-objective-18').count() == 1
        card.locator('[data-open-plan]').click()
        page.get_by_role('button', name='Attiva monitoraggio').click()
        page.locator('[data-close="planDialog"]').click()
        card = page.locator('.mission-card').filter(has_text='Fonti ufficiali cybersecurity UE').first
        card.get_by_role('button', name='Esegui ora').click()
        page.get_by_text('Direttiva (UE) 2022/2555 — NIS2').wait_for()
        page.get_by_text('Direttiva (UE) 2022/2555 — NIS2').click()
        page.locator('#sourceDecisionReason').fill('Autorità, URL e identificativo ufficiale verificati.')
        page.get_by_role('button', name='Verifica fonte').click()
        page.locator('#sourceBody').get_by_text('Verificata', exact=False).first.wait_for()
        page.locator('[data-close="sourceDialog"]').click()

        PHASE = 'material-contribution'
        page.locator('#roleSelect').select_option('user')
        page.locator('#runtimeStatus').get_by_text('Utente', exact=False).wait_for()
        page.locator('.service-nav [data-service="monitoring"]').click()
        page.locator('#monitoringContributionAction').click()
        page.locator('#contributionForm input[value="text"]').check()
        page.locator('#contributionForm textarea[name="text"]').fill('Delibera ufficiale da conservare e verificare')
        page.locator('#contributionForm textarea[name="note"]').fill('Materiale osservato nel perimetro UE')
        page.locator('#contributionForm').get_by_role('button', name='Conserva e analizza').click()
        page.locator('#contributionDialog').wait_for(state='hidden')
        page.locator('#materialRecent18').click()
        page.locator('#contributionList').get_by_text('Materiale osservato nel perimetro UE', exact=False).first.wait_for()

        PHASE = 'event-lifecycle'
        page.locator('.service-nav [data-service="incidents"]').click()
        page.locator('#openIncident').click()
        incident = page.locator('#incidentForm')
        incident.locator('textarea[name="originalNarrative"]').fill('Quasi incidente: email sospetta ricevuta e bloccata prima dell’apertura')
        incident.get_by_role('button', name='Registra evento').click()
        page.locator('#incidentWorkspace').wait_for(state='visible')
        page.locator('[data-close="incidentWorkspace"]').click()
        page.locator('.service-nav [data-service="incidents"]').click()
        event_card = page.locator('.incident-card').first
        event_card.get_by_role('button', name='Apri fascicolo').wait_for()
        event_card.get_by_role('button', name='Scarica evidenze').wait_for()

        PHASE = 'evidence-and-integrity'
        response = context.request.get(f'{BASE}/api/bootstrap', headers={'x-ictc-role': 'auditor', 'x-ictc-actor-id': 'local-auditor'})
        assert response.status == 200
        body = response.json()
        assert body['integrity']['ok'] is True
        assert any(item.get('jobName') == 'Fonti ufficiali cybersecurity UE' for item in body['missions'])
        assert body['incidents']
        assert not errors, errors

        checks = ['provider-configured-through-progressive-home-action', 'governed-job-created', 'job-name-and-objective-projected', 'plan-approved', 'job-executed', 'source-decided', 'material-original-preserved', 'event-original-preserved', 'named-event-actions', 'auditor-readback', 'integrity-ok']
        (ART / 'browser-check.json').write_text(json.dumps({'ok': True, 'checks': checks, 'activeRelease': '1.8.0'}, indent=2), encoding='utf8')
        print('browser-product-check: evidence complete', flush=True)
except BaseException as error:
    fail(error)
    traceback.print_exc()
    raise
