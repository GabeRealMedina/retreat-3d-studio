import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, access, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = await mkdtemp(join(tmpdir(), 'fnf-blender-package-'));
const client = new Client({ name: 'package-check', version: '1' });
try {
  const packed = JSON.parse(execFileSync('npm', ['pack', '--json'], { cwd: root, encoding: 'utf8' }))[0];
  assert.ok(!packed.files.some(file => /__pycache__|\.pyc$|^addon\//.test(file.path)));
  assert.ok(!packed.files.some(file => /install_addon|launch\.py/.test(file.path)));
  const archive = join(root, packed.filename);
  execFileSync('npm', ['install', '--prefix', directory, '--ignore-scripts', '--no-audit', '--no-fund', archive], { stdio: 'pipe' });
  const installed = join(directory, 'node_modules/fnf-blender-mcp');
  for (const path of ['scripts/background_runner.py', 'skills/use-blender/SKILL.md']) await access(join(installed, path));
  const skillFiles = (await readdir(join(root, 'skills'), { recursive: true })).filter(path => path.endsWith('.md'));
  for (const path of skillFiles) {
    assert.deepEqual(await readFile(join(installed, 'skills', path)), await readFile(join(root, 'skills', path)), `Packaged skill differs: ${path}`);
  }
  const config = JSON.parse(execFileSync(process.execPath, [join(installed, 'dist/cli.js'), 'config', '--blender', process.execPath], { encoding: 'utf8' }));
  assert.equal(config.mcpServers['higgsfield-use-blender'].args[0], await realpath(join(installed, 'dist/index.js')));
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [join(installed, 'dist/index.js')], env: { BLENDER_EXECUTABLE: join(directory, 'missing-blender') }, stderr: 'pipe' }));
  assert.equal((await client.listTools()).tools.length, 19);
  const skill = await client.callTool({ name: 'bl_get_skill', arguments: { name: 'blender-scene' } });
  assert.equal(skill.content[0].text, await readFile(join(installed, 'skills/blender-scene/SKILL.md'), 'utf8'));
  const health = await client.callTool({ name: 'bl_health', arguments: {} });
  assert.equal(health.isError, true);
  assert.match(health.content[0].text, /BLENDER_EXECUTABLE/);
  console.log(`Package verified from isolated install: ${packed.filename}; 19 tools, ${skillFiles.length} matching skill documents, setup files and actionable missing-Blender error.`);
} finally {
  await client.close();
  await rm(directory, { recursive: true, force: true });
}
