---
name: blender-greybox
description: Build and animate a local Blender greybox, render camera stills, and export verified motion video when a native or host encoder is available.
---

# Greybox

Read [blender-scene](../blender-scene/SKILL.md) for the local session contract.
Tool names below use its capability mapping when the named interface is absent;
read only the relevant rows in [blender-volatile](../blender-volatile/SKILL.md).

Requires: `blender-lighting-camera` for framing; `blender-animation`
when the scene is animated.

Scope: creating a greybox/blockout scene and rendering its artifact —
role-coloured semantic proxies, deterministic camera and object animation,
then a static still from the active camera, a motion video of that animation,
or both. The caller states which artifact the task needs; this module owns how
the scene is built, animated, and rendered.

## Static still

1. Frame from the active camera and check composition with a low-resolution
   local render; this session has no viewport screenshot.
2. `bl_render` with an explicit output path (e.g. `/tmp/<name>.png`);
   the local tool requires this path (see `blender-volatile`).
3. View the result. A written file is not a verified render.

If `bl_render` is absent or its optional engine enum disagrees with Blender,
use the active-camera render procedure and engine guidance in
`blender-volatile`. Restore temporary output/resolution settings after
collecting evidence.

## Motion video — shot planning

One motion clip is **2–30 seconds**. Longer sequences split into separate
shots: a two-minute four-camera
sequence is four shot blocks, one clip per camera. One primary camera move per
clip — never hide several unrelated camera cuts inside one clip.

Each shot records:

- duration/fps and active camera;
- hero, support, background, and occluder roles;
- subject start/end transforms and key beats;
- one primary camera move, at most one subtle secondary;
- continuity anchors to adjacent shots;
- acceptance criteria: composition, path, timing, silhouette.

## Build and motion gate

1. Inspect the live scene and reuse clear existing assets before creating
   proxies. Never factory-reset a live user scene.
2. Checkpoint, then build/update role-coloured semantic proxies idempotently.
3. Animate deterministic key poses and camera motion, with readable holds and
   no random per-object movement.
4. Run `bl_validate_scene`, `bl_audit_motion`, `bl_render_contact_sheet`, and
   fix the scene until spatial and timing checks pass.
5. Follow the local motion export route below and verify an H.264 MP4 plus
   its decoded first-frame PNG against the shot specification.

## Local motion export

This server exposes still rendering, not bl_render_motion_reference. Before
promising video, identify an available encoding and verification route:

- Native: inspect the running Blender build for FFMPEG output and the required
  container/codec, then render through bl_execute. Do not assume GUI and
  background builds expose identical formats.
- Image sequence: render numbered PNGs using bl_set_frame/bl_render (or bpy
  for a bounded batch), then use an encoder actually available through the
  host's tools. Verify it can access those files; a host sandbox and the
  Blender machine need not share a filesystem. Do not assume FFmpeg/PyAV
  or shell access is bundled by this MCP.

For either route, record the camera, frame range/step, current frame,
fps/fps_base, resolution and percentage, paths, format and codec settings;
restore temporary scene settings in a finally block. Use fresh output paths
unless replacement is intended. Long local calls follow the core timeout/job
recovery contract; never rerun an uncertain render blindly.

Verify the encoded frame count, dimensions, effective fps (fps/fps_base),
duration and H.264 MP4 format. Extract the first PNG from the encoded video
through an available decoder, and view start/middle/end. A separate scene
rerender is not evidence of the encoded first frame.

If no encoder is available, the MP4 delivery is blocked; report any completed
sample PNGs as partial output. If encoding succeeds but decoding/viewing is
unavailable, report the actual MP4 path with verification blocked. Do not
claim the export failed merely because its visual verification is incomplete.

An MP4 existing is not a pass. View start/middle/end and verify camera axis,
collisions, ground contact, screen direction, beat timing, and subject scale.

## Deliverable

Stills: the verified PNG. Motion: the verified MP4 plus its exact first-frame
PNG, per shot. Report local file paths, per-shot beats, and any continuity
risk between adjacent shots.
