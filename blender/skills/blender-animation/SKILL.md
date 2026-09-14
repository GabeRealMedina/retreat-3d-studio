---
name: blender-animation
description: Dynamic-by-default motion — the motion plan, semantic rigs, deliberate interpolation, constraints and drivers, surface contact, rotational aliasing, visibility keying, dynamic defaults per subject type, and the motion audit.
---

# Animation

Read [blender-scene](../blender-scene/SKILL.md) for the local session contract.
Tool names below use its capability mapping when the named interface is absent;
read only the relevant rows in [blender-volatile](../blender-volatile/SKILL.md).

Motion is part of the default deliverable: unless the user explicitly asked
for a static scene, the Scene Passport defines at least one purposeful beat.
"Dynamic" means the viewer can watch something change and read it — not that
everything moves at once.

## Motion plan

Pin down before keying anything:

- fps, frame range, playback duration;
- rest pose and beat structure: anticipation → action → settle;
- the carrier of each beat — object, camera, light, material, or environment;
- the loop boundary, if the motion loops;
- constraints, parenting, and control objects involved.

One clear primary action, restrained secondaries, and at least one stable
frame suitable for inspection and thumbnails.

## Build animation

- Bulk transform/lens keys → `bl_keyframe_properties`; turntable, camera
  orbit/dolly, idle → `bl_create_motion_preset`; frame inspection →
  `bl_set_frame`.
- Drop to `bl_execute` only for what typed tools cannot express: F-curve
  edits, constraints, drivers, armatures, shape keys, simulations, NLA.
- Key rigs and semantic controls, not a pile of unrelated child transforms.
  Key only properties that need to change.
- Choose interpolation on purpose: Bezier for organic motion, linear for
  constant rates, constant for stepped switches.
- Pick quaternion or Euler deliberately so rotations do not flip mid-move;
  connector boundaries speak radians.
- Object animation and data animation are separate sets. Lens, `clip_start`,
  and `dof.focus_distance` keys belong to `camera.data`. Follow Path
  `offset_factor` belongs to the constraint and is animated on its owning
  object, through `constraints[...].offset_factor`. Retime both object and
  data actions, filtering their correct action slots (`blender-volatile`),
  then check each shot's transform, path, lens, and focus key ranges.
- Simulations must be deterministic enough that the audited frames reproduce.

## Constraints and drivers

- **`Copy Location` on a spinning child is forbidden.** Any residual offset
  between target and owner orbits with the spin, and the part reads as about
  to detach. Only rotation can be compensated.
- Copy the steering component alone, in the control object's space
  (CUSTOM to CUSTOM, single axis, mix AFTER). Copying full world rotation
  drags support noise into the tilt.
- The local space of a bone-parented child is useless: its own rotation is
  static and the motion lives in the bone. Name the control object explicitly.
- **Rolling contact is verified arithmetically.** Rotation per frame equals
  distance per frame divided by radius, and the residual stays sub-millimetre.
  The driver's sign follows the direction of the part's local axis; the
  contact point holding still is the proof.
- Ray-based ground tracking over a faceted support mesh returns noise, not
  travel. Disable it and solve the surface response deliberately.

## Surface contact solve

For anything that must stay planted on uneven ground while it moves:

1. One ray per support point gives the gaps.
2. The mean gap is the height correction.
3. Compute the slope angle with `atan2(height_difference, support_distance)`.
   Use the full horizontal distance between the two compared support points,
   not the half-span. For points at `-a` and `+a`, the denominator is `2*a`.
   Resolve the sign and roll/pitch axis in the rig's local frame and check
   the resulting contact gaps; banked or uneven supports may need a fitted
   support plane rather than two independent slopes.
4. Two passes per frame for convergence.
5. Ease in and out over roughly 20 frames with a quintic so no correction
   pops on entry.

A baked contact holds height but does not pick up lateral slope: it passes on
straights and drifts on arcs. Level ground under a tilted body means the body
is wrong, not the ground.

## Rotational aliasing

An N-fold symmetric spinner strobes when its step per frame lands near a
multiple of its symmetry sector — the blades nearly fill the previous
positions and the eye reads a jerk or a reversal. Hold a constant step half a
sector away from any multiple of the sector, then re-phase after the shot so
the rotation stays continuous.

Blur decides that read more than the keys do. A shutter near 0.2 at one step
is no smear at all; 0.75 over 12 steps is the working baseline, raised toward
0.95 by key for the fastest passage. The viewport never renders blur — spin
and smear are judged from a render only.

## Visibility keying

- Visibility switches are keyed with constant interpolation.
- **Constraint targets hide in render only.** `hide_viewport` drops an object
  from the depsgraph, and every constraint reading it gets a stale matrix.
- Everything else hides in render and viewport together. A render-only hide
  leaves the viewport lying about framing: geometry sitting millimetres in
  front of a lens still blocks the preview.
- Props belong to the shots that need them, not to every range sharing a
  state.
- `animation_data_clear()` removes visibility keys along with everything else.

## Dynamic defaults

When the brief names no motion:

- product/prop — slow turntable or camera orbit, settling on the hero angle;
- environment — subtle camera drift plus a restrained practical-light change;
- character/creature — idle breathing or weight shift, only if the rig
  supports it;
- abstract — one focal transformation with a small secondary response.

Never invent character acting, destructive simulation, or a camera that never
stops when subtle motion already satisfies the dynamic requirement.

## Motion audit

Sample at minimum: first/rest frame, departure, peak of the fastest change,
settle, final frame plus the loop seam where one exists. Run `bl_audit_motion`
and view a `bl_render_contact_sheet`. At each sample check framing, collisions
and intersections, visibility, constraint behavior, shading continuity, and
motion direction. Open F-curves only when the typed audit cannot explain a
failure — a still render proves nothing about animation.

The pass fails if expected properties carry no keys, motion is imperceptible,
objects teleport, rotations flip, the camera loses the subject, or the loop
jumps. Fix and sample again.
