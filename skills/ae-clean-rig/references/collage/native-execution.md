# Native Execution

## Establish Real Control of After Effects

Read and edit the live project through this server's tools: `ae_project_info` for the item list, `ae_comp_info` for one composition, `ae_layer_info` for one layer. Discover the operations available to `ae_do` with `ae_catalog` before calling them; operation names inside `ae_do` and `batch.run` are unprefixed, such as `layer.create_shape`. The `ae_` prefix belongs to the MCP tool names, not to the operations they dispatch. Establish both connector authentication and desktop-host connectivity, then read the composition inventory and one target layer. A successful website login or a panel displaying a connection indicator is not proof that the host can be controlled.


Prefer cataloged operations through `ae_do`. Arbitrary ExtendScript is not available by default: `eval.run` requires `AE_MCP_ENABLE_EVAL=1` on the server. Do not enable it, or ask for it to be enabled, to work around an operation the catalog simply does not expose — report the gap instead. When the user asks for a script as the deliverable, hand over reviewed JSX with the exact manual route: File > Scripts > Run Script File. That route needs a person at the machine or a separate computer-use interface; this server provides neither, so the script stays unverified until it has actually run.

For a human-run route, first prepare a read-only preflight that reports the host version, target composition, fonts, assets, and required effects. Ask the user to return the report, then adapt the construction script to that verified environment. Planning and script preparation can proceed before this feedback arrives, but do not claim that unavailable host checks passed. Request file-writing permission only if the report must be saved, and do not turn on unrelated network access merely to inspect a project.

Inspect unfamiliar downloaded scripts before installation or execution, including immediate startup actions, file writes, shell calls, network access, and dynamic code loading. A supplied script is not automatically safe or necessary. Optional selection-frame panels are not required for the collage, and their outlines do not establish correct camera-projected bounds.

Keep UI automation grounded in the current accessibility tree or screenshot. Refresh targets after changes. If a navigation action produces an application-context error, stop that route rather than repeating it. Setting composition time through reviewed JSX can avoid problematic accessibility time controls. Do not close or relaunch an unsaved project merely to refresh a panel.

## Inspect and Preserve the Project

Record the exact project path, composition identity, dimensions, pixel aspect, frame rate, duration, renderer, color depth, work area, and active camera. Inspect affected layer sources, source dimensions, parents, 2D or 3D state, start times, in and out points, time remapping, transforms, expressions, effects, masks, mattes, blending modes, and collapse-transform switches. Read the properties being changed, not only the layer names.

Save a recoverable backup of the actual live project before structural changes, including unsaved user edits. For a from-scratch interpretation inside an existing project, create a clearly named new composition and preserve the source. A duplicated composition still shares its nested sources; duplicate an affected source before changing it when the baseline must remain visually unchanged.

Give created layers and controls semantic names and a recognizable ownership marker. Detect an existing generated stage before running it again. Preserve unknown user animation and unrelated compositions. Never rerun a whole builder to repair one failed effect, and never normalize every keyframe or clear expressions as an unannounced cleanup.

## Reliable Native Editing

Use ExtendScript-compatible language features when generating JSX; it is not a Node.js or browser environment. Keep each script scoped to one stage. Preflight targets, assets, property types, source dependencies, and backup paths before mutation. Find a unique composition and layer, and stop on ambiguity instead of selecting the first matching name.

Use match names for native properties and inspect the installed object. ADBE Transform Group contains ADBE Position, ADBE Anchor Point, ADBE Scale, ADBE Rotate Z, and ADBE Opacity. Source Text is ADBE Text Document beneath ADBE Text Properties. Avoid unsupported shorthand when an explicit property lookup is available.

Inspect dimensionsSeparated before reading or editing Position. A separated leader is not an ordinary vector; address its X, Y, and Z followers individually through getSeparationFollower. Preserve existing expressions intentionally. Writing underlying keys can be appropriate when an expression depends on value, but replacing keys without understanding the expression can destroy a projection or registration setup.

Validate finite numbers, array lengths, and denominators before assigning values. Scalar properties need numbers; 2D and 3D numeric properties need correctly sized vectors; native Color properties commonly need four components. A Shape needs complete vertices, matching tangent arrays, and its closed state. TextDocument, Shape, and other specialized values are not interchangeable with ordinary numeric arrays.

Temporal-ease dimensionality differs from value dimensionality. Spatial Position takes one KeyframeEase per side even when its value has three coordinates. Nonspatial TwoD takes two, nonspatial ThreeD takes three, and scalar followers and Color take one. Spatial tangent arrays, by contrast, follow the spatial coordinate count. Check interpolation support and valid influence before setting easing; preserve discrete HOLD events.

Adding a property to an indexed group can invalidate previously held references. Configure the new effect immediately or reacquire the required effect, mask, or shape group after adding siblings. Avoid duplicate effects by locating the intended instance explicitly. When multiple instances exist, do not choose one by accident.

For Drop Shadow, ADBE Drop Shadow-0002 through -0005 address opacity, direction, distance, and softness. Confirm effect availability before adding it. Do not extrapolate these suffix conventions to unrelated plugins or effects with different contracts.

Use an undo group for a scoped native edit and close it even on failure. An undo group does not automatically roll back partial changes. Log the failed stage and the error as text; do not pass an Error object into arithmetic or a property setter. Inspect what was actually applied before retrying a timed-out or failed operation.

When a source layer is copied, verify parents, mattes, effects, source timing, and expression references on the copy before integrating it. When freezing a deliberately duplicated pose, capture evaluated values before removing animation. Do not freeze a source merely because its keys are inconvenient to inspect.

