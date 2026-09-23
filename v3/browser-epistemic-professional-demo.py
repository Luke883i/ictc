import json, os, pathlib, shutil, subprocess, tempfile, time, traceback, urllib.request
from playwright.sync_api import expect, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
PHASE = 'init'
EXTERNAL_BASE = (os.environ.get('ICTC_BASE_URL') or '').rstrip('/')
PORT = 47000 + (os.getpid() % 800)
BASE = EXTERNAL_BASE or f'http://127.0.0.1:{PORT}'
RUNTIME = None if EXTERNAL_BASE else tempfile.mkdtemp(prefix='ictc-epistemic-professional-')
LOG = ART / 'browser-epistemic-professional-demo-server.log'
PROC = None
LENSES = ['compliance-lead','internal-auditor','dpo-privacy','security-manager','risk-manager','control-owner','assurance-reviewer','legal-231-reviewer','it-operations','supplier-procurement','quality-manager','executive-sme']
EXPECTED_MODES = {'compliance-lead':'explore','internal-auditor':'flat','dpo-privacy':'explore','security-manager':'graph','risk-manager':'explore','control-owner':'graph','assurance-reviewer':'explore','legal-231-reviewer':'flat','it-operations':'graph','supplier-procurement':'explore','quality-manager':'explore','executive-sme':'explore'}
PROOF_READING_ORDER='facts>decisions>trace>evidence-basis>epistemic>external>integrity>method>export'
SHOTS = []

def shot(page, name, full=False):
    path = ART / name
    page.screenshot(path=str(path), full_page=full)
    SHOTS.append(name)

def no_overflow(page):
    measured = page.evaluate('()=>[innerWidth,document.documentElement.scrollWidth,document.body.scrollWidth]')
    assert measured[1] <= measured[0] + 1 and measured[2] <= measured[0] + 1, measured

def api(page, path, role='admin'):
    return page.evaluate("""async a=>{const r=await fetch(a.path,{headers:{'x-ictc-role':a.role,'x-ictc-actor-id':'browser-'+a.role}});const j=await r.json();return{status:r.status,payload:j}}""", {'path': path, 'role': role})

def health_request():
    req = urllib.request.Request(BASE + '/api/health', headers={'x-ictc-role':'admin','x-ictc-actor-id':'browser-admin'})
    return urllib.request.urlopen(req, timeout=2).read()

def start_server():
    global PROC
    if EXTERNAL_BASE:
        for _ in range(30):
            try:
                health_request(); return None
            except Exception: time.sleep(.2)
        raise RuntimeError(f'external demo server not ready: {BASE}')
    env = {**os.environ, 'ICTC_RUNTIME_DIR':RUNTIME, 'ICTC_PORT':str(PORT), 'PORT':str(PORT), 'ICTC_HOST':'127.0.0.1', 'ICTC_DEMO_SUITE':'3.0', 'ICTC_SCHEDULER_TICK_MS':'100000', 'ICTC_NO_OPEN':'1'}
    node = shutil.which('node'); assert node, 'node missing'
    log = open(LOG, 'w', encoding='utf8')
    PROC = subprocess.Popen([node, str(ROOT / 'v3/server.mjs')], cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT)
    deadline = time.monotonic() + 180
    while time.monotonic() < deadline:
        if PROC.poll() is not None:
            log.flush(); raise RuntimeError(f'demo server exited {PROC.returncode}: {LOG.read_text(encoding="utf8")[-6000:]}')
        try:
            health_request(); return log
        except Exception: time.sleep(.2)
    raise RuntimeError(f'demo server not ready within 180s: {LOG.read_text(encoding="utf8")[-6000:]}')

def stop_server(log):
    if EXTERNAL_BASE:return
    if PROC and PROC.poll() is None:
        PROC.terminate()
        try:PROC.wait(timeout=5)
        except subprocess.TimeoutExpired:
            PROC.kill();PROC.wait(timeout=3)
    if log:log.close()
    if RUNTIME:shutil.rmtree(RUNTIME, ignore_errors=True)

