import json
import pathlib
import runpy
import traceback

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)


def annotation_escape(value):
    return str(value).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')


try:
    runpy.run_path(str(pathlib.Path(__file__).with_name('browser-check.py')), run_name='__main__')
except BaseException as error:
    payload = {
        'ok': False,
        'type': type(error).__name__,
        'message': str(error),
        'traceback': traceback.format_exc(),
    }
    (ART / 'browser-product-error.json').write_text(json.dumps(payload, indent=2), encoding='utf8')
    summary = f'{type(error).__name__}: {error}'
    print(f'::error title=browser-product-check::{annotation_escape(summary)}', flush=True)
    traceback.print_exc()
    raise
