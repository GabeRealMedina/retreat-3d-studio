import { z } from "zod";
import * as schemas from "./schemas.js";

export interface BlenderTool {
  name: string;
  title: string;
  description: string;
  schema: z.ZodObject;
  code: (args: Record<string, unknown>) => string;
  readOnly: boolean;
}

const readTools = new Set(["bl_get_scene_summary", "bl_get_object"]);
function scriptTool(name: string, title: string, description: string, shape: z.ZodRawShape, body: string): BlenderTool {
  return {
    name, title, description, schema: z.object(shape).strict(), readOnly: readTools.has(name),
    code: args => name === "bl_execute" ? String(args.code) :
      `import bpy, json, base64\n_args = json.loads(base64.b64decode("${Buffer.from(JSON.stringify(args)).toString("base64")}"))\n${body}\n`,
  };
}

export const BL_TOOLS: BlenderTool[] = [
  scriptTool(
    "bl_execute",
    "Execute Python (bpy)",
    "Run arbitrary Python inside this MCP session’s background Blender with full `bpy` access. "
    + "Assign a JSON-serialisable value to `result` to return data. This is the "
    + "escape hatch — prefer a specific bl_* tool when one exists.",
    schemas.executeShape,
    "",
  ),

  scriptTool(
    "bl_get_scene_summary",
    "Get Scene Summary",
    "Return a compact summary of the active scene: name, current frame, render "
    + "engine, and every object's name/type/location.",
    schemas.sceneSummaryShape,
    `scene = bpy.context.scene
result = {
    "scene": scene.name,
    "frame_current": scene.frame_current,
    "frame_range": [scene.frame_start, scene.frame_end],
    "render_engine": scene.render.engine,
    "objects": [
        {"name": o.name, "type": o.type, "location": [round(c, 4) for c in o.location]}
        for o in scene.objects
    ],
}`,
  ),

  scriptTool(
    "bl_add_primitive",
    "Add Primitive Mesh",
    "Add a primitive mesh (cube, sphere, cylinder, cone, plane, torus, monkey) "
    + "to the active scene at an optional world location (metres, Z up).",
    schemas.addPrimitiveShape,
    `_op = {
    "cube": bpy.ops.mesh.primitive_cube_add,
    "uv_sphere": bpy.ops.mesh.primitive_uv_sphere_add,
    "ico_sphere": bpy.ops.mesh.primitive_ico_sphere_add,
    "cylinder": bpy.ops.mesh.primitive_cylinder_add,
    "cone": bpy.ops.mesh.primitive_cone_add,
    "plane": bpy.ops.mesh.primitive_plane_add,
    "torus": bpy.ops.mesh.primitive_torus_add,
    "monkey": bpy.ops.mesh.primitive_monkey_add,
}[_args["kind"]]
_loc = tuple(_args.get("location") or (0.0, 0.0, 0.0))
_op(location=_loc)
_obj = bpy.context.active_object
if _args.get("name"):
    _obj.name = _args["name"]
result = {"created": _obj.name, "type": _obj.type, "location": list(_obj.location)}`,
  ),

  scriptTool(
    "bl_delete_object",
    "Delete Object",
    "Delete an object from the scene by exact name.",
    schemas.deleteObjectShape,
    `_obj = bpy.data.objects.get(_args["name"])
if _obj is None:
    raise ValueError("No object named %r" % _args["name"])
bpy.data.objects.remove(_obj, do_unlink=True)
result = {"deleted": _args["name"]}`,
  ),

  scriptTool(
    "bl_set_transform",
    "Set Transform",
    "Set any subset of an object's local location (scene units), rotation (radians, XYZ "
    + "euler) and scale.",
    schemas.setTransformShape,
    `_obj = bpy.data.objects.get(_args["name"])
if _obj is None:
    raise ValueError("No object named %r" % _args["name"])
if _args.get("location") is not None:
    _obj.location = tuple(_args["location"])
if _args.get("rotation_euler") is not None:
    _obj.rotation_euler = tuple(_args["rotation_euler"])
if _args.get("scale") is not None:
    _obj.scale = tuple(_args["scale"])
result = {
    "name": _obj.name,
    "location": list(_obj.location),
    "rotation_euler": list(_obj.rotation_euler),
    "scale": list(_obj.scale),
}`,
  ),

  scriptTool(
    "bl_set_material",
    "Set Material",
    "Create and assign a Principled BSDF material (base colour RGBA 0-1, "
    + "metallic, roughness) to an object.",
    schemas.setMaterialShape,
    `_obj = bpy.data.objects.get(_args["object"])
if _obj is None:
    raise ValueError("No object named %r" % _args["object"])
if _obj.data is None or not hasattr(_obj.data, "materials"):
    raise ValueError("This object type has no material slots")
_mat = bpy.data.materials.new(name=_args.get("material_name") or (_obj.name + "_mat"))
_mat.use_nodes = True
_bsdf = _mat.node_tree.nodes.get("Principled BSDF")
if _bsdf is not None:
    if _args.get("color") is not None:
        _bsdf.inputs["Base Color"].default_value = tuple(_args["color"])
    if _args.get("metallic") is not None:
        _bsdf.inputs["Metallic"].default_value = float(_args["metallic"])
    if _args.get("roughness") is not None:
        _bsdf.inputs["Roughness"].default_value = float(_args["roughness"])
if _obj.data is not None and hasattr(_obj.data, "materials"):
    if _obj.data.materials:
        _obj.data.materials[0] = _mat
    else:
        _obj.data.materials.append(_mat)
result = {"object": _obj.name, "material": _mat.name}`,
  ),

  scriptTool(
    "bl_import_model",
    "Import 3D Model",
    "Import an absolute local glb/gltf/fbx/obj file into the scene. Download external assets first with the client's file tools.",
    schemas.importModelShape,
    `import os
_path = _args["path"]
if not os.path.isabs(_path) or not os.path.isfile(_path):
    raise ValueError("path must be an existing absolute file path")
_ext = os.path.splitext(_path)[1].lower()
_before = set(o.name for o in bpy.data.objects)
if _ext in (".glb", ".gltf"):
    bpy.ops.import_scene.gltf(filepath=_path)
elif _ext == ".fbx":
    bpy.ops.import_scene.fbx(filepath=_path)
elif _ext == ".obj":
    bpy.ops.wm.obj_import(filepath=_path)
else:
    raise ValueError("Unsupported model extension: %s" % _ext)
_new = [o for o in bpy.data.objects if o.name not in _before]
if _args.get("location") is not None and _new:
    for _o in _new:
        if _o.parent is None:
            _o.location = tuple(_args["location"])
result = {"imported": [o.name for o in _new], "path": _path}`,
  ),

  scriptTool(
    "bl_add_light",
    "Add Light",
    "Add a POINT/SUN/SPOT/AREA light at a world position with an energy.",
    schemas.addLightShape,
    `_type = _args["type"]
_data = bpy.data.lights.new(name=_args.get("name") or (_type.title() + "Light"), type=_type)
_energy = _args.get("energy")
_data.energy = float(_energy) if _energy is not None else (5.0 if _type == "SUN" else 1000.0)
_obj = bpy.data.objects.new(name=_data.name, object_data=_data)
bpy.context.scene.collection.objects.link(_obj)
_obj.location = tuple(_args.get("location") or (0.0, 0.0, 5.0))
result = {"created": _obj.name, "type": _type, "energy": _data.energy}`,
  ),

  scriptTool(
    "bl_add_camera",
    "Add Camera",
    "Add a camera at a world position/rotation, optionally making it the "
    + "active scene camera.",
    schemas.addCameraShape,
    `_data = bpy.data.cameras.new(name=_args.get("name") or "Camera")
_obj = bpy.data.objects.new(name=_data.name, object_data=_data)
bpy.context.scene.collection.objects.link(_obj)
_obj.location = tuple(_args.get("location") or (7.3589, -6.9258, 4.9583))
_obj.rotation_euler = tuple(_args.get("rotation_euler") or (1.1093, 0.0, 0.8149))
if _args.get("set_active", True):
    bpy.context.scene.camera = _obj
result = {"created": _obj.name, "active": bpy.context.scene.camera == _obj}`,
  ),

  scriptTool(
    "bl_set_active_camera",
    "Set Active Camera",
    "Make an existing camera object the active scene camera.",
    schemas.setActiveCameraShape,
    `_obj = bpy.data.objects.get(_args["name"])
if _obj is None or _obj.type != "CAMERA":
    raise ValueError("No camera named %r" % _args["name"])
bpy.context.scene.camera = _obj
result = {"active_camera": _obj.name}`,
  ),

  scriptTool(
    "bl_set_frame",
    "Set Current Frame",
    "Set the scene's current frame.",
    schemas.setFrameShape,
    `bpy.context.scene.frame_set(int(_args["frame"]))
result = {"frame_current": bpy.context.scene.frame_current}`,
  ),

  scriptTool(
    "bl_render",
    "Render Frame",
    "Render the current camera frame to PNG with optional temporary resolution, engine and sample overrides. Returns a local path and an inline preview when small enough.",
    schemas.renderShape,
    `import os, tempfile
_scene = bpy.context.scene
if _scene.camera is None:
    raise ValueError("Set an active scene camera before rendering")
_out = _args.get("output_path")
if _out and (not os.path.isabs(_out) or not _out.lower().endswith(".png")):
    raise ValueError("output_path must be an absolute .png path")
if _out and os.path.exists(_out) and not _args.get("overwrite", False):
    raise ValueError("Output exists; choose another path or set overwrite=true")
if not _out:
    _fd, _out = tempfile.mkstemp(suffix=".png", prefix="hf_render_")
    os.close(_fd)
_old = (_scene.render.engine, _scene.render.resolution_x, _scene.render.resolution_y,
        _scene.render.resolution_percentage, _scene.render.filepath, _scene.render.image_settings.file_format)
_old_samples = _scene.cycles.samples if hasattr(_scene, "cycles") else None
try:
    if _args.get("engine"):
        _scene.render.engine = _args["engine"]
    if _args.get("resolution") is not None:
        _scene.render.resolution_x, _scene.render.resolution_y = _args["resolution"]
        _scene.render.resolution_percentage = 100
    if _args.get("samples") is not None:
        if _scene.render.engine != "CYCLES":
            raise ValueError("samples override currently supports CYCLES only")
        _scene.cycles.samples = _args["samples"]
    _scene.render.filepath = _out
    _scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    _image = bpy.data.images.get("Render Result")
    result = {"output_path": _out, "engine": _scene.render.engine,
              "resolution": list(_image.size) if _image else None}
finally:
    (_scene.render.engine, _scene.render.resolution_x, _scene.render.resolution_y,
     _scene.render.resolution_percentage, _scene.render.filepath, _scene.render.image_settings.file_format) = _old
    if _old_samples is not None:
        _scene.cycles.samples = _old_samples`,
  ),

  scriptTool(
    "bl_get_object",
    "Get Object Detail",
    "Detailed inspection of one object: transform, dimensions, bounding box, "
    + "material slots, modifiers, parent, and mesh stats (verts/edges/faces).",
    schemas.getObjectShape,
    `_o = bpy.data.objects.get(_args["name"])
if _o is None:
    raise ValueError("No object named %r" % _args["name"])
_info = {
    "name": _o.name,
    "type": _o.type,
    "location": [round(c, 4) for c in _o.location],
    "rotation_euler": [round(c, 4) for c in _o.rotation_euler],
    "scale": [round(c, 4) for c in _o.scale],
    "dimensions": [round(c, 4) for c in _o.dimensions],
    "visible": not _o.hide_get(),
    "parent": _o.parent.name if _o.parent else None,
    "collections": [c.name for c in _o.users_collection],
    "modifiers": [{"name": m.name, "type": m.type} for m in _o.modifiers],
    "material_slots": [s.material.name if s.material else None for s in _o.material_slots],
}
if _o.type == "MESH" and _o.data is not None:
    _info["mesh"] = {"vertices": len(_o.data.vertices),
                     "edges": len(_o.data.edges),
                     "polygons": len(_o.data.polygons)}
result = _info`,
  ),

];

