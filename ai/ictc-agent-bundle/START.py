from pathlib import Path
import argparse, subprocess, sys

root = Path(__file__).resolve().parent
ap = argparse.ArgumentParser()
ap.add_argument('--repo')
ap.add_argument('--selftest', action='store_true')
a = ap.parse_args()

def call(script, *args):
    return subprocess.run([sys.executable, str(root/'tools'/script), str(root), *args], text=True)

if call('verify_integrity.py').returncode:
    raise SystemExit(2)
if a.selftest and call('selftest.py').returncode:
    raise SystemExit(2)
if a.repo:
    if call('refresh_from_repo.py', '--repo', a.repo).returncode:
        raise SystemExit(2)
    print((root/'runtime/USER_CARD.txt').read_text(encoding='utf-8'), end='')
else:
    print('ICTC AI Handoff Bundle: integrita PASS.')
    print('Usa --repo /percorso/ictc per osservare il repository corrente.')
