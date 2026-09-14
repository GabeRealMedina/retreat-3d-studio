---
name: ae-clean-rig
description: Primary entry point for every native After Effects task through the local MCP. Use whenever the user asks to build, create, edit, rebuild, animate, fix, inspect, verify or render an After Effects project, composition, layer, text, shape, mask, effect, expression, keyframe or frame — including reference recreation and cleanup work. Builds clean native projects, preserves reference appearance and motion, exposes useful controls, and verifies rendered results. Load this before any other ae- skill; it routes to the companion modules itself through ae_get_skill, so those must not be selected on their own. When another ae- skill names the specific subject of the request in its own description, that skill takes precedence over this one.
---

# After Effects: clean construction, faithful motion

Use the local `higgsfield-use-after-effects` MCP tools. Inspect the project with `ae_project_info`, `ae_comp_info` and `ae_layer_info`, discover exact operation schemas with `ae_catalog`, then execute with `ae_do`. Do not invent tool or operation names. A batch shares one undo group but is not transactional — inspect partial results before retrying a mutation.

Treat the reference's appearance and motion as the target, and editable semantic construction as the method. Reducing complexity must not turn a distinctive reference into a generic approximation. Apply these decisions to text, objects, interfaces, backgrounds and effects throughout the composition. User constraints override every example and default in these modules.

## No reference attached

When the request is text only — no link, image, video or existing composition to work from — say so before building, and settle the visual foundation first.

Ask the user which route they want, with `ask_user_question` when that tool is available and as a plain question otherwise:

- **Generate a foundation.** A moodboard of four directions, then a storyboard sheet built from the frame the user picks, then construction from that sheet. Read [17 · Visual foundation](references/17-visual-foundation.md) before starting: the two stages are not interchangeable, and a storyboard generated without a chosen moodboard frame has nothing holding its panels together.
- **Supply a reference.** The user attaches an image, a video or a link, and the work proceeds from real evidence.
- **Proceed from the text anyway.** Allowed, but state plainly that composition, palette and timing will be invented, and record which decisions were yours.

This server generates nothing itself. The first route needs an image-generation provider connected in this session; when none is, offer only the last two and say why.

## Essential workflow

1. Inspect the current project and discover current capabilities with `ae_catalog`; do not assume an operation exists because a previous session used it. Save a separate backup with `ae_save_project` before structural changes and work in a named iteration. Keep unrelated compositions intact.
2. Establish the baseline: distinguish the original reference from screenshots of a failed recreation. Inspect original decoded frames and their timestamps, or use the approved existing comp for an edit. Record moving and stationary elements, cuts, holds, direction changes and important poses. Build a compact map of semantic components and motion. Do not infer missing motion from what an object usually does.
3. Choose the simplest representation that preserves the design: native text for editable wording, a few meaningful primitives and clean paths for graphics, native controls and effects for UI, and actual depth for products when visible. Do not build surfaces from dense traced fragments, crop reference screenshots into finished objects, or generate UI as a bitmap.
4. Put each independently useful object in a named precomp and give ordinary edits a clear source. A separate media placeholder must really have independent content. Expose useful controls on a null and, where appropriate, Essential Properties; keep ordinary instance transforms usable. Before changing a shared source, inspect its other instances and whether each needs an entrance, a complete pose or a loop. Preserve existing user keys and overrides when correcting appearance.
5. Use sparse intentional native keys and curves, shared motion controls and the right built-in effects. Preserve reference-supported bounce, overlap and settling; add no arbitrary motion. Do not hide dense animation behind an expression or precomp and call it simple. Keep actual custom deformation distinct from transforms and font changes.
6. Validate the native result: compare intermediate motion as well as key poses, resolve expression errors, inspect the nested render, and test one real content or control edit. Save a working project with its required media and a completed usable preview. Report material differences honestly and retain a return path to the previous version.

## Read the module that changes the current decision

Load one module with `ae_get_skill({name: "ae-clean-rig", reference: "references/01-construction.md"})`, or follow the relative link when reading from disk. Grouped modules keep their folder in the path — `reference: "references/characters/overview.md"` — and a shortened path is rejected as an unknown reference. Do not load every module for a small correction.

