import json
import os
import pathlib
import time
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
MOCK = os.environ.get('ICTC_MOCK_URL', 'http://127.0.0.1:4899').rstrip('/')

with sync_playwright() as p:
    launch_options = {'headless': True, 'args': ['--no-sandbox']}
    chromium_path = os.environ.get('ICTC_CHROMIUM')
    if chromium_path:
        launch_options['executable_path'] = chromium_path
    elif pathlib.Path('/usr/bin/chromium').exists():
        launch_options['executable_path'] = '/usr/bin/chromium'
    browser = p.chromium.launch(**launch_options)
    context = browser.new_context(viewport={'width': 1440, 'height': 1100}, accept_downloads=True)
    context.add_init_script("""
      try { localStorage.setItem('ictc-role', 'admin'); localStorage.setItem('ictc-service', 'monitoring'); } catch {}
    """)
    page = context.new_page()
    page.set_default_timeout(15000)
    page.set_default_navigation_timeout(20000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    print('browser-check: bootstrap', flush=True)
    page.goto(f'{BASE}/', wait_until='networkidle')
    monitoring_heading = page.locator('.hero-monitoring h1')
    monitoring_heading.wait_for()
    assert 'Definisci cosa monitorare.' in monitoring_heading.inner_text()
    page.locator('#runtimeStatus').get_by_text('Amministratore', exact=False).wait_for()

    print('browser-check: AI configuration', flush=True)
    page.locator('#openSettings').click()
    form = page.locator('#settingsForm')
    form.locator('input[name="organizationName"]').fill('Azienda Browser')
    form.locator('textarea[name="organizationScope"]').fill('Sicurezza delle informazioni in Italia e Unione europea')
    form.locator('input[name="jurisdictions"]').fill('Italia, Unione europea')
    form.locator('input[name="endpoint"]').fill(f'{MOCK}/v1/chat/completions')
    form.locator('input[name="model"]').fill('mock-browser')
    form.locator('input[name="apiKeyEnv"]').fill('ICTC_LLM_API_KEY')
    form.get_by_role('button', name='Salva configurazione').click()
    page.locator('#settingsDialog').wait_for(state='hidden')
    page.locator('#runtimeStatus').get_by_text('AI pronta', exact=False).wait_for()

    print('browser-check: monitoring journey', flush=True)
    mission = page.locator('#missionForm')
    mission.locator('textarea[name="objective"]').fill('Fonti ufficiali sulla sicurezza delle informazioni in Italia e UE')
    mission.locator('details').click()
    mission.locator('textarea[name="promptOverride"]').fill('Privilegia fonti primarie e identificatori ufficiali.')
    mission.get_by_role('button', name='Prepara il piano').click()
    page.get_by_text('Cercherò', exact=True).wait_for()
    page.locator('#missionObjective').fill('Fonti ufficiali sulla sicurezza delle informazioni e servizi cloud in Italia e UE')
    page.get_by_role('button', name='Rigenera piano').click()
    page.locator('#planBody').get_by_text('v2', exact=True).wait_for()
    page.get_by_role('button', name='Attiva monitoraggio').click()
    page.locator('#proofPulse').wait_for(state='visible')
    page.locator('[data-close="planDialog"]').click()
    page.get_by_role('button', name='Esegui ora').click()
    page.get_by_text('Direttiva (UE) 2022/2555 — NIS2').wait_for()

    first_mission = page.locator('.mission-card').first
    first_mission.locator('[data-open-plan]').click()
    page.locator('#pauseReason').fill('Verifica temporanea del perimetro')
    page.locator('#planActions').get_by_role('button', name='Sospendi').click()
    page.get_by_text('In pausa', exact=True).wait_for()
    page.locator('#planActions').get_by_role('button', name='Riprendi monitoraggio').click()
    page.get_by_text('Attivo', exact=True).wait_for()
    with page.expect_download() as download_info:
        page.locator('#planActions').get_by_role('button', name='Scarica fascicolo').click()
    assert download_info.value.suggested_filename.endswith('.json')
    page.locator('[data-close="planDialog"]').click()

    page.get_by_text('Direttiva (UE) 2022/2555 — NIS2').click()
    page.locator('#sourceDecisionReason').fill('URL, autorità e identificativo ufficiale verificati.')
    page.get_by_role('button', name='Verifica fonte').click()
    page.locator('#sourceBody .fact-box b').filter(has_text='Verificata').wait_for()
    page.locator('[data-close="sourceDialog"]').click()

    page.get_by_role('button', name='Aggiungi materiale').click()
    page.locator('#contributionForm textarea[name="text"]').fill('Delibera ufficiale da verificare')
    page.locator('#contributionForm').get_by_role('button', name='Conserva e analizza').click()
    page.locator('#contributionDialog').wait_for(state='hidden')

    print('browser-check: user capability projection', flush=True)
    page.locator('#roleSelect').select_option('user')
    page.locator('#runtimeStatus').get_by_text('Utente', exact=False).wait_for()
    assert page.locator('#missionForm').is_hidden()
    assert page.locator('#userMonitoringIntro').is_visible()
    assert page.locator('#openSettings').is_hidden()
    page.locator('#userMonitoringIntro').get_by_role('button', name='Aggiungi materiale').click()
    page.locator('#contributionForm textarea[name="text"]').fill('Contributo creato dall’utente')
    page.locator('#contributionForm').get_by_role('button', name='Conserva e analizza').click()
    page.locator('#contributionDialog').wait_for(state='hidden')
    page.get_by_text('I tuoi ultimi contributi', exact=True).wait_for()

    print('browser-check: incident journey', flush=True)
    page.locator('[data-service="incidents"]').click()
    page.locator('#openIncident').click()
    page.locator('#incidentForm textarea[name="originalNarrative"]').fill('Un alert nei log indica un possibile attacco phishing ancora in corso su account email clienti.')
    page.locator('#incidentForm input[name="awarenessAt"]').fill(time.strftime('%Y-%m-%dT%H:%M'))
    page.locator('#incidentForm').get_by_role('button', name='Registra il racconto').click()
    page.get_by_text('AI Lens', exact=True).wait_for()
    page.get_by_text('Proposta AI modificabile', exact=True).wait_for()

    answers = {
        'classification': 'incident', 'affectedServices': 'Posta elettronica e CRM',
        'impact': 'Possibile accesso non autorizzato', 'actionsTaken': 'Account sospeso e password reimpostata',
        'ongoing': 'unknown', 'personalData': 'yes', 'maliciousActivity': 'yes',
        'crossBorder': 'unknown', 'detectedAt': time.strftime('%Y-%m-%dT%H:%M'),
    }
    for _ in range(20):
        answer = page.locator('[data-answer-question]')
        if answer.count() == 0:
            break
        question_id = answer.get_attribute('data-answer-question')
        field = page.locator('#questionValue')
        value = answers.get(question_id, 'unknown')
        if field.evaluate('(element) => element.tagName') == 'SELECT':
            field.select_option(value)
        else:
            field.fill(value)
        answer.click()
        page.wait_for_timeout(140)
    assert page.locator('[data-answer-question]').count() == 0, 'adaptive questions did not converge'

    page.get_by_role('button', name='Genera bozza AI').click()
    page.get_by_text('Origin Diff', exact=True).wait_for()
    page.locator('#finalNarrative').fill(page.locator('#finalNarrative').input_value() + ' Revisione umana browser.')
    page.get_by_role('button', name='Salva nuova versione').click()
    page.get_by_text('human-review', exact=True).wait_for()
    page.locator('#confirmIncident').check()
    page.get_by_role('button', name='Invia versione corrente').click()
    page.locator('#workspaceMeta').get_by_text('Inviata', exact=False).wait_for()
    with page.expect_download() as incident_download:
        page.locator('#workspaceActions').get_by_role('button', name='Scarica fascicolo').click()
    assert incident_download.value.suggested_filename.endswith('.json')

    page.locator('#roleSelect').select_option('admin')
    page.locator('#runtimeStatus').get_by_text('Amministratore', exact=False).wait_for()
    page.locator('.incident-card').first.locator('[data-open-incident]').click()
    page.locator('#closureNote').wait_for()
    page.locator('#closureNote').fill('Chiusura amministrativa dopo verifica del fascicolo')
    page.get_by_role('button', name='Chiudi fascicolo').click()
    page.locator('#workspaceMeta').get_by_text('Chiusa', exact=False).wait_for()
    page.screenshot(path=str(ART / 'runtime-journeys.png'), full_page=True)

    checks = [
        'global-ai-config', 'plan-reveal', 'plan-version', 'pause-resume', 'protected-mission-evidence',
        'source-reason', 'contribution', 'role-correct-user-view', 'ai-lens', 'question-compass',
        'human-adoption', 'origin-diff', 'formulation-version', 'incident-submit',
        'protected-incident-evidence', 'reasoned-close', 'proof-pulse'
    ]
    assert not errors, f'page errors: {errors}'
    (ART / 'browser-check.json').write_text(json.dumps({'ok': True, 'checks': checks}, indent=2), encoding='utf8')
    print('browser-check: teardown', flush=True)
    page.close(run_before_unload=False)
    context.close()
    browser.close()
    print(f'browser-check: ok ({len(checks)} live UX checks, role-correct evidence journeys, teardown complete)', flush=True)
