from pathlib import Path
import argparse, hashlib, json, shutil, subprocess, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import read_json, write_json, now
ap=argparse.ArgumentParser(); ap.add_argument('root',nargs='?',default='.'); ap.add_argument('--target',required=True); ap.add_argument('--version'); ap.add_argument('--zip'); a=ap.parse_args()
root=Path(a.root).resolve(); target=Path(a.target).expanduser().resolve()
if target.exists() and any(target.iterdir()): raise SystemExit('Target must be empty')
if not (root/'runtime/repository_observation.json').is_file(): raise SystemExit('Run refresh_from_repo.py first')
ignore=shutil.ignore_patterns('runtime','__pycache__','*.pyc','bundle_manifest.json','SHA256SUMS.txt','ROOT_DIGEST.txt')
shutil.copytree(root,target,ignore=ignore,dirs_exist_ok=True)
obs=read_json(root/'runtime/repository_observation.json'); plan=read_json(root/'runtime/adaptation_plan.json'); anchor=read_json(target/'repository_anchor.json'); profile=read_json(target/'bundle_profile.json')
parent_digest=(root/'ROOT_DIGEST.txt').read_text(encoding='utf-8').strip()
anchor['previous_observed_main_sha']=anchor.get('observed_main_sha'); anchor['observed_main_sha']=obs.get('head'); anchor['observed_at']=obs.get('observed_at'); anchor['observed_branch']=obs.get('branch'); anchor['successor_classification']=obs.get('classification'); write_json(target/'repository_anchor.json',anchor)
if a.version: profile['bundle_version']=a.version
else: profile['bundle_version']=profile['bundle_version']+'-successor'
write_json(target/'bundle_profile.json',profile)
obs_hash=hashlib.sha256((root/'runtime/repository_observation.json').read_bytes()).hexdigest()
write_json(target/'history/SUCCESSOR_PROVENANCE.json',{'schema_version':'1.0.0','created_at':now(),'parent_root_digest':parent_digest,'observation_sha256':obs_hash,'classification':obs.get('classification'),'plan':plan,'authority_effect':'NONE_DERIVED'})
zip_path=Path(a.zip).resolve() if a.zip else target.parent/(target.name+'.zip')
q=subprocess.run([sys.executable,str(target/'tools/build_bundle.py'),str(target),'--zip',str(zip_path)])
raise SystemExit(q.returncode)
