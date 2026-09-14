---
name: blender-volatile
description: Live capability and parameter map, model-catalog routing hints, connector fallbacks, and Blender-version API traps. Use when verifying a tool, choosing a generation route, or handling version differences.
---

# Volatile knowledge

Everything in this file is tied to the live model catalog, a connector build,
or a Blender version. Verify against the live environment before relying on
it, and refresh this file when entries stop matching reality.

## Local capability and parameter contract

Read [blender-scene](../blender-scene/SKILL.md) for the session contract.
Check the callable tools and schemas only for the operations this task needs.
A name in a skill or cloud source does not establish local availability.
Inspect accepted units/fields and returned evidence; do not probe mutations
just to test availability. Distinguish a missing tool from a failed connection.

| Operation / cloud name in a module | Local route and evidence |
|---|---|
| Connection / get_host_status | bl_health, then bl_get_scene_summary. No panel or desktop connection; failure is a local process/setup issue. |
| Snapshot / bl_scene_snapshot | Fresh bl_get_scene_summary and bl_get_object for changed/protected objects; read missing camera, collection, material, visibility and render properties through bl_execute without mutating. |
| Diff / bl_scene_diff | Compare saved before/after observations of names, transforms, parent/data/material links and scene settings. A summary alone cannot prove unreported fields. |
| Checkpoint / bl_checkpoint | The copy-save procedure in blender-scene; record a verified recovery path without changing the active filepath. |
| Build/review / bl_build_scene, bl_build_blockout, bl_review_blockout_pass | Use local typed operations then bl_execute for gaps, in blender-modeling's pass order. Look up exact names before creation; view each pass render and record the decision. No manifest interpreter or dry_run flag is implied. |
| Geometry/material/light/camera/motion | Prefer each exposed typed tool within its schema. Use main-thread bl_execute for modifiers, nodes, constraints, datablock keys and missing properties; return changed names/properties and read back. |
| Viewport / bl_screenshot | No viewport in this background session. Viewed active-camera renders prove composition/appearance; datablock inspection proves structure. A specifically requested desktop viewport check remains unavailable. |
| Preview/audit / bl_render_preview, bl_audit_render | bl_render with an explicit absolute PNG path, then view its inline preview or a host-accessible file. A path on the Blender machine is not proof the host can view it. |
| Contact sheet / bl_render_contact_sheet | bl_set_frame and bl_render at selected frames; view each PNG. Restore the prior frame and temporary settings even after errors. A combined sheet is optional. |
| Structural/motion validation / bl_validate_scene, bl_audit_motion | Apply blender-audit-finalize criteria to fresh reads; sample evaluated world transforms, constraints and key ranges through bl_execute. Restore the frame after sampling. |
| Finalize / bl_finalize_build | Repair, report each audit's actual evidence, restore intended frame/camera, report changed names, save requested outputs under the core policy. Do not invent valid=true. |
| Generation / bl_list_models, bl_estimate_generation, bl_generate_*, bl_generation_status | Separately connected Higgsfield provider, following blender-generation. No cloud generation in this package. |
| Import / bl_import_generation | Download the result onto the Blender machine, then bl_import_model(path=absolute_local_path); retain source/job provenance. |
| Environment/PBR / bl_apply_hdri, bl_apply_pbr_maps | The local processing and bpy application procedures in blender-hdri / blender-pbr, with their full visual audits. |
| Video / bl_render_motion_reference | The checked native or image-sequence/encoder route in blender-greybox; no bundled movie exporter is promised. |
| Tool/API documentation / bl_describe_tool, bl_search_api, bl_search_manual, bl_get_api | Advertised MCP schemas and official version-matched Blender documentation through the host's available documentation access. No local API search tool is bundled. |

If the typed still-render tool cannot express the required operation, use
bl_execute with bpy.ops.render.render(write_still=True), an active camera
and a fresh absolute output path. Capture and restore temporary render
settings in a finally block; return output_path and verify/view the file.
This does not add unsupported parameters to bl_render.

A successful local alternative verifies that operation, not an absent cloud
tool. Report unresolved failures with the actual error and retain blocked
checks. After an uncertain local mutation, recover via bl_job_status in the
same session before further work; a timeout does not imply cancellation.

## Model catalog context

The tables below are inherited model-routing hints, not a current catalog or
parameter specification. Validate availability, input/output shapes and quality
controls against the separately connected provider before choosing a route.
Use its advertised schema; request include_schema only when supported.
Do not route Blender work through unrelated marketing/preset chains.

### Image — the routes this skill consumes

| job_type | Routing knowledge |
|---|---|
| `image_auto` | Auto-selects an image model; safest ambiguous default. Prompt + optional references. |
| `gpt_image_2` | High-detail 1K/2K/4K generation/editing; the HDRI/PBR source and composition-preserving restyle route. |

