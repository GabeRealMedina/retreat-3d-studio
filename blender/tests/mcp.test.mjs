import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile, readFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { BlenderTransport } from '../dist/transport.js';
import { BL_TOOLS } from '../dist/tools.js';

const root = new URL('../', import.meta.url);
const python = process.env.PYTHON || 'python3';
const fixture = fileURLToPath(new URL('tests/fake_blender.py', root));

async function launcher(directory) {
  const path = join(directory, 'fixture blender');
  const executable = execFileSync(python, ['-c', 'import sys; print(sys.executable)'], {encoding:'utf8'}).trim();
  await writeFile(path, `#!${executable}
import runpy
runpy.run_path(${JSON.stringify(fixture)}, run_name="__main__")
`);
  await chmod(path, 0o755);
  return path;
}

test('typed bpy scripts compile, including unicode and hostile-looking argument strings', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'fnf-blender-compile-'));
  try {
    const scripts = BL_TOOLS.map(tool => tool.code({ name: '"\\\nБлендер ${danger}', code: 'result = 42', path: '/tmp/test.blend' }));
    const path = join(directory, 'scripts.json');
    await writeFile(path, JSON.stringify(scripts));
    execFileSync(python, ['-c', 'import json,sys\nfor code in json.load(open(sys.argv[1])): compile(code, "<test>", "exec")', path]);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('a failed render restores scene settings and respects existing output files', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'fnf-blender-render-'));
  try {
    const output = join(directory, 'render.png');
    const tool = BL_TOOLS.find(t => t.name === 'bl_render');
    const source = tool.code({ output_path: output, resolution: [128, 128], engine: 'CYCLES', samples: 8 });
    const file = join(directory, 'render.py');
    await writeFile(file, source);
    execFileSync(python, ['-c', `
import sys, types
from pathlib import Path
S = types.SimpleNamespace
render = S(engine='BLENDER_EEVEE_NEXT', resolution_x=1920, resolution_y=1080, resolution_percentage=50, filepath='original', image_settings=S(file_format='JPEG'))
scene = S(camera=object(), render=render, cycles=S(samples=64))
calls = []
def fail(**kwargs):
    calls.append(1)
    assert render.engine == 'CYCLES' and render.resolution_percentage == 100 and scene.cycles.samples == 8
    raise RuntimeError('render failed')
bpy = types.ModuleType('bpy')
bpy.context = S(scene=scene)
bpy.ops = S(render=S(render=fail))
sys.modules['bpy'] = bpy
code = Path(sys.argv[1]).read_text()
try: exec(code)
except RuntimeError as error: assert str(error) == 'render failed'
else: raise AssertionError('Expected render failure')
assert (render.engine, render.resolution_x, render.resolution_y, render.resolution_percentage, render.filepath, render.image_settings.file_format, scene.cycles.samples) == ('BLENDER_EEVEE_NEXT', 1920, 1080, 50, 'original', 'JPEG', 64)
output = Path(sys.argv[2])
output.write_text('preserve')
try: exec(code)
except ValueError as error: assert 'exists' in str(error)
else: raise AssertionError('Expected overwrite guard')
assert output.read_text() == 'preserve' and len(calls) == 1
`, file, output]);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('stdio MCP owns a persistent process, returns images/errors, and cleans up on disconnect', {timeout:20000}, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'fnf-background-mcp-'));
  const executable = await launcher(directory);
  const client = new Client({name:'fixture-client', version:'1'});
  let pid;
  try {
    await client.connect(new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('dist/index.js',root))],env:{BLENDER_EXECUTABLE:executable},stderr:'pipe'}));
    const tools = (await client.listTools()).tools;
    assert.equal(tools.length,19);
    assert.equal(tools.some(tool => tool.name === 'bl_screenshot'),false);
    const call = async (name,args={}) => client.callTool({name,arguments:args});
    const health = await call('bl_health');
    assert.equal(health.structuredContent.result.background,true);
    pid = health.structuredContent.result.pid;
    assert.equal(health.structuredContent.result.version,'fixture-4.2');
    assert.equal(health.structuredContent.result.dirty,false);
    const project=join(directory,'scene.blend');
    await writeFile(project,'fixture');
    await call('bl_execute',{code:`import bpy, types
bpy.ops = types.SimpleNamespace(wm=types.SimpleNamespace(save_as_mainfile=lambda **kw: {'FINISHED'}, open_mainfile=lambda **kw: {'FINISHED'}))`});
    assert.equal((await call('bl_health')).structuredContent.result.dirty,true);
    assert.equal((await call('bl_open_project',{path:project})).isError,true);
    await call('bl_save_project',{path:project,overwrite:true});
    assert.equal((await call('bl_health')).structuredContent.result.dirty,false);
    assert.equal(Boolean((await call('bl_open_project',{path:project})).isError),false);
    await call('bl_execute',{code:"import bpy\nbpy.context.scene.name = 'partial'\nraise ValueError('after edit')"});
    assert.equal((await call('bl_health')).structuredContent.result.dirty,true);
    assert.equal((await call('bl_save_project',{path:project})).isError,true);
    assert.equal((await call('bl_open_project',{path:project})).isError,true);
    await call('bl_execute',{code:"import bpy\nbpy.ops.wm.save_as_mainfile = lambda **kw: {'CANCELLED'}"});
    assert.equal((await call('bl_save_project',{path:project,overwrite:true})).isError,true);
    assert.equal((await call('bl_health')).structuredContent.result.dirty,true);
    await call('bl_open_project',{path:project,discard_unsaved:true});
    assert.equal((await call('bl_health')).structuredContent.result.dirty,false);

    await call('bl_execute',{code:"import bpy\nbpy.context.scene.name = 'persisted'\nprint('hello')\nresult = 42"});
    assert.equal((await call('bl_health')).structuredContent.result.scene,'persisted');
    const result = await call('bl_execute',{code:"result = {'answer':42}"});
    assert.deepEqual((await call('bl_job_status',{job_id:result.structuredContent.job_id})).structuredContent.result,{answer:42});
    assert.equal((await call('bl_execute',{code:"raise ValueError('expected')"})).isError,true);
    assert.equal((await call('bl_health',{unexpected:true})).isError,true);
    const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP9sAAAAASUVORK5CYII=';
    const image=await call('bl_execute',{code:`result = {'pngBase64': '${png}'}`});
    assert.equal(image.content.find(c=>c.type==='image').data,png);
    assert.equal(image.structuredContent.result.pngBase64,undefined);
    assert.match((await call('bl_get_skill',{name:'modeling'})).content[0].text,/Modeling/);
  } finally {
    await client.close();
    if (pid) {
      for(let i=0;i<30;i++) { try { process.kill(pid,0); } catch { break; } await delay(100); }
      assert.throws(()=>process.kill(pid,0), {code:'ESRCH'});
    }
    await rm(directory,{recursive:true,force:true});
  }
});

