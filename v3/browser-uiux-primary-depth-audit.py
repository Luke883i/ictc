import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
OUT=pathlib.Path('audit/uiux-primary-depth-20260920');OUT.mkdir(parents=True,exist_ok=True)
PHASE='init'
SURFACES=[('monitoring','monitoring',None,'#monitoringView'),('incidents','incidents',None,'#incidentsView'),('objects','grc','objects','#grcWorkspace'),('coverage','grc','coverage','#grcWorkspace'),('actions','grc','actions','#grcWorkspace'),('risks','grc','risks','#grcWorkspace'),('assurance','grc','assurance','#grcWorkspace'),('epistemic','epistemic',None,'#epistemicView')]
VIEWPORTS=[('desktop',1440,1000),('mobile',390,844)]
JS=r'''({surface,rootSelector})=>{
 const rect=e=>{const r=e.getBoundingClientRect();return{top:+r.top.toFixed(1),bottom:+r.bottom.toFixed(1),height:+r.height.toFixed(1),width:+r.width.toFixed(1),left:+r.left.toFixed(1)}};
 const txt=e=>(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim();
 const visible=e=>{if(!e)return false;for(let n=e;n&&n!==document.documentElement;n=n.parentElement){if(n.hidden||n.getAttribute('aria-hidden')==='true')return false;const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;if(n.tagName==='DIALOG'&&!n.open)return false;if(n.tagName==='DETAILS'&&!n.open&&e!==n){const summary=n.querySelector(':scope > summary');if(e!==summary&&!summary?.contains(e))return false;}}const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 const info=e=>({tag:e.tagName.toLowerCase(),id:e.id||'',className:String(e.className||'').slice(0,180),text:txt(e).slice(0,300),rect:rect(e),open:e.tagName==='DETAILS'?e.open:undefined,role:e.dataset?.informationRole||'',primitive:e.dataset?.enduserPrimitive||'',secondary:e.dataset?.secondaryDisclosure||'',metric:e.dataset?.metricRole||'',editorial:e.dataset?.editorialSlot||''});
 const root=document.querySelector(rootSelector);if(!root)return{surface,error:'missing-root'};
 let primary=null;if(surface==='monitoring'||surface==='incidents')primary=[...root.querySelectorAll(':scope > .section-block')].filter(visible).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0]||null;else if(surface==='epistemic')primary=root.querySelector('.surface-panel');else primary=root.querySelector(':scope > .grc-body');
 const children=primary?[...primary.children].filter(visible).map(info).sort((a,b)=>a.rect.top-b.rect.top||a.rect.left-b.rect.left):[];
 const open=[...root.querySelectorAll('details[open]')].filter(visible).map(e=>{const x=info(e);x.summary=txt(e.querySelector(':scope > summary')||e).slice(0,220);return x}).sort((a,b)=>a.rect.top-b.rect.top||a.rect.left-b.rect.left);
 const actionable=[...root.querySelectorAll('button,a[href],input,select,textarea,summary')].filter(visible).map(info).sort((a,b)=>a.rect.top-b.rect.top||a.rect.left-b.rect.left);
 return{surface,root:info(root),primary:primary?info(primary):null,children,openDetails:open,firstTenActions:actionable.slice(0,20),scrollHeight:document.documentElement.scrollHeight};
}'''
def mount(page,surface,view,procedure,root):
 global PHASE;PHASE=f'mount:{surface}'
 if view=='grc':
  page.goto(f'{BASE}/?view=grc&procedure={procedure}',wait_until='networkidle');expect(page.locator('#grcView')).to_be_visible();page.wait_for_function('p=>document.querySelector("#grcWorkspace")?.dataset.compositionSurface===p',arg=procedure)
 elif view=='epistemic':
  page.goto(f'{BASE}/?view=proof',wait_until='networkidle');expect(page.locator('#proofView')).to_be_visible();d=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]');expect(d).to_have_count(1)
  if d.get_attribute('open') is None:d.locator(':scope > summary').click()
  d.locator('[data-service="epistemic"]').click();expect(page.locator('#epistemicView')).to_be_visible()
 else:
  page.goto(f'{BASE}/?view={view}',wait_until='networkidle');expect(page.locator(root)).to_be_visible()
 page.wait_for_function('()=>document.documentElement.dataset.enduserComposition==="p2"');page.wait_for_timeout(180)
def main():
 rows=[]
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  b=pw.chromium.launch(**launch);ctx=b.new_context();ctx.add_init_script("localStorage.setItem('ictc-role','admin')");p=ctx.new_page();p.set_default_timeout(18000)
  for vp,w,h in VIEWPORTS:
   p.set_viewport_size({'width':w,'height':h})
   for s,v,proc,root in SURFACES:
    mount(p,s,v,proc,root);r=p.evaluate(JS,{'surface':s,'rootSelector':root});r['viewport']=vp;rows.append(r)
  b.close()
 payload={'sha':os.environ.get('GITHUB_SHA',''),'rows':rows}
 (OUT/'primary-depth.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
 (OUT/'primary-depth-summary.json').write_text(json.dumps([{'viewport':r['viewport'],'surface':r['surface'],'scrollHeight':r['scrollHeight'],'primary':r['primary'],'children':r['children'],'openDetails':r['openDetails']} for r in rows],indent=2,ensure_ascii=False),encoding='utf8')
 print(json.dumps({'ok':True,'rows':len(rows)}))
if __name__=='__main__':
 try:main()
 except BaseException as e:(OUT/'error.json').write_text(json.dumps({'phase':PHASE,'error':str(e),'traceback':traceback.format_exc()},indent=2));raise
