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
  }
  if(surface==='processes'){
    const cards=[...root.querySelectorAll('#procedureHub .procedure-card')];
    check('processes-seven-rows',cards.length===7,{count:cards.length});
    for(const [i,card] of cards.entries()){
      const title=card.querySelector(':scope > h2'), purpose=card.querySelector(':scope > .procedure-purpose'), c=style(purpose);
      check(`process-${i}-title-readable`,px(title)>=16,{font:px(title),text:title?.textContent});
      check(`process-${i}-purpose-readable`,px(purpose)>=14,{font:px(purpose)});
      check(`process-${i}-purpose-natural-wrap`,c.whiteSpace==='normal'&&c.textOverflow!=='ellipsis'&&c.overflow!=='hidden',{whiteSpace:c.whiteSpace,textOverflow:c.textOverflow,overflow:c.overflow});
      check(`process-${i}-hierarchy`,px(title)>px(purpose),{title:px(title),purpose:px(purpose)});
      check(`process-${i}-contained`,card.scrollWidth<=card.clientWidth+2,{scrollWidth:card.scrollWidth,clientWidth:card.clientWidth});
    }
  }
  if(['monitoring','incidents','objects','coverage','actions','risks','assurance'].includes(surface)){
    const purpose=root.querySelector(':scope > .procedure-frame .procedure-purpose') || document.querySelector('#grcWorkspace > .procedure-frame .procedure-purpose');
    const h1=root.querySelector(':scope > .procedure-frame h1') || document.querySelector('#grcWorkspace > .procedure-frame h1');
    if(purpose){const c=style(purpose);check('procedure-purpose-readable',px(purpose)>=14,{font:px(purpose)});check('procedure-purpose-not-clipped',c.whiteSpace==='normal'&&c.textOverflow!=='ellipsis'&&c.overflow!=='hidden',{whiteSpace:c.whiteSpace,textOverflow:c.textOverflow,overflow:c.overflow});}
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
    if(lead)check('proof-lead-readable',px(lead)>=14,{font:px(lead)});
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
  }
  if(surface==='ai-settings'){
    const small=root.querySelector('.settings-section-18>summary small'), bold=root.querySelector('.settings-section-18>summary b');
    if(small)check('settings-secondary-readable',px(small)>=12.5,{font:px(small)});
    if(small&&bold)check('settings-hierarchy',px(bold)>px(small),{title:px(bold),support:px(small)});
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
        browser.close()
    payload={'ok':True,'suite':'uiux-beauty-p4-rendered-browser','surfaceCount':len(SURFACES),'viewportCount':len(VIEWPORTS),'observations':len(observations),'viewports':[{'id':a,'width':b,'height':c} for a,b,c in VIEWPORTS],'results':observations,'limitations':'Rendered Chromium geometry/typography evidence over repository surfaces; not representative human pleasantness or assistive-technology effectiveness.'}
    (ART/'report.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
    print(json.dumps({k:payload[k] for k in ['ok','suite','surfaceCount','viewportCount','observations','limitations']},ensure_ascii=False),flush=True)
except Exception as error:
    fail(error)
    raise
