#!/usr/bin/env python3
"""One-shot PR274 cutover replay. Payload is a content-addressed byte delta, not a new product owner."""
import hashlib, json, lzma, os, pathlib, shutil, stat, subprocess, sys, tempfile
ROOT = pathlib.Path(os.environ.get('ICTC_REPO_ROOT', pathlib.Path(__file__).resolve().parents[1])).resolve()
PAYLOAD = pathlib.Path(__file__).with_name('cutover-delta.json.xz')
BASE = 'e641526114a508e24f86e8554c027d8cd6bbe715'
EXPECTED_PAYLOAD_SHA256 = 'ff1ebc42b02681445ecd27a694f7444234eb0b66776c8a061b5e3c1db652b477'
EXPECTED_FILES=1411
EXPECTED_TREE = '22d9fb9429336c42be0f61e4710c09ac80642ac1'

def run(*args,**kwargs):
    return subprocess.check_output(args, cwd=ROOT, **kwargs).decode().strip()

def sha(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()

def main():
    assert ROOT.joinpath('.git').exists(), 'must run in a Git worktree'
    assert run('git','rev-parse','HEAD') != BASE, 'must work on PR branch'
    assert run('git','status','--porcelain') == '', 'worktree must be clean'
    assert run('git','cat-file','-t', BASE) == 'commit', 'real base commit absent'
    blob = PAYLOAD.read_bytes()
    assert hashlib.sha256(blob).hexdigest() == EXPECTED_PAYLOAD_SHA256, 'payload SHA mismatch'
    records=json.loads(lzma.decompress(blob))
    assert len(records)==EXPECTED_FILES, 'candidate denominator mismatch'
    targetpaths={r[0] for r in records}
    assert len(targetpaths)==EXPECTED_FILES and not any(x.startswith('v3/') for x in targetpaths), 'path collision or v3 leakage'
    with tempfile.TemporaryDirectory(prefix='ictc-pr274-replay-') as td:
        source=pathlib.Path(td,'source');candidate=pathlib.Path(td,'candidate')
        source.mkdir();candidate.mkdir()
        # No synthetic history: extract from the real exact Git merge base, not checkout working files.
        proc=subprocess.Popen(['git','archive','--format=tar',BASE],cwd=ROOT,stdout=subprocess.PIPE)
        subprocess.check_call(['tar','-xf','-','-C',str(source)],stdin=proc.stdout)
        proc.stdout.close();assert proc.wait()==0,'archive process failed'
        for entry in records:
            dest,src=entry[0],entry[1]
            assert not pathlib.PurePosixPath(dest).is_absolute() and '..' not in pathlib.PurePosixPath(dest).parts, dest
            assert not pathlib.PurePosixPath(src).is_absolute() and '..' not in pathlib.PurePosixPath(src).parts,src
            original=source.joinpath(src)
            assert original.is_file(), f'missing preimage: {src}'
            b=original.read_bytes()
            if len(entry)==3:
                # Strictly reverse order, all offsets relative to unmodified preimage.
                for start,end,replacement in reversed(entry[2]):
                    assert isinstance(start,int) and 0<=start<=end<=len(b),'invalid delta offset'
                    b=b[:start]+replacement.encode('utf-8')+b[end:]
            p=candidate.joinpath(dest);p.parent.mkdir(parents=True,exist_ok=True)
            p.write_bytes(b)
            p.chmod(stat.S_IMODE(original.stat().st_mode))
        result=set(p.relative_to(candidate).as_posix() for p in candidate.rglob('*') if p.is_file())
        assert result==targetpaths, 'result inventory mismatch'
        exe=sorted(x for x in result if candidate.joinpath(x).stat().st_mode & stat.S_IXUSR)
        assert exe == ['.devcontainer/post-create.sh','.devcontainer/post-start.sh','ictc.sh','scripts/visual-check.sh'],f'executable bit mismatch {exe}'
        # Delete all tracked files, preserving .git; copy candidate and stage exactly once.
        tracked=run('git','ls-files','-z').split('\0')[:-1]
        for p in tracked:
            path=ROOT/p
            if path.is_symlink() or path.is_file():path.unlink()
        for path in candidate.rglob('*'):
            if path.is_file():
                dest=ROOT/path.relative_to(candidate)
                dest.parent.mkdir(parents=True,exist_ok=True)
                shutil.copy2(path,dest)
        run('git','add','-A')
        files=run('git','ls-files','-z').split('\0')[:-1]
        assert len(files)==EXPECTED_FILES and not any(p.startswith('v3/') for p in files), 'index not fully migrated'
        final_tree=run('git','write-tree')
        if EXPECTED_TREE:assert final_tree==EXPECTED_TREE, f'tree mismatch {final_tree} != {EXPECTED_TREE}'
        print(json.dumps({'verified':True,'files':len(files),'v3':0,'tree':final_tree,'base':BASE,'delta_sha256':EXPECTED_PAYLOAD_SHA256}))

if __name__ == '__main__': main()