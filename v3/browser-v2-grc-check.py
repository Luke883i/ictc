"""V2 browser capability regression under the current successor edition.

The V4 product keeps the V2 GRC processes AO/MC/AP/RC/AR and the V3 guided
all-service semantics. To avoid two divergent browser copies, this historical
entry point delegates to the canonical successor all-service journey.
"""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('browser-v3-all-service.py')), run_name='__main__')
