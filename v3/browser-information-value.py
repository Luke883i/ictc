import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'

def fail(exc):
    payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc()}
    (ART/'browser-information-value-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
    print(f'::error title=browser-information-value::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def no_overflow(page):
    metric=page.evaluate('()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
    assert max(metric['html'],metric['body'])<=metric['inner']+1,metric

def open_view(page,view,procedure=None):
    url=f'{BASE}/?view={view}'
    if procedure: url+=f'&procedure={procedure}'
    page.goto(url,wait_until='networkidle')

def assert_information_value(page,key,contains=None):
    card=page.locator(f'[data-surface-information-value="{key}"]')
    expect(card).to_be_visible()
    expect(card).to_contain_text('Scopo e valore')
    expect(card).to_contain_text('Catena comune')
    expect(card).to_contain_text('Obblighi applicabili')
    expect(card).to_contain_text('Responsabilità')
    expect(card).to_contain_text('Evidenze')
    expect(card).to_contain_text('Limite')
    if contains: expect(card).to_contain_text(contains)
    no_overflow(page)

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        ctx=browser.new_context(viewport={'width':1280,'height':900})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
        page=ctx.new_page(); page.set_default_timeout(30000)
        errors=[]; writes=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda req:writes.append({'method':req.method,'url':req.url}) if req.url.startswith(BASE+'/api/') and req.method!='GET' else None)

        PHASE='home-manifest'
        open_view(page,'home')
        manifest=page.locator('#ictcManifest')
        expect(manifest).to_be_visible()
        for text in ['Conformità come lavoro umano verificabile.','obblighi applicabili','Requisito → rischio o impatto','Dati e AI','decisioni restano umane','non determina da solo applicabilità normativa']:
            expect(manifest).to_contain_text(text)
        no_overflow(page)
        page.screenshot(path=str(ART/'information-value-home.png'),full_page=True)

        PHASE='role-invariance'
        for role in ['admin','user','auditor']:
            page.evaluate("role=>localStorage.setItem('ictc-role',role)",role)
            page.reload(wait_until='networkidle')
            expect(page.locator('#ictcManifest')).to_contain_text('Conformità come lavoro umano verificabile.')
            expect(page.locator('#homeRole')).not_to_be_empty()
        page.evaluate("()=>localStorage.setItem('ictc-role','admin')")

        PHASE='top-level-surfaces'
        for view,needle in [
            ('processes','Processo di Compliance'),
            ('monitoring','applicabilità o completezza'),
            ('incidents','obblighi di notifica'),
            ('proof','non è certificazione'),
            ('epistemic','non crea verità sostanziale')]:
            open_view(page,view)
            assert_information_value(page,view,needle)

        PHASE='all-grc-procedures'
        procedure_boundaries={
            'objects':'completezza dell’ambiente reale',
            'coverage':'non stabiliscono applicabilità, certificazione o efficacia',
            'actions':'non equivale a chiusura verificata',
            'risks':'non probabilità oggettive',
            'assurance':'non costituisce certificazione o assurance esterna'
        }
        for procedure,needle in procedure_boundaries.items():
            open_view(page,'grc',procedure)
            assert_information_value(page,'grc',needle)
            expect(page.locator('.procedure-frame')).to_be_visible()

        PHASE='admin-governance'
        open_view(page,'home')
        page.locator('#openAdminCenter').click()
        admin=page.locator('#adminCenter')
        expect(admin).to_be_visible()
        expect(admin.locator('[data-dialog-information-value="admin"]')).to_contain_text('Telemetria AI')
        expect(admin.locator('[data-dialog-information-value="admin"]')).to_contain_text('provider, modelli e budget')
        admin.locator('[data-admin-close]').click()
        expect(admin).not_to_be_visible()

        PHASE='ai-settings-boundary'
        page.locator('#openSettings').click()
        settings=page.locator('#settingsDialog')
        expect(settings).to_be_visible()
        expect(settings.locator('[data-dialog-information-value="aiSettings"]')).to_contain_text('Canale AI')
        expect(settings.locator('[data-dialog-information-value="aiSettings"]')).to_contain_text('non rende i suoi output veri')
        settings.locator('[data-close="settingsDialog"]').first.click()

        PHASE='mobile-information-density'
        mc=browser.new_context(viewport={'width':390,'height':844})
        mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
        mobile=mc.new_page(); mobile.set_default_timeout(30000)
        open_view(mobile,'home'); expect(mobile.locator('#ictcManifest')).to_be_visible(); no_overflow(mobile)
        open_view(mobile,'processes'); assert_information_value(mobile,'processes'); no_overflow(mobile)
        mobile.screenshot(path=str(ART/'information-value-mobile.png'),full_page=True)
        mc.close()

        assert not writes,writes
        assert not errors,errors
        out={'ok':True,'profile':'all-surface-information-value','topLevelViews':['home','processes','monitoring','incidents','grc','proof','epistemic'],'grcProcedures':list(procedure_boundaries),'roles':['admin','user','auditor'],'adminTelemetry':True,'aiSettingsBoundary':True,'mobileOverflow':False,'writeCount':len(writes),'claimBoundary':'Browser projection evidence only; does not determine legal applicability, conformity, certification or deployment security.'}
        (ART/'browser-information-value.json').write_text(json.dumps(out,indent=2),encoding='utf8')
        print('browser-information-value: complete',flush=True)
        ctx.close(); browser.close()
except BaseException as exc:
    fail(exc); traceback.print_exc(); raise
