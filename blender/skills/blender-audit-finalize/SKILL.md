---
name: blender-audit-finalize
description: Audit a local Blender scene against its specification, measure structural, motion and visual failures, repair them, and save requested deliverables under the local recovery policy.
---

# Audit and finalize

Read [blender-scene](../blender-scene/SKILL.md) for the local session contract.
Tool names below use its capability mapping when the named interface is absent;
read only the relevant rows in [blender-volatile](../blender-volatile/SKILL.md).

The audit compares the scene to the Scene Passport — not to memory, and not to
the arguments of the calls that built it. A build passes only when structural,
motion, and visual evidence all agree.

## Structural audit

Run `bl_validate_scene`, diff against the pre-build snapshot with
`bl_scene_diff`, and inspect the important objects with `bl_get_object`
(`bl_execute` only for facts the typed reads do not expose). Confirm:

- every expected object exists exactly once, under its semantic name;
- dimensions, transforms, origins, parents, collections, visibility match;
- active camera, frame range, fps, render engine, resolution match, and
  `frame_end` reaches the last marker and the last key;
- material slots and texture links resolve;
- generated replacements sit inside their proxy footprints;
- no stray defaults, `.001` duplicates, orphan stand-ins, or hidden failures;
- related objects found under every prefix they use — one prefix search is
  not a sweep;
- hero/export meshes have sane normals, manifold state, and density.

## Motion audit

Mandatory for dynamic-default scenes; skipped only on an explicit static
request.

- Run `bl_audit_motion`; when diagnosing a failure, enumerate animated
  objects/properties, key times, and interpolation.
- Sample first/rest, departure, peak, settle, and final/loop frames.
- Check collisions, clipping, constraint jumps, rotation flips, camera
  framing, visibility, loop continuity.
- The promised motion must be perceptible and purposeful.

A still image cannot pass this audit.

## Visual audit

1. Viewed camera render for composition; inspect datablocks, modifiers and
   rigs for editability. A desktop viewport check is unavailable locally.
2. `bl_audit_render` for active-camera material, light, shadow, transparency,
   and engine-specific proof.
3. `bl_render_contact_sheet` for dynamic scenes.
4. View the returned evidence — success JSON says nothing about appearance.
   And view it at scale: image previews downsample, so few-pixel features
   average away to nothing. Crop 1:1 and count bright pixels numerically
   before concluding something did not render.
5. **Unreachable evidence fallback** — when a render/screenshot URL cannot
   be opened (network policy, expired link), report that retrieval failure
   and obtain equivalent evidence at an accessible local path. Write camera
   renders via `scene.render.filepath` +
   `bpy.ops.render.render(write_still=True)`; obtain a local viewport capture
   if the claim specifically concerns viewport state. Actually view the
   replacement evidence. If it cannot be viewed either, mark the relevant
   visual check `blocked`, give the user the available paths/URL, and never
   substitute numeric proxies for appearance. Numeric proxies cover
   structure and motion only.
   One useful framing proxy:
   `bpy_extras.object_utils.world_to_camera_view(scene, cam, world_co)`
   returns NDC — x/y in `[0,1]` **with z > 0** means in-frame (z ≤ 0 is
   behind the camera) — but NDC cannot tell a cylinder from a cactus.

Check silhouette hierarchy, scale cues, contact, depth separation, texture
scale, highlight/shadow detail, generated/local style coherence, and delivery
framing. One extra rule: **no asset may read as an unresolved primitive from
the active camera** unless its passport fidelity is `blockout`. A bare
cylinder standing in for a cactus, or a uniform sphere for a rock, fails this
check even when every structural metric passes.

## Specialist audits

Owned by their modules, executed here at finalize time when the Scene
Passport declares the matching work:

- **Cinematic lighting** (cinematic, commercial, product, night, atmosphere,
  reference-matched): the full "Lighting audit" in
  `blender-lighting-camera`. If isolated or grayscale evidence cannot
  be produced, the lighting audit is `blocked`, not `passed`.
- **Generated environment**: the "Audit gate" in `blender-hdri`. Record
  the SDR limitation; a GPT Image PNG is never reported as true HDR/EXR.
- **Generated PBR material**: the "Audit gate" in `blender-pbr`.
  Luminance-derived maps are inferred, not measured.

## Measuring a complaint

- Measure the quantity that was complained about, in world space over time —
  never the nearest available proxy. A perfect reading on the wrong quantity
  closes the wrong case, and the complaint returns.
- A clean zero can be the failure. A component that never varies proves rigid
  parenting as readily as correctness; pick the reference frame the physical
  claim is about — for a wheel that is the ground, not the body.
- A hidden object returns a stale matrix. Measure on a frame where it is
  visible.
- `scene.ray_cast` follows viewport visibility, not render visibility. When
  the ray and the render disagree, the render is the evidence.

## Repair loop

Fix the largest concrete failure first, then rerun the affected audit. No
polishing of secondary detail while scale, framing, contact, or motion is
wrong. A blocked check is reported as blocked — never dressed up as a pass.

## Finalize

- Modifiers, rigs, materials, and generated assets stay editable unless the
  deliverable explicitly demands destructive application.
- Proxies are removed only after their replacements pass; otherwise they are
  parked predictably and reported.
- Restore a useful frame and the intended active camera.
- Record generated job ids, models, estimates, imported object names.
- Report created/modified/deleted objects with the audit evidence.

When `bl_finalize_build` is exposed, run it once after repairs and inspect
its documented result; a `valid` field must be true when that is the contract.
Otherwise use the core manual-finalize fallback and report each audit result
with its actual evidence. Do not invent a tool response or silently convert a
blocked generation, export, or visual check into a pass.

## Save policy

Follow blender-scene's local save and recovery contract. Recovery copies
precede broad/destructive edits; save requested .blend outputs before
reconnecting or replacing the active project. Preserve useful partial work
even when an audit is blocked, clearly reporting its status. Confirm an
ambiguous overwrite target; do not overwrite or pack resources merely as a
side effect of audit/finalize. Report the verified saved path.
