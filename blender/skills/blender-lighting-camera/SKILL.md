---
name: blender-lighting-camera
description: Camera gate first, then motivated one-role-at-a-time lighting — direction/falloff/softness, world/HDRI, product and night setups, shaping with gobos/flags/negative fill, and the lighting audit.
---

# Lighting and camera

Read [blender-scene](../blender-scene/SKILL.md) for the local session contract.
Tool names below use its capability mapping when the named interface is absent;
read only the relevant rows in [blender-volatile](../blender-volatile/SKILL.md).

Camera and broad lighting are solved before final detail. Cinematic light is a
hierarchy with controlled darkness: the craft is choosing what stays dark, not
adding lights. Typed tools first — `bl_camera_frame_objects`,
`bl_create_three_point_rig`, the narrow camera/light tools; `bl_execute` only
for what they cannot express (custom constraints, world nodes, light linking,
gobos, flags, reflection shaping).

## Camera gate

Lighting an unresolved composition is wasted work, so the camera locks first:

- one explicit active camera, confirmed in scene state;
- subject target, lens, distance, height, and framing taken from the Scene
  Passport;
- perspective chosen deliberately — wide lenses exaggerate depth, long ones
  flatten it; extreme focal length is not a patch for wrong geometry;
- headroom, contact shadows, and silhouette separation preserved;
- camera motion built on semantic parent rigs (orbit, dolly, handheld), not an
  opaque stack of keyed transforms;
- in dynamic-default scenes, camera movement only where it serves the brief,
  with a stable rest and no move that hides form.

Record before lighting: focal subject, secondary focal point, the region
allowed to go darkest, foreground/background depth, and the visible or implied
light motivation. Then freeze the camera — a setup is camera-relative, and
moving the camera can turn a reverse key into flat frontal light.

## One role at a time

Keep each lighting role in its own toggleable collection, and add nothing
without a named problem it solves:

1. **Baseline** — render World-only and zero-World. Starting from black is a
   diagnostic (it shows what each source contributes), not a look requirement.
2. **Structural key** — one source sets exposure, form, shadow direction, and
   the focal hierarchy. Side or reverse/upstage key is the safe cinematic
   default because the camera sees both lit and shadow planes; a frontal key
   is legitimate only when flat beauty/catalog/graphic light is the point.
3. **Fill** — restore only the shadow information that must stay readable.
   Fill that competes with the key for direction is a second key, which is a
   failure, not a style.
4. **Separation and practicals** — rim, background, and fixture-support
   lights each answer a named problem. A visible emissive fixture may be
   backed by a hidden helper light, but the helper must agree with it in
   direction and color.
5. **Shaping** — fix spill and composition with source angle, apparent size,
   Area spread, Spot cone/blend, blockers, gobos, and negative fill before
   raising power or adding sources.
6. **Atmosphere and grade** — bounded fog/volume only when it reveals depth
   or beam direction. Lock the view transform and exposure during A/B
   comparisons. Glare and grading polish a hierarchy; they cannot create one
   the lighting failed to build.

Names carry roles: `LGT_key`, `LGT_fill`, `LGT_rim`, `LGT_practical_*`,
`LGT_background_*`, `FLAG_negative_*`, `GOBO_*`. For every light record
`purpose`, `motivation`, `target`, `camera_relation`, `expected_effect`.

## Direction, falloff, softness

- Aim the key by orbiting it around the subject while it stays pointed at the
  focal target; judge the pool of light and the shadows the camera actually
  sees.
- Shoot from the key side unless silhouette/rim is the point — a hero angle
  taken from the shadow side is carried by fill alone and reads washed out.
- Softness is apparent angular size, roughly `source_size / source_distance`:
  big and close gives broad gradients, small and far reveals texture and
  hardens shadows.
- Point and Spot follow inverse square: moving a source from `d1` to `d2`
  needs about `power × (d2/d1)²` to hold the same direct illumination. Area
  lights deviate in the near field; a Sun has no positional falloff at all —
  only `angle` matters.
- A close source gives deliberate focal falloff; a distant one gives even
  product illumination. Decide per shot — there is no universal three-point
  recipe.
- Balance key against fill by looking at the rendered subject. Raw power
  ratios do not transfer across light types, sizes, distances, exposures, or
  scene scales; one to three stops under key is a starting point, not a rule.
- Keep cast shadows unless a shadowless technical/stylized look is explicitly
  the brief.

## World, HDRI, visible background

- Rotate an HDRI for useful shadow direction and reflections, not for the
  prettiest background; keep it weak enough that it cannot erase the authored
  key.
- Sunny and golden-hour exteriors want a lateral or low Sun/HDRI so terrain
  and subjects show both lit and shadow planes.
- The visible sky and the scene key must tell the same story. Splitting the
  background (card or emissive sky) from the lighting is allowed for control,
  but its edges, reflections, and apparent sun direction get audited.
- Overcast is not an excuse for a flat frame: physically uniform ambience may
  still need negative fill or a broad directional key to hold the focal
  hierarchy.
