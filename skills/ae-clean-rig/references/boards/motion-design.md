# Motion Design

## Timing and motion evidence

- For video references, inspect real timestamps around entrances, acceleration, peak motion, overshoot, deceleration, and holds. Compare component trajectories independently of camera movement. Fit sparse native keys to the observed movement and verify between keys; rendered reference footage does not reveal original keyframe handles exactly.
- Build a timing map with first visible frames, active movement, text and stroke intervals, settling, and final readability. Permit overlapping component groups while maintaining a clear reading order. A sequential requirement may apply to a specific family without forcing every object in the board into one serial queue.
- Prefer medium or long movement intervals and extended deceleration when the brief calls for smooth motion. Remove unmotivated short stop-start segments. Preserve deliberately approved short keys that drive an Elastic expression; do not enforce a universal minimum key interval.
- For a small speed increase, retime the requested motion and its dependent reveals coherently while preserving normalized curves, sequencing, and the required overall video duration. Do not change unrelated media or design.

## Printed text, handwriting, and lines

- Reveal printed characters with a native text animator and a range selector. Use discrete character progression with zero selector smoothness; preserve the full editable Source Text. Guard empty strings when calculating character-based percentages. Verify spaces, line breaks, punctuation, and the last revealed character.
- Keep text reveal timing in the appropriate source-comp time coordinate. A later card entrance must not reveal already-completed text unintentionally. Offset dependent text animation with its card when the requested schedule changes.
- Represent handwriting as clean, editable centerline pen paths in writing order, including pen lifts and separate strokes. Drive each phrase through one progress control and distribute that progress across its strokes. Use Trim Paths or an equivalent native stroke reveal; a rectangle wipe or a trace around filled letter outlines does not reproduce writing.
- Draw connectors, arrowheads, borders, underlines, selection outlines, and doodles with intentional path direction and stagger. Reveal arrowheads as their connector finishes. Keep static components static when the reference requires it.

## Card and note entrances

- For photo cards, combine a small position offset, restrained rotation, opacity, and a controlled scale bounce. Keep the final photo crop, card placement, and text intact.
- The default colored-note treatment is flat Elastic scale and rotation with a soft shadow. Keep rounded diagram nodes flat with a much subtler scale bounce. Do not introduce folded backs, curl highlights, or reflective backside lighting unless the current brief explicitly requests a different material treatment.
- For a designated family that must enter sequentially, expose entrance start and stagger as timing inputs. Allow the preceding object to settle before the next prominent entrance. Offset the matching label, heading, body, owner, and edge reveals with each card while preserving their internal order.

## Optional Elastic entrance profile

Use this profile only for a new board when a supplied motion reference or live user-edited source does not establish different behavior. Every value is adjustable; the profile is not a restriction on other animation styles.

| Parameter | Starting value and interpretation |
| --- | --- |
| General position easing | Zero endpoint speed; outgoing influence 45%, incoming influence 100% |
| General opacity easing | Outgoing influence 40%, incoming influence 60% |
| Scale resting value | 100.8% in the visible dimensions; preserve the unused dimension |
| Photo scale | 6% to the resting value |
| Colored-note scale | 0% to the resting value |
| Scale key interval | 1/6 second, equivalent to five frames at 30 fps; align to the current frame rate |
| Colored-note rotation | Resting angle plus 46 degrees to the resting angle over the scale interval |
| Elastic amplitude | Control 20 divided by 200, yielding 0.1 |
| Elastic frequency | Control 40 divided by 30, yielding 4/3 cycles per second |
| Elastic decay | Control 60 divided by 10, yielding 6 per second |
| Incoming velocity sample | One tenth of the composition's frame duration before the most recent key |
| Photo translation | From a small diagonal offset to its resting position over about 1.4 seconds |
| Colored-note translation | A small upward movement over about 1.87 seconds, beginning about 0.31 seconds before the scale entrance |
| Sequential note stagger | 2 seconds when the content and duration accommodate it |
| Shutter angle | Approximately 180 degrees where motion blur benefits the movement |

- Keep Scale and note Rotation base keys linear for this profile. Add the decaying displacement to the underlying keyed value: incoming velocity multiplied by amplitude, multiplied by the sine of frequency times elapsed time times two pi, divided by the exponential of decay times elapsed time. Before the first key, return the underlying value.
- Expose amplitude, frequency, and decay with native editable controls. Discover the available control operations with `ae_catalog`; use native slider controls rather than inventing a custom pseudo-effect identifier. Existing custom controllers are handled by the transfer reference.
- Convert displacement to the target card size and composition scale. Preserve a settled view of the complete board while allowing ongoing cursor motion.

## Collaborative cursors

- Treat cursor count, participant labels, colors, entrance start, and stagger as runtime inputs. Keep each cursor and its name label in an editable unit above the board artwork.
- When using the default 18-second assembly schedule, start cursor entrances at 10 seconds with a 1-second stagger and an approximately 0.7-second fade. Reveal each name shortly after its arrow. Recompute the schedule for other durations or participant counts so every cursor becomes readable before the end; explicit timing overrides the preset.
- After entry, animate each cursor along a separate irregular native Position path with smooth spatial tangents, varied travel distances, and gently changing speeds. Use sparse route keys rather than frame-by-frame randomness. Keep routes and direction changes independent.
- If motion must continue until the last frame, place sufficient route continuation beyond the visible end rather than forcing a final zero-speed stop inside it. Keep layers active through the video duration and verify cursor and label bounds throughout their routes.
