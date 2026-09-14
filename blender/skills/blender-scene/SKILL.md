---
name: blender-scene
description: Create, inspect, edit and render native scenes through the local Higgsfield use Blender MCP.
---

# Local Blender workflow

Call `bl_health` and `bl_get_scene_summary` before editing. Inspect important objects with `bl_get_object`. This is a dedicated background session, not an open desktop window. Load saved input files with bl_open_project; save outputs before reconnecting.

Prefer the typed tools listed by this server. Use `bl_execute` for other bpy operations; assign a JSON-compatible value to `result`. Returned stdout/stderr are capped at 64 Ki characters each. Do not start threads that touch bpy. Use data APIs where possible; operators depend on mode, selection and UI context.

Distances are in scene units (normally metres); Z is up and Euler angles are radians. Check the scene's unit settings when scale matters. Names identify objects exactly; inspect suffixes rather than assuming them.

## Topic modules

Keep this entry as the runtime contract for the local background session. Read only
modules relevant to the current task through the host's installed plugin skills,
using the relative files below. This entry routes the task; the model reads the
selected guidance and performs the relevant checks and tool calls.

`bl_get_skill` remains an optional route to this entry and the original short
references (`modeling`, `materials`, `lighting-camera`, `animation`). It does not
serve the new `blender-*` modules: read their installed skill files instead. An
MCP-only connection does not expose those files to the host; if the skill bundle is
missing, report the unavailable module instead of calling an unsupported name or
pretending that a link loaded its contents.

| Task | Module |
|---|---|
| Whole-scene specification, scale, hierarchy and acceptance criteria | [blender-scene-spec](../blender-scene-spec/SKILL.md) |
| Blockout, geometry, topology and editable construction | [blender-modeling](../blender-modeling/SKILL.md) |
| Materials, UVs, texture scale and appearance | [blender-lookdev](../blender-lookdev/SKILL.md) |
| Lighting, camera composition and render setup | [blender-lighting-camera](../blender-lighting-camera/SKILL.md) |
| Motion, rigs, keyframes and loops | [blender-animation](../blender-animation/SKILL.md) |
| Generated assets through a separately connected provider | [blender-generation](../blender-generation/SKILL.md) |
| Generated environment maps | [blender-hdri](../blender-hdri/SKILL.md), with blender-generation |
| Generated tileable materials | [blender-pbr](../blender-pbr/SKILL.md), with blender-generation |
| Greybox scene and motion-reference rendering | [blender-greybox](../blender-greybox/SKILL.md) |
| Structural, motion and visual checks, then delivery | [blender-audit-finalize](../blender-audit-finalize/SKILL.md) |
| Tool availability, local alternatives, model catalog and Blender API/version differences | [blender-volatile](../blender-volatile/SKILL.md) |

These modules adapt the cloud export's craft guidance to this local server.
Read the relevant modules before their first scene mutation. Their pass order
and quality gates apply; named cloud tools are not requirements to call absent
interfaces. This entry owns connection, save and recovery behavior. If a
module names an unavailable tool, use the local capability table in
[blender-volatile](../blender-volatile/SKILL.md), then the specialist's checks.
Do not load unrelated modules or build a full capability inventory per task.

## Construction and checkpoints

Reuse a clear existing asset before constructing a replacement. Local modeling
is the default for new geometry; explicit blockout work never spends credits.
Only assets covered by the user's generation request take the generated route;
ask about the route only when the brief leaves a material choice unresolved.
Whole-scene builds use the Passport in blender-scene-spec and these phases:

1. Inspect and specify dimensions, protected objects, hierarchy, camera,
   motion, asset routes and acceptance criteria. Focused edits need only
   the relevant scope and checks; do not add motion to a still-only request.
2. Record fresh state and intended changed names. Before broad/destructive
   edits, write a uniquely named recovery copy through bl_execute using
   bpy.ops.wm.save_as_mainfile(filepath=absolute_copy_path, copy=True).
   Verify the file exists and the active filepath is unchanged. This copy is
   a recovery checkpoint, not final delivery or permission to overwrite.
3. Build in blender-modeling's spatial passes, reusing exact names; render
   and record a continue/refine decision before advancing each pass.
4. Refine assets, lookdev, lighting and motion through relevant modules.
   Keep generated proxies until replacements pass their checks.
5. Audit through blender-audit-finalize, repair failures, restore the intended
   frame/camera and save the requested deliverables. Report blocked checks.

Checkpoint completed major stages before another risky edit, not every tool
call. Packing resources or overwriting an existing file must match the user's
requested deliverable and overwrite intent; a checkpoint does not authorize
those changes.

## Local execution and delivery

Preserve unrelated objects. Save `.blend` deliverables requested by the user with `bl_save_project`; existing files need `overwrite=true`. Before replacing the active project, save needed changes. `bl_open_project` refuses unsaved changes unless explicitly discarded.

A script may partially mutate before failing. Inspect current state before retrying. A timed-out command may still be running; use its `job_id` with `bl_job_status` on the same MCP session. Commands are not automatically retried or rolled back. Job history is in-memory and bounded; reconnecting loses it and any unsaved scene changes.

Verify structure with fresh reads and appearance by viewing `bl_render` output. Set a scene camera first; no viewport exists in this session. Rendering occupies the session until it completes. Set the MCP client's tool timeout above 300 seconds for long renders.

This package has no cloud generation tools or bundled bpy API/manual search. Use a separately connected Higgsfield service for generated assets; download results then call `bl_import_model` with an absolute local path. Read official version-matched Blender docs for unfamiliar APIs.