def wait_canonical_evidence_entry(page):
    page.wait_for_function("""expected=>{const root=document.querySelector('#proofView'),content=document.querySelector('#proofContent'),entry=content?.querySelector(':scope > details[data-proof-workspace="epistemic-investigation"]');return !!(root&&root.offsetParent!==null&&root.dataset.localCompositionOwner==='proof-workspace-3-2.js'&&root.dataset.proofReadingOrder===expected&&root.dataset.initialSecondaryDisclosures==='closed'&&entry&&!root.querySelector('#epistemicMetaCard')&&entry.querySelector('[data-service="epistemic"]'));}""", arg=PROOF_READING_ORDER)
    investigation = page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]')
    expect(investigation).to_have_count(1); assert page.locator('#proofView #epistemicMetaCard').count() == 0
    return investigation

def open_epistemic(page, phase_prefix='open-epistemic'):
    global PHASE
    PHASE=f'{phase_prefix}-processes';page.goto(BASE+'/?view=processes',wait_until='networkidle');expect(page.locator('#procedureHub .procedure-card')).to_have_count(7);assert page.locator('#epistemicMetaCard').count()==0
    PHASE=f'{phase_prefix}-evidence';page.goto(BASE+'/?view=proof',wait_until='networkidle');expect(page.locator('#proofView')).to_be_visible();investigation=wait_canonical_evidence_entry(page);assert investigation.get_attribute('open') is None
    PHASE=f'{phase_prefix}-entry';investigation.locator(':scope > summary').click();action=investigation.locator('[data-service="epistemic"]');expect(action).to_be_visible();action.click()
    PHASE=f'{phase_prefix}-surface';expect(page.locator('#epistemicView')).to_be_visible();expect(page.locator('#epistemicView')).to_have_attribute('data-enduser-trajectory','find>narrow>explore>select>reconstruct>deepen');expect(page.locator('.epistemic-claim-boundary')).to_be_visible();deep=page.locator('#epistemicView details[data-epistemic-a3="deep-tools"]');expect(deep).to_be_visible();assert deep.get_attribute('open') is None;deep.locator(':scope > summary').click();expect(deep).to_have_attribute('open','');expect(page.locator('#epistemicProfessionalTools')).to_be_visible();expect(page.locator('#epistemicLens')).to_be_visible()
    PHASE=f'{phase_prefix}-lens-projection';expect(page.locator('#epistemicLens option')).to_have_count(12,timeout=20000);expect(page.locator('#epistemicLens')).to_be_enabled(timeout=20000);no_overflow(page)

def open_technical_modes(page):
    detail=page.locator('#epistemicView details[data-epistemic-a3="technical-modes"]');expect(detail).to_be_visible()
    if detail.get_attribute('open') is None:detail.locator(':scope > summary').click()
    expect(detail).to_have_attribute('open','');return detail

