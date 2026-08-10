import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'
PROCS={'RN-01':'monitoring','EC-01':'incidents','AO-01':'objects','MC-01':'coverage','AP-01':'actions','RC-01':'risks','AR-01':'assurance'}
FORM_TYPES={'objects':'object','coverage':'mapping','actions':'action','risks':'risk','assurance':'assurance'}
def fail(e):
 payload={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}; (ART/'browser-v2-1-procedure-journey-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8'); print(f'::error title=browser-v2-1-procedure-journey::{PHASE}: {type(e).__name__}: {e}',flush=True)
def processes(page): return page.locator('.service-nav [data-service="processes"]')
def openp(page,code):
 processes(page).click(); card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); card.locator(':scope > footer .primary').click(); page.wait_for_timeout(80); expect(page.locator('[data-surface-context-strip]:visible')).to_contain_text(code); return card
def no_overflow(page):
 m=page.evaluate('()=>[innerWidth,document.documentElement.scrollWidth,document.body.scrollWidth]'); assert m[1]<=m[0]+1 and m[2]<=m[0]+1,m
def bootstrap(page):
 return page.evaluate("""async()=>{const r=await fetch('/api/bootstrap',{headers:{'content-type':'application/json','x-ictc-role':'admin','x-ictc-actor-id':'browser-v21'}});return await r.json()}""")
def revision(page): return int(bootstrap(page).get('revision') or 0)
def current_revision(page): return int(page.locator('html').get_attribute('data-ictc-projection-revision') or 0)
def wait_advance(page,before):
 page.wait_for_function('(old)=>Number(document.documentElement.dataset.ictcProjectionRevision||0)>old',arg=before); after=current_revision(page); assert after>before,(before,after); return after
def check_surface_revision(page,selector,rev):
 page.wait_for_function("([sel,r])=>Number(document.querySelector(sel)?.dataset.projectionRevision||0)>=r",arg=[selector,rev]); assert int(page.locator(selector).get_attribute('data-projection-revision') or 0)>=rev
def verify_process_projection(page,code,pid,rev):
 processes(page).click(); check_surface_revision(page,'#processesView',rev); card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); data=bootstrap(page); item=next(x for x in data.get('procedures',[]) if x.get('id')==pid); rendered=int(card.locator('.procedure-signals .procedure-signal b').first.inner_text()); assert rendered==int(item.get('attentionCount') or 0),(code,rendered,item.get('attentionCount')); no_overflow(page)
def fill_user(locator,value,phase):
 global PHASE
 PHASE=phase; expect(locator).to_have_count(1); expect(locator).to_be_visible(); expect(locator).to_be_editable(); locator.fill(value)
def select_user(locator,value,phase):
 global PHASE
 PHASE=phase; expect(locator).to_have_count(1); expect(locator).to_be_visible(); expect(locator).to_be_editable(); locator.select_option(value)
def open_native_entry(page,pid):
 global PHASE
 disclosure=page.locator('#grcPrimaryForm'); expect(disclosure).to_have_count(1)
 if pid=='coverage':
  PHASE='MC-01-standard-entry'; library=page.locator('#grcWorkspace .market-section'); assert library.count()<=1
  if library.count(): expect(library).to_be_visible()
  PHASE='MC-01-open-requirement-disclosure'; summary=disclosure.locator(':scope > summary'); expect(summary).to_be_visible(); summary.click(); expect(disclosure).to_have_attribute('open','')
 else:
  PHASE=f'{pid}-primary-disclosure'; expect(disclosure).to_have_attribute('open','')
 return disclosure
