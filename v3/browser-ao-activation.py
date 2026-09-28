import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
from browser_test_support import ensure_onboarded

ART=pathlib.Path(os.environ.get('ICTC_ARTIFACT_DIR',str(pathlib.Path.cwd()/'artifacts')))
ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'

def hdr():
    return {'content-type':'application/json','x-ictc-role':'admin','x-ictc-actor-id':'local-admin'}

def fail(e):
    p={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}
    (ART/'browser-ao-activation-error.json').write_text(json.dumps(p,indent=2),encoding='utf8')
    print(f'::error title=browser-ao-activation::{PHASE}: {e}',flush=True)

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        ctx=browser.new_context(viewport={'width':1280,'height':900})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes');localStorage.setItem('ictc-grc-process','objects')")

        PHASE='create-incomplete'
        r=ctx.request.fetch(BASE+'/api/grc/objects',method='POST',headers=hdr(),data={'type':'application','name':'AO candidate incomplete browser','criticality':'medium'})
        assert r.ok,(r.status,r.text())
        oid=r.json()['result']['id']

        PHASE='open-ao'
        page=ctx.new_page()
        page.set_default_timeout(20000)
        ensure_onboarded(page,BASE,'admin')
        page.goto(BASE+'/',wait_until='networkidle')
        page.locator('.service-nav [data-service="processes"]').click()
        card=page.locator('#procedureHub [data-process-code="AO-01"]')
        expect(card).to_be_visible()
        card.locator('.procedure-primary,.primary').first.click()
        workspace=page.locator('#grcWorkspace')
        expect(workspace).to_be_visible()
        search=workspace.locator('[data-seq-ao-search]')
        expect(search).to_be_visible()
        search.fill('AO candidate incomplete browser')
        page.wait_for_timeout(80)
        row=workspace.locator('.grc-list > article').filter(has_text='AO candidate incomplete browser')
        expect(row).to_be_visible()
        expect(row.locator(':scope > [data-ao-legacy-summary="suppressed"]')).to_have_count(0)
        expect(row.locator('.finetune-object-facts')).to_have_count(0)
        facts=row.locator('.procedure-record-facts')
        expect(facts).to_be_visible()
        expect(facts).to_contain_text('Fonte autorevole')
        expect(facts).to_contain_text('Da dichiarare')
        expect(facts).to_contain_text('Responsabile')
        expect(facts).to_contain_text('Da assegnare')

        PHASE='gap-orientation'
        complete=row.locator(f'[data-ao-complete-object="{oid}"]')
        expect(complete).to_be_visible()
        assert complete.get_attribute('data-journey-stage')=='establish-authority'
        assert complete.get_attribute('data-journey-authority')=='human'
        validate=row.locator('[data-object-review="active"]')
        expect(validate).to_be_hidden()
        assert row.locator('footer .primary').count()==0
        assert complete.get_attribute('data-uiux-action-hierarchy')=='record-local'

        PHASE='complete-basis'
        complete.click()
        dialog=page.locator('#aoCompleteObjectDialog')
        expect(dialog).to_be_visible()
        dialog.locator('[name="owner"]').fill('local-admin')
        dialog.locator('[name="sourceAuthority"]').fill('CMDB approvata')
        dialog.locator('[name="reason"]').fill('Riconcilio owner e fonte autorevole prima della review.')
        dialog.get_by_role('button',name='Salva dati').click()
        expect(dialog).to_be_hidden()
        page.wait_for_timeout(300)
        search=page.locator('#grcWorkspace [data-seq-ao-search]')
        expect(search).to_be_visible()
        search.fill('AO candidate incomplete browser')
        page.wait_for_timeout(60)
        row=page.locator('#grcWorkspace .grc-list > article').filter(has_text='AO candidate incomplete browser')
        expect(row.locator('[data-ao-complete-object]')).to_have_count(0)
        expect(row.locator('[data-object-review="active"]')).to_be_visible()
        expect(row.locator(':scope > [data-ao-legacy-summary="suppressed"]')).to_have_count(0)
        expect(row.locator('.finetune-object-facts')).to_have_count(0)
        expect(row.locator('.procedure-record-facts')).to_contain_text('local-admin')
        expect(row.locator('.procedure-record-facts')).to_contain_text('CMDB approvata')

        PHASE='activate'
        row.locator('[data-object-review="active"]').click()
        decision=page.locator('#grcDecisionDialog')
        expect(decision).to_be_visible()
        decision.locator('[name="reason"]').fill('Identità, owner e fonte ricostruibili.')
        decision.get_by_role('button',name='Registra decisione').click()
        expect(decision).to_be_hidden()
        page.wait_for_timeout(250)
        state=ctx.request.get(BASE+'/api/grc',headers=hdr())
        assert state.ok
        obj=next(x for x in state.json()['objects']['objects'] if x['id']==oid)
        assert obj['status']=='active'
        assert obj['ownerRef']['id']=='local-admin'
        assert obj['sourceAuthority']=='CMDB approvata'

        PHASE='result'
        result={'ok':True,'control':'AO-ACTIVATION-JOURNEY-2.4','candidateIncompleteAllowed':True,'singleRepairFocalAction':True,'recordLocalPrimarySuppressed':True,'sharedAuthorityFactSurface':True,'fullRegistrySearch':True,'legacyFactSurfaceAbsent':True,'activationFailClosedBasis':['owner','sourceAuthority'],'repairPersisted':True,'finalStatus':'active'}
        (ART/'browser-ao-activation.json').write_text(json.dumps(result,indent=2),encoding='utf8')
        print('browser-ao-activation-2.4: complete',flush=True)
        browser.close()
except BaseException as e:
    fail(e)
    traceback.print_exc()
    raise
