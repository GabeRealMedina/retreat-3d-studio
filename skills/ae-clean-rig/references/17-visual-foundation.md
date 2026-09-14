# Building a visual foundation when nothing is attached

Use this module when the request is text only — no link, image, video or existing composition — and the user wants a visual foundation generated before construction begins. A described-from-words scene is the weakest brief there is, and building straight from one is how a project turns generic.

This server generates nothing. Every step below needs an image-generation provider connected in the same session. Verify it is callable before offering the route; if none is connected, offer only the two fallbacks at the end and say why.

## The two stages are not interchangeable

The pipeline has a moodboard stage and a storyboard stage, and they produce different artefacts for different reasons:

| Stage | Artefact | Question it answers |
| --- | --- | --- |
| A · Moodboard | one 4-up 2x2 board, four different visual directions, always 3:2 | *which world is this?* |
| B · Storyboard | one panel sheet built from the chosen frame | *what happens, panel by panel?* |

Stage B takes the approved moodboard frame as its reference image. Running it alone, with no chosen foundation, produces panels with nothing holding them together — which is the failure this module exists to prevent. Do not skip Stage A and call the result a storyboard.

## Stage A — moodboard

One generation. Ask for a 4-up 2x2 board of four genuinely different current motion-design directions, not four variations of one idea: flat 2D, kinetic typography, abstract dimensional, material and texture-led are all legitimate neighbours on the same board. Aspect ratio is always 3:2 — the board is a menu, not a final composition, so never ask the user for its ratio.

Read a style hint out of the brief only if one is actually there: a colour reference such as "sage and cream", or a mood reference such as minimal, editorial, organic, industrial, playful. With nothing in the brief, run the stage without a hint rather than inventing one.

The moodboard is visual only. Do not put consumer-facing copy, numbers, results, prices, comparisons or taglines into it. A tagline appears only when it is the user's own exact wording and the brief allows it.

A photographic or rendered image model suits this stage; a vector model does not, because the board is about material, light and atmosphere rather than flat shapes.

## Stage A.2 — the user picks the foundation

Present the four frames and ask, with `ask_user_question` when that tool is available and as a plain question otherwise. Offer: each of the four frames by position, regenerate with an adjusted hint, or abandon the generated route. Treat a freeform reply such as "all of them" or "the top left one" as the matching choice rather than collapsing to the text-only path.

The chosen frame carries its subject, material, palette and atmosphere into every panel that follows. Record which frame was picked and why.

## Stage B — storyboard

One generation, taking the approved frame as its reference image so the panels inherit the chosen world. The sheet's aspect ratio mirrors the intended output: 3:2 for a 16:9 composition, 9:16 for vertical, 1:1 for square.

A flat-vector image model suits this stage: the panels are blocking for native construction — shapes, type, staging and camera intent — not a finished frame. `recraft_v4_1` in vector mode is the model matched to that job.

Carry the same aspect answer through to the composition itself; a sheet planned for one ratio and built into another wastes the staging.

## Stage C — construction

Build from the approved sheet with the rest of this skill: read the panels as the scene plan, choose the simplest representation per element, and keep everything native and editable. The sheet is a plan, never source artwork — do not crop panels into the composition or trace them as finished objects.

## When no provider is connected

Offer the two honest fallbacks:

- **Supply a reference.** The user attaches an image, a video or a link, and the work proceeds from real evidence.
- **Proceed from the text anyway.** Allowed, but state plainly that composition, palette and timing will be invented, and record which decisions were yours so they can be reviewed.

Report which route was taken. A generated foundation the user never approved is not a brief.
