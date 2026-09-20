import base64, io, json, os, pathlib, re, traceback
from collections import Counter
from PIL import Image, ImageDraw
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=os.environ.get("ICTC_BASE_URL","http://127.0.0.1:4173").rstrip("/")
P4=ROOT/"artifacts"/"uiux-beauty-p4"
OUT=ROOT/"audit"/"uiux-ontology-20260920"
OUT.mkdir(parents=True,exist_ok=True)
PHASE="init"
SURFACES=[
("home","home",None,"#homeView"),("processes","processes",None,"#processesView"),
("monitoring","monitoring",None,"#monitoringView"),("incidents","incidents",None,"#incidentsView"),
("objects","grc","objects","#grcWorkspace"),("coverage","grc","coverage","#grcWorkspace"),
("actions","grc","actions","#grcWorkspace"),("risks","grc","risks","#grcWorkspace"),
("assurance","grc","assurance","#grcWorkspace"),("proof","proof",None,"#proofView"),
("epistemic","epistemic",None,"#epistemicView"),("admin","admin",None,"#adminCenter"),
("ai-settings","ai-settings",None,"#settingsDialog")]
VIEWPORTS=[("desktop",1440,1000),("mobile",390,844)]
JARGON=["runtime","projection","epistemic","semantic","ontology","deterministic","contract","authority","manifest","receipt","sha256","hash","owner"]

JS=r"""({surface,rootSelector})=>{
 const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&+s.opacity>0&&r.width>0&&r.height>0};
 const tx=e=>(e.innerText||e.textContent||"").replace(/\s+/g," ").trim();
 const rc=e=>{const r=e.getBoundingClientRect();return{x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}};
 const st=e=>{const s=getComputedStyle(e);return{fontSize:s.fontSize,fontWeight:s.fontWeight,color:s.color,background:s.backgroundColor,overflow:s.overflow,textOverflow:s.textOverflow,whiteSpace:s.whiteSpace,position:s.position}};
 const root=document.querySelector(rootSelector);
 const all=[...document.querySelectorAll("body *")].filter(vis).filter(e=>!root||root.contains(e)||e.closest(".topbar")||e.closest(".stable-legal-footer")||e.matches("dialog[open],dialog[open] *"));
 const headings=all.filter(e=>/^H[1-6]$/.test(e.tagName)).map(e=>({tag:e.tagName.toLowerCase(),text:tx(e),rect:rc(e),style:st(e)}));
 const controls=all.filter(e=>e.matches("button,a[href],input,select,textarea,summary,[role=button]")).map(e=>({tag:e.tagName.toLowerCase(),id:e.id||"",className:String(e.className||"").slice(0,160),text:tx(e).slice(0,240),aria:e.getAttribute("aria-label")||"",title:e.getAttribute("title")||"",disabled:!!e.disabled,rect:rc(e),style:st(e)}));
 const statuses=all.filter(e=>/(status|badge|chip|counter|state|signal)/i.test(String(e.className||""))||e.getAttribute("role")==="status").map(e=>({tag:e.tagName.toLowerCase(),id:e.id||"",className:String(e.className||"").slice(0,160),text:tx(e).slice(0,240),rect:rc(e),style:st(e),aiState:e.dataset?.aiState||"",sourceState:e.dataset?.sourceState||""})).filter(x=>x.text||x.aiState||x.sourceState);
 const semantic=all.filter(e=>e.matches("h1,h2,h3,h4,p,small,label,button,a,summary,[role=status]")).map(e=>({tag:e.tagName.toLowerCase(),id:e.id||"",className:String(e.className||"").slice(0,120),text:tx(e).slice(0,500),rect:rc(e),style:st(e)})).filter(x=>x.text);
 const text=(root?tx(root):tx(document.body)).slice(0,50000);
 const ds={};for(const[k,v]of Object.entries(document.documentElement.dataset))ds[k]=v;
 return{surface,url:location.href,datasets:ds,headings,controls,statuses,semantic,visibleText:text,
 metrics:{scrollWidth:document.documentElement.scrollWidth,innerWidth,scrollHeight:document.documentElement.scrollHeight,innerHeight,
 horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,tinyControls:controls.filter(x=>x.rect.w<44||x.rect.h<44).length,smallText:semantic.filter(x=>parseFloat(x.style.fontSize||"0")<12.5).length}};
}"""

