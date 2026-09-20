# Retreat 3D Studio

Create, edit, render and keep improving actual Blender models through your personal MCP plugin.

- `retreat_workflow` explains how to begin or resume.
- `retreat_save_revision` saves a new `.blend` without replacing earlier revisions.
- `retreat_export_glb` exports a portable GLB while retaining your editable master.
- The original Blender tools handle objects, materials, cameras, lighting, animation and rendering.

The generated `.mcp.json` connects this installation to the local Blender runtime. `mcp-config.toml` provides equivalent local Codex settings. These contain installation-specific absolute paths; rebuild if you move the folder.

Start a new task after installing, select Retreat 3D Studio and ask it to create a model or open a saved `.blend`. Save the returned revision path for future conversations. The background process cannot access unsaved work in an open Blender desktop window.

[Build and connection guide](https://github.com/GabeRealMedina/retreat-3d-studio/blob/main/RETREAT-START-HERE.md) · [Source](https://github.com/GabeRealMedina/retreat-3d-studio)

For ChatGPT on the web, use the private connection setup described in the source guide; installing this local package does not establish a tunnel automatically.

Built on Higgsfield's MIT-licensed Blender MCP. See [LICENSE](LICENSE) and `runtime/UPSTREAM.md`. Cloud generation and the hosted Higgsfield asset catalog are not included.
