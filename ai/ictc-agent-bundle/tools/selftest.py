from pathlib import Path
import hashlib, json, shutil, subprocess, sys, tempfile
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import rel_files, sha256_file, verify_integrity, run
root=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve(); results=[]; ok=True
v=verify_integrity(root); results.append({'name':'integrity','status':v['status']}); ok &= v['status']=='PASS'
before={r:sha256_file(root/r) for r in rel_files(root)}
with tempfile.TemporaryDirectory(prefix='ictc-ai-bundle-') as td:
    td=Path(td); repo=td/'repo'; repo.mkdir(); run(['git','init','-b','main'],cwd=repo); run(['git','config','user.email','ai@example.invalid'],cwd=repo); run(['git','config','user.name','ICTC Bundle Selftest'],cwd=repo)
    files={'README.md':'# ICTC\n','CONTRIBUTING.md':'# Contributing\n','package.json':json.dumps({'scripts':{'contract':'node -e "process.exit(0)"','schema:check':'node -e "process.exit(0)"','verify':'node -e "process.exit(0)"'}}),'ictc.sh':'#!/bin/sh\n','ictc-v3.sh':'#!/bin/sh\n','v3/server.mjs':'','v3/lib/api.mjs':'','v3/lib/store.mjs':'','.github/workflows/core-ui.yml':'name: test\n'}
    for rel,data in files.items(): p=repo/rel; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(data,encoding='utf-8')
    run(['git','add','.'],cwd=repo); run(['git','commit','-m','initial'],cwd=repo)
    q=run([sys.executable,str(root/'tools/refresh_from_repo.py'),str(root),'--repo',str(repo)])
    results.append({'name':'refresh','returncode':q.returncode}); ok &= q.returncode==0
    (repo/'README.md').write_text('# ICTC changed\n',encoding='utf-8'); run(['git','add','README.md'],cwd=repo)
    receipt=td/'receipt.json'; q=run([sys.executable,str(root/'tools/precommit_receipt.py'),str(root),'--repo',str(repo),'--run','none','--compare-git-write-tree','--output',str(receipt)])
    r=json.loads(receipt.read_text(encoding='utf-8')); results.append({'name':'blob-tree','returncode':q.returncode,'tree_match':r.get('predicted_tree')==r.get('git_write_tree'),'blob_match':all(x.get('match',True) for x in r.get('blobs',[]))}); ok &= q.returncode==0 and r.get('predicted_tree')==r.get('git_write_tree') and all(x.get('match',True) for x in r.get('blobs',[]))
    successor=td/'successor'; zip1=td/'one.zip'; q=run([sys.executable,str(root/'tools/materialize_successor.py'),str(root),'--target',str(successor),'--zip',str(zip1)])
    sv=verify_integrity(successor); results.append({'name':'successor','returncode':q.returncode,'integrity':sv['status']}); ok &= q.returncode==0 and sv['status']=='PASS'
    zip2=td/'two.zip'; q=run([sys.executable,str(successor/'tools/build_bundle.py'),str(successor),'--zip',str(zip2)])
    same=hashlib.sha256(zip1.read_bytes()).hexdigest()==hashlib.sha256(zip2.read_bytes()).hexdigest(); results.append({'name':'deterministic-zip','same':same}); ok &= q.returncode==0 and same
after={r:sha256_file(root/r) for r in rel_files(root)}; unchanged=before==after; results.append({'name':'kernel-unchanged-after-runtime-refresh','same':unchanged}); ok &= unchanged
print(json.dumps({'status':'PASS' if ok else 'FAIL','results':results},indent=2)); raise SystemExit(0 if ok else 2)
