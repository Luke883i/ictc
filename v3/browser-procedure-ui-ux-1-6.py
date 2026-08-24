import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'
PROCESS_SURFACES={
    'RN-01':('#monitoringView','monitoring','procedure-frame.js'),
    'EC-01':('#incidentsView','incidents','procedure-frame.js'),
    'AO-01':('#grcWorkspace','objects','grc-workspace-3-2.js'),
    'MC-01':('#grcWorkspace','coverage','grc-workspace-3-2.js'),
    'AP-01':('#grcWorkspace','actions','grc-workspace-3-2.js'),
}
PROCESS_READY={
    'RN-01':"()=>{const r=document.querySelector('#monitoringView'),f=r?.querySelector(':scope > .procedure-frame[data-procedure-header-contract=\"3.2.1\"]');return !!(f&&f.offsetParent!==null&&(r.querySelector('#missionsList .mission-card')||r.querySelector('[data-rn-open-scheduler]')));}",
    'EC-01':"()=>{const r=document.querySelector('#incidentsView'),f=r?.querySelector(':scope > .procedure-frame[data-procedure-header-contract=\"3.2.1\"]');return !!(f&&f.offsetParent!==null&&(r.querySelector('#incidentList .incident-card')||r.querySelector('.procedure-frame .procedure-primary')));}",
    'AO-01':"()=>{const r=document.querySelector('#grcWorkspace'),q=r?.querySelector('[data-seq-queue-count]'),s=r?.querySelector('[data-seq-ao-search]'),f=r?.querySelector('[data-seq-ao-filter]'),d=r?.querySelector('.procedure-decision-frame .composition-process-context');return !!(q&&s&&f&&d);}",
    'MC-01':"()=>{const r=document.querySelector('#grcWorkspace'),s=r?.querySelector('details[data-composition-detail=\"process-status\"]'),f=r?.querySelector('[data-grc-form=\"mapping\"]'),d=r?.querySelector('.procedure-decision-frame .composition-process-context');return !!(s&&f&&d);}",
    'AP-01':"()=>{const r=document.querySelector('#grcWorkspace'),q=r?.querySelector('[data-seq-queue-count]'),d=r?.querySelector('.procedure-decision-frame .composition-process-context');return !!(q&&d);}",
}

