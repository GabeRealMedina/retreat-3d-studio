# Camera and Easing

## Precomposition and motion ownership

- For an all-layers precomposition request, move the current layers into one native precomp, including hidden mattes, locked layers, and UI. Preserve ordering, parent links, source identities, keyframes, expressions, and lock states. Compare these with the recorded source state after the operation.
- Reuse an existing suitable wrapper instead of nesting another wrapper on a retry.
- For a flat board, animate the wrapper's Position and uniform Scale. Use a 3D camera only when the requested perspective or depth requires it.
- Preserve source playback and animation. Do not introduce time remapping or time stretching to implement a camera-only edit.
- Include the header and sidebar in the moving board when all layers were requested. Keep them fixed only when the user requests an overlay or the established project structure requires one.
- Add internal parallax only when requested. Keep each note's paper, text, and reaction badge aligned within its group.

## Framing and route

- Select close-up targets from the user's request or the supplied board. Arrange them into a readable route with deliberate stops; avoid copying a previous project's labels or coordinates.
- Measure each target's visible bounds after its entrance has settled. Include parent transforms, rotation, scale, anchor offsets, paper folds, and reaction badges. Do not assume precomp dimensions equal visible content bounds.
- Transform target corners into board coordinates. Calculate uniform zoom from the existing viewport's available bounds and the transformed target bounds; leave enough margin to avoid clipping.
- Keep the wrapper anchor fixed. Calculate Position from the viewport center minus the scaled displacement between the target center and wrapper anchor.
- Use repeated poses for stationary close-ups. Coordinate arrivals and departures with existing note entrances and exits without retiming the source.
- For a requested camera loop, match endpoint position and scale and inspect the last rendered frame against the first.

## Temporal and spatial interpolation

- Match the supplied speed graph. For requested quick departure with a long deceleration and no other handle values, use zero endpoint speed, outgoing influence 33.333333%, and incoming influence 77.15% as overridable defaults.
- Apply temporal Bezier interpolation to moving continuous properties. Disable temporal Auto Bezier when it would override the chosen handles. Construct temporal-ease arrays using the property's actual dimensionality.
- Control spatial paths independently of temporal easing. Use zero spatial tangents and disable unwanted roving or spatial Auto Bezier for straight pans. Set intentional tangents for curved travel and inspect intermediate framing.
- For a request to replace linear interpolation, deduplicate compositions by ID and process only eligible continuous segments. Preserve Hold keys, discrete text changes, existing custom curves, key times, values, and expressions. Verify both incoming and outgoing interpolation on affected segments and identify unsupported properties.
- Apply zero-speed stops at intentional pauses. Preserve velocity continuity through flowing cursor paths or uninterrupted travel.

## Rendering and checks

- Inspect selective Collapse Transformations or continuous rasterization on enlarged precomps. Compare matte, effect, and render-order behavior before retaining the change; do not enable these switches recursively across unrelated layers.
- Apply restrained motion blur only where it improves travel. Stationary close-ups must remain crisp. Optimize a dense vector grid only when it causes a demonstrated rendering problem and its appearance can be preserved.
- Verify wrapper keys, unchanged source playback, target centering, unclipped notes, intermediate travel, and the ending. Read temporal-ease values or inspect the speed graph; key times and values alone cannot establish easing correctness.
