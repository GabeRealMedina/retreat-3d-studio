#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

// Use the installed plugin's configuration so rebuilding the plugin keeps the
// tunnel's executable and Blender environment in sync. Never print config/keys.
const file = join(homedir(), 'plugins', 'retreat-3d-studio', '.mcp.json');
const config = JSON.parse(await readFile(file, 'utf8')).mcpServers?.['retreat-3d-studio'];
if (!config?.command || !Array.isArray(config.args)) {
  throw new Error('Install Retreat 3D Studio before starting its tunnel.');
}
const expected = join(homedir(), 'plugins', 'retreat-3d-studio', 'runtime/scripts/sandbox-launch.mjs');
if (config.args.length !== 1 || config.args[0] !== expected) {
  throw new Error('The private tunnel requires the isolated Retreat launcher. Rebuild the installed plugin.');
}
const child = spawn(config.command, config.args, {
  stdio: 'inherit',
  env: { HOME: homedir(), PATH: '/usr/bin:/bin',
    BLENDER_EXECUTABLE: config.env?.BLENDER_EXECUTABLE,
    RETREAT_MODELS_ROOT: config.env?.RETREAT_MODELS_ROOT },
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', error => { console.error('Unable to launch Retreat 3D Studio:', error.message); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
