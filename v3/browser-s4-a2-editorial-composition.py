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
 PHASE=f'{code}-owner-ready'; page.wait_for_function("x=>{const h=document.querySelector(x.host),a=h?.querySelector(`:scope > [data-procedure-attention-slot=\"${x.pid}\"]`),rail=h?.querySelector(':scope > .procedure-support-rail'),adv=rail?.querySelector(':scope > [data-editorial-slot=\"advanced-context\"]'),ref=rail?.querySelector(':scope > [data-editorial-slot=\"reference\"]');return !!(h&&h.offsetParent!==null&&h.dataset.editorialOwner===x.owner&&h.dataset.editorialOrderValid==='true'&&a&&adv?.dataset.editorialSlotOwner===x.owner&&ref?.dataset.editorialSlotOwner===x.owner)}",arg={'host':host,'owner':OWNER[pid],'pid':pid})
def h1_diagnostic(root):
 nodes=root.locator(':scope > .procedure-frame h1'); total=nodes.count()
 if total<1:return {'count':0,'text':0,'chain':[]}
 return nodes.first.evaluate("""e=>{const one=n=>{if(!n)return null;const s=getComputedStyle(n),r=n.getBoundingClientRect();return{tag:n.tagName,cls:String(n.className||'').slice(0,48),w:Math.round(r.width),h:Math.round(r.height),d:s.display,v:s.visibility,pos:s.position,minw:s.minWidth,maxw:s.maxWidth,width:s.width,gtc:s.gridTemplateColumns,gta:s.gridTemplateAreas}};const chain=[];let n=e;for(let i=0;i<6&&n;i++,n=n.parentElement)chain.push(one(n));return{count:e.parentElement?.querySelectorAll(':scope > h1').length||1,text:(e.textContent||'').trim().length,chain}}""")
