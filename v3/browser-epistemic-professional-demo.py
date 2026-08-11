import json, os, pathlib, re, shutil, subprocess, tempfile, time, traceback, urllib.request
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True); PHASE='init'
PORT=47000+(os.getpid()%800); BASE=f'http://127.0.0.1:{PORT}'; RUNTIME=tempfile.mkdtemp(prefix='ictc-epistemic-professional-'); LOG=ART/'browser-epistemic-professional-demo-server.log'; PROC=None
LENSES=['compliance-lead','internal-auditor','dpo-privacy','security-manager','risk-manager','control-owner','assurance-reviewer','legal-231-reviewer','it-operations','supplier-procurement','quality-manager','executive-sme']
EXPECTED_MODES={'compliance-lead':'explore','internal-auditor':'flat','dpo-privacy':'explore','security-manager':'graph','risk-manager':'explore','control-owner':'graph','assurance-reviewer':'explore','legal-231-reviewer':'flat','it-operations':'graph','supplier-procurement':'explore','quality-manager':'explore','executive-sme':'explore'}
SHOTS=[]
def shot(page,name,full=False):
 p=ART/name; page.screenshot(path=str(p),full_page=full); SHOTS.append(name)
def no_overflow(page):
 m=page.evaluate('()=>[innerWidth,document.documentElement.scrollWidth,document.body.scrollWidth]'); assert m[1]<=m[0]+1 and m[2]<=m[0]+1,m
def api(page,path,role='admin'):
 return page.evaluate("""async a=>{const r=await fetch(a.path,{headers:{'x-ictc-role':a.role,'x-ictc-actor-id':'browser-'+a.role}});const j=await r.json();return{status:r.status,payload:j}}""",{'path':path,'role':role})
def start_server():
 global PROC
 env={**os.environ,'ICTC_RUNTIME_DIR':RUNTIME,'ICTC_PORT':str(PORT),'PORT':str(PORT),'ICTC_HOST':'127.0.0.1','ICTC_DEMO_SEED':'1','ICTC_SCHEDULER_TICK_MS':'100000','ICTC_NO_OPEN':'1'}
 node=shutil.which('node'); assert node,'node missing'
 log=open(LOG,'w',encoding='utf8'); PROC=subprocess.Popen([node,str(ROOT/'v3/server.mjs')],cwd=ROOT,env=env,stdout=log,stderr=subprocess.STDOUT)
 for _ in range(600):
  if PROC.poll() is not None:
   log.flush(); raise RuntimeError(f'demo server exited {PROC.returncode}: {LOG.read_text(encoding="utf8")[-6000:]}')
  try:
   req=urllib.request.Request(BASE+'/api/health',headers={'x-ictc-role':'admin','x-ictc-actor-id':'browser-admin'}); urllib.request.urlopen(req,timeout=.4).read(); return log
  except Exception: time.sleep(.1)
 raise RuntimeError(f'demo server not ready: {LOG.read_text(encoding="utf8")[-6000:]}')
def stop_server(log):
 if PROC and PROC.poll() is None:
  PROC.terminate()
  try: PROC.wait(timeout=5)
  except subprocess.TimeoutExpired: PROC.kill(); PROC.wait(timeout=3)
 log.close(); shutil.rmtree(RUNTIME,ignore_errors=True)
def open_epistemic(page):
 page.goto(BASE+'/?view=processes',wait_until='networkidle'); expect(page.locator('#procedureHub .procedure-card')).to_have_count(7); expect(page.locator('#epistemicMetaCard')).to_be_visible(); page.locator('#epistemicMetaCard [data-service="epistemic"]').click(); expect(page.locator('#epistemicView')).to_be_visible(); expect(page.locator('#epistemicProfessionalTools')).to_be_visible(); expect(page.locator('#epistemicLens option')).to_have_count(12); no_overflow(page)
