import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts' / 'uiux-beauty-p4'
ART.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
PHASE = 'init'
VIEWPORTS = [
    ('desktop', 1440, 1000),
    ('tablet', 820, 980),
    ('mobile', 390, 844),
    ('narrow', 320, 780),
]
SURFACES = [
    ('home', 'home', None, '#homeView'),
    ('processes', 'processes', None, '#processesView'),
    ('monitoring', 'monitoring', None, '#monitoringView'),
    ('incidents', 'incidents', None, '#incidentsView'),
    ('objects', 'grc', 'objects', '#grcWorkspace'),
    ('coverage', 'grc', 'coverage', '#grcWorkspace'),
    ('actions', 'grc', 'actions', '#grcWorkspace'),
    ('risks', 'grc', 'risks', '#grcWorkspace'),
    ('assurance', 'grc', 'assurance', '#grcWorkspace'),
    ('proof', 'proof', None, '#proofView'),
    ('epistemic', 'epistemic', None, '#epistemicView'),
    ('admin', 'admin', None, '#adminCenter'),
    ('ai-settings', 'ai-settings', None, '#settingsDialog'),
]

JS_AUDIT = r'''({surface,width}) => {
  const px = value => Number.parseFloat(getComputedStyle(value).fontSize || '0');
  const style = node => node ? getComputedStyle(node) : null;
  const visible = node => !!node && style(node).display !== 'none' && style(node).visibility !== 'hidden' && node.getClientRects().length > 0;
  const result = {surface,width,checks:[],metrics:{}};
  const check = (id, pass, detail={}) => result.checks.push({id,pass:Boolean(pass),detail});
  const uncapped = (id,node) => {
    if(!node) return;
    const c=style(node);
    check(id,c.maxWidth==='none',{maxWidth:c.maxWidth,width:node.getBoundingClientRect().width,text:(node.textContent||'').trim().slice(0,90)});
  };
  check('global-no-horizontal-overflow', document.documentElement.scrollWidth <= innerWidth + 2 && document.body.scrollWidth <= innerWidth + 2, {html:document.documentElement.scrollWidth,body:document.body.scrollWidth,innerWidth});

  const roots = {
    home:'#homeView',processes:'#processesView',monitoring:'#monitoringView',incidents:'#incidentsView',
    objects:'#grcWorkspace',coverage:'#grcWorkspace',actions:'#grcWorkspace',risks:'#grcWorkspace',assurance:'#grcWorkspace',
    proof:'#proofView',epistemic:'#epistemicView',admin:'#adminCenter','ai-settings':'#settingsDialog'
  };
  const root = document.querySelector(roots[surface]);
  check('root-visible', visible(root), {selector:roots[surface]});
  if (!root) return result;

  const canonicalText = [...root.querySelectorAll('h1,h2,h3,p,small,b,span')].filter(visible);
  const accidentalEllipsis = canonicalText.filter(node => {
    const c=style(node), text=(node.textContent||'').trim();
    if(text.length < 28) return false;
    const purposeful = node.matches('.home-priority-label,.home-priority-reason,#runtimeStatus');
    return !purposeful && c.textOverflow === 'ellipsis' && (node.scrollWidth > node.clientWidth + 1 || c.whiteSpace === 'nowrap');
  });
  check('no-unexpected-text-ellipsis', accidentalEllipsis.length===0, {examples:accidentalEllipsis.slice(0,4).map(n=>(n.textContent||'').trim().slice(0,80))});

  if(surface==='home'){
    const summary=root.querySelector('#homeSummary'), title=root.querySelector('#homeTitle');
    check('home-summary-readable', px(summary)>=15, {font:px(summary)});
    check('home-hierarchy', px(title)>px(summary), {title:px(title),summary:px(summary)});
    check('home-summary-measure', summary.getBoundingClientRect().width >= Math.min(520, root.getBoundingClientRect().width*.62) || width<720, {summaryWidth:summary.getBoundingClientRect().width});
    uncapped('home-summary-no-artificial-cap',summary);
    const ai=document.querySelector('#runtimeStatus'), profile=document.querySelector('#stableProfileMenu summary');
    if(ai){
      const a=style(ai), box=ai.getBoundingClientRect(), aria=ai.getAttribute('aria-label')||'', tooltip=ai.dataset.tooltip||'';
      check('header-ai-icon-only',(ai.innerText||'').trim()===''&&!!ai.querySelector('svg.runtime-status-icon'),{text:(ai.innerText||'').trim(),state:ai.dataset.aiState});
      check('header-ai-tooltip',aria.startsWith('AI ')&&tooltip===aria&&ai.title===aria,{aria,tooltip,title:ai.title});
      check('header-ai-state',['ready','key-missing','unconfigured'].includes(ai.dataset.aiState),{state:ai.dataset.aiState});
      check('header-ai-compact',box.width<=44&&box.height>=36&&a.display!=='none',{width:box.width,height:box.height,display:a.display});
      check('header-role-owned-elsewhere',!!profile&&(profile.textContent||'').trim().length>0,{profile:(profile?.textContent||'').trim()});
    }
  }
  if(surface==='processes'){
    const cards=[...root.querySelectorAll('#procedureHub .procedure-card')];
    check('processes-seven-rows',cards.length===7,{count:cards.length});
    uncapped('processes-lead-no-artificial-cap',root.querySelector('.processes-head p'));
    for(const [i,card] of cards.entries()){
      const title=card.querySelector(':scope > h2'), purpose=card.querySelector(':scope > .procedure-purpose'), c=style(purpose);
      check(`process-${i}-title-readable`,px(title)>=16,{font:px(title),text:title?.textContent});
      check(`process-${i}-purpose-readable`,px(purpose)>=14,{font:px(purpose)});
      check(`process-${i}-purpose-natural-wrap`,c.whiteSpace==='normal'&&c.textOverflow!=='ellipsis'&&c.overflow!=='hidden',{whiteSpace:c.whiteSpace,textOverflow:c.textOverflow,overflow:c.overflow});
      check(`process-${i}-hierarchy`,px(title)>px(purpose),{title:px(title),purpose:px(purpose)});
      check(`process-${i}-contained`,card.scrollWidth<=card.clientWidth+2,{scrollWidth:card.scrollWidth,clientWidth:card.clientWidth});
    }
    const actions=cards.map(card=>card.querySelector(':scope > footer .procedure-primary,:scope > footer .primary')).filter(Boolean);
    check('process-actions-seven',actions.length===7,{count:actions.length});
    if(actions.length===7){
      const rects=actions.map(node=>node.getBoundingClientRect()), widths=rects.map(r=>r.width), heights=rects.map(r=>r.height);
      check('process-actions-equal-width',Math.max(...widths)-Math.min(...widths)<=1.5,{widths});
      check('process-actions-equal-height',Math.max(...heights)-Math.min(...heights)<=1.5,{heights});
      check('process-actions-centered',actions.every(node=>{const c=style(node);return c.textAlign==='center'&&['center','normal'].includes(c.justifyContent)}),{styles:actions.map(node=>({textAlign:style(node).textAlign,justifyContent:style(node).justifyContent}))});
    }
  }
  if(['monitoring','incidents','objects','coverage','actions','risks','assurance'].includes(surface)){
    const purpose=root.querySelector(':scope > .procedure-frame .procedure-purpose') || document.querySelector('#grcWorkspace > .procedure-frame .procedure-purpose');
    const h1=root.querySelector(':scope > .procedure-frame h1') || document.querySelector('#grcWorkspace > .procedure-frame h1');
    if(purpose){const c=style(purpose);check('procedure-purpose-readable',px(purpose)>=14,{font:px(purpose)});check('procedure-purpose-not-clipped',c.whiteSpace==='normal'&&c.textOverflow!=='ellipsis'&&c.overflow!=='hidden',{whiteSpace:c.whiteSpace,textOverflow:c.textOverflow,overflow:c.overflow});uncapped('procedure-purpose-no-artificial-cap',purpose);}
    if(h1&&purpose)check('procedure-heading-hierarchy',px(h1)>px(purpose),{heading:px(h1),purpose:px(purpose)});
  }
  if(['objects','coverage','actions','risks','assurance'].includes(surface)){
    const record=root.querySelector('.grc-list>article.p2-record-row');
    if(record){
      const badge=record.querySelector(':scope > header > .status-pill'), title=record.querySelector(':scope > header > h3'), meta=record.querySelector(':scope > header > small');
      if(badge){const c=style(badge);check('status-readable',px(badge)>=12.4&&Number(c.opacity)>=.99&&c.textTransform==='none',{font:px(badge),opacity:c.opacity,textTransform:c.textTransform});}
      if(meta)check('record-meta-readable',px(meta)>=12.4,{font:px(meta)});
      if(width>=720&&badge&&title){const b=badge.getBoundingClientRect(),t=title.getBoundingClientRect(),delta=Math.abs((b.top+b.height/2)-(t.top+t.height/2));check('status-title-alignment',delta<=8,{delta,badgeTop:b.top,titleTop:t.top});}
      check('record-contained',record.scrollWidth<=record.clientWidth+2,{scrollWidth:record.scrollWidth,clientWidth:record.clientWidth});
    }
  }
  if(surface==='proof'){
    const lead=root.querySelector('.proof-head #proofTitle + p'), small=root.querySelector('#proofContent>details.proof-section>summary small');
    if(lead){check('proof-lead-readable',px(lead)>=14,{font:px(lead)});uncapped('proof-lead-no-artificial-cap',lead);}
    if(small)check('proof-secondary-readable',px(small)>=12.5,{font:px(small)});
  }
  if(surface==='epistemic'){
    const purpose=root.querySelector('.procedure-purpose span')||root.querySelector('.procedure-purpose');
    if(purpose)check('epistemic-purpose-readable',px(purpose)>=14,{font:px(purpose)});
  }
  if(surface==='admin'){
    const rows=[...root.querySelectorAll('.procedure-policy-row')],small=rows[0]?.querySelector('small'),bold=rows[0]?.querySelector('b');
    check('admin-seven-procedure-rows',rows.length===7,{count:rows.length});
    if(small)check('admin-secondary-readable',px(small)>=12.4,{font:px(small)});
    if(small&&bold)check('admin-hierarchy',px(bold)>px(small),{title:px(bold),support:px(small)});
    check('admin-policy-canonical-title',(root.querySelector('#procedureAdminPanel .procedure-admin-head h3')?.textContent||'').trim()==='Disponibilità operativa dei processi',{text:root.querySelector('#procedureAdminPanel .procedure-admin-head h3')?.textContent});
    check('admin-policy-canonical-cta',(root.querySelector('#procedurePolicyForm button[type="submit"]')?.textContent||'').trim()==='Salva disponibilità operativa',{text:root.querySelector('#procedurePolicyForm button[type="submit"]')?.textContent});
    if(width>=800&&rows.length){const heights=rows.map(row=>row.getBoundingClientRect().height);check('admin-policy-compact-rows',Math.max(...heights)<=78,{heights});}
  }
  if(surface==='ai-settings'){
    const small=root.querySelector('.settings-section-18>summary small'), bold=root.querySelector('.settings-section-18>summary b');
    if(small)check('settings-secondary-readable',px(small)>=12.5,{font:px(small)});
    if(small&&bold)check('settings-hierarchy',px(bold)>px(small),{title:px(bold),support:px(small)});
    uncapped('settings-header-no-artificial-cap',root.querySelector('.dialog-shell>header p'));
  }
  return result;
}'''

