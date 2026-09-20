import { readFile } from "node:fs/promises";
import { z } from "zod";
import { createServer, formatResult } from "./server.js";
import { BlenderTransport } from "./transport.js";

function python(args: unknown, body: string): string {
  return `import bpy, json, base64\n_args = json.loads(base64.b64decode("${Buffer.from(JSON.stringify(args)).toString("base64")}"))\n${body}`;
}

export function createRetreatServer(transport = new BlenderTransport()) {
  const server = createServer(transport, { name: "retreat-3d-studio", title: "Retreat 3D Studio", version: "0.1.0" });
  server.registerTool("retreat_save_revision", {
    title: "Save New Model Revision",
    description: "Save the current model as a new uniquely named .blend revision in an absolute directory. Never replaces an earlier revision. Saves the active project and clears its unsaved state. Save before disconnecting, then record the returned path for the next conversation.",
    inputSchema: z.object({ directory: z.string().min(1), label: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/) }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async args => {
    try {
      return await formatResult(await transport.execute(python(args, `from pathlib import Path
import datetime, uuid
directory = Path(_args['directory'])
if not directory.is_absolute():
    raise ValueError('Use an absolute directory')
directory.mkdir(parents=True, exist_ok=True)
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
path = directory / (_args['label'] + '-' + stamp + '-' + uuid.uuid4().hex + '.blend')
if path.exists():
    raise ValueError('Revision exists; refusing overwrite')
if 'FINISHED' not in bpy.ops.wm.save_as_mainfile(filepath=str(path), check_existing=False):
    raise RuntimeError('Revision save did not finish')
if not path.is_file() or path.stat().st_size == 0:
    raise RuntimeError('Revision file could not be verified')
_mcp_session['dirty'] = False
result = {'path': str(path), 'bytes': path.stat().st_size, 'label': _args['label'], 'saved': True}
`), 120, false));
    } catch (error) { return { isError: true, content: [{ type: "text" as const, text: String(error) }] }; }
  });
  server.registerTool("retreat_export_glb", {
    title: "Export GLB Model",
    description: "Export scene meshes and materials to an absolute .glb path. Optionally export only selected objects. Existing files require explicit overwrite. This export does not replace saving an editable .blend revision.",
    inputSchema: z.object({ path: z.string().min(1), selected_only: z.boolean().default(false), overwrite: z.boolean().default(false) }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
  }, async args => {
    try {
      return await formatResult(await transport.execute(python(args, `from pathlib import Path
import os, tempfile
path = Path(_args['path'])
if not path.is_absolute() or path.suffix.lower() != '.glb':
    raise ValueError('Use an absolute .glb path')
if path.exists() and not _args['overwrite']:
    raise ValueError('File exists; choose a new path or explicitly allow overwrite')
if _args['selected_only'] and not bpy.context.selected_objects:
    raise ValueError('No selected objects to export')
if not path.parent.is_dir():
    raise ValueError('Output directory does not exist')
with tempfile.TemporaryDirectory(prefix='.retreat-export-', dir=path.parent) as temporary:
    staged = Path(temporary) / 'model.glb'
    status = bpy.ops.export_scene.gltf(filepath=str(staged), export_format='GLB', use_selection=_args['selected_only'])
    if 'FINISHED' not in status or not staged.is_file():
        raise RuntimeError('GLB export did not finish')
    if _args['overwrite']:
        os.replace(staged, path)
    else:
        os.link(staged, path)
result = {'path': str(path), 'bytes': path.stat().st_size, 'format': 'GLB'}
`), 120, false));
    } catch (error) { return { isError: true, content: [{ type: "text" as const, text: String(error) }] }; }
  });
  server.registerTool("retreat_workflow", {
    title: "Read Persistent Modeling Workflow",
    description: "Read the Retreat 3D Studio workflow for creating models, saving revisions and resuming work across conversations. Works in MCP-only clients too.",
    inputSchema: z.object({}).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async () => ({ content: [{ type: "text" as const, text: await readFile(new URL('../skills/retreat-modeling/SKILL.md', import.meta.url), 'utf8') }] }));
  return server;
}
