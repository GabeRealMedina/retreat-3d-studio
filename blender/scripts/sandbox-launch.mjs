#!/usr/bin/env node
// The unsandboxed launcher handles no MCP messages. Only its confined child
// receives stdin. No fallback to an unrestricted server is permitted.
import { realpath } from 'node:fs/promises';
import { dirname, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';

if (process.platform !== 'darwin') throw new Error('This installation requires the macOS sandbox. No unrestricted fallback.');
const runtime = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const node = await realpath(process.execPath);
const blender = await realpath(process.env.BLENDER_EXECUTABLE || '/Applications/Blender.app/Contents/MacOS/Blender');
if (!blender.endsWith('.app/Contents/MacOS/Blender')) throw new Error('Use a Blender macOS app bundle.');
const bundle = dirname(dirname(dirname(blender)));
const requested = process.env.RETREAT_MODELS_ROOT || join(homedir(), 'Retreat 3D Models');
if (!isAbsolute(requested)) throw new Error('RETREAT_MODELS_ROOT must be absolute.');
// Provision directories during installation, never from this unsandboxed parent:
// the model process can modify workspace symlinks between connections.
const models = await realpath(requested);
const inside = (parent, child) => { const r = relative(parent, child); return r === '' || (!r.startsWith('..') && !isAbsolute(r)); };
for (const protectedPath of [homedir(), runtime, node, bundle, join(homedir(), '.local/share/retreat-3d-tunnel')]) {
  if (inside(models, protectedPath)) throw new Error('The model workspace must not contain home, application code or tunnel credentials.');
}
const home = join(models, '.runtime/home');
const temporary = join(models, '.runtime/tmp');
for (const path of [home, temporary]) {
  if (!inside(models, await realpath(path))) throw new Error('Runtime directories must stay inside the model workspace.');
}
const quote = value => JSON.stringify(value);
const reads = ['/System/Library', '/usr/lib', '/usr/share', '/Library/Apple', '/Library/Fonts', '/private/var/db/timezone', runtime, bundle];
const profile = `(version 1)
(deny default)
(allow process-fork)
(allow process-exec (literal ${quote(node)}) (literal ${quote(blender)}))
(allow signal (target same-sandbox))
(allow sysctl-read)
(allow file-read-metadata)
(allow file-read* (literal "/"))
(allow file-read* ${reads.map(p => `(subpath ${quote(p)})`).join(' ')} (literal ${quote(node)}))
(allow file-map-executable ${reads.map(p => `(subpath ${quote(p)})`).join(' ')} (literal ${quote(node)}))
(allow file-read* file-write* (subpath ${quote(models)}))
(allow file-read* (literal "/dev/random") (literal "/dev/urandom") (literal "/private/etc/localtime"))
(allow file-read* file-write-data (literal "/dev/null") (literal "/dev/zero"))
(allow mach-lookup (global-name "com.apple.system.logger") (global-name "com.apple.system.notification_center"))
(allow ipc-posix-shm-read* (ipc-posix-name "apple.shm.notification_center"))
(allow iokit-open-user-client (iokit-user-client-class "IOSurfaceRootUserClient") (iokit-user-client-class "AGXDeviceUserClient"))
`;
const child = spawn('/usr/bin/sandbox-exec', ['-p', profile, node, join(runtime, 'dist/retreat-index.js')], {
  cwd: models,
  stdio: 'inherit',
  // Do not forward API keys, auth variables, search paths or tunnel settings.
  env: { HOME: home, TMPDIR: temporary + '/', PATH: '/usr/bin:/bin', LANG: 'en_US.UTF-8',
    BLENDER_EXECUTABLE: blender, RETREAT_MODELS_ROOT: models, RETREAT_SANDBOX: 'macos-seatbelt',
    BLENDER_USER_CONFIG: join(home, 'blender-config'), BLENDER_USER_SCRIPTS: join(home, 'blender-scripts'),
    PYTHONNOUSERSITE: '1' },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', error => { console.error('Sandbox launch failed:', error.message); process.exitCode = 1; });
child.on('exit', (code, signal) => {
  if (signal) console.error(`Sandboxed modeling server stopped by ${signal}. No unrestricted fallback.`);
  process.exitCode = code ?? (signal ? 1 : 0);
});
