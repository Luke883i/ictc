import json
import os
import pathlib
import time
import urllib.error
import urllib.request
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
BROWSER_ORIGIN = 'https://ictc.example'
MOCK = os.environ.get('ICTC_MOCK_URL', 'http://127.0.0.1:4899').rstrip('/')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('ICTC_CHROMIUM', '/usr/bin/chromium'), args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1100})
    context.add_init_script("""
      try {
        localStorage.setItem('ictc-role', 'admin');
        localStorage.setItem('ictc-service', 'monitoring');
      } catch {}
    """)
    def proxy(route):
        request = route.request
        target = BASE + request.url.removeprefix(BROWSER_ORIGIN)
        headers = {key: value for key, value in request.headers.items() if key.lower() not in {'host', 'content-length', 'accept-encoding'}}
        data = request.post_data_buffer if request.method not in {'GET', 'HEAD'} else None
        upstream = urllib.request.Request(target, data=data, headers=headers, method=request.method)
        try:
            with urllib.request.urlopen(upstream, timeout=60) as response:
                route.fulfill(status=response.status, headers=dict(response.headers), body=response.read())
        except urllib.error.HTTPError as error:
            route.fulfill(status=error.code, headers=dict(error.headers), body=error.read())

    context.route(f'{BROWSER_ORIGIN}/**', proxy)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    with urllib.request.urlopen(BASE + '/', timeout=30) as response:
        html = response.read().decode('utf8')
    html = html.replace('<head>', f'<head><base href="{BROWSER_ORIGIN}/">', 1)
    page.set_content(html, wait_until='networkidle')
    page.get_by_role('heading', name='Descrivi il risultato.').wait_for()
    page.locator('#runtimeStatus').get_by_text('Amministratore', exact=False).wait_for()

    page.get_by_role('button', name='AI').click()
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

    mission = page.locator('#missionForm')
    mission.locator('textarea[name="objective"]').fill('Fonti ufficiali sulla sicurezza delle informazioni in Italia e UE')
    mission.get_by_role('button', name='Prepara il piano').click()
    page.get_by_text('Cercherò', exact=True).wait_for()
    page.get_by_role('button', name='Attiva monitoraggio').click()
    page.locator('#proofPulse').wait_for(state='visible')
    page.locator('[data-close="planDialog"]').click()
    page.get_by_role('button', name='Esegui ora').click()
    page.get_by_text('Direttiva (UE) 2022/2555 — NIS2').wait_for()

    page.get_by_role('button', name='Aggiungi materiale').click()
    page.locator('#contributionForm textarea[name="text"]').fill('Delibera ufficiale da verificare')
    page.locator('#contributionForm').get_by_role('button', name='Conserva e analizza').click()
    page.locator('#contributionDialog').wait_for(state='hidden')

    page.locator('[data-service="incidents"]').click()
    page.get_by_role('button', name='Nuova segnalazione').click()
    page.locator('#incidentForm textarea[name="originalNarrative"]').fill('Un alert nei log indica un possibile attacco phishing ancora in corso su account email clienti.')
    page.locator('#incidentForm input[name="awarenessAt"]').fill(time.strftime('%Y-%m-%dT%H:%M'))
    page.locator('#incidentForm').get_by_role('button', name='Registra il racconto').click()
    page.get_by_text('AI Lens', exact=True).wait_for()

    answers = {
        'classification': 'incident',
        'affectedServices': 'Posta elettronica e CRM',
        'impact': 'Possibile accesso non autorizzato',
        'actionsTaken': 'Account sospeso e password reimpostata',
        'ongoing': 'unknown',
        'personalData': 'yes',
        'maliciousActivity': 'yes',
        'crossBorder': 'unknown',
        'detectedAt': time.strftime('%Y-%m-%dT%H:%M'),
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
        page.wait_for_timeout(120)
    assert page.locator('[data-answer-question]').count() == 0, 'adaptive questions did not converge'

    page.get_by_role('button', name='Genera formulazione').click()
    page.get_by_text('Origin Diff', exact=True).wait_for()
    page.locator('#confirmIncident').check()
    page.get_by_role('button', name='Invia segnalazione').click()
    page.locator('#workspaceMeta').get_by_text('Inviata', exact=False).wait_for()
    page.screenshot(path=str(ART / 'evidence-ux.png'), full_page=True)

    checks = [
        'live-origin-modules', 'plan-reveal', 'proof-pulse', 'catalog-live',
        'contribution', 'ai-lens', 'question-compass', 'origin-diff', 'incident-submit'
    ]
    assert not errors, f'page errors: {errors}'
    (ART / 'browser-check.json').write_text(json.dumps({'ok': True, 'checks': checks}, indent=2), encoding='utf8')
    print(f'browser-check: ok ({len(checks)} live UX checks, modular origin)')
    browser.close()