def audit(page,code,pid,host):
 global PHASE
 open_process(page,code,pid,host)
 root=page.locator(host); frame=root.locator(':scope > .procedure-frame'); expect(frame).to_have_count(1); expect(frame).to_be_visible()
 PHASE=f'{code}-identity-canonical-h1'; visible_h1=root.locator(':scope > .procedure-frame h1:visible').count()
 if visible_h1!=1:
  d=h1_diagnostic(root); c=d.get('chain') or []; widths=[(x or {}).get('w',-1) for x in c]; cols=((c[1] or {}).get('gtc','') if len(c)>1 else '').replace(' ','_')[:46]; PHASE=f"{code}-h1-w{'-'.join(map(str,widths))}-g{cols}"[:180]
 assert visible_h1==1,(pid,'canonical h1',visible_h1,h1_diagnostic(root))
 PHASE=f'{code}-identity-legacy-orientation'; legacy=root.locator(':scope > .hero .hero-copy:visible,:scope > .grc-head > div:visible'); assert legacy.count()==0,(pid,'duplicate orientation visible',legacy.count())
 PHASE=f'{code}-identity-legacy-back'; legacy_back=root.locator(':scope > .workspace-return:visible,:scope > .grc-head > .workspace-return:visible'); assert legacy_back.count()==0,(pid,'legacy back visible',legacy_back.count())
 PHASE=f'{code}-order'; order=(root.get_attribute('data-editorial-order') or '').split('>'); assert order[:3]==['advanced-context','reference','attention'],(pid,order); assert root.get_attribute('data-editorial-owner')==OWNER[pid],(pid,'root owner',root.get_attribute('data-editorial-owner'),OWNER[pid]); assert root.get_attribute('data-editorial-order-valid')=='true',(pid,'order valid',root.get_attribute('data-editorial-order-valid'))
 slot=root.locator(f':scope > [data-procedure-attention-slot="{pid}"]'); expect(slot).to_have_count(1); rail=root.locator(':scope > .procedure-support-rail'); adv=rail.locator(':scope > [data-editorial-slot="advanced-context"]'); ref=rail.locator(':scope > [data-editorial-slot="reference"]'); expect(rail).to_have_count(1); expect(adv).to_have_count(1); expect(ref).to_have_count(1); assert frame.evaluate('(f,r)=>f.nextElementSibling===r',rail.element_handle()),f'{pid}: support rail not below header'; assert adv.evaluate('(a,r)=>a.nextElementSibling===r',ref.element_handle()),f'{pid}: reference not immediately after context in support rail'; assert frame.evaluate('(f,s)=>f.nextElementSibling===s',slot.element_handle()),f'{pid}: attention not immediately after procedure header'; assert slot.get_attribute('data-attention-slot-owner')==OWNER[pid],(pid,'attention owner',slot.get_attribute('data-attention-slot-owner'),OWNER[pid])
 direct=root.evaluate("""r=>{const out=[],push=role=>{if(role&&out.at(-1)!==role)out.push(role)},rail=r.querySelector(':scope > .procedure-support-rail');for(const n of rail?.children||[])push(n.dataset?.editorialSlot);for(const n of r.children)push(n.dataset?.editorialSlot);return out;}"""); expected=[x for x in order if x in direct]; assert direct[:len(expected)]==expected,(pid,direct,expected)
 PHASE=f'{code}-support-slots'; assert adv.get_attribute('data-editorial-slot-owner')==OWNER[pid],(pid,'advanced owner',adv.get_attribute('data-editorial-slot-owner'),OWNER[pid]); assert ref.get_attribute('data-editorial-slot-owner')==OWNER[pid],(pid,'reference owner',ref.get_attribute('data-editorial-slot-owner'),OWNER[pid])
 if pid in ['objects','coverage','actions','risks','assurance']:
  PHASE=f'{code}-grc-role-bindings'; head=root.locator(':scope > .grc-head'); body=root.locator(':scope > .grc-body'); expect(head).to_have_count(1); expect(body).to_have_count(1); assert head.get_attribute('data-editorial-slot')=='controls',(pid,'grc head role',head.get_attribute('data-editorial-slot')); assert body.get_attribute('data-editorial-slot')=='primary',(pid,'grc body role',body.get_attribute('data-editorial-slot'),OWNER[pid])
  PHASE=f'{code}-grc-nav'; nav_count=head.locator(':scope > nav').count(); assert nav_count==1,(pid,'direct GRC nav count',nav_count,head.evaluate('e=>e.outerHTML.slice(0,800)'))
 PHASE=f'{code}-post-commit-stability'; mutations=page.evaluate("""async x=>{const r=document.querySelector(x.host),seen=[];const obs=new MutationObserver(rs=>{for(const m of rs)seen.push({type:m.type,target:m.target.id||m.target.className||m.target.nodeName,attribute:m.attributeName||null});});obs.observe(r,{childList:true,attributes:true,attributeFilter:['hidden','aria-hidden']});for(const name of ['ictc:context-changed','ictc:projection-committed','ictc:surface-changed'])document.dispatchEvent(new CustomEvent(name,{detail:{surface:x.pid==='monitoring'||x.pid==='incidents'?x.pid:'grc',procedureId:x.pid,reason:'s4-a2-stability-probe'}}));await Promise.resolve();await Promise.resolve();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));obs.disconnect();return seen;}""",{'host':host,'pid':pid}); assert mutations==[],(pid,'late hierarchy mutation',mutations)
 shot=ART/f's4-a2-{pid}.png'; page.screenshot(path=str(shot),full_page=True)
 RESULTS.append({'code':code,'procedureId':pid,'owner':OWNER[pid],'declaredOrder':order,'actualRoles':direct,'lateHierarchyMutations':mutations,'screenshot':shot.name})
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=os.environ.get('ICTC_CHROMIUM') or None,args=['--no-sandbox']); ctx=browser.new_context(viewport={'width':1440,'height':1000}); ctx.add_init_script("localStorage.setItem('ictc-profile','demo')"); page=ctx.new_page()
  page.on('request',lambda r: NETWORK.append({'method':r.method,'url':r.url}) if '/api/' in r.url else None); page.on('requestfailed',lambda r: FAILURES.append({'url':r.url,'failure':r.failure})); page.on('pageerror',lambda e: PAGE_ERRORS.append(str(e)))
  PHASE='bootstrap'; page.goto(BASE,wait_until='networkidle'); page.wait_for_function("()=>document.documentElement.dataset.nativeSemanticLattice==='3.2.0'",timeout=30000)
  PHASE='identity'; ident_res=ctx.request.get(f'{BASE}/api/admin/identity',headers={'X-ICTC-Role':'admin'}); assert ident_res.ok, f'identity status {ident_res.status}'; identity=ident_res.json(); runtime_identity=identity.get('buildIdentity') or {}; build=runtime_identity.get('build') or {}; assert not EXPECTED_SHA or build.get('sha')==EXPECTED_SHA,(build,EXPECTED_SHA); assert not EXPECTED_SHA or build.get('exact') is True,build; assert not EXPECTED_SHA or build.get('dirty') is False,build
  for code,pid,host in PROCEDURES: audit(page,code,pid,host)
  PHASE='network'; writes=[x for x in NETWORK if x['method'] not in ('GET','HEAD','OPTIONS')]; assert writes==[],writes; assert FAILURES==[],FAILURES; assert PAGE_ERRORS==[],PAGE_ERRORS
  report={'ok':True,'phase':'complete','expectedBuildSha':EXPECTED_SHA or None,'runtimeIdentity':identity,'procedures':RESULTS,'networkWrites':writes,'networkFailures':FAILURES,'pageErrors':PAGE_ERRORS,'claimBoundary':'E3 exact-head server/browser DOM ordering evidence; not human usability/accessibility certification or enterprise-ready proof.'}; (ART/'browser-s4-a2-editorial-composition.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8'); print(json.dumps(report),flush=True); browser.close()
except Exception as exc:
 fail(exc); raise