The rest of the live image catalog is not routing knowledge for Blender work —
use the connected provider's live catalog when these hints do not fit.

### 3D

| job_type | Input and best use |
|---|---|
| `tripo_3d` | Text prompt → GLB. Supports face limit, geometry/texture quality, PBR, and auto size. |
| `meshy_v6_text_to_3d` | Text → GLB with topology, target polycount, remesh, PBR, optional rigging/animation. |
| `hunyuan3d_v3_1_text_to_3d` | Text → GLB with face count, mode, type, and PBR controls. |
| `sam_3_3d` | One image → textured object GLB; optional detection threshold/prompt/seed. |
| `sam_3_3d_body` | One human image → body shape/pose GLB and optional keypoints/parameters. |
| `tripo_h3_1_image_to_3d` | One image → Tripo H3.1 GLB with orientation, quad, face limit, textures, PBR. |
| `tripo_h3_1_multiview_to_3d` | Two to four ordered views → Tripo H3.1 GLB. |
| `hunyuan3d_v3_image_to_3d` | One or several views → Hunyuan GLB with face/polygon type and PBR. |
| `image_to_3d` | One image → GLB with optional texture, remesh, rigging, animation, topology, polycount. |
| `multi_image_to_3d` | One to four ordered images of the same subject → GLB; supports texture/rig/animation. |
| `3d_rigging` | Public `model_url` → rigged GLB, optionally with a predefined animation. |
| `meshy_v5_remesh` | Public `model_url` → remeshed GLB with topology/polycount/origin/height controls. |

## Local render and file boundaries

bl_render requires an absolute .png output_path; use a new path unless
replacement is intended. It restores its temporary render overrides and can
return an inline preview. If the host cannot view that preview, use an available
file-transfer/viewing route. Rerendering to another inaccessible path does not
resolve a retrieval failure. Camera renders do not prove desktop viewport state.

## Blender 5.x traps

Version-dependent guidance: check the running build and its official API
before relying on a property or node name. These notes are not a test report.

- **Slotted actions:** when the running API uses action slots, access via
  `action.layers[].strips[].channelbags[].fcurves`:

  ```python
  def fcurves_of(ob):
      animation = getattr(ob, "animation_data", None)
      if animation is None or animation.action is None:
          return []
      act = animation.action
      action_slot = getattr(animation, "action_slot", None)
      if action_slot is None:
          return []
      slot = action_slot.handle
      return [fc for layer in act.layers
                 for strip in layer.strips
                 for cb in strip.channelbags
                 if cb.slot_handle == slot
                 for fc in cb.fcurves]
  ```

  Filter by the owning datablock's slot: an unfiltered shared-action walk
  can include curves belonging to other objects or object data. This example
  handles slotted actions; consult the version-matched API for legacy actions
  rather than treating a missing slot as proof of no animation.

  `ob.keyframe_insert(...)` still works unchanged — only reading/editing
  curves (interpolation, easing, handles) needs the new path.
- **bmesh op naming:** it is `bmesh.ops.create_uvsphere` (one word), alongside
  `create_icosphere`, `create_grid`, `create_cone`. Snippets writing
  `create_uv_sphere` raise `AttributeError` — a common hallucinated spelling,
  not an old API.
- **EEVEE engine enum:** compare the tool schema with the installed runtime.
  The local render schema includes `BLENDER_EEVEE_NEXT`; installed Blender
  versions may instead expose `BLENDER_EEVEE`. Read the runtime engine enum
  before overriding it; do not infer support from either spelling. If the
  scene already uses the
  intended engine, omit the optional `engine` argument. When an engine change
  is required, use a supported runtime value through the local-operation
  fallback, then render without overriding it. Do not silently switch to
  Cycles to conceal an EEVEE failure; report the schema/runtime mismatch.
- **Movie output:** codec and file-format availability vary by Blender build
  and GUI/background mode. Prefer `bl_render_motion_reference` if exposed;
  otherwise follow `blender-greybox` and check the actual runtime enums.
  Do not assume a vendored PyAV/FFmpeg fallback is installed or callable.
- **Compositor:** inspect whether the runtime uses Scene.node_tree or
  Scene.compositing_node_group and which output nodes it supports. A
  composition intended to process the scene render needs a connected Render
  Layers source; a Group Input alone does not establish that dependency.
  Inspect links, alpha and render settings when output is unexpectedly blank;
  render speed alone is not a diagnosis.
- **Glare/Lens Distortion:** property/socket layouts and enum values vary.
  Inspect the installed node inputs and RNA enums instead of copying old
  property names or assuming display labels are accepted identifiers.
