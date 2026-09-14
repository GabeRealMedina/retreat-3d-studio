---
name: blender-pbr
description: Generate a seamless albedo through a connected provider, derive aligned PBR maps locally, apply an editable Blender material and audit its scale, shading and repetition.
---

# Generated tileable PBR materials

Read [blender-scene](../blender-scene/SKILL.md) for the local session contract.
Tool names below use its capability mapping when the named interface is absent;
read only the relevant rows in [blender-volatile](../blender-volatile/SKILL.md).

Requires: `blender-generation` (credit workflow),
`blender-lookdev` (material integration),
`blender-audit-finalize` (PBR audit), and
`blender-volatile` (live capability and parameter contract).
The prompt contract is below.

Scope: a generated material, seamless texture, or PBR map set.

## Core method

Generate **one** seamless flat albedo swatch, then derive every
geometry/shading map from that same tile using the local processing route below.
Never generate Base Color, Normal, Displacement, AO, and Specular as separate
image jobs — independent generations do not align at the pixel level and
cannot form a coherent set.

The derived maps are coherent but **inferred**, not scan data:

- **Base Color** — the generated tile, treated as sRGB.
- **Displacement/Height** — normalized luminance; bright means high unless
  `invert_height:true`.
- **Normal** — tile-aware central gradients of that height map.
- **Ambient Occlusion** — tile-aware local cavity estimate from height.
- **Specular** — a constant dielectric level by default, because albedo does
  not reliably encode IOR/specular response; optional luminance/height
  modulation is an artistic mode, not a measurement.

When pigment and physical relief are unrelated, or the deliverable demands
scan-grade maps, do not pretend luminance-derived height is accurate — use
authored or scanned height/specular data instead.

## Inspect and specify

1. Inspect the live object: material slots, UV maps, dimensions, render
   engine, subdivision, displacement support, intended camera scale.
2. One clear suitable existing texture set gets reused automatically; ask
   only when several candidates are plausible.
3. The Scene Passport records:
   - object and semantic material role;
   - real-world tile width/height in metres;
   - surface description, age, wear, grain/fiber direction, palette;
   - relief polarity — whether bright or dark features are raised;
   - dielectric/metallic behavior, roughness, specular intent;
   - UV or Generated coordinate route;
   - bump-only versus true Cycles displacement.

## Prompt, model, and parameters

Before generation, establish a local file-transfer, processing and application
route that can satisfy the checks below. The local server does not expose
bl_apply_pbr_maps. Use supported bpy work through bl_execute and available
host processing tools; verify dependencies before spending. If the complete
required route is unavailable, report that gap and continue independent work.

Choose a compatible live image model through `blender-generation`. Compose
the source prompt from the Passport:

- one square, orthographic, front-facing albedo/base-color tile of the named
  material, with the specified palette, wear and grain/fiber direction;
- flat, even illumination; no baked directional shadows, highlights, AO,
  perspective, depth of field, border, text, labels, or map atlas;
- seamless repetition on both axes and restrained landmark features so the
  required real-world tile size can repeat naturally;
- color/pigment variation kept conceptually separate from intended relief.

Request square output only through supported aspect/resolution fields. Run
the estimate-and-submit flow through the connected provider and state that the
derived maps are inferred. Verify the delivered tile; a seamless-texture
prompt does not establish seamlessness or physically accurate height.

## Local derivation and application

1. Transfer the completed albedo to a path readable by Blender; preserve the
   original. Use a square tile with smooth periodic boundaries on both axes.
   If correction is needed, use available host image processing or bpy image
   pixels, then inspect a 3x3 repetition before deriving maps.
2. Derive maps from the same corrected tile: normalize luminance for height
   with explicit polarity; compute wrapped central gradients for a normalized
   tangent-space normal; estimate local cavity AO with periodic neighborhoods;
   use a constant dielectric specular level unless another artistic rule was
   explicitly chosen. Keep dimensions and pixel alignment identical. These
   are inferred maps, not recovered physical measurements.
3. Write and verify the requested Base Color, Normal, Height, AO and Specular
   images. Use sRGB for base color and Non-Color for data maps. Read back
   dimensions, finite ranges, edge continuity and the chosen normal convention.
   If available processing cannot produce the requested set, report the gap;
   an albedo-only material does not complete this workflow.
4. Through bl_execute, create/reuse a named material on exact target objects.
   Use UV/Mapping with the declared real-world tile size, Image Texture nodes,
   Principled BSDF and Material Output. Decode the normal through a Normal Map
   node; use Height for controlled bump/displacement only where needed.
   Avoid doubling the same relief through both strong normal and bump.
   Do not bake AO into the source albedo; if used as artistic shading, avoid
   double-darkening with engine occlusion. Connect specular using the runtime's
   supported IOR/specular inputs and respect dielectric/metallic intent.
5. Preserve the previous material, return and read back map paths, assigned
   objects and node links, and retain provider/job provenance. Audit under the
   intended camera/light motion before accepting the replacement.

Use version-matched Blender APIs, not an assumed bl_apply_pbr_maps payload.
No destructive subdivision is automatic. True displacement requires a
supporting engine and sufficient non-destructive subdivision; otherwise use
bump/normal and report that distinction. Prefer valid UVs on hero assets.

## Material-specific decisions

- **Stone, plaster, bark, concrete:** luminance-derived relief is a workable
  start; verify polarity and lower displacement before ever raising it.
- **Wood:** align grain with UV orientation; a unique knot must not expose the
  repeat at hero scale.
- **Fabric:** small displacement, stronger micro-normal; large
  luminance-derived height reads inflated.
- **Painted/printed surfaces:** pigment is not height. Low height contrast,
  constant dielectric specular.
- **Metal:** `metallic:1` — a grayscale Specular map is not a metallic
  workflow. Base Color then represents conductor reflectance.
- **Wet/varnished:** brightness does not imply coating; tune
  roughness/coating explicitly in lookdev.

## Audit gate

Approved only when viewed evidence confirms:

1. measured edge differences on both axes negligible at the working color
   scale; record the measurement method;
2. a plane with at least 3x3 repetitions shows no cross-shaped seams,
   mirrored edge bands, brightness drift, or an obvious repeated landmark;
3. Base Color carries no baked directional shadows, highlights, AO, text,
   border, or perspective;
4. Normal direction is correct under a grazing moving light, with no
   inverted-green-channel look;
5. displacement polarity is right, the silhouette stays plausible, and scale
   is measured against the object's metre dimensions;
6. AO darkens cavities without dirtying all color or double-shadowing;
7. Specular matches the dielectric/metal intent instead of merely copying
   albedo brightness;
8. UV/Generated coordinates and `tile_scale` match the declared real-world
   texel scale;
9. opening, midpoint, and final turntable frames expose no seams or texture
   swimming.

Use local `bl_render` and viewed sampled-frame PNGs for dynamic scenes.
Numeric seam equality does not prove the tile looks natural. If the rendered
material cannot be viewed, the PBR audit is `blocked`, never `passed`.
