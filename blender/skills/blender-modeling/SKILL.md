---
name: blender-modeling
description: Procedural, camera-aware blockout-first geometry — silhouette/proportion/depth/contact/camera-read/detail gates, typed tools before bl_execute, and topology/parenting/measurement/destructive-edit traps.
---

# Modeling

Read [blender-scene](../blender-scene/SKILL.md) for the local session contract.
Tool names below use its capability mapping when the named interface is absent;
read only the relevant rows in [blender-volatile](../blender-volatile/SKILL.md).

Model from the Scene Passport, in metres, Z-up. Typed tools first —
`bl_build_blockout`, `bl_batch`, `bl_create_collection`, `bl_parent_objects`,
`bl_add_modifier`, the narrow primitive/transform tools; `bl_execute` is for
mesh editing, curves, Geometry Nodes, and whatever else typed tools cannot
express.

## Blockout passes

Coarse to fine, and each pass locks one class of spatial constraints before
more detail is allowed:

1. **Silhouette** — primitives set footprint, height, dominant contour.
   Judged from the active camera plus one orthographic side view.
2. **Proportion** — dimensions and relative scale checked against the
   passport in explicit metre values, not by eye.
3. **Depth** — foreground/midground/background, overlap, negative space,
   camera-visible thickness.
4. **Contact** — nothing floats, nothing interpenetrates; support surfaces,
   pivots, and believable contact exist.
5. **Camera read** — viewed camera render with simple diagnostic materials:
   subject, focal
   hierarchy, and major forms must read before bevels, topology, or
   generated replacements are allowed.
6. **Detail** — every visible asset is brought to its passport `fidelity`
   tier by role:
   - **hero** — full detail: silhouette, surface features, material response;
   - **midground prop** — a recognizable species/type silhouette (a cactus
     must read as a saguaro — ribs, tapered curved arms, rounded caps — not
     as a cylinder; a rock needs facet variation, not a uniform sphere);
   - **background** — blockout primitives are acceptable.
   A `commercial`, `ad`, or `deliverable` intent in the passport raises every
   camera-visible tier by one. The build is unfinished while any visible
   asset sits below its tier.

A failed gate stops the line: fix the largest silhouette or placement error
before touching anything downstream.

On a connector exposing `bl_build_blockout` with a documented dry-run and
pass contract, validate its schema before committing a manifest, then rerun
idempotently with `pass_id` in this locked order: `bounds`, `primary_masses`,
`secondary_masses`, `silhouette_proportions`, `pivots_attachments`,
`camera_review`. View each pass render/screenshot, then call
`bl_review_blockout_pass` — only `decision:"continue"` with viewed evidence
unlocks the next pass; when continuing is not justified, the decision is
`refine-spec`, `refine-code`, `request-input`, or `stop`. Confirm via
`bl_scene_diff` against the checkpoint that only the intended semantic
objects changed. On a connector without these interfaces, use the core local
fallbacks: perform the same spatial passes, view the evidence and record the
continue/refine decision before progressing, and compare fresh snapshots.
Do not pretend that a missing dry-run or review tool was executed.

## Editable construction

- Distinct semantic parts stay separate named objects or collections.
- Origins sit where manipulation and animation need them.
- Modifiers over destructive edits; the base mesh survives until finalize.
- Repeated assets are instances.
- Scale gets applied only when a modifier, export, or simulation demands it —
  and the destructive application is recorded.
- Mesh-level scale hits every user of the datablock at once. Count the users
  before scaling shared data; an object `scale` of exactly 1 beside resized
  geometry means the factor already lives in the mesh and is not reapplied.
- Proxies for generated assets stay until the import passes audit.
- No single fused mesh where the scene needs per-part materials or motion.

## Transform and parenting traps

- **Scaled object + Bevel modifier makes pillows.** Bevel works in local
  space, so a chamfer set on a unit cube gets stretched by `o.scale`.
  `bpy.ops.object.transform_apply(scale=True)` first.
