---
name: blender-hdri
description: Generate and apply SDR environment panoramas through a connected provider and local Blender processing, with projection, seam, lighting and reflection checks.
---

# Generated environment maps (pseudo-HDRI)

Read [blender-scene](../blender-scene/SKILL.md) for the local session contract.
Tool names below use its capability mapping when the named interface is absent;
read only the relevant rows in [blender-volatile](../blender-volatile/SKILL.md).

Requires: `blender-generation` (credit workflow),
`blender-lighting-camera` (lighting integration), and `blender-volatile`
(live capability and parameter contract). The prompt contract is below.

Scope: a generated HDRI, sky, panorama, or custom environment applied to the
live Blender World.

## What this output is — and is not

The generated map is an SDR PNG/JPEG, not floating-point radiance
`.hdr`/`.exr`. Name it honestly: an **AI environment map** or **pseudo-HDRI**.
It carries background, reflections, ambient color, and low-frequency fill; it
does not carry trustworthy high-dynamic-range sun values.

Choose a 2:1 output only if the current model and wrapper support it; otherwise
inspect the actual output ratio. The local processing route below can repair an appropriate panorama source. Cropping alone does not convert an ordinary
perspective picture into an equirectangular panorama, and pole/horizon
distortion must be audited. An equirectangular map wraps horizontally only —
zenith and nadir are poles, so never promise vertical tiling.

If the deliverable explicitly requires a true HDR/EXR light probe, this
workflow does not satisfy it. Say so, and use a real bracketed/CG HDRI or an
approved radiance-reconstruction pipeline.

## Inspect before generation

1. Read `bl_scene_snapshot`, the active camera, World nodes, exposure/view
   transform, existing lights, reflective hero materials, and the motion
   range.
2. An existing suitable environment map gets reused automatically; with
   several candidates, ask which one.
3. The Scene Passport records:
   - environment description, biome/interior, time, weather, horizon height;
   - intended key/sun direction relative to the active camera;
   - what the map must supply: background only, reflections, ambient light,
     or all three;
   - dynamic camera range and seam-sensitive reflective objects;
   - the existing World/map kept for rollback.

## Prompt, model, and parameters

Before generation, establish a local file-transfer, processing and application
route that can satisfy the checks below. The local server does not expose
bl_apply_hdri. Use supported bpy work through bl_execute and available
host processing tools; verify dependencies before spending. If the complete
required route is unavailable, report that gap and continue independent work.

Choose a compatible live image model through `blender-generation`; its
environment default is a routing hint, not an unsupported parameter payload.
Compose the prompt from the Passport:

- a single full 360-degree horizontal by 180-degree vertical equirectangular
  environment panorama, with the specified scene, time, weather and palette;
- level horizon at the intended height, consistent scale and illumination,
  continuous left/right wrap, plausible zenith and nadir;
- the brightest region's direction relative to the intended key, restrained
  highlights appropriate to an SDR environment;
- no text, borders, panels, split views, embedded camera/UI, or central hero
  object meant to exist as separate scene geometry.

Use only supported aspect/resolution/reference fields. Run the estimate and
submission flow through the connected provider; state the SDR limitation with
the estimate. The prompt does not itself prove projection or seam quality.

## Local processing and application

1. Download the completed source to an absolute path readable by Blender.
   Inspect its projection and dimensions. A perspective image does not become
   equirectangular through a crop; reject an unsuitable source.
2. Use a genuine 2:1 equirectangular source directly. If a generated panorama
   needs crop or seam correction, process its pixels through an available
   host image processor or bpy image data, preserving a separate original.
   Match horizontal edge bands smoothly; inspect horizon/poles after any crop.
   Measure edge differences and view the wrap on reflective test geometry.
3. In bl_execute, preserve the old World and build/reuse named World nodes:
   Texture Coordinate/Mapping for rotation, an Environment Texture in
   equirectangular projection, Background, then World Output. Load the
   processed local image with its appropriate color space. Set restrained
   strength and return the image path and World/node names for read-back.
4. Retain the source job/provider and processing details in the report.
   Pack only under the core delivery policy. Do not claim seam repair or
   packing happened without checking its output.

These are local operations, not a call to an absent bl_apply_hdri tool.

Choose the World rotation by looking at shadows, reflections, and the visible
horizon — not by picking an angle. Keep strength restrained: an SDR sky at
full strength flattens the authored lighting.

## Complete the lighting

- The AI map covers background, reflections, ambient color, broad fill.
- When the scene needs directional high-dynamic-range light, add a separate
  Sun/Area/Spot key aligned with the visible or implied sun, moon, window, or
  brightest sky region.
- Key and environment must agree in direction and hue. A painted sun pointing
  one way while cast shadows point another is an automatic failure.
- For product shots, audit reflected seam bands and panorama landmarks across
  the whole turntable; add controlled white/black cards as needed.
- The previous World stays in a disabled alternative or checkpoint until the
  new environment passes.

## Audit gate

Accepted only when viewed evidence confirms:

1. dimensions exactly `2:1`, measured left/right edge differences negligible
   at the working color scale; record the measurement method;
2. no brightness/color band at the wrapped left/right seam;
3. horizon, zenith, and nadir free of obvious stretching, duplicated
   structures, text, borders, or split panels;
4. visible sun/window direction agrees with the separate key and cast shadows;
5. glossy objects expose no seam repair, duplicated landmarks, or broken
   highlight motion;
6. World strength does not flatten silhouette, contact, or focal hierarchy;
7. opening, midpoint, and final/rest frames stay coherent for animated
   cameras or turntables.

Evidence is viewed local `bl_render` output at the required sample frames.
Numeric seam checks prove edge equality, not panorama quality. If renders
cannot be viewed, the environment audit is `blocked`, never `passed`.
