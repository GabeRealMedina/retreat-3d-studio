import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const models = process.env.RETREAT_MODELS_ROOT || join(homedir(), 'Retreat 3D Models');
const launcher = process.env.RETREAT_SERVER || fileURLToPath(new URL('./sandbox-launch.mjs', import.meta.url));
const outside = await mkdtemp(join(tmpdir(), 'retreat-denied-'));
const sentinel = join(outside, 'unrelated-file.png');
await writeFile(sentinel, 'synthetic isolation test; not personal data');
const probe = await mkdtemp(join(models, '.sandbox-probe-'));
await symlink(sentinel, join(probe, 'outside-link'));
const client = new Client({ name: 'retreat-isolation-test', version: '1' });
try {
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [launcher],
    env: { BLENDER_EXECUTABLE: process.env.BLENDER_EXECUTABLE || '/Applications/Blender.app/Contents/MacOS/Blender',
      RETREAT_MODELS_ROOT: models, RETREAT_PRIVATE_CANARY: 'must-not-reach-modeling' }, stderr: 'inherit' }));
  const data = { sentinel, probe, credential: join(homedir(), '.local/share/retreat-3d-tunnel/runtime-key'),
    runtime: join(process.env.RETREAT_RUNTIME || fileURLToPath(new URL('../', import.meta.url)), 'scripts/sandbox-launch.mjs'), node: process.execPath };
  const code = `import os, socket, subprocess, json, errno
p = json.loads(${JSON.stringify(JSON.stringify(data))})
checks = {}
def denied(name, fn):
    try:
        fn()
    except OSError as error:
        checks[name] = error.errno in (errno.EPERM, errno.EACCES)
    else:
        checks[name] = False
def open_close(path, flags):
    fd = os.open(path, flags)
    os.close(fd)
denied('outside_read', lambda: open_close(p['sentinel'], os.O_RDONLY))
# Open only: never read, print or return the actual credential, even on failure.
denied('credential_read', lambda: open_close(p['credential'], os.O_RDONLY))
denied('outside_write', lambda: open_close(p['sentinel'] + '.write-test', os.O_WRONLY | os.O_CREAT | os.O_EXCL))
denied('symlink_escape', lambda: open_close(p['probe'] + '/outside-link', os.O_RDONLY))
denied('runtime_write', lambda: open_close(p['runtime'], os.O_WRONLY))
denied('shell_execution', lambda: subprocess.run(['/bin/sh', '-c', 'exit 0'], check=True))
def connect_to(host):
    with socket.socket() as sock:
        sock.settimeout(2)
        sock.connect((host, 443))
denied('internet_connection', lambda: connect_to('1.1.1.1'))
denied('localhost_connection', lambda: connect_to('127.0.0.1'))
checks['environment_clean'] = 'RETREAT_PRIVATE_CANARY' not in os.environ
checks['sandbox_marker'] = os.environ.get('RETREAT_SANDBOX') == 'macos-seatbelt'
child_code = "const fs=require('fs');try{fs.readFileSync(process.argv[1]);process.exit(2)}catch(e){process.exit(['EPERM','EACCES'].includes(e.code)?0:3)}"
child = subprocess.run([p['node'], '-e', child_code, p['sentinel']], capture_output=True)
checks['child_process_confined'] = child.returncode == 0
with open(p['probe'] + '/inside.txt', 'w') as output:
    output.write('allowed')
with open(p['probe'] + '/inside.txt') as source:
    checks['workspace_read_write'] = source.read() == 'allowed'
result = checks
`;
  const response = await client.callTool({ name: 'bl_execute', arguments: { code } }, undefined, { timeout: 120000 });
  assert.equal(Boolean(response.isError), false, JSON.stringify(response));
  const checks = response.structuredContent.result;
  for (const [name, passed] of Object.entries(checks)) assert.equal(passed, true, name);
  // The MCP formatter also runs in the sandbox, so its image reader cannot be
  // tricked into returning an arbitrary file from outside the workspace.
  const preview = await client.callTool({ name: 'bl_execute', arguments: {
    code: `result = {'output_path': ${JSON.stringify(sentinel)}}`,
  } });
  assert.ok(!preview.content.some(item => item.type === 'image'));
  assert.equal(await readFile(sentinel, 'utf8'), 'synthetic isolation test; not personal data');
  console.log(JSON.stringify({ ok: true, checks: { ...checks, mcp_image_reader_confined: true } }, null, 2));
} finally {
  await client.close();
  await rm(probe, { recursive: true, force: true });
  await rm(outside, { recursive: true, force: true });
}
