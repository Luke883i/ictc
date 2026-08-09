import json, os, re, urllib.request, urllib.error
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173')
ART=Path(__file__).resolve().parent.parent/'artifacts';ART.mkdir(exist_ok=True)
def request(path,method='GET',body=None,revision=None,role='admin'):
    data=None if body is None else json.dumps(body).encode()
    headers={'content-type':'application/json','x-ictc-role':role,'x-ictc-actor-id':f'stable-{role}'}
    if method!='GET':headers['x-ictc-command-id']=f'stable-{method}-{path}-{os.urandom(4).hex()}'
    if revision is not None:headers['x-ictc-expected-revision']=str(revision)
    req=urllib.request.Request(BASE+path,data=data,headers=headers,method=method)
    try:
        with urllib.request.urlopen(req,timeout=10) as r:return r.status,json.loads(r.read().decode()) if 'json' in r.headers.get('content-type','') else r.read().decode()
    except urllib.error.HTTPError as e:
        raw=e.read().decode()
        try:return e.code,json.loads(raw)
        except:return e.code,raw
raw=urllib.request.urlopen(BASE+'/',timeout=10).read().decode()
nav=re.search(r'<nav class="service-nav"[\s\S]*?</nav>',raw).group(0)
assert 'data-service="home"' in nav and '>Oggi<' in nav
assert 'data-service="processes"' in nav and '>Processi<' in nav
assert 'data-service="proof"' in nav and '>Prove<' in nav
assert 'data-service="monitoring"' not in nav and 'data-service="incidents"' not in nav
assert 'id="processesView"' in raw and 'id="procedureHub"' in raw
assert '5 MB per file e 5 MB complessivi' in raw
status,boot=request('/api/bootstrap');assert status==200
assert boot['experience']['stabilityProfile']=='v4_experimental_stable'
assert boot['experience']['aiPolicy']['serverEnforced'] is True
rev=boot['revision'];status,policy=request('/api/admin/ai-policy','PUT',{'aiPolicy':'disabled'},rev);assert status==200
status,draft=request('/api/missions/draft','POST',{'objective':'Verifica manual continuity under organization AI policy'});assert status==201
assert draft.get('planning') is None and 'policy organizzativa' in (draft.get('warning') or '').lower()
status,manual=request('/api/missions/manual-draft','POST',{'objective':'Percorso manuale con AI organizzativa disabilitata'});assert status in (200,201)
with sync_playwright() as p:
    launch={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
    browser=p.chromium.launch(**launch);page=browser.new_page(viewport={'width':1440,'height':1000});page.goto(BASE,wait_until='networkidle')
    page.wait_for_selector('html[data-ictc-stability="v4_experimental_stable"]')
    assert page.locator('.service-nav [data-service]').all_text_contents()==['Oggi','Processi','Prove']
    assert page.locator('#complianceNexus [data-nexus-process]').count()==7
    page.get_by_role('button',name='Processi').click();page.wait_for_selector('#processesView:not([hidden])')
    page.get_by_role('button',name='Prove').click()
    page.select_option('#roleSelect','auditor');page.wait_for_timeout(500)
    assert page.locator('html').get_attribute('data-ictc-stability')=='v4_experimental_stable'
    browser.close()
report={'ok':True,'stabilityProfile':'v4_experimental_stable','nativeShell':True,'serverAiPolicy':True,'manualContinuity':True,'evidenceGrade':'E3-runtime-browser','humanComprehension':'not-assessed'}
(ART/'browser-v4-stable.json').write_text(json.dumps(report,indent=2))
print('browser-v4-stable-check: ok')
