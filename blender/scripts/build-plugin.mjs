import { cp, mkdir, readFile, writeFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const source = fileURLToPath(new URL('../', import.meta.url));
const template = fileURLToPath(new URL('../../plugins/retreat-3d-studio', import.meta.url));
const destination = resolve(process.argv[2] || fileURLToPath(new URL('../../plugins/retreat-3d-studio', import.meta.url)));
const modelRoot = resolve(process.env.RETREAT_MODELS_ROOT || join(homedir(), 'Retreat 3D Models'));
await mkdir(modelRoot, { recursive: true });
if (await realpath(modelRoot) !== modelRoot) throw new Error('Choose a canonical model workspace path, not a symlink.');
for (const part of ['.runtime', '.runtime/home', '.runtime/tmp']) {
  const directory = join(modelRoot, part);
  await mkdir(directory, { recursive: false }).catch(error => { if (error.code !== 'EEXIST') throw error; });
  if (await realpath(directory) !== directory) throw new Error('Model runtime directories must not be symlinks.');
}
execFileSync(process.execPath, [join(source, 'node_modules/typescript/bin/tsc')], { cwd: source, stdio: 'inherit' });
await mkdir(join(destination, '.codex-plugin'), { recursive: true });
const runtime = join(destination, 'runtime');
for (const item of ['dist', 'scripts', 'skills', 'node_modules', 'package.json', 'LICENSE', 'UPSTREAM.md']) {
  await cp(join(source, item), join(runtime, item), { recursive: true });
}
await cp(join(source, 'skills'), join(destination, 'skills'), { recursive: true });
await cp(join(source, 'LICENSE'), join(destination, 'LICENSE'));
const manifest = JSON.parse(await readFile(join(template, '.codex-plugin/plugin.json'), 'utf8'));
await writeFile(join(destination, 'README.md'), await readFile(join(template, 'README.md'), 'utf8'));
manifest.mcpServers = './.mcp.json';
await writeFile(join(destination, '.codex-plugin/plugin.json'), JSON.stringify(manifest, null, 2) + '\n');
const entry = { command: process.execPath, args: [join(runtime, 'scripts/sandbox-launch.mjs')], env: {
  BLENDER_EXECUTABLE: process.env.BLENDER_EXECUTABLE || '/Applications/Blender.app/Contents/MacOS/Blender',
  RETREAT_MODELS_ROOT: modelRoot,
} };
await writeFile(join(destination, '.mcp.json'), JSON.stringify({ mcpServers: { 'retreat-3d-studio': entry } }, null, 2) + '\n');
await writeFile(join(destination, 'mcp-config.toml'), `[mcp_servers.retreat-3d-studio]\ncommand = ${JSON.stringify(entry.command)}\nargs = ${JSON.stringify(entry.args)}\ntool_timeout_sec = 360\n[mcp_servers.retreat-3d-studio.env]\n${Object.entries(entry.env).map(([key,value]) => `${key} = ${JSON.stringify(value)}`).join('\n')}\n`);
console.log(`Built plugin: ${destination}`);
