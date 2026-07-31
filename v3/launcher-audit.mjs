import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { access, chmod, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const launcher = await readFile(path.join(root, 'ictc.sh'), 'utf8');
const legacy = await readFile(path.join(root, 'ictc-v2.sh'), 'utf8');
const current = await readFile(path.join(root, 'ictc-v3.sh'), 'utf8');
const devcontainer = JSON.parse(await readFile(path.join(root, '.devcontainer/devcontainer.json'), 'utf8'));

for (const file of ['ictc.sh','ictc-v2.sh','ictc-v3.sh','.devcontainer/post-create.sh','.devcontainer/post-start.sh']) {
  await access(path.join(root, file));
  const result = spawnSync('bash', ['-n', path.join(root, file)], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${file}: ${result.stderr}`);
}
for (const profile of ['current','v3','v2','all']) assert.ok(launcher.includes(profile));
for (const command of ['start','stop','restart','status','logs','doctor','test','audit','codespace']) assert.ok(launcher.includes(command), `launcher senza ${command}`);
assert.match(launcher, /GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN/);
assert.match(launcher, /run_v3 status \|\| rc=1/);
assert.match(launcher, /run_v2 status \|\| rc=1/);
assert.match(legacy, /server\.mjs/);
assert.match(current, /nohup node v3\/server\.mjs/);
for (const [name, source] of [['v3', current], ['v2', legacy]]) {
  assert.match(source, /printf '%s\\n' "\$!" > "\$tmp"/, `${name}: PID del processo Node non scritto direttamente`);
  assert.ok(!/cd[^\n]*&&[^\n]*nohup[^\n]*&[^\n]*(echo|printf)[^\n]*\$!/.test(source), `${name}: race PID su AND-list in background`);
  assert.match(source, /if health; then fail .*non.*PID/s, `${name}: servizio non posseduto non rilevato`);
}
assert.ok(devcontainer.forwardPorts.includes(4173));
assert.equal(devcontainer.portsAttributes['4173'].visibility, 'private');
assert.match(devcontainer.postStartCommand, /post-start\.sh/);

const freePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.unref();
  server.on('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    server.close(error => error ? reject(error) : resolve(port));
  });
});
const sandbox = await mkdtemp(path.join(os.tmpdir(), 'ictc-launcher-audit-'));
const state = path.join(sandbox, 'state');
const runtime = path.join(sandbox, 'runtime');
const currentPort = await freePort();
let legacyPort = await freePort();
while (legacyPort === currentPort) legacyPort = await freePort();
const mock = `import http from 'node:http';\nconst port=Number(process.env.PORT||4173);\nconst host=process.env.ICTC_HOST||process.env.HOST||'127.0.0.1';\nconst server=http.createServer((req,res)=>{res.setHeader('content-type','application/json');if(req.url==='/api/health')return res.end(JSON.stringify({ok:true,service:'mock'}));if(req.url==='/api/runtime/integrity')return res.end(JSON.stringify({ok:true,eventCount:0,head:'GENESIS'}));res.statusCode=404;res.end(JSON.stringify({error:'not found'}));});\nserver.listen(port,host);\nfor(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));\n`;
const run = (args, expected = 0) => {
  const result = spawnSync('bash', [path.join(sandbox, 'ictc.sh'), ...args], {
    cwd: sandbox,
    encoding: 'utf8',
    env: {
      ...process.env,
      ICTC_NO_OPEN: '1',
      ICTC_PORT: String(currentPort),
      ICTC_LEGACY_PORT: String(legacyPort),
      ICTC_STATE_DIR: state,
      ICTC_RUNTIME_DIR: runtime
    }
  });
  assert.equal(result.status, expected, `${args.join(' ')}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  return result.stdout;
};
try {
  await mkdir(path.join(sandbox, 'v3'), { recursive: true });
  for (const file of ['ictc.sh','ictc-v2.sh','ictc-v3.sh']) {
    await copyFile(path.join(root, file), path.join(sandbox, file));
    await chmod(path.join(sandbox, file), 0o755);
  }
  await writeFile(path.join(sandbox, 'server.mjs'), mock);
  await writeFile(path.join(sandbox, 'v3/server.mjs'), mock);
  run(['start', '--profile', 'current', '--no-open']);
  assert.match(run(['status', '--profile', 'current']), /profile=v3 processo=attivo .* health=ok/);
  run(['stop', '--profile', 'current']);
  run(['start', '--profile', 'all', '--no-open']);
  const allStatus = run(['status', '--profile', 'all']);
  assert.match(allStatus, /profile=v3 processo=attivo .* health=ok/);
  assert.match(allStatus, /profile=v2 processo=attivo .* health=ok/);
  run(['stop', '--profile', 'all']);
  run(['status', '--profile', 'all'], 1);
} finally {
  spawnSync('bash', [path.join(sandbox, 'ictc.sh'), 'stop', '--profile', 'all'], {
    cwd: sandbox,
    encoding: 'utf8',
    env: { ...process.env, ICTC_NO_OPEN: '1', ICTC_PORT: String(currentPort), ICTC_LEGACY_PORT: String(legacyPort), ICTC_STATE_DIR: state, ICTC_RUNTIME_DIR: runtime }
  });
  await rm(sandbox, { recursive: true, force: true });
}

console.log('launcher-audit: ok (profiles current/v3/v2/all, durable PID ownership, combined status, Codespaces)');