def mount(page,surface,view,procedure,root):
 global PHASE; PHASE=f"mount:{surface}"
 if view=="grc":
  page.goto(f"{BASE}/?view=grc&procedure={procedure}",wait_until="networkidle")
  expect(page.locator("#grcView")).to_be_visible()
  page.wait_for_function("p=>document.querySelector('#grcWorkspace')?.dataset.compositionSurface===p",arg=procedure)
 elif view=="admin":
  page.goto(f"{BASE}/?view=home",wait_until="networkidle")
  m=page.locator("#stableProfileMenu"); expect(m).to_be_visible()
  if m.get_attribute("open") is None:m.locator(":scope > summary").click()
  page.locator("#openAdminCenter").click();expect(page.locator("#adminCenter")).to_be_visible()
  page.wait_for_function("()=>document.querySelectorAll('#procedurePolicyList .procedure-policy-row').length===7")
 elif view=="ai-settings":
  page.goto(f"{BASE}/?view=home",wait_until="networkidle")
  m=page.locator("#stableProfileMenu");expect(m).to_be_visible()
  if m.get_attribute("open") is None:m.locator(":scope > summary").click()
  page.locator("#openSettings").click();expect(page.locator("#settingsDialog")).to_be_visible()
 elif view=="epistemic":
  page.goto(f"{BASE}/?view=proof",wait_until="networkidle");expect(page.locator("#proofView")).to_be_visible()
  d=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]');expect(d).to_have_count(1)
  if d.get_attribute("open") is None:d.locator(":scope > summary").click()
  d.locator('[data-service="epistemic"]').click();expect(page.locator("#epistemicView")).to_be_visible()
 else:
  page.goto(f"{BASE}/?view={view}",wait_until="networkidle");expect(page.locator(root)).to_be_visible()
 page.wait_for_function("()=>document.documentElement.dataset.enduserComposition==='p2'")

def boot(ctx,role):
 r=ctx.request.get(BASE+"/api/bootstrap",headers={"x-ictc-role":role,"x-ictc-actor-id":f"local-{role}"})
 b=r.json(); q=((b.get("work")or{}).get("queue")or{}).get("items",[])
 return{"role":role,"actor":b.get("actor"),"accessProfile":b.get("accessProfile"),"capabilities":b.get("capabilities",[]),"homeNextAction":b.get("homeNextAction"),"experience":b.get("experience"),"processLandscape":b.get("processLandscape"),"procedures":[{"id":x.get("id"),"code":x.get("code"),"label":x.get("label"),"enabled":x.get("enabled",True)}for x in b.get("procedures",[])],"reviewCount":len((b.get("reviewInbox")or{}).get("items",[])),"queueCount":len(q)}

def analyze(s):
 low=s["visibleText"].lower(); labels=[x["text"] for x in s["controls"] if x["text"]]
 return{"h1":[h["text"] for h in s["headings"] if h["tag"]=="h1"],"duplicateControls":{k:v for k,v in Counter(labels).items() if v>1},"jargon":{j:len(re.findall(r"\\b"+re.escape(j)+r"\\b",low)) for j in JARGON if re.search(r"\\b"+re.escape(j)+r"\\b",low)},"processCodes":Counter(re.findall(r"\\b(?:RN|EC|AO|MC|AP|RC|AR|EP)-\\d{2}\\b",s["visibleText"]))}

def b64jpg(src,dst,maxw=720,maxh=2200,q=24):
 im=Image.open(src).convert("RGB");scale=min(1,maxw/im.width,maxh/im.height)
 if scale<1:im=im.resize((max(1,int(im.width*scale)),max(1,int(im.height*scale))),Image.Resampling.LANCZOS)
 buf=io.BytesIO();im.save(buf,"JPEG",quality=q,optimize=True,progressive=True)
 raw=base64.b64encode(buf.getvalue()).decode("ascii");dst.write_text("\n".join(raw[i:i+18000]for i in range(0,len(raw),18000))+"\n")
 return{"bytes":len(buf.getvalue()),"width":im.width,"height":im.height,"b64":len(raw)}

