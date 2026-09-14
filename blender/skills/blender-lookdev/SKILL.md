---
name: blender-lookdev
description: Materials, UVs, texture scale and procedural wear serving the passport's roles; normalizes generated imports and proves the look under an active-camera render.
---

# Look development

Read [blender-scene](../blender-scene/SKILL.md) for the local session contract.
Tool names below use its capability mapping when the named interface is absent;
read only the relevant rows in [blender-volatile](../blender-volatile/SKILL.md).

Lookdev starts only after the blockout passes the camera-read gate, and it
serves the Scene Passport's material roles and visual hierarchy — not swatch
preferences.

## Material strategy

- `bl_set_material` covers plain Principled work: base color, metallic,
  roughness.
- `bl_execute` covers the rest: node graphs, image textures, UV work,
  bump/normal, transmission, emission, displacement, shared material
  libraries.
- One named material per role, reused across repeats — accidental
  `Material.001` variants are a defect.
- Keep shader controls exposed. Procedural masks and reusable node groups
  beat baked one-off textures where practical.
- Color, roughness, normal, and displacement are different data; each image
  texture gets the color space its data requires.
- Map Range supports reversed output bounds: `To Min=1`, `To Max=0`
  maps `0..1` to `1..0` in linear mode with Clamp enabled.
  A zero output is not evidence that reversed bounds are invalid; check the
  input, From range, data type, links, and active sockets. A `SUBTRACT` node
  is another valid way to invert a scalar. A Mix node in RGBA mode carries
  several sockets named
  "Factor"; setting one by name can hit an unused socket and silently drop a
  branch.

## Lookdev order

1. Neutral world, broad light: validate base color and roughness first.
2. Assign roles: hero, secondary, support, ground, accent.
3. Match real-world texture scale in metres.
4. Normal/bump and edge treatment only where they change the camera read.
5. Restore the intended lighting and tune the material's response under it.

## Procedural wear

Two cheap node setups do most of the work of making a manufactured surface
look used (Cycles for Pointiness):

- **Per-part tonal variation** — Voronoi on object coordinates at low scale →
  RGB to BW → remap to roughly 0.9–1.1 → multiply into base color. Real
  material is assembled from batches that never quite match, and that
  mismatch is most of the read.
- **Edge wear** — Geometry → Pointiness remapped over a narrow band, mixed
  toward bare material and driving roughness/metallic. Free on every convex
  corner, exactly where wear happens in life.
- Weathering follows exposure: fade on surfaces facing the dominant light
  (`dot(Normal, light_dir)`), grime/deposits accumulating along one
  object-space axis. Directional wear turns a colored solid into a used
  object.

## Generated imports

An imported generated model is normalized, not trusted:

- walk every material slot and texture link;
- find missing images and unsupported node setups;
- check alpha mode, normals, roughness/metallic interpretation, UV scale;
- merge duplicate materials only when their rendered roles truly coincide;
- never silently swap a textured generated asset for a flat material.

## Render consistency

- Confirm the render engine before leaning on engine-specific nodes or
  features.
- For EEVEE glass/transmission problems, inspect the installed version's
  ray-tracing and material surface settings. Verify with a camera render;
  do not copy legacy blend_method fields or replace the material with a
  fixed numeric recipe without checking the intended appearance.
- A surface that does not respond to any lighting change is a material
  defect, not a lighting one. Insensitivity to light is the diagnosis, and it
  is faster than eliminating light sources one by one.
- Keep color management explicit; solid shading is not a look judgment.
- Iterate with low-resolution camera renders in this background session;
  prove the final look with `bl_render` at the intended settings.
- Check highlights at the intended exposure; dark materials must keep
  readable form.
- A light emissive part on a light body has no read. Contrast comes from dark
  glass and a dark rim with emission held around 2-3; higher values blow the
  shape to flat white.
- Avoid detail frequencies that shimmer or vanish at delivery resolution.

## Gate

Lookdev is done when material roles are coherent, texture scale is
believable, generated and local assets live in one visual world, and a camera
render shows no missing textures, accidental pink surfaces, broken alpha, or
unreadable value merges.