BL_TOOLS.push(
  scriptTool("bl_health", "Inspect Blender", "Start or inspect this MCP session’s background Blender. Returns its version, PID, active file and scene; does not inspect an open desktop window.", {}, `import os
result = {"version": bpy.app.version_string, "pid": os.getpid(), "background": bpy.app.background,
          "file": bpy.data.filepath, "dirty": _mcp_session["dirty"] or bpy.data.is_dirty, "scene": bpy.context.scene.name}`),
  scriptTool("bl_save_project", "Save Blender Project", "Save the current scene to an absolute .blend path. Existing files require overwrite=true.", {
    path: z.string().min(1), overwrite: z.boolean().default(false),
  }, `import os
_path = _args["path"]
if not os.path.isabs(_path) or not _path.lower().endswith(".blend"):
    raise ValueError("Provide an absolute .blend path")
if os.path.exists(_path) and not _args["overwrite"]:
    raise ValueError("File exists; use a new path or explicitly set overwrite=true")
if "FINISHED" not in bpy.ops.wm.save_as_mainfile(filepath=_path, check_existing=False):
    raise RuntimeError("Project save did not finish")
_mcp_session["dirty"] = False
result = {"path": bpy.data.filepath, "saved": not bpy.data.is_dirty}`),
  scriptTool("bl_open_project", "Open Blender Project", "Replace the active project with an existing .blend file. Refuses unsaved changes unless discard_unsaved=true.", {
    path: z.string().min(1), discard_unsaved: z.boolean().default(false),
  }, `import os
_path = _args["path"]
if not os.path.isabs(_path) or not os.path.isfile(_path) or not _path.lower().endswith(".blend"):
    raise ValueError("Provide an existing absolute .blend path")
if (_mcp_session["dirty"] or bpy.data.is_dirty) and not _args["discard_unsaved"]:
    raise ValueError("The current project has unsaved changes; save first or explicitly set discard_unsaved=true")
if "FINISHED" not in bpy.ops.wm.open_mainfile(filepath=_path, use_scripts=False):
    raise RuntimeError("Project open did not finish")
_mcp_session["dirty"] = False
result = {"path": bpy.data.filepath, "scene": bpy.context.scene.name}`),
  scriptTool("bl_insert_keyframe", "Insert Object Keyframe", "Key the current location, Euler rotation or scale of a named object at a frame.", {
    name: z.string().min(1), property: z.enum(["location", "rotation_euler", "scale"]), frame: z.number().int(),
  }, `_obj = bpy.data.objects.get(_args["name"])
if _obj is None:
    raise ValueError("Object not found")
_ok = _obj.keyframe_insert(data_path=_args["property"], frame=_args["frame"])
result = {"inserted": _ok, "object": _obj.name, "property": _args["property"], "frame": _args["frame"]}`),
);
BL_TOOLS.find(tool => tool.name === "bl_health")!.readOnly = true;
