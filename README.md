# Higgsfield local application MCPs

Independent local MCP packages for After Effects (repository root) and [Blender](blender/README.md). Each package has its own dependencies, build, tests and release.

## After Effects

Local control of Adobe After Effects, with offline creative skills adapted from the FNF bridge. Based on the MIT-licensed [mcp-aftereffects](https://github.com/kumoproductions/mcp-aftereffects) runtime; see [attribution](UPSTREAM.md).

```text
Codex / desktop MCP client → local stdio server → OS scripting → After Effects
                                  ↓                    ↕
                            bundled AE skills     local file mailbox
```

No Higgsfield account, cloud relay or installed AE panel is required. Adobe licensing, an installed AE application, OS Automation permissions and AE's scripting file access preference are separate requirements. The root integration controls AE; the separate `blender/` package controls a dedicated background Blender process over stdin/stdout pipes. A remote web client cannot directly launch a local stdio process.

## Repository layout

- Root: the local After Effects MCP runtime, tests and setup CLI.
- `blender/`: the independent `fnf-blender-mcp` package, background Python runner, CLI, skills and tests.
- `skills/`: the single source of editable skills, also bundled with the runtime.
- `scripts/`: skill installation, manifest generation and validation.
- `creative-skills/archive/bridge-ae/`: original bridge knowledge retained for migration review.

Both original Git histories are retained. After Effects and Blender run as separate MCP servers; neither package requires the other. Root npm commands apply to After Effects. Run Blender commands from `blender/`.

## Setup

Requires Node 24+, macOS or Windows and After Effects (the upstream defaults probe 2024–2026).

```sh
npm ci --ignore-scripts
npm run build
node dist/cli.js doctor
node dist/cli.js install-codex
```

`doctor` inspects installation and verifies the bundled skills without launching AE. `install-codex` registers absolute paths under `higgsfield-use-after-effects` and refuses to overwrite a conflicting configuration. Refresh the MCP connection in your client after registration. Keep this checkout at its registered path. To remove only this registration: `codex mcp remove higgsfield-use-after-effects`.

When replacing an existing `fnf-after-effects` registration, review it with `codex mcp get fnf-after-effects`, remove the old entry with `codex mcp remove fnf-after-effects`, then rerun the installer.

For another desktop MCP client, `node dist/cli.js config` prints a JSON configuration using the current Node and server paths. For nonstandard AE installs, set `AE_MCP_EXE` in the MCP server environment. On macOS, allow the relevant host app's Automation request when first connecting. Enable AE's **Allow Scripts to Write Files and Access Network** preference if AE reports file access denied.

For the discoverable entry skill, run `python3 scripts/install-skill.py` from this checkout. Its companion skills come from this server and need no separate global installation.

## First calls

1. `ae_get_skill({})`: offline skill index.
2. `ae_get_skill({"name":"ae-clean-rig"})`: construction and verification workflow.
3. `ae_get_skill({"name":"ae-clean-rig","reference":"references/07-sliders.md"})`: load one focused module.
4. `ae_project_info({})`: verify the real AE connection and inspect current work.
5. `ae_catalog({})`, then `ae_catalog({"category":"layer"})`: discover exact operation parameters.
6. `ae_do({"operation":"layer.create_text","args":{"comp":"Main","text":"Hello","name":"Title"}})`: edit an existing named comp when requested.

The 12 tools are documented in [TOOLS.md](docs/TOOLS.md). The native operation registry is available through `ae_catalog`; it includes compositions, text, shapes, properties, keyframes, effects, cameras and project operations. Discover the actual policy-filtered catalog rather than assuming every operation is enabled.

## Project behavior

Preserve unsaved work. Inspect before editing and render representative frames for visual proof. `batch.run` groups operations for undo but does not roll back automatically on failure. A consumed request that times out may have executed: inspect before retrying mutations.

`AE_MCP_READONLY=1` restricts project changes. `AE_MCP_ALLOW_CATEGORIES` filters operations. Arbitrary eval is off unless `AE_MCP_ENABLE_EVAL=1`. Never use a shared writable directory for the executable mailbox. Keep secrets out of skill documents and server logs.

## Skills and development

Skill entries and their references are maintained directly under `skills/`; no network or sibling checkout is needed to read them. The runtime verifies document hashes and serves only manifest-listed paths. The original bridge archive lives under `creative-skills/` in this repository and is excluded from the runtime package.

```sh
npm run skills:manifest
npm run check
npm run test:offline
```

Edit `skills/` directly, then regenerate `skills/manifest.json` and commit it together with the skill changes. Generation writes only the manifest, works with uncommitted edits and requires no Git metadata. `npm run skills:check` rejects stale descriptions, hashes, missing entries and invalid reference links. The version 2 manifest uses document hashes instead of `sourceCommit`; `ae_get_skill` no longer returns that obsolete snapshot field. Live tests under `tests/e2e` have separate prerequisites; offline success does not prove rendering on your AE installation. See [VALIDATION.md](docs/VALIDATION.md) for the actual checks performed on this fork.

The root After Effects package publishes to the public npm registry as `fnf-after-effects-mcp`. Install the current release with `npm install --global --ignore-scripts fnf-after-effects-mcp@0.1.1`. Do not use the upstream package name when installing this fork. Historical upstream documentation is preserved in `docs/UPSTREAM-README.md` for reference.

## Blender development and releases

```sh
cd blender
npm ci
npm test
npm run typecheck
npm run test:package
```

See [Blender setup and verification](blender/README.md) and the [Blender release procedure](blender/RELEASING.md). The published npm identifiers stay `fnf-after-effects-mcp` and `fnf-blender-mcp`; `/use-blender` continues installing from npm. CI validates and packs each package independently.
