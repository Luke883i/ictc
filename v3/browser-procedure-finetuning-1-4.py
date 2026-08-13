import pathlib, runpy
ROOT=pathlib.Path(__file__).resolve().parent
runpy.run_path(str(ROOT/'browser-procedure-finetuning-1-4-base.py'),run_name='__main__')
runpy.run_path(str(ROOT/'browser-procedure-executive-harmonization-1-5.py'),run_name='__main__')
