from pathlib import Path
import argparse, hashlib, json, subprocess, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import git, read_json, write_json, now

ap=argparse.ArgumentParser(); ap.add_argument('root',nargs='?',default='.'); ap.add_argument('--repo',required=True); a=ap.parse_args()
root=Path(a.root).resolve(); repo=Path(a.repo).expanduser().resolve()
q=subprocess.run([sys.executable,str(root/'tools/doctor.py'),str(root),'--repo',str(repo)],capture_output=True,text=True)
doctor=read_json(root/'runtime/doctor.json')
anchor=read_json(root/'repository_anchor.json'); contract=read_json(root/'config/repository_contract.json')
head=doctor.get('git',{}).get('head'); branch=doctor.get('git',{}).get('branch'); clean=doctor.get('git',{}).get('worktree')=='CLEAN'; old=anchor['observed_main_sha']

def dec(q): return q.stdout.decode('utf-8','replace') if q.returncode==0 else ''
log=[]
if head:
    raw=dec(git(repo,'log','-n','120','--date=iso-strict','--pretty=format:%H%x00%P%x00%aI%x00%s'))
    for line in raw.splitlines():
        parts=line.split('\x00',3)
        if len(parts)==4: log.append({'sha':parts[0],'parents':parts[1].split(),'authored_at':parts[2],'subject':parts[3]})
ancestor=False
if head:
    ancestor=git(repo,'merge-base','--is-ancestor',old,head).returncode==0
changed=[]
if head and ancestor and head!=old:
    raw=dec(git(repo,'diff','--name-status',old+'..'+head))
    changed=[line for line in raw.splitlines() if line.strip()]
sensitive=[]
for row in changed:
    path=row.split('\t')[-1]
    if any(path==p or path.startswith(p.rstrip('/')+'/') for p in contract['sensitive_method_paths']): sensitive.append(path)
if q.returncode!=0 or not head:
    classification='BLOCKED'; reason='doctor failed or HEAD unavailable'
elif not clean:
    classification='REVIEW_REQUIRED'; reason='worktree is dirty'
elif head==old:
    classification='NO_CHANGE'; reason='checkout matches bundle anchor'
elif not ancestor:
    classification='REVIEW_REQUIRED'; reason='observed HEAD does not descend from anchor'
elif sensitive:
    classification='REVIEW_REQUIRED'; reason='authority or method paths changed'
else:
    classification='SAFE_DERIVED'; reason='repository advanced with derivable snapshot changes'
obs={'schema_version':'1.0.0','observed_at':now(),'repository':contract['repository'],'repo_path':str(repo),'anchor_sha':old,'head':head,'branch':branch,'clean':clean,'anchor_is_ancestor':ancestor,'classification':classification,'reason':reason,'changed_since_anchor':changed,'sensitive_changes':sorted(set(sensitive)),'recent_commits':log,'doctor_sha256':hashlib.sha256((root/'runtime/doctor.json').read_bytes()).hexdigest()}
plan={'schema_version':'1.0.0','created_at':now(),'classification':classification,'actions':[],'in_place_kernel_mutation':False}
if classification in {'SAFE_DERIVED','REVIEW_REQUIRED'}:
    plan['actions']=[{'target':'repository_anchor.json','kind':'REFRESH_DERIVED_SNAPSHOT','classification':'SAFE_DERIVED'},{'target':'history/SUCCESSOR_PROVENANCE.json','kind':'APPEND_LINEAGE','classification':'SAFE_DERIVED'}]
if sensitive: plan['actions'].append({'target':'method and authority interpretation','kind':'SEMANTIC_REVIEW','classification':'REVIEW_REQUIRED','paths':sensitive})
write_json(root/'runtime/repository_observation.json',obs); write_json(root/'runtime/adaptation_plan.json',plan)
card=f"ICTC AI bundle: {classification}\nHEAD: {head or 'non osservato'}\nAnchor: {old}\nAzione: {'materializza successore dopo review' if classification=='REVIEW_REQUIRED' else ('nessun aggiornamento necessario' if classification=='NO_CHANGE' else ('materializza successore derivato' if classification=='SAFE_DERIVED' else 'risolvi il blocco'))}\n"
(root/'runtime/USER_CARD.txt').write_text(card,encoding='utf-8',newline='\n')
print(json.dumps(obs,indent=2,ensure_ascii=False)); raise SystemExit(0 if classification!='BLOCKED' else 2)
