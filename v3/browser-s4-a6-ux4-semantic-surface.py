import json, os, pathlib, traceback, urllib.parse
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4874').rstrip('/')
EXPECTED=(os.environ.get('ICTC_EXPECT_BUILD_SHA') or '').lower()
PHASE='init'; RESULTS=[]; WRITES=[]; ERRORS=[]
PROCEDURES=[('RN-01','monitoring','#monitoringView'),('EC-01','incidents','#incidentsView'),('AO-01','objects','#grcWorkspace'),('MC-01','coverage','#grcWorkspace'),('AP-01','actions','#grcWorkspace'),('RC-01','risks','#grcWorkspace'),('AR-01','assurance','#grcWorkspace')]

def fail(exc):
    payload={'ok':False,'slice':'S4-A6','executionUnit':'A6-UX4','phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'results':RESULTS,'writes':WRITES,'pageErrors':ERRORS}
    (ART/'browser-s4-a6-ux4-semantic-surface-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(f'::error title=A6-UX4::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def no_page_overflow(page,label):
    m=page.evaluate("()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})")
    assert m['html']<=m['inner']+1 and m['body']<=m['inner']+1,(label,m)
    RESULTS.append({'oracle':'page-reflow','case':label,'metrics':m})

def local_geometry(page,selector):
    return page.locator(selector).evaluate("""r=>({
      tag:r.tagName,cls:String(r.className||''),client:r.clientWidth,scroll:r.scrollWidth,
      overflowX:getComputedStyle(r).overflowX,overflowY:getComputedStyle(r).overflowY,
      offenders:[...r.querySelectorAll('*')].filter(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return b.width>0&&b.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&e.scrollWidth>e.clientWidth+2&&!/(hidden|clip)/.test(s.overflowX)}).slice(0,8).map(e=>({tag:e.tagName,cls:String(e.className||''),client:e.clientWidth,scroll:e.scrollWidth,overflowX:getComputedStyle(e).overflowX,overflowY:getComputedStyle(e).overflowY}))
    })""")

def no_local_x_overflow(page,selector,label):
    m=local_geometry(page,selector)
    assert m['scroll']<=m['client']+2 and not m['offenders'],(label,m)
    RESULTS.append({'oracle':'local-x-overflow','case':label,'metrics':m})

def scroll_owners(page,selector):
    return page.locator(selector).evaluate("""r=>[r,...r.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);return e.getClientRects().length&&/(auto|scroll)/.test(s.overflowY)&&e.scrollHeight>e.clientHeight+2}).map(e=>({tag:e.tagName,id:e.id||'',cls:String(e.className||''),client:e.clientHeight,scroll:e.scrollHeight,overflowX:getComputedStyle(e).overflowX,overflowY:getComputedStyle(e).overflowY}))""")

def close_dialogs(page):
    page.evaluate("()=>{for(const d of document.querySelectorAll('dialog[open]'))try{d.close()}catch{}}")

def open_process(page,code,pid,root):
    global PHASE
    close_dialogs(page)
    PHASE=f'{code}-catalog'
    page.locator('.service-nav [data-service="processes"]').click()
    page.wait_for_function("()=>!document.querySelector('#processesView')?.hidden")
    card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible()
    card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click()
    PHASE=f'{code}-surface-commit'
    page.wait_for_function("x=>{const r=document.querySelector(x.root),f=r?.querySelector(':scope > .procedure-frame');return !!(r&&r.offsetParent!==null&&f&&f.querySelector('.procedure-frame-code')?.textContent?.includes(x.code))}",arg={'root':root,'code':code})
    PHASE=f'{code}-mount'
    try:
        page.wait_for_function("x=>{const r=document.querySelector(x.root),w=r?.querySelector(':scope > [data-procedure-attention-slot=\"'+x.pid+'\"] [data-procedure-worklist]');return !!(document.documentElement.dataset.a6Ux4Semantic==='a6-ux4'&&w?.dataset.a6Ux4Mount)}",arg={'root':root,'pid':pid})
    except BaseException:
        diag=page.evaluate("""x=>{const r=document.querySelector(x.root),slot=r?.querySelector(':scope > [data-procedure-attention-slot="'+x.pid+'"]'),w=slot?.querySelector('[data-procedure-worklist]');return{root:!!r,rootVisible:!!(r&&r.offsetParent!==null),slot:!!slot,section:!!w,semantic:document.documentElement.dataset.a6Ux4Semantic||'',mount:w?.dataset.a6Ux4Mount||'',single:r?.dataset.a6Ux4SingleCollection||'',missing:r?.dataset.a6Ux4BindingMissing||'',hidden:r?.dataset.a6Ux4BindingHidden||''}}""",{'root':root,'pid':pid})
        if not diag.get('slot'): PHASE=f'{code}-mount-slot-missing'
        elif not diag.get('section'): PHASE=f'{code}-mount-worklist-missing'
        elif diag.get('semantic')!='a6-ux4': PHASE=f'{code}-mount-semantic-stamp-missing'
        elif not diag.get('mount'): PHASE=f'{code}-mount-stamp-missing'
        else: PHASE=f'{code}-mount-unresolved'
        RESULTS.append({'oracle':'mount-diagnostic','code':code,'procedureId':pid,'diagnostic':diag})
        raise
    return page.locator(root)

def audit_procedure(page,code,pid,root):
    global PHASE
    r=open_process(page,code,pid,root)
    PHASE=f'{code}-single-collection-mount'
    section=r.locator(f':scope > [data-procedure-attention-slot="{pid}"] [data-procedure-worklist]')
    mount=section.get_attribute('data-a6-ux4-mount'); expected=int(r.get_attribute('data-a6-ux4-actionable-count') or '0'); missing=int(r.get_attribute('data-a6-ux4-binding-missing') or '0'); hidden=int(r.get_attribute('data-a6-ux4-binding-hidden') or '0')
    assert missing==0,(code,'typed binding missing',missing)
    expect(section).to_have_attribute('data-a6-ux4-mount','semantic-bridge'); expect(section).to_be_hidden(); expect(r).to_have_attribute('data-a6-ux4-single-collection','native'); assert hidden==0,(code,'resolved actionable targets must be revealed in native plane',hidden)
    PHASE=f'{code}-single-collection-scope'
    scope=r.locator(f'[data-a6-ux4-scope="{pid}"]'); expect(scope).to_be_visible(); expect(scope).to_have_value('actionable')
    PHASE=f'{code}-single-collection-equivalence'
    visible_actionable=r.locator('[data-a6-ux4-actionable="true"]:visible').count(); assert visible_actionable==expected,(code,'visible actionable/native mismatch',visible_actionable,expected); assert r.locator('.procedure-worklist-reveal:visible').count()==0
    PHASE=f'{code}-scope-control'; scope.select_option('all'); assert scope.input_value()=='all'; scope.select_option('actionable'); assert scope.input_value()=='actionable'
    PHASE=f'{code}-orientation'
    orientation=r.locator(':scope > .procedure-frame [data-procedure-orientation="compact"]'); expect(orientation).to_have_count(1); expect(orientation).to_be_visible(); expect(orientation).to_contain_text('Fondamento'); expect(orientation).to_contain_text('Limite'); expect(orientation).to_contain_text('Riferimenti')
    PHASE=f'{code}-context'
    anatomy=r.locator('[data-procedure-anatomy][data-a6-ux4-context="canonical"]'); expect(anatomy).to_have_count(1); expect(anatomy).to_be_visible()
    assert r.locator('.procedure-decision-frame details.composition-process-context:visible').count()==0
    refs=r.locator('.procedure-anatomy-standard-head[data-a6-ux4-reference-band="canonical"]')
    if refs.count(): expect(refs.first).to_be_visible()
    PHASE=f'{code}-action-effects'
    visible=r.locator('button:visible,a[href]:visible,summary:visible'); sample=min(visible.count(),30); assert sample>0
    assert all(visible.nth(i).get_attribute('data-a6-ux4-effect') for i in range(sample)),(code,'unclassified control')
    if pid=='monitoring':
        PHASE='RN-01-material-merge'; assert r.locator('.contribute-card:visible').count()==0; assert r.locator('[data-a6-ux4-single-column="true"]').count()>=1
        source_open=r.locator('[data-open-source]').first
        if source_open.count():
            PHASE='RN-01-source-truth'; source_open.click(); source_dialog=page.locator('#sourceDialog'); expect(source_dialog).to_be_visible(); expect(source_dialog).to_contain_text('Classe proposta'); expect(source_dialog).not_to_contain_text('Confidenza AI'); assert source_dialog.evaluate("d=>d.contains(document.activeElement)"); source_dialog.locator('button[aria-label="Chiudi"]').click()
    if pid=='incidents':
        PHASE='EC-01-heading-dedup'; assert r.locator('[data-a6-registry="incidents"] .section-head:visible').count()==0
    if pid in ['objects','coverage','actions','risks','assurance']:
        PHASE=f'{code}-record-action-hierarchy'; assert r.locator('.procedure-record-card .primary:visible').count()==0,(code,'record-local filled primary survived')
    if pid=='coverage':
        PHASE='MC-01-use-copy'; expect(r.locator('[data-framework-card="eu-gdpr-2016-679"] .market-scope')).to_have_text('Uso da dichiarare')
        PHASE='MC-01-standard-browser-open'; r.locator('[data-open-standard-browser]').first.click(); dialog=page.locator('#standardBrowserDialog'); expect(dialog).to_be_visible()
        PHASE='MC-01-standard-dialog-x'; no_local_x_overflow(page,'#standardBrowserDialog','desktop:standard-dialog')
        PHASE='MC-01-standard-master-x'; no_local_x_overflow(page,'#standardBrowserDialog .standard-browser-master-detail','desktop:standard-master-detail')
        PHASE='MC-01-standard-scroll-owner'; owners=scroll_owners(page,'#standardBrowserDialog'); assert len(owners)<=1,owners; RESULTS.append({'oracle':'standard-scroll-owner','case':'desktop','owners':owners})
        PHASE='MC-01-standard-node-dedup'; node=dialog.locator('[data-standard-node-select]').first; strong=node.locator(':scope > strong'); span=node.locator(':scope > span')
        if strong.count(): assert strong.inner_text().strip().lower()!=span.inner_text().strip().lower(),(span.inner_text(),strong.inner_text())
        PHASE='MC-01-standard-close-target'; close=dialog.locator('button[aria-label="Chiudi"]'); box=close.bounding_box(); assert box and box['width']>=44 and box['height']>=44,box; close.click()
    PHASE=f'{code}-page-reflow'; no_page_overflow(page,f'desktop:{code}')
    RESULTS.append({'oracle':'procedure-semantic-questions','code':code,'procedureId':pid,'answers':{'next-action':True,'subject':True,'authority':True,'effect':True,'scope':True,'reference':bool(refs.count()),'claim-boundary':True},'singleVisibleOperationalCollection':mount=='semantic-bridge','actionableCount':expected,'hiddenProgressiveTargets':hidden})

def desktop(browser):
    global PHASE
    ctx=browser.new_context(viewport={'width':1440,'height':950}); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
    page=ctx.new_page(); page.set_default_timeout(30000)
    page.on('pageerror',lambda e: ERRORS.append(str(e)))
    page.on('request',lambda r: WRITES.append({'method':r.method,'path':urllib.parse.urlparse(r.url).path}) if r.url.startswith(BASE+'/api/') and r.method!='GET' else None)
    PHASE='home-open'; page.goto(BASE+'/?view=home',wait_until='networkidle'); page.wait_for_function("()=>document.documentElement.dataset.a6Ux4Semantic==='a6-ux4'")
    PHASE='home-title'; expect(page.locator('#homeTitle')).to_have_text('Integrated Compliance Tower Control')
    opens=page.locator('#homePriorities .home-priority-open:visible')
    if opens.count():
        PHASE='home-icon'; assert all('→' not in (opens.nth(i).inner_text() or '') for i in range(opens.count())); svg=opens.first.locator('svg'); box=svg.bounding_box(); assert not box or max(box['width'],box['height'])<=14.5,box
    PHASE='home-reflow'; no_page_overflow(page,'desktop:home')
    PHASE='processes-open'; page.locator('.service-nav [data-service="processes"]').click(); expect(page.locator('#procedureHub [data-process-code]')).to_have_count(7); no_page_overflow(page,'desktop:processes')
    for code,pid,root in PROCEDURES: audit_procedure(page,code,pid,root)
    PHASE='pre-proof-page-errors'; assert not ERRORS,ERRORS
    PHASE='proof-open'; page.locator('.service-nav [data-service="proof"]').click(); page.wait_for_function("()=>document.querySelector('#proofView')?.offsetParent!==null")
    PHASE='proof-claim-scope'; expect(page.locator('#proofView')).to_have_attribute('data-a6-ux4-claim-scope','repository-observation')
    PHASE='proof-integrity-copy'; page.wait_for_function("()=>{const e=document.querySelector('#proofIntegrity');return e&&/Coerente tecnicamente|Coerenza tecnica da verificare/.test(e.textContent||'')}")
    PHASE='proof-role-scope-copy'; page.wait_for_function("()=>{const value=document.querySelector('#evidenceActor');return value&&String(value.parentElement?.querySelector('span')?.textContent||'').trim()==='Vista per ruolo'}")
    PHASE='proof-reflow'; no_page_overflow(page,'desktop:proof')
    PHASE='proof-page-errors'; assert not ERRORS,ERRORS
    ctx.close()

def auditor_incident(browser):
    global PHASE
    ctx=browser.new_context(viewport={'width':1280,'height':900}); ctx.add_init_script("localStorage.setItem('ictc-role','auditor');localStorage.setItem('ictc-service','processes')")
    page=ctx.new_page(); page.set_default_timeout(30000); local_writes=[]
    page.on('request',lambda r: local_writes.append({'method':r.method,'path':urllib.parse.urlparse(r.url).path}) if r.url.startswith(BASE+'/api/') and r.method!='GET' else None)
    page.goto(BASE+'/?view=processes',wait_until='networkidle'); r=open_process(page,'EC-01','incidents','#incidentsView')
    opener=r.locator('[data-open-incident]').first; assert opener.count()>0,'auditor fixture must expose an incident'
    PHASE='EC-01-auditor-open'; opener.click(); dialog=page.locator('#incidentWorkspace'); expect(dialog).to_be_visible(); assert dialog.evaluate("d=>d.contains(document.activeElement)")
    PHASE='EC-01-auditor-readonly'; assert dialog.locator('[data-answer-question],[data-answer-unknown],[data-generate-draft],[data-save-manual],[data-save-formulation],[data-submit-incident],[data-close-incident]').count()==0
    assert dialog.locator('#questionValue:not([disabled])').count()==0; assert dialog.locator('[data-download-evidence]').count()>=1
    page.keyboard.press('Escape'); expect(dialog).not_to_be_visible(); assert not local_writes,local_writes
    RESULTS.append({'oracle':'auditor-incident-readonly','writes':len(local_writes),'modalFocus':True,'escapeClose':True}); ctx.close()

def mobile(browser,width,height):
    global PHASE
    ctx=browser.new_context(viewport={'width':width,'height':height}); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
    page=ctx.new_page(); page.set_default_timeout(30000); page.goto(BASE+'/?view=processes',wait_until='networkidle'); page.wait_for_function("()=>document.documentElement.dataset.a6Ux4Semantic==='a6-ux4'")
    PHASE=f'mobile-{width}-processes'; expect(page.locator('#procedureHub [data-process-code]')).to_have_count(7); no_page_overflow(page,f'mobile-{width}:processes')
    r=open_process(page,'MC-01','coverage','#grcWorkspace'); PHASE=f'mobile-{width}-mc'; expect(r.locator('[data-procedure-worklist]')).to_have_attribute('data-a6-ux4-mount','semantic-bridge')
    PHASE=f'mobile-{width}-dialog-open'; r.locator('[data-open-standard-browser]').first.click(); dialog=page.locator('#standardBrowserDialog'); expect(dialog).to_be_visible()
    PHASE=f'mobile-{width}-dialog-x'; no_local_x_overflow(page,'#standardBrowserDialog',f'mobile-{width}:dialog')
    PHASE=f'mobile-{width}-master-x'; no_local_x_overflow(page,'#standardBrowserDialog .standard-browser-master-detail',f'mobile-{width}:master-detail')
    PHASE=f'mobile-{width}-scroll-owner'; owners=scroll_owners(page,'#standardBrowserDialog'); assert len(owners)<=1,owners; RESULTS.append({'oracle':'standard-scroll-owner','case':f'mobile-{width}','owners':owners})
    PHASE=f'mobile-{width}-close-target'; close=dialog.locator('button[aria-label="Chiudi"]'); box=close.bounding_box(); assert box and box['width']>=44 and box['height']>=44,box; close.click()
    PHASE=f'mobile-{width}-mc-reflow'; no_page_overflow(page,f'mobile-{width}:mc'); ctx.close()

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        desktop(browser); auditor_incident(browser); mobile(browser,390,844); mobile(browser,320,800)
        PHASE='write-boundary'; assert not WRITES,WRITES
        report={'ok':True,'slice':'S4-A6','executionUnit':'A6-UX4','expectedBuildSha':EXPECTED or None,'results':RESULTS,'writes':WRITES,'pageErrors':ERRORS,'landingPages':['Home','Processi di Compliance','RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01','Evidenze ICTC'],'oracles':['single-visible-operational-collection','typed-native-actionability','resolved-target-reveal','zero-work-vacuous-binding','integrated-scope-control','compact-orientation','canonical-source-truth','auditor-incident-readonly','record-action-hierarchy','context-dedup','reference-band','action-effect-grammar','RN-material-merge','EC-heading-dedup','standard-browser-dedup','single-modal-scroll-authority','local-x-overflow','page-reflow','mobile-390','mobile-320','read-only-navigation-no-write'],'claimBoundary':'Exact-head Chromium repository UI semantics and geometry only; not representative human usability, accessibility certification, legal/compliance conclusion, deployment effectiveness, enterprise-candidate promotion or enterprise-ready proof.'}
        (ART/'browser-s4-a6-ux4-semantic-surface.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8')
        print(json.dumps({'ok':True,'executionUnit':'A6-UX4','procedures':7,'mobile':[390,320],'writes':0}),flush=True); browser.close()
except BaseException as exc:
    fail(exc); traceback.print_exc(); raise
