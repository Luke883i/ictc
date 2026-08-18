import json, os, pathlib, traceback, urllib.request
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'

def _slug(value): return ''.join(c if c.isalnum() or c in '._-' else '-' for c in str(value or 'unknown')).strip('-')[:72] or 'unknown'
def _publish_failure_phase(exc):
    token=os.environ.get('GH_TOKEN','');sha=os.environ.get('HEAD_SHA','');repo=os.environ.get('GITHUB_REPOSITORY','')
    if not token or len(sha)!=40 or not repo:return
    detail=_slug(f'{type(exc).__name__}-{str(exc).splitlines()[0] if str(exc) else "error"}')[:54]
    body=json.dumps({'state':'failure','context':f'ictc/browser-1-6-failure/{_slug(PHASE)}/{detail}','description':f'UI/UX 1.6 {PHASE}: {type(exc).__name__}'[:140]}).encode()
    req=urllib.request.Request(f'https://api.github.com/repos/{repo}/statuses/{sha}',data=body,method='POST',headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'})
    try: urllib.request.urlopen(req,timeout=8).read()
    except Exception: pass

def fail(exc):
    payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc()}
    (ART/'browser-procedure-ui-ux-1-6-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
    _publish_failure_phase(exc)
    print(f'::error title=browser-procedure-ui-ux-1-6::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def no_overflow(page):
    m=page.evaluate('()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
    assert max(m['html'],m['body'])<=m['inner']+1,m

def open_process(page,code):
    page.locator('.service-nav [data-service="processes"]').click()
    card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); card.locator(':scope > footer .primary').click(); page.wait_for_timeout(100)
    page.wait_for_function("()=>document.documentElement.dataset.ictcUiUxFinetuning==='1.6.0'&&document.documentElement.dataset.ictcUiUxIntegrity==='1.6.1'")

def primary_count(scope): return scope.locator('.ux-primary:visible').count()
def assert_at_most_one_primary(scope,label):
    count=primary_count(scope); assert count<=1,(label,count,scope.inner_text()[:1200])
def target_heights(scope): return scope.locator('button:visible,summary:visible').evaluate_all('xs=>xs.map(x=>({text:(x.textContent||x.getAttribute("aria-label")||"").trim(),h:x.getBoundingClientRect().height})).filter(x=>x.text)')
def assert_targets(scope,label):
    small=[x for x in target_heights(scope) if x['h']<43.5]; assert not small,(label,small[:20])
def revision(page): return int(page.locator('html').get_attribute('data-ictc-projection-revision') or 0)
def close_plan(page):
    close=page.locator('#planDialog [aria-label="Chiudi"]')
    if close.count(): close.click()
    else: page.keyboard.press('Escape')
def close_scheduler(page):
    dialog=page.locator('#jobDialog')
    if dialog.get_attribute('open') is not None:
        close=dialog.locator('[aria-label="Chiudi configurazione job"]');
        if close.count(): close.click()
        else: page.keyboard.press('Escape')
def ensure_monitoring_card(page):
    global PHASE
    missions=page.locator('#missionsList .mission-card')
    if missions.count()>0:return missions
    PHASE='RN-seed-open-scheduler'
    trigger=page.locator('#monitoringView [data-rn-open-scheduler]');expect(trigger).to_be_visible();trigger.click();expect(page.locator('#jobDialog')).to_be_visible()
    PHASE='RN-seed-monitoring-form'
    form=page.locator('#jobDialog #missionForm');expect(form).to_be_visible();before=revision(page)
    page.evaluate("""()=>{const f=document.querySelector('#jobDialog #missionForm');if(!f)throw new Error('missionForm missing');const set=(name,value)=>{const el=f.elements[name];if(!el)return;el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));};set('objective','Monitorare fonti pubbliche normative e decisioni di autorita pertinenti al perimetro dichiarato.');set('cadence','168');set('sourceHints','https://eur-lex.europa.eu');set('promptOverride','');}""")
    PHASE='RN-seed-submit'
    form.locator('button[type="submit"]').click();expect(page.locator('#planDialog')).to_be_visible();page.wait_for_function('(old)=>Number(document.documentElement.dataset.ictcProjectionRevision||0)>old',arg=before);close_plan(page);close_scheduler(page);page.wait_for_function("()=>document.querySelectorAll('#missionsList .mission-card').length>0");return page.locator('#missionsList .mission-card')

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        ctx=browser.new_context(viewport={'width':1440,'height':950})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        page=ctx.new_page();page.set_default_timeout(30000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))

        PHASE='bootstrap-owner'
        page.goto(BASE+'/?view=processes',wait_until='networkidle')
        page.wait_for_function("()=>document.documentElement.dataset.ictcUiUxFinetuning==='1.6.0'&&document.documentElement.dataset.ictcUiUxIntegrity==='1.6.1'")
        expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)
        meta=page.locator('#epistemicMetaCard'); expect(meta).not_to_be_visible(); assert meta.evaluate('e=>e.parentElement?.id')=='proofView'
        no_overflow(page)

        PHASE='RN-open-process'
        open_process(page,'RN-01');expect(page.locator('#monitoringView')).to_be_visible();missions=ensure_monitoring_card(page);assert missions.count()>0
        for i in range(min(missions.count(),12)):
            PHASE=f'RN-card-{i}'
            card=missions.nth(i);assert_at_most_one_primary(card,f'RN-card-{i}');primary=card.locator('.ux-primary:visible');assert primary.count()==1;assert 'Apri monitoraggio' in primary.inner_text();assert card.locator('[data-run-mission]:visible,[data-pause-mission]:visible,[data-resume-mission]:visible').count()==0
        PHASE='RN-targets';assert_targets(page.locator('#monitoringView'),'RN')
        PHASE='RN-overflow';no_overflow(page)
        PHASE='RN-open-plan';missions.first.locator('.ux-primary').click();expect(page.locator('#planDialog')).to_be_visible()
        PHASE='RN-plan-actions';assert_at_most_one_primary(page.locator('#planActions'),'RN-plan-dialog');assert page.locator('#planActions [data-run-mission]:visible,#planActions [data-pause-mission]:visible').count()<=1
        close_plan(page)

        PHASE='EC-sequentiality'
        open_process(page,'EC-01');expect(page.locator('#incidentsView')).to_be_visible();cases=page.locator('#incidentList .incident-card');assert cases.count()>0
        for i in range(min(cases.count(),12)):
            card=cases.nth(i);assert_at_most_one_primary(card,f'EC-card-{i}');primary=card.locator('.ux-primary:visible');assert primary.count()==1;assert 'Apri caso' in primary.inner_text()
        cases.first.locator('.ux-primary').click();expect(page.locator('#incidentWorkspace')).to_be_visible();assert_at_most_one_primary(page.locator('#workspaceActions'),'EC-workspace-actions');assert page.locator('#incidentWorkspace .lens-panel.ux-progressive-panel').count()>=1;assert_targets(page.locator('#incidentWorkspace'),'EC-workspace');no_overflow(page)
        page.locator('#incidentWorkspace button[aria-label="Chiudi"]').click()

        PHASE='AO-governed-identity'
        open_process(page,'AO-01');expect(page.locator('#grcWorkspace')).to_be_visible();objects=page.locator('#grcWorkspace .grc-list > article');assert objects.count()>0
        for i in range(min(objects.count(),16)): assert_at_most_one_primary(objects.nth(i),f'AO-card-{i}')
        assert page.locator('#grcWorkspace [data-object-review="active"]:visible').count()<=1 or objects.count()>1
        assert_targets(page.locator('#grcWorkspace'),'AO');no_overflow(page)

        PHASE='MC-scope-before-mapping'
        open_process(page,'MC-01');expect(page.locator('#grcWorkspace')).to_be_visible();labels=[x.strip() for x in page.locator('#grcWorkspace .grc-kpis .grc-kpi small').all_inner_texts()]
        assert labels[:4]==['Decisioni registrate','Gap','Da decidere','Fuori perimetro'],labels
        form=page.locator('#grcWorkspace [data-grc-form="mapping"]');expect(form).to_have_count(1);requirement_ref=form.locator('[name="requirementRef"]');assert requirement_ref.get_attribute('required') is not None
        assert page.locator('#grcWorkspace [data-mapping-decision]').count()==0
        mappings=page.locator('#grcWorkspace .grc-list > article')
        for i in range(min(mappings.count(),16)): assert_at_most_one_primary(mappings.nth(i),f'MC-card-{i}')
        for i in range(page.locator('[data-uiux-scope-decision]').count()): assert page.locator('[data-uiux-scope-decision]').nth(i).get_attribute('data-requirement-ref').strip()
        incomplete=page.locator('[data-uiux-reject-incomplete]')
        for i in range(incomplete.count()): assert 'Rifiuta proposta incompleta' in incomplete.nth(i).inner_text()
        assert_targets(page.locator('#grcWorkspace'),'MC');no_overflow(page)

        PHASE='AP-state-aware-and-verify'
        open_process(page,'AP-01');expect(page.locator('#grcWorkspace')).to_be_visible();actions=page.locator('#grcWorkspace .grc-list > article');assert actions.count()>0
        allowed={'Adotta azione','Avvia lavoro','Invia a verifica','Riprendi lavoro','Verifica risultato'}
        for i in range(min(actions.count(),25)):
            card=actions.nth(i);assert_at_most_one_primary(card,f'AP-card-{i}');p=card.locator('.ux-primary:visible')
            if p.count(): assert p.inner_text().strip() in allowed,(i,p.inner_text())
        assert page.locator('#grcWorkspace [data-action-progress]').count()==0
        verify=page.locator('#grcWorkspace [data-uiux-action-verify]');assert verify.count()>0,'year-one AP cohort must include a ready-for-review example'
        before=revision(page);verify.first.click();dialog=page.locator('#uiuxActionVerifyDialog');expect(dialog).to_be_visible();expect(dialog).to_contain_text('Completato non significa chiuso');dialog.locator('select[name="decision"]').select_option('rework');dialog.locator('textarea[name="reason"]').fill('Browser 1.6: evidenza non sufficiente, il lavoro torna in esecuzione.');dialog.locator('button[type="submit"]').click();expect(dialog).not_to_be_visible();page.wait_for_function('(old)=>Number(document.documentElement.dataset.ictcProjectionRevision||0)>old',arg=before)
        assert_targets(page.locator('#grcWorkspace'),'AP');no_overflow(page)

        PHASE='EP-posture-only'
        page.locator('.service-nav [data-service="processes"]').click();expect(meta).not_to_be_visible();assert meta.evaluate('e=>e.parentElement?.id')=='proofView';page.locator('.service-nav [data-service="proof"]').click();expect(page.locator('#proofView')).to_be_visible();expect(meta).to_be_visible();expect(meta.locator('[data-service="epistemic"]')).to_contain_text('Apri dettagli epistemici');meta.locator('[data-service="epistemic"]').click();expect(page.locator('#epistemicView')).to_be_visible();assert '2970 atomi nella pagina' not in page.locator('#epistemicView').inner_text();expect(page.locator('#epistemicView .surface-chip').filter(has_text='Traccia disponibile').first).to_be_visible();no_overflow(page)

        PHASE='mobile-minimality'
        mc=browser.new_context(viewport={'width':390,'height':844});mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')");m=mc.new_page();m.goto(BASE+'/?view=processes',wait_until='networkidle');m.wait_for_function("()=>document.documentElement.dataset.ictcUiUxIntegrity==='1.6.1'");open_process(m,'RN-01');assert m.locator('#missionsList .mission-card').count()>0;assert m.locator('#missionsList .mission-card').first.locator('.ux-primary:visible').count()==1;no_overflow(m);mc.close()

        assert not errors,errors
        report={'ok':True,'profile':'procedure-ui-ux-ontoepistemic-1.6-browser','procedures':['RN-01','EC-01','AO-01','MC-01','AP-01'],'primaryActionMax':1,'mcCoveragePercentagePrimary':False,'mcLegacyNaMappingCtas':0,'apLegacyDualProgressCtas':0,'apVerificationWrite':True,'epistemicEntrySurface':'Postura ICTC','epistemicBusinessProcessCards':7,'touchTargetsMinPx':44,'mobileOverflow':False,'claimBoundary':'Rendered server-backed browser falsification of the guided decision surfaces; not human usability research, legal compliance or independent assurance.'}
        (ART/'browser-procedure-ui-ux-1-6.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8');print('browser-procedure-ui-ux-1-6: complete',flush=True);ctx.close();browser.close()
except BaseException as exc:
    fail(exc);traceback.print_exc();raise