- Park alternative setups in named collections — `LIGHTING_Day`,
  `LIGHTING_GoldenHour`, `LIGHTING_Night` — instead of destroying an accepted
  option.

## Shaping tools: gobos, flags, negative fill

- Shape coverage with Area spread or Spot size/blend. A nonzero Spot radius
  avoids mathematically sharp shadows unless that look is requested.
- Flags and blockers cut spill or imply windows and openings; black cards
  subtract world or reflection fill.
- A gobo is composition, not decoration: leaf breakup, window patterns,
  caustic-like motion, and irregular pools must support the environment and
  the focal path. Random noise is not automatically cinematic.
- Off-camera cards, blockers, and sky planes are cheats, and cheats leak:
  audit every delivery camera, animated frame, glossy reflection, and shadow
  for their exposure.
- In Cycles, a bright pool can become a motivated bounce source. Verify
  colored indirect light and its noise in a production render; viewport
  denoising is not proof.

## Product and commercial lighting

For glass, metal, polished plastic, bottles, speakers, packaging: reflections
are lit as deliberately as the diffuse surface.

1. Lock camera and product orientation.
2. Establish silhouette and contact with broad light/dark value regions.
3. Move large rectangular Area lights or bright cards while watching the
   shape of the reflected highlight, not just diffuse brightness.
4. Place black cards between highlight bands to describe curvature and edges.
5. Grazing light for texture; long vertical highlights for cylinders; glass
   stays readable through controlled bright and dark reflection bands.
6. A restrained label/logo light comes only after material and silhouette
   read.
7. Keep hero illumination separate from background gradients and gobos.
8. Audit branding, clipped highlights, card reflections, and highlight
   continuity across every turntable/camera angle.

## Night and atmosphere

- Start with subtle sky/world ambience plus one key — moon, window, or street
  source. Ambience lifts shadows; it must not complete the exposure by itself.
- Reinforce an implied moon or practical with a local Area/Spot only while its
  direction and hue stay coherent with that source.
- Warm practicals against a cool sky is a convention, not a law; saturated
  color needs a plausible artificial source or an openly stylized brief.
- Fog is bounded and local, starting near zero density, raised only until
  depth layers or beams become legible. Fog that uniformly milks the frame or
  eats focal contrast gets rejected.
- Only lit surfaces read at night. Frame the practicals themselves — heads,
  lamps, the pools under them — into the shot; a correct composition of unlit
  material carries nothing.

## Lighting audit

1. Render World-only, zero-World, key-only, and each added role in isolation:
   every source must solve the problem it was recorded for.
2. Toggle fill — it may recover information, never redesign direction.
3. Read a grayscale render for focal hierarchy, silhouette separation,
   contact, and shadow-plane legibility.
4. Check highlight clipping, black crush, spill, shadow direction, practical
   motivation, and background consistency.
5. Inspect glossy surfaces for leaked flags, cards, lights, and sky-plane
   edges, and for broken product highlights.
6. Compare atmosphere on/off; volume that weakens the focal subject loses.
7. Judge from a production-camera render with fixed exposure and view
   transform. For colored bounce, volumes, or reflection-critical work verify
   in Cycles when practical, even if EEVEE ships.
8. For motion, inspect opening, midpoint, peak, and rest frames for
   camera/key continuity, moving gobo/blocker artifacts, and stable product
   reflections.
9. Keep the previously accepted preview for A/B.

Numeric state approves nothing. View the renders.

## Proof

Iterate composition with low-resolution local bl_render output. For a
dynamic scene, view sampled camera renders covering at least the opening,
a motion midpoint, and the final/rest frame; assembling a contact sheet is
optional. Keep view transform and exposure fixed across light-isolation
comparisons and restore temporary render state. Use blender-volatile for
engine/schema differences; this background session has no viewport.

If the existing file's active camera, resolution, render engine, or exposure
looks intentional, changing it silently is forbidden — record the change in
the Scene Passport and the final report.

## Technical caveats

- Real metre scale comes before tuning power or falloff; copied watt values
  are not presets.
- On new Blender 5.x scenes AgX is a sensible default, but an intentional
  existing color-management setup is preserved.
- Cycles MIS settings control sampling and noise; they do **not** hide a
  light from reflections. Use ray visibility or light linking for that.
- A camera inside geometry can cost tens of times the render time from
  near-field bounces. A suddenly slow frame means check the camera before
  touching sample counts.
- Swapping a hero asset invalidates every camera set against its old shell. A
  replacement sitting lower or narrower puts the lens inside geometry.
  Re-verify placement and near clipping per camera after any swap.
- Large emissive backdrop geometry must be camera-visible only: an emissive
  sky/atmosphere shell becomes an area light every shading point
  importance-samples. Set
  `visible_diffuse/glossy/transmission/volume_scatter/shadow = False` on
  backdrop shells and skyboxes.
- When combining World contributions, prefer two `Background` nodes into an
  `Add Shader` over a Mix node — the Mix node's duplicate "Factor" sockets
  can silently drop a branch.
- Reverse key, black-World starts, warm/cool contrast, sky cards, off-camera
  blockers — workflows, not laws. The Scene Passport and viewed reference
  decide when each applies.
