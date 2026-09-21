import json, os, pathlib, traceback
from playwright.sync_api import sync_playwright, expect
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4831').rstrip('/')
OUT=pathlib.Path('artifacts/audit-dossier'); OUT.mkdir(parents=True,exist_ok=True)
TARGET='ca6017b76f33d951ac5e3e5ee3db5f155e6a1fff'
SURFACES=[
('home','home',None,'#homeView'),('processes','processes',None,'#processesView'),
('monitoring','monitoring',None,'#monitoringView'),('incidents','incidents',None,'#incidentsView'),
('objects','grc','objects','#grcWorkspace'),('coverage','grc','coverage','#grcWorkspace'),
('actions','grc','actions','#grcWorkspace'),('risks','grc','risks','#grcWorkspace'),
('assurance','grc','assurance','#grcWorkspace'),('proof','proof',None,'#proofView'),
('epistemic','epistemic',None,'#epistemicView'),('admin','admin',None,'#adminCenter'),
('ai-settings','ai-settings',None,'#settingsDialog')]
VIEWPORTS=[('desktop',1440,1000),('mobile',390,844)]
records=[]; errors=[]
def ctx_for(browser,role,w,h,service='home'):
    c=browser.new_context(viewport={'width':w,'height':h})
    c.add_init_script(f"localStorage.setItem('ictc-role','{role}');localStorage.setItem('ictc-service','{service}');localStorage.setItem('ictc-profile','demo')")
    return c
def ready(page):
    page.wait_for_function("()=>document.documentElement.dataset.enduserComposition==='p2'",timeout=30000)
    page.wait_for_timeout(350)
def mount(page,surface,view,procedure,root):
    if view=='grc':
        page.goto(f'{BASE}/?view=grc&procedure={procedure}',wait_until='networkidle')
        page.wait_for_function("p=>document.querySelector('#grcWorkspace')?.dataset.compositionSurface===p",arg=procedure,timeout=30000)
    elif view=='admin':
        page.goto(f'{BASE}/?view=home',wait_until='networkidle'); ready(page)
        menu=page.locator('#stableProfileMenu')
        if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()
        page.locator('#openAdminCenter').click(); expect(page.locator('#adminCenter')).to_be_visible(); page.wait_for_timeout(450)
    elif view=='ai-settings':
        page.goto(f'{BASE}/?view=home',wait_until='networkidle'); ready(page)
        menu=page.locator('#stableProfileMenu')
        if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()
        page.locator('#openSettings').click(); expect(page.locator('#settingsDialog')).to_be_visible(); page.wait_for_timeout(350)
    else:
        page.goto(f'{BASE}/?view={view}',wait_until='networkidle'); page.wait_for_timeout(250)
    ready(page)
    if root: expect(page.locator(root)).to_be_visible()
def metadata(page,label,role,viewport,kind):
    return {'label':label,'role':role,'viewport':viewport,'kind':kind,'url':page.url,
      'surface':page.locator('html').get_attribute('data-ictc-surface'),
      'workspace':page.locator('html').get_attribute('data-ictc-workspace'),
      'h1':page.locator('h1:visible').all_inner_texts()[:8],
      'h2':page.locator('h2:visible').all_inner_texts()[:12],
      'buttons':[x.strip() for x in page.locator('button:visible').all_inner_texts() if x.strip()][:32],
      'rootDataset':page.evaluate("()=>({...document.documentElement.dataset})")}
def shot(page,name,role,viewport,kind):
    f=OUT/f'{name}.png'; page.screenshot(path=str(f),full_page=True)
    r=metadata(page,name,role,viewport,kind); r['file']=f.name; records.append(r)
def run_case(browser,role,w,h,label,view,procedure,root,viewport,kind):
    c=ctx_for(browser,role,w,h,view if view not in ('admin','ai-settings') else 'home'); p=c.new_page()
    try: mount(p,label,view,procedure,root); shot(p,label,role,viewport,kind)
    except Exception as e:
        errors.append({'phase':label,'error':repr(e),'trace':traceback.format_exc()})
        try: p.screenshot(path=str(OUT/f'ERROR__{label}.png'),full_page=True)
        except: pass
    finally: c.close()