def fail(error):
    payload={'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc(),'screenshots':SHOTS}
    (ART/'browser-epistemic-professional-demo-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8');print(f'::error title=browser-epistemic-professional-demo::{PHASE}: {type(error).__name__}: {error}',flush=True)

log=None
try:
    log=start_server()
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        page=ctx.new_page();page.set_default_timeout(30000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        open_epistemic(page,'demo-suite-3-0-bootstrap')
        PHASE='demo-suite-3-0-bootstrap-data';boot=api(page,'/api/bootstrap')['payload'];demo=boot['experience']['demo'];assert boot['experience']['demoMode'] is True;assert demo['enabled'] is True;assert demo['suiteVersion']=='3.0';assert demo['projectionAuthority']=='demo-suite-3-0';assert demo['datasetId']=='ictc-demo-suite-3-0';assert demo['positiveRecords']==188;assert demo['stressFixtures']==512;assert demo['stressVisible'] is False;assert demo['schedulerEnabled'] is False;assert demo['coherent'] is True;assert demo['violations']==[];assert isinstance(demo['stateDigest'],str) and len(demo['stateDigest'])==64;assert 'demoAudit' not in boot
        lattice=api(page,'/api/epistemic-lattice?offset=0&limit=80')['payload'];assert lattice['schemaVersion']=='1.3.0';assert len(lattice['professionalLenses']['lenses'])==12;assert lattice['diagnostics']['counts']['businessAtoms']>0;assert lattice['projection']['rnSemanticAtoms']>=0;digest=lattice['projection']['projectionSha256'];label_before=page.locator('#epistemicPageLabel').get_attribute('data-projection-digest');assert label_before==digest[:12]
        PHASE='professional-lens-matrix';select=page.locator('#epistemicLens');host=page.locator('#epistemicProfessionalTools')
        for lens_id in LENSES:
            select.select_option(lens_id);page.wait_for_timeout(80);expect(select).to_have_value(lens_id);expected=EXPECTED_MODES[lens_id];expect(page.locator(f'[data-epistemic-mode="{expected}"]')).to_have_attribute('aria-pressed','true');expect(page.locator('#epistemicLensContext')).to_contain_text('Limite:');expect(page.locator('#epistemicLensContext')).to_contain_text('conteggi, non score');assert digest[:12] in page.locator('#epistemicLensContext').inner_text();host.scroll_into_view_if_needed();no_overflow(page);shot(page,f'epistemic-lens-{lens_id}.png')
        assert page.locator('#epistemicPageLabel').get_attribute('data-projection-digest')==label_before,'professional lenses changed canonical projection digest/page'
        PHASE='suite-disclosure';page.goto(BASE+'/?view=home',wait_until='networkidle');expect(page.locator('#ictcDemoCard')).to_be_visible();page.locator('#ictcDemoCard').click();expect(page.locator('#ictcDemoDialog')).to_be_visible();expect(page.locator('#ictcDemoDialog')).to_contain_text('188 record business 3.0');expect(page.locator('#ictcDemoDialog')).to_contain_text('512 fixture escluse');expect(page.locator('#ictcDemoDialog')).to_contain_text('Evidence Lattice');expect(page.locator('#ictcDemoDialog')).to_contain_text('Suite 2.2 deprecata');expect(page.locator('#ictcDemoDialog')).to_contain_text('demo-suite-3-0');shot(page,'demo-suite-3-0-disclosure.png')
        open_epistemic(page,'explore-overview-entry');PHASE='explore-overview';page.locator('[data-epistemic-level="overview"]').click();expect(page.locator('.epistemic-overview')).to_be_visible();shot(page,'epistemic-use-explore-overview.png')
        PHASE='explore-groups';pbtn=page.locator('[data-explore-procedure="risks"]');expect(pbtn).to_be_visible();pbtn.click();expect(page.locator('.epistemic-cluster-grid')).to_be_visible();shot(page,'epistemic-use-groups-risk.png')
        PHASE='explore-relations';family=page.locator('[data-explore-family]').first;expect(family).to_be_visible();family.click();expect(page.locator('.epistemic-relation-list')).to_be_visible();shot(page,'epistemic-use-relations.png')
        PHASE='explore-atom';atom=page.locator('[data-explore-atom]').first;expect(atom).to_be_visible();atom.click();expect(page.locator('.epistemic-detail')).to_be_visible();shot(page,'epistemic-use-atom-basis.png')
        PHASE='technical-disclosure';open_technical_modes(page);PHASE='flat-raw';page.locator('[data-epistemic-mode="flat"]').click();expect(page.locator('.epistemic-table')).to_be_visible();expect(page.locator('.surface-raw')).to_be_visible();shot(page,'epistemic-use-flat-raw.png')
        PHASE='proto-graph';page.locator('[data-epistemic-mode="graph"]').click();expect(page.locator('.epistemic-graph-canvas')).to_be_visible();expect(page.locator('.epistemic-node-list')).to_be_visible();shot(page,'epistemic-use-proto-graph.png')
        PHASE='human-on-boundary';panel=page.locator('#epistemicInferencePanel');expect(panel).to_be_visible();panel.scroll_into_view_if_needed();infer=page.locator('[data-epistemic-infer]');expect(infer).to_be_disabled();shot(page,'epistemic-use-ai-human-off.png');page.locator('#epistemicAiOn').check();expect(infer).to_be_enabled();shot(page,'epistemic-use-ai-human-on.png');page.locator('#epistemicAiOn').uncheck()
        PHASE='231-boundary';select=page.locator('#epistemicLens');select.select_option('legal-231-reviewer');expect(page.locator('#epistemicLensContext')).to_contain_text('non inferisce reato');assert 'compliance score' not in page.locator('#epistemicLensContext').inner_text().lower();shot(page,'epistemic-use-231-boundary.png')
        PHASE='executive-no-score';select.select_option('executive-sme');txt=page.locator('#epistemicLensContext').inner_text().lower();assert 'non compliance score' in txt or 'non compliance' in txt;shot(page,'epistemic-use-executive-no-score.png')
        PHASE='user-denial';uc=browser.new_context(viewport={'width':1280,'height':850});uc.add_init_script("localStorage.setItem('ictc-role','user');localStorage.setItem('ictc-service','processes')");u=uc.new_page();u.goto(BASE+'/?view=processes',wait_until='networkidle');assert u.locator('#epistemicMetaCard').count()==0;denied=api(u,'/api/epistemic-lattice','user');assert denied['status']==403;shot(u,'epistemic-use-user-rbac-denied.png');uc.close()
        PHASE='auditor-read-only';ac=browser.new_context(viewport={'width':1280,'height':850});ac.add_init_script("localStorage.setItem('ictc-role','auditor');localStorage.setItem('ictc-service','processes')");a=ac.new_page();open_epistemic(a,'auditor-read-only');a.locator('#epistemicLens').select_option('internal-auditor');expect(a.locator('#epistemicProfessionalTools')).to_be_visible();shot(a,'epistemic-use-auditor-read-only.png');ac.close()
        PHASE='mobile';mc=browser.new_context(viewport={'width':390,'height':844});mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')");m=mc.new_page();open_epistemic(m,'mobile');m.locator('#epistemicLens').select_option('security-manager');expect(m.locator('[data-epistemic-mode="graph"]')).to_have_attribute('aria-pressed','true');no_overflow(m);shot(m,'epistemic-use-mobile-390.png');mc.close()
        assert not errors,errors
        out={'ok':True,'profile':'epistemic-professional-demo-suite-3-0+s4-a3+p2','epistemicSchemaVersion':'1.3.0','businessProcedures':7,'professionalLenses':len(LENSES),'businessThreads':lattice['diagnostics']['counts']['businessThreads'],'sameProjectionDigestAcrossLenses':True,'projectionSha256':digest,'demoSuite':'3.0','demoProjectionAuthority':demo['projectionAuthority'],'demoStateDigest':demo['stateDigest'],'rnSemanticAtoms':lattice['projection']['rnSemanticAtoms'],'metaEntrySurface':'Evidenze ICTC / progressive canonical disclosure after evidence meaning','proofReadingOrder':PROOF_READING_ORDER,'proofSecondaryDefault':'closed','deepToolsProgressive':True,'duplicateProofMetaEntry':False,'screenshots':SHOTS,'screenshotCount':len(SHOTS),'claimBoundary':'Server-backed synthetic Suite 3.0 evidence over the declared professional-use taxonomy; Suite 2.2 is deprecated generator lineage; not independent assurance, legal applicability, compliance, control effectiveness or universal usability.'}
        (ART/'browser-epistemic-professional-demo.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(f'browser-epistemic-professional-demo: complete screenshots={len(SHOTS)}',flush=True);ctx.close();browser.close()
except BaseException as error:
    fail(error);traceback.print_exc();raise
finally:
    stop_server(log)