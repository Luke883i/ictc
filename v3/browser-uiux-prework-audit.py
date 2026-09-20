import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
OUT=pathlib.Path(os.environ.get('ICTC_PREWORK_OUT','audit/uiux-prework-20260920'));OUT.mkdir(parents=True,exist_ok=True)
PHASE='init'
SURFACES=[
 ('monitoring','monitoring',None,'#monitoringView'),('incidents','incidents',None,'#incidentsView'),
 ('objects','grc','objects','#grcWorkspace'),('coverage','grc','coverage','#grcWorkspace'),
 ('actions','grc','actions','#grcWorkspace'),('risks','grc','risks','#grcWorkspace'),('assurance','grc','assurance','#grcWorkspace'),
 ('epistemic','epistemic',None,'#epistemicView')]
VIEWPORTS=[('desktop',1440,1000),('mobile',390,844)]
JS=r'''({surface,rootSelector})=>{
 const rect=e=>{const r=e.getBoundingClientRect();return {top:+r.top.toFixed(1),bottom:+r.bottom.toFixed(1),left:+r.left.toFixed(1),width:+r.width.toFixed(1),height:+r.height.toFixed(1)}};
 const txt=e=>(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim();
 const ancestorVisible=e=>{
   if(!e)return false;
   for(let n=e;n&&n!==document.documentElement;n=n.parentElement){
     if(n.hidden||n.getAttribute('aria-hidden')==='true')return false;
     const s=getComputedStyle(n); if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;
     if(n.tagName==='DIALOG'&&!n.open)return false;
     if(n.tagName==='DETAILS'&&!n.open){const summary=n.querySelector(':scope > summary'); if(e!==summary&&!summary?.contains(e))return false;}
   }
   const r=e.getBoundingClientRect(); return r.width>0&&r.height>0;
 };
 const info=e=>{const s=getComputedStyle(e);return {tag:e.tagName.toLowerCase(),id:e.id||'',className:String(e.className||'').slice(0,180),text:txt(e).slice(0,260),rect:rect(e),cssOrder:s.order,position:s.position,display:s.display,open:e.tagName==='DETAILS'?e.open:undefined,editorialSlot:e.dataset?.editorialSlot||'',informationRole:e.dataset?.informationRole||'',primitive:e.dataset?.enduserPrimitive||'',secondaryDisclosure:e.dataset?.secondaryDisclosure||'',finetuneCompass:e.dataset?.finetuneCompass||''}};
 const root=document.querySelector(rootSelector); if(!root)return {surface,error:'missing-root'};
 const direct=[...root.children].filter(ancestorVisible).map(info).sort((a,b)=>a.rect.top-b.rect.top||a.rect.left-b.rect.left);
 const rail=root.querySelector(':scope > .procedure-support-rail');
 const railChildren=rail?[...rail.children].filter(ancestorVisible).map(info).sort((a,b)=>a.rect.top-b.rect.top||a.rect.left-b.rect.left):[];
 const details=[...root.querySelectorAll('details')].filter(ancestorVisible).map(e=>{const i=info(e);const summary=e.querySelector(':scope > summary');i.summary=summary?txt(summary).slice(0,220):'';return i}).sort((a,b)=>a.rect.top-b.rect.top||a.rect.left-b.rect.left);
 let controls=null,primary=null;
 if(surface==='monitoring'||surface==='incidents'){
   const cs=[...root.querySelectorAll(':scope > .hero,:scope > #aiSetup')].filter(ancestorVisible); controls=cs.length?info(cs.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0]):null;
   const ps=[...root.querySelectorAll(':scope > .section-block')].filter(ancestorVisible); primary=ps.length?info(ps.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0]):null;
 }else if(surface==='epistemic'){
   const c=root.querySelector('.surface-toolbar');const p=root.querySelector('#epistemicModeHost');controls=ancestorVisible(c)?info(c):null;primary=ancestorVisible(p)?info(p):null;
 }else{
   const c=root.querySelector(':scope > .grc-head');const p=root.querySelector(':scope > .grc-body');controls=ancestorVisible(c)?info(c):null;primary=ancestorVisible(p)?info(p):null;
 }
 const tops=[controls?.rect?.top,primary?.rect?.top].filter(Number.isFinite),usefulTop=tops.length?Math.min(...tops):Infinity;
 const before=direct.filter(x=>x.rect.top<usefulTop&&!/procedure-frame/.test(x.className));
 const beforePrimary=direct.filter(x=>primary&&x.rect.top<primary.rect.top&&!/procedure-frame/.test(x.className));
 const openBeforePrimary=details.filter(x=>x.open&&primary&&x.rect.top<primary.rect.top);
 const summariesBeforePrimary=details.filter(x=>primary&&x.rect.top<primary.rect.top).map(x=>({summary:x.summary,open:x.open,top:x.rect.top,height:x.rect.height,className:x.className,informationRole:x.informationRole}));
 const visibleControlsBeforePrimary=[...root.querySelectorAll('button,a[href],input,select,textarea,summary')].filter(ancestorVisible).map(info).filter(x=>primary&&x.rect.top<primary.rect.top).sort((a,b)=>a.rect.top-b.rect.top||a.rect.left-b.rect.left);
 const frame=root.querySelector(':scope > .procedure-frame'),preworkHeight=primary?Math.max(0,primary.rect.top-(frame?.getBoundingClientRect().bottom||root.getBoundingClientRect().top)):null;
 const professional=root.querySelector('#epistemicProfessionalTools'),compression=root.querySelector('#epistemicCompression'),deep=root.querySelector('details[data-epistemic-a3="deep-tools"]'),rules=root.querySelector('details[data-epistemic-workspace="rules"]');
 return {surface,url:location.href,root:{rect:rect(root),editorialOwner:root.dataset.editorialOwner||'',editorialOrder:root.dataset.editorialOrder||'',editorialActualOrder:root.dataset.editorialActualOrder||'',editorialOrderValid:root.dataset.editorialOrderValid||'',compositionSurface:root.dataset.compositionSurface||''},controls,primary,direct,rail:rail&&ancestorVisible(rail)?info(rail):null,railChildren,details,metrics:{viewportH:innerHeight,documentScrollHeight:document.documentElement.scrollHeight,rootScrollHeight:root.scrollHeight,preworkHeight,preworkViewportRatio:preworkHeight==null?null:+(preworkHeight/innerHeight).toFixed(3),directBeforeUseful:before.length,directBeforePrimary:beforePrimary.length,detailSummariesBeforePrimary:summariesBeforePrimary.length,openDetailsBeforePrimary:openBeforePrimary.length,visibleControlsBeforePrimary:visibleControlsBeforePrimary.length,totalOpenDetails:details.filter(x=>x.open).length},beforeUseful:before,beforePrimary,detailSummariesBeforePrimary:summariesBeforePrimary,openDetailsBeforePrimary:openBeforePrimary,visibleControlsBeforePrimary:visibleControlsBeforePrimary.slice(0,40),epistemic:{professional:professional?{visible:ancestorVisible(professional),parent:professional.parentElement?.getAttribute('data-epistemic-a3-body')||professional.parentElement?.id||professional.parentElement?.className||'',rect:rect(professional)}:null,compression:compression?{visible:ancestorVisible(compression),parent:compression.parentElement?.getAttribute('data-epistemic-rules-body')!=null?'rules-body':compression.parentElement?.id||compression.parentElement?.className||'',rect:rect(compression)}:null,deepTools:deep?{open:deep.open,visible:ancestorVisible(deep),rect:rect(deep)}:null,rules:rules?{open:rules.open,visible:ancestorVisible(rules),rect:rect(rules)}:null}};
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
 payload={'sha':os.environ.get('GITHUB_SHA',''),'results':[]}
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch);ctx=browser.new_context();ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  page=ctx.new_page();page.set_default_timeout(18000)
  for vp,w,h in VIEWPORTS:
   page.set_viewport_size({'width':w,'height':h})
   for surface,view,procedure,root in SURFACES:
    mount(page,surface,view,procedure,root);row=page.evaluate(JS,{'surface':surface,'rootSelector':root});row['viewport']=vp;payload['results'].append(row)
  browser.close()
 payload['summary']=[{'viewport':x['viewport'],'surface':x['surface'],'editorialOrder':x['root'].get('editorialOrder'),'actual':x['root'].get('editorialActualOrder'),'primaryTop':x.get('primary',{}).get('rect',{}).get('top') if x.get('primary') else None,'metrics':x['metrics'],'beforePrimary':[{'tag':n['tag'],'id':n['id'],'className':n['className'],'text':n['text'],'top':n['rect']['top'],'height':n['rect']['height'],'slot':n['editorialSlot'],'role':n['informationRole']} for n in x['beforePrimary']],'detailSummariesBeforePrimary':x['detailSummariesBeforePrimary'],'epistemic':x['epistemic']} for x in payload['results']]
 (OUT/'prework-audit.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
 (OUT/'prework-summary.json').write_text(json.dumps(payload['summary'],indent=2,ensure_ascii=False),encoding='utf8')
 print(json.dumps({'ok':True,'rows':len(payload['results']),'out':str(OUT/'prework-summary.json')},ensure_ascii=False))
if __name__=='__main__':
 try:main()
 except BaseException as e:
  (OUT/'error.json').write_text(json.dumps({'ok':False,'phase':PHASE,'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()},indent=2),encoding='utf8');raise
