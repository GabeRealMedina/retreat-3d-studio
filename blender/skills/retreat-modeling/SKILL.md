---
name: retreat-modeling
description: Create, revise, render and export persistent local Blender models with Retreat 3D Studio, including resuming a saved model in a later conversation.
---

# Persistent 3D modeling

Use this plugin's Blender tools to create actual editable geometry. A rendered image alone is not an editable model. This is a personal local modeling plugin derived from Higgsfield's MIT-licensed Blender bridge; it does not reproduce Higgsfield's hosted asset catalog or cloud generation service.

Start with `bl_health` and `bl_get_scene_summary`. The server owns a background Blender process, not the user's open desktop Blender window. On a fresh connection, open the user's latest saved `.blend` with `bl_open_project`. Do not assume the default cube is their previous model. Ask for the model path only when the intended saved input cannot be determined from the task or available files. Inspect key object names and scene units before edits; use meters and Z up for new scenes unless requested otherwise.

Use typed scene tools for focused edits. Use `bl_execute` for geometry construction and other bpy operations; this runs unsandboxed Python on the host, so keep code scoped to the requested modeling work. Preserve unrelated geometry and use stable descriptive object names. Assign JSON-compatible data to `result`; Python local variables do not persist across calls. Blender datablocks do.

Before substantial edits, preserve a new revision with `retreat_save_revision` if needed. It creates a new file, never overwrites earlier revisions, and returns the absolute path. Prefer the user's chosen model directory; otherwise use a `models` folder inside the current project. Do not place user models inside the plugin installation or source repository.

After an edit, inspect the affected dimensions, transforms and materials; render a camera view using `bl_render` and actually inspect the returned image. Distinguish measured input dimensions from visual estimates. Save the completed revision with `retreat_save_revision`. Export a GLB with `retreat_export_glb` when requested or needed for downstream viewing; retain the `.blend` as the editable master. Saving GLB alone does not checkpoint unsaved Blender state.

Report the saved `.blend` path, changes and any unchecked assumptions. This path is the handoff to later conversations. For broad scene work, call `bl_get_skill` with `blender-scene` and read the relevant bundled craft modules when available. MCP-only clients can use the original modeling/materials/lighting-camera/animation references from `bl_get_skill`; do not pretend unavailable files were read.

If a command times out, call `bl_job_status` with its job ID on the same connection before issuing another edit. Never automatically repeat an uncertain mutation. A failed script may have partially edited the scene; inspect before recovery. Save before disconnecting because reconnecting starts a new empty session. Opening a project with unsaved changes requires saving them first or the user's intent to discard them.
