from pathlib import Path
import argparse, json, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import git, read_json, write_json, now

ap=argparse.ArgumentParser(); ap.add_argument('root', nargs='?', default='.'); ap.add_argument('--repo', required=True); a=ap.parse_args()
root=Path(a.root).resolve(); repo=Path(a.repo).expanduser().resolve(); contract=read_json(root/'config/repository_contract.json')
result={'schema_version':'1.0.0','checked_at':now(),'repo':str(repo),'repository':contract['repository'],'read_only':True,'git':{},'required_paths':{},'package_scripts':[],'workflows':[],'status':'FAIL','errors':[]}
if not (repo/'.git').exists(): result['errors'].append('NOT_A_GIT_CHECKOUT')
else:
    fmt=git(repo,'rev-parse','--show-object-format'); head=git(repo,'rev-parse','HEAD'); branch=git(repo,'branch','--show-current'); status=git(repo,'status','--porcelain=v1'); remote=git(repo,'remote','get-url','origin')
    dec=lambda q: q.stdout.decode('utf-8','replace').strip() if q.returncode==0 else None
    result['git']={'object_format':dec(fmt),'head':dec(head),'branch':dec(branch),'worktree':'CLEAN' if status.returncode==0 and not status.stdout else 'DIRTY','origin':dec(remote)}
    if result['git']['object_format']!='sha1': result['errors'].append('UNSUPPORTED_GIT_OBJECT_FORMAT')
    for rel in contract['required_paths']: result['required_paths'][rel]=(repo/rel).is_file()
    missing=[k for k,v in result['required_paths'].items() if not v]
    if missing: result['errors'].append('MISSING_REQUIRED:'+','.join(missing))
    pkg=repo/'package.json'
    if pkg.is_file():
        try: result['package_scripts']=sorted(json.loads(pkg.read_text(encoding='utf-8')).get('scripts',{}))
        except Exception as e: result['errors'].append('PACKAGE_JSON:'+str(e))
    wf=repo/'.github/workflows'
    if wf.is_dir(): result['workflows']=sorted(p.name for p in wf.glob('*.y*ml'))
result['status']='PASS' if not result['errors'] else 'FAIL'
out=root/'runtime/doctor.json'; write_json(out,result); print(json.dumps(result,indent=2,ensure_ascii=False)); raise SystemExit(0 if result['status']=='PASS' else 2)
