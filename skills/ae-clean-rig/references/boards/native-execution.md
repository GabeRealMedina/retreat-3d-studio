# Native Execution

## Tool selection and verification

- Discover the operations this server actually exposes with `ae_catalog`, and read the schema of each required operation before constructing a call. Do not assume a generic script-execution endpoint exists; `ae_do` dispatches only cataloged operations.
- Operation names inside `ae_do` and `batch.run` are unprefixed, such as `layer.create_text`. The `ae_` prefix belongs to the MCP tool names, not to the operations they dispatch. Inspect the project after any uncertain mutation result.
- A batch shares one undo group but is not transactional: an earlier operation may already have applied when a later one fails. Inspect partial results before retrying.
- When tool results omit required property details, inspect those properties through a further inspect operation rather than assuming them. Treat a generic notification as evidence only after relating it to the affected operation.

## Native scripting

- Arbitrary ExtendScript is not available by default: `eval.run` requires `AE_MCP_ENABLE_EVAL=1` on the server. Do not enable it, or ask for it to be enabled, to work around an operation the catalog simply does not expose — report the gap instead.
- Running a script file through **File → Scripts → Run Script File** needs a separate computer-use interface driving the AE window. This server does not provide one; use that route only when such an interface is available in the session and the user has authorized it.
- Resolve target names, paths, layer types, and required parameters from the current task. Verify uncertain APIs against the installed version's documentation before execution.
- Prefer property match names and inspect effect controls before assignment. Use supported undo groups and stop on errors that leave the result uncertain.
- If script file output is disabled, use `ae_save_project` and a readable completion report. Do not broaden script file or network permissions solely to produce an audit log.

## Native UI recovery

The steps below apply only when a separate computer-use interface is driving the AE window. They are not operations of this server.

- Re-query accessibility state after actions and derive fresh element indices before using them. After screenshot-only inspection, refresh accessibility state before an index-based action.
- In a macOS script-open dialog, use the file row's `Open Finder item` secondary action when available. If list selection stalls, switch to Columns and back to List, then obtain fresh indices. Do not repeat successful script execution while waiting for a delayed result.
- If the viewer and timeline show different preview positions, stop playback before inspecting a frame. Use the Composition Preview menu when its playback button is unresponsive, then use Go to Time for an exact position.
- Reconnect to the existing project when control becomes stale. Preserve the user's intervening changes and verify what executed before resuming mutations.

## Media inspection

- Use `ae_render_frame` for visual proof; it writes a local file and publishes nothing. The Composition viewer and native screenshots are alternatives when a computer-use interface is present. If a separate provider is used for generation or hosting, check its publishing behavior first: local editing authorization alone does not authorize public publishing.

## Required documentation lookup

- When installed documentation does not establish font replacement behavior, consult the [Adobe font replacement API reference implementation](https://github.com/AdobeDocs/after-effects/blob/main/samples/ReplaceFontsInProject_ScriptUISample.jsx).
- When converting a graphical text character, consult [Adobe shape and mask creation documentation](https://helpx.adobe.com/after-effects/desktop/drawing-painting-and-paths/shapes-and-shape-attributes/creating-shapes-masks.html) if the native conversion behavior is uncertain.
