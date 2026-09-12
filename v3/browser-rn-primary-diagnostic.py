import argparse, json, os, pathlib, traceback, urllib.request
from playwright.sync_api import expect, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4807').rstrip('/')
PRIMARY_SELECTOR = '#monitoringView .procedure-frame[data-procedure-frame="canonical-1-9"]:visible .procedure-primary'

def experience_cycle(page):
    return int(page.evaluate("()=>Number(document.documentElement.dataset.experienceCycle||0)"))

def wait_navigation_ready(page, surface, before):
    page.wait_for_function("x=>document.documentElement.dataset.ictcSurface===x[0]&&Number(document.documentElement.dataset.experienceCycle||0)>x[1]&&!document.documentElement.dataset.ictcTransitionDirection", arg=[surface,before])

def open_rn(page):
    page.goto(BASE + '/', wait_until='networkidle')
    page.locator('.service-nav [data-service="processes"]').click()
    card = page.locator('#procedureHub [data-process-code="RN-01"]')
    expect(card).to_be_visible()
    before = experience_cycle(page)
    card.locator(':scope > footer .primary').click()
    wait_navigation_ready(page, 'monitoring', before)
    expect(page.locator('#monitoringView')).to_be_visible()
    frame = page.locator('#monitoringView .procedure-frame[data-procedure-frame="canonical-1-9"]:visible')
    expect(frame).to_have_count(1)
    primary = frame.locator('.procedure-primary')
    expect(primary).to_have_count(1)
    expect(primary).to_be_visible()
    return primary

def hit_info(primary):
    return primary.evaluate("""el=>{const r=el.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const hit=document.elementFromPoint(x,y);const s=getComputedStyle(el);const footer=document.querySelector('#stableLegalFooter,.stable-legal-footer');const topbar=document.querySelector('.topbar');const fr=footer?.getBoundingClientRect(),tr=topbar?.getBoundingClientRect();const describe=n=>{if(!n)return null;const nr=n.getBoundingClientRect(),ns=getComputedStyle(n),button=n.closest?.('button'),summary=n.closest?.('summary'),details=n.closest?.('details');return{tag:n.tagName,id:n.id||'',className:String(n.className||''),text:String(n.textContent||'').trim().replace(/\\s+/g,' ').slice(0,80),owned:n===el||el.contains(n),footer:!!n.closest?.('#stableLegalFooter,.stable-legal-footer'),topbar:!!n.closest?.('.topbar'),frame:!!n.closest?.('.procedure-frame'),button:button?{className:String(button.className||''),procedurePrimary:button.dataset?.procedurePrimary||'',text:String(button.textContent||'').trim().replace(/\\s+/g,' ').slice(0,80)}:null,summary:summary?String(summary.textContent||'').trim().replace(/\\s+/g,' ').slice(0,80):null,details:details?String(details.className||''):null,rect:{x:nr.x,y:nr.y,width:nr.width,height:nr.height,top:nr.top,right:nr.right,bottom:nr.bottom,left:nr.left},pointerEvents:ns.pointerEvents,position:ns.position,zIndex:ns.zIndex};};const ancestors=[];for(let n=el;n;n=n.parentElement){const ns=getComputedStyle(n);ancestors.push({tag:n.tagName,id:n.id||'',className:String(n.className||''),pointerEvents:ns.pointerEvents,position:ns.position,zIndex:ns.zIndex,inert:!!(n.inert||n.hasAttribute('inert'))});if(n===document.body)break;}return {rect:{x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,right:r.right,bottom:r.bottom,left:r.left},center:{x,y},viewport:{width:innerWidth,height:innerHeight},inViewport:x>=0&&x<innerWidth&&y>=0&&y<innerHeight,connected:el.isConnected,disabled:!!el.disabled,pointerEvents:s.pointerEvents,visibility:s.visibility,display:s.display,opacity:s.opacity,transitionDirection:document.documentElement.dataset.ictcTransitionDirection||null,experienceCycle:Number(document.documentElement.dataset.experienceCycle||0),hit:describe(hit),ancestors,footerRect:fr?{top:fr.top,bottom:fr.bottom,left:fr.left,right:fr.right}:null,topbarRect:tr?{top:tr.top,bottom:tr.bottom,left:tr.left,right:tr.right}:null};}""")

def slug(value):
    return ''.join(c if c.isalnum() or c in '._-' else '-' for c in str(value or 'none'))[:54] or 'none'

