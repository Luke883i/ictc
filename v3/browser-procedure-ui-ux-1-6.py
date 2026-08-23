import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'
PROCESS_SURFACES={'RN-01':('#monitoringView','monitoring'),'EC-01':('#incidentsView','incidents'),'AO-01':('#grcWorkspace','objects'),'MC-01':('#grcWorkspace','coverage'),'AP-01':('#grcWorkspace','actions')}

def fail(exc):
    payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc()}
    (ART/'browser-procedure-ui-ux-1-6-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
    print(f'::error title=browser-procedure-ui-ux-3-1::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def no_overflow(page):
    m=page.evaluate('()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
    assert max(m['html'],m['body'])<=m['inner']+1,m

def wait_owner(page):
    page.wait_for_function("()=>document.documentElement.dataset.ictcUiUxFinetuning==='2.4.0'&&document.documentElement.dataset.ictcUiUxIntegrity==='1.6.1'&&document.documentElement.dataset.semanticComposition==='3.1.0'")

def api_status(page,path,role='admin',method='GET',body=None):
    return page.evaluate("""async a=>{const h={'content-type':'application/json','x-ictc-role':a.role,'x-ictc-actor-id':'browser-'+a.role};if(a.method!=='GET'){const b=await fetch('/api/bootstrap',{headers:h});const j=await b.json();h['x-ictc-command-id']='cmd-uiux-'+Date.now()+'-'+Math.random().toString(16).slice(2);h['x-ictc-expected-revision']=String(j.revision||0);}const r=await fetch(a.path,{method:a.method,headers:h,body:a.body?JSON.stringify(a.body):undefined});let payload={};try{payload=await r.json()}catch{}return{status:r.status,payload}}""",{'path':path,'role':role,'method':method,'body':body})

def refresh_processes(page):
    page.goto(BASE+'/?view=processes',wait_until='networkidle');wait_owner(page);expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)

def open_process(page,code):
    page.locator('.service-nav [data-service="processes"]').click()
    card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); card.locator(':scope > footer .primary').click()
    selector,surface=PROCESS_SURFACES[code]
    page.wait_for_function("x=>{const r=document.querySelector(x.selector);return !!(r&&r.offsetParent!==null&&r.dataset.compositionSurface===x.surface&&document.documentElement.dataset.nativeSemanticLattice==='3.2.0');}",arg={'selector':selector,'surface':surface})
    wait_owner(page)

def primary_count(scope): return scope.locator('.ux-primary:visible').count()
def assert_at_most_one_primary(scope,label):
    count=primary_count(scope); assert count<=1,(label,count,scope.inner_text()[:1200])
def target_heights(scope): return scope.locator('button:visible,summary:visible').evaluate_all('xs=>xs.map(x=>({text:(x.textContent||x.getAttribute("aria-label")||"").trim(),h:x.getBoundingClientRect().height})).filter(x=>x.text)')
def assert_targets(scope,label):
    small=[x for x in target_heights(scope) if x['h']<43.5]; assert not small,(label,small[:20])
def revision(page): return int(page.locator('html').get_attribute('data-ictc-projection-revision') or 0)
def wait_revision_advance(page,before):
    page.wait_for_function('(old)=>Number(document.documentElement.dataset.ictcProjectionRevision||0)>old',arg=before)
    return revision(page)
def close_plan(page):
    dialog=page.locator('#planDialog')
    if dialog.get_attribute('open') is None:return
    close=dialog.locator('[aria-label="Chiudi"]')
    if close.count(): close.click()
    else: page.keyboard.press('Escape')
    expect(dialog).not_to_be_visible()
def close_scheduler(page):
    dialog=page.locator('#jobDialog')
    if dialog.get_attribute('open') is None:return
    close=dialog.locator('[aria-label="Chiudi configurazione job"]')
    if close.count(): close.click()
    else: page.keyboard.press('Escape')
    expect(dialog).not_to_be_visible()
def ensure_monitoring_card(page):
    global PHASE
    missions=page.locator('#missionsList .mission-card')
    if missions.count()>0:return missions
    PHASE='RN-seed-open-scheduler'
    trigger=page.locator('#monitoringView [data-rn-open-scheduler]');expect(trigger).to_be_visible();trigger.click();expect(page.locator('#jobDialog')).to_be_visible()
    PHASE='RN-seed-monitoring-form'
    form=page.locator('#jobDialog #missionForm');expect(form).to_be_visible();before=revision(page)
    page.evaluate("""()=>{const f=document.querySelector('#jobDialog #missionForm');if(!f)throw new Error('missionForm missing');const set=(name,value)=>{const el=f.elements[name];if(!el)return;el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));};set('jobName','UI UX 1.6 isolated monitoring fixture');set('objective','Monitorare fonti pubbliche normative e decisioni di autorita pertinenti al perimetro dichiarato.');set('cadence','168');set('sourceHints','https://eur-lex.europa.eu');set('promptOverride','');}""")
    PHASE='RN-seed-submit'
    form.locator('button[type="submit"]').click();expect(page.locator('#planDialog')).to_be_visible();expect(page.locator('#jobDialog')).to_be_visible();close_plan(page);close_scheduler(page);wait_revision_advance(page,before)
    PHASE='RN-seed-materialized';page.wait_for_function("()=>document.querySelectorAll('#missionsList .mission-card').length>0");return page.locator('#missionsList .mission-card')
def ensure_incident_card(page):
    global PHASE
    cases=page.locator('#incidentList .incident-card')
    if cases.count()>0:return cases
    PHASE='EC-seed-open-incident'
    trigger=page.locator('#incidentsView .procedure-frame:visible .procedure-primary').first;expect(trigger).to_be_visible();trigger.click();dialog=page.locator('#incidentDialog');expect(dialog).to_be_visible()
    PHASE='EC-seed-incident-form'
    before=revision(page);dialog.locator('textarea[name="originalNarrative"]').fill('Evento isolato per verificare il percorso UI/UX senza dipendenze da journey precedenti.');dialog.locator('input[name="awarenessAt"]').fill('2026-08-10T12:30');dialog.locator('button[type="submit"]').click();expect(dialog).not_to_be_visible();wait_revision_advance(page,before);page.wait_for_function("()=>document.querySelectorAll('#incidentList .incident-card').length>0");return page.locator('#incidentList .incident-card')
def ensure_ao_object(page):
    global PHASE
    PHASE='AO-seed-bootstrap';bootstrap=api_status(page,'/api/bootstrap');assert bootstrap['status']==200,bootstrap
    objects=bootstrap['payload'].get('grc',{}).get('objects',{}).get('objects',[])
    if objects:return
    PHASE='AO-seed-object';created=api_status(page,'/api/grc/objects',method='POST',body={'type':'control','name':'Controllo isolato UI UX 1.6','owner':'local-admin','sourceAuthority':'ICTC browser test','externalReference':'CTRL-UIUX-1-6'});assert created['status']==201,created
    PHASE='AO-seed-refresh';refresh_processes(page)
def ensure_ap_action(page):
    global PHASE
    PHASE='AP-seed-bootstrap';bootstrap=api_status(page,'/api/bootstrap');assert bootstrap['status']==200,bootstrap
    actions=bootstrap['payload'].get('grc',{}).get('actions',{}).get('actions',[])
    if actions:return
    PHASE='AP-seed-action';created=api_status(page,'/api/grc/actions',method='POST',body={'title':'Azione isolata UI UX 1.6','description':'Azione minima per falsificare il ciclo di stato AP in una run browser isolata.'});assert created['status']==201,created
    PHASE='AP-seed-refresh';refresh_processes(page)
def ensure_action_ready_for_review(page):
    global PHASE
    verify=page.locator('#grcWorkspace [data-uiux-action-verify]')
    if verify.count()>0:return verify
    done=page.locator('#grcWorkspace [data-uiux-action-quick][data-next-state="done"]')
    if done.count()==0:
        start=page.locator('#grcWorkspace [data-uiux-action-quick][data-next-state="in-progress"]')
        if start.count()==0:
            PHASE='AP-materialize-adopted-action'
            adopt=page.locator('#grcWorkspace [data-action-adopt]').first;expect(adopt).to_be_visible()
            before=revision(page);adopt.click();decision=page.locator('#grcDecisionDialog');expect(decision).to_be_visible();decision.locator('textarea[name="reason"]').fill('Browser 3.1: adozione esplicita per verificare il ciclo AP fino al checkpoint di review.');decision.locator('button[type="submit"]').click();expect(decision).not_to_be_visible();wait_revision_advance(page,before)
            start=page.locator('#grcWorkspace [data-uiux-action-quick][data-next-state="in-progress"]')
        PHASE='AP-materialize-in-progress'
        expect(start.first).to_be_visible();before=revision(page);start.first.click();wait_revision_advance(page,before)
        done=page.locator('#grcWorkspace [data-uiux-action-quick][data-next-state="done"]')
    PHASE='AP-materialize-ready-for-review'
    expect(done.first).to_be_visible();before=revision(page);done.first.click();wait_revision_advance(page,before)
    verify=page.locator('#grcWorkspace [data-uiux-action-verify]');expect(verify.first).to_be_visible();return verify

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        ctx=browser.new_context(viewport={'width':1440,'height':950})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        page=ctx.new_page();page.set_default_timeout(30000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))

        PHASE='bootstrap-owner'
        refresh_processes(page)
        meta=page.locator('#epistemicMetaCard');expect(meta).not_to_be_visible();assert meta.evaluate('e=>e.parentElement?.id')=='proofView';no_overflow(page)

        PHASE='RN-open-process'
        open_process(page,'RN-01');expect(page.locator('#monitoringView')).to_be_visible();missions=ensure_monitoring_card(page);assert missions.count()>0
        for i in range(min(missions.count(),12)):
            PHASE=f'RN-card-{i}';card=missions.nth(i);assert_at_most_one_primary(card,f'RN-card-{i}');primary=card.locator('.ux-primary:visible');assert primary.count()==1;assert 'Apri monitoraggio' in primary.inner_text();support=card.locator('[data-run-mission]:visible,[data-pause-mission]:visible,[data-resume-mission]:visible');assert support.count()<=3;assert card.locator(':scope > .card-actions > details.ux-secondary-actions').count()==0;assert card.locator('.procedure-record-facts').count()==1
        PHASE='RN-targets';assert_targets(page.locator('#monitoringView'),'RN');PHASE='RN-overflow';no_overflow(page)
        PHASE='RN-open-plan';missions.first.locator('.ux-primary').click();expect(page.locator('#planDialog')).to_be_visible()
        PHASE='RN-plan-actions';assert_at_most_one_primary(page.locator('#planActions'),'RN-plan-dialog');assert page.locator('#planActions [data-run-mission]:visible,#planActions [data-pause-mission]:visible,#planActions [data-resume-mission]:visible,#planActions [data-revise-mission]:visible').count()<=3;assert page.locator('#planActions .procedure-evidence-action:visible').count()<=1;close_plan(page)

        PHASE='EC-sequentiality'
        open_process(page,'EC-01');expect(page.locator('#incidentsView')).to_be_visible();cases=ensure_incident_card(page);assert cases.count()>0
        for i in range(min(cases.count(),12)):
            card=cases.nth(i);assert_at_most_one_primary(card,f'EC-card-{i}');primary=card.locator('.ux-primary:visible');assert primary.count()==1;assert 'Apri caso' in primary.inner_text();assert card.locator('.procedure-record-facts').count()==1
        cases.first.locator('.ux-primary').click();expect(page.locator('#incidentWorkspace')).to_be_visible();assert_at_most_one_primary(page.locator('#workspaceActions'),'EC-workspace-actions');assert page.locator('#incidentWorkspace .lens-panel.ux-progressive-panel').count()>=1;assert_targets(page.locator('#incidentWorkspace'),'EC-workspace');no_overflow(page);page.locator('#incidentWorkspace button[aria-label="Chiudi"]').click()

        ensure_ao_object(page);PHASE='AO-governed-identity'
        open_process(page,'AO-01');expect(page.locator('#grcWorkspace')).to_be_visible();objects=page.locator('#grcWorkspace .grc-list > article');assert objects.count()>0
        expect(page.locator('#grcWorkspace [data-seq-ao-search]')).to_be_visible();expect(page.locator('#grcWorkspace [data-seq-ao-filter]')).to_be_visible()
        for i in range(min(objects.count(),16)): assert_at_most_one_primary(objects.nth(i),f'AO-card-{i}');assert objects.nth(i).locator('.procedure-record-facts').count()==1
        assert page.locator('#grcWorkspace [data-object-review="active"]:visible').count()<=1 or objects.count()>1;assert_targets(page.locator('#grcWorkspace'),'AO');no_overflow(page)

        PHASE='MC-scope-before-mapping'
        open_process(page,'MC-01');expect(page.locator('#grcWorkspace')).to_be_visible()
        status_detail=page.locator('#grcWorkspace details[data-composition-detail="process-status"]');expect(status_detail).to_have_count(1);expect(status_detail).not_to_have_attribute('open','')
        expect(status_detail.locator('.grc-kpis')).to_have_count(1);status_detail.locator(':scope > summary').click();expect(status_detail).to_have_attribute('open','')
        labels=[x.strip() for x in status_detail.locator('.grc-kpis .grc-kpi small').all_inner_texts()];assert labels[:4]==['Decisioni registrate','Gap','Da decidere','Fuori perimetro'],labels
        status_detail.locator(':scope > summary').click();expect(status_detail).not_to_have_attribute('open','')
        form=page.locator('#grcWorkspace [data-grc-form="mapping"]');expect(form).to_have_count(1);requirement_ref=form.locator('[name="requirementRef"]');assert requirement_ref.get_attribute('required') is not None
        assert page.locator('#grcWorkspace [data-mapping-decision]').count()==0
        mappings=page.locator('#grcWorkspace .grc-list > article')
        for i in range(min(mappings.count(),16)): assert_at_most_one_primary(mappings.nth(i),f'MC-card-{i}')
        for i in range(page.locator('[data-uiux-scope-decision]').count()): assert page.locator('[data-uiux-scope-decision]').nth(i).get_attribute('data-requirement-ref').strip()
        incomplete=page.locator('[data-uiux-reject-incomplete]')
        for i in range(incomplete.count()): assert 'Rifiuta proposta incompleta' in incomplete.nth(i).inner_text()
        assert_targets(page.locator('#grcWorkspace'),'MC');no_overflow(page)

        ensure_ap_action(page);PHASE='AP-state-aware-and-verify'
        open_process(page,'AP-01');expect(page.locator('#grcWorkspace')).to_be_visible();actions=page.locator('#grcWorkspace .grc-list > article');assert actions.count()>0
        allowed={'Adotta azione','Avvia lavoro','Invia a verifica','Riprendi lavoro','Verifica risultato'}
        for i in range(min(actions.count(),25)):
            card=actions.nth(i);assert_at_most_one_primary(card,f'AP-card-{i}');p=card.locator('.ux-primary:visible');assert card.locator('.procedure-record-facts').count()==1
            if p.count(): assert p.inner_text().strip() in allowed,(i,p.inner_text())
        assert page.locator('#grcWorkspace [data-action-progress]').count()==0
        verify=ensure_action_ready_for_review(page);PHASE='AP-verify-rework';before=revision(page);verify.first.click();dialog=page.locator('#uiuxActionVerifyDialog');expect(dialog).to_be_visible();expect(dialog).to_contain_text('Completato non significa chiuso');dialog.locator('select[name="decision"]').select_option('rework');dialog.locator('textarea[name="reason"]').fill('Browser 3.1: evidenza non sufficiente, il lavoro torna in esecuzione.');dialog.locator('button[type="submit"]').click();expect(dialog).not_to_be_visible();wait_revision_advance(page,before);assert_targets(page.locator('#grcWorkspace'),'AP');no_overflow(page)

        PHASE='EP-evidence-entry'
        page.locator('.service-nav [data-service="processes"]').click();expect(meta).not_to_be_visible();assert meta.evaluate('e=>e.parentElement?.id')=='proofView';page.locator('.service-nav [data-service="proof"]').click();expect(page.locator('#proofView')).to_be_visible();expect(meta).to_be_visible();entry=meta.locator('[data-service="epistemic"]');expect(entry).to_be_visible();assert entry.inner_text().strip();entry.click();expect(page.locator('#epistemicView')).to_be_visible();expect(page.locator('#epistemicTitle')).to_have_text('Relazioni tra decisioni, fonti ed evidenze');assert '2970 atomi nella pagina' not in page.locator('#epistemicView').inner_text();expect(page.locator('#epistemicView .surface-chip').filter(has_text='Traccia disponibile').first).to_be_visible();no_overflow(page)

        PHASE='mobile-minimality'
        mc=browser.new_context(viewport={'width':390,'height':844});mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')");m=mc.new_page();m.goto(BASE+'/?view=processes',wait_until='networkidle');wait_owner(m);open_process(m,'RN-01');assert m.locator('#missionsList .mission-card').count()>0;assert m.locator('#missionsList .mission-card').first.locator('.ux-primary:visible').count()==1;no_overflow(m);mc.close()

        assert not errors,errors
        report={'ok':True,'profile':'procedure-record-ontoepistemic-3.1-browser+isolated-fixtures','procedures':['RN-01','EC-01','AO-01','MC-01','AP-01'],'isolatedState':True,'fixtureAuthority':'public-api-if-empty','primaryActionMax':1,'visibleSupportActionsMax':3,'sharedRecordPrimitive':'procedure-record-card','mcProcessStatusProgressive':True,'mcLegacyNaMappingCtas':0,'apLegacyDualProgressCtas':0,'apVerificationWrite':True,'epistemicEntrySurface':'Evidenze ICTC','epistemicDestination':'Relazioni tra decisioni, fonti ed evidenze','touchTargetsMinPx':44,'mobileOverflow':False,'claimBoundary':'Rendered server-backed browser falsification of the guided decision surfaces; not human usability research, legal compliance or independent assurance.'}
        (ART/'browser-procedure-ui-ux-1-6.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8');print('browser-procedure-ui-ux-3.1: complete',flush=True);ctx.close();browser.close()
except BaseException as exc:
    fail(exc);traceback.print_exc();raise
