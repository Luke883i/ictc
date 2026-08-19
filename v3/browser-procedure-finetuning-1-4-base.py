import json, os, pathlib, traceback, urllib.request
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'
LABELS={'RN-01':'Sorveglia fonti','EC-01':'Gestisci eventi','AO-01':'Verifica inventario','MC-01':'Valuta norme e controlli','AP-01':'Gestisci remediation'}
def post_phase_failure(e):
 token=os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN'); repo=os.environ.get('GITHUB_REPOSITORY'); sha=os.environ.get('HEAD_SHA') or os.environ.get('GITHUB_SHA')
 if not token or not repo or not sha: return
 message=str(e).replace('\n',' ')[:96]
 payload=json.dumps({'state':'failure','context':f'ictc/browser-phase/procedure-finetuning-{PHASE}','description':f'{PHASE}: {message}'}).encode()
 req=urllib.request.Request(f'https://api.github.com/repos/{repo}/statuses/{sha}',data=payload,method='POST',headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'})
 try: urllib.request.urlopen(req,timeout=10).read()
 except Exception as status_error: print(f'warning: cannot publish browser phase failure: {status_error}',flush=True)
def fail(e):
 payload={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}; (ART/'browser-procedure-finetuning-1-4-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8'); post_phase_failure(e); print(f'::error title=browser-procedure-finetuning::{PHASE}: {type(e).__name__}: {e}',flush=True)
def open_process(page,code):
 page.locator('.service-nav [data-service="processes"]').click(); card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); expect(card.locator('.finetune-card-nature')).to_be_visible(); expect(card.locator('.finetune-card-decision')).to_be_visible(); button=card.locator(':scope > footer .procedure-primary'); expect(button).to_have_text(LABELS[code]); button.click(); page.wait_for_timeout(180)
def no_orphans(page,root):
 bad=page.locator(root).evaluate("r=>[...r.querySelectorAll('button,a[href],summary')].filter(n=>n.offsetParent!==null).filter(n=>!n.dataset.journeyProcess||!n.dataset.journeyStage||!n.dataset.journeyIntent||!n.dataset.journeyAuthority||!n.dataset.journeyEvidenceEffect).map(n=>n.outerHTML.slice(0,220))")
 assert not bad,(root,bad[:10])