| When the task involves | Read |
| --- | --- |
| Simplifying an object, choosing shapes versus text or media, building UI, logos or 3D products | [01 · Construction](references/01-construction.md) |
| Reconstructing a reference, fixing extra motion, preserving timing, sparse keys and curves | [02 · Reference and motion](references/02-reference-motion.md) |
| Fonts, kinetic type, tracking, glyph deformation, diagrams and typographic construction | [03 · Typography](references/03-typography.md) |
| Gradients, colour flow, travelling light, glow, native ribbons and surface warps | [04 · Gradients and effects](references/04-gradients-effects.md) |
| New photographic stills or footage, where a plate comes from, generation settings and packaging | [05 · Media](references/05-media-generation.md) |
| Precomps, replaceable elements, null controls, Essential Properties and shared sources | [06 · Editable rigs](references/06-editable-rigs.md) |
| A gallery, Coverflow, cyclic slider, curved 3D loop or user-animatable camera | [07 · Controlled sliders](references/07-sliders.md) |
| One mascot or agent: silhouette quality, a compact rig, blink, gaze and head-turn parallax. Narrow add-on, not a whole character piece | [08 · Characters](references/08-characters.md) |
| Final checks, 2K upgrades, render defects or delivery and packaging | [09 · Validation and delivery](references/09-validation-delivery.md) |
| Scripting and expressions, timeouts, property references or renderer inconsistencies | [10 · AE scripting](references/10-ae-scripting.md) |
| The same execution questions inside a group's own subject | `references/boards/native-execution.md`, `references/collage/native-execution.md`, `references/characters/native-execution.md` — each is scoped to its group and is not interchangeable with 10 or with the others |
| A jointed figure that must hold poses: controller and coordinate design, hand and foot IK, pose libraries, lighting and compositing passes. Narrow add-on | [11 · Character production](references/11-character-production.md) |
| Characters assembled out of glyphs and type, pose sheets and typographic scenery. Narrow add-on, unrelated to drawn artwork | [12 · Symbol characters and catalogues](references/12-symbol-characters.md) |
| Translating a project, language versions, glossary and localization coverage | [13 · Localization](references/13-localization.md) |
| Fitting translated text, fonts and glyph coverage, counters and optical alignment | [14 · Localized typography](references/14-localization-typography.md) |
| Missing or unlicensed effects, project cleanup, Collect Files and handover packages | [15 · Dependencies and collection](references/15-localization-collect.md) |
| Cutting language versions to match a supplied short video reference | [16 · Recut from a video reference](references/16-localization-recut.md) |
| A text-only brief with nothing attached: moodboard, frame choice, storyboard sheet | [17 · Visual foundation](references/17-visual-foundation.md) |
| A whiteboard, sticky-note board or collaboration canvas: notes, cursors, staged entrances, board camera | [Boards](references/boards/overview.md) |
| Editorial photographic collage: paper and print texture, depth travel, animated prompt interfaces | [Collage](references/collage/overview.md) |
| **Animating drawn or illustrated characters end to end** — the complete pipeline: reading the artwork, contour deformation with vertex correspondence, connected anatomy, grain and shading that survive movement, a stepped cadence, and worked scene recipes. Start here for any illustrated character piece; 08, 11 and 12 are add-ons to it, not alternatives | [Characters · pipeline](references/characters/overview.md) |

## Companion routing

Load only what the task needs through `ae_get_skill`: `ae-mcp-realities` for transport and capability limits; `ae-build-orchestration` for larger builds; `ae-animation-principles` for motion; `ae-ui-mastery` for interface composition; `ae-design-first` for planning a layout; `ae-depth-space` for depth; `ae-liquid-glass` for glass; `ae-transition-kit` for reusable transitions.

## Saved preferences that affect tool choice

- Keep text, buttons, prompt windows, construction diagrams, captions and simple graphics native and editable. Keep clean authentic standalone logos when available. Use generated imagery for actual image and footage content, not as a way to flatten an editable interface.
- Preserve requested resolution, aspect ratio and frame rate across the hierarchy. Native vectors are not inherently the cause of rough rendering: diagnose fragmented geometry, sampling, effects and colour depth before choosing a local fix.
- When the user asks for a controllable rig, manual control must work directly. Keep optional demo timing separate and document units and ranges. Do not require the user to repair hidden duplicate layers for routine changes.
- If the user reserves acceptance or says to stay on one case, continue that case until they accept it. Routine authorized reversible work does not require an extra approval gate. If the user moves on, do not keep polishing the old case without reason.

## Finish

Inspect returned results and expression errors, render representative frames with `ae_render_frame`, and review the images. Include start, peak motion, settled state and seams when relevant. Check editability with a representative content change in a temporary duplicate. Save the intended deliverable only to its authorized destination with `ae_save_project`, and report the actual file, verified behaviour and remaining limitations. A completed tool call or a queued render alone is not visual proof.
