# Isolated modeling workspace

The personal macOS installation now starts the entire MCP modeling server and its Blender children inside a deny-by-default macOS Seatbelt sandbox. The network-connected OpenAI tunnel client stays outside that sandbox. Only its stdio request/response pipes connect it to the modeling server.

## Working with models

The default workspace is `~/Retreat 3D Models`, with project folders `Backyard`, `Draculas Castle`, and `Other Projects`. The setup copied existing backyard project versions into `Backyard`; originals were preserved. The latest existing backyard model validated during setup was `Backyard/retreat-v10/Backyard-Cycladic-v10.blend` (2,324 objects, no missing external images or linked libraries).

Copy future models and their textures/assets into a project folder before opening them through ChatGPT. Use `retreat_workflow` to obtain the exact workspace path and active isolation mode. New revisions, GLB exports and renders must stay inside this workspace. A permission error for a file outside it is intentional. Keep important backups outside the workspace so the model process cannot change them.

The hidden `.runtime` directory holds the sandbox's separate home/config and temporary files. The launcher validates its resolved paths and will refuse an escaping symlink. Do not store project models in `.runtime`.

## Enforced boundaries

- File contents outside the workspace are denied, apart from read-only Blender/plugin code, the Node executable, selected macOS runtime/library/font locations and essential device files. File metadata lookups and the root directory itself are permitted for system initialization; that is not recursive read access to personal files.
- Writes are confined to the workspace (plus essential null/zero device operations). The server cannot rewrite its launcher or installed runtime.
- Direct internet and loopback network connections are denied. Necessary rendering GPU interfaces and limited system notification/logging services are explicitly allowed.
- Only the configured Node and Blender executables may run; descendants inherit confinement. External shell helpers are denied.
- The server receives a fresh environment with no inherited API keys or tunnel authentication settings. Its HOME and TMPDIR point inside the workspace.
- The tunnel credential remains outside the readable workspace. Even unrestricted Blender Python cannot open it under this profile.
- The tunnel launcher requires the sandbox entry point and fails if the installed configuration points at an unrestricted entry point. Sandbox startup failures never fall back to unrestricted execution.

## Limits

This is an OS-enforced process sandbox, not a separate virtual machine. It shares the Mac's kernel and uses Apple's deprecated `sandbox-exec` interface, so macOS updates may require compatibility work. Keep macOS and Blender updated. The process can still modify/delete files anywhere inside the allowed model workspace, consume CPU/memory/disk, and return workspace data through the intended ChatGPT tool-response channel. Continue reviewing tool approvals and keeping backups.

The preserved upstream `dist/index.js` and direct `dist/retreat-index.js` entry points remain unrestricted when launched manually. The installed plugin and private tunnel use `scripts/sandbox-launch.mjs`; do not replace that command with a direct entry point. Other platforms require a separate isolation implementation; this launcher refuses to run there.

## Validation performed

On September 20, 2026, with Blender 5.2.1:

- All 22 tools remained available through the installed tunnel launcher.
- Live creation, editing, unique revision saving, reconnection, rollback, GLB export and a Cycles render passed in the sandbox.
- The existing backyard v10 opened and saved to a separate validation copy.
- Negative tests confirmed denial of unrelated-file reads/writes, credential opening (without reading its contents), symlink escape, launcher writes, shell execution, internet/loopback connections, and an inherited child-process file read.
- The MCP preview reader was also unable to return an outside-workspace image.
- The environment canary was not inherited, and allowed workspace reads/writes succeeded.
- The upstream seven JavaScript tests, four Python tests and TypeScript checks passed. The production npm dependency audit reported no known vulnerabilities at test time; this is not a guarantee of vulnerability absence.

Run the live boundary checks from `blender/` using `node scripts/verify-sandbox.mjs`. Set `RETREAT_SERVER` to the tunnel launcher and `RETREAT_RUNTIME` to the installed runtime to test the installed path. The test uses synthetic outside-workspace files and never reads credential contents.

For restart and key renewal, see [the private tunnel runbook](RETREAT-TUNNEL.md).
