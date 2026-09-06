import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4807').rstrip('/'); EXPECTED_SHA=(os.environ.get('ICTC_EXPECT_BUILD_SHA') or '').strip().lower()
PROCEDURES=[('RN-01','monitoring','#monitoringView'),('EC-01','incidents','#incidentsView'),('AO-01','objects','#grcWorkspace'),('MC-01','coverage','#grcWorkspace'),('AP-01','actions','#grcWorkspace'),('RC-01','risks','#grcWorkspace'),('AR-01','assurance','#grcWorkspace')]
OWNER={'monitoring':'procedure-sequential-rn-ec.js','incidents':'procedure-sequential-rn-ec.js','objects':'grc-workspace-3-2.js','coverage':'grc-workspace-3-2.js','actions':'grc-workspace-3-2.js','risks':'grc-workspace-3-2.js','assurance':'grc-workspace-3-2.js'}
PHASE='init'; RESULTS=[]; NETWORK=[]; FAILURES=[]; PAGE_ERRORS=[]
def fail(exc):
 payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'expectedBuildSha':EXPECTED_SHA or None,'results':RESULTS,'network':NETWORK,'networkFailures':FAILURES,'pageErrors':PAGE_ERRORS}
 (ART/'browser-s4-a2-editorial-composition-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
 print(f'::error title=browser-s4-a2-editorial-composition::{PHASE}: {type(exc).__name__}: {exc}',flush=True)
def open_process(page,code,pid,host):
 global PHASE
 page.evaluate("()=>{for(const d of document.querySelectorAll('dialog[open]'))try{d.close()}catch{}}")
 PHASE=f'{code}-catalogue'; page.locator('.service-nav [data-service="processes"]').click(); page.wait_for_function("()=>!document.querySelector('#processesView')?.hidden")
 card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click()
 PHASE=f'{code}-owner-ready'; page.wait_for_function("x=>{const h=document.querySelector(x.host);return !!(h&&h.offsetParent!==null&&h.dataset.editorialOwner===x.owner&&h.dataset.editorialOrderValid==='true')}",arg={'host':host,'owner':OWNER[pid]})
def audit(page,code,pid,host):
 global PHASE
 open_process(page,code,pid,host)
 root=page.locator(host); frame=root.locator(':scope > .procedure-frame'); expect(frame).to_have_count(1); expect(frame).to_be_visible()
 PHASE=f'{code}-identity'; assert root.locator(':scope > .procedure-frame h1:visible').count()==1,(pid,'canonical h1'); assert root.locator(':scope > .hero .hero-copy:visible,:scope > .grc-head > div:visible').count()==0,(pid,'duplicate orientation visible'); assert root.locator(':scope > .workspace-return:visible,:scope > .grc-head > .workspace-return:visible').count()==0,(pid,'legacy back visible')
 PHASE=f'{code}-order'; order=(root.get_attribute('data-editorial-order') or '').split('>'); assert order[:3]==['attention','controls','primary'],(pid,order); assert root.get_attribute('data-editorial-owner')==OWNER[pid]; assert root.get_attribute('data-editorial-order-valid')=='true'
 slot=root.locator(f':scope > [data-procedure-attention-slot="{pid}"]'); expect(slot).to_have_count(1); assert frame.evaluate('(f,s)=>f.nextElementSibling===s',slot.element_handle()),f'{pid}: attention not immediately after compact orientation'; assert slot.get_attribute('data-attention-slot-owner')==OWNER[pid]
 direct=root.evaluate("""r=>{const out=[];for(const n of r.children){const role=n.dataset?.editorialSlot;if(role&&out.at(-1)!==role)out.push(role);}return out;}"""); expected=[x for x in order if x in direct]; assert direct[:len(expected)]==expected,(pid,direct,expected)
 PHASE=f'{code}-support-slots'; adv=root.locator(':scope > [data-editorial-slot="advanced-context"]'); ref=root.locator(':scope > [data-editorial-slot="reference"]'); expect(adv).to_have_count(1); expect(ref).to_have_count(1); assert adv.get_attribute('data-editorial-slot-owner')==OWNER[pid]; assert ref.get_attribute('data-editorial-slot-owner')==OWNER[pid]
 if pid in ['objects','coverage','actions','risks','assurance']:
  head=root.locator(':scope > .grc-head'); body=root.locator(':scope > .grc-body'); expect(head).to_have_count(1); expect(body).to_have_count(1); assert head.get_attribute('data-editorial-slot')=='controls'; assert body.get_attribute('data-editorial-slot')=='primary'; assert head.locator(':scope > nav').count()==1
 PHASE=f'{code}-post-commit-stability'; page.evaluate("""r=>{window.__s4a2=[];const obs=new MutationObserver(rs=>{for(const x of rs)window.__s4a2.push({type:x.type,target:x.target.id||x.target.className||x.target.nodeName,attribute:x.attributeName||null});});obs.observe(r,{childList:true,attributes:true,attributeFilter:['hidden','aria-hidden']});window.__s4a2obs=obs;}""",root.element_handle()); page.evaluate("p=>{for(const name of ['ictc:context-changed','ictc:projection-committed','ictc:surface-changed'])document.dispatchEvent(new CustomEvent(name,{detail:{surface:p==='monitoring'||p==='incidents'?p:'grc',procedureId:p,reason:'s4-a2-stability-probe'}}));}",pid); page.wait_for_timeout(120); mutations=page.evaluate("()=>{window.__s4a2obs?.disconnect();return window.__s4a2||[]}"); assert mutations==[],(pid,'late hierarchy mutation',mutations)
 shot=ART/f's4-a2-{pid}.png'; page.screenshot(path=str(shot),full_page=True)
 RESULTS.append({'code':code,'procedureId':pid,'owner':OWNER[pid],'declaredOrder':order,'actualRoles':direct,'lateHierarchyMutations':mutations,'screenshot':shot.name})
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=os.environ.get('ICTC_CHROMIUM') or None,args=['--no-sandbox']); ctx=browser.new_context(viewport={'width':1440,'height':1000}); page=ctx.new_page()
  page.on('request',lambda r: NETWORK.append({'method':r.method,'url':r.url}) if '/api/' in r.url else None); page.on('requestfailed',lambda r: FAILURES.append({'url':r.url,'failure':r.failure})); page.on('pageerror',lambda e: PAGE_ERRORS.append(str(e)))
  PHASE='bootstrap'; page.goto(BASE,wait_until='domcontentloaded'); page.evaluate("localStorage.setItem('ictc-profile','demo')"); page.reload(wait_until='domcontentloaded'); page.wait_for_function("()=>document.documentElement.dataset.nativeSemanticLattice==='3.2.0'",timeout=30000)
  PHASE='identity'; ident_res=ctx.request.get(f'{BASE}/api/admin/identity',headers={'X-ICTC-Role':'admin'}); assert ident_res.ok, f'identity status {ident_res.status}'; identity=ident_res.json(); build=identity.get('buildIdentity') or {}; assert not EXPECTED_SHA or build.get('sha')==EXPECTED_SHA,(build,EXPECTED_SHA); assert not EXPECTED_SHA or build.get('exact') is True,build; assert not EXPECTED_SHA or build.get('dirty') is False,build
  for code,pid,host in PROCEDURES: audit(page,code,pid,host)
  PHASE='network'; writes=[x for x in NETWORK if x['method'] not in ('GET','HEAD','OPTIONS')]; assert writes==[],writes; assert FAILURES==[],FAILURES; assert PAGE_ERRORS==[],PAGE_ERRORS
  report={'ok':True,'phase':'complete','expectedBuildSha':EXPECTED_SHA or None,'runtimeIdentity':identity,'procedures':RESULTS,'networkWrites':writes,'networkFailures':FAILURES,'pageErrors':PAGE_ERRORS,'claimBoundary':'E3 exact-head server/browser DOM ordering evidence; not human usability/accessibility certification or enterprise-ready proof.'}; (ART/'browser-s4-a2-editorial-composition.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8'); print(json.dumps(report),flush=True); browser.close()
except Exception as exc:
 fail(exc); raise
