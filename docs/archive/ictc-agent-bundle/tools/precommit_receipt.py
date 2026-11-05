from pathlib import Path, PurePosixPath
import argparse, json, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import git, git_object_id, read_json, write_json, now, run

ap=argparse.ArgumentParser(); ap.add_argument('root',nargs='?',default='.'); ap.add_argument('--repo',required=True); ap.add_argument('--run',choices=['none','quick','full'],default='quick'); ap.add_argument('--allow',action='append',default=[]); ap.add_argument('--output'); ap.add_argument('--compare-git-write-tree',action='store_true'); a=ap.parse_args()
root=Path(a.root).resolve(); repo=Path(a.repo).expanduser().resolve(); catalog=read_json(root/'config/test_catalog.json')

def dec(q): return q.stdout.decode('utf-8','surrogateescape') if q.returncode==0 else ''
def raw(q):
    if q.returncode: raise RuntimeError(q.stderr.decode('utf-8','replace'))
    return q.stdout
fmt=dec(git(repo,'rev-parse','--show-object-format')).strip()
if fmt!='sha1': raise SystemExit('Only SHA-1 repositories are supported')
parent=dec(git(repo,'rev-parse','HEAD')).strip(); branch=dec(git(repo,'branch','--show-current')).strip(); before=parent
names=[x.decode('utf-8','surrogateescape') for x in raw(git(repo,'diff','--cached','--name-only','-z')).split(b'\0') if x]
if not names: raise SystemExit('No staged changes')
violations=[]
if a.allow:
    for path in names:
        if not any(path==p or path.startswith(p.rstrip('/')+'/') for p in a.allow): violations.append(path)
index_raw=raw(git(repo,'ls-files','-s','-z'))
entries=[]
for rec in index_raw.split(b'\0'):
    if not rec: continue
    meta,path=rec.split(b'\t',1); mode,sha,stage=meta.split(b' ',2)
    if stage!=b'0': raise SystemExit('Unmerged index entries are not supported')
    entries.append({'mode':mode.decode(),'sha':sha.decode(),'path':path.decode('utf-8','surrogateescape')})
index_by={e['path']:e for e in entries}
blobs=[]
for path in names:
    e=index_by.get(path)
    if not e:
        blobs.append({'path':path,'status':'DELETED'}); continue
    content=raw(git(repo,'show',':'+path)); calculated=git_object_id('blob',content)
    blobs.append({'path':path,'bytes':len(content),'index_sha':e['sha'],'calculated_sha':calculated,'match':calculated==e['sha']})

class Node(dict): pass
root_node=Node()
for e in entries:
    parts=PurePosixPath(e['path']).parts; node=root_node
    for part in parts[:-1]: node=node.setdefault(part,Node())
    node[parts[-1]]=e

def tree_hash(node):
    rows=[]
    for name,value in node.items():
        name_b=name.encode('utf-8','surrogateescape')
        if isinstance(value,Node): mode='40000'; sha=tree_hash(value); key=name_b+b'/'
        else: mode=value['mode']; sha=value['sha']; key=name_b
        raw_entry=mode.encode('ascii')+b' '+name_b+b'\0'+bytes.fromhex(sha)
        rows.append((key,raw_entry))
    body=b''.join(x[1] for x in sorted(rows,key=lambda x:x[0]))
    return git_object_id('tree',body)
predicted=tree_hash(root_node)
tests=[]
key={'none':None,'quick':'precommit_quick','full':'precommit_full'}[a.run]
if key:
    for spec in catalog[key]:
        q=run(spec['argv'],cwd=repo,timeout=1200)
        tests.append({'id':spec['id'],'command':spec['argv'],'returncode':q.returncode,'stdout_tail':q.stdout[-2000:],'stderr_tail':q.stderr[-1200:]})
after=dec(git(repo,'rev-parse','HEAD')).strip()
git_tree=None
if a.compare_git_write_tree:
    git_tree=dec(git(repo,'write-tree')).strip()
status='PASS'
errors=[]
if violations: errors.append('PATH_SCOPE')
if any(x.get('match') is False for x in blobs): errors.append('BLOB_MISMATCH')
if any(x['returncode'] for x in tests): errors.append('TEST_FAILURE')
if before!=after: errors.append('HEAD_CHANGED_DURING_TESTS')
if git_tree and git_tree!=predicted: errors.append('TREE_MISMATCH')
if errors: status='FAIL'
receipt={'schema_version':'1.0.0','created_at':now(),'repository':str(repo),'branch':branch,'parent':parent,'staged_paths':names,'allowed_prefixes':a.allow,'violations':violations,'blobs':blobs,'predicted_tree':predicted,'git_write_tree':git_tree,'tests':tests,'head_stable':before==after,'errors':errors,'status':status,'next_protocol':['create/write exact blobs','create tree on parent','create commit with explicit parent','update ref force=false','fetch commit and status for readback']}
out=Path(a.output).resolve() if a.output else root/'runtime/precommit-receipt.json'; write_json(out,receipt); print(json.dumps(receipt,indent=2,ensure_ascii=False)); raise SystemExit(0 if status=='PASS' else 2)