test('timeout retains the original job, rejects overlapping edits, and isolates MCP sessions', {timeout:15000}, async () => {
  const directory=await mkdtemp(join(tmpdir(),'fnf-background-jobs-'));
  const executable=await launcher(directory);
  const a=new BlenderTransport({executable}), b=new BlenderTransport({executable});
  try {
    const marker=join(directory,'once');
    let id;
    try { await a.execute(`import time\nwith open(${JSON.stringify(marker)}, 'a') as f: f.write('once\\n')\ntime.sleep(0.5)\nimport bpy\nbpy.context.scene.name = 'changed'\nresult = 42`,0.05); assert.fail('expected timeout'); }
    catch(error) { id=/job_id=([a-f0-9]{32})/.exec(error.message)?.[1]; assert.ok(id,error.message); }
    await assert.rejects(a.execute('result = 9'),/Blender is busy/);
    assert.equal((await a.status(id)).state,'running');
    await delay(600);
    assert.equal((await a.status(id)).result,42);
    assert.equal(await readFile(marker,'utf8'),'once\n');
    assert.equal((await a.execute('import bpy\nresult = bpy.context.scene.name')).result,'changed');
    assert.equal((await b.execute('import bpy\nresult = bpy.context.scene.name')).result,'Scene');
  } finally { await Promise.all([a.close(),b.close()]); await rm(directory,{recursive:true,force:true}); }
});

test('process death preserves uncertain job status and never restarts silently', {timeout:15000}, async () => {
  const directory=await mkdtemp(join(tmpdir(),'fnf-background-crash-'));
  const transport=new BlenderTransport({executable:await launcher(directory)});
  try {
    const result=await transport.execute('import os\nos._exit(7)');
    assert.equal(result.ok,false);
    assert.match(result.error,/Completion is uncertain/);
    assert.equal((await transport.status(result.job_id)).ok,false);
    await assert.rejects(transport.execute('result = 42'),/Restart the MCP connection/);
  } finally { await transport.close(); await rm(directory,{recursive:true,force:true}); }
});

test('CLI persists executable paths and rejects removed commands or missing executables', async () => {
  const directory=await mkdtemp(join(tmpdir(),'fnf-background-cli-'));
  try {
    const executable=await launcher(directory);
    const config=JSON.parse(execFileSync(process.execPath,['dist/cli.js','config','--blender',executable],{cwd:root,encoding:'utf8'}));
    assert.equal(config.mcpServers['higgsfield-use-blender'].env.BLENDER_EXECUTABLE,executable);
    assert.equal(config.mcpServers['higgsfield-use-blender'].command,process.execPath);
    const doctor=JSON.parse(execFileSync(process.execPath,['dist/cli.js','doctor','--blender',executable],{cwd:root,encoding:'utf8'}));
    assert.equal(doctor.result.background,true);
    for(const args of [['install-addon'],['launch'],['doctor','--blender',directory],['doctor','--blender',join(directory,'missing')]]) {
      assert.throws(()=>execFileSync(process.execPath,['dist/cli.js',...args],{cwd:root,stdio:'pipe'}));
    }
  } finally { await rm(directory,{recursive:true,force:true}); }
});

test('startup failures time out and bounded history evicts old results', {timeout:15000}, async () => {
  const directory=await mkdtemp(join(tmpdir(),'fnf-background-limits-'));
  const executable=await launcher(directory);
  const hung=join(directory,'hung');
  const pythonPath=execFileSync(python,['-c','import sys; print(sys.executable)'],{encoding:'utf8'}).trim();
  await writeFile(hung,`#!${pythonPath}\nimport time\ntime.sleep(60)\n`); await chmod(hung,0o755);
  const bad=new BlenderTransport({executable:hung,startupTimeoutMs:50});
  const transport=new BlenderTransport({executable});
  try {
    await assert.rejects(bad.execute('result = 1'),/startup timed out/);
    const first=await transport.execute('result = 0');
    for(let i=0;i<128;i++) assert.equal((await transport.execute(`result = ${i}`)).ok,true);
    await assert.rejects(transport.status(first.job_id),/Unknown job_id/);
  } finally { await Promise.all([bad.close(),transport.close()]); await rm(directory,{recursive:true,force:true}); }
});
