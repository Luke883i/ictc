import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'

def fail(exc):
    payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc()}
    (ART/'browser-risk-drilldown-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
    print(f'::error title=browser-risk-drilldown::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def headers(): return {'x-ictc-role':'admin','x-ictc-actor-id':'browser-risk-drilldown'}

def request(ctx,method,path,data=None):
    response=ctx.request.fetch(BASE+path,method=method,headers=headers(),data=data)
    assert response.ok,(method,path,response.status,response.text())
    return response.json()

def open_risks(page):
    page.goto(BASE+'/?view=processes',wait_until='networkidle')
    card=page.locator('#procedureHub [data-process-code="RC-01"]')
    expect(card).to_be_visible()
    card.locator(':scope > footer .primary').click()
    expect(page.locator('#grcView')).to_be_visible()
    frame=page.locator('#grcWorkspace > .procedure-frame')
    expect(frame).to_be_visible()
    expect(frame.locator('.procedure-frame-kicker span').first).to_have_text('RC-01')
    assert page.locator('[data-surface-context-strip]:visible').count()==0

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        ctx=browser.new_context(viewport={'width':1280,'height':900})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        page=ctx.new_page(); page.set_default_timeout(30000)
        errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))

        PHASE='create-human-scenario'
        created=request(ctx,'POST','/api/grc/risks',{'title':'RC-01 drilldown E2E','description':'Scenario creato per verificare la proiezione 5x5 e il drill-down human-rated.','likelihood':4,'impact':5,'rationale':'Proposta iniziale; il rating consolidato resta vuoto fino alla review umana.'})
        risk_id=created['result']['id']

        PHASE='pre-review-exclusion'
        before=request(ctx,'GET','/api/grc')['risks']
        assert all(r.get('riskId')!=risk_id for r in before.get('reviewed',[])),before
        assert all(risk_id not in cell.get('riskIds',[]) for row in before.get('heatmapCells',[]) for cell in row)

        PHASE='human-review'
        request(ctx,'POST',f'/api/grc/risks/{risk_id}/review',{'assessmentType':'inherent','likelihood':4,'impact':5,'reason':'Rating umano E2E per verificare proiezione e drill-down.'})
        after=request(ctx,'GET','/api/grc')['risks']
        cell=after['heatmapCells'][3][4]
        assert after['heatmap'][3][4]>=1,after['heatmap']
        assert risk_id in cell['riskIds'],cell
        assert any(item.get('riskId')==risk_id for item in after['reviewed'])

        PHASE='ui-risk-analysis-owner'
        open_risks(page)
        analysis=page.locator('#grcWorkspace .grc-heat[data-editorial-support="risk-analysis"]')
        expect(analysis).to_have_count(1)
        expect(analysis).to_be_visible()
        assert analysis.get_attribute('data-information-role')=='context'

        PHASE='ui-grid'
        cells=analysis.locator('.risk-map .risk-cell')
        expect(cells).to_have_count(25)
        target=cells.nth(19)
        expect(target).to_be_visible()
        assert target.evaluate('(el)=>el.tagName')=='DETAILS','human-rated 4x5 cell must be drillable'

        PHASE='ui-cell-drilldown'
        link=target.locator(f'a[href="#risk-{risk_id}"]')
        expect(link).to_have_count(1)
        if target.get_attribute('open') is None: target.locator(':scope > summary').click()
        expect(link).to_be_visible()
        expect(page.locator(f'#risk-{risk_id}')).to_have_count(1)

        PHASE='aggregate-projections'
        dims=analysis.locator('details[data-risk-dimensions]')
        expect(dims).to_have_count(1)
        if dims.get_attribute('open') is None: dims.locator(':scope > summary').click()
        expect(dims).to_contain_text('Proiezioni aggregate')
        expect(dims).to_contain_text('Origine operativa')
        expect(dims).to_contain_text('Specificità strutturale')
        expect(dims).to_contain_text('nessuna classificazione normativa viene dedotta')

        PHASE='bounded-semantics'
        assert not errors,errors
        payload={'ok':True,'profile':'risk-human-matrix-drilldown+semantic-composition-3.1+s4-a2-local-context-owner','riskId':risk_id,'cell':{'likelihood':4,'impact':5},'cells':25,'humanReviewed':True,'riskAnalysisOwner':'grc-workspace-3-2.js','aggregateProjection':True,'canonicalProcedureFrame':True,'retiredContextStripAbsent':True,'claimBoundary':'Browser E2E proves projection/drilldown wiring for an explicit human review and owner-bound risk-analysis context; it does not establish objective probability, legal applicability, offence classification, control effectiveness or compliance.'}
        (ART/'browser-risk-drilldown.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
        print('browser-risk-drilldown: complete',flush=True)
        ctx.close(); browser.close()
except BaseException as exc:
    fail(exc); traceback.print_exc(); raise