def sheet(vp):
 files=[(s,P4/f"{vp}-{s}.png") for s,_,_,_ in SURFACES if (P4/f"{vp}-{s}.png").exists()]
 cw,ch,cols=250,320,2;rows=(len(files)+1)//2
 out=Image.new("RGB",(cw*cols,ch*rows),(245,247,249));d=ImageDraw.Draw(out)
 for i,(name,p) in enumerate(files):
  im=Image.open(p).convert("RGB");scale=min((cw-12)/im.width,(ch-34)/im.height);im=im.resize((int(im.width*scale),int(im.height*scale)),Image.Resampling.LANCZOS)
  x=(i%2)*cw+6;y=(i//2)*ch+28;out.paste(im,(x,y));d.text((x,(i//2)*ch+6),name,fill=(20,28,45))
 return out

def main():
 payload={"sha":os.environ.get("GITHUB_SHA",""),"roles":[],"snapshots":[],"images":{}}
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,args=["--no-sandbox"])
  ctx=b.new_context(viewport={"width":1440,"height":1000});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
  payload["roles"]=[boot(ctx,r)for r in("admin","user","auditor")]
  page=ctx.new_page();page.set_default_timeout(18000)
  for vp,w,h in VIEWPORTS:
   page.set_viewport_size({"width":w,"height":h})
   for surface,view,procedure,root in SURFACES:
    mount(page,surface,view,procedure,root)
    s=page.evaluate(JS,{"surface":surface,"rootSelector":root});s["viewport"]=vp;s["analysis"]=analyze(s);payload["snapshots"].append(s)
  b.close()
 rp=P4/"report.json"
 if rp.exists():(OUT/"p4-report.json").write_text(rp.read_text())
 for vp in("desktop","tablet","mobile","narrow"):
  temp=OUT/f"contact-{vp}.jpg";sheet(vp).save(temp,"JPEG",quality=24,optimize=True,progressive=True);payload["images"][f"contact-{vp}"]=b64jpg(temp,OUT/f"contact-{vp}.jpg.b64",650,4200,26);temp.unlink()
 for vp,s in[("desktop","home"),("desktop","processes"),("desktop","monitoring"),("desktop","incidents"),("desktop","coverage"),("desktop","proof"),("desktop","admin"),("desktop","ai-settings"),("mobile","home"),("mobile","processes"),("mobile","proof")]:
  p=P4/f"{vp}-{s}.png"
  if p.exists():payload["images"][f"{vp}-{s}"]=b64jpg(p,OUT/f"{vp}-{s}.jpg.b64")
 flags=[]
 for s in payload["snapshots"]:
  a=s["analysis"];sid=f"{s['viewport']}:{s['surface']}"
  if s["surface"]!="ai-settings" and len(a["h1"])!=1:flags.append({"id":"h1-cardinality","surface":sid,"detail":a["h1"]})
  if s["metrics"]["horizontalOverflow"]:flags.append({"id":"horizontal-overflow","surface":sid})
  if s["viewport"]=="mobile" and s["metrics"]["tinyControls"]:flags.append({"id":"touch-target-candidates","surface":sid,"count":s["metrics"]["tinyControls"]})
  if a["jargon"] and s["surface"] not in("proof","epistemic","admin","ai-settings"):flags.append({"id":"internal-language-candidate","surface":sid,"detail":a["jargon"]})
 payload["candidateFlags"]=flags
 payload["limitations"]=["Rendered Chromium evidence is not representative-human pleasantness proof.","Candidate flags require semantic human review.","Assistive-technology effectiveness and production deployment remain external evidence."]
 (OUT/"semantic-manifest.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False))
 print(json.dumps({"ok":True,"snapshots":len(payload["snapshots"]),"flags":len(flags),"images":len(payload["images"])}))

if __name__=="__main__":
 try:main()
 except BaseException as e:
  (OUT/"error.json").write_text(json.dumps({"ok":False,"phase":PHASE,"type":type(e).__name__,"message":str(e),"traceback":traceback.format_exc()},indent=2));raise
