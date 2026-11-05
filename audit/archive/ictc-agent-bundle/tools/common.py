from __future__ import annotations
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, os, subprocess, zipfile

INTEGRITY_FILES = {'bundle_manifest.json', 'SHA256SUMS.txt', 'ROOT_DIGEST.txt'}
EXCLUDED_PREFIXES = ('runtime/', '__pycache__/', '.pytest_cache/')

def now():
    return datetime.now(timezone.utc).isoformat()

def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))

def write_json(path, obj):
    p = Path(path); p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + '\n', encoding='utf-8', newline='\n')

def sha256_file(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def git_object_id(kind, data, algorithm='sha1'):
    if algorithm != 'sha1':
        raise ValueError('Only SHA-1 Git object format is supported')
    header = f'{kind} {len(data)}\0'.encode('ascii')
    return hashlib.sha1(header + data).hexdigest()

def rel_files(root, include_integrity=False):
    root = Path(root)
    out = []
    for p in root.rglob('*'):
        if not p.is_file(): continue
        rel = p.relative_to(root).as_posix()
        if any(rel.startswith(x) for x in EXCLUDED_PREFIXES): continue
        if '/__pycache__/' in f'/{rel}/' or rel.endswith(('.pyc', '.pyo')): continue
        if not include_integrity and rel in INTEGRITY_FILES: continue
        out.append(rel)
    return sorted(out)

def build_integrity(root):
    root = Path(root)
    files = []
    for rel in rel_files(root):
        p = root / rel
        files.append({'path': rel, 'bytes': p.stat().st_size, 'sha256': sha256_file(p)})
    manifest = {'schema_version':'1.0.0', 'algorithm':'sha256', 'files':files}
    write_json(root/'bundle_manifest.json', manifest)
    sums = ''.join(f"{x['sha256']}  {x['path']}\n" for x in files)
    (root/'SHA256SUMS.txt').write_text(sums, encoding='utf-8', newline='\n')
    digest_raw = ''.join(f"{x['path']}\0{x['sha256']}\n" for x in files).encode('utf-8')
    digest = hashlib.sha256(digest_raw).hexdigest()
    (root/'ROOT_DIGEST.txt').write_text(digest + '\n', encoding='utf-8', newline='\n')
    return digest

def verify_integrity(root):
    root = Path(root)
    errors = []
    try: manifest = read_json(root/'bundle_manifest.json')
    except Exception as e: return {'status':'FAIL','errors':[f'MANIFEST {e}']}
    expected = sorted(x['path'] for x in manifest.get('files', []))
    actual = rel_files(root)
    if actual != expected: errors.append('FILE_SET')
    by_path = {x['path']:x for x in manifest.get('files', [])}
    for rel in expected:
        p = root/rel
        if not p.is_file(): errors.append('MISSING '+rel); continue
        if sha256_file(p) != by_path[rel]['sha256']: errors.append('HASH '+rel)
        if p.stat().st_size != by_path[rel]['bytes']: errors.append('SIZE '+rel)
    sums = ''.join(f"{by_path[r]['sha256']}  {r}\n" for r in expected)
    if not (root/'SHA256SUMS.txt').is_file() or (root/'SHA256SUMS.txt').read_text(encoding='utf-8') != sums:
        errors.append('SHA256SUMS')
    raw = ''.join(f"{r}\0{by_path[r]['sha256']}\n" for r in expected).encode('utf-8')
    digest = hashlib.sha256(raw).hexdigest()
    if not (root/'ROOT_DIGEST.txt').is_file() or (root/'ROOT_DIGEST.txt').read_text(encoding='utf-8').strip() != digest:
        errors.append('ROOT_DIGEST')
    return {'status':'PASS' if not errors else 'FAIL','controlled_files':len(expected),'root_digest':digest,'errors':errors}

def deterministic_zip(root, output):
    root = Path(root); output = Path(output); output.parent.mkdir(parents=True, exist_ok=True)
    files = rel_files(root, include_integrity=True)
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for rel in files:
            data = (root/rel).read_bytes()
            info = zipfile.ZipInfo(rel, date_time=(1980,1,1,0,0,0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = (0o100644 << 16)
            z.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return sha256_file(output)

def run(argv, cwd=None, timeout=600):
    return subprocess.run([str(x) for x in argv], cwd=cwd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=timeout)

def git(repo, *args, timeout=120):
    env = {**os.environ, 'GIT_TERMINAL_PROMPT':'0', 'GIT_CONFIG_COUNT':'1', 'GIT_CONFIG_KEY_0':'safe.directory', 'GIT_CONFIG_VALUE_0':str(Path(repo).resolve())}
    return subprocess.run(['git','-C',str(Path(repo).resolve()),*map(str,args)], env=env, capture_output=True, text=False, timeout=timeout)
