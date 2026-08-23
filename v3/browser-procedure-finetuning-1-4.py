import pathlib, runpy
ROOT=pathlib.Path(__file__).resolve().parent
SCRIPTS=['browser-procedure-finetuning-1-4-base.py','browser-procedure-executive-harmonization-1-5.py','browser-surface-truth-rn-controls-2-5.py','browser-surface-truth-2-5.py']
failures=[]
for script in SCRIPTS:
 try:
  runpy.run_path(str(ROOT/script),run_name='__main__')
 except BaseException as error:
  failures.append((script,error)); print(f'browser-procedure-wrapper: failed {script}: {type(error).__name__}: {error}',flush=True)
if failures:
 raise SystemExit(f'{len(failures)} browser procedure subtests failed: '+', '.join(script for script,_ in failures))
