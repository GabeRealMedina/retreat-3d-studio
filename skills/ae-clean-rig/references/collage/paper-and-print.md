# Paper, Print, and Typography

## Paper, Wear, and Contact

Treat stable paper structure, printed image texture, edge wear, contact shadow, ambient shadow, and moving grain as different materials. Keep coarse fibers attached to the paper while fine finishing grain changes in time. A single heavy noise layer over the entire image will not create believable paper.

Separate a sheet from its background through luminance, temperature, silhouette, and directional shadow. Use a slightly different stock tone rather than washing the entire composition into the same gray or brown. Keep photographic content, creases, and surface marks registered to the sheet during movement.

Create restrained physical defects such as a worn corner, shallow crease, broken fibers, slight edge darkening, and an irregular cut. Clip surface scans and abrasions to the sheet. Keep wear beneath the printed image when it belongs to the backing, and do not allow a large unmasked Multiply plate to dirty unrelated labels or the desk.

At approximately 1440-pixel-wide artwork, a close contact shadow can begin near 28 percent opacity, 2 pixels distance, and 3 pixels softness, with a broader ambient shadow near 12 percent opacity, 7 pixels distance, and 12 pixels softness. Keep light direction consistent. Refit these values to camera scale, source resolution, and the reference; doubled shadows can create a dark outline rather than depth.

Use ADBE Roughen Edges for restrained silhouette wear, after verifying the installed controls. A border near 1 to 2 source pixels and a small irregularity scale can support worn photographic stock, but the closest camera crop determines whether the edge remains plausible. Do not invent property indices for this effect.

## Continuous Grain and Material Motion

Establish one finishing strategy and tune it against the reference before adding more layers. Keep animated grain present during stationary holds and through transitions, with coverage across the full timeline. Grain should not depend on camera movement or on a short source layer that disappears between scenes.

For a moderate monochrome finish, use native Noise, match name ADBE Noise2, with Amount of Noise around 4 to 8 percent and Use Color Noise disabled. The verified property match names are ADBE Noise2-0001 for amount and ADBE Noise2-0002 for color noise. Judge it at final viewing size, particularly over dark regions and small text.

Use a separate coarse print texture or evolving procedural field only when the reference needs it. Begin with a restrained blend and opacity, compare a hold, and increase until it reads as print rather than flicker. Soft Light can retain midtones; Multiply is useful for dark flecks; Screen can introduce pale abrasion. Choose the mode for the actual texture rather than inheriting an unexplained numeric blending-mode value.

Stable fibers should remain visible beneath the animated finish. Move a texture by small deterministic XY offsets, usually around 1 to 2 pixels at the working scale, and keep enough excess coverage to hide its bounds. Coarser texture movement can be stronger when the reference has obvious print boil, but jumping the whole paper scan by large distances destroys material continuity. Give each layer a stable independent seed that will not change when layers are reordered.

Use ADBE Turbulent Displace for subtle print or edge motion. At the working scale, an overall print pass can begin near Amount 1.1, Size 58, and Complexity 1.2, with Evolution advancing about 90 degrees per second at a stepped evaluation rate. Individual edges may need less Amount. These values were implemented in the source workflow but are not a universal approved preset.

For this effect, ADBE Turbulent Displace-0002 is Amount, -0003 is Size, -0005 is Complexity, and -0006 is Evolution. Verify them on the installed effect before assigning values. Evolution changes the displacement field; translating a paper layer is a separate action. Avoid large rapid deformation of faces, rigid architecture, clean UI, or optical content.

For ink-specific boil, a smaller displacement field near Size 23, Amount 0.85, and Complexity 1.15 can introduce slight irregularity. For broader paper movement, a field near Size 112 and Amount 1.1 can remain gentler. Reduce both for small output or dense text. Do not stack every material treatment merely because each one is available.

## Typography, Ink, and Annotations

Match the reference through letter proportions, cap height, stroke behavior, spacing, and line breaks, not a guessed font name. Use installed fonts by their actual PostScript identifiers and verify the rendered glyphs. Kalam-Bold and Lora-Bold are available candidates for marker-like annotation and serif display respectively when those families fit the reference; they are substitutes, not identified original fonts.

If fonts are missing, use authorized sources and inspect their licenses before redistribution. Do not silently substitute a variable font or a similarly named family without checking metrics. A wider marker face may require a wider tape label or different placement. Avoid distorting the text horizontally simply to preserve an old label width.

Keep typography as native TextDocument data where possible. Preserve the full underlying text and implement type-on separately so wording stays editable. Reset inherited case, fill, stroke, tracking, and justification deliberately. A same-color outline that helped a thin handwritten font may make a heavier marker font muddy; do not carry it forward automatically.

Felt-tip character comes from uneven ink density, slightly broken edges, natural stroke ends, and deliberate irregularity. Use a restrained matte or edge treatment while preserving letter counters and legibility. Keep underlines and arrows as editable paths with rounded caps and appropriate joins. Write them on with native trim-path animation when that matches the reference; do not replace a hand-drawn contour with a mechanically perfect oval by default.

Measure sourceRectAtTime including left and top offsets, not only width and height. Evaluate the current type-on state and final parent scale. A text layer can have zero bounds before the first character appears. Check long words, changing labels, camera extremes, and overlaps with neighboring imagery at the final output size.

## Continuous Color Changes

Use this section when the reference or request calls for a smooth palette change. Keep a persistent underlying background and animate a separate oversize color plate, a supported color property, or a registered transition matte. Do not simulate a smooth change with a one-frame enabled switch, a layer that begins at the final color, or HOLD keys on a continuous transition.

Native Linear Wipe, match name ADBE Linear Wipe, provides Transition Completion through -0001, Wipe Angle through -0002, and Feather through -0003. Refit feather to the frame size and intended edge. A broad feather around 100 to 200 pixels can soften a photographic plate reveal at HD working dimensions, but a paper tear needs an authored edge rather than a generic soft wipe.

Keep exposure and grain consistent through the transition. Do not double the finishing stack during a crossfade or reveal a differently exposed material halfway through. Check the beginning, midpoint, and ending at adjacent frames. If the reference uses a deliberate hard cut, do not replace it with a dissolve merely because this section describes smooth changes.

For native color assignment, ADBE Fill-0002 is the Fill color, while ADBE Tint-0001 and -0002 map black and white. Native Color properties commonly require four-component arrays; TextDocument fillColor and solid-creation APIs have different contracts. Inspect the actual property or API rather than treating all color arguments as interchangeable.