def mount(page, surface, view, procedure, root):
    global PHASE
    PHASE=f'mount:{surface}'
    if view == 'grc':
        page.goto(f'{BASE}/?view=grc&procedure={procedure}', wait_until='networkidle')
        expect(page.locator('#grcView')).to_be_visible()
        page.wait_for_function('p=>document.querySelector("#grcWorkspace")?.dataset.compositionSurface===p', arg=procedure)
    elif view == 'admin':
        page.goto(f'{BASE}/?view=home', wait_until='networkidle')
        menu=page.locator('#stableProfileMenu'); expect(menu).to_be_visible()
        if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()
        page.locator('#openAdminCenter').click(); expect(page.locator('#adminCenter')).to_be_visible()
        page.wait_for_function('()=>document.querySelectorAll("#procedurePolicyList .procedure-policy-row").length===7')
    elif view == 'ai-settings':
        page.goto(f'{BASE}/?view=home', wait_until='networkidle')
        menu=page.locator('#stableProfileMenu'); expect(menu).to_be_visible()
        if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()
        page.locator('#openSettings').click(); expect(page.locator('#settingsDialog')).to_be_visible()
        page.wait_for_function('()=>document.querySelector("#settingsForm")?.dataset.settingsStructure18==="true"')
    elif view == 'epistemic':
        page.goto(f'{BASE}/?view=proof', wait_until='networkidle'); expect(page.locator('#proofView')).to_be_visible()
        detail=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]'); expect(detail).to_have_count(1)
        if detail.get_attribute('open') is None: detail.locator(':scope > summary').click()
        detail.locator('[data-service="epistemic"]').click(); expect(page.locator('#epistemicView')).to_be_visible()
    else:
        page.goto(f'{BASE}/?view={view}', wait_until='networkidle'); expect(page.locator(root)).to_be_visible()
    page.wait_for_function('()=>document.documentElement.dataset.enduserComposition==="p2"')

