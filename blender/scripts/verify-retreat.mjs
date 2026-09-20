import assert from 'node:assert/strict';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

if (!process.env.BLENDER_EXECUTABLE) throw new Error('Set BLENDER_EXECUTABLE.');
const directory = resolve(process.argv[2] || 'validation-output');
await mkdir(directory, { recursive: true });
const serverPath = process.env.RETREAT_SERVER || fileURLToPath(new URL('../dist/retreat-index.js', import.meta.url));
async function connect() {
  const client = new Client({ name: 'retreat-live-validation', version: '1' });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [serverPath], env: { BLENDER_EXECUTABLE: process.env.BLENDER_EXECUTABLE }, stderr: 'pipe' }));
  return client;
}
let client = await connect();
async function call(name, args = {}, ok = true) {
  const response = await client.callTool({ name, arguments: args }, undefined, { timeout: 360000 });
  assert.equal(Boolean(response.isError), !ok, JSON.stringify(response));
  return response;
}
try {
  const names = (await client.listTools()).tools.map(tool => tool.name);
  assert.equal(names.length, 22);
  assert.ok((await call('retreat_workflow')).content[0].text.includes('retreat_save_revision'));
  await call('retreat_save_revision', { directory: 'relative', label: 'bad' }, false);
  await call('retreat_save_revision', { directory, label: '../escape' }, false);
  await call('bl_execute', { code: `import bpy
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.context.scene.unit_settings.system = 'METRIC'
def box(name, location, scale, color):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    material = bpy.data.materials.new(name + ' finish')
    material.diffuse_color = (*color, 1)
    material.use_nodes = True
    material.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value = (*color, 1)
    material.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value = 0.65
    obj.data.materials.append(material)
    bevel = obj.modifiers.new('Soft edges', 'BEVEL')
    bevel.width = 0.04
    bevel.segments = 3
    return obj
box('Ground', (0,0,-0.12), (9,8,0.2), (0.18,0.24,0.19))
box('Deck', (0,0,0.08), (4.2,3.2,0.2), (0.5,0.31,0.17))
for x in (-1.8,1.8):
    for y in (-1.3,1.3):
        box('Post %s %s' % (x,y), (x,y,1.5), (0.15,0.15,2.8), (0.14,0.17,0.16))
for x in (-1.8,1.8):
    box('Beam %s' % x, (x,0,2.95), (0.2,3.5,0.2), (0.24,0.16,0.1))
for i in range(9):
    box('Roof slat %02d' % i, (0,-1.5+i*0.375,3.1), (4.2,0.14,0.15), (0.46,0.29,0.15))
box('Bench seat', (0,0.65,0.65), (2.3,0.65,0.16), (0.66,0.45,0.26))
for x in (-0.9,0.9):
    box('Bench leg %s' % x, (x,0.65,0.38), (0.16,0.55,0.5), (0.12,0.15,0.14))
bpy.ops.object.camera_add(location=(7,-8,6))
camera = bpy.context.object
camera.rotation_euler = (Vector((0,0,1.1))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 9
bpy.context.scene.camera = camera
bpy.ops.object.light_add(type='AREA', location=(1,-3,7))
bpy.context.object.data.energy = 1800
bpy.context.object.data.shape = 'DISK'
bpy.context.object.data.size = 6
bpy.context.scene.world.color = (0.35,0.35,0.35)
result = {'objects': len(bpy.context.scene.objects)}
` });
  const first = (await call('retreat_save_revision', { directory, label: 'pergola-v1' })).structuredContent.result.path;
  const original = await readFile(first);
  await call('bl_set_transform', { name: 'Bench seat', location: [0,0.9,0.65] });
  const second = (await call('retreat_save_revision', { directory, label: 'pergola-v2' })).structuredContent.result.path;
  assert.notEqual(first, second);
  assert.deepEqual(await readFile(first), original);
  assert.equal((await call('bl_health')).structuredContent.result.dirty, false);
  await client.close();
  client = await connect();
  await call('bl_open_project', { path: second });
  assert.ok(Math.abs((await call('bl_get_object', { name: 'Bench seat' })).structuredContent.result.location[1] - 0.9) < 0.001);
  const glb = join(directory, 'pergola.glb');
  await call('retreat_export_glb', { path: glb });
  assert.equal((await readFile(glb)).subarray(0,4).toString(), 'glTF');
  const exported = await readFile(glb);
  await call('retreat_export_glb', { path: glb }, false);
  assert.deepEqual(await readFile(glb), exported);
  await call('retreat_export_glb', { path: join(directory, 'wrong.obj') }, false);
  await call('retreat_export_glb', { path: glb, overwrite: true });
  assert.equal((await call('bl_health')).structuredContent.result.dirty, false);
  const preview = join(directory, 'preview.png');
  const render = await call('bl_render', { output_path: preview, resolution: [960,720], engine: 'CYCLES', samples: 16 });
  assert.ok(render.content.some(item => item.type === 'image'));
  assert.ok((await stat(preview)).size > 1000);
  // Rendering is tracked conservatively as a mutation by the upstream runtime.
  await call('retreat_save_revision', { directory, label: 'pergola-v2-rendered' });
  // Verify rollback by reopening the original and verifying its original position.
  await call('bl_open_project', { path: first });
  assert.ok(Math.abs((await call('bl_get_object', { name: 'Bench seat' })).structuredContent.result.location[1] - 0.65) < 0.001);
  console.log(JSON.stringify({ ok: true, tools: names.length, first, second, glb, preview, checks: ['revision preservation', 'fresh-session resume', 'GLB signature', 'overwrite refusal', 'explicit overwrite', 'path validation', 'render preview', 'original revision rollback'] }, null, 2));
} finally { await client.close(); }