def no_overflow(page):
 m=page.evaluate("""()=>{const w=innerWidth, visible=e=>e.offsetParent!==null||getComputedStyle(e).position==='fixed';const offenders=[...document.querySelectorAll('body *')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return{tag:e.tagName.toLowerCase(),id:e.id||'',cls:String(e.className||'').slice(0,70),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)}}).filter(x=>x.right>w+1||x.left<-1).sort((a,b)=>(b.right-w)-(a.right-w)).slice(0,4);return{width:w,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,offenders}}""")
 assert m['document']<=m['width']+1 and m['body']<=m['width']+1,m
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch); ctx=browser.new_context(viewport={'width':1440,'height':950}); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
  page=ctx.new_page(); page.set_default_timeout(30000); page.goto(BASE+'/?view=processes',wait_until='networkidle')
  PHASE='hub'; expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)
  for code,label in LABELS.items():
   c=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(c).to_be_visible(); expect(c.locator('.finetune-card-nature')).not_to_be_empty(); expect(c.locator(':scope > footer .procedure-primary')).to_have_text(label); no_orphans(page,f'#procedureHub [data-process-code="{code}"]')
  PHASE='rn'; open_process(page,'RN-01'); expect(page.locator('#monitoringView > [data-finetune-compass="monitoring"]')).to_be_visible(); no_orphans(page,'#monitoringView'); secondary=page.locator('.procedure-frame:visible [data-rn-open-scheduler]'); expect(secondary).to_have_text('Programma mining AI'); secondary.click(); expect(page.locator('#jobDialog')).to_be_visible(); expect(page.locator('#jobDialog [data-rn-source-class]')).to_have_count(4); expect(page.locator('#jobDialog')).to_contain_text('Perimetro fonte chiuso'); expect(page.locator('#jobDialog')).to_contain_text('senza dati personali'); no_orphans(page,'#jobDialog'); page.screenshot(path=str(ART/'ux-finetune-rn.png'),full_page=True); page.locator('#jobDialog [data-workbench-close="jobDialog"]').click()
  PHASE='ec'; open_process(page,'EC-01'); expect(page.locator('#incidentsView > [data-finetune-compass="incidents"]')).to_be_visible(); no_orphans(page,'#incidentsView'); page.locator('.procedure-frame:visible .procedure-primary').click(); expect(page.locator('#incidentDialog')).to_be_visible(); expect(page.locator('#incidentDialog [name="caseTitle"]')).to_be_visible(); no_orphans(page,'#incidentDialog'); page.locator('#incidentDialog button[aria-label="Chiudi"]').click(); page.screenshot(path=str(ART/'ux-finetune-ec.png'),full_page=True)
  PHASE='ao'; open_process(page,'AO-01'); expect(page.locator('#grcWorkspace > [data-finetune-compass="objects"]')).to_be_visible(); cards=page.locator('#grcWorkspace .grc-list > article.procedure-record-card'); expect(cards).to_have_count(page.locator('#grcWorkspace .grc-list > article').count()); expect(page.locator('#grcWorkspace [data-seq-ao-search]')).to_be_visible(); expect(page.locator('#grcWorkspace [data-seq-ao-filter]')).to_be_visible(); facts=cards.first.locator('.procedure-record-facts'); expect(facts).to_be_visible(); expect(facts).to_contain_text('Responsabile'); expect(facts).to_contain_text('Riesame'); expect(page.locator('#grcWorkspace .finetune-object-facts').first).to_be_hidden(); no_orphans(page,'#grcWorkspace'); page.screenshot(path=str(ART/'ux-finetune-ao.png'),full_page=True)
  PHASE='mc'; open_process(page,'MC-01'); expect(page.locator('#grcWorkspace > [data-finetune-compass="coverage"]')).to_be_visible(); expect(page.locator('#grcWorkspace [data-framework-card]')).to_have_count(21); atoms=page.locator('#grcWorkspace .finetune-concept-drilldown'); assert atoms.count()==21,atoms.count(); first=atoms.first; expect(first).to_contain_text('Comprendi i concetti'); first.locator(':scope > summary').click(); expect(first.locator('.finetune-concept-atom').first).to_be_visible(); bg=first.evaluate("e=>getComputedStyle(e).backgroundColor"); assert bg not in ('rgba(0, 0, 0, 0)','transparent'),bg; no_orphans(page,'#grcWorkspace'); page.screenshot(path=str(ART/'ux-finetune-mc.png'),full_page=True)
  PHASE='ap'; open_process(page,'AP-01'); expect(page.locator('#grcWorkspace > [data-finetune-compass="actions"]')).to_be_visible(); cards=page.locator('#grcWorkspace .grc-list > article.procedure-record-card'); assert cards.count()>0; facts=cards.first.locator('.procedure-record-facts'); expect(facts).to_contain_text('Origine'); expect(facts).to_contain_text('Prossimo'); expect(page.locator('#grcWorkspace .finetune-action-next').first).to_be_hidden(); no_orphans(page,'#grcWorkspace'); page.screenshot(path=str(ART/'ux-finetune-ap.png'),full_page=True)
  mobile=browser.new_context(viewport={'width':390,'height':844}); mobile.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')"); m=mobile.new_page(); m.goto(BASE+'/?view=processes',wait_until='networkidle')
  PHASE='mobile-hub-overflow'; no_overflow(m)
  PHASE='mobile-open-ao'; open_process(m,'AO-01')
  PHASE='mobile-ao-overflow'; no_overflow(m)
  PHASE='mobile-facts'; expect(m.locator('.procedure-record-facts').first).to_be_visible()
  PHASE='mobile-search'; expect(m.locator('[data-seq-ao-search]')).to_be_visible(); m.screenshot(path=str(ART/'ux-finetune-mobile-ao.png'),full_page=True); mobile.close()
  out={'ok':True,'profile':'procedure-finetuning-2.4-compatible','procedures':list(LABELS),'controlAnchors':'all-visible-selected-process-controls','rn':{'sourceClasses':4,'schedulerDialog':'jobDialog','closedSourceUniverse':True,'scheduledAiBoundary':True},'ec':{'singleQuestionOrientation':True,'humanCaseTitle':True},'ao':{'sharedRecordFacts':True,'searchFacet':True},'mc':{'frameworksWithConceptDrilldown':21,'opaqueDrilldown':True},'ap':{'sharedOriginAndNextFacts':True},'mobileOverflow':False,'evidenceClass':'E2 server-backed browser; not human usability, legal review or independent assurance'}; (ART/'browser-procedure-finetuning-1-4.json').write_text(json.dumps(out,indent=2),encoding='utf8'); print('browser-procedure-finetuning-2.4: complete',flush=True); ctx.close(); browser.close()
except BaseException as e:
 fail(e); traceback.print_exc(); raise