def audit_coverage_overlays(page, viewport, width):
    global PHASE
    results=[]
    def require(check_id, condition, detail):
        if not condition:
            raise AssertionError(json.dumps([{'id':check_id,'detail':detail}],ensure_ascii=False,default=str))
    PHASE=f'{viewport}:coverage:scope-overlay'
    PHASE=f'{viewport}:coverage:scope-overlay:locate'
    scope=page.locator('#grcWorkspace .market-scope-editor[data-a6-scope-popup="native-details-overlay"]').first
    expect(scope).to_be_visible()
    if scope.get_attribute('open') is None:
        PHASE=f'{viewport}:coverage:scope-overlay:open'
        scope.locator(':scope > summary').click()
    PHASE=f'{viewport}:coverage:scope-overlay:opened'
    expect(scope).to_have_attribute('open','')
    scope_metrics=scope.evaluate("""node=>{const c=getComputedStyle(node),summary=node.querySelector(':scope > summary'),save=node.querySelector('[data-standard-scope]'),b=getComputedStyle(save),before=getComputedStyle(summary,'::before');return{background:c.backgroundColor,opacity:c.opacity,position:c.position,saveBackground:b.backgroundColor,saveTextAlign:b.textAlign,saveWidth:save.getBoundingClientRect().width,summaryBefore:before.content,summaryText:(summary.innerText||'').trim(),summaryAria:summary.getAttribute('aria-label')||'',summaryWidth:summary.getBoundingClientRect().width};}""")
    require('scope-overlay-opacity',scope_metrics['opacity']=='1',scope_metrics)
    require('scope-overlay-opaque',scope_metrics['background'] not in ('transparent','rgba(0, 0, 0, 0)'),scope_metrics)
    require('scope-overlay-fixed',scope_metrics['position']=='fixed',scope_metrics)
    require('scope-save-centered',scope_metrics['saveTextAlign']=='center',scope_metrics)
    require('scope-save-distinct',scope_metrics['saveBackground']!=scope_metrics['background'],scope_metrics)
    require('scope-back-icon-visible','←' in scope_metrics['summaryBefore'],scope_metrics)
    require('scope-back-copy',scope_metrics['summaryText']=='Indietro senza salvare',scope_metrics)
    require('scope-back-accessible-boundary','non salva' in scope_metrics['summaryAria'],scope_metrics)
    results.append({'oracle':'scope-overlay-opaque-explicit-save-cancel','viewport':viewport,'metrics':scope_metrics})

    if viewport=='desktop':
        card=scope.locator('xpath=ancestor::*[@data-framework-card][1]')
        framework_id=card.get_attribute('data-framework-card')
        badge_before=card.locator('.market-scope').inner_text().strip()
        decision='reference' if badge_before!='Riferimento' else 'tracked'
        expected_badge='Riferimento' if decision=='reference' else 'Tracciato'
        reason='P4 PR164: scelta esplicita persistita; il ritorno senza salvataggio non scrive.'
        card.locator('[data-standard-scope-decision]').select_option(decision)
        card.locator('[data-standard-scope-reason]').fill(reason)
        rev_before=int(page.locator('html').get_attribute('data-ictc-projection-revision') or 0)
        PHASE=f'{viewport}:coverage:scope-overlay:cancel-close'
        scope.locator(':scope > summary').click()
        expect(scope).not_to_have_attribute('open','')
        page.wait_for_timeout(120)
        rev_after_cancel=int(page.locator('html').get_attribute('data-ictc-projection-revision') or 0)
        require('scope-cancel-no-write',rev_after_cancel==rev_before,{'before':rev_before,'after':rev_after_cancel})

        PHASE=f'{viewport}:coverage:scope-overlay:cancel-reload'
        page.reload(wait_until='networkidle')
        PHASE=f'{viewport}:coverage:scope-overlay:cancel-rehydrate'
        page.wait_for_function('()=>document.documentElement.dataset.enduserComposition==="p2"&&document.querySelector("#grcWorkspace")?.dataset.compositionSurface==="coverage"')
        card=page.locator(f'#grcWorkspace [data-framework-card="{framework_id}"]')
        expect(card).to_be_visible()
        require('scope-cancel-readback-unchanged',card.locator('.market-scope').inner_text().strip()==badge_before,{'before':badge_before,'after':card.locator('.market-scope').inner_text().strip()})

        scope=card.locator('.market-scope-editor[data-a6-scope-popup="native-details-overlay"]')
        PHASE=f'{viewport}:coverage:scope-overlay:save-open'
        scope.locator(':scope > summary').click()
        expect(scope).to_have_attribute('open','')
        PHASE=f'{viewport}:coverage:scope-overlay:save-edit'
        scope.locator('[data-standard-scope-decision]').select_option(decision)
        scope.locator('[data-standard-scope-reason]').fill(reason)
        rev_before_save=int(page.locator('html').get_attribute('data-ictc-projection-revision') or 0)
        PHASE=f'{viewport}:coverage:scope-overlay:save-submit'
        scope.locator('[data-standard-scope]').click()
        PHASE=f'{viewport}:coverage:scope-overlay:save-revision'
        page.wait_for_function('(old)=>Number(document.documentElement.dataset.ictcProjectionRevision||0)>old',arg=rev_before_save)
        PHASE=f'{viewport}:coverage:scope-overlay:save-badge-readback'
        page.wait_for_function('args=>{const el=document.querySelector("[data-framework-card=\\"" + args[0] + "\\"] .market-scope");return (el?.textContent||"").trim()===args[1]}',arg=[framework_id,expected_badge])
        card=page.locator(f'#grcWorkspace [data-framework-card="{framework_id}"]')
        scope=card.locator('.market-scope-editor[data-a6-scope-popup="native-details-overlay"]')
        PHASE=f'{viewport}:coverage:scope-overlay:persisted-reopen'
        for _ in range(3):
            if scope.get_attribute('open') is not None:
                break
            scope.locator(':scope > summary').click()
            page.wait_for_timeout(80)
        require('scope-reopen-after-save',scope.get_attribute('open') is not None,{'framework':framework_id,'open':scope.get_attribute('open')})
        PHASE=f'{viewport}:coverage:scope-overlay:persisted-decision-readback'
        page.wait_for_function('args=>document.querySelector("[data-framework-card=\\""+args[0]+"\\"] [data-standard-scope-decision]")?.value===args[1]',arg=[framework_id,decision])
        require('scope-save-decision-readback',scope.locator('[data-standard-scope-decision]').input_value()==decision,{'expected':decision,'actual':scope.locator('[data-standard-scope-decision]').input_value()})
        PHASE=f'{viewport}:coverage:scope-overlay:persisted-reason-readback'
        page.wait_for_function('args=>document.querySelector("[data-framework-card=\\""+args[0]+"\\"] [data-standard-scope-reason]")?.value===args[1]',arg=[framework_id,reason])
        require('scope-save-reason-readback',scope.locator('[data-standard-scope-reason]').input_value()==reason,{'expected':reason,'actual':scope.locator('[data-standard-scope-reason]').input_value()})
        scope.locator(':scope > summary').click()
        expect(scope).not_to_have_attribute('open','')
        results.append({'oracle':'scope-cancel-no-write-save-readback','viewport':viewport,'framework':framework_id,'cancelRevisionStable':True,'savedDecision':decision,'readback':True})
    else:
        scope.locator(':scope > summary').click()
        expect(scope).not_to_have_attribute('open','')

    PHASE=f'{viewport}:coverage:standard-browser:locate'
    open_button=page.locator('#grcWorkspace [data-open-standard-browser]').first
    expect(open_button).to_be_visible()
    PHASE=f'{viewport}:coverage:standard-browser:open'
    open_button.click()
    dialog=page.locator('#standardBrowserDialog')
    expect(dialog).to_be_visible()
    browser_metrics=dialog.evaluate("""node=>{const nav=node.querySelector('.standard-node-list'),detail=node.querySelector('.standard-node-detail'),selected=node.querySelector('.standard-node-select[aria-current="true"]'),n=getComputedStyle(nav),d=getComputedStyle(detail),sel=selected?getComputedStyle(selected):null;return{dialogWidth:node.getBoundingClientRect().width,navWidth:nav.getBoundingClientRect().width,detailWidth:detail.getBoundingClientRect().width,navBackground:n.backgroundColor,detailBackground:d.backgroundColor,selectedBackground:sel?.backgroundColor||'',nodeCount:node.querySelectorAll('.standard-node-select').length};}""")
    require('standard-browser-has-index',browser_metrics['nodeCount']>0,browser_metrics)
    require('standard-browser-index-opaque',browser_metrics['navBackground'] not in ('transparent','rgba(0, 0, 0, 0)'),browser_metrics)
    require('standard-browser-detail-opaque',browser_metrics['detailBackground'] not in ('transparent','rgba(0, 0, 0, 0)'),browser_metrics)
    require('standard-browser-selection-visible',browser_metrics['selectedBackground'] not in ('','transparent','rgba(0, 0, 0, 0)'),browser_metrics)
    if width>=1000:
        require('standard-browser-desktop-width',browser_metrics['dialogWidth']>=900,browser_metrics)
        require('standard-browser-detail-dominates-index',browser_metrics['detailWidth']>browser_metrics['navWidth'],browser_metrics)
    results.append({'oracle':'standard-browser-index-detail-legibility','viewport':viewport,'metrics':browser_metrics})
    dialog.locator('button[aria-label="Chiudi"]').click()
    expect(dialog).not_to_be_visible()
    return results

