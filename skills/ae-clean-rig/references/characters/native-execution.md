# Native Execution

## Select the supported path

- Prefer cataloged operations through `ae_do`. Arbitrary ExtendScript is not available by default: `eval.run` requires `AE_MCP_ENABLE_EVAL=1` on the server. Do not enable it, or ask for it to be enabled, to work around an operation the catalog simply does not expose — report the gap instead. Keep the user's existing authorization and requested delivery route.
- Resolve live targets with `ae_project_info` for the item list, `ae_comp_info` for one composition and `ae_layer_info` for one layer. Discover the operations available to `ae_do` with `ae_catalog`; operation names inside `ae_do` and `batch.run` are unprefixed, such as `layer.create_shape`. The `ae_` prefix belongs to the MCP tool names, not to the operations they dispatch.
- Resolve composition and layer selectors from the current project. Do not reuse earlier project names, coordinates, bridge ports, or absolute workspace paths as runtime defaults.
- For vector import, verify native Path animation, masks, gradients, layer order, and parenting after import. An importer that transfers static artwork or transforms alone does not establish successful shape animation transfer.

## Build native contours and controls

- Build contours with `shape.add_path` under a group created by `shape.add_group`, assigning vertices, in-tangents, out-tangents and closure consistently. In JSX, the equivalent is an AE `Shape` assigned to the native Path property. Resolve the intended native Path property inside its owning shape group before assigning deformation keys.
- Use verified property match names for host operations. Keep transform controls, contour keys, and material controls separately editable. Resolve references again after structural changes to indexed property groups.
- Keep the script's operations within the requested project scope and group reversible changes coherently. Save a new result path rather than overwriting the sole approved project.

## Verify execution and handoff

- Check script syntax and referenced targets before execution. Evaluate expression errors and inspect actual native keyframes after execution; numerical tests outside the host establish only their own tested properties.
- Render representative static and deformed poses from the native composition with `ae_render_frame` and review the images. Confirm that contour deformation, materials, reflection clipping, and the requested cadence survive the selected execution or import route.
- Treat a timeout as an unknown operation state. Inspect the intended composition before retrying a mutation.
- If direct execution is unavailable and the user requests a script, deliver the JSX with its required assets and the exact manual route: File > Scripts > Run Script File. That route needs a person at the machine or a separate computer-use interface; this server provides neither. Identify native execution as unverified until the script has actually run. Do not report an external vector preview as a completed After Effects render.