def fail(e):
 payload={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc(),'screenshots':SHOTS}; (ART/'browser-epistemic-professional-demo-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8'); print(f'::error title=browser-epistemic-professional-demo::{PHASE}: {type(e).__name__}: {e}',flush=True)
log=None
try:
 log=start_server()
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch)
  ctx=browser.new_context(viewport={'width':1440,'height':950}); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
  page=ctx.new_page(); page.set_default_timeout(30000); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  PHASE='demo-reality-bootstrap'; open_epistemic(page); boot=api(page,'/api/bootstrap')['payload']; assert boot['experience']['demoMode'] is True; assert boot['experience']['demo']['reality']['enabled'] is True; assert boot['experience']['demo']['reality']['threads']==12; assert boot['demoAudit']['verdict']=='coherent'; lattice=api(page,'/api/epistemic-lattice?offset=0&limit=80')['payload']; assert lattice['schemaVersion']=='1.2.0'; assert len(lattice['professionalLenses']['lenses'])==12; assert lattice['diagnostics']['counts']['businessThreads']==12; assert lattice['diagnostics']['counts']['contextualizedBusinessAtoms']>0; digest=lattice['projection']['projectionSha256']; label_before=page.locator('#epistemicPageLabel').inner_text(); assert digest[:12] in label_before
  PHASE='professional-lens-matrix'; select=page.locator('#epistemicLens'); host=page.locator('#epistemicProfessionalTools');
  for lens_id in LENSES:
   select.select_option(lens_id); page.wait_for_timeout(80); expect(select).to_have_value(lens_id); expected=EXPECTED_MODES[lens_id]; expect(page.locator(f'[data-epistemic-mode="{expected}"]')).to_have_attribute('aria-pressed','true'); expect(page.locator('#epistemicLensContext')).to_contain_text('Limite:'); expect(page.locator('#epistemicLensContext')).to_contain_text('conteggi, non score'); assert digest[:12] in page.locator('#epistemicLensContext').inner_text(); host.scroll_into_view_if_needed(); no_overflow(page); shot(page,f'epistemic-lens-{lens_id}.png')
  assert page.locator('#epistemicPageLabel').inner_text()==label_before,'professional lenses changed canonical projection digest/page'
  PHASE='thread-context-search'; select.select_option('security-manager'); page.locator('#epistemicContextSearch').fill('PMI-THR-02'); page.locator('[data-epistemic-context-search]').click(); results=page.locator('.epistemic-context-results button'); assert results.count()>0; results.first.click(); expect(page.locator('.epistemic-business-context')).to_be_visible(); expect(page.locator('.epistemic-business-context')).to_contain_text('PMI-THR-02'); expect(page.locator('.epistemic-business-context')).to_contain_text('Evidenza'); expect(page.locator('.epistemic-business-context')).to_contain_text('Incertezza'); page.locator('.epistemic-business-context').scroll_into_view_if_needed(); shot(page,'epistemic-thread-lineage.png')
  PHASE='explore-overview'; page.locator('[data-epistemic-level="overview"]').click(); expect(page.locator('.epistemic-overview')).to_be_visible(); shot(page,'epistemic-use-explore-overview.png')
  PHASE='explore-groups'; pbtn=page.locator('[data-explore-procedure="risks"]'); expect(pbtn).to_be_visible(); pbtn.click(); expect(page.locator('.epistemic-cluster-grid')).to_be_visible(); shot(page,'epistemic-use-groups-risk.png')
  PHASE='explore-relations'; family=page.locator('[data-explore-family]').first; expect(family).to_be_visible(); family.click(); expect(page.locator('.epistemic-relation-list')).to_be_visible(); shot(page,'epistemic-use-relations.png')
  PHASE='explore-atom'; atom=page.locator('[data-explore-atom]').first; expect(atom).to_be_visible(); atom.click(); expect(page.locator('.epistemic-detail')).to_be_visible(); shot(page,'epistemic-use-atom-basis.png')
  PHASE='flat-raw'; page.locator('[data-epistemic-mode="flat"]').click(); expect(page.locator('.epistemic-table')).to_be_visible(); expect(page.locator('.surface-raw')).to_be_visible(); shot(page,'epistemic-use-flat-raw.png')
  PHASE='proto-graph'; page.locator('[data-epistemic-mode="graph"]').click(); expect(page.locator('.epistemic-graph-canvas')).to_be_visible(); expect(page.locator('.epistemic-node-list')).to_be_visible(); shot(page,'epistemic-use-proto-graph.png')
  PHASE='human-on-boundary'; panel=page.locator('#epistemicInferencePanel'); expect(panel).to_be_visible(); panel.scroll_into_view_if_needed(); infer=page.locator('[data-epistemic-infer]'); expect(infer).to_be_disabled(); shot(page,'epistemic-use-ai-human-off.png'); page.locator('#epistemicAiOn').check(); expect(infer).to_be_enabled(); shot(page,'epistemic-use-ai-human-on.png'); page.locator('#epistemicAiOn').uncheck()
  PHASE='231-boundary'; select.select_option('legal-231-reviewer'); expect(page.locator('#epistemicLensContext')).to_contain_text('non inferisce reato'); assert 'compliance score' not in page.locator('#epistemicLensContext').inner_text().lower(); shot(page,'epistemic-use-231-boundary.png')
  PHASE='executive-no-score'; select.select_option('executive-sme'); txt=page.locator('#epistemicLensContext').inner_text().lower(); assert 'non compliance score' in txt or 'non compliance' in txt; shot(page,'epistemic-use-executive-no-score.png')
  PHASE='user-denial'; uc=browser.new_context(viewport={'width':1280,'height':850}); uc.add_init_script("localStorage.setItem('ictc-role','user');localStorage.setItem('ictc-service','processes')"); u=uc.new_page(); u.goto(BASE+'/?view=processes',wait_until='networkidle'); assert u.locator('#epistemicMetaCard').count()==0; denied=api(u,'/api/epistemic-lattice','user'); assert denied['status']==403; shot(u,'epistemic-use-user-rbac-denied.png'); uc.close()
  PHASE='auditor-read-only'; ac=browser.new_context(viewport={'width':1280,'height':850}); ac.add_init_script("localStorage.setItem('ictc-role','auditor');localStorage.setItem('ictc-service','processes')"); a=ac.new_page(); open_epistemic(a); a.locator('#epistemicLens').select_option('internal-auditor'); expect(a.locator('#epistemicProfessionalTools')).to_be_visible(); shot(a,'epistemic-use-auditor-read-only.png'); ac.close()
  PHASE='mobile'; mc=browser.new_context(viewport={'width':390,'height':844}); mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')"); m=mc.new_page(); open_epistemic(m); m.locator('#epistemicLens').select_option('security-manager'); expect(m.locator('[data-epistemic-mode="graph"]')).to_have_attribute('aria-pressed','true'); no_overflow(m); shot(m,'epistemic-use-mobile-390.png'); mc.close()
  assert not errors,errors
  out={'ok':True,'profile':'epistemic-professional-demo-v1','businessProcedures':7,'professionalLenses':len(LENSES),'businessThreads':12,'sameProjectionDigestAcrossLenses':True,'projectionSha256':digest,'demoReality':True,'demoAudit':boot['demoAudit']['verdict'],'screenshots':SHOTS,'screenshotCount':len(SHOTS),'claimBoundary':'Server-backed synthetic demo evidence over the declared professional-use taxonomy; not independent assurance, legal applicability, compliance, control effectiveness or universal usability.'}; (ART/'browser-epistemic-professional-demo.json').write_text(json.dumps(out,indent=2),encoding='utf8'); print(f'browser-epistemic-professional-demo: complete screenshots={len(SHOTS)}',flush=True); ctx.close(); browser.close()
except BaseException as e:
 fail(e); traceback.print_exc(); raise
finally:
 if log is not None: stop_server(log)
 else: shutil.rmtree(RUNTIME,ignore_errors=True)
