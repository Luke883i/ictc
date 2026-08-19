import json, os, pathlib, runpy, urllib.request
ROOT=pathlib.Path(__file__).resolve().parent
SCRIPTS=['browser-procedure-finetuning-1-4-base.py','browser-procedure-executive-harmonization-1-5.py','browser-surface-truth-2-5.py']
def post_failure(script,error):
 token=os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN'); repo=os.environ.get('GITHUB_REPOSITORY'); sha=os.environ.get('HEAD_SHA') or os.environ.get('GITHUB_SHA')
 if not token or not repo or not sha: return
 slug=pathlib.Path(script).stem.replace('_','-')
 payload=json.dumps({'state':'failure','context':f'ictc/browser-subfailure/{slug}','description':f'{script}: {type(error).__name__}'}).encode()
 req=urllib.request.Request(f'https://api.github.com/repos/{repo}/statuses/{sha}',data=payload,method='POST',headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'})
 try: urllib.request.urlopen(req,timeout=10).read()
 except Exception as status_error: print(f'warning: cannot publish browser subfailure for {script}: {status_error}',flush=True)
failures=[]
for script in SCRIPTS:
 try:
  runpy.run_path(str(ROOT/script),run_name='__main__')
 except BaseException as error:
  post_failure(script,error); failures.append((script,error)); print(f'browser-procedure-wrapper: failed {script}: {error}',flush=True)
if failures:
 raise SystemExit(f'{len(failures)} browser procedure subtests failed: '+', '.join(script for script,_ in failures))
