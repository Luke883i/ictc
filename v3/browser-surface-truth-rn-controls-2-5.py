import json, os, pathlib, traceback, urllib.request
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')

def slug(value):
 return ''.join(c if c.isalnum() or c in '._-' else '-' for c in str(value or 'unknown')).strip('-')[:72] or 'unknown'

def publish(hint):
 token=os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN'); repo=os.environ.get('GITHUB_REPOSITORY'); sha=os.environ.get('HEAD_SHA') or os.environ.get('GITHUB_SHA')
 if not token or not repo or not sha:return
 body=json.dumps({'state':'failure','context':f'ictc/browser-rn-a11y/{slug(hint)}','description':f'RN visible unnamed control: {hint}'[:140]}).encode()
 req=urllib.request.Request(f'https://api.github.com/repos/{repo}/statuses/{sha}',data=body,method='POST',headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'})
 try:urllib.request.urlopen(req,timeout=8).read()
 except Exception:pass

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
  page=ctx.new_page();page.set_default_timeout(30000);page.goto(BASE+'/?view=processes',wait_until='networkidle')
  card=page.locator('#procedureHub [data-process-code="RN-01"]');expect(card).to_be_visible();card.locator(':scope > footer .procedure-primary,:scope > footer .primary').first.click();expect(page.locator('#monitoringView')).to_be_visible();page.wait_for_timeout(180)
  bad=page.locator('#monitoringView').evaluate("""root=>{const vis=e=>{const s=getComputedStyle(e);return !e.closest('[hidden]')&&s.display!=='none'&&s.visibility!=='hidden'&&e.getClientRects().length>0};const named=e=>{if((e.innerText||'').trim()||e.getAttribute('aria-label')||e.getAttribute('aria-labelledby'))return true;if(['INPUT','SELECT','TEXTAREA'].includes(e.tagName)){if(e.id&&document.querySelector(`label[for="${CSS.escape(e.id)}"]`))return true;if(e.closest('label'))return true;}return false};return [...root.querySelectorAll('button,a[href],input,select,textarea,summary')].filter(vis).filter(e=>!named(e)).map(e=>{const data=[...e.attributes].filter(a=>a.name.startsWith('data-')).slice(0,4).map(a=>`${a.name}=${a.value}`).join(',');const parent=e.parentElement;return{tag:e.tagName.toLowerCase(),id:e.id||'',cls:String(e.className||''),data,parent:`${parent?.tagName?.toLowerCase()||''}.${String(parent?.className||'').split(/\\s+/).filter(Boolean).slice(0,3).join('.')}`,html:e.outerHTML.slice(0,360)}})}""")
  if bad:
   first=bad[0];hint='|'.join(x for x in [first['tag'],first['id'],first['cls'],first['data'],first['parent']] if x)
   publish(hint);(ART/'browser-surface-truth-rn-controls-2-5-error.json').write_text(json.dumps({'bad':bad},indent=2,ensure_ascii=False),encoding='utf8');raise AssertionError(f'RN unnamed controls: {json.dumps(bad[:4],ensure_ascii=False)}')
  print('browser-surface-truth-rn-controls-2-5: complete',flush=True);ctx.close();browser.close()
except BaseException:
 traceback.print_exc();raise
