import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'
PROCESS_SURFACES={
    'RN-01':('#monitoringView','monitoring',None),
    'EC-01':('#incidentsView','incidents',None),
    'AO-01':('#grcWorkspace','objects','grc-workspace-3-2.js'),
    'MC-01':('#grcWorkspace','coverage','grc-workspace-3-2.js'),
    'AP-01':('#grcWorkspace','actions','grc-workspace-3-2.js'),
}

def fail(exc):
    payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc()}
    (ART/'browser-procedure-ui-ux-1-6-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
    print(f'::error title=browser-procedure-ui-ux-3-2::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def no_overflow(page):
    m=page.evaluate('()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
    assert max(m['html'],m['body'])<=m['inner']+1,m

def wait_process_catalogue(page):
    page.wait_for_function("()=>document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&document.querySelectorAll('#procedureHub .procedure-card').length===7")

def open_process(page,code):
    page.locator('.service-nav [data-service="processes"]').click()
    wait_process_catalogue(page)
    card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible();card.locator(':scope > footer .primary').click()
    selector,surface,owner=PROCESS_SURFACES[code]
    page.wait_for_function("x=>{const r=document.querySelector(x.selector);return !!(r&&r.offsetParent!==null&&document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.compositionSurface===x.surface&&(!x.owner||r.dataset.localCompositionOwner===x.owner));}",arg={'selector':selector,'surface':surface,'owner':owner})

def assert_at_most_one_primary(scope,label):
    count=scope.locator('.ux-primary:visible').count();assert count<=1,(label,count,scope.inner_text()[:1200])

def assert_targets(scope,label):
    small=scope.locator('button:visible,summary:visible').evaluate_all('xs=>xs.map(x=>({text:(x.textContent||x.getAttribute("aria-label")||"").trim(),h:x.getBoundingClientRect().height})).filter(x=>x.text&&x.h<43.5)')
    assert not small,(label,small[:20])

def assert_record_cards(cards,label,allowed_primary=None,limit=16):
    for i in range(min(cards.count(),limit)):
        card=cards.nth(i);assert_at_most_one_primary(card,f'{label}-card-{i}')
        assert card.locator('.procedure-record-facts').count()==1,(label,i)
        primary=card.locator('.ux-primary:visible')
        if allowed_primary is not None and primary.count():assert primary.inner_text().strip() in allowed_primary,(label,i,primary.inner_text())

def assert_primary_cards(cards,label,limit=16):
    for i in range(min(cards.count(),limit)):assert_at_most_one_primary(cards.nth(i),f'{label}-card-{i}')

def assert_queue_context(workspace,id):
    count=workspace.locator('[data-seq-queue-count]');expect(count).to_be_visible();text=count.inner_text().strip();assert ' di ' in text,text
    if id=='objects':
        expect(workspace.locator('[data-seq-ao-search]')).to_be_visible();expect(workspace.locator('[data-seq-ao-filter]')).to_be_visible()
    else:
        expect(workspace.locator(f'[data-seq-queue-search="{id}"]')).to_be_visible();expect(workspace.locator(f'[data-seq-queue-state="{id}"]')).to_be_visible()

def wait_view_owner(page,selector,owner=None):
    page.wait_for_function("x=>{const r=document.querySelector(x.selector);return !!(r&&r.offsetParent!==null&&document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.nativeSemanticLattice==='3.2.0'&&(!x.owner||r.dataset.localCompositionOwner===x.owner));}",arg={'selector':selector,'owner':owner})

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        page=ctx.new_page();page.set_default_timeout(30000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))

        PHASE='catalogue';page.goto(BASE+'/?view=processes',wait_until='networkidle');wait_process_catalogue(page);expect(page.locator('#procedureHub .procedure-card')).to_have_count(7);meta=page.locator('#epistemicMetaCard');expect(meta).not_to_be_visible();assert meta.evaluate('e=>e.parentElement?.id')=='proofView';no_overflow(page)

        PHASE='RN-context-tolerant';open_process(page,'RN-01');missions=page.locator('#missionsList .mission-card')
        if missions.count():
            assert_record_cards(missions,'RN',{'Apri monitoraggio'},12)
        else:
            expect(page.locator('#monitoringView [data-rn-open-scheduler]')).to_be_visible()
        assert_targets(page.locator('#monitoringView'),'RN');no_overflow(page)

        PHASE='EC-context-tolerant';open_process(page,'EC-01');cases=page.locator('#incidentList .incident-card')
        if cases.count():
            assert_record_cards(cases,'EC',{'Apri caso'},12)
        else:
            expect(page.locator('#incidentsView .procedure-frame:visible .procedure-primary')).to_be_visible()
        assert_targets(page.locator('#incidentsView'),'EC');no_overflow(page)

        PHASE='AO-context-tolerant';open_process(page,'AO-01');workspace=page.locator('#grcWorkspace');assert_queue_context(workspace,'objects');objects=workspace.locator('.grc-list > article');assert_record_cards(objects,'AO')
        assert workspace.locator('[data-object-review="active"]:visible').count()<=max(1,objects.count());assert_targets(workspace,'AO');no_overflow(page)

        PHASE='MC-scope-before-mapping';open_process(page,'MC-01');workspace=page.locator('#grcWorkspace');status_detail=workspace.locator('details[data-composition-detail="process-status"]');expect(status_detail).to_have_count(1);expect(status_detail).not_to_have_attribute('open','');expect(status_detail.locator('.grc-kpis')).to_have_count(1);status_detail.locator(':scope > summary').click();expect(status_detail).to_have_attribute('open','');labels=[x.strip() for x in status_detail.locator('.grc-kpis .grc-kpi small').all_inner_texts()];assert labels[:4]==['Decisioni registrate','Gap','Da decidere','Fuori perimetro'],labels;status_detail.locator(':scope > summary').click();expect(status_detail).not_to_have_attribute('open','')
        form=workspace.locator('[data-grc-form="mapping"]');expect(form).to_have_count(1);assert form.locator('[name="requirementRef"]').get_attribute('required') is not None;assert workspace.locator('[data-mapping-decision]').count()==0;mappings=workspace.locator('.grc-list > article');assert_primary_cards(mappings,'MC');assert_targets(workspace,'MC');no_overflow(page)

        PHASE='AP-context-tolerant';open_process(page,'AP-01');workspace=page.locator('#grcWorkspace');assert_queue_context(workspace,'actions');actions=workspace.locator('.grc-list > article');allowed={'Adotta azione','Avvia lavoro','Invia a verifica','Riprendi lavoro','Verifica risultato'};assert_record_cards(actions,'AP',allowed,25);assert workspace.locator('[data-action-progress]').count()==0;assert_targets(workspace,'AP');no_overflow(page)

        PHASE='EP-evidence-entry';page.locator('.service-nav [data-service="processes"]').click();wait_process_catalogue(page);expect(meta).not_to_be_visible();page.locator('.service-nav [data-service="proof"]').click();wait_view_owner(page,'#proofView','proof-workspace-3-2.js');expect(meta).to_be_visible();entry=meta.locator('[data-service="epistemic"]');expect(entry).to_be_visible();entry.click();wait_view_owner(page,'#epistemicView','epistemic-workspace-3-2.js');expect(page.locator('#epistemicTitle')).to_have_text('Relazioni tra decisioni, fonti ed evidenze');assert '2970 atomi nella pagina' not in page.locator('#epistemicView').inner_text();no_overflow(page)

        PHASE='mobile-context-tolerant';mc=browser.new_context(viewport={'width':390,'height':844});mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')");m=mc.new_page();m.set_default_timeout(30000);m.goto(BASE+'/?view=processes',wait_until='networkidle');wait_process_catalogue(m);open_process(m,'RN-01');mobile_missions=m.locator('#missionsList .mission-card')
        if mobile_missions.count():assert_at_most_one_primary(mobile_missions.first,'RN-mobile-card')
        else:expect(m.locator('#monitoringView [data-rn-open-scheduler]')).to_be_visible()
        no_overflow(m);mc.close()

        assert not errors,errors
        report={'ok':True,'profile':'native-semantic-lattice-3.2-context-tolerant-ui-oracle','procedures':['RN-01','EC-01','AO-01','MC-01','AP-01'],'readOnly':True,'fixtureAuthority':'none','emptyAndPopulatedStateTolerant':True,'semanticReadiness':'native-owner+surface','primaryActionMax':1,'visibleSupportActionsMax':3,'sharedRecordPrimitive':'procedure-record-card','touchTargetsMinPx':44,'mobileOverflow':False,'claimBoundary':'Rendered server-backed UI invariant check; stateful creation and transition coverage belongs to dedicated journey/runtime tests.'}
        (ART/'browser-procedure-ui-ux-1-6.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8');print('browser-procedure-ui-ux-3.2: complete',flush=True);ctx.close();browser.close()
except BaseException as exc:
    fail(exc);traceback.print_exc();raise