def publish_hit(info):
    token=os.environ.get('GH_TOKEN',''); sha=os.environ.get('GITHUB_SHA',''); repo=os.environ.get('GITHUB_REPOSITORY','')
    if not token or len(sha)!=40 or not repo: return
    hit=info.get('hit') or {}
    raw=f"{hit.get('tag','none')}#{hit.get('id','')}.{hit.get('className','')}"
    bad_ancestor=next((a for a in info.get('ancestors',[]) if a.get('pointerEvents')=='none' or a.get('inert')),None)
    owner='out-of-viewport' if not info.get('inViewport') else raw
    text=slug(hit.get('text') or 'none')
    button=hit.get('button') or {}
    button_id=slug(button.get('procedurePrimary') or button.get('className') or 'none')
    summary=slug(hit.get('summary') or 'none')
    details=slug(hit.get('details') or 'none')
    ancestor='none' if not bad_ancestor else f"{bad_ancestor.get('tag')}#{bad_ancestor.get('id')}.{bad_ancestor.get('className')}:{bad_ancestor.get('pointerEvents')}:inert={bad_ancestor.get('inert')}"
    desc=f"hit={slug(owner)} text={text} button={button_id} summary={summary} details={details} bad={slug(ancestor)}"
    body=json.dumps({'state':'success','context':f'ictc/rn-hit-text/{text}','description':desc[:140]}).encode()
    req=urllib.request.Request(f'https://api.github.com/repos/{repo}/statuses/{sha}',data=body,method='POST',headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'})
    try: urllib.request.urlopen(req,timeout=8).read()
    except Exception as e: print(f'hit status publish failed: {e}', flush=True)

def main(mode):
    out = {'mode': mode, 'ok': False}
    with sync_playwright() as pw:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path'] = os.environ['ICTC_CHROMIUM']
        browser = pw.chromium.launch(**launch)
        ctx = browser.new_context(viewport={'width': 1440, 'height': 950})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
        page = ctx.new_page(); page.set_default_timeout(10000)
        primary = open_rn(page)
        info = hit_info(primary); out['hit'] = info
        if mode == 'hit-test':
            publish_hit(info)
            assert info['connected'] and not info['disabled'] and info['pointerEvents'] != 'none', info
            assert info['inViewport'], info
            assert info['hit'] and info['hit']['owned'], info
        elif mode == 'node-stability':
            primary.evaluate('el=>{window.__ictcRnPrimary=el}')
            page.wait_for_timeout(750)
            stable = page.evaluate("""()=>{const now=document.querySelector('#monitoringView .procedure-frame[data-procedure-frame="canonical-1-9"] .procedure-primary');return !!window.__ictcRnPrimary&&window.__ictcRnPrimary.isConnected&&window.__ictcRnPrimary===now}""")
            out['stableAfter750ms'] = stable
            assert stable, {'before': info, 'after': hit_info(page.locator(PRIMARY_SELECTOR))}
        elif mode == 'trial-click':
            primary.click(trial=True, timeout=5000)
        elif mode == 'dom-dispatch':
            primary.evaluate('el=>el.click()')
            expect(page.locator('#contributionDialog')).to_be_visible(timeout=5000)
            out['dialogOpen'] = page.locator('#contributionDialog').evaluate('d=>d.open')
        elif mode == 'browser-click':
            primary.click(timeout=5000)
            expect(page.locator('#contributionDialog')).to_be_visible(timeout=5000)
            out['dialogOpen'] = page.locator('#contributionDialog').evaluate('d=>d.open')
        else:
            raise AssertionError(mode)
        out['ok'] = True
        ctx.close(); browser.close()
    return out

if __name__ == '__main__':
    modes = ['hit-test','node-stability','trial-click','dom-dispatch','browser-click']
    p = argparse.ArgumentParser(); p.add_argument('--mode', required=True, choices=modes); args = p.parse_args()
    path = ART / f'rn-primary-{args.mode}.json'
    try:
        result = main(args.mode); path.write_text(json.dumps(result, indent=2), encoding='utf8'); print(json.dumps(result), flush=True)
    except BaseException as e:
        payload = {'mode': args.mode, 'ok': False, 'type': type(e).__name__, 'message': str(e), 'traceback': traceback.format_exc()}
        path.write_text(json.dumps(payload, indent=2), encoding='utf8'); print(f'::error title=rn-primary-{args.mode}::{type(e).__name__}: {e}', flush=True); raise