- **Parent inverse compensates the initial parent transform; it does not
  disable later inheritance.** For a child authored in the parent's local
  space, use an identity parent inverse. To preserve an existing world pose
  when assigning a parent, retain and restore the child's `matrix_world`.
  A fixed inverse still allows subsequent parent motion to move the child.
  If motion disappears, inspect constraints and evaluated world transforms;
  do not diagnose it from a non-identity inverse alone.
- **A rotation about the wrong axis silently does nothing visible.** A panel
  whose normal is +X does not change facing when rotated about X. Measure the
  world normal against the view vector rather than reasoning about it.

## Measurement traps

- **`bound_box` is not a radius.** The bounding box of a rotated body of
  revolution is smaller than its diameter, and reading one as a radius
  oversizes every part derived from it. Measure from the mesh: the axis is
  the direction of least vertex spread (covariance), the radius is the
  maximum distance in the perpendicular plane.
- **Quaternion difference carries no sign.** `rotation_difference().angle`
  returns an unsigned magnitude and cannot separate a rotation from its
  complement. Take the signed angle:
  `atan2(dot(axis, cross(v1, v2)), dot(v1, v2))`.

## Destructive edit traps

- **Never select geometry by coordinate box.** A box takes everything inside
  it, far side included, and thousands of polygons from unrelated parts leave
  silently. Select by material, island, normal, or attribute, and compare
  polygon counts before and after.
- **Decimate:** `COLLAPSE` deforms flat panels; `DISSOLVE` (planar) moves no
  vertices at all. 5° is the safe ceiling (about -43% polygons), 8° tears UV
  islands, 12° facets the surface.

## `bl_execute` discipline

Data API first. When operators are unavoidable:

- set object mode explicitly;
- deselect all, select the target, make it active;
- establish collection/view-layer context;
- restore relevant state afterwards;
- return created names, dimensions, modifier names, and mesh counts in
  `result`.

Batch one coherent object or modifier stack per call — not the whole scene in
one opaque script.

## Hard-surface techniques

For man-made rigid objects (vehicles, machines, buildings, devices):

- **Loft cross-sections; never stack primitives.** Primitive assembly has a
  hard ceiling no lighting or framing gets past. Define a profile whose
  width/height/chamfer vary along the length, sweep it through stations, and
  bridge into one continuous skin. A stepped profile (parallel midbody,
  shoulder, blunt end) reads better than a smooth taper — steps are what the
  eye measures scale against.
- **Cut detail into the skin.** Panel recesses, trenches, and openings are
  `bmesh.ops.inset_region` on selected faces translated inward along the face
  normal, with a different material index in the recess. Boxes glued onto a
  surface always look glued on.
- **Detail hierarchy with restraint.** Three tiers: primary masses, medium
  panel features, fine detail at roughly 1/60 of the object's length. Zone
  the fine detail and deliberately leave clean areas — detail only registers
  against something undetailed; covering every face reads as noise.
- **A flat plate never sits flush on a curved host.** The standoff varies
  across the seat and no amount of translation closes it. Sweep the plate's
  profile along the host surface, or cut the recess into the skin.
- Flat-shade hard-surface plate rather than smooth-shading everything.

## Engine export

When the user requests export to a game engine or external renderer:

- **Join by material first.** Draw calls scale with glTF primitives, one per
  material per mesh; joining single-material objects collapses a loose export
  of dozens of draws into a handful.
- Procedural node materials do **not** survive glTF — export flat base colors
  (bake if the look must travel). `KHR_materials_emissive_strength` does
  survive, so authored emissive intensities keep.
- Apply transforms on export (`export_apply=True`) and mind the unit scale of
  the target engine; model in metres and scale once at a root object.

## Geometry checks

For hero and exported meshes:

- dimensions and transform;
- non-manifold/open boundaries where the surface should be closed;
- flipped normals;
- duplicate or internal geometry;
- unapplied scale breaking shading or modifiers;
- density out of proportion to silhouette benefit;
- naming, parenting, collection membership, material slots.

`bl_get_object` and additional read-only bpy checks supply structural
evidence; viewed camera renders supply the
visual one. A script finishing is not approval.
