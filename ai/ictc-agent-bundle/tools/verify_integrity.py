from pathlib import Path
import json, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import verify_integrity
root = Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
result = verify_integrity(root)
print(json.dumps(result, indent=2))
raise SystemExit(0 if result['status']=='PASS' else 2)
