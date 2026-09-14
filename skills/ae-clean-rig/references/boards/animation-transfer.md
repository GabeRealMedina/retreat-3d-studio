# Native Animation Transfer

## Resolve the exact scope

- Resolve the source layer, target layers, and component family from the live composition using the user's exact selectors. Distinguish colored notes from photo frames, rounded diagram nodes, badges, and unrelated cards. Do not expand a family from visual similarity alone.
- Inspect source and target transforms, expressions, effect names and order, controller values, anchors, source dimensions, parent chains, in/out points, start times, stretch, time remapping, masks, mattes, and nested animation. Preserve the source and unrelated components.
- Record each target's independent content, final position, resting angle, placement in the layer stack, and relationship to other layers. Determine whether timing is identical globally or shifted per target. Record stagger as offsets relative to the source, not as a new animation style.

## Capture native animation data

- Capture every transferred property's key times and values, incoming and outgoing interpolation types, temporal ease speed and influence per dimension, temporal auto-Bézier and continuity flags, and expression text plus enabled state. Discover the exact operations with `ae_catalog`; `keyframe.set_batch`, `keyframe.set_easing`, `keyframe.set_interpolation`, `keyframe.set_spatial` and `keyframe.set_roving` cover the usual cases.
- For spatial properties, also capture incoming and outgoing tangents, spatial auto-Bézier and continuity flags, and roving state. For separated Position dimensions, operate on the animated follower properties rather than treating the separation leader as an ordinary keyed property.
- Preserve the source's actual controller values and effect dependencies. A matching-looking preset is not an exact copy. Do not change linear base keys into Bézier keys when an approved expression depends on their incoming velocity.

## Choose the least disruptive transfer method

- Prefer updating animation on the existing target when it has incoming layer references, unique masks or effects, essential overrides, track-matte relationships, or other identity-dependent behavior.
- For independent 2D precomposition cards with compatible parent and time coordinates, duplicating the reference layer and replacing its source is a verified way to preserve custom controllers, expressions, and keyframe metadata. The `layer.duplicate` and `layer.replace_source` operations support this branch.
- Before using duplication, confirm that replacing the target layer will not break references or discard required target behavior. Retain the original target until the duplicate is validated, place the duplicate at the intended stack position, and preserve the target's final name. Keep independent target source content; duplicating only the root layer does not make shared source contents independent.
- If source and target geometry differ, set the appropriate anchor from the target's own source dimensions and pixel aspect. Translate Position key values by the difference between resting positions and Rotation key values by the difference between resting angles. This constant-offset method requires compatible coordinate spaces; resolve differing parents or transforms before using it.
- Copy temporal metadata directly rather than rebuilding generic easing. Apply one constant time offset to the transferred keys while preserving each interval. Retain expression bindings and controller order. Detect absolute-time expressions: shifting keys alone is insufficient when an expression uses fixed global timing. Adjust such dependencies deliberately or report why exact transfer is unresolved.

## Keep nested reveals aligned

- Map corresponding semantic child layers by their actual names and function. Transfer only the relevant text-selector and stroke-reveal animation, preserving target wording, fonts, shape geometry, colors, and internal layout.
- `ADBE Text Percent Start` identifies the range-selector property used by the verified typing rig, and `ADBE Vector Trim End` identifies the stroke-reveal property. Verify the current hierarchy instead of assuming those properties exist at fixed indices.
- Convert offsets into each child's local time when start time, stretch, or time remapping differs. A raw global offset is valid only for matching time coordinates. Preserve unused or unmatched child content rather than copying Source Text from the reference.
- Do not restore effects absent from the live reference. The approved source's current animation governs the transfer even when an earlier version used a different effect.

## Validate the transfer before delivery

- Compare source animation and requested invariants before and after. Compare copied key data after subtracting the intended time, position, and rotation offsets. Confirm effects, control values, expressions, and interpolation metadata; use numerical tolerance only for floating-point representation, not as permission to alter curves.
- Re-evaluate the reference and targets in a fresh host call after mutation, allowing After Effects to invalidate cached values. Sample before the entrance, during movement, around extrema, and after settling at corresponding offset times. Check frames immediately before delayed reveals for premature visibility.
- State the maximum sampled errors with units. Separate native key-data equality from evaluator differences; small spatial interpolation differences may occur even with copied metadata. Inspect visible motion rather than treating a tolerance threshold as proof of fidelity.
- Check that targets enter in the requested order, dependent text follows the new schedule, source content remains distinct, and unaffected root animation is unchanged. Render the changed interval and follow the entrypoint's delivery checks.
- If a call fails or times out, inspect the actual current state before retrying. A partially completed transfer must not be duplicated, retimed twice, or mistaken for an untouched target. Do not rerun whole-project normalization to repair a local transfer.
