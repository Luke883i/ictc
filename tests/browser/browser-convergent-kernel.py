import json, os, pathlib, re, traceback
from playwright.sync_api import expect, sync_playwright
from browser_test_support import ensure_onboarded
ROOT=pathlib.Path(__file__).resolve().parents[2]; ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'
PROCESS_IDS={'RN-01':'monitoring','EC-01':'incidents','AO-01':'objects','MC-01':'coverage','AP-01':'actions','RC-01':'risks','AR-01':'assurance'}
SURFACE={'monitoring':'monitoring','incidents':'incidents','objects':'grc','coverage':'grc','actions':'grc','risks':'grc','assurance':'grc'}
ROOT_OWNER={'monitoring':('#monitoringView','procedure-sequential-rn-ec.js'),'incidents':('#incidentsView','procedure-sequential-rn-ec.js'),'objects':('#grcWorkspace','grc-workspace-3-2.js'),'coverage':('#grcWorkspace','grc-workspace-3-2.js'),'actions':('#grcWorkspace','grc-workspace-3-2.js'),'risks':('#grcWorkspace','grc-workspace-3-2.js'),'assurance':('#grcWorkspace','grc-workspace-3-2.js')}
EXPECTED_STANDARD={'monitoring':'ISO 37301:2021','incidents':'NIST CSF 2.0','objects':'ISO 37301:2021','coverage':'NIST CSF 2.0','actions':'Site Reliability Engineering practices','risks':'NIST CSF 2.0','assurance':'GOV.UK Design System and USWDS'}
EXPECTED_STANDARD_COUNT={key:2 for key in PROCESS_IDS.values()}
PROOF_READING_ORDER='facts>decisions>trace>evidence-basis>epistemic>integrity>external>export'
def fail(e):
 p={'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};(ART/'browser-convergent-kernel-error.json').write_text(json.dumps(p,indent=2),encoding='utf8');print(f'::error title=browser-convergent-kernel::{PHASE}: {e}',flush=True)
def api(page,role,path,method='GET',body=None):
 return page.evaluate("""async ({role,path,method,body})=>{const headers={'content-type':'application/json','x-ictc-role':role};const r=await fetch(path,{method,headers,body:body==null?undefined:JSON.stringify(body)});let data=null;try{data=await r.json()}catch{}return {status:r.status,body:data};}""",{'role':role,'path':path,'method':method,'body':body})
def open_process(page,code):
 global PHASE
 page.locator('.service-nav [data-service="processes"]').click();card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible()
 pid=PROCESS_IDS[code];before=page.evaluate("()=>Number(document.documentElement.dataset.experienceCycle||0)")
 card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click()
 PHASE=f'experience-ready:{code}'
 page.wait_for_function("x=>document.documentElement.dataset.ictcSurface===x[0]&&Number(document.documentElement.dataset.experienceCycle||0)>x[1]&&!document.documentElement.dataset.ictcTransitionDirection",arg=[SURFACE[pid],before])
 root,owner=ROOT_OWNER[pid];PHASE=f'owner-ready:{code}';page.wait_for_function("x=>{const r=document.querySelector(x.root),a=r?.querySelector(`:scope > [data-procedure-attention-slot=\"${x.pid}\"]`),rail=r?.querySelector(':scope > .procedure-support-rail'),ctx=rail?.querySelector(':scope > [data-editorial-slot=\"advanced-context\"]'),ref=rail?.querySelector(':scope > [data-editorial-slot=\"reference\"]');return !!(r&&r.offsetParent!==null&&r.dataset.compositionSurface===x.pid&&r.dataset.editorialOwner===x.owner&&r.dataset.editorialOrderValid==='true'&&a&&ctx?.querySelector(`[data-procedure-anatomy=\"${x.pid}\"]`)&&ref?.querySelector(`[data-procedure-standard-applications=\"${x.pid}\"]`))}",arg={'root':root,'owner':owner,'pid':pid})
def no_horizontal_overflow(page,label):
 metric=page.evaluate('()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})');assert max(metric['html'],metric['body'])<=metric['inner']+1,(label,metric)
def proof_order(page):
 return page.evaluate("""()=>[...document.querySelector('#proofContent').children].filter(n=>!n.hidden).map(n=>n.dataset.proofReconstructionQuestion?'reconstruction':(n.classList.contains('proof-fact-strip')?'facts':(n.dataset.proofDomain||n.dataset.proofWorkspace||n.dataset.compositionDetail||null))).filter(Boolean)""")
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1365,'height':900});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  page=ctx.new_page();page.set_default_timeout(30000);page.goto(BASE+'/',wait_until='networkidle');ensure_onboarded(page,BASE,'admin')
  PHASE='bootstrap-kernel';b=api(page,'admin','/api/bootstrap');assert b['status']==200,b;data=b['body'];assert data['projectionContext']['scope']=='actor-visible';assert data['projectionContext']['asOf'];assert data['projectionContext']['transactionSelection']=='current-state';assert data['projectionContext']['historicalStateSelected'] is False;assert data['procedureRegistry']['authority']=='canonical-procedure-registry';assert len(data['procedureRegistry']['procedures'])==7;assert data['metricCatalog']['authority']=='canonical-procedure-registry.metricSpecs';assert all(x.get('drilldown') for x in data['metricCatalog']['metrics']);assert data['subjectVersions']['authority']=='subject-version-working-index';assert data['epistemic']['metaGrammar']['families']==['observed','derived','proposed','decided','attested']
  codes=list(PROCESS_IDS);seen=[];standards_seen=[];progressive_seen=[]
  for code in codes:
   PHASE=f'common-anatomy:{code}';open_process(page,code);pid=PROCESS_IDS[code]
   PHASE=f'common-anatomy-source:{code}';root=ROOT_OWNER[pid][0]
   source=page.locator(f'{root} [data-procedure-anatomy="{pid}"]');expect(source).to_have_count(1)
   assert source.get_attribute('data-r8-inspector-source')=='true',(code,'source missing')
   assert source.is_hidden(),(code,'old in-page accordion still visible')
   trigger=page.locator(f'{root} .procedure-frame [data-r8-inspector-open="{pid}"]');expect(trigger).to_be_visible()
   height_before=page.evaluate('()=>document.documentElement.scrollHeight')
   trigger.click();dialog=page.locator('#r8ProcedureInspector');expect(dialog).to_be_visible()
   assert dialog.get_attribute('data-procedure-id')==pid,(pid,dialog.get_attribute('data-procedure-id'))
   PHASE=f'common-anatomy-ready:{code}';box=dialog.locator(f'[data-procedure-anatomy="{pid}"]');expect(box).to_have_count(1);expect(box).to_be_visible()
   expected_surface=SURFACE[pid];actual_surface=page.locator('html').get_attribute('data-ictc-surface');assert actual_surface==expected_surface,(code,expected_surface,actual_surface)
   expect(box.locator('.procedure-anatomy-epistemic span')).to_have_count(5);text=box.inner_text();assert 'Contesto e pratiche applicate' in text,(pid,'missing anatomy')
   sha_match=re.search(r'\b[a-f0-9]{64}\b',text,re.I);assert not sha_match,(pid,'raw sha leaked')
   assert dialog.locator('form,input,select,textarea,[data-service],button:not([data-r8-inspector-close])').count()==0,(pid,'cloned interactive authority')
   PHASE=f'anatomy-standard-section:{code}';standard=dialog.locator(f'[data-procedure-standard-applications="{pid}"]');expect(standard).to_have_count(1);expect(standard).to_be_visible()
   expect(standard.locator(':scope > summary')).to_contain_text('Standard e pratiche applicate')
   applications=standard.locator('.procedure-standard-application');expect(applications).to_have_count(EXPECTED_STANDARD_COUNT[pid])
   assert all(applications.nth(i).get_attribute('open') is None for i in range(applications.count())),(pid,'nested details not closed')
   expect(standard).to_contain_text(EXPECTED_STANDARD[pid]);first=applications.first;summary=first.locator(':scope > summary')
   PHASE=f'anatomy-standard-outer-open:{code}';expect(standard).to_have_attribute('open','')
   PHASE=f'anatomy-standard-summary-visible:{code}';expect(summary).to_be_visible()
   PHASE=f'anatomy-standard-summary-name:{code}';expect(summary.locator('.procedure-standard-name')).not_to_be_empty()
   PHASE=f'anatomy-standard-summary-meta-cardinality:{code}';meta=summary.locator('.procedure-standard-meta');expect(meta).to_have_count(1)
   PHASE=f'anatomy-standard-summary-meta:{code}';expect(meta).to_contain_text('passaggi')
   PHASE=f'anatomy-standard-summary-activate:{code}'
   try:
    summary.click(timeout=4000)
   except Exception as click_error:
    geometry=summary.evaluate("""e=>{const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=Math.max(0,Math.min(innerHeight-1,r.top+r.height/2)),hit=document.elementFromPoint(x,y);return{summaryRect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],viewport:[innerWidth,innerHeight],hit:hit?.tagName+'#'+(hit?.id||'')+'.'+(hit?.className||''),topDialogs:[...document.querySelectorAll('dialog[open]')].map(d=>d.id),inertAncestor:e.closest('[inert]')?.tagName||null,scrollY:scrollY}}""")
    reason=('intercepted' if 'intercepts pointer events' in str(click_error) else 'unstable' if 'not stable' in str(click_error) else 'out-of-view' if 'outside of the viewport' in str(click_error) else 'no-actionable-point')
    PHASE=f'anatomy-standard-summary-activate:{code}:{reason}:hit-{str(geometry.get("hit") or "none")[:24]}'
    raise AssertionError({'message':'nested standard summary not pointer-operable','reason':reason,'geometry':geometry,'original':str(click_error)[-950:]}) from click_error
   PHASE=f'anatomy-standard-detail:{code}';expect(first).to_contain_text('Come ICTC applica');expect(first).to_contain_text('Prova:');expect(first).to_contain_text('Limite:')
   expect(first.locator('.procedure-standard-practice')).not_to_be_empty();summary.click()
   assert page.evaluate('()=>document.documentElement.scrollHeight')==height_before,(pid,'inspector changed page document height')
   page.keyboard.press('Escape');expect(dialog).not_to_be_visible();assert trigger.evaluate('e=>document.activeElement===e'),(pid,'focus not returned')
   progressive_seen.append(pid);standards_seen.append(pid);seen.append(code)
  PHASE='procedure-context-mobile-reflow';page.set_viewport_size({'width':390,'height':700});open_process(page,'RC-01')
  mobile_trigger=page.locator('#grcWorkspace .procedure-frame [data-r8-inspector-open="risks"]');expect(mobile_trigger).to_be_visible();mobile_trigger.click()
  mobile_dialog=page.locator('#r8ProcedureInspector');expect(mobile_dialog).to_be_visible()
  expect(mobile_dialog.locator('[data-procedure-standard-applications="risks"] .procedure-standard-application')).to_have_count(2)
  no_horizontal_overflow(page,'procedure-context-390');page.keyboard.press('Escape');expect(mobile_dialog).not_to_be_visible()
  PHASE='assigned-or-created';act=api(page,'admin','/api/grc/actions','POST',{'title':'Azione non assegnata kernel test','description':'scope test'});assert act['status']==201,act;action_id=act['body']['result']['id'];ub=api(page,'user','/api/bootstrap');assert ub['status']==200;visible=[x['id'] for x in ub['body']['grc']['actions']['actions']];assert action_id not in visible,(action_id,visible)
  PHASE='requirement-scope-and-control-test';obj=api(page,'admin','/api/grc/objects','POST',{'type':'control','name':'Control kernel test','owner':'local-admin','sourceAuthority':'ICTC test','externalReference':'CTRL-KERNEL-1'});assert obj['status']==201,obj;control_id=obj['body']['result']['id'];rev=api(page,'admin',f'/api/grc/objects/{control_id}/review','POST',{'decision':'active','reason':'Attivo per test bounded'});assert rev['status']==200,rev
  mapping=api(page,'admin','/api/grc/mappings','POST',{'requirementRef':'std:eu-gdpr-2016-679:art-32','targetIds':[control_id],'rationale':'Test separazione scope/mapping'});assert mapping['status']==201,mapping;mapping_id=mapping['body']['result']['id'];na=api(page,'admin',f'/api/grc/mappings/{mapping_id}/decision','POST',{'decision':'not-applicable','reason':'Fuori perimetro nel caso di test'});assert na['status']==200,na;assert na['body']['result']['requirementScope']['decision']=='not-applicable';assert na['body']['result']['mapping']['scopeDisposition']=='not-applicable'
  ct=api(page,'admin','/api/control-tests','POST',{'controlId':control_id,'outcome':'pass','method':'Verifica configurazione bounded','evidenceRefs':[f'ictc:grc-object:{control_id}'],'reason':'Test runtime'});assert ct['status']==201,ct;assert ct['body']['result']['outcome']=='pass';assert 'does not establish' in ct['body']['result']['claimBoundary']
  PHASE='subject-version-materialization';b2=api(page,'admin','/api/bootstrap');assert b2['status']==200;assert b2['body']['subjectVersions']['count']>0;assert b2['body']['controlTests']['counts']['pass']>=1;assert b2['body']['grc']['coverage']['notApplicable']>=1
  PHASE='rn-ai-off-manual-parity';ensure_onboarded(page,BASE,'user');draft=api(page,'user','/api/missions/manual-draft','POST',{'objective':'Monitoraggio manuale senza AI','cadence':168,'sourceHints':['Fonte ufficiale']});assert draft['status']==201,draft;mission_id=draft['body']['result']['id'];plan=api(page,'user',f'/api/missions/{mission_id}/manual-plan','POST',{'rationale':'Piano manuale owner scoped','queries':['aggiornamenti normativi'],'preferredSources':['Fonte ufficiale']});assert plan['status']==200,plan;assert plan['body']['result']['planSource']=='human'
  PHASE='proof-route';page.set_viewport_size({'width':1365,'height':900});proof_nav=page.locator('.service-nav [data-service="proof"]');expect(proof_nav).to_have_count(1);expect(proof_nav).to_be_visible();proof_nav.click();expect(page.locator('#proofView')).to_be_visible();expect(page.locator('#proofTitle')).to_have_text('Evidenze ICTC')
  PHASE='proof-load';proof_content=page.locator('#proofContent');proof_error=page.locator('#proofError');page.wait_for_function("()=>{const content=document.querySelector('#proofContent'),error=document.querySelector('#proofError');return !!(content&&content.offsetParent!==null)||!!(error&&error.offsetParent!==null);}");assert not proof_error.is_visible(),f'proof-load-error:{proof_error.inner_text()}';expect(proof_content).to_be_visible();page.wait_for_function("expected=>document.querySelector('#proofView')?.dataset.proofReadingOrder===expected",arg=PROOF_READING_ORDER)
  PHASE='proof-meaning-first-hierarchy';facts=page.locator('#proofContent > .proof-fact-strip');investigation=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]');trace=page.locator('#proofContent > details[data-proof-workspace="trace-reconstruction"]');decision=page.locator('#proofContent > details[data-proof-domain="decisions"]');expect(facts).to_have_count(1);expect(facts).to_be_visible();assert facts.get_attribute('data-proof-facts')=='non-evaluative';expect(investigation).to_have_count(1);expect(trace).to_have_count(1);expect(decision).to_have_count(1);expect(investigation).not_to_have_attribute('open','');expect(trace).not_to_have_attribute('open','');expect(decision).not_to_have_attribute('open','');expect(investigation.locator(':scope > summary')).to_contain_text('Reticolo epistemico');expect(trace.locator(':scope > summary')).to_contain_text('Ricostruisci un elemento di lavoro');expect(decision.locator(':scope > summary')).to_contain_text('Decisioni e tracciabilità');expected=['facts','decisions','trace-reconstruction','evidence-basis','epistemic-investigation','integrity','external','export'];order=proof_order(page);assert order==expected,order;assert page.locator('#proofContent > [data-proof-reconstruction-question]').count()==0
  PHASE='proof-idempotent-reapply';decision.evaluate('e=>e.open=true');page.evaluate("()=>{for(let i=0;i<5;i++)document.dispatchEvent(new CustomEvent('ictc:rendered',{detail:{source:'convergent-a3-idempotence'}}));}");page.wait_for_timeout(100);order2=proof_order(page);assert [x for x in order2 if x in expected]==expected,order2;expect(decision).to_have_attribute('open','');expect(investigation).not_to_have_attribute('open','');expect(trace).not_to_have_attribute('open','')
  PHASE='proof-interpretation';reading=page.locator('#proofContent > details[data-proof-workspace="interpretation"]');expect(reading).to_have_count(1);expect(reading).to_be_hidden();assert reading.get_attribute('inert') is not None;expect(reading.locator(':scope > summary b')).to_have_text('Criteri di lettura e sintesi tecnica');assert reading.get_attribute('open') is None;expect(reading.locator('.proof-reading-grid')).to_have_count(1);expect(reading.locator('#proofMethodTitle')).to_have_count(1);page.screenshot(path=str(ART/'ux-v12-convergent-evidence.png'),full_page=True)
  report={'ok':True,'releaseProfile':'1.2_market_candidate+native_semantic_lattice_3_2+semantic_workspace_closure_3_2_1+s4_a3_specialized_local_closure','commonAnatomy':seen,'standardApplications':standards_seen,'progressiveStandardApplications':progressive_seen,'procedureContextMobileReflow':True,'projectionContext':True,'sameAsReadActionScope':True,'requirementScopeSeparate':True,'controlTestSeparate':True,'subjectVersionWorkingIndex':True,'rnManualParity':True,'epistemicFamilies':['observed','derived','proposed','decided','attested'],'proofReadingOrder':PROOF_READING_ORDER,'proofOrderStableAcrossReapply':True,'proofSecondaryDefaultClosed':True,'evidenceDecisionMeaningFrontstage':True,'evidenceTechnicalPreservedHidden':True,'standardClaimBoundary':'Runtime display of declared benchmark-to-method bindings; not certification or legal applicability.','evidenceClass':'E2-browser-not-independent-human-research'};(ART/'browser-convergent-kernel.json').write_text(json.dumps(report,indent=2),encoding='utf8');print('browser-convergent-kernel: complete',flush=True);ctx.close();browser.close()
except BaseException as e: fail(e);traceback.print_exc();raise
