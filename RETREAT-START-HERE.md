# Retreat 3D Studio

A personal 3D modeling plugin for creating real Blender geometry, revising it, rendering previews and saving editable files across conversations.

## What is included

- Higgsfield's independent local Blender MCP runtime and its MIT attribution.
- The 19 original Blender tools plus three Retreat tools: `retreat_save_revision`, `retreat_export_glb` and `retreat_workflow`.
- A complete bundled Blender skill library and a workflow for resuming saved models.
- A plugin manifest, a reproducible local build and generated MCP connection settings.
- Live validation covering model revision preservation, reconnection, export and rendering.

The source fork is [GabeRealMedina/retreat-3d-studio](https://github.com/GabeRealMedina/retreat-3d-studio). Our Blender entry point is `blender/dist/retreat-index.js`; the original `blender/dist/index.js` remains available for upstream compatibility. The root After Effects package is preserved as inherited source and is not installed by this plugin.

## Build

The isolated personal plugin requires macOS, Node 24+, npm and a Blender 4.2+ app bundle. The current machine has Blender 5.2.1 LTS. From the repository:

```sh
cd blender
npm ci --ignore-scripts
export BLENDER_EXECUTABLE='/Applications/Blender.app/Contents/MacOS/Blender'
node scripts/build-plugin.mjs
```

This builds `plugins/retreat-3d-studio`, including runtime dependencies and skills. It generates `.mcp.json` and `mcp-config.toml` using the actual Node and plugin paths. Those files are local configuration: rebuild after moving the plugin or changing machines. Generated runtime files are intentionally excluded from Git. Do not install the root After Effects package for this workflow.

## Connect locally

Use the generated `.mcp.json` in a client supporting local stdio MCP. The command is the Node executable, the sole argument is the absolute `runtime/scripts/sandbox-launch.mjs` path, and `BLENDER_EXECUTABLE` selects Blender. `RETREAT_MODELS_ROOT` identifies the allowed model workspace. The launcher confines both MCP and Blender processes and has no unrestricted fallback. The generated `mcp-config.toml` supplies the equivalent Codex configuration with a 360-second tool timeout. Merge that named entry without replacing unrelated settings, or install the personal plugin package through Codex.

After connecting, ask: “Use Retreat 3D Studio. Read retreat_workflow, check Blender health, and create a model that we can save and keep updating.”

For an existing model, give the last saved `.blend` path. The plugin controls its own background session, so save any model currently open in the Blender desktop app before asking the plugin to open it.

## Connect from ChatGPT on the web

The local server uses stdio; it is not an HTTPS URL. For a private local machine, OpenAI documents [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels). A tunnel requires Platform tunnel permissions, a runtime credential, the target ChatGPT workspace association and developer-mode access. These account-specific prerequisites are not supplied by this source repository.

Once an authorized tunnel is created, configure its local MCP command to use the private tunnel launcher, which reads the installed plugin configuration and requires the isolated entry point. Keep the tunnel client running, then choose that tunnel when creating the ChatGPT developer-mode plugin. Follow the linked official guide for current setup and access requirements. Do not paste credentials into source control or chat messages.

No tunnel or public endpoint is automatically deployed by this build. See [private tunnel operation](RETREAT-TUNNEL.md) for the launcher, private credential storage, health checks and restart instructions used by the personal installation. For a local desktop client with stdio support, the generated local configuration is sufficient; account UI and feature availability still need to be checked in that client.

## Keep models across conversations

1. Open the last saved `.blend` file and inspect its objects and units.
2. Make the requested edits and inspect a rendered preview.
3. Save a new revision. The returned filename includes a label, UTC timestamp and unique ID, preserving earlier revisions.
4. Export a GLB when needed; the `.blend` file remains the editable master.
5. Give the next conversation the saved `.blend` path.

Models belong in a project subfolder of `~/Retreat 3D Models`, outside the plugin installation. Existing models and their assets must be copied there before use. Unsaved scene state is lost on disconnect. A timed-out edit may still be running: check its job ID instead of repeating the edit. `bl_execute` retains Python modeling capabilities inside the installed sandbox. The preserved direct entry points do not supply confinement. See [isolation boundaries and validation](RETREAT-ISOLATION.md).

## Validation

From `blender/`:

```sh
npm test
npm run typecheck
BLENDER_EXECUTABLE='/Applications/Blender.app/Contents/MacOS/Blender' npm run test:live
BLENDER_EXECUTABLE='/Applications/Blender.app/Contents/MacOS/Blender' node scripts/verify-retreat.mjs /absolute/new/validation-directory
```

Use a new output directory for the Retreat live test: existing exports are deliberately protected. The sample pergola is a functional test model with invented dimensions, not a proposed or measured backyard design.

## Scope

This is independent personal software based on Higgsfield's public Blender bridge. It does not clone Higgsfield's proprietary cloud service, hosted 3D Jutsu scene state, curated asset catalog, credits or generated-model APIs. A separately connected Higgsfield provider can be added for cloud-generated assets later; local modeling itself needs no Higgsfield key.

See [the source-selection notes](RETREAT-SOURCES.md) for the repositories examined and [the retained Blender license](blender/LICENSE) for reuse terms.
