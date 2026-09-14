# Artwork and Interaction

## Board construction and missing UI

- Inventory the supplied reference's notes, text, arrows, highlights, annotations, cursors, labels, reactions, and panels before construction. Verify the static layout against that inventory before adding dependent motion.
- Group each note's paper, text, and reaction; each cursor's pointer, nameplate, and name; and each UI panel's contents. Use semantic layer names derived from the actual content.
- Build missing icons as vector artwork with consistent strokes, caps, spacing, and alignment. Do not count empty buttons or generic symbol substitutes as completed icons.
- Reproduce the header's visible controls, separators, participant elements, and text from the reference. Use supplied or authorized portraits and participant details.

## Note details and reactions

- Stagger note entrances with uniform scale, restrained overshoot, and a clear settle. Keep reaction badges attached to their notes.
- Animate separate emoji reaction copies with upward drift and opacity fade. Preserve recognizable reaction artwork. Keep discrete counter changes separate from the transform bounce that emphasizes them.
- For a requested paper curl, apply CC Page Turn to paper alone or use a clipped corner, back-face shape, and local shadow. Match the requested corner and scale the fold to the current note. Inspect installed effect controls instead of assuming numeric property indices.
- Check one curl at its board rotation and close-up scale before adapting it to the remaining notes. Verify that text and badges are unaffected.
- Create arrows, highlights, and decorative marks as editable paths. Reveal strokes in drawing order with Trim Paths or a stroke reveal; reveal arrowheads after shafts and preserve the reference's hand-drawn contours.

## Printed text and handwriting

- For typed text, use a character-based reveal that preserves explicit line breaks, alignment, spacing, and transforms. Prefer native text animators over replacing Source Text on every frame.
- When Animation Composer is requested, apply a suitable installed preset through that plugin and inspect its resulting animators and controls. If unavailable, explain the limitation and use a native equivalent only within the authorized scope.
- For handwriting, finalize wording, font, and layout before tracing. Keep editable text and create a separate reveal matte aligned to the rendered glyphs.
- Trace narrow paths in plausible pen order, separating pen lifts, crossbars, dots, and words. Animate path ends with staggered Trim Paths. Set stroke width to cover each glyph without revealing neighboring characters prematurely.
- Assign the alpha matte and inspect partial strokes as well as the completed writing. Rebuild or align the matte after wording or font metrics change; editable text does not make traced paths reflow automatically.

## Cursors and panels

- Group or parent each cursor pointer, nameplate, and name to one motion owner. Preserve local label offsets and avoid applying the same motion twice through both parent and child.
- Give cursors distinct path geometry, pauses, phase, and travel distance. Avoid synchronized copies and jitter. Keep featured note text readable during movement.
- For looping cursors, use periodic motion or closed paths with compatible endpoint position and velocity. Do not assume an unconstrained `wiggle` will loop. Stagger entrance reveals without detaching names.
- Reveal sidebar icons from top to bottom with a readable stagger. Match the supplied acceleration and deceleration reference; keep the panel stable unless panel motion is requested.
- Synchronize hover highlights with the simulated cursor passing the relevant control.
- Bring the voting panel in as a coherent group using restrained positional or scale change with opacity. Preserve readable labels, spacing, and counters throughout its appearance.

## Project-wide font replacement

- Resolve the source family, target family, and replacement scope from the request. Use installed font objects and preserve corresponding weights, styles, faux styling, and other character attributes. Leave unrelated font families unchanged.
- In supported After Effects versions, inspect `app.project.usedFonts` and use `app.project.replaceFont` for mixed-format text. Verify API availability before execution. Global native replacement may lack undo support; follow the entrypoint's backup requirement.
- Inspect Source Text expressions that explicitly assign fonts; stored usage does not fully describe expression-selected fonts. Change only the requested font references.
- Audit the requested scope afterward, including nested and unused compositions for a whole-project request. Distinguish an unprocessed font from automatic fallback for an unsupported glyph.
- For graphical symbols with unavailable target glyphs, preserve the appearance through native Create Shapes from Text when appropriate. Retain recoverability and avoid displaying a duplicate or missing-glyph replacement.
- Confirm the target fonts are installed rather than substituted, resolve remaining source-family usages, and inspect line wrapping, labels, and badges.
