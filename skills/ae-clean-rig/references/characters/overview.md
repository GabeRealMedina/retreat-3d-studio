# Illustrated character motion

Use the local `higgsfield-use-after-effects` MCP tools. Read `ae_catalog` for exact operation arguments before calling `ae_do`; availability depends on server policy and the installed AE version. A batch shares one undo group but is not transactional — inspect partial results before retrying a mutation.

This is the complete pipeline for animating drawn or illustrated characters: read it first, and treat the numbered character modules as optional add-ons rather than substitutes.

- `references/08-characters.md` — reach for it when a single mascot or agent needs a compact rig with blink, gaze and head-turn parallax, and the drawn-artwork pipeline below is more than the task needs.
- `references/11-character-production.md` — reach for it when a jointed figure must hold repeatable poses and you need controller and coordinate design, hand and foot IK, or pose libraries.
- `references/12-symbol-characters.md` — unrelated to drawn artwork; it covers characters assembled out of glyphs and type.

Do not run two of these as competing plans. This module owns the artwork, the deformation, the cadence and the delivery; the others contribute one technique each.

## Scope and inputs

- Resolve the target project, approved artwork or composition, requested actions, visual and motion references, output format, timing, and delivery location from the current request and existing project. Treat project names, character identities, colors, clothing, companions, and layer selectors as runtime inputs.
- Preserve the current approved version during a revision. Retain user-edited paths, keys, expressions, controls, framing, and material settings outside the requested change and its dependencies.
- Derive dimensions, aspect ratio, pixel aspect ratio, duration, scene count, and output frame rate from the requested delivery and existing work. No ratio, resolution, or number of scenes is mandatory. For a new unspecified format, choose and state a suitable format; recompose for that canvas while preserving anatomy and visual hierarchy.
- Distinguish delivery frame rate from animation cadence. For a requested stepped illustration look without a specified cadence, use 12 updates per second as an overridable starting point. Preserve the existing cadence when editing unless the request changes it.
- Classify references as appearance, motion, or editable animation sources. Use designated appearance references for design and anatomy; use motion references for timing and performance. Inspect actual playback before relying on a video reference.
- If the designated approved source cannot be located, ask for that source before attempting an exact visual match. Continue independent project inspection. Resolve other unspecified choices from context rather than adding approval stages.

## Execution

1. Discover the operations this server exposes with `ae_catalog`, then inspect the intended composition, nested rigs, effects, expressions, timing and current selections with `ae_project_info`, `ae_comp_info` and `ae_layer_info`. Do not assume an operation exists because a previous session used it.
2. Before structural changes to an existing project, save its current in-memory state to a separate backup with `ae_save_project`. Work in a named revision and preserve unrelated compositions and render jobs.
3. Record the approved pose, silhouette, depth order, object contacts, moving and stationary elements, and requested action beats. For a local motion edit, retain the existing artwork as the baseline.
4. For construction or appearance changes, load [Artwork and materials](artwork-and-materials.md). For new or revised motion, load [Character performance](character-performance.md) and apply only its relevant branches. For programmatic creation, JSX delivery, or vector import, load [Native execution](native-execution.md).
5. Build and animate the requested scene components. Keep each independently useful character or prop selectable through a named rig or precomposition. Expose the controls the user needs without duplicating animation ownership.
6. When progress is requested, show meaningful native construction stages and rendered motion checks. Keep the working composition identifiable; distinguish an unfinished test from a deliverable.

## Completion

- Check the opening pose, action extrema, intermediate frames, and settling at playback speed. Apply the verification conditions in each loaded reference. For revisions, compare unaffected artwork and animation against the baseline.
- For project or video delivery, save the editable project with `ae_save_project` and render from the actual composition; use `ae_render_frame` for frame-level proof. Verify the output file's dimensions, duration, frame rate, and visible performance. Confirm completion of asynchronous renders before reporting them as finished. For script-only delivery, use the handoff conditions in [Native execution](native-execution.md).
- Deliver the requested scope: normally the saved project, required local assets, rendered preview, and a concise note identifying compositions and controls. Include separate scene renders, a combined sequence, or a JSX builder when requested. Resolve codec and container from the delivery requirement and available encoder; state a necessary alternative.
- Distinguish static validation, native execution, rendered inspection, and user acceptance. Report unperformed checks as unverified. Keep generated deliverable language consistent with the current request.
