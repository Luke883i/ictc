import json, os, pathlib, traceback, urllib.request
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'

def slug(value): return ''.join(c if c.isalnum() or c in '._-' else '-' for c in str(value or 'unknown')).strip('-')[:64] or 'unknown'
def publish_failure(error):
 token=os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN'); repo=os.environ.get('GITHUB_REPOSITORY'); sha=os.environ.get('HEAD_SHA') or os.environ.get('GITHUB_SHA')
 if not token or not repo or not sha:return
 detail=slug(f'{type(error).__name__}-{str(error).splitlines()[0] if str(error) else "error"}')[:48];payload=json.dumps({'state':'failure','context':f'ictc/browser-pr60-failure/{slug(PHASE)}/{detail}','description':f'PR60 {PHASE}: {type(error).__name__}'[:140]}).encode();request=urllib.request.Request(f'https://api.github.com/repos/{repo}/statuses/{sha}',data=payload,method='POST',headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'})
 try: urllib.request.urlopen(request,timeout=8).read()
 except Exception: pass
def fail(error):
 publish_failure(error);(ART/'browser-pr60-polish-error.json').write_text(json.dumps({'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc()},indent=2),encoding='utf8');print(f'::error title=browser-pr60-polish::{PHASE}: {type(error).__name__}: {error}',flush=True)
def no_overflow(page):
 m=page.evaluate('()=>[innerWidth,document.documentElement.scrollWidth,document.body.scrollWidth]');assert m[1]<=m[0]+1 and m[2]<=m[0]+1,m
def min_height(page,selector):
 values=page.locator(selector).evaluate_all('(nodes)=>nodes.filter(n=>n.offsetParent!==null).map(n=>n.getBoundingClientRect().height)');assert values,selector;assert min(values)>=43.5,(selector,values);return min(values)
def ready(page):
 page.wait_for_function("()=>document.documentElement.dataset.businessSurfaceConvergence==='2.7.1-compat'")
 page.wait_for_function("()=>document.documentElement.dataset.semanticComposition==='3.1.0'")
 page.wait_for_selector('#proofContent:not([hidden])')
 page.wait_for_function("()=>{const c=document.querySelector('#proofContent');return !!c?.querySelector('details.proof-section[data-information-role=\"evidence\"]')&&!!c?.querySelector('details[data-composition-detail=\"proof-reading\"]')}")
def open_rn(page):
 page.locator('.service-nav [data-service="processes"]').click();card=page.locator('#procedureHub [data-process-code="RN-01"]');expect(card).to_be_visible();card.locator(':scope > footer .primary').click();expect(page.locator('#monitoringView')).to_be_visible()

def assert_evidence_first(page):
 expect(page.locator('#proofView')).to_be_visible();expect(page.locator('#proofTitle')).to_have_text('Evidenze ICTC');expect(page.locator('.proof-semantic-qualifier')).to_have_count(0);expect(page.locator('#proofView [data-proof-tab]')).to_have_count(0)
 decisions=page.locator('#proofContent > details.proof-section[data-information-role="evidence"]');expect(decisions).to_have_count(1);expect(decisions).to_have_attribute('open','');expect(decisions.locator(':scope > summary')).to_contain_text('Decisioni e tracciabilità')
 reading=page.locator('#proofContent > details[data-composition-detail="proof-reading"]');expect(reading).to_have_count(1);assert reading.get_attribute('open') is None;expect(reading.locator(':scope > summary')).to_have_text('Criteri di lettura e sintesi tecnica');expect(page.locator('#proofMethodTitle')).to_be_hidden();min_height(page,'#proofContent > details[data-composition-detail="proof-reading"] > summary');no_overflow(page);return reading

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1280,'height':900},accept_downloads=True);ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','proof')");page=ctx.new_page();page.set_default_timeout(30000);proof_requests=[];page.on('request',lambda request: proof_requests.append(request.url) if '/api/standard-proof' in request.url else None)
  PHASE='evidence-first-view';page.goto(BASE+'/?view=proof',wait_until='networkidle');ready(page);reading=assert_evidence_first(page)
  PHASE='evidence-refresh-ownership';initial_requests=len(proof_requests);assert initial_requests>=1,proof_requests;page.evaluate("()=>{for(let i=0;i<8;i++)document.dispatchEvent(new CustomEvent('ictc:rendered'));}");page.wait_for_timeout(180);assert len(proof_requests)==initial_requests,(initial_requests,len(proof_requests),proof_requests);revision=int(page.locator('html').get_attribute('data-ictc-projection-revision') or 0);page.evaluate("r=>document.dispatchEvent(new CustomEvent('ictc:projection-committed',{detail:{revision:r,actorRole:'admin'}}))",revision+1);page.wait_for_function('(count)=>performance.getEntriesByType("resource").filter(x=>x.name.includes("/api/standard-proof")).length>=count',arg=initial_requests+1);page.wait_for_function('(r)=>Number(document.querySelector("#proofView")?.dataset.loadedRevision||0)>=r',arg=revision+1);ready(page)
  PHASE='evidence-keyboard-disclosure';reading=page.locator('#proofContent > details[data-composition-detail="proof-reading"]');summary=reading.locator(':scope > summary');summary.focus();summary.press('Enter');expect(reading).to_have_attribute('open','');expect(page.locator('#proofMethodTitle')).to_be_visible();expect(page.locator('.proof-reading-card')).to_have_count(3);summary.press(' ');expect(reading).not_to_have_attribute('open','');expect(summary).to_be_focused();summary.press('Enter');expect(reading).to_have_attribute('open','');page.screenshot(path=str(ART/'ux-pr60-evidence-desktop.png'),full_page=True)
  PHASE='evidence-download-disclosure';open_rn(page);menu=page.locator('.evidence-export-menu:visible').first;expect(menu).to_be_visible();menu_summary=menu.locator(':scope > summary');menu_summary.focus();menu_summary.press('Enter');expect(menu).to_have_attribute('open','');expect(menu.locator('[data-evidence-download]')).to_have_count(4);min_height(page,'.evidence-export-menu > summary');min_height(page,'.evidence-export-menu [data-evidence-download]')
  PHASE='evidence-downloads';downloaded=[]
  for fmt in ['pdf','xml','md','zip']:
   if menu.get_attribute('open') is None:menu_summary.click()
   with page.expect_download() as pending:menu.locator(f'[data-evidence-download="{fmt}"]').click()
   download=pending.value;assert download.suggested_filename.endswith('.'+fmt),(fmt,download.suggested_filename);downloaded.append(fmt)
  PHASE='evidence-escape';menu_summary.click();expect(menu).to_have_attribute('open','');page.keyboard.press('Escape');expect(menu).not_to_have_attribute('open','');expect(menu_summary).to_be_focused();no_overflow(page)
  PHASE='mobile-evidence';mobile_ctx=browser.new_context(viewport={'width':390,'height':844});mobile_ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','proof')");mobile=mobile_ctx.new_page();mobile.set_default_timeout(30000);mobile.goto(BASE+'/?view=proof',wait_until='networkidle');ready(mobile);mobile_reading=assert_evidence_first(mobile);mobile_reading.locator(':scope > summary').click();expect(mobile.locator('#proofMethodTitle')).to_be_visible();no_overflow(mobile);mobile.screenshot(path=str(ART/'ux-pr60-evidence-mobile.png'),full_page=True);mobile_ctx.close()
  out={'ok':True,'profile':'pr60-evidence-polish+semantic-composition-3.1','evidence':{'stableRouteHeading':'Evidenze ICTC','semanticQualifierRetired':True,'legacyTabs':0,'decisionEvidenceFirst':True,'proofMethodProgressive':True,'genericRenderRefetches':0,'projectionCommitRefresh':True},'evidenceDownloads':downloaded,'keyboard':{'progressiveDisclosure':True,'escapeReturnsFocus':True},'touchTargetsMin':44,'mobileOverflow':False,'evidenceClass':'E2-server-backed-browser; automated UI evidence, not independent human usability or AT assessment'};(ART/'browser-pr60-polish.json').write_text(json.dumps(out,indent=2),encoding='utf8');print('browser-pr60-polish: complete',flush=True);ctx.close();browser.close()
except BaseException as error:
 fail(error);traceback.print_exc();raise