def fail(exc):
    payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc()}
    (ART/'browser-procedure-ui-ux-1-6-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
    print(f'::error title=browser-procedure-ui-ux-3-2-1::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def no_overflow(page):
    m=page.evaluate('()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
    assert max(m['html'],m['body'])<=m['inner']+1,m

def experience_cycle(page):
    return int(page.evaluate("()=>Number(document.documentElement.dataset.experienceCycle||0)"))

def wait_experience_cycle(page,before=0):
    page.wait_for_function("before=>Number(document.documentElement.dataset.experienceCycle||0)>before",arg=before)
    return experience_cycle(page)

def wait_process_catalogue(page):
    page.wait_for_function("()=>document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&document.querySelector('#procedureHub')?.dataset.procedureHub==='semantic-workspace-closure-3-2-1'&&document.querySelectorAll('#procedureHub .procedure-card').length===7")
    if experience_cycle(page)==0:wait_experience_cycle(page,0)

def open_process(page,code):
    global PHASE
    before=experience_cycle(page)
    PHASE=f'{code}-return-catalogue';page.locator('.service-nav [data-service="processes"]').click()
    PHASE=f'{code}-catalogue-ready';wait_process_catalogue(page)
    if experience_cycle(page)>before:before=experience_cycle(page)
    PHASE=f'{code}-entry-click';card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible();card.locator(':scope > footer .primary').click()
    PHASE=f'{code}-c01-cycle';wait_experience_cycle(page,before)
    selector,surface,owner=PROCESS_SURFACES[code]
    PHASE=f'{code}-local-owner';page.wait_for_function("x=>{const r=document.querySelector(x.selector);return !!(r&&r.offsetParent!==null&&document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.compositionSurface===x.surface&&r.dataset.localCompositionOwner===x.owner);}",arg={'selector':selector,'surface':surface,'owner':owner})
    PHASE=f'{code}-projection-ready';page.wait_for_function(PROCESS_READY[code])

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
        expect(workspace.locator('[data-seq-ao-search]')).to_have_count(1);expect(workspace.locator('[data-seq-ao-search]')).to_be_visible()
        expect(workspace.locator('[data-seq-ao-filter]')).to_have_count(1);expect(workspace.locator('[data-seq-ao-filter]')).to_be_visible()
    else:
        expect(workspace.locator(f'[data-seq-queue-search="{id}"]')).to_be_visible();expect(workspace.locator(f'[data-seq-queue-state="{id}"]')).to_be_visible()

def wait_view_owner(page,selector,owner,before):
    wait_experience_cycle(page,before)
    page.wait_for_function("x=>{const r=document.querySelector(x.selector);return !!(r&&r.offsetParent!==null&&document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.nativeSemanticLattice==='3.2.0'&&r.dataset.localCompositionOwner===x.owner);}",arg={'selector':selector,'owner':owner})

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        page=ctx.new_page();page.set_default_timeout(30000);errors=[];writes=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda req:writes.append({'method':req.method,'url':req.url}) if req.url.startswith(BASE+'/api/') and req.method!='GET' else None)
        PHASE='catalogue-navigation';page.goto(BASE+'/?view=processes',wait_until='domcontentloaded')
        PHASE='catalogue-readiness';wait_process_catalogue(page)
        PHASE='catalogue-cardinality';expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)
        PHASE='catalogue-epistemic-canonical';expect(page.locator('#proofView #epistemicMetaCard')).to_have_count(0)
        PHASE='catalogue-overflow';no_overflow(page)
        PHASE='RN-context-tolerant';open_process(page,'RN-01');PHASE='RN-context-tolerant';missions=page.locator('#missionsList .mission-card')
        if missions.count():assert_record_cards(missions,'RN',{'Apri monitoraggio'},12)
        else:expect(page.locator('#monitoringView [data-rn-open-scheduler]')).to_be_visible()
        assert_targets(page.locator('#monitoringView'),'RN');no_overflow(page)
        PHASE='EC-context-tolerant';open_process(page,'EC-01');PHASE='EC-context-tolerant';cases=page.locator('#incidentList .incident-card')
        if cases.count():assert_record_cards(cases,'EC',{'Apri caso'},12)
        else:expect(page.locator('#incidentsView .procedure-frame:visible .procedure-primary')).to_be_visible()
        assert_targets(page.locator('#incidentsView'),'EC');no_overflow(page)
        PHASE='AO-context-tolerant';open_process(page,'AO-01');PHASE='AO-context-tolerant';workspace=page.locator('#grcWorkspace');assert_queue_context(workspace,'objects');objects=workspace.locator('.grc-list > article');assert_record_cards(objects,'AO');assert workspace.locator('[data-object-review="active"]:visible').count()<=max(1,objects.count());assert_targets(workspace,'AO');no_overflow(page)
        PHASE='MC-navigation';open_process(page,'MC-01');workspace=page.locator('#grcWorkspace');status_detail=workspace.locator('details[data-composition-detail="process-status"]')
        PHASE='MC-status-default';expect(status_detail).to_have_count(1);expect(status_detail).not_to_have_attribute('open','');expect(status_detail.locator('.grc-kpis')).to_have_count(1)
        PHASE='MC-status-user-open';status_detail.locator(':scope > summary').click();expect(status_detail).to_have_attribute('open','')
        PHASE='MC-status-context-preservation';page.evaluate("()=>document.dispatchEvent(new CustomEvent('ictc:context-changed',{detail:{surface:'grc',procedureId:'coverage',reason:'browser-disclosure-preservation'}}))");expect(status_detail).to_have_attribute('open','')
        PHASE='MC-kpis';labels=[x.strip() for x in status_detail.locator('.grc-kpis .grc-kpi small').all_inner_texts()];assert labels[:4]==['Decisioni registrate','Gap','Da decidere','Fuori perimetro'],labels
        PHASE='MC-status-user-close';status_detail.locator(':scope > summary').click();expect(status_detail).not_to_have_attribute('open','')
        PHASE='MC-mapping-form';form=workspace.locator('[data-grc-form="mapping"]');expect(form).to_have_count(1);assert form.locator('[name="requirementRef"]').get_attribute('required') is not None
        PHASE='MC-scope-before-mapping';assert workspace.locator('[data-mapping-decision]').count()==0
        PHASE='MC-cards';mappings=workspace.locator('.grc-list > article');assert_primary_cards(mappings,'MC')
        PHASE='MC-touch';assert_targets(workspace,'MC')
        PHASE='MC-overflow';no_overflow(page)
        PHASE='AP-context-tolerant';open_process(page,'AP-01');PHASE='AP-context-tolerant';workspace=page.locator('#grcWorkspace');assert_queue_context(workspace,'actions');actions=workspace.locator('.grc-list > article');allowed={'Adotta azione','Avvia lavoro','Invia a verifica','Riprendi lavoro','Verifica risultato'};assert_record_cards(actions,'AP',allowed,25);assert workspace.locator('[data-action-progress]').count()==0;assert_targets(workspace,'AP');no_overflow(page)
        PHASE='proof-to-ep-navigation';before=experience_cycle(page);proof_entry=page.locator('.service-nav [data-service="proof"]');expect(proof_entry).to_be_visible();proof_entry.click();wait_view_owner(page,'#proofView','proof-workspace-3-2.js',before);expect(page.locator('#proofTitle')).to_have_text('Evidenze ICTC');investigation=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]');expect(investigation).to_have_count(1);assert investigation.evaluate('e=>e.parentElement?.firstElementChild===e');expect(page.locator('#proofView #epistemicMetaCard')).to_have_count(0);expect(investigation.locator('[data-service="epistemic"]')).to_have_count(1);command=page.locator('#globalCommandTrigger');expect(command).to_be_visible();command.click();dialog=page.locator('#globalCommandDialog');expect(dialog).to_be_visible();search=page.locator('#globalSearch');expect(search).to_be_visible();search.fill('Reticolo epistemico');ep_entry=page.locator('#globalSearchResults [data-global-id="epistemic"][data-global-service="epistemic"]');expect(ep_entry).to_be_visible();before=experience_cycle(page);ep_entry.click();wait_view_owner(page,'#epistemicView','epistemic-workspace-3-2.js',before);expect(page.locator('#epistemicTitle')).to_have_text('Relazioni tra decisioni, fonti ed evidenze');assert '2970 atomi nella pagina' not in page.locator('#epistemicView').inner_text();no_overflow(page)
        PHASE='mobile-context-tolerant';mc=browser.new_context(viewport={'width':390,'height':844});mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')");m=mc.new_page();m.set_default_timeout(30000);mobile_writes=[];m.on('request',lambda req:mobile_writes.append({'method':req.method,'url':req.url}) if req.url.startswith(BASE+'/api/') and req.method!='GET' else None);m.goto(BASE+'/?view=processes',wait_until='domcontentloaded');wait_process_catalogue(m);open_process(m,'RN-01');PHASE='mobile-context-tolerant';mobile_missions=m.locator('#missionsList .mission-card')
        if mobile_missions.count():assert_at_most_one_primary(mobile_missions.first,'RN-mobile-card')
        else:expect(m.locator('#monitoringView [data-rn-open-scheduler]')).to_be_visible()
        no_overflow(m);assert not mobile_writes,mobile_writes;mc.close()
        PHASE='read-only-boundary';assert not writes,writes;PHASE='page-errors';assert not errors,errors
        report={'ok':True,'profile':'native-semantic-lattice-3.2.1-context-tolerant-ui-oracle+ui-finetuning-3.4','procedures':['RN-01','EC-01','AO-01','MC-01','AP-01'],'readOnly':True,'fixtureAuthority':'none','emptyAndPopulatedStateTolerant':True,'semanticReadiness':'monotonic-final-c01-cycle+declared-owner+observable-projection','primaryActionMax':1,'visibleSupportActionsMax':3,'sharedRecordPrimitive':'procedure-record-card','touchTargetsMinPx':44,'mobileOverflow':False,'proofEpistemicNavigation':'proof-first-row+command-palette-meta-row','epistemicBusinessProcess':False,'epistemicSecondaryEntry':'proof-first-row-disclosure','duplicateProofMetaEntry':False,'grcDisclosurePersistence':'same-process-context-events-preserve-user-state','writeCount':len(writes),'claimBoundary':'Rendered server-backed UI invariant check; stateful creation and transition coverage belongs to dedicated journey/runtime tests.'}
        (ART/'browser-procedure-ui-ux-1-6.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8');print('browser-procedure-ui-ux-3.2.1: complete',flush=True);ctx.close();browser.close()
except BaseException as exc:
    fail(exc);traceback.print_exc();raise
