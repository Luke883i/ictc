from pathlib import Path
import argparse, shutil, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('--target', required=True)
a = ap.parse_args()
src = Path(__file__).resolve().parent
dst = Path(a.target).expanduser().resolve()
if dst.exists() and any(dst.iterdir()):
    raise SystemExit('Target must be empty')
dst.mkdir(parents=True, exist_ok=True)
for p in src.iterdir():
    if p.name in {'runtime', '__pycache__'}:
        continue
    target = dst / p.name
    if p.is_dir():
        shutil.copytree(p, target, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    else:
        shutil.copy2(p, target)
q = subprocess.run([sys.executable, str(dst/'tools/verify_integrity.py'), str(dst)])
if q.returncode:
    shutil.rmtree(dst)
    raise SystemExit('Installed copy failed integrity verification')
print(dst)
