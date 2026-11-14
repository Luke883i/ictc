import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
from browser_test_support import ensure_onboarded

ROOT = pathlib.Path(__file__).resolve().parents[2]
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
      const aria=ai.getAttribute('aria-label')||'', tooltip=ai.dataset.tooltip||'', display=style(ai).display;
      check('header-ai-hidden',!visible(ai),{display,state:ai.dataset.aiState});
      check('header-ai-no-tooltip',!aria&&!tooltip&&!ai.title,{aria,tooltip,title:ai.title});
      check('header-ai-state',['ready','key-missing','unconfigured'].includes(ai.dataset.aiState),{state:ai.dataset.aiState});
      check('header-ai-legacy-marked',ai.dataset.legacyControl==='shell-ai-status',{legacy:ai.dataset.legacyControl||''});
      check('header-role-owned-elsewhere',!!profile&&(profile.textContent||'').trim().length>0,{profile:(profile?.textContent||'').trim()});
    }
  }
  if(surface==='processes'){
    const cards=[...root.querySelectorAll('#procedureHub .procedure-card')];
    check('processes-seven-rows',cards.length===7,{count:cards.length});

    // PROCESSI-237: actual browser geometry and palette, same canonical surface.
    const hero=root.querySelector('.processes-head'),firstRow=root.querySelector('#procedureHub .procedure-card');
    if(hero&&firstRow){const h=hero.getBoundingClientRect(),r=firstRow.getBoundingClientRect();
      check('processes-hero-full-row-width',Math.abs(h.left-r.left)<=2&&Math.abs(h.right-r.right)<=2,{hero:{left:h.left,right:h.right},row:{left:r.left,right:r.right}});
    }
    const palette=[...root.querySelectorAll('.procedure-maturity-legend .procedure-maturity[data-maturity]')];
    const paletteStates=palette.map(n=>n.dataset.maturity),paletteColors=palette.map(n=>style(n).backgroundColor);
    const enabled=root.querySelector('#procedureHub')?.dataset.maturityVisible==='true';
    // R8: 4-color visual proof is opt-in only. The separate shell browser probe
    // exercises the actual authorized admin mutation and four-state palette.
    check('processes-maturity-default-off',!enabled&&paletteStates.length===0&&root.querySelectorAll('#procedureHub [data-maturity]').length===0,{enabled,states:paletteStates});
    check('processes-no-stale-maturity-colors',!enabled&&paletteColors.length===0,{colors:paletteColors});
    const context=root.querySelector('[data-compliance-context="processes"] > summary');
    const redundant=root.querySelector('[data-compliance-process-placement],[data-compliance-overview-host],[data-compliance-process-map]');
    const handoffs=[...root.querySelectorAll('#procedureHub .process-inline-handoff')];
    const details=[...root.querySelectorAll('#procedureHub .process-inline-detail > summary')];
    check('processes-single-context-present',!!context,{context:!!context});
    check('processes-parallel-grids-absent',!redundant,{redundant:redundant?.outerHTML.slice(0,160)});
    check('processes-seven-inline-handoffs',handoffs.length===7,{count:handoffs.length,whenCount:root.querySelectorAll('#procedureHub .process-inline-when').length,owner:root.querySelector('#procedureHub')?.dataset.procedureHub||'none',codes:cards.map(e=>e.dataset.processCode).join(',')});
    check('processes-seven-progressive-details',details.length===7&&details.every(x=>x.getBoundingClientRect().height>=43.5),{count:details.length,heights:details.map(x=>x.getBoundingClientRect().height)});
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
    check('admin-nine-catalogue-rows',rows.length===9,{count:rows.length});
    check('admin-seven-operational-switches',rows.filter(row=>row.querySelector('input[data-operational="true"]')).length===7,{count:rows.filter(row=>row.querySelector('input[data-operational="true"]')).length});
    check('admin-two-inert-placeholders',rows.filter(row=>row.querySelector('input[data-operational="false"]')).length===2,{count:rows.filter(row=>row.querySelector('input[data-operational="false"]')).length});
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
        page.wait_for_function('()=>document.querySelectorAll("#procedurePolicyList .procedure-policy-row").length===9')
    elif view == 'ai-settings':
        page.goto(f'{BASE}/?view=home', wait_until='networkidle')
        menu=page.locator('#stableProfileMenu'); expect(menu).to_be_visible()
        if menu.get_attribute('open') is None: menu.locator(':scope > summary').click()
        expect(page.locator('#openSettings')).to_be_hidden(); page.locator('#openAdminCenter').click(); expect(page.locator('#adminCenter')).to_be_visible()
        page.locator('#adminCenter [data-admin-nav="ai"]').click(); expect(page.locator('#adminCenter [data-admin-view="ai"]')).to_be_visible()
        provider=page.locator('#adminCenter details[data-admin-progressive="ai-provider"]'); expect(provider).to_have_count(1); assert provider.get_attribute('open') is None
        provider.locator(':scope > summary').click(); expect(page.locator('#settingsDialog[data-admin-embedded="ai"]')).to_be_visible()
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
    PHASE=f'{viewport}:coverage:scope-overlay:library'
    library=page.locator('#grcWorkspace section[data-market-library]')
    expect(library).to_have_count(1)
    expect(library).to_be_visible()
    require('library-first-plane',library.evaluate("e=>e.tagName")=='SECTION',{'tag':library.evaluate("e=>e.tagName")})
    PHASE=f'{viewport}:coverage:scope-overlay:locate'
    scope=page.locator('#grcWorkspace .market-scope-editor[data-a6-scope-popup="native-details-overlay"]:visible').first
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
        PHASE=f'{viewport}:coverage:scope-overlay:persisted-remount'
        mount(page,'coverage','grc','coverage','#grcWorkspace')
        PHASE=f'{viewport}:coverage:scope-overlay:persisted-default-scope'
        scope_filter=page.locator('#grcWorkspace [data-a6-ux4-scope="coverage"]')
        expect(scope_filter).to_be_visible()
        require('scope-default-actionable',scope_filter.input_value()=='actionable',{'actual':scope_filter.input_value()})
        card=page.locator(f'#grcWorkspace [data-framework-card="{framework_id}"]')
        PHASE=f'{viewport}:coverage:scope-overlay:persisted-show-all'
        library=page.locator('#grcWorkspace section[data-market-library]')
        expect(library).to_be_visible()
        scope_filter.select_option('all')
        require('scope-all-stays-primary',scope_filter.input_value()=='all',{'actual':scope_filter.input_value()})
        require('scope-all-keeps-library-first-plane',library.is_visible(),{'visible':library.is_visible()})
        PHASE=f'{viewport}:coverage:scope-overlay:persisted-library-first-plane'
        expect(library).to_be_visible()
        PHASE=f'{viewport}:coverage:scope-overlay:persisted-card-visible'
        expect(card).to_be_visible()
        PHASE=f'{viewport}:coverage:scope-overlay:persisted-badge'
        require('scope-save-badge-durable',card.locator('.market-scope').inner_text().strip()==expected_badge,{'expected':expected_badge,'actual':card.locator('.market-scope').inner_text().strip()})
        scope=card.locator('.market-scope-editor[data-a6-scope-popup="native-details-overlay"]')
        PHASE=f'{viewport}:coverage:scope-overlay:persisted-reopen'
        if scope.get_attribute('open') is None:
            scope.locator(':scope > summary').click()
        expect(scope).to_have_attribute('open','')
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
    open_button=page.locator('#grcWorkspace [data-open-standard-browser]:visible').first
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

def v8_native_owner_probe(page, viewport, width, surface):
    """Independent native ICTC browser proof, never synthetic-fixture evidence."""
    import hashlib
    receipts=[]
    def capture(state, root_selector, metrics):
        png=page.screenshot(path=str(ART/f'{viewport}-{surface}-v8-{state}.png'),full_page=True)
        return {
            'suite':'P4/V8-native-owner', 'surface':surface,'viewport':viewport,
            'width':width,'state':state,'url':page.url,'source':'ICTC_NATIVE_BROWSER',
            'synthetic':False,'dom':True,'cssom':True,
            'screenshotSha256':hashlib.sha256(png).hexdigest(),
            'metrics':metrics
        }
    if surface=='home':
        guide=page.locator('#homeView details[data-home-business-guide]')
        assert guide.count()==1, 'V8: missing canonical Home details owner'
        summary=guide.locator(':scope > summary')
        for should_open,key,expected in [(True,'expanded','Comprimi guida'),(False,'collapsed','Espandi guida')]:
            current=guide.get_attribute('open') is not None
            if current!=should_open:
                summary.scroll_into_view_if_needed()
                summary.focus()
                page.keyboard.press('Enter' if should_open else 'Space')
            page.wait_for_function(
                """({open,expected})=>{const d=document.querySelector('#homeView details[data-home-business-guide]');
                   const label=d?.querySelector('[data-home-guide-action]')?.textContent?.trim();
                   return !!d && d.open===open && label===expected}""",arg={'open':should_open,'expected':expected})
            label=guide.locator('[data-home-guide-action]').inner_text().strip()
            assert label==expected,('V8 Home disclosure label mismatch',expected,label)
            metrics=guide.evaluate("""d=>{
              const s=d.querySelector(':scope > summary'),r=s.getBoundingClientRect(),css=getComputedStyle(s);
              return {open:d.open,visible:css.display!=='none',height:r.height,
                label:d.querySelector('[data-home-guide-action]')?.textContent?.trim()||'',
                rootWidth:document.documentElement.scrollWidth,windowWidth:innerWidth,
                focusable:s.tabIndex>=0};
            }""")
            assert metrics['visible'] and metrics['height']>=44 and metrics['focusable'],('V8 Home access target',metrics)
            assert metrics['rootWidth']<=width+2,('V8 Home horizontal overflow',metrics)
            receipts.append(capture(key,'#homeView',metrics))
    elif surface=='processes':
        root=page.locator('#processesView')
        rows=root.locator('#procedureHub .procedure-card')
        placeholders=root.locator('#procedureHub .catalogue-placeholder')
        assert rows.count()==7,('V8 process count changed',rows.count())
        assert placeholders.count()==2,('V8 informational placeholder count changed',placeholders.count())
        detail=rows.first.locator('.process-inline-detail')
        summary=detail.locator(':scope > summary')
        for should_open,key in [(False,'collapsed'),(True,'expanded')]:
            current=detail.get_attribute('open') is not None
            if current!=should_open:
                summary.scroll_into_view_if_needed()
                summary.focus()
                page.keyboard.press('Enter')
            page.wait_for_function(
                """({open})=>{const d=document.querySelector('#processesView #procedureHub .procedure-card .process-inline-detail');
                   return !!d && d.open===open}""",arg={'open':should_open})
            metrics=root.evaluate("""r=>{
              const box=r.getBoundingClientRect(),card=r.querySelector('#procedureHub .procedure-card'),
              title=card?.querySelector('h2'),action=card?.querySelector('.procedure-primary'),
              dl=card?.querySelector('dl.process-inline-facts'),
              dd=[...(dl?.querySelectorAll('dd')||[])],
              cs=dl?getComputedStyle(dl):null;
              return {left:box.left,right:box.right,width:box.width,windowWidth:innerWidth,
                titleWidth:title?.getBoundingClientRect().width||0,
                actionWidth:action?.getBoundingClientRect().width||0,
                documentWidth:document.documentElement.scrollWidth,
                cardScrollWidth:card?.scrollWidth||0,cardClientWidth:card?.clientWidth||0,
                dlCount:dl?.querySelectorAll('dt')?.length||0,ddCount:dd.length,
                dlDisplay:cs?.display||'',open:!!card?.querySelector('details[open]')};
            }""")
            assert metrics['width']<=1122 and metrics['right']<=width+2 and metrics['left']>=-2,('V8 process width',metrics)
            assert metrics['documentWidth']<=width+2,('V8 process page overflow',metrics)
            assert metrics['cardScrollWidth']<=metrics['cardClientWidth']+2,('V8 process card overflow',metrics)
            assert metrics['titleWidth']>0 and metrics['actionWidth']>0,('V8 process action/title occlusion',metrics)
            if should_open:
                assert metrics['dlCount']==3 and metrics['ddCount']==3 and metrics['dlDisplay']=='grid',('V8 semantic definition list',metrics)
            receipts.append(capture(key,'#processesView',metrics))
    return receipts

def v9_native_ux_probe(page, viewport, width, surface):
    """Exact-product Chromium proof. No fixture or human accessibility claim."""
    import hashlib
    records=[]
    def capture(label, metrics):
        png=page.screenshot(path=str(ART/f'{viewport}-{surface}-v9-{label}.png'),full_page=True)
        records.append({
            'suite':'P4/V9-native-ux', 'surface':surface,'viewport':viewport,'width':width,
            'state':label,'source':'ICTC_NATIVE_BROWSER','synthetic':False,
            'dom':True,'cssom':True,'screenshotSha256':hashlib.sha256(png).hexdigest(),
            'metrics':metrics
        })
    if surface=='home':
        cta=page.locator('#homeView [data-onboarding-open][data-onboarding-replay]')
        assert cta.count()==1 and cta.is_visible(),('V9: Home onboarding CTA missing',cta.count())
        assert cta.inner_text().strip()=='Onboarding'
        profile_menu=page.locator('#stableProfileMenu')
        was_open=profile_menu.get_attribute('open') is not None
        if not was_open:
            profile_menu.locator(':scope > summary').click()
        profile=profile_menu.locator('[data-onboarding-replay]')
        expect(profile).to_be_visible()
        assert profile.count()==1 and profile.inner_text().strip()=='Onboarding',json.dumps(
            [{'id':'v9-profile-visible-onboarding-action',
              'detail':{'count':profile.count(),'label':profile.inner_text().strip()}}],ensure_ascii=False)
        if not was_open:
            profile_menu.locator(':scope > summary').click()
        widths=page.locator('#homeView .home-compliance-answer p').evaluate_all(
            """nodes=>nodes.map(n=>{
               const parent=n.parentElement,pc=getComputedStyle(parent);
               const contentWidth=parent.clientWidth-parseFloat(pc.paddingLeft)-parseFloat(pc.paddingRight);
               return {maxWidth:getComputedStyle(n).maxWidth,width:n.getBoundingClientRect().width,
                 contentWidth,parentWidth:parent.getBoundingClientRect().width,
                 paddingLeft:pc.paddingLeft,paddingRight:pc.paddingRight};
            })""")
        assert len(widths)>=2 and all(x['maxWidth']=='none' and x['width']>=x['contentWidth']-3 for x in widths),json.dumps(
            [{'id':'v9-home-text-not-full-content-width','detail':{'count':len(widths),'paragraphs':widths}}],ensure_ascii=False)
        cta.click()
        dialog=page.locator('#ictcOnboardingDialog')
        expect(dialog).to_be_visible()
        box=dialog.evaluate("""d=>{
           const shell=d.querySelector('.dialog-shell'),a=getComputedStyle(d),b=getComputedStyle(shell);
           return {borderRadius:parseFloat(a.borderTopLeftRadius),shellRadius:parseFloat(b.borderTopLeftRadius),
             outerWidth:d.getBoundingClientRect().width,outerHeight:d.getBoundingClientRect().height,
             overflow:a.overflow,bodyScroll:b.overflow};
        }""")
        assert box['borderRadius']>=12 and box['shellRadius']>=12 and box['outerWidth']<=width+1,('V9 dialog rounded clipping',box)
        lessons=dialog.locator('details[data-homeboarding-lesson]')
        assert lessons.count()==15,('V9: completed guide must expose 15 lessons',lessons.count())
        assert 'successivi' not in dialog.locator('.onboarding-lessons-section > p').inner_text().lower(), 'V9: stale completed-mode copy'
        first=lessons.first
        opener=first.locator(':scope > summary')
        assert first.locator('.onboarding-lesson-open').is_visible()
        opener.focus()
        page.keyboard.press('Enter')
        page.wait_for_function("""()=>!!document.querySelector('#ictcOnboardingDialog details[data-homeboarding-lesson]')?.open""")
        assert first.locator('.onboarding-lesson-close').is_visible(), 'V9: expanded lesson must signal Comprimi'
        capture('lesson-open',dict(box,lessons=15,answerParagraphs=widths))
        opener.focus()
        page.keyboard.press('Space')
        page.wait_for_function("""()=>document.querySelector('#ictcOnboardingDialog details[data-homeboarding-lesson]')?.open===false""")
        assert first.locator('.onboarding-lesson-open').is_visible(), 'V9: collapsed lesson must signal Espandi'
        capture('lesson-closed',{'lessons':15,'keyboard':True,'open':False})
        dialog.locator('footer [data-onboarding-close]').click()
        expect(dialog).not_to_be_visible()
    elif surface=='processes':
        # V8 captures the expanded detail first; compactness must measure the closed row.
        expanded=page.locator('#processesView #procedureHub details[data-process-secondary-detail][open]')
        prior_expanded=expanded.count()
        assert prior_expanded<=7,json.dumps([{'id':'v9-process-expand-state-sane','detail':{'count':prior_expanded}}])
        for _ in range(prior_expanded):
            expanded.first.locator(':scope > summary').click()
        assert expanded.count()==0,json.dumps([{'id':'v9-process-reset-closed-state','detail':{'count':expanded.count()}}])
        metric=page.locator('#processesView #procedureHub').evaluate("""hub=>{
          const rows=[...hub.querySelectorAll('.procedure-card')],placeholders=hub.querySelectorAll('.catalogue-placeholder');
          const info=rows.map(row=>{
            const d=row.querySelector(':scope > details[data-process-secondary-detail]');
            const purpose=row.querySelector(':scope > .procedure-purpose');
            const action=row.querySelector(':scope > footer .procedure-primary'),label=action?.querySelector('span');
            const summary=d?.querySelector('summary');
            return {detailDirect:!!d,insidePurpose:!!purpose?.querySelector('details'),
              handoffInsideDetail:!!d?.querySelector('.process-inline-handoff'),
              detailBelowAction:!!d&&!!action&&d.getBoundingClientRect().top>=action.getBoundingClientRect().bottom-2,
              labelOverflow:!!label&&label.scrollWidth>label.clientWidth+2,
              ellipsis:label?.style.textOverflow|| (label?getComputedStyle(label).textOverflow:''),
              detailHeight:summary?.getBoundingClientRect().height||0,
              cardHeight:row.getBoundingClientRect().height};
          });
          return {rows:rows.length,placeholders:placeholders.length,
            gridRows:getComputedStyle(hub).gridAutoRows,info};
        }""")
        def require_process(check_id,ok):
            if not ok:
                raise AssertionError(json.dumps([{'id':check_id,'detail':metric}],ensure_ascii=False))
        require_process('v9-process-seven-plus-two',metric['rows']==7 and metric['placeholders']==2)
        require_process('v9-process-detail-owner',all(x['detailDirect'] and not x['insidePurpose'] and x['handoffInsideDetail'] for x in metric['info']))
        require_process('v9-process-action-layout',all(x['detailBelowAction'] and not x['labelOverflow'] and x['ellipsis']!='ellipsis' for x in metric['info']))
        require_process('v9-process-disclosure-hit-target',all(x['detailHeight']>=43.5 for x in metric['info']))
        require_process('v9-process-compact-height',all(x['cardHeight']<= (300 if width<=390 else 210) for x in metric['info']))
        require_process('v9-process-intrinsic-grid-rows','1fr' not in metric['gridRows'])
        capture('compact-secondary-row',metric)
    elif surface=='proof':
        metric=page.locator('#proofContent').evaluate("""root=>{
          const all=[...root.querySelectorAll(':scope > details.proof-section')].filter(x=>!x.hidden);
          return {cards:all.length,items:all.map(d=>{
            const s=d.querySelector(':scope > summary'),note=s?.querySelector('small'),icon=s?.querySelector('[data-proof-chevron]');
            const span=s?.querySelector(':scope > span');
            return {hasChevron:!!icon,descriptionMaxWidth:note?getComputedStyle(note).maxWidth:null,
              noteWidth:note?.getBoundingClientRect().width||0,
              textColumnWidth:span?.getBoundingClientRect().width||0};
          })};
        }""")
        assert metric['cards']>=4 and all(x['hasChevron'] for x in metric['items']),('V9: proof expandable affordance',metric)
        assert all(x['descriptionMaxWidth'] in (None,'none') for x in metric['items']),('V9: proof text width',metric)
        assert all(x['noteWidth']>=x['textColumnWidth']-3 for x in metric['items'] if x['descriptionMaxWidth']),('V9: proof narrow card descriptions',metric)
        capture('full-width-descriptions',metric)
    return records

def fail(error):
    payload={'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc()}
    try:
        p=globals().get('page')
        if p is not None:
            payload['browserState']=p.evaluate("""()=>({
                readyState:document.readyState,route:location.pathname,
                homeVisible:(()=>{const x=document.querySelector('#homeView');return !!x&&getComputedStyle(x).display!=='none'&&x.getClientRects().length>0})(),
                composition:document.documentElement.dataset.enduserComposition||'unset',
                nativeLattice:document.documentElement.dataset.nativeSemanticLattice||'unset',
                onboardingPresent:!!document.querySelector('#ictcOnboardingDialog')
            })""")
    except Exception as diagnostic_error:payload['browserDiagnosticError']=type(diagnostic_error).__name__
    payload['pageErrorKinds']=globals().get('p4_page_error_kinds',[])[-6:]
    (ART/'error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
    print(f'::error title=uiux-beauty-p4::{PHASE}: {type(error).__name__}: {error}',flush=True)

try:
    observations=[]
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        page=browser.new_page()
        p4_page_error_kinds=[]
        page.on('pageerror',lambda error:p4_page_error_kinds.append(type(error).__name__))
        page.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
        ensure_onboarded(page,BASE,'admin')
        for viewport,width,height in VIEWPORTS:
            page.set_viewport_size({'width':width,'height':height})
            for surface,view,procedure,root in SURFACES:
                PHASE=f'{viewport}:{surface}'
                try:
                    mount(page,surface,view,procedure,root)
                except Exception as mount_error:
                    details=page.evaluate("""()=>({readyState:document.readyState,href:location.href,
                      composition:document.documentElement.dataset.enduserComposition||'unset',
                      activeView:document.querySelector('#homeView')?.getBoundingClientRect()?.toJSON?.()||null,
                      homeDisplay:document.querySelector('#homeView')?getComputedStyle(document.querySelector('#homeView')).display:null,
                      onboardingOpen:!!document.querySelector('#ictcOnboardingDialog')?.open,
                      appRoot:!!document.querySelector('#homeView'),
                      shell:!!document.querySelector('#stableProfileMenu'),
                      heading:document.querySelector('#homeView h1')?.textContent||null})""")
                    raise AssertionError(json.dumps([{'id':'p4-native-mount-diagnostic',
                        'detail':{'surface':surface,'original':str(mount_error)[:220],
                            'page':details,'pageErrors':p4_page_error_kinds[-5:]}}],ensure_ascii=False)) from mount_error
                PHASE=f'{viewport}:{surface}:js-audit'
                result=page.evaluate(JS_AUDIT,{'surface':surface,'width':width})
                failures=[x for x in result['checks'] if not x['pass']]
                result['viewport']=viewport; result['failures']=failures
                observations.append(result)
                page.screenshot(path=str(ART/f'{viewport}-{surface}.png'),full_page=True)
                if failures:
                    raise AssertionError(f'{viewport}/{surface}: '+json.dumps(failures[:6],ensure_ascii=False))
                if surface in ('home','processes'):
                    PHASE=f'{viewport}:{surface}:v8-native'
                    observations.extend(v8_native_owner_probe(page,viewport,width,surface))
                if surface in ('home','processes','proof'):
                    PHASE=f'{viewport}:{surface}:v9-native'
                    observations.extend(v9_native_ux_probe(page,viewport,width,surface))
                if surface=='coverage':
                    observations.extend(audit_coverage_overlays(page,viewport,width))
        browser.close()
    payload={'ok':True,'suite':'uiux-beauty-p4-rendered-browser','surfaceCount':len(SURFACES),'viewportCount':len(VIEWPORTS),'observations':len(observations),'viewports':[{'id':a,'width':b,'height':c} for a,b,c in VIEWPORTS],'results':observations,'limitations':'Rendered Chromium geometry/typography evidence over repository surfaces; not representative human pleasantness or assistive-technology effectiveness.'}
    (ART/'report.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(json.dumps({k:payload[k] for k in ['ok','suite','surfaceCount','viewportCount','observations','limitations']},ensure_ascii=False),flush=True)
except Exception as error:
    fail(error)
    raise