with sync_playwright() as pw:
    launch={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
    browser=pw.chromium.launch(**launch)
    for vp,w,h in VIEWPORTS:
        for surface,view,procedure,root in SURFACES:
            run_case(browser,'admin',w,h,f'{vp}__admin__{surface}',view,procedure,root,vp,'canonical-surface')
    role_cases=[
      ('user','home','home',None,'#homeView'),('auditor','home','home',None,'#homeView'),
      ('user','processes','processes',None,'#processesView'),('auditor','processes','processes',None,'#processesView'),
      ('user','monitoring','monitoring',None,'#monitoringView'),('auditor','monitoring','monitoring',None,'#monitoringView'),
      ('user','incidents','incidents',None,'#incidentsView'),('auditor','incidents','incidents',None,'#incidentsView'),
      ('auditor','objects','grc','objects','#grcWorkspace'),('user','actions','grc','actions','#grcWorkspace'),
      ('auditor','proof','proof',None,'#proofView'),('auditor','epistemic','epistemic',None,'#epistemicView')]
    for role,surface,view,procedure,root in role_cases:
        run_case(browser,role,1440,1000,f'desktop__{role}__{surface}',view,procedure,root,'desktop','role-sensitive')
    c=ctx_for(browser,'admin',1440,1000,'home'); p=c.new_page()
    try:
        mount(p,'admin','admin',None,'#adminCenter')
        for tab in ['overview','ai','identity']:
            nav=p.locator(f'#adminCenter [data-admin-nav="{tab}"]')
            if nav.count():
                nav.click(); p.wait_for_timeout(350); shot(p,f'desktop__admin__admin-{tab}','admin','desktop','admin-tab')
    except Exception as e: errors.append({'phase':'admin-tabs','error':repr(e),'trace':traceback.format_exc()})
    finally: c.close()
    def dialog_case(label,route,role,trigger,dialog):
        c=ctx_for(browser,role,1440,1000,route); p=c.new_page()
        try:
            mount(p,label,route,None,{'monitoring':'#monitoringView','incidents':'#incidentsView'}.get(route))
            loc=p.locator(trigger).first; expect(loc).to_be_visible(timeout=8000); loc.click()
            expect(p.locator(dialog)).to_be_visible(timeout=8000); p.wait_for_timeout(300)
            shot(p,f'desktop__{role}__{label}',role,'desktop','dialog/subsurface')
        except Exception as e: errors.append({'phase':label,'error':repr(e),'trace':traceback.format_exc()})
        finally: c.close()
    dialog_case('monitoring-contribution','monitoring','admin','#openContribution','#contributionDialog')
    dialog_case('monitoring-scheduler','monitoring','admin','[data-rn-open-scheduler]','#jobDialog')
    dialog_case('monitoring-source-review','monitoring','admin','[data-open-source]','#sourceDialog')
    dialog_case('monitoring-plan-review','monitoring','admin','[data-open-plan]','#planDialog')
    dialog_case('incident-intake','incidents','user','#openIncident','#incidentDialog')
    dialog_case('incident-workspace','incidents','auditor','[data-open-incident]','#incidentWorkspace')
    c=ctx_for(browser,'admin',1440,1000,'grc'); p=c.new_page()
    try:
        mount(p,'coverage','grc','coverage','#grcWorkspace')
        lib=p.locator('#grcWorkspace [data-market-library]')
        if lib.count() and lib.get_attribute('open') is None: lib.locator(':scope > summary').click()
        p.wait_for_timeout(250); shot(p,'desktop__admin__coverage-library','admin','desktop','progressive-disclosure')
        scope=p.locator('#grcWorkspace .market-scope-editor').first
        if scope.count():
            if scope.get_attribute('open') is None: scope.locator(':scope > summary').click()
            p.wait_for_timeout(250); shot(p,'desktop__admin__coverage-scope-editor','admin','desktop','overlay')
    except Exception as e: errors.append({'phase':'coverage-overlays','error':repr(e),'trace':traceback.format_exc()})
    finally: c.close()
    browser.close()
report={'targetSha':TARGET,'canonicalSurfaceCount':len(SURFACES),'canonicalViewports':[x[0] for x in VIEWPORTS],
        'records':records,'errors':errors,'screenshotCount':len(list(OUT.glob('*.png'))),
        'claimBoundary':'Rendered Chromium evidence over exact repository main in isolated DEMO Suite 3.0; not representative-human usability, legal compliance, external truth, deployment assurance or universal assistive-technology effectiveness.'}
(OUT/'capture-report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps({'screenshots':report['screenshotCount'],'records':len(records),'errors':len(errors)},ensure_ascii=False))