def submit_grc(page,code,pid,fill,needle):
 global PHASE
 PHASE=f'{code}-open'; openp(page,code); check_surface_revision(page,'#grcView',current_revision(page)); page.locator('.procedure-frame:visible .procedure-primary').click(); open_native_entry(page,pid); form=page.locator(f'[data-grc-form="{FORM_TYPES[pid]}"]'); PHASE=f'{code}-form-ready'; expect(form).to_have_count(1); expect(form).to_be_visible(); before=current_revision(page); fill(form); PHASE=f'{code}-submit'; form.locator('button[type="submit"]').click(); after=wait_advance(page,before); PHASE=f'{code}-local-projection'; expect(page.locator('#grcWorkspace .grc-list')).to_contain_text(needle); verify_process_projection(page,code,pid,after); return after
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch)
  ctx=browser.new_context(viewport={'width':1440,'height':950}); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
  page=ctx.new_page(); page.set_default_timeout(30000); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  PHASE='bootstrap'; page.goto(BASE+'/?view=processes',wait_until='networkidle'); expect(page.locator('#procedureHub .procedure-card')).to_have_count(7); initial=current_revision(page); assert initial==revision(page),(initial,revision(page)); no_overflow(page)
  PHASE='RN-01-write'; openp(page,'RN-01'); page.locator('.procedure-frame:visible .procedure-primary').click(); expect(page.locator('#contributionDialog')).to_be_visible(); before=current_revision(page); fill_user(page.locator('#contributionDialog textarea[name="text"]'),'Materiale end-user V2.1: aggiornamento normativo osservato e registrato senza conclusione automatica.','RN-01-material'); fill_user(page.locator('#contributionDialog textarea[name="note"]'),'RN-01 V2.1 journey material','RN-01-note'); PHASE='RN-01-submit'; page.locator('#contributionDialog button[type="submit"]').click(); expect(page.locator('#contributionDialog')).not_to_be_visible(); r1=wait_advance(page,before); expect(page.locator('#contributionList')).to_contain_text('RN-01 V2.1 journey material'); check_surface_revision(page,'#monitoringView',r1); verify_process_projection(page,'RN-01','monitoring',r1)
  PHASE='EC-01-write'; openp(page,'EC-01'); page.locator('.procedure-frame:visible .procedure-primary').click(); expect(page.locator('#incidentDialog')).to_be_visible(); before=current_revision(page); fill_user(page.locator('#incidentDialog textarea[name="originalNarrative"]'),'EC-01 V2.1 journey: evento osservato durante verifica di convergenza delle proiezioni.','EC-01-narrative'); fill_user(page.locator('#incidentDialog input[name="awarenessAt"]'),'2026-08-10T15:00','EC-01-awareness'); PHASE='EC-01-submit'; page.locator('#incidentDialog button[type="submit"]').click(); expect(page.locator('#incidentDialog')).not_to_be_visible(); r2=wait_advance(page,before); expect(page.locator('#incidentList')).to_contain_text('EC-01 V2.1 journey');
  if page.locator('#incidentWorkspace').is_visible(): page.locator('#incidentWorkspace button[aria-label="Chiudi"]').click()
  check_surface_revision(page,'#incidentsView',r2); verify_process_projection(page,'EC-01','incidents',r2)
  def ao(form): fill_user(form.locator('input[name="name"]'),'AO-01 V2.1 Inventory Object','AO-01-name'); fill_user(form.locator('input[name="owner"]'),'browser-v21','AO-01-owner')
  r3=submit_grc(page,'AO-01','objects',ao,'AO-01 V2.1 Inventory Object')
  def mc(form): fill_user(form.locator('input[name="requirementRef"]'),'MC-V21-001','MC-01-requirementRef'); fill_user(form.locator('textarea[name="requirementLabel"]'),'MC-01 V2.1 requisito di prova per convergenza della superficie.','MC-01-requirementLabel')
  r4=submit_grc(page,'MC-01','coverage',mc,'MC-V21-001')
  def ap(form): fill_user(form.locator('input[name="title"]'),'AP-01 V2.1 Action','AP-01-title'); fill_user(form.locator('textarea[name="description"]'),'Azione creata dal journey end-user V2.1.','AP-01-description')
  r5=submit_grc(page,'AP-01','actions',ap,'AP-01 V2.1 Action')
  def rc(form): fill_user(form.locator('input[name="title"]'),'RC-01 V2.1 Risk','RC-01-title'); fill_user(form.locator('textarea[name="description"]'),'Scenario di rischio registrato dal journey end-user V2.1.','RC-01-description'); select_user(form.locator('select[name="likelihood"]'),'2','RC-01-likelihood'); select_user(form.locator('select[name="impact"]'),'3','RC-01-impact')
  r6=submit_grc(page,'RC-01','risks',rc,'RC-01 V2.1 Risk')
  def ar(form): fill_user(form.locator('input[name="title"]'),'AR-01 V2.1 Assurance','AR-01-title'); fill_user(form.locator('textarea[name="requestText"]'),'Richiesta assurance preservata dal journey end-user V2.1.','AR-01-request'); fill_user(form.locator('input[name="source"]'),'browser-v21','AR-01-source')
  r7=submit_grc(page,'AR-01','assurance',ar,'AR-01 V2.1 Assurance')
  final_rev=current_revision(page); assert final_rev>=r7>r6>r5>r4>r3>r2>r1>=initial
  PHASE='home-projection'; page.locator('.service-nav [data-service="home"]').click(); check_surface_revision(page,'#homeView',final_rev); expect(page.locator('#homeView')).to_be_visible(); no_overflow(page)
  PHASE='epistemic-explore'; processes(page).click(); meta=page.locator('#epistemicMetaCard'); expect(meta).to_be_visible(); meta.locator('[data-service="epistemic"]').click(); expect(page.locator('#epistemicView')).to_be_visible(); page.wait_for_function('(r)=>Number(document.querySelector("#epistemicView")?.dataset.loadedRevision||0)>=r',arg=final_rev); assert int(page.locator('#epistemicView').get_attribute('data-loaded-revision'))>=final_rev; expect(page.locator('[data-epistemic-mode="explore"]')).to_have_attribute('aria-pressed','true'); expect(page.locator('.epistemic-level-nav')).to_contain_text('Quadro'); overview=page.locator('#epistemicModeHost').inner_text(); assert all(pid in overview for pid in PROCS.values()),overview
  PHASE='epistemic-drill'; cluster=page.locator('[data-explore-procedure="actions"]'); expect(cluster).to_be_visible(); cluster.click(); expect(page.locator('.epistemic-level-nav')).to_contain_text('Gruppi'); family=page.locator('[data-explore-family]').first; expect(family).to_be_visible(); family.click(); expect(page.locator('.epistemic-level-nav')).to_contain_text('Relazioni'); atom=page.locator('[data-explore-atom]').first; expect(atom).to_be_visible(); atom.click(); expect(page.locator('.epistemic-atom-readable')).to_be_visible(); expect(page.locator('[data-surface-context-strip]:visible')).to_contain_text('Atomo'); page.locator('[data-epistemic-level="overview"]').click(); expect(page.locator('[data-surface-context-strip]:visible')).to_contain_text('Quadro')
  PHASE='same-digest-expert-modes'; digest_before=page.locator('#epistemicPageLabel').inner_text().split('digest ')[-1]; page.locator('[data-epistemic-mode="flat"]').click(); expect(page.locator('.epistemic-table')).to_be_visible(); digest_flat=page.locator('#epistemicPageLabel').inner_text().split('digest ')[-1]; page.locator('[data-epistemic-mode="graph"]').click(); expect(page.locator('.epistemic-graph-canvas')).to_be_visible(); digest_graph=page.locator('#epistemicPageLabel').inner_text().split('digest ')[-1]; assert digest_before==digest_flat==digest_graph,(digest_before,digest_flat,digest_graph); no_overflow(page); page.screenshot(path=str(ART/'ux-v21-epistemic-explore-desktop.png'),full_page=True)
  PHASE='history-transition'; processes(page).click(); risk_card=page.locator('#procedureHub [data-process-code="RC-01"]'); risk_card.locator(':scope > footer .primary').click(); expect(page.locator('#grcView')).to_be_visible(); page.go_back(wait_until='networkidle'); expect(page.locator('#processesView')).to_be_visible(); page.go_forward(wait_until='networkidle'); expect(page.locator('#grcView')).to_be_visible()
  PHASE='mobile'; mcx=browser.new_context(viewport={'width':390,'height':844}); mcx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','epistemic')"); m=mcx.new_page(); m.goto(BASE+'/?view=epistemic',wait_until='networkidle'); expect(m.locator('#epistemicView')).to_be_visible(); m.wait_for_function('(r)=>Number(document.querySelector("#epistemicView")?.dataset.loadedRevision||0)>=r',arg=final_rev); expect(m.locator('[data-epistemic-mode="explore"]')).to_have_attribute('aria-pressed','true'); no_overflow(m); m.screenshot(path=str(ART/'ux-v21-epistemic-explore-mobile.png'),full_page=True); mcx.close()
  PHASE='reduced-motion-route'; rcx=browser.new_context(viewport={'width':1280,'height':850},reduced_motion='reduce'); rcx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')"); rp=rcx.new_page(); rp.goto(BASE+'/?view=processes',wait_until='networkidle'); ap_card=rp.locator('#procedureHub [data-process-code="AP-01"]'); ap_card.locator(':scope > footer .primary').click(); expect(rp.locator('#grcView')).to_be_visible(); no_overflow(rp); rcx.close()
  assert not errors,errors
  out={'ok':True,'profile':'2.1-procedure-journey-exploration-pre-candidate','baseRevision':initial,'finalRevision':final_rev,'sevenVisibleUiWrites':list(PROCS.keys()),'coverageEntryGrammar':'standard-library-then-requirement-disclosure','projectionConvergence':True,'surfaceRevisionStamp':True,'epistemicLoadedRevision':final_rev,'exploreLevels':['Quadro','Gruppi','Relazioni','Atomo'],'sameProjectionDigestAcrossModes':True,'history':True,'mobileOverflow':False,'reducedMotionRoute':True,'evidenceClass':'E2-server-backed-browser+seven-procedure-writes+progressive-epistemic-exploration'}; (ART/'browser-v2-1-procedure-journey.json').write_text(json.dumps(out,indent=2),encoding='utf8'); print('browser-v2-1-procedure-journey: complete',flush=True); ctx.close(); browser.close()
except BaseException as e:
 fail(e); traceback.print_exc(); raise