def fail(error):
    payload={'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc()}
    (ART/'error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
    print(f'::error title=uiux-beauty-p4::{PHASE}: {type(error).__name__}: {error}',flush=True)

try:
    observations=[]
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        page=browser.new_page()
        for viewport,width,height in VIEWPORTS:
            page.set_viewport_size({'width':width,'height':height})
            for surface,view,procedure,root in SURFACES:
                PHASE=f'{viewport}:{surface}'
                mount(page,surface,view,procedure,root)
                result=page.evaluate(JS_AUDIT,{'surface':surface,'width':width})
                failures=[x for x in result['checks'] if not x['pass']]
                result['viewport']=viewport; result['failures']=failures
                observations.append(result)
                page.screenshot(path=str(ART/f'{viewport}-{surface}.png'),full_page=True)
                if failures:
                    raise AssertionError(f'{viewport}/{surface}: '+json.dumps(failures[:6],ensure_ascii=False))
                if surface=='coverage':
                    observations.extend(audit_coverage_overlays(page,viewport,width))
        browser.close()
    payload={'ok':True,'suite':'uiux-beauty-p4-rendered-browser','surfaceCount':len(SURFACES),'viewportCount':len(VIEWPORTS),'observations':len(observations),'viewports':[{'id':a,'width':b,'height':c} for a,b,c in VIEWPORTS],'results':observations,'limitations':'Rendered Chromium geometry/typography evidence over repository surfaces; not representative human pleasantness or assistive-technology effectiveness.'}
    (ART/'report.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(json.dumps({k:payload[k] for k in ['ok','suite','surfaceCount','viewportCount','observations','limitations']},ensure_ascii=False),flush=True)
except Exception as error:
    fail(error)
    raise
