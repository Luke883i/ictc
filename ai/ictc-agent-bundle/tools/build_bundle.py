from pathlib import Path
import argparse, json, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import build_integrity, deterministic_zip
ap=argparse.ArgumentParser(); ap.add_argument('root',nargs='?',default='.'); ap.add_argument('--zip'); a=ap.parse_args(); root=Path(a.root).resolve()
digest=build_integrity(root); result={'root_digest':digest}
if a.zip: result['zip_sha256']=deterministic_zip(root,Path(a.zip).resolve()); result['zip']=str(Path(a.zip).resolve())
print(json.dumps(result,indent=2))
