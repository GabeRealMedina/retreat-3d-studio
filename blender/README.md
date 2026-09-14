# Higgsfield use Blender

The independent `fnf-blender-mcp` package in `fnf-local-pluging-bridge-mcp/blender` controls a dedicated background Blender process. No add-on, HTTP listener, WebSocket, cloud account or open Blender window is required.

```text
Desktop MCP client → stdio → Node MCP → process pipes → Blender --background → bpy
```

Each MCP connection owns one process. Its scene persists between commands; it cannot access unsaved work in an already-open desktop Blender. Open saved input with `bl_open_project`, edit and render, then save a `.blend` output to inspect in the desktop UI. Disconnecting loses unsaved session changes. The After Effects package at the repository root is independent.

## Setup

Requires Node.js 24+ with npm and Blender 4.2+. Version 0.2.0 introduces the background runtime; version 0.1.0 uses the previous add-on. Install the latest published version (0.2.0 or newer); rerun the install command to update an existing installation.

```sh
npm view fnf-blender-mcp@latest version --registry=https://registry.npmjs.org/
blenderDir="$HOME/.higgsfield/blender-mcp"
npm install --prefix "$blenderDir" --registry=https://registry.npmjs.org/ fnf-blender-mcp@latest
blenderCli="$blenderDir/node_modules/fnf-blender-mcp/dist/cli.js"
node "$blenderCli" doctor --blender "/absolute/path/to/blender"
node "$blenderCli" config --blender "/absolute/path/to/blender" --format json
```

Use the executable inside `Blender.app/Contents/MacOS/Blender` on macOS, or `blender.exe` on Windows. `config --format toml` prints a Codex entry. Both formats include absolute Node/server paths and `BLENDER_EXECUTABLE`; merge the entry into the intended client and refresh its connection. The helper prints configuration but does not register a server. See the [installation skill](skills/use-blender/references/installation.md) for PowerShell and migration steps.

The server starts Blender on its first execution call. `doctor` checks a separate temporary background process and terminates it afterward. Verify conversation access with `bl_health` and `bl_get_scene_summary`. `BLENDER_EXECUTABLE` can be set directly; without it the runtime tries standard installation locations and PATH. No separate Python installation is needed at runtime.

## Tools

| Area | Tools |
| --- | --- |
| Inspect | `bl_health`, `bl_get_scene_summary`, `bl_get_object` |
| Scene | `bl_add_primitive`, `bl_delete_object`, `bl_set_transform`, `bl_set_material`, `bl_import_model` |
| Camera/light | `bl_add_camera`, `bl_set_active_camera`, `bl_add_light` |
| Animation | `bl_set_frame`, `bl_insert_keyframe` |
| Files | `bl_save_project`, `bl_open_project` |
| Evidence | `bl_render` |
| Python/status | `bl_execute`, `bl_job_status` |
| Offline guidance | `bl_get_skill` |

Start with `bl_get_skill(name: "blender-scene")`. Python runs sequentially on the process's main thread. Scene datablocks persist, while script-local variables do not. Assign a JSON-compatible `result` to return data. Python stdout/stderr are capped at 64 Ki characters each; JSON results are limited to 4 MiB. Native Blender diagnostics do not enter the MCP stdout protocol.

The npm archive also contains the eleven craft modules introduced in 0.2.1. Install the complete `skills/` bundle in a client that supports local skills to load those modules; `bl_get_skill` still exposes only its existing five names. Connecting the MCP server alone does not install the additional skills in the client.

Render a camera frame to PNG; files up to 4 MiB receive an inline preview. Cycles supports sample overrides. Save/render require `overwrite: true` for existing output files; opening a different project refuses unsaved changes unless explicitly discarded. Arbitrary Python is not sandboxed and can bypass these typed-tool guards. Automatic execution of Python embedded in opened `.blend` files is disabled.

## Session lifecycle

A timed-out job continues and keeps its `job_id`. Query `bl_job_status` before retrying; additional execution commands are rejected while it runs. No automatic retries or rollbacks occur. Status retains at most 128 jobs within the MCP process. If Blender crashes, the session fails and is not restarted automatically: inspect output files before reconnecting to a new empty session. Closing the MCP terminates its child process, including a running job; save needed changes first.

In 0.2.0, `launch`, `install-addon`, `bl_screenshot`, bridge discovery, PID selection and runtime-directory overrides are removed. Use camera renders for visual evidence. No existing desktop scenes, preferences or installed add-ons are modified during startup. Multiple MCP connections have separate background scenes.

## Development and validation

From the repository root:

```sh
cd blender
npm ci
npm test
npm run typecheck
npm run test:package
BLENDER_EXECUTABLE=/absolute/path/to/blender npm run test:live
```

Offline tests exercise actual MCP and child-process pipes using a Python CLI fixture, persistent session state, isolation, timeout recovery, process death, bounded results/history, output formatting, CLI configuration and typed-script guards. They do not replace live Blender validation. `test:package` installs the archive independently and verifies 19 tools, offline guidance and the absence of add-on files. `test:live` uses real Blender for geometry, materials, keyframes, file guards and a small Cycles render in disposable files.

Verified on macOS arm64 with Blender 4.2.23 LTS: persistent scene, mesh/material/camera/light edits, keyframes, save/reopen guards and a Cycles PNG preview. Windows/Linux native Blender execution has not been verified locally.

See [RELEASING.md](RELEASING.md) for release steps. The setup skill is mirrored in fnf-mcp-server's `/use-blender` command; keep its body and references synchronized. See [UPSTREAM.md](UPSTREAM.md) for provenance and [LICENSE](LICENSE) for the MIT license.

Background Blender does not reliably mark direct Python edits as dirty. The MCP also tracks attempted mutations, including failed commands and arbitrary `bl_execute` calls, conservatively as unsaved until `bl_save_project` or an explicitly permitted `bl_open_project` succeeds. Read tools preserve this state.
