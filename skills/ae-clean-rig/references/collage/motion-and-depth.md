# Motion and Depth

## Timing and Dynamic Openings

Build the opening around a clear visual event: a dominant subject assembling, an image cluster entering from several directions, or an initially close camera revealing a coherent scene. Establish a recognizable subject early. Avoid spending the first seconds on an empty background or a slow move with nothing new to discover unless the reference deliberately does so.

Give different elements staggered arrivals and different travel distances, while making them converge on the same visual event. For a fast paper assembly, use roughly 0.25 to 0.6 seconds per principal entrance with stagger offsets of roughly 0.04 to 0.15 seconds, then tune in playback. Use a small positional overshoot of about 3 to 6 percent of travel only when it reinforces the material, followed by a short settle. These are adjustable tuning ranges, not required timings.

Start the camera's reveal while the object assembly is still completing, but avoid making every object and the camera reverse direction together. One strong pullback can reveal more depth than repeated zoom punches. Keep enough margin for the moving subject before it reaches its resting position, not only after arrival.

For a short letter-by-letter headline, reveal native characters quickly and hold the completed word through the visual action. For longer text, preserve reading time and ensure that the revealing animation does not alter the final typographic layout. Discrete character changes may use HOLD timing; camera travel and color interpolation normally should not.

Plan the rest of the sequence around action, readable hold, and transition. When the user asks for more energy, shorten unnecessary anticipation and settling, overlap compatible actions, and give transitions a stronger directional intention. Do not accelerate all text and footage uniformly or apply the same bounce everywhere. A camera can travel continuously through a hold while keeping the subject legible.

During holds, distinguish camera drift, local secondary movement, and material boil. Give loose paper a restrained tilt or flutter around a plausible attachment point, while keeping attached captions and clips with their parent. Use independent deterministic phases and bounded movement rather than the same random shake on every layer. Preserve a stable focal element so continuous detail does not become visual noise.

Treat total duration as independent from the speed of individual movements. Preserve the existing timeline for a local energy pass unless shortening is requested. When duration does change, update nested sources, camera coverage, textures, prompt lifetimes, footage handles, markers, work area, and absolute-time expressions together. Snap hard cuts to the actual master frame grid.

For a time-bounded refinement, keep the change neutral outside the requested interval. Preserve the boundary pose and velocity, not only later key values: an altered early ease can change the following segment. Make any added motion return to zero offset and zero added velocity at the boundary, preserve later expressions and interpolation, and compare checkpoints in the supposedly unchanged interval.

## Camera and Depth Construction

Use one understandable main camera with an explicit 3D controller for deliberate travel. Decide whether the shot requires a fixed one-node orientation or a point-of-interest camera; do not accidentally combine both aiming models. Inspect camera local position, parent position, zoom, orientation, and auto-orientation before changing the rig.

Compose the arrival frame first, then derive the starting close-up or offscreen arrangement. Keep camera zoom fixed when a physical camera move can produce the intended result. A zoom change and a camera Z move have different depth behavior. Use optical-axis camera rotation for a small roll; rotating a distant controller can introduce an unintended orbit.

Stage the background, rear paper, photographic object, and foreground details on distinct planes. Keep tightly attached paper components shallow and coherent so the border, print, and label do not peel apart during a pan. The sign of Z alone does not identify the foreground in every rig; evaluate world space relative to the actual camera.

Changing Z changes projected size and position. Compensate with the real camera projection, especially for rotated planes, off-center cameras, and nested transforms. Use expression-space toComp, fromComp, and fromCompToSurface where appropriate to the actual nesting. Measure projected corners or the relevant visible silhouette. A source rectangle includes transparent padding and can overstate an object's visible bounds.

Shape velocity, not just keyframe positions. Use sparse meaningful poses, intentional rests, and nonzero transit velocities through waypoints that should flow. Zero-speed easing at every waypoint creates stop-start movement. Separated camera-controller axes allow signed scalar speed design; preserve monotonic segments unless a reversal is intentional. Check spatial tangents for loops and unwanted arcs.

Keep camera motion subordinate to the focal object. Add depth of field after blocking, with focus on the intended plane; do not blur important text to manufacture depth. Oversize all backgrounds and texture plates for the widest view, camera roll, jitter, and blur margins.

Motion blur does not solve intersecting planes. For incorrect overlaps, inspect depth, parent transforms, mattes, duplicate layers, opaque source backgrounds, collapse transformations, and 2D or adjustment layers interrupting a 3D compositing group. Check intermediate frames as well as both endpoints before adding blur.

## Photographic Assembly and Object Replacement

Use this section when a photographed object is assembled from pieces or replaced on command. Split the same source into meaningful regions with complementary masks. Preserve the same resting transform, anchor, scale, and depth for pieces that must join seamlessly. Animate the major mass first and a recognizable upper or foreground detail shortly afterward.

Keep mask feather small enough to retain a photographic edge. Inspect the join at full resolution for a gap or a doubled translucent seam. Avoid separate drop shadows between adjoining regions; use a coherent shadow for the assembled silhouette when needed. Do not let a late-arriving segment intersect an unrelated foreground plate.

For replacement, maintain a clear visual relationship between the outgoing and incoming object. Refit anchors and scale to the new artwork's actual dimensions, align the meaningful ground or resting point, and stage the travel so both objects do not obscure the interface. Keep the previous background and new background covered throughout the exchange.

When reusing keyed footage, preserve a functioning effect chain and verify it on a scratch copy before integration. A source may require Keylight 906, ADBE KeyCleaner, and ADBE Spill2 together. Do not replace a validated key with a rough color-removal shortcut. Inspect spill, edge transparency, source duration, audio state, and the layer's position relative to interface elements.

## Cadence and Motion Blur

Use 12 fps visual cadence when requested or supported by the reference. Preserve the delivery frame rate unless a different timeline rate is requested. ADBE Posterize Time can step a rendered layer or an entire composite; the expression function posterizeTime only changes the evaluation cadence of its own property. Stepping grain alone does not step the camera or the other layers.

A top-level Posterize Time adjustment can give the scene a shared cadence. Confirm its installed Frame Rate property before setting it; do not assume that positional property access is portable to other effects. At a 30 fps timeline, 12 fps sampling produces uneven repeated-frame counts, so review the actual playback rhythm rather than assuming uniform two-frame holds.

Decide whether the interface shares the stepped cadence or remains smooth. Keep interface text above grain and displacement when it should stay clean; place it below the cadence adjustment only when it should share that timing. Ensure that the chosen adjustment placement does not unexpectedly split a required 3D group.

Enable motion blur at both composition and moving-layer levels when useful. A 180-degree shutter and -90-degree phase are a reasonable initial photographic-motion treatment, not a compulsory setting. Reduce blur if it smears cut-paper edges or defeats the stepped look. Check the combined result of posterization and blur in playback.

