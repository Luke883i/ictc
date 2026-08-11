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

def compact_height(locator,limit,label):
    box=locator.bounding_box(); assert box and box['height']<=limit,{label:box,'limit':limit}

def above_fold(locator,fold,label):
    box=locator.bounding_box(); assert box and box['y']<fold,{label:box,'fold':fold}

def assert_horizontal_first(page):
    rows=page.locator('[data-compact-row]:visible')
    checked=0
    for index in range(min(rows.count(),30)):
        row=rows.nth(index); host=row.bounding_box()
        if not host or host['width']<1: continue
        children=row.locator(':scope > *:visible'); boxes=[]
        for child_index in range(children.count()):
            box=children.nth(child_index).bounding_box()
            if box: boxes.append(box)
        if len(boxes)>1:
            required=sum(item['width'] for item in boxes)+10*(len(boxes)-1)
            if required<=host['width']+1:
                tops=[round(item['y'],1) for item in boxes]
                assert max(tops)-min(tops)<=3,{'row':index,'host':host,'children':boxes}
                checked+=1
    assert checked>0,'no measurable horizontal-first row exercised'

def assert_touch_targets(page):
    controls=page.locator('[data-compact-row] button:visible,[data-compact-row] summary:visible')
    checked=0
    for index in range(min(controls.count(),40)):
        box=controls.nth(index).bounding_box()
        if not box: continue
        assert box['height']>=43.5,{'control':index,'height':box['height']}
        checked+=1
    assert checked>0,'no compact interactive target exercised'

def open_view(page,view):
    page.goto(f'{BASE}/?view={view}',wait_until='networkidle')

def assert_information_value(page,key,contains=None):
    card=page.locator(f'[data-surface-information-value="{key}"]')
    expect(card).to_be_visible()
    expect(card).to_contain_text('Scopo e valore')
    expect(card).to_contain_text('Catena comune')
    expect(card).to_contain_text('Obblighi applicabili')
    expect(card).to_contain_text('Responsabilità')
    expect(card).to_contain_text('Evidenza')
    expect(card).to_contain_text('Limite')
    expect(card.locator('details.surface-information-detail')).not_to_have_attribute('open','')
    compact_height(card,210,f'information-{key}')
    if contains: expect(card).to_contain_text(contains)
    no_overflow(page)

def open_profile(page):
    menu=page.locator('#stableProfileMenu')
    expect(menu.locator(':scope > summary')).to_be_visible()
    if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()

def activate_profile_action(page,selector):
    open_profile(page)
    action=page.locator(f'#stableProfileMenu {selector}')
    expect(action).to_be_visible()
    action.dispatch_event('click')

def open_grc_process(page,code):
    open_view(page,'processes')
    card=page.locator(f'#procedureHub [data-process-code="{code}"]')
    expect(card).to_be_visible()
    card.locator(':scope > footer .primary').click()
    expect(page.locator('#grcView')).to_be_visible()
    context=page.locator('[data-surface-context-strip]:visible')
    expect(context).to_contain_text(code)
    expect(context).not_to_contain_text('Processi di Compliance')

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
        expect(manifest.locator('details.ictc-manifest-detail')).not_to_have_attribute('open','')
        compact_height(manifest,245,'home-manifest')
        above_fold(page.locator('#homePrimaryAction'),900,'home-primary-action')
        no_overflow(page)
        page.screenshot(path=str(ART/'information-value-home.png'),full_page=True)

        PHASE='role-invariance'
        for role in ['admin','user','auditor']:
            page.evaluate("role=>localStorage.setItem('ictc-role',role)",role)
            page.reload(wait_until='networkidle')
            expect(page.locator('#ictcManifest')).to_contain_text('Conformità come lavoro umano verificabile.')
            expect(page.locator('#homeRole')).not_to_be_empty()
        page.evaluate("()=>localStorage.setItem('ictc-role','admin')")
        page.reload(wait_until='networkidle')

        PHASE='top-level-surfaces'
        for view,needle in [
            ('processes','Processo di Compliance'),
            ('monitoring','applicabilità o completezza'),
            ('incidents','obblighi di notifica'),
            ('proof','non è certificazione'),
            ('epistemic','non crea verità sostanziale')]:
            PHASE=f'top-level-{view}'
            open_view(page,view)
            assert_information_value(page,view,needle)
        PHASE='process-hub-density'
        open_view(page,'processes')
        hub=page.locator('#procedureHub')
        expect(hub).not_to_contain_text('Scopo del processo')
        expect(hub).not_to_contain_text('da vedere')
        expect(hub).not_to_contain_text('registrazioni')
        for index in range(min(hub.locator('.procedure-card').count(),7)):
            card=hub.locator('.procedure-card').nth(index)
            expect(card).not_to_contain_text('Processo di Compliance')
            for label_index in range(card.locator('.procedure-signal small').count()):
                label=(card.locator('.procedure-signal small').nth(label_index).inner_text() or '').strip()
                assert label and label not in {'da vedere','registrazioni'},label
        above_fold(hub.locator('.procedure-primary').first,900,'first-process-action')
        assert_horizontal_first(page); assert_touch_targets(page); no_overflow(page)

        procedure_boundaries={
            'objects':('AO-01','completezza dell’ambiente reale'),
            'coverage':('MC-01','non stabiliscono applicabilità, certificazione o efficacia'),
            'actions':('AP-01','non equivale a chiusura verificata'),
            'risks':('RC-01','non probabilità oggettive'),
            'assurance':('AR-01','non costituisce certificazione o assurance esterna')
        }
        for procedure,(code,needle) in procedure_boundaries.items():
            PHASE=f'grc-{procedure}-navigation'
            open_grc_process(page,code)
            PHASE=f'grc-{procedure}-information-value'
            assert_information_value(page,'grc',needle)

        PHASE='admin-governance-open'
        open_view(page,'home')
        activate_profile_action(page,'#openAdminCenter')
        admin=page.locator('#adminCenter')
        expect(admin).to_be_visible()
        PHASE='admin-governance-information'
        expect(admin.locator('[data-dialog-information-value="admin"]')).to_contain_text('Telemetria AI')
        expect(admin.locator('[data-dialog-information-value="admin"]')).to_contain_text('provider, modelli e budget')
        PHASE='admin-governance-close'
        page.keyboard.press('Escape')
        expect(admin).not_to_be_visible()

        PHASE='ai-settings-open'
        activate_profile_action(page,'#openSettings')
        settings=page.locator('#settingsDialog')
        expect(settings).to_be_visible()
        PHASE='ai-settings-information'
        expect(settings.locator('[data-dialog-information-value="aiSettings"]')).to_contain_text('Canale AI')
        expect(settings.locator('[data-dialog-information-value="aiSettings"]')).to_contain_text('non rende i suoi output veri')
        PHASE='ai-settings-close'
        page.keyboard.press('Escape')
        expect(settings).not_to_be_visible()

        PHASE='mobile-information-density'
        for width in [390,320]:
            mc=browser.new_context(viewport={'width':width,'height':844})
            mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
            mobile=mc.new_page(); mobile.set_default_timeout(30000)
            open_view(mobile,'home'); expect(mobile.locator('#ictcManifest')).to_be_visible(); no_overflow(mobile)
            open_view(mobile,'processes'); no_overflow(mobile)
            if width==390: mobile.screenshot(path=str(ART/'information-value-mobile.png'),full_page=True)
            mc.close()

        assert not writes,writes
        assert not errors,errors
        out={'ok':True,'profile':'all-surface-information-value+density','topLevelViews':['home','processes','monitoring','incidents','grc','proof','epistemic'],'grcProcedures':list(procedure_boundaries),'roles':['admin','user','auditor'],'adminTelemetry':True,'aiSettingsBoundary':True,'desktopManifestMaxPx':245,'desktopInformationMaxPx':210,'desktopFirstActionFoldPx':900,'mobileWidths':[390,320],'horizontalFirstRows':True,'minInteractiveTargetPx':44,'mobileOverflow':False,'writeCount':len(writes),'claimBoundary':'Browser projection/geometry evidence only; does not determine legal applicability, conformity, certification, human comprehension or deployment security.'}
        (ART/'browser-information-value.json').write_text(json.dumps(out,indent=2),encoding='utf8')
        print('browser-information-value: complete',flush=True)
        ctx.close(); browser.close()
except BaseException as exc:
    fail(exc); traceback.print_exc(); raise